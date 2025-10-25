# Upload Module (Bunny.net Integration)

نظام رفع الملفات مع تكامل كامل مع Bunny.net Storage Zone.

## الميزات

- ✅ رفع ملف واحد أو متعدد
- ✅ تكامل مع Bunny.net Storage
- ✅ التحقق من صحة الملفات (حجم ونوع)
- ✅ توليد روابط CDN عامة
- ✅ حذف الملفات
- ✅ معلومات الملفات
- ✅ أمان JWT

## إعداد Bunny.net

1. إنشاء حساب على [Bunny.net](https://bunny.net)
2. إنشاء Storage Zone جديد
3. الحصول على API Key من لوحة التحكم
4. إعداد CDN (اختياري لتحسين الأداء)

## متغيرات البيئة

```env
# Bunny.net Storage Configuration
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_API_KEY=your-bunny-api-key
BUNNY_HOSTNAME=storage.bunnycdn.com
BUNNY_CDN_HOSTNAME=your-cdn-hostname.b-cdn.net
```

## API Endpoints

### رفع ملف واحد

```http
POST /upload/file
Content-Type: multipart/form-data

# Body: form-data
file: [binary file]
folder: products (optional)
filename: custom-name.jpg (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.bunny.net/uploads/uuid-filename.jpg",
    "filename": "uploads/uuid-filename.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

### رفع ملفات متعددة

```http
POST /upload/files
Content-Type: multipart/form-data

# Body: form-data
files: [binary files] (max 10 files)
folder: products (optional)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "...",
      "filename": "...",
      "size": ...,
      "mimeType": "..."
    }
  ]
}
```

### حذف ملف

```http
DELETE /upload/file
Content-Type: application/json

{
  "filePath": "uploads/my-file.jpg"
}
```

### معلومات ملف

```http
GET /upload/file/uploads/my-file.jpg
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "size": 1024000,
    "lastModified": "2023-10-13T10:00:00Z",
    "contentType": "image/jpeg"
  }
}
```

### تنظيف الملفات المحذوفة (Super Admin فقط)

```http
POST /admin/media/cleanup/deleted
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 15,
    "errors": []
  },
  "message": "تم تنظيف 15 ملف محذوف"
}
```

### تنظيف الملفات المكررة (Super Admin فقط)

```http
POST /admin/media/cleanup/duplicates
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "removedCount": 8,
    "errors": []
  },
  "message": "تم إزالة 8 ملف مكرر"
}
```

### تنظيف الملفات غير المستخدمة (Super Admin فقط)

```http
POST /admin/media/cleanup/unused?days=90
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "removedCount": 25,
    "errors": []
  },
  "message": "تم إزالة 25 ملف غير مستخدم"
}
```

## Media Management APIs (إدارة الوسائط)

### إدارة الوسائط المتقدمة

#### رفع ملف مع حفظ في قاعدة البيانات

```http
POST /admin/media/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

# Body: form-data
file: [binary file]
name: صورة منتج رئيسية
category: product
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "media_123",
    "url": "https://cdn.bunny.net/uploads/uuid-filename.jpg",
    "filename": "uuid-filename.jpg",
    "storedFilename": "uploads/uuid-filename.jpg",
    "name": "صورة منتج رئيسية",
    "category": "product",
    "type": "image",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "width": 1920,
    "height": 1080
  }
}
```

#### قائمة الوسائط

```http
GET /admin/media?category=product&page=1&limit=20
Authorization: Bearer <token>
```

#### تفاصيل وسيط محدد

```http
GET /admin/media/:id
Authorization: Bearer <token>
```

#### تحديث وسيط

```http
PATCH /admin/media/:id
Authorization: Bearer <token>

{
  "name": "اسم جديد للصورة",
  "category": "banner"
}
```

#### حذف وسيط (Soft Delete)

```http
DELETE /admin/media/:id
Authorization: Bearer <token>
```

#### استعادة وسيط محذوف

```http
POST /admin/media/:id/restore
Authorization: Bearer <token>
```

#### حذف نهائي (Super Admin)

```http
DELETE /admin/media/:id/permanent
Authorization: Bearer <token>
```

#### إحصائيات الوسائط

```http
GET /admin/media/stats/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "byCategory": {
      "product": 850,
      "banner": 150,
      "category": 200,
      "brand": 50
    },
    "byType": {
      "image": 1200,
      "video": 30,
      "document": 20
    },
    "storageUsed": 524288000,
    "deletedCount": 45
  }
}
```

## قيود الملفات

- **الحجم الأقصى**: 10MB لكل ملف
- **أنواع الملفات المسموحة**:
  - الصور: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - المستندات: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## أمثلة الاستخدام

### رفع صورة منتج

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'products');

const response = await fetch('/upload/file', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const result = await response.json();
console.log('Uploaded image URL:', result.data.url);
```

### حذف ملف

```javascript
const response = await fetch('/upload/file', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filePath: 'products/old-image.jpg'
  })
});
```

## ملاحظات مهمة

1. **جميع endpoints تتطلب مصادقة JWT**
2. **الملفات تُحفظ بأسماء فريدة** لتجنب التعارض
3. **استخدم CDN لتحسين الأداء** في الإنتاج
4. **احرص على نسخ API Key بأمان** ولا تشاركه في الكود
5. **تم إضافة آليات تنظيف متقدمة** للملفات غير المستخدمة والمكررة
6. **تحسين إدارة الأخطاء وتسجيل العمليات** لسهولة الصيانة

## تحسينات النظام

### ✅ إصلاحات تمت:
- **إصلاح عدم الاتساق في أسماء الملفات** بين التخزين وقاعدة البيانات
- **توحيد معالجة الأخطاء** بين جميع الخدمات
- **إزالة التكرار في التحقق** من صحة الملفات
- **تحسين إدارة URLs** مع fallback للـ CDN
- **تحسين الأمان** مع تسجيل العمليات الحساسة
- **إضافة آليات تنظيف** للبيانات والملفات غير المستخدمة

## استكشاف الأخطاء

### خطأ: "Bunny.net credentials not configured"
- تأكد من إعداد جميع متغيرات البيئة المطلوبة

### خطأ: "File size exceeds 10MB limit"
- قلل حجم الملف أو غير الحد الأقصى في الكود

### خطأ: "File type not allowed"
- تأكد من أن نوع الملف مدعوم (انظر قائمة الأنواع المسموحة)

---

## ✅ حالة النظام

**نظام Upload Module مكتمل بالكامل ويعمل كما هو موثق:**
- ✅ تكامل كامل مع Bunny.net Storage
- ✅ رفع ملف واحد ومتعدد يعمل بكفاءة
- ✅ نظام إدارة الوسائط المتقدم (Media Management)
- ✅ آليات تنظيف متقدمة (محذوف، مكرر، غير مستخدم)
- ✅ إحصائيات شاملة ومراقبة الأداء
- ✅ أمان JWT وحماية شاملة
- ✅ Schema محسن مع تصنيف وتتبع كامل
- ✅ Soft Delete و Permanent Delete

**النظام جاهز للإنتاج ويوفر إدارة ملفات احترافية!**
