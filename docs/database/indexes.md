### ملخص الفهارس لكل مجموعة (Collection)

- ملاحظة: هذا الملخص مستخرج من تعريفات الـ Schema في الـ Backend. يُنصح بمراجعته دوريًا بعد أي تغيير.
- تم تحديث الفهارس لتعكس التطبيق الحالي مع فهارس unique/sparse/partial المناسبة.

#### User
- **phone** (unique) - فهرس فريد لرقم الهاتف
- **isAdmin** - فهرس للأدمن
- **createdAt** (desc) - فهرس للتاريخ
- **status** - فهرس للحالة
- **deletedAt** - فهرس للحذف الناعم
- **roles** - فهرس للأدوار
- **lastActivityAt** (desc) - فهرس لآخر نشاط
- **مركبة**: (phone, isAdmin) - فهرس مركب
- **مركبة**: (status, deletedAt, createdAt) - فهرس مركب للأداء
- **مركبة**: (status, lastActivityAt) - فهرس مركب للنشاط

#### Product
- **نصي**: name, description, tags (full-text) - فهرس البحث النصي
- **categoryId** - فهرس للفئة
- **slug** (unique) - فهرس فريد للرابط
- **isFeatured** - فهرس للمنتجات المميزة
- **isNew** - فهرس للمنتجات الجديدة
- **adminRating** (desc) - فهرس للتقييم
- **مركبة**: (categoryId, status) - فهرس مركب للفئة والحالة
- **مركبة**: (isFeatured, isNew, adminRating) - فهرس مركب للعرض

#### Variant
- **productId** - فهرس للمنتج
- **sku** (unique, sparse) - فهرس فريد نادر للـ SKU
- **price** - فهرس للسعر
- **stock** - فهرس للمخزون
- **attributeValues.attributeId** - فهرس لسمات المنتج
- **attributeValues.valueId** - فهرس لقيم السمات
- **deletedAt** - فهرس للحذف الناعم
- **مركبة**: (productId, isActive) - فهرس مركب للمنتج النشط
- **مركبة**: (productId, deletedAt, isActive) - فهرس مركب للأداء

#### Category
- **parentId** - فهرس للفئة الأب
- **path** - فهرس للمسار
- **slug** (unique) - فهرس فريد للرابط
- **isActive** - فهرس للنشاط
- **showInMenu** - فهرس للعرض في القائمة
- **isFeatured** - فهرس للمميز
- **deletedAt** - فهرس للحذف الناعم
- **order** - فهرس للترتيب
- **نصي**: name, description (full-text) - فهرس البحث النصي
- **مركبة**: (parentId, order) - فهرس مركب للترتيب
- **مركبة**: (isActive, showInMenu) - فهرس مركب للعرض
- **مركبة**: (parentId, isActive, order) - فهرس مركب للأداء

#### Brand
- **slug** (unique) - فهرس فريد للرابط
- **name** - فهرس للاسم
- **isActive** - فهرس للنشاط
- **sortOrder** - فهرس للترتيب
- **مركبة**: (isActive, sortOrder) - فهرس مركب للعرض

#### Media
- **category** - فهرس للفئة
- **uploadedBy** - فهرس للمرفوع بواسطة
- **deletedAt** - فهرس للحذف الناعم
- **fileHash** (sparse) - فهرس نادر للهاش
- **نصي**: name, description, tags (full-text) - فهرس البحث النصي
- **مركبة**: (category, createdAt) (desc) - فهرس مركب للفئة والتاريخ
- **مركبة**: (uploadedBy, createdAt) (desc) - فهرس مركب للمستخدم والتاريخ
- **مركبة**: (category, deletedAt, createdAt) (desc) - فهرس مركب للأداء

#### Address
- **userId** - فهرس للمستخدم
- **isDefault** - فهرس للافتراضي
- **isActive** - فهرس للنشاط
- **addressType** - فهرس لنوع العنوان
- **city** - فهرس للمدينة
- **region** - فهرس للمنطقة
- **coords** (2dsphere, sparse) - فهرس جغرافي نادر
- **placeId** (sparse) - فهرس نادر لـ Google Place
- **lastUsedAt** (desc) - فهرس لآخر استخدام
- **deletedAt** - فهرس للحذف الناعم
- **مركبة**: (userId, isDefault) - فهرس مركب للافتراضي
- **مركبة**: (userId, deletedAt) - فهرس مركب للحذف
- **مركبة**: (userId, isActive, createdAt) (desc) - فهرس مركب للنشاط
- **مركبة**: (userId, addressType) - فهرس مركب للنوع
- **مركبة**: (city, region) - فهرس مركب للموقع

#### Cart
- **userId** (sparse) - فهرس نادر للمستخدم
- **deviceId** (sparse) - فهرس نادر للجهاز
- **status** - فهرس للحالة
- **lastActivityAt** (desc) - فهرس لآخر نشاط
- **isAbandoned** - فهرس للسلة المهجورة
- **abandonmentEmailsSent** - فهرس لإيميلات الهجر
- **expiresAt** (TTL) - فهرس انتهاء الصلاحية
- **convertedToOrderId** (sparse) - فهرس نادر للطلب المحول
- **createdAt** (desc) - فهرس للتاريخ
- **updatedAt** (desc) - فهرس للتحديث
- **مركبة**: (userId, status, updatedAt) (desc) - فهرس مركب للمستخدم
- **مركبة**: (deviceId, status, updatedAt) (desc) - فهرس مركب للجهاز
- **مركبة**: (status, lastActivityAt) (desc) - فهرس مركب للنشاط
- **مركبة**: (isAbandoned, abandonmentEmailsSent) - فهرس مركب للهجر

#### Order
- **orderNumber** (unique) - فهرس فريد لرقم الطلب
- **userId** - فهرس للمستخدم
- **status** - فهرس للحالة
- **paymentStatus** - فهرس لحالة الدفع
- **paymentIntentId** (unique, sparse) - فهرس فريد نادر للدفع
- **trackingNumber** (sparse) - فهرس نادر للتتبع
- **paidAt** (sparse) - فهرس نادر للدفع
- **deliveredAt** (sparse) - فهرس نادر للتسليم
- **cancelledAt** (sparse) - فهرس نادر للإلغاء
- **createdAt** (desc) - فهرس للتاريخ
- **updatedAt** (desc) - فهرس للتحديث
- **مركبة**: (userId, status, createdAt) (desc) - فهرس مركب للمستخدم
- **مركبة**: (status, createdAt) (desc) - فهرس مركب للحالة
- **مركبة**: (paymentStatus, createdAt) (desc) - فهرس مركب للدفع

#### Favorite
- **userId** - فهرس للمستخدم
- **deviceId** - فهرس للجهاز
- **productId** - فهرس للمنتج
- **variantId** - فهرس للتنويعة
- **deletedAt** - فهرس للحذف الناعم
- **isSynced** - فهرس للمزامنة
- **createdAt** (desc) - فهرس للتاريخ
- **مركبة فريدة**: (userId, productId, variantId) مع partialFilterExpression للمستخدمين
- **مركبة فريدة**: (deviceId, productId, variantId) مع partialFilterExpression للزوار
- **مركبة**: (userId, createdAt) (desc) - فهرس مركب للمستخدم
- **مركبة**: (deviceId, createdAt) (desc) - فهرس مركب للجهاز
- **مركبة**: (productId, deletedAt) - فهرس مركب للمنتج

#### Attribute
- **slug** (unique) - فهرس فريد للرابط
- **nameEn** (unique) - فهرس فريد للاسم الإنجليزي
- **isActive** - فهرس للنشاط
- **isFilterable** - فهرس للفلترة
- **groupId** - فهرس للمجموعة
- **deletedAt** - فهرس للحذف الناعم
- **order** - فهرس للترتيب
- **مركبة**: (isActive, order) - فهرس مركب للنشاط والترتيب

#### AttributeValue
- **attributeId** - فهرس للسمة
- **slug** - فهرس للرابط
- **isActive** - فهرس للنشاط
- **deletedAt** - فهرس للحذف الناعم
- **order** - فهرس للترتيب
- **مركبة**: (attributeId, order) - فهرس مركب للترتيب
- **مركبة**: (attributeId, slug) (unique) - فهرس فريد مركب
- **مركبة**: (attributeId, isActive, order) - فهرس مركب للنشاط

#### SupportTicket
- **userId** - فهرس للمستخدم
- **assignedTo** - فهرس للمكلف
- **status** - فهرس للحالة
- **priority** - فهرس للأولوية
- **category** - فهرس للفئة
- **dueDate** - فهرس لتاريخ الاستحقاق
- **closedAt** (sparse) - فهرس نادر للإغلاق
- **createdAt** (desc) - فهرس للتاريخ
- **updatedAt** (desc) - فهرس للتحديث

#### ServiceRequest
- **userId** - فهرس للمستخدم
- **status** - فهرس للحالة
- **category** - فهرس للفئة
- **requestedDate** - فهرس لتاريخ الطلب
- **createdAt** (desc) - فهرس للتاريخ
- **updatedAt** (desc) - فهرس للتحديث

#### EngineerOffer
- **serviceRequestId** - فهرس لطلب الخدمة
- **engineerId** - فهرس للمهندس
- **status** - فهرس للحالة
- **validUntil** - فهرس لانتهاء الصلاحية
- **createdAt** (desc) - فهرس للتاريخ
- **updatedAt** (desc) - فهرس للتحديث

#### Notification
- **userId** - فهرس للمستخدم
- **type** - فهرس للنوع
- **status** - فهرس للحالة
- **readAt** (sparse) - فهرس نادر للقراءة
- **createdAt** (desc) - فهرس للتاريخ

#### AnalyticsSnapshot
- **date** - فهرس للتاريخ
- **period** - فهرس للفترة
- **مركبة**: (date, period) (unique) - فهرس فريد مركب
- **مركبة**: (period, date) (desc) - فهرس مركب للفترة
