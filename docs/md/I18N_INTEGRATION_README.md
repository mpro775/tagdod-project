# 🌍 دليل تكامل نظام i18n

## ✅ تم التكامل بنجاح!

لوحة التحكم الآن **متصلة بنظام i18n** وتحمّل جميع النصوص من قاعدة البيانات عبر API.

---

## 📊 ما تم إنجازه

### 1. ✅ تثبيت المكتبة المطلوبة
```bash
npm install i18next-http-backend
```

### 2. ✅ تعديل إعدادات i18n
الملف: `src/core/i18n/config.ts`

**قبل التعديل:** كان يحمّل من ملفات JSON محلية
```typescript
import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';
```

**بعد التعديل:** يحمّل من Backend API
```typescript
backend: {
  loadPath: `${API_BASE_URL}/api/v1/i18n/public/translations/{{lng}}?namespace={{ns}}`,
}
```

### 3. ✅ استيراد الترجمات في قاعدة البيانات
- تم استيراد **83 ترجمة** من الملفات المحلية
- موزعة على:
  - `common`: 75 ترجمة
  - `validation`: 8 ترجمات

---

## 🚀 كيفية الاستخدام

### في مكونات React:
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <button>{t('actions.save')}</button>
      <span>{t('status.active')}</span>
    </div>
  );
}
```

### مع Namespaces مختلفة:
```typescript
const { t } = useTranslation(['common', 'validation']);

<input 
  placeholder={t('common:actions.search')}
  error={t('validation:required')}
/>
```

### تغيير اللغة:
```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lang: 'ar' | 'en') => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <select onChange={(e) => changeLanguage(e.target.value as 'ar' | 'en')}>
      <option value="ar">العربية</option>
      <option value="en">English</option>
    </select>
  );
}
```

---

## 📋 الـ Namespaces المتاحة

النظام يدعم المساحات التالية:
- ✅ `common` - النصوص المشتركة (القوائم، الأزرار، الحالات)
- ✅ `auth` - نصوص المصادقة
- ✅ `products` - نصوص المنتجات
- ✅ `orders` - نصوص الطلبات
- ✅ `services` - نصوص الخدمات
- ✅ `users` - نصوص المستخدمين
- ✅ `settings` - نصوص الإعدادات
- ✅ `validation` - رسائل التحقق
- ✅ `notifications` - نصوص الإشعارات

---

## 🔧 إدارة الترجمات

### من لوحة التحكم:
1. انتقل إلى **إدارة i18n** في القائمة الجانبية
2. يمكنك:
   - ✏️ إضافة ترجمات جديدة
   - 📝 تعديل الترجمات الموجودة
   - 🗑️ حذف ترجمات
   - 📊 عرض الإحصائيات
   - 📥 استيراد ترجمات جماعية (JSON)
   - 📤 تصدير الترجمات (JSON/CSV)

### إضافة ترجمة جديدة:
```json
{
  "key": "products.addToCart",
  "ar": "إضافة إلى السلة",
  "en": "Add to Cart",
  "namespace": "products",
  "description": "زر إضافة المنتج للسلة"
}
```

### استيراد جماعي:
```json
{
  "translations": {
    "products.viewDetails": {
      "ar": "عرض التفاصيل",
      "en": "View Details"
    },
    "products.outOfStock": {
      "ar": "غير متوفر",
      "en": "Out of Stock"
    }
  },
  "namespace": "products",
  "overwrite": true
}
```

---

## 🔄 إعادة استيراد الترجمات

إذا احتجت لإعادة استيراد الترجمات من الملفات المحلية:

```bash
cd backend
node scripts/import-i18n-translations.js
```

---

## 🎯 أفضل الممارسات

### 1. تسمية المفاتيح:
```
✅ Good:
- navigation.dashboard
- actions.save
- validation.required
- products.addToCart

❌ Bad:
- dashboard
- save
- required
```

### 2. استخدام Namespaces:
```typescript
// ✅ جيد - محدد وواضح
t('products:addToCart')
t('validation:email')

// ❌ سيء - غامض
t('addToCart')
t('email')
```

### 3. Variables في النصوص:
```typescript
// في قاعدة البيانات:
"validation.minLength": "الحد الأدنى {{min}} أحرف"

// في الكود:
t('validation.minLength', { min: 6 })
// النتيجة: "الحد الأدنى 6 أحرف"
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الترجمات لا تظهر
**الحل:**
1. تأكد أن Backend يعمل على `http://localhost:3000`
2. تحقق من وجود الترجمات في قاعدة البيانات
3. افتح Console في المتصفح وابحث عن أخطاء

### المشكلة: تظهر المفاتيح بدلاً من النصوص
**مثال:** يظهر `navigation.dashboard` بدلاً من "لوحة التحكم"

**الحل:**
```bash
# تحقق من API
curl http://localhost:3000/api/v1/i18n/public/translations/ar?namespace=common

# إذا كانت النتيجة فارغة، أعد الاستيراد
node scripts/import-i18n-translations.js
```

### المشكلة: تغيير اللغة لا يعمل
**الحل:**
```typescript
// تأكد من استخدام i18n.changeLanguage
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
i18n.changeLanguage('en'); // يعمل ✅
```

---

## 📈 الإحصائيات والمراقبة

### عرض إحصائيات الترجمات:
```bash
# API Endpoint
GET http://localhost:3000/api/v1/i18n/statistics
```

**النتيجة:**
```json
{
  "totalTranslations": 83,
  "byNamespace": {
    "common": 75,
    "validation": 8
  },
  "missingArabic": 0,
  "missingEnglish": 0,
  "arabicCompleteness": 100,
  "englishCompleteness": 100
}
```

---

## 🔐 الصلاحيات

- **Public Endpoints** (بدون مصادقة):
  - `GET /i18n/public/translations/:lang`
  - `GET /i18n/public/all`

- **Admin Endpoints** (تحتاج JWT + Admin):
  - `POST /i18n` - إضافة ترجمة
  - `PUT /i18n/:key` - تعديل ترجمة
  - `DELETE /i18n/:key` - حذف ترجمة
  - `GET /i18n/statistics` - الإحصائيات
  - `POST /i18n/bulk-import` - استيراد جماعي
  - `GET /i18n/export` - تصدير

---

## 📚 موارد إضافية

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next-http-backend](https://github.com/i18next/i18next-http-backend)

---

## ✅ الخلاصة

🎉 **نظام i18n جاهز للاستخدام!**

- ✅ Frontend متصل بـ Backend
- ✅ 83 ترجمة جاهزة
- ✅ لوحة إدارة كاملة
- ✅ دعم لغتين (عربي/إنجليزي)
- ✅ Cache ذكي
- ✅ سهولة الإضافة والتعديل

**الآن يمكنك:**
1. استخدام `t()` في أي مكون
2. إضافة/تعديل الترجمات من لوحة الإدارة
3. التبديل بين اللغات بسهولة
4. تصدير/استيراد الترجمات

---

**تاريخ التكامل:** 2025-10-26
**الإصدار:** 1.0.0

