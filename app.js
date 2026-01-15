// 登录校验
    function checkToken() {
        const token = document.getElementById('tokenInput').value.trim().toUpperCase();
        if(token === 'ALINDM') {
            document.getElementById('login-overlay').style.opacity = '0';
            document.getElementById('app').classList.add('unlocked');
            document.body.classList.add('unlocked');
                        updateUndoBtn();
setTimeout(() => { document.getElementById('login-overlay').style.display='none'; }, 500);
        } else {
            alert('密钥错误');
        }
    }
    document.getElementById('tokenInput').addEventListener('keypress', function(e) { if(e.key === 'Enter') checkToken(); });

    // === 核心数据 ===
    const myBrand = (window.DB && window.DB.classic && window.DB.classic.myBrand) ? window.DB.classic.myBrand : { name: "意帜", loc: "9意法5182", descs: ["拒绝市场通...撞款！", "独家原创设计，整条街都不撞款！", "调性大码，极简老钱风 推荐", "必拿档口！品质版型都很绝！强推！"] };
    const defaultData = (window.DB && window.DB.classic && Array.isArray(window.DB.classic.defaultData)) ? window.DB.classic.defaultData : [];
    let brands = JSON.parse(localStorage.getItem('xhs_brands')) || [...defaultData];
    const indexMaps = { circle: ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳','㉑','㉒','㉓','㉔'], solid: ['❶','❷','❸','❹','❺','❻','❼','❽','❾','❿','⓫','⓬','⓭','⓮','⓯','⓰','⓱','⓲','⓳','⓴','㉑','㉒','㉓','㉔'] };

    function updateCSSVar(key, val) { 
        document.documentElement.style.setProperty(key, val); 
        // 同步到「知识模版生成」的文字样式（不影响原始两张卡的 CSS 变量）
        if(key === '--list-size'){ document.documentElement.style.setProperty('--k-body-size', val); }
        if(key === '--line-height'){ document.documentElement.style.setProperty('--k-line-height', val); }
        if(key === '--title-size'){ document.documentElement.style.setProperty('--k-title-size', val); }
        // 若当前处于知识模式，则立即重排分页（字号/行距变动会影响分页）
        try{
            if(window.APP_MODE === 'knowledge' && typeof window.generateKnowledgeFromTextarea === 'function'){
                window.generateKnowledgeFromTextarea(true); // true=soft rerender
            }
        }catch(e){}
    }
    // 当前风格标记（用于行距/行高联动）
    let CURRENT_PAPER_STYLE = 'default';

    // 行距/行高控制：
    // - 横线/网格等固定行类模板：调节每行行高（--row-height）
    // - 其他模板：调节段落行距（--text-line-height）
    function updateLineSpacing(v){
        const val = parseInt(v, 10);
        const isGrid = ['lined','draft-grid','yellow-bar','mac-grid','date-lined','dashed','grid-browser'].includes(CURRENT_PAPER_STYLE);
        if(isGrid){
            // 以 150% => 40px 作为基准，做线性缩放
            const rh = Math.round(40 * (val / 150));
            updateCSSVar('--row-height', rh + 'px');
        }else{
            const lh = (val / 100).toFixed(2);
            updateCSSVar('--text-line-height', lh);
        }
    }

    function switchTab(id) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-' + id).classList.add('active');
    }

    function generateNewData() {
        const perPage = Math.floor(Math.random() * 4) + 10;
        const total = perPage * 2;
        const ad = { name: myBrand.name, loc: myBrand.loc, desc: myBrand.descs[Math.floor(Math.random()*myBrand.descs.length)], isMine: true };
        
        let pool = [...brands].sort(() => 0.5 - Math.random());
        while(pool.length < total - 1) { pool = pool.concat([...brands]); }
        let selected = pool.slice(0, total - 1);
        
        const pos = Math.floor(Math.random() * 3);
        selected.splice(pos, 0, ad);
        
        renderList(document.getElementById('list1'), selected.slice(0, perPage), 0);
        renderList(document.getElementById('list2'), selected.slice(perPage), perPage);
        syncTitle();
    }

    function renderList(container, data, offset) {
        const style = document.getElementById('indexStyleSelect').value;
        container.innerHTML = '';
        data.forEach((item, idx) => {
            const i = offset + idx;
            let idxHtml = `${i+1}.`;
            if(style==='circle') idxHtml = indexMaps.circle[i]||(i+1);
            if(style==='solid') idxHtml = indexMaps.solid[i]||(i+1);
            if(style==='pad') idxHtml = (i+1)<10 ? `0${i+1}` : (i+1);
            if(style==='badge') idxHtml = `${i+1}`;
            if(style==='dot') idxHtml = `${i+1}.`;

            const div = document.createElement('div');
            div.className = `list-item ${item.isMine ? 'my-brand' : ''}`;
            div.innerHTML = `<span class="item-index index-style-${style}">${idxHtml}</span><div class="item-info" contenteditable="true"><span class="brand-name">${item.name}📍(${item.loc})</span><span class="item-text" contenteditable="true">${item.desc}</span></div>`;
            container.appendChild(div);
        });
    }

    function syncTitle() {
        const txt = document.getElementById('titleInput').value;
        const br = document.getElementById('breakTitleCheck').checked;
        document.querySelectorAll('.main-title').forEach(el => {
            el.innerHTML = (br && txt.length > 5) ? txt.slice(0, Math.ceil(txt.length/2)) + '<br>' + txt.slice(Math.ceil(txt.length/2)) : txt;
        });
    }

    function setPaperStyle(name, btn) {
        CURRENT_PAPER_STYLE = name;
        document.querySelectorAll('.visual-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.xhs-card').forEach(c => {
            // 只切换 paper-*，不破坏 knowledge-card/is-cont/no-subtitle 等状态类
            [...c.classList].filter(cl=>cl.startsWith('paper-')).forEach(cl=>c.classList.remove(cl));
            c.classList.add(`paper-${name}`);
        });
        
        const wrappers = document.querySelectorAll('.inner-sheet-wrapper');
        wrappers.forEach(w => w.className = (name === 'rounded' || name === 'yellow') ? 'inner-sheet-wrapper inner-sheet' : 'inner-sheet-wrapper');

        const uiClasses = ['paper-yellow-app-footer','paper-texture-footer','paper-grid-browser-footer','paper-gold-footer','paper-bottom-line-footer','header-icons','mac-grid-tools','paper-macos-bar'];
        document.querySelectorAll(uiClasses.map(c=>'.'+c).join(',')).forEach(el => el.style.display = 'none');

        if(name === 'yellow-app') document.querySelectorAll('.paper-yellow-app-footer').forEach(e=>e.style.display='flex');
        if(name === 'texture') document.querySelectorAll('.paper-texture-footer').forEach(e=>e.style.display='flex');
        if(name === 'grid-browser') document.querySelectorAll('.paper-grid-browser-footer').forEach(e=>e.style.display='flex');
        if(name === 'gold') document.querySelectorAll('.paper-gold-footer').forEach(e=>e.style.display='flex');
        if(name === 'bottom-line') document.querySelectorAll('.paper-bottom-line-footer').forEach(e=>e.style.display='block');
        if(name === 'rounded') document.querySelectorAll('.header-icons').forEach(e=>e.style.display='flex');
        if(name === 'macos') document.querySelectorAll('.paper-macos-bar').forEach(e=>e.style.display='block');
        if(name === 'mac-grid') { 
            document.querySelectorAll('.mac-grid-tools').forEach(e=>e.style.display='flex');
            document.querySelectorAll('.paper-macos-bar').forEach(e=>e.style.display='block');
        }

        const isGrid = ['lined','draft-grid','yellow-bar','mac-grid','date-lined','dashed','grid-browser'].includes(name);
        const slider = document.getElementById('gapSlider');
        const gapInfo = document.getElementById('gapInfo');
        
        gapInfo.style.display = 'block';
        // 切风格时：网格/横线类默认 150%（40px 行高），其他类默认 150%（1.5 行距）
        slider.value = 150;
        updateLineSpacing(150);
        // 字号：网格类默认稍大一点
        updateCSSVar('--list-size', isGrid ? '16px' : '14px');
    }

    const themes = [
        // 0 奶油
        {bg:'#FDFBF7', t1:'#2C2C2C', t2:'rgba(44,44,44,0.72)', a:'#D4C4B7', h:'#E65A5A', l:'#d1d1d1', body:'#f4f6f8', pb1: null, pb2: null, pg1: null, pg2: null},
        // 1 冷灰
        {bg:'#F0F4F8', t1:'#1F2933', t2:'rgba(31,41,51,0.72)', a:'#BFC7D1', h:'#E65A5A', l:'#cbd5e1', body:'#eef2f6', pb1: null, pb2: null, pg1: null, pg2: null},
        // 2 浅绿
        {bg:'#F1F5EB', t1:'#233024', t2:'rgba(35,48,36,0.70)', a:'#BFD2C1', h:'#E65A5A', l:'#cfd8c8', body:'#edf2ea', pb1: null, pb2: null, pg1: null, pg2: null},
        // 3 粉杏
        {bg:'#F6F0F8', t1:'#2A2230', t2:'rgba(42,34,48,0.70)', a:'#D9C1D6', h:'#E65A5A', l:'#d8cfe0', body:'#f3edf6', pb1: null, pb2: null, pg1: null, pg2: null},
        // 4 极简白
        {bg:'#FFFFFF', t1:'#111111', t2:'rgba(17,17,17,0.70)', a:'#D7D7D7', h:'#E65A5A', l:'#eeeeee', body:'#f6f6f6', pb1: null, pb2: null, pg1: null, pg2: null},
        // 5 深色
        {bg:'#333333', t1:'#FFFFFF', t2:'rgba(255,255,255,0.78)', a:'#666666', h:'#E65A5A', l:'#555555', body:'#1f1f1f', pb1: null, pb2: null, pg1: null, pg2: null},
        // 6 新增：雾蓝晨光（舒适联动）
        {bg:'#F9FBFD', t1:'#1F2A36', t2:'rgba(31,42,54,0.72)', a:'#7A8FA6', h:'#5B86B3', l:'#D9E2EC', body:'#EEF2F6', pb1: null, pb2: null, pg1: null, pg2: null}
    ];

    // 为旧主题补齐 paper/glow 变量：若未显式提供，则按主题底色与强调色推导
    themes.forEach(t=>{
        if(!t.pb1) t.pb1 = t.bg;
        if(!t.pb2) t.pb2 = t.bg;
        if(!t.pg1) t.pg1 = (t.h && t.h !== '#E65A5A') ? 'color-mix(in srgb, '+t.h+' 18%, transparent)' : 'rgba(230,90,90,0.08)';
        if(!t.pg2) t.pg2 = 'rgba(120,140,255,0.06)';
    });


    function setTheme(i) {
        const t = themes[i];
        updateCSSVar('--bg-color', t.bg);
        updateCSSVar('--text-primary', t.t1);
        updateCSSVar('--text-secondary', t.t2);
        updateCSSVar('--accent-color', t.a);
        updateCSSVar('--line-color', t.l);
        updateCSSVar('--bg-body', t.body);

        // 让导出图层/点缀更顺滑：一些组件依赖 primary-color（不强制改成主题色，避免影响登录/按钮识别）
        // 如果你希望按钮也随主题变化，可启用下一行：
        // updateCSSVar('--primary-color', t.h);
        // paper/glow 联动变量（给纸张模板与高级感点缀使用）
        updateCSSVar('--paper-bg-1', t.pb1);
        updateCSSVar('--paper-bg-2', t.pb2);
        updateCSSVar('--paper-glow-1', t.pg1);
        updateCSSVar('--paper-glow-2', t.pg2);


        document.querySelectorAll('.color-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
    }


    function addSticker(content, color) {
        pushUndo();
        document.querySelectorAll('.xhs-card').forEach(card => {
            const el = document.createElement('div');
            el.className = 'sticker-item';
            el.innerHTML = `<div class="sticker-text" style="color:${color};border-color:${color}">${content}</div>`;
            el.style.left = '50px'; el.style.top = '100px';
            initDrag(el); card.appendChild(el);
        });
    }
    function addLogo(input) {
        pushUndo();
        const reader = new FileReader();
        reader.onload = e => {
            document.querySelectorAll('.xhs-card').forEach(card => {
                const el = document.createElement('div');
                el.className = 'sticker-item';
                el.innerHTML = `<img src="${e.target.result}">`;
                el.style.left = '50px'; el.style.top = '100px';
                initDrag(el); card.appendChild(el);
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
    
    // === 撤销（只记录贴纸层：新增/移动/高级感模式）===
    const __undoStack = [];
    const __UNDO_MAX = 30;

    function snapshotStickers(){
        const cards = document.querySelectorAll('.xhs-card');
        const snap = {};
        cards.forEach(card=>{
            const arr = [];
            card.querySelectorAll('.sticker-item, .sticker-bg').forEach(el=>{
                arr.push(el.outerHTML);
            });
            snap[card.id] = arr;
        });
        return snap;
    }
    function restoreStickers(snap){
        document.querySelectorAll('.xhs-card').forEach(card=>{
            card.querySelectorAll('.sticker-item, .sticker-bg').forEach(el=>el.remove());
            const arr = snap[card.id] || [];
            arr.forEach(htmlStr=>{
                const tpl = document.createElement('template');
                tpl.innerHTML = htmlStr.trim();
                const node = tpl.content.firstChild;
                // 重新绑定拖拽（仅 sticker-item）
                if(node && node.classList && node.classList.contains('sticker-item')){
                    initDrag(node);
                }
                if(node) card.appendChild(node);
            });
        });
        updateUndoBtn();
    }
    function pushUndo(){
        __undoStack.push(snapshotStickers());
        if(__undoStack.length > __UNDO_MAX) __undoStack.shift();
        updateUndoBtn();
    }
    function undoLast(){
        if(!__undoStack.length) return;
        const snap = __undoStack.pop();
        restoreStickers(snap);
    }
    function updateUndoBtn(){
        const btn = document.getElementById('undoBtn');
        if(!btn) return;
        btn.style.opacity = __undoStack.length ? '1' : '0.45';
        btn.style.pointerEvents = __undoStack.length ? 'auto' : 'none';
        btn.title = __undoStack.length ? '' : '暂无可撤销操作';
    }

    // === 背景点缀贴纸（可商用/无素材依赖）===
    function createDecorSticker(type){
        const el = document.createElement('div');
        el.className = 'sticker-bg ' + type;
        el.dataset.stickerType = type;
        el.style.position = 'absolute';
        return el;
    }
    function addDecorSticker(type){
        pushUndo();
        document.querySelectorAll('.xhs-card').forEach(card=>{
            const el = createDecorSticker(type);
            // 默认位置：角落，避免遮挡文字（并保证可见）
            if(type === 'glow'){
                el.style.left = '-50px'; el.style.top = '-40px';
                el.style.width = '200px'; el.style.height = '200px';
                el.style.opacity = '0.72';
            }
            if(type === 'dots'){
                el.style.right = '-45px'; el.style.top = '110px';
                el.style.width = '190px'; el.style.height = '150px';
                el.style.opacity = '0.40';
                el.style.transform = 'rotate(-6deg)';
            }
            if(type === 'tape'){
                el.style.left = '26px'; el.style.bottom = '22px';
                el.style.width = '170px'; el.style.height = '56px';
                el.style.opacity = '0.68';
                el.style.transform = 'rotate(8deg)';
            }
            card.appendChild(el);
        });
    }
    // === 一键高级感模式：自动加 1-2 个点缀（在文字下面）===
    function applyPremiumMode(){
        // 每次点击：清掉旧的高级感点缀 -> 随机生成一套新的（不影响用户手动贴纸 sticker-item）
        pushUndo();
        const presets = [
            // 预设A：左上暖光 + 右侧波点 + 轻胶带（偏常用）
            (card)=>{
                const glow = createDecorSticker('glow');
                glow.style.left = (-70 + Math.random()*30).toFixed(0) + 'px';
                glow.style.top  = (-60 + Math.random()*35).toFixed(0) + 'px';
                const s = 180 + Math.random()*90;
                glow.style.width = s.toFixed(0)+'px';
                glow.style.height = s.toFixed(0)+'px';
                glow.style.opacity = (0.62 + Math.random()*0.18).toFixed(2);

                const dots = createDecorSticker('dots');
                dots.style.right = (-55 + Math.random()*25).toFixed(0) + 'px';
                dots.style.top   = (120 + Math.random()*120).toFixed(0) + 'px';
                dots.style.width = (160 + Math.random()*70).toFixed(0) + 'px';
                dots.style.height= (120 + Math.random()*60).toFixed(0) + 'px';
                dots.style.transform = `rotate(${(-10 + Math.random()*10).toFixed(1)}deg)`;

                card.appendChild(glow);
                card.appendChild(dots);

                if(Math.random() < 0.55){
                    const tape = createDecorSticker('tape');
                    tape.style.left = (18 + Math.random()*40).toFixed(0) + 'px';
                    tape.style.bottom = (18 + Math.random()*24).toFixed(0) + 'px';
                    tape.style.transform = `rotate(${(4 + Math.random()*10).toFixed(1)}deg)`;
                    tape.style.width = (140 + Math.random()*70).toFixed(0) + 'px';
                    card.appendChild(tape);
                }
            },
            // 预设B：两处波点（杂志感） + 小暖光（与“奶油光斑”单贴明显区分）
            (card)=>{
                const dots1 = createDecorSticker('dots');
                dots1.style.left = (-40 + Math.random()*20).toFixed(0) + 'px';
                dots1.style.bottom = (60 + Math.random()*80).toFixed(0) + 'px';
                dots1.style.width = (170 + Math.random()*90).toFixed(0) + 'px';
                dots1.style.height= (110 + Math.random()*60).toFixed(0) + 'px';
                dots1.style.transform = `rotate(${(-16 + Math.random()*14).toFixed(1)}deg)`;
                dots1.style.opacity = '0.42';

                const dots2 = createDecorSticker('dots');
                dots2.style.right = (-60 + Math.random()*30).toFixed(0) + 'px';
                dots2.style.top = (40 + Math.random()*70).toFixed(0) + 'px';
                dots2.style.width = (120 + Math.random()*70).toFixed(0) + 'px';
                dots2.style.height= (90 + Math.random()*50).toFixed(0) + 'px';
                dots2.style.transform = `rotate(${(8 + Math.random()*14).toFixed(1)}deg)`;
                dots2.style.opacity = '0.30';

                const glow = createDecorSticker('glow');
                glow.style.right = (-60 + Math.random()*25).toFixed(0) + 'px';
                glow.style.bottom = (-70 + Math.random()*40).toFixed(0) + 'px';
                const s = 140 + Math.random()*80;
                glow.style.width = s.toFixed(0)+'px';
                glow.style.height = s.toFixed(0)+'px';
                glow.style.opacity = (0.55 + Math.random()*0.12).toFixed(2);
                glow.style.filter = 'blur(18px)';

                card.appendChild(dots1);
                card.appendChild(dots2);
                card.appendChild(glow);

                if(Math.random() < 0.35){
                    const tape = createDecorSticker('tape');
                    tape.style.right = (10 + Math.random()*30).toFixed(0) + 'px';
                    tape.style.top = (18 + Math.random()*24).toFixed(0) + 'px';
                    tape.style.transform = `rotate(${(-10 + Math.random()*12).toFixed(1)}deg)`;
                    tape.style.width = (130 + Math.random()*70).toFixed(0) + 'px';
                    card.appendChild(tape);
                }
            },
            // 预设C：胶带主视觉 + 暖光轻补（更像手帐）
            (card)=>{
                const tape = createDecorSticker('tape');
                tape.style.left = (22 + Math.random()*55).toFixed(0) + 'px';
                tape.style.top = (26 + Math.random()*36).toFixed(0) + 'px';
                tape.style.transform = `rotate(${(-12 + Math.random()*18).toFixed(1)}deg)`;
                tape.style.width = (160 + Math.random()*90).toFixed(0) + 'px';
                tape.style.opacity = '0.72';

                const glow = createDecorSticker('glow');
                glow.style.left = (-80 + Math.random()*35).toFixed(0) + 'px';
                glow.style.bottom = (-80 + Math.random()*45).toFixed(0) + 'px';
                const s = 160 + Math.random()*90;
                glow.style.width = s.toFixed(0)+'px';
                glow.style.height = s.toFixed(0)+'px';
                glow.style.opacity = (0.58 + Math.random()*0.16).toFixed(2);

                card.appendChild(tape);
                card.appendChild(glow);

                if(Math.random() < 0.55){
                    const dots = createDecorSticker('dots');
                    dots.style.right = (-55 + Math.random()*25).toFixed(0) + 'px';
                    dots.style.bottom = (40 + Math.random()*90).toFixed(0) + 'px';
                    dots.style.width = (150 + Math.random()*80).toFixed(0) + 'px';
                    dots.style.height= (110 + Math.random()*60).toFixed(0) + 'px';
                    dots.style.transform = `rotate(${(-8 + Math.random()*16).toFixed(1)}deg)`;
                    card.appendChild(dots);
                }
            }
        ];

        document.querySelectorAll('.xhs-card').forEach(card=>{
            // 清理旧的高级感点缀（只清 sticker-bg，避免影响 sticker-item）
            card.querySelectorAll('.sticker-bg').forEach(el=>el.remove());
            // 随机挑一个预设 + 再随机化参数
            const pick = presets[Math.floor(Math.random()*presets.length)];
            pick(card);
        });
    }


function initDrag(el) {
        let isDown = false, offX, offY;
        el.addEventListener('mousedown', e => {
            pushUndo();
            isDown=true; offX=e.clientX-el.offsetLeft; offY=e.clientY-el.offsetTop; });
        window.addEventListener('mousemove', e => { if(isDown) { el.style.left=(e.clientX-offX)+'px'; el.style.top=(e.clientY-offY)+'px'; }});
        window.addEventListener('mouseup', () => isDown=false);
        el.addEventListener('dblclick', () => el.remove());
    }

    function openDataManager() { document.getElementById('dataManagerModal').style.display='flex'; renderDataMgr(); }
    function closeDataManager() { document.getElementById('dataManagerModal').style.display='none'; generateNewData(); }
    function renderDataMgr() {
        const list = document.getElementById('dataList'); list.innerHTML='';
        brands.forEach((b, i) => {
            list.innerHTML += `<div class="data-row"><span>${b.name}</span><button onclick="delData(${i})">🗑️</button></div>`;
        });
    }
    function delData(i) { brands.splice(i,1); localStorage.setItem('xhs_brands', JSON.stringify(brands)); renderDataMgr(); }
    function resetData() { if(confirm('重置?')) { brands=[...defaultData]; localStorage.setItem('xhs_brands', JSON.stringify(brands)); renderDataMgr(); } }
    function importData() {
        const txt = document.getElementById('importText').value;
        const arr = txt.split('\n').map(l => { const p=l.split(' '); return p.length>1?{name:p[0],loc:p[1],desc:p.slice(2).join(' ')||''}:null }).filter(x=>x);
        if(arr.length) { brands=arr; localStorage.setItem('xhs_brands', JSON.stringify(brands)); alert('导入成功'); generateNewData(); }
    }
    
    function downloadImages() {
        ['card1','card2'].forEach(id => html2canvas(document.getElementById(id), {scale:2}).then(c => {
            const a = document.createElement('a'); a.download = `xhs_${id}.png`; a.href=c.toDataURL(); a.click();
        }));
    }
    function changeBg(inp) {
        const r = new FileReader();
        r.onload = e => document.querySelectorAll('.custom-bg-overlay').forEach(d => { d.style.backgroundImage=`url(${e.target.result})`; d.style.opacity=1; });
        r.readAsDataURL(inp.files[0]);
    }

    window.onload = generateNewData;


/* =========================
   知识模版生成（独立模式）
   不影响原始随机生成逻辑
========================= */
let APP_MODE = 'classic';
let KNOWLEDGE_FONT_SCALE = 100; // 80~120，缩放知识卡文字
let KNOWLEDGE_PAGES = [];

function setAppMode(mode){
  APP_MODE = mode;
  const classic = document.getElementById('classicPreview');
  const knowledge = document.getElementById('knowledgePreview');
  const kp = document.getElementById('knowledgePanel');

  document.getElementById('modeClassicBtn').classList.toggle('btn-primary', mode==='classic');
  document.getElementById('modeClassicBtn').classList.toggle('btn-secondary', mode!=='classic');
  document.getElementById('modeKnowledgeBtn').classList.toggle('btn-primary', mode==='knowledge');
  document.getElementById('modeKnowledgeBtn').classList.toggle('btn-secondary', mode!=='knowledge');

  if(mode==='knowledge'){
    classic.style.setProperty('display','none','important');
    knowledge.style.setProperty('display','grid','important');
    kp.style.display = 'block';
  }else{
    classic.style.setProperty('display','grid','important');
    knowledge.style.setProperty('display','none','important');
    kp.style.display = 'none';
  }
}

function knowledgeSetScale(v){
  KNOWLEDGE_FONT_SCALE = parseInt(v,10);
  const lab = document.getElementById('knowledgeScaleLabel');
  if(lab) lab.textContent = KNOWLEDGE_FONT_SCALE + '%';
  // 若已经生成过，缩放后自动重排分页
  if(KNOWLEDGE_PAGES && KNOWLEDGE_PAGES.length){
    knowledgeRenderPages(KNOWLEDGE_PAGES.sourceParsed);
  }
}

function knowledgeClear(){
  document.getElementById('knowledgeText').value = '';
  KNOWLEDGE_PAGES = [];
  const wrap = document.getElementById('knowledgePreview');
  wrap.innerHTML = '';
  document.getElementById('knowledgePageCount').textContent = '0';
}

function knowledgeFillExample(){
  const t = (window.DB && window.DB.knowledge && typeof window.DB.knowledge.exampleText === 'string') ? window.DB.knowledge.exampleText : '';
  document.getElementById('knowledgeText').value = t;
}

/* 解析：标题/副标题/Step结构 */
function parseKnowledge(raw){
  // 更稳健的解析：支持 Markdown（### 标题、**加粗小标题**）、空行分段、中文序号等
  const srcLines = raw.replace(/\r/g,'').split('\n');

  // 保留空行（用于段落分段），但去掉两端多余空白
  const lines = srcLines.map(s => (s||'').trim());

  // 取第一个非空行作为标题（支持 “标题：” 或 Markdown #/##/###）
  let idx = 0;
  while(idx < lines.length && !lines[idx]) idx++;
  let title = lines[idx] || '';
  if(/^标题[:：]/.test(title)) title = title.replace(/^标题[:：]\s*/,'');
  title = title.replace(/^#{1,6}\s*/,'').trim();
  idx++;

  // subtitle：兼容旧规则（“看完…” / “副标题：…”）
  let subtitle = '';
  while(idx < lines.length && !lines[idx]) idx++;
  if(lines[idx] && (/^看完/.test(lines[idx]) || /^副标题[:：]/.test(lines[idx]))){
    subtitle = lines[idx].replace(/^副标题[:：]\s*/,'').trim();
    idx++;
  }

  // 跳过“正文：”
  while(idx < lines.length && !lines[idx]) idx++;
  if(lines[idx] && /^正文[:：]/.test(lines[idx])) idx++;

  // 将后续内容按“空行”分块（段落块/标题块）
  const blocks = [];
  let cur = [];
  for(let i=idx;i<lines.length;i++){
    const l = lines[i];
    if(!l){
      if(cur.length){ blocks.push(cur); cur=[]; }
      else { blocks.push(['']); } // 连续空行也保留一个占位，避免段落被吞
      continue;
    }
    cur.push(l);
  }
  if(cur.length) blocks.push(cur);

  const isMdHeading = (s)=> /^#{1,6}\s+/.test(s);
  const stripMdHeading = (s)=> s.replace(/^#{1,6}\s+/,'').trim();
  const isBoldHeading = (s)=> /^\*\*.+\*\*$/.test(s) && s.replace(/\*/g,'').trim().length>0;
  const stripBold = (s)=> s.replace(/^\*\*/,'').replace(/\*\*$/,'').trim();

  // “像标题”的行：短、以冒号结尾、或中文序号/数字序号开头
  const looksLikeSectionTitle = (s)=>{
    if(!s) return false;
    if(isMdHeading(s) || isBoldHeading(s)) return true;
    if(s.length<=22 && /[:：]$/.test(s)) return true;
    if(/^(Step\s*\d+|[0-9]+)[\.\、:：]/i.test(s)) return true;
    if(/^([一二三四五六七八九十]+)[\.\、:：]/.test(s)) return true;
    return false;
  };

  const steps = [];
  const leadLines = [];
  let curStep = null;

  const pushLeadBlock = (blk)=>{
    if(blk.length===1 && blk[0]===''){
      if(leadLines.length && leadLines[leadLines.length-1] !== '') leadLines.push('');
      return;
    }
    if(leadLines.length && leadLines[leadLines.length-1] !== '') leadLines.push('');
    leadLines.push(...blk);
  };

  const appendToStep = (blk)=>{
    if(!curStep){
      curStep = { num: steps.length+1, title: '', lines: [] };
      steps.push(curStep);
    }
    if(blk.length===1 && blk[0]===''){
      if(curStep.lines.length && curStep.lines[curStep.lines.length-1] !== '') curStep.lines.push('');
      return;
    }
    if(curStep.lines.length && curStep.lines[curStep.lines.length-1] !== '') curStep.lines.push('');
    curStep.lines.push(...blk);
  };

  for(const blk of blocks){
    if(blk.length===1 && blk[0]===''){
      if(steps.length===0 && !curStep) pushLeadBlock(blk);
      else appendToStep(blk);
      continue;
    }

    const first = blk[0];
    let titleLine = '';
    if(isMdHeading(first)) titleLine = stripMdHeading(first);
    else if(isBoldHeading(first)) titleLine = stripBold(first);
    else if(looksLikeSectionTitle(first)){
      titleLine = normalizeStepTitle(first.replace(/[:：]\s*$/,'').trim());
    }

    if(titleLine){
      curStep = { num: steps.length+1, title: titleLine, lines: [] };
      steps.push(curStep);
      if(blk.length>1) curStep.lines.push(...blk.slice(1));
      continue;
    }

    if(steps.length===0 && !curStep){
      pushLeadBlock(blk);
    }else{
      appendToStep(blk);
    }
  }

  const lead = leadLines.length ? { lines: leadLines } : null;
  return { title, subtitle, lead, steps };
}

function isBulletLine(s){
  return /^[✅✔️⚠️•\-—]/.test(s) || /^[0-9]+[\.、]/.test(s) || /^[①②③④⑤⑥⑦⑧⑨⑩]/.test(s);
}

function buildStepEl(step){
  const wrap = document.createElement('div');
  wrap.className = 'kt-step';

  const head = document.createElement('div');
  head.className = 'kt-step-head';

  const idx = document.createElement('div');
  idx.className = 'kt-step-idx';
  idx.textContent = step.num ? getIndexLabel(step.num) : '';

  const ttl = document.createElement('div');
  ttl.className = 'kt-step-title';
  ttl.textContent = step.title;

  head.appendChild(idx);
  head.appendChild(ttl);

  const body = document.createElement('div');
  body.className = 'kt-step-body';

  // 拆 bullets
  const normal = [];
  const bullets = [];
  step.lines.forEach(l=>{
    if(isBulletLine(l)) bullets.push(l);
    else normal.push(l);
  });

  body.innerHTML = formatInline(normal.join('\n')).replace(/\n/g,'<br>');
wrap.appendChild(head);
  wrap.appendChild(body);

  if(bullets.length){
    const bl = document.createElement('div');
    bl.className = 'kt-bullets';
    bullets.forEach(b=>{
      const row=document.createElement('div');
      row.className='kt-bullet';
      const dot=document.createElement('div');
      dot.className='kt-bullet-dot';
      const tx=document.createElement('div');
      tx.style.flex='1';
      tx.innerHTML = formatInline(b);
      row.appendChild(dot); row.appendChild(tx);
      bl.appendChild(row);
    });
    wrap.appendChild(bl);
  }

  return wrap;
}


function escapeHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
// 支持【重点】这种高亮标记（最小侵入：只在渲染时替换，不影响原始文本）
function formatInline(s){
  const esc = escapeHtml(s);
  return esc.replace(/【([^【】]+)】/g, '<span class="kt-mark">【$1】</span>');
}

/* 序号样式：复用你原本 micro 调整里的 indexType */
function getIndexLabel(n){
  // 读取原页面的序号下拉（如果存在）
  const sel = document.getElementById('indexStyleSelect');
  const type = sel ? sel.value : 'circle';
  if(typeof indexMaps !== 'undefined' && indexMaps[type] && indexMaps[type][n-1]){
    return indexMaps[type][n-1];
  }
  // pad / badge / dot 的兜底
  if(type === 'pad') return n < 10 ? ('0' + n) : String(n);
  if(type === 'badge') return String(n);
  if(type === 'dot') return String(n) + '.';

  // 兜底：数字
  return String(n);
}

/* 创建一张知识卡（复用 xhs-card 样式） */
function normalizeStepTitle(t){
  // 移除 Step 序号前缀（Step 1： / STEP1: / Step 2: ...）
  return (t||'')
    .replace(/^\s*Step\s*\d+\s*[:：]\s*/i, '')
    .replace(/（续\d*）|\(续\d*\)/g, '')
    .trim();
}

function createKnowledgeCard(pageTitle, pageIdx){
  const card = document.createElement('div');
  card.className = 'xhs-card knowledge-card paper-' + (typeof CURRENT_PAPER_STYLE!=='undefined'?CURRENT_PAPER_STYLE:'default');
  card.style.setProperty('--kScale', (KNOWLEDGE_FONT_SCALE/100).toString());

  // 首图与续页都显示标题；续页标题稍小（见 .is-cont 样式），并且不显示页尾“续+数字”
  if(pageIdx>1) card.classList.add('is-cont');

  card.innerHTML = `
    <div class="main-title" contenteditable="true">${pageTitle}</div>
    <div class="divider"></div>
    <div class="kt-content">
      <div class="kt-subtitle" id="ktSubtitle${pageIdx}" contenteditable="true"></div>
      <div class="kt-steps" id="ktSteps${pageIdx}"></div>
    </div>
    <div class="kt-footer"></div>
  `;
  return card;
}


/* 自动分页：按真实溢出检测 */
function knowledgeRenderPages(parsed){
  const wrap = document.getElementById('knowledgePreview');
  wrap.innerHTML = '';
  const pages = [];
  const titleBase = parsed.title || '知识笔记';
  const subtitle = parsed.subtitle || '';

  // 临时测量容器（不可见）
  const measure = document.createElement('div');
  measure.style.position='fixed';
  measure.style.left='-99999px';
  measure.style.top='0';
  measure.style.width='450px';
  measure.style.height='600px';
  measure.style.pointerEvents='none';
  document.body.appendChild(measure);

  let pageIdx = 1;
  let card = createKnowledgeCard(titleBase, pageIdx);
  measure.appendChild(card);

  // subtitle只放第一页
  const setSubtitle = () => {
    const el = card.querySelector('.kt-subtitle');
    if(el) el.textContent = subtitle ? subtitle : '';
    if(subtitle) card.classList.remove('no-subtitle');
  };
  setSubtitle();
  if(!subtitle) card.classList.add('no-subtitle');

  const stepsContainer = card.querySelector('.kt-steps');
  const contentContainer = card.querySelector('.kt-content');

  // 前导段落（如果有）
  if(parsed.lead && parsed.lead.lines && parsed.lead.lines.length){
    const leadStep = { num: 0, title: '', lines: parsed.lead.lines };
    const el = buildStepEl(leadStep);
    stepsContainer.appendChild(el);
  }

  const pushPage = () => {
    // 避免空白页：只有当当前页有实际内容时才收集
    const hasContent = card.querySelector('.kt-steps') && card.querySelector('.kt-steps').children.length > 0;
    if(hasContent){
      pages.push(card.cloneNode(true));
    }
  };

  const newPage = () => {
    measure.innerHTML='';
    pageIdx++;
    card = createKnowledgeCard(titleBase, pageIdx);
    measure.appendChild(card);
    // 续页不显示 subtitle
    card.classList.add('no-subtitle');
    const el = card.querySelector('.kt-subtitle');
    if(el) el.textContent = '';
    return {
      stepsContainer: card.querySelector('.kt-steps'),
      contentContainer: card.querySelector('.kt-content')
    };
  };

  let ctx = { stepsContainer, contentContainer };

  
  function buildStepShell(step, isCont){
    const el = document.createElement('div');
    el.className = 'kt-step';

    const head = document.createElement('div');
    head.className = 'kt-step-head';
    head.textContent = normalizeStepTitle(step.title||'');
    head.contentEditable = true;

    const body = document.createElement('div');
    body.className = 'kt-step-body';
    body.contentEditable = true;

    const right = document.createElement('div');
    right.className = 'kt-step-right';
    right.appendChild(head);
    right.appendChild(body);

    el.appendChild(right);
    return { el, body };
  }

  function buildLineEl(line){
    const s = (line||'').trim();

    // 1) 引用块：以 ">" 开头 或 "引用：" 前缀
    if(/^>/.test(s) || /^引用[:：]/.test(s)){
      const el = document.createElement('div');
      el.className = 'kt-quote';
      const content = s.replace(/^>\s*/,'').replace(/^引用[:：]\s*/,'').trim();
      el.innerHTML = formatInline(content);
      el.contentEditable = true;
      return el;
    }

    // 2) 提示块： "提示：" 或 "TIP:"
    if(/^提示[:：]/.test(s) || /^TIP[:：]/i.test(s)){
      const el = document.createElement('div');
      el.className = 'kt-tip';
      const content = s.replace(/^提示[:：]\s*/,'').replace(/^TIP[:：]\s*/i,'').trim();
      el.innerHTML = formatInline(content);
      el.contentEditable = true;
      return el;
    }

    // 3) 列表行识别（✅ ✔️ ⚠️ • - ①②③ 等）
    const isBullet = /^[✅✔️⚠️•\-—①-⑳]/.test(s);
    if(isBullet){
      const li = document.createElement('div');
      li.className = 'kt-bullet';
      li.innerHTML = formatInline(s);
      li.contentEditable = true;
      return li;
    }

    // 4) 普通段落
    const p = document.createElement('div');
    p.className = 'kt-paragraph';
    p.innerHTML = formatInline(s);
    p.contentEditable = true;
    return p;
  }

  // 逐行分页：同一 Step 过长时允许拆分到下一页，减少空白 & 支持字号缩小后减少页数
  parsed.steps.forEach(step=>{
    // 前导段落（num=0）当成普通段落组
    if(step.num === 0){
      for(const line of step.lines){
        const p = buildLineEl(line);
        ctx.stepsContainer.appendChild(p);
        if(ctx.contentContainer.scrollHeight > ctx.contentContainer.clientHeight){
          ctx.stepsContainer.removeChild(p);
          pushPage();
          ctx = newPage();
          ctx.stepsContainer.appendChild(p);
        }
      }
      return;
    }

    let segIdx = 0;
    let isCont = false;

    while(segIdx < step.lines.length){
      const shell = buildStepShell(step, isCont);
      ctx.stepsContainer.appendChild(shell.el);

      // 尝试逐行塞进当前页
      while(segIdx < step.lines.length){
        const node = buildLineEl(step.lines[segIdx]);
        shell.body.appendChild(node);

        if(ctx.contentContainer.scrollHeight > ctx.contentContainer.clientHeight){
          // 回退这一行
          shell.body.removeChild(node);

          // 如果这一页这个 step 一个内容都没放进去，说明剩余空间太小 -> 直接换页再试
          if(shell.body.childElementCount === 0){
            ctx.stepsContainer.removeChild(shell.el);
          }

          pushPage();
          ctx = newPage();
          isCont = true;
          // 在新页继续塞同一 step 的这一行
          break;
        }else{
          segIdx++;
        }
      }

      // 如果当前 step 已经塞完了，结束
      if(segIdx >= step.lines.length) break;

      // 如果刚好换页导致本轮没有推进 segIdx，需要继续 while
    }
  });

  // 最后一页收集
  pushPage();

  // 输出到真实页面（注意 scale 影响尺寸；为避免被挤压，外层用 inline-block）
  pages.forEach((node)=>{
    const holder = document.createElement('div');
    holder.className='knowledge-page-holder';
    holder.appendChild(node);
    wrap.appendChild(holder);
  });

  document.body.removeChild(measure);

  document.getElementById('knowledgePageCount').textContent = String(pages.length);

  KNOWLEDGE_PAGES = pages;
  KNOWLEDGE_PAGES.sourceParsed = parsed;
}

function knowledgeUpdateScale(){
  const v = Number(document.getElementById('knowledgeScale').value);
  KNOWLEDGE_FONT_SCALE = v;
  document.getElementById('knowledgeScaleLabel').textContent = v + '%';
  const raw = document.getElementById('knowledgeText').value.trim();
  if(raw){
    knowledgeRenderPages(parseKnowledge(raw));
  }
}

function knowledgeGenerate(){
  const raw = document.getElementById('knowledgeText').value.trim();
  if(!raw){
    alert('请先粘贴文案');
    return;
  }
  const parsed = parseKnowledge(raw);
  knowledgeRenderPages(parsed);
  setAppMode('knowledge');
}

async function knowledgeDownload(){
  const wrap = document.getElementById('knowledgePreview');
  const cards = wrap.querySelectorAll('.knowledge-card');
  if(!cards.length){
    alert('请先“一键排版”生成知识卡');
    return;
  }
  const title = (parseKnowledge(document.getElementById('knowledgeText').value).title || '知识笔记').replace(/[\\\/:*?"<>|]/g,'_');

  // 逐张下载
  for(let i=0;i<cards.length;i++){
    const card = cards[i];
    // 暂时还原 scale 到 1，再截图更清晰：用 clone 覆盖
    const clone = card.cloneNode(true);
    /* 字号缩放已在内容内实现，无需处理 transform */
    clone.style.position='fixed';
    clone.style.left='-99999px';
    clone.style.top='0';
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, { scale: 2, backgroundColor: null });
    const link = document.createElement('a');
    link.download = `${title}_第${i+1}张.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    document.body.removeChild(clone);
    await new Promise(r=>setTimeout(r, 180));
  }
}

/* 初始化：默认 classic */
window.addEventListener('DOMContentLoaded', ()=>{
  setAppMode('classic');
  // 同步滑块label
  knowledgeSetScale(document.getElementById('knowledgeScale').value);

  // 标题下方粗横线（知识卡 divider）开关：默认显示；关闭时不改变布局占位
  try{
    const KEY = 'lf_titleDividerOn';
    const toggle = document.getElementById('titleDividerToggle');
    const saved = localStorage.getItem(KEY);
    const isOn = (saved === null) ? true : (saved === '1');

    const apply = (on)=>{
      document.documentElement.classList.toggle('hide-title-divider', !on);
      document.documentElement.style.setProperty('--title-divider-on', on ? '1' : '0');
      try{ localStorage.setItem(KEY, on ? '1' : '0'); }catch(e){}
    };

    if(toggle){
      toggle.checked = isOn;
      apply(isOn);
      toggle.addEventListener('change', ()=> apply(!!toggle.checked));
    }else{
      apply(isOn);
    }
  }catch(e){}
});


// ===== UI helpers (scoped, no business logic changes) =====
function setAlignActive(btn){
  try{
    document.querySelectorAll('#tab-details .align-segmented .align-btn').forEach(b=>b.classList.remove('is-active'));
    if(btn) btn.classList.add('is-active');
  }catch(e){}
}
