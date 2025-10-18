# تدفقات إدارة الفئات (Categories Management Flows)

## الملفات المتاحة
- `category-management.mmd` - مخطط إدارة الفئات الأساسي
- `category-tree-structure.mmd` - مخطط هيكل الشجرة الهرمية
- `category-seo-optimization.mmd` - مخطط تحسين SEO للفئات
- `category-caching-system.mmd` - مخطط نظام التخزين المؤقت
- `category-statistics.mmd` - مخطط إحصائيات الفئات

## نظرة عامة على النظام

نظام إدارة فئات متقدم ومتطور يتضمن:
- ✅ **هيكل شجرة هرمية** مع دعم متعدد المستويات
- ✅ **Soft/Hard Delete** مع استعادة آمنة
- ✅ **تحسين SEO** مع meta tags متقدمة
- ✅ **تكامل مع Media Library** مع صور وأيقونات
- ✅ **نظام Breadcrumbs** للتنقل الذكي
- ✅ **إحصائيات تلقائية** مع تحديث فوري
- ✅ **نظام Caching ذكي** مع TTL متدرج
- ✅ **دعم ثنائي اللغة** (عربي/إنجليزي)
- ✅ **نظام ترتيب متقدم** مع order وdepth
- ✅ **فئات مميزة** مع عرض في القوائم

## أنواع الفئات المتاحة

### 1. الفئات الجذرية (Root Categories)
- **الخصائص:** فئات المستوى الأول بدون parent
- **الاستخدام:** التصنيفات الرئيسية للمنتجات
- **المثال:** إلكترونيات، ملابس، كتب
- **العمق:** depth = 0
- **المسار:** path = /category-slug

### 2. الفئات الفرعية (Sub Categories)
- **الخصائص:** فئات تابعة لفئة أخرى
- **الاستخدام:** تصنيفات فرعية متخصصة
- **المثال:** هواتف تحت إلكترونيات
- **العمق:** depth = parent.depth + 1
- **المسار:** path = /parent-slug/category-slug

### 3. الفئات المتداخلة (Nested Categories)
- **الخصائص:** فئات متعددة المستويات
- **الاستخدام:** تصنيفات معقدة ومفصلة
- **المثال:** إلكترونيات > هواتف > هواتف ذكية
- **العمق:** depth = 2, 3, 4...
- **المسار:** path = /electronics/phones/smartphones

### 4. الفئات المميزة (Featured Categories)
- **الخصائص:** فئات مميزة للعرض
- **الاستخدام:** إبراز الفئات المهمة
- **المثال:** عروض خاصة، منتجات جديدة
- **العلامة:** isFeatured = true
- **العرض:** في القوائم الرئيسية

## هيكل البيانات

### حقول الفئة الأساسية (Basic Category Fields)
- `parentId`: معرف الفئة الأب (ObjectId) - اختياري
- `name`: الاسم بالعربية (string) - مطلوب
- `nameEn`: الاسم بالإنجليزية (string) - مطلوب
- `slug`: الرابط الودود (string) - مطلوب، فريد
- `path`: المسار الكامل (string) - مطلوب، مفهرس
- `depth`: عمق الفئة (number) - افتراضي 0

### حقول الوصف (Description Fields)
- `description`: الوصف بالعربية (string) - اختياري
- `descriptionEn`: الوصف بالإنجليزية (string) - اختياري
- `image`: رابط الصورة (string) - اختياري
- `imageId`: معرف الصورة من Media Library (ObjectId) - اختياري
- `icon`: رابط الأيقونة (string) - اختياري
- `iconId`: معرف الأيقونة من Media Library (ObjectId) - اختياري

### حقول SEO (SEO Fields)
- `metaTitle`: عنوان SEO (string) - اختياري
- `metaDescription`: وصف SEO (string) - اختياري
- `metaKeywords`: كلمات مفتاحية (array of strings) - افتراضي []

### حقول العرض (Display Fields)
- `order`: ترتيب العرض (number) - افتراضي 0
- `isActive`: نشطة (boolean) - افتراضي true
- `showInMenu`: عرض في القائمة (boolean) - افتراضي true
- `isFeatured`: مميزة (boolean) - افتراضي false

### حقول الإحصائيات (Statistics Fields)
- `productsCount`: عدد المنتجات (number) - افتراضي 0
- `childrenCount`: عدد الفئات الفرعية (number) - افتراضي 0

### حقول Soft Delete (Soft Delete Fields)
- `deletedAt`: تاريخ الحذف (Date) - افتراضي null
- `deletedBy`: من قام بالحذف (ObjectId) - اختياري

## API Endpoints المتاحة

### للعملاء (4 endpoints)
- **GET /categories** - قائمة الفئات
- **GET /categories/tree** - شجرة الفئات الكاملة
- **GET /categories/:id** - تفاصيل فئة واحدة
- **GET /categories/featured/list** - الفئات المميزة

### للأدمن (8 endpoints)
- **POST /admin/categories** - إنشاء فئة جديدة
- **GET /admin/categories** - قائمة الفئات (مع فلاتر)
- **GET /admin/categories/tree** - شجرة الفئات الكاملة
- **GET /admin/categories/:id** - تفاصيل فئة واحدة
- **PATCH /admin/categories/:id** - تحديث فئة
- **DELETE /admin/categories/:id** - حذف مؤقت (Soft Delete)
- **POST /admin/categories/:id/restore** - استعادة فئة محذوفة
- **DELETE /admin/categories/:id/permanent** - حذف نهائي (Hard Delete)

### إضافية للأدمن (2 endpoints)
- **POST /admin/categories/:id/update-stats** - تحديث الإحصائيات
- **GET /admin/categories/stats/summary** - إحصائيات عامة

## DTOs المتاحة

### إنشاء الفئة
- `CreateCategoryDto`: إنشاء فئة جديدة
  - `parentId`: معرف الفئة الأب (optional)
  - `name`: الاسم بالعربية (required)
  - `nameEn`: الاسم بالإنجليزية (required)
  - `description`: الوصف بالعربية (optional)
  - `descriptionEn`: الوصف بالإنجليزية (optional)
  - `imageId`: معرف الصورة (optional)
  - `iconId`: معرف الأيقونة (optional)
  - `metaTitle`: عنوان SEO (optional)
  - `metaDescription`: وصف SEO (optional)
  - `metaKeywords`: كلمات مفتاحية (optional)
  - `order`: ترتيب العرض (optional)
  - `isActive`: نشطة (optional, default true)
  - `showInMenu`: عرض في القائمة (optional, default true)
  - `isFeatured`: مميزة (optional, default false)

### تحديث الفئة
- `UpdateCategoryDto`: تحديث فئة موجودة
  - جميع الحقول اختيارية
  - نفس الحقول في CreateCategoryDto

### قائمة الفئات
- `ListCategoriesDto`: فلترة قائمة الفئات
  - `parentId`: معرف الفئة الأب (optional)
  - `search`: البحث النصي (optional)
  - `isActive`: الفئات النشطة (optional)
  - `isFeatured`: الفئات المميزة (optional)
  - `includeDeleted`: تضمين المحذوفة (optional, default false)

## نظام التخزين المؤقت (Caching System)

### أنواع التخزين المؤقت
- **Categories List Cache:** TTL = 30 دقيقة
- **Category Tree Cache:** TTL = 1 ساعة
- **Category Detail Cache:** TTL = 10 دقائق

### مفاتيح التخزين المؤقت
- `categories:list:{query}` - قائمة الفئات
- `categories:tree:full` - الشجرة الكاملة
- `category:detail:{id}` - تفاصيل الفئة

### إدارة التخزين المؤقت
- **Auto-clear:** عند إنشاء/تحديث/حذف فئة
- **Pattern Clear:** مسح جميع مفاتيح الفئات
- **Manual Clear:** إمكانية المسح اليدوي

## نظام الشجرة الهرمية

### بناء الشجرة
- **الطريقة:** Recursive tree building
- **الترتيب:** حسب order ثم name
- **الفلترة:** الفئات النشطة فقط
- **التجميع:** تجميع الأطفال مع الآباء

### تحديث المسارات
- **عند تغيير الاسم:** تحديث path للفئة وأطفالها
- **عند تغيير الأب:** إعادة حساب المسار الكامل
- **التحقق:** من عدم تكرار المسارات

### Breadcrumbs
- **البناء:** من المسار الكامل
- **التحديث:** تلقائي عند تغيير المسار
- **العرض:** تسلسل هرمي للتنقل

## نظام SEO المتقدم

### Meta Tags
- **Title:** عنوان الصفحة
- **Description:** وصف الصفحة
- **Keywords:** كلمات مفتاحية

### URLs الودودة
- **Slug:** رابط ودود للفئة
- **Path:** مسار كامل للفئة
- **Uniqueness:** فريد في كل مستوى

### تحسين البحث
- **Full-text Search:** بحث في الاسم والوصف
- **Indexing:** فهرسة متقدمة للبحث
- **Performance:** تحسين أداء البحث

## نظام الإحصائيات

### إحصائيات الفئة
- **productsCount:** عدد المنتجات
- **childrenCount:** عدد الفئات الفرعية
- **Auto-update:** تحديث تلقائي

### إحصائيات عامة
- **Total:** إجمالي الفئات
- **Active:** الفئات النشطة
- **Featured:** الفئات المميزة
- **Deleted:** الفئات المحذوفة
- **By Depth:** التوزيع حسب العمق

## نظام Soft Delete

### الحذف المؤقت
- **deletedAt:** تاريخ الحذف
- **deletedBy:** من قام بالحذف
- **الاستعادة:** إمكانية الاستعادة

### الحذف النهائي
- **الصلاحيات:** Super Admin فقط
- **التحقق:** عدم وجود أطفال
- **النتيجة:** حذف نهائي من قاعدة البيانات

### قيود الحذف
- **الأطفال:** لا يمكن حذف فئة لها أطفال
- **المنتجات:** التحقق من وجود منتجات
- **التبعيات:** فحص التبعيات الأخرى

## نقاط مهمة
- **هيكل شجرة متقدم:** دعم متعدد المستويات مع تحديث تلقائي للمسارات
- **نظام SEO شامل:** meta tags وURLs ودودة مع تحسين البحث
- **تكامل مع Media:** دعم كامل لـ Media Library مع صور وأيقونات
- **نظام Caching ذكي:** تخزين مؤقت متدرج مع مسح تلقائي
- **دعم ثنائي اللغة:** عربي وإنجليزي مع ترجمة كاملة
- **نظام ترتيب متقدم:** order وdepth مع فرز ذكي
- **إحصائيات تلقائية:** تحديث فوري للعدادات والإحصائيات
- **Soft Delete آمن:** حذف مؤقت مع استعادة وإدارة صلاحيات
- **Breadcrumbs ذكي:** نظام تنقل هرمي مع تحديث تلقائي
- **أداء محسن:** فهرسة متقدمة مع استعلامات محسنة
