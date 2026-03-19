// ─── DOM Parsing ──────────────────────────────────────────────────────────
function isTixIcon(el) { return el ? window.getComputedStyle(el).backgroundImage?.includes('img-tickets') : false; }

function parsePriceAndCurrency(col) {
    let price = 0, currency = 1;
    col.querySelectorAll('[class*="overviewDetails"] p').forEach(p => {
        const img    = p.querySelector('[class*="image-"]');
        const txts   = p.querySelectorAll('[class*="text-"]');
        const prefix = p.querySelector('[class*="prefix-"]')?.textContent?.trim().toLowerCase();
        if (prefix === 'was') return;
        const val = parseInt(txts[txts.length-1]?.textContent?.trim());
        if (isNaN(val) || val <= 0) return;
        if (isTixIcon(img)) { price=val; currency=2; }
        else if (!price || prefix === 'now') { price=val; currency=1; }
    });
    return { price, currency };
}

function parseItemsFromDOM(doc) {
    const items = {};
    doc.querySelectorAll('a[href*="/catalog/"]').forEach(link => {
        const m = link.getAttribute('href')?.match(/\/catalog\/(\d+)\//);
        if (!m) return;
        const id = m[1], nameEl = link.querySelector('[class*="itemName"]');
        if (!nameEl) return;
        const col = link.closest('[class*="col-"]') || link;
        const { price, currency } = parsePriceAndCurrency(col);
        let sellerId = 1;
        const cl = col.querySelector('[class*="detailsWrapper"] a[href*="User.aspx"]');
        if (cl) { const sm=cl.href.match(/ID=(\d+)/); if(sm) sellerId=parseInt(sm[1]); }
        items[id] = { assetId:id, name:nameEl.textContent.trim(), price, currency, sellerId };
    });
    return items;
}

// ─── Catalog API (sniper snapshot) ────────────────────────────────────────
async function fetchCatalogIDs() {
    const r = await fetch(CATALOG_API+'&_='+Date.now(), { credentials:'include', cache:'no-store' });
    const j = await r.json();
    const ids = {};
    if (j.data) j.data.forEach(x => ids[x.id] = true);
    return ids;
}

// ─── Catalog Render ───────────────────────────────────────────────────────
function renderCatalogList() {
    const listEl  = document.getElementById('st-cat-list');
    const countEl = document.getElementById('st-cat-count');
    if (!listEl || !countEl) return;

    // Clear search
    const searchEl = document.getElementById('st-cat-search');
    if (searchEl) searchEl.value = '';

    // Skeleton loading cards
    listEl.innerHTML = Array.from({length:5}, (_,i) => `
        <li class="st-cat-card" style="opacity:${1-i*0.14};">
            <div class="st-skel" style="width:38px;height:38px;border-radius:9px;flex-shrink:0;"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:7px;">
                <div class="st-skel" style="height:11px;border-radius:4px;width:60%;"></div>
                <div class="st-skel" style="height:9px;border-radius:4px;width:35%;"></div>
            </div>
            <div class="st-skel" style="width:52px;height:22px;border-radius:6px;"></div>
            <div class="st-skel" style="width:70px;height:34px;border-radius:9px;"></div>
        </li>`).join('');
    countEl.innerHTML = '<span style="color:var(--c-text3);font-size:11px;">Scanning…</span>';

    setTimeout(() => {
        const items = Object.values(parseItemsFromDOM(document));
        listEl.innerHTML = '';
        if (!items.length) {
            countEl.innerHTML = '<span style="color:var(--c-text2);font-size:11px;">No items found — browse the catalog then refresh</span>';
            return;
        }
        countEl.innerHTML = `<span style="color:var(--c-accent);font-weight:700;">${items.length}</span><span style="color:var(--c-text3);font-size:11px;"> items</span>`;

        items.forEach((item, i) => {
            const isTix    = item.currency === 2;
            const isFree   = item.price === 0;
            const accentC  = isFree ? '#22c55e' : isTix ? '#eab308' : '#f97316';
            const bgC      = isFree ? 'rgba(34,197,94,0.12)' : isTix ? 'rgba(234,179,8,0.12)' : 'rgba(249,115,22,0.12)';
            const emoji    = isFree ? '🎁' : isTix ? '🪙' : '💎';

            const li = document.createElement('li');
            li.className = 'st-cat-card';
            li.dataset.name = item.name.toLowerCase();
            // Staggered entrance
            li.style.cssText = `opacity:0;transform:translateY(10px);transition:opacity 0.18s ${i*0.04}s ease,transform 0.18s ${i*0.04}s cubic-bezier(0.16,1,0.3,1),border-color 0.14s,background 0.14s,box-shadow 0.14s;`;
            requestAnimationFrame(() => { li.style.opacity='1'; li.style.transform='translateY(0)'; });

            // Icon box
            const iconBox = document.createElement('div');
            iconBox.className = 'st-cat-card-icon';
            iconBox.style.background = bgC;
            iconBox.textContent = emoji;

            // Name + id info
            const info = document.createElement('div');
            info.style.cssText = 'flex:1;min-width:0;';
            const nameEl = document.createElement('div');
            nameEl.style.cssText = 'font-size:12px;font-weight:600;color:var(--c-text0);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;';
            nameEl.textContent = item.name;
            const subEl = document.createElement('div');
            subEl.style.cssText = 'font-size:10px;color:var(--c-text4);font-family:"Fira Code",monospace;';
            subEl.textContent = 'ID: ' + item.assetId;
            info.append(nameEl, subEl);

            // Price badge
            const priceEl = document.createElement('div');
            priceEl.style.cssText = `padding:5px 10px;border-radius:7px;background:${bgC};border:1px solid ${accentC}44;font-size:12px;font-weight:700;color:${accentC};font-family:"Fira Code",monospace;white-space:nowrap;flex-shrink:0;`;
            priceEl.textContent = isFree ? 'FREE' : (isTix ? 'T$' : 'R$') + item.price.toLocaleString();

            // Buy button
            const btn = document.createElement('button');
            btn.style.cssText = `padding:9px 16px;background:linear-gradient(135deg,${accentC},${accentC}bb);color:#000;border:none;border-radius:9px;cursor:pointer;font-size:12px;font-weight:700;flex-shrink:0;transition:opacity 0.12s,transform 0.1s,box-shadow 0.12s;box-shadow:0 2px 12px ${accentC}44;`;
            btn.textContent = isFree ? '🎁 Claim' : '🛒 Buy';
            btn.title = 'Buy ' + item.name;
            btn.onmouseenter = () => { btn.style.opacity='0.85'; btn.style.transform='translateY(-1px)'; btn.style.boxShadow=`0 4px 18px ${accentC}66`; };
            btn.onmouseleave = () => { btn.style.opacity='1';    btn.style.transform='translateY(0)';  btn.style.boxShadow=`0 2px 12px ${accentC}44`; };
            btn.addEventListener('click', () => buyItem(item, btn));

            li.append(iconBox, info, priceEl, btn);
            listEl.appendChild(li);
        });
    }, 100);
}
