# Categories Module

> 🗂️ **نظام فئات محسّن ومنفصل بالكامل**

## نظرة عامة

Module منفصل تماماً لإدارة الفئات مع دعم كامل لـ:
- ✅ Parent-Child (شجرة متعددة المستويات)
- ✅ Soft/Hard Delete
- ✅ SEO (meta tags)
- ✅ تكامل مع Media Library
- ✅ Breadcrumbs
- ✅ إحصائيات تلقائية
- ✅ Caching ذكي

---

## البنية

```
categories/
├─ schemas/
│   └─ category.schema.ts    // Schema محسّن (20 حقل)
├─ dto/
│   └─ category.dto.ts       // DTOs كاملة
├─ categories.service.ts     // Service منفصل
├─ admin.controller.ts       // Admin endpoints
├─ public.controller.ts      // Public endpoints
├─ categories.module.ts      // Module definition
└─ README.md                 // هذا الملف
```

---

## Endpoints

### Admin:
- `POST   /admin/categories` - إنشاء
- `GET    /admin/categories` - قائمة
- `GET    /admin/categories/tree` - شجرة
- `GET    /admin/categories/:id` - عرض
- `PATCH  /admin/categories/:id` - تحديث
- `DELETE /admin/categories/:id` - حذف مؤقت
- `POST   /admin/categories/:id/restore` - استعادة
- `DELETE /admin/categories/:id/permanent` - حذف نهائي

### Public:
- `GET /categories` - قائمة
- `GET /categories/tree` - شجرة
- `GET /categories/:id` - عرض
- `GET /categories/featured/list` - مميزة

---

## مثال الاستخدام

```typescript
// إنشاء فئة جذر
POST /admin/categories
{
  "name": "إلكترونيات",
  "description": "جميع المنتجات الإلكترونية",
  "imageId": "media123",
  "order": 1,
  "isFeatured": true
}

// إنشاء فئة فرعية
POST /admin/categories
{
  "name": "هواتف",
  "parentId": "cat_elec_001",
  "order": 1
}

// عرض الشجرة
GET /categories/tree
```

---

## التكامل مع Modules أخرى

### مع Products Module:

```typescript
import { CategoriesService } from '../categories/categories.service';

// عند إضافة منتج:
await this.categoriesService.incrementProductsCount(categoryId, 1);

// عند حذف منتج:
await this.categoriesService.incrementProductsCount(categoryId, -1);
```

---

### مع Media Library:

```typescript
// استخدام صور من المستودع
{
  "imageId": "media123",
  "iconId": "media456"
}

// يتم populate تلقائياً
```

---

## الوثائق الكاملة

👉 [`CATEGORIES_SYSTEM_COMPREHENSIVE_REPORT.md`](../../../CATEGORIES_SYSTEM_COMPREHENSIVE_REPORT.md)  
👉 [`CATEGORIES_API_EXAMPLES.md`](../../../CATEGORIES_API_EXAMPLES.md)

---

**Status:** ✅ مكتمل وجاهز للإنتاج  
**Version:** 2.0.0

