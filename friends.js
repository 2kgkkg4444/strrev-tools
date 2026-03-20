// friends.js v33 — RAP/Value lookup
// ─── Friends ──────────────────────────────────────────────────────────────

async function lookupFriendTarget(input) {
    input = input.trim();
    const idx = selectedAcctIdx >= 0 ? selectedAcctIdx : (accounts.length > 0 ? 0 : -1);
    const safeJ = async (r) => { try { const t = await r.text(); return JSON.parse(t); } catch(_) { return {}; } };
    let r;
    if (/^\d+$/.test(input)) {
        r = idx >= 0
            ? await acctFetch(idx, BASE+'/apisite/users/v1/users/'+input)
            : await sessFetch(BASE+'/apisite/users/v1/users/'+input);
        if (!r.ok) throw new Error('User ID '+input+' not found');
        const j = await safeJ(r); return { id: String(j.id), name: j.name||j.displayName||'User '+input };
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
    const j = await safeJ(r);
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

        const safeJson = async (r) => { try { const t = await r.text(); return JSON.parse(t); } catch(_) { return {}; } };

        // Fetch all data in parallel
        const [profileR, leaderboardR, friendsR, thumbR, memberR, presenceR] = await Promise.all([
            sessFetch(BASE + '/apisite/users/v1/users/' + uid),
            sessFetch(BASE + '/internal/leaderboard?sort=rap'),
            sessFetch(BASE + '/apisite/friends/v1/users/' + uid + '/friends'),
            sessFetch(BASE + '/apisite/thumbnails/v1/users/avatar-headshot?userIds=' + uid + '&size=150x150&format=Png&isCircular=false'),
            sessFetch(BASE + '/apisite/premiumfeatures/v1/users/' + uid + '/validate-membership'),
            sessFetch(BASE + '/apisite/presence/v1/presence/users', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: [String(uid)] }),
            }),
        ]);

        const profile    = profileR.ok   ? await safeJson(profileR)   : {};
        const thumb      = thumbR.ok     ? await safeJson(thumbR)      : {};
        const friendsJ   = friendsR.ok   ? await safeJson(friendsR)    : {};
        const presenceJ  = presenceR.ok  ? await safeJson(presenceR)   : {};

        // Leaderboard — scrape HTML, extract actual rank from DOM not array index
        let lbData = [];
        if (leaderboardR.ok) {
            try {
                const html = await leaderboardR.text();
                // Match each full row: rank cell + userId + name + RAP + value
                const rowPat = /<tr[^>]*lb-row[^>]*>[\s\S]*?lb-rank[^>]*>\s*(?:<span[^>]*>\s*(\d+)\s*<\/span>|(\d+))\s*[\s\S]*?collectibles\?userId=(\d+)[^>]*>\s*([^<]+)<\/a[\s\S]*?lb-val-rap[^>]*>R\$\s*([\d,]+)[\s\S]*?lb-val-value[^>]*>R\$\s*([\d,]+)[\s\S]*?<\/tr>/g;
                lbData = [...html.matchAll(rowPat)].map(m => ({
                    rank:  parseInt(m[1] || m[2]),
                    id:    m[3].trim(),
                    name:  m[4].trim(),
                    rap:   parseInt(m[5].replace(/,/g, '')),
                    value: parseInt(m[6].replace(/,/g, '')),
                }));
            } catch(_) {}
        }
        const lbEntry = lbData.find(e => String(e.id) === String(uid) || e.name === (profile.name || target.name));
        const rap    = lbEntry?.rap   ?? null;
        const value  = lbEntry?.value ?? null;
        const lbRank = lbEntry?.rank  ?? null;

        const avatar        = thumb.data?.[0]?.imageUrl || null;
        const friendsList   = friendsJ.data || [];
        const friendCount   = friendsList.length;
        const onlineFriends = friendsList.filter(f => f.isOnline).length;
        const presence      = (presenceJ.userPresences || []).find(p => String(p.userId) === String(uid)) || presenceJ.userPresences?.[0] || {};
        const presType      = presence.userPresenceType || '';
        const isOnline      = presType !== '' && presType !== 'Offline' && presType !== '0';
        const lastOnline    = presence.lastOnline || null;

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

        const el = document.getElementById('st-lookup-result');
        if (!el) return;

        const joinedYear  = profile.created ? new Date(profile.created).toLocaleDateString('en', { year:'numeric', month:'short', day:'numeric' }) : '—';
        const rapStr   = rap   != null ? 'R$' + Number(rap).toLocaleString()   : '—';
        const valueStr = value != null ? 'R$' + Number(value).toLocaleString() : '—';
        // lbRank handled inline in stats

        el.innerHTML = '';

        // Header card
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:14px;padding:16px 18px;background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:14px;margin-bottom:12px;';
        header.innerHTML = `
            <div style="width:60px;height:60px;border-radius:12px;overflow:hidden;background:var(--c-bg3);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:26px;">
                ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='👤'">` : '👤'}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                    <span style="font-size:16px;font-weight:700;color:var(--c-text0);text-decoration:none;">${profile.name || target.name}</span>
                    ${profile.displayName && profile.displayName !== profile.name ? `<span style="font-size:11px;color:var(--c-text4);">(${profile.displayName})</span>` : ''}
                    <span style="font-size:9px;padding:2px 7px;border-radius:20px;font-weight:700;background:${mc.bg};border:1px solid ${mc.border};color:${mc.text};">${mc.label}</span>
                </div>
                <div style="font-size:11px;color:${isOnline ? '#22c55e' : '#475569'};margin-bottom:2px;display:flex;align-items:center;gap:8px;">
                    <span>${isOnline ? '🟢 Online' : lastOnline ? '⚫ Last seen ' + new Date(lastOnline).toLocaleDateString('en',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '⚫ Offline'}</span>
                    ${onlineFriends > 0 ? '<span style="font-size:10px;color:#22c55e;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);padding:1px 7px;border-radius:20px;">🟢 ' + onlineFriends + ' friend' + (onlineFriends > 1 ? 's' : '') + ' online</span>' : ''}
                </div>
                <div style="font-size:10px;color:var(--c-text4);">ID: ${uid} · Joined ${joinedYear}</div>
            </div>`;
        el.appendChild(header);

        // Stats row — 4 cards
        const stats = document.createElement('div');
        stats.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px;';
        [
            { label:'RAP',        value: rapStr,                                              color:'#f97316' },
            { label:'Value',      value: valueStr,                                            color:'#a855f7' },
            { label:'LB Rank',    value: lbRank != null ? '#' + lbRank : 'Unranked',          color: lbRank != null ? '#eab308' : 'var(--c-text4)' },
            { label:'Friends',    value: friendCount > 0 ? String(friendCount) : '0',         color:'#60a5fa' },

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
            desc.style.cssText = 'background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:10px;padding:12px 14px;margin-bottom:12px;font-size:11px;color:var(--c-text2);line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:70px;overflow-y:auto;';
            desc.textContent = profile.description;
            el.appendChild(desc);
        }

        // Inventory — fetch ALL pages then display
        if (status) status.textContent = 'Loading full inventory…';
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
                const isTix = item.priceTickets > 0;
                const price = item.recentAveragePrice || item.price || 0;
                const priceStr = price > 0 ? (isTix ? 'T$' : 'R$') + Number(price).toLocaleString() : '';
                const rapItemStr = item.recentAveragePrice ? 'RAP: R$' + Number(item.recentAveragePrice).toLocaleString() : '';
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:7px 11px;background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:8px;';
                row.innerHTML = `
                    <span style="font-size:11px;color:var(--c-text1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;">${item.name || 'Item #' + item.assetId}</span>
                    <div style="display:flex;gap:8px;flex-shrink:0;margin-left:8px;">
                        ${rapItemStr ? `<span style="font-size:10px;color:#f97316;font-family:'Fira Code',monospace;">${rapItemStr}</span>` : ''}
                        ${priceStr   ? `<span style="font-size:10px;color:#eab308;font-family:'Fira Code',monospace;">${priceStr}</span>`   : ''}
                    </div>`;
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

    } catch(e) {
        if (status) status.textContent = '✕ ' + e.message;
        log('Lookup failed: ' + e.message, 'err');
    }

    if (btn) { btn.innerHTML = '🔍 Lookup'; btn.disabled = false; }
}
