// ─── Buy Functions ────────────────────────────────────────────────────────

// Free items (price === 0) need expectedSellerId resolved from the asset detail
// endpoint because defaulting to 0/1 causes "seller not found" errors.
async function resolveSellerIdForFreeItem(assetId) {
    try {
        const r = await fetch(BASE + '/apisite/catalog/v1/catalog/items/details', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(assetId) }] }),
        });
        const j = await r.json();
        return j.data?.[0]?.creatorTargetId || j.data?.[0]?.sellerId || null;
    } catch(_) { return null; }
}

function buildPurchasePayload(item) {
    return JSON.stringify({
        assetId:          parseInt(item.assetId),
        expectedPrice:    item.price,
        expectedSellerId: item.sellerId,
        userAssetId:      null,
        expectedCurrency: item.currency,
    });
}

async function buyForAcct(i, item) {
    try {
        // For free items resolve the real sellerId first if we only have a placeholder
        if (item.price === 0 && (!item.sellerId || item.sellerId < 2)) {
            const sid = await resolveSellerIdForFreeItem(item.assetId);
            if (sid) item = { ...item, sellerId: sid };
        }

        const res = await acctFetch(i, BASE + '/apisite/economy/v1/purchases/products/' + item.assetId, {
            method: 'POST',
            body:   buildPurchasePayload(item),
        });
        let d = {};
        try { d = await res.json(); } catch(_) {}
        // statusCode 0 = success on some platforms; purchased flag is the clearest signal
        const success = res.ok && (d.purchased === true || d.statusCode === 0 || (res.status === 200 && !d.statusCode));
        if (success) {
            log('✓ ' + (item.price === 0 ? 'Claimed free' : 'Bought') + ' "' + item.name + '" as ' + accounts[i].username, 'success');
            return true;
        }
        const errMsg = d.errorMessage || d.message || d.errors?.[0]?.message || ('HTTP ' + res.status);
        if (d.statusCode === 4)  log('✗ Not enough currency — ' + accounts[i].username, 'warn');
        else if (d.statusCode === 2) log('✗ Item not for sale — ' + accounts[i].username, 'warn');
        else                     log('✗ ' + errMsg + ' — ' + accounts[i].username, 'err');
    } catch(e) { log('✗ ' + e.message + ' — ' + accounts[i].username, 'err'); }
    return false;
}

async function buyForSession(item) {
    try {
        // Resolve real sellerId for free items
        if (item.price === 0 && (!item.sellerId || item.sellerId < 2)) {
            const sid = await resolveSellerIdForFreeItem(item.assetId);
            if (sid) item = { ...item, sellerId: sid };
        }

        await fetchSessionCsrf();
        const res = await fetch(BASE + '/apisite/economy/v1/purchases/products/' + item.assetId, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': sessionCsrf },
            body: buildPurchasePayload(item),
        });
        const d = await res.json();
        const success = res.ok && (d.purchased === true || d.statusCode === 0 || (res.status === 200 && !d.statusCode));
        if (success) {
            log('✓ ' + (item.price === 0 ? 'Claimed free' : 'Bought') + ' "' + item.name + '" (session)', 'success');
            return true;
        }
        const errMsg = d.errorMessage || d.message || d.errors?.[0]?.message || ('HTTP ' + res.status);
        if (d.statusCode === 4)  log('✗ Not enough currency (session)', 'warn');
        else if (d.statusCode === 2) log('✗ Item not for sale (session)', 'warn');
        else                     log('✗ ' + errMsg + ' (session)', 'err');
    } catch(e) { log('✗ ' + e.message + ' (session)', 'err'); }
    return false;
}

async function buyItem(item, btn) {
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span>'; btn.disabled = true; }
    log((item.price === 0 ? 'Claiming free: ' : 'Buying: ') + item.name, 'info');
    let ok = false;
    if (selectedAcctIdx === -2) {
        if (!accounts.length) log('No accounts saved', 'warn');
        else { const results = await Promise.all(accounts.map((_, i) => buyForAcct(i, item))); ok = results.some(Boolean); }
    } else if (selectedAcctIdx === -1) {
        ok = await buyForSession(item);
    } else {
        if (accounts[selectedAcctIdx]) ok = await buyForAcct(selectedAcctIdx, item);
        else log('Account not found', 'err');
    }
    if (btn) {
        btn.textContent      = ok ? '✓' : '✕';
        btn.style.background = ok ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#7f1d1d';
        btn.disabled         = false;
    }
}
