// ─── Section & Tab Switch ─────────────────────────────────────────────────
function switchManage(section) {
    ['sniper','catalog','trade'].forEach(s => {
        const btn  = document.getElementById('st-msec-'+s);
        const cont = document.getElementById('st-msec-content-'+s);
        const on   = s === section;
        if (btn)  { btn.style.background=on?'linear-gradient(135deg,#e94560,#b91c4a)':'transparent'; btn.style.color=on?'#fff':'#334155'; btn.style.borderColor=on?'rgba(233,69,96,0.4)':'transparent'; }
        if (cont)   cont.style.display = on ? 'block' : 'none';
    });
    if (section === 'catalog') renderCatalogList();
}

function switchTab(tab) {
    const manage   = document.getElementById('st-tab-content-manage');
    const settings = document.getElementById('st-tab-content-settings');
    if (tab === 'manage') { if(manage) manage.style.display='contents'; if(settings) settings.style.display='none'; }
    else                  { if(manage) manage.style.display='none';     if(settings) settings.style.display='flex'; rebuildSettingsAcctList(); }
    ['manage','settings'].forEach(t => {
        const btn = document.getElementById('st-tab-'+t); if (!btn) return;
        const on  = t === tab;
        btn.style.background = on ? 'linear-gradient(135deg,#e94560,#b91c4a)' : 'transparent';
        btn.style.color      = on ? '#fff' : '#334155';
        btn.style.boxShadow  = on ? '0 2px 12px rgba(233,69,96,0.25)' : 'none';
    });
}

// ─── Styles ───────────────────────────────────────────────────────────────
function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        #st-open-btn {
            position:fixed;bottom:22px;right:22px;z-index:999998;
            display:flex;align-items:center;gap:7px;
            padding:10px 18px;background:linear-gradient(135deg,#e94560,#b91c4a);
            color:#fff;border:none;border-radius:999px;font-size:12px;font-weight:700;
            font-family:'DM Sans',system-ui,sans-serif;cursor:pointer;
            box-shadow:0 4px 20px rgba(233,69,96,0.45),0 0 0 1px rgba(255,255,255,0.07);
            transition:transform 0.15s,box-shadow 0.15s;
            animation:st-popin 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
            user-select:none;letter-spacing:0.2px;
        }
        #st-open-btn:hover  {transform:translateY(-2px);box-shadow:0 8px 28px rgba(233,69,96,0.55);}
        #st-open-btn:active {transform:scale(0.95);}

        #st-overlay {
            position:fixed;inset:0;z-index:999999;
            background:rgba(2,5,14,0.85);backdrop-filter:blur(8px);
            display:flex;align-items:center;justify-content:center;
            opacity:0;transition:opacity 0.22s ease;pointer-events:none;
        }
        #st-overlay.open {opacity:1;pointer-events:all;}

        #st-window {
            width:min(920px,calc(100vw - 40px));
            height:min(640px,calc(100vh - 60px));
            background:linear-gradient(160deg,#0c1524 0%,#080e1c 100%);
            border:1px solid #0f1e35;border-radius:18px;
            display:flex;flex-direction:column;overflow:hidden;
            box-shadow:0 40px 100px rgba(0,0,0,0.9),inset 0 1px 0 rgba(255,255,255,0.04);
            transform:translateY(24px) scale(0.97);
            transition:transform 0.28s cubic-bezier(0.16,1,0.3,1),opacity 0.22s ease;
            opacity:0;
        }
        #st-overlay.open #st-window {transform:translateY(0) scale(1);opacity:1;}

        #st-window * {box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',system-ui,sans-serif !important;}
        #st-window ::-webkit-scrollbar {width:3px;}
        #st-window ::-webkit-scrollbar-track {background:transparent;}
        #st-window ::-webkit-scrollbar-thumb {background:#1e3a5f;border-radius:99px;}
        #st-window ::-webkit-scrollbar-thumb:hover {background:#e94560;}

        #st-body {display:flex;flex:1;overflow:hidden;}
        #st-sidebar {
            width:186px;flex-shrink:0;background:#060c18;border-right:1px solid #0a1525;
            display:flex;flex-direction:column;padding:16px 12px;overflow-y:auto;
        }
        #st-main {flex:1;overflow-y:auto;padding:22px;}

        @keyframes st-popin   {0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes st-spin    {to{transform:rotate(360deg)}}
        @keyframes st-shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes st-pulse-g {0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
        @keyframes st-pulse-r {0%,100%{box-shadow:0 0 0 0 rgba(233,69,96,0.5)}70%{box-shadow:0 0 0 8px rgba(233,69,96,0)}}

        .st-spin {display:inline-block;animation:st-spin 0.7s linear infinite;}
        .st-skel {background:linear-gradient(90deg,#0f1a2e 25%,#162032 50%,#0f1a2e 75%);background-size:200% 100%;animation:st-shimmer 1.4s infinite;}
        .st-sniper-active {animation:st-pulse-g 1.8s infinite;}

        .st-dot {width:7px;height:7px;border-radius:50%;flex-shrink:0;transition:background 0.3s,box-shadow 0.3s;}
        .st-dot-idle    {background:#1e293b;}
        .st-dot-active  {background:#22c55e;box-shadow:0 0 6px #22c55e;animation:st-pulse-g 1.8s infinite;}
        .st-dot-hot     {background:#e94560;box-shadow:0 0 6px #e94560;animation:st-pulse-r 1.2s infinite;}
        .st-dot-loading {background:#eab308;box-shadow:0 0 6px #eab308;}

        .st-nav-btn {
            display:flex;align-items:center;gap:8px;width:100%;
            padding:9px 10px;border:none;border-radius:9px;cursor:pointer;
            font-size:11px;font-weight:600;text-align:left;
            background:transparent;color:#334155;
            transition:background 0.15s,color 0.15s;margin-bottom:3px;
        }
        .st-nav-btn:hover  {background:#0d1829;color:#475569;}
        .st-nav-btn.active {background:linear-gradient(135deg,#e94560,#b91c4a);color:#fff;box-shadow:0 2px 10px rgba(233,69,96,0.25);}

        .st-msec-btn {
            flex:1;padding:7px 4px;border:1px solid transparent;
            border-radius:8px;cursor:pointer;font-size:10px;font-weight:600;
            color:#334155;background:transparent;
            transition:all 0.15s;white-space:nowrap;
        }
        .st-msec-btn:hover {background:#0d1829;color:#475569;border-color:#0a1525;}

        .st-stat {background:#060c18;border:1px solid #0a1525;border-radius:9px;padding:10px 12px;}
        .st-stat-label {color:#1e3a5f;font-size:9px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin-bottom:4px;}
        .st-stat-val   {color:#e2e8f0;font-size:18px;font-weight:700;font-family:monospace !important;}

        .st-input {width:100%;padding:8px 10px;background:#060c18;border:1px solid #0a1525;border-radius:8px;color:#94a3b8;font-size:11px;outline:none;transition:border-color 0.15s;}
        .st-input:focus {border-color:#e94560;}
        .st-input::placeholder {color:#1e3a5f;}

        .st-set-input {width:100%;padding:7px 10px;background:#0a1525;border:1px solid #1e293b;border-radius:7px;color:#94a3b8;font-size:11px;outline:none;transition:border-color 0.15s;}
        .st-set-input:focus {border-color:#e94560;}
        .st-set-input::placeholder {color:#1e3a5f;}

        #st-close-btn:hover {background:rgba(233,69,96,0.15)!important;color:#e94560!important;}
        #st-rtt-fill {height:100%;border-radius:3px;background:linear-gradient(90deg,#22c55e,#eab308,#e94560);transition:width 0.4s ease;}
        .st-inv-box {overflow-y:auto;background:#060c18;border:1px solid #0a1525;border-radius:8px;padding:4px;max-height:180px;min-height:60px;}
        #st-tab-content-settings {flex:1;overflow-y:auto;padding:22px;display:none;}
    `;
    document.head.appendChild(s);
}

// ─── Build UI ─────────────────────────────────────────────────────────────
function buildUI() {
    const openBtn = document.createElement('button');
    openBtn.id = 'st-open-btn'; openBtn.innerHTML = '🛒 Tools';
    document.body.appendChild(openBtn);

    const overlay = document.createElement('div');
    overlay.id = 'st-overlay';

    const win = document.createElement('div');
    win.id = 'st-window';
    win.innerHTML = `
        <div style="height:2px;background:linear-gradient(90deg,transparent,#e94560 40%,#b91c4a 60%,transparent);flex-shrink:0;"></div>

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;flex-shrink:0;border-bottom:1px solid #0a1525;background:#060c18;">
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#e94560,#b91c4a);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 14px rgba(233,69,96,0.35);">🛒</div>
                <div>
                    <div style="color:#f1f5f9;font-size:14px;font-weight:700;letter-spacing:-0.2px;">Strrev Tools</div>
                    <div style="color:#1e3a5f;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;margin-top:1px;">v9.0 — Multi-Account</div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="display:flex;gap:3px;background:#0a1525;padding:3px;border-radius:9px;">
                    <button id="st-tab-manage"   style="padding:6px 16px;border:none;border-radius:7px;cursor:pointer;font-size:10px;font-weight:600;background:linear-gradient(135deg,#e94560,#b91c4a);color:#fff;box-shadow:0 2px 12px rgba(233,69,96,0.25);transition:all 0.15s;">⚙ Manage</button>
                    <button id="st-tab-settings" style="padding:6px 16px;border:none;border-radius:7px;cursor:pointer;font-size:10px;font-weight:600;background:transparent;color:#334155;transition:all 0.15s;">🔧 Settings</button>
                </div>
                <button id="st-close-btn" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);border:1px solid #0f1e35;color:#334155;font-size:13px;cursor:pointer;border-radius:8px;transition:all 0.15s;flex-shrink:0;">✕</button>
            </div>
        </div>

        <!-- Body -->
        <div id="st-body">

            <!-- MANAGE TAB -->
            <div id="st-tab-content-manage" style="display:contents;">

                <!-- Sidebar -->
                <div id="st-sidebar">
                    <div style="font-size:9px;color:#1e3a5f;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Account</div>
                    <select id="st-acct-sel" style="width:100%;background:#0d1829;border:1px solid #1e293b;color:#94a3b8;border-radius:8px;padding:7px 8px;font-size:11px;outline:none;cursor:pointer;margin-bottom:14px;transition:border-color 0.15s;">
                        <option value="-1">🌐 Session</option>
                    </select>
                    <div style="height:1px;background:#0a1525;margin-bottom:12px;"></div>
                    <div style="font-size:9px;color:#1e3a5f;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Sections</div>
                    <button id="st-msec-sniper"  class="st-nav-btn active">🎯 Sniper</button>
                    <button id="st-msec-catalog" class="st-nav-btn">🛒 Catalog</button>
                    <button id="st-msec-trade"   class="st-nav-btn">🔄 Trade</button>
                    <div style="flex:1;"></div>
                    <div id="st-acct-mini" style="margin-top:12px;padding:9px 10px;background:#060c18;border:1px solid #0a1525;border-radius:9px;">
                        <div style="font-size:9px;color:#1e3a5f;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Active Account</div>
                        <div id="st-acct-mini-name" style="font-size:12px;color:#e94560;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Session</div>
                        <div id="st-acct-mini-sub"  style="font-size:9px;color:#334155;margin-top:1px;">Current browser session</div>
                    </div>
                </div>

                <!-- Main -->
                <div id="st-main">

                    <!-- SNIPER -->
                    <div id="st-msec-content-sniper">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                            <div>
                                <div style="color:#f1f5f9;font-size:15px;font-weight:700;">Auto-Buy Sniper</div>
                                <div style="color:#334155;font-size:10px;margin-top:2px;">Polls catalog API — silently buys for selected account(s) on hit</div>
                            </div>
                            <button id="st-sniper-btn" style="padding:10px 20px;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:12px;color:#fff;letter-spacing:0.3px;background:linear-gradient(135deg,#e94560,#b91c4a);box-shadow:0 0 20px rgba(233,69,96,0.2);transition:opacity 0.15s,transform 0.12s;"
                                onmouseenter="if(!this.disabled){this.style.opacity='0.85';this.style.transform='translateY(-1px)'}"
                                onmouseleave="this.style.opacity='1';this.style.transform='translateY(0)'">🎯 Start Sniper</button>
                        </div>
                        <div id="st-sniper-status" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#060c18;border:1px solid #0a1525;border-radius:10px;margin-bottom:16px;transition:background 0.3s;">
                            <div class="st-dot st-dot-idle"></div>
                            <span class="st-dot-text" style="font-size:10px;color:#334155;">Idle — press Start to begin sniping</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">
                            <div class="st-stat"><div class="st-stat-label">Checks</div><div id="st-checks" class="st-stat-val">0</div></div>
                            <div class="st-stat"><div class="st-stat-label">Speed</div><div id="st-cps" class="st-stat-val">—</div></div>
                            <div class="st-stat"><div class="st-stat-label">Avg RTT</div><div id="st-rtt" class="st-stat-val">—</div></div>
                            <div class="st-stat"><div class="st-stat-label">Workers</div><div id="st-conc" class="st-stat-val">—</div></div>
                        </div>
                        <div style="margin-bottom:16px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                                <span style="color:#1e3a5f;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Network Health</span>
                                <span style="color:#1e3a5f;font-size:9px;font-family:monospace;">0ms → 500ms</span>
                            </div>
                            <div style="height:4px;background:#0a1525;border-radius:3px;overflow:hidden;"><div id="st-rtt-fill" style="width:0%;"></div></div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;">
                            <span style="color:#1e3a5f;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Activity Log</span>
                            <button id="st-log-clear" style="background:none;border:none;color:#1e293b;font-size:9px;cursor:pointer;padding:2px 5px;border-radius:4px;transition:color 0.12s;"
                                onmouseenter="this.style.color='#475569'" onmouseleave="this.style.color='#1e293b'">Clear</button>
                        </div>
                        <div id="st-log" style="background:#060c18;border:1px solid #0a1525;border-radius:10px;padding:8px;max-height:220px;overflow-y:auto;"></div>
                    </div>

                    <!-- CATALOG -->
                    <div id="st-msec-content-catalog" style="display:none;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                            <div>
                                <div style="color:#f1f5f9;font-size:15px;font-weight:700;">Catalog Browser</div>
                                <div style="color:#334155;font-size:10px;margin-top:2px;">Items visible on this page — buy for active account(s)</div>
                            </div>
                            <button id="st-cat-refresh" style="padding:8px 14px;background:#060c18;color:#334155;border:1px solid #0a1525;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;transition:all 0.15s;display:flex;align-items:center;gap:5px;"
                                onmouseenter="this.style.background='#0d1829';this.style.color='#94a3b8';this.style.borderColor='#1e293b'"
                                onmouseleave="this.style.background='#060c18';this.style.color='#334155';this.style.borderColor='#0a1525'">
                                <span id="st-refresh-icon" style="display:inline-block;font-size:13px;">↻</span> Refresh
                            </button>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                            <div id="st-cat-count"><span style="color:#334155;font-size:10px;">Loading...</span></div>
                            <div style="display:flex;gap:10px;font-size:9px;font-weight:700;">
                                <span style="color:#f97316;">R$ <span style="font-weight:400;color:#475569;">Robux</span></span>
                                <span style="color:#eab308;">T$ <span style="font-weight:400;color:#475569;">Tix</span></span>
                            </div>
                        </div>
                        <ul id="st-cat-list" style="padding:0;margin:0;"></ul>
                    </div>

                    <!-- TRADE -->
                    <div id="st-msec-content-trade" style="display:none;">
                        <div style="margin-bottom:16px;">
                            <div style="color:#f1f5f9;font-size:15px;font-weight:700;">Trade Sender</div>
                            <div style="color:#334155;font-size:10px;margin-top:2px;">Send trade offers as the active account — "All Accounts" not supported for trades</div>
                        </div>
                        <div style="display:flex;gap:6px;margin-bottom:10px;">
                            <input id="st-trade-input" class="st-input" type="text" placeholder="Username or User ID…" style="flex:1;">
                            <button id="st-load-btn" style="padding:8px 14px;background:linear-gradient(135deg,#e94560,#b91c4a);border:none;border-radius:8px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;transition:opacity 0.12s;"
                                onmouseenter="this.style.opacity='0.85'" onmouseleave="this.style.opacity='1'">Load</button>
                        </div>
                        <div id="st-trade-status" style="display:none;padding:8px 10px;border-radius:8px;border:1px solid #0a1525;background:#060c18;font-size:10px;color:#475569;margin-bottom:10px;word-break:break-word;"></div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                            <div>
                                <div style="font-size:9px;color:#1e3a5f;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;display:flex;align-items:center;gap:5px;">
                                    <div style="width:5px;height:5px;border-radius:50%;background:#e94560;"></div>Your Offer
                                </div>
                                <div id="st-my-inv" class="st-inv-box"><div style="padding:10px;text-align:center;color:#1e3a5f;font-size:9px;">Load a user first</div></div>
                            </div>
                            <div>
                                <div style="font-size:9px;color:#1e3a5f;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;display:flex;align-items:center;gap:5px;">
                                    <div style="width:5px;height:5px;border-radius:50%;background:#3b82f6;"></div>Their Offer
                                </div>
                                <div id="st-th-inv" class="st-inv-box"><div style="padding:10px;text-align:center;color:#1e3a5f;font-size:9px;">Load a user first</div></div>
                            </div>
                        </div>
                        <div style="padding:6px 8px;background:#060c18;border:1px solid #0a1525;border-radius:7px;font-size:9px;color:#1e3a5f;text-align:center;margin-bottom:10px;">Click items to select them for the trade offer</div>
                        <div id="st-trade-summary" style="display:none;padding:8px 12px;background:#060c18;border:1px solid #0a1525;border-radius:8px;margin-bottom:10px;text-align:center;font-size:10px;">
                            <span style="color:#e94560;font-weight:700;">You offer: <span id="st-my-count">0</span></span>
                            <span style="color:#334155;margin:0 10px;">↔</span>
                            <span style="color:#3b82f6;font-weight:700;">You request: <span id="st-th-count">0</span></span>
                        </div>
                        <button id="st-send-btn" disabled style="width:100%;padding:12px;border:none;border-radius:10px;cursor:not-allowed;font-weight:700;font-size:12px;color:#fff;background:linear-gradient(135deg,#e94560,#b91c4a);box-shadow:0 0 20px rgba(233,69,96,0.2);opacity:0.4;pointer-events:none;transition:opacity 0.2s,transform 0.12s,background 0.2s;"
                            onmouseenter="if(!this.disabled){this.style.opacity='0.85';this.style.transform='translateY(-1px)'}"
                            onmouseleave="this.style.opacity=this.disabled?'0.4':'1';this.style.transform='translateY(0)'">
                            🔄 Send Trade Offer
                        </button>
                    </div>
                </div>
            </div>

            <!-- SETTINGS TAB -->
            <div id="st-tab-content-settings">
                <div style="max-width:540px;margin:0 auto;">
                    <div style="color:#f1f5f9;font-size:16px;font-weight:700;margin-bottom:4px;">Accounts</div>
                    <div style="color:#334155;font-size:10px;margin-bottom:18px;">Add and remove alt accounts. Shared with the Catalog Browser script.</div>
                    <div id="st-settings-acct-list" style="margin-bottom:16px;"></div>
                    <div style="background:#060c18;border:1px solid #0a1525;border-radius:12px;padding:18px;margin-bottom:28px;">
                        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#1e3a5f;margin-bottom:14px;">Add Account</div>
                        <div style="margin-bottom:9px;">
                            <div style="font-size:10px;color:#334155;margin-bottom:4px;">.ROBLOSECURITY cookie</div>
                            <input id="st-add-cookie" class="st-set-input" type="password" placeholder="Paste cookie value here…">
                        </div>
                        <div style="margin-bottom:14px;">
                            <div style="font-size:10px;color:#334155;margin-bottom:4px;">CSRF Token <span style="color:#1e3a5f;">(auto-fetched if blank)</span></div>
                            <input id="st-add-csrf" class="st-set-input" type="text" placeholder="Leave blank to auto-fetch…">
                        </div>
                        <button id="st-add-btn" style="width:100%;padding:11px;background:linear-gradient(135deg,#e94560,#b91c4a);border:none;border-radius:9px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;transition:opacity 0.15s;box-shadow:0 4px 16px rgba(233,69,96,0.25);">
                            🔍 Fetch Username & Save
                        </button>
                        <div id="st-add-status" style="margin-top:9px;font-size:10px;min-height:14px;text-align:center;color:#475569;"></div>
                    </div>
                    <div style="background:#060c18;border:1px solid #0a1525;border-radius:12px;padding:18px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                            <span style="color:#1e3a5f;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">About</span>
                            <span style="color:#e94560;font-size:9px;font-weight:700;font-family:monospace;background:rgba(233,69,96,0.08);border:1px solid rgba(233,69,96,0.2);padding:2px 8px;border-radius:20px;">v9.0</span>
                        </div>
                        <div style="height:1px;background:#0a1525;margin-bottom:12px;"></div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="color:#475569;font-size:10px;line-height:1.7;">Multi-account catalog buyer, silent sniper &amp; trader</div>
                                <div style="color:#1e3a5f;font-size:9px;margin-top:2px;">Accounts saved automatically via GM_setValue</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="color:#334155;font-size:9px;">made by</div>
                                <div style="color:#e94560;font-size:12px;font-weight:700;letter-spacing:0.3px;">vinny</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;

    overlay.appendChild(win);
    document.body.appendChild(overlay);

    // Open / close
    const openUI  = () => { overlay.classList.add('open');    rebuildAcctSelector(); };
    const closeUI = () => { overlay.classList.remove('open'); };
    openBtn.addEventListener('click', openUI);
    document.getElementById('st-close-btn').addEventListener('click', closeUI);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeUI(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeUI(); });

    // Tabs
    document.getElementById('st-tab-manage').addEventListener('click',   () => switchTab('manage'));
    document.getElementById('st-tab-settings').addEventListener('click', () => switchTab('settings'));

    // Sidebar nav
    ['sniper','catalog','trade'].forEach(s => {
        document.getElementById('st-msec-'+s).addEventListener('click', () => {
            switchManage(s);
            document.querySelectorAll('#st-sidebar .st-nav-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('st-msec-'+s).classList.add('active');
        });
    });

    // Account selector
    document.getElementById('st-acct-sel').addEventListener('change', e => {
        selectedAcctIdx = parseInt(e.target.value);
        tradeTargetId=null; tradeTargetName=''; myInventory=[]; theirInventory=[]; mySelected.clear(); theirSelected.clear();
        updateMiniAcct(); updateTradeSummary();
        log('Account → '+(selectedAcctIdx===-2?'All Accounts':selectedAcctIdx===-1?'Session':accounts[selectedAcctIdx]?.username||'?'), 'info');
    });

    // Sniper
    document.getElementById('st-sniper-btn').addEventListener('click', toggleSniper);
    document.getElementById('st-log-clear').addEventListener('click', () => { const l=document.getElementById('st-log'); if(l) l.innerHTML=''; });

    // Catalog
    document.getElementById('st-cat-refresh').addEventListener('click', () => {
        const icon = document.getElementById('st-refresh-icon');
        if (icon) { icon.style.transition='transform 0.4s'; icon.style.transform='rotate(360deg)'; setTimeout(()=>icon.style.transform='',450); }
        renderCatalogList();
    });

    // Trade
    document.getElementById('st-load-btn').addEventListener('click', loadTradeTarget);
    document.getElementById('st-trade-input').addEventListener('keydown', e => { if (e.key==='Enter') loadTradeTarget(); });
    document.getElementById('st-send-btn').addEventListener('click', sendTradeOffer);

    // Settings
    document.getElementById('st-add-btn').addEventListener('click', addAccountFlow);
}

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
    loadAccounts();
    injectStyles();
    buildUI();
    rebuildAcctSelector();
    updateMiniAcct();

    const wasActive = GM_getValue('sniperActive', false);
    if (wasActive) {
        try { sniperBlacklist = JSON.parse(GM_getValue('sniperBlacklist','{}') || '{}'); } catch(_){}
        sniperActive = true;
        updateSniperBtn(true);
        setSniperStatus('Resuming — '+Object.keys(sniperBlacklist).length+' items blacklisted', 'active');
        log('Sniper resumed from last session', 'success');
        startDispatch();
    }
}
