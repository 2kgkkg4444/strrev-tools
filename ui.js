// ─── Theme Definitions ────────────────────────────────────────────────────
const THEMES = {
    void: {
        name: 'Void',  icon: '🌑',  desc: 'Deep crimson & space',  anim: false,
        preview: ['#02050e','#e94560','#0d1829'],
        vars: {
            '--c-bg0':'#02050e','--c-bg1':'#060c18','--c-bg2':'#0d1829','--c-bg3':'#111e33',
            '--c-border':'#0f1e35','--c-border2':'#0a1525',
            '--c-accent':'#e94560','--c-accent2':'#b91c4a','--c-accent-glow':'rgba(233,69,96,0.3)',
            '--c-text0':'#f1f5f9','--c-text1':'#94a3b8','--c-text2':'#475569',
            '--c-text3':'#334155','--c-text4':'#1e3a5f','--c-text5':'#0a1525',
            '--c-success':'#22c55e','--c-warn':'#eab308','--c-err':'#ef4444',
            '--c-tabbar':'#010408','--c-tab':'#030810','--c-tab-active':'#060c18',
        }
    },
    hacker: {
        name: 'Hacker', icon: '💀', desc: 'Matrix rain terminal', anim: true,
        preview: ['#000000','#00ff41','#0a120a'],
        vars: {
            '--c-bg0':'#000000','--c-bg1':'#020502','--c-bg2':'#050d05','--c-bg3':'#091409',
            '--c-border':'#0d1f0d','--c-border2':'#071007',
            '--c-accent':'#00ff41','--c-accent2':'#00cc33','--c-accent-glow':'rgba(0,255,65,0.3)',
            '--c-text0':'#00ff41','--c-text1':'#00dd38','--c-text2':'#00aa2b',
            '--c-text3':'#007720','--c-text4':'#004d14','--c-text5':'#002a0b',
            '--c-success':'#00ff41','--c-warn':'#ffff00','--c-err':'#ff3333',
            '--c-tabbar':'#000000','--c-tab':'#010801','--c-tab-active':'#020502',
        }
    },
    galaxy: {
        name: 'Galaxy', icon: '🌌', desc: 'Cosmic starfield & nebula', anim: true,
        preview: ['#04010f','#a855f7','#0e0828'],
        vars: {
            '--c-bg0':'#04010f','--c-bg1':'#07031a','--c-bg2':'#0e0828','--c-bg3':'#160d3a',
            '--c-border':'#1e0f4a','--c-border2':'#130a35',
            '--c-accent':'#a855f7','--c-accent2':'#7c3aed','--c-accent-glow':'rgba(168,85,247,0.35)',
            '--c-text0':'#ede9fe','--c-text1':'#c4b5fd','--c-text2':'#8b5cf6',
            '--c-text3':'#6d28d9','--c-text4':'#4c1d95','--c-text5':'#2e1065',
            '--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171',
            '--c-tabbar':'#020008','--c-tab':'#050012','--c-tab-active':'#07031a',
        }
    },
    synthwave: {
        name: 'Synthwave', icon: '🌆', desc: 'Retro neon grid', anim: true,
        preview: ['#0d0015','#ff2dff','#1a0030'],
        vars: {
            '--c-bg0':'#0d0015','--c-bg1':'#120020','--c-bg2':'#1a0030','--c-bg3':'#220040',
            '--c-border':'#2d0050','--c-border2':'#1e0038',
            '--c-accent':'#ff2dff','--c-accent2':'#cc00cc','--c-accent-glow':'rgba(255,45,255,0.35)',
            '--c-text0':'#ffe4ff','--c-text1':'#ff9eff','--c-text2':'#cc44cc',
            '--c-text3':'#882288','--c-text4':'#551155','--c-text5':'#2a0a2a',
            '--c-success':'#00ffcc','--c-warn':'#ffcc00','--c-err':'#ff3366',
            '--c-tabbar':'#080010','--c-tab':'#0d0018','--c-tab-active':'#120020',
        }
    },
    frost: {
        name: 'Frost', icon: '❄️', desc: 'Arctic ice & steel', anim: false,
        preview: ['#070d18','#38bdf8','#122035'],
        vars: {
            '--c-bg0':'#070d18','--c-bg1':'#0c1525','--c-bg2':'#122035','--c-bg3':'#1a2d45',
            '--c-border':'#1e3a5a','--c-border2':'#142c48',
            '--c-accent':'#38bdf8','--c-accent2':'#0284c7','--c-accent-glow':'rgba(56,189,248,0.3)',
            '--c-text0':'#e0f2fe','--c-text1':'#7dd3fc','--c-text2':'#38bdf8',
            '--c-text3':'#0369a1','--c-text4':'#0c4a6e','--c-text5':'#082f49',
            '--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171',
            '--c-tabbar':'#040810','--c-tab':'#080e1c','--c-tab-active':'#0c1525',
        }
    },
};

let currentTheme = 'void';
let stopAnim     = null;

// ─── Canvas Animations ────────────────────────────────────────────────────
function clearBgCanvas() {
    if (stopAnim) { stopAnim(); stopAnim = null; }
    const old = document.getElementById('st-anim-canvas');
    if (old) old.remove();
}

function makeBgCanvas() {
    clearBgCanvas();
    const fx = document.getElementById('st-bg-fx'); if (!fx) return null;
    const cv = document.createElement('canvas');
    cv.id = 'st-anim-canvas';
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    cv.width  = fx.offsetWidth  || window.innerWidth;
    cv.height = fx.offsetHeight || window.innerHeight;
    fx.appendChild(cv);
    return cv;
}

function animHacker() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const FS   = 14;
    const cols = Math.floor(W / FS);
    const drops = Array.from({length: cols}, () => Math.random() * -50);
    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF><{}[]|/\\';
    let alive = true;
    function frame() {
        if (!alive) return;
        ctx.fillStyle = 'rgba(0,0,0,0.055)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = FS + 'px "Fira Code",monospace';
        for (let i = 0; i < cols; i++) {
            const y = drops[i] * FS;
            const chr = CHARS[Math.floor(Math.random() * CHARS.length)];
            // bright head
            ctx.fillStyle = '#ccffcc';
            ctx.fillText(chr, i * FS, y);
            // dim body on previous row
            if (drops[i] > 1) {
                ctx.fillStyle = 'rgba(0,200,50,0.6)';
                ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FS, y - FS);
            }
            if (y > H && Math.random() > 0.975) drops[i] = 0;
            drops[i] += 0.55;
        }
        requestAnimationFrame(frame);
    }
    frame();
    stopAnim = () => { alive = false; };
}

function animGalaxy() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const COLORS = ['#ffffff','#d8b4fe','#c084fc','#e9d5ff','#a78bfa','#ede9fe'];
    const stars = Array.from({length: 320}, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.9 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.018 + 0.004,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    const shooters = Array.from({length: 4}, () => resetShooter({}, W, H));
    function resetShooter(s, w, h) {
        s.x = Math.random() * w; s.y = Math.random() * h * 0.6;
        s.vx = -(Math.random() * 7 + 3); s.vy = Math.random() * 3.5 + 1;
        s.life = 0; s.maxLife = 70 + Math.random() * 80;
        return s;
    }
    const nebulas = [
        {x:W*0.18,y:H*0.28,r:W*0.38,c:'rgba(110,30,210,0.09)'},
        {x:W*0.82,y:H*0.72,r:W*0.3, c:'rgba(70,15,170,0.07)'},
        {x:W*0.52,y:H*0.12,r:W*0.24,c:'rgba(190,90,255,0.06)'},
    ];
    let alive = true;
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        // Nebulas
        nebulas.forEach(n => {
            const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
            g.addColorStop(0, n.c); g.addColorStop(1,'transparent');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
        });
        // Stars
        stars.forEach(s => {
            s.phase += s.speed;
            const a = 0.35 + 0.65 * Math.abs(Math.sin(s.phase));
            ctx.globalAlpha = a;
            ctx.fillStyle = s.color;
            ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
            if (s.r > 1.5 && a > 0.8) {
                ctx.globalAlpha = a * 0.25;
                ctx.beginPath(); ctx.arc(s.x,s.y,s.r*3.5,0,Math.PI*2); ctx.fill();
            }
        });
        // Shooting stars
        shooters.forEach(s => {
            s.life++;
            if (s.life > s.maxLife) { resetShooter(s,W,H); return; }
            const p = s.life / s.maxLife;
            const alpha = p < 0.2 ? p/0.2 : p > 0.8 ? (1-p)/0.2 : 1;
            ctx.globalAlpha = alpha * 0.75;
            const tail = s.len || 60;
            const grd = ctx.createLinearGradient(s.x,s.y,s.x-s.vx*tail/8,s.y-s.vy*tail/8);
            grd.addColorStop(0,'#ffffff'); grd.addColorStop(1,'transparent');
            ctx.strokeStyle = grd; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*tail/8,s.y-s.vy*tail/8); ctx.stroke();
            s.x += s.vx * 0.5; s.y += s.vy * 0.5;
            if (s.x < -50 || s.y > H + 50) resetShooter(s,W,H);
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(frame);
    }
    frame();
    stopAnim = () => { alive = false; };
}

function animSynthwave() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const HRZ = H * 0.52;
    let offset = 0, alive = true;
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        // Sky
        const sky = ctx.createLinearGradient(0,0,0,HRZ);
        sky.addColorStop(0,'rgba(13,0,21,0.95)');
        sky.addColorStop(0.65,'rgba(35,0,55,0.7)');
        sky.addColorStop(1,'rgba(80,0,120,0.25)');
        ctx.fillStyle = sky; ctx.fillRect(0,0,W,HRZ);
        // Sun
        const sunY = HRZ * 0.7, sunR = H * 0.155;
        const sg = ctx.createRadialGradient(W/2,sunY,sunR*0.05,W/2,sunY,sunR);
        sg.addColorStop(0,'#ff9500'); sg.addColorStop(0.35,'#ff2dff'); sg.addColorStop(1,'transparent');
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(W/2,sunY,sunR,0,Math.PI*2); ctx.fill();
        // Sun stripes
        for (let i = 0; i < 7; i++) {
            const sy = sunY - sunR * 0.28 + i * (sunR * 0.8 / 7);
            if (sy > sunY - sunR && sy < sunY + sunR) {
                ctx.fillStyle = 'rgba(13,0,21,0.72)';
                ctx.fillRect(W/2 - sunR, sy, sunR*2, sunR * 0.075);
            }
        }
        // Ground clip
        ctx.save();
        ctx.beginPath(); ctx.rect(0, HRZ, W, H-HRZ); ctx.clip();
        const gnd = ctx.createLinearGradient(0,HRZ,0,H);
        gnd.addColorStop(0,'rgba(55,0,90,0.5)'); gnd.addColorStop(1,'rgba(8,0,16,0.9)');
        ctx.fillStyle = gnd; ctx.fillRect(0,HRZ,W,H-HRZ);
        // Horizontal grid lines
        for (let i = 1; i <= 16; i++) {
            const t = i / 16;
            const persp = Math.pow(t, 2.4);
            const baseY = HRZ + (H - HRZ) * persp;
            const anim  = ((offset * 0.7 * Math.sqrt(t)) % ((H - HRZ) / 16));
            const fy    = baseY + anim;
            if (fy < HRZ || fy > H) continue;
            const a = Math.min(1, t * 2) * 0.9;
            ctx.strokeStyle = `rgba(255,45,255,${a})`;
            ctx.lineWidth = 0.6 + t * 2;
            ctx.beginPath(); ctx.moveTo(0,fy); ctx.lineTo(W,fy); ctx.stroke();
        }
        // Vertical lines
        for (let i = -12; i <= 12; i++) {
            const spread = (W * 0.65 / 12) * i;
            ctx.strokeStyle = 'rgba(255,45,255,0.45)';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(W/2 + spread*0.012, HRZ);
            ctx.lineTo(W/2 + spread, H);
            ctx.stroke();
        }
        ctx.restore();
        // Scan line overlay
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
        offset += 1.4;
        requestAnimationFrame(frame);
    }
    frame();
    stopAnim = () => { alive = false; };
}

function startThemeAnim(key) {
    clearBgCanvas();
    if (key === 'hacker')    setTimeout(animHacker,    60);
    if (key === 'galaxy')    setTimeout(animGalaxy,    60);
    if (key === 'synthwave') setTimeout(animSynthwave, 60);
}

// ─── Apply Theme ──────────────────────────────────────────────────────────
function applyTheme(key) {
    if (!THEMES[key]) return;
    currentTheme = key;
    const win = document.getElementById('st-window'); if (!win) return;
    Object.entries(THEMES[key].vars).forEach(([k,v]) => win.style.setProperty(k,v));
    win.setAttribute('data-theme', key);
    document.querySelectorAll('.st-theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === key));
    if (THEMES[key].anim) startThemeAnim(key);
    else clearBgCanvas();
    try { GM_setValue('st_theme', key); } catch(_){}
}

// ─── Section & Tab Switch ─────────────────────────────────────────────────
function switchManage(section) {
    ['sniper','catalog','accounts','people'].forEach(s => {
        document.getElementById('st-msec-'+s)?.classList.toggle('st-ctab-active', s===section);
        const c = document.getElementById('st-msec-content-'+s);
        if (c) c.style.display = s===section ? 'block' : 'none';
    });
    document.getElementById('st-tab-settings')?.classList.remove('st-ctab-active');
    if (section === 'catalog') renderCatalogList();
    if (section === 'accounts') rebuildSettingsAcctList();
}

function switchTab(tab) {
    const manage   = document.getElementById('st-tab-content-manage');
    const settings = document.getElementById('st-tab-content-settings');
    if (tab === 'manage') {
        if (manage)   manage.style.display   = 'contents';
        if (settings) settings.style.display = 'none';
        document.getElementById('st-tab-settings')?.classList.remove('st-ctab-active');
    } else {
        if (manage)   manage.style.display   = 'none';
        if (settings) settings.style.display = 'flex';
        document.getElementById('st-tab-settings')?.classList.add('st-ctab-active');
        ['sniper','catalog','accounts','people'].forEach(s => document.getElementById('st-msec-'+s)?.classList.remove('st-ctab-active'));
        rebuildThemeGrid();
    }
}

// ─── Theme Grid ───────────────────────────────────────────────────────────
function rebuildThemeGrid() {
    const el = document.getElementById('st-theme-grid');
    if (!el || el.dataset.built) return;
    el.dataset.built = '1';
    el.innerHTML = '';
    Object.entries(THEMES).forEach(([key, t]) => {
        const [bg, accent, bg2] = t.preview;
        const card = document.createElement('div');
        card.className = 'st-theme-card' + (key === currentTheme ? ' active' : '');
        card.dataset.theme = key;
        card.innerHTML = `
            <div class="st-theme-preview" style="background:${bg};border-bottom:1px solid ${accent}33;">
                <div style="width:34px;height:34px;border-radius:10px;background:${accent};box-shadow:0 0 16px ${accent}99;flex-shrink:0;"></div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <div style="width:44px;height:10px;border-radius:4px;background:${bg2};"></div>
                    <div style="width:30px;height:10px;border-radius:4px;background:${accent}44;"></div>
                </div>
                ${t.anim ? '<div class="st-anim-badge">✦ LIVE</div>' : ''}
            </div>
            <div style="padding:11px 13px 13px;">
                <div style="font-size:13px;font-weight:700;color:${accent};margin-bottom:3px;">${t.icon} ${t.name}</div>
                <div style="font-size:10px;color:var(--c-text3);">${t.desc}</div>
            </div>
        `;
        card.addEventListener('click', () => applyTheme(key));
        el.appendChild(card);
    });
}

// ─── Styles ───────────────────────────────────────────────────────────────
function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fira+Code:wght@400;500;600&display=swap');

        #st-overlay {
            position:fixed;inset:0;z-index:999999;
            display:flex;align-items:stretch;
            opacity:0;pointer-events:none;
            transition:opacity 0.18s ease;
        }
        #st-overlay.open { opacity:1;pointer-events:all; }

        #st-window {
            --c-bg0:#02050e; --c-bg1:#060c18; --c-bg2:#0d1829; --c-bg3:#111e33;
            --c-border:#0f1e35; --c-border2:#0a1525;
            --c-accent:#e94560; --c-accent2:#b91c4a; --c-accent-glow:rgba(233,69,96,0.3);
            --c-text0:#f1f5f9; --c-text1:#94a3b8; --c-text2:#475569;
            --c-text3:#334155; --c-text4:#1e3a5f; --c-text5:#0a1525;
            --c-success:#22c55e; --c-warn:#eab308; --c-err:#ef4444;
            --c-tabbar:#010408; --c-tab:#030810; --c-tab-active:#060c18;

            flex:1;display:flex;flex-direction:column;overflow:hidden;
            background:var(--c-tab-active);position:relative;
            transform:scale(0.985);opacity:0;
            transition:transform 0.25s cubic-bezier(0.16,1,0.3,1),opacity 0.18s ease;
        }
        #st-overlay.open #st-window { transform:scale(1);opacity:1; }
        #st-window * { box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',system-ui,sans-serif !important; }
        #st-window ::-webkit-scrollbar { width:4px;height:4px; }
        #st-window ::-webkit-scrollbar-track { background:transparent; }
        #st-window ::-webkit-scrollbar-thumb { background:var(--c-border);border-radius:99px; }
        #st-window ::-webkit-scrollbar-thumb:hover { background:var(--c-accent); }

        #st-bg-fx {
            position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;
            background:var(--c-bg1);
        }
        [data-theme="void"]      #st-bg-fx { background:var(--c-bg1); }
        [data-theme="hacker"]    #st-bg-fx { background:#000; }
        [data-theme="galaxy"]    #st-bg-fx { background:#04010f; }
        [data-theme="synthwave"] #st-bg-fx { background:#0d0015; }
        [data-theme="frost"]     #st-bg-fx { background:var(--c-bg1); }

        [data-theme="void"] #st-bg-fx::after {
            content:'';position:absolute;inset:0;
            background:radial-gradient(ellipse 55% 55% at 78% 18%,rgba(233,69,96,0.06) 0%,transparent 60%),
                        radial-gradient(ellipse 35% 40% at 12% 85%,rgba(185,28,74,0.04) 0%,transparent 55%);
            animation:st-void-pulse 7s ease-in-out infinite alternate;
        }
        [data-theme="frost"] #st-bg-fx::after {
            content:'';position:absolute;inset:0;
            background:radial-gradient(ellipse 60% 50% at 75% 20%,rgba(56,189,248,0.07) 0%,transparent 55%),
                        radial-gradient(ellipse 45% 35% at 15% 80%,rgba(14,165,233,0.05) 0%,transparent 50%);
            animation:st-frost-shimmer 9s ease-in-out infinite alternate;
        }

        /* ── Tab Bar ──
           THE FIX: active tab gets margin-bottom:-1px + border-bottom-color matching
           the content background. No box-shadow corner trick = no black artifacts. */
        #st-tabbar {
            display:flex;align-items:flex-end;
            height:54px;min-height:54px;flex-shrink:0;
            background:var(--c-tabbar);
            padding:0 0 0 16px;
            position:relative;z-index:10;
            border-bottom:1px solid var(--c-border);
            user-select:none;
        }
        #st-tabbar-logo {
            display:flex;align-items:center;gap:10px;
            padding:0 20px 10px 4px;flex-shrink:0;
            border-right:1px solid var(--c-border2);margin-right:10px;
        }
        #st-logo-icon {
            width:30px;height:30px;border-radius:9px;
            background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));
            display:flex;align-items:center;justify-content:center;
            font-size:15px;flex-shrink:0;box-shadow:0 2px 10px var(--c-accent-glow);
        }
        #st-logo-name { font-size:13px;font-weight:700;color:var(--c-text1);white-space:nowrap; }
        #st-logo-name span { color:var(--c-text4);font-weight:500; }
        #st-tabs-area {
            display:flex;align-items:flex-end;gap:3px;
            flex:1;overflow-x:auto;overflow-y:visible;
            scrollbar-width:none;
        }
        #st-tabs-area::-webkit-scrollbar { display:none; }

        .st-ctab {
            position:relative;height:42px;padding:0 24px;
            border-radius:10px 10px 0 0;
            border:1px solid transparent;
            border-bottom:1px solid var(--c-border);
            display:flex;align-items:center;gap:8px;
            cursor:pointer;font-size:12px;font-weight:600;
            color:var(--c-text3);background:transparent;
            white-space:nowrap;flex-shrink:0;
            transition:color 0.15s,background 0.15s,border-color 0.15s;
            outline:none;min-width:126px;justify-content:center;
            margin-bottom:-1px;   /* overlap the tabbar border-bottom */
            z-index:1;
        }
        .st-ctab:hover {
            background:var(--c-tab);color:var(--c-text2);
            border-color:var(--c-border2);
            border-bottom-color:var(--c-border); /* keep the underline visible on hover */
        }
        .st-ctab.st-ctab-active {
            background:var(--c-tab-active);
            color:var(--c-text0);
            border-color:var(--c-border);
            border-bottom-color:var(--c-tab-active); /* <-- seamless: hides the bottom seam */
            z-index:5;
        }
        .st-ctab-accent {
            position:absolute;top:0;left:0;right:0;height:2.5px;
            background:linear-gradient(90deg,var(--c-accent),var(--c-accent2));
            border-radius:10px 10px 0 0;opacity:0;transition:opacity 0.18s;
        }
        .st-ctab.st-ctab-active .st-ctab-accent { opacity:1; }
        .st-ctab-sep {
            width:1px;height:22px;margin:0 6px 10px;
            background:var(--c-border2);flex-shrink:0;align-self:flex-end;
        }

        #st-tabbar-controls {
            display:flex;align-items:center;gap:9px;
            padding:0 16px 10px;flex-shrink:0;
        }
        #st-acct-chip {
            padding:6px 13px;background:var(--c-bg2);
            border:1px solid var(--c-border2);border-radius:9px;max-width:180px;cursor:default;
        }
        #st-acct-mini-name { font-size:12px;font-weight:700;color:var(--c-accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4; }
        #st-acct-mini-sub  { font-size:9px;color:var(--c-text4);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
        select#st-acct-sel {
            background:var(--c-bg2);border:1px solid var(--c-border);
            color:var(--c-text1);border-radius:9px;
            padding:7px 10px;font-size:11px;outline:none;cursor:pointer;
            transition:border-color 0.15s;max-width:160px;
        }
        select#st-acct-sel:focus { border-color:var(--c-accent); }
        #st-close-btn {
            width:33px;height:33px;display:flex;align-items:center;justify-content:center;
            background:rgba(255,255,255,0.03);border:1px solid var(--c-border);
            color:var(--c-text3);font-size:14px;cursor:pointer;border-radius:9px;
            transition:all 0.15s;flex-shrink:0;
        }
        #st-close-btn:hover { background:rgba(233,69,96,0.15);color:#e94560;border-color:rgba(233,69,96,0.3); }

        #st-body { flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative;z-index:1; }
        #st-sidebar { display:none; }
        #st-main { flex:1;overflow-y:auto;padding:34px 42px; }
        #st-tab-content-settings { flex:1;overflow-y:auto;padding:38px 42px;display:none; }

        .st-sec-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:26px;gap:18px; }
        .st-sec-title  { color:var(--c-text0);font-size:22px;font-weight:700;line-height:1.2; }
        .st-sec-sub    { color:var(--c-text3);font-size:11px;margin-top:5px;line-height:1.6; }

        .st-btn-primary {
            padding:13px 28px;border:none;border-radius:11px;cursor:pointer;
            font-weight:700;font-size:13px;color:#fff;
            background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));
            box-shadow:0 0 22px var(--c-accent-glow);
            transition:opacity 0.15s,transform 0.12s,box-shadow 0.15s;
            white-space:nowrap;flex-shrink:0;
        }
        .st-btn-primary:hover:not(:disabled) { opacity:0.87;transform:translateY(-1px);box-shadow:0 5px 30px var(--c-accent-glow); }
        .st-btn-primary:active:not(:disabled) { transform:scale(0.97); }
        .st-btn-primary:disabled { opacity:0.45;cursor:not-allowed; }

        .st-btn-secondary {
            padding:11px 18px;background:var(--c-bg0);color:var(--c-text3);
            border:1px solid var(--c-border2);border-radius:10px;cursor:pointer;
            font-size:12px;font-weight:600;transition:all 0.15s;
            display:flex;align-items:center;gap:7px;
        }
        .st-btn-secondary:hover { background:var(--c-bg2);color:var(--c-text1);border-color:var(--c-border); }

        /* Sniper 2-col */
        #st-sniper-layout { display:grid;grid-template-columns:1fr 400px;gap:26px;align-items:start; }
        #st-sniper-status {
            display:flex;align-items:center;gap:13px;
            padding:14px 18px;background:var(--c-bg0);
            border:1px solid var(--c-border2);border-radius:12px;
            margin-bottom:22px;transition:background 0.3s,border-color 0.3s;
        }
        .st-dot { width:9px;height:9px;border-radius:50%;flex-shrink:0;transition:background 0.3s,box-shadow 0.3s; }
        .st-dot-idle    { background:var(--c-border); }
        .st-dot-active  { background:var(--c-success);box-shadow:0 0 8px var(--c-success);animation:st-pulse-g 1.8s infinite; }
        .st-dot-hot     { background:var(--c-accent);box-shadow:0 0 8px var(--c-accent);animation:st-pulse-r 1.2s infinite; }
        .st-dot-loading { background:var(--c-warn);box-shadow:0 0 8px var(--c-warn); }
        .st-dot-text    { font-size:12px;color:var(--c-text2); }

        .st-stats-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:11px;margin-bottom:20px; }
        .st-stat {
            background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:12px;
            padding:17px 20px;transition:border-color 0.15s;
        }
        .st-stat:hover { border-color:var(--c-border); }
        .st-stat-label { color:var(--c-text4);font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px; }
        .st-stat-val   { color:var(--c-text0);font-size:30px;font-weight:700;font-family:'Fira Code',monospace !important;line-height:1; }

        .st-rtt-wrap { margin-bottom:0; }
        .st-rtt-labels { display:flex;justify-content:space-between;margin-bottom:7px; }
        .st-rtt-labels span { color:var(--c-text4);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.9px; }
        .st-rtt-track { height:6px;background:var(--c-bg0);border-radius:4px;overflow:hidden;border:1px solid var(--c-border2); }
        #st-rtt-fill  { height:100%;border-radius:4px;background:linear-gradient(90deg,var(--c-success),var(--c-warn),var(--c-err));transition:width 0.4s ease; }

        .st-log-panel { background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:16px;display:flex;flex-direction:column;min-height:320px; }
        .st-log-hdr   { display:flex;align-items:center;justify-content:space-between;margin-bottom:10px; }
        .st-log-hdr-lbl { color:var(--c-text4);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px; }
        #st-log-clear { background:none;border:none;color:var(--c-text5);font-size:10px;cursor:pointer;padding:3px 8px;border-radius:5px;transition:color 0.12s; }
        #st-log-clear:hover { color:var(--c-text2); }
        #st-log { flex:1;overflow-y:auto;min-height:0; }

        .st-cat-toolbar { display:flex;justify-content:space-between;align-items:center;margin-bottom:16px; }
        #st-cat-list { padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:7px; }

        .st-input {
            width:100%;padding:12px 15px;background:var(--c-bg0);
            border:1px solid var(--c-border2);border-radius:10px;
            color:var(--c-text1);font-size:12px;outline:none;transition:border-color 0.15s;
        }
        .st-input:focus { border-color:var(--c-accent); }
        .st-input::placeholder { color:var(--c-text5); }
        #st-trade-status { display:none;padding:11px 14px;border-radius:10px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);margin-bottom:13px;word-break:break-word; }
        .st-trade-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:13px; }
        .st-inv-lbl { font-size:10px;color:var(--c-text4);font-weight:700;text-transform:uppercase;letter-spacing:0.9px;margin-bottom:7px;display:flex;align-items:center;gap:7px; }
        .st-inv-dot { width:6px;height:6px;border-radius:50%;flex-shrink:0; }
        .st-inv-box { overflow-y:auto;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:10px;padding:5px;max-height:230px;min-height:80px; }
        .st-trade-hint { padding:9px 12px;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:9px;font-size:10px;color:var(--c-text4);text-align:center;margin-bottom:13px; }
        #st-trade-summary { display:none;padding:11px 16px;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:10px;margin-bottom:13px;text-align:center;font-size:12px; }

        .st-settings-wrap { max-width:860px;margin:0 auto; }
        .st-set-section   { margin-bottom:38px; }
        .st-set-title     { color:var(--c-text0);font-size:19px;font-weight:700;margin-bottom:5px; }
        .st-set-sub       { color:var(--c-text3);font-size:11px;margin-bottom:22px;line-height:1.6; }

        #st-theme-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:13px; }
        .st-theme-card {
            border-radius:14px;border:2px solid var(--c-border);
            overflow:hidden;cursor:pointer;background:var(--c-bg0);
            transition:border-color 0.15s,transform 0.12s,box-shadow 0.15s;
        }
        .st-theme-card:hover { transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.55); }
        .st-theme-card.active { border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent),0 0 26px var(--c-accent-glow); }
        .st-theme-preview { height:78px;position:relative;display:flex;align-items:center;justify-content:center;gap:11px;padding:15px; }
        .st-anim-badge { position:absolute;top:7px;right:7px;font-size:8px;font-weight:700;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,0.13);color:rgba(255,255,255,0.7);letter-spacing:0.5px; }

        .st-card { background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:14px;padding:22px;margin-bottom:15px; }
        .st-card-title { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--c-text4);margin-bottom:18px; }
        .st-field { margin-bottom:13px; }
        .st-field-label { font-size:11px;color:var(--c-text3);margin-bottom:5px; }
        .st-set-input { width:100%;padding:10px 13px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:9px;color:var(--c-text1);font-size:11px;outline:none;transition:border-color 0.15s; }
        .st-set-input:focus { border-color:var(--c-accent); }
        .st-set-input::placeholder { color:var(--c-text5); }

        .st-skel { background:linear-gradient(90deg,var(--c-bg2) 25%,var(--c-bg3) 50%,var(--c-bg2) 75%);background-size:200% 100%;animation:st-shimmer 1.4s infinite; }

        /* Sniper settings */
        .st-snip-settings { background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:18px 20px;margin-bottom:18px; }
        .st-snip-settings-row { display:flex;align-items:center;gap:14px;flex-wrap:wrap; }
        .st-snip-field { display:flex;flex-direction:column;gap:5px; }
        .st-snip-label { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4); }
        .st-snip-input { width:110px;padding:8px 11px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:8px;color:var(--c-text1);font-size:12px;font-family:'Fira Code',monospace;outline:none;transition:border-color 0.14s; }
        .st-snip-input:focus { border-color:var(--c-accent); }
        .st-snip-input::placeholder { color:var(--c-text5); }
        .st-snip-sep { width:1px;height:36px;background:var(--c-border2);flex-shrink:0; }
        .st-toggle-row { display:flex;flex-direction:column;gap:5px;align-items:center; }
        .st-toggle-track { width:40px;height:22px;border-radius:99px;background:var(--c-border);position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0; }
        .st-toggle-track.on { background:var(--c-accent); }
        .st-toggle-thumb { width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform 0.18s;box-shadow:0 1px 4px rgba(0,0,0,0.4); }
        .st-toggle-track.on .st-toggle-thumb { transform:translateX(18px); }
        .st-spin { display:inline-block;animation:st-spin 0.7s linear infinite; }
        .st-sniper-active { animation:st-pulse-g 1.8s infinite; }

        [data-theme="hacker"] #st-window * { font-family:'Fira Code',monospace !important; }

        @keyframes st-spin         { to{transform:rotate(360deg)} }
        @keyframes st-shimmer      { 0%{background-position:-200% 0}100%{background-position:200% 0} }
        @keyframes st-pulse-g      { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{box-shadow:0 0 0 10px rgba(34,197,94,0)} }
        @keyframes st-pulse-r      { 0%,100%{box-shadow:0 0 0 0 rgba(233,69,96,0.5)}70%{box-shadow:0 0 0 10px rgba(233,69,96,0)} }
        @keyframes st-void-pulse   { 0%{opacity:0.6;transform:scale(1)}100%{opacity:1;transform:scale(1.04)} }
        @keyframes st-frost-shimmer{ 0%{opacity:0.7;transform:scale(1)}100%{opacity:1;transform:scale(1.03)} }
    `;
    document.head.appendChild(s);

    // Sniper pill (global, always visible outside overlay)
    const pillStyle = document.createElement('style');
    pillStyle.textContent = `
        #st-sniper-pill {
            position:fixed;top:14px;left:50%;
            transform:translateX(-50%) translateY(-80px);
            z-index:1000000;
            display:flex;align-items:center;gap:9px;
            padding:9px 20px 9px 14px;
            background:rgba(4,14,4,0.94);
            border:1px solid rgba(34,197,94,0.38);
            border-radius:999px;
            backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
            box-shadow:0 4px 28px rgba(0,0,0,0.65),0 0 0 1px rgba(34,197,94,0.12),0 0 18px rgba(34,197,94,0.08);
            transition:transform 0.42s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease;
            opacity:0;pointer-events:none;user-select:none;cursor:pointer;
            font-family:'Fira Code',monospace;
        }
        #st-sniper-pill.visible {
            transform:translateX(-50%) translateY(0);
            opacity:1;pointer-events:auto;
        }
        #st-sniper-pill:hover { border-color:rgba(34,197,94,0.65);box-shadow:0 4px 28px rgba(0,0,0,0.65),0 0 26px rgba(34,197,94,0.22); }
        #st-pill-dot { width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:st-pill-pulse 1.8s infinite; }
        /* hide number input spinners globally */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none;margin:0; }
        input[type=number] { -moz-appearance:textfield; }
        @keyframes st-pill-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }
    `;
    document.head.appendChild(pillStyle);
}

// ─── Sniper Pill ──────────────────────────────────────────────────────────
function showSniperPill() {
    const p = document.getElementById('st-sniper-pill'); if (!p) return;
    const ov = document.getElementById('st-overlay');
    if (!ov || !ov.classList.contains('open')) p.classList.add('visible');
}
function hideSniperPill() {
    const p = document.getElementById('st-sniper-pill'); if (!p) return;
    p.classList.remove('visible');
}
function updateSniperPill(checks, cps) {
    const c = document.getElementById('st-pill-checks'); if (!c) return;
    c.textContent = checks > 0 ? ' · ' + checks.toLocaleString() + ' checks  ' + cps + '/s' : '';
}

// ─── Build UI ─────────────────────────────────────────────────────────────
function buildUI() {
    const overlay = document.createElement('div');
    overlay.id = 'st-overlay';

    const win = document.createElement('div');
    win.id = 'st-window';
    win.setAttribute('data-theme', 'void');

    win.innerHTML = `
        <div id="st-bg-fx"></div>

        <div id="st-tabbar">
            <div id="st-tabbar-logo">
                <div id="st-logo-icon">🛒</div>
                <div id="st-logo-name">Strrev <span>Tools</span></div>
            </div>
            <div id="st-tabs-area">
                <button class="st-ctab st-ctab-active" id="st-msec-sniper"><div class="st-ctab-accent"></div>🎯 Sniper</button>
                <button class="st-ctab" id="st-msec-catalog"><div class="st-ctab-accent"></div>🛒 Catalog</button>
                <button class="st-ctab" id="st-msec-accounts"><div class="st-ctab-accent"></div>👥 Accounts</button>
                <button class="st-ctab" id="st-msec-people"><div class="st-ctab-accent"></div>🤝 People</button>
                <div class="st-ctab-sep"></div>
                <button class="st-ctab" id="st-tab-settings"><div class="st-ctab-accent"></div>⚙️ Settings</button>
            </div>
            <div id="st-tabbar-controls">
                <div id="st-acct-chip">
                    <div id="st-acct-mini-name">Session</div>
                    <div id="st-acct-mini-sub">Current browser session</div>
                </div>
                <select id="st-acct-sel"><option value="-1">🌐 Current Session</option></select>
                <button id="st-tab-manage" style="display:none;"></button>
                <button id="st-close-btn" title="Close (Esc)">✕</button>
            </div>
        </div>

        <div id="st-body">
            <div id="st-tab-content-manage" style="display:contents;">
                <div id="st-sidebar"></div>
                <div id="st-main">

                    <!-- SNIPER -->
                    <div id="st-msec-content-sniper">
                        <div class="st-sec-header">
                            <div>
                                <div class="st-sec-title">Auto-Buy Sniper</div>
                                <div class="st-sec-sub">Polls the catalog API — auto-buys the moment a new item appears for the selected account(s)</div>
                            </div>
                            <button id="st-sniper-btn" class="st-btn-primary">🎯 Start Sniper</button>
                        </div>
                        <div id="st-sniper-status">
                            <div class="st-dot st-dot-idle"></div>
                            <span class="st-dot-text">Idle — press Start to begin sniping</span>
                        </div>

                        <!-- SNIPER SETTINGS -->
                        <div class="st-snip-settings">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">⚙️ Filter Settings</div>
                            <div class="st-snip-settings-row">
                                <div class="st-snip-field">
                                    <span class="st-snip-label">Min Price R$</span>
                                    <input id="st-snip-min-robux" class="st-snip-input" type="number" min="0" placeholder="no limit" title="Only snipe Robux items at or above this price.">
                                </div>
                                <div class="st-snip-field">
                                    <span class="st-snip-label">Max Price R$</span>
                                    <input id="st-snip-max-robux" class="st-snip-input" type="number" min="0" placeholder="no limit" title="Snipe items at or below this Robux price. Set 0 for free only.">
                                </div>
                                <div class="st-snip-sep"></div>
                                <div class="st-snip-field">
                                    <span class="st-snip-label">Min Price T$</span>
                                    <input id="st-snip-min-tix" class="st-snip-input" type="number" min="0" placeholder="no limit" title="Only snipe Tix items at or above this price.">
                                </div>
                                <div class="st-snip-field">
                                    <span class="st-snip-label">Max Price T$</span>
                                    <input id="st-snip-max-tix" class="st-snip-input" type="number" min="0" placeholder="no limit" title="Snipe tix items at or below this price. Set 0 for free only.">
                                </div>
                                <div class="st-snip-field">
                                    <span class="st-snip-label">Delay (ms)</span>
                                    <input id="st-snip-delay" class="st-snip-input" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="0" value="0" title="Poll interval in milliseconds. 0 = as fast as possible.">
                                </div>
                                <div class="st-snip-sep"></div>
                                <div class="st-toggle-row">
                                    <span class="st-snip-label">Limiteds</span>
                                    <div id="st-snip-limiteds" class="st-toggle-track" title="Only snipe items with Limited restriction"><div class="st-toggle-thumb"></div></div>
                                </div>
                                <div class="st-toggle-row">
                                    <span class="st-snip-label">LimitedU</span>
                                    <div id="st-snip-limitedu" class="st-toggle-track" title="Only snipe LimitedUnique items"><div class="st-toggle-thumb"></div></div>
                                </div>
                                <div class="st-snip-sep"></div>
                                <div class="st-toggle-row">
                                    <span class="st-snip-label">R$ Only</span>
                                    <div id="st-snip-robux-only" class="st-toggle-track" title="Only snipe Robux-priced items"><div class="st-toggle-thumb"></div></div>
                                </div>
                                <div class="st-toggle-row">
                                    <span class="st-snip-label">T$ Only</span>
                                    <div id="st-snip-tix-only" class="st-toggle-track" title="Only snipe Tix-priced items"><div class="st-toggle-thumb"></div></div>
                                </div>
                            </div>
                        </div>

                        <div id="st-sniper-layout">
                            <div>
                                <div class="st-stats-grid">
                                    <div class="st-stat"><div class="st-stat-label">Checks</div><div id="st-checks" class="st-stat-val">0</div></div>
                                    <div class="st-stat"><div class="st-stat-label">Speed</div><div id="st-cps" class="st-stat-val">—</div></div>
                                    <div class="st-stat"><div class="st-stat-label">Avg RTT</div><div id="st-rtt" class="st-stat-val">—</div></div>
                                    <div class="st-stat"><div class="st-stat-label">Workers</div><div id="st-conc" class="st-stat-val">—</div></div>
                                </div>
                                <div class="st-rtt-wrap">
                                    <div class="st-rtt-labels">
                                        <span>Network Health</span>
                                        <span style="font-family:'Fira Code',monospace!important;">0ms → 500ms</span>
                                    </div>
                                    <div class="st-rtt-track"><div id="st-rtt-fill" style="width:0%;"></div></div>
                                </div>
                            </div>
                            <div class="st-log-panel">
                                <div class="st-log-hdr">
                                    <span class="st-log-hdr-lbl">Activity Log</span>
                                    <button id="st-log-clear">Clear</button>
                                </div>
                                <div id="st-log"></div>
                            </div>
                        </div>
                    </div>

                    <!-- CATALOG -->
                    <div id="st-msec-content-catalog" style="display:none;">
                        <div class="st-sec-header">
                            <div>
                                <div class="st-sec-title">Catalog Browser</div>
                                <div class="st-sec-sub">Items visible on this page — click 🛒 to buy for the active account(s)</div>
                            </div>
                            <button id="st-cat-refresh" class="st-btn-secondary">
                                <span id="st-refresh-icon" style="font-size:15px;display:inline-block;">↻</span> Refresh
                            </button>
                        </div>
                        <div class="st-cat-toolbar">
                            <div id="st-cat-count"><span style="color:var(--c-text3);font-size:11px;">Loading...</span></div>
                            <div style="display:flex;gap:14px;font-size:10px;font-weight:700;">
                                <span style="color:#f97316;">R$ <span style="font-weight:400;color:var(--c-text2);">Robux</span></span>
                                <span style="color:#eab308;">T$ <span style="font-weight:400;color:var(--c-text2);">Tix</span></span>
                            </div>
                        </div>
                        <ul id="st-cat-list"></ul>
                    </div>

                    <!-- ACCOUNTS -->
                    <div id="st-msec-content-accounts" style="display:none;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">

                            <!-- Left: account list + add -->
                            <div style="display:flex;flex-direction:column;gap:14px;">
                                <div class="st-sec-title">Accounts</div>
                                <div id="st-settings-acct-list"></div>
                                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:16px;">➕ Add Account</div>
                                    <div class="st-field">
                                        <div class="st-field-label">.ROBLOSECURITY cookie</div>
                                        <input id="st-add-cookie" class="st-set-input" type="password" placeholder="Paste cookie value here…">
                                    </div>
                                    <div class="st-field" style="margin-bottom:18px;">
                                        <div class="st-field-label">CSRF Token <span style="color:var(--c-text4);">(auto-fetched if blank)</span></div>
                                        <input id="st-add-csrf" class="st-set-input" type="text" placeholder="Leave blank to auto-fetch…">
                                    </div>
                                    <button id="st-add-btn" class="st-btn-primary" style="width:100%;padding:13px;">🔍 Fetch Username & Save</button>
                                    <div id="st-add-status" style="margin-top:10px;font-size:11px;min-height:16px;text-align:center;color:var(--c-text2);"></div>
                                </div>
                            </div>

                            <!-- Right: daily + promo -->
                            <div style="display:flex;flex-direction:column;gap:14px;">
                                <div class="st-sec-title">Daily & Promos</div>

                                <!-- Daily chest -->
                                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">🎁 Daily Chest</div>
                                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                                        <button id="st-daily-btn" class="st-btn-primary" style="padding:10px 20px;font-size:12px;">🎁 Claim Now</button>
                                        <!-- Auto-claim toggle -->
                                        <div id="st-daily-toggle" style="display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;">
                                            <span id="st-daily-toggle-label" style="font-size:11px;font-weight:600;color:var(--c-text3);">Auto OFF</span>
                                            <div id="st-daily-toggle-track" style="width:44px;height:24px;border-radius:99px;background:var(--c-border);position:relative;transition:background 0.2s;flex-shrink:0;">
                                                <div id="st-daily-toggle-thumb" style="width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="st-daily-countdown" style="font-size:11px;color:var(--c-text4);font-family:'Fira Code',monospace;min-height:16px;margin-bottom:8px;"></div>
                                    <div id="st-daily-status" style="display:none;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);margin-bottom:8px;word-break:break-word;"></div>
                                    <div id="st-daily-results"></div>
                                </div>

                                <!-- Promo code -->
                                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">🎟️ Promo Code</div>
                                    <div style="display:flex;gap:8px;margin-bottom:10px;">
                                        <input id="st-promo-input" class="st-input" type="text" placeholder="Enter promo code…" style="flex:1;">
                                        <button id="st-promo-btn" class="st-btn-primary" style="padding:10px 18px;font-size:12px;">Redeem</button>
                                    </div>
                                    <div id="st-promo-status" style="display:none;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- PEOPLE -->
                    <div id="st-msec-content-people" style="display:none;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">

                            <!-- Left: Friends + Message -->
                            <div style="display:flex;flex-direction:column;gap:14px;">
                                <div class="st-sec-title">Friends & Messages</div>

                                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">👤 Friend Request</div>
                                    <div style="margin-bottom:10px;">
                                        <div class="st-field-label">Username or User ID</div>
                                        <input id="st-friend-input" class="st-input" type="text" placeholder="e.g. Builderman or 156">
                                    </div>
                                    <button id="st-friend-btn" class="st-btn-primary" style="width:100%;padding:11px;">Send Friend Request</button>
                                    <div id="st-friend-status" style="display:none;margin-top:10px;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                                </div>

                                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">✉️ Send Message</div>
                                    <div style="margin-bottom:10px;">
                                        <div class="st-field-label">Username or User ID</div>
                                        <input id="st-msg-input" class="st-input" type="text" placeholder="e.g. Builderman or 156">
                                    </div>
                                    <div style="margin-bottom:10px;">
                                        <div class="st-field-label">Subject</div>
                                        <input id="st-msg-subject" class="st-input" type="text" placeholder="Message subject…">
                                    </div>
                                    <div style="margin-bottom:12px;">
                                        <div class="st-field-label">Body</div>
                                        <textarea id="st-msg-body" class="st-input" rows="3" placeholder="Write your message…" style="resize:vertical;min-height:70px;"></textarea>
                                    </div>
                                    <div style="margin-bottom:12px;">
                                        <div class="st-field-label" style="margin-bottom:7px;">Send how many times?</div>
                                        <div style="display:flex;align-items:center;border:1px solid var(--c-border);border-radius:10px;overflow:hidden;width:fit-content;background:var(--c-bg0);">
                                            <button onclick="(function(){var i=document.getElementById('st-msg-count');var v=Math.max(1,(parseInt(i.value)||1)-1);i.value=v;})()" style="width:36px;height:36px;background:var(--c-bg2);border:none;border-right:1px solid var(--c-border2);color:var(--c-text1);font-size:17px;cursor:pointer;transition:background 0.12s;line-height:1;font-weight:700;flex-shrink:0;" onmouseenter="this.style.background='var(--c-bg3)'" onmouseleave="this.style.background='var(--c-bg2)'">−</button>
                                            <input id="st-msg-count" type="number" min="1" max="100" value="1" onblur="var v=parseInt(this.value);if(isNaN(v)||v<1)this.value=1;else if(v>100)this.value=100;" style="width:62px;text-align:center;background:transparent;border:none;color:var(--c-accent);font-size:14px;font-weight:700;font-family:'Fira Code',monospace;padding:8px 4px;outline:none;">
                                            <button onclick="(function(){var i=document.getElementById('st-msg-count');var v=Math.min(100,(parseInt(i.value)||1)+1);i.value=v;})()" style="width:36px;height:36px;background:var(--c-bg2);border:none;border-left:1px solid var(--c-border2);color:var(--c-text1);font-size:17px;cursor:pointer;transition:background 0.12s;line-height:1;font-weight:700;flex-shrink:0;" onmouseenter="this.style.background='var(--c-bg3)'" onmouseleave="this.style.background='var(--c-bg2)'">+</button>
                                        </div>
                                    </div>
                                    <button id="st-msg-btn" class="st-btn-primary" style="width:100%;padding:11px;">✉️ Send Message</button>
                                    <div id="st-msg-status" style="display:none;margin-top:10px;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                                </div>
                            </div>

                            <!-- Right: Trade -->
                            <div style="display:flex;flex-direction:column;gap:14px;">
                                <div class="st-sec-title">Trade</div>
                                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;flex:1;">
                                    <div style="display:flex;gap:8px;margin-bottom:12px;">
                                        <input id="st-trade-input" class="st-input" type="text" placeholder="Username or User ID…" style="flex:1;">
                                        <button id="st-load-btn" class="st-btn-primary" style="padding:11px 20px;">Load</button>
                                    </div>
                                    <div id="st-trade-status"></div>
                                    <div class="st-trade-grid">
                                        <div>
                                            <div class="st-inv-lbl"><div class="st-inv-dot" style="background:var(--c-accent);"></div>Your Offer</div>
                                            <div id="st-my-inv" class="st-inv-box"><div style="padding:12px;text-align:center;color:var(--c-text4);font-size:11px;">Load a user first</div></div>
                                        </div>
                                        <div>
                                            <div class="st-inv-lbl"><div class="st-inv-dot" style="background:#3b82f6;"></div>Their Offer</div>
                                            <div id="st-th-inv" class="st-inv-box"><div style="padding:12px;text-align:center;color:var(--c-text4);font-size:11px;">Load a user first</div></div>
                                        </div>
                                    </div>
                                    <div class="st-trade-hint" style="margin-top:10px;">Click items to select them for the trade offer</div>
                                    <div id="st-trade-summary">
                                        <span style="color:var(--c-accent);font-weight:700;">You offer: <span id="st-my-count">0</span></span>
                                        <span style="color:var(--c-text3);margin:0 14px;">↔</span>
                                        <span style="color:#3b82f6;font-weight:700;">You request: <span id="st-th-count">0</span></span>
                                    </div>
                                    <div style="margin-top:12px;">
                                        <div class="st-field-label" style="margin-bottom:7px;">Send how many times?</div>
                                        <div style="display:flex;align-items:center;border:1px solid var(--c-border);border-radius:10px;overflow:hidden;width:fit-content;background:var(--c-bg0);">
                                            <button onclick="(function(){var i=document.getElementById('st-trade-count');var v=Math.max(1,(parseInt(i.value)||1)-1);i.value=v;})()" style="width:36px;height:36px;background:var(--c-bg2);border:none;border-right:1px solid var(--c-border2);color:var(--c-text1);font-size:17px;cursor:pointer;transition:background 0.12s;line-height:1;font-weight:700;flex-shrink:0;" onmouseenter="this.style.background='var(--c-bg3)'" onmouseleave="this.style.background='var(--c-bg2)'">−</button>
                                            <input id="st-trade-count" type="number" min="1" max="100" value="1" onblur="var v=parseInt(this.value);if(isNaN(v)||v<1)this.value=1;else if(v>100)this.value=100;" style="width:62px;text-align:center;background:transparent;border:none;color:var(--c-accent);font-size:14px;font-weight:700;font-family:'Fira Code',monospace;padding:8px 4px;outline:none;">
                                            <button onclick="(function(){var i=document.getElementById('st-trade-count');var v=Math.min(100,(parseInt(i.value)||1)+1);i.value=v;})()" style="width:36px;height:36px;background:var(--c-bg2);border:none;border-left:1px solid var(--c-border2);color:var(--c-text1);font-size:17px;cursor:pointer;transition:background 0.12s;line-height:1;font-weight:700;flex-shrink:0;" onmouseenter="this.style.background='var(--c-bg3)'" onmouseleave="this.style.background='var(--c-bg2)'">+</button>
                                        </div>
                                    </div>
                                    <button id="st-send-btn" disabled class="st-btn-primary" style="width:100%;padding:13px;margin-top:10px;opacity:0.4;pointer-events:none;">
                                        🔄 Send Trade Offer
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <!-- SETTINGS -->
            <div id="st-tab-content-settings">
                <div class="st-settings-wrap">

                    <div class="st-set-section">
                        <div class="st-set-title">Themes</div>
                        <div class="st-set-sub">Pick your visual style. Themes marked <strong style="color:var(--c-accent);">✦ LIVE</strong> have real-time canvas-rendered backgrounds.</div>
                        <div id="st-theme-grid"></div>
                    </div>

                    <div class="st-set-section">
                        <div class="st-card" style="display:flex;align-items:center;justify-content:space-between;">
                            <div>
                                <div style="color:var(--c-text1);font-size:14px;font-weight:600;margin-bottom:5px;">Strrev Tools v9.0</div>
                                <div style="color:var(--c-text3);font-size:11px;line-height:1.8;">Multi-account catalog buyer, silent sniper, trader & more</div>
                                <div style="color:var(--c-text4);font-size:10px;margin-top:4px;">
                                    Press <kbd style="background:var(--c-bg2);border:1px solid var(--c-border);border-radius:4px;padding:1px 7px;font-family:'Fira Code',monospace!important;font-size:10px;">Tab</kbd>
                                    anywhere to open / close
                                </div>
                            </div>
                            <div style="text-align:right;flex-shrink:0;margin-left:24px;">
                                <div style="color:var(--c-text3);font-size:10px;">made by</div>
                                <div style="color:var(--c-accent);font-size:17px;font-weight:700;letter-spacing:0.3px;">vinny</div>
                                <div style="margin-top:8px;font-size:9px;padding:3px 10px;border-radius:20px;font-weight:700;background:rgba(233,69,96,0.1);border:1px solid rgba(233,69,96,0.2);color:var(--c-accent);font-family:'Fira Code',monospace!important;">v9.0</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;

    overlay.appendChild(win);
    document.body.appendChild(overlay);

    // Sniper pill — lives outside the overlay, always visible
    const pill = document.createElement('div');
    pill.id = 'st-sniper-pill';
    pill.title = 'Click to open Strrev Tools';
    pill.innerHTML = '<div id="st-pill-dot"></div>'
        + '<span style="font-size:11px;font-weight:700;color:#22c55e;letter-spacing:0.4px;">SNIPER ACTIVE</span>'
        + '<span id="st-pill-checks" style="font-size:10px;color:rgba(34,197,94,0.55);"></span>'
        + '<span style="font-size:10px;color:rgba(255,255,255,0.25);margin-left:3px;">· tap to open</span>';
    document.body.appendChild(pill);

    const openUI  = () => {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Always hide pill while overlay is open
        pill.classList.remove('visible');
        rebuildAcctSelector();
        if (THEMES[currentTheme]?.anim) startThemeAnim(currentTheme);
    };
    pill.addEventListener('click', openUI);
    const closeUI = () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        // Restore pill if sniper is still running
        if (sniperActive) pill.classList.add('visible');
    };

    // Tab key toggle (skip when focus is in a text field)
    document.addEventListener('keydown', e => {
        if (e.key === 'Tab' && !e.target.matches('input,textarea,select')) {
            e.preventDefault();
            overlay.classList.contains('open') ? closeUI() : openUI();
            return;
        }
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeUI();
    });
    document.getElementById('st-close-btn').addEventListener('click', closeUI);

    ['sniper','catalog','accounts','people'].forEach(s => {
        document.getElementById('st-msec-'+s).addEventListener('click', () => {
            const manage   = document.getElementById('st-tab-content-manage');
            const settings = document.getElementById('st-tab-content-settings');
            if (manage)   manage.style.display   = 'contents';
            if (settings) settings.style.display = 'none';
            switchManage(s);
        });
    });
    document.getElementById('st-tab-settings').addEventListener('click', () => switchTab('settings'));

    document.getElementById('st-acct-sel').addEventListener('change', e => {
        selectedAcctIdx = parseInt(e.target.value);
        try { GM_setValue('st_acct_idx', String(selectedAcctIdx)); } catch(_) {}
        tradeTargetId = null; tradeTargetName = '';
        myInventory = []; theirInventory = [];
        mySelected.clear(); theirSelected.clear();
        updateMiniAcct(); updateTradeSummary();
        log('Account → '+(selectedAcctIdx===-2?'All Accounts':selectedAcctIdx===-1?'Session':accounts[selectedAcctIdx]?.username||'?'),'info');
    });

    document.getElementById('st-sniper-btn').addEventListener('click', toggleSniper);
    document.getElementById('st-log-clear').addEventListener('click', () => { const l=document.getElementById('st-log');if(l)l.innerHTML=''; });

    document.getElementById('st-cat-refresh').addEventListener('click', () => {
        const icon = document.getElementById('st-refresh-icon');
        if (icon) { icon.style.transition='transform 0.4s';icon.style.transform='rotate(360deg)';setTimeout(()=>{icon.style.transform='';},450); }
        renderCatalogList();
    });

    document.getElementById('st-load-btn').addEventListener('click', loadTradeTarget);
    document.getElementById('st-trade-input').addEventListener('keydown', e => { if(e.key==='Enter') loadTradeTarget(); });
    document.getElementById('st-send-btn').addEventListener('click', sendTradeOffer);

    document.getElementById('st-friend-btn').addEventListener('click', sendFriendRequests);
    document.getElementById('st-friend-input').addEventListener('keydown', e => { if(e.key==='Enter') sendFriendRequests(); });
    document.getElementById('st-msg-btn').addEventListener('click', sendMessages);
    document.getElementById('st-msg-input').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('st-msg-subject')?.focus(); });
    document.getElementById('st-daily-btn').addEventListener('click', () => claimDailyChest(false));
    document.getElementById('st-daily-toggle').addEventListener('click', toggleDailyAuto);
    document.getElementById('st-promo-btn').addEventListener('click', redeemPromoCode);
    document.getElementById('st-promo-input').addEventListener('keydown', e => { if(e.key==='Enter') redeemPromoCode(); });
    document.getElementById('st-add-btn').addEventListener('click', addAccountFlow);
    wireSniperSettings();
}

// ─── Toggle Helper ───────────────────────────────────────────────────────
function setToggle(id, val) {
    const el = document.getElementById(id); if (!el) return;
    if (val) el.classList.add('on'); else el.classList.remove('on');
}
function getToggle(id) {
    const el = document.getElementById(id); return el ? el.classList.contains('on') : false;
}
function wireToggle(id, key) {
    const el = document.getElementById(id); if (!el) return;
    el.addEventListener('click', () => {
        el.classList.toggle('on');
        sniperSettings[key] = el.classList.contains('on');
        saveSniperSettings();
    });
}
function wireSniperSettings() {
    // Price / delay inputs
    ['st-snip-min-robux','st-snip-min-tix','st-snip-max-robux','st-snip-max-tix','st-snip-delay'].forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        const keyMap = { 'st-snip-min-robux':'minPriceRobux', 'st-snip-min-tix':'minPriceTix', 'st-snip-max-robux':'maxPriceRobux', 'st-snip-max-tix':'maxPriceTix', 'st-snip-delay':'delayMs' };
        el.addEventListener('change', () => {
            const key = keyMap[id];
            const isPriceField = id.includes('min') || id.includes('max');
            if (id === 'st-snip-delay') {
                const v = Math.max(0, parseInt(el.value) || 0);
                el.value = v;
                sniperSettings[key] = v;
            } else {
                // Allow empty string (no limit) or a number
                sniperSettings[key] = el.value.trim() === '' ? '' : (parseInt(el.value) || 0);
            }
            saveSniperSettings();
        });
    });
    // Toggles
    wireToggle('st-snip-limiteds',   'limitedsOnly');
    wireToggle('st-snip-limitedu',   'limitedUsOnly');
    wireToggle('st-snip-robux-only', 'robuxOnly');
    wireToggle('st-snip-tix-only',   'tixOnly');
}

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
    loadAccounts();
    injectStyles();
    buildUI();
    loadSniperSettings();

    // Restore selected account BEFORE rebuildAcctSelector so the dropdown
    // is built with the correct value already set in selectedAcctIdx
    const savedAcct = (() => { try { return parseInt(GM_getValue('st_acct_idx', '-1')); } catch(_){ return -1; } })();
    if (savedAcct === -1 || savedAcct === -2 || (savedAcct >= 0 && accounts[savedAcct])) {
        selectedAcctIdx = savedAcct;
    } else {
        selectedAcctIdx = -1;
    }

    rebuildAcctSelector();   // now reads the correct selectedAcctIdx
    updateMiniAcct();

    const savedTheme = (() => { try { return GM_getValue('st_theme','void'); } catch(_){ return 'void'; } })();
    if (savedTheme && THEMES[savedTheme]) applyTheme(savedTheme);

    // Restore auto-claim
    const savedAutoDaily = (() => { try { return GM_getValue('st_daily_auto', false); } catch(_){ return false; } })();
    if (savedAutoDaily) {
        log('Auto-claim resuming from last session…', 'info');
        startDailyAuto();
    }

    const wasActive = (() => { try { return GM_getValue('sniperActive',false); } catch(_){ return false; } })();
    if (wasActive) {
        try { sniperBlacklist = JSON.parse(GM_getValue('sniperBlacklist','{}') || '{}'); } catch(_){}
        sniperActive = true;
        updateSniperBtn(true);
        setSniperStatus('Resuming — '+Object.keys(sniperBlacklist).length+' items blacklisted','active');
        log('Sniper resumed from last session','success');
        startDispatch();
    }
}
