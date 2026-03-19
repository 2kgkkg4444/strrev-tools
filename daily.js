// ─── Daily Chest ──────────────────────────────────────────────────────────

let dailyAutoEnabled = false;
let dailyAutoTimeout = null;   // setTimeout handle for the next claim
let dailyNextClaimAt = null;   // timestamp (ms) of next scheduled claim
let dailyCountdownInterval = null;

const DAILY_STATUS_URL = BASE + '/api/daily-case/status'; // GET — returns {canOpen, cooldownSeconds}
const DAILY_OPEN_URL   = BASE + '/api/daily-case/open';

// ─── Check cooldown status for one account ────────────────────────────────
async function fetchDailyStatus(acctIdx) {
    try {
        const r = acctIdx >= 0
            ? await acctFetch(acctIdx, DAILY_STATUS_URL)
            : await sessFetch(DAILY_STATUS_URL);
        const j = await r.json();
        // {canOpen: bool, cooldownSeconds: number}
        return { canOpen: j.canOpen ?? true, cooldownSeconds: j.cooldownSeconds ?? 0 };
    } catch(_) {
        return { canOpen: true, cooldownSeconds: 0 };
    }
}

// ─── Claim for one account ────────────────────────────────────────────────
async function claimDailyFrom(acctIdx) {
    const label = acctIdx === -1 ? 'Session' : (accounts[acctIdx]?.username || 'Account');
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, DAILY_OPEN_URL, { method: 'POST', body: '{}' });
        } else {
            await fetchSessionCsrf();
            res = await sessFetch(DAILY_OPEN_URL, {
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
            log('~ Daily already claimed (' + label + ')', 'warn');
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

function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

function updateDailyCountdownUI() {
    const el = document.getElementById('st-daily-countdown'); if (!el) return;
    if (!dailyAutoEnabled || !dailyNextClaimAt) { el.textContent = ''; return; }
    const remaining = dailyNextClaimAt - Date.now();
    if (remaining <= 0) { el.textContent = 'Claiming now…'; return; }
    el.textContent = 'Next claim in ' + formatCountdown(remaining);
}

function updateDailyToggleUI() {
    const track = document.getElementById('st-daily-toggle-track');
    const thumb = document.getElementById('st-daily-toggle-thumb');
    const label = document.getElementById('st-daily-toggle-label');
    if (track) track.style.background = dailyAutoEnabled ? 'var(--c-success)' : 'var(--c-border)';
    if (thumb) thumb.style.transform  = dailyAutoEnabled ? 'translateX(20px)' : 'translateX(0)';
    if (label) {
        label.textContent = dailyAutoEnabled ? 'Auto-Claim ON' : 'Auto-Claim OFF';
        label.style.color = dailyAutoEnabled ? 'var(--c-success)' : 'var(--c-text3)';
    }
}

// ─── Auto-claim engine ────────────────────────────────────────────────────
function stopDailyAuto() {
    dailyAutoEnabled = false;
    dailyNextClaimAt = null;
    if (dailyAutoTimeout)        { clearTimeout(dailyAutoTimeout);          dailyAutoTimeout = null; }
    if (dailyCountdownInterval)  { clearInterval(dailyCountdownInterval);   dailyCountdownInterval = null; }
    updateDailyToggleUI();
    updateDailyCountdownUI();
    setDailyStatus('Auto-claim stopped', 'var(--c-warn)');
    log('Auto-claim disabled', 'warn');
}

// Checks the cooldown via API and schedules the claim accordingly
async function scheduleNextDailyClaim() {
    if (!dailyAutoEnabled) return;

    setDailyStatus('Checking cooldown…', 'var(--c-text3)');

    // Use first account or session to check cooldown
    const checkIdx = selectedAcctIdx === -2
        ? (accounts.length > 0 ? 0 : -1)
        : selectedAcctIdx;

    const status = await fetchDailyStatus(checkIdx);

    if (!dailyAutoEnabled) return; // may have been disabled while awaiting

    if (status.canOpen) {
        // Ready now — claim immediately
        log('Auto-claim: chest is ready, claiming now…', 'info');
        setDailyStatus('Chest ready — claiming…', 'var(--c-warn)');
        await runAutoClaim();
    } else {
        // Not ready — wait exactly cooldownSeconds
        const waitMs = (status.cooldownSeconds + 5) * 1000; // +5s buffer
        dailyNextClaimAt = Date.now() + waitMs;
        log('Auto-claim: cooldown is ' + formatCountdown(waitMs) + ' — scheduled', 'info');
        setDailyStatus('⏳ Waiting for cooldown…', 'var(--c-text3)');

        dailyAutoTimeout = setTimeout(async () => {
            if (!dailyAutoEnabled) return;
            await runAutoClaim();
        }, waitMs);
    }
}

async function runAutoClaim() {
    if (!dailyAutoEnabled) return;

    dailyNextClaimAt = null;
    updateDailyCountdownUI();
    setDailyStatus('Claiming…', 'var(--c-warn)');

    // Run the actual claim
    await claimDailyChest(true);

    if (!dailyAutoEnabled) return;

    // After claiming, re-check the API to get the new cooldown and reschedule
    await scheduleNextDailyClaim();
}

function startDailyAuto() {
    if (dailyAutoEnabled) { stopDailyAuto(); return; }
    dailyAutoEnabled = true;
    updateDailyToggleUI();
    log('Auto-claim enabled', 'success');

    // Start 1-second countdown ticker
    dailyCountdownInterval = setInterval(updateDailyCountdownUI, 1000);

    // Check cooldown and schedule
    scheduleNextDailyClaim();
}

function toggleDailyAuto() {
    dailyAutoEnabled ? stopDailyAuto() : startDailyAuto();
}

// ─── Manual + shared claim dispatcher ────────────────────────────────────
async function claimDailyChest(silent) {
    const btn = document.getElementById('st-daily-btn');
    if (!silent) {
        if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Claiming...'; btn.disabled = true; }
        setDailyStatus('', '');
        const resultsEl = document.getElementById('st-daily-results');
        if (resultsEl) resultsEl.innerHTML = '';
    }

    let results    = [];
    let acctLabels = [];

    if (selectedAcctIdx === -2) {
        if (!accounts.length) {
            setDailyStatus('✕ No accounts saved', 'var(--c-err)');
            if (!silent && btn) { btn.innerHTML = '🎁 Claim Now'; btn.disabled = false; }
            return;
        }
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
    const parts   = [];
    if (claimed) parts.push(claimed + ' claimed');
    if (skipped) parts.push(skipped + ' already claimed');
    if (failed)  parts.push(failed  + ' failed');
    const allBad  = claimed === 0 && skipped === 0;

    if (!dailyAutoEnabled) {
        setDailyStatus(
            (allBad ? '✕ ' : '✓ ') + parts.join(' · ') + (total > 1 ? ' (' + total + ' accounts)' : ''),
            allBad ? 'var(--c-err)' : claimed > 0 ? 'var(--c-success)' : 'var(--c-warn)'
        );
    }

    if (!silent && btn) {
        if (!allBad) {
            btn.innerHTML        = '✓ Done!';
            btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
            setTimeout(() => { if (btn) { btn.innerHTML='🎁 Claim Now'; btn.style.background=''; btn.disabled=false; } }, 2500);
        } else {
            btn.innerHTML = '🎁 Claim Now';
            btn.disabled  = false;
        }
    }
}

// ─── Promo Codes ──────────────────────────────────────────────────────────

// The endpoint is a standard ASP.NET form POST — it needs the
// __RequestVerificationToken scraped from the page's hidden input.
async function fetchVerificationToken(acctIdx) {
    try {
        // Fetch the promo page to extract the anti-forgery token
        const r = acctIdx >= 0
            ? await acctFetch(acctIdx, BASE + '/internal/promocodes')
            : await sessFetch(BASE + '/internal/promocodes');
        const html = await r.text();
        const match = html.match(/name="__RequestVerificationToken"\s+type="hidden"\s+value="([^"]+)"/);
        if (match) return match[1];
        // Also try the other attribute order
        const match2 = html.match(/__RequestVerificationToken[^>]+value="([^"]+)"/);
        return match2 ? match2[1] : null;
    } catch(_) { return null; }
}

async function redeemPromoFrom(acctIdx, code) {
    const label = acctIdx === -1 ? 'Session' : (accounts[acctIdx]?.username || 'Account');
    try {
        const token = await fetchVerificationToken(acctIdx);
        if (!token) {
            log('✗ Could not fetch verification token (' + label + ')', 'err');
            return { ok: false, msg: 'No verification token' };
        }

        const body = new URLSearchParams();
        body.set('promocode', code.trim());
        body.set('__RequestVerificationToken', token);

        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, BASE + '/internal/promocodes', {
                method:  'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body:    body.toString(),
            });
        } else {
            await fetchSessionCsrf();
            res = await sessFetch(BASE + '/internal/promocodes', {
                method:      'POST',
                credentials: 'include',
                headers: {
                    'Content-Type':  'application/x-www-form-urlencoded',
                    'x-csrf-token':  sessionCsrf,
                },
                body: body.toString(),
            });
        }

        // Response may be a redirect or JSON depending on the server
        let msg = '';
        const ct = res.headers?.get ? res.headers.get('content-type') : '';
        if (ct && ct.includes('application/json')) {
            let d = {};
            try { d = await res.json(); } catch(_) {}
            if (d.success || res.ok) {
                log('✓ Promo redeemed (' + label + '): ' + code, 'success');
                return { ok: true };
            }
            msg = d.message || d.errorMessage || d.errors?.[0]?.message || 'HTTP ' + res.status;
        } else {
            // HTML response — check for success/error strings in the body
            const html = await res.text();
            if (res.ok && !html.toLowerCase().includes('invalid') && !html.toLowerCase().includes('error')) {
                log('✓ Promo redeemed (' + label + '): ' + code, 'success');
                return { ok: true };
            }
            const errMatch = html.match(/class="[^"]*error[^"]*"[^>]*>([^<]+)</i);
            msg = errMatch ? errMatch[1].trim() : ('HTTP ' + res.status);
        }

        log('✗ Promo failed (' + label + '): ' + msg, 'err');
        return { ok: false, msg };
    } catch(e) {
        log('✗ Promo error (' + label + '): ' + e.message, 'err');
        return { ok: false, msg: e.message };
    }
}

function setPromoStatus(msg, color) {
    const el = document.getElementById('st-promo-status'); if (!el) return;
    el.style.display     = msg ? 'block' : 'none';
    el.style.color       = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)';
    el.style.background  = color ? color + '0d' : 'var(--c-bg0)';
    el.textContent       = msg;
}

async function redeemPromoCode() {
    const code = document.getElementById('st-promo-input')?.value?.trim();
    if (!code) { setPromoStatus('⚠ Enter a promo code', 'var(--c-warn)'); return; }

    const btn = document.getElementById('st-promo-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Redeeming...'; btn.disabled = true; }
    setPromoStatus('Redeeming...', 'var(--c-warn)');

    let results    = [];
    let acctLabels = [];

    if (selectedAcctIdx === -2) {
        if (!accounts.length) {
            setPromoStatus('✕ No accounts saved', 'var(--c-err)');
            if (btn) { btn.innerHTML = '🎟️ Redeem'; btn.disabled = false; }
            return;
        }
        for (let i = 0; i < accounts.length; i++) {
            results.push(await redeemPromoFrom(i, code));
            acctLabels.push(accounts[i]?.username || 'Account ' + i);
        }
    } else if (selectedAcctIdx === -1) {
        results    = [await redeemPromoFrom(-1, code)];
        acctLabels = ['Session'];
    } else {
        results    = [await redeemPromoFrom(selectedAcctIdx, code)];
        acctLabels = [accounts[selectedAcctIdx]?.username || 'Account'];
    }

    const ok     = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    const total  = results.length;

    if (ok > 0) {
        setPromoStatus('✓ Redeemed "' + code + '" on ' + ok + '/' + total + ' account' + (total > 1 ? 's' : ''), 'var(--c-success)');
        if (btn) {
            btn.innerHTML        = '✓ Redeemed!';
            btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
            setTimeout(() => {
                if (btn) { btn.innerHTML = '🎟️ Redeem'; btn.style.background = ''; btn.disabled = false; }
            }, 2500);
        }
    } else {
        const firstErr = results.find(r => !r.ok)?.msg || 'Failed';
        setPromoStatus('✕ ' + firstErr, 'var(--c-err)');
        if (btn) { btn.innerHTML = '🎟️ Redeem'; btn.disabled = false; }
    }
}
