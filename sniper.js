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

async function onSniperHit(item) {
    log('🎯 SNIPED: '+(item.name||'ID '+item.id), 'success');
    setSniperStatus('🎯 Item sniped! Buying...', 'hot');
    updateSniperBtn(false);

    // Alert sound
    try {
        const ctx = new (window.AudioContext||window.webkitAudioContext)();
        [[880,0,0.12],[1100,0.13,0.12],[880,0.26,0.18]].forEach(([freq,start,dur]) => {
            const osc=ctx.createOscillator(), g=ctx.createGain();
            osc.connect(g); g.connect(ctx.destination); osc.type='sine'; osc.frequency.value=freq;
            g.gain.setValueAtTime(0, ctx.currentTime+start);
            g.gain.linearRampToValueAtTime(0.35, ctx.currentTime+start+0.01);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+start+dur);
            osc.start(ctx.currentTime+start); osc.stop(ctx.currentTime+start+dur+0.05);
        });
    } catch(_){}

    // Flash title
    const orig = document.title; let n = 0;
    const iv = setInterval(() => { document.title = n++%2===0 ? '🚨 ITEM SNIPED!' : orig; if(n>=10){clearInterval(iv);document.title=orig;} }, 400);

    // Silent auto-buy
    if (selectedAcctIdx === -2) {
        if (accounts.length) await Promise.all(accounts.map((_,i) => buyForAcct(i,item)));
        else log('No accounts for auto-buy', 'warn');
    } else if (selectedAcctIdx === -1) {
        await buyForSession(item);
    } else if (accounts[selectedAcctIdx]) {
        await buyForAcct(selectedAcctIdx, item);
    }

    setSniperStatus('Done — restarting in 3s...', 'loading');
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
                        sniperActive = false; abortCtrl.abort();
                        clearInterval(dispatchTimer); clearInterval(cpsTimer);
                        dispatchTimer = null;
                        GM_setValue('sniperActive', false);
                        await onSniperHit({
                            id:       item.id,
                            assetId:  String(item.id),
                            name:     item.name || 'Item #'+item.id,
                            price:    item.lowestPrice || item.price || 0,
                            currency: 1,
                            sellerId: item.creatorTargetId || 1,
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
    dispatchTimer = setInterval(() => {
        if (!sniperActive) { clearInterval(dispatchTimer); return; }
        if (inFlight < concurrency) dispatchOne(signal);
    }, DISPATCH_MS);
    cpsTimer = setInterval(() => { checksPerSec = cpsCount; cpsCount = 0; schedDomUpdate(); }, 1000);
}

async function startSniper() {
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
