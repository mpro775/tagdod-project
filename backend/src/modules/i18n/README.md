# i18n Management Module

## نظرة عامة

نظام متقدم لإدارة نصوص التعريب (Internationalization) يدعم اللغتين العربية والإنجليزية مع واجهة إدارية قوية.

## المميزات

### 1. إدارة الترجمات
- **CRUD كامل**: إنشاء، قراءة، تحديث، حذف الترجمات
- **Key-Value System**: نظام مفتاح-قيمة مرن
- **Namespaces**: تنظيم الترجمات حسب الوحدات
- **Descriptions**: إضافة وصف لكل ترجمة
- **History Tracking**: تتبع التعديلات

### 2. اللغات المدعومة
- العربية (ar)
- الإنجليزية (en)
- قابل للتوسع لدعم لغات إضافية

### 3. المساحات (Namespaces)
- common: مشترك
- auth: المصادقة
- products: المنتجات
- orders: الطلبات
- services: الخدمات
- users: المستخدمين
- settings: الإعدادات
- errors: الأخطاء
- validation: التحقق
- notifications: الإشعارات

### 4. البحث والتصفية
- البحث النصي الكامل
- التصفية حسب Namespace
- عرض الترجمات المفقودة
- البحث في المفتاح أو النص

### 5. الإحصائيات
- إجمالي الترجمات
- الترجمات حسب المساحة
- الترجمات المفقودة بكل لغة
- نسبة الاكتمال
- آخر التحديثات

### 6. الاستيراد والتصدير
- **Bulk Import**: استيراد جماعي من JSON
- **Export**: تصدير بصيغ JSON أو CSV
- **Overwrite Option**: خيار استبدال الترجمات الموجودة

### 7. تتبع التغييرات
- تاريخ كامل للتعديلات
- من قام بالتعديل
- ماذا تغير بالضبط
- الاحتفاظ بآخر 50 تعديل

## API Endpoints

### Public Endpoints (بدون مصادقة)

#### الحصول على ترجمات لغة معينة
```
GET /i18n/public/translations/:lang?namespace=common
```
يُستخدم من قبل Frontend لتحميل الترجمات.

**Response:**
```json
{
  "auth.welcome": "مرحباً",
  "auth.login": "تسجيل الدخول",
  "products.title": "المنتجات"
}
```

#### الحصول على جميع الترجمات مجمعة
```
GET /i18n/public/all
```

**Response:**
```json
{
  "common": {
    "ar": { "home": "الرئيسية" },
    "en": { "home": "Home" }
  },
  "auth": {
    "ar": { "auth.login": "تسجيل الدخول" },
    "en": { "auth.login": "Login" }
  }
}
```

### Admin Endpoints (تتطلب مصادقة)

#### إنشاء ترجمة
```
POST /i18n
{
  "key": "auth.welcome",
  "ar": "مرحباً",
  "en": "Welcome",
  "namespace": "auth",
  "description": "Welcome message for users"
}
```

#### قائمة الترجمات
```
GET /i18n?namespace=auth&search=login&missingOnly=true&missingLanguage=ar
```

#### إحصائيات
```
GET /i18n/statistics
```

**Response:**
```json
{
  "totalTranslations": 150,
  "byNamespace": {
    "common": 50,
    "auth": 30,
    "products": 40
  },
  "missingArabic": 5,
  "missingEnglish": 3,
  "arabicCompleteness": 96.67,
  "englishCompleteness": 98,
  "recentUpdates": [...]
}
```

#### استيراد جماعي
```
POST /i18n/bulk-import
{
  "translations": {
    "auth.welcome": {
      "ar": "مرحباً",
      "en": "Welcome",
      "description": "Welcome message"
    },
    "auth.login": {
      "ar": "تسجيل الدخول",
      "en": "Login"
    }
  },
  "namespace": "auth",
  "overwrite": true
}
```

**Response:**
```json
{
  "message": "تم الاستيراد بنجاح",
  "imported": 10,
  "updated": 5,
  "skipped": 2
}
```

#### تصدير
```
GET /i18n/export?namespace=auth&format=json&language=both
GET /i18n/export?format=csv&language=ar
```

#### تحديث ترجمة
```
PUT /i18n/:key
{
  "ar": "مرحباً بك",
  "en": "Welcome",
  "description": "Updated description"
}
```

#### حذف ترجمة
```
DELETE /i18n/:key
```

## نموذج البيانات

```typescript
{
  key: string;              // auth.welcome
  ar: string;               // النص بالعربية
  en: string;               // النص بالإنجليزية
  namespace: string;        // common, auth, products, etc.
  description: string;      // وصف الترجمة
  updatedBy: string;        // آخر من قام بالتحديث
  history: [{              // تاريخ التعديلات
    action: string;
    changes: [{
      field: string;
      oldValue: any;
      newValue: any;
    }];
    userId: string;
    timestamp: Date;
  }];
  createdAt: Date;
  updatedAt: Date;
}
```

## الاستخدام في Frontend

### تحميل الترجمات
```typescript
// في بداية التطبيق
const translations = await fetch('/api/i18n/public/translations/ar?namespace=common');
const data = await translations.json();

// استخدام الترجمات
const t = (key: string) => data[key] || key;

console.log(t('auth.welcome')); // "مرحباً"
```

### مع i18next
```typescript
import i18next from 'i18next';

// تحميل الترجمات من API
const resources = await fetch('/api/i18n/public/all');
const translations = await resources.json();

i18next.init({
  resources: {
    ar: translations.common.ar,
    en: translations.common.en,
  },
  lng: 'ar',
  fallbackLng: 'en',
});
```

## أفضل الممارسات

### تسمية المفاتيح
```
namespace.context.key

✅ Good:
- auth.login.title
- products.list.search
- errors.validation.required

❌ Bad:
- loginTitle
- search
- required
```

### التنظيم
- استخدم Namespaces بذكاء
- اجعل المفاتيح وصفية
- أضف Descriptions مفيدة
- راجع الترجمات المفقودة بانتظام

### الأداء
- استخدم Cache للترجمات في Frontend
- حمّل فقط Namespaces المطلوبة
- استخدم lazy loading للترجمات

## الفهرسة

الفهارس المتوفرة:
- `key` (Unique)
- `namespace, key` (Compound)
- `updatedAt` (Descending)
- `key, ar, en` (Text index للبحث)

## الصلاحيات

- **Public Endpoints**: لا تتطلب مصادقة
- **Admin Endpoints**: تتطلب JWT + Admin Role

## التوسعات المستقبلية

- [ ] دعم لغات إضافية (فرنسية، ألمانية، إلخ)
- [ ] Translation Memory
- [ ] Automatic translation suggestions
- [ ] Translation workflow (draft, review, published)
- [ ] Plural forms handling
- [ ] Variables/placeholders support
- [ ] Translation quality score
- [ ] Collaboration features
- [ ] Version control
- [ ] Context screenshots

