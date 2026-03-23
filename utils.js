// ─── Constants ────────────────────────────────────────────────────────────
const BASE         = 'https://www.strrev.com';
const CATALOG_API  = BASE + '/apisite/catalog/v1/search/items?category=Featured&limit=28&sortType=2';
const DISPATCH_MS  = 5;     // check every 5ms instead of 10ms — 2x faster
const MAX_INFLIGHT = 28;    // 28 parallel workers (was 16)
const MIN_INFLIGHT = 6;
const RTT_WINDOW   = 60;
const RTT_TARGET   = 80;    // more aggressive RTT target (was 100)
const BUY_RETRY    = 2;     // auto-retry on CSRF expiry

const AUTH_ENDPOINTS = [
    '/apisite/users/v1/users/authenticated',
    '/api/users/authenticated',
    '/api/user',
    '/api/me',
];

// ─── Shared State ─────────────────────────────────────────────────────────
let accounts        = [];
let selectedAcctIdx = -1;
let sessionCsrf     = '';

// Selective accounts (checkboxes in account panel → used when idx === -3)
let selectiveAccounts = new Set(); // account indices checked in panel

// Sniper state
let sniperActive    = false;
let sniperSettings  = {
    minPriceRobux: '', maxPriceRobux: '',
    minPriceTix:   '', maxPriceTix:   '',
    limitedsOnly:  false, robuxOnly: false, tixOnly: false,
};
let sniperBlacklist  = {};
let sniperMaxSeenId  = 0;

// Update / redirect sniper state
let updateSniperActive   = false;
let updateSniperTimer    = null;
let updatePriceMap       = {};
let updateSniperSettings = {
    priceDropEnabled: false, priceDropPercent: 10, resaleEnabled: false,
};
let redirectSniperActive   = false;
let redirectSniperSeenIds  = {};
let redirectSniperSettings = { redirectNew: true, redirectUpdated: false };

// Dispatch internals
let checkCount   = 0, domPending  = false, dispatchTimer = null;
let cpsTimer     = null, abortCtrl  = null, inFlight     = 0;
let concurrency  = 6,   rttSamples = [],   avgRtt        = 0;
let checksPerSec = 0,   cpsCount   = 0;

// Trade state
let tradeTargetId = null, tradeTargetName = '';
let myInventory   = [], theirInventory   = [];
let mySelected    = new Set(), theirSelected = new Set();

// API Scanner state
let apiScannerEnabled = false;
let apiScannerLogs    = [];  // { method, url, status, time, ms }
const API_SCANNER_MAX = 200;

// CSRF cache — single token used for all session calls
let _csrfRefreshing = false;
let _csrfPromise    = null;

// ─── GM Fetch ─────────────────────────────────────────────────────────────
function gmFetch(url, opts = {}) {
    return new Promise((res, rej) => {
        GM_xmlhttpRequest({
            method:  opts.method  || 'GET',
            url,
            headers: opts.headers || {},
            data:    opts.body    || null,
            timeout: 12000,
            onload:  r => res(r),
            onerror: e => rej(new Error('Network error: ' + (e.error || 'unknown'))),
            ontimeout: () => rej(new Error('Request timed out')),
        });
    });
}

function normResp(r) {
    const hdrs = {};
    if (r.responseHeaders) {
        r.responseHeaders.split('\n').forEach(l => {
            const i = l.indexOf(':');
            if (i > 0) hdrs[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim();
        });
    }
    return {
        ok:      r.status >= 200 && r.status < 300,
        status:  r.status,
        json:    () => { try { return Promise.resolve(JSON.parse(r.responseText)); } catch(e) { return Promise.reject(e); } },
        text:    () => Promise.resolve(r.responseText),
        headers: { get: k => hdrs[k.toLowerCase()] || null },
        responseHeaders: r.responseHeaders || '',
    };
}

// ─── CSRF Management ──────────────────────────────────────────────────────
async function refreshSessionCsrf(force = false) {
    if (!force && sessionCsrf) return sessionCsrf;
    if (_csrfRefreshing && _csrfPromise) return _csrfPromise;
    _csrfRefreshing = true;
    _csrfPromise = (async () => {
        try {
            const r = await fetch(BASE + '/apisite/economy/v1/purchases/products/0', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'x-csrf-token': '' },
                body: '{}',
            });
            const t = r.headers.get('x-csrf-token');
            if (t) sessionCsrf = t;
        } catch(_) {}
        _csrfRefreshing = false;
        _csrfPromise    = null;
        return sessionCsrf;
    })();
    return _csrfPromise;
}

// Legacy alias for compatibility
const fetchSessionCsrf = () => refreshSessionCsrf();

// ─── Account Index Helpers ────────────────────────────────────────────────
// Returns array of account indices to operate on given the current selection
function resolveAccountIndices() {
    if (selectedAcctIdx === -3) {
        // Selective mode — use checked accounts
        return [...selectiveAccounts].filter(i => accounts[i]);
    }
    if (selectedAcctIdx === -2) return accounts.map((_, i) => i);
    if (selectedAcctIdx === -1) return [-1]; // session
    return accounts[selectedAcctIdx] ? [selectedAcctIdx] : [];
}

// ─── API Scanner ──────────────────────────────────────────────────────────
function apiScannerRecord(method, url, status, ms) {
    if (!apiScannerEnabled) return;
    apiScannerLogs.unshift({ method, url, status, ms, time: new Date().toLocaleTimeString() });
    if (apiScannerLogs.length > API_SCANNER_MAX) apiScannerLogs.length = API_SCANNER_MAX;
    renderApiScannerLogs();
}

function initApiScanner() {
    // Wrap window.fetch
    const origFetch = window.fetch;
    window.fetch = async function(input, opts) {
        const url    = typeof input === 'string' ? input : input?.url || '';
        const method = (opts?.method || 'GET').toUpperCase();
        const t0     = performance.now();
        const result = await origFetch.apply(this, arguments);
        if (url.includes('strrev.com')) {
            apiScannerRecord(method, url.replace(BASE, ''), result.status, Math.round(performance.now() - t0));
        }
        return result;
    };
    // Wrap GM_xmlhttpRequest calls come through gmFetch — intercept at normResp level done separately
    log('🔬 API Scanner ready — enable in Settings', 'info');
}

function renderApiScannerLogs() {
    const el = document.getElementById('st-api-log'); if (!el) return;
    el.innerHTML = '';
    apiScannerLogs.slice(0, 60).forEach(entry => {
        const row = document.createElement('div');
        const statusColor = entry.status >= 200 && entry.status < 300 ? '#22c55e' : entry.status >= 400 ? '#ef4444' : '#eab308';
        const methodColor = { GET:'#60a5fa', POST:'#a78bfa', PATCH:'#fb923c', DELETE:'#f87171', PUT:'#34d399' }[entry.method] || '#94a3b8';
        row.style.cssText = 'display:grid;grid-template-columns:40px 44px 52px 1fr 48px;gap:6px;padding:4px 8px;border-radius:4px;margin-bottom:1px;cursor:pointer;transition:background 0.1s;align-items:center;';
        row.onmouseenter = () => row.style.background = 'var(--c-bg2)';
        row.onmouseleave = () => row.style.background = '';
        row.onclick = () => { navigator.clipboard?.writeText(BASE + entry.url); log('📋 Copied: ' + entry.url, 'info'); };
        row.title = 'Click to copy full URL';
        row.innerHTML = `
            <span style="font-size:9px;color:var(--c-text4);font-family:monospace;">${entry.time}</span>
            <span style="font-size:9px;font-weight:700;color:${methodColor};">${entry.method}</span>
            <span style="font-size:9px;font-weight:700;color:${statusColor};">${entry.status}</span>
            <span style="font-size:9px;color:var(--c-text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${entry.url}</span>
            <span style="font-size:9px;color:var(--c-text4);font-family:monospace;text-align:right;">${entry.ms}ms</span>
        `;
        el.appendChild(row);
    });
}

// ─── Log ──────────────────────────────────────────────────────────────────
const LOG_MAX = 120;
function log(msg, type = 'info') {
    const el = document.getElementById('st-log'); if (!el) return;
    const colors = { info:'#475569', success:'#22c55e', warn:'#eab308', err:'#ef4444' };
    const icons  = { info:'·',       success:'✓',       warn:'⚠',      err:'✕'      };
    const c = colors[type] || colors.info;
    const time = new Date().toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:12px 60px 1fr;gap:6px;padding:4px 6px;border-radius:4px;margin-bottom:2px;transition:background 0.1s;';
    row.onmouseenter = () => row.style.background = 'var(--c-bg2)';
    row.onmouseleave = () => row.style.background = 'transparent';
    row.innerHTML = `<span style="color:${c};font-size:9px;font-weight:700;">${icons[type]||'·'}</span><span style="color:#1e3a5f;font-size:9px;font-family:monospace;">${time}</span><span style="color:${c};font-size:10px;word-break:break-word;">${msg}</span>`;
    el.prepend(row);
    while (el.children.length > LOG_MAX) el.removeChild(el.lastChild);
}

// ─── Fast Hash ────────────────────────────────────────────────────────────
function fastHash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return h.toString(16);
}

// ─── Rate limiter utility ─────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runWithConcurrency(tasks, limit, fn) {
    const results = new Array(tasks.length);
    let idx = 0;
    async function worker() {
        while (idx < tasks.length) {
            const i = idx++;
            results[i] = await fn(tasks[i], i).catch(e => ({ ok: false, error: e.message }));
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
    return results;
}
