# دليل API الكامل - نظام المنتجات

> 📚 **دليل شامل لجميع APIs مع أمثلة عملية**

## 📋 الفهرس

1. [إعداد السمات](#1-إعداد-السمات)
2. [إنشاء المنتجات](#2-إنشاء-المنتجات)
3. [توليد Variants](#3-توليد-variants)
4. [إدارة الأسعار والمخزون](#4-إدارة-الأسعار-والمخزون)
5. [العرض للعملاء](#5-العرض-للعملاء)
6. [الفلترة المتقدمة](#6-الفلترة-المتقدمة)
7. [سيناريوهات كاملة](#7-سيناريوهات-كاملة)

---

## 1. إعداد السمات

### الخطوة 1: إنشاء سمة "اللون"

```http
POST /admin/attributes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "اللون",
  "nameEn": "Color",
  "type": "select",
  "description": "لون المنتج",
  "isFilterable": true,
  "showInFilters": true,
  "isRequired": false,
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "attr_color_001",
    "name": "اللون",
    "nameEn": "Color",
    "slug": "color",
    "type": "select",
    "isFilterable": true,
    "usageCount": 0
  }
}
```

---

### الخطوة 2: إضافة قيم اللون

```http
POST /admin/attributes/attr_color_001/values
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "value": "أحمر",
  "valueEn": "Red",
  "hexCode": "#FF0000",
  "order": 1
}
```

```http
POST /admin/attributes/attr_color_001/values
{
  "value": "أزرق",
  "valueEn": "Blue",
  "hexCode": "#0000FF",
  "order": 2
}
```

```http
POST /admin/attributes/attr_color_001/values
{
  "value": "أسود",
  "valueEn": "Black",
  "hexCode": "#000000",
  "order": 3
}
```

---

### الخطوة 3: إنشاء سمة "الحجم"

```http
POST /admin/attributes
{
  "name": "الحجم",
  "nameEn": "Size",
  "type": "select",
  "isFilterable": true,
  "showInFilters": true,
  "order": 2
}
# Response: attr_size_001

# إضافة قيم
POST /admin/attributes/attr_size_001/values
{ "value": "S", "valueEn": "Small", "order": 1 }
{ "value": "M", "valueEn": "Medium", "order": 2 }
{ "value": "L", "valueEn": "Large", "order": 3 }
{ "value": "XL", "valueEn": "Extra Large", "order": 4 }
```

---

### عرض السمات القابلة للفلترة (للعامة)

```http
GET /attributes/filterable
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "attr_color_001",
      "name": "اللون",
      "nameEn": "Color",
      "type": "select",
      "values": [
        { "_id": "val_red", "value": "أحمر", "hexCode": "#FF0000" },
        { "_id": "val_blue", "value": "أزرق", "hexCode": "#0000FF" },
        { "_id": "val_black", "value": "أسود", "hexCode": "#000000" }
      ]
    },
    {
      "_id": "attr_size_001",
      "name": "الحجم",
      "values": [
        { "_id": "val_s", "value": "S" },
        { "_id": "val_m", "value": "M" },
        { "_id": "val_l", "value": "L" },
        { "_id": "val_xl", "value": "XL" }
      ]
    }
  ]
}
```

---

## 2. إنشاء المنتجات

### مثال 1: قميص رياضي

```http
POST /admin/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "قميص رياضي Nike Dri-FIT",
  "description": "قميص رياضي عالي الجودة مصنوع من تقنية Dri-FIT لتجفيف سريع وراحة قصوى",
  "categoryId": "cat_sports_fashion",
  "brandId": "brand_nike",
  "sku": "NIKE-DRYFIT-SHIRT-2025",
  "mainImageId": "media_shirt_main",
  "imageIds": ["media_shirt_2", "media_shirt_3", "media_shirt_4"],
  "attributes": ["attr_color_001", "attr_size_001"],
  "metaTitle": "قميص رياضي Nike Dri-FIT - أفضل الأسعار",
  "metaDescription": "اشتر قميص Nike Dri-FIT الرياضي بأفضل الأسعار...",
  "metaKeywords": ["nike", "قميص", "رياضي", "dri-fit"],
  "status": "active",
  "isActive": true,
  "isFeatured": true,
  "isNew": true,
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "prod_nike_shirt_001",
    "name": "قميص رياضي Nike Dri-FIT",
    "slug": "nike-dri-fit-sport-shirt",
    "status": "active",
    "variantsCount": 0,
    "viewsCount": 0,
    "salesCount": 0
  }
}
```

---

## 3. توليد Variants

### التوليد التلقائي

```http
POST /admin/products/prod_nike_shirt_001/variants/generate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "defaultPrice": 150,
  "defaultStock": 30,
  "overwriteExisting": false
}
```

**ما يحدث:**
```
السمات:
- اللون: 3 قيم (أحمر، أزرق، أسود)
- الحجم: 4 قيم (S, M, L, XL)

التركيبات: 3 × 4 = 12 variant

يتم إنشاء:
1. أحمر + S   → 150 ريال، 30 قطعة
2. أحمر + M   → 150 ريال، 30 قطعة
3. أحمر + L   → 150 ريال، 30 قطعة
4. أحمر + XL  → 150 ريال، 30 قطعة
5. أزرق + S   → 150 ريال، 30 قطعة
6. أزرق + M   → 150 ريال، 30 قطعة
7. أزرق + L   → 150 ريال، 30 قطعة
8. أزرق + XL  → 150 ريال، 30 قطعة
9. أسود + S   → 150 ريال، 30 قطعة
10. أسود + M  → 150 ريال، 30 قطعة
11. أسود + L  → 150 ريال، 30 قطعة
12. أسود + XL → 150 ريال، 30 قطعة
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generated": 12,
    "total": 12,
    "variants": [
      {
        "_id": "var_001",
        "sku": null,
        "attributeValues": [
          { "attributeId": "attr_color_001", "valueId": "val_red", "name": "اللون", "value": "أحمر" },
          { "attributeId": "attr_size_001", "valueId": "val_s", "name": "الحجم", "value": "S" }
        ],
        "price": 150,
        "stock": 30,
        "isActive": true,
        "isAvailable": true
      }
    ]
  }
}
```

**✨ بنقرة واحدة تم إنشاء 12 variant!**

---

## 4. إدارة الأسعار والمخزون

### تحديث variant معين

```http
PATCH /admin/products/variants/var_001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 175,
  "compareAtPrice": 200,
  "stock": 20,
  "sku": "NIKE-RED-S"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "var_001",
    "price": 175,
    "compareAtPrice": 200,
    "stock": 20,
    "sku": "NIKE-RED-S"
  }
}
```

---

### تحديث جماعي (Bulk Update)

```http
# تحديث كل الأحجام XL (أغلى)
PATCH /admin/products/variants/var_red_xl
{ "price": 180 }

PATCH /admin/products/variants/var_blue_xl
{ "price": 180 }

PATCH /admin/products/variants/var_black_xl
{ "price": 180 }
```

---

## 5. العرض للعملاء

### قائمة المنتجات

```http
GET /products?page=1&limit=20&categoryId=cat_sports_fashion
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "prod_nike_shirt_001",
      "name": "قميص رياضي Nike Dri-FIT",
      "slug": "nike-dri-fit-sport-shirt",
      "mainImage": "https://cdn.bunny.net/...",
      "categoryId": {...},
      "isFeatured": true,
      "isNew": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### تفاصيل منتج

```http
GET /products/prod_nike_shirt_001
```

**Response:** (انظر المثال الشامل في التقرير الرئيسي)

---

## 6. الفلترة المتقدمة

### فلترة حسب لون واحد

```http
GET /products?categoryId=cat_sports&filters[attr_color_001]=val_red
```

**النتيجة:** فقط المنتجات الحمراء

---

### فلترة متعددة

```http
GET /products?filters[attr_color_001]=val_red&filters[attr_size_001]=val_m
```

**النتيجة:** فقط المنتجات الحمراء حجم M

---

### مع نطاق سعر

```http
GET /products?minPrice=100&maxPrice=200&filters[attr_color_001]=val_blue
```

---

## 7. سيناريوهات كاملة

### سيناريو 1: متجر أزياء

```http
# 1. Setup السمات
POST /admin/attributes { name: "اللون", type: "select" }
POST /admin/attributes { name: "الحجم", type: "select" }
POST /admin/attributes { name: "المادة", type: "text" }

# 2. إضافة قيم
POST /admin/attributes/attr_color/values { value: "أحمر" }
POST /admin/attributes/attr_color/values { value: "أزرق" }
POST /admin/attributes/attr_size/values { value: "S" }
POST /admin/attributes/attr_size/values { value: "M" }
POST /admin/attributes/attr_size/values { value: "L" }

# 3. إنشاء منتجات
POST /admin/products
{
  "name": "قميص",
  "categoryId": "cat_shirts",
  "attributes": ["attr_color", "attr_size"]
}

POST /admin/products
{
  "name": "بنطال",
  "categoryId": "cat_pants",
  "attributes": ["attr_color", "attr_size"]
}

# 4. توليد variants
POST /admin/products/{shirt_id}/variants/generate
POST /admin/products/{pants_id}/variants/generate

✅ جاهز!
```

---

### سيناريو 2: متجر إلكترونيات

```http
# 1. Setup السمات
POST /admin/attributes { name: "اللون", type: "select" }
POST /admin/attributes { name: "الذاكرة", type: "select" }
POST /admin/attributes { name: "الرام", type: "select" }
POST /admin/attributes { name: "الضمان", type: "select" }

# 2. إضافة قيم
# اللون
POST /admin/attributes/attr_color/values { value: "أسود" }
POST /admin/attributes/attr_color/values { value: "فضي" }
POST /admin/attributes/attr_color/values { value: "ذهبي" }

# الذاكرة
POST /admin/attributes/attr_memory/values { value: "128GB" }
POST /admin/attributes/attr_memory/values { value: "256GB" }
POST /admin/attributes/attr_memory/values { value: "512GB" }

# الرام
POST /admin/attributes/attr_ram/values { value: "8GB" }
POST /admin/attributes/attr_ram/values { value: "12GB" }

# 3. إنشاء هاتف
POST /admin/products
{
  "name": "Samsung Galaxy S24",
  "categoryId": "cat_phones",
  "attributes": ["attr_color", "attr_memory", "attr_ram"]
}

# 4. توليد variants
POST /admin/products/{id}/variants/generate
{ "defaultPrice": 3500, "defaultStock": 10 }

# النتيجة: 3 × 3 × 2 = 18 variant تلقائياً!
```

---

## 📊 Endpoints الكاملة

### Attributes Module:

```
Admin (11 endpoints):
✅ POST   /admin/attributes
✅ GET    /admin/attributes
✅ GET    /admin/attributes/:id
✅ PATCH  /admin/attributes/:id
✅ DELETE /admin/attributes/:id
✅ POST   /admin/attributes/:id/restore
✅ POST   /admin/attributes/:attributeId/values
✅ GET    /admin/attributes/:attributeId/values
✅ PATCH  /admin/attributes/values/:id
✅ DELETE /admin/attributes/values/:id
✅ GET    /admin/attributes/stats/summary

Public (3 endpoints):
✅ GET /attributes
✅ GET /attributes/filterable
✅ GET /attributes/:id
```

---

### Products Module:

```
Admin (15 endpoints):
✅ POST   /admin/products
✅ GET    /admin/products
✅ GET    /admin/products/:id
✅ PATCH  /admin/products/:id
✅ DELETE /admin/products/:id
✅ POST   /admin/products/:id/restore
✅ POST   /admin/products/:id/update-stats
✅ GET    /admin/products/stats/summary
✅ POST   /admin/products/:productId/variants
✅ GET    /admin/products/:productId/variants
✅ PATCH  /admin/products/variants/:id
✅ DELETE /admin/products/variants/:id
✅ POST   /admin/products/:productId/variants/generate (⭐)

Public (4 endpoints):
✅ GET /products
✅ GET /products/:id
✅ GET /products/featured/list
✅ GET /products/new/list
```

---

## ✅ Checklist للاختبار

### Setup:
- [ ] إنشاء 3-5 سمات عالمية
- [ ] إضافة 3-10 قيم لكل سمة
- [ ] التحقق من الـ slugs

### Products:
- [ ] إنشاء منتج بسيط (بدون variants)
- [ ] إنشاء منتج مع 2 سمات
- [ ] إنشاء منتج مع 3 سمات
- [ ] رفع صور من المستودع

### Variants:
- [ ] توليد variants تلقائياً
- [ ] التحقق من عدد الـ variants الصحيح
- [ ] تخصيص أسعار معينة
- [ ] تخصيص مخزون معين

### العرض:
- [ ] عرض قائمة منتجات
- [ ] عرض تفاصيل منتج
- [ ] التحقق من السمات والقيم
- [ ] التحقق من الـ variants

### الفلترة:
- [ ] فلترة حسب سمة واحدة
- [ ] فلترة حسب سمتين
- [ ] فلترة مع نطاق سعر
- [ ] فلترة مع فئة

---

**النظام جاهز 100% للاستخدام! 🚀**

---

**تم بواسطة:** Claude Sonnet 4.5  
**المشروع:** Tagadodo

