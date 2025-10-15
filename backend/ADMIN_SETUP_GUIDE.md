# دليل إعداد الادمن الرئيسي - Tagadodo

## نظرة عامة

تم إنشاء نظام شامل لإنشاء الادمن الرئيسي في النظام. يمكنك استخدام عدة طرق لإنشاء الادمن الرئيسي والوصول إلى لوحة التحكم.

## 🚀 الطرق المتاحة لإنشاء الادمن الرئيسي

### الطريقة 1: استخدام npm scripts (الأسهل)

```bash
# إنشاء الادمن الرئيسي
npm run create-admin

# تحديث كلمة المرور للادمن الموجود
npm run create-admin:update
```

### الطريقة 2: استخدام السكريبتات المباشرة

#### في Windows:
```cmd
# تشغيل ملف batch
create-admin.bat
```

#### في Linux/Mac:
```bash
# تشغيل ملف shell script
./create-admin.sh
```

### الطريقة 3: استخدام السكريبت TypeScript مباشرة

```bash
# إنشاء الادمن الرئيسي
npx ts-node scripts/create-super-admin.ts

# تحديث كلمة المرور
npx ts-node scripts/create-super-admin.ts --update-password
```

### الطريقة 4: استخدام API مباشرة

```bash
# إرسال طلب POST
curl -X POST http://localhost:3000/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "TAGADODO_SUPER_ADMIN_2024"}'
```

## 📋 معلومات تسجيل الدخول

بعد إنشاء الادمن الرئيسي، ستكون معلومات تسجيل الدخول:

| المعلومة | القيمة |
|---------|--------|
| **رقم الهاتف** | `+966500000000` |
| **كلمة المرور** | `Admin123!@#` |
| **الدور** | `SUPER_ADMIN` |
| **الصلاحيات** | جميع الصلاحيات |

## 🔐 طرق تسجيل الدخول

### 1. تسجيل الدخول بـ OTP (الطريقة الافتراضية)

```bash
# خطوة 1: إرسال OTP
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000000",
    "context": "register"
  }'

# خطوة 2: التحقق من OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000000",
    "code": "123456"
  }'
```

### 2. تسجيل الدخول بكلمة المرور (إذا كان النظام يدعم ذلك)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+966500000000",
    "password": "Admin123!@#"
  }'
```

## 🛡️ الأمان والتحذيرات

### ⚠️ تحذيرات مهمة:

1. **غير كلمة المرور فوراً** بعد تسجيل الدخول الأول
2. **حدث رقم الهاتف** برقم حقيقي
3. **احتفظ بمعلومات تسجيل الدخول** في مكان آمن
4. **لا تشارك هذه المعلومات** مع أي شخص
5. **احذف endpoint إنشاء الادمن** بعد الاستخدام الأول

### 🔒 خطوات الأمان المطلوبة:

1. **تغيير كلمة المرور:**
   ```bash
   curl -X POST http://localhost:3000/auth/set-password \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"password": "NEW_STRONG_PASSWORD"}'
   ```

2. **تحديث رقم الهاتف:**
   - استخدم API تحديث المستخدم
   - أو استخدم لوحة التحكم

3. **حذف endpoint إنشاء الادمن:**
   - احذف endpoint `create-super-admin` من `auth.controller.ts`
   - أو أضف حماية إضافية

## 🔧 إعداد متغيرات البيئة

أضف المفتاح السري إلى ملف `.env`:

```env
# مفتاح سري لإنشاء الادمن الرئيسي (غيّر هذا في الإنتاج!)
SUPER_ADMIN_SECRET=TAGADODO_SUPER_ADMIN_2024
```

## 🐛 استكشاف الأخطاء

### خطأ: "الادمن الرئيسي موجود بالفعل"

```bash
# تحديث كلمة المرور للادمن الموجود
npm run create-admin:update
```

### خطأ: "مفتاح سري غير صحيح"

تأكد من أن متغير البيئة `SUPER_ADMIN_SECRET` مضبوط بشكل صحيح في ملف `.env`.

### خطأ: "فشل في الاتصال بقاعدة البيانات"

1. تأكد من أن قاعدة البيانات تعمل
2. تحقق من متغيرات البيئة
3. تأكد من أن MongoDB متصل

### خطأ: "Node.js غير مثبت"

```bash
# تثبيت Node.js
# Windows: تحميل من https://nodejs.org
# Linux: sudo apt install nodejs npm
# Mac: brew install node
```

## 📊 اختبار الصلاحيات

بعد تسجيل الدخول، اختبر الصلاحيات:

```bash
# اختبار الوصول إلى معلومات المستخدم
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# اختبار الوصول إلى لوحة التحكم
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 الخطوات التالية

1. **قم بتشغيل السكريبت** لإنشاء الادمن الرئيسي
2. **سجل دخول** باستخدام المعلومات المذكورة أعلاه
3. **غير كلمة المرور** فوراً
4. **حدث رقم الهاتف** برقم حقيقي
5. **احذف endpoint إنشاء الادمن** من الكود
6. **اختبر الصلاحيات** للتأكد من عمل النظام بشكل صحيح
7. **قم بإعداد المستخدمين الآخرين** حسب الحاجة

## 📞 الدعم

إذا واجهت أي مشاكل:

1. راجع ملف `scripts/README.md` للتفاصيل التقنية
2. تحقق من سجلات النظام
3. تأكد من إعدادات قاعدة البيانات
4. راجع متغيرات البيئة

---

**ملاحظة:** هذا الدليل مخصص للإعداد الأولي للنظام. بعد إنشاء الادمن الرئيسي وتأمين النظام، يُنصح بحذف endpoint إنشاء الادمن من الكود.
