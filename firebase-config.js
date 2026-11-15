/* =========================================================
   ตั้งค่า Firebase ของ CampSet
   1) วางค่า firebaseConfig ที่คัดลอกจาก Firebase console ลงใน config ด้านล่าง
   2) ใส่อีเมลของบัญชีพนักงานขาย / ผู้ดูแล ที่สร้างไว้ใน Authentication
   ถ้าปล่อย config เป็น null ระบบจะเก็บข้อมูลในเบราว์เซอร์ (localStorage) เหมือนเดิม
   ========================================================= */
window.CAMPSET_FIREBASE = {
  config: {
    apiKey: "AIzaSyA5aEbtfIkGkB0sjnSMjPAHcJdLOxycxKM",
    authDomain: "campset-88af0.firebaseapp.com",
    projectId: "campset-88af0",
    storageBucket: "campset-88af0.firebasestorage.app",
    messagingSenderId: "415374750229",
    appId: "1:415374750229:web:c76e9646dcdb43d77ed41c"
  },
  /* ตัวอย่าง (ลบ null ด้านบน แล้วแทนด้วยค่าจริงของคุณ):
  config: {
    apiKey: "AIza....",
    authDomain: "campset-xxxx.firebaseapp.com",
    projectId: "campset-xxxx",
    storageBucket: "campset-xxxx.firebasestorage.app",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
  },
  */

  // บัญชีใน Firebase Authentication (รหัสผ่านของบัญชี = รหัสเข้าใช้ ต้องยาว 6 ตัวขึ้นไป)
  salesEmail: 'sales@campset.app',
  adminEmail: 'admin@campset.app'
};
