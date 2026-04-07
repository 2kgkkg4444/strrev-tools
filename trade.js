// ─── Trade ────────────────────────────────────────────────────────────────
const TRADE_CONCURRENCY = 6; // was 4

function tradeLookupIdx() {
    if (selectedAcctIdx === -2 || selectedAcctIdx === -3) return accounts.length > 0 ? 0 : -1;
    return selectedAcctIdx;
}

async function fetchMyUserId() {
    const idx = tradeLookupIdx();
    if (idx >= 0 && accounts[idx]?.id) return accounts[idx].id;
    try {
        const r = idx >= 0 ? await acctFetch(idx, BASE + '/apisite/users/v1/users/authenticated') : await sessFetch(BASE + '/apisite/users/v1/users/authenticated');
        const j = await r.json(); return j.id || null;
    } catch(_) { return null; }
}

// ─── Paginated inventory ──────────────────────────────────────────────────
async function fetchInventoryAllPages(idx, userId) {
    const all = []; let cursor = '', attempts = 0;
    const MAX_PAGES = 40;
    do {
        const url = BASE + '/apisite/inventory/v1/users/' + userId + '/assets/collectibles?limit=100' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
        try {
            const r = idx >= 0 ? await acctFetch(idx, url) : await sessFetch(url);
            const j = await r.json();
            if (j.data?.length) all.push(...j.data);
            cursor = j.nextPageCursor || '';
        } catch(_) { break; }
        attempts++;
    } while (cursor && attempts < MAX_PAGES);
    return all;
}

async function lookupUser(input) {
    const idx = tradeLookupIdx(); input = input.trim();
    if (/^\d+$/.test(input)) {
        const r = idx >= 0 ? await acctFetch(idx, BASE + '/apisite/users/v1/users/' + input) : await sessFetch(BASE + '/apisite/users/v1/users/' + input);
        if (!r.ok) throw new Error('User ID ' + input + ' not found');
        const j = await r.json(); return { id: j.id, name: j.name || j.displayName || 'User ' + input };
    }
    const body = JSON.stringify({ usernames: [input], excludeBannedUsers: false });
    if (idx < 0) await refreshSessionCsrf();
    const r = idx >= 0
        ? await acctFetch(idx, BASE + '/apisite/users/v1/usernames/users', { method: 'POST', body })
        : await sessFetch(BASE + '/apisite/users/v1/usernames/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': sessionCsrf }, body });
    const j = await r.json();
    const u = j.data?.[0]; if (!u) throw new Error('Username "' + input + '" not found');
    return { id: u.id, name: u.name };
}

function setTradeStatus(msg, color) {
    const el = document.getElementById('st-trade-status'); if (!el) return;
    el.style.display = msg ? 'block' : 'none'; el.style.color = color || '#475569';
    el.style.borderColor = color ? color + '44' : '#0a1525'; el.style.background = color ? color + '0d' : '#060c18';
    el.textContent = msg;
}

function renderInvSkel(id) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = Array.from({ length: 4 }, () => `<div style="display:flex;align-items:center;gap:6px;padding:5px 6px;margin-bottom:3px;"><div class="st-skel" style="width:7px;height:7px;border-radius:50%;flex-shrink:0;"></div><div style="flex:1;"><div class="st-skel" style="height:8px;border-radius:3px;margin-bottom:3px;"></div><div class="st-skel" style="height:6px;border-radius:3px;width:40%;"></div></div></div>`).join('');
}

function renderInvList(id, items, sel) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = '';
    if (!items.length) { el.innerHTML = '<div style="padding:10px;text-align:center;color:var(--c-text4);font-size:10px;">No tradeable items</div>'; return; }
    items.forEach(item => {
        const uaid = item.userAssetId, active = sel.has(uaid);
        const row = document.createElement('div');
        row.style.cssText = `padding:6px 8px;border-radius:7px;cursor:pointer;margin-bottom:3px;background:${active?'rgba(233,69,96,0.1)':'transparent'};border:1px solid ${active?'var(--c-accent)':'transparent'};transition:all 0.12s;display:flex;align-items:center;gap:8px;`;
        row.onmouseenter = () => { if (!sel.has(uaid)) row.style.background = 'var(--c-bg2)'; };
        row.onmouseleave = () => { if (!sel.has(uaid)) row.style.background = 'transparent'; };
        const dot = document.createElement('div');
        dot.style.cssText = `width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${active?'var(--c-accent)':'var(--c-border)'};transition:background 0.12s;`;
        const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
        const name = document.createElement('div');
        name.style.cssText = `font-size:10px;color:${active?'var(--c-text0)':'var(--c-text2)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.12s;`;
        name.textContent = item.name || 'Item #' + item.assetId;
        info.appendChild(name);
        if (item.recentAveragePrice) {
            const price = document.createElement('div');
            price.style.cssText = 'font-size:9px;color:var(--c-text4);font-family:monospace;margin-top:1px;';
            price.textContent = 'R$' + item.recentAveragePrice.toLocaleString();
            info.appendChild(price);
        }
        row.append(dot, info);
        row.addEventListener('click', () => {
            if (sel.has(uaid)) sel.delete(uaid); else sel.add(uaid);
            renderInvList(id, items, sel); updateTradeSummary();
        });
        el.appendChild(row);
    });
}

function updateTradeSummary() {
    const mc = mySelected.size, tc = theirSelected.size;
    const myC = document.getElementById('st-my-count'); if (myC) myC.textContent = mc;
    const thC = document.getElementById('st-th-count'); if (thC) thC.textContent = tc;
    const sum = document.getElementById('st-trade-summary'); if (sum) sum.style.display = (mc || tc) ? 'block' : 'none';
    const myRobux    = parseInt(document.getElementById('st-trade-my-robux')?.value)    || 0;
    const theirRobux = parseInt(document.getElementById('st-trade-their-robux')?.value) || 0;
    const btn = document.getElementById('st-send-btn');
    if (btn) { const ok = !!tradeTargetId && (mc || tc || myRobux > 0 || theirRobux > 0); btn.disabled = !ok; btn.style.opacity = ok ? '1' : '0.4'; btn.style.pointerEvents = ok ? 'auto' : 'none'; }
}

// ─── Intersection inventory (All Accounts mode) ───────────────────────────
async function buildIntersectionInventory() {
    if (!accounts.length) return [];
    setTradeStatus('Fetching inventories for ' + accounts.length + ' accounts…', '#eab308');
    const idxs = selectedAcctIdx === -3 ? [...selectiveAccounts] : accounts.map((_, i) => i);
    const acctInventories = await Promise.all(idxs.map(async (ai) => {
        let userId = accounts[ai]?.id;
        if (!userId) {
            try {
                const r = await acctFetch(ai, BASE + '/apisite/users/v1/users/authenticated');
                const j = await r.json(); userId = j.id || null;
                if (userId) { accounts[ai].id = userId; saveAccounts(); }
            } catch(_) {}
        }
        if (!userId) return [];
        return fetchInventoryAllPages(ai, userId);
    }));
    const sets = acctInventories.map(inv => new Set(inv.map(item => String(item.assetId))));
    const intersection = [...sets[0]].filter(assetId => sets.every(s => s.has(assetId)));
    if (!intersection.length) return [];
    return acctInventories[0].filter(item => intersection.includes(String(item.assetId)));
}

async function loadTradeTarget() {
    const input = document.getElementById('st-trade-input')?.value?.trim(); if (!input) return;
    const btn = document.getElementById('st-load-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span>'; btn.disabled = true; }
    setTradeStatus('Looking up user…', '#eab308');
    try {
        const myId = await fetchMyUserId();
        if (!myId) throw new Error('Could not get your user ID');
        const target = await lookupUser(input);
        tradeTargetId = target.id; tradeTargetName = target.name;
        mySelected.clear(); theirSelected.clear();
        renderInvSkel('st-my-inv'); renderInvSkel('st-th-inv');

        const isAll = selectedAcctIdx === -2 || selectedAcctIdx === -3;
        let myInv;
        if (isAll) {
            // Parallel: my intersection + their inventory
            const [mine, theirs] = await Promise.all([buildIntersectionInventory(), fetchInventoryAllPages(tradeLookupIdx(), target.id)]);
            myInv = mine; theirInventory = theirs;
            setTradeStatus('✓ ' + target.name + ' — ' + myInv.length + ' shared / ' + theirs.length + ' their items', myInv.length > 0 ? '#22c55e' : '#eab308');
        } else {
            const [inv, theirInv] = await Promise.all([fetchInventoryAllPages(tradeLookupIdx(), myId), fetchInventoryAllPages(tradeLookupIdx(), target.id)]);
            myInv = inv; theirInventory = theirInv;
            setTradeStatus('✓ ' + target.name + ' — ' + myInv.length + ' / ' + theirInv.length + ' items', '#22c55e');
        }
        myInventory = myInv;
        renderInvList('st-my-inv', myInventory, mySelected);
        renderInvList('st-th-inv', theirInventory, theirSelected);
        updateTradeSummary();
        log('Trade loaded: you vs ' + target.name, 'success');
    } catch(e) { setTradeStatus('✕ ' + e.message, '#ef4444'); log('Trade error: ' + e.message, 'err'); }
    if (btn) { btn.innerHTML = 'Load'; btn.disabled = false; }
}

async function resolveUserAssetIds(acctIdx, acctUserId) {
    const selectedAssetIds = new Set(myInventory.filter(item => mySelected.has(item.userAssetId)).map(item => String(item.assetId)));
    if (!selectedAssetIds.size) return [];
    const inv = await fetchInventoryAllPages(acctIdx, acctUserId);
    const assetToUAID = {};
    inv.forEach(item => { const aid = String(item.assetId); if (!assetToUAID[aid]) assetToUAID[aid] = item.userAssetId; });
    const resolved = [];
    selectedAssetIds.forEach(assetId => {
        if (assetToUAID[assetId]) resolved.push(assetToUAID[assetId]);
        else log('⚠ ' + accounts[acctIdx]?.username + ' doesn\'t own assetId ' + assetId, 'warn');
    });
    return resolved;
}

async function resolveAcctUserId(i) {
    if (accounts[i]?.id) return accounts[i].id;
    try {
        const r = await acctFetch(i, BASE + '/apisite/users/v1/users/authenticated');
        const j = await r.json();
        if (j.id) { accounts[i].id = j.id; saveAccounts(); } return j.id || null;
    } catch(_) { return null; }
}

async function sendTradeOfferFrom(acctIdx, acctUserId, myUserAssetIds, theirUserAssetIds, myRobux, theirRobux) {
    const label = acctIdx === -1 ? 'session' : accounts[acctIdx].username;
    const payload = JSON.stringify({ offers: [
        { robux: myRobux    || null, userAssetIds: myUserAssetIds,    userId: acctUserId    },
        { robux: theirRobux || null, userAssetIds: theirUserAssetIds, userId: tradeTargetId },
    ]});
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, BASE + '/apisite/trades/v1/trades/send', { method: 'POST', body: payload });
        } else {
            const csrf = await refreshSessionCsrf();
            res = await sessFetch(BASE + '/apisite/trades/v1/trades/send', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: payload });
        }
        if (res.ok) { log('✓ Trade sent to ' + tradeTargetName + ' as ' + label, 'success'); return true; }
        let msg = 'HTTP ' + res.status;
        try { const d = await res.json(); msg = d.errors?.[0]?.message || d.errorMessage || msg; } catch(_) {}
        log('✗ Trade failed (' + label + '): ' + msg, 'err'); return false;
    } catch(e) { log('✗ Trade error (' + label + '): ' + e.message, 'err'); return false; }
}

async function sendTradeOffer() {
    if (!tradeTargetId) return;
    const theirUserAssetIds = Array.from(theirSelected);
    const myRobux    = Math.max(0, parseInt(document.getElementById('st-trade-my-robux')?.value)    || 0) || null;
    const theirRobux = Math.max(0, parseInt(document.getElementById('st-trade-their-robux')?.value) || 0) || null;
    const count  = Math.max(1, Math.min(100, parseInt(document.getElementById('st-trade-count')?.value) || 1));
    const delay  = Math.max(0, parseInt(document.getElementById('st-trade-delay')?.value) || 0);
    const btn    = document.getElementById('st-send-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Sending...'; btn.disabled = true; }

    const idxs = resolveAccountIndices().filter(i => i !== -1 || selectedAcctIdx === -1);
    const senderIdxsRaw = idxs.length > 0 ? idxs : (selectedAcctIdx === -1 ? [-1] : []);

    setTradeStatus('Resolving accounts…', '#eab308');
    const senderMeta = await Promise.all(senderIdxsRaw.map(async idx => {
        let acctId;
        if (idx === -1) acctId = await fetchMyUserId();
        else acctId = await resolveAcctUserId(idx);
        if (!acctId) { log('Could not get ID for ' + (idx === -1 ? 'session' : accounts[idx]?.username) + ' — skipping', 'err'); return null; }
        const isAll = selectedAcctIdx === -2 || selectedAcctIdx === -3;
        const myUAIds = (idx === -1 || !isAll) ? Array.from(mySelected) : await resolveUserAssetIds(idx, acctId);
        if (mySelected.size > 0 && myUAIds.length === 0) { log('⚠ ' + accounts[idx]?.username + ' owns none of selected items — skipping', 'warn'); return null; }
        return { idx, acctId, myUAIds };
    }));

    const validMeta = senderMeta.filter(Boolean);
    if (!validMeta.length) { setTradeStatus('✕ No valid senders', '#ef4444'); if (btn) { btn.innerHTML = '🔄 Send Trade Offer'; btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; } return; }

    const tasks = Array.from({ length: count }, (_, n) => validMeta[n % validMeta.length]);
    const total = tasks.length;
    const robuxDesc = [myRobux ? `+R$${myRobux} yours` : '', theirRobux ? `+R$${theirRobux} theirs` : ''].filter(Boolean).join(', ');
    log('Sending ' + total + ' trade(s) to ' + tradeTargetName + (robuxDesc ? ' [' + robuxDesc + ']' : '') + (delay > 0 ? ' (delay: ' + delay + 'ms)' : '') + '…', 'info');
    setTradeStatus('Sending 0/' + total + '…', '#eab308');

    let sent = 0, failed = 0, taskIdx = 0;
    async function runWorker() {
        while (taskIdx < tasks.length) {
            const task = tasks[taskIdx++];
            if (taskIdx > 1 && delay > 0) await sleep(delay);
            const ok = await sendTradeOfferFrom(task.idx, task.acctId, task.myUAIds, theirUserAssetIds, myRobux, theirRobux);
            if (ok) sent++; else failed++;
            setTradeStatus('Sending ' + (sent + failed) + '/' + total + ' — ' + sent + ' sent, ' + failed + ' failed…', '#eab308');
        }
    }
    await Promise.all(Array.from({ length: Math.min(TRADE_CONCURRENCY, total) }, runWorker));

    if (sent > 0) {
        setTradeStatus('✓ Sent ' + sent + '/' + total + ' trade offer' + (total > 1 ? 's' : '') + ' to ' + tradeTargetName, '#22c55e');
        if (btn) { btn.innerHTML = '✓ Trade Sent!'; btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)'; btn.style.boxShadow = '0 0 14px rgba(34,197,94,0.3)'; setTimeout(() => { if (btn) { btn.innerHTML = '🔄 Send Trade Offer'; btn.style.background = btn.style.boxShadow = ''; btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; } }, 2500); }
        mySelected.clear(); theirSelected.clear();
        renderInvList('st-my-inv', myInventory, mySelected);
        renderInvList('st-th-inv', theirInventory, theirSelected);
        updateTradeSummary();
    } else {
        setTradeStatus('✕ All trades failed — check the log', '#ef4444');
        if (btn) { btn.innerHTML = '🔄 Send Trade Offer'; btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
    }
}

// ─── Security Tests ────────────────────────────────────────────────────────
async function testNegativePrice(price) {
    const assetId  = document.getElementById('st-sec-asset-id')?.value?.trim();
    const uassetId = document.getElementById('st-sec-uasset-id')?.value?.trim();
    const statusEl = document.getElementById('st-sec-price-status');
    if (!assetId || !uassetId) { if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = '⚠ Enter both Asset ID and User Asset ID'; } return; }
    if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = 'Testing price=' + price + '...'; statusEl.style.color = 'var(--c-warn)'; }
    const url = BASE + '/apisite/economy/v1/assets/' + assetId + '/resellable-copies/' + uassetId;
    const payload = JSON.stringify({ price });
    const acctIdx = selectedAcctIdx === -2 || selectedAcctIdx === -3 ? (accounts.length > 0 ? 0 : -1) : selectedAcctIdx;
    try {
        let r;
        if (acctIdx >= 0) { r = await acctFetch(acctIdx, url, { method: 'PATCH', body: payload }); }
        else { const csrf = await refreshSessionCsrf(); r = await sessFetch(url, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: payload }); }
        const text = await r.text();
        let msg = text;
        try { const j = JSON.parse(text); msg = j.errors?.[0]?.message || j.message || j.errorMessage || JSON.stringify(j); } catch(_) {}
        const label = acctIdx >= 0 ? accounts[acctIdx].username : 'Session';
        const result = label + ': HTTP ' + r.status + ' — ' + msg.slice(0, 120);
        log('🔬 ' + result, r.ok ? 'success' : 'warn');
        if (statusEl) { statusEl.textContent = result; statusEl.style.color = r.ok ? 'var(--c-success)' : 'var(--c-text2)'; }
        if (r.ok) log('🚨 Server accepted price=' + price + ' — validation missing!', 'err');
    } catch(e) { log('🔬 Error: ' + e.message, 'err'); if (statusEl) { statusEl.textContent = '✕ Error: ' + e.message; statusEl.style.color = 'var(--c-err)'; } }
}
