// ─── Trade ────────────────────────────────────────────────────────────────

// For lookups/inventory fetches we just need one valid identity.
// All Accounts (-2) → use account[0] if available, else session.
function tradeLookupIdx() {
    if (selectedAcctIdx === -2) return accounts.length > 0 ? 0 : -1;
    return selectedAcctIdx;
}

async function fetchMyUserId() {
    const idx = tradeLookupIdx();
    if (idx >= 0 && accounts[idx]?.id) return accounts[idx].id;
    try {
        const r = idx >= 0
            ? await acctFetch(idx, BASE+'/apisite/users/v1/users/authenticated')
            : await sessFetch(BASE+'/apisite/users/v1/users/authenticated');
        const j = await r.json(); return j.id || null;
    } catch(_) { return null; }
}

async function fetchInventoryForIdx(idx, userId) {
    try {
        const r = idx >= 0
            ? await acctFetch(idx, BASE+'/apisite/inventory/v1/users/'+userId+'/assets/collectibles')
            : await sessFetch(BASE+'/apisite/inventory/v1/users/'+userId+'/assets/collectibles');
        const j = await r.json(); return j.data || [];
    } catch(_) { return []; }
}

async function fetchInventory(userId) {
    return fetchInventoryForIdx(tradeLookupIdx(), userId);
}

async function lookupUser(input) {
    const idx = tradeLookupIdx();
    input = input.trim();
    let r;
    if (/^\d+$/.test(input)) {
        r = idx >= 0
            ? await acctFetch(idx, BASE+'/apisite/users/v1/users/'+input)
            : await sessFetch(BASE+'/apisite/users/v1/users/'+input);
        if (!r.ok) throw new Error('User ID '+input+' not found');
        const j = await r.json(); return { id:j.id, name:j.name||j.displayName||'User '+input };
    }
    const body = JSON.stringify({ usernames:[input], excludeBannedUsers:false });
    if (idx < 0) await fetchSessionCsrf();
    r = idx >= 0
        ? await acctFetch(idx, BASE+'/apisite/users/v1/usernames/users', { method:'POST', body })
        : await sessFetch(BASE+'/apisite/users/v1/usernames/users', {
              method:'POST',
              headers:{'Content-Type':'application/json','x-csrf-token':sessionCsrf},
              body,
          });
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
    if (!items.length) {
        el.innerHTML = '<div style="padding:10px;text-align:center;color:var(--c-text4);font-size:10px;">No tradeable items</div>';
        return;
    }
    items.forEach(item => {
        const uaid   = item.userAssetId;
        const active = sel.has(uaid);
        const row    = document.createElement('div');
        row.style.cssText = `padding:6px 8px;border-radius:7px;cursor:pointer;margin-bottom:3px;background:${active?'rgba(233,69,96,0.1)':'transparent'};border:1px solid ${active?'var(--c-accent)':'transparent'};transition:all 0.12s;display:flex;align-items:center;gap:8px;`;
        row.onmouseenter = () => { if (!sel.has(uaid)) row.style.background='var(--c-bg2)'; };
        row.onmouseleave = () => { if (!sel.has(uaid)) row.style.background='transparent'; };

        const dot = document.createElement('div');
        dot.style.cssText = `width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${active?'var(--c-accent)':'var(--c-border)'};transition:background 0.12s;`;

        const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
        const name = document.createElement('div');
        name.style.cssText = `font-size:10px;color:${active?'var(--c-text0)':'var(--c-text2)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.12s;`;
        name.textContent = item.name || 'Item #'+item.assetId;
        info.appendChild(name);

        if (item.recentAveragePrice) {
            const price = document.createElement('div');
            price.style.cssText = 'font-size:9px;color:var(--c-text4);font-family:monospace;margin-top:1px;';
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
        if (!myId) throw new Error('Could not get your user ID — are you logged in / is the cookie valid?');
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

// ─── Core: resolve userAssetIds for a given account ───────────────────────
// mySelected contains userAssetIds from the *preview* account's inventory.
// We map those back to assetIds, then find matching userAssetIds in this
// account's own inventory. Items the account doesn't own are skipped.
async function resolveMyAssetIds(acctIdx, acctUserId) {
    // Build assetId set from selected userAssetIds using the loaded myInventory
    const selectedAssetIds = new Set(
        myInventory
            .filter(item => mySelected.has(item.userAssetId))
            .map(item => String(item.assetId))
    );
    if (!selectedAssetIds.size) return [];

    // Fetch this account's own inventory and find matching userAssetIds
    const inv = await fetchInventoryForIdx(acctIdx, acctUserId);
    const resolved = [];
    selectedAssetIds.forEach(assetId => {
        const match = inv.find(item => String(item.assetId) === assetId);
        if (match) resolved.push(match.userAssetId);
        else log('⚠ '+accounts[acctIdx]?.username+' doesn\'t own assetId '+assetId+' — skipping', 'warn');
    });
    return resolved;
}

// ─── Send trade from one specific account ────────────────────────────────
async function sendTradeOfferFrom(acctIdx, acctUserId, myUserAssetIds, theirUserAssetIds) {
    const label   = acctIdx === -1 ? 'session' : accounts[acctIdx].username;
    const payload = JSON.stringify({ offers:[
        { robux:null, userAssetIds:myUserAssetIds,   userId:acctUserId      },
        { robux:null, userAssetIds:theirUserAssetIds, userId:tradeTargetId  },
    ]});
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, BASE+'/apisite/trades/v1/trades/send', { method:'POST', body:payload });
        } else {
            await fetchSessionCsrf();
            res = await sessFetch(BASE+'/apisite/trades/v1/trades/send', {
                method:'POST',
                headers:{'Content-Type':'application/json','x-csrf-token':sessionCsrf},
                body:payload,
            });
        }
        if (res.ok) { log('✓ Trade sent to '+tradeTargetName+' as '+label, 'success'); return true; }
        let msg = 'HTTP '+res.status;
        try { const d=await res.json(); msg=d.errors?.[0]?.message||d.errorMessage||msg; } catch(_){}
        log('✗ Trade failed ('+label+'): '+msg, 'err');
        return false;
    } catch(e) {
        log('✗ Trade error ('+label+'): '+e.message, 'err');
        return false;
    }
}

// ─── Main send dispatcher ─────────────────────────────────────────────────
async function sendTradeOffer() {
    if (!tradeTargetId) return;
    const theirUserAssetIds = Array.from(theirSelected); // same for all accounts

    const btn = document.getElementById('st-send-btn');
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span> Sending...'; btn.disabled=true; }

    let results = [];

    if (selectedAcctIdx === -2) {
        // ── All Accounts ──────────────────────────────────────────────────
        if (!accounts.length) {
            log('No accounts saved — nothing to send', 'warn');
            setTradeStatus('✕ No accounts saved', '#ef4444');
            if (btn) { btn.innerHTML='🔄 Send Trade Offer'; btn.disabled=false; btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
            return;
        }
        log('Sending trade to '+tradeTargetName+' from '+accounts.length+' account(s)...', 'info');

        const sends = accounts.map(async (acct, i) => {
            // 1. Ensure we have this account's user ID
            let acctId = acct.id;
            if (!acctId) {
                try {
                    const r = await acctFetch(i, BASE+'/apisite/users/v1/users/authenticated');
                    const j = await r.json(); acctId = j.id || null;
                    if (acctId) { accounts[i].id = acctId; saveAccounts(); }
                } catch(_){}
            }
            if (!acctId) { log('✗ Could not get ID for '+acct.username+' — skipping', 'err'); return false; }

            // 2. Resolve this account's own userAssetIds for the selected item types
            const myUAIds = await resolveMyAssetIds(i, acctId);
            if (mySelected.size > 0 && !myUAIds.length) {
                log('✗ '+acct.username+' owns none of the selected items — skipping', 'warn');
                return false;
            }

            // 3. Send
            return sendTradeOfferFrom(i, acctId, myUAIds, theirUserAssetIds);
        });

        results = await Promise.all(sends);

    } else if (selectedAcctIdx === -1) {
        // ── Session ───────────────────────────────────────────────────────
        const myId = await fetchMyUserId();
        if (!myId) { log('Could not get session user ID', 'err'); return; }
        const myUAIds = Array.from(mySelected); // session inventory was loaded as-is
        log('Sending trade to '+tradeTargetName+' (session)...', 'info');
        results = [await sendTradeOfferFrom(-1, myId, myUAIds, theirUserAssetIds)];

    } else {
        // ── Single account ────────────────────────────────────────────────
        const acct  = accounts[selectedAcctIdx];
        let acctId  = acct?.id;
        if (!acctId) {
            try {
                const r = await acctFetch(selectedAcctIdx, BASE+'/apisite/users/v1/users/authenticated');
                const j = await r.json(); acctId = j.id || null;
                if (acctId) { accounts[selectedAcctIdx].id = acctId; saveAccounts(); }
            } catch(_){}
        }
        if (!acctId) { log('Could not get ID for '+acct?.username, 'err'); return; }

        // Single account: inventory was already loaded from this account (tradeLookupIdx = selectedAcctIdx),
        // so the userAssetIds in mySelected are already correct — no remapping needed.
        const myUAIds = Array.from(mySelected);
        log('Sending trade to '+tradeTargetName+' as '+acct.username+'...', 'info');
        results = [await sendTradeOfferFrom(selectedAcctIdx, acctId, myUAIds, theirUserAssetIds)];
    }

    const anyOk = results.some(Boolean);
    const sent  = results.filter(Boolean).length;

    if (anyOk) {
        setTradeStatus('✓ Trade sent from '+sent+'/'+results.length+' account(s) to '+tradeTargetName, '#22c55e');
        if (btn) {
            btn.innerHTML        = '✓ Trade Sent!';
            btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
            btn.style.boxShadow  = '0 0 14px rgba(34,197,94,0.3)';
            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = '🔄 Send Trade Offer';
                    btn.style.background = btn.style.boxShadow = '';
                    btn.disabled = false; btn.style.opacity='1'; btn.style.pointerEvents='auto';
                }
            }, 2500);
        }
        mySelected.clear(); theirSelected.clear();
        renderInvList('st-my-inv', myInventory, mySelected);
        renderInvList('st-th-inv', theirInventory, theirSelected);
        updateTradeSummary();
    } else {
        setTradeStatus('✕ All trades failed — check the activity log', '#ef4444');
        if (btn) { btn.innerHTML='🔄 Send Trade Offer'; btn.disabled=false; btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
    }
}
