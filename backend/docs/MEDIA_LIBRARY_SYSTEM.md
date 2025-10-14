# نظام مستودع الصور الذكي - دليل شامل

> 🎨 **مستودع ذكي للصور مع كشف التكرار والفلترة المتقدمة**

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الفئات المدعومة](#الفئات-المدعومة)
3. [الميزات الرئيسية](#الميزات-الرئيسية)
4. [API Endpoints](#api-endpoints)
5. [أمثلة عملية](#أمثلة-عملية)
6. [التكامل مع الصفحات](#التكامل-مع-الصفحات)
7. [كشف التكرار](#كشف-التكرار)

---

## نظرة عامة

نظام مستودع ذكي يسمح للأدمن بـ:
- ✅ رفع الصور وتصنيفها
- ✅ إعادة استخدام الصور المرفوعة
- ✅ كشف الصور المكررة تلقائياً
- ✅ البحث والفلترة المتقدمة
- ✅ تتبع استخدام الصور
- ✅ Soft Delete مع الاستعادة

---

## الفئات المدعومة

```typescript
enum MediaCategory {
  BANNER = 'banner',      // بانرات الصفحة الرئيسية
  PRODUCT = 'product',    // صور المنتجات
  CATEGORY = 'category',  // صور الفئات
  BRAND = 'brand',        // شعارات البراندات
  OTHER = 'other',        // أخرى
}
```

### استخدام كل فئة:

| الفئة | الاستخدام | مثال |
|------|-----------|------|
| **BANNER** | بانرات الصفحة الرئيسية | عروض، إعلانات |
| **PRODUCT** | صور المنتجات | صور المنتجات الرئيسية والإضافية |
| **CATEGORY** | صور الفئات | أيقونات وصور الفئات |
| **BRAND** | شعارات البراندات | لوجو Samsung, Apple, etc |
| **OTHER** | أي استخدام آخر | صور عامة |

---

## الميزات الرئيسية

### 1. رفع ذكي مع كشف التكرار

```typescript
// عند رفع صورة:
1. حساب hash للملف (SHA-256)
2. فحص التكرار في قاعدة البيانات
3. إذا موجودة → إرجاع الصورة الموجودة
4. إذا جديدة → رفع إلى Bunny.net وحفظ البيانات
```

**الفوائد:**
- ✅ توفير المساحة التخزينية
- ✅ تجنب رفع نفس الصورة مرتين
- ✅ سرعة في الأداء

---

### 2. البيانات المحفوظة لكل صورة

```typescript
{
  url: string;              // رابط الصورة
  filename: string;         // اسم الملف الأصلي
  storedFilename: string;   // اسم الملف المخزن
  name: string;             // الاسم الوصفي
  category: MediaCategory;  // الفئة
  type: MediaType;          // image | video | document
  mimeType: string;         // image/jpeg, image/png, etc
  size: number;             // حجم الملف بالبايت
  width?: number;           // عرض الصورة
  height?: number;          // ارتفاع الصورة
  fileHash: string;         // hash للكشف عن التكرار
  description: string;      // وصف اختياري
  tags: string[];           // وسوم للبحث
  uploadedBy: ObjectId;     // من قام بالرفع
  usageCount: number;       // عدد مرات الاستخدام
  usedIn: string[];         // أين تم استخدامها
  isPublic: boolean;        // عامة أم خاصة
  deletedAt: Date | null;   // Soft delete
}
```

---

### 3. البحث والفلترة

```typescript
// البحث في:
- name (الاسم)
- description (الوصف)
- tags (الوسوم)
- filename (اسم الملف)

// الفلترة حسب:
- category (الفئة)
- type (نوع الملف)
- isPublic (عامة/خاصة)
- تاريخ الرفع
```

---

## API Endpoints

### قائمة Endpoints:

| Endpoint | Method | الوصف | الحماية |
|---------|--------|-------|---------|
| `/admin/media/upload` | POST | رفع صورة جديدة | Admin+ |
| `/admin/media` | GET | قائمة الصور (pagination) | Admin+ |
| `/admin/media/:id` | GET | عرض صورة واحدة | Admin+ |
| `/admin/media/:id` | PATCH | تحديث بيانات الصورة | Admin+ |
| `/admin/media/:id` | DELETE | حذف مؤقت (soft) | Admin+ |
| `/admin/media/:id/restore` | POST | استعادة محذوفة | Admin+ |
| `/admin/media/:id/permanent` | DELETE | حذف نهائي | Super Admin |
| `/admin/media/stats/summary` | GET | إحصائيات المستودع | Admin+ |

---

## أمثلة عملية

### 1. رفع صورة إلى المستودع

```http
POST /admin/media/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "file": <binary>,
  "name": "بانر العروض الشتوية",
  "category": "banner",
  "description": "بانر خاص بعروض الشتاء",
  "tags": ["عروض", "شتاء", "تخفيضات"],
  "isPublic": true
}
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN, MODERATOR)`

**Response (صورة جديدة):**
```json
{
  "success": true,
  "data": {
    "_id": "media001",
    "url": "https://cdn.bunny.net/media/banner/uuid-image.jpg",
    "filename": "winter-banner.jpg",
    "name": "بانر العروض الشتوية",
    "category": "banner",
    "type": "image",
    "mimeType": "image/jpeg",
    "size": 256789,
    "width": 1920,
    "height": 1080,
    "fileHash": "abc123...",
    "description": "بانر خاص بعروض الشتاء",
    "tags": ["عروض", "شتاء", "تخفيضات"],
    "uploadedBy": "admin123",
    "usageCount": 0,
    "isPublic": true,
    "createdAt": "2025-10-13T15:00:00Z"
  },
  "meta": {
    "isDuplicate": false
  },
  "message": "تم رفع الصورة بنجاح",
  "requestId": "req-media001"
}
```

**Response (صورة مكررة):**
```json
{
  "success": true,
  "data": {
    "_id": "media001",
    "url": "https://cdn.bunny.net/media/banner/uuid-image.jpg",
    "name": "بانر العروض الشتوية",
    ...
  },
  "meta": {
    "isDuplicate": true
  },
  "message": "الصورة موجودة بالفعل في المستودع",
  "requestId": "req-media002"
}
```

---

### 2. قائمة الصور (مع Pagination)

```http
GET /admin/media?page=1&limit=24&category=product
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "media001",
      "url": "https://cdn.bunny.net/media/product/product1.jpg",
      "name": "صورة منتج 1",
      "category": "product",
      "type": "image",
      "size": 150000,
      "width": 800,
      "height": 600,
      "usageCount": 5,
      "uploadedBy": {
        "_id": "admin123",
        "firstName": "مدير",
        "lastName": "النظام",
        "phone": "0550000001"
      },
      "createdAt": "2025-10-13T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 24,
    "total": 150,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "requestId": "req-media003"
}
```

---

### 3. البحث في المستودع

```http
GET /admin/media?search=عروض
Authorization: Bearer <admin_token>
```

**يبحث في:**
- الاسم
- الوصف
- الوسوم
- اسم الملف

---

### 4. فلترة حسب الفئة

```http
GET /admin/media?category=banner&page=1
Authorization: Bearer <admin_token>
```

---

### 5. تحديث بيانات الصورة

```http
PATCH /admin/media/media001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "بانر العروض الشتوية المحدث",
  "description": "وصف جديد",
  "tags": ["عروض", "شتاء", "2025"],
  "category": "banner"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media001",
    "name": "بانر العروض الشتوية المحدث",
    "category": "banner",
    "updated": true
  },
  "requestId": "req-media004"
}
```

---

### 6. حذف صورة (Soft Delete)

```http
DELETE /admin/media/media001
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media001",
    "deleted": true,
    "deletedAt": "2025-10-13T16:00:00Z"
  },
  "requestId": "req-media005"
}
```

---

### 7. استعادة صورة محذوفة

```http
POST /admin/media/media001/restore
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media001",
    "restored": true
  },
  "requestId": "req-media006"
}
```

---

### 8. حذف نهائي (Super Admin فقط)

```http
DELETE /admin/media/media001/permanent
Authorization: Bearer <super_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media001",
    "permanentlyDeleted": true
  },
  "requestId": "req-media007"
}
```

⚠️ **تحذير:** الحذف النهائي يحذف الصورة من Bunny.net ومن قاعدة البيانات!

---

### 9. إحصائيات المستودع

```http
GET /admin/media/stats/summary
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 456,
    "byCategory": {
      "banner": 45,
      "product": 320,
      "category": 50,
      "brand": 30,
      "other": 11
    },
    "totalSizeMB": "1250.50",
    "recentlyAdded": [
      {
        "_id": "media456",
        "name": "أحدث صورة",
        "category": "product",
        "url": "https://...",
        "createdAt": "2025-10-13T16:30:00Z"
      }
    ]
  },
  "requestId": "req-media008"
}
```

---

## التكامل مع الصفحات

### سيناريو: إضافة صورة منتج

#### في صفحة إضافة/تعديل المنتج:

```typescript
// 1. خيار للمستخدم
<select name="imageSource">
  <option value="library">من المستودع</option>
  <option value="upload">رفع جديد</option>
</select>

// 2أ. إذا اختار "من المستودع":
// → فتح modal يعرض الصور من: GET /admin/media?category=product
// → عند اختيار صورة → استخدام media._id و media.url

// 2ب. إذا اختار "رفع جديد":
// → رفع مباشرة إلى: POST /admin/media/upload
// → مع category: "product"
```

#### عند حفظ المنتج:

```typescript
// إذا كانت الصورة من المستودع:
POST /admin/products
{
  "name": "منتج جديد",
  "imageId": "media001",  // من المستودع
  "image": "https://cdn.bunny.net/media/product/..."
}

// في Backend:
// عند إنشاء منتج بـ imageId:
await mediaService.incrementUsage(imageId, productId);
```

---

### سيناريو: تعديل صورة منتج

```typescript
// عند تغيير صورة المنتج:
const oldImageId = product.imageId;
const newImageId = dto.imageId;

if (oldImageId) {
  await mediaService.decrementUsage(oldImageId, productId);
}

if (newImageId) {
  await mediaService.incrementUsage(newImageId, productId);
}
```

---

### سيناريو: حذف منتج

```typescript
// عند حذف منتج:
if (product.imageId) {
  await mediaService.decrementUsage(product.imageId, productId);
}
```

---

## كشف التكرار

### آلية العمل:

```typescript
1. عند رفع صورة جديدة:
   └─ حساب SHA-256 hash للملف
   
2. البحث في قاعدة البيانات:
   └─ هل يوجد hash مطابق؟
   
3أ. إذا موجود:
   └─ إرجاع الصورة الموجودة
   └─ message: "الصورة موجودة بالفعل في المستودع"
   └─ isDuplicate: true
   
3ب. إذا جديد:
   └─ رفع إلى Bunny.net
   └─ حفظ البيانات مع الـ hash
   └─ isDuplicate: false
```

### الفوائد:

✅ **توفير المساحة** - لا تُرفع نفس الصورة مرتين  
✅ **توفير الوقت** - رد فوري للصور المكررة  
✅ **توفير التكلفة** - تقليل استهلاك bandwidth  
✅ **تنظيم أفضل** - صورة واحدة تُستخدم في أماكن متعددة  

---

## Soft Delete

### لماذا؟

- ✅ حماية من الحذف الخاطئ
- ✅ إمكانية الاستعادة
- ✅ الاحتفاظ بالسجلات

### كيف؟

```typescript
// عند الحذف:
media.deletedAt = new Date();
media.deletedBy = userId;
await media.save();

// الصور المحذوفة لا تظهر في القوائم
query.deletedAt = null;

// إلا إذا طلبها صراحة:
GET /admin/media?includeDeleted=true
```

---

## تتبع الاستخدام

### usageCount & usedIn

```typescript
{
  usageCount: 5,          // استخدمت في 5 أماكن
  usedIn: [
    'product_001',
    'product_002',
    'category_05',
    'banner_main',
    'brand_samsung'
  ]
}
```

### الفائدة:

- ✅ معرفة الصور الأكثر استخداماً
- ✅ تحذير قبل الحذف النهائي
- ✅ تتبع أماكن استخدام الصورة

---

## أمثلة تكامل كاملة

### مثال 1: إضافة منتج مع صورة من المستودع

```http
# 1. عرض صور المنتجات
GET /admin/media?category=product&page=1&limit=20

# 2. المستخدم يختار صورة: media123

# 3. إنشاء المنتج
POST /admin/products
{
  "name": "هاتف Samsung Galaxy",
  "imageId": "media123",
  "image": "https://cdn.bunny.net/media/product/galaxy.jpg"
}

# في Backend (Product Service):
await mediaService.incrementUsage('media123', newProduct._id);
```

---

### مثال 2: إضافة منتج مع رفع صورة جديدة

```http
# 1. رفع صورة جديدة
POST /admin/media/upload
Content-Type: multipart/form-data
{
  "file": <binary>,
  "name": "هاتف iPhone 15",
  "category": "product"
}

# Response:
{
  "data": {
    "_id": "media456",
    "url": "https://...",
    ...
  },
  "meta": { "isDuplicate": false }
}

# 2. إنشاء المنتج بالصورة الجديدة
POST /admin/products
{
  "name": "iPhone 15",
  "imageId": "media456",
  "image": "https://..."
}
```

---

### مثال 3: تعديل صورة فئة

```http
# 1. عرض صور الفئات
GET /admin/media?category=category

# 2. اختيار صورة جديدة: media789

# 3. تحديث الفئة
PATCH /admin/categories/category123
{
  "imageId": "media789",
  "image": "https://..."
}

# في Backend:
# تقليل استخدام الصورة القديمة
await mediaService.decrementUsage(oldImageId, category123);
# زيادة استخدام الصورة الجديدة
await mediaService.incrementUsage('media789', category123);
```

---

## Checklist للتطوير

### Backend:
- [x] Media Schema
- [x] Media Service
- [x] Media Controller
- [x] كشف التكرار
- [x] Pagination & Filtering
- [x] Soft Delete
- [x] تتبع الاستخدام

### Frontend (للتطوير):
- [ ] صفحة المستودع (Media Library)
- [ ] مكون اختيار الصورة (Image Picker)
- [ ] رفع صورة جديدة
- [ ] عرض grid للصور
- [ ] بحث وفلترة
- [ ] modal لاختيار من المستودع
- [ ] تكامل مع صفحات المنتجات/الفئات/البراندات

---

## نصائح مهمة

1. **استخدم المستودع دائماً** - تجنب رفع نفس الصورة مرتين
2. **أضف وسوم واضحة** - تسهل البحث لاحقاً
3. **اختر الفئة الصحيحة** - تنظيم أفضل
4. **Soft Delete أولاً** - يمكن الاستعادة
5. **تتبع الاستخدام** - اعرف أين استخدمت الصورة

---

## الخلاصة

✅ **نظام مستودع ذكي** مع كشف تكرار تلقائي  
✅ **تصنيف منظم** حسب الاستخدام (بانرات، منتجات، إلخ)  
✅ **بحث وفلترة** متقدمة  
✅ **تتبع استخدام** كامل  
✅ **Soft Delete** آمن  
✅ **جاهز للتكامل** مع جميع الصفحات  

**النظام جاهز للاستخدام! 🚀**

---

**تم بواسطة:** Claude Sonnet 4.5  
**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Tagadodo

