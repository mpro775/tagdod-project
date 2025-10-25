# تدفقات إدارة المنتجات (Product Management Flows)

## الملفات المتاحة

### المخططات الرئيسية
- `product-management.mmd` - مخطط إدارة المنتجات (نظرة عامة)
- `product-creation-detailed.mmd` - مخطط إنشاء المنتجات مع التنويعات
- `product-pricing-management.mmd` - مخطط إدارة الأسعار
- `product-media-management.mmd` - مخطط إدارة الوسائط والصور
- `product-catalog-display.mmd` - مخطط عرض المنتجات في الكتالوج
- `product-inventory-management.mmd` - مخطط إدارة مخزون المنتجات

## شرح التدفقات

### 1. إنشاء منتج جديد (Product Creation)
- **البيانات الأساسية:** الاسم والوصف بالعربية والإنجليزية
- **التصنيف:** ربط المنتج بالتصنيف والعلامة التجارية
- **الصور:** رفع الصورة الرئيسية والصور الإضافية
- **السمات:** تحديد السمات المستخدمة في المنتج
- **التنويعات:** إنشاء variants للمنتج مع الأسعار والمخزون

### 2. إدارة التنويعات (Product Variants)
- **إنشاء التنويعات:** إضافة variants مع تركيبات السمات
- **الأسعار:** تحديد الأسعار بالدولار لكل variant
- **المخزون:** إدارة كميات المخزون لكل variant
- **المعلومات الإضافية:** SKU، الأبعاد، الوزن، الصور

### 3. إدارة الأسعار (Pricing Management)
- **الأسعار الأساسية:** تحديد الأسعار بالدولار فقط
- **الأسعار المقارنة:** سعر قبل التخفيض اختيارياً
- **سعر التكلفة:** تتبع سعر التكلفة للحسابات
- **التحويل:** تحويل الأسعار حسب أسعار الصرف

### 4. إدارة الوسائط (Media Management)
- **الصور:** ربط المنتجات بالصور من مكتبة الوسائط
- **الصور الرئيسية:** صورة رئيسية للمنتج
- **صور إضافية:** صور متعددة للمنتج
- **صور التنويعات:** صور خاصة لكل variant

### 5. إدارة المخزون (Inventory Management)
- **المخزون الأساسي:** إدارة كميات المخزون لكل variant
- **الحد الأدنى:** تحديد حد أدنى للمخزون
- **تتبع المخزون:** تفعيل/إلغاء تتبع المخزون
- **الطلب المسبق:** السماح بالطلب عند نفاد المخزون

### 6. عرض الكتالوج (Catalog Display)
- **قائمة المنتجات:** عرض المنتجات مع الفلترة والبحث
- **تفاصيل المنتج:** عرض معلومات شاملة للمنتج
- **المنتجات المميزة:** عرض المنتجات المميزة والجديدة
- **التنويعات:** عرض variants المتاحة للمنتج

### 7. إدارة حالة المنتج (Product Status Management)
- **الحالات:** مسودة، نشط، مؤرشف
- **النشر:** تغيير حالة المنتج للنشر
- **الحذف الناعم:** حذف ناعم مع الحفاظ على البيانات
- **الاسترداد:** إمكانية استرداد المنتجات المحذوفة

### 8. البحث والفلترة (Search & Filtering)
- **البحث النصي:** بحث في أسماء وأوصاف المنتجات
- **الفلترة:** فلترة حسب التصنيف، العلامة التجارية، الحالة
- **الترتيب:** ترتيب حسب السعر، التاريخ، الشعبية
- **الصفحات:** نظام صفحات للنتائج الكبيرة

## هيكل البيانات

### حقول المنتج الأساسية (Product Schema)
- `name`: اسم المنتج بالعربية (string) - مطلوب
- `nameEn`: اسم المنتج بالإنجليزية (string) - مطلوب
- `slug`: رابط URL فريد (string) - مطلوب
- `description`: وصف المنتج بالعربية (string) - مطلوب
- `descriptionEn`: وصف المنتج بالإنجليزية (string) - مطلوب
- `categoryId`: معرف التصنيف (ObjectId) - مطلوب
- `brandId`: معرف العلامة التجارية (ObjectId) - اختياري
- `mainImageId`: معرف الصورة الرئيسية (ObjectId) - اختياري
- `imageIds`: مصفوفة معرفات الصور الإضافية (ObjectId[]) - افتراضي []
- `attributes`: مصفوفة معرفات السمات (ObjectId[]) - افتراضي []
- `status`: حالة المنتج (enum: DRAFT, ACTIVE, ARCHIVED) - افتراضي DRAFT
- `isActive`: هل المنتج نشط (boolean) - افتراضي true
- `isFeatured`: هل المنتج مميز (boolean) - افتراضي false
- `isNew`: هل المنتج جديد (boolean) - افتراضي false
- `isBestseller`: هل الأكثر مبيعاً (boolean) - افتراضي false

### حقول الإحصائيات (Statistics Fields)
- `viewsCount`: عدد المشاهدات (number) - افتراضي 0
- `salesCount`: عدد المبيعات (number) - افتراضي 0
- `variantsCount`: عدد التنويعات (number) - افتراضي 0
- `reviewsCount`: عدد التقييمات (number) - افتراضي 0
- `averageRating`: متوسط التقييم (number) - افتراضي 0

### حقول SEO والترتيب
- `metaTitle`: عنوان SEO (string) - اختياري
- `metaDescription`: وصف SEO (string) - اختياري
- `metaKeywords`: كلمات مفتاحية SEO (string[]) - افتراضي []
- `order`: ترتيب العرض (number) - افتراضي 0

### حقول Soft Delete
- `deletedAt`: تاريخ الحذف (Date) - افتراضي null

### حقول التنويعات (Variant Schema)
- `productId`: معرف المنتج الأساسي (ObjectId) - مطلوب
- `sku`: رمز المنتج الفريد (string) - اختياري، فريد
- `attributeValues`: مصفوفة تركيبات السمات (VariantAttribute[]) - افتراضي []
- `basePriceUSD`: السعر الأساسي بالدولار (number) - مطلوب
- `compareAtPriceUSD`: سعر المقارنة بالدولار (number) - اختياري
- `costPriceUSD`: سعر التكلفة بالدولار (number) - اختياري

### حقول المخزون (Inventory Fields)
- `stock`: كمية المخزون المتاحة (number) - مطلوب، افتراضي 0
- `minStock`: الحد الأدنى للمخزون (number) - افتراضي 0
- `trackInventory`: هل يتم تتبع المخزون (boolean) - افتراضي false
- `allowBackorder`: السماح بالطلب المسبق (boolean) - افتراضي true

### حقول الخصائص الإضافية (Additional Properties)
- `imageId`: معرف الصورة الخاصة بالتنويعة (ObjectId) - اختياري
- `weight`: الوزن بالجرام (number) - اختياري
- `length`: الطول بالسنتيمتر (number) - اختياري
- `width`: العرض بالسنتيمتر (number) - اختياري
- `height`: الارتفاع بالسنتيمتر (number) - اختياري
- `isActive`: هل التنويعة نشطة (boolean) - افتراضي true
- `isAvailable`: هل متاحة للبيع (boolean) - افتراضي true
- `salesCount`: عدد مبيعات التنويعة (number) - افتراضي 0

### هيكل VariantAttribute
- `attributeId`: معرف السمة (ObjectId) - مطلوب
- `valueId`: معرف قيمة السمة (ObjectId) - مطلوب
- `name`: اسم السمة للعرض السريع (string) - اختياري
- `value`: قيمة السمة للعرض السريع (string) - اختياري

### حالات المنتج المتاحة (ProductStatus)
- **DRAFT** - مسودة: المنتج قيد الإعداد
- **ACTIVE** - نشط: المنتج متاح للبيع
- **ARCHIVED** - مؤرشف: المنتج محفوظ للأرشيف

## API Endpoints المتاحة

### إدارة المنتجات (Products Controller - Admin)
- **POST /admin/products** - إنشاء منتج جديد
- **GET /admin/products** - قائمة المنتجات مع فلترة وبحث
- **GET /admin/products/:id** - تفاصيل منتج محدد
- **DELETE /admin/products/:id** - حذف منتج (Soft Delete)
- **POST /admin/products/:id/restore** - استرداد منتج محذوف
- **GET /admin/products/stats/summary** - إحصائيات المنتجات

### إدارة التنويعات (Variants Management)
- **POST /admin/products/:productId/variants** - إضافة تنويعة للمنتج
- **GET /admin/products/:productId/variants** - قائمة تنويعات المنتج
- **GET /admin/products/variants/:id** - تفاصيل تنويعة محددة
- **DELETE /admin/products/variants/:id** - حذف تنويعة
- **GET /admin/products/variants/:id/price** - سعر التنويعة
- **POST /admin/products/variants/:id/stock** - تحديث مخزون التنويعة
- **GET /admin/products/variants/:id/availability** - توفر التنويعة

### إدارة الأسعار والمخزون (Pricing & Inventory)
- **GET /admin/products/:id/prices** - أسعار المنتج
- **GET /admin/products/:id/price-range** - نطاق أسعار المنتج
- **GET /admin/products/inventory/low-stock** - المنتجات ذات المخزون المنخفض
- **GET /admin/products/inventory/out-of-stock** - المنتجات التي نفد مخزونها
- **GET /admin/products/inventory/summary** - ملخص المخزون

### عرض المنتجات العام (Public Products Controller)
- **GET /products** - قائمة المنتجات العامة مع فلترة وبحث
- **GET /products/:id** - تفاصيل منتج عام
- **GET /products/slug/:slug** - المنتج حسب الـ slug
- **GET /products/featured/list** - قائمة المنتجات المميزة
- **GET /products/new/list** - قائمة المنتجات الجديدة
- **GET /products/:id/variants** - تنويعات المنتج
- **GET /products/variants/:id/price** - سعر التنويعة
- **GET /products/variants/:id/availability** - توفر التنويعة
- **GET /products/:id/price-range** - نطاق أسعار المنتج
- **GET /products/stats/count** - عدد المنتجات

## نقاط مهمة
- **دعم ثنائي اللغة:** المحتوى بالعربية والإنجليزية
- **نظام حذف ناعم:** الحفاظ على البيانات التاريخية
- **تتبع الإحصائيات:** مشاهدات، مبيعات، تقييمات
- **تنويعات مرنة:** تركيبات سمات قابلة للتخصيص
- **أسعار بالدولار:** نظام تسعير موحد بالدولار
- **مخزون مرن:** إعدادات مخزون قابلة للتخصيص
- **فهرسة محسنة:** indexes للبحث والفلترة السريعة
- **SEO جاهز:** حقول meta لمحركات البحث
- **إدارة الصور:** ربط بالنظام الوسائط
