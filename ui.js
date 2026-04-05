// ─── Theme Definitions ────────────────────────────────────────────────────
const THEMES = {
    void:     { name:'Void',       icon:'🌑', desc:'Deep crimson & space',      anim:false, preview:['#02050e','#e94560','#0d1829'], vars:{'--c-bg0':'#02050e','--c-bg1':'#060c18','--c-bg2':'#0d1829','--c-bg3':'#111e33','--c-border':'#0f1e35','--c-border2':'#0a1525','--c-accent':'#e94560','--c-accent2':'#b91c4a','--c-accent-glow':'rgba(233,69,96,0.3)','--c-text0':'#f1f5f9','--c-text1':'#94a3b8','--c-text2':'#475569','--c-text3':'#334155','--c-text4':'#1e3a5f','--c-text5':'#0a1525','--c-success':'#22c55e','--c-warn':'#eab308','--c-err':'#ef4444','--c-tabbar':'#010408','--c-tab':'#030810','--c-tab-active':'#060c18'} },
    hacker:   { name:'Hacker',     icon:'💀', desc:'Matrix rain terminal',       anim:true,  preview:['#000000','#00ff41','#0a120a'], vars:{'--c-bg0':'#000000','--c-bg1':'#020502','--c-bg2':'#050d05','--c-bg3':'#091409','--c-border':'#0d1f0d','--c-border2':'#071007','--c-accent':'#00ff41','--c-accent2':'#00cc33','--c-accent-glow':'rgba(0,255,65,0.3)','--c-text0':'#00ff41','--c-text1':'#00dd38','--c-text2':'#00aa2b','--c-text3':'#007720','--c-text4':'#004d14','--c-text5':'#002a0b','--c-success':'#00ff41','--c-warn':'#ffff00','--c-err':'#ff3333','--c-tabbar':'#000000','--c-tab':'#010801','--c-tab-active':'#020502'} },
    galaxy:   { name:'Galaxy',     icon:'🌌', desc:'Cosmic starfield & nebula',  anim:true,  preview:['#04010f','#a855f7','#0e0828'], vars:{'--c-bg0':'#04010f','--c-bg1':'#07031a','--c-bg2':'#0e0828','--c-bg3':'#160d3a','--c-border':'#1e0f4a','--c-border2':'#130a35','--c-accent':'#a855f7','--c-accent2':'#7c3aed','--c-accent-glow':'rgba(168,85,247,0.35)','--c-text0':'#ede9fe','--c-text1':'#c4b5fd','--c-text2':'#8b5cf6','--c-text3':'#6d28d9','--c-text4':'#4c1d95','--c-text5':'#2e1065','--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171','--c-tabbar':'#020008','--c-tab':'#050012','--c-tab-active':'#07031a'} },
    frost:    { name:'Frost',      icon:'❄️', desc:'Arctic ice & steel',          anim:false, preview:['#070d18','#38bdf8','#122035'], vars:{'--c-bg0':'#070d18','--c-bg1':'#0c1525','--c-bg2':'#122035','--c-bg3':'#1a2d45','--c-border':'#1e3a5a','--c-border2':'#142c48','--c-accent':'#38bdf8','--c-accent2':'#0284c7','--c-accent-glow':'rgba(56,189,248,0.3)','--c-text0':'#e0f2fe','--c-text1':'#7dd3fc','--c-text2':'#38bdf8','--c-text3':'#0369a1','--c-text4':'#0c4a6e','--c-text5':'#082f49','--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171','--c-tabbar':'#040810','--c-tab':'#080e1c','--c-tab-active':'#0c1525'} },
    blood:    { name:'Blood',      icon:'🩸', desc:'Dark crimson & shadow',      anim:false, preview:['#0a0000','#dc2626','#1a0505'], vars:{'--c-bg0':'#0a0000','--c-bg1':'#100202','--c-bg2':'#1a0505','--c-bg3':'#230808','--c-border':'#2d0a0a','--c-border2':'#1f0606','--c-accent':'#dc2626','--c-accent2':'#991b1b','--c-accent-glow':'rgba(220,38,38,0.32)','--c-text0':'#fee2e2','--c-text1':'#fca5a5','--c-text2':'#f87171','--c-text3':'#b91c1c','--c-text4':'#7f1d1d','--c-text5':'#450a0a','--c-success':'#4ade80','--c-warn':'#fbbf24','--c-err':'#ff6b6b','--c-tabbar':'#060000','--c-tab':'#0a0101','--c-tab-active':'#100202'} },
    midnight: { name:'Midnight',   icon:'🌙', desc:'Deep navy & gold',           anim:false, preview:['#020408','#f59e0b','#050d1a'], vars:{'--c-bg0':'#020408','--c-bg1':'#03070f','--c-bg2':'#050d1a','--c-bg3':'#071526','--c-border':'#0c2040','--c-border2':'#081530','--c-accent':'#f59e0b','--c-accent2':'#b45309','--c-accent-glow':'rgba(245,158,11,0.28)','--c-text0':'#fef3c7','--c-text1':'#fcd34d','--c-text2':'#f59e0b','--c-text3':'#92400e','--c-text4':'#451a03','--c-text5':'#1c0a01','--c-success':'#34d399','--c-warn':'#fb923c','--c-err':'#f87171','--c-tabbar':'#010306','--c-tab':'#020508','--c-tab-active':'#03070f'} },
    aurora:   { name:'Aurora',     icon:'🌌', desc:'Northern lights drift',      anim:true,  preview:['#010a0d','#00ffd0','#041520'], vars:{'--c-bg0':'#010a0d','--c-bg1':'#020f14','--c-bg2':'#041520','--c-bg3':'#061e2c','--c-border':'#082a3a','--c-border2':'#052030','--c-accent':'#00ffd0','--c-accent2':'#00bfa0','--c-accent-glow':'rgba(0,255,208,0.28)','--c-text0':'#ccfff6','--c-text1':'#5fffd8','--c-text2':'#00e8bb','--c-text3':'#00806a','--c-text4':'#004d40','--c-text5':'#002a22','--c-success':'#00ffd0','--c-warn':'#fbbf24','--c-err':'#f87171','--c-tabbar':'#01080b','--c-tab':'#010c10','--c-tab-active':'#020f14'} },
    storm:    { name:'Storm',      icon:'⚡', desc:'Lightning & dark clouds',     anim:true,  preview:['#050508','#7c3aed','#0e0b1a'], vars:{'--c-bg0':'#050508','--c-bg1':'#080810','--c-bg2':'#0e0b1a','--c-bg3':'#140f24','--c-border':'#1e1535','--c-border2':'#160e28','--c-accent':'#7c3aed','--c-accent2':'#5b21b6','--c-accent-glow':'rgba(124,58,237,0.35)','--c-text0':'#ede9fe','--c-text1':'#c4b5fd','--c-text2':'#a78bfa','--c-text3':'#5b21b6','--c-text4':'#3b0764','--c-text5':'#1e0338','--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171','--c-tabbar':'#030306','--c-tab':'#06060c','--c-tab-active':'#080810'} },
    ocean:    { name:'Ocean',      icon:'🌊', desc:'Deep sea bioluminescence',   anim:true,  preview:['#010a10','#00d4ff','#03151e'], vars:{'--c-bg0':'#010a10','--c-bg1':'#021118','--c-bg2':'#03151e','--c-bg3':'#051e2c','--c-border':'#082a3c','--c-border2':'#062030','--c-accent':'#00d4ff','--c-accent2':'#0099bb','--c-accent-glow':'rgba(0,212,255,0.28)','--c-text0':'#ccf9ff','--c-text1':'#60eeff','--c-text2':'#00d4ff','--c-text3':'#007a99','--c-text4':'#004a5e','--c-text5':'#002533','--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171','--c-tabbar':'#01080d','--c-tab':'#020d14','--c-tab-active':'#021118'} },
    neon:     { name:'Neon City',  icon:'🏙️', desc:'Cyberpunk rain & neon signs', anim:true, preview:['#02000a','#ff00ff','#08001a'], vars:{'--c-bg0':'#02000a','--c-bg1':'#04000e','--c-bg2':'#08001a','--c-bg3':'#0c0022','--c-border':'#140030','--c-border2':'#0e0022','--c-accent':'#ff00ff','--c-accent2':'#cc00cc','--c-accent-glow':'rgba(255,0,255,0.32)','--c-text0':'#ffe0ff','--c-text1':'#ff80ff','--c-text2':'#ff00ff','--c-text3':'#880088','--c-text4':'#440044','--c-text5':'#220022','--c-success':'#00ffcc','--c-warn':'#ffee00','--c-err':'#ff3366','--c-tabbar':'#010007','--c-tab':'#03000c','--c-tab-active':'#04000e'} },
    snow:     { name:'Snowfall',   icon:'❄️', desc:'Gentle snowflakes drifting',  anim:true, preview:['#06090f','#c8d8f0','#0d1525'], vars:{'--c-bg0':'#06090f','--c-bg1':'#090e18','--c-bg2':'#0d1525','--c-bg3':'#121c30','--c-border':'#1a2a45','--c-border2':'#142038','--c-accent':'#c8d8f0','--c-accent2':'#8aaad0','--c-accent-glow':'rgba(200,216,240,0.22)','--c-text0':'#eef4ff','--c-text1':'#c8d8f0','--c-text2':'#8aaad0','--c-text3':'#3a5580','--c-text4':'#1e3355','--c-text5':'#0e1c33','--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171','--c-tabbar':'#04060c','--c-tab':'#070b14','--c-tab-active':'#090e18'} },
    rose:     { name:'Rose Gold',  icon:'🌸', desc:'Soft pink & warm metallic',  anim:false, preview:['#0d0608','#f9a8d4','#1a0c12'], vars:{'--c-bg0':'#0d0608','--c-bg1':'#140810','--c-bg2':'#1a0c12','--c-bg3':'#221018','--c-border':'#301420','--c-border2':'#281018','--c-accent':'#f9a8d4','--c-accent2':'#ec4899','--c-accent-glow':'rgba(249,168,212,0.28)','--c-text0':'#fdf2f8','--c-text1':'#fbcfe8','--c-text2':'#f9a8d4','--c-text3':'#9d174d','--c-text4':'#5a0e2e','--c-text5':'#2d0718','--c-success':'#34d399','--c-warn':'#fbbf24','--c-err':'#f87171','--c-tabbar':'#0a0407','--c-tab':'#10060c','--c-tab-active':'#140810'} },
    ember:    { name:'Ember',      icon:'🔆', desc:'Warm amber & dark brown',     anim:false, preview:['#0d0800','#f59e0b','#1a1000'], vars:{'--c-bg0':'#0d0800','--c-bg1':'#140e00','--c-bg2':'#1a1200','--c-bg3':'#221800','--c-border':'#302000','--c-border2':'#281800','--c-accent':'#f59e0b','--c-accent2':'#d97706','--c-accent-glow':'rgba(245,158,11,0.3)','--c-text0':'#fef3c7','--c-text1':'#fde68a','--c-text2':'#f59e0b','--c-text3':'#92400e','--c-text4':'#541e00','--c-text5':'#2c1000','--c-success':'#4ade80','--c-warn':'#fb923c','--c-err':'#f87171','--c-tabbar':'#0a0600','--c-tab':'#110c00','--c-tab-active':'#140e00'} },
};

let currentTheme = 'void', stopAnim = null;

// ─── Canvas Animations ────────────────────────────────────────────────────
function clearBgCanvas() {
    if (stopAnim) { stopAnim(); stopAnim = null; }
    document.getElementById('st-anim-canvas')?.remove();
}

function makeBgCanvas() {
    clearBgCanvas();
    const fx = document.getElementById('st-bg-fx'); if (!fx) return null;
    const cv = document.createElement('canvas');
    cv.id = 'st-anim-canvas'; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    cv.width = fx.offsetWidth || window.innerWidth; cv.height = fx.offsetHeight || window.innerHeight;
    fx.appendChild(cv); return cv;
}

function animHacker() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, FS = 14;
    const cols = Math.floor(W / FS), drops = Array.from({ length: cols }, () => Math.random() * -50);
    const CHARS = 'アイウエオカキクケコ0123456789ABCDEF><{}[]|/\\';
    let alive = true;
    function frame() {
        if (!alive) return;
        ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(0, 0, W, H);
        ctx.font = FS + 'px "Fira Code",monospace';
        for (let i = 0; i < cols; i++) {
            const y = drops[i] * FS;
            ctx.fillStyle = '#ccffcc'; ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FS, y);
            if (drops[i] > 1) { ctx.fillStyle = 'rgba(0,200,50,0.6)'; ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * FS, y - FS); }
            if (y > H && Math.random() > 0.975) drops[i] = 0;
            drops[i] += 0.55;
        }
        requestAnimationFrame(frame);
    }
    frame(); stopAnim = () => { alive = false; };
}

function animGalaxy() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    const COLORS = ['#ffffff','#d8b4fe','#c084fc','#e9d5ff','#a78bfa'];
    const stars = Array.from({ length: 300 }, () => ({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.9+0.2, phase: Math.random()*Math.PI*2, speed: Math.random()*0.018+0.004, color: COLORS[Math.floor(Math.random()*COLORS.length)] }));
    const shooters = Array.from({ length: 4 }, () => resetShooter({}, W, H));
    function resetShooter(s, w, h) { s.x=Math.random()*w; s.y=Math.random()*h*0.6; s.vx=-(Math.random()*7+3); s.vy=Math.random()*3.5+1; s.life=0; s.maxLife=70+Math.random()*80; return s; }
    let alive = true;
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s => { s.phase += s.speed; const a = 0.35+0.65*Math.abs(Math.sin(s.phase)); ctx.globalAlpha=a; ctx.fillStyle=s.color; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); });
        shooters.forEach(s => {
            s.life++; if (s.life > s.maxLife) { resetShooter(s,W,H); return; }
            const p = s.life/s.maxLife, alpha = p<0.2?p/0.2:p>0.8?(1-p)/0.2:1;
            ctx.globalAlpha = alpha*0.75;
            const grd = ctx.createLinearGradient(s.x,s.y,s.x-s.vx*7.5,s.y-s.vy*7.5);
            grd.addColorStop(0,'#ffffff'); grd.addColorStop(1,'transparent');
            ctx.strokeStyle=grd; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*7.5,s.y-s.vy*7.5); ctx.stroke();
            s.x+=s.vx*0.5; s.y+=s.vy*0.5; if (s.x<-50||s.y>H+50) resetShooter(s,W,H);
        });
        ctx.globalAlpha = 1; requestAnimationFrame(frame);
    }
    frame(); stopAnim = () => { alive = false; };
}

function animAurora() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    let alive = true, t = 0;
    const bands = [{ y:H*0.25, vy:0.012, hue:168, amp:H*0.09, freq:0.0018, speed:0.0008 }, { y:H*0.38, vy:0.009, hue:185, amp:H*0.07, freq:0.0024, speed:0.0012 }, { y:H*0.18, vy:0.007, hue:155, amp:H*0.06, freq:0.0014, speed:0.0006 }];
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        bands.forEach(b => {
            b.y += Math.sin(t*b.vy)*0.4;
            for (let x = 0; x < W; x += 2) {
                const wave = Math.sin(x*b.freq+t*b.speed)*b.amp, bandY = b.y+wave;
                const brightness = 0.55+0.45*Math.sin(x*0.004+t*0.002);
                const alpha = brightness*(0.12+0.08*Math.abs(Math.sin(t*0.005+x*0.002)));
                const grd = ctx.createLinearGradient(x,bandY-b.amp*0.8,x,bandY+b.amp*1.8);
                grd.addColorStop(0,'transparent'); grd.addColorStop(0.5,`hsla(${b.hue},100%,72%,${alpha})`); grd.addColorStop(1,'transparent');
                ctx.fillStyle=grd; ctx.fillRect(x,bandY-b.amp,2,b.amp*2.8);
            }
        });
        t++; requestAnimationFrame(frame);
    }
    frame(); stopAnim = () => { alive = false; };
}

function animStorm() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    let alive = true, t = 0;
    const clouds = Array.from({ length: 18 }, (_, i) => ({ x:Math.random()*W*1.4-W*0.2, y:Math.random()*H*0.55, r:Math.random()*180+80, vx:-(Math.random()*0.35+0.1), alpha:Math.random()*0.12+0.04, layer:i%3 }));
    let bolts = [], boltTimer = 0, boltInterval = 90+Math.random()*120;
    function makeBolt(w, h) {
        const segs = []; let cx = Math.random()*w, cy = 0;
        while (cy < h*0.7) { const nx = cx+(Math.random()-0.5)*80, ny = cy+Math.random()*60+30; segs.push({x1:cx,y1:cy,x2:nx,y2:ny}); cx=nx; cy=ny; }
        return { segs, life:0, maxLife:18+Math.random()*10 };
    }
    const rain = Array.from({ length: 200 }, () => ({ x:Math.random()*W, y:Math.random()*H, vy:Math.random()*14+8, len:Math.random()*18+8 }));
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        clouds.forEach(c => { c.x+=c.vx; if(c.x<-c.r*2)c.x=W+c.r; const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r); g.addColorStop(0,`rgba(20,10,50,${c.alpha*1.6})`); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2); ctx.fill(); });
        rain.forEach(r => { r.y+=r.vy; if(r.y>H){r.y=-r.len;r.x=Math.random()*W;} ctx.strokeStyle='rgba(160,130,255,0.18)'; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(r.x,r.y); ctx.lineTo(r.x-2,r.y+r.len); ctx.stroke(); });
        boltTimer++; if(boltTimer>=boltInterval){bolts.push(makeBolt(W,H));boltTimer=0;boltInterval=80+Math.random()*130;ctx.fillStyle='rgba(180,140,255,0.07)';ctx.fillRect(0,0,W,H);}
        bolts=bolts.filter(b=>b.life<b.maxLife);
        bolts.forEach(b => { b.life++; const p=b.life/b.maxLife,a=p<0.15?p/0.15:1-p; b.segs.forEach(seg=>{ ctx.strokeStyle=`rgba(230,210,255,${a*0.9})`; ctx.lineWidth=1.5+((1-p)*2); ctx.shadowColor='#a855f7'; ctx.shadowBlur=14; ctx.beginPath(); ctx.moveTo(seg.x1,seg.y1); ctx.lineTo(seg.x2,seg.y2); ctx.stroke(); }); });
        ctx.shadowBlur=0; t++; requestAnimationFrame(frame);
    }
    frame(); stopAnim = () => { alive = false; };
}

function animOcean() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    let alive = true, t = 0;
    const waves = [{ amp:H*0.045, freq:0.006, speed:0.018, y:H*0.55, color:'rgba(0,180,220,0.09)' }, { amp:H*0.035, freq:0.009, speed:0.025, y:H*0.62, color:'rgba(0,140,200,0.11)' }];
    const orbs = Array.from({ length: 80 }, () => ({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.3, r:Math.random()*3+0.8, phase:Math.random()*Math.PI*2 }));
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        waves.forEach(w => {
            ctx.beginPath(); ctx.moveTo(0, w.y);
            for (let x=0;x<=W;x+=4) ctx.lineTo(x, w.y+Math.sin(x*w.freq+t*w.speed)*w.amp+Math.sin(x*w.freq*1.7+t*w.speed*0.6)*w.amp*0.4);
            ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fillStyle=w.color; ctx.fill();
        });
        orbs.forEach(o => {
            o.x+=o.vx; o.y+=o.vy; o.phase+=0.025;
            if(o.x<0)o.x=W; if(o.x>W)o.x=0; if(o.y<0)o.y=H; if(o.y>H)o.y=0;
            const a=0.3+0.7*Math.abs(Math.sin(o.phase));
            const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r*4);
            g.addColorStop(0,`rgba(0,255,220,${a*0.9})`); g.addColorStop(1,'transparent');
            ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,o.r*4,0,Math.PI*2); ctx.fill();
        });
        t++; requestAnimationFrame(frame);
    }
    frame(); stopAnim = () => { alive = false; };
}

function animNeon() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    let alive = true, t = 0;
    const rain = Array.from({ length: 180 }, () => ({ x:Math.random()*W, y:Math.random()*H, vy:Math.random()*12+6, len:Math.random()*22+8, hue:Math.random()>0.5?300:200 }));
    const signs = [{ x:W*0.15, y:H*0.18, text:'OPEN', hue:300, size:22 }, { x:W*0.72, y:H*0.25, text:'BAR', hue:180, size:18 }, { x:W*0.45, y:H*0.12, text:'24H', hue:60, size:16 }];
    const flickerState = signs.map(() => ({ on:true, timer:0, interval:40+Math.random()*200 }));
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        rain.forEach(r => { r.y+=r.vy; if(r.y>H){r.y=-r.len;r.x=Math.random()*W;} ctx.strokeStyle=`hsla(${r.hue},100%,65%,0.13)`; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(r.x,r.y); ctx.lineTo(r.x-1,r.y+r.len); ctx.stroke(); });
        signs.forEach((s, i) => {
            const f=flickerState[i]; f.timer++; if(f.timer>f.interval){f.on=!f.on;f.timer=0;f.interval=Math.random()>0.8?3:40+Math.random()*300;}
            if(!f.on) return;
            const a=0.7+0.3*Math.sin(t*0.05+i); ctx.font=`bold ${s.size}px "Fira Code",monospace`; ctx.shadowColor=`hsl(${s.hue},100%,60%)`; ctx.shadowBlur=20; ctx.fillStyle=`hsla(${s.hue},100%,75%,${a})`; ctx.fillText(s.text,s.x,s.y); ctx.shadowBlur=0;
        });
        t++; requestAnimationFrame(frame);
    }
    frame(); stopAnim = () => { alive = false; };
}

function animSnow() {
    const cv = makeBgCanvas(); if (!cv) return;
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    let alive = true;
    const flakes = Array.from({ length: 140 }, () => ({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*3+0.5, vy:Math.random()*1.2+0.3, vx:(Math.random()-0.5)*0.4, wobble:Math.random()*Math.PI*2, wobbleSpeed:Math.random()*0.02+0.005, alpha:Math.random()*0.6+0.2 }));
    function frame() {
        if (!alive) return;
        ctx.clearRect(0, 0, W, H);
        flakes.forEach(f => {
            f.wobble+=f.wobbleSpeed; f.x+=f.vx+Math.sin(f.wobble)*0.3; f.y+=f.vy;
            if(f.y>H+5){f.y=-5;f.x=Math.random()*W;} if(f.x<-5)f.x=W+5; if(f.x>W+5)f.x=-5;
            ctx.globalAlpha=f.alpha;
            if(f.r>2){ctx.strokeStyle='#c8d8f0';ctx.lineWidth=0.8;for(let a=0;a<6;a++){const ang=(a/6)*Math.PI*2;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(ang)*f.r*2.5,f.y+Math.sin(ang)*f.r*2.5);ctx.stroke();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(f.x,f.y,f.r*0.5,0,Math.PI*2);ctx.fill();}
            else{ctx.fillStyle='#ddeeff';ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();}
        });
        ctx.globalAlpha=1; requestAnimationFrame(frame);
    }
    frame(); stopAnim = () => { alive = false; };
}

function startThemeAnim(key) {
    clearBgCanvas();
    const map = { hacker:animHacker, galaxy:animGalaxy, aurora:animAurora, storm:animStorm, ocean:animOcean, neon:animNeon, snow:animSnow };
    if (map[key]) setTimeout(map[key], 60);
}

// ─── Apply Theme ──────────────────────────────────────────────────────────
function applyTheme(key) {
    if (!THEMES[key]) return;
    currentTheme = key;
    const win = document.getElementById('st-window'); if (!win) return;
    Object.entries(THEMES[key].vars).forEach(([k, v]) => win.style.setProperty(k, v));
    win.setAttribute('data-theme', key);
    document.querySelectorAll('.st-theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === key));
    THEMES[key].anim ? startThemeAnim(key) : clearBgCanvas();
    try { GM_setValue('st_theme', key); } catch(_) {}
}

// ─── Theme Grid ───────────────────────────────────────────────────────────
function rebuildThemeGrid() {
    const el = document.getElementById('st-theme-grid');
    if (!el || el.dataset.built) return;
    el.dataset.built = '1';
    el.innerHTML = '';
    const sorted = Object.entries(THEMES).sort(([,a],[,b]) => (b.anim?1:0)-(a.anim?1:0));
    const mkHdr = (label, color) => { const d=document.createElement('div'); d.style.cssText='grid-column:1/-1;display:flex;align-items:center;gap:10px;margin-bottom:4px;'; d.innerHTML=`<div style="flex:1;height:1px;background:var(--c-border2);"></div><span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${color};white-space:nowrap;">${label}</span><div style="flex:1;height:1px;background:var(--c-border2);"></div>`; return d; };
    el.appendChild(mkHdr('✦ Live', 'var(--c-accent)'));
    let passedStatic = false;
    sorted.forEach(([key, t]) => {
        if (!t.anim && !passedStatic) { passedStatic=true; el.appendChild(mkHdr('Static','var(--c-text4)')); }
        const [bg,accent,bg2] = t.preview;
        const card = document.createElement('div');
        card.className = 'st-theme-card' + (key===currentTheme?' active':'');
        card.dataset.theme = key;
        card.innerHTML = `<div class="st-theme-preview" style="background:${bg};border-bottom:1px solid ${accent}33;"><div style="width:34px;height:34px;border-radius:10px;background:${accent};box-shadow:0 0 16px ${accent}99;flex-shrink:0;"></div><div style="display:flex;flex-direction:column;gap:6px;"><div style="width:44px;height:10px;border-radius:4px;background:${bg2};"></div><div style="width:30px;height:10px;border-radius:4px;background:${accent}44;"></div></div>${t.anim?'<div class="st-anim-badge">✦ LIVE</div>':''}</div><div style="padding:11px 13px 13px;"><div style="font-size:13px;font-weight:700;color:${accent};margin-bottom:3px;">${t.icon} ${t.name}</div><div style="font-size:10px;color:var(--c-text3);">${t.desc}</div></div>`;
        card.addEventListener('click', () => applyTheme(key));
        el.appendChild(card);
    });
}

// ─── Tab & Section Switching ──────────────────────────────────────────────
const TAB_META = { sniper:{icon:'🎯',name:'Sniper'}, catalog:{icon:'🛒',name:'Catalog'}, accounts:{icon:'👥',name:'Accounts'}, people:{icon:'🤝',name:'People'}, scanner:{icon:'📡',name:'Scanner'}, settings:{icon:'⚙️',name:'Settings'} };

function updateLogoForTab(section) {
    const meta = TAB_META[section] || {icon:'🛒',name:'Strrev'};
    const icon = document.getElementById('st-logo-icon'), name = document.getElementById('st-logo-name');
    if (icon) { icon.style.transform='scale(0.7)';icon.style.opacity='0';setTimeout(()=>{icon.textContent=meta.icon;icon.style.transition='transform 0.2s cubic-bezier(0.16,1,0.3,1),opacity 0.15s';icon.style.transform='scale(1)';icon.style.opacity='1';},120); }
    if (name) { name.style.opacity='0';setTimeout(()=>{name.innerHTML=meta.name+' <span>Tools</span>';name.style.transition='opacity 0.15s';name.style.opacity='1';},120); }
}

function switchManage(section) {
    ['sniper','catalog','accounts','people','scanner'].forEach(s => {
        document.getElementById('st-msec-'+s)?.classList.toggle('st-ctab-active', s===section);
        const c = document.getElementById('st-msec-content-'+s);
        if (c) { if(s===section){c.style.display='block';c.classList.remove('st-tab-fade');void c.offsetWidth;c.classList.add('st-tab-fade');}else{c.style.display='none';} }
    });
    document.getElementById('st-tab-settings')?.classList.remove('st-ctab-active');
    updateLogoForTab(section);
    if (section==='catalog') renderCatalogList();
    if (section==='accounts') setTimeout(rebuildSettingsAcctList, 0);
}

function switchTab(tab) {
    const manage=document.getElementById('st-tab-content-manage'), settings=document.getElementById('st-tab-content-settings');
    if (tab==='manage') { if(manage)manage.style.display='contents'; if(settings)settings.style.display='none'; document.getElementById('st-tab-settings')?.classList.remove('st-ctab-active'); }
    else { if(manage)manage.style.display='none'; if(settings){settings.style.display='flex';settings.classList.remove('st-tab-fade');void settings.offsetWidth;settings.classList.add('st-tab-fade');} document.getElementById('st-tab-settings')?.classList.add('st-ctab-active'); ['sniper','catalog','accounts','people','scanner'].forEach(s=>document.getElementById('st-msec-'+s)?.classList.remove('st-ctab-active')); updateLogoForTab('settings'); rebuildThemeGrid(); }
}

// ─── Sniper Pill ──────────────────────────────────────────────────────────
function showSniperPill() { const p=document.getElementById('st-sniper-pill'); if(!p)return; const ov=document.getElementById('st-overlay'); if(!ov||!ov.classList.contains('open'))p.classList.add('visible'); }
function hideSniperPill() { document.getElementById('st-sniper-pill')?.classList.remove('visible'); }
function updateSniperPill(checks,cps) { const c=document.getElementById('st-pill-checks'); if(c)c.textContent=checks>0?' · '+checks.toLocaleString()+' checks  '+cps+'/s':''; }

// ─── CSS Styles ───────────────────────────────────────────────────────────
function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fira+Code:wght@400;500;600&display=swap');
#st-overlay{position:fixed;inset:0;z-index:999999;display:flex;align-items:stretch;opacity:0;pointer-events:none;transition:opacity 0.18s ease;}
#st-overlay.open{opacity:1;pointer-events:all;}
#st-window{--c-bg0:#02050e;--c-bg1:#060c18;--c-bg2:#0d1829;--c-bg3:#111e33;--c-border:#0f1e35;--c-border2:#0a1525;--c-accent:#e94560;--c-accent2:#b91c4a;--c-accent-glow:rgba(233,69,96,0.3);--c-text0:#f1f5f9;--c-text1:#94a3b8;--c-text2:#475569;--c-text3:#334155;--c-text4:#1e3a5f;--c-text5:#0a1525;--c-success:#22c55e;--c-warn:#eab308;--c-err:#ef4444;--c-tabbar:#010408;--c-tab:#030810;--c-tab-active:#060c18;flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--c-tab-active);position:relative;transform:scale(0.985);opacity:0;transition:transform 0.25s cubic-bezier(0.16,1,0.3,1),opacity 0.18s ease;}
#st-overlay.open #st-window{transform:scale(1);opacity:1;}
#st-window *{box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',system-ui,sans-serif !important;}
#st-window ::-webkit-scrollbar{width:4px;height:4px;}
#st-window ::-webkit-scrollbar-track{background:transparent;}
#st-window ::-webkit-scrollbar-thumb{background:var(--c-border);border-radius:99px;}
#st-window ::-webkit-scrollbar-thumb:hover{background:var(--c-accent);}
#st-bg-fx{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:var(--c-bg1);}
[data-theme="void"] #st-bg-fx::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 55% 55% at 78% 18%,rgba(233,69,96,0.06) 0%,transparent 60%),radial-gradient(ellipse 35% 40% at 12% 85%,rgba(185,28,74,0.04) 0%,transparent 55%);animation:st-void-pulse 7s ease-in-out infinite alternate;}
[data-theme="frost"] #st-bg-fx::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 75% 20%,rgba(56,189,248,0.07) 0%,transparent 55%);animation:st-frost-shimmer 9s ease-in-out infinite alternate;}
#st-tabbar{display:flex;align-items:flex-end;height:54px;min-height:54px;flex-shrink:0;background:var(--c-tabbar);padding:0 0 0 16px;position:relative;z-index:10;border-bottom:1px solid var(--c-border);user-select:none;}
#st-tabbar-logo{display:flex;align-items:center;gap:10px;padding:0 20px 10px 4px;flex-shrink:0;border-right:1px solid var(--c-border2);margin-right:10px;}
#st-logo-icon{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;box-shadow:0 2px 10px var(--c-accent-glow);}
#st-logo-name{font-size:13px;font-weight:700;color:var(--c-text1);white-space:nowrap;}
#st-logo-name span{color:var(--c-text4);font-weight:500;}
#st-tabs-area{display:flex;align-items:flex-end;gap:3px;flex:1;overflow-x:auto;overflow-y:visible;scrollbar-width:none;}
#st-tabs-area::-webkit-scrollbar{display:none;}
.st-ctab{position:relative;height:42px;padding:0 20px;border-radius:10px 10px 0 0;border:1px solid transparent;border-bottom:1px solid var(--c-border);display:flex;align-items:center;gap:7px;cursor:pointer;font-size:12px;font-weight:600;color:var(--c-text3);background:transparent;white-space:nowrap;flex-shrink:0;transition:color 0.15s,background 0.15s,border-color 0.15s;outline:none;margin-bottom:-1px;z-index:1;}
.st-ctab:hover{background:var(--c-tab);color:var(--c-text2);border-color:var(--c-border2);border-bottom-color:var(--c-border);}
.st-ctab.st-ctab-active{background:var(--c-tab-active);color:var(--c-text0);border-color:var(--c-border);border-bottom-color:var(--c-tab-active);z-index:5;}
.st-ctab-accent{position:absolute;top:0;left:0;right:0;height:2.5px;background:linear-gradient(90deg,var(--c-accent),var(--c-accent2));border-radius:10px 10px 0 0;opacity:0;transition:opacity 0.18s;}
.st-ctab.st-ctab-active .st-ctab-accent{opacity:1;}
.st-ctab-sep{width:1px;height:22px;margin:0 6px 10px;background:var(--c-border2);flex-shrink:0;align-self:flex-end;}
#st-tabbar-controls{display:flex;align-items:center;gap:9px;padding:0 16px 10px;flex-shrink:0;}
#st-acct-chip{padding:6px 13px;background:var(--c-bg2);border:1px solid var(--c-border2);border-radius:9px;max-width:180px;cursor:default;}
#st-acct-mini-name{font-size:12px;font-weight:700;color:var(--c-accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4;}
#st-acct-mini-sub{font-size:9px;color:var(--c-text4);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
select#st-acct-sel{background:var(--c-bg2);border:1px solid var(--c-border);color:var(--c-text1);border-radius:9px;padding:7px 10px;font-size:11px;outline:none;cursor:pointer;transition:border-color 0.15s;max-width:160px;}
select#st-acct-sel:focus{border-color:var(--c-accent);}
#st-close-btn{width:33px;height:33px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);border:1px solid var(--c-border);color:var(--c-text3);font-size:14px;cursor:pointer;border-radius:9px;transition:all 0.15s;flex-shrink:0;}
#st-close-btn:hover{background:rgba(233,69,96,0.15);color:#e94560;border-color:rgba(233,69,96,0.3);}
#st-body{flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative;z-index:1;}
#st-main{flex:1;overflow-y:auto;padding:34px 42px;}
#st-tab-content-settings{flex:1;overflow-y:auto;padding:32px 40px;display:none;}
.st-sec-title{color:var(--c-text0);font-size:22px;font-weight:700;line-height:1.2;}
.st-sec-sub{color:var(--c-text3);font-size:11px;margin-top:5px;line-height:1.6;}
.st-btn-primary{padding:13px 28px;border:none;border-radius:11px;cursor:pointer;font-weight:700;font-size:13px;color:#fff;background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));box-shadow:0 0 22px var(--c-accent-glow);transition:opacity 0.15s,transform 0.12s,box-shadow 0.15s;white-space:nowrap;flex-shrink:0;}
.st-btn-primary:hover:not(:disabled){opacity:0.87;transform:translateY(-1px);box-shadow:0 5px 30px var(--c-accent-glow);}
.st-btn-primary:active:not(:disabled){transform:scale(0.97);}
.st-btn-primary:disabled{opacity:0.45;cursor:not-allowed;}
.st-btn-secondary{padding:11px 18px;background:var(--c-bg0);color:var(--c-text3);border:1px solid var(--c-border2);border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.15s;display:flex;align-items:center;gap:7px;}
.st-btn-secondary:hover{background:var(--c-bg2);color:var(--c-text1);border-color:var(--c-border);}
#st-sniper-btn{padding:16px 44px !important;font-size:16px !important;border-radius:13px !important;letter-spacing:0.3px;}
.st-tab-fade{animation:st-fade-in 0.22s cubic-bezier(0.16,1,0.3,1) both;}
.st-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;transition:background 0.3s,box-shadow 0.3s;}
.st-dot-idle{background:var(--c-border);}
.st-dot-active{background:var(--c-success);box-shadow:0 0 10px var(--c-success);animation:st-pulse-g 1.8s infinite;}
.st-dot-hot{background:var(--c-accent);box-shadow:0 0 10px var(--c-accent);animation:st-pulse-r 1.2s infinite;}
.st-dot-loading{background:var(--c-warn);box-shadow:0 0 10px var(--c-warn);}
.st-stat{background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:14px;padding:20px 22px;transition:border-color 0.15s,transform 0.12s;position:relative;overflow:hidden;}
.st-stat:hover{border-color:var(--c-accent);transform:translateY(-2px);}
.st-stat-label{color:var(--c-text4);font-size:10px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;margin-bottom:10px;}
.st-stat-val{color:var(--c-text0);font-size:34px;font-weight:700;font-family:'Fira Code',monospace !important;line-height:1;}
.st-log-panel{background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:14px;padding:20px;display:flex;flex-direction:column;min-height:360px;}
.st-log-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--c-border2);}
.st-log-hdr-lbl{color:var(--c-text3);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;}
#st-log-clear{background:var(--c-bg2);border:1px solid var(--c-border2);color:var(--c-text4);font-size:10px;cursor:pointer;padding:4px 10px;border-radius:6px;transition:all 0.12s;}
#st-log-clear:hover{background:var(--c-bg3);color:var(--c-text1);border-color:var(--c-border);}
#st-log{flex:1;overflow-y:auto;min-height:0;}
.st-cat-card{background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:default;transition:border-color 0.14s,background 0.14s,transform 0.14s,box-shadow 0.14s;list-style:none;position:relative;overflow:visible;}
.st-cat-card:hover{border-color:var(--c-border);background:var(--c-bg2);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.3);}
.st-cat-card-icon{width:38px;height:38px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:17px;}
.st-input{width:100%;padding:12px 15px;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:10px;color:var(--c-text1);font-size:12px;outline:none;transition:border-color 0.15s;}
.st-input:focus{border-color:var(--c-accent);}
.st-input::placeholder{color:var(--c-text5);}
.st-skel{background:linear-gradient(90deg,var(--c-bg2) 25%,var(--c-bg3) 50%,var(--c-bg2) 75%);background-size:200% 100%;animation:st-shimmer 1.4s infinite;}
.st-inv-box{overflow-y:auto;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:10px;padding:5px;max-height:230px;min-height:80px;}
.st-toggle-track{width:40px;height:22px;border-radius:99px;background:var(--c-border);position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;}
.st-toggle-track.on{background:var(--c-accent);}
.st-toggle-thumb{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform 0.18s;box-shadow:0 1px 4px rgba(0,0,0,0.4);}
.st-toggle-track.on .st-toggle-thumb{transform:translateX(18px);}
.st-spin{display:inline-block;animation:st-spin 0.7s linear infinite;}
.st-snip-settings{background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:0;margin-bottom:18px;overflow:hidden;}
.st-snip-summary{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;cursor:pointer;user-select:none;list-style:none;transition:background 0.14s;}
.st-snip-summary:hover{background:var(--c-bg2);}
.st-snip-summary::-webkit-details-marker,.st-snip-summary::marker{display:none;}
.st-snip-chevron{font-size:11px;color:var(--c-text4);transition:transform 0.2s;flex-shrink:0;}
details.st-snip-settings[open] .st-snip-chevron{transform:rotate(180deg);}
.st-snip-settings-body{padding:0 22px 20px;}
.st-snip-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);}
.st-snip-input{width:120px;padding:10px 13px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:9px;color:var(--c-text1);font-size:12px;font-family:'Fira Code',monospace;outline:none;transition:border-color 0.14s;}
.st-snip-input:focus{border-color:var(--c-accent);}
.st-toggle-row{display:flex;flex-direction:column;gap:7px;align-items:center;}
.st-theme-card{border-radius:14px;border:2px solid var(--c-border);overflow:hidden;cursor:pointer;background:var(--c-bg0);transition:border-color 0.15s,transform 0.12s,box-shadow 0.15s;}
.st-theme-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.55);}
.st-theme-card.active{border-color:var(--c-accent);box-shadow:0 0 0 1px var(--c-accent),0 0 26px var(--c-accent-glow);}
.st-theme-preview{height:78px;position:relative;display:flex;align-items:center;justify-content:center;gap:11px;padding:15px;}
.st-anim-badge{position:absolute;top:7px;right:7px;font-size:8px;font-weight:700;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,0.13);color:rgba(255,255,255,0.7);letter-spacing:0.5px;}
#st-theme-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:13px;}
[data-theme="hacker"] #st-window *{font-family:'Fira Code',monospace !important;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{-moz-appearance:textfield;}
@keyframes st-spin{to{transform:rotate(360deg)}}
@keyframes st-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes st-fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes st-pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{box-shadow:0 0 0 10px rgba(34,197,94,0)}}
@keyframes st-pulse-r{0%,100%{box-shadow:0 0 0 0 rgba(233,69,96,0.5)}70%{box-shadow:0 0 0 10px rgba(233,69,96,0)}}
@keyframes st-void-pulse{0%{opacity:0.6;transform:scale(1)}100%{opacity:1;transform:scale(1.04)}}
@keyframes st-frost-shimmer{0%{opacity:0.7;transform:scale(1)}100%{opacity:1;transform:scale(1.03)}}
    `;
    document.head.appendChild(s);

    const pillStyle = document.createElement('style');
    pillStyle.textContent = `
#st-sniper-pill{position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-80px);z-index:1000000;display:flex;align-items:center;gap:9px;padding:9px 20px 9px 14px;background:rgba(4,14,4,0.94);border:1px solid rgba(34,197,94,0.38);border-radius:999px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 4px 28px rgba(0,0,0,0.65);transition:transform 0.42s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease;opacity:0;pointer-events:none;user-select:none;cursor:pointer;font-family:'Fira Code',monospace;}
#st-sniper-pill.visible{transform:translateX(-50%) translateY(0);opacity:1;pointer-events:auto;}
#st-sniper-pill:hover{border-color:rgba(34,197,94,0.65);}
#st-pill-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:st-pill-pulse 1.8s infinite;}
@keyframes st-pill-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}
    `;
    document.head.appendChild(pillStyle);
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
        <div id="st-logo-icon">🎯</div>
        <div id="st-logo-name">Sniper <span>Tools</span></div>
    </div>
    <div id="st-tabs-area">
        <button class="st-ctab st-ctab-active" id="st-msec-sniper"><div class="st-ctab-accent"></div>🎯 Sniper</button>
        <button class="st-ctab" id="st-msec-catalog"><div class="st-ctab-accent"></div>🛒 Catalog</button>
        <button class="st-ctab" id="st-msec-accounts"><div class="st-ctab-accent"></div>👥 Accounts</button>
        <button class="st-ctab" id="st-msec-people"><div class="st-ctab-accent"></div>🤝 People</button>
        <button class="st-ctab" id="st-msec-scanner"><div class="st-ctab-accent"></div>📡 Scanner</button>
        <div class="st-ctab-sep"></div>
        <button class="st-ctab" id="st-tab-settings"><div class="st-ctab-accent"></div>⚙️ Settings</button>
    </div>
    <div id="st-tabbar-controls">
        <div id="st-acct-chip"><div id="st-acct-mini-name">Session</div><div id="st-acct-mini-sub">Current browser session</div></div>
        <select id="st-acct-sel"><option value="-1">🌐 Session</option></select>
        <button id="st-close-btn" title="Close (Esc)">✕</button>
    </div>
</div>
<div id="st-body">
    <div id="st-tab-content-manage" style="display:contents;">
        <div id="st-main">

            <!-- SNIPER -->
            <div id="st-msec-content-sniper">
                <div style="margin-bottom:20px;"><div class="st-sec-title">Sniper</div><div class="st-sec-sub">Auto-buy new items the moment they appear, or watch for price drops and resales</div></div>
                <div style="display:flex;align-items:center;gap:16px;padding:18px 24px;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:16px;margin-bottom:14px;">
                    <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 2px 14px var(--c-accent-glow);">🎯</div>
                    <div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:700;color:var(--c-text0);margin-bottom:4px;">Auto-Buy Sniper</div><div style="display:flex;align-items:center;gap:8px;"><div class="st-dot st-dot-idle" id="st-sniper-dot2" style="flex-shrink:0;"></div><span style="font-size:11px;color:var(--c-text3);">Idle — press Start to begin sniping</span></div></div>
                    <button id="st-sniper-btn" class="st-btn-primary">🎯 Start Sniper</button>
                </div>
                <details class="st-snip-settings" style="margin-bottom:14px;">
                    <summary class="st-snip-summary"><span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);">⚙️ Sniper Filters</span><span class="st-snip-chevron">▼</span></summary>
                    <div class="st-snip-settings-body">
                        <div style="display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap;margin-bottom:16px;">
                            <div class="st-toggle-row"><span class="st-snip-label">R$ Min</span><input id="st-snip-min-robux" class="st-snip-input" type="number" min="0" placeholder="no limit"></div>
                            <div class="st-toggle-row"><span class="st-snip-label">R$ Max</span><input id="st-snip-max-robux" class="st-snip-input" type="number" min="0" placeholder="no limit"></div>
                            <div style="width:1px;height:44px;background:var(--c-border2);align-self:center;"></div>
                            <div class="st-toggle-row"><span class="st-snip-label">T$ Min</span><input id="st-snip-min-tix" class="st-snip-input" type="number" min="0" placeholder="no limit"></div>
                            <div class="st-toggle-row"><span class="st-snip-label">T$ Max</span><input id="st-snip-max-tix" class="st-snip-input" type="number" min="0" placeholder="no limit"></div>
                            <div style="width:1px;height:44px;background:var(--c-border2);align-self:center;"></div>
                            <div class="st-toggle-row"><span class="st-snip-label">Limiteds Only</span><div id="st-snip-limiteds" class="st-toggle-track"><div class="st-toggle-thumb"></div></div></div>
                            <div class="st-toggle-row"><span class="st-snip-label">R$ Only</span><div id="st-snip-robux-only" class="st-toggle-track"><div class="st-toggle-thumb"></div></div></div>
                            <div class="st-toggle-row"><span class="st-snip-label">T$ Only</span><div id="st-snip-tix-only" class="st-toggle-track"><div class="st-toggle-thumb"></div></div></div>
                        </div>
                        <div style="height:1px;background:var(--c-border2);margin-bottom:14px;"></div>
                        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:10px;">Watch Existing Items (Update Sniper)</div>
                        <div style="display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap;">
                            <div class="st-toggle-row"><span class="st-snip-label">Price Drop</span><div id="st-upd-pricedrop" class="st-toggle-track"><div class="st-toggle-thumb"></div></div></div>
                            <div class="st-toggle-row"><span class="st-snip-label">Drop % Threshold</span><input id="st-upd-droppct" class="st-snip-input" type="number" min="1" max="99" value="10" style="width:80px;"></div>
                            <div style="width:1px;height:44px;background:var(--c-border2);align-self:center;"></div>
                            <div class="st-toggle-row"><span class="st-snip-label">Resale / On Sale</span><div id="st-upd-resale" class="st-toggle-track"><div class="st-toggle-thumb"></div></div></div>
                            <button id="st-update-sniper-btn" class="st-btn-secondary" style="align-self:flex-end;">📡 Start Update Sniper</button>
                        </div>
                    </div>
                </details>
                <div style="display:flex;align-items:center;gap:16px;padding:18px 24px;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:16px;margin-bottom:14px;">
                    <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#059669,#047857);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🔗</div>
                    <div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:700;color:var(--c-text0);margin-bottom:4px;">Redirect Sniper</div><div style="display:flex;align-items:center;gap:8px;"><div id="st-redirect-dot" class="st-dot st-dot-idle" style="flex-shrink:0;"></div><span id="st-redirect-txt" style="font-size:11px;color:var(--c-text3);">Idle — opens item page on new items</span></div></div>
                    <button id="st-redirect-sniper-btn" class="st-btn-secondary">🔗 Start Redirect</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 400px;gap:28px;align-items:start;">
                    <div style="display:flex;flex-direction:column;gap:13px;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:16px;padding:20px;">
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:13px;">
                            <div class="st-stat"><div class="st-stat-label">Checks</div><div id="st-checks" class="st-stat-val">0</div></div>
                            <div class="st-stat"><div class="st-stat-label">Speed</div><div id="st-cps" class="st-stat-val">—</div></div>
                            <div class="st-stat"><div class="st-stat-label">Avg RTT</div><div id="st-rtt" class="st-stat-val">—</div></div>
                            <div class="st-stat"><div class="st-stat-label">Workers</div><div id="st-conc" class="st-stat-val">—</div></div>
                        </div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:14px;padding:18px 20px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span style="color:var(--c-text4);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.9px;">Network Health</span><span style="font-family:'Fira Code',monospace;font-size:10px;color:var(--c-text4);">0ms → 500ms</span></div>
                            <div style="height:8px;background:var(--c-bg2);border-radius:99px;overflow:hidden;border:1px solid var(--c-border2);"><div id="st-rtt-fill" style="height:100%;border-radius:99px;background:linear-gradient(90deg,var(--c-success),var(--c-warn),var(--c-err));width:0%;transition:width 0.4s ease;"></div></div>
                        </div>
                    </div>
                    <div class="st-log-panel">
                        <div class="st-log-hdr"><span class="st-log-hdr-lbl">Activity Log</span><button id="st-log-clear">Clear</button></div>
                        <div id="st-log"></div>
                    </div>
                </div>
            </div>

            <!-- CATALOG -->
            <div id="st-msec-content-catalog" style="display:none;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><div><div class="st-sec-title">Catalog Browser</div><div class="st-sec-sub">Browse & buy items directly</div></div><button id="st-cat-refresh" class="st-btn-secondary">↻ Refresh</button></div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
                    <input id="st-cat-search" class="st-input" type="text" placeholder="🔍 Search items…" style="flex:1;min-width:160px;">
                    <select id="st-cat-category" style="padding:9px 12px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:10px;color:var(--c-text1);font-size:12px;outline:none;cursor:pointer;"><option value="Featured">Featured</option><option value="Collectibles">Collectibles</option><option value="All">All</option><option value="Clothing">Clothing</option><option value="BodyParts">Body Parts</option><option value="Gear">Gear</option></select>
                    <select id="st-cat-sort" style="padding:9px 12px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:10px;color:var(--c-text1);font-size:12px;outline:none;cursor:pointer;"><option value="0">Relevance</option><option value="100">Most Favorited</option><option value="101">Best Selling</option><option value="3">Recently Updated</option><option value="4">Price: Low→High</option><option value="5">Price: High→Low</option></select>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <div id="st-cat-count"><span style="color:var(--c-text3);font-size:11px;">Loading…</span></div>
                    <div style="display:flex;align-items:center;gap:8px;"><button id="st-cat-prev" class="st-btn-secondary" style="padding:7px 14px;" disabled>◄</button><span id="st-cat-page" style="font-size:11px;color:var(--c-text2);font-family:'Fira Code',monospace;min-width:52px;text-align:center;">Page 1</span><button id="st-cat-next" class="st-btn-secondary" style="padding:7px 14px;" disabled>►</button></div>
                </div>
                <ul id="st-cat-list" style="padding:0;margin:0;display:flex;flex-direction:column;gap:7px;"></ul>
            </div>

            <!-- ACCOUNTS -->
            <div id="st-msec-content-accounts" style="display:none;">
                <div style="display:grid;grid-template-columns:3fr 2fr;gap:20px;">
                    <div style="display:flex;flex-direction:column;gap:14px;">
                        <div class="st-sec-title">Accounts</div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">➕ Add Account</div>
                            <div style="margin-bottom:10px;"><div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">.ROBLOSECURITY Cookie</div><input id="st-add-cookie" class="st-input" type="password" placeholder="Paste cookie value…"></div>
                            <div style="margin-bottom:14px;"><div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">CSRF Token <span style="color:var(--c-text4);">(auto-fetched if blank)</span></div><input id="st-add-csrf" class="st-input" type="text" placeholder="Leave blank to auto-fetch…"></div>
                            <button id="st-add-btn" class="st-btn-primary" style="width:100%;padding:13px;">🔍 Verify & Save Account</button>
                            <div id="st-add-status" style="margin-top:10px;font-size:11px;min-height:16px;text-align:center;color:var(--c-text2);"></div>
                        </div>
                        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);">Saved Accounts</div>
                        <div id="st-settings-acct-list" style="overflow-y:auto;padding-right:4px;"></div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:14px;">
                        <div class="st-sec-title">Daily & Perks</div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">🎁 Daily Chest</div>
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                                <button id="st-daily-btn" class="st-btn-primary" style="padding:10px 20px;font-size:12px;">🎁 Claim Now</button>
                                <div id="st-daily-toggle" style="display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;"><span id="st-daily-toggle-label" style="font-size:11px;font-weight:600;color:var(--c-text3);">Auto OFF</span><div id="st-daily-toggle-track" style="width:44px;height:24px;border-radius:99px;background:var(--c-border);position:relative;transition:background 0.2s;flex-shrink:0;"><div id="st-daily-toggle-thumb" style="width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div></div></div>
                            </div>
                            <div id="st-daily-countdown" style="font-size:11px;color:var(--c-text4);font-family:'Fira Code',monospace;min-height:16px;margin-bottom:8px;"></div>
                            <div id="st-daily-status" style="display:none;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);margin-bottom:8px;word-break:break-word;"></div>
                            <div id="st-daily-results"></div>
                        </div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">🎟️ Promo Code</div>
                            <div style="display:flex;gap:8px;margin-bottom:10px;"><input id="st-promo-input" class="st-input" type="text" placeholder="Enter promo code…" style="flex:1;"><button id="st-promo-btn" class="st-btn-primary" style="padding:10px 18px;font-size:12px;">Redeem</button></div>
                            <div id="st-promo-status" style="display:none;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                        </div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:6px;">👑 Membership</div>
                            <div style="font-size:10px;color:var(--c-text3);margin-bottom:12px;line-height:1.6;">Set membership for selected account(s)</div>
                            <select id="st-membership-type" style="width:100%;padding:10px 12px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:9px;color:var(--c-text1);font-size:12px;outline:none;margin-bottom:10px;cursor:pointer;"><option value="OutrageousBuildersClub">👑 OBC</option><option value="TurboBuildersClub">⚡ TBC</option><option value="BuildersClub">🔨 BC</option><option value="None">🚫 None</option></select>
                            <button id="st-obc-btn" class="st-btn-primary" style="width:100%;padding:11px;font-size:12px;">👑 Set Membership</button>
                            <div id="st-obc-status" style="display:none;margin-top:10px;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                        </div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:4px;">🚀 Batch API Request</div>
                            <div style="font-size:10px;color:var(--c-text3);margin-bottom:12px;line-height:1.6;">Fire any strrev.com API endpoint across all selected accounts at once.</div>
                            <div style="margin-bottom:8px;">
                                <div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">URL <span style="color:var(--c-text4);">(full or path-relative)</span></div>
                                <input id="st-batch-url" class="st-input" type="text" placeholder="e.g. /api/easter-eggs/update?count=55" style="font-family:'Fira Code',monospace;font-size:11px;">
                            </div>
                            <div style="display:flex;gap:8px;margin-bottom:8px;">
                                <div style="flex:1;">
                                    <div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">Method</div>
                                    <select id="st-batch-method" style="width:100%;padding:9px 10px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:9px;color:var(--c-text1);font-size:12px;outline:none;cursor:pointer;">
                                        <option value="GET">GET</option>
                                        <option value="POST" selected>POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="PATCH">PATCH</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                            </div>
                            <div style="margin-bottom:10px;">
                                <div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">Body JSON <span style="color:var(--c-text4);">(optional, for POST/PUT/PATCH)</span></div>
                                <textarea id="st-batch-body" class="st-input" rows="2" placeholder='e.g. {"count":55}' style="resize:vertical;min-height:50px;font-family:&quot;Fira Code&quot;,monospace;font-size:11px;"></textarea>
                            </div>
                            <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;" id="st-batch-presets">
                                <button class="st-btn-secondary" style="font-size:10px;padding:5px 10px;" onclick="document.getElementById('st-batch-url').value='/api/easter-eggs/update?count=55';document.getElementById('st-batch-method').value='POST';document.getElementById('st-batch-body').value='';">🥚 Easter Eggs ×55</button>
                                <button class="st-btn-secondary" style="font-size:10px;padding:5px 10px;" onclick="document.getElementById('st-batch-url').value='/api/daily-case/open';document.getElementById('st-batch-method').value='POST';document.getElementById('st-batch-body').value='{}';">🎁 Daily Case</button>
                            </div>
                            <button id="st-batch-btn" class="st-btn-primary" style="width:100%;padding:11px;font-size:12px;">🚀 Send to All Accounts</button>
                            <div id="st-batch-status" style="display:none;margin-top:10px;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                            <div id="st-batch-results" style="margin-top:8px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PEOPLE -->
            <div id="st-msec-content-people" style="display:none;">
                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:16px;padding:22px;margin-bottom:20px;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">🔍 User Lookup</div>
                    <div style="display:flex;gap:8px;margin-bottom:6px;"><input id="st-lookup-input" class="st-input" type="text" placeholder="Username or User ID…" style="flex:1;"><button id="st-lookup-btn" class="st-btn-primary" style="padding:11px 22px;">🔍 Lookup</button></div>
                    <div id="st-lookup-status" style="font-size:11px;color:var(--c-text4);min-height:16px;margin-bottom:8px;"></div>
                    <div id="st-lookup-result"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <div style="display:flex;flex-direction:column;gap:14px;">
                        <div class="st-sec-title">Friends & Messages</div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">👤 Friend Request</div>
                            <div style="margin-bottom:10px;"><div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">Username or User ID</div><input id="st-friend-input" class="st-input" type="text" placeholder="e.g. Builderman or 156"></div>
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><div style="font-size:11px;color:var(--c-text3);">Repeat:</div><input id="st-friend-count" type="number" min="1" max="50" value="1" style="width:64px;padding:8px 10px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:8px;color:var(--c-accent);font-size:13px;font-weight:700;font-family:'Fira Code',monospace;outline:none;text-align:center;"></div>
                            <button id="st-friend-btn" class="st-btn-primary" style="width:100%;padding:11px;">👤 Send Friend Request</button>
                            <div id="st-friend-status" style="display:none;margin-top:10px;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                        </div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;">
                            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--c-text4);margin-bottom:14px;">✉️ Send Message</div>
                            <div style="margin-bottom:10px;"><div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">Username or User ID</div><input id="st-msg-input" class="st-input" type="text" placeholder="e.g. Builderman or 156"></div>
                            <div style="margin-bottom:10px;"><div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">Subject</div><input id="st-msg-subject" class="st-input" type="text" placeholder="Subject…"></div>
                            <div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--c-text3);margin-bottom:5px;">Body</div><textarea id="st-msg-body" class="st-input" rows="3" placeholder="Write your message…" style="resize:vertical;min-height:70px;"></textarea></div>
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><div style="font-size:11px;color:var(--c-text3);">Send × times:</div><input id="st-msg-count" type="number" min="1" max="100" value="1" style="width:64px;padding:8px 10px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:8px;color:var(--c-accent);font-size:13px;font-weight:700;font-family:'Fira Code',monospace;outline:none;text-align:center;"><div style="font-size:11px;color:var(--c-text3);">Delay (ms):</div><input id="st-msg-delay" type="number" min="0" max="5000" value="200" style="width:72px;padding:8px 10px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:8px;color:var(--c-text1);font-size:12px;font-family:'Fira Code',monospace;outline:none;text-align:center;"></div>
                            <button id="st-msg-btn" class="st-btn-primary" style="width:100%;padding:11px;">✉️ Send Message</button>
                            <div id="st-msg-status" style="display:none;margin-top:10px;padding:10px 12px;border-radius:9px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);word-break:break-word;"></div>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:14px;">
                        <div class="st-sec-title">Trade</div>
                        <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:13px;padding:20px;flex:1;">
                            <div style="display:flex;gap:8px;margin-bottom:12px;"><input id="st-trade-input" class="st-input" type="text" placeholder="Username or User ID…" style="flex:1;"><button id="st-load-btn" class="st-btn-primary" style="padding:11px 20px;">Load</button></div>
                            <div id="st-trade-status" style="display:none;padding:11px 14px;border-radius:10px;border:1px solid var(--c-border2);background:var(--c-bg0);font-size:11px;color:var(--c-text2);margin-bottom:13px;word-break:break-word;"></div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                                <div><div style="font-size:10px;color:var(--c-text4);font-weight:700;text-transform:uppercase;letter-spacing:0.9px;margin-bottom:6px;display:flex;align-items:center;gap:6px;"><div style="width:6px;height:6px;border-radius:50%;background:var(--c-accent);"></div>Your Offer</div><div id="st-my-inv" class="st-inv-box"><div style="padding:12px;text-align:center;color:var(--c-text4);font-size:11px;">Load a user first</div></div></div>
                                <div><div style="font-size:10px;color:var(--c-text4);font-weight:700;text-transform:uppercase;letter-spacing:0.9px;margin-bottom:6px;display:flex;align-items:center;gap:6px;"><div style="width:6px;height:6px;border-radius:50%;background:#3b82f6;"></div>Their Offer</div><div id="st-th-inv" class="st-inv-box"><div style="padding:12px;text-align:center;color:var(--c-text4);font-size:11px;">Load a user first</div></div></div>
                            </div>
                            <div id="st-trade-summary" style="display:none;padding:11px 16px;background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:10px;margin-bottom:12px;text-align:center;font-size:12px;"><span style="color:var(--c-accent);font-weight:700;">You offer: <span id="st-my-count">0</span></span><span style="color:var(--c-text3);margin:0 14px;">↔</span><span style="color:#3b82f6;font-weight:700;">Request: <span id="st-th-count">0</span></span></div>
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><div style="font-size:11px;color:var(--c-text3);">Send × times:</div><input id="st-trade-count" type="number" min="1" max="100" value="1" style="width:64px;padding:8px 10px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:8px;color:var(--c-accent);font-size:13px;font-weight:700;font-family:'Fira Code',monospace;outline:none;text-align:center;"><div style="font-size:11px;color:var(--c-text3);">Delay (ms):</div><input id="st-trade-delay" type="number" min="0" max="5000" value="300" style="width:72px;padding:8px 10px;background:var(--c-bg2);border:1px solid var(--c-border);border-radius:8px;color:var(--c-text1);font-size:12px;font-family:'Fira Code',monospace;outline:none;text-align:center;"></div>
                            <button id="st-send-btn" disabled class="st-btn-primary" style="width:100%;padding:13px;opacity:0.4;pointer-events:none;">🔄 Send Trade Offer</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- API SCANNER -->
            <div id="st-msec-content-scanner" style="display:none;">
                <div style="margin-bottom:20px;"><div class="st-sec-title">API Scanner</div><div class="st-sec-sub">Intercepts all strrev.com API calls made by your browser in real time</div></div>
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                    <button id="st-scan-toggle" class="st-btn-primary" style="padding:12px 28px;">▶ Start Scanning</button>
                    <button id="st-scan-clear" class="st-btn-secondary">🗑 Clear Log</button>
                    <input id="st-scan-filter" class="st-input" type="text" placeholder="Filter by URL…" style="flex:1;">
                    <span id="st-scan-count" style="font-size:11px;color:var(--c-text4);font-family:'Fira Code',monospace;white-space:nowrap;">0 calls</span>
                </div>
                <div id="st-scan-log" style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:14px;padding:16px;min-height:400px;overflow-y:auto;max-height:600px;font-family:'Fira Code',monospace;font-size:10px;"></div>
            </div>

        </div>
    </div>

    <!-- SETTINGS -->
    <div id="st-tab-content-settings">
        <div style="width:100%;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:18px;">
                <div><div class="st-sec-title">Themes</div><div class="st-sec-sub">Pick your visual style. <strong style="color:var(--c-accent);">✦ LIVE</strong> themes have real-time canvas backgrounds.</div></div>
                <div style="background:var(--c-bg0);border:1px solid var(--c-border2);border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:14px;flex-shrink:0;width:280px;">
                    <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--c-accent),var(--c-accent2));display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;box-shadow:0 2px 12px var(--c-accent-glow);">🛒</div>
                    <div style="flex:1;min-width:0;"><div style="color:var(--c-text0);font-size:13px;font-weight:700;margin-bottom:2px;">Strrev Tools</div><div style="color:var(--c-text4);font-size:9px;margin-bottom:6px;">Sniper · Catalog · Trader · More</div><div style="display:flex;align-items:center;justify-content:space-between;"><div style="color:var(--c-text4);font-size:9px;">v16.0 — full rewrite</div><div style="font-size:10px;padding:2px 10px;border-radius:20px;font-weight:700;background:var(--c-accent-glow);border:1px solid var(--c-border);color:var(--c-accent);font-family:'Fira Code',monospace;">v16</div></div></div>
                </div>
            </div>
            <div id="st-theme-grid"></div>
        </div>
    </div>
</div>
    `;

    overlay.appendChild(win);
    document.body.appendChild(overlay);

    // Sniper pill
    const pill = document.createElement('div');
    pill.id = 'st-sniper-pill';
    pill.title = 'Click to open Strrev Tools';
    pill.innerHTML = '<div id="st-pill-dot"></div><span style="font-size:11px;font-weight:700;color:#22c55e;letter-spacing:0.4px;">SNIPER ACTIVE</span><span id="st-pill-checks" style="font-size:10px;color:rgba(34,197,94,0.55);"></span><span style="font-size:10px;color:rgba(255,255,255,0.25);margin-left:3px;">· tap to open</span>';
    document.body.appendChild(pill);

    const openUI = () => {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        pill.classList.remove('visible');
        rebuildAcctSelector();
        if (THEMES[currentTheme]?.anim) startThemeAnim(currentTheme);
    };
    const closeUI = () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        if (sniperActive) pill.classList.add('visible');
    };

    pill.addEventListener('click', openUI);
    document.addEventListener('keydown', e => {
        if (e.key === 'Tab' && !e.target.matches('input,textarea,select')) { e.preventDefault(); overlay.classList.contains('open') ? closeUI() : openUI(); return; }
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeUI();
    });
    document.getElementById('st-close-btn').addEventListener('click', closeUI);

    // Tab wiring
    ['sniper','catalog','accounts','people','scanner'].forEach(s => {
        document.getElementById('st-msec-'+s).addEventListener('click', () => {
            const manage=document.getElementById('st-tab-content-manage'), settings=document.getElementById('st-tab-content-settings');
            if(manage)manage.style.display='contents'; if(settings)settings.style.display='none';
            switchManage(s);
        });
    });
    document.getElementById('st-tab-settings').addEventListener('click', () => switchTab('settings'));

    // Account selector
    document.getElementById('st-acct-sel').addEventListener('change', e => {
        selectedAcctIdx = parseInt(e.target.value);
        try { GM_setValue('st_acct_idx', String(selectedAcctIdx)); } catch(_) {}
        tradeTargetId = null; tradeTargetName = ''; myInventory = []; theirInventory = []; mySelected.clear(); theirSelected.clear();
        updateMiniAcct(); updateTradeSummary();
        log('Account → ' + (selectedAcctIdx===-3?'Selective':selectedAcctIdx===-2?'All Accounts':selectedAcctIdx===-1?'Session':accounts[selectedAcctIdx]?.username||'?'), 'info');
    });

    // Sniper
    document.getElementById('st-sniper-btn').addEventListener('click', toggleSniper);
    document.getElementById('st-update-sniper-btn').addEventListener('click', toggleUpdateSniper);
    document.getElementById('st-redirect-sniper-btn').addEventListener('click', toggleRedirectSniper);
    document.getElementById('st-log-clear').addEventListener('click', () => { const l=document.getElementById('st-log');if(l)l.innerHTML=''; });

    // Sniper filter wiring
    wireSniperFilters();

    // Catalog
    document.getElementById('st-cat-search').addEventListener('keydown', e => { if(e.key==='Enter') renderCatalogList(); });
    document.getElementById('st-cat-category').addEventListener('change', e => { catalogCategory=e.target.value; renderCatalogList(); });
    document.getElementById('st-cat-sort').addEventListener('change', e => { catalogSort=e.target.value; renderCatalogList(); });
    document.getElementById('st-cat-prev').addEventListener('click', () => { if(catalogPageNum<=1)return; catalogCursor=catalogPrevCursor; catalogPageNum--; loadCatalogPage(); });
    document.getElementById('st-cat-next').addEventListener('click', () => { if(!catalogNextCursor)return; catalogCursor=catalogNextCursor; catalogPageNum++; loadCatalogPage(); });
    document.getElementById('st-cat-refresh').addEventListener('click', () => renderCatalogList());

    // Trade
    document.getElementById('st-load-btn').addEventListener('click', loadTradeTarget);
    document.getElementById('st-trade-input').addEventListener('keydown', e => { if(e.key==='Enter') loadTradeTarget(); });
    document.getElementById('st-send-btn').addEventListener('click', sendTradeOffer);

    // People
    document.getElementById('st-lookup-btn').addEventListener('click', lookupUserProfile);
    document.getElementById('st-lookup-input').addEventListener('keydown', e => { if(e.key==='Enter') lookupUserProfile(); });
    document.getElementById('st-friend-btn').addEventListener('click', sendFriendRequests);
    document.getElementById('st-friend-input').addEventListener('keydown', e => { if(e.key==='Enter') sendFriendRequests(); });
    document.getElementById('st-msg-btn').addEventListener('click', sendMessages);
    document.getElementById('st-msg-input').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('st-msg-subject')?.focus(); });

    // Accounts & Daily
    document.getElementById('st-add-btn').addEventListener('click', addAccountFlow);
    document.getElementById('st-daily-btn').addEventListener('click', () => claimDailyChest(false));
    document.getElementById('st-daily-toggle').addEventListener('click', toggleDailyAuto);
    document.getElementById('st-promo-btn').addEventListener('click', redeemPromoCode);
    document.getElementById('st-promo-input').addEventListener('keydown', e => { if(e.key==='Enter') redeemPromoCode(); });
    document.getElementById('st-obc-btn').addEventListener('click', upgradeToOBC);
    document.getElementById('st-batch-btn').addEventListener('click', runBatchApiRequest);
    document.getElementById('st-batch-url').addEventListener('keydown', e => { if (e.key === 'Enter') runBatchApiRequest(); });

    // API Scanner
    wireScannerUI();
}

// ─── Toggle helpers ───────────────────────────────────────────────────────
function getToggle(id) { const el=document.getElementById(id); return el?el.classList.contains('on'):false; }
function setToggle(id, val) { const el=document.getElementById(id); if(!el)return; val?el.classList.add('on'):el.classList.remove('on'); }

function wireSniperFilters() {
    const numFields = { 'st-snip-min-robux':'minPriceRobux','st-snip-max-robux':'maxPriceRobux','st-snip-min-tix':'minPriceTix','st-snip-max-tix':'maxPriceTix' };
    Object.entries(numFields).forEach(([id, key]) => {
        const el=document.getElementById(id); if(!el) return;
        el.addEventListener('change', () => { sniperSettings[key] = el.value.trim()==='' ? '' : (parseInt(el.value)||0); saveSniperSettings(); });
    });
    const toggleFields = { 'st-snip-limiteds':'limitedsOnly','st-snip-robux-only':'robuxOnly','st-snip-tix-only':'tixOnly' };
    Object.entries(toggleFields).forEach(([id, key]) => {
        const el=document.getElementById(id); if(!el) return;
        el.addEventListener('click', () => { el.classList.toggle('on'); sniperSettings[key]=el.classList.contains('on'); saveSniperSettings(); });
    });
    document.getElementById('st-upd-pricedrop')?.addEventListener('click', () => { const el=document.getElementById('st-upd-pricedrop'); el.classList.toggle('on'); updateSniperSettings.priceDropEnabled=el.classList.contains('on'); saveUpdateSniperSettings(); });
    document.getElementById('st-upd-resale')?.addEventListener('click', () => { const el=document.getElementById('st-upd-resale'); el.classList.toggle('on'); updateSniperSettings.resaleEnabled=el.classList.contains('on'); saveUpdateSniperSettings(); });
    document.getElementById('st-upd-droppct')?.addEventListener('change', () => { const v=Math.max(1,Math.min(99,parseInt(document.getElementById('st-upd-droppct').value)||10)); document.getElementById('st-upd-droppct').value=v; updateSniperSettings.priceDropPercent=v; saveUpdateSniperSettings(); });
}

// ─── API Scanner UI ───────────────────────────────────────────────────────
let _scanActive = false;
function wireScannerUI() {
    const toggle = document.getElementById('st-scan-toggle');
    const clearBtn = document.getElementById('st-scan-clear');
    const filterIn = document.getElementById('st-scan-filter');
    const logEl = document.getElementById('st-scan-log');
    const countEl = document.getElementById('st-scan-count');
    let scanLog = [], scanTotal = 0;

    function renderScan() {
        const q = (filterIn?.value||'').toLowerCase();
        const filtered = q ? scanLog.filter(e=>e.url.toLowerCase().includes(q)) : scanLog;
        if (!logEl) return;
        logEl.innerHTML = filtered.length ? '' : '<div style="color:var(--c-text4);padding:8px;">No calls logged yet…</div>';
        filtered.slice(-200).reverse().forEach(e => {
            const row = document.createElement('div');
            row.style.cssText = 'display:grid;grid-template-columns:55px 45px 1fr auto;gap:8px;padding:5px 4px;border-bottom:1px solid var(--c-border2);';
            const mc = {'GET':'var(--c-text4)','POST':'#60a5fa','PATCH':'#fbbf24','DELETE':'#f87171'}[e.method]||'var(--c-text2)';
            row.innerHTML = `<span style="color:${mc};font-weight:700;">${e.method}</span><span style="color:${e.status<300?'var(--c-success)':e.status<400?'var(--c-warn)':'var(--c-err)'};">${e.status||'…'}</span><span style="color:var(--c-text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.url.replace('https://www.strrev.com','')}</span><span style="color:var(--c-text4);white-space:nowrap;">${e.ms!=null?e.ms+'ms':''}</span>`;
            logEl.appendChild(row);
        });
        if(countEl) countEl.textContent = scanTotal + ' calls';
    }

    toggle?.addEventListener('click', () => {
        _scanActive = !_scanActive;
        toggle.textContent = _scanActive ? '⏹ Stop Scanning' : '▶ Start Scanning';
        toggle.style.background = _scanActive ? 'linear-gradient(135deg,#16a34a,#15803d)' : '';
        if (_scanActive) {
            window._stScanCallback = (entry) => {
                scanTotal++;
                scanLog.push(entry);
                if (scanLog.length > 500) scanLog.shift();
                renderScan();
            };
            initApiScanner();
        } else {
            window._stScanCallback = null;
        }
    });
    clearBtn?.addEventListener('click', () => { scanLog=[]; scanTotal=0; renderScan(); });
    filterIn?.addEventListener('input', renderScan);
}

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
    loadAccounts();
    injectStyles();
    buildUI();
    loadSniperSettings();
    loadUpdateSniperSettings();
    loadRedirectSniperSettings();
    resumeAutoAccepts();

    // Restore selected account
    const savedAcct = (() => { try { return parseInt(GM_getValue('st_acct_idx','-1')); } catch(_){ return -1; } })();
    selectedAcctIdx = (savedAcct===-1||savedAcct===-2||savedAcct===-3||(savedAcct>=0&&accounts[savedAcct])) ? savedAcct : -1;

    rebuildAcctSelector();
    updateMiniAcct();

    // Restore theme
    const savedTheme = (() => { try { return GM_getValue('st_theme','void'); } catch(_){ return 'void'; } })();
    if (savedTheme && THEMES[savedTheme]) applyTheme(savedTheme);

    // Restore update sniper
    const wasUpdateActive = (() => { try { return GM_getValue('updateSniperActive',false); } catch(_){ return false; } })();
    if (wasUpdateActive) { log('📡 Update Sniper resuming...','info'); startUpdateSniper(); }

    // Restore redirect sniper
    const wasRedirectActive = (() => { try { return GM_getValue('redirectSniperActive',false); } catch(_){ return false; } })();
    if (wasRedirectActive) { log('🔗 Redirect Sniper resuming...','info'); startRedirectSniper(); }

    // Restore auto-claim
    const savedAutoDaily = (() => { try { return GM_getValue('st_daily_auto',false); } catch(_){ return false; } })();
    if (savedAutoDaily) { log('Auto-claim resuming...','info'); startDailyAuto(); }

    // Restore sniper
    const wasActive = (() => { try { return GM_getValue('sniperActive',false); } catch(_){ return false; } })();
    if (wasActive) {
        try { sniperBlacklist = JSON.parse(GM_getValue('sniperBlacklist','{}') || '{}'); } catch(_) {}
        sniperActive = true;
        updateSniperBtn(true);
        setSniperStatus('Resuming — '+Object.keys(sniperBlacklist).length+' items blacklisted','active');
        log('Sniper resumed from last session','success');
        startDispatch();
    }
}
