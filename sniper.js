// ─── Sniper ───────────────────────────────────────────────────────────────
function recordRtt(ms) {
    rttSamples.push(ms);
    if (rttSamples.length > RTT_WINDOW) rttSamples.shift();
    let s = 0; rttSamples.forEach(x => s += x); avgRtt = Math.round(s / rttSamples.length);
    if (rttSamples.length % 10 === 0) {
        if (avgRtt < RTT_TARGET && concurrency < MAX_INFLIGHT) concurrency++;
        else if (avgRtt > RTT_TARGET && concurrency > MIN_INFLIGHT) concurrency--;
    }
    schedDomUpdate();
}

function schedDomUpdate() {
    if (domPending) return; domPending = true;
    requestAnimationFrame(() => {
        domPending = false;
        const s = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
        s('st-checks', checkCount.toLocaleString());
        s('st-cps',    checksPerSec+'/s');
        s('st-rtt',    avgRtt ? avgRtt+'ms' : '—');
        s('st-conc',   'x'+concurrency);
        const fill = document.getElementById('st-rtt-fill');
        if (fill) fill.style.width = Math.min(100, (avgRtt/500)*100)+'%';
        if (typeof updateSniperPill === 'function') updateSniperPill(checkCount, checksPerSec);
    });
}

// ─── Sniper Settings ─────────────────────────────────────────────────────
function saveSniperSettings() {
    try { GM_setValue('st_sniper_settings', JSON.stringify(sniperSettings)); } catch(_) {}
}

function loadSniperSettings() {
    try {
        const saved = JSON.parse(GM_getValue('st_sniper_settings', 'null'));
        if (saved && typeof saved === 'object') Object.assign(sniperSettings, saved);
    } catch(_) {}
    syncSniperSettingsUI();
}

function syncSniperSettingsUI() {
    const g = (id, val) => { const e = document.getElementById(id); if (e) e.value = val; };
    const t = (id, val) => { const e = document.getElementById(id); if (e) setToggle(id, val); };
    g('st-snip-max-robux', sniperSettings.maxPriceRobux);
    g('st-snip-max-tix',   sniperSettings.maxPriceTix);
    g('st-snip-delay',     sniperSettings.delayMs);
    t('st-snip-limiteds',  sniperSettings.limitedsOnly);
    t('st-snip-limitedu',  sniperSettings.limitedUsOnly);
    t('st-snip-robux-only',sniperSettings.robuxOnly);
    t('st-snip-tix-only',  sniperSettings.tixOnly);
}

// Returns true if item should be sniped based on current settings
function itemPassesFilters(item) {
    const restrictions = item.itemRestrictions || [];
    const isLimited  = restrictions.includes('Limited') || restrictions.includes('LimitedUnique');
    const isLimitedU = restrictions.includes('LimitedUnique');
    const isTix      = item.priceTickets != null && item.priceTickets > 0;
    const isRobux    = !isTix;
    const price      = item.lowestPrice ?? item.price ?? 0;
    const priceTix   = item.priceTickets ?? 0;

    if (sniperSettings.limitedsOnly  && !isLimited)  { log('⏭ Skipped (not limited): '      + (item.name||item.id), 'info'); return false; }
    if (sniperSettings.limitedUsOnly && !isLimitedU) { log('⏭ Skipped (not LimitedU): '     + (item.name||item.id), 'info'); return false; }
    if (sniperSettings.robuxOnly     && !isRobux)    { log('⏭ Skipped (not Robux item): '   + (item.name||item.id), 'info'); return false; }
    if (sniperSettings.tixOnly       && !isTix)      { log('⏭ Skipped (not Tix item): '     + (item.name||item.id), 'info'); return false; }

    if (sniperSettings.maxPriceRobux !== '' && isRobux) {
        const max = parseInt(sniperSettings.maxPriceRobux);
        if (!isNaN(max) && price > max) { log('⏭ Skipped (R$' + price + ' > max R$' + max + '): ' + (item.name||item.id), 'info'); return false; }
    }
    if (sniperSettings.maxPriceTix !== '' && isTix) {
        const max = parseInt(sniperSettings.maxPriceTix);
        if (!isNaN(max) && priceTix > max) { log('⏭ Skipped (T$' + priceTix + ' > max T$' + max + '): ' + (item.name||item.id), 'info'); return false; }
    }

    return true;
}

// ─── Resolve full item details before buying ──────────────────────────────
async function resolveItemDetailsForBuy(rawItem) {
    try {
        const r = await fetch(BASE + '/apisite/catalog/v1/catalog/items/details', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(rawItem.id) }] }),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        const d = j.data?.[0];
        if (!d) throw new Error('No data');
        return {
            id:       rawItem.id,
            assetId:  String(d.id || rawItem.id),
            name:     d.name || rawItem.name,
            price:    d.lowestPrice ?? d.price ?? rawItem.price ?? 0,
            currency: 1,
            sellerId: d.creatorTargetId || d.sellerId || null,
        };
    } catch(e) {
        log('⚠ Could not resolve item details: ' + e.message + ' — using raw data', 'warn');
        return rawItem;
    }
}

// ─── Browser notification ─────────────────────────────────────────────────
function fireSnipeNotification(item) {
    try {
        const doNotif = () => {
            new Notification('🎯 Item Sniped!', {
                body: item.name + (item.price > 0 ? '  ·  R$' + item.price : '  ·  FREE'),
                icon: 'https://www.strrev.com/favicon.ico',
                badge: 'https://www.strrev.com/favicon.ico',
                requireInteraction: false,
                silent: true,
            });
        };
        if (Notification.permission === 'granted') {
            doNotif();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(p => { if (p === 'granted') doNotif(); });
        }
    } catch(_) {}
}

// ─── Alert sound ──────────────────────────────────────────────────────────
function fireSnipeSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Rising triumphant chord sting
        const notes = [
            { freq: 523.25, start: 0,    dur: 0.18, vol: 0.30 },  // C5
            { freq: 659.25, start: 0.05, dur: 0.18, vol: 0.28 },  // E5
            { freq: 783.99, start: 0.10, dur: 0.22, vol: 0.28 },  // G5
            { freq: 1046.5, start: 0.15, dur: 0.38, vol: 0.35 },  // C6 — top note
        ];
        notes.forEach(({ freq, start, dur, vol }) => {
            const osc = ctx.createOscillator();
            const g   = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0, ctx.currentTime + start);
            g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.012);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur + 0.05);
        });
    } catch(_) {}
}

async function onSniperHit(rawItem) {
    log('🎯 SNIPED: ' + (rawItem.name || 'ID ' + rawItem.id), 'success');
    setSniperStatus('🎯 Item sniped! Resolving details...', 'hot');
    updateSniperBtn(false);

    // Resolve full item details (price, real sellerId) before attempting buy
    const item = await resolveItemDetailsForBuy(rawItem);
    if (!item.sellerId) {
        log('⚠ Could not resolve sellerId for ' + item.name + ' — buy may fail', 'warn');
    }

    log('💰 Price: ' + (item.price === 0 ? 'FREE' : 'R$' + item.price) + ' | Seller: ' + (item.sellerId || '?'), 'info');
    setSniperStatus('🎯 Item sniped! Buying...', 'hot');

    // Sound + notification
    fireSnipeSound();
    fireSnipeNotification(item);

    // Flash title
    const orig = document.title; let n = 0;
    const iv = setInterval(() => {
        document.title = n++ % 2 === 0 ? '🚨 ' + item.name + ' SNIPED!' : orig;
        if (n >= 12) { clearInterval(iv); document.title = orig; }
    }, 380);

    // Auto-buy
    let bought = false;
    if (selectedAcctIdx === -2) {
        if (accounts.length) {
            const results = await Promise.all(accounts.map((_, i) => buyForAcct(i, item)));
            bought = results.some(Boolean);
        } else {
            log('No accounts saved — buying as session fallback', 'warn');
            bought = await buyForSession(item);
        }
    } else if (selectedAcctIdx === -1) {
        bought = await buyForSession(item);
    } else if (accounts[selectedAcctIdx]) {
        bought = await buyForAcct(selectedAcctIdx, item);
    }

    if (bought) {
        log('✅ Buy successful for ' + item.name, 'success');
        setSniperStatus('✅ Bought! Rearming in 3s...', 'loading');
    } else {
        log('❌ Buy attempt failed for ' + item.name, 'err');
        setSniperStatus('❌ Buy failed — check log. Rearming in 3s...', 'loading');
    }

    setTimeout(() => { if (!sniperActive) startSniper(); }, 3000);
}

function dispatchOne(signal) {
    if (!sniperActive || signal.aborted) return;
    inFlight++;
    const t0 = performance.now();
    fetch(CATALOG_API+'&_='+Date.now(), { credentials:'include', cache:'no-store', signal })
        .then(r => r.json())
        .then(async json => {
            if (!sniperActive || signal.aborted) { inFlight--; return; }
            recordRtt(performance.now() - t0);
            checkCount++; cpsCount++; inFlight--;
            const d = json.data;
            if (d) {
                for (let i = 0; i < d.length; i++) {
                    const item = d[i];
                    if (!sniperBlacklist[item.id]) {
                        // Apply user filters before committing to a snipe
                        if (!itemPassesFilters(item)) {
                            // Add to blacklist so we don't re-evaluate this item on next poll
                            sniperBlacklist[item.id] = true;
                            continue;
                        }
                        sniperActive = false; abortCtrl.abort();
                        clearInterval(dispatchTimer); clearInterval(cpsTimer);
                        dispatchTimer = null;
                        GM_setValue('sniperActive', false);
                        await onSniperHit({
                            id:              item.id,
                            assetId:         String(item.id),
                            name:            item.name || 'Item #'+item.id,
                            price:           item.lowestPrice ?? item.price ?? 0,
                            currency:        item.priceTickets ? 2 : 1,
                            sellerId:        item.creatorTargetId || null,
                            itemRestrictions: item.itemRestrictions || [],
                            priceTickets:    item.priceTickets ?? null,
                        });
                        return;
                    }
                }
            }
        })
        .catch(e => {
            inFlight--;
            if (!sniperActive || signal.aborted || e.name === 'AbortError') return;
            log('Fetch err: '+e.message, 'err');
        });
}

function startDispatch() {
    if (typeof showSniperPill === 'function') showSniperPill();
    abortCtrl   = new AbortController();
    const signal = abortCtrl.signal;
    concurrency = 3; inFlight = 0; rttSamples = []; avgRtt = 0; cpsCount = 0;
    const delayMs = (sniperSettings.delayMs > 0 ? sniperSettings.delayMs : DISPATCH_MS);
    dispatchTimer = setInterval(() => {
        if (!sniperActive) { clearInterval(dispatchTimer); return; }
        if (inFlight < concurrency) dispatchOne(signal);
    }, delayMs);
    cpsTimer = setInterval(() => { checksPerSec = cpsCount; cpsCount = 0; schedDomUpdate(); }, 1000);
}

async function startSniper() {
    loadSniperSettings();
    const btn = document.getElementById('st-sniper-btn');
    if (btn) { btn.innerHTML='<span class="st-spin">↻</span> Snapshotting...'; btn.disabled=true; }
    setSniperStatus('Fetching catalog snapshot...', 'loading');
    try {
        sniperBlacklist = await fetchCatalogIDs();
        sniperActive = true; checkCount = 0;
        GM_setValue('sniperActive', true);
        GM_setValue('sniperBlacklist', JSON.stringify(sniperBlacklist));
        log('Sniper armed — '+Object.keys(sniperBlacklist).length+' items blacklisted', 'success');
        updateSniperBtn(true);
        setSniperStatus('Sniping for new items...', 'active');
        if (btn) btn.disabled = false;
        if (typeof showSniperPill === 'function') showSniperPill();
        startDispatch();
    } catch(e) {
        log('Snapshot failed: '+e.message, 'err');
        setSniperStatus('Snapshot failed — try again', 'idle');
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

function toggleSniper() { if (sniperActive) stopSniper(); else startSniper(); }

function updateSniperBtn(active) {
    const btn = document.getElementById('st-sniper-btn'); if (!btn) return;
    if (active) {
        btn.innerHTML        = '⏹ Stop Sniper';
        btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
        btn.style.boxShadow  = '0 0 20px rgba(34,197,94,0.25)';
        btn.classList.add('st-sniper-active');
    } else {
        btn.innerHTML        = '🎯 Start Sniper';
        btn.style.background = 'linear-gradient(135deg,#e94560,#b91c4a)';
        btn.style.boxShadow  = '0 0 20px rgba(233,69,96,0.2)';
        btn.classList.remove('st-sniper-active');
    }
}

function setSniperStatus(msg, type) {
    const el = document.getElementById('st-sniper-status'); if (!el) return;
    const dot  = el.querySelector('.st-dot');
    const text = el.querySelector('.st-dot-text');
    if (text) text.textContent = msg;
    if (dot)  dot.className   = 'st-dot st-dot-'+type;
    const bgs = { active:'rgba(34,197,94,0.05)', hot:'rgba(233,69,96,0.08)', idle:'#060c18', loading:'#060c18' };
    el.style.background = bgs[type] || '#060c18';
}
