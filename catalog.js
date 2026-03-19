// ─── Catalog config ───────────────────────────────────────────────────────
// These are used by the browser UI — sniper keeps its own CATALOG_API constant
const CAT_ENDPOINT = BASE + '/apisite/catalog/v1/search/items';

const CAT_CATEGORIES = [
    { value: '',             label: 'All'           },
    { value: 'Featured',     label: 'Featured'      },
    { value: 'All',          label: 'All Items'     },
    { value: 'Hats',         label: 'Hats'          },
    { value: 'Shirts',       label: 'Shirts'        },
    { value: 'Pants',        label: 'Pants'         },
    { value: 'Accessories',  label: 'Accessories'   },
    { value: 'Gear',         label: 'Gear'          },
    { value: 'Faces',        label: 'Faces'         },
    { value: 'Heads',        label: 'Heads'         },
    { value: 'Packages',     label: 'Packages'      },
];

const CAT_SORTS = [
    { value: '0', label: 'Relevance'   },
    { value: '1', label: 'Most Favorited' },
    { value: '2', label: 'Bestselling' },
    { value: '3', label: 'Recent'      },
    { value: '4', label: 'Price ↑'     },
    { value: '5', label: 'Price ↓'     },
];

let catCurrentCategory = '';
let catCurrentSort     = '0';
let catLoading         = false;

// ─── Fetch all pages from the catalog API ────────────────────────────────
async function fetchAllCatalogItems(category, sortType) {
    const all    = [];
    let cursor   = '';
    let attempts = 0;
    const MAX_PAGES = 100;

    do {
        // Build URL cleanly with URLSearchParams — no duplicate params
        const params = new URLSearchParams();
        params.set('limit',    '30');
        params.set('sortType', sortType || '0');
        if (category) params.set('category', category);
        if (cursor)   params.set('cursor', cursor);
        params.set('_', Date.now());

        const url = CAT_ENDPOINT + '?' + params.toString();
        try {
            const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
            if (!r.ok) { log('Catalog API error: HTTP ' + r.status, 'err'); break; }
            const j = await r.json();
            if (j.data && j.data.length) all.push(...j.data);
            cursor = j.nextPageCursor || '';

            // Update count while loading so user can see progress
            const countEl = document.getElementById('st-cat-count');
            if (countEl) countEl.innerHTML = `<span style="color:var(--c-accent);font-weight:700;">${all.length}</span><span style="color:var(--c-text3);font-size:11px;"> items (loading page ${attempts + 1}…)</span>`;
        } catch(e) { log('Catalog fetch error: ' + e.message, 'err'); break; }

        attempts++;
    } while (cursor && attempts < MAX_PAGES);

    return all;
}

// ─── Sniper snapshot (first page only, keeps using CATALOG_API) ──────────
async function fetchCatalogIDs() {
    const r = await fetch(CATALOG_API + '&_=' + Date.now(), { credentials: 'include', cache: 'no-store' });
    const j = await r.json();
    const ids = {};
    if (j.data) j.data.forEach(x => ids[x.id] = true);
    return ids;
}

// ─── Normalize a raw catalog API item into a consistent object ────────────
function normalizeCatalogItem(item) {
    // The API sometimes uses 'name', 'itemName', or 'title' depending on endpoint version
    const name     = item.name || item.itemName || item.title || item.displayName || null;
    // lowestPrice is the actual buy price; fall back to price, then 0 for free items
    const price    = item.lowestPrice ?? item.price ?? 0;
    const isFree   = price === 0;
    const isTix    = item.priceStatus === 'Tix' || item.currency === 2;
    // creatorTargetId is the seller; for free/catalog items this must be accurate
    // so we never default to 1 — use 0 if unknown (server will resolve it)
    const sellerId = item.creatorTargetId || item.creatorId || item.sellerId || 0;
    return { name, price, isFree, isTix, sellerId };
}

// ─── Render a single catalog item row ────────────────────────────────────
function renderCatalogItem(item, index, listEl) {
    const { name, price, isFree, isTix, sellerId } = normalizeCatalogItem(item);
    const pc = isTix ? '#eab308' : '#f97316';
    const ac = isTix ? '#854d0e' : '#7c2d12';

    const buyData = {
        assetId:  String(item.id),
        name:     name || 'Item #' + item.id,
        price,
        currency: isTix ? 2 : 1,
        sellerId,
    };

    const li = document.createElement('li');
    li.style.cssText = 'position:relative;padding:10px 13px;background:var(--c-bg2);border-radius:10px;border:1px solid var(--c-border2);display:flex;align-items:center;gap:10px;list-style:none;transition:border-color 0.12s,background 0.12s;';
    li.onmouseenter = () => { li.style.background = 'var(--c-bg3)'; li.style.borderColor = 'var(--c-border)'; };
    li.onmouseleave = () => { li.style.background = 'var(--c-bg2)'; li.style.borderColor = 'var(--c-border2)'; };

    const num = document.createElement('span');
    num.style.cssText = 'color:var(--c-text5);font-size:9px;min-width:18px;text-align:right;font-family:"Fira Code",monospace;flex-shrink:0;';
    num.textContent = String(index + 1).padStart(3, '0');

    const bar = document.createElement('div');
    bar.style.cssText = 'width:2px;height:22px;border-radius:2px;flex-shrink:0;background:' + ac + ';';

    const name = document.createElement('span');
    name.style.cssText = 'flex:1;font-size:11px;color:var(--c-text1);word-break:break-word;line-height:1.4;';
    name.textContent = buyData.name;

    const priceEl = document.createElement('span');
    priceEl.style.cssText = 'color:' + pc + ';font-size:11px;font-weight:700;white-space:nowrap;font-family:"Fira Code",monospace;flex-shrink:0;';
    priceEl.textContent = isFree ? 'Free' : (isTix ? 'T$' : 'R$') + price.toLocaleString();

    const btn = document.createElement('button');
    btn.textContent   = isFree ? '🎁' : '🛒';
    btn.title         = (isFree ? 'Get free: ' : 'Buy ') + buyData.name;
    btn.style.cssText = 'padding:6px 10px;background:' + ac + ';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0;font-weight:600;transition:opacity 0.12s,transform 0.1s;';
    btn.onmouseenter  = () => { btn.style.opacity = '0.8'; btn.style.transform = 'translateY(-1px)'; };
    btn.onmouseleave  = () => { btn.style.opacity = '1';   btn.style.transform = 'translateY(0)'; };
    btn.addEventListener('click', () => buyItem(buyData, btn));

    li.append(num, bar, name, priceEl, btn);
    listEl.appendChild(li);
}

// ─── Main render function ─────────────────────────────────────────────────
async function renderCatalogList() {
    if (catLoading) return;
    catLoading = true;

    const listEl  = document.getElementById('st-cat-list');
    const countEl = document.getElementById('st-cat-count');
    if (!listEl || !countEl) { catLoading = false; return; }

    // Skeleton rows
    listEl.innerHTML = Array.from({length: 8}, (_, i) => `
        <li style="padding:10px 13px;border-radius:10px;background:var(--c-bg2);border:1px solid var(--c-border2);display:flex;align-items:center;gap:10px;list-style:none;opacity:${1 - i * 0.09};">
            <div class="st-skel" style="width:18px;height:10px;border-radius:3px;flex-shrink:0;"></div>
            <div class="st-skel" style="width:2px;height:22px;border-radius:2px;flex-shrink:0;"></div>
            <div class="st-skel" style="flex:1;height:10px;border-radius:4px;"></div>
            <div class="st-skel" style="width:44px;height:10px;border-radius:4px;flex-shrink:0;"></div>
            <div class="st-skel" style="width:34px;height:28px;border-radius:8px;flex-shrink:0;"></div>
        </li>`).join('');
    countEl.innerHTML = '<span style="color:var(--c-text3);font-size:11px;">Fetching catalog…</span>';

    try {
        const items = await fetchAllCatalogItems(catCurrentCategory, catCurrentSort);
        listEl.innerHTML = '';

        if (!items.length) {
            countEl.innerHTML = '<span style="color:var(--c-text2);font-size:11px;">No items found for this filter</span>';
            catLoading = false; return;
        }

        countEl.innerHTML = `<span style="color:var(--c-accent);font-weight:700;">${items.length}</span><span style="color:var(--c-text3);font-size:11px;"> items</span>`;
        items.forEach((item, i) => renderCatalogItem(item, i, listEl));
    } catch(e) {
        listEl.innerHTML = '';
        countEl.innerHTML = '<span style="color:var(--c-err);font-size:11px;">Error: ' + e.message + '</span>';
        log('Catalog error: ' + e.message, 'err');
    }

    catLoading = false;
}

// ─── Build catalog filter controls (injected by ui.js into the toolbar) ──
function buildCatalogControls() {
    const toolbar = document.getElementById('st-cat-toolbar');
    if (!toolbar || document.getElementById('st-cat-controls')) return;

    const controls = document.createElement('div');
    controls.id = 'st-cat-controls';
    controls.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';

    // Category select
    const catSel = document.createElement('select');
    catSel.id = 'st-cat-category';
    catSel.style.cssText = 'background:var(--c-bg0);border:1px solid var(--c-border2);color:var(--c-text1);border-radius:8px;padding:6px 10px;font-size:11px;outline:none;cursor:pointer;transition:border-color 0.15s;';
    CAT_CATEGORIES.forEach(c => {
        const o = document.createElement('option');
        o.value = c.value; o.textContent = c.label;
        if (c.value === catCurrentCategory) o.selected = true;
        catSel.appendChild(o);
    });
    catSel.addEventListener('change', e => { catCurrentCategory = e.target.value; renderCatalogList(); });
    catSel.addEventListener('focus',  e => { e.target.style.borderColor = 'var(--c-accent)'; });
    catSel.addEventListener('blur',   e => { e.target.style.borderColor = 'var(--c-border2)'; });

    // Sort select
    const sortSel = document.createElement('select');
    sortSel.id = 'st-cat-sort';
    sortSel.style.cssText = catSel.style.cssText;
    CAT_SORTS.forEach(s => {
        const o = document.createElement('option');
        o.value = s.value; o.textContent = s.label;
        if (s.value === catCurrentSort) o.selected = true;
        sortSel.appendChild(o);
    });
    sortSel.addEventListener('change', e => { catCurrentSort = e.target.value; renderCatalogList(); });
    sortSel.addEventListener('focus',  e => { e.target.style.borderColor = 'var(--c-accent)'; });
    sortSel.addEventListener('blur',   e => { e.target.style.borderColor = 'var(--c-border2)'; });

    controls.append(catSel, sortSel);

    // Insert controls before the existing count/legend row
    toolbar.insertBefore(controls, toolbar.firstChild);
}

// ─── DOM parsing kept for backwards compat ───────────────────────────────
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
