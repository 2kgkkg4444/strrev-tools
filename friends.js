// ─── User Lookup Cache ────────────────────────────────────────────────────
const _userLookupCache = {};

async function lookupFriendTarget(input) {
    input = input.trim();
    if (_userLookupCache[input]) return _userLookupCache[input];
    const idx = selectedAcctIdx >= 0 ? selectedAcctIdx : (accounts.length > 0 ? 0 : -1);
    const safeJ = async (r) => { try { const t = await r.text(); return JSON.parse(t); } catch(_) { return {}; } };
    let r;
    if (/^\d+$/.test(input)) {
        r = idx >= 0 ? await acctFetch(idx, BASE + '/apisite/users/v1/users/' + input) : await sessFetch(BASE + '/apisite/users/v1/users/' + input);
        if (!r.ok) throw new Error('User ID ' + input + ' not found');
        const j = await safeJ(r);
        const result = { id: String(j.id), name: j.name || j.displayName || 'User ' + input };
        _userLookupCache[input] = result; return result;
    }
    const body = JSON.stringify({ usernames: [input], excludeBannedUsers: false });
    if (idx < 0) await refreshSessionCsrf();
    r = idx >= 0
        ? await acctFetch(idx, BASE + '/apisite/users/v1/usernames/users', { method: 'POST', body })
        : await sessFetch(BASE + '/apisite/users/v1/usernames/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': sessionCsrf }, body });
    const j = await safeJ(r);
    const u = j.data?.[0]; if (!u) throw new Error('Username "' + input + '" not found');
    const result = { id: String(u.id), name: u.name };
    _userLookupCache[input] = result; return result;
}

// ─── Friend Requests ──────────────────────────────────────────────────────
async function sendFriendRequestFrom(acctIdx, targetId, targetName) {
    const label = acctIdx === -1 ? 'session' : accounts[acctIdx].username;
    const url   = BASE + '/apisite/friends/v1/users/' + targetId + '/request-friendship';
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, url, { method: 'POST', body: '{}' });
        } else {
            const csrf = await refreshSessionCsrf();
            res = await sessFetch(url, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: '{}' });
        }
        if (res.ok) { log('✓ Friend request → ' + targetName + ' as ' + label, 'success'); return { ok: true }; }
        let msg = 'HTTP ' + res.status;
        try { const d = await res.json(); msg = d.errors?.[0]?.message || d.errorMessage || msg; } catch(_) {}
        if (msg.toLowerCase().includes('already') || res.status === 400) { log('~ Already friends/pending for ' + label, 'warn'); return { ok: true, skipped: true }; }
        log('✗ Friend failed (' + label + '): ' + msg, 'err');
        return { ok: false, msg };
    } catch(e) { log('✗ Friend error (' + label + '): ' + e.message, 'err'); return { ok: false, msg: e.message }; }
}

function setFriendStatus(msg, color) {
    const el = document.getElementById('st-friend-status'); if (!el) return;
    el.style.display = msg ? 'block' : 'none'; el.style.color = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)'; el.style.background = color ? color + '0d' : 'var(--c-bg0)'; el.textContent = msg;
}

async function sendFriendRequests() {
    const input = document.getElementById('st-friend-input')?.value?.trim(); if (!input) return;
    const loopCount = Math.max(1, Math.min(50, parseInt(document.getElementById('st-friend-count')?.value) || 1));
    const btn = document.getElementById('st-friend-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Sending...'; btn.disabled = true; }
    setFriendStatus('Looking up user...', 'var(--c-warn)');
    let target;
    try { target = await lookupFriendTarget(input); } catch(e) {
        setFriendStatus('✕ ' + e.message, 'var(--c-err)');
        if (btn) { btn.innerHTML = '👤 Send Friend Request'; btn.disabled = false; } return;
    }
    log('Sending friend request to ' + target.name + ' (loop x' + loopCount + ')…', 'info');

    const idxs = resolveAccountIndices();
    if (!idxs.length) { setFriendStatus('✕ No accounts selected', 'var(--c-err)'); if (btn) { btn.innerHTML = '👤 Send Friend Request'; btn.disabled = false; } return; }

    let sent = 0, skipped = 0, failed = 0;
    for (let loop = 0; loop < loopCount; loop++) {
        const results = await Promise.all(idxs.map(i => sendFriendRequestFrom(i, target.id, target.name)));
        results.forEach(r => { if (r.ok && !r.skipped) sent++; else if (r.skipped) skipped++; else failed++; });
        setFriendStatus(`Loop ${loop + 1}/${loopCount} — ${sent} sent, ${skipped} already, ${failed} failed`, 'var(--c-warn)');
    }

    const total = idxs.length * loopCount;
    const parts = [...(sent ? [sent + ' sent'] : []), ...(skipped ? [skipped + ' already'] : []), ...(failed ? [failed + ' failed'] : [])];
    const allOk = sent > 0 || skipped > 0;
    setFriendStatus((allOk ? '✓ ' : '✕ ') + target.name + ' — ' + parts.join(', '), allOk ? 'var(--c-success)' : 'var(--c-err)');
    if (btn) {
        if (allOk) { btn.innerHTML = '✓ Done!'; btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)'; setTimeout(() => { if (btn) { btn.innerHTML = '👤 Send Friend Request'; btn.style.background = ''; btn.disabled = false; } }, 2500); }
        else { btn.innerHTML = '👤 Send Friend Request'; btn.disabled = false; }
    }
}

// ─── Messages ─────────────────────────────────────────────────────────────
async function sendMessageFrom(acctIdx, recipientId, subject, body) {
    const label   = acctIdx === -1 ? 'session' : accounts[acctIdx].username;
    const payload = JSON.stringify({ recipientId: parseInt(recipientId), subject, body });
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, BASE + '/apisite/privatemessages/v1/messages/send', { method: 'POST', body: payload });
        } else {
            const csrf = await refreshSessionCsrf();
            res = await sessFetch(BASE + '/apisite/privatemessages/v1/messages/send', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf }, body: payload });
        }
        if (res.ok) { log('✓ Message → ' + recipientId + ' as ' + label, 'success'); return { ok: true }; }
        let msg = 'HTTP ' + res.status;
        try { const d = await res.json(); msg = d.errors?.[0]?.message || d.errorMessage || msg; } catch(_) {}
        log('✗ Message failed (' + label + '): ' + msg, 'err');
        return { ok: false, msg };
    } catch(e) { log('✗ Message error (' + label + '): ' + e.message, 'err'); return { ok: false, msg: e.message }; }
}

function setMsgStatus(msg, color) {
    const el = document.getElementById('st-msg-status'); if (!el) return;
    el.style.display = msg ? 'block' : 'none'; el.style.color = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)'; el.style.background = color ? color + '0d' : 'var(--c-bg0)'; el.textContent = msg;
}

async function sendMessages() {
    const input   = document.getElementById('st-msg-input')?.value?.trim();
    const subject = document.getElementById('st-msg-subject')?.value?.trim();
    const body    = document.getElementById('st-msg-body')?.value?.trim();
    const count   = Math.max(1, Math.min(100, parseInt(document.getElementById('st-msg-count')?.value) || 1));
    const delay   = Math.max(0, parseInt(document.getElementById('st-msg-delay')?.value) || 0);

    if (!input)   { setMsgStatus('⚠ Enter a username or user ID', 'var(--c-warn)'); return; }
    if (!subject) { setMsgStatus('⚠ Enter a subject', 'var(--c-warn)'); return; }
    if (!body)    { setMsgStatus('⚠ Enter a message body', 'var(--c-warn)'); return; }

    const btn = document.getElementById('st-msg-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Sending...'; btn.disabled = true; }
    setMsgStatus('Looking up user...', 'var(--c-warn)');
    let target;
    try { target = await lookupFriendTarget(input); } catch(e) {
        setMsgStatus('✕ ' + e.message, 'var(--c-err)');
        if (btn) { btn.innerHTML = '✉️ Send Message'; btn.disabled = false; } return;
    }
    log('Sending ' + count + '× message(s) to ' + target.name + (delay > 0 ? ' (delay: ' + delay + 'ms)' : '') + '…', 'info');

    const idxs = resolveAccountIndices();
    if (!idxs.length) { setMsgStatus('✕ No accounts selected', 'var(--c-err)'); if (btn) { btn.innerHTML = '✉️ Send Message'; btn.disabled = false; } return; }

    let sent = 0, failed = 0;
    setMsgStatus('Sending 0/' + count + '…', 'var(--c-warn)');

    // Round-robin tasks across senders
    const tasks = Array.from({ length: count }, (_, n) => idxs[n % idxs.length]);

    await Promise.all(idxs.map(async idx => {
        const myTasks = tasks.filter(t => t === idx);
        for (let n = 0; n < myTasks.length; n++) {
            if (n > 0 && delay > 0) await sleep(delay);
            const r = await sendMessageFrom(idx, target.id, subject, body);
            if (r.ok) sent++; else failed++;
            setMsgStatus('Sending ' + (sent + failed) + '/' + count + ' — ' + sent + ' sent, ' + failed + ' failed…', 'var(--c-warn)');
        }
    }));

    if (sent > 0) {
        setMsgStatus('✓ Sent ' + sent + '/' + count + ' message' + (count > 1 ? 's' : '') + ' to ' + target.name, 'var(--c-success)');
        if (btn) { btn.innerHTML = '✓ Sent!'; btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)'; setTimeout(() => { if (btn) { btn.innerHTML = '✉️ Send Message'; btn.style.background = ''; btn.disabled = false; } }, 2500); }
    } else {
        setMsgStatus('✕ All messages failed', 'var(--c-err)');
        if (btn) { btn.innerHTML = '✉️ Send Message'; btn.disabled = false; }
    }
}

// ─── User Lookup ──────────────────────────────────────────────────────────
async function lookupUserProfile() {
    const input = document.getElementById('st-lookup-input')?.value?.trim(); if (!input) return;
    const btn = document.getElementById('st-lookup-btn'), result = document.getElementById('st-lookup-result'), status = document.getElementById('st-lookup-status');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span>'; btn.disabled = true; }
    if (result) result.innerHTML = '';
    if (status) status.textContent = 'Looking up…';
    try {
        const target = await lookupFriendTarget(input);
        const uid = target.id;
        if (status) status.textContent = 'Fetching profile…';
        await refreshSessionCsrf();
        const safeJson = async (r) => { try { const t = await r.text(); return JSON.parse(t); } catch(_) { return {}; } };

        // All parallel
        const [profileR, friendsR, thumbR, memberR] = await Promise.all([
            sessFetch(BASE + '/apisite/users/v1/users/' + uid),
            sessFetch(BASE + '/apisite/friends/v1/users/' + uid + '/friends'),
            sessFetch(BASE + '/apisite/thumbnails/v1/users/avatar-headshot?userIds=' + uid + '&size=150x150&format=Png&isCircular=false'),
            sessFetch(BASE + '/apisite/premiumfeatures/v1/users/' + uid + '/validate-membership'),
        ]);

        const profile  = profileR.ok  ? await safeJson(profileR)  : {};
        const friendsJ = friendsR.ok  ? await safeJson(friendsR)  : {};
        const thumb    = thumbR.ok    ? await safeJson(thumbR)    : {};
        let presenceJ  = {};
        try {
            const pr = await fetch(BASE + '/apisite/presence/v1/presence/users', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'x-csrf-token': sessionCsrf }, body: JSON.stringify({ userIds: [String(uid)] }) });
            if (pr.ok) { const t = await pr.text(); presenceJ = JSON.parse(t); }
        } catch(_) {}

        const avatar       = thumb.data?.[0]?.imageUrl || null;
        const friendsList  = friendsJ.data || [];
        const presence     = (presenceJ.userPresences || []).find(p => String(p.userId) === String(uid)) || {};
        const presType     = presence.userPresenceType || '';
        const isOnline     = presType !== '' && presType !== 'Offline' && presType !== '0';
        const lastOnline   = presence.lastOnline || null;
        const tierMap      = { 0:'None', 1:'BuildersClub', 2:'TurboBuildersClub', 3:'OutrageousBuildersClub' };
        const mColors      = { OutrageousBuildersClub:{bg:'rgba(251,191,36,0.12)',border:'rgba(251,191,36,0.3)',text:'#fbbf24',label:'👑 OBC'}, TurboBuildersClub:{bg:'rgba(139,92,246,0.12)',border:'rgba(139,92,246,0.3)',text:'#a78bfa',label:'⚡ TBC'}, BuildersClub:{bg:'rgba(59,130,246,0.12)',border:'rgba(59,130,246,0.3)',text:'#60a5fa',label:'🔨 BC'}, None:{bg:'rgba(100,116,139,0.1)',border:'rgba(100,116,139,0.2)',text:'#64748b',label:'No BC'} };
        const membership   = memberR.ok ? tierMap[parseInt(await memberR.text())] || 'None' : 'None';
        const mc           = mColors[membership] || mColors.None;
        const joinedDate   = profile.created ? new Date(profile.created).toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric' }) : '—';
        if (status) status.textContent = '';

        // Fetch RAP from leaderboard
        let rap = null, lbRank = null;
        try {
            const lr = await sessFetch(BASE + '/internal/leaderboard?sort=rap');
            if (lr.ok) {
                const html = await lr.text();
                const rowPat = /<tr[^>]*lb-row[^>]*>[\s\S]*?lb-rank[^>]*>\s*(?:<span[^>]*>\s*(\d+)\s*<\/span>|(\d+))\s*[\s\S]*?collectibles\?userId=(\d+)[^>]*>\s*([^<]+)<\/a[\s\S]*?lb-val-rap[^>]*>R\$\s*([\d,]+)[\s\S]*?<\/tr>/g;
                const lbData = [...html.matchAll(rowPat)].map(m => ({ rank: parseInt(m[1]||m[2]), id: m[3].trim(), name: m[4].trim(), rap: parseInt(m[5].replace(/,/g,'')) }));
                const lbEntry = lbData.find(e => String(e.id) === String(uid) || e.name === (profile.name || target.name));
                if (lbEntry) { rap = lbEntry.rap; lbRank = lbEntry.rank; }
            }
        } catch(_) {}

        const el = document.getElementById('st-lookup-result'); if (!el) { if (btn) { btn.innerHTML = '🔍 Lookup'; btn.disabled = false; } return; }
        el.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:14px;padding:16px 18px;background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:14px;margin-bottom:12px;';
        header.innerHTML = `
            <div style="width:60px;height:60px;border-radius:12px;overflow:hidden;background:var(--c-bg3);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:26px;">
                ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='👤'">` : '👤'}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                    <span style="font-size:16px;font-weight:700;color:var(--c-text0);">${profile.name || target.name}</span>
                    ${profile.displayName && profile.displayName !== profile.name ? `<span style="font-size:11px;color:var(--c-text4);">(${profile.displayName})</span>` : ''}
                    <span style="font-size:9px;padding:2px 7px;border-radius:20px;font-weight:700;background:${mc.bg};border:1px solid ${mc.border};color:${mc.text};">${mc.label}</span>
                </div>
                <div style="font-size:11px;color:${isOnline ? '#22c55e' : '#475569'};margin-bottom:2px;">${isOnline ? '🟢 Online' : lastOnline ? '⚫ Last seen ' + new Date(lastOnline).toLocaleDateString('en',{year:'numeric',month:'short',day:'numeric'}) : '⚫ Offline'}</div>
                <div style="font-size:10px;color:var(--c-text4);">ID: ${uid} · Joined ${joinedDate}</div>
            </div>`;
        el.appendChild(header);

        // Stats
        const stats = document.createElement('div');
        stats.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px;';
        [{ label:'RAP', value: rap != null ? 'R$' + Number(rap).toLocaleString() : '—', color:'#f97316' }, { label:'LB Rank', value: lbRank != null ? '#' + lbRank : 'Unranked', color: lbRank != null ? '#eab308' : 'var(--c-text4)' }, { label:'Friends', value: String(friendsList.length), color:'#60a5fa' }, { label:'Online Friends', value: String(friendsList.filter(f => f.isOnline).length), color:'#22c55e' }].forEach(({ label, value, color }) => {
            const s = document.createElement('div');
            s.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:10px;padding:12px 14px;';
            s.innerHTML = `<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.9px;color:var(--c-text4);margin-bottom:6px;">${label}</div><div style="font-size:16px;font-weight:700;font-family:'Fira Code',monospace;color:${color};">${value}</div>`;
            stats.appendChild(s);
        });
        el.appendChild(stats);

        if (profile.description) {
            const desc = document.createElement('div');
            desc.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:10px;padding:12px 14px;margin-bottom:12px;font-size:11px;color:var(--c-text2);line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:70px;overflow-y:auto;';
            desc.textContent = profile.description;
            el.appendChild(desc);
        }

        // Inventory
        if (status) status.textContent = 'Loading inventory…';
        const allItems = await fetchInventoryAllPages(-1, uid);
        if (status) status.textContent = '';
        if (allItems.length) {
            const invHdr = document.createElement('div');
            invHdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';
            invHdr.innerHTML = `<span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);">💎 Collectibles (${allItems.length})</span>`;
            el.appendChild(invHdr);
            const invGrid = document.createElement('div');
            invGrid.style.cssText = 'display:flex;flex-direction:column;gap:4px;max-height:280px;overflow-y:auto;';
            allItems.forEach(item => {
                const price = item.recentAveragePrice || item.price || 0;
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:7px 11px;background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:8px;';
                row.innerHTML = `<span style="font-size:11px;color:var(--c-text1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;">${item.name || 'Item #' + item.assetId}</span>${price > 0 ? `<span style="font-size:10px;color:#f97316;font-family:'Fira Code',monospace;flex-shrink:0;margin-left:8px;">RAP: R$${Number(price).toLocaleString()}</span>` : ''}`;
                invGrid.appendChild(row);
            });
            el.appendChild(invGrid);
        } else {
            const empty = document.createElement('div');
            empty.style.cssText = 'text-align:center;padding:14px;color:var(--c-text4);font-size:11px;background:var(--c-bg2);border-radius:10px;border:1px solid var(--c-border2);';
            empty.textContent = 'No collectibles found';
            el.appendChild(empty);
        }
        log('✓ Looked up: ' + (profile.name || target.name) + ' (ID: ' + uid + ')', 'success');
    } catch(e) { if (status) status.textContent = '✕ ' + e.message; log('Lookup failed: ' + e.message, 'err'); }
    if (btn) { btn.innerHTML = '🔍 Lookup'; btn.disabled = false; }
}
