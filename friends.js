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

    // Flatten into task list
    const tasks = [];
    for (const idx of senders) for (let n = 0; n < count; n++) tasks.push(idx);
    const total = tasks.length;

    let sent = 0, failed = 0;
    setMsgStatus('Sending 0/'+total+'...', 'var(--c-warn)');

    // Send up to 5 at a time
    let taskIdx = 0;
    async function runWorker() {
        while (taskIdx < tasks.length) {
            const idx = tasks[taskIdx++];
            const r = await sendMessageFrom(idx, target.id, subject, body);
            if (r.ok) sent++; else failed++;
            setMsgStatus('Sending '+(sent+failed)+'/'+total+' — '+sent+' sent, '+failed+' failed...', 'var(--c-warn)');
        }
    }
    await Promise.all(Array.from({ length: Math.min(5, total) }, runWorker));

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
