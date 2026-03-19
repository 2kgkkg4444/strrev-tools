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

// ─── Catalog API ──────────────────────────────────────────────────────────
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

    // Show skeleton loading
    listEl.innerHTML = Array.from({length:5}, (_,i) => `
        <li style="padding:9px 11px;margin-bottom:4px;border-radius:8px;background:#0d1829;display:flex;align-items:center;gap:9px;list-style:none;opacity:${1-i*0.15};">
            <div class="st-skel" style="width:13px;height:13px;border-radius:3px;flex-shrink:0;"></div>
            <div class="st-skel" style="flex:1;height:9px;border-radius:4px;"></div>
            <div class="st-skel" style="width:30px;height:9px;border-radius:4px;"></div>
            <div class="st-skel" style="width:28px;height:22px;border-radius:6px;"></div>
        </li>`).join('');
    countEl.innerHTML = '<span style="color:#334155;font-size:10px;">Scanning...</span>';

    setTimeout(() => {
        const items = Object.values(parseItemsFromDOM(document));
        listEl.innerHTML = '';
        if (!items.length) {
            countEl.innerHTML = '<span style="color:#475569;font-size:10px;">No items — browse the catalog then refresh</span>';
            return;
        }
        countEl.innerHTML = `<span style="color:#e94560;font-weight:700;">${items.length}</span><span style="color:#334155;font-size:10px;"> items on page</span>`;
        items.forEach((item, i) => {
            const isTix = item.currency === 2;
            const pc    = isTix ? '#eab308' : '#f97316';
            const ac    = isTix ? '#854d0e' : '#7c2d12';
            const li    = document.createElement('li');
            li.style.cssText = 'position:relative;padding:9px 11px;margin-bottom:4px;background:#0d1829;border-radius:9px;border:1px solid #0f1e35;display:flex;align-items:center;gap:9px;list-style:none;transition:border-color 0.12s,background 0.12s;';
            li.onmouseenter = () => { li.style.background='#111c33'; li.style.borderColor='#1e293b'; };
            li.onmouseleave = () => { li.style.background='#0d1829'; li.style.borderColor='#0f1e35'; };

            const num = document.createElement('span');
            num.style.cssText = 'color:#1e3a5f;font-size:9px;min-width:14px;text-align:right;font-family:monospace;flex-shrink:0;';
            num.textContent = String(i+1).padStart(2,'0');

            const bar = document.createElement('div');
            bar.style.cssText = 'width:2px;height:20px;border-radius:2px;background:'+ac+';flex-shrink:0;';

            const name = document.createElement('span');
            name.style.cssText = 'flex:1;font-size:11px;color:#94a3b8;word-break:break-word;line-height:1.35;';
            name.textContent = item.name;

            const price = document.createElement('span');
            price.style.cssText = 'color:'+pc+';font-size:10px;font-weight:700;white-space:nowrap;font-family:monospace;';
            price.textContent = item.price > 0 ? (isTix?'T$':'R$')+item.price : 'Free';

            const btn = document.createElement('button');
            btn.textContent    = '🛒';
            btn.title          = 'Buy '+item.name;
            btn.style.cssText  = 'padding:5px 9px;background:'+ac+';color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:11px;flex-shrink:0;font-weight:600;transition:opacity 0.12s,transform 0.1s;';
            btn.onmouseenter   = () => { btn.style.opacity='0.8'; btn.style.transform='translateY(-1px)'; };
            btn.onmouseleave   = () => { btn.style.opacity='1';   btn.style.transform='translateY(0)';    };
            btn.addEventListener('click', () => buyItem(item, btn));

            li.append(num, bar, name, price, btn);
            listEl.appendChild(li);
        });
    }, 100);
}
