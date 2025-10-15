# إنشاء الادمن الرئيسي

هذا المجلد يحتوي على السكريبتات اللازمة لإنشاء الادمن الرئيسي في النظام.

## الطرق المتاحة

### 1. استخدام السكريبت TypeScript

```bash
# تشغيل السكريبت مباشرة
npx ts-node scripts/create-super-admin.ts

# تحديث كلمة المرور للادمن الموجود
npx ts-node scripts/create-super-admin.ts --update-password
```

### 2. استخدام السكريبت JavaScript

```bash
# تشغيل السكريبت المبسط
node scripts/run-create-admin.js

# تحديث كلمة المرور
node scripts/run-create-admin.js --update-password
```

### 3. استخدام API مباشرة

```bash
# إرسال طلب POST إلى endpoint إنشاء الادمن
curl -X POST http://localhost:3000/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "TAGADODO_SUPER_ADMIN_2024"}'
```

## معلومات تسجيل الدخول

بعد إنشاء الادمن الرئيسي، ستكون معلومات تسجيل الدخول:

- **رقم الهاتف**: `+966500000000`
- **كلمة المرور**: `Admin123!@#`
- **الدور**: `SUPER_ADMIN`
- **الصلاحيات**: جميع الصلاحيات

## طرق تسجيل الدخول

### 1. تسجيل الدخول بـ OTP (الطريقة الافتراضية)

```bash
# إرسال OTP
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000000", "context": "register"}'

# التحقق من OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000000", "code": "123456"}'
```

### 2. تسجيل الدخول بكلمة المرور (إذا كان النظام يدعم ذلك)

```bash
# تسجيل الدخول بكلمة المرور
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000000", "password": "Admin123!@#"}'
```

## الأمان

⚠️ **تحذيرات مهمة:**

1. **غير كلمة المرور فوراً** بعد تسجيل الدخول الأول
2. **حدث رقم الهاتف** برقم حقيقي
3. **احتفظ بمعلومات تسجيل الدخول** في مكان آمن
4. **لا تشارك هذه المعلومات** مع أي شخص
5. **احذف endpoint إنشاء الادمن** بعد الاستخدام الأول

## متغيرات البيئة

أضف المفتاح السري إلى ملف `.env`:

```env
SUPER_ADMIN_SECRET=TAGADODO_SUPER_ADMIN_2024
```

## استكشاف الأخطاء

### خطأ: "الادمن الرئيسي موجود بالفعل"

```bash
# تحديث كلمة المرور للادمن الموجود
npx ts-node scripts/create-super-admin.ts --update-password
```

### خطأ: "مفتاح سري غير صحيح"

تأكد من أن متغير البيئة `SUPER_ADMIN_SECRET` مضبوط بشكل صحيح.

### خطأ: "فشل في الاتصال بقاعدة البيانات"

تأكد من أن قاعدة البيانات تعمل وأن متغيرات البيئة مضبوطة بشكل صحيح.

## الخطوات التالية

1. **قم بتشغيل السكريبت** لإنشاء الادمن الرئيسي
2. **سجل دخول** باستخدام المعلومات المذكورة أعلاه
3. **غير كلمة المرور** فوراً
4. **حدث رقم الهاتف** برقم حقيقي
5. **احذف endpoint إنشاء الادمن** من الكود
6. **اختبر الصلاحيات** للتأكد من عمل النظام بشكل صحيح
