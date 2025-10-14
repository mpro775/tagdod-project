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

## استكشاف الأخطاء

### خطأ: "Bunny.net credentials not configured"
- تأكد من إعداد جميع متغيرات البيئة المطلوبة

### خطأ: "File size exceeds 10MB limit"
- قلل حجم الملف أو غير الحد الأقصى في الكود

### خطأ: "File type not allowed"
- تأكد من أن نوع الملف مدعوم (انظر قائمة الأنواع المسموحة)
