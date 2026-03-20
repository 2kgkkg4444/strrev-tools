// ─── Friends ──────────────────────────────────────────────────────────────

async function lookupFriendTarget(input) {
    input = input.trim();
    const idx = selectedAcctIdx >= 0 ? selectedAcctIdx : (accounts.length > 0 ? 0 : -1);
    let r;
    if (/^\d+$/.test(input)) {
        r = idx >= 0
            ? await acctFetch(idx, BASE+'/apisite/users/v1/users/'+input)
            : await sessFetch(BASE+'/apisite/users/v1/users/'+input);
        if (!r.ok) throw new Error('User ID '+input+' not found');
        const j = await r.json(); return { id: String(j.id), name: j.name||j.displayName||'User '+input };
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
    return { id: String(u.id), name: u.name };
}

async function sendFriendRequestFrom(acctIdx, targetId, targetName) {
    const label = acctIdx === -1 ? 'session' : accounts[acctIdx].username;
    const url   = BASE+'/apisite/friends/v1/users/'+targetId+'/request-friendship';
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, url, { method:'POST', body:'{}' });
        } else {
            await fetchSessionCsrf();
            res = await sessFetch(url, {
                method:'POST', credentials:'include',
                headers:{'Content-Type':'application/json','x-csrf-token':sessionCsrf},
                body:'{}',
            });
        }
        if (res.ok) {
            log('✓ Friend request sent to '+targetName+' as '+label, 'success');
            return { ok:true };
        }
        let msg = 'HTTP '+res.status;
        try { const d = await res.json(); msg = d.errors?.[0]?.message||d.errorMessage||msg; } catch(_){}
        // Already friends / request already sent — treat as soft success
        if (msg.toLowerCase().includes('already') || res.status === 400) {
            log('~ Already friends/pending for '+label, 'warn');
            return { ok:true, skipped:true };
        }
        log('✗ Friend request failed ('+label+'): '+msg, 'err');
        return { ok:false, msg };
    } catch(e) {
        log('✗ Friend request error ('+label+'): '+e.message, 'err');
        return { ok:false, msg:e.message };
    }
}

function setFriendStatus(msg, color) {
    const el = document.getElementById('st-friend-status'); if (!el) return;
    el.style.display     = msg ? 'block' : 'none';
    el.style.color       = color || 'var(--c-text2)';
    el.style.borderColor = color ? color+'44' : 'var(--c-border2)';
    el.style.background  = color ? color+'0d' : 'var(--c-bg0)';
    el.textContent       = msg;
}

async function sendFriendRequests() {
    const input = document.getElementById('st-friend-input')?.value?.trim();
    if (!input) return;

    const btn = document.getElementById('st-friend-btn');
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span> Sending...'; btn.disabled=true; }
    setFriendStatus('Looking up user...', 'var(--c-warn)');

    let target;
    try {
        target = await lookupFriendTarget(input);
    } catch(e) {
        setFriendStatus('✕ '+e.message, 'var(--c-err)');
        log('Friend lookup failed: '+e.message, 'err');
        if (btn) { btn.innerHTML='👤 Send Friend Request'; btn.disabled=false; }
        return;
    }

    log('Sending friend request to '+target.name+' ('+target.id+')...', 'info');

    let results = [];

    if (selectedAcctIdx === -2) {
        if (!accounts.length) {
            setFriendStatus('✕ No accounts saved', 'var(--c-err)');
            if (btn) { btn.innerHTML='👤 Send Friend Request'; btn.disabled=false; }
            return;
        }
        setFriendStatus('Sending from '+accounts.length+' account(s)...', 'var(--c-warn)');
        // Sequential to be safe with CSRF rotation
        for (let i = 0; i < accounts.length; i++) {
            results.push(await sendFriendRequestFrom(i, target.id, target.name));
        }
    } else if (selectedAcctIdx === -1) {
        results = [await sendFriendRequestFrom(-1, target.id, target.name)];
    } else {
        results = [await sendFriendRequestFrom(selectedAcctIdx, target.id, target.name)];
    }

    const sent    = results.filter(r => r.ok && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed  = results.filter(r => !r.ok).length;
    const total   = results.length;

    let statusMsg = '';
    let statusCol = '';
    if (sent > 0 || skipped > 0) {
        const parts = [];
        if (sent)    parts.push(sent+' sent');
        if (skipped) parts.push(skipped+' already friends/pending');
        if (failed)  parts.push(failed+' failed');
        statusMsg = '✓ '+target.name+' — '+parts.join(', ')+' ('+total+' account'+(total>1?'s':'')+')';
        statusCol = failed > 0 ? 'var(--c-warn)' : 'var(--c-success)';
    } else {
        statusMsg = '✕ All requests failed — check the activity log';
        statusCol = 'var(--c-err)';
    }

    setFriendStatus(statusMsg, statusCol);
    if (btn) {
        if (sent > 0 || skipped > 0) {
            btn.innerHTML        = '✓ Sent!';
            btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
            setTimeout(() => {
                if (btn) { btn.innerHTML='👤 Send Friend Request'; btn.style.background=''; btn.disabled=false; }
            }, 2500);
        } else {
            btn.innerHTML = '👤 Send Friend Request';
            btn.disabled  = false;
        }
    }
}

// ─── Messaging ────────────────────────────────────────────────────────────

async function sendMessageFrom(acctIdx, recipientId, subject, body) {
    const label   = acctIdx === -1 ? 'session' : accounts[acctIdx].username;
    const payload = JSON.stringify({ recipientId: parseInt(recipientId), subject, body });
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, BASE+'/apisite/privatemessages/v1/messages/send', {
                method: 'POST', body: payload,
            });
        } else {
            await fetchSessionCsrf();
            res = await sessFetch(BASE+'/apisite/privatemessages/v1/messages/send', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type':'application/json', 'x-csrf-token': sessionCsrf },
                body: payload,
            });
        }
        if (res.ok) {
            log('✓ Message sent to '+recipientId+' as '+label, 'success');
            return { ok: true };
        }
        let msg = 'HTTP '+res.status;
        try { const d = await res.json(); msg = d.errors?.[0]?.message||d.errorMessage||msg; } catch(_){}
        log('✗ Message failed ('+label+'): '+msg, 'err');
        return { ok: false, msg };
    } catch(e) {
        log('✗ Message error ('+label+'): '+e.message, 'err');
        return { ok: false, msg: e.message };
    }
}

function setMsgStatus(msg, color) {
    const el = document.getElementById('st-msg-status'); if (!el) return;
    el.style.display     = msg ? 'block' : 'none';
    el.style.color       = color || 'var(--c-text2)';
    el.style.borderColor = color ? color+'44' : 'var(--c-border2)';
    el.style.background  = color ? color+'0d' : 'var(--c-bg0)';
    el.textContent       = msg;
}

async function sendMessages() {
    const input   = document.getElementById('st-msg-input')?.value?.trim();
    const subject = document.getElementById('st-msg-subject')?.value?.trim();
    const body    = document.getElementById('st-msg-body')?.value?.trim();
    const count   = Math.max(1, Math.min(100, parseInt(document.getElementById('st-msg-count')?.value) || 1));

    if (!input)   { setMsgStatus('⚠ Enter a username or user ID', 'var(--c-warn)'); return; }
    if (!subject) { setMsgStatus('⚠ Enter a subject', 'var(--c-warn)'); return; }
    if (!body)    { setMsgStatus('⚠ Enter a message body', 'var(--c-warn)'); return; }

    const btn = document.getElementById('st-msg-btn');
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span> Sending...'; btn.disabled=true; }
    setMsgStatus('Looking up user...', 'var(--c-warn)');

    let target;
    try {
        target = await lookupFriendTarget(input);
    } catch(e) {
        setMsgStatus('✕ '+e.message, 'var(--c-err)');
        log('Message lookup failed: '+e.message, 'err');
        if (btn) { btn.innerHTML='✉️ Send Message'; btn.disabled=false; }
        return;
    }

    log('Sending '+count+'x message(s) to '+target.name+'...', 'info');

    // Build list of [acctIdx] to send from, then send count times each
    let senders = [];
    if (selectedAcctIdx === -2) {
        if (!accounts.length) {
            setMsgStatus('✕ No accounts saved', 'var(--c-err)');
            if (btn) { btn.innerHTML='✉️ Send Message'; btn.disabled=false; }
            return;
        }
        senders = accounts.map((_, i) => i);
    } else if (selectedAcctIdx === -1) {
        senders = [-1];
    } else {
        senders = [selectedAcctIdx];
    }

    // count = total messages to send, round-robined across all accounts simultaneously
    const total = count;
    let sent = 0, failed = 0;
    setMsgStatus('Sending 0/'+total+'...', 'var(--c-warn)');

    // Build task list: round-robin across senders for exactly count sends
    const tasks = Array.from({length: count}, (_, n) => senders[n % senders.length]);

    // All unique senders fire their tasks in parallel
    await Promise.all(senders.map(async idx => {
        const myTasks = tasks.filter(t => t === idx);
        for (let n = 0; n < myTasks.length; n++) {
            const r = await sendMessageFrom(idx, target.id, subject, body);
            if (r.ok) sent++; else failed++;
            setMsgStatus('Sending '+(sent+failed)+'/'+total+' — '+sent+' sent, '+failed+' failed...', 'var(--c-warn)');
        }
    }));

    if (sent > 0) {
        setMsgStatus('✓ Sent '+sent+'/'+total+' message'+(total>1?'s':'')+' to '+target.name, 'var(--c-success)');
        if (btn) {
            btn.innerHTML        = '✓ Sent!';
            btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
            setTimeout(() => { if (btn) { btn.innerHTML='✉️ Send Message'; btn.style.background=''; btn.disabled=false; } }, 2500);
        }
    } else {
        setMsgStatus('✕ All messages failed — check the activity log', 'var(--c-err)');
        if (btn) { btn.innerHTML='✉️ Send Message'; btn.disabled=false; }
    }
}
// ─── User Profile Lookup ──────────────────────────────────────────────────
async function lookupUser_profile() {
    const input = document.getElementById('st-lookup-input')?.value?.trim();
    if (!input) return;
    const btn = document.getElementById('st-lookup-btn');
    const res = document.getElementById('st-lookup-result');
    if (!res) return;
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span> Looking up...'; btn.disabled=true; }
    res.style.display = 'none'; res.innerHTML = '';

    try {
        const idx = selectedAcctIdx >= 0 ? selectedAcctIdx : (accounts.length > 0 ? 0 : -1);
        // Resolve user
        let userId, userName;
        if (/^\d+$/.test(input)) {
            userId = input; userName = 'User #' + input;
        } else {
            const body = JSON.stringify({ usernames:[input], excludeBannedUsers:false });
            const r = idx >= 0
                ? await acctFetch(idx, BASE+'/apisite/users/v1/usernames/users', { method:'POST', body })
                : await sessFetch(BASE+'/apisite/users/v1/usernames/users', { method:'POST', headers:{'Content-Type':'application/json','x-csrf-token':sessionCsrf}, body });
            const j = await r.json();
            const u = j.data?.[0]; if (!u) throw new Error('User not found');
            userId = u.id; userName = u.name;
        }

        // Parallel fetch everything
        const doFetch = (url) => idx >= 0
            ? acctFetch(idx, BASE + url)
            : sessFetch(BASE + url);

        const [profileR, currencyR, friendsR, inventoryR, membershipR, avatarR] = await Promise.all([
            doFetch('/apisite/users/v1/users/' + userId),
            doFetch('/apisite/economy/v1/users/' + userId + '/currency'),
            doFetch('/apisite/friends/v1/users/' + userId + '/friends/count'),
            doFetch('/apisite/inventory/v1/users/' + userId + '/assets/collectibles?limit=10'),
            doFetch('/apisite/premiumfeatures/v1/users/' + userId + '/validate-membership'),
            doFetch('/apisite/thumbnails/v1/users/avatar-headshot?userIds=' + userId + '&size=150x150&format=Png&isCircular=false'),
        ]);

        const profile   = profileR.ok   ? await profileR.json()   : {};
        const currency  = currencyR.ok  ? await currencyR.json()  : {};
        const friends   = friendsR.ok   ? await friendsR.json()   : {};
        const inventory = inventoryR.ok ? await inventoryR.json() : {};
        const membershipTier = membershipR.ok ? parseInt(await membershipR.text()) : null;
        const avatarJ   = avatarR.ok    ? await avatarR.json()    : {};
        const avatarUrl = avatarJ.data?.[0]?.imageUrl || null;

        const tierMap = { 0:'None', 1:'BC', 2:'TBC', 3:'OBC' };
        const membership = tierMap[membershipTier] ?? '—';
        const membershipColor = membershipTier === 3 ? '#fbbf24' : membershipTier === 2 ? '#a78bfa' : membershipTier === 1 ? '#60a5fa' : 'var(--c-text4)';

        const joined = profile.created ? new Date(profile.created).toLocaleDateString('en', {year:'numeric',month:'short',day:'numeric'}) : '—';
        const robux   = currency.robux   != null ? 'R$' + currency.robux.toLocaleString()   : '—';
        const tickets = currency.tickets != null ? 'T$' + currency.tickets.toLocaleString() : '—';
        const friendCount = friends.count != null ? friends.count : '—';
        const items = inventory.data || [];

        res.style.display = 'block';
        res.innerHTML = `
            <div style="display:flex;gap:16px;align-items:flex-start;">
                <div style="width:64px;height:64px;border-radius:12px;overflow:hidden;flex-shrink:0;background:var(--c-bg2);display:flex;align-items:center;justify-content:center;font-size:28px;">
                    ${avatarUrl ? `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;">` : '👤'}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:16px;font-weight:700;color:var(--c-text0);margin-bottom:2px;">${profile.displayName || userName}</div>
                    <div style="font-size:11px;color:var(--c-text4);margin-bottom:10px;">@${profile.name || userName} · ID: ${userId}</div>
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;">
                        ${[['💰 Robux',robux,'#f97316'],['🪙 Tickets',tickets,'#eab308'],['👥 Friends',friendCount,'#60a5fa'],['👑 Membership',membership,membershipColor]].map(([l,v,c])=>`
                        <div style="background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:10px;padding:10px 12px;">
                            <div style="font-size:9px;color:var(--c-text4);font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;">${l}</div>
                            <div style="font-size:13px;font-weight:700;color:${c};font-family:'Fira Code',monospace;">${v}</div>
                        </div>`).join('')}
                    </div>
                    ${profile.description ? `<div style="font-size:11px;color:var(--c-text3);padding:10px 13px;background:var(--c-bg2);border-radius:9px;border:1px solid var(--c-border2);margin-bottom:12px;line-height:1.6;max-height:60px;overflow:hidden;">${profile.description.slice(0,200)}</div>` : ''}
                    <div style="font-size:10px;color:var(--c-text4);margin-bottom:8px;">📅 Joined ${joined}</div>
                    ${items.length ? `
                    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--c-text4);margin-bottom:6px;">Recent Collectibles</div>
                    <div style="display:flex;flex-wrap:wrap;gap:5px;">
                        ${items.slice(0,8).map(item=>`<span style="font-size:10px;padding:3px 9px;border-radius:6px;background:var(--c-bg2);border:1px solid var(--c-border2);color:var(--c-text2);">${item.name||'#'+item.assetId}</span>`).join('')}
                        ${items.length > 8 ? `<span style="font-size:10px;padding:3px 9px;border-radius:6px;background:var(--c-bg2);border:1px solid var(--c-border2);color:var(--c-text4);">+${items.length-8} more</span>` : ''}
                    </div>` : ''}
                </div>
            </div>`;
        log('🔍 Looked up: ' + (profile.name || userName) + ' (ID: ' + userId + ')', 'info');
    } catch(e) {
        res.style.display = 'block';
        res.innerHTML = `<div style="color:var(--c-err);font-size:12px;">✕ ${e.message}</div>`;
        log('Lookup failed: ' + e.message, 'err');
    }
    if (btn) { btn.innerHTML='🔍 Lookup'; btn.disabled=false; }
}

// ─── User Lookup ──────────────────────────────────────────────────────────

async function lookupUserProfile() {
    const input = document.getElementById('st-lookup-input')?.value?.trim();
    if (!input) return;
    const btn    = document.getElementById('st-lookup-btn');
    const result = document.getElementById('st-lookup-result');
    const status = document.getElementById('st-lookup-status');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span>'; btn.disabled = true; }
    if (result) result.innerHTML = '';
    if (status) status.textContent = 'Looking up user…';

    try {
        // ── Resolve user ID + basic profile ───────────────────────────────
        const target = await lookupFriendTarget(input);
        const uid = target.id;
        if (status) status.textContent = 'Fetching profile data…';

        // Fetch all data in parallel — leaderboard for RAP/value, no currency
        const [profileR, leaderboardR, inventoryR, friendsR, thumbR, onlineR, memberR] = await Promise.all([
            sessFetch(BASE + '/apisite/users/v1/users/' + uid),
            sessFetch(BASE + '/internal/leaderboard?sort=rap'),
            sessFetch(BASE + '/apisite/inventory/v1/users/' + uid + '/assets/collectibles?limit=10'),
            sessFetch(BASE + '/apisite/friends/v1/users/' + uid + '/friends?limit=5'),
            sessFetch(BASE + '/apisite/thumbnails/v1/users/avatar-headshot?userIds=' + uid + '&size=150x150&format=Png&isCircular=false'),
            sessFetch(BASE + '/apisite/presence/v1/presence/users', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: [parseInt(uid)] }),
            }),
            sessFetch(BASE + '/apisite/premiumfeatures/v1/users/' + uid + '/validate-membership'),
        ]);

        const safeJson = async (r) => { try { const t = await r.text(); return JSON.parse(t); } catch(_) { return {}; } };

        const profile    = profileR.ok    ? await safeJson(profileR)   : {};
        // Leaderboard returns HTML — scrape it
        let lbData = null;
        if (leaderboardR.ok) {
            try {
                const html = await leaderboardR.text();
                const rows = [...html.matchAll(/collectibles\?userId=(\d+)[^>]*>\s*([^<]+)<\/a[\s\S]*?lb-val-rap[^>]*>R\$\s*([\d,]+)[\s\S]*?lb-val-value[^>]*>R\$\s*([\d,]+)/g)];
                lbData = rows.map((m, i) => ({
                    id:    m[1].trim(),
                    name:  m[2].trim(),
                    rap:   parseInt(m[3].replace(/,/g, '')),
                    value: parseInt(m[4].replace(/,/g, '')),
                    rank:  i + 1,
                }));
            } catch(_) { lbData = []; }
        }
        const inventory  = inventoryR.ok  ? await safeJson(inventoryR)  : {};
        const friends    = friendsR.ok    ? await safeJson(friendsR)    : {};
        const thumb      = thumbR.ok      ? await safeJson(thumbR)      : {};
        const online     = onlineR.ok     ? await safeJson(onlineR)     : {};

        // Find this user in the leaderboard by ID or name
        const lbUsers  = Array.isArray(lbData) ? lbData : [];
        const lbEntry  = lbUsers.find(u => String(u.id) === String(uid) || u.name === (profile.name || target.name));
        const rap      = lbEntry?.rap   ?? null;
        const value    = lbEntry?.value ?? null;
        const lbRank   = lbEntry?.rank  ?? null;

        const avatar     = thumb.data?.[0]?.imageUrl || null;
        const presence   = online.userPresences?.[0] || online.data?.[0] || {};
        const lastOnline = presence.lastOnline || presence.lastSeen || null;
        const isOnline   = presence.userPresenceType === 1 || presence.online === true;
        const items      = inventory.data || [];
        const friendList = friends.data || [];

        const tierMap = { 0:'None', 1:'BuildersClub', 2:'TurboBuildersClub', 3:'OutrageousBuildersClub' };
        const mColors = {
            OutrageousBuildersClub: { bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.3)', text:'#fbbf24', label:'👑 OBC' },
            TurboBuildersClub:      { bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.3)', text:'#a78bfa', label:'⚡ TBC' },
            BuildersClub:           { bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.3)', text:'#60a5fa', label:'🔨 BC'  },
            None:                   { bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.2)', text:'#64748b', label:'No BC' },
        };
        const membership = memberR.ok ? tierMap[parseInt(await memberR.text())] || 'None' : 'None';
        const mc = mColors[membership] || mColors.None;

        if (status) status.textContent = '';

        // ── Build result card ─────────────────────────────────────────────
        const el = document.getElementById('st-lookup-result');
        if (!el) return;

        const joinedYear  = profile.created ? new Date(profile.created).toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric' }) : '—';
        const onlineColor = isOnline ? '#22c55e' : '#475569';
        const onlineLabel = isOnline ? '🟢 Online' : (lastOnline ? '⚫ Last seen ' + new Date(lastOnline).toLocaleDateString() : '⚫ Offline');
        const rapStr      = rap   != null ? 'R$' + Number(rap).toLocaleString()   : '—';
        const valueStr    = value != null ? 'R$' + Number(value).toLocaleString() : '—';
        const rankStr     = lbRank != null ? '#' + lbRank : '—';

        el.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:14px;padding:16px;background:var(--c-bg2);border-radius:12px;margin-bottom:14px;';
        header.innerHTML = `
            <div style="width:56px;height:56px;border-radius:12px;overflow:hidden;background:var(--c-bg3);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:24px;">
                ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='👤'">` : '👤'}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                    <span style="font-size:16px;font-weight:700;color:var(--c-text0);">${profile.name || target.name}</span>
                    ${profile.displayName && profile.displayName !== profile.name ? `<span style="font-size:11px;color:var(--c-text4);">(${profile.displayName})</span>` : ''}
                    <span style="font-size:9px;padding:2px 7px;border-radius:20px;font-weight:700;background:${mc.bg};border:1px solid ${mc.border};color:${mc.text};">${mc.label}</span>
                </div>
                <div style="font-size:11px;color:${onlineColor};margin-bottom:3px;">${onlineLabel}</div>
                <div style="font-size:10px;color:var(--c-text4);">ID: ${uid} · Joined ${joinedYear}</div>
            </div>`;
        el.appendChild(header);

        // Stats row — RAP, Value, Friends
        const stats = document.createElement('div');
        stats.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;';
        [
            { label:'RAP',     value: rapStr,   color:'#f97316' },
            { label:'Value',   value: valueStr, color:'#a855f7' },
            { label:'LB Rank', value: rankStr,  color:'#eab308' },
            { label:'Friends', value: friendList.length > 0 ? String(friendList.length) + (friendList.length === 5 ? '+' : '') : '—', color:'#60a5fa' },
        ].forEach(({ label, value, color }) => {
            const s = document.createElement('div');
            s.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:10px;padding:12px 14px;';
            s.innerHTML = `<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.9px;color:var(--c-text4);margin-bottom:6px;">${label}</div><div style="font-size:16px;font-weight:700;font-family:'Fira Code',monospace;color:${color};">${value}</div>`;
            stats.appendChild(s);
        });
        el.appendChild(stats);

        // Description
        if (profile.description) {
            const desc = document.createElement('div');
            desc.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:11px;color:var(--c-text2);line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:80px;overflow-y:auto;';
            desc.textContent = profile.description;
            el.appendChild(desc);
        }

        // Collectibles
        if (items.length) {
            const invHdr = document.createElement('div');
            invHdr.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:8px;';
            invHdr.textContent = '💎 Collectibles';
            el.appendChild(invHdr);
            const invGrid = document.createElement('div');
            invGrid.style.cssText = 'display:flex;flex-direction:column;gap:5px;max-height:160px;overflow-y:auto;';
            items.forEach(item => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:8px;';
                row.innerHTML = `<span style="font-size:11px;color:var(--c-text1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${item.name || 'Item #' + item.assetId}</span><span style="font-size:10px;color:#f59e0b;font-family:'Fira Code',monospace;flex-shrink:0;margin-left:8px;">${item.recentAveragePrice ? 'RAP: R$' + item.recentAveragePrice.toLocaleString() : ''}</span>`;
                invGrid.appendChild(row);
            });
            el.appendChild(invGrid);
        }

        log('✓ Looked up: ' + (profile.name || target.name) + ' (ID: ' + uid + ')', 'success');

    } catch(e) {
        if (status) status.textContent = '✕ ' + e.message;
        log('Lookup failed: ' + e.message, 'err');
    }

    if (btn) { btn.innerHTML = '🔍 Lookup'; btn.disabled = false; }
}
