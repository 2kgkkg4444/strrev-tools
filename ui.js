// ─── Theme Definitions ────────────────────────────────────────────────────
const THEMES = {
    void: {
        name: 'Void',
        icon: '🌑',
        desc: 'Deep crimson & space',
        preview: ['#02050e','#e94560','#0d1829','#f1f5f9'],
        anim: false,
        vars: {
            '--c-bg0':          '#02050e',
            '--c-bg1':          '#060c18',
            '--c-bg2':          '#0d1829',
            '--c-bg3':          '#111e33',
            '--c-border':       '#0f1e35',
            '--c-border2':      '#0a1525',
            '--c-accent':       '#e94560',
            '--c-accent2':      '#b91c4a',
            '--c-accent-glow':  'rgba(233,69,96,0.3)',
            '--c-text0':        '#f1f5f9',
            '--c-text1':        '#94a3b8',
            '--c-text2':        '#475569',
            '--c-text3':        '#334155',
            '--c-text4':        '#1e3a5f',
            '--c-text5':        '#0a1525',
            '--c-success':      '#22c55e',
            '--c-warn':         '#eab308',
            '--c-err':          '#ef4444',
            '--c-tabbar':       '#010408',
            '--c-tab':          '#04080f',
            '--c-tab-active':   '#060c18',
            '--font-mono':      "'Fira Code','Courier New',monospace",
        }
    },
    hacker: {
        name: 'Hacker',
        icon: '💀',
        desc: 'Terminal green matrix',
        preview: ['#000000','#00ff41','#0a120a','#00ff41'],
        anim: true,
        vars: {
            '--c-bg0':          '#000000',
            '--c-bg1':          '#030803',
            '--c-bg2':          '#060d06',
            '--c-bg3':          '#0a140a',
            '--c-border':       '#0d200d',
            '--c-border2':      '#091509',
            '--c-accent':       '#00ff41',
            '--c-accent2':      '#00cc33',
            '--c-accent-glow':  'rgba(0,255,65,0.3)',
            '--c-text0':        '#00ff41',
            '--c-text1':        '#00cc33',
            '--c-text2':        '#009922',
            '--c-text3':        '#006614',
            '--c-text4':        '#003d0d',
            '--c-text5':        '#001f07',
            '--c-success':      '#00ff41',
            '--c-warn':         '#ffff00',
            '--c-err':          '#ff3333',
            '--c-tabbar':       '#000000',
            '--c-tab':          '#020702',
            '--c-tab-active':   '#030803',
            '--font-mono':      "'Fira Code','Courier New',monospace",
        }
    },
    galaxy: {
        name: 'Galaxy',
        icon: '🌌',
        desc: 'Cosmic stars & nebula',
        preview: ['#04010f','#a855f7','#120a30','#e9d5ff'],
        anim: true,
        vars: {
            '--c-bg0':          '#04010f',
            '--c-bg1':          '#07031a',
            '--c-bg2':          '#0e0828',
            '--c-bg3':          '#160d3a',
            '--c-border':       '#1e0f4a',
            '--c-border2':      '#160a38',
            '--c-accent':       '#a855f7',
            '--c-accent2':      '#7c3aed',
            '--c-accent-glow':  'rgba(168,85,247,0.35)',
            '--c-text0':        '#ede9fe',
            '--c-text1':        '#c4b5fd',
            '--c-text2':        '#8b5cf6',
            '--c-text3':        '#6d28d9',
            '--c-text4':        '#4c1d95',
            '--c-text5':        '#2e1065',
            '--c-success':      '#34d399',
            '--c-warn':         '#fbbf24',
            '--c-err':          '#f87171',
            '--c-tabbar':       '#020008',
            '--c-tab':          '#060214',
            '--c-tab-active':   '#07031a',
            '--font-mono':      "'Fira Code','Courier New',monospace",
        }
    },
    synthwave: {
        name: 'Synthwave',
        icon: '🌆',
        desc: 'Retro neon & chrome',
        preview: ['#0d0015','#ff00ff','#1e0035','#ffe4ff'],
        anim: true,
        vars: {
            '--c-bg0':          '#0d0015',
            '--c-bg1':          '#120020',
            '--c-bg2':          '#1a0030',
            '--c-bg3':          '#220040',
            '--c-border':       '#2d0050',
            '--c-border2':      '#220040',
            '--c-accent':       '#ff2dff',
            '--c-accent2':      '#cc00cc',
            '--c-accent-glow':  'rgba(255,45,255,0.35)',
            '--c-text0':        '#ffe4ff',
            '--c-text1':        '#ff9eff',
            '--c-text2':        '#cc44cc',
            '--c-text3':        '#882288',
            '--c-text4':        '#551155',
            '--c-text5':        '#2a0a2a',
            '--c-success':      '#00ffcc',
            '--c-warn':         '#ffcc00',
            '--c-err':          '#ff3366',
            '--c-tabbar':       '#080010',
            '--c-tab':          '#0d0018',
            '--c-tab-active':   '#120020',
            '--font-mono':      "'Fira Code','Courier New',monospace",
        }
    },
    frost: {
        name: 'Frost',
        icon: '❄️',
        desc: 'Arctic ice & steel',
        preview: ['#070d18','#38bdf8','#0f2035','#e0f2fe'],
        anim: false,
        vars: {
            '--c-bg0':          '#070d18',
            '--c-bg1':          '#0c1525',
            '--c-bg2':          '#122035',
            '--c-bg3':          '#1a2d45',
            '--c-border':       '#1e3a5a',
            '--c-border2':      '#162d48',
            '--c-accent':       '#38bdf8',
            '--c-accent2':      '#0284c7',
            '--c-accent-glow':  'rgba(56,189,248,0.3)',
            '--c-text0':        '#e0f2fe',
            '--c-text1':        '#7dd3fc',
            '--c-text2':        '#38bdf8',
            '--c-text3':        '#0369a1',
            '--c-text4':        '#0c4a6e',
            '--c-text5':        '#082f49',
            '--c-success':      '#34d399',
            '--c-warn':         '#fbbf24',
            '--c-err':          '#f87171',
            '--c-tabbar':       '#040810',
            '--c-tab':          '#080e1c',
            '--c-tab-active':   '#0c1525',
            '--font-mono':      "'Fira Code','Courier New',monospace",
        }
    },
};

let currentTheme = 'void';

function applyTheme(key) {
    if (!THEMES[key]) return;
    currentTheme = key;
    const win = document.getElementById('st-window');
    if (!win) return;
    const vars = THEMES[key].vars;
    Object.entries(vars).forEach(([k,v]) => win.style.setProperty(k, v));
    win.setAttribute('data-theme', key);
    document.querySelectorAll('.st-theme-card').forEach(c =>
        c.classList.toggle('active', c.dataset.theme === key)
    );
    try { GM_setValue('st_theme', key); } catch(_) {}
}

// ─── Galaxy Stars Generator ───────────────────────────────────────────────
function injectGalaxyStars() {
    const existing = document.getElementById('st-galaxy-stars-style');
    if (existing) return;
    const rng = (min, max) => min + Math.random() * (max - min);
    const layers = [
        Array.from({length:120}, () => `${rng(1,2).toFixed(1)}px ${rng(1,2).toFixed(1)}px rgba(255,255,255,${rng(0.3,0.9).toFixed(2)})`),
        Array.from({length:60},  () => `${rng(1,3).toFixed(1)}px ${rng(1,3).toFixed(1)}px rgba(200,180,255,${rng(0.2,0.7).toFixed(2)})`),
        Array.from({length:25},  () => `${rng(1,4).toFixed(1)}px ${rng(1,4).toFixed(1)}px rgba(255,255,255,${rng(0.5,1.0).toFixed(2)})`),
    ];
    const genPositions = (count, maxDim) =>
        Array.from({length:count}, () =>
            `${Math.floor(rng(0,maxDim))}px ${Math.floor(rng(0,window.innerHeight||800))}px`
        );
    const s1 = genPositions(120, window.innerWidth||1400);
    const s2 = genPositions(60,  window.innerWidth||1400);
    const s3 = genPositions(25,  window.innerWidth||1400);
    const style = document.createElement('style');
    style.id = 'st-galaxy-stars-style';
    style.textContent = `
        [data-theme="galaxy"] #st-bg-fx::before {
            content:'';position:absolute;inset:0;
            background:transparent;
            box-shadow:${s1.map((p,i)=>`${p} 1px 1px rgba(255,255,255,${(0.3+Math.random()*0.7).toFixed(2)})`).join(',')};
            animation:st-stars-drift 80s linear infinite;
        }
        [data-theme="galaxy"] #st-bg-fx::after {
            content:'';position:absolute;inset:0;
            background:transparent;
            box-shadow:${s2.map((p,i)=>`${p} 2px 2px rgba(180,160,255,${(0.2+Math.random()*0.6).toFixed(2)})`).join(',')};
            animation:st-stars-drift 120s linear infinite reverse;
        }
    `;
    document.head.appendChild(style);
}

// ─── Section & Tab Switch ─────────────────────────────────────────────────
function switchManage(section) {
    ['sniper','catalog','trade'].forEach(s => {
        const tab  = document.getElementById('st-msec-'+s);
        const cont = document.getElementById('st-msec-content-'+s);
        const on   = s === section;
        if (tab)  tab.classList.toggle('st-ctab-active', on);
        if (cont) cont.style.display = on ? 'block' : 'none';
    });
    const stab = document.getElementById('st-tab-settings');
    if (stab) stab.classList.remove('st-ctab-active');
    if (section === 'catalog') renderCatalogList();
}

function switchTab(tab) {
    const manage   = document.getElementById('st-tab-content-manage');
    const settings = document.getElementById('st-tab-content-settings');
    const stab     = document.getElementById('st-tab-settings');
    if (tab === 'manage') {
        if (manage)   manage.style.display   = 'contents';
        if (settings) settings.style.display = 'none';
        if (stab)     stab.classList.remove('st-ctab-active');
    } else {
        if (manage)   manage.style.display   = 'none';
        if (settings) settings.style.display = 'flex';
        if (stab)     stab.classList.add('st-ctab-active');
        ['sniper','catalog','trade'].forEach(s =>
            document.getElementById('st-msec-'+s)?.classList.remove('st-ctab-active')
        );
        rebuildSettingsAcctList();
        rebuildThemeGrid();
    }
}

// ─── Theme Grid Builder ───────────────────────────────────────────────────
function rebuildThemeGrid() {
    const el = document.getElementById('st-theme-grid');
    if (!el || el.dataset.built) return;
    el.dataset.built = '1';
    el.innerHTML = '';
    Object.entries(THEMES).forEach(([key, theme]) => {
        const card = document.createElement('div');
        card.className = 'st-theme-card' + (key === currentTheme ? ' active' : '');
        card.dataset.theme = key;
        const [bg, accent, bg2, text] = theme.preview;
        card.innerHTML = `
            <div class="st-theme-preview" style="background:${bg};border:1px solid ${accent}33;">
                <div class="st-theme-swatch" style="background:${accent};box-shadow:0 0 8px ${accent}88;"></div>
                <div class="st-theme-swatch-sm" style="background:${bg2};"></div>
                <div class="st-theme-swatch-sm" style="background:${text}33;"></div>
                ${theme.anim ? '<div class="st-theme-anim-badge">ANIMATED</div>' : ''}
            </div>
            <div class="st-theme-card-body">
                <div class="st-theme-card-name" style="color:${accent};">${theme.icon} ${theme.name}</div>
                <div class="st-theme-card-desc">${theme.desc}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            applyTheme(key);
            if (key === 'galaxy') injectGalaxyStars();
        });
        el.appendChild(card);
    });
}

// ─── Styles ───────────────────────────────────────────────────────────────
function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fira+Code:wght@400;500&display=swap');

        /* ── FAB ── */
        #st-open-btn {
            position:fixed;bottom:22px;right:22px;z-index:999998;
            display:flex;align-items:center;gap:8px;
            padding:11px 20px;border:none;border-radius:999px;
            background:linear-gradient(135deg,var(--c-accent,#e94560),var(--c-accent2,#b91c4a));
            color:#fff;font-size:12px;font-weight:700;cursor:pointer;
            box-shadow:0 4px 24px var(--c-accent-glow,rgba(233,69,96,0.4)),0 0 0 1px rgba(255,255,255,0.06);
            transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s;
            animation:st-popin 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
            font-family:'DM Sans',system-ui,sans-serif;letter-spacing:0.2px;user-select:none;
        }
        #st-open-btn:hover  { transform:translateY(-2px);box-shadow:0 8px 32px var(--c-accent-glow,rgba(233,69,96,0.5)); }
        #st-open-btn:active { transform:scale(0.95); }
        #st-open-btn.hidden { opacity:0;pointer-events:none; }

        /* ── Fullscreen Overlay ── */
        #st-overlay {
            position:fixed;inset:0;z-index:999999;
            display:flex;align-items:stretch;justify-content:stretch;
            opacity:0;pointer-events:none;
            transition:opacity 0.2s ease;
        }
        #st-overlay.open { opacity:1;pointer-events:all; }

        /* ── Main Window ── */
        #st-window {
            /* Void theme defaults */
            --c-bg0:#02050e; --c-bg1:#060c18; --c-bg2:#0d1829; --c-bg3:#111e33;
            --c-border:#0f1e35; --c-border2:#0a1525;
            --c-accent:#e94560; --c-accent2:#b91c4a; --c-accent-glow:rgba(233,69,96,0.3);
            --c-text0:#f1f5f9; --c-text1:#94a3b8; --c-text2:#475569;
            --c-text3:#334155; --c-text4:#1e3a5f; --c-text5:#0a1525;
            --c-success:#22c55e; --c-warn:#eab308; --c-err:#ef4444;
            --c-tabbar:#010408; --c-tab:#04080f; --c-tab-active:#060c18;
            --font-mono:'Fira Code','Courier New',monospace;

            flex:1;display:flex;flex-direction:column;overflow:hidden;
            background:var(--c-bg1);
            transform:scale(0.98);opacity:0;
            transition:transform 0.28s cubic-bezier(0.16,1,0.3,1),opacity 0.2s ease;
            position:relative;
        }
        #st-overlay.open #st-window { transform:scale(1);opacity:1; }
        #st-window * { box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',system-ui,sans-serif !important; }
        #st-window ::-webkit-scrollbar { width:3px;height:3px; }
        #st-window ::-webkit-scrollbar-track { background:transparent; }
        #st-window ::-webkit-scrollbar-thumb { background:var(--c-border);border-radius:99px; }
        #st-window ::-webkit-scrollbar-thumb:hover { background:var(--c-accent); }

        /* ── Background FX Layer ── */
        #st-bg-fx {
            position:absolute;inset:0;pointer-events:none;z-index:0;
            overflow:hidden;
        }

        /* VOID: subtle breathe */
        [data-theme="void"] #st-bg-fx::before {
            content:'';position:absolute;inset:0;
            background:radial-gradient(ellipse 60% 60% at 80% 20%, rgba(233,69,96,0.04) 0%, transparent 70%),
                        radial-gradient(ellipse 40% 40% at 10% 90%, rgba(185,28,74,0.03) 0%, transparent 60%);
            animation:st-void-breathe 6s ease-in-out infinite alternate;
        }

        /* HACKER: scanlines + phosphor glow */
        [data-theme="hacker"] #st-bg-fx {
            background:repeating-linear-gradient(
                0deg,
                transparent 0px, transparent 2px,
                rgba(0,255,65,0.025) 2px, rgba(0,255,65,0.025) 4px
            );
            animation:st-scanline-scroll 12s linear infinite;
        }
        [data-theme="hacker"] #st-bg-fx::before {
            content:'';position:absolute;inset:0;
            background:radial-gradient(ellipse 70% 70% at 50% 0%, rgba(0,255,65,0.06) 0%, transparent 60%),
                        radial-gradient(ellipse 100% 30% at 50% 100%, rgba(0,180,40,0.04) 0%, transparent 100%);
        }
        [data-theme="hacker"] #st-bg-fx::after {
            content:'';position:absolute;inset:0;
            background:linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%);
        }

        /* GALAXY: nebula gradients + stars via JS */
        [data-theme="galaxy"] #st-bg-fx {
            background:
                radial-gradient(ellipse 80% 60% at 20% 30%, rgba(120,40,220,0.18) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 70%, rgba(80,20,180,0.14) 0%, transparent 55%),
                radial-gradient(ellipse 40% 40% at 50% 10%, rgba(200,100,255,0.08) 0%, transparent 50%),
                radial-gradient(ellipse 100% 100% at 50% 50%, rgba(20,5,50,0.6) 0%, transparent 100%);
            animation:st-galaxy-drift 12s ease-in-out infinite alternate;
        }

        /* SYNTHWAVE: retro grid */
        [data-theme="synthwave"] #st-bg-fx::before {
            content:'';position:absolute;
            bottom:0;left:0;right:0;height:55%;
            background:
                linear-gradient(to top, rgba(255,45,255,0.15) 0%, transparent 100%),
                repeating-linear-gradient(90deg, rgba(255,45,255,0.12) 0px, transparent 1px, transparent 49px, rgba(255,45,255,0.12) 50px),
                repeating-linear-gradient(0deg,  rgba(255,45,255,0.12) 0px, transparent 1px, transparent 49px, rgba(255,45,255,0.12) 50px);
            background-size:100% 100%, 50px 50px, 50px 50px;
            transform:perspective(600px) rotateX(45deg);
            transform-origin:bottom center;
            animation:st-grid-slide 3s linear infinite;
        }
        [data-theme="synthwave"] #st-bg-fx::after {
            content:'';position:absolute;
            top:0;left:0;right:0;height:50%;
            background:
                radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,45,255,0.08) 0%, transparent 70%),
                linear-gradient(to bottom, rgba(13,0,21,0.8) 0%, transparent 100%);
        }

        /* FROST: subtle ice shimmer */
        [data-theme="frost"] #st-bg-fx::before {
            content:'';position:absolute;inset:0;
            background:radial-gradient(ellipse 60% 50% at 70% 20%, rgba(56,189,248,0.06) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 40% at 20% 80%, rgba(14,165,233,0.04) 0%, transparent 55%);
            animation:st-frost-shimmer 8s ease-in-out infinite alternate;
        }

        /* ── Chrome Tab Bar ── */
        #st-tabbar {
            display:flex;align-items:flex-end;
            height:50px;min-height:50px;flex-shrink:0;
            background:var(--c-tabbar);
            padding:0 0 0 12px;
            position:relative;z-index:10;
            user-select:none;
        }

        #st-tabbar-logo {
            display:flex;align-items:center;gap:9px;
            padding:0 14px 8px 4px;flex-shrink:0;
            border-right:1px solid var(--c-border2);margin-right:8px;
        }
        #st-logo-icon {
            width:26px;height:26px;border-radius:8px;
            background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));
            display:flex;align-items:center;justify-content:center;
            font-size:13px;flex-shrink:0;
            box-shadow:0 2px 8px var(--c-accent-glow);
        }
        #st-logo-text {
            font-size:12px;font-weight:700;color:var(--c-text2);
            white-space:nowrap;line-height:1;
        }
        #st-logo-text span { color:var(--c-text4);font-weight:500; }

        #st-tabs-area {
            display:flex;align-items:flex-end;
            gap:2px;flex:1;overflow-x:auto;overflow-y:visible;
            padding-bottom:0;
            scrollbar-width:none;min-width:0;
        }
        #st-tabs-area::-webkit-scrollbar { display:none; }

        .st-ctab {
            position:relative;
            height:38px;
            padding:0 18px;
            border-radius:10px 10px 0 0;
            background:var(--c-tab);
            border:1px solid var(--c-border2);
            border-bottom:none;
            display:flex;align-items:center;gap:7px;
            cursor:pointer;
            font-size:11px;font-weight:600;
            color:var(--c-text3);
            white-space:nowrap;flex-shrink:0;
            transition:color 0.15s,background 0.15s;
            outline:none;
            min-width:110px;
            justify-content:center;
        }
        .st-ctab:hover { background:var(--c-bg2);color:var(--c-text2); }
        .st-ctab.st-ctab-active {
            background:var(--c-tab-active);
            color:var(--c-text0);
            border-color:var(--c-border);
            z-index:2;
        }
        .st-ctab.st-ctab-active::before,
        .st-ctab.st-ctab-active::after {
            content:'';position:absolute;bottom:0;
            width:12px;height:12px;pointer-events:none;z-index:3;
        }
        .st-ctab.st-ctab-active::before {
            left:-12px;
            background:var(--c-tabbar);
            border-bottom-right-radius:8px;
            box-shadow:5px 5px 0 5px var(--c-tab-active);
        }
        .st-ctab.st-ctab-active::after {
            right:-12px;
            background:var(--c-tabbar);
            border-bottom-left-radius:8px;
            box-shadow:-5px 5px 0 5px var(--c-tab-active);
        }
        .st-ctab-active-accent {
            position:absolute;top:0;left:0;right:0;height:2px;
            background:linear-gradient(90deg,var(--c-accent),var(--c-accent2));
            border-radius:10px 10px 0 0;
            opacity:0;transition:opacity 0.2s;
        }
        .st-ctab.st-ctab-active .st-ctab-active-accent { opacity:1; }

        .st-ctab-divider {
            width:1px;height:24px;margin:0 4px 8px;
            background:var(--c-border2);flex-shrink:0;align-self:flex-end;
        }

        #st-tabbar-controls {
            display:flex;align-items:center;gap:6px;
            padding:0 12px 8px;flex-shrink:0;
        }

        /* Compact account display */
        #st-acct-mini {
            padding:4px 10px;background:var(--c-bg2);
            border:1px solid var(--c-border2);border-radius:8px;
            cursor:default;max-width:160px;
        }
        #st-acct-mini-name {
            font-size:11px;font-weight:700;color:var(--c-accent);
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;
        }
        #st-acct-mini-sub {
            font-size:9px;color:var(--c-text4);margin-top:1px;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }

        select#st-acct-sel {
            background:var(--c-bg2);border:1px solid var(--c-border);
            color:var(--c-text1);border-radius:8px;
            padding:6px 8px;font-size:10px;outline:none;cursor:pointer;
            transition:border-color 0.15s;max-width:140px;
        }
        select#st-acct-sel:focus { border-color:var(--c-accent); }

        #st-close-btn {
            width:30px;height:30px;display:flex;align-items:center;justify-content:center;
            background:rgba(255,255,255,0.03);border:1px solid var(--c-border);
            color:var(--c-text3);font-size:13px;cursor:pointer;border-radius:8px;
            transition:all 0.15s;flex-shrink:0;
        }
        #st-close-btn:hover { background:rgba(233,69,96,0.15);color:#e94560;border-color:rgba(233,69,96,0.3); }

        /* ── Thin accent line below tab bar ── */
        #st-tabbar-underline {
            height:1px;background:var(--c-border);flex-shrink:0;
            position:relative;z-index:9;
        }

        /* ── Body & Content Area ── */
        #st-body {
            flex:1;overflow:hidden;display:flex;flex-direction:column;
            position:relative;z-index:1;background:var(--c-tab-active);
        }
        #st-sidebar { display:none; }
        #st-main {
            flex:1;overflow-y:auto;padding:28px 32px;
        }

        #st-tab-content-settings {
            flex:1;overflow-y:auto;padding:32px;display:none;
        }

        /* ── Sniper Section ── */
        .st-section-header {
            display:flex;align-items:flex-start;justify-content:space-between;
            margin-bottom:22px;
        }
        .st-section-title { color:var(--c-text0);font-size:16px;font-weight:700;line-height:1.2; }
        .st-section-sub { color:var(--c-text3);font-size:10px;margin-top:3px; }

        .st-primary-btn {
            padding:10px 22px;border:none;border-radius:10px;cursor:pointer;
            font-weight:700;font-size:12px;color:#fff;letter-spacing:0.2px;
            background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));
            box-shadow:0 0 20px var(--c-accent-glow);
            transition:opacity 0.15s,transform 0.12s,box-shadow 0.15s;
            white-space:nowrap;flex-shrink:0;
        }
        .st-primary-btn:hover:not(:disabled) { opacity:0.85;transform:translateY(-1px);box-shadow:0 4px 28px var(--c-accent-glow); }
        .st-primary-btn:active:not(:disabled) { transform:scale(0.97); }
        .st-primary-btn:disabled { cursor:not-allowed;opacity:0.5; }

        #st-sniper-status {
            display:flex;align-items:center;gap:10px;
            padding:10px 14px;background:var(--c-bg0);
            border:1px solid var(--c-border2);border-radius:10px;
            margin-bottom:18px;transition:background 0.3s,border-color 0.3s;
        }
        .st-dot { width:7px;height:7px;border-radius:50%;flex-shrink:0;transition:background 0.3s,box-shadow 0.3s; }
        .st-dot-idle    { background:var(--c-border); }
        .st-dot-active  { background:var(--c-success);box-shadow:0 0 6px var(--c-success);animation:st-pulse-g 1.8s infinite; }
        .st-dot-hot     { background:var(--c-accent);box-shadow:0 0 6px var(--c-accent);animation:st-pulse-r 1.2s infinite; }
        .st-dot-loading { background:var(--c-warn);box-shadow:0 0 6px var(--c-warn); }
        .st-dot-text { font-size:10px;color:var(--c-text2); }

        .st-stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px; }
        .st-stat {
            background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:10px;
            padding:12px 14px;transition:border-color 0.15s;
        }
        .st-stat:hover { border-color:var(--c-border); }
        .st-stat-label { color:var(--c-text4);font-size:9px;text-transform:uppercase;letter-spacing:0.9px;font-weight:700;margin-bottom:5px; }
        .st-stat-val { color:var(--c-text0);font-size:20px;font-weight:700;font-family:var(--font-mono) !important;line-height:1; }

        .st-rtt-bar-wrap { margin-bottom:18px; }
        .st-rtt-bar-labels { display:flex;justify-content:space-between;margin-bottom:5px; }
        .st-rtt-bar-labels span { color:var(--c-text4);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px; }
        .st-rtt-bar { height:4px;background:var(--c-bg0);border-radius:3px;overflow:hidden;border:1px solid var(--c-border2); }
        #st-rtt-fill { height:100%;border-radius:3px;background:linear-gradient(90deg,var(--c-success),var(--c-warn),var(--c-err));transition:width 0.4s ease; }

        .st-log-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:7px; }
        .st-log-title { color:var(--c-text4);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px; }
        #st-log-clear {
            background:none;border:none;color:var(--c-text5);font-size:9px;
            cursor:pointer;padding:2px 6px;border-radius:4px;transition:color 0.12s;
        }
        #st-log-clear:hover { color:var(--c-text2); }
        #st-log {
            background:var(--c-bg0);border:1px solid var(--c-border2);
            border-radius:10px;padding:8px;max-height:200px;overflow-y:auto;
        }

        /* ── Catalog Section ── */
        .st-cat-toolbar { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; }
        .st-secondary-btn {
            padding:8px 14px;background:var(--c-bg0);color:var(--c-text3);
            border:1px solid var(--c-border2);border-radius:8px;cursor:pointer;
            font-size:11px;font-weight:600;transition:all 0.15s;display:flex;align-items:center;gap:5px;
        }
        .st-secondary-btn:hover { background:var(--c-bg2);color:var(--c-text1);border-color:var(--c-border); }

        /* ── Trade Section ── */
        .st-input {
            width:100%;padding:9px 12px;background:var(--c-bg0);
            border:1px solid var(--c-border2);border-radius:9px;
            color:var(--c-text1);font-size:11px;outline:none;
            transition:border-color 0.15s;
        }
        .st-input:focus { border-color:var(--c-accent); }
        .st-input::placeholder { color:var(--c-text5); }

        #st-trade-status {
            display:none;padding:8px 10px;border-radius:8px;
            border:1px solid var(--c-border2);background:var(--c-bg0);
            font-size:10px;color:var(--c-text2);margin-bottom:10px;word-break:break-word;
        }
        .st-trade-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px; }
        .st-inv-label {
            font-size:9px;color:var(--c-text4);font-weight:700;
            text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;
            display:flex;align-items:center;gap:6px;
        }
        .st-inv-dot { width:5px;height:5px;border-radius:50%;flex-shrink:0; }
        .st-inv-box {
            overflow-y:auto;background:var(--c-bg0);border:1px solid var(--c-border2);
            border-radius:8px;padding:4px;max-height:200px;min-height:60px;
        }
        .st-trade-hint {
            padding:6px 8px;background:var(--c-bg0);border:1px solid var(--c-border2);
            border-radius:7px;font-size:9px;color:var(--c-text4);text-align:center;margin-bottom:10px;
        }
        #st-trade-summary {
            display:none;padding:8px 12px;background:var(--c-bg0);
            border:1px solid var(--c-border2);border-radius:8px;margin-bottom:10px;text-align:center;font-size:10px;
        }

        /* ── Settings ── */
        .st-settings-inner { max-width:680px;margin:0 auto; }
        .st-settings-section { margin-bottom:32px; }
        .st-settings-heading {
            color:var(--c-text0);font-size:15px;font-weight:700;margin-bottom:4px;
        }
        .st-settings-subheading {
            color:var(--c-text3);font-size:10px;margin-bottom:18px;
        }

        /* Theme Cards Grid */
        #st-theme-grid {
            display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:8px;
        }
        .st-theme-card {
            border-radius:11px;border:2px solid var(--c-border);
            overflow:hidden;cursor:pointer;transition:border-color 0.15s,transform 0.12s,box-shadow 0.15s;
            background:var(--c-bg0);
        }
        .st-theme-card:hover { border-color:var(--c-border);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.4); }
        .st-theme-card.active { border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent),0 0 20px var(--c-accent-glow); }
        .st-theme-preview {
            height:64px;position:relative;display:flex;align-items:center;
            justify-content:center;gap:6px;padding:10px;
        }
        .st-theme-swatch {
            width:20px;height:20px;border-radius:6px;flex-shrink:0;
        }
        .st-theme-swatch-sm {
            width:12px;height:12px;border-radius:4px;flex-shrink:0;
        }
        .st-theme-anim-badge {
            position:absolute;top:5px;right:5px;
            font-size:7px;font-weight:700;padding:2px 5px;border-radius:20px;
            background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);
            letter-spacing:0.5px;
        }
        .st-theme-card-body { padding:8px 10px 10px; }
        .st-theme-card-name { font-size:11px;font-weight:700;margin-bottom:2px; }
        .st-theme-card-desc { font-size:9px;color:var(--c-text3); }

        /* Account settings */
        .st-card {
            background:var(--c-bg0);border:1px solid var(--c-border2);
            border-radius:12px;padding:18px;margin-bottom:16px;
        }
        .st-card-title {
            font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;
            color:var(--c-text4);margin-bottom:14px;
        }
        .st-field { margin-bottom:10px; }
        .st-field-label { font-size:10px;color:var(--c-text3);margin-bottom:4px; }
        .st-set-input {
            width:100%;padding:8px 10px;background:var(--c-bg2);
            border:1px solid var(--c-border);border-radius:7px;
            color:var(--c-text1);font-size:11px;outline:none;transition:border-color 0.15s;
        }
        .st-set-input:focus { border-color:var(--c-accent); }
        .st-set-input::placeholder { color:var(--c-text5); }

        /* ── Shared Components ── */
        .st-skel {
            background:linear-gradient(90deg,var(--c-bg2) 25%,var(--c-bg3) 50%,var(--c-bg2) 75%);
            background-size:200% 100%;animation:st-shimmer 1.4s infinite;
        }
        .st-spin { display:inline-block;animation:st-spin 0.7s linear infinite; }
        .st-sniper-active { animation:st-pulse-g 1.8s infinite; }

        /* ── Hacker font override ── */
        [data-theme="hacker"] .st-stat-val,
        [data-theme="hacker"] #st-checks,
        [data-theme="hacker"] #st-cps,
        [data-theme="hacker"] #st-rtt,
        [data-theme="hacker"] #st-conc,
        [data-theme="hacker"] .st-section-title,
        [data-theme="hacker"] .st-settings-heading,
        [data-theme="hacker"] #st-logo-text {
            font-family:var(--font-mono) !important;
        }
        [data-theme="hacker"] #st-window * {
            font-family:var(--font-mono) !important;
        }

        /* ── Animations ── */
        @keyframes st-popin   { 0%{transform:scale(0.7);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes st-spin    { to{transform:rotate(360deg)} }
        @keyframes st-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes st-pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 70%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }
        @keyframes st-pulse-r { 0%,100%{box-shadow:0 0 0 0 rgba(233,69,96,0.5)} 70%{box-shadow:0 0 0 8px rgba(233,69,96,0)} }

        @keyframes st-void-breathe {
            0% { opacity:0.6;transform:scale(1); }
            100% { opacity:1;transform:scale(1.05); }
        }
        @keyframes st-scanline-scroll {
            0% { background-position:0 0; }
            100% { background-position:0 100px; }
        }
        @keyframes st-galaxy-drift {
            0%   { background-position:0% 50%, 100% 50%, 50% 0%, 50% 50%; }
            100% { background-position:10% 60%, 90% 40%, 55% 5%, 50% 50%; }
        }
        @keyframes st-stars-drift {
            0%   { transform:translateY(0) rotate(0deg); }
            100% { transform:translateY(-30px) rotate(0.5deg); }
        }
        @keyframes st-grid-slide {
            0%   { background-position:0% 100%, 0px 0px, 0px 0px; }
            100% { background-position:0% 100%, 0px -50px, 0px 0px; }
        }
        @keyframes st-frost-shimmer {
            0%   { opacity:0.7;transform:scale(1); }
            100% { opacity:1;transform:scale(1.03); }
        }
    `;
    document.head.appendChild(s);
}

// ─── Build UI ─────────────────────────────────────────────────────────────
function buildUI() {

    // FAB
    const openBtn = document.createElement('button');
    openBtn.id = 'st-open-btn';
    openBtn.innerHTML = '🛒 Tools';
    document.body.appendChild(openBtn);

    // Full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'st-overlay';

    const win = document.createElement('div');
    win.id = 'st-window';
    win.setAttribute('data-theme', 'void');

    win.innerHTML = `
        <!-- Background FX -->
        <div id="st-bg-fx"></div>

        <!-- Chrome Tab Bar -->
        <div id="st-tabbar">
            <div id="st-tabbar-logo">
                <div id="st-logo-icon">🛒</div>
                <div id="st-logo-text">Strrev <span>Tools</span></div>
            </div>

            <div id="st-tabs-area">
                <button class="st-ctab st-ctab-active" id="st-msec-sniper">
                    <div class="st-ctab-active-accent"></div>
                    🎯 <span>Sniper</span>
                </button>
                <button class="st-ctab" id="st-msec-catalog">
                    <div class="st-ctab-active-accent"></div>
                    🛒 <span>Catalog</span>
                </button>
                <button class="st-ctab" id="st-msec-trade">
                    <div class="st-ctab-active-accent"></div>
                    🔄 <span>Trade</span>
                </button>
                <div class="st-ctab-divider"></div>
                <button class="st-ctab" id="st-tab-settings">
                    <div class="st-ctab-active-accent"></div>
                    ⚙️ <span>Settings</span>
                </button>
            </div>

            <div id="st-tabbar-controls">
                <div id="st-acct-mini">
                    <div id="st-acct-mini-name">Session</div>
                    <div id="st-acct-mini-sub">Current browser session</div>
                </div>
                <select id="st-acct-sel">
                    <option value="-1">🌐 Current Session</option>
                </select>
                <!-- Hidden compat element -->
                <button id="st-tab-manage" style="display:none;"></button>
                <button id="st-close-btn">✕</button>
            </div>
        </div>

        <!-- Tab Bar Underline -->
        <div id="st-tabbar-underline"></div>

        <!-- Body -->
        <div id="st-body">

            <!-- ── MANAGE CONTENT ── -->
            <div id="st-tab-content-manage" style="display:contents;">
                <div id="st-sidebar"></div>
                <div id="st-main">

                    <!-- SNIPER -->
                    <div id="st-msec-content-sniper">
                        <div class="st-section-header">
                            <div>
                                <div class="st-section-title">Auto-Buy Sniper</div>
                                <div class="st-section-sub">Polls catalog API — silently buys for selected account(s) on hit</div>
                            </div>
                            <button id="st-sniper-btn" class="st-primary-btn"
                                onmouseenter="if(!this.disabled){this.style.opacity='0.85';this.style.transform='translateY(-1px)'}"
                                onmouseleave="this.style.opacity='1';this.style.transform=''">
                                🎯 Start Sniper
                            </button>
                        </div>

                        <div id="st-sniper-status">
                            <div class="st-dot st-dot-idle"></div>
                            <span class="st-dot-text">Idle — press Start to begin sniping</span>
                        </div>

                        <div class="st-stats-grid">
                            <div class="st-stat"><div class="st-stat-label">Checks</div><div id="st-checks" class="st-stat-val">0</div></div>
                            <div class="st-stat"><div class="st-stat-label">Speed</div><div id="st-cps" class="st-stat-val">—</div></div>
                            <div class="st-stat"><div class="st-stat-label">Avg RTT</div><div id="st-rtt" class="st-stat-val">—</div></div>
                            <div class="st-stat"><div class="st-stat-label">Workers</div><div id="st-conc" class="st-stat-val">—</div></div>
                        </div>

                        <div class="st-rtt-bar-wrap">
                            <div class="st-rtt-bar-labels">
                                <span>Network Health</span>
                                <span style="font-family:var(--font-mono)!important;">0ms → 500ms</span>
                            </div>
                            <div class="st-rtt-bar"><div id="st-rtt-fill" style="width:0%;"></div></div>
                        </div>

                        <div class="st-log-header">
                            <span class="st-log-title">Activity Log</span>
                            <button id="st-log-clear"
                                onmouseenter="this.style.color='var(--c-text2)'"
                                onmouseleave="this.style.color=''">Clear</button>
                        </div>
                        <div id="st-log"></div>
                    </div>

                    <!-- CATALOG -->
                    <div id="st-msec-content-catalog" style="display:none;">
                        <div class="st-section-header">
                            <div>
                                <div class="st-section-title">Catalog Browser</div>
                                <div class="st-section-sub">Items visible on this page — buy for active account(s)</div>
                            </div>
                            <button id="st-cat-refresh" class="st-secondary-btn"
                                onmouseenter="this.style.background='var(--c-bg2)';this.style.color='var(--c-text1)';this.style.borderColor='var(--c-border)'"
                                onmouseleave="this.style.background='';this.style.color='';this.style.borderColor=''">
                                <span id="st-refresh-icon" style="font-size:14px;">↻</span> Refresh
                            </button>
                        </div>
                        <div class="st-cat-toolbar">
                            <div id="st-cat-count"><span style="color:var(--c-text3);font-size:10px;">Loading...</span></div>
                            <div style="display:flex;gap:12px;font-size:9px;font-weight:700;">
                                <span style="color:#f97316;">R$ <span style="font-weight:400;color:var(--c-text2);">Robux</span></span>
                                <span style="color:#eab308;">T$ <span style="font-weight:400;color:var(--c-text2);">Tix</span></span>
                            </div>
                        </div>
                        <ul id="st-cat-list" style="padding:0;margin:0;"></ul>
                    </div>

                    <!-- TRADE -->
                    <div id="st-msec-content-trade" style="display:none;">
                        <div style="margin-bottom:18px;">
                            <div class="st-section-title">Trade Sender</div>
                            <div class="st-section-sub">Send trade offers as the active account — "All Accounts" not supported for trades</div>
                        </div>
                        <div style="display:flex;gap:6px;margin-bottom:10px;">
                            <input id="st-trade-input" class="st-input" type="text" placeholder="Username or User ID…" style="flex:1;">
                            <button id="st-load-btn" class="st-primary-btn"
                                onmouseenter="if(!this.disabled){this.style.opacity='0.85'}" onmouseleave="this.style.opacity='1'">Load</button>
                        </div>
                        <div id="st-trade-status"></div>
                        <div class="st-trade-grid">
                            <div>
                                <div class="st-inv-label"><div class="st-inv-dot" style="background:var(--c-accent);"></div>Your Offer</div>
                                <div id="st-my-inv" class="st-inv-box"><div style="padding:10px;text-align:center;color:var(--c-text4);font-size:9px;">Load a user first</div></div>
                            </div>
                            <div>
                                <div class="st-inv-label"><div class="st-inv-dot" style="background:#3b82f6;"></div>Their Offer</div>
                                <div id="st-th-inv" class="st-inv-box"><div style="padding:10px;text-align:center;color:var(--c-text4);font-size:9px;">Load a user first</div></div>
                            </div>
                        </div>
                        <div class="st-trade-hint">Click items to select them for the trade offer</div>
                        <div id="st-trade-summary">
                            <span style="color:var(--c-accent);font-weight:700;">You offer: <span id="st-my-count">0</span></span>
                            <span style="color:var(--c-text3);margin:0 12px;">↔</span>
                            <span style="color:#3b82f6;font-weight:700;">You request: <span id="st-th-count">0</span></span>
                        </div>
                        <button id="st-send-btn" disabled class="st-primary-btn"
                            style="width:100%;margin-top:0;padding:13px;opacity:0.4;pointer-events:none;"
                            onmouseenter="if(!this.disabled){this.style.opacity='0.85';this.style.transform='translateY(-1px)'}"
                            onmouseleave="this.style.opacity=this.disabled?'0.4':'1';this.style.transform=''">
                            🔄 Send Trade Offer
                        </button>
                    </div>

                </div><!-- /st-main -->
            </div><!-- /st-tab-content-manage -->

            <!-- ── SETTINGS ── -->
            <div id="st-tab-content-settings">
                <div class="st-settings-inner">

                    <!-- Themes -->
                    <div class="st-settings-section">
                        <div class="st-settings-heading">Themes</div>
                        <div class="st-settings-subheading">Choose your visual style — animated themes have live background effects</div>
                        <div id="st-theme-grid"></div>
                    </div>

                    <!-- Accounts -->
                    <div class="st-settings-section">
                        <div class="st-settings-heading">Accounts</div>
                        <div class="st-settings-subheading">Add and remove alt accounts. Stored via GM_setValue.</div>
                        <div id="st-settings-acct-list" style="margin-bottom:14px;"></div>

                        <div class="st-card">
                            <div class="st-card-title">Add Account</div>
                            <div class="st-field">
                                <div class="st-field-label">.ROBLOSECURITY cookie</div>
                                <input id="st-add-cookie" class="st-set-input" type="password" placeholder="Paste cookie value here…">
                            </div>
                            <div class="st-field" style="margin-bottom:16px;">
                                <div class="st-field-label">CSRF Token <span style="color:var(--c-text4);">(auto-fetched if blank)</span></div>
                                <input id="st-add-csrf" class="st-set-input" type="text" placeholder="Leave blank to auto-fetch…">
                            </div>
                            <button id="st-add-btn" class="st-primary-btn" style="width:100%;padding:12px;"
                                onmouseenter="if(!this.disabled){this.style.opacity='0.85'}" onmouseleave="this.style.opacity='1'">
                                🔍 Fetch Username & Save
                            </button>
                            <div id="st-add-status" style="margin-top:9px;font-size:10px;min-height:14px;text-align:center;color:var(--c-text2);"></div>
                        </div>
                    </div>

                    <!-- About -->
                    <div class="st-settings-section">
                        <div class="st-card" style="display:flex;align-items:center;justify-content:space-between;">
                            <div>
                                <div style="color:var(--c-text1);font-size:11px;font-weight:600;margin-bottom:3px;">Strrev Tools v9.0</div>
                                <div style="color:var(--c-text3);font-size:10px;line-height:1.6;">Multi-account catalog buyer, silent sniper &amp; trader</div>
                                <div style="color:var(--c-text4);font-size:9px;margin-top:2px;">Accounts saved automatically via GM_setValue</div>
                            </div>
                            <div style="text-align:right;flex-shrink:0;margin-left:20px;">
                                <div style="color:var(--c-text3);font-size:9px;">made by</div>
                                <div style="color:var(--c-accent);font-size:14px;font-weight:700;letter-spacing:0.3px;">vinny</div>
                                <div style="margin-top:6px;font-size:8px;padding:2px 8px;border-radius:20px;font-weight:700;background:rgba(233,69,96,0.1);border:1px solid rgba(233,69,96,0.2);color:var(--c-accent);font-family:var(--font-mono)!important;">v9.0</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div><!-- /st-tab-content-settings -->

        </div><!-- /st-body -->
    `;

    overlay.appendChild(win);
    document.body.appendChild(overlay);

    // ── Open / Close ──
    const openUI  = () => {
        overlay.classList.add('open');
        openBtn.classList.add('hidden');
        rebuildAcctSelector();
    };
    const closeUI = () => {
        overlay.classList.remove('open');
        openBtn.classList.remove('hidden');
    };
    openBtn.addEventListener('click', openUI);
    document.getElementById('st-close-btn').addEventListener('click', closeUI);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeUI(); });

    // ── Chrome Tabs ──
    ['sniper','catalog','trade'].forEach(s => {
        document.getElementById('st-msec-'+s).addEventListener('click', () => {
            // Make manage content visible
            const manage = document.getElementById('st-tab-content-manage');
            const settings = document.getElementById('st-tab-content-settings');
            if (manage)   manage.style.display   = 'contents';
            if (settings) settings.style.display = 'none';
            switchManage(s);
        });
    });
    document.getElementById('st-tab-settings').addEventListener('click', () => switchTab('settings'));

    // ── Account Selector ──
    document.getElementById('st-acct-sel').addEventListener('change', e => {
        selectedAcctIdx = parseInt(e.target.value);
        tradeTargetId = null; tradeTargetName = '';
        myInventory = []; theirInventory = [];
        mySelected.clear(); theirSelected.clear();
        updateMiniAcct(); updateTradeSummary();
        log('Account → '+(selectedAcctIdx===-2?'All Accounts':selectedAcctIdx===-1?'Session':accounts[selectedAcctIdx]?.username||'?'),'info');
    });

    // ── Sniper ──
    document.getElementById('st-sniper-btn').addEventListener('click', toggleSniper);
    document.getElementById('st-log-clear').addEventListener('click', () => {
        const l = document.getElementById('st-log'); if (l) l.innerHTML = '';
    });

    // ── Catalog ──
    document.getElementById('st-cat-refresh').addEventListener('click', () => {
        const icon = document.getElementById('st-refresh-icon');
        if (icon) { icon.style.transition='transform 0.4s'; icon.style.transform='rotate(360deg)'; setTimeout(()=>{ icon.style.transform=''; },450); }
        renderCatalogList();
    });

    // ── Trade ──
    document.getElementById('st-load-btn').addEventListener('click', loadTradeTarget);
    document.getElementById('st-trade-input').addEventListener('keydown', e => { if (e.key==='Enter') loadTradeTarget(); });
    document.getElementById('st-send-btn').addEventListener('click', sendTradeOffer);

    // ── Settings Account ──
    document.getElementById('st-add-btn').addEventListener('click', addAccountFlow);
}

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
    loadAccounts();
    injectStyles();
    buildUI();
    rebuildAcctSelector();
    updateMiniAcct();

    // Load saved theme
    const savedTheme = (() => { try { return GM_getValue('st_theme','void'); } catch(_){ return 'void'; } })();
    if (savedTheme && THEMES[savedTheme]) {
        applyTheme(savedTheme);
        if (savedTheme === 'galaxy') setTimeout(injectGalaxyStars, 200);
    }

    // Resume sniper if was active
    const wasActive = (() => { try { return GM_getValue('sniperActive', false); } catch(_){ return false; } })();
    if (wasActive) {
        try { sniperBlacklist = JSON.parse(GM_getValue('sniperBlacklist','{}') || '{}'); } catch(_){}
        sniperActive = true;
        updateSniperBtn(true);
        setSniperStatus('Resuming — '+Object.keys(sniperBlacklist).length+' items blacklisted', 'active');
        log('Sniper resumed from last session', 'success');
        startDispatch();
    }
}
