// ─── Daily Chest ──────────────────────────────────────────────────────────

let dailyAutoEnabled  = false;
let dailyAutoTimer    = null;  // setInterval handle for the countdown tick
let dailyNextClaimAt  = null;  // Date when next auto-claim fires
const DAILY_COOLDOWN  = 24 * 60 * 60 * 1000; // 24 hours in ms

// ─── Core claim logic ─────────────────────────────────────────────────────
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

        const msg     = d.message || d.errorMessage || d.errors?.[0]?.message || 'HTTP ' + res.status;
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

// ─── UI helpers ───────────────────────────────────────────────────────────
function setDailyStatus(msg, color) {
    const el = document.getElementById('st-daily-status'); if (!el) return;
    el.style.display     = msg ? 'block' : 'none';
    el.style.color       = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)';
    el.style.background  = color ? color + '0d' : 'var(--c-bg0)';
    el.innerHTML         = msg;
}

function renderDailyResults(results, acctLabels) {
    const el = document.getElementById('st-daily-results'); if (!el) return;
    el.innerHTML = '';
    results.forEach((r, i) => {
        const label  = acctLabels[i] || 'Account';
        const isGood = r.ok && !r.skipped;
        const isSkip = r.skipped;
        const row    = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:8px;margin-bottom:5px;background:var(--c-bg2);border:1px solid var(--c-border2);';
        row.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${isGood?'var(--c-success)':isSkip?'var(--c-warn)':'var(--c-err)'};"></div>
                <span style="font-size:11px;font-weight:600;color:var(--c-text1);">${label}</span>
            </div>
            <span style="font-size:11px;font-family:'Fira Code',monospace;color:${isGood?'var(--c-success)':isSkip?'var(--c-warn)':'var(--c-err)'}">${r.reward||r.msg||'Failed'}</span>
        `;
        el.appendChild(row);
    });
}

function updateAutoCountdown() {
    const el = document.getElementById('st-daily-countdown'); if (!el) return;
    if (!dailyAutoEnabled || !dailyNextClaimAt) { el.textContent = ''; return; }
    const remaining = dailyNextClaimAt - Date.now();
    if (remaining <= 0) { el.textContent = 'Claiming now…'; return; }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.textContent = 'Next claim in: ' +
        String(h).padStart(2,'0') + ':' +
        String(m).padStart(2,'0') + ':' +
        String(s).padStart(2,'0');
}

function updateAutoToggleBtn() {
    const btn = document.getElementById('st-daily-auto-btn'); if (!btn) return;
    if (dailyAutoEnabled) {
        btn.textContent      = '⏹ Stop Auto-Claim';
        btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
        btn.style.boxShadow  = '0 0 18px rgba(34,197,94,0.25)';
    } else {
        btn.textContent      = '🔁 Start Auto-Claim';
        btn.style.background = '';
        btn.style.boxShadow  = '';
    }
}

// ─── Auto-claim loop ──────────────────────────────────────────────────────
function stopDailyAuto() {
    dailyAutoEnabled = false;
    dailyNextClaimAt = null;
    if (dailyAutoTimer) { clearInterval(dailyAutoTimer); dailyAutoTimer = null; }
    updateAutoToggleBtn();
    updateAutoCountdown();
    log('Auto-claim stopped', 'warn');
    setDailyStatus('Auto-claim stopped', 'var(--c-warn)');
}

async function runDailyAutoClaim() {
    if (!dailyAutoEnabled) return;
    log('Auto-claim firing…', 'info');
    await claimDailyChest(true); // silent = true, don't reset the auto timer inside
    if (!dailyAutoEnabled) return;
    // Schedule next claim in 24 hours
    dailyNextClaimAt = Date.now() + DAILY_COOLDOWN;
    log('Auto-claim: next run in 24 hours', 'info');
    setDailyStatus('✓ Auto-claim active — next in 24h', 'var(--c-success)');
}

function startDailyAuto() {
    if (dailyAutoEnabled) { stopDailyAuto(); return; }
    dailyAutoEnabled = true;
    updateAutoToggleBtn();
    log('Auto-claim started', 'success');

    // Claim immediately, then every 24h
    runDailyAutoClaim();

    // Countdown tick every second
    dailyAutoTimer = setInterval(() => {
        updateAutoCountdown();
        // Fire when countdown hits zero
        if (dailyNextClaimAt && Date.now() >= dailyNextClaimAt) {
            dailyNextClaimAt = null; // prevent double-fire
            runDailyAutoClaim();
        }
    }, 1000);
}

// ─── Manual / shared claim dispatcher ────────────────────────────────────
// silent = true when called from auto-claim (skips button state changes)
async function claimDailyChest(silent) {
    const btn = document.getElementById('st-daily-btn');
    if (!silent) {
        if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Claiming...'; btn.disabled = true; }
        setDailyStatus('', '');
        const resultsEl = document.getElementById('st-daily-results');
        if (resultsEl) resultsEl.innerHTML = '';
    }

    let results   = [];
    let acctLabels = [];

    if (selectedAcctIdx === -2) {
        if (!accounts.length) {
            setDailyStatus('✕ No accounts saved', 'var(--c-err)');
            if (!silent && btn) { btn.innerHTML = '🎁 Claim Daily Chest'; btn.disabled = false; }
            return;
        }
        if (!silent) setDailyStatus('Claiming for ' + accounts.length + ' account(s)...', 'var(--c-warn)');
        for (let i = 0; i < accounts.length; i++) {
            results.push(await claimDailyFrom(i));
            acctLabels.push(accounts[i]?.username || 'Account ' + i);
        }
    } else if (selectedAcctIdx === -1) {
        results    = [await claimDailyFrom(-1)];
        acctLabels = ['Session'];
    } else {
        results    = [await claimDailyFrom(selectedAcctIdx)];
        acctLabels = [accounts[selectedAcctIdx]?.username || 'Account'];
    }

    renderDailyResults(results, acctLabels);

    const claimed = results.filter(r => r.ok && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed  = results.filter(r => !r.ok).length;
    const total   = results.length;

    const parts = [];
    if (claimed) parts.push(claimed + ' claimed');
    if (skipped) parts.push(skipped + ' already claimed');
    if (failed)  parts.push(failed  + ' failed');

    const allBad = claimed === 0 && skipped === 0;

    if (!dailyAutoEnabled) {
        // Only update status bar if auto isn't managing it
        setDailyStatus(
            (allBad ? '✕ ' : '✓ ') + parts.join(' · ') + (total > 1 ? ' (' + total + ' accounts)' : ''),
            allBad ? 'var(--c-err)' : claimed > 0 ? 'var(--c-success)' : 'var(--c-warn)'
        );
    }

    if (!silent && btn) {
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
