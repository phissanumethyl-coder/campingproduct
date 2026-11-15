# CampSet — เว็บจัดชุดอุปกรณ์แคมปิ้งสำหรับพนักงานขาย

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าพนักงานขาย: เลือกรูปแบบชุด → กดชุดสำเร็จรูป หรือลากสินค้าลงช่อง → ได้ราคาขาย ต้นทุน และกำไร |
| `admin.html` | หน้าผู้ดูแล: จัดการสินค้า/รูป, ชุดสำเร็จรูป, รูปแบบชุด (จำนวนช่อง), หมวดหมู่, รหัสเข้าใช้, สำรองข้อมูล |
| `store.js` | ชั้นข้อมูล + ระบบเข้าใช้ (localStorage หรือ Firebase) |
| `firebase-config.js` | ค่าเชื่อมต่อ Firebase + อีเมลบัญชีพนักงาน/ผู้ดูแล |
| `firestore.rules` | กฎความปลอดภัย Firestore (คัดลอกไปวางใน console) |
| `style.css` | สไตล์ที่ใช้ร่วมกัน |

**รหัสทดลอง (ก่อนต่อ Firebase):** พนักงาน `1234` · ผู้ดูแล `9999`

## ขึ้น GitHub Pages
อัปโหลดไฟล์ทั้งหมดไว้ใน repo เดียวกัน → Settings → Pages → Deploy from branch (`main` / root)

## เก็บข้อมูลที่ไหน
- ถ้า `firebase-config.js` มี `config: null` → เก็บใน localStorage ของเบราว์เซอร์แต่ละเครื่อง
- ถ้าใส่ค่า Firebase แล้ว → เก็บใน Cloud Firestore ซิงก์ทุกเครื่อง และล็อกอินด้วย Firebase Authentication

## เชื่อม Firebase (ใช้แพ็กเกจฟรี Spark ได้)
1. https://console.firebase.google.com → Create project
2. Build → **Firestore Database** → Create database → Production mode → แท็บ Rules วางเนื้อหาจาก `firestore.rules` → Publish
3. Build → **Authentication** → Get started → เปิด Email/Password → แท็บ Users → Add user 2 บัญชี
   - `sales@campset.app` (รหัสผ่าน = รหัสพนักงาน, อย่างน้อย 6 ตัว)
   - `admin@campset.app` (รหัสผ่าน = รหัสผู้ดูแล)
4. Authentication → Settings → **Authorized domains** → Add `phissanumethyl-coder.github.io`
5. Project settings (⚙️) → Your apps → ไอคอน `</>` → Register app → คัดลอก `firebaseConfig`
   ไปวางใน `firebase-config.js` แทน `config: null`
6. อัปโหลดไฟล์ขึ้น GitHub → เข้า admin.html ด้วยรหัสผู้ดูแล → ตั้งค่า → “อัปโหลดข้อมูลจากเบราว์เซอร์นี้ขึ้น Firebase”

ถ้าใช้อีเมลอื่น ให้แก้ทั้งใน `firebase-config.js` และใน `firestore.rules`

โครงสร้างใน Firestore: `campset/main` (ข้อมูลทั้งหมด เป็น JSON) และ `campset_images/{id}` (รูปแต่ละรูป)
— รูปเก็บใน Firestore จึงไม่ต้องใช้ Cloud Storage (ซึ่งต้องใช้แพ็กเกจ Blaze)

## โครงสร้างข้อมูล
```
settings   { shopName, salesCode, adminCode }
categories [{ id, name, icon: table|chair|other }]
products   [{ id, code, name, size, cat, price, cost, color, image }]
templates  [{ id, name, counts: { [categoryId]: จำนวนช่อง } }]
presets    [{ id, name, badge, templateId, items: [productId,...], setPrice }]
```
