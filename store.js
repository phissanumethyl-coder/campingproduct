/* =========================================================
   CampSet — ชั้นข้อมูล (Data layer)
   - ถ้าใส่ค่าใน firebase-config.js → ใช้ Firebase (Firestore + Authentication)
   - ถ้ายังไม่ใส่ → เก็บใน localStorage ของเบราว์เซอร์เหมือนเดิม
   โครงสร้างใน Firestore:
     campset/main            { json: "<ข้อมูลทั้งหมด (ไม่มีรูป)>", updatedAt }
     campset_images/{id}     { data: "<รูปแบบ dataURL>" }   ← ใช้แพ็กเกจฟรีได้ ไม่ต้องใช้ Storage
   ========================================================= */
(function () {
  const KEY = 'campset_data_v1';
  const ROLE_KEY = 'campset_role';

  // ---------- ข้อมูลตัวอย่าง ----------
  const SAMPLE = {
    settings: { shopName: 'CampSet', salesCode: '1234', adminCode: '9999' },
    categories: [
      { id: 'table', name: 'โต๊ะ', icon: 'table' },
      { id: 'chair', name: 'เก้าอี้', icon: 'chair' }
    ],
    products: [
      { id: 'p_ta', code: 'T-A', name: 'โต๊ะพับอลูมิเนียม S', size: '60×40 ซม.', cat: 'table', price: 590, cost: 320, color: '#b08860', image: '' },
      { id: 'p_tb', code: 'T-B', name: 'โต๊ะพับอลูมิเนียม M', size: '90×60 ซม.', cat: 'table', price: 890, cost: 480, color: '#9a7350', image: '' },
      { id: 'p_tc', code: 'T-C', name: 'โต๊ะไม้ม้วน', size: '120×60 ซม.', cat: 'table', price: 1490, cost: 820, color: '#8a5a33', image: '' },
      { id: 'p_td', code: 'T-D', name: 'โต๊ะ IGT 4 ยูนิต', size: '130×40 ซม.', cat: 'table', price: 1890, cost: 1050, color: '#4f5b4a', image: '' },
      { id: 'p_te', code: 'T-E', name: 'โต๊ะพับแคมป์ XL', size: '180×70 ซม.', cat: 'table', price: 2490, cost: 1390, color: '#6b4a2b', image: '' },
      { id: 'p_ca', code: 'C-A', name: 'เก้าอี้สนามพับ', size: 'เล็ก · 2.1 กก.', cat: 'chair', price: 390, cost: 190, color: '#3f6b4f', image: '' },
      { id: 'p_cb', code: 'C-B', name: 'เก้าอี้ Moon Chair', size: 'กลาง · 1.4 กก.', cat: 'chair', price: 790, cost: 410, color: '#d9732b', image: '' },
      { id: 'p_cc', code: 'C-C', name: 'เก้าอี้พนักพิงสูง', size: 'ใหญ่ · 1.9 กก.', cat: 'chair', price: 1190, cost: 620, color: '#2f5d6b', image: '' },
      { id: 'p_cd', code: 'C-D', name: 'เก้าอี้ Director', size: 'มีโต๊ะข้าง', cat: 'chair', price: 1490, cost: 790, color: '#7a4b5a', image: '' },
      { id: 'p_ce', code: 'C-E', name: 'เก้าอี้ Relax นอนได้', size: 'ปรับ 3 ระดับ', cat: 'chair', price: 1890, cost: 1020, color: '#5b5a2f', image: '' }
    ],
    // รูปแบบชุด = จำนวนช่องของแต่ละหมวด
    templates: [
      { id: 't2', name: 'ชุดคู่', counts: { table: 1, chair: 2 } },
      { id: 't4', name: 'ชุด 4 ที่นั่ง', counts: { table: 1, chair: 4 } },
      { id: 't6', name: 'ชุด 6 ที่นั่ง', counts: { table: 1, chair: 6 } },
      { id: 't8', name: 'ชุดกลุ่มใหญ่', counts: { table: 2, chair: 8 } }
    ],
    // ชุดสำเร็จรูป: items = รหัส id สินค้าทีละชิ้น, setPrice = ราคาเซ็ต (0 = ใช้ราคารวม)
    presets: [
      { id: 's2a', name: 'ชุดคู่ชิล', badge: 'ขายดี', templateId: 't2', items: ['p_ta', 'p_cb', 'p_cb'], setPrice: 1990 },
      { id: 's2b', name: 'ชุดคู่พรีเมียม', badge: '', templateId: 't2', items: ['p_tb', 'p_cd', 'p_cd'], setPrice: 3590 },
      { id: 's4a', name: 'Set A · เริ่มต้นคุ้มค่า', badge: 'ขายดี', templateId: 't4', items: ['p_tb', 'p_ca', 'p_ca', 'p_ca', 'p_ca'], setPrice: 2290 },
      { id: 's4b', name: 'Set B · ครอบครัวสบาย', badge: 'แนะนำ', templateId: 't4', items: ['p_tc', 'p_cb', 'p_cb', 'p_cc', 'p_cc'], setPrice: 4990 },
      { id: 's4c', name: 'Set C · พรีเมียม', badge: '', templateId: 't4', items: ['p_td', 'p_cd', 'p_cd', 'p_cd', 'p_cd'], setPrice: 7290 },
      { id: 's6a', name: 'ชุดปาร์ตี้ 6 คน', badge: 'ขายดี', templateId: 't6', items: ['p_te', 'p_cb', 'p_cb', 'p_cb', 'p_cb', 'p_cb', 'p_cb'], setPrice: 6590 },
      { id: 's8a', name: 'ชุดกลุ่มใหญ่ 8 คน', badge: '', templateId: 't8', items: ['p_te', 'p_te', 'p_ca', 'p_ca', 'p_ca', 'p_ca', 'p_cb', 'p_cb', 'p_cb', 'p_cb'], setPrice: 8900 }
    ]
  };

  const clone = o => JSON.parse(JSON.stringify(o));

  // ---------- Firebase ----------
  const FBC = window.CAMPSET_FIREBASE || {};
  const USE_FB = !!(FBC.config && FBC.config.apiKey && FBC.config.projectId);
  const SDK = FBC.sdkBase || 'https://www.gstatic.com/firebasejs/12.15.0';
  const ADMIN_EMAIL = (FBC.adminEmail || '').trim().toLowerCase();
  const SALES_EMAIL = (FBC.salesEmail || '').trim().toLowerCase();
  let fbp = null;
  function fb() {
    if (!fbp) fbp = (async () => {
      const [A, F, U] = await Promise.all([
        import(SDK + '/firebase-app.js'), import(SDK + '/firebase-firestore.js'), import(SDK + '/firebase-auth.js')
      ]);
      const app = A.initializeApp(FBC.config);
      const db = F.getFirestore(app);
      const auth = U.getAuth(app);
      return { F, U, db, auth, main: F.doc(db, 'campset', 'main') };
    })();
    return fbp;
  }

  const imgCache = new Map();   // id -> dataURL
  let imgCacheFull = false;
  let lastJson = null;

  // ช่องที่เก็บรูปในข้อมูล
  function imageSlots(d) {
    const out = [];
    (d.products || []).forEach(p => { out.push([p, 'image'], [p, 'sceneImage']); });
    if (d.settings) out.push([d.settings, 'boardBg']);
    return out;
  }
  function hash(str) { // cyrb53
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
  }
  async function resolveImages(d) {
    const { F, db } = await fb();
    if (!imgCacheFull) {
      const snap = await F.getDocs(F.collection(db, 'campset_images'));
      snap.forEach(x => imgCache.set(x.id, x.data().data));
      imgCacheFull = true;
    }
    for (const [o, k] of imageSlots(d)) {
      const v = o[k];
      if (typeof v !== 'string' || !v.startsWith('img:')) continue;
      const id = v.slice(4);
      if (!imgCache.has(id)) {
        const x = await F.getDoc(F.doc(db, 'campset_images', id));
        imgCache.set(id, x.exists() ? x.data().data : '');
      }
      o[k] = imgCache.get(id) || '';
    }
    return d;
  }
  function readLocal() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function rememberShop(d) { try { localStorage.setItem('campset_shopname', d.settings?.shopName || 'CampSet'); } catch {} }

  // ---------- Store ----------
  const CampStore = {
    mode: USE_FB ? 'firebase' : 'local',
    async load() {
      if (!USE_FB) return readLocal() || clone(SAMPLE);
      const { F, main } = await fb();
      const snap = await F.getDoc(main);
      if (!snap.exists()) return readLocal() || clone(SAMPLE); // ยังไม่เคยบันทึกขึ้น Firebase
      lastJson = snap.data().json;
      const d = await resolveImages(JSON.parse(lastJson));
      rememberShop(d);
      return d;
    },
    async save(data) {
      if (!USE_FB) { localStorage.setItem(KEY, JSON.stringify(data)); return; }
      const { F, db, main } = await fb();
      if (!imgCacheFull) await resolveImages({}); // โหลดรายการรูปเดิมเพื่อใช้ลบรูปที่ไม่ใช้แล้ว
      const copy = clone(data);
      if (copy.settings) { delete copy.settings.salesCode; delete copy.settings.adminCode; } // รหัสอยู่ใน Firebase Auth แทน
      const used = new Set(), writes = [];
      for (const [o, k] of imageSlots(copy)) {
        const v = o[k];
        if (typeof v !== 'string' || !v.startsWith('data:')) continue;
        const id = 'i' + hash(v);
        used.add(id);
        if (!imgCache.has(id)) { writes.push(F.setDoc(F.doc(db, 'campset_images', id), { data: v }).then(() => imgCache.set(id, v))); }
        o[k] = 'img:' + id;
      }
      await Promise.all(writes);
      lastJson = JSON.stringify(copy);
      await F.setDoc(main, { json: lastJson, updatedAt: F.serverTimestamp() });
      rememberShop(copy);
      const unused = [...imgCache.keys()].filter(id => !used.has(id));
      await Promise.all(unused.map(id => F.deleteDoc(F.doc(db, 'campset_images', id)).then(() => imgCache.delete(id)).catch(() => {})));
    },
    // เรียก cb(ข้อมูลใหม่) เมื่อมีการแก้ข้อมูลจากเครื่องอื่น/แท็บอื่น
    onChange(cb) {
      if (!USE_FB) {
        window.addEventListener('storage', e => { if (e.key === KEY) CampStore.load().then(cb); });
        return;
      }
      fb().then(({ F, main }) => F.onSnapshot(main, async snap => {
        if (!snap.exists() || snap.metadata.hasPendingWrites) return;
        const json = snap.data().json;
        if (json === lastJson) return;
        lastJson = json;
        cb(await resolveImages(JSON.parse(json)));
      }, err => console.warn('onSnapshot', err)));
    },
    async uploadImage(file, opts = {}) {
      // ย่อรูปแล้วเก็บเป็น dataURL — ตอนบันทึก (Firebase) จะแยกไปเก็บใน campset_images ให้อัตโนมัติ
      // opts.png = true → PNG พื้นใส (รูปสำหรับมุมมองฉาก), opts.max = ด้านยาวสุด (px)
      return resizeImage(file, opts.max || 480, !!opts.png);
    },
    readLocal,
    async reset() { if (!USE_FB) localStorage.removeItem(KEY); return clone(SAMPLE); },
    sample() { return clone(SAMPLE); }
  };

  function resizeImage(file, max, png) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const ctx = c.getContext('2d');
        if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let out, q = max > 1000 ? 0.8 : 0.82;
        if (png) out = c.toDataURL('image/png');
        else { out = c.toDataURL('image/jpeg', q); while (out.length > 900000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); } }
        if (out.length > 1000000) return rej(new Error('รูปใหญ่เกินไป กรุณาใช้รูปที่เล็กลง'));
        res(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('อ่านไฟล์รูปไม่ได้')); };
      img.src = url;
    });
  }

  // ---------- UI helpers ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(Number(n) || 0).toLocaleString('th-TH');
  const uid = p => p + '_' + Math.random().toString(36).slice(2, 8);

  // ไอคอน SVG: kind = table | chair | other, mode = 'fill' | 'ghost'
  function icon(kind, color, mode) {
    const c = color || '#7a6a55';
    const g = mode === 'ghost';
    const F = g ? 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5 4"' : `fill="${c}"`;
    const L = g ? 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"'
                : `fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" opacity=".85"`;
    let b;
    if (kind === 'table') {
      b = `<rect x="12" y="26" width="96" height="13" rx="4" ${F}/><path d="M26 39 L19 76 M94 39 L101 76 M42 39 L47 76 M78 39 L73 76" ${L}/>`;
    } else if (kind === 'chair') {
      b = `<rect x="38" y="10" width="44" height="34" rx="6" ${F} ${g ? '' : 'opacity=".75"'}/><rect x="31" y="42" width="58" height="13" rx="5" ${F}/><path d="M40 55 L80 80 M80 55 L40 80 M29 36 L29 55 M91 36 L91 55" ${L}/>`;
    } else {
      b = `<path d="M60 12 L104 76 H16 Z" ${F} ${g ? '' : 'opacity=".85"'}/><path d="M50 76 L60 50 L70 76" ${g ? L : 'fill="#fff" opacity=".7"'}/>`;
    }
    return `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">${b}</svg>`;
  }

  function placeholder(kind, color) {
    const svg = `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#f6efe2"/>${icon(kind, color, 'fill').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // ไอคอนพื้นใส (ใช้ในมุมมองฉากเมื่อสินค้ายังไม่มีรูปตัดพื้นหลัง)
  function iconUri(kind, color) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon(kind, color, 'fill'));
  }

  // ฉากตัวอย่าง (ภูเขา + ป่าสน + ลานหญ้า) ใช้เมื่อยังไม่ได้ตั้งรูปพื้นหลังเอง
  const DEFAULT_SCENE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc7e0"/><stop offset="1" stop-color="#f4e3c4"/></linearGradient>
    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f9f5a"/><stop offset="1" stop-color="#4f7a3c"/></linearGradient>
    <radialGradient id="sun" cx=".78" cy=".12" r=".25"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient></defs>
    <rect width="1200" height="700" fill="url(#sky)"/><rect width="1200" height="700" fill="url(#sun)"/>
    <path d="M0 190 L140 90 L250 160 L380 60 L520 170 L640 100 L780 180 L900 80 L1040 170 L1200 110 V260 H0Z" fill="#8aa6b8" opacity=".75"/>
    <path d="M0 220 L120 150 L260 210 L420 130 L560 215 L720 150 L880 220 L1020 140 L1200 200 V280 H0Z" fill="#6f8f8a"/>
    <g fill="#2f5a3f">${Array.from({ length: 34 }, (_, i) => { const x = i * 37 - 10, h = 60 + (i * 53 % 50); return `<path d="M${x} 270 L${x + 18} ${270 - h} L${x + 36} 270Z"/>`; }).join('')}</g>
    <g fill="#24472f">${Array.from({ length: 26 }, (_, i) => { const x = i * 48 + 8, h = 80 + (i * 37 % 60); return `<path d="M${x} 285 L${x + 24} ${285 - h} L${x + 48} 285Z"/>`; }).join('')}</g>
    <rect y="270" width="1200" height="430" fill="url(#gr)"/>
    <g fill="#6a8f4a" opacity=".5">${Array.from({ length: 60 }, (_, i) => `<ellipse cx="${(i * 97) % 1200}" cy="${300 + (i * 61) % 390}" rx="${18 + i % 5 * 6}" ry="4"/>`).join('')}</g>
  </svg>`);

  function img(p, data) {
    if (!p) return '';
    if (p.image) return p.image;
    const cat = (data.categories || []).find(c => c.id === p.cat);
    return placeholder(cat ? cat.icon : 'other', p.color);
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // ---------- รหัสเข้าใช้ ----------
  // โหมด Firebase: ใช้ Firebase Authentication (บัญชีพนักงาน 1 บัญชี + ผู้ดูแล 1 บัญชี) รหัสเข้าใช้ = รหัสผ่านของบัญชีนั้น
  // โหมดเครื่องนี้: เทียบกับรหัสใน settings (กันหน้าแบบง่าย)
  const roleOf = email => { const e = (email || '').toLowerCase(); return e === ADMIN_EMAIL ? 'admin' : e === SALES_EMAIL ? 'sales' : null; };
  const CampAuth = {
    async require(role, onPass) {
      const show = () => { const a = document.getElementById('app'); if (a) a.hidden = false; };
      let check, shopName, hint = '';
      if (USE_FB) {
        let F;
        try { F = await fb(); } catch (e) { return fatal('โหลด Firebase ไม่สำเร็จ — ตรวจอินเทอร์เน็ต หรือค่าใน firebase-config.js', e); }
        const { U, auth } = F;
        const user = await new Promise(r => { const un = U.onAuthStateChanged(auth, u => { un(); r(u); }); });
        const r0 = user && roleOf(user.email);
        if (r0 === 'admin' || r0 === role) { show(); return onPass(); }
        if (user) await U.signOut(auth);
        shopName = localStorage.getItem('campset_shopname') || 'CampSet';
        check = async code => {
          const tries = role === 'admin' ? [ADMIN_EMAIL] : [SALES_EMAIL, ADMIN_EMAIL];
          for (const email of tries) {
            try { await U.signInWithEmailAndPassword(auth, email, code); return roleOf(email); }
            catch (e) {
              if (e.code === 'auth/network-request-failed') throw new Error('เชื่อมต่ออินเทอร์เน็ตไม่ได้');
              if (e.code === 'auth/too-many-requests') throw new Error('ลองผิดหลายครั้งเกินไป กรุณารอสักครู่');
            }
          }
          return null;
        };
      } else {
        const cur = sessionStorage.getItem(ROLE_KEY);
        if (cur === 'admin' || cur === role) { show(); return onPass(); }
        const d = await CampStore.load();
        shopName = d.settings.shopName;
        if (d.settings.salesCode === '1234' && d.settings.adminCode === '9999') hint = '<small class="gate-hint">รหัสทดลอง — พนักงาน 1234 · ผู้ดูแล 9999</small>';
        check = async v => v === d.settings.adminCode ? 'admin' : (role === 'sales' && v === d.settings.salesCode) ? 'sales' : null;
      }
      const g = document.createElement('div');
      g.className = 'gate';
      g.innerHTML = `<form class="gate-card">
          <div class="gate-logo">⛺</div>
          <h1>${esc(shopName)}</h1>
          <p>${role === 'admin' ? 'เข้าสู่ระบบผู้ดูแล' : 'เข้าสู่ระบบพนักงานขาย'}</p>
          <input type="password" autocomplete="current-password" placeholder="ใส่รหัสเข้าใช้" required>
          <button class="btn primary block">เข้าใช้งาน</button>
          <div class="gate-err"></div>
          ${hint}
          ${role === 'admin' ? '<a class="gate-link" href="index.html">← กลับหน้าพนักงานขาย</a>' : ''}
        </form>`;
      document.body.appendChild(g);
      const form = g.querySelector('form'), input = g.querySelector('input'), err = g.querySelector('.gate-err'), btn = g.querySelector('button');
      input.focus();
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const v = input.value.trim();
        btn.disabled = true; err.textContent = '';
        let r = null;
        try { r = await check(v); } catch (ex) { err.textContent = ex.message; btn.disabled = false; return; }
        btn.disabled = false;
        if (!r) {
          err.textContent = 'รหัสไม่ถูกต้อง';
          form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
          input.select(); return;
        }
        sessionStorage.setItem(ROLE_KEY, r);
        g.remove(); show(); onPass();
      });
      function fatal(msg, e) {
        console.error(e);
        const x = document.createElement('div'); x.className = 'gate';
        x.innerHTML = `<div class="gate-card"><div class="gate-logo">⚠️</div><p>${esc(msg)}</p><button class="btn primary block" onclick="location.reload()">ลองใหม่</button></div>`;
        document.body.appendChild(x);
      }
    },
    async logout() {
      sessionStorage.removeItem(ROLE_KEY);
      if (USE_FB) { try { const { U, auth } = await fb(); await U.signOut(auth); } catch {} }
      location.reload();
    }
  };

  window.CampStore = CampStore;
  window.CampAuth = CampAuth;
  window.CampUI = { esc, fmt, uid, icon, iconUri, img, toast, DEFAULT_SCENE };
})();
