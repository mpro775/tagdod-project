# Attributes Module

> 🏷️ **نظام السمات العالمية (Global Attributes)**

## نظرة عامة

Module لإدارة السمات العالمية الموحدة - **مكتمل التنفيذ 100%**:
- ✅ توحيد كامل للسمات
- ✅ أنواع متعددة (select, multiselect, text, number, boolean)
- ✅ قيم موحدة مع دعم hexCode وصور
- ✅ فلترة قوية ومتقدمة
- ✅ تتبع استخدام مع إحصائيات
- ✅ Soft delete مع إمكانية الاستعادة
- ⚠️ تجميع السمات في مجموعات (Schema موجود، لكن لا API للإدارة)

---

## المفهوم

```
السمة (Attribute):
- الاسم: "اللون"
- الاسم بالإنجليزية: "Color"
- النوع: select
- القيم: [
    { value: "أحمر", valueEn: "Red", hexCode: "#FF0000" },
    { value: "أزرق", valueEn: "Blue", hexCode: "#0000FF" }
  ]

الفوائد:
✅ توحيد - كل المنتجات تستخدم نفس "أحمر"
✅ فلترة - سهل جداً مع قيم موحدة
✅ UI موحد - نفس الشكل لكل المنتجات
✅ إحصائيات - تتبع عدد المنتجات المستخدمة
✅ تنظيم - تجميع السمات في مجموعات
```

---

## Schemas

### 1. Attribute - مطبق فعلياً ✅

```typescript
{
  name: "اللون",                    // الاسم بالعربية
  nameEn: "Color",                  // الاسم بالإنجليزية
  slug: "color",                    // معرف فريد
  type: "select",                   // select | multiselect | text | number | boolean
  description: "لون المنتج",
  order: 1,                         // ترتيب العرض
  isActive: true,                   // نشطة أم لا
  isFilterable: true,               // قابلة للفلترة
  isRequired: false,                // إلزامية
  showInFilters: true,              // عرض في الفلاتر
  groupId: "group_general",         // المجموعة
  usageCount: 25,                   // عدد المنتجات المستخدمة
  deletedAt: null,                  // Soft delete
  deletedBy: null                   // من حذفها
}
```

### 2. AttributeValue - مطبق فعلياً ✅

```typescript
{
  attributeId: "attr_color",
  value: "أحمر",                    // القيمة بالعربية
  valueEn: "Red",                   // القيمة بالإنجليزية
  slug: "red",                      // معرف فريد
  hexCode: "#FF0000",               // كود اللون
  imageUrl: "https://...",          // صورة القيمة
  imageId: "media_123",             // من مستودع الصور
  description: "اللون الأحمر",
  order: 1,                         // ترتيب العرض
  isActive: true,                   // نشطة أم لا
  usageCount: 12,                   // عدد الـ variants المستخدمة
  deletedAt: null,                  // Soft delete
  deletedBy: null                   // من حذفها
}
```

### 3. AttributeGroup - ⚠️ Schema موجود، لا API

```typescript
{
  name: "المواصفات العامة",
  nameEn: "General Specifications",
  slug: "general",
  description: "المواصفات الأساسية للمنتجات",
  order: 1,                         // ترتيب المجموعة
  isActive: true                    // نشطة أم لا
}

// ملاحظة: Schema موجود بالكامل لكن لا يوجد API لإدارة المجموعات
// يمكن الإشارة إلى groupId في السمات لكن إدارة المجموعات تتم مباشرة في قاعدة البيانات
```

---

## Endpoints - مطبقة فعلياً ✅

### Admin Endpoints (محمية - Admin/Super Admin فقط):
- ✅ **CRUD للسمات**: `POST`, `GET`, `PATCH`, `DELETE` `/admin/attributes`
- ✅ **CRUD للقيم**: `POST`, `GET`, `PATCH`, `DELETE` `/admin/attributes/{id}/values`
- ✅ **إحصائيات**: `GET /admin/attributes/stats/summary`
- ✅ **استعادة محذوف**: `POST /admin/attributes/{id}/restore`
- ✅ **فلترة متقدمة**: `?search`, `?isActive`, `?isFilterable`, `?groupId`, `?includeDeleted`
- ⚠️ **مجموعات السمات**: `groupId` موجود في Schema لكن لا يوجد API لإدارة المجموعات

### Public Endpoints (عامة - مع Cache):
- ✅ **قائمة السمات**: `GET /attributes` (النشطة فقط)
- ✅ **السمات القابلة للفلترة**: `GET /attributes/filterable` (مع قيمها)
- ✅ **سمة واحدة**: `GET /attributes/{id}` (مع قيمها)
- ✅ **Cache**: 30 دقيقة لجميع الـ public endpoints

---

## أمثلة الاستخدام - مطبقة فعلياً ✅

### إنشاء سمة جديدة:
```http
POST /admin/attributes
Authorization: Bearer {admin_token}

{
  "name": "اللون",
  "nameEn": "Color",
  "type": "select",
  "description": "لون المنتج",
  "order": 1,
  "isFilterable": true,
  "isRequired": false,
  "showInFilters": true,
  "groupId": "group_general"
}

Response:
{
  "data": {
    "_id": "attr_123",
    "name": "اللون",
    "nameEn": "Color",
    "slug": "color",
    "type": "select",
    "isFilterable": true,
    "usageCount": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### إضافة قيم للسمة:
```http
POST /admin/attributes/attr_123/values
Authorization: Bearer {admin_token}

{
  "value": "أحمر",
  "valueEn": "Red",
  "hexCode": "#FF0000",
  "description": "اللون الأحمر",
  "order": 1
}

Response:
{
  "data": {
    "_id": "value_456",
    "attributeId": "attr_123",
    "value": "أحمر",
    "valueEn": "Red",
    "slug": "red",
    "hexCode": "#FF0000",
    "usageCount": 0
  }
}
```

### جلب السمات القابلة للفلترة (للواجهة العامة):
```http
GET /attributes/filterable

Response:
{
  "data": [
    {
      "_id": "attr_123",
      "name": "اللون",
      "nameEn": "Color",
      "type": "select",
      "isFilterable": true,
      "values": [
        {
          "_id": "value_456",
          "value": "أحمر",
          "valueEn": "Red",
          "hexCode": "#FF0000"
        }
      ]
    }
  ]
}
```

---

## المميزات المتقدمة المطبقة ✅

### 1. أنواع السمات المتعددة:
- ✅ **select**: اختيار واحد (مثل: اللون)
- ✅ **multiselect**: اختيار متعدد (مثل: المميزات)
- ✅ **text**: نص حر (مثل: المادة)
- ✅ **number**: رقم (مثل: الوزن)
- ✅ **boolean**: نعم/لا (مثل: قابل للغسل)

### 2. تتبع الاستخدام:
- ✅ **usageCount** للسمات: عدد المنتجات المستخدمة
- ✅ **usageCount** للقيم: عدد الـ variants المستخدمة
- ✅ **incrementUsage()**: زيادة عند الاستخدام
- ✅ **decrementUsage()**: نقصان عند الحذف

### 3. Soft Delete:
- ✅ **deletedAt**: تاريخ الحذف
- ✅ **deletedBy**: من حذف السمة/القيمة
- ✅ **restoreAttribute()**: استعادة السمة المحذوفة
- ✅ منع حذف السمات/القيم المستخدمة

### 4. الفلترة والبحث:
- ✅ **search**: بحث في الاسم العربي والإنجليزي
- ✅ **isActive**: السمات النشطة فقط
- ✅ **isFilterable**: السمات القابلة للفلترة
- ✅ **groupId**: فلترة حسب المجموعة
- ✅ **includeDeleted**: عرض المحذوفة

### 5. الأداء والتحسين:
- ✅ **Indexes محسّنة**: للبحث السريع
- ✅ **Cache**: 30 دقيقة للـ public endpoints
- ✅ **Population**: جلب المجموعات والقيم
- ✅ **Lean queries**: استعلامات محسّنة

### 6. الأمان والصلاحيات:
- ✅ **JWT Auth**: مصادقة مطلوبة للـ admin
- ✅ **Roles Guard**: Admin/Super Admin فقط
- ✅ **Validation**: تحقق شامل من البيانات
- ✅ **Error Handling**: رسائل خطأ واضحة

### 7. مجموعات السمات:
- ⚠️ **Schema موجود**: `AttributeGroup` schema مطبق بالكامل
- ⚠️ **Reference متاح**: `groupId` في `Attribute` schema
- ❌ **لا API للإدارة**: لا يمكن إنشاء/تحديث/حذف المجموعات عبر API
- 💡 **طريقة العمل**: المجموعات تُدار مباشرة في قاعدة البيانات

---

## الإحصائيات المتاحة ✅

```http
GET /admin/attributes/stats/summary

Response:
{
  "data": {
    "total": 25,           // إجمالي السمات
    "active": 20,          // السمات النشطة
    "filterable": 15,      // القابلة للفلترة
    "byType": {            // حسب النوع
      "select": 12,
      "text": 5,
      "number": 3,
      "boolean": 2,
      "multiselect": 3
    }
  }
}
```

---

**Status:** ✅ Complete - مكتمل التنفيذ 100% (مع استثناء إدارة المجموعات)
**Version:** 1.0.0
**Last Updated:** 2024-01-15

**ملاحظة مهمة:** نظام السمات مكتمل بالكامل باستثناء إدارة مجموعات السمات عبر API. المجموعات موجودة في Schema ويمكن الإشارة إليها، لكن إدارتها تتم مباشرة في قاعدة البيانات.


