# دليل استيراد الترجمات (i18n)

## المشكلة
إذا كانت الترجمات لا تظهر في لوحة التحكم وترى رسائل `missingKey` في الكونسول، هذا يعني أن الترجمات غير موجودة في قاعدة البيانات.

## الحل

### 1. تأكد من تشغيل MongoDB
تأكد من أن MongoDB يعمل وأن متغير البيئة `MONGO_URI` صحيح في ملف `.env`:

```env
MONGO_URI=mongodb://localhost:27017/solar-commerce
```

أو إذا كنت تستخدم MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### 2. تشغيل سكريبت استيراد الترجمات

من مجلد `backend`، قم بتشغيل:

```bash
# Windows
cd backend
node scripts/import-i18n-translations.js

# Linux/Mac
cd backend
node scripts/import-i18n-translations.js
```

### 3. النتيجة المتوقعة

يجب أن ترى رسائل مثل:

```
🔄 جارٍ الاتصال بقاعدة البيانات...
✅ تم الاتصال بقاعدة البيانات بنجاح

📊 إجمالي الترجمات للاستيراد: XXX

✅ استيراد: app.name
✅ استيراد: navigation.dashboard
✅ استيراد: navigation.users
...

📊 ملخص الاستيراد:
✅ تم الاستيراد: XXX
🔄 تم التحديث: 0
❌ تم التخطي: 0
📦 الإجمالي: XXX

📊 الترجمات حسب المساحة:
   common: XXX
   validation: XX
   ...

✅ تم قطع الاتصال بقاعدة البيانات
```

### 4. إعادة تشغيل الـ Backend (اختياري)

بعد استيراد الترجمات، أعد تشغيل الـ Backend لتحديث الـ cache:

```bash
npm run start:dev
```

### 5. مسح cache المتصفح (اختياري)

في متصفحك:
- افتح Developer Tools (F12)
- اذهب إلى Application > Local Storage
- احذف المفتاح `i18nextLng` أو امسح كل Local Storage
- أعد تحميل الصفحة (Ctrl+R أو Cmd+R)

## الترجمات المحلية كاحتياطي

تم تحديث نظام i18n ليستخدم الترجمات المحلية كاحتياط في حالة عدم توفر الترجمات من قاعدة البيانات. هذا يعني أن التطبيق سيعمل حتى بدون تشغيل السكريبت، لكن الترجمات من قاعدة البيانات تتيح:

1. تحديث الترجمات ديناميكياً دون إعادة نشر التطبيق
2. إدارة الترجمات من لوحة التحكم
3. تخزين ترجمات إضافية للـ namespaces الأخرى

## الملفات المحدثة

- ✅ `admin-dashboard/src/core/i18n/locales/ar/common.json` - جميع الترجمات العربية
- ✅ `admin-dashboard/src/core/i18n/locales/en/common.json` - جميع الترجمات الإنجليزية
- ✅ `admin-dashboard/src/core/i18n/config.ts` - إعدادات i18n مع fallback محلي
- ✅ `backend/scripts/import-i18n-translations.js` - سكريبت الاستيراد المحدث

## استكشاف الأخطاء

### الخطأ: "Cannot connect to MongoDB"

- تأكد من تشغيل MongoDB
- تحقق من صحة `MONGO_URI` في ملف `.env`
- تأكد من أن MongoDB يقبل الاتصالات

### الخطأ: "missingKey" مازال يظهر

1. امسح cache المتصفح (Local Storage)
2. أعد تحميل الصفحة بـ Hard Refresh (Ctrl+Shift+R)
3. تحقق من Console في Developer Tools لرؤية أي أخطاء في تحميل الترجمات

### الترجمات تظهر بالإنجليزية فقط

- تأكد من تغيير اللغة من الإعدادات
- امسح Local Storage في المتصفح
- أعد تحميل الصفحة

## إضافة ترجمات جديدة

لإضافة ترجمات جديدة:

1. أضف المفتاح والترجمة في الملفات:
   - `admin-dashboard/src/core/i18n/locales/ar/common.json`
   - `admin-dashboard/src/core/i18n/locales/en/common.json`

2. أضف نفس الترجمة في السكريبت:
   - `backend/scripts/import-i18n-translations.js`

3. شغل السكريبت لاستيراد الترجمات الجديدة:
   ```bash
   node scripts/import-i18n-translations.js
   ```

## الدعم

إذا واجهت أي مشاكل، تحقق من:
- Console في المتصفح للأخطاء
- Backend logs للأخطاء
- MongoDB logs للتأكد من الاتصال

