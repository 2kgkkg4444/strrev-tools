// ─── Catalog State ────────────────────────────────────────────────────────
let catalogItems    = [];
let catalogCursor   = '';      // empty = first page
let catalogNextCursor = '';
let catalogPrevCursor = '';
let catalogTotal    = 0;
let catalogPageNum  = 1;
let catalogLoading  = false;
let catalogCategory = 'Featured';
let catalogSort     = '0';
let catalogSearch   = '';

const CATALOG_PAGE_SIZE = 28;

const ASSET_TYPE_NAMES = {
    8:'Hat', 18:'Face', 19:'Gear', 42:'Glasses', 43:'Neck', 44:'Shoulder',
    45:'Front', 46:'Back', 47:'Waist', 27:'Torso', 28:'Arm', 29:'Leg', 30:'Head',
};

// ─── Fetch one page from API ──────────────────────────────────────────────
async function fetchCatalogPage(cursor, category, sortType, keyword) {
    // Step 1: search returns only IDs + pagination cursors
    let url = BASE + '/apisite/catalog/v1/search/items'
        + '?category=' + encodeURIComponent(category)
        + '&limit=' + CATALOG_PAGE_SIZE
        + '&sortType=' + sortType
        + '&_=' + Date.now();
    if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
    if (keyword) url += '&keyword=' + encodeURIComponent(keyword);
    const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    catalogNextCursor = j.nextPageCursor || '';
    catalogPrevCursor = j.previousPageCursor || '';
    catalogTotal      = j._total || 0;
    const searchData  = j.data || [];
    if (!searchData.length) return [];

    // Step 2: POST IDs to details endpoint with CSRF retry pattern
    const ids = searchData.map(x => ({ itemType: x.itemType || 'Asset', id: x.id }));
    const detailsBody = JSON.stringify({ items: ids });
    const doDetailsReq = async (token) => fetch(BASE + '/apisite/catalog/v1/catalog/items/details', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'x-csrf-token': token } : {}) },
        body: detailsBody,
    });
    let dr = await doDetailsReq(sessionCsrf);
    if (dr.status === 403) {
        // Grab fresh token from response header and retry
        const fresh = dr.headers.get('x-csrf-token');
        if (fresh) { sessionCsrf = fresh; dr = await doDetailsReq(fresh); }
        else {
            // Fallback: fetch token from purchases endpoint
            await fetchSessionCsrf();
            dr = await doDetailsReq(sessionCsrf);
        }
    }
    if (!dr.ok) throw new Error('Details HTTP ' + dr.status);
    const dj = await dr.json();
    return dj.data || [];
}

// ─── Catalog API snapshot (sniper) ───────────────────────────────────────
async function fetchCatalogIDs() {
    const r = await fetch(CATALOG_API + '&_=' + Date.now(), { credentials: 'include', cache: 'no-store' });
    const j = await r.json();
    const ids = {};
    if (j.data) j.data.forEach(x => ids[x.id] = true);
    return ids;
}

// ─── Build item card ──────────────────────────────────────────────────────
function buildCatalogCard(item) {
    const isTix      = item.priceTickets != null && item.price == null;
    const isLimited  = item.itemRestrictions?.includes('Limited');
    const isLimitedU = item.itemRestrictions?.includes('LimitedUnique');
    const isAnyLtd   = isLimited || isLimitedU;
    const isForSale  = item.isForSale;
    const isFree     = !isTix && (item.price === 0 || item.price === null) && !isAnyLtd;

    // Display price: limiteds show lowestPrice, regular show price/priceTickets
    const displayPrice = isAnyLtd
        ? (item.lowestPrice != null ? item.lowestPrice : null)
        : (isTix ? item.priceTickets : item.price);

    const accentC = isAnyLtd ? '#f59e0b'
                  : isTix    ? '#eab308'
                  : isFree   ? '#22c55e'
                  :            '#f97316';
    const bgC = isAnyLtd ? 'rgba(245,158,11,0.12)'
              : isTix    ? 'rgba(234,179,8,0.12)'
              : isFree   ? 'rgba(34,197,94,0.12)'
              :             'rgba(249,115,22,0.12)';
    const icon = isLimitedU ? '💎' : isLimited ? '🔒' : isTix ? '🪙' : isFree ? '🎁' : '🛒';

    const li = document.createElement('li');
    li.className = 'st-cat-card';
    li.dataset.name = (item.name || '').toLowerCase();
    li.style.cssText = 'opacity:0;transform:translateY(8px);';
    requestAnimationFrame(() => {
        li.style.transition = 'opacity 0.18s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1), border-color 0.14s, background 0.14s, box-shadow 0.14s';
        li.style.opacity = '1';
        li.style.transform = 'translateY(0)';
    });

    // Icon box
    const iconBox = document.createElement('div');
    iconBox.className = 'st-cat-card-icon';
    iconBox.style.background = bgC;
    iconBox.textContent = icon;

    // Info block
    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;';

    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-size:12px;font-weight:600;color:var(--c-text0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;';
    nameEl.textContent = item.name || 'Item #' + item.id;
    nameEl.title = item.name || '';

    const meta = document.createElement('div');
    meta.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;';

    // Asset type badge
    const typeName = ASSET_TYPE_NAMES[item.assetType] || 'Item';
    const typeBadge = document.createElement('span');
    typeBadge.style.cssText = 'font-size:9px;padding:1px 6px;border-radius:4px;background:var(--c-bg2);border:1px solid var(--c-border);color:var(--c-text4);';
    typeBadge.textContent = typeName;
    meta.appendChild(typeBadge);

    // Restriction badges
    if (isLimitedU) {
        const b = document.createElement('span');
        b.style.cssText = 'font-size:9px;padding:1px 6px;border-radius:4px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;font-weight:700;';
        b.textContent = 'LimitedU';
        meta.appendChild(b);
    } else if (isLimited) {
        const b = document.createElement('span');
        b.style.cssText = 'font-size:9px;padding:1px 6px;border-radius:4px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);color:#d97706;font-weight:700;';
        b.textContent = 'Limited';
        meta.appendChild(b);
    }

    // RAP badge for limiteds
    if (isAnyLtd && item.rap > 0) {
        const rap = document.createElement('span');
        rap.style.cssText = 'font-size:9px;color:var(--c-text4);font-family:"Fira Code",monospace;';
        rap.textContent = 'RAP: ' + item.rap.toLocaleString();
        meta.appendChild(rap);
    }

    // Lowest seller
    if (isAnyLtd && item.lowestSellerData) {
        const seller = document.createElement('span');
        seller.style.cssText = 'font-size:9px;color:var(--c-text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        seller.textContent = '↓ ' + item.lowestSellerData.username;
        meta.appendChild(seller);
    }

    // Not for sale indicator
    if (!isForSale && !isAnyLtd) {
        const offsale = document.createElement('span');
        offsale.style.cssText = 'font-size:9px;color:var(--c-err);';
        offsale.textContent = 'Off Sale';
        meta.appendChild(offsale);
    }

    info.append(nameEl, meta);

    // Price badge
    const priceEl = document.createElement('div');
    priceEl.style.cssText = `padding:5px 10px;border-radius:7px;background:${bgC};border:1px solid ${accentC}44;font-size:12px;font-weight:700;color:${accentC};font-family:"Fira Code",monospace;white-space:nowrap;flex-shrink:0;text-align:right;`;
    if (displayPrice == null) {
        priceEl.textContent = '—';
        priceEl.style.color = 'var(--c-text4)';
    } else if (displayPrice === 0 || isFree) {
        priceEl.textContent = 'FREE';
    } else {
        priceEl.textContent = (isTix ? 'T$' : 'R$') + displayPrice.toLocaleString();
    }

    // Buy button
    const btn = document.createElement('button');
    const canBuy = isForSale || (isAnyLtd && item.lowestSellerData);
    btn.style.cssText = `padding:9px 14px;background:${canBuy ? `linear-gradient(135deg,${accentC},${accentC}bb)` : 'var(--c-bg3)'};color:${canBuy ? '#000' : 'var(--c-text4)'};border:${canBuy ? 'none' : '1px solid var(--c-border2)'};border-radius:9px;cursor:${canBuy ? 'pointer' : 'not-allowed'};font-size:11px;font-weight:700;flex-shrink:0;transition:opacity 0.12s,transform 0.1s,box-shadow 0.12s;white-space:nowrap;`;
    btn.textContent = isFree ? '🎁 Claim' : canBuy ? '🛒 Buy' : '✕ N/A';
    btn.disabled = !canBuy;
    if (canBuy) {
        btn.title = 'Buy ' + item.name;
        btn.onmouseenter = () => { btn.style.opacity = '0.82'; btn.style.transform = 'translateY(-1px)'; };
        btn.onmouseleave = () => { btn.style.opacity = '1'; btn.style.transform = 'translateY(0)'; };
        btn.addEventListener('click', () => {
            // Build the buy item object with correct fields
            const buyItem = {
                assetId:  String(item.id),
                name:     item.name,
                price:    isAnyLtd
                    ? (item.lowestSellerData?.price ?? 0)
                    : (isTix ? 0 : (item.price ?? 0)),
                currency: isTix ? 2 : 1,
                sellerId: isAnyLtd
                    ? (item.lowestSellerData?.userId ?? item.creatorTargetId)
                    : item.creatorTargetId,
                userAssetId: isAnyLtd ? (item.lowestSellerData?.userAssetId ?? null) : null,
            };
            buyItemCatalog(buyItem, btn);
        });
    }

    li.append(iconBox, info, priceEl, btn);
    return li;
}

// ─── Buy wrapper for catalog (handles userAssetId for limiteds) ───────────
async function buyItemCatalog(item, btn) {
    if (btn) { btn.innerHTML = '<span class="st-spin">↻</span>'; btn.disabled = true; }
    log((item.price === 0 ? 'Claiming free: ' : 'Buying: ') + item.name, 'info');

    // Build payload — include userAssetId for limiteds
    const payload = JSON.stringify({
        assetId:          parseInt(item.assetId),
        expectedPrice:    item.price,
        expectedSellerId: item.sellerId,
        userAssetId:      item.userAssetId || null,
        expectedCurrency: item.currency,
    });

    let ok = false;
    if (selectedAcctIdx === -2) {
        if (!accounts.length) log('No accounts saved', 'warn');
        else {
            const results = await Promise.all(accounts.map((_, i) => buyForAcctRaw(i, item.assetId, payload)));
            ok = results.some(Boolean);
        }
    } else if (selectedAcctIdx === -1) {
        ok = await buyForSessionRaw(item.assetId, payload);
    } else {
        if (accounts[selectedAcctIdx]) ok = await buyForAcctRaw(selectedAcctIdx, item.assetId, payload);
        else log('Account not found', 'err');
    }

    if (btn) {
        btn.textContent      = ok ? '✓' : '✕';
        btn.style.background = ok ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#7f1d1d';
        btn.style.color      = '#fff';
        btn.disabled         = false;
        setTimeout(() => {
            btn.textContent      = '🛒 Buy';
            btn.style.background = '';
            btn.style.color      = '#000';
        }, 2500);
    }
}

async function buyForAcctRaw(i, assetId, payload) {
    try {
        const res = await acctFetch(i, BASE + '/apisite/economy/v1/purchases/products/' + assetId, { method: 'POST', body: payload });
        let d = {}; try { d = await res.json(); } catch(_) {}
        const ok = res.ok && (d.purchased === true || d.statusCode === 0 || (res.status === 200 && !d.statusCode));
        if (ok) { log('✓ Bought as ' + accounts[i].username, 'success'); return true; }
        const msg = d.errorMessage || d.message || d.errors?.[0]?.message || ('HTTP ' + res.status);
        log('✗ ' + msg + ' — ' + accounts[i].username, 'err'); return false;
    } catch(e) { log('✗ ' + e.message + ' — ' + accounts[i].username, 'err'); return false; }
}

async function buyForSessionRaw(assetId, payload) {
    try {
        await fetchSessionCsrf();
        const res = await fetch(BASE + '/apisite/economy/v1/purchases/products/' + assetId, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': sessionCsrf },
            body: payload,
        });
        const d = await res.json();
        const ok = res.ok && (d.purchased === true || d.statusCode === 0 || (res.status === 200 && !d.statusCode));
        if (ok) { log('✓ Bought (session)', 'success'); return true; }
        log('✗ ' + (d.errorMessage || d.message || 'Failed') + ' (session)', 'err'); return false;
    } catch(e) { log('✗ ' + e.message + ' (session)', 'err'); return false; }
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

    // Skeletons
    listEl.innerHTML = Array.from({length: 5}, (_, i) => `
        <li class="st-cat-card" style="opacity:${1-i*0.15};">
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
            if (countEl) countEl.innerHTML =
                `<span style="color:var(--c-accent);font-weight:700;">${items.length}</span>`
                + `<span style="color:var(--c-text3);font-size:11px;"> items${totalStr}</span>`;
            items.forEach(item => listEl.appendChild(buildCatalogCard(item)));
        }

        if (pageDisp) pageDisp.textContent = 'Page ' + catalogPageNum;
        if (prevBtn) prevBtn.disabled = catalogPageNum <= 1;
        if (nextBtn) nextBtn.disabled = !catalogNextCursor;

    } catch(e) {
        listEl.innerHTML = '<li style="padding:24px;text-align:center;color:var(--c-err);font-size:12px;list-style:none;">Failed to load: ' + e.message + '</li>';
        if (countEl) countEl.innerHTML = '';
        log('Catalog load failed: ' + e.message, 'err');
    }

    catalogLoading = false;
}
