// ─── Buy System ──────────────────────────────────────────────────────────
// Single unified buy function — eliminates all duplication

// Build standard purchase payload
function buildPayload(assetId, price, sellerId, currency, userAssetId = null) {
    return JSON.stringify({
        assetId:          parseInt(assetId),
        expectedPrice:    price ?? 0,
        expectedSellerId: sellerId || 0,
        userAssetId:      userAssetId || null,
        expectedCurrency: currency ?? 1,
    });
}

// Resolve real sellerId for free items (price=0 items need actual creator ID)
const _sellerCache = {};
async function resolveFreeSeller(assetId) {
    if (_sellerCache[assetId]) return _sellerCache[assetId];
    try {
        const r = await fetch(BASE + '/apisite/catalog/v1/catalog/items/details', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(assetId) }] }),
        });
        const j = await r.json();
        const sid = j.data?.[0]?.creatorTargetId || j.data?.[0]?.sellerId || null;
        if (sid) _sellerCache[assetId] = sid;
        return sid;
    } catch(_) { return null; }
}

// Core buy executor — handles CSRF refresh + retry automatically
async function _executeBuy(acctIdx, assetId, payload, retries = BUY_RETRY) {
    try {
        let res;
        if (acctIdx === -1 || (accounts[acctIdx]?.sessionBacked) || !accounts[acctIdx]?.cookie) {
            // Session-backed path
            const csrf = await refreshSessionCsrf();
            res = await fetch(BASE + '/apisite/economy/v1/purchases/products/' + assetId, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
                body: payload,
            });
            // CSRF expired → refresh once and retry
            if (res.status === 403 && retries > 0) {
                sessionCsrf = '';
                return _executeBuy(acctIdx, assetId, payload, retries - 1);
            }
        } else {
            res = await acctFetch(acctIdx, BASE + '/apisite/economy/v1/purchases/products/' + assetId, {
                method: 'POST', body: payload,
            });
        }

        let d = {};
        try { d = await res.json(); } catch(_) {}

        // Detect CSRF expiry from response and retry
        if (res.status === 403 && retries > 0) {
            const newCsrf = res.headers?.get?.('x-csrf-token');
            if (newCsrf && acctIdx >= 0) { accounts[acctIdx].csrf = newCsrf; saveAccounts(); }
            return _executeBuy(acctIdx, assetId, payload, retries - 1);
        }

        const ok = res.ok && (d.purchased === true || d.statusCode === 0 || (res.status === 200 && !d.statusCode));
        return { ok, d, status: res.status };
    } catch(e) {
        return { ok: false, d: {}, error: e.message };
    }
}

// Main per-account buy with logging
async function buyForAcct(i, item) {
    const acct = accounts[i];
    if (!acct) return false;

    // Resolve seller for free items
    if ((item.price === 0 || item.price == null) && (!item.sellerId || item.sellerId < 2)) {
        const sid = await resolveFreeSeller(item.assetId);
        if (sid) item = { ...item, sellerId: sid };
    }

    const payload = buildPayload(item.assetId, item.price ?? 0, item.sellerId, item.currency ?? 1, item.userAssetId);
    const { ok, d, error, status } = await _executeBuy(i, item.assetId, payload);

    if (ok) {
        log(`✓ ${item.price === 0 ? 'Claimed' : 'Bought'} "${item.name}" as ${acct.username}`, 'success');
        return true;
    }
    const errMsg = error || d.errorMessage || d.message || d.errors?.[0]?.message || `HTTP ${status}`;
    if (d.statusCode === 4)       log(`✗ Not enough currency — ${acct.username}`, 'warn');
    else if (d.statusCode === 2)  log(`✗ Item not for sale — ${acct.username}`, 'warn');
    else if (d.statusCode === 7)  log(`✗ Already owned — ${acct.username}`, 'warn');
    else                          log(`✗ ${errMsg} — ${acct.username}`, 'err');
    return false;
}

async function buyForSession(item) {
    if ((item.price === 0 || item.price == null) && (!item.sellerId || item.sellerId < 2)) {
        const sid = await resolveFreeSeller(item.assetId);
        if (sid) item = { ...item, sellerId: sid };
    }
    const payload = buildPayload(item.assetId, item.price ?? 0, item.sellerId, item.currency ?? 1, item.userAssetId);
    const { ok, d, error, status } = await _executeBuy(-1, item.assetId, payload);

    if (ok) {
        log(`✓ ${item.price === 0 ? 'Claimed' : 'Bought'} "${item.name}" (session)`, 'success');
        return true;
    }
    const errMsg = error || d.errorMessage || d.message || d.errors?.[0]?.message || `HTTP ${status}`;
    log(`✗ ${errMsg} (session)`, 'err');
    return false;
}

// Dispatcher — respects current account selection
async function buyItem(item, btn) {
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span>'; btn.disabled = true; }
    log(`${item.price === 0 ? 'Claiming' : 'Buying'}: ${item.name}`, 'info');

    const idxs  = resolveAccountIndices();
    let ok = false;

    if (!idxs.length) {
        log('No accounts selected', 'warn');
    } else if (idxs[0] === -1) {
        ok = await buyForSession(item);
    } else {
        // All selected accounts in parallel
        const results = await Promise.all(idxs.map(i => buyForAcct(i, item)));
        ok = results.some(Boolean);
    }

    if (btn) {
        btn.innerHTML        = ok ? '✓' : '✕';
        btn.style.background = ok ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#7f1d1d';
        btn.style.color      = '#fff';
        btn.disabled         = false;
        setTimeout(() => {
            btn.innerHTML        = '🛒 Buy';
            btn.style.background = btn.style.color = '';
        }, 2000);
    }
    return ok;
}

// ─── Raw buy (used by sniper with pre-built payload) ──────────────────────
async function buyForAcctRaw(i, assetId, payload) {
    const { ok, d, error, status } = await _executeBuy(i, assetId, payload);
    if (ok) { log(`✓ Bought as ${accounts[i]?.username}`, 'success'); return true; }
    log(`✗ ${error || d.errorMessage || d.message || 'HTTP ' + status} — ${accounts[i]?.username}`, 'err');
    return false;
}

async function buyForSessionRaw(assetId, payload) {
    const { ok, d, error, status } = await _executeBuy(-1, assetId, payload);
    if (ok) { log('✓ Bought (session)', 'success'); return true; }
    log(`✗ ${error || d.errorMessage || d.message || 'HTTP ' + status} (session)`, 'err');
    return false;
}
