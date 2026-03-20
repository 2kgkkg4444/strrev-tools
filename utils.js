// ─── Constants ────────────────────────────────────────────────────────────
const BASE         = 'https://www.strrev.com';
const CATALOG_API  = BASE + '/apisite/catalog/v1/search/items?category=Featured&limit=28&sortType=0';
const DISPATCH_MS  = 20;   // fire a new request every 20ms
const MAX_INFLIGHT = 12;  // up to 12 parallel catalog requests
const MIN_INFLIGHT = 2;
const RTT_WINDOW   = 30;
const RTT_TARGET   = 150; // tighter RTT target

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

// Sniper state
let sniperActive    = false;

// Sniper filter settings
let sniperSettings = {
    minPriceRobux: '',   // '' = no limit
    minPriceTix:   '',   // '' = no limit
    maxPriceRobux: '',   // '' = no limit; 0 = free only
    maxPriceTix:   '',   // '' = no limit; 0 = free only
    limitedsOnly:  false,
    robuxOnly:     false,
    tixOnly:       false,
};
let sniperBlacklist = {};
let sniperMaxSeenId = 0;  // track highest item ID seen — new items have higher IDs

// Update sniper state
let updateSniperActive  = false;
let updateSniperTimer   = null;
let updatePriceMap      = {};  // id → { lowestPrice, isForSale }
let updateSniperSettings = {
    priceDropEnabled:  false,
    priceDropPercent:  10,    // alert when price drops by this % or more
    resaleEnabled:     false, // alert when off-sale item comes back on sale
};
let checkCount      = 0;
let domPending      = false;
let dispatchTimer   = null;
let cpsTimer        = null;
let abortCtrl       = null;
let inFlight        = 0;
let concurrency     = 3;
let rttSamples      = [];
let avgRtt          = 0;
let checksPerSec    = 0;
let cpsCount        = 0;

// Trade state
let tradeTargetId   = null;
let tradeTargetName = '';
let myInventory     = [];
let theirInventory  = [];
let mySelected      = new Set();
let theirSelected   = new Set();

// ─── GM Fetch ─────────────────────────────────────────────────────────────
function gmFetch(url, opts = {}) {
    return new Promise((res, rej) => {
        GM_xmlhttpRequest({
            method:  opts.method  || 'GET',
            url,
            headers: opts.headers || {},
            data:    opts.body    || null,
            onload:  r => res(r),
            onerror: e => rej(e),
        });
    });
}

function normResp(r) {
    return {
        ok:      r.status >= 200 && r.status < 300,
        status:  r.status,
        json:    () => Promise.resolve(JSON.parse(r.responseText)),
        text:    () => Promise.resolve(r.responseText),
        headers: { get: k => r.responseHeaders?.match(new RegExp(k+':\\s*([^\\r\\n]+)','i'))?.[1]?.trim()||null },
    };
}

// ─── Log ──────────────────────────────────────────────────────────────────
function log(msg, type) {
    const el = document.getElementById('st-log'); if (!el) return;
    const colors = { info:'#475569', success:'#22c55e', warn:'#eab308', err:'#ef4444' };
    const icons  = { info:'·',       success:'✓',       warn:'!',       err:'✕'      };
    const c = colors[type]||colors.info, i = icons[type]||icons.info;
    const time = new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:12px 60px 1fr;gap:6px;padding:4px 6px;border-radius:4px;margin-bottom:2px;transition:background 0.12s;';
    row.onmouseenter = () => row.style.background = '#0d1829';
    row.onmouseleave = () => row.style.background = 'transparent';
    row.innerHTML = `<span style="color:${c};font-size:9px;font-weight:700;">${i}</span><span style="color:#1e3a5f;font-size:9px;font-family:monospace;">${time}</span><span style="color:${c};font-size:10px;word-break:break-word;">${msg}</span>`;
    el.prepend(row);
    while (el.children.length > 80) el.removeChild(el.lastChild);
}
