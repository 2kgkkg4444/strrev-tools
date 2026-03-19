// ─── Buy Functions ────────────────────────────────────────────────────────
async function buyForAcct(i, item) {
    try {
        const res = await acctFetch(i, BASE+'/apisite/economy/v1/purchases/products/'+item.assetId, {
            method: 'POST',
            body: JSON.stringify({
                assetId:          parseInt(item.assetId),
                expectedPrice:    item.price,
                expectedSellerId: item.sellerId,
                userAssetId:      null,
                expectedCurrency: item.currency,
            }),
        });
        let d = {};
        try { d = await res.json(); } catch(_){}
        if (res.ok && (d.purchased || d.statusCode === undefined)) {
            log('✓ Bought "'+item.name+'" as '+accounts[i].username, 'success');
            return true;
        }
        if (d.statusCode === 4) log('✗ Not enough currency — '+accounts[i].username, 'warn');
        else                    log('✗ '+(d.errorMessage||'Failed')+' — '+accounts[i].username, 'err');
    } catch(e) { log('✗ '+e.message+' — '+accounts[i].username, 'err'); }
    return false;
}

async function buyForSession(item) {
    try {
        await fetchSessionCsrf();
        const res = await fetch(BASE+'/apisite/economy/v1/purchases/products/'+item.assetId, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type':'application/json', 'x-csrf-token': sessionCsrf },
            body: JSON.stringify({
                assetId:          parseInt(item.assetId),
                expectedPrice:    item.price,
                expectedSellerId: item.sellerId,
                userAssetId:      null,
                expectedCurrency: item.currency,
            }),
        });
        const d = await res.json();
        if (res.ok && (d.purchased || d.statusCode === undefined)) { log('✓ Bought "'+item.name+'" (session)', 'success'); return true; }
        log('✗ '+(d.errorMessage||'Failed')+' (session)', 'err');
    } catch(e) { log('✗ '+e.message+' (session)', 'err'); }
    return false;
}

async function buyItem(item, btn) {
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span>'; btn.disabled=true; }
    log('Buying: '+item.name, 'info');
    let ok = false;
    if (selectedAcctIdx === -2) {
        if (!accounts.length) log('No accounts saved', 'warn');
        else { const results = await Promise.all(accounts.map((_,i) => buyForAcct(i,item))); ok = results.some(Boolean); }
    } else if (selectedAcctIdx === -1) {
        ok = await buyForSession(item);
    } else {
        if (accounts[selectedAcctIdx]) ok = await buyForAcct(selectedAcctIdx, item);
        else log('Account not found', 'err');
    }
    if (btn) {
        btn.textContent       = ok ? '✓' : '✕';
        btn.style.background  = ok ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#7f1d1d';
        btn.disabled          = false;
    }
}
