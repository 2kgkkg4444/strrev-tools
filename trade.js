// ─── Trade ────────────────────────────────────────────────────────────────
async function fetchMyUserId() {
    if (selectedAcctIdx >= 0 && accounts[selectedAcctIdx]?.id) return accounts[selectedAcctIdx].id;
    try {
        const r = selectedAcctIdx >= 0
            ? await acctFetch(selectedAcctIdx, BASE+'/apisite/users/v1/users/authenticated')
            : await sessFetch(BASE+'/apisite/users/v1/users/authenticated');
        const j = await r.json(); return j.id || null;
    } catch(_) { return null; }
}

async function fetchInventory(userId) {
    try {
        const r = selectedAcctIdx >= 0
            ? await acctFetch(selectedAcctIdx, BASE+'/apisite/inventory/v1/users/'+userId+'/assets/collectibles')
            : await sessFetch(BASE+'/apisite/inventory/v1/users/'+userId+'/assets/collectibles');
        const j = await r.json(); return j.data || [];
    } catch(_) { return []; }
}

async function lookupUser(input) {
    input = input.trim();
    let r;
    if (/^\d+$/.test(input)) {
        r = selectedAcctIdx >= 0
            ? await acctFetch(selectedAcctIdx, BASE+'/apisite/users/v1/users/'+input)
            : await sessFetch(BASE+'/apisite/users/v1/users/'+input);
        if (!r.ok) throw new Error('User ID '+input+' not found');
        const j = await r.json(); return { id:j.id, name:j.name||j.displayName||'User '+input };
    }
    const body = JSON.stringify({ usernames:[input], excludeBannedUsers:false });
    r = selectedAcctIdx >= 0
        ? await acctFetch(selectedAcctIdx, BASE+'/apisite/users/v1/usernames/users', { method:'POST', body })
        : await sessFetch(BASE+'/apisite/users/v1/usernames/users', { method:'POST', headers:{'Content-Type':'application/json'}, body });
    const j = await r.json();
    const u = j.data?.[0]; if (!u) throw new Error('Username "'+input+'" not found');
    return { id:u.id, name:u.name };
}

function setTradeStatus(msg, color) {
    const el = document.getElementById('st-trade-status'); if (!el) return;
    el.style.display     = msg ? 'block' : 'none';
    el.style.color       = color || '#475569';
    el.style.borderColor = color ? color+'44' : '#0a1525';
    el.style.background  = color ? color+'0d' : '#060c18';
    el.textContent       = msg;
}

function renderInvSkel(id) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = Array.from({length:4}, () => `
        <div style="display:flex;align-items:center;gap:6px;padding:5px 6px;margin-bottom:3px;">
            <div class="st-skel" style="width:7px;height:7px;border-radius:50%;flex-shrink:0;"></div>
            <div style="flex:1;">
                <div class="st-skel" style="height:8px;border-radius:3px;margin-bottom:3px;"></div>
                <div class="st-skel" style="height:6px;border-radius:3px;width:40%;"></div>
            </div>
        </div>`).join('');
}

function renderInvList(id, items, sel) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = '';
    if (!items.length) { el.innerHTML='<div style="padding:10px;text-align:center;color:#1e3a5f;font-size:9px;">No tradeable items</div>'; return; }
    items.forEach(item => {
        const uaid   = item.userAssetId;
        const active = sel.has(uaid);
        const row    = document.createElement('div');
        row.style.cssText = `padding:5px 7px;border-radius:6px;cursor:pointer;margin-bottom:3px;background:${active?'rgba(233,69,96,0.1)':'transparent'};border:1px solid ${active?'#e94560':'transparent'};transition:all 0.12s;display:flex;align-items:center;gap:7px;`;
        row.onmouseenter = () => { if (!sel.has(uaid)) row.style.background='#0d1829'; };
        row.onmouseleave = () => { if (!sel.has(uaid)) row.style.background='transparent'; };

        const dot = document.createElement('div');
        dot.style.cssText = `width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${active?'#e94560':'#1e293b'};transition:background 0.12s;`;

        const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
        const name = document.createElement('div');
        name.style.cssText = `font-size:9px;color:${active?'#e2e8f0':'#475569'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.12s;`;
        name.textContent = item.name || 'Item #'+item.assetId;
        info.appendChild(name);

        if (item.recentAveragePrice) {
            const price = document.createElement('div');
            price.style.cssText = 'font-size:8px;color:#334155;font-family:monospace;margin-top:1px;';
            price.textContent = 'R$'+item.recentAveragePrice.toLocaleString();
            info.appendChild(price);
        }

        row.append(dot, info);
        row.addEventListener('click', () => {
            if (sel.has(uaid)) sel.delete(uaid); else sel.add(uaid);
            renderInvList(id, items, sel);
            updateTradeSummary();
        });
        el.appendChild(row);
    });
}

function updateTradeSummary() {
    const mc = mySelected.size, tc = theirSelected.size;
    const myC = document.getElementById('st-my-count'); if (myC) myC.textContent = mc;
    const thC = document.getElementById('st-th-count'); if (thC) thC.textContent = tc;
    const sum = document.getElementById('st-trade-summary'); if (sum) sum.style.display = (mc||tc) ? 'block' : 'none';
    const btn = document.getElementById('st-send-btn');
    if (btn) { const ok=!!tradeTargetId&&(mc||tc); btn.disabled=!ok; btn.style.opacity=ok?'1':'0.4'; btn.style.pointerEvents=ok?'auto':'none'; }
}

async function loadTradeTarget() {
    const input = document.getElementById('st-trade-input')?.value?.trim(); if (!input) return;
    const btn   = document.getElementById('st-load-btn');
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span>'; btn.disabled=true; }
    setTradeStatus('Looking up user...', '#eab308');
    try {
        const myId = await fetchMyUserId();
        if (!myId) throw new Error('Could not get your user ID — logged in / cookie valid?');
        const target = await lookupUser(input);
        tradeTargetId = target.id; tradeTargetName = target.name;
        mySelected.clear(); theirSelected.clear();
        setTradeStatus('Loading inventories for '+target.name+'...', '#eab308');
        renderInvSkel('st-my-inv'); renderInvSkel('st-th-inv');
        const [myInv, theirInv] = await Promise.all([fetchInventory(myId), fetchInventory(target.id)]);
        myInventory = myInv; theirInventory = theirInv;
        setTradeStatus('✓ '+target.name+' — '+myInv.length+' / '+theirInv.length+' items', '#22c55e');
        renderInvList('st-my-inv', myInventory, mySelected);
        renderInvList('st-th-inv', theirInventory, theirSelected);
        updateTradeSummary();
        log('Trade loaded: you vs '+target.name, 'success');
    } catch(e) {
        setTradeStatus('✕ '+e.message, '#ef4444');
        log('Trade error: '+e.message, 'err');
    }
    if (btn) { btn.innerHTML='Load'; btn.disabled=false; }
}

async function sendTradeOffer() {
    const myId = await fetchMyUserId();
    if (!myId || !tradeTargetId) return;
    const btn = document.getElementById('st-send-btn');
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span> Sending...'; btn.disabled=true; }
    const myIds = Array.from(mySelected), thIds = Array.from(theirSelected);
    log('Sending trade to '+tradeTargetName+' ('+myIds.length+'↔'+thIds.length+' items)...', 'info');
    try {
        const payload = JSON.stringify({ offers:[
            { robux:null, userAssetIds:myIds, userId:myId },
            { robux:null, userAssetIds:thIds, userId:tradeTargetId },
        ]});
        const res = selectedAcctIdx >= 0
            ? await acctFetch(selectedAcctIdx, BASE+'/apisite/trades/v1/trades/send', { method:'POST', body:payload })
            : await sessFetch(BASE+'/apisite/trades/v1/trades/send', { method:'POST', headers:{'Content-Type':'application/json'}, body:payload });
        if (res.ok) {
            log('✓ Trade sent to '+tradeTargetName+'!', 'success');
            setTradeStatus('✓ Trade offer sent to '+tradeTargetName+'!', '#22c55e');
            if (btn) {
                btn.innerHTML        = '✓ Trade Sent!';
                btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
                btn.style.boxShadow  = '0 0 14px rgba(34,197,94,0.3)';
                setTimeout(() => { if(btn){ btn.innerHTML='🔄 Send Trade Offer'; btn.style.background='linear-gradient(135deg,#e94560,#b91c4a)'; btn.style.boxShadow='0 0 20px rgba(233,69,96,0.2)'; }}, 2500);
            }
            mySelected.clear(); theirSelected.clear();
            renderInvList('st-my-inv', myInventory, mySelected);
            renderInvList('st-th-inv', theirInventory, theirSelected);
            updateTradeSummary();
        } else {
            let msg = 'HTTP '+res.status;
            try { const d=await res.json(); msg=d.errors?.[0]?.message||d.errorMessage||msg; } catch(_){}
            log('Trade failed: '+msg, 'err'); setTradeStatus('✕ '+msg, '#ef4444');
            if (btn) { btn.innerHTML='🔄 Send Trade Offer'; btn.disabled=false; btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
        }
    } catch(e) {
        log('Trade error: '+e.message, 'err'); setTradeStatus('✕ '+e.message, '#ef4444');
        if (btn) { btn.innerHTML='🔄 Send Trade Offer'; btn.disabled=false; btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
    }
}
