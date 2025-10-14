# أمثلة API - نظام الفئات

> ⚠️ **ملاحظة:** جميع الأمثلة تستخدم نظام الردود الموحد والحمايات.

## 📋 الفهرس

1. [إنشاء الفئات](#1-إنشاء-الفئات)
2. [عرض الفئات](#2-عرض-الفئات)
3. [تحديث الفئات](#3-تحديث-الفئات)
4. [الحذف والاستعادة](#4-الحذف-والاستعادة)
5. [الشجرة والتنقل](#5-الشجرة-والتنقل)
6. [الإحصائيات](#6-الإحصائيات)
7. [سيناريوهات كاملة](#7-سيناريوهات-كاملة)

---

## 1. إنشاء الفئات

### مثال 1: إنشاء فئة جذر (Root)

```http
POST /admin/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "إلكترونيات",
  "description": "جميع المنتجات الإلكترونية",
  "parentId": null,
  "imageId": "media001",
  "iconId": "media002",
  "metaTitle": "إلكترونيات - أفضل الأسعار",
  "metaDescription": "تسوق الإلكترونيات بأفضل الأسعار",
  "metaKeywords": ["إلكترونيات", "أجهزة", "تقنية"],
  "order": 1,
  "isActive": true,
  "showInMenu": true,
  "isFeatured": true
}
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN, MODERATOR)`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cat_elec_001",
    "name": "إلكترونيات",
    "slug": "electronics",
    "path": "/electronics",
    "depth": 0,
    "parentId": null,
    "description": "جميع المنتجات الإلكترونية",
    "imageId": "media001",
    "iconId": "media002",
    "order": 1,
    "isActive": true,
    "showInMenu": true,
    "isFeatured": true,
    "childrenCount": 0,
    "productsCount": 0,
    "createdAt": "2025-10-13T10:00:00Z",
    "updatedAt": "2025-10-13T10:00:00Z"
  },
  "requestId": "req-cat001"
}
```

---

### مثال 2: إنشاء فئة فرعية (Level 1)

```http
POST /admin/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "هواتف ذكية",
  "parentId": "cat_elec_001",
  "description": "جميع أنواع الهواتف الذكية",
  "imageId": "media003",
  "order": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cat_phones_001",
    "name": "هواتف ذكية",
    "slug": "smart-phones",
    "path": "/electronics/smart-phones",
    "depth": 1,
    "parentId": "cat_elec_001",
    "order": 1,
    "childrenCount": 0,
    "productsCount": 0
  },
  "requestId": "req-cat002"
}
```

**ملاحظة:** تم تحديث `cat_elec_001.childrenCount = 1` تلقائياً ✅

---

### مثال 3: إنشاء فئة فرعية (Level 2)

```http
POST /admin/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "آيفون",
  "parentId": "cat_phones_001",
  "iconId": "media004",
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cat_iphone",
    "name": "آيفون",
    "slug": "iphone",
    "path": "/electronics/smart-phones/iphone",
    "depth": 2,
    "parentId": "cat_phones_001"
  },
  "requestId": "req-cat003"
}
```

---

### خطأ: slug مكرر

```http
POST /admin/categories
{
  "name": "إلكترونيات",
  "parentId": null
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_SLUG_EXISTS",
    "message": "اسم الفئة موجود بالفعل",
    "details": null
  },
  "requestId": "req-err001"
}
```

---

## 2. عرض الفئات

### مثال 1: قائمة الفئات الجذر

```http
GET /admin/categories?parentId=null
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "cat_elec_001",
      "name": "إلكترونيات",
      "slug": "electronics",
      "path": "/electronics",
      "depth": 0,
      "order": 1,
      "isFeatured": true,
      "childrenCount": 3,
      "productsCount": 150
    },
    {
      "_id": "cat_home_002",
      "name": "أجهزة منزلية",
      "slug": "home-appliances",
      "path": "/home-appliances",
      "depth": 0,
      "order": 2,
      "childrenCount": 2,
      "productsCount": 85
    }
  ],
  "requestId": "req-list001"
}
```

---

### مثال 2: قائمة الفئات الفرعية

```http
GET /admin/categories?parentId=cat_elec_001
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "cat_phones_001",
      "name": "هواتف ذكية",
      "parentId": "cat_elec_001",
      "path": "/electronics/smart-phones",
      "depth": 1,
      "order": 1
    },
    {
      "_id": "cat_computers",
      "name": "حواسيب",
      "parentId": "cat_elec_001",
      "path": "/electronics/computers",
      "depth": 1,
      "order": 2
    }
  ],
  "requestId": "req-list002"
}
```

---

### مثال 3: البحث في الفئات

```http
GET /admin/categories?search=هواتف
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "cat_phones_001",
      "name": "هواتف ذكية",
      "description": "جميع أنواع الهواتف الذكية"
    }
  ]
}
```

---

### مثال 4: الفئات المميزة فقط

```http
GET /categories/featured/list
```

**Guards:** لا توجد (Public)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "cat_elec_001",
      "name": "إلكترونيات",
      "isFeatured": true,
      "image": "https://cdn.bunny.net/..."
    },
    {
      "_id": "cat_phones_001",
      "name": "هواتف ذكية",
      "isFeatured": true
    }
  ],
  "requestId": "req-featured001"
}
```

---

## 3. تحديث الفئات

### مثال 1: تحديث معلومات أساسية

```http
PATCH /admin/categories/cat_elec_001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "description": "وصف جديد محسّن",
  "order": 5,
  "isFeatured": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cat_elec_001",
    "name": "إلكترونيات",
    "description": "وصف جديد محسّن",
    "order": 5,
    "isFeatured": false
  },
  "requestId": "req-update001"
}
```

---

### مثال 2: تغيير الاسم (مع تحديث path للأطفال)

```http
PATCH /admin/categories/cat_phones_001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "الهواتف الذكية"
}
```

**ما يحدث:**
```typescript
// الفئة نفسها:
cat_phones_001.name = "الهواتف الذكية"
cat_phones_001.slug = "smart-phones-updated"
cat_phones_001.path = "/electronics/smart-phones-updated"

// جميع الأطفال تتحدث تلقائياً:
cat_iphone.path = "/electronics/smart-phones-updated/iphone" ✅
cat_samsung.path = "/electronics/smart-phones-updated/samsung" ✅
```

---

### مثال 3: تحديث الصورة

```http
PATCH /admin/categories/cat_elec_001
{
  "imageId": "media_new_123",
  "image": "https://cdn.bunny.net/new-image.jpg"
}
```

---

## 4. الحذف والاستعادة

### حذف مؤقت (Soft Delete)

```http
DELETE /admin/categories/cat_iphone
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "deletedAt": "2025-10-13T15:00:00Z"
  },
  "requestId": "req-delete001"
}
```

**ملاحظة:** تم تحديث `cat_phones_001.childrenCount = 1` (كان 2) ✅

---

### محاولة حذف فئة لديها أطفال

```http
DELETE /admin/categories/cat_phones_001
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_HAS_CHILDREN",
    "message": "لا يمكن حذف فئة تحتوي على فئات فرعية. احذف الفئات الفرعية أولاً",
    "details": {
      "childrenCount": 1
    }
  }
}
```

---

### استعادة فئة محذوفة

```http
POST /admin/categories/cat_iphone/restore
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "restored": true
  },
  "requestId": "req-restore001"
}
```

---

### حذف نهائي (Super Admin فقط)

```http
DELETE /admin/categories/cat_iphone/permanent
Authorization: Bearer <super_admin_token>
```

**Guards:** `Roles(SUPER_ADMIN)` فقط

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "requestId": "req-hard-delete001"
}
```

⚠️ **تحذير:** لا يمكن التراجع!

---

## 5. الشجرة والتنقل

### الشجرة الكاملة

```http
GET /categories/tree
```

**Guards:** لا توجد (Public)  
**Cache:** 1 hour

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "cat_elec",
      "name": "إلكترونيات",
      "path": "/electronics",
      "image": "https://...",
      "children": [
        {
          "_id": "cat_phones",
          "name": "هواتف",
          "path": "/electronics/phones",
          "children": [
            {
              "_id": "cat_iphone",
              "name": "آيفون",
              "path": "/electronics/phones/iphone",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

### Breadcrumbs

```http
GET /categories/cat_iphone
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cat_iphone",
    "name": "آيفون",
    "path": "/electronics/phones/iphone",
    "depth": 2,
    "breadcrumbs": [
      { "id": "cat_elec", "name": "إلكترونيات", "path": "/electronics" },
      { "id": "cat_phones", "name": "هواتف", "path": "/electronics/phones" },
      { "id": "cat_iphone", "name": "آيفون", "path": "/electronics/phones/iphone" }
    ],
    "children": []
  }
}
```

---

## 6. الإحصائيات

```http
GET /admin/categories/stats/summary
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "active": 40,
    "featured": 5,
    "deleted": 5,
    "byDepth": {
      "level_0": 8,
      "level_1": 25,
      "level_2": 12
    }
  },
  "requestId": "req-stats001"
}
```

---

## 7. سيناريوهات كاملة

### سيناريو 1: بناء متجر إلكترونيات

```http
# 1. الفئة الرئيسية
POST /admin/categories
{
  "name": "إلكترونيات",
  "parentId": null,
  "imageId": "media001",
  "order": 1,
  "isFeatured": true
}
# Response: cat_elec

# 2. فئات Level 1
POST /admin/categories
{ "name": "هواتف", "parentId": "cat_elec", "order": 1 }
# Response: cat_phones

POST /admin/categories
{ "name": "حواسيب", "parentId": "cat_elec", "order": 2 }
# Response: cat_computers

POST /admin/categories
{ "name": "ساعات ذكية", "parentId": "cat_elec", "order": 3 }
# Response: cat_watches

# 3. فئات Level 2 (تحت هواتف)
POST /admin/categories
{ "name": "آيفون", "parentId": "cat_phones", "order": 1 }

POST /admin/categories
{ "name": "سامسونج", "parentId": "cat_phones", "order": 2 }

POST /admin/categories
{ "name": "هواوي", "parentId": "cat_phones", "order": 3 }

# 4. عرض الشجرة
GET /categories/tree

# النتيجة:
إلكترونيات (childrenCount: 3)
├─ هواتف (childrenCount: 3)
│  ├─ آيفون
│  ├─ سامسونج
│  └─ هواوي
├─ حواسيب
└─ ساعات ذكية
```

---

### سيناريو 2: تكامل مع مستودع الصور

```http
# 1. رفع صورة إلى المستودع
POST /admin/media/upload
Content-Type: multipart/form-data
{
  "file": <binary>,
  "name": "صورة فئة الإلكترونيات",
  "category": "category"
}

# Response:
{
  "data": {
    "_id": "media123",
    "url": "https://cdn.bunny.net/..."
  }
}

# 2. إنشاء فئة بالصورة
POST /admin/categories
{
  "name": "إلكترونيات",
  "imageId": "media123",
  "image": "https://cdn.bunny.net/..."
}

# 3. عند عرض الفئة
GET /categories/cat_elec

# Response (مع populate):
{
  "imageId": {
    "_id": "media123",
    "url": "https://cdn.bunny.net/...",
    "name": "صورة فئة الإلكترونيات",
    "category": "category"
  }
}
```

---

### سيناريو 3: إدارة القائمة الرئيسية

```http
# 1. تحديد الفئات المعروضة
PATCH /admin/categories/cat_elec
{ "showInMenu": true, "order": 1 }

PATCH /admin/categories/cat_home
{ "showInMenu": true, "order": 2 }

PATCH /admin/categories/cat_fashion
{ "showInMenu": false }  ← لن تظهر في القائمة

# 2. جلب فئات القائمة الرئيسية
GET /categories?parentId=null&isActive=true

# Response: فقط الفئات التي showInMenu = true
```

---

### سيناريو 4: الفئات المميزة في الصفحة الرئيسية

```http
# 1. تحديد الفئات المميزة
PATCH /admin/categories/cat_elec
{ "isFeatured": true }

PATCH /admin/categories/cat_phones
{ "isFeatured": true }

# 2. في الصفحة الرئيسية
GET /categories/featured/list

# Response: فقط الفئات المميزة
```

---

## Checklist للاختبار

### CRUD الأساسية:
- [ ] إنشاء فئة جذر
- [ ] إنشاء فئة فرعية Level 1
- [ ] إنشاء فئة فرعية Level 2
- [ ] تحديث فئة
- [ ] حذف فئة (soft)
- [ ] استعادة فئة
- [ ] حذف نهائي (Super Admin)

### Parent-Child:
- [ ] التحقق من تحديث childrenCount
- [ ] التحقق من حساب depth الصحيح
- [ ] التحقق من path الصحيح
- [ ] تحديث path عند تغيير الاسم
- [ ] منع حذف فئة لديها أطفال

### الشجرة والتنقل:
- [ ] عرض الشجرة الكاملة
- [ ] Breadcrumbs صحيحة
- [ ] Children يتم جلبهم بشكل صحيح

### التكامل:
- [ ] تكامل مع Media Library
- [ ] populate للصور
- [ ] عرض الصور في القوائم

### الأداء:
- [ ] Cache يعمل بشكل صحيح
- [ ] البحث سريع
- [ ] الفلترة تعمل

---

**جاهز للاستخدام! 🚀**

---

**تم بواسطة:** Claude Sonnet 4.5  
**المشروع:** Tagadodo

