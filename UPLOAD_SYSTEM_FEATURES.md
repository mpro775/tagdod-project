# مميزات نظام الرفع والوسائط الشامل

## مقدمة عن النظام

نظام رفع وإدارة الوسائط المتقدم مع تكامل كامل مع خدمة Bunny.net Storage Zone لتخزين الملفات بطريقة آمنة وقابلة للتوسع. النظام يدعم رفع الملفات الفردية والمتعددة مع إمكانيات متقدمة للتحقق من صحة الملفات، إدارة الملفات، والتنظيف التلقائي.

## قسم التكامل مع Bunny.net

### خدمة التخزين السحابي

#### 1. **إعداد Bunny.net Storage**
```env
# متغيرات البيئة المطلوبة
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_API_KEY=your-bunny-api-key
BUNNY_HOSTNAME=storage.bunnycdn.com
BUNNY_CDN_HOSTNAME=your-cdn-hostname.b-cdn.net
```

#### 2. **خطوات الإعداد**
1. إنشاء حساب على [Bunny.net](https://bunny.net)
2. إنشاء Storage Zone جديد
3. الحصول على API Key من لوحة التحكم
4. إعداد CDN اختياري لتحسين الأداء

## قسم أنواع البيانات والحقول

### بنية بيانات الوسائط

#### 1. **نموذج الوسائط (Media Schema)**
```typescript
interface Media {
  // البيانات الأساسية
  _id: string;
  url: string;                    // رابط الصورة العام
  filename: string;              // اسم الملف الأصلي
  storedFilename: string;        // اسم الملف المخزن في Bunny
  name: string;                  // الاسم الوصفي للملف

  // التصنيف والنوع
  category: MediaCategory;       // فئة الوسائط
  type: MediaType;              // نوع الملف (صورة، فيديو، مستند)
  mimeType: string;             // نوع MIME للملف

  // أبعاد وحجم الملف
  size: number;                 // حجم الملف بالبايت
  width?: number;               // عرض الصورة (للصور فقط)
  height?: number;              // ارتفاع الصورة (للصور فقط)
  fileHash?: string;            // hash للملف للكشف عن التكرار

  // البيانات الوصفية
  description?: string;         // وصف اختياري للوسائط
  tags?: string[];              // وسوم للبحث والتصنيف

  // معلومات المستخدم
  uploadedBy: string;           // معرف المستخدم الذي رفع الملف

  // التتبع والاستخدام
  usageCount: number;           // عدد مرات استخدام الوسائط
  usedIn?: string[];            // قائمة المعرفات التي تستخدم هذه الوسائط

  // إعدادات الخصوصية
  isPublic: boolean;            // هل الوسائط عامة أم خاصة

  // الحذف الناعم (Soft Delete)
  deletedAt?: Date | null;      // تاريخ الحذف الناعم
  deletedBy?: string;           // معرف المستخدم الذي حذف الملف

  // تواريخ النظام
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### 2. **فئات الوسائط (Media Categories)**
| الفئة | الوصف | أمثلة الاستخدام |
|-------|-------|-----------------|
| `banner` | بانرات وصور الترويج | الصفحة الرئيسية، الحملات الإعلانية |
| `product` | صور المنتجات | صور المنتجات في المتجر |
| `category` | صور الفئات | أيقونات وصور فئات المنتجات |
| `brand` | صور البراندات | شعارات ولوقو البراندات |
| `other` | أنواع أخرى | صور متنوعة أخرى |

#### 3. **أنواع الملفات المدعومة**
| نوع الملف | أنواع MIME المدعومة |
|-----------|---------------------|
| **الصور** | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| **المستندات** | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

## قسم واجهات برمجة التطبيقات

### APIs المتاحة والمفصلة

#### 1. **رفع ملف واحد**
```http
POST /upload/file
Content-Type: multipart/form-data

# Body: form-data
file: [binary file]
folder: products (optional)
filename: custom-name.jpg (optional)
```

**الاستجابة:**
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

#### 2. **رفع ملفات متعددة**
```http
POST /upload/files
Content-Type: multipart/form-data

# Body: form-data
files: [binary files] (max 10 files)
folder: products (optional)
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [
    {
      "url": "https://cdn.bunny.net/uploads/file1.jpg",
      "filename": "uploads/uuid-file1.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg"
    },
    {
      "url": "https://cdn.bunny.net/uploads/file2.jpg",
      "filename": "uploads/uuid-file2.jpg",
      "size": 2048000,
      "mimeType": "image/png"
    }
  ]
}
```

#### 3. **حذف ملف**
```http
DELETE /upload/file
Content-Type: application/json

{
  "filePath": "uploads/my-file.jpg"
}
```

#### 4. **الحصول على معلومات الملف**
```http
GET /upload/file/uploads/my-file.jpg
```

**الاستجابة:**
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

#### 5. **واجهات إدارة الوسائط**
```typescript
// إنشاء وسائط جديدة
POST /media
{
  "name": "صورة منتج جديد",
  "category": "product",
  "description": "صورة رئيسية للمنتج",
  "tags": ["منتج", "جديد"],
  "isPublic": true
}

// قائمة الوسائط مع فلترة
GET /media?category=product&page=1&limit=20

// تحديث معلومات الوسائط
PATCH /media/:id
{
  "name": "صورة منتج محدثة",
  "tags": ["منتج", "محدث"]
}

// حذف وسائط (ناعم)
DELETE /media/:id

// البحث في الوسائط
GET /media/search?q=منتج&category=product
```

## قسم التحقق من صحة الملفات

### آليات التحقق والأمان

#### 1. **قيود الملفات**
```typescript
// الحدود المطبقة
const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024,     // 10MB لكل ملف
  MAX_FILES: 10,                  // 10 ملفات كحد أقصى للرفع المتعدد
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};
```

#### 2. **التحقق من صحة الملفات**
```typescript
// دوال التحقق
validateFile(file: Express.Multer.File) {
  // التحقق من الحجم
  if (file.size > FILE_LIMITS.MAX_SIZE) {
    throw new BadRequestException(`File size exceeds ${FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB limit`);
  }

  // التحقق من النوع
  if (!FILE_LIMITS.ALLOWED_TYPES.IMAGES.includes(file.mimetype) &&
      !FILE_LIMITS.ALLOWED_TYPES.DOCUMENTS.includes(file.mimetype)) {
    throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
  }

  // التحقق من وجود الملف
  if (!file.buffer || file.buffer.length === 0) {
    throw new BadRequestException('File buffer is empty');
  }
}
```

## قسم إدارة الملفات والوسائط

### إدارة شاملة للملفات

#### 1. **توليد أسماء الملفات الفريدة**
```typescript
// توليد اسم فريد للملف
const generateUniqueFilename = (originalName: string, customName?: string) => {
  const fileExtension = originalName.split('.').pop();
  const baseName = customName || originalName.replace(/\.[^/.]+$/, '');
  const uuid = uuidv4();
  return `${uuid}-${baseName}.${fileExtension}`;
};

// مثال:
// originalName: "product-image.jpg"
// customName: "main-product"
// result: "uuid-main-product.jpg"
```

#### 2. **تنظيم المجلدات**
```typescript
// تنظيم الملفات حسب الفئات
const FOLDER_STRUCTURE = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  BANNERS: 'banners',
  DOCUMENTS: 'documents',
  TEMP: 'temp',
  OTHER: 'other'
};

// رفع في مجلد محدد
await uploadFile(file, FOLDER_STRUCTURE.PRODUCTS);
```

## قسم الأمان والحماية

### حماية شاملة للنظام

#### 1. **حماية المصادقة**
- **JWT Authentication**: تشفير وحماية شاملة للجلسات
- **Role-based Access Control**: صلاحيات محددة لكل دور
- **API Key Security**: حماية مفاتيح Bunny.net API

#### 2. **حماية الملفات**
- **File Type Validation**: التحقق من أنواع الملفات المسموحة
- **File Size Limits**: تحديد أحجام الملفات المسموحة
- **Virus Scanning**: فحص الملفات بحثاً عن البرمجيات الضارة
- **Content Security**: منع رفع المحتوى الضار

#### 3. **تسجيل العمليات**
```typescript
// تسجيل جميع عمليات الرفع والحذف
const logFileOperation = (operation: 'upload' | 'delete', fileInfo: any, userId: string) => {
  logger.log(`${operation.toUpperCase()}: ${fileInfo.filename} by user ${userId}`, {
    operation,
    filename: fileInfo.filename,
    size: fileInfo.size,
    mimeType: fileInfo.mimeType,
    userId,
    timestamp: new Date()
  });
};
```

## قسم الأداء والتحسين

### تحسينات الأداء والسرعة

#### 1. **تكامل CDN**
```typescript
// استخدام CDN لتسريع التوزيع
const getPublicUrl = (filePath: string, useCDN: boolean = true) => {
  if (useCDN && cdnHostname) {
    return `https://${cdnHostname}/${filePath}`;
  } else {
    return `https://${hostname}/${storageZoneName}/${filePath}`;
  }
};

// مزايا CDN:
// - تسريع تحميل الملفات
// - تقليل الحمل على الخادم
// - توفر عالمي للملفات
```

#### 2. **التخزين المؤقت والضغط**
```typescript
// ضغط الصور تلقائياً
const optimizeImage = (buffer: Buffer, format: string) => {
  // ضغط الصور حسب النوع والجودة
  // تقليل حجم الملف مع الحفاظ على الجودة
};

// التخزين المؤقت للروابط
const cacheFileUrls = (filePath: string, url: string, ttl: number = 3600) => {
  // تخزين مؤقت لروابط الملفات
  // تقليل عدد طلبات API
};
```

## قسم التنظيف والصيانة

### آليات التنظيف التلقائي

#### 1. **تنظيف الملفات المحذوفة**
```typescript
// حذف الملفات من Bunny.net
POST /admin/media/cleanup/deleted

// يقوم بـ:
// - البحث عن الملفات المحذوفة ناعماً
// - حذفها من Bunny.net Storage
// - إزالة السجلات من قاعدة البيانات
```

#### 2. **تنظيف الملفات المكررة**
```typescript
// البحث عن الملفات المكررة
POST /admin/media/cleanup/duplicates

// يقوم بـ:
// - حساب hash لكل ملف
// - العثور على الملفات المكررة
// - الاحتفاظ بالنسخة الأحدث
// - حذف النسخ المكررة
```

#### 3. **تنظيف الملفات غير المستخدمة**
```typescript
// حذف الملفات غير المستخدمة
POST /admin/media/cleanup/unused?days=90

// يقوم بـ:
// - البحث عن الملفات التي لم تستخدم لمدة معينة
// - التحقق من عدم وجود مراجع لها في قاعدة البيانات
// - حذف الملفات غير المستخدمة
// - تحرير مساحة التخزين
```

## قسم البحث والتصفح

### إمكانيات البحث المتقدمة

#### 1. **البحث في الوسائط**
```typescript
// البحث بالنص الكامل
GET /media/search?q=منتج جديد&category=product&page=1&limit=20

// فلترة بالفئات
GET /media?category=product&isPublic=true&page=1&limit=20

// ترتيب النتائج
GET /media?sortBy=createdAt&sortOrder=desc
GET /media?sortBy=usageCount&sortOrder=desc
```

#### 2. **فهارس البحث المحسنة**
```typescript
// فهارس محسّنة للأداء
MediaSchema.index({ category: 1, createdAt: -1 });
MediaSchema.index({ name: 'text', description: 'text', tags: 'text' });
MediaSchema.index({ fileHash: 1 }, { sparse: true });
MediaSchema.index({ uploadedBy: 1, createdAt: -1 });
```

## قسم التكامل والاستخدام

### تكامل مع الأنظمة الأخرى

#### 1. **تكامل مع نظام المنتجات**
```typescript
// رفع صور المنتجات تلقائياً
const uploadProductImages = async (productId: string, images: File[]) => {
  const uploadPromises = images.map(image =>
    uploadService.uploadFile(image, 'products')
  );

  const results = await Promise.all(uploadPromises);

  // حفظ مراجع الصور في المنتج
  await productService.updateImages(productId, results.map(r => r.url));
};
```

#### 2. **تكامل مع نظام المستخدمين**
```typescript
// تتبع من قام بالرفع
const trackUploadActivity = (fileInfo: any, userId: string) => {
  // تسجيل نشاط الرفع
  // إرسال إشعارات للمشرفين عند الحاجة
  // مراقبة استخدام المساحة لكل مستخدم
};
```

## قسم الأمان المتقدم

### حماية متقدمة للملفات

#### 1. **الحماية من الهجمات**
- **SQL Injection Protection**: حماية من هجمات الحقن
- **XSS Protection**: حماية من هجمات Cross-Site Scripting
- **CSRF Protection**: حماية من هجمات تزوير الطلبات
- **Rate Limiting**: تحديد معدل الطلبات لمنع الإساءة

#### 2. **التحقق من الهوية**
```typescript
// التحقق من صحة المستخدم
const validateUserPermissions = (user: any, action: string) => {
  if (!user) {
    throw new UnauthorizedException('Authentication required');
  }

  if (!hasPermission(user.role, action)) {
    throw new ForbiddenException('Insufficient permissions');
  }
};
```

#### 3. **مراقبة العمليات الحساسة**
```typescript
// مراقبة عمليات الحذف والتعديل
const logSensitiveOperations = (operation: string, userId: string, fileInfo: any) => {
  logger.warn(`SENSITIVE OPERATION: ${operation} by user ${userId}`, {
    operation,
    userId,
    filename: fileInfo.filename,
    filePath: fileInfo.filePath,
    timestamp: new Date()
  });

  // إرسال إشعار للمشرفين عند الحاجة
};
```

## قسم البيئات والاختبار

### دعم جميع البيئات

#### 1. **البيئة التطويرية**
- **التسجيل المفصل**: سجلات شاملة للتتبع والتشخيص
- **اختبار سهل**: إمكانية اختبار جميع السيناريوهات
- **مرونة في البيانات**: قبول ملفات اختبار متنوعة

#### 2. **البيئة الإنتاجية**
- **الأداء المحسن**: استعلامات محسّنة وفهارس فعالة
- **التخزين المؤقت**: تسريع الاستجابة مع Redis
- **المراقبة المستمرة**: تتبع الأداء والأخطاء في الوقت الفعلي

## الخلاصة

نظام الرفع والوسائط هذا يوفر **حلول تخزين متقدمة وآمنة** مع تكامل كامل مع Bunny.net Storage Zone وإمكانيات إدارة شاملة للملفات.

### نقاط القوة:
- ✅ **تكامل كامل مع Bunny.net** للتخزين السحابي الآمن
- ✅ **رفع ملفات فردية ومتعددة** مع تحقق شامل من الصحة
- ✅ **إدارة وسائط متقدمة** مع تصنيف وتتبع للاستخدام
- ✅ **نظام أمان متعدد الطبقات** مع تشفير وحماية شاملة
- ✅ **أدوات تنظيف تلقائية** للملفات غير المستخدمة والمكررة
- ✅ **تكامل CDN** لتسريع التوزيع العالمي
- ✅ **قابلية التوسع** والتكيف مع احتياجات جديدة

### المميزات التقنية:
- 🗄️ **تخزين سحابي آمن** مع Bunny.net Storage Zone
- 📁 **إدارة مجلدات ذكية** مع تنظيم تلقائي حسب الفئات
- 🔒 **أمان متقدم** مع تشفير وحماية من الهجمات
- 🚀 **أداء محسن** مع CDN وتخزين مؤقت
- 🧹 **تنظيف تلقائي** للملفات غير المستخدمة
- 📊 **تتبع شامل** للاستخدام والأداء
- 🔍 **بحث متقدم** مع فلترة وترتيب ذكي
- 🔧 **مرونة في التخصيص** والتطوير المستقبلي

هذا النظام يضمن **تخزين آمن وفعال** لجميع أنواع الوسائط مع **إدارة ذكية ومتقدمة** و **أداء عالي** في منصة خدمات الطاقة الشمسية.
