/* =========================================================
   CampSet — ชั้นข้อมูล (Data layer)
   ตอนนี้เก็บข้อมูลไว้ใน localStorage ของเบราว์เซอร์
   ถ้าจะต่อ Firebase ให้แก้แค่ฟังก์ชัน load / save / uploadImage ในไฟล์นี้
   (หน้า index.html และ admin.html เรียกผ่าน CampStore เท่านั้น)
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

  // ---------- Store (แก้ส่วนนี้ตอนต่อ Firebase) ----------
  const CampStore = {
    async load() {
      // Firebase: const snap = await getDoc(doc(db,'campset','main')); return snap.data();
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { console.warn(e); }
      return clone(SAMPLE);
    },
    async save(data) {
      // Firebase: await setDoc(doc(db,'campset','main'), data);
      localStorage.setItem(KEY, JSON.stringify(data));
    },
    async uploadImage(file) {
      // Firebase: อัปโหลดไป Storage แล้ว return getDownloadURL(...)
      // ตอนนี้ย่อรูปแล้วเก็บเป็น dataURL (ประหยัดพื้นที่ localStorage)
      return resizeImage(file, 480);
    },
    async reset() { localStorage.removeItem(KEY); return clone(SAMPLE); },
    sample() { return clone(SAMPLE); }
  };

  function resizeImage(file, max) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.82));
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
  // หมายเหตุ: เป็นการกันหน้าแบบง่ายฝั่งเบราว์เซอร์ ตอนต่อ Firebase ควรเปลี่ยนเป็น Firebase Auth + Security Rules
  const CampAuth = {
    async require(role, onPass) {
      const show = () => { const a = document.getElementById('app'); if (a) a.hidden = false; };
      const cur = sessionStorage.getItem(ROLE_KEY);
      if (cur === 'admin' || cur === role) { show(); return onPass(); }
      const d = await CampStore.load();
      const isDefault = d.settings.salesCode === '1234' && d.settings.adminCode === '9999';
      const g = document.createElement('div');
      g.className = 'gate';
      g.innerHTML = `<form class="gate-card">
          <div class="gate-logo">⛺</div>
          <h1>${esc(d.settings.shopName)}</h1>
          <p>${role === 'admin' ? 'เข้าสู่ระบบผู้ดูแล' : 'เข้าสู่ระบบพนักงานขาย'}</p>
          <input type="password" inputmode="numeric" autocomplete="off" placeholder="ใส่รหัสเข้าใช้" required>
          <button class="btn primary block">เข้าใช้งาน</button>
          <div class="gate-err"></div>
          ${isDefault ? '<small class="gate-hint">รหัสทดลอง — พนักงาน 1234 · ผู้ดูแล 9999</small>' : ''}
          ${role === 'admin' ? '<a class="gate-link" href="index.html">← กลับหน้าพนักงานขาย</a>' : ''}
        </form>`;
      document.body.appendChild(g);
      const form = g.querySelector('form'), input = g.querySelector('input'), err = g.querySelector('.gate-err');
      input.focus();
      form.addEventListener('submit', e => {
        e.preventDefault();
        const v = input.value.trim();
        let r = null;
        if (v === d.settings.adminCode) r = 'admin';
        else if (role === 'sales' && v === d.settings.salesCode) r = 'sales';
        if (!r) {
          err.textContent = 'รหัสไม่ถูกต้อง';
          form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
          input.select(); return;
        }
        sessionStorage.setItem(ROLE_KEY, r);
        g.remove(); show(); onPass();
      });
    },
    logout() { sessionStorage.removeItem(ROLE_KEY); location.reload(); }
  };

  window.CampStore = CampStore;
  window.CampAuth = CampAuth;
  window.CampUI = { esc, fmt, uid, icon, img, toast };
})();
