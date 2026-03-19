// ─── Account Storage ──────────────────────────────────────────────────────
function saveAccounts() { GM_setValue('tmcb_accounts', JSON.stringify(accounts)); }
function loadAccounts() {
    try { accounts = JSON.parse(GM_getValue('tmcb_accounts', '[]')); } catch (_) { accounts = []; }
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────
function parseName(d) {
    return d.name||d.username||d.userName||d.displayName||
           (d.user&&(d.user.name||d.user.username))||
           (d.data&&(d.data.name||d.data.username))||null;
}

function tryAuthEndpoint(cookie, idx) {
    return new Promise(resolve => {
        if (idx >= AUTH_ENDPOINTS.length) { resolve(null); return; }
        gmFetch(BASE + AUTH_ENDPOINTS[idx], {
            headers: { 'Cookie': '.ROBLOSECURITY='+cookie, 'Accept': 'application/json' },
        }).then(r => {
            if (r.status === 200) {
                try { const d=JSON.parse(r.responseText),name=parseName(d); if(name){resolve({name,id:d.id||null});return;} } catch(_){}
            }
            tryAuthEndpoint(cookie, idx+1).then(resolve);
        }).catch(() => tryAuthEndpoint(cookie, idx+1).then(resolve));
    });
}

function fetchCsrfForCookie(cookie) {
    return new Promise(resolve => {
        gmFetch(BASE + '/apisite/economy/v1/purchases/products/0', {
            method: 'POST',
            headers: { 'Cookie': '.ROBLOSECURITY='+cookie, 'Content-Type':'application/json', 'x-csrf-token':'' },
            body: '{}',
        }).then(r => {
            const t = r.responseHeaders?.match(/x-csrf-token:\s*([^\r\n]+)/i)?.[1]?.trim();
            resolve(t || '');
        }).catch(() => resolve(''));
    });
}

async function acctFetch(acctIdx, url, opts = {}) {
    const acct = accounts[acctIdx];
    if (!acct) throw new Error('No account at index '+acctIdx);
    const method = (opts.method||'GET').toUpperCase();
    const needsCsrf = ['POST','PUT','PATCH','DELETE'].includes(method);

    if (needsCsrf && !acct.csrf) {
        acct.csrf = await fetchCsrfForCookie(acct.cookie);
        saveAccounts();
    }

    const buildH = () => ({
        'Cookie': '.ROBLOSECURITY='+acct.cookie,
        'Accept': 'application/json',
        ...(needsCsrf ? { 'x-csrf-token': acct.csrf||'', 'Content-Type':'application/json' } : {}),
        ...(opts.headers||{}),
    });

    let r = await gmFetch(url, { ...opts, headers: buildH() });

    if (r.status === 403 && needsCsrf) {
        const nc = r.responseHeaders?.match(/x-csrf-token:\s*([^\r\n]+)/i)?.[1]?.trim();
        if (nc) { acct.csrf = nc; saveAccounts(); r = await gmFetch(url, { ...opts, headers: buildH() }); }
    }
    return normResp(r);
}

async function sessFetch(url, opts = {}) {
    return fetch(url, { credentials:'include', ...opts });
}

// ─── Session CSRF ─────────────────────────────────────────────────────────
async function fetchSessionCsrf() {
    try {
        const r = await fetch(BASE+'/apisite/economy/v1/purchases/products/0', {
            method:'POST', credentials:'include',
            headers:{'Content-Type':'application/json','x-csrf-token':''},
            body:'{}',
        });
        const t = r.headers.get('x-csrf-token');
        if (t) sessionCsrf = t;
    } catch(_){}
}

// ─── Account UI Helpers ───────────────────────────────────────────────────
function rebuildAcctSelector() {
    const sel = document.getElementById('st-acct-sel'); if (!sel) return;
    sel.innerHTML = '';
    const mk = (v,t) => { const o=document.createElement('option'); o.value=v; o.textContent=t; return o; };
    sel.appendChild(mk('-1','🌐 Current Session'));
    sel.appendChild(mk('-2','👥 All Accounts ('+(accounts.length||'0')+')'));
    accounts.forEach((a,i) => sel.appendChild(mk(String(i),'👤 '+a.username+(a.csrf?'':' ⚠️'))));
    sel.value = String(selectedAcctIdx);
}

function updateMiniAcct() {
    const nameEl = document.getElementById('st-acct-mini-name'), subEl = document.getElementById('st-acct-mini-sub');
    if (selectedAcctIdx === -2) { if(nameEl) nameEl.textContent='All Accounts'; if(subEl) subEl.textContent=accounts.length+' accounts'; }
    else if (selectedAcctIdx === -1) { if(nameEl) nameEl.textContent='Session'; if(subEl) subEl.textContent='Current browser session'; }
    else { const a=accounts[selectedAcctIdx]; if(nameEl) nameEl.textContent=a?a.username:'?'; if(subEl) subEl.textContent=a?'ID: '+(a.id||'unknown'):''; }
}

function rebuildSettingsAcctList() {
    const el = document.getElementById('st-settings-acct-list'); if (!el) return;
    el.innerHTML = '';
    if (!accounts.length) { el.innerHTML='<div style="padding:10px;text-align:center;color:#334155;font-size:10px;font-style:italic;">No accounts saved yet</div>'; return; }
    accounts.forEach((a,i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:#060c18;border:1px solid #0a1525;border-radius:8px;margin-bottom:5px;transition:border-color 0.12s;';
        row.onmouseenter = () => row.style.borderColor = '#162032';
        row.onmouseleave = () => row.style.borderColor = '#0a1525';
        const dot = document.createElement('div'); dot.style.cssText = 'width:7px;height:7px;border-radius:50%;flex-shrink:0;background:#1e293b;';
        const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
        const nm = document.createElement('div'); nm.style.cssText = 'font-size:11px;font-weight:600;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'; nm.textContent = a.username;
        const idLine = document.createElement('div'); idLine.style.cssText = 'font-size:9px;color:#1e3a5f;font-family:monospace;margin-top:1px;'; idLine.textContent = 'ID: '+(a.id||'unknown');
        info.append(nm, idLine);
        const badge = document.createElement('span');
        badge.style.cssText = 'font-size:8px;padding:2px 6px;border-radius:20px;font-weight:700;flex-shrink:0;'+(a.csrf?'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#22c55e;':'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#ef4444;');
        badge.textContent = a.csrf ? '✓ CSRF' : '✗ CSRF';
        const rm = document.createElement('button'); rm.textContent = '✕';
        rm.style.cssText = 'background:none;border:none;color:rgba(255,100,100,0.35);cursor:pointer;font-size:13px;padding:0 3px;line-height:1;transition:color 0.12s;flex-shrink:0;';
        rm.onmouseenter = () => rm.style.color = '#ef4444';
        rm.onmouseleave = () => rm.style.color = 'rgba(255,100,100,0.35)';
        rm.addEventListener('click', () => {
            accounts.splice(i,1);
            if (selectedAcctIdx >= accounts.length) selectedAcctIdx = -1;
            saveAccounts(); rebuildAcctSelector(); rebuildSettingsAcctList();
            log('Account removed','warn');
        });
        row.append(dot, info, badge, rm);
        el.appendChild(row);
    });
}

async function addAccountFlow() {
    const rawCookie = document.getElementById('st-add-cookie')?.value?.trim();
    const rawCsrf   = document.getElementById('st-add-csrf')?.value?.trim();
    const addBtn    = document.getElementById('st-add-btn');
    const statusEl  = document.getElementById('st-add-status');
    if (!rawCookie) { if(statusEl){statusEl.textContent='⚠️ Paste a cookie first.';statusEl.style.color='#eab308';} return; }
    const cookie = rawCookie.includes('=')&&rawCookie.indexOf('=')<40 ? rawCookie.substring(rawCookie.indexOf('=')+1).trim() : rawCookie;
    if (addBtn) { addBtn.disabled=true; addBtn.innerHTML='<span class="st-spin">↻</span> Verifying...'; }
    if (statusEl) statusEl.textContent = '';
    const result = await tryAuthEndpoint(cookie, 0);
    if (!result) {
        if(statusEl){statusEl.textContent='❌ Could not verify cookie.';statusEl.style.color='#ef4444';}
        if(addBtn){addBtn.disabled=false;addBtn.innerHTML='🔍 Fetch Username & Save';}
        return;
    }
    let csrf = rawCsrf;
    if (!csrf) { if(statusEl){statusEl.textContent='Fetching CSRF...';statusEl.style.color='#3b82f6';} csrf=await fetchCsrfForCookie(cookie); }
    const ex = accounts.findIndex(a => a.username===result.name);
    if (ex !== -1) { accounts[ex]={username:result.name,id:result.id,cookie,csrf}; if(statusEl){statusEl.textContent='✅ Updated: '+result.name;statusEl.style.color='#22c55e';} }
    else           { accounts.push({username:result.name,id:result.id,cookie,csrf}); if(statusEl){statusEl.textContent='✅ Added: '+result.name;statusEl.style.color='#22c55e';} }
    saveAccounts(); rebuildAcctSelector(); rebuildSettingsAcctList();
    if (document.getElementById('st-add-cookie')) document.getElementById('st-add-cookie').value = '';
    if (document.getElementById('st-add-csrf'))   document.getElementById('st-add-csrf').value   = '';
    if (addBtn) { addBtn.disabled=false; addBtn.innerHTML='🔍 Fetch Username & Save'; }
    log('Account saved: '+result.name, 'success');
}
