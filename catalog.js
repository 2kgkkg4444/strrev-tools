// ─── Catalog State ────────────────────────────────────────────────────────
let catalogItems      = [];
let catalogCursor     = '';
let catalogNextCursor = '';
let catalogPrevCursor = '';
let catalogTotal      = 0;
let catalogPageNum    = 1;
let catalogLoading    = false;
let catalogCategory   = 'Featured';
let catalogSort       = '2'; // default to newest first
let catalogSearch     = '';

const CATALOG_PAGE_SIZE = 28;
const ASSET_TYPE_NAMES = { 8:'Hat', 18:'Face', 19:'Gear', 42:'Glasses', 43:'Neck', 44:'Shoulder', 45:'Front', 46:'Back', 47:'Waist', 27:'Torso', 28:'Arm', 29:'Leg', 30:'Head' };

// ─── Fetch one catalog page ───────────────────────────────────────────────
async function fetchCatalogPage(cursor, category, sortType, keyword) {
    let url = BASE + '/apisite/catalog/v1/search/items'
        + '?category=' + encodeURIComponent(category)
        + '&limit=' + CATALOG_PAGE_SIZE
        + '&sortType=' + sortType
        + '&_=' + Date.now();
    if (cursor)  url += '&cursor='  + encodeURIComponent(cursor);
    if (keyword) url += '&keyword=' + encodeURIComponent(keyword);

    const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    catalogNextCursor = j.nextPageCursor || '';
    catalogPrevCursor = j.previousPageCursor || '';
    catalogTotal      = j._total || 0;
    const searchData  = j.data || [];
    if (!searchData.length) return [];

    const ids = searchData.map(x => ({ itemType: x.itemType || 'Asset', id: x.id }));
    const detailsBody = JSON.stringify({ items: ids });

    const doDetails = async (token) => fetch(BASE + '/apisite/catalog/v1/catalog/items/details', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'x-csrf-token': token } : {}) },
        body: detailsBody,
    });

    let dr = await doDetails(sessionCsrf || null);
    if (dr.status === 403 || dr.status === 401) {
        const t = dr.headers.get('x-csrf-token') || await refreshSessionCsrf(true);
        if (t) dr = await doDetails(t);
    }
    if (!dr.ok) throw new Error('Details HTTP ' + dr.status);
    const dj = await dr.json();
    return dj.data || [];
}

// ─── Build catalog item card ──────────────────────────────────────────────
function buildCatalogCard(item) {
    const isTix      = item.priceTickets != null && item.price == null;
    const isLimited  = item.itemRestrictions?.includes('Limited');
    const isLimitedU = item.itemRestrictions?.includes('LimitedUnique');
    const isAnyLtd   = isLimited || isLimitedU;
    const isForSale  = item.isForSale;
    // FIX: free items (price=0 or null) are always buyable regardless of isForSale flag
    const isFree     = !isTix && !isAnyLtd && (item.price === 0 || item.price === null);

    const displayPrice = isAnyLtd
        ? (item.lowestPrice != null ? item.lowestPrice : null)
        : (isTix ? item.priceTickets : item.price);

    const accentC = isAnyLtd ? '#f59e0b' : isTix ? '#eab308' : isFree ? '#22c55e' : '#f97316';
    const bgC     = isAnyLtd ? 'rgba(245,158,11,0.12)' : isTix ? 'rgba(234,179,8,0.12)' : isFree ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)';
    const assetIcons = { 8:'🎩',18:'😊',19:'⚔️',42:'🕶️',43:'👔',44:'🦜',45:'🎗️',46:'🎒',47:'🪢',27:'👕',28:'🦾',29:'🦿',30:'👤' };
    const icon = isLimitedU ? '💎' : isLimited ? '🏅' : assetIcons[item.assetType] || (isTix ? '🪙' : isFree ? '🎁' : '🛍️');

    const li = document.createElement('li');
    li.className = 'st-cat-card';
    li.dataset.name = (item.name || '').toLowerCase();
    li.style.cssText = 'opacity:0;transform:translateY(8px);';
    requestAnimationFrame(() => {
        li.style.transition = 'opacity 0.18s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1), border-color 0.14s, background 0.14s';
        li.style.opacity    = '1'; li.style.transform = 'translateY(0)';
    });

    // Tooltip
    const rapVal = item.rap > 0 ? 'R$' + item.rap.toLocaleString() : '—';
    const lowestP = item.lowestPrice != null ? 'R$' + item.lowestPrice.toLocaleString() : '—';
    const origP   = item.priceTickets != null ? 'T$' + item.priceTickets.toLocaleString() : (item.price != null ? 'R$' + item.price.toLocaleString() : '—');
    let changeStr = '—', changeColor = 'var(--c-text4)';
    if (item.rap > 0 && item.lowestPrice > 0) {
        const diff = item.lowestPrice - item.rap, pct = ((diff / item.rap) * 100).toFixed(1);
        changeStr = (diff >= 0 ? '+' : '') + 'R$' + Math.abs(diff).toLocaleString() + ' (' + (diff >= 0 ? '+' : '-') + pct + '%)';
        changeColor = diff >= 0 ? '#22c55e' : '#ef4444';
    }
    const rows = [
        ['RAP',          rapVal,                                              '#f97316'],
        ['Lowest Price', lowestP,                                             '#a855f7'],
        ['Orig Price',   origP,                                               'var(--c-text2)'],
        ['Change',       changeStr,                                           changeColor],
        ['Total Sold',   item.saleCount   != null ? item.saleCount.toLocaleString()   : '—', 'var(--c-text2)'],
        ['Serial Count', item.serialCount != null ? item.serialCount.toLocaleString() : '—', 'var(--c-text2)'],
        ['Added',        item.createdAt ? new Date(item.createdAt).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}) : '—', 'var(--c-text4)'],
    ];
    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;z-index:2147483647;width:240px;background:#060c18;border:1px solid #1e3a5f;border-radius:13px;padding:13px 15px;pointer-events:none;opacity:0;transition:opacity 0.12s;box-shadow:0 12px 40px rgba(0,0,0,0.7);display:none;';
    tip.innerHTML = `<div style="font-size:11px;font-weight:700;color:#f1f5f9;margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name || 'Item'}</div>` +
        rows.map(([l, v, c]) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:9px;color:#334155;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">${l}</span><span style="font-size:10px;font-weight:700;font-family:monospace;color:${c};">${v}</span></div>`).join('') +
        (item.description ? `<div style="font-size:9px;color:#334155;margin-top:8px;border-top:1px solid #0a1525;padding-top:7px;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${item.description.slice(0,120)}</div>` : '');
    document.body.appendChild(tip);

    let hoverTimer;
    li.addEventListener('mouseenter', (e) => {
        hoverTimer = setTimeout(() => {
            tip.style.display = 'block';
            const rect = li.getBoundingClientRect();
            let top = rect.top - tip.offsetHeight - 8, left = rect.left + rect.width / 2 - 120;
            if (top < 8) top = rect.bottom + 8;
            if (left < 8) left = 8;
            if (left + 240 > window.innerWidth - 8) left = window.innerWidth - 248;
            tip.style.top = top + 'px'; tip.style.left = left + 'px'; tip.style.opacity = '1';
        }, 150);
    });
    li.addEventListener('mouseleave', () => { clearTimeout(hoverTimer); tip.style.opacity = '0'; setTimeout(() => { if (tip.style.opacity === '0') tip.style.display = 'none'; }, 130); });

    // Icon box
    const iconBox = document.createElement('div');
    iconBox.className = 'st-cat-card-icon';
    iconBox.style.background = bgC;
    iconBox.textContent = icon;

    // Info
    const info = document.createElement('div'); info.style.cssText = 'flex:1;min-width:0;';
    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-size:12px;font-weight:600;color:var(--c-text0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;';
    nameEl.textContent = item.name || 'Item #' + item.id; nameEl.title = item.name || '';
    const meta = document.createElement('div'); meta.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;';

    const typeBadge = document.createElement('span');
    typeBadge.style.cssText = 'font-size:9px;padding:1px 6px;border-radius:4px;background:var(--c-bg2);border:1px solid var(--c-border);color:var(--c-text4);';
    typeBadge.textContent = ASSET_TYPE_NAMES[item.assetType] || 'Item';
    meta.appendChild(typeBadge);

    if (isLimitedU) { const b = document.createElement('span'); b.style.cssText = 'font-size:9px;padding:1px 6px;border-radius:4px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;font-weight:700;'; b.textContent = 'LimitedU'; meta.appendChild(b); }
    else if (isLimited) { const b = document.createElement('span'); b.style.cssText = 'font-size:9px;padding:1px 6px;border-radius:4px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#d97706;font-weight:700;'; b.textContent = 'Limited'; meta.appendChild(b); }
    if (isAnyLtd && item.rap > 0) { const r = document.createElement('span'); r.style.cssText = 'font-size:9px;color:var(--c-text4);font-family:"Fira Code",monospace;'; r.textContent = 'RAP: ' + item.rap.toLocaleString(); meta.appendChild(r); }
    if (isAnyLtd && item.lowestSellerData) { const s = document.createElement('span'); s.style.cssText = 'font-size:9px;color:var(--c-text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'; s.textContent = '↓ ' + item.lowestSellerData.username; meta.appendChild(s); }
    if (!isForSale && !isAnyLtd && !isFree) { const o = document.createElement('span'); o.style.cssText = 'font-size:9px;color:var(--c-err);'; o.textContent = 'Off Sale'; meta.appendChild(o); }
    info.append(nameEl, meta);

    // Price
    const priceEl = document.createElement('div');
    priceEl.style.cssText = `padding:5px 10px;border-radius:7px;background:${bgC};border:1px solid ${accentC}44;font-size:12px;font-weight:700;color:${accentC};font-family:"Fira Code",monospace;white-space:nowrap;flex-shrink:0;text-align:right;`;
    if (displayPrice == null) { priceEl.textContent = '—'; priceEl.style.color = 'var(--c-text4)'; }
    else if (isFree || displayPrice === 0) { priceEl.textContent = 'FREE'; }
    else { priceEl.textContent = (isTix ? 'T$' : 'R$') + displayPrice.toLocaleString(); }

    // ─── FIX: canBuy now correctly includes free items ────────────────────
    const canBuy = isFree || isForSale || (isAnyLtd && item.lowestSellerData);
    const btn = document.createElement('button');
    btn.style.cssText = `padding:9px 14px;background:${canBuy ? `linear-gradient(135deg,${accentC},${accentC}bb)` : 'var(--c-bg3)'};color:${canBuy ? '#000' : 'var(--c-text4)'};border:${canBuy ? 'none' : '1px solid var(--c-border2)'};border-radius:9px;cursor:${canBuy ? 'pointer' : 'not-allowed'};font-size:11px;font-weight:700;flex-shrink:0;transition:opacity 0.12s,transform 0.1s;white-space:nowrap;`;
    btn.textContent = isFree ? '🎁 Claim' : canBuy ? '🛒 Buy' : '✕ N/A';
    btn.disabled    = !canBuy;

    if (canBuy) {
        btn.title = (isFree ? 'Claim ' : 'Buy ') + item.name;
        btn.onmouseenter = () => { btn.style.opacity = '0.82'; btn.style.transform = 'translateY(-1px)'; };
        btn.onmouseleave = () => { btn.style.opacity = '1';    btn.style.transform = 'translateY(0)'; };
        btn.addEventListener('click', () => {
            const buyItemObj = {
                assetId:    String(item.id),
                name:       item.name,
                // FIX: for free items use price=0 explicitly
                price:      isAnyLtd ? (item.lowestSellerData?.price ?? 0)
                            : isFree  ? 0
                            : isTix   ? 0
                            : (item.price ?? 0),
                currency:   isTix ? 2 : 1,
                sellerId:   isAnyLtd ? (item.lowestSellerData?.userId ?? item.creatorTargetId)
                            : (item.creatorTargetId ?? null),
                userAssetId: isAnyLtd ? (item.lowestSellerData?.userAssetId ?? null) : null,
            };
            buyItemCatalog(buyItemObj, btn);
        });
    }

    li.append(iconBox, info, priceEl, btn);
    return li;
}

// ─── Catalog buy (uses unified buy system) ────────────────────────────────
async function buyItemCatalog(item, btn) {
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span>'; btn.disabled = true; }
    log((item.price === 0 ? 'Claiming free: ' : 'Buying: ') + item.name, 'info');

    // For free items always resolve the real seller
    if (item.price === 0 && (!item.sellerId || item.sellerId < 2)) {
        const sid = await resolveFreeSeller(item.assetId);
        if (sid) item = { ...item, sellerId: sid };
    }

    const payload = buildPayload(item.assetId, item.price ?? 0, item.sellerId, item.currency ?? 1, item.userAssetId);
    const idxs    = resolveAccountIndices();
    let ok = false;

    if (!idxs.length) { log('No accounts selected', 'warn'); }
    else if (idxs[0] === -1) { ok = await buyForSessionRaw(item.assetId, payload); }
    else {
        const results = await Promise.all(idxs.map(i => buyForAcctRaw(i, item.assetId, payload)));
        ok = results.some(Boolean);
    }

    if (btn) {
        btn.innerHTML        = ok ? '✓' : '✕';
        btn.style.background = ok ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#7f1d1d';
        btn.style.color      = '#fff';
        btn.disabled         = false;
        setTimeout(() => {
            btn.innerHTML = item.price === 0 ? '🎁 Claim' : '🛒 Buy';
            btn.style.background = btn.style.color = '';
        }, 2000);
    }
}

// ─── Render catalog list ──────────────────────────────────────────────────
function renderCatalogList() {
    catalogCursor  = '';
    catalogPageNum = 1;
    catalogSearch  = document.getElementById('st-cat-search')?.value?.trim() || '';
    loadCatalogPage();
}

async function loadCatalogPage() {
    if (catalogLoading) return;
    catalogLoading = true;

    const listEl   = document.getElementById('st-cat-list');
    const countEl  = document.getElementById('st-cat-count');
    const prevBtn  = document.getElementById('st-cat-prev');
    const nextBtn  = document.getElementById('st-cat-next');
    const pageDisp = document.getElementById('st-cat-page');
    if (!listEl) { catalogLoading = false; return; }

    listEl.innerHTML = Array.from({ length: 6 }, (_, i) => `
        <li class="st-cat-card" style="opacity:${1 - i * 0.12};">
            <div class="st-skel" style="width:38px;height:38px;border-radius:9px;flex-shrink:0;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:7px;">
                <div class="st-skel" style="height:11px;border-radius:4px;width:55%;"></div>
                <div class="st-skel" style="height:9px;border-radius:4px;width:30%;"></div>
            </div>
            <div class="st-skel" style="width:60px;height:22px;border-radius:6px;"></div>
            <div class="st-skel" style="width:70px;height:36px;border-radius:9px;"></div>
        </li>`).join('');
    if (countEl) countEl.innerHTML = '<span style="color:var(--c-text3);font-size:11px;">Loading…</span>';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    try {
        const items = await fetchCatalogPage(catalogCursor, catalogCategory, catalogSort, catalogSearch);
        catalogItems = items;
        listEl.innerHTML = '';

        if (!items.length) {
            listEl.innerHTML = '<li style="padding:24px;text-align:center;color:var(--c-text3);font-size:12px;list-style:none;">No items found</li>';
            if (countEl) countEl.innerHTML = '<span style="color:var(--c-text3);font-size:11px;">No items</span>';
        } else {
            const totalStr = catalogTotal > 0 ? ' of ' + catalogTotal.toLocaleString() : '';
            if (countEl) countEl.innerHTML = `<span style="color:var(--c-accent);font-weight:700;">${items.length}</span><span style="color:var(--c-text3);font-size:11px;"> items${totalStr}</span>`;
            items.forEach(item => listEl.appendChild(buildCatalogCard(item)));
        }
        if (pageDisp) pageDisp.textContent = 'Page ' + catalogPageNum;
        if (prevBtn)  prevBtn.disabled = catalogPageNum <= 1;
        if (nextBtn)  nextBtn.disabled = !catalogNextCursor;
    } catch(e) {
        listEl.innerHTML = `<li style="padding:24px;text-align:center;color:var(--c-err);font-size:12px;list-style:none;">Failed: ${e.message}</li>`;
        if (countEl) countEl.innerHTML = '';
        log('Catalog load failed: ' + e.message, 'err');
    }
    catalogLoading = false;
}
