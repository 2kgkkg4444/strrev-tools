// ─── Catalog API (all pages) ──────────────────────────────────────────────
const CATALOG_BASE = BASE + '/apisite/catalog/v1/search/items';

// Fetch every page of the catalog and return a flat array of items.
// Preserves whatever query params are currently in CATALOG_API (category, sort, etc.)
async function fetchAllCatalogItems() {
    const all    = [];
    let cursor   = '';
    let attempts = 0;
    const MAX_PAGES = 100; // safety cap

    // Strip the base URL from CATALOG_API to get just the query string params
    const baseParams = CATALOG_API.replace(BASE + '/apisite/catalog/v1/search/items', '')
                                   .replace(/^[?&]/, '');

    do {
        const url = CATALOG_BASE + '?limit=30&' + baseParams
            + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '')
            + '&_=' + Date.now();
        try {
            const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
            if (!r.ok) break;
            const j = await r.json();
            if (j.data && j.data.length) all.push(...j.data);
            cursor = j.nextPageCursor || '';
        } catch(_) { break; }
        attempts++;
    } while (cursor && attempts < MAX_PAGES);

    return all;
}

// ─── Sniper still uses this (first-page snapshot only) ───────────────────
async function fetchCatalogIDs() {
    const r = await fetch(CATALOG_API + '&_=' + Date.now(), { credentials: 'include', cache: 'no-store' });
    const j = await r.json();
    const ids = {};
    if (j.data) j.data.forEach(x => ids[x.id] = true);
    return ids;
}

// ─── Catalog Render ───────────────────────────────────────────────────────
function renderCatalogItem(item, index, listEl) {
    // API fields: id, name, lowestPrice, price, priceStatus, creatorTargetId, itemType
    const price    = item.lowestPrice ?? item.price ?? 0;
    const isFree   = price === 0;
    const isTix    = item.priceStatus === 'Tix' || item.currency === 2;
    const pc       = isTix ? '#eab308' : '#f97316';
    const ac       = isTix ? '#854d0e' : '#7c2d12';
    const buyItem_ = {
        assetId:  String(item.id),
        name:     item.name || 'Item #' + item.id,
        price,
        currency: isTix ? 2 : 1,
        sellerId: item.creatorTargetId || 1,
    };

    const li = document.createElement('li');
    li.style.cssText = 'position:relative;padding:10px 13px;background:var(--c-bg2);border-radius:10px;border:1px solid var(--c-border2);display:flex;align-items:center;gap:10px;list-style:none;transition:border-color 0.12s,background 0.12s;';
    li.onmouseenter = () => { li.style.background='var(--c-bg3)'; li.style.borderColor='var(--c-border)'; };
    li.onmouseleave = () => { li.style.background='var(--c-bg2)'; li.style.borderColor='var(--c-border2)'; };

    const num = document.createElement('span');
    num.style.cssText = 'color:var(--c-text5);font-size:9px;min-width:16px;text-align:right;font-family:"Fira Code",monospace;flex-shrink:0;';
    num.textContent = String(index + 1).padStart(2, '0');

    const bar = document.createElement('div');
    bar.style.cssText = 'width:2px;height:22px;border-radius:2px;background:' + ac + ';flex-shrink:0;';

    const name = document.createElement('span');
    name.style.cssText = 'flex:1;font-size:11px;color:var(--c-text1);word-break:break-word;line-height:1.4;';
    name.textContent = item.name || 'Item #' + item.id;

    const priceEl = document.createElement('span');
    priceEl.style.cssText = 'color:' + pc + ';font-size:11px;font-weight:700;white-space:nowrap;font-family:"Fira Code",monospace;flex-shrink:0;';
    priceEl.textContent = isFree ? 'Free' : (isTix ? 'T$' : 'R$') + price.toLocaleString();

    const btn = document.createElement('button');
    btn.textContent   = '🛒';
    btn.title         = 'Buy ' + (item.name || 'item');
    btn.style.cssText = 'padding:6px 10px;background:' + ac + ';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0;font-weight:600;transition:opacity 0.12s,transform 0.1s;';
    btn.onmouseenter  = () => { btn.style.opacity = '0.8'; btn.style.transform = 'translateY(-1px)'; };
    btn.onmouseleave  = () => { btn.style.opacity = '1';   btn.style.transform = 'translateY(0)'; };
    btn.addEventListener('click', () => buyItem(buyItem_, btn));

    li.append(num, bar, name, priceEl, btn);
    listEl.appendChild(li);
}

async function renderCatalogList() {
    const listEl  = document.getElementById('st-cat-list');
    const countEl = document.getElementById('st-cat-count');
    if (!listEl || !countEl) return;

    // Show skeletons while loading
    listEl.innerHTML = Array.from({length: 6}, (_, i) => `
        <li style="padding:10px 13px;border-radius:10px;background:var(--c-bg2);border:1px solid var(--c-border2);display:flex;align-items:center;gap:10px;list-style:none;opacity:${1 - i * 0.12};">
            <div class="st-skel" style="width:16px;height:10px;border-radius:3px;flex-shrink:0;"></div>
            <div class="st-skel" style="width:2px;height:22px;border-radius:2px;flex-shrink:0;"></div>
            <div class="st-skel" style="flex:1;height:10px;border-radius:4px;"></div>
            <div class="st-skel" style="width:40px;height:10px;border-radius:4px;flex-shrink:0;"></div>
            <div class="st-skel" style="width:32px;height:26px;border-radius:8px;flex-shrink:0;"></div>
        </li>`).join('');
    countEl.innerHTML = '<span style="color:var(--c-text3);font-size:11px;">Fetching all pages…</span>';

    try {
        const items = await fetchAllCatalogItems();
        listEl.innerHTML = '';

        if (!items.length) {
            countEl.innerHTML = '<span style="color:var(--c-text2);font-size:11px;">No items found</span>';
            return;
        }

        countEl.innerHTML = `<span style="color:var(--c-accent);font-weight:700;">${items.length}</span><span style="color:var(--c-text3);font-size:11px;"> items total</span>`;

        items.forEach((item, i) => renderCatalogItem(item, i, listEl));

    } catch(e) {
        listEl.innerHTML = '';
        countEl.innerHTML = '<span style="color:var(--c-err);font-size:11px;">Failed to load catalog — ' + e.message + '</span>';
        log('Catalog fetch error: ' + e.message, 'err');
    }
}

// ─── DOM parsing kept for backwards compat (sniper snapshot uses it) ─────
function parseItemsFromDOM(doc) {
    const items = {};
    doc.querySelectorAll('a[href*="/catalog/"]').forEach(link => {
        const m = link.getAttribute('href')?.match(/\/catalog\/(\d+)\//);
        if (!m) return;
        const id = m[1], nameEl = link.querySelector('[class*="itemName"]');
        if (!nameEl) return;
        items[id] = { assetId: id, name: nameEl.textContent.trim(), price: 0, currency: 1, sellerId: 1 };
    });
    return items;
}
