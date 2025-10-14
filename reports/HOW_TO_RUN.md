# 🚀 دليل التشغيل - How to Run

> دليل مفصل خطوة بخطوة لتشغيل لوحة التحكم

---

## 📋 المتطلبات الأساسية

### البرامج المطلوبة
- ✅ Node.js >= 20.0.0
- ✅ npm >= 10.0.0
- ✅ Git (اختياري)

### التحقق من الإصدارات
```bash
node --version   # يجب أن يكون >= 20
npm --version    # يجب أن يكون >= 10
```

---

## 🎯 خطوات التشغيل السريع

### الخطوة 1: تشغيل Backend (إن لم يكن قيد التشغيل)

```bash
# انتقل لمجلد Backend
cd backend

# تثبيت المكتبات (إن لم يتم)
npm install

# تشغيل Backend
npm run start:dev

# Backend سيعمل على: http://localhost:3000
```

### الخطوة 2: تشغيل Frontend

```bash
# انتقل لمجلد Frontend
cd frontend

# تشغيل Frontend (المكتبات مثبتة مسبقاً)
npm run dev

# Frontend سيعمل على: http://localhost:3001
```

### الخطوة 3: افتح المتصفح

افتح: **http://localhost:3001**

---

## 🔐 تسجيل الدخول

### السيناريو 1: مستخدم admin موجود

1. افتح `http://localhost:3001`
2. سيتم تحويلك تلقائياً لـ `/login`
3. أدخل رقم هاتف admin موجود
4. اضغط "إرسال رمز التحقق"
5. **سيظهر رمز التطوير في Alert** (مثلاً: 123456)
6. أدخل الرمز في حقل "رمز التحقق"
7. اضغط "تسجيل الدخول"
8. ستنتقل لـ `/dashboard` ✅

### السيناريو 2: إنشاء مستخدم admin جديد

#### من Backend:
```bash
# افتح MongoDB
mongosh

# استخدم database
use tagadodo

# إنشاء مستخدم admin
db.users.insertOne({
  phone: "0512345678",
  firstName: "Admin",
  lastName: "User",
  isAdmin: true,
  roles: ["admin"],
  permissions: [],
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})

# ملاحظة: passwordHash اختياري، OTP يعمل بدونه
```

#### أو استخدم API:
سجل دخول كمستخدم عادي أولاً، ثم عدّل في MongoDB:
```javascript
db.users.updateOne(
  { phone: "0512345678" },
  { $set: { isAdmin: true, roles: ["admin"] } }
)
```

---

## 🧪 اختبار المميزات

### 1. اختبار Dashboard
```
1. سجل دخول كـ admin
2. ستظهر صفحة Dashboard
3. يجب أن ترى:
   ✓ 4 بطاقات إحصائيات
   ✓ نسب النمو
   ✓ تصميم responsive
```

### 2. اختبار Users Management
```
1. اضغط "المستخدمون" من Sidebar
2. سترى قائمة المستخدمين
3. جرب:
   ✓ البحث عن مستخدم
   ✓ ترتيب الأعمدة
   ✓ تغيير الصفحة
   ✓ إضافة مستخدم جديد
   ✓ تعديل مستخدم
   ✓ إيقاف/تفعيل مستخدم
   ✓ حذف مستخدم
```

### 3. اختبار الثيمات واللغات
```
1. اضغط أيقونة 🌙/☀️ في Header
   ✓ يجب أن يتبدل الثيم
2. اضغط أيقونة 🌐 في Header
   ✓ يجب أن تتبدل اللغة
   ✓ يجب أن يتبدل الاتجاه (RTL/LTR)
```

### 4. اختبار Sidebar
```
1. اضغط على "الكتالوج"
   ✓ يجب أن تفتح القائمة الفرعية
2. اضغط على أي عنصر
   ✓ يجب أن ينتقل للصفحة (قيد التطوير)
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: Cannot connect to backend
```
❌ Error: Network Error

✅ الحل:
1. تأكد أن Backend يعمل على http://localhost:3000
2. افتح backend/src/main.ts وتحقق من CORS
3. تأكد أن .env في frontend يحتوي على:
   VITE_API_BASE_URL=http://localhost:3000
```

### المشكلة 2: غير مصرح بالدخول
```
❌ "هذا الحساب غير مصرح له بالدخول للوحة التحكم"

✅ الحل:
المستخدم ليس admin. قم بتحديثه في MongoDB:
db.users.updateOne(
  { phone: "05XXXXXXXX" },
  { $set: { isAdmin: true, roles: ["admin"] } }
)
```

### المشكلة 3: Token expired
```
❌ 401 Unauthorized

✅ الحل:
1. سجل خروج
2. سجل دخول مرة أخرى
3. النظام يجدد الـ tokens تلقائياً عادةً
```

### المشكلة 4: RTL لا يعمل
```
❌ الصفحة تظهر LTR

✅ الحل:
1. تأكد من تثبيت stylis-plugin-rtl
2. تأكد أن اللغة العربية مختارة
3. أعد تحميل الصفحة
```

### المشكلة 5: Port مشغول
```
❌ Port 3001 is already in use

✅ الحل:
# غيّر Port في vite.config.ts
server: {
  port: 3002,
}
```

---

## 📝 أوامر مفيدة

### Development
```bash
npm run dev              # تشغيل Dev server
npm run build            # بناء للإنتاج
npm run preview          # معاينة البناء
```

### Code Quality
```bash
npm run lint             # فحص الأكواد
npm run type-check       # فحص TypeScript
npm run format           # تنسيق الأكواد
```

### Debugging
```bash
# عرض تفاصيل البناء
npm run build -- --debug

# تحليل Bundle
npm run build -- --mode analyze
```

---

## 🎨 تخصيص الإعدادات

### تغيير URL الباك إند
```env
# في ملف .env (أو أنشئه من .env.example)
VITE_API_BASE_URL=http://localhost:3000
```

### تغيير اللغة الافتراضية
```env
VITE_DEFAULT_LANGUAGE=ar  # أو en
```

### تغيير الثيم الافتراضي
```env
VITE_DEFAULT_THEME=light  # أو dark
```

### تغيير Port
```typescript
// في vite.config.ts
server: {
  port: 3001,  // غيّره حسب الحاجة
}
```

---

## 📊 اختبار البيانات

### إضافة بيانات تجريبية

```javascript
// في MongoDB
use tagadodo

// إضافة مستخدمين تجريبيين
db.users.insertMany([
  {
    phone: "0512345678",
    firstName: "أحمد",
    lastName: "السعيد",
    isAdmin: true,
    roles: ["admin"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    phone: "0598765432",
    firstName: "محمد",
    lastName: "الأحمد",
    isAdmin: false,
    roles: ["user"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// إضافة capabilities
db.capabilities.insertMany([
  { userId: ObjectId("..."), customer_capable: true },
  { userId: ObjectId("..."), customer_capable: true }
])
```

---

## 🔍 فحص الحالة

### تحقق من Backend
```bash
curl http://localhost:3000/health
# يجب أن يرجع: {"status":"ok"}
```

### تحقق من Frontend
```bash
curl http://localhost:3001
# يجب أن يرجع HTML
```

### تحقق من MongoDB
```bash
mongosh
use tagadodo
db.users.countDocuments()
# يجب أن يرجع عدد المستخدمين
```

---

## 📱 الوصول من الموبايل

### في نفس الشبكة
```bash
# شغّل Frontend مع --host
npm run dev -- --host

# سيظهر:
# ➜ Network: http://192.168.x.x:3001
# استخدم هذا الرابط من الموبايل
```

---

## 🎯 نصائح للتطوير

### 1. استخدم React DevTools
- ثبّت React Developer Tools extension
- افتح DevTools
- تبويب "Components" لفحص المكونات
- تبويب "Profiler" لفحص الأداء

### 2. استخدم React Query DevTools
```typescript
// أضف في App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

### 3. Hot Module Replacement
- الكود يتحدث تلقائياً عند التعديل
- لا حاجة لإعادة تحميل الصفحة

### 4. TypeScript Checking
```bash
# فحص أخطاء TypeScript
npm run type-check

# سيعرض جميع الأخطاء
```

---

## 🎉 الخلاصة

**المشروع جاهز للاستخدام الآن!**

### ما يعمل:
✅ تسجيل دخول OTP  
✅ Dashboard  
✅ Users Management كامل  
✅ RTL/LTR  
✅ Light/Dark themes  
✅ Responsive design  

### الخطوات التالية:
```bash
# 1. شغّل Backend
cd backend && npm run start:dev

# 2. شغّل Frontend
cd frontend && npm run dev

# 3. افتح المتصفح
http://localhost:3001

# 4. استمتع! 🎉
```

---

**🎊 بالتوفيق! 🚀✨**

