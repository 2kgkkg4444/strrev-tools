// ─── Account Storage ──────────────────────────────────────────────────────
function saveAccounts() { GM_setValue('tmcb_accounts', JSON.stringify(accounts)); }
function loadAccounts() {
    try { accounts = JSON.parse(GM_getValue('tmcb_accounts', '[]')); } catch (_) { accounts = []; }
}

// ─── Auto-Accept State ───────────────────────────────────────────────────
let autoAcceptTimers = {}; // acctIdx → intervalId

async function pollAndAcceptTrades(i) {
    if (!accounts[i]) return;
    try {
        const r = await acctFetch(i, BASE + '/apisite/trades/v1/trades/inbound?limit=25&tradeStatusType=1');
        if (!r.ok) return;
        const j = await r.json();
        const trades = j.data || j.trades || [];
        for (const trade of trades) {
            const tid = trade.id || trade.tradeId;
            if (!tid) continue;
            const ar = await acctFetch(i, BASE + '/apisite/trades/v1/trades/' + tid + '/accept', { method: 'POST', body: '{}' });
            if (ar.ok) {
                log('🤝 Auto-accepted trade #' + tid + ' for ' + accounts[i].username, 'success');
            } else {
                let msg = 'HTTP ' + ar.status;
                try { const d = await ar.json(); msg = d.errors?.[0]?.message || d.message || msg; } catch(_) {}
                log('⚠ Auto-accept trade #' + tid + ' failed (' + accounts[i].username + '): ' + msg, 'warn');
            }
        }
    } catch(_) {}
}

function startAutoAccept(i) {
    stopAutoAccept(i);
    accounts[i].autoAcceptTrades = true;
    saveAccounts();
    pollAndAcceptTrades(i); // immediate first check
    autoAcceptTimers[i] = setInterval(() => pollAndAcceptTrades(i), 15000);
    log('🤝 Auto-accept trades ON for ' + accounts[i].username, 'success');
}

function stopAutoAccept(i) {
    if (autoAcceptTimers[i]) { clearInterval(autoAcceptTimers[i]); delete autoAcceptTimers[i]; }
    if (accounts[i]) { accounts[i].autoAcceptTrades = false; saveAccounts(); }
}

function toggleAutoAccept(i) {
    if (accounts[i]?.autoAcceptTrades) stopAutoAccept(i);
    else startAutoAccept(i);
}

function resumeAutoAccepts() {
    accounts.forEach((a, i) => { if (a.autoAcceptTrades) startAutoAccept(i); });
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

// CSRF token TTL — refresh if older than 5 minutes
const CSRF_TTL_MS = 5 * 60 * 1000;

// Fetch a fresh CSRF token for a saved-cookie account.
// POSTs to the economy probe endpoint with an empty token — the server returns
// the correct token in the x-csrf-token response header regardless of status.
// This is the same approach used when accounts are first added, and it works.
function fetchCsrfForCookie(cookie) {
    return new Promise(resolve => {
        GM_xmlhttpRequest({
            method:    'POST',
            url:       BASE + '/apisite/economy/v1/purchases/products/0',
            headers:   { 'Cookie': '.ROBLOSECURITY=' + cookie, 'Content-Type': 'application/json', 'x-csrf-token': '' },
            data:      '{}',
            anonymous: true,
            onload:  r => {
                const t = r.responseHeaders?.match(/x-csrf-token:\s*([^\r\n]+)/i)?.[1]?.trim() || '';
                resolve(t);
            },
            onerror: () => resolve(''),
        });
    });
}

async function acctFetch(acctIdx, url, opts = {}) {
    const acct = accounts[acctIdx];
    if (!acct) throw new Error('No account at index ' + acctIdx);

    // Session-backed account (no raw cookie) — use browser session
    if (acct.sessionBacked || !acct.cookie) {
        const method = (opts.method || 'GET').toUpperCase();
        const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        if (needsCsrf) { await fetchSessionCsrf(); acct.csrf = sessionCsrf; saveAccounts(); }
        const headers = {
            'Accept': 'application/json',
            ...(needsCsrf ? { 'x-csrf-token': acct.csrf || sessionCsrf || '', 'Content-Type': 'application/json' } : {}),
            ...(opts.headers || {}),
        };
        return fetch(url, { credentials: 'include', ...opts, headers });
    }

    const method = (opts.method || 'GET').toUpperCase();
    const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    // Always fetch a fresh CSRF token before every POST/PUT/PATCH/DELETE.
    // The server returns HTTP 200 "Token Validation Failed" (not a 403) for
    // stale tokens, so the 403-retry below never fires for them — fresh fetch
    // on every mutating request is the only reliable fix.
    if (needsCsrf) {
        const fresh = await fetchCsrfForCookie(acct.cookie);
        if (fresh) { acct.csrf = fresh; acct.csrfAt = Date.now(); saveAccounts(); }
    }

    const buildH = () => ({
        'Cookie': '.ROBLOSECURITY=' + acct.cookie,
        'Accept': 'application/json',
        ...(needsCsrf ? { 'x-csrf-token': acct.csrf || '', 'Content-Type': 'application/json' } : {}),
        ...(opts.headers || {}),
    });

    let r = await gmFetch(url, { ...opts, headers: buildH() });

    // Handle genuine 403 — pull fresh token from response header and retry
    if (r.status === 403 && needsCsrf) {
        const nc = r.responseHeaders?.match(/x-csrf-token:\s*([^\r\n]+)/i)?.[1]?.trim();
        if (nc) {
            acct.csrf = nc; acct.csrfAt = Date.now(); saveAccounts();
            r = await gmFetch(url, { ...opts, headers: buildH() });
        } else {
            const fresh = await fetchCsrfForCookie(acct.cookie);
            if (fresh) { acct.csrf = fresh; acct.csrfAt = Date.now(); saveAccounts(); }
            r = await gmFetch(url, { ...opts, headers: buildH() });
        }
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

// ─── Account Preview Fetch ────────────────────────────────────────────────
async function fetchAcctPreview(i) {
    const acct = accounts[i];
    if (!acct) return {};

    // FIX: Skip preview fetches for session-backed accounts (no stored cookie).
    // These accounts would make requests via credentials:'include' (the real
    // browser session), which can confuse the server when mixed with other
    // account requests and cause a session logout.
    if (acct.sessionBacked || !acct.cookie) {
        return { robux: null, tickets: null, avatar: null };
    }

    const preview = {};

    // ── Currency: response is { robux, tickets } ────────────────────────────
    const uid = acct.id;
    const currencyEndpoints = uid ? [
        '/apisite/economy/v1/users/' + uid + '/currency',
        '/api/economy/users/' + uid + '/currency',
        '/api/users/' + uid + '/currency',
        '/apisite/economy/v1/user/currency',
    ] : [
        '/apisite/economy/v1/user/currency',
        '/api/currency',
        '/api/user/currency',
    ];
    for (const ep of currencyEndpoints) {
        try {
            const r = await acctFetch(i, BASE + ep);
            if (!r.ok) continue;
            const j = await r.json();
            if (j.robux != null || j.tickets != null) {
                preview.robux   = j.robux   ?? null;
                preview.tickets = j.tickets ?? null;
                break;
            }
        } catch(_) {}
    }

    // ── Avatar ───────────────────────────────────────────────────────────────
    if (acct.id) {
        try {
            const tr = await acctFetch(i, BASE + '/apisite/thumbnails/v1/users/avatar-headshot?userIds=' + acct.id + '&size=150x150&format=Png&isCircular=false');
            if (tr.ok) {
                const tj = await tr.json();
                preview.avatar = tj.data?.[0]?.imageUrl || null;
            }
        } catch(_) {}
        // ── Profile / join date ──────────────────────────────────────────────
        try {
            const ur = await acctFetch(i, BASE + '/apisite/users/v1/users/' + acct.id);
            if (ur.ok) {
                const uj = await ur.json();
                preview.displayName = uj.displayName || null;
                preview.created     = uj.created     || null;
            }
        } catch(_) {}
        // ── Membership — /apisite/premiumfeatures/v1/users/{id}/validate-membership
        try {
            if (acct.id) {
                const mr = await acctFetch(i, BASE + '/apisite/premiumfeatures/v1/users/' + acct.id + '/validate-membership');
                if (mr.ok) {
                    const tier = parseInt(await mr.text());
                    const tierMap = { 0: 'None', 1: 'BuildersClub', 2: 'TurboBuildersClub', 3: 'OutrageousBuildersClub' };
                    preview.membership = tierMap[tier] ?? null;
                }
            }
        } catch(_) {}
    }
    return preview;
}

function renderAcctCard(a, i, preview, cardEl) {
    const card = document.createElement('div');
    card.dataset.acctIdx = i;
    card.style.cssText = 'background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:16px;margin-bottom:10px;transition:border-color 0.15s;';
    card.onmouseenter = () => card.style.borderColor = 'var(--c-border)';
    card.onmouseleave = () => card.style.borderColor = 'var(--c-border2)';

    // Top row: avatar + name block + remove
    const top = document.createElement('div');
    top.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:12px;';

    // Avatar
    const avatarWrap = document.createElement('div');
    avatarWrap.style.cssText = 'width:48px;height:48px;border-radius:10px;overflow:hidden;flex-shrink:0;background:var(--c-bg2);border:1px solid var(--c-border2);display:flex;align-items:center;justify-content:center;font-size:20px;';
    if (preview && preview.avatar) {
        const img = document.createElement('img');
        img.src = preview.avatar;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        img.onerror = () => { avatarWrap.innerHTML = '👤'; };
        avatarWrap.appendChild(img);
    } else {
        avatarWrap.textContent = '👤';
    }

    // Name + id + csrf badge
    const nameBlock = document.createElement('div');
    nameBlock.style.cssText = 'flex:1;min-width:0;';
    const nameRow = document.createElement('div');
    nameRow.style.cssText = 'display:flex;align-items:center;gap:7px;margin-bottom:3px;';
    const nm = document.createElement('span');
    nm.style.cssText = 'font-size:14px;font-weight:700;color:var(--c-text0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    nm.textContent = a.username;
    const csrfBadge = document.createElement('span');
    csrfBadge.style.cssText = 'font-size:8px;padding:2px 6px;border-radius:20px;font-weight:700;flex-shrink:0;' + (a.csrf ? 'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#22c55e;' : 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#ef4444;');
    csrfBadge.textContent = a.csrf ? '✓ CSRF' : '✗ CSRF';
    nameRow.append(nm, csrfBadge);
    const subRow = document.createElement('div');
    subRow.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const idSpan = document.createElement('span');
    idSpan.style.cssText = 'font-size:10px;color:var(--c-text4);font-family:monospace;';
    idSpan.textContent = 'ID: ' + (a.id || 'unknown');
    subRow.appendChild(idSpan);
    if (preview && preview.created) {
        const joined = document.createElement('span');
        joined.style.cssText = 'font-size:10px;color:var(--c-text4);';
        joined.textContent = '· Joined ' + new Date(preview.created).getFullYear();
        subRow.appendChild(joined);
    }
    if (preview && preview.membership) {
        const mColors = {
            OutrageousBuildersClub: { bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.3)', text:'#fbbf24', label:'👑 OBC' },
            TurboBuildersClub:      { bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.3)', text:'#a78bfa', label:'⚡ TBC' },
            BuildersClub:           { bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.3)', text:'#60a5fa', label:'🔨 BC'  },
            None:                   { bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.2)', text:'#64748b', label:'🚫 None'},
        };
        const mc = mColors[preview.membership] || { bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.2)', text:'#94a3b8', label: preview.membership };
        const memBadge = document.createElement('span');
        memBadge.style.cssText = `font-size:9px;padding:2px 7px;border-radius:20px;font-weight:700;background:${mc.bg};border:1px solid ${mc.border};color:${mc.text};`;
        memBadge.textContent = mc.label;
        subRow.appendChild(memBadge);
    }
    nameBlock.append(nameRow, subRow);

    // Buttons row
    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'display:flex;gap:6px;flex-shrink:0;align-items:center;';

    // Auto-accept toggle
    const aaOn = !!a.autoAcceptTrades;
    const aaWrap = document.createElement('div');
    aaWrap.title = 'Auto-accept incoming trades';
    aaWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;';
    const aaLabel = document.createElement('span');
    aaLabel.style.cssText = 'font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:' + (aaOn ? '#22c55e' : 'var(--c-text5)') + ';white-space:nowrap;';
    aaLabel.textContent = 'Auto Accept';
    const aaTrack = document.createElement('div');
    aaTrack.style.cssText = 'width:36px;height:20px;border-radius:99px;background:' + (aaOn ? '#22c55e' : 'var(--c-border)') + ';position:relative;transition:background 0.2s;flex-shrink:0;';
    const aaThumb = document.createElement('div');
    aaThumb.style.cssText = 'width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:3px;left:' + (aaOn ? '19px' : '3px') + ';transition:left 0.18s;box-shadow:0 1px 3px rgba(0,0,0,0.4);';
    aaTrack.appendChild(aaThumb);
    aaWrap.append(aaLabel, aaTrack);
    aaWrap.addEventListener('click', () => {
        toggleAutoAccept(i);
        const nowOn = !!accounts[i]?.autoAcceptTrades;
        aaTrack.style.background = nowOn ? '#22c55e' : 'var(--c-border)';
        aaThumb.style.left       = nowOn ? '19px' : '3px';
        aaLabel.style.color      = nowOn ? '#22c55e' : 'var(--c-text5)';
    });

    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '↻';
    refreshBtn.title = 'Refresh preview';
    refreshBtn.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border);color:var(--c-text2);cursor:pointer;font-size:14px;width:28px;height:28px;border-radius:7px;transition:all 0.12s;line-height:1;';
    refreshBtn.onmouseenter = () => { refreshBtn.style.background='var(--c-bg3)'; refreshBtn.style.color='var(--c-text0)'; };
    refreshBtn.onmouseleave = () => { refreshBtn.style.background='var(--c-bg2)'; refreshBtn.style.color='var(--c-text2)'; };
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.style.animation = 'st-spin 0.6s linear infinite';
        refreshBtn.disabled = true;
        const p = await fetchAcctPreview(i);
        refreshBtn.style.animation = '';
        refreshBtn.disabled = false;
        const newCard = renderAcctCard(accounts[i], i, p, card);
        card.replaceWith(newCard);
    });

    const rm = document.createElement('button');
    rm.textContent = '✕';
    rm.title = 'Remove account';
    rm.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border);color:rgba(255,100,100,0.4);cursor:pointer;font-size:13px;width:28px;height:28px;border-radius:7px;transition:all 0.12s;line-height:1;';
    rm.onmouseenter = () => { rm.style.background='rgba(239,68,68,0.1)'; rm.style.color='#ef4444'; rm.style.borderColor='rgba(239,68,68,0.3)'; };
    rm.onmouseleave = () => { rm.style.background='var(--c-bg2)'; rm.style.color='rgba(255,100,100,0.4)'; rm.style.borderColor='var(--c-border)'; };
    rm.addEventListener('click', () => {
        stopAutoAccept(i);
        accounts.splice(i, 1);
        if (selectedAcctIdx >= accounts.length) selectedAcctIdx = -1;
        saveAccounts(); rebuildAcctSelector(); rebuildSettingsAcctList();
        log('Account removed', 'warn');
    });

    btnWrap.append(aaWrap, refreshBtn, rm);
    top.append(avatarWrap, nameBlock, btnWrap);

    // Stats row: robux, tix
    const stats = document.createElement('div');
    stats.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';

    const mkStat = (label, value, color, icon) => {
        const s = document.createElement('div');
        s.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:9px;padding:10px 12px;';
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.9px;color:var(--c-text4);margin-bottom:5px;';
        lbl.textContent = icon + ' ' + label;
        const val = document.createElement('div');
        val.style.cssText = 'font-size:16px;font-weight:700;font-family:"Fira Code",monospace;color:' + color + ';';
        val.textContent = value;
        s.append(lbl, val);
        return s;
    };

    const loading = '…';
    const robuxVal  = (preview && preview.robux   != null) ? preview.robux.toLocaleString()   : loading;
    const tixVal    = (preview && preview.tickets  != null) ? preview.tickets.toLocaleString()  : loading;

    stats.append(
        mkStat('Robux',   robuxVal,  '#f97316', 'R$'),
        mkStat('Tickets', tixVal,    '#eab308',  'T$'),
    );

    card.append(top, stats);
    return card;
}

let _acctAutoRefreshTimer = null;

function rebuildSettingsAcctList() {
    const el = document.getElementById('st-settings-acct-list'); if (!el) return;
    el.innerHTML = '';
    if (!accounts.length) {
        el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--c-text4);font-size:11px;font-style:italic;">No accounts saved yet</div>';
        return;
    }

    // Clear any existing auto-refresh timer before creating a new one
    if (_acctAutoRefreshTimer) { clearInterval(_acctAutoRefreshTimer); _acctAutoRefreshTimer = null; }

    accounts.forEach((a, i) => {
        const card = renderAcctCard(a, i, null);
        el.appendChild(card);

        // FIX: Stagger preview fetches with a small delay per account so we
        // don't fire a burst of simultaneous requests which can trip server
        // rate-limits or security checks.
        setTimeout(() => {
            fetchAcctPreview(i).then(preview => {
                // Re-query because the card may have been replaced already
                const existing = el.querySelector('[data-acct-idx="' + i + '"]');
                if (existing) {
                    const newCard = renderAcctCard(accounts[i], i, preview);
                    existing.replaceWith(newCard);
                }
            });
        }, i * 300); // 300ms stagger per account
    });

    // Auto-refresh previews every 60s (increased from 30s to reduce request load)
    const doRefresh = () => {
        const listEl = document.getElementById('st-settings-acct-list');
        if (!listEl) { clearInterval(_acctAutoRefreshTimer); _acctAutoRefreshTimer = null; return; }
        accounts.forEach((a, i) => {
            setTimeout(() => {
                fetchAcctPreview(i).then(preview => {
                    const card = listEl.querySelector('[data-acct-idx="' + i + '"]');
                    if (card) {
                        const newCard = renderAcctCard(accounts[i], i, preview);
                        card.replaceWith(newCard);
                    }
                });
            }, i * 300);
        });
    };
    _acctAutoRefreshTimer = setInterval(doRefresh, 60000);
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
    resumeAutoAccepts();
}
