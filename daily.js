// ─── Daily Chest ──────────────────────────────────────────────────────────

async function claimDailyFrom(acctIdx) {
    const label = acctIdx === -1 ? 'session' : accounts[acctIdx].username;
    const url   = BASE + '/api/daily-case/open';
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, url, { method: 'POST', body: '{}' });
        } else {
            await fetchSessionCsrf();
            res = await sessFetch(url, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': sessionCsrf },
                body: '{}',
            });
        }
        let d = {};
        try { d = await res.json(); } catch(_) {}

        if (res.ok && d.success) {
            const reward = (d.currencyType || '') + ' +' + (d.amount || '?');
            log('✓ Daily claimed as ' + label + ' — ' + reward, 'success');
            return { ok: true, reward };
        }

        // Already claimed today
        const msg = d.message || d.errorMessage || d.errors?.[0]?.message || 'HTTP ' + res.status;
        const already = msg.toLowerCase().includes('already') || res.status === 429 || res.status === 400;
        if (already) {
            log('~ Daily already claimed today (' + label + ')', 'warn');
            return { ok: true, skipped: true, reward: 'Already claimed' };
        }

        log('✗ Daily failed (' + label + '): ' + msg, 'err');
        return { ok: false, msg };
    } catch(e) {
        log('✗ Daily error (' + label + '): ' + e.message, 'err');
        return { ok: false, msg: e.message };
    }
}

function setDailyStatus(msg, color) {
    const el = document.getElementById('st-daily-status'); if (!el) return;
    el.style.display     = msg ? 'block' : 'none';
    el.style.color       = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)';
    el.style.background  = color ? color + '0d' : 'var(--c-bg0)';
    el.innerHTML         = msg;
}

function renderDailyResults(results, accounts) {
    const el = document.getElementById('st-daily-results'); if (!el) return;
    el.innerHTML = '';
    results.forEach((r, i) => {
        const label  = i === -1 ? 'Session' : (accounts[i]?.username || 'Account ' + i);
        const row    = document.createElement('div');
        const isGood = r.ok && !r.skipped;
        const isSkip = r.skipped;
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:8px;margin-bottom:5px;background:var(--c-bg2);border:1px solid var(--c-border2);';
        row.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${isGood?'var(--c-success)':isSkip?'var(--c-warn)':'var(--c-err)'};"></div>
                <span style="font-size:11px;font-weight:600;color:var(--c-text1);">${label}</span>
            </div>
            <span style="font-size:11px;font-family:'Fira Code',monospace;color:${isGood?'var(--c-success)':isSkip?'var(--c-warn)':'var(--c-err)'};">${r.reward||r.msg||'Failed'}</span>
        `;
        el.appendChild(row);
    });
}

async function claimDailyChest() {
    const btn = document.getElementById('st-daily-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Claiming...'; btn.disabled = true; }
    setDailyStatus('', '');
    const resultsEl = document.getElementById('st-daily-results');
    if (resultsEl) resultsEl.innerHTML = '';

    let results  = [];
    let acctsMap = []; // parallel array so we know which account each result belongs to

    if (selectedAcctIdx === -2) {
        if (!accounts.length) {
            setDailyStatus('✕ No accounts saved', 'var(--c-err)');
            if (btn) { btn.innerHTML = '🎁 Claim Daily Chest'; btn.disabled = false; }
            return;
        }
        setDailyStatus('Claiming for ' + accounts.length + ' account(s)...', 'var(--c-warn)');
        for (let i = 0; i < accounts.length; i++) {
            results.push(await claimDailyFrom(i));
            acctsMap.push(i);
        }
    } else if (selectedAcctIdx === -1) {
        results  = [await claimDailyFrom(-1)];
        acctsMap = [-1];
    } else {
        results  = [await claimDailyFrom(selectedAcctIdx)];
        acctsMap = [selectedAcctIdx];
    }

    // Map results back using acctsMap so renderDailyResults gets right labels
    const labelledResults = results.map((r, idx) => ({ ...r, _idx: acctsMap[idx] }));
    const labelledAccts   = acctsMap.map(i => i === -1 ? { username: 'Session' } : accounts[i]);

    renderDailyResults(labelledResults, labelledAccts);

    const claimed = results.filter(r => r.ok && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed  = results.filter(r => !r.ok).length;
    const total   = results.length;

    const parts = [];
    if (claimed) parts.push(claimed + ' claimed');
    if (skipped) parts.push(skipped + ' already claimed');
    if (failed)  parts.push(failed  + ' failed');

    const allBad = claimed === 0 && skipped === 0;
    setDailyStatus(
        (allBad ? '✕ ' : '✓ ') + parts.join(' · ') + (total > 1 ? ' (' + total + ' accounts)' : ''),
        allBad ? 'var(--c-err)' : claimed > 0 ? 'var(--c-success)' : 'var(--c-warn)'
    );

    if (btn) {
        if (!allBad) {
            btn.innerHTML        = '✓ Done!';
            btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
            setTimeout(() => {
                if (btn) { btn.innerHTML = '🎁 Claim Daily Chest'; btn.style.background = ''; btn.disabled = false; }
            }, 2500);
        } else {
            btn.innerHTML = '🎁 Claim Daily Chest';
            btn.disabled  = false;
        }
    }
}
