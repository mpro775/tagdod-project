# Products Module

> 🛍️ **نظام منتجات احترافي مع Global Attributes**

## نظرة عامة

Module منفصل تماماً لإدارة المنتجات مع:
- ✅ Global Attributes System
- ✅ Variant Generator (توليد تلقائي)
- ✅ Multiple Images Support
- ✅ SEO Optimization
- ✅ Statistics & Analytics
- ✅ Soft Delete

---

## البنية

```
products/
├─ schemas/
│   ├─ product.schema.ts (25+ حقل)
│   └─ variant.schema.ts (محسّن)
├─ dto/
│   └─ product.dto.ts
├─ products.service.ts
├─ variants.service.ts
├─ products.admin.controller.ts
├─ products.public.controller.ts
├─ products.module.ts
└─ README.md
```

---

## الميزات الرئيسية

### 1. Global Attributes

```typescript
// منتج يستخدم سمات عالمية:
Product {
  attributes: ["attr_color", "attr_size"]
}

// Variant يستخدم قيم محددة:
Variant {
  attributeValues: [
    { attributeId: "attr_color", valueId: "val_red" },
    { attributeId: "attr_size", valueId: "val_m" }
  ]
}
```

---

### 2. Variant Generator

```http
POST /admin/products/{id}/variants/generate
{
  "defaultPrice": 100,
  "defaultStock": 50
}

→ يولد جميع التركيبات تلقائياً!
```

---

### 3. Multiple Images

```typescript
Product {
  mainImageId: "media123",
  imageIds: ["media124", "media125", "media126"]
}

Variant {
  imageId: "media127"  // صورة خاصة
}
```

---

## Endpoints

### Admin (15):
- Products CRUD
- Variants CRUD
- Variant Generator
- Stats

### Public (4):
- List products
- Get product
- Featured
- New

---

## مثال سريع

```http
# 1. إنشاء منتج
POST /admin/products
{
  "name": "قميص",
  "categoryId": "cat_fashion",
  "attributes": ["attr_color", "attr_size"]
}

# 2. توليد variants
POST /admin/products/{id}/variants/generate
{ "defaultPrice": 100, "defaultStock": 50 }

# 3. تخصيص
PATCH /admin/products/variants/{id}
{ "price": 120 }

# 4. نشر
PATCH /admin/products/{id}
{ "status": "active" }

✅ جاهز!
```

---

## التكامل

### مع Attributes Module:

```typescript
import { AttributesService } from '../attributes/attributes.service';

// استخدام السمات العالمية
```

### مع Categories Module:

```typescript
import { CategoriesService } from '../categories/categories.service';

// تحديث productsCount
```

### مع Media Library:

```typescript
// استخدام الصور من المستودع
```

---

## الوثائق

👉 [`PRODUCTS_SYSTEM_FINAL_REPORT.md`](../../../PRODUCTS_SYSTEM_FINAL_REPORT.md)

---

**Status:** ✅ Production Ready  
**Version:** 3.0.0

