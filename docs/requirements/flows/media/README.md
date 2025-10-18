# تدفقات الوسائط (Media Flows)

## الملفات المتاحة
- `media-upload.mmd` - مخطط رفع وإدارة الوسائط

## شرح التدفقات

### 1. نظام رفع الملفات المتقدم (Advanced File Upload)
- **التحقق:** فحص نوع وحجم الملف مع Multer
- **الأمان:** فحص الملفات الضارة والأنواع المسموحة
- **التخزين:** رفع آمن إلى Bunny.net Storage
- **التسمية:** إنشاء أسماء فريدة مع UUID
- **CDN:** توليد روابط CDN عامة

### 2. نظام Media Library المتقدم (Advanced Media Library)
- **التصنيف:** تصنيف الملفات حسب الفئة (BANNER, PRODUCT, CATEGORY, BRAND, OTHER)
- **النوع:** تصنيف حسب نوع الملف (IMAGE, VIDEO, DOCUMENT)
- **الوصف:** إضافة أوصاف ووسوم للبحث
- **الخصوصية:** تحديد ما إذا كان الملف عام أم خاص
- **المالك:** تتبع من قام برفع الملف

### 3. نظام منع التكرار الذكي (Smart Duplicate Detection)
- **Hash Calculation:** حساب SHA256 hash للملف
- **الفحص:** البحث عن ملفات متطابقة في قاعدة البيانات
- **إعادة الاستخدام:** استخدام الملف الموجود بدلاً من رفع جديد
- **التحديث:** تحديث عداد الاستخدام للملف الموجود
- **التوفير:** توفير مساحة التخزين والوقت

### 4. نظام تتبع الاستخدام (Usage Tracking)
- **عداد الاستخدام:** تتبع عدد مرات استخدام كل ملف
- **مواقع الاستخدام:** تتبع أين تم استخدام الملف (productId, categoryId, etc.)
- **الإحصائيات:** إحصائيات شاملة لاستخدام الملفات
- **التحديث:** تحديث تلقائي لعداد الاستخدام

### 5. نظام معالجة الصور (Image Processing)
- **استخراج الأبعاد:** استخراج عرض وارتفاع الصور باستخدام Sharp
- **التحسين:** تحسين جودة الصور تلقائياً
- **المعلومات:** حفظ معلومات الصورة (width, height, mimeType)
- **الدعم:** دعم أنواع صور متعددة (JPEG, PNG, GIF, WebP)

### 6. نظام البحث والفلترة المتقدم (Advanced Search & Filtering)
- **البحث النصي:** بحث في الاسم والوصف والوسوم
- **الفلترة:** فلترة حسب الفئة والنوع والخصوصية
- **الترتيب:** ترتيب حسب التاريخ والحجم والاستخدام
- **Pagination:** نظام صفحات للنتائج الكبيرة
- **النتائج:** عرض النتائج مع معلومات المالك

### 7. نظام Soft Delete المتقدم (Advanced Soft Delete)
- **الحذف الآمن:** عدم حذف الملفات نهائياً
- **استرداد الملفات:** إمكانية استرداد الملفات المحذوفة
- **تتبع الحذف:** تسجيل من قام بالحذف ومتى
- **الحذف النهائي:** حذف نهائي للملفات (Super Admin فقط)
- **التنظيف:** حذف الملفات من Bunny.net عند الحذف النهائي

### 8. نظام الإحصائيات والتحليلات (Statistics & Analytics)
- **إحصائيات شاملة:** عدد الملفات حسب الفئة والنوع
- **حجم التخزين:** إجمالي حجم الملفات بالبايت والميجابايت
- **متوسط الحجم:** متوسط حجم الملفات
- **الملفات الحديثة:** آخر 5 ملفات تم رفعها
- **التوزيع:** توزيع الملفات حسب الفئات والأنواع

### 9. نظام Bunny.net Integration المتقدم
- **Storage Zone:** تكامل كامل مع Bunny.net Storage
- **CDN:** توليد روابط CDN للوصول السريع
- **API Integration:** استخدام Bunny.net API للرفع والحذف
- **Error Handling:** معالجة أخطاء Bunny.net المتقدمة
- **Configuration:** إعدادات متقدمة للـ Storage Zone

### 10. نظام الأمان والصلاحيات (Security & Permissions)
- **JWT Authentication:** مصادقة المستخدمين
- **Role-based Access:** صلاحيات مختلفة حسب الدور
- **Super Admin:** صلاحيات خاصة للحذف النهائي
- **File Validation:** التحقق من صحة الملفات
- **Size Limits:** حدود حجم الملفات

## هيكل البيانات

### حقول الوسائط الأساسية (Media)
- `url`: رابط الملف (string) - مطلوب
- `filename`: اسم الملف الأصلي (string) - مطلوب
- `storedFilename`: اسم الملف المخزن (string) - مطلوب
- `name`: الاسم الوصفي (string) - مطلوب
- `category`: الفئة (enum) - مطلوب
- `type`: نوع الملف (enum) - افتراضي IMAGE
- `mimeType`: نوع MIME (string)
- `size`: حجم الملف بالبايت (number)

### حقول الصور (Image Fields)
- `width`: عرض الصورة (number) - اختياري
- `height`: ارتفاع الصورة (number) - اختياري

### حقول التنظيم (Organization Fields)
- `fileHash`: hash الملف للكشف عن التكرار (string) - اختياري
- `description`: وصف الملف (string) - افتراضي ''
- `tags`: وسوم للبحث (array of strings) - افتراضي []
- `isPublic`: هل الملف عام (boolean) - افتراضي true

### حقول التتبع (Tracking Fields)
- `uploadedBy`: من قام بالرفع (ObjectId)
- `usageCount`: عدد مرات الاستخدام (number) - افتراضي 0
- `usedIn`: أين تم الاستخدام (array of strings) - افتراضي []

### حقول Soft Delete (Soft Delete Fields)
- `deletedAt`: تاريخ الحذف (Date) - افتراضي null
- `deletedBy`: من قام بالحذف (ObjectId) - اختياري

### فئات الوسائط المتاحة (MediaCategory)
1. **BANNER** - بانرات
2. **PRODUCT** - منتجات
3. **CATEGORY** - فئات
4. **BRAND** - براند
5. **OTHER** - أخرى

### أنواع الوسائط المتاحة (MediaType)
1. **IMAGE** - صورة
2. **VIDEO** - فيديو
3. **DOCUMENT** - مستند

## API Endpoints المتاحة

### رفع الملفات
- **POST /upload/file** - رفع ملف واحد
- **POST /upload/files** - رفع ملفات متعددة (حد أقصى 10)
- **DELETE /upload/file** - حذف ملف من Bunny.net

### إدارة Media Library
- **POST /admin/media/upload** - رفع ملف إلى المكتبة
- **GET /admin/media** - قائمة الملفات مع Pagination
- **GET /admin/media/:id** - عرض ملف محدد
- **PATCH /admin/media/:id** - تحديث بيانات الملف
- **DELETE /admin/media/:id** - حذف ملف (Soft Delete)
- **POST /admin/media/:id/restore** - استرداد ملف محذوف
- **DELETE /admin/media/:id/permanent** - حذف نهائي (Super Admin فقط)

### الإحصائيات والتحليلات
- **GET /admin/media/stats/summary** - إحصائيات شاملة للمكتبة

## DTOs المتاحة

### رفع الملفات
- `UploadFileDto`: رفع ملف واحد
  - `file`: الملف (binary)
  - `folder`: المجلد (optional)
  - `filename`: اسم مخصص (optional)

- `UploadMediaDto`: رفع ملف إلى المكتبة
  - `name`: الاسم الوصفي (required)
  - `category`: الفئة (required)
  - `description`: الوصف (optional)
  - `tags`: الوسوم (optional)
  - `isPublic`: هل عام (optional)

### إدارة المكتبة
- `UpdateMediaDto`: تحديث بيانات الملف
  - `name`: الاسم الوصفي (optional)
  - `category`: الفئة (optional)
  - `description`: الوصف (optional)
  - `tags`: الوسوم (optional)
  - `isPublic`: هل عام (optional)

- `ListMediaDto`: قائمة الملفات
  - `page`: رقم الصفحة (optional)
  - `limit`: عدد العناصر (optional)
  - `search`: البحث (optional)
  - `category`: الفئة (optional)
  - `type`: النوع (optional)
  - `isPublic`: الخصوصية (optional)
  - `includeDeleted`: تضمين المحذوفة (optional)
  - `sortBy`: ترتيب حسب (optional)
  - `sortOrder`: اتجاه الترتيب (optional)

## نقاط مهمة
- **تكامل Bunny.net:** رفع وحذف الملفات من Bunny.net Storage
- **منع التكرار:** كشف الملفات المكررة باستخدام SHA256 hash
- **تتبع الاستخدام:** تتبع عدد مرات وأماكن استخدام الملفات
- **معالجة الصور:** استخراج أبعاد الصور باستخدام Sharp
- **بحث متقدم:** بحث نصي في الاسم والوصف والوسوم
- **Soft Delete:** حذف آمن مع إمكانية الاسترداد
- **إحصائيات شاملة:** تحليلات مفصلة لاستخدام المكتبة
- **أمان عالي:** مصادقة JWT وصلاحيات متدرجة
- **فهرسة محسنة:** indexes محسنة للبحث السريع
- **دعم CDN:** روابط CDN للوصول السريع للملفات
