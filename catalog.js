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

    listEl.innerHTML = Array.from({length:5}, (_,i) => `
        <li style="padding:10px 13px;margin-bottom:5px;border-radius:10px;background:var(--c-bg2);border:1px solid var(--c-border2);display:flex;align-items:center;gap:10px;list-style:none;opacity:${1-i*0.15};">
            <div class="st-skel" style="width:18px;height:10px;border-radius:3px;flex-shrink:0;"></div>
            <div class="st-skel" style="flex:1;height:10px;border-radius:4px;"></div>
            <div class="st-skel" style="width:40px;height:10px;border-radius:4px;"></div>
            <div class="st-skel" style="width:34px;height:28px;border-radius:8px;"></div>
        </li>`).join('');
    countEl.innerHTML = '<span style="color:var(--c-text3);font-size:11px;">Scanning page…</span>';

    setTimeout(() => {
        const items = Object.values(parseItemsFromDOM(document));
        listEl.innerHTML = '';
        if (!items.length) {
            countEl.innerHTML = '<span style="color:var(--c-text2);font-size:11px;">No items — browse the catalog then refresh</span>';
            return;
        }
        countEl.innerHTML = `<span style="color:var(--c-accent);font-weight:700;">${items.length}</span><span style="color:var(--c-text3);font-size:11px;"> items on page</span>`;
        items.forEach((item, i) => {
            const isTix = item.currency === 2;
            const pc    = isTix ? '#eab308' : '#f97316';
            const ac    = isTix ? '#854d0e' : '#7c2d12';
            const li    = document.createElement('li');
            li.style.cssText = 'position:relative;padding:10px 13px;background:var(--c-bg2);border-radius:10px;border:1px solid var(--c-border2);display:flex;align-items:center;gap:10px;list-style:none;transition:border-color 0.12s,background 0.12s;';
            li.onmouseenter = () => { li.style.background='var(--c-bg3)'; li.style.borderColor='var(--c-border)'; };
            li.onmouseleave = () => { li.style.background='var(--c-bg2)'; li.style.borderColor='var(--c-border2)'; };

            const num = document.createElement('span');
            num.style.cssText = 'color:var(--c-text5);font-size:9px;min-width:18px;text-align:right;font-family:"Fira Code",monospace;flex-shrink:0;';
            num.textContent = String(i+1).padStart(2,'0');

            const bar = document.createElement('div');
            bar.style.cssText = 'width:2px;height:22px;border-radius:2px;background:'+ac+';flex-shrink:0;';

            const nameEl = document.createElement('span');
            nameEl.style.cssText = 'flex:1;font-size:11px;color:var(--c-text1);word-break:break-word;line-height:1.35;';
            nameEl.textContent = item.name;

            const priceEl = document.createElement('span');
            priceEl.style.cssText = 'color:'+pc+';font-size:11px;font-weight:700;white-space:nowrap;font-family:"Fira Code",monospace;';
            priceEl.textContent = item.price > 0 ? (isTix?'T$':'R$')+item.price : 'Free';

            const btn = document.createElement('button');
            btn.textContent   = item.price === 0 ? '🎁' : '🛒';
            btn.title         = 'Buy '+item.name;
            btn.style.cssText = 'padding:6px 10px;background:'+ac+';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;flex-shrink:0;font-weight:600;transition:opacity 0.12s,transform 0.1s;';
            btn.onmouseenter  = () => { btn.style.opacity='0.8'; btn.style.transform='translateY(-1px)'; };
            btn.onmouseleave  = () => { btn.style.opacity='1';   btn.style.transform='translateY(0)'; };
            btn.addEventListener('click', () => buyItem(item, btn));

            li.append(num, bar, nameEl, priceEl, btn);
            listEl.appendChild(li);
        });
    }, 100);
}
