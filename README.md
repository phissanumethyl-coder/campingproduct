# CampSet — เว็บจัดชุดอุปกรณ์แคมปิ้งสำหรับพนักงานขาย

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html` | หน้าพนักงานขาย: เลือกรูปแบบชุด → กดชุดสำเร็จรูป หรือลากสินค้าลงช่อง → ได้ราคาขาย ต้นทุน และกำไร |
| `admin.html` | หน้าผู้ดูแล: จัดการสินค้า/รูป, ชุดสำเร็จรูป, รูปแบบชุด (จำนวนช่อง), หมวดหมู่, รหัสเข้าใช้, สำรองข้อมูล |
| `store.js` | ชั้นข้อมูล + รหัสเข้าใช้ (จุดเดียวที่ต้องแก้ตอนต่อ Firebase) |
| `style.css` | สไตล์ที่ใช้ร่วมกัน |

**รหัสทดลอง:** พนักงาน `1234` · ผู้ดูแล `9999` (เปลี่ยนได้ในหน้า ตั้งค่า)

## ขึ้น GitHub Pages
อัปโหลดทั้ง 4 ไฟล์ไว้ใน repo เดียวกัน → Settings → Pages → Deploy from branch (`main` / root)

## ตอนนี้ข้อมูลเก็บที่ไหน
เก็บใน `localStorage` ของเบราว์เซอร์แต่ละเครื่อง ระหว่างที่ยังไม่ได้ต่อ Firebase ใช้ปุ่ม **ส่งออก/นำเข้า JSON** ในหน้า ตั้งค่า เพื่อคัดลอกข้อมูลไปเครื่องพนักงาน

## ต่อ Firebase (ขั้นถัดไป)
แก้แค่ใน `store.js`:
- `load()` → อ่านจาก Firestore (เช่น `doc(db,'campset','main')`)
- `save(data)` → เขียนลง Firestore
- `uploadImage(file)` → อัปโหลดไป Firebase Storage แล้วคืนค่า URL
- เปลี่ยน `CampAuth` เป็น Firebase Authentication และตั้ง Security Rules ให้เฉพาะผู้ดูแลเขียนข้อมูลได้
  (ระบบรหัสตอนนี้เป็นแค่การกันหน้าแบบง่ายในเบราว์เซอร์ ยังไม่ปลอดภัยจริง)

## โครงสร้างข้อมูล
```
settings   { shopName, salesCode, adminCode }
categories [{ id, name, icon: table|chair|other }]
products   [{ id, code, name, size, cat, price, cost, color, image }]
templates  [{ id, name, counts: { [categoryId]: จำนวนช่อง } }]
presets    [{ id, name, badge, templateId, items: [productId,...], setPrice }]
```
