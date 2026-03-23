// ─── Sniper Stats ─────────────────────────────────────────────────────────
function recordRtt(ms) {
    rttSamples.push(ms);
    if (rttSamples.length > RTT_WINDOW) rttSamples.shift();
    let s = 0; rttSamples.forEach(x => s += x); avgRtt = Math.round(s / rttSamples.length);
    if (rttSamples.length % 8 === 0) {
        if (avgRtt < RTT_TARGET && concurrency < MAX_INFLIGHT)   concurrency++;
        else if (avgRtt > RTT_TARGET + 30 && concurrency > MIN_INFLIGHT) concurrency--;
    }
    schedDomUpdate();
}

function schedDomUpdate() {
    if (domPending) return; domPending = true;
    requestAnimationFrame(() => {
        domPending = false;
        const s = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        s('st-checks', checkCount.toLocaleString());
        s('st-cps',    checksPerSec + '/s');
        s('st-rtt',    avgRtt ? avgRtt + 'ms' : '—');
        s('st-conc',   'x' + concurrency);
        const fill = document.getElementById('st-rtt-fill');
        if (fill) fill.style.width = Math.min(100, (avgRtt / 400) * 100) + '%';
        if (typeof updateSniperPill === 'function') updateSniperPill(checkCount, checksPerSec);
    });
}

// ─── Sniper Settings ──────────────────────────────────────────────────────
function saveSniperSettings()   { try { GM_setValue('st_sniper_settings', JSON.stringify(sniperSettings)); } catch(_) {} }
function loadSniperSettings()   { try { const s = JSON.parse(GM_getValue('st_sniper_settings', 'null')); if (s) Object.assign(sniperSettings, s); } catch(_) {} syncSniperSettingsUI(); }
function syncSniperSettingsUI() {
    const g = (id, val) => { const e = document.getElementById(id); if (e) e.value = val; };
    g('st-snip-min-robux', sniperSettings.minPriceRobux);
    g('st-snip-min-tix',   sniperSettings.minPriceTix);
    g('st-snip-max-robux', sniperSettings.maxPriceRobux);
    g('st-snip-max-tix',   sniperSettings.maxPriceTix);
    if (sniperSettings.limitedsOnly)  setToggle('st-snip-limiteds',    true);
    if (sniperSettings.robuxOnly)     setToggle('st-snip-robux-only',  true);
    if (sniperSettings.tixOnly)       setToggle('st-snip-tix-only',    true);
}

function itemPassesFilters(item) {
    const restrictions = item.itemRestrictions || [];
    const isLimited  = restrictions.includes('Limited') || restrictions.includes('LimitedUnique');
    const isTix      = item.priceTickets != null && item.priceTickets > 0;
    const isRobux    = !isTix;
    const price      = item.lowestPrice ?? item.price ?? 0;
    const priceTix   = item.priceTickets ?? 0;
    if (sniperSettings.limitedsOnly && !isLimited) return false;
    if (sniperSettings.robuxOnly    && !isRobux)   return false;
    if (sniperSettings.tixOnly      && !isTix)     return false;
    if (sniperSettings.minPriceRobux !== '' && isRobux) { const min = parseInt(sniperSettings.minPriceRobux); if (!isNaN(min) && price < min) return false; }
    if (sniperSettings.minPriceTix   !== '' && isTix)   { const min = parseInt(sniperSettings.minPriceTix);   if (!isNaN(min) && priceTix < min) return false; }
    if (sniperSettings.maxPriceRobux !== '' && isRobux) { const max = parseInt(sniperSettings.maxPriceRobux); if (!isNaN(max) && price > max) return false; }
    if (sniperSettings.maxPriceTix   !== '' && isTix)   { const max = parseInt(sniperSettings.maxPriceTix);   if (!isNaN(max) && priceTix > max) return false; }
    return true;
}

// ─── Resolve full item details for buy ────────────────────────────────────
async function resolveItemDetailsForBuy(rawItem) {
    try {
        const r = await fetch(BASE + '/apisite/catalog/v1/catalog/items/details', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(rawItem.id) }] }),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json(), d = j.data?.[0];
        if (!d) throw new Error('No data');
        return {
            id: rawItem.id, assetId: String(d.id || rawItem.id), name: d.name || rawItem.name,
            price: d.lowestPrice ?? d.price ?? rawItem.price ?? 0, currency: 1,
            sellerId: d.lowestSellerData?.userId || d.creatorTargetId || d.sellerId || null,
            userAssetId: d.lowestSellerData?.userAssetId || null,
        };
    } catch(e) { log('⚠ Item details failed: ' + e.message, 'warn'); return rawItem; }
}

// ─── Notifications & Sound ────────────────────────────────────────────────
function fireSnipeNotification(item) {
    try {
        const body = item.name + (item.price > 0 ? '  ·  R$' + item.price : '  ·  FREE');
        const doN  = () => new Notification('🎯 Item Sniped!', { body, icon: BASE + '/favicon.ico', silent: true });
        if (Notification.permission === 'granted') doN();
        else if (Notification.permission !== 'denied') Notification.requestPermission().then(p => { if (p === 'granted') doN(); });
    } catch(_) {}
}

function fireSnipeSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [{ freq:523, s:0, d:0.18, v:0.30 }, { freq:659, s:0.05, d:0.18, v:0.28 }, { freq:784, s:0.10, d:0.22, v:0.28 }, { freq:1047, s:0.15, d:0.38, v:0.35 }].forEach(({ freq, s, d, v }) => {
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination); osc.type = 'triangle'; osc.frequency.value = freq;
            g.gain.setValueAtTime(0, ctx.currentTime + s); g.gain.linearRampToValueAtTime(v, ctx.currentTime + s + 0.012);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + d);
            osc.start(ctx.currentTime + s); osc.stop(ctx.currentTime + s + d + 0.05);
        });
    } catch(_) {}
}

function fireUpdateSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [{ freq:880, s:0, d:0.12 }, { freq:660, s:0.13, d:0.18 }].forEach(({ freq, s, d }) => {
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination); osc.type = 'sine'; osc.frequency.value = freq;
            g.gain.setValueAtTime(0, ctx.currentTime + s); g.gain.linearRampToValueAtTime(0.28, ctx.currentTime + s + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + d);
            osc.start(ctx.currentTime + s); osc.stop(ctx.currentTime + s + d + 0.05);
        });
    } catch(_) {}
}

// ─── Snipe Hit Handler ────────────────────────────────────────────────────
async function onSniperHit(rawItem) {
    log('🎯 SNIPED: ' + (rawItem.name || 'ID ' + rawItem.id), 'success');
    setSniperStatus('🎯 Sniped! Resolving & buying…', 'hot');
    updateSniperBtn(false);

    const item = await resolveItemDetailsForBuy(rawItem);
    if (!item.sellerId) log('⚠ No sellerId for ' + item.name, 'warn');

    log(`💰 Price: ${item.price === 0 ? 'FREE' : 'R$' + item.price} | Seller: ${item.sellerId || '?'}`, 'info');
    setSniperStatus('🎯 Buying...', 'hot');

    fireSnipeSound();
    fireSnipeNotification(item);

    const orig = document.title; let n = 0;
    const iv = setInterval(() => {
        document.title = n++ % 2 === 0 ? '🚨 ' + item.name + ' SNIPED!' : orig;
        if (n >= 12) { clearInterval(iv); document.title = orig; }
    }, 380);

    const idxs    = resolveAccountIndices();
    let bought = false;
    if (!idxs.length || idxs[0] === -1) {
        bought = await buyForSession(item);
    } else {
        const res = await Promise.all(idxs.map(i => buyForAcct(i, item)));
        bought = res.some(Boolean);
    }

    log(bought ? '✅ Buy successful: ' + item.name : '❌ Buy failed: ' + item.name, bought ? 'success' : 'err');
    setSniperStatus(bought ? '✅ Bought! Rearming in 2s…' : '❌ Buy failed — rearming in 2s…', 'loading');
    setTimeout(() => { if (!sniperActive) startSniper(); }, 2000);
}

// ─── CSRF Pre-warm ────────────────────────────────────────────────────────
async function prewarmBuyCache() {
    try {
        const r = await fetch(BASE + '/apisite/economy/v1/purchases/products/0', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': '' }, body: '{}',
        });
        const t = r.headers.get('x-csrf-token');
        if (t) { sessionCsrf = t; log('🔥 CSRF pre-warmed', 'info'); }
    } catch(_) {}
}

// ─── Auto-Buy Sniper Dispatch ─────────────────────────────────────────────
// Uses GM_xmlhttpRequest to bypass 6-connections-per-domain browser limit
let _lastRespHash = '';

function dispatchOne(signal) {
    if (!sniperActive || signal.aborted) return;
    inFlight++;
    const t0 = performance.now();
    GM_xmlhttpRequest({
        method: 'GET',
        url: BASE + '/apisite/catalog/v1/search/items?limit=28&sortType=2&_=' + Date.now(),
        headers: { 'Accept': 'application/json' },
        timeout: 8000,
        onload: async (r) => {
            if (!sniperActive || signal.aborted) { inFlight--; return; }
            recordRtt(performance.now() - t0);
            checkCount++; cpsCount++; inFlight--;
            apiScannerRecord('GET', '/apisite/catalog/v1/search/items', r.status, Math.round(performance.now() - t0));

            const hash = fastHash(r.responseText);
            if (hash === _lastRespHash) return;
            _lastRespHash = hash;

            let json; try { json = JSON.parse(r.responseText); } catch(_) { return; }
            const d = json.data; if (!d) return;

            for (let i = 0; i < d.length; i++) {
                const item = d[i];
                if (item.id <= sniperMaxSeenId && sniperMaxSeenId > 0) continue;
                if (sniperBlacklist[item.id]) continue;
                if (!itemPassesFilters(item)) { sniperBlacklist[item.id] = true; continue; }

                // HIT — immediately kill all workers
                sniperActive = false; abortCtrl.abort();
                clearInterval(dispatchTimer); clearInterval(cpsTimer);
                dispatchTimer = cpsTimer = null;
                GM_setValue('sniperActive', false);
                await onSniperHit({
                    id: item.id, assetId: String(item.id), name: item.name || 'Item #' + item.id,
                    price: item.lowestPrice ?? item.price ?? 0, currency: item.priceTickets ? 2 : 1,
                    sellerId: item.creatorTargetId || null, itemRestrictions: item.itemRestrictions || [],
                    priceTickets: item.priceTickets ?? null,
                });
                return;
            }
        },
        onerror: () => { inFlight--; },
        ontimeout: () => { inFlight--; },
        onabort: () => { inFlight--; },
    });
}

function startDispatch() {
    if (typeof showSniperPill === 'function') showSniperPill();
    abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    concurrency = MAX_INFLIGHT; inFlight = 0; rttSamples = []; avgRtt = 0; cpsCount = 0; _lastRespHash = '';

    dispatchTimer = setInterval(() => {
        if (!sniperActive) { clearInterval(dispatchTimer); return; }
        while (inFlight < concurrency && sniperActive) dispatchOne(signal);
    }, DISPATCH_MS);

    cpsTimer = setInterval(() => { checksPerSec = cpsCount; cpsCount = 0; schedDomUpdate(); }, 1000);
}

async function snapshotAllPages() {
    const ids = {}; let maxId = 0, cursor = '', pages = 0;
    const MAX_PAGES = 10;
    setSniperStatus('Snapshotting ' + MAX_PAGES + ' pages…', 'loading');
    do {
        let url = BASE + '/apisite/catalog/v1/search/items?limit=28&sortType=2&_=' + Date.now();
        if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
        const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
        if (!r.ok) break;
        const j = await r.json();
        (j.data || []).forEach(x => { ids[x.id] = true; if (x.id > maxId) maxId = x.id; });
        cursor = j.nextPageCursor || '';
        pages++;
        setSniperStatus('Snapshotting page ' + pages + '/' + MAX_PAGES + '…', 'loading');
    } while (cursor && pages < MAX_PAGES);
    sniperMaxSeenId = maxId;
    return ids;
}

async function startSniper() {
    loadSniperSettings();
    const btn = document.getElementById('st-sniper-btn');
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span> Snapshotting…'; btn.disabled = true; }
    setSniperStatus('Fetching catalog snapshot…', 'loading');
    prewarmBuyCache(); // parallel with snapshot
    try {
        sniperBlacklist = await snapshotAllPages();
        sniperActive = true; checkCount = 0;
        GM_setValue('sniperActive', true);
        GM_setValue('sniperBlacklist', JSON.stringify(sniperBlacklist));
        log('Sniper armed — ' + Object.keys(sniperBlacklist).length + ' items, maxID: ' + sniperMaxSeenId, 'success');
        updateSniperBtn(true);
        setSniperStatus('Sniping for new items…', 'active');
        if (btn) btn.disabled = false;
        if (typeof showSniperPill === 'function') showSniperPill();
        startDispatch();
    } catch(e) {
        log('Snapshot failed: ' + e.message, 'err');
        setSniperStatus('Snapshot failed — retry', 'idle');
        sniperActive = false; updateSniperBtn(false);
        if (btn) btn.disabled = false;
    }
}

function stopSniper() {
    sniperActive = false;
    if (abortCtrl)    { abortCtrl.abort(); abortCtrl = null; }
    if (dispatchTimer){ clearInterval(dispatchTimer); dispatchTimer = null; }
    if (cpsTimer)     { clearInterval(cpsTimer);      cpsTimer      = null; }
    inFlight = 0; checksPerSec = 0; avgRtt = 0; rttSamples = [];
    GM_setValue('sniperActive', false);
    updateSniperBtn(false);
    setSniperStatus('Idle — press Start to begin sniping', 'idle');
    log('Sniper stopped', 'warn');
    if (typeof hideSniperPill === 'function') hideSniperPill();
    schedDomUpdate();
}

function toggleSniper() { sniperActive ? stopSniper() : startSniper(); }

function updateSniperBtn(active) {
    const btn = document.getElementById('st-sniper-btn'); if (!btn) return;
    btn.innerHTML        = active ? '⏹ Stop Sniper' : '🎯 Start Sniper';
    btn.style.background = active ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#e94560,#b91c4a)';
    btn.style.boxShadow  = active ? '0 0 20px rgba(34,197,94,0.25)' : '0 0 20px rgba(233,69,96,0.2)';
}

function setSniperStatus(msg, type) {
    const dot = document.getElementById('st-sniper-dot2');
    if (dot) {
        dot.className = 'st-dot st-dot-' + type;
        const txt = dot.parentElement?.querySelector('span');
        if (txt) txt.textContent = msg;
    }
}

// ─── Update Sniper (price drop + resale) — also uses GM_xmlhttpRequest ───
function saveUpdateSniperSettings() { try { GM_setValue('st_update_sniper', JSON.stringify(updateSniperSettings)); } catch(_) {} }
function loadUpdateSniperSettings() { try { const s = JSON.parse(GM_getValue('st_update_sniper', 'null')); if (s) Object.assign(updateSniperSettings, s); } catch(_) {} }

async function fetchAllCatalogItems() {
    // Fetch pages 0,1,2 in parallel for 3x coverage
    const results = await Promise.all([0, 1, 2].map(p =>
        fetch(BASE + '/apisite/catalog/v1/search/items?limit=28&sortType=2&_=' + Date.now() + (p ? '&page=' + p : ''), { credentials: 'include', cache: 'no-store' })
            .then(r => r.json()).then(j => j.data || []).catch(() => [])
    ));
    const seen = {};
    return results.flat().filter(item => seen[item.id] ? false : (seen[item.id] = true));
}

async function runUpdateSniperCheck() {
    if (!updateSniperActive) return;
    try {
        const items = await fetchAllCatalogItems();
        for (const item of items) {
            const id = item.id, prev = updatePriceMap[id];
            const curPrice   = item.lowestPrice ?? item.price ?? 0;
            const curForSale = item.isForSale || (item.lowestSellerData != null);
            if (!prev) { updatePriceMap[id] = { price: curPrice, forSale: curForSale, name: item.name }; continue; }

            if (updateSniperSettings.priceDropEnabled && prev.price > 0 && curPrice > 0) {
                const dropPct = ((prev.price - curPrice) / prev.price) * 100;
                if (dropPct >= updateSniperSettings.priceDropPercent) {
                    log(`📉 Price drop: ${item.name}  R$${prev.price}→R$${curPrice} (${dropPct.toFixed(1)}% drop)`, 'success');
                    fireUpdateNotification('📉 Price Drop!', `${item.name}  R$${prev.price}→R$${curPrice}`);
                    fireUpdateSound();
                    if (itemPassesFilters(item)) await onSniperHit({ id, assetId: String(id), name: item.name, price: curPrice, currency: 1, sellerId: item.lowestSellerData?.userId || item.creatorTargetId || null, itemRestrictions: item.itemRestrictions || [] });
                }
            }
            if (updateSniperSettings.resaleEnabled && !prev.forSale && curForSale) {
                log(`🔓 Back on sale: ${item.name}${curPrice ? '  R$' + curPrice : ''}`, 'success');
                fireUpdateNotification('🔓 Back On Sale!', item.name + (curPrice ? '  R$' + curPrice : ''));
                fireUpdateSound();
                if (itemPassesFilters(item)) await onSniperHit({ id, assetId: String(id), name: item.name, price: curPrice, currency: 1, sellerId: item.lowestSellerData?.userId || item.creatorTargetId || null, itemRestrictions: item.itemRestrictions || [] });
            }
            updatePriceMap[id] = { price: curPrice, forSale: curForSale, name: item.name };
        }
    } catch(e) { if (updateSniperActive) log('Update sniper error: ' + e.message, 'err'); }
}

function fireUpdateNotification(title, body) {
    try {
        const doN = () => new Notification(title, { body, icon: BASE + '/favicon.ico', silent: true });
        if (Notification.permission === 'granted') doN();
        else if (Notification.permission !== 'denied') Notification.requestPermission().then(p => { if (p === 'granted') doN(); });
    } catch(_) {}
}

function startUpdateSniper() {
    loadUpdateSniperSettings();
    updateSniperActive = true; updatePriceMap = {};
    (async () => { while (updateSniperActive) { await runUpdateSniperCheck(); await sleep(0); } })();
    log('📡 Update Sniper started', 'success');
    setUpdateSniperStatus(true);
    try { GM_setValue('updateSniperActive', true); } catch(_) {}
}
function stopUpdateSniper()  {
    updateSniperActive = false; updatePriceMap = {};
    setUpdateSniperStatus(false); log('📡 Update Sniper stopped', 'warn');
    try { GM_setValue('updateSniperActive', false); } catch(_) {}
}
function toggleUpdateSniper() { updateSniperActive ? stopUpdateSniper() : startUpdateSniper(); }
function setUpdateSniperStatus(active) {
    const btn = document.getElementById('st-update-sniper-btn'); if (!btn) return;
    btn.textContent = active ? '⏹ Stop Update Sniper' : '📡 Start Update Sniper';
    btn.style.background = active ? 'linear-gradient(135deg,#16a34a,#15803d)' : '';
    const dot = document.getElementById('st-update-dot'); if (dot) dot.className = 'st-dot ' + (active ? 'st-dot-active' : 'st-dot-idle');
    const txt = document.getElementById('st-update-txt'); if (txt) txt.textContent = active ? 'Watching for price drops & resales…' : 'Idle';
}

// ─── Redirect Sniper — NOW uses GM_xmlhttpRequest (same engine as auto-buy) ──
// This makes it bypass browser connection limits and run at full speed

let redirectInFlight = 0, redirectAbort = null, redirectDispatch = null;
let _redirectLastHash = '';

function saveRedirectSniperSettings() {
    redirectSniperSettings.redirectNew     = document.getElementById('st-redirect-new')?.classList.contains('on') ?? true;
    redirectSniperSettings.redirectUpdated = document.getElementById('st-redirect-updated')?.classList.contains('on') ?? false;
    try { GM_setValue('st_redirect_sniper', JSON.stringify(redirectSniperSettings)); } catch(_) {}
}
function loadRedirectSniperSettings() {
    try { const s = JSON.parse(GM_getValue('st_redirect_sniper', 'null')); if (s) Object.assign(redirectSniperSettings, s); } catch(_) {}
    const setOn = (id, val) => {
        const el = document.getElementById(id); if (!el) return;
        if (val) { el.classList.add('on'); el.style.background = 'var(--c-accent)'; el.querySelector('.st-toggle-thumb').style.transform = 'translateX(18px)'; }
        else      { el.classList.remove('on'); el.style.background = ''; el.querySelector('.st-toggle-thumb').style.transform = ''; }
    };
    setOn('st-redirect-new',     redirectSniperSettings.redirectNew);
    setOn('st-redirect-updated', redirectSniperSettings.redirectUpdated);
}

function redirectDispatchOne(signal) {
    if (!redirectSniperActive || signal.aborted) return;
    redirectInFlight++;
    const t0 = performance.now();
    GM_xmlhttpRequest({
        method: 'GET',
        url: BASE + '/apisite/catalog/v1/search/items?limit=28&sortType=2&_=' + Date.now(),
        headers: { 'Accept': 'application/json' },
        timeout: 8000,
        onload: (r) => {
            if (!redirectSniperActive || signal.aborted) { redirectInFlight--; return; }
            redirectInFlight--;
            apiScannerRecord('GET', '/apisite/catalog/v1/search/items', r.status, Math.round(performance.now() - t0));

            // Hash-diff — skip if identical to last response
            const hash = fastHash(r.responseText);
            if (hash === _redirectLastHash) return;
            _redirectLastHash = hash;

            let json; try { json = JSON.parse(r.responseText); } catch(_) { return; }
            const items = json.data || [];

            for (const item of items) {
                const id       = String(item.id);
                const curPrice   = item.lowestPrice ?? item.price ?? 0;
                const curForSale = !!item.isForSale || item.lowestSellerData != null;
                const prev       = redirectSniperSeenIds[id];

                if (!prev) {
                    if (redirectSniperSettings.redirectNew && Object.keys(redirectSniperSeenIds).length > 0) {
                        log('🔗 New item — opening: ' + (item.name || 'ID ' + id), 'success');
                        fireUpdateNotification('🔗 New Item!', item.name || 'ID ' + id);
                        fireUpdateSound();
                        window.open(BASE + '/catalog/' + id + '/', '_blank');
                    }
                    redirectSniperSeenIds[id] = { price: curPrice, forSale: curForSale };
                    continue;
                }

                if (redirectSniperSettings.redirectUpdated) {
                    const priceChanged = prev.price !== curPrice && curPrice > 0;
                    const saleChanged  = !prev.forSale && curForSale;
                    if (priceChanged || saleChanged) {
                        const reason = saleChanged ? 'back on sale' : `R$${prev.price}→R$${curPrice}`;
                        log(`🔗 Update — opening: ${item.name || 'ID ' + id} (${reason})`, 'success');
                        fireUpdateNotification('🔗 Item Updated!', (item.name || 'ID ' + id) + ' — ' + reason);
                        window.open(BASE + '/catalog/' + id + '/', '_blank');
                    }
                }
                redirectSniperSeenIds[id] = { price: curPrice, forSale: curForSale };
            }
        },
        onerror:   () => { redirectInFlight--; },
        ontimeout: () => { redirectInFlight--; },
        onabort:   () => { redirectInFlight--; },
    });
}

async function startRedirectSniper() {
    loadRedirectSniperSettings();
    redirectSniperActive = true; redirectSniperSeenIds = {}; _redirectLastHash = '';

    // Snapshot current catalog first
    try {
        const r = await fetch(BASE + '/apisite/catalog/v1/search/items?limit=28&sortType=2&_=' + Date.now(), { credentials: 'include', cache: 'no-store' });
        const j = await r.json();
        (j.data || []).forEach(item => {
            redirectSniperSeenIds[String(item.id)] = { price: item.lowestPrice ?? item.price ?? 0, forSale: !!item.isForSale || item.lowestSellerData != null };
        });
        log('🔗 Redirect Sniper armed — ' + Object.keys(redirectSniperSeenIds).length + ' items snapshotted', 'success');
    } catch(_) {}

    setRedirectSniperStatus(true);
    try { GM_setValue('redirectSniperActive', true); } catch(_) {}

    // Same dispatch loop as auto-buy — GM_xmlhttpRequest powered, full concurrency
    redirectAbort = new AbortController();
    const signal  = redirectAbort.signal;
    redirectInFlight = 0;

    redirectDispatch = setInterval(() => {
        if (!redirectSniperActive) { clearInterval(redirectDispatch); return; }
        // 4 parallel workers — more than enough for fast redirect detection
        while (redirectInFlight < 4 && redirectSniperActive) redirectDispatchOne(signal);
    }, DISPATCH_MS);
}

function stopRedirectSniper() {
    redirectSniperActive = false;
    if (redirectAbort)    { redirectAbort.abort(); redirectAbort = null; }
    if (redirectDispatch) { clearInterval(redirectDispatch); redirectDispatch = null; }
    redirectSniperSeenIds = {};
    setRedirectSniperStatus(false);
    log('🔗 Redirect Sniper stopped', 'warn');
    try { GM_setValue('redirectSniperActive', false); } catch(_) {}
}
function toggleRedirectSniper() { redirectSniperActive ? stopRedirectSniper() : startRedirectSniper(); }
function setRedirectSniperStatus(active) {
    const btn = document.getElementById('st-redirect-sniper-btn'); if (!btn) return;
    btn.textContent = active ? '⏹ Stop Redirect Sniper' : '🔗 Start Redirect Sniper';
    btn.style.background = active ? 'linear-gradient(135deg,#059669,#047857)' : '';
    const dot = document.getElementById('st-redirect-dot'); if (dot) dot.className = 'st-dot ' + (active ? 'st-dot-active' : 'st-dot-idle');
    const txt = document.getElementById('st-redirect-txt'); if (txt) txt.textContent = active ? 'Watching — opens item page on new/updated item…' : 'Idle';
}

// ─── Sniper Pill ──────────────────────────────────────────────────────────
function showSniperPill() { const p = document.getElementById('st-sniper-pill'); if (p && !document.getElementById('st-overlay')?.classList.contains('open')) p.classList.add('visible'); }
function hideSniperPill()  { document.getElementById('st-sniper-pill')?.classList.remove('visible'); }
function updateSniperPill(checks, cps) { const c = document.getElementById('st-pill-checks'); if (c) c.textContent = checks > 0 ? ` · ${checks.toLocaleString()} checks  ${cps}/s` : ''; }
