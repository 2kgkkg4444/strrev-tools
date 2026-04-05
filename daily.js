// ─── Daily Chest ──────────────────────────────────────────────────────────
let dailyAutoEnabled         = false;
let dailyAutoTimeout         = null;
let dailyNextClaimAt         = null;
let dailyCountdownInterval   = null;

const DAILY_STATUS_URL = BASE + '/api/daily-case/status';
const DAILY_OPEN_URL   = BASE + '/api/daily-case/open';

async function fetchDailyStatus(acctIdx) {
    try {
        const r = acctIdx >= 0 ? await acctFetch(acctIdx, DAILY_STATUS_URL) : await sessFetch(DAILY_STATUS_URL);
        const j = await r.json();
        return { canOpen: j.canOpen ?? true, cooldownSeconds: j.cooldownSeconds ?? 0 };
    } catch(_) { return { canOpen: true, cooldownSeconds: 0 }; }
}

async function claimDailyFrom(acctIdx) {
    const label = acctIdx === -1 ? 'Session' : (accounts[acctIdx]?.username || 'Account');
    try {
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, DAILY_OPEN_URL, { method: 'POST', body: '{}' });
        } else {
            const csrf = await refreshSessionCsrf();
            res = await sessFetch(DAILY_OPEN_URL, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
                body: '{}',
            });
        }
        let d = {}; try { d = await res.json(); } catch(_) {}
        if (res.ok && d.success) {
            const reward = (d.currencyType || '') + ' +' + (d.amount || '?');
            log('✓ Daily claimed as ' + label + ' — ' + reward, 'success');
            return { ok: true, reward };
        }
        const msg     = d.message || d.errorMessage || d.errors?.[0]?.message || 'HTTP ' + res.status;
        const already = msg.toLowerCase().includes('already') || res.status === 429 || res.status === 400;
        if (already) { log('~ Daily already claimed (' + label + ')', 'warn'); return { ok: true, skipped: true, reward: 'Already claimed' }; }
        log('✗ Daily failed (' + label + '): ' + msg, 'err');
        return { ok: false, msg };
    } catch(e) { log('✗ Daily error (' + label + '): ' + e.message, 'err'); return { ok: false, msg: e.message }; }
}

// ─── UI helpers ────────────────────────────────────────────────────────────
function setDailyStatus(msg, color) {
    const el = document.getElementById('st-daily-status'); if (!el) return;
    el.style.display = msg ? 'block' : 'none';
    el.style.color = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)';
    el.style.background  = color ? color + '0d' : 'var(--c-bg0)';
    el.innerHTML = msg;
}

function renderDailyResults(results, labels) {
    const el = document.getElementById('st-daily-results'); if (!el) return;
    el.innerHTML = '';
    results.forEach((r, i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:8px;margin-bottom:5px;background:var(--c-bg2);border:1px solid var(--c-border2);';
        const isGood = r.ok && !r.skipped, isSkip = r.skipped;
        row.innerHTML = `<div style="display:flex;align-items:center;gap:8px;"><div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${isGood?'var(--c-success)':isSkip?'var(--c-warn)':'var(--c-err)'};"></div><span style="font-size:11px;font-weight:600;color:var(--c-text1);">${labels[i]}</span></div><span style="font-size:11px;font-family:'Fira Code',monospace;color:${isGood?'var(--c-success)':isSkip?'var(--c-warn)':'var(--c-err)'}">${r.reward||r.msg||'Failed'}</span>`;
        el.appendChild(row);
    });
}

function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00';
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}
function updateDailyCountdownUI() {
    const el = document.getElementById('st-daily-countdown'); if (!el) return;
    if (!dailyAutoEnabled || !dailyNextClaimAt) { el.textContent = ''; return; }
    const remaining = dailyNextClaimAt - Date.now();
    el.textContent = remaining <= 0 ? 'Claiming now…' : 'Next claim in ' + formatCountdown(remaining);
}
function updateDailyToggleUI() {
    const track = document.getElementById('st-daily-toggle-track'), thumb = document.getElementById('st-daily-toggle-thumb'), label = document.getElementById('st-daily-toggle-label');
    if (track) track.style.background = dailyAutoEnabled ? 'var(--c-success)' : 'var(--c-border)';
    if (thumb) thumb.style.transform  = dailyAutoEnabled ? 'translateX(20px)' : 'translateX(0)';
    if (label) { label.textContent = dailyAutoEnabled ? 'Auto-Claim ON' : 'Auto-Claim OFF'; label.style.color = dailyAutoEnabled ? 'var(--c-success)' : 'var(--c-text3)'; }
}

// ─── Auto-claim engine ────────────────────────────────────────────────────
function stopDailyAuto() {
    dailyAutoEnabled = false; dailyNextClaimAt = null;
    if (dailyAutoTimeout)       { clearTimeout(dailyAutoTimeout);         dailyAutoTimeout       = null; }
    if (dailyCountdownInterval) { clearInterval(dailyCountdownInterval);  dailyCountdownInterval = null; }
    try { GM_setValue('st_daily_auto', false); } catch(_) {}
    updateDailyToggleUI(); updateDailyCountdownUI();
    setDailyStatus('Auto-claim stopped', 'var(--c-warn)');
    log('Auto-claim disabled', 'warn');
}

async function scheduleNextDailyClaim() {
    if (!dailyAutoEnabled) return;
    setDailyStatus('Checking cooldown…', 'var(--c-text3)');
    const checkIdx = selectedAcctIdx === -2 ? (accounts.length > 0 ? 0 : -1) : selectedAcctIdx;
    const status = await fetchDailyStatus(checkIdx);
    if (!dailyAutoEnabled) return;
    if (status.canOpen) { log('Auto-claim: ready, claiming now…', 'info'); setDailyStatus('Chest ready — claiming…', 'var(--c-warn)'); await runAutoClaim(); }
    else {
        const waitMs = (status.cooldownSeconds + 3) * 1000; // +3s buffer (was +5)
        dailyNextClaimAt = Date.now() + waitMs;
        log('Auto-claim: cooldown ' + formatCountdown(waitMs) + ' — scheduled', 'info');
        setDailyStatus('⏳ Waiting for cooldown…', 'var(--c-text3)');
        dailyAutoTimeout = setTimeout(async () => { if (dailyAutoEnabled) await runAutoClaim(); }, waitMs);
    }
}

async function runAutoClaim() {
    if (!dailyAutoEnabled) return;
    dailyNextClaimAt = null; updateDailyCountdownUI();
    setDailyStatus('Claiming…', 'var(--c-warn)');
    await claimDailyChest(true);
    if (dailyAutoEnabled) await scheduleNextDailyClaim();
}

function startDailyAuto() {
    if (dailyAutoEnabled) { stopDailyAuto(); return; }
    dailyAutoEnabled = true;
    try { GM_setValue('st_daily_auto', true); } catch(_) {}
    updateDailyToggleUI();
    log('Auto-claim enabled', 'success');
    dailyCountdownInterval = setInterval(updateDailyCountdownUI, 1000);
    scheduleNextDailyClaim();
}
function toggleDailyAuto() { dailyAutoEnabled ? stopDailyAuto() : startDailyAuto(); }

// ─── Manual claim (all accounts in parallel) ─────────────────────────────
async function claimDailyChest(silent) {
    const btn = document.getElementById('st-daily-btn');
    if (!silent) {
        if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Claiming...'; btn.disabled = true; }
        setDailyStatus('', '');
        const resultsEl = document.getElementById('st-daily-results');
        if (resultsEl) resultsEl.innerHTML = '';
    }

    const idxs = resolveAccountIndices();
    let results = [], labels = [];

    if (!idxs.length) { setDailyStatus('✕ No accounts', 'var(--c-err)'); if (!silent && btn) { btn.innerHTML = '🎁 Claim Now'; btn.disabled = false; } return; }

    // All accounts in parallel — much faster
    [results, labels] = await (async () => {
        const rs = await Promise.all(idxs.map(i => claimDailyFrom(i)));
        const ls = idxs.map(i => i === -1 ? 'Session' : (accounts[i]?.username || 'Account ' + i));
        return [rs, ls];
    })();

    renderDailyResults(results, labels);
    const claimed = results.filter(r => r.ok && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed  = results.filter(r => !r.ok).length;
    const parts   = [...(claimed ? [claimed + ' claimed'] : []), ...(skipped ? [skipped + ' already'] : []), ...(failed ? [failed + ' failed'] : [])];
    const allBad  = claimed === 0 && skipped === 0;
    if (!dailyAutoEnabled) setDailyStatus((allBad ? '✕ ' : '✓ ') + parts.join(' · '), allBad ? 'var(--c-err)' : claimed > 0 ? 'var(--c-success)' : 'var(--c-warn)');
    if (!silent && btn) {
        if (!allBad) { btn.innerHTML = '✓ Done!'; btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)'; setTimeout(() => { if (btn) { btn.innerHTML = '🎁 Claim Now'; btn.style.background = ''; btn.disabled = false; } }, 2500); }
        else { btn.innerHTML = '🎁 Claim Now'; btn.disabled = false; }
    }
}

// ─── Promo Codes ──────────────────────────────────────────────────────────
async function fetchVerificationToken(acctIdx) {
    try {
        const r = acctIdx >= 0 ? await acctFetch(acctIdx, BASE + '/internal/promocodes') : await sessFetch(BASE + '/internal/promocodes');
        const html = await r.text();
        return html.match(/name="__RequestVerificationToken"[^>]+value="([^"]+)"/)?.[1] || html.match(/__RequestVerificationToken[^>]+value="([^"]+)"/)?.[1] || null;
    } catch(_) { return null; }
}

async function redeemPromoFrom(acctIdx, code) {
    const label = acctIdx === -1 ? 'Session' : (accounts[acctIdx]?.username || 'Account');
    try {
        const token = await fetchVerificationToken(acctIdx);
        if (!token) return { ok: false, msg: 'No verification token' };
        const body = new URLSearchParams();
        body.set('promocode', code.trim()); body.set('__RequestVerificationToken', token);
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, BASE + '/internal/promocodes', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
        } else {
            const csrf = await refreshSessionCsrf();
            res = await sessFetch(BASE + '/internal/promocodes', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-csrf-token': csrf }, body: body.toString() });
        }
        const ct = res.headers?.get ? res.headers.get('content-type') : '';
        let msg = '';
        if (ct && ct.includes('application/json')) {
            let d = {}; try { d = await res.json(); } catch(_) {}
            if (d.success || res.ok) { log('✓ Promo redeemed (' + label + '): ' + code, 'success'); return { ok: true }; }
            msg = d.message || d.errorMessage || 'HTTP ' + res.status;
        } else {
            const html = await res.text();
            if (res.ok && !html.toLowerCase().includes('invalid') && !html.toLowerCase().includes('error')) { log('✓ Promo redeemed (' + label + '): ' + code, 'success'); return { ok: true }; }
            msg = html.match(/class="[^"]*error[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim() || 'HTTP ' + res.status;
        }
        log('✗ Promo failed (' + label + '): ' + msg, 'err');
        return { ok: false, msg };
    } catch(e) { log('✗ Promo error (' + label + '): ' + e.message, 'err'); return { ok: false, msg: e.message }; }
}

function setPromoStatus(msg, color) {
    const el = document.getElementById('st-promo-status'); if (!el) return;
    el.style.display = msg ? 'block' : 'none'; el.style.color = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)'; el.style.background = color ? color + '0d' : 'var(--c-bg0)'; el.textContent = msg;
}

async function redeemPromoCode() {
    const code = document.getElementById('st-promo-input')?.value?.trim();
    if (!code) { setPromoStatus('⚠ Enter a promo code', 'var(--c-warn)'); return; }
    const btn = document.getElementById('st-promo-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Redeeming...'; btn.disabled = true; }
    setPromoStatus('Redeeming...', 'var(--c-warn)');
    const idxs = resolveAccountIndices();
    if (!idxs.length) { setPromoStatus('✕ No accounts', 'var(--c-err)'); if (btn) { btn.innerHTML = '🎟️ Redeem'; btn.disabled = false; } return; }
    // Run in parallel where possible (sequential needed for promo token fetching)
    const results = await Promise.all(idxs.map(i => redeemPromoFrom(i, code)));
    const ok = results.filter(r => r.ok).length, total = results.length;
    if (ok > 0) {
        setPromoStatus(`✓ Redeemed "${code}" on ${ok}/${total} account${total > 1 ? 's' : ''}`, 'var(--c-success)');
        if (btn) { btn.innerHTML = '✓ Redeemed!'; btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)'; setTimeout(() => { if (btn) { btn.innerHTML = '🎟️ Redeem'; btn.style.background = ''; btn.disabled = false; } }, 2500); }
    } else {
        setPromoStatus('✕ ' + (results.find(r => !r.ok)?.msg || 'Failed'), 'var(--c-err)');
        if (btn) { btn.innerHTML = '🎟️ Redeem'; btn.disabled = false; }
    }
}

// ─── Membership Upgrade — all accounts in parallel ────────────────────────
async function fetchMembershipToken(acctIdx) {
    try {
        const r = acctIdx >= 0 ? await acctFetch(acctIdx, BASE + '/internal/membership') : await sessFetch(BASE + '/internal/membership');
        const html = await r.text();
        return html.match(/name="__RequestVerificationToken"[^>]+value="([^"]+)"/)?.[1] || html.match(/__RequestVerificationToken[^>]+value="([^"]+)"/)?.[1] || null;
    } catch(_) { return null; }
}

async function upgradeMembershipFrom(acctIdx, membershipType) {
    const label = acctIdx === -1 ? 'Session' : (accounts[acctIdx]?.username || 'Account');
    try {
        const token = await fetchMembershipToken(acctIdx);
        if (!token) return { ok: false, msg: 'No verification token' };
        const body = new URLSearchParams();
        body.set('membershipType', membershipType); body.set('__RequestVerificationToken', token);
        let res;
        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, BASE + '/internal/membership', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
        } else {
            const csrf = await refreshSessionCsrf();
            res = await sessFetch(BASE + '/internal/membership', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'x-csrf-token': csrf }, body: body.toString() });
        }
        const ct = res.headers?.get ? res.headers.get('content-type') : '';
        if (ct && ct.includes('application/json')) {
            let d = {}; try { d = await res.json(); } catch(_) {}
            if (d.success || res.ok) { log('✓ Membership set (' + label + ')', 'success'); return { ok: true }; }
            return { ok: false, msg: d.message || 'HTTP ' + res.status };
        }
        const html = await res.text();
        if (res.ok && !html.toLowerCase().includes('error') && !html.toLowerCase().includes('invalid')) { log('✓ Membership set (' + label + ')', 'success'); return { ok: true }; }
        return { ok: false, msg: html.match(/class="[^"]*(?:error|alert)[^"]*"[^>]*>([^<]+)</i)?.[1]?.trim() || 'HTTP ' + res.status };
    } catch(e) { return { ok: false, msg: e.message }; }
}

function setObcStatus(msg, color) {
    const el = document.getElementById('st-obc-status'); if (!el) return;
    el.style.display = msg ? 'block' : 'none'; el.style.color = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)'; el.style.background = color ? color + '0d' : 'var(--c-bg0)'; el.textContent = msg;
}

async function upgradeToOBC() {
    const membershipType = document.getElementById('st-membership-type')?.value || 'OutrageousBuildersClub';
    const shortLabel = { OutrageousBuildersClub:'OBC', TurboBuildersClub:'TBC', BuildersClub:'BC', None:'None' }[membershipType] || membershipType;
    const btn = document.getElementById('st-obc-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Setting...'; btn.disabled = true; }
    setObcStatus('Setting ' + shortLabel + '...', 'var(--c-warn)');

    const idxs = resolveAccountIndices();
    if (!idxs.length) { setObcStatus('✕ No accounts', 'var(--c-err)'); if (btn) { btn.innerHTML = '👑 Set Membership'; btn.disabled = false; } return; }

    // All in parallel — significantly faster for many accounts
    const results = await Promise.all(idxs.map(i => upgradeMembershipFrom(i, membershipType)));
    const ok = results.filter(r => r.ok).length, total = results.length;
    if (ok > 0) {
        setObcStatus(`✓ Set ${ok}/${total} account${total > 1 ? 's' : ''} to ${shortLabel}`, 'var(--c-success)');
        if (btn) { btn.innerHTML = '✓ Done!'; btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)'; setTimeout(() => { if (btn) { btn.innerHTML = '👑 Set Membership'; btn.style.background = ''; btn.disabled = false; } }, 2500); }
    } else {
        setObcStatus('✕ ' + (results.find(r => !r.ok)?.msg || 'Failed'), 'var(--c-err)');
        if (btn) { btn.innerHTML = '👑 Set Membership'; btn.disabled = false; }
    }
}
// ─── Batch API Request ────────────────────────────────────────────────────
async function batchApiRequestFrom(acctIdx, url, method, body) {
    const label = acctIdx === -1 ? 'Session' : (accounts[acctIdx]?.username || 'Account');
    try {
        let res;
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body && method !== 'GET') opts.body = body;

        if (acctIdx >= 0) {
            res = await acctFetch(acctIdx, url, opts);
        } else {
            const csrf = (method !== 'GET') ? await refreshSessionCsrf() : null;
            res = await sessFetch(url, {
                ...opts,
                credentials: 'include',
                headers: { ...opts.headers, ...(csrf ? { 'x-csrf-token': csrf } : {}) },
            });
        }

        let text = '';
        try { text = await res.text(); } catch(_) {}
        let preview = text.slice(0, 120);
        try { const j = JSON.parse(text); preview = JSON.stringify(j).slice(0, 120); } catch(_) {}

        if (res.ok) {
            log(`✓ Batch request OK (${label}) — ${preview}`, 'success');
            return { ok: true, label, preview };
        }
        log(`✗ Batch request failed (${label}) HTTP ${res.status} — ${preview}`, 'err');
        return { ok: false, label, msg: `HTTP ${res.status} — ${preview}` };
    } catch(e) {
        log(`✗ Batch request error (${label}): ${e.message}`, 'err');
        return { ok: false, label, msg: e.message };
    }
}

function setBatchStatus(msg, color) {
    const el = document.getElementById('st-batch-status'); if (!el) return;
    el.style.display = msg ? 'block' : 'none';
    el.style.color = color || 'var(--c-text2)';
    el.style.borderColor = color ? color + '44' : 'var(--c-border2)';
    el.style.background  = color ? color + '0d' : 'var(--c-bg0)';
    el.textContent = msg;
}

function renderBatchResults(results) {
    const el = document.getElementById('st-batch-results'); if (!el) return;
    el.innerHTML = '';
    results.forEach(r => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:8px 12px;border-radius:8px;margin-bottom:4px;background:var(--c-bg2);border:1px solid var(--c-border2);';
        row.innerHTML = `
            <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
                <div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${r.ok ? 'var(--c-success)' : 'var(--c-err)'};"></div>
                <span style="font-size:11px;font-weight:600;color:var(--c-text1);">${r.label}</span>
            </div>
            <span style="font-size:10px;font-family:'Fira Code',monospace;color:${r.ok ? 'var(--c-success)' : 'var(--c-err)'};word-break:break-all;text-align:right;flex:1;min-width:0;">${r.preview || r.msg || ''}</span>`;
        el.appendChild(row);
    });
}

async function runBatchApiRequest() {
    const urlEl    = document.getElementById('st-batch-url');
    const methodEl = document.getElementById('st-batch-method');
    const bodyEl   = document.getElementById('st-batch-body');
    const btn      = document.getElementById('st-batch-btn');
    const url      = urlEl?.value?.trim();
    const method   = methodEl?.value || 'GET';
    const body     = bodyEl?.value?.trim() || null;

    if (!url) { setBatchStatus('⚠ Enter a URL first', 'var(--c-warn)'); return; }

    // Basic URL validation — must be on the same domain
    let fullUrl = url;
    if (!url.startsWith('http')) fullUrl = BASE + (url.startsWith('/') ? '' : '/') + url;
    if (!fullUrl.includes('strrev.com')) { setBatchStatus('⚠ URL must be on strrev.com', 'var(--c-warn)'); return; }

    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Sending...'; btn.disabled = true; }
    setBatchStatus('', '');
    const resultsEl = document.getElementById('st-batch-results');
    if (resultsEl) resultsEl.innerHTML = '';

    const idxs = resolveAccountIndices();
    if (!idxs.length) { setBatchStatus('✕ No accounts selected', 'var(--c-err)'); if (btn) { btn.innerHTML = '🚀 Send'; btn.disabled = false; } return; }

    log(`Batch ${method} → ${fullUrl} (${idxs.length} account${idxs.length > 1 ? 's' : ''})`, 'info');
    setBatchStatus(`Sending to ${idxs.length} account${idxs.length > 1 ? 's' : ''}…`, 'var(--c-warn)');

    const results = await Promise.all(idxs.map(i => batchApiRequestFrom(i, fullUrl, method, body)));
    renderBatchResults(results);

    const ok = results.filter(r => r.ok).length, total = results.length;
    const allBad = ok === 0;
    setBatchStatus(
        (allBad ? '✕ ' : '✓ ') + `${ok}/${total} succeeded`,
        allBad ? 'var(--c-err)' : 'var(--c-success)'
    );

    if (btn) {
        if (!allBad) {
            btn.innerHTML = '✓ Done!';
            btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
            setTimeout(() => { if (btn) { btn.innerHTML = '🚀 Send'; btn.style.background = ''; btn.disabled = false; } }, 2500);
        } else {
            btn.innerHTML = '🚀 Send'; btn.disabled = false;
        }
    }
}
