# تدفقات الإشعارات (Notification Flows)

## الملفات المتاحة
- `notification-system.mmd` - مخطط نظام الإشعارات
- `templates-management.mmd` - مخطط إدارة القوالب

## شرح التدفقات

### 1. نظام الإشعارات الموحد (Unified Notification System)
- **أنواع الإشعارات:** 25+ نوع مختلف (طلبات، خدمات، منتجات، حسابات، نظام)
- **قنوات الإرسال:** 5 قنوات (IN_APP, PUSH, SMS, EMAIL, DASHBOARD)
- **حالات الإشعارات:** 10 حالات (PENDING, QUEUED, SENDING, SENT, DELIVERED, READ, CLICKED, FAILED, BOUNCED, CANCELLED)
- **الجدولة:** إرسال فوري أو مؤجل مع تاريخ محدد
- **الاستهداف:** إرسال لمستخدمين محددين أو مجموعات

### 2. نظام القوالب (Templates System)
- **قوالب جاهزة:** 25+ قالب جاهز للاستخدام
- **المتغيرات:** دعم المتغيرات الديناميكية ({{orderId}}, {{userName}}, {{amount}}, etc.)
- **الروابط:** روابط ديناميكية حسب السياق والمعرفات
- **اللغات:** دعم اللغة العربية والإنجليزية
- **الأولوية:** نظام أولويات (LOW, MEDIUM, HIGH, URGENT)

### 3. نظام التتبع والتحليل (Tracking & Analytics)
- **تتبع شامل:** تتبع حالة الإشعار من البداية للنهاية
- **معدلات التوصيل:** تتبع معدلات نجاح التوصيل
- **معدلات القراءة:** تتبع معدلات قراءة الإشعارات
- **معدلات النقر:** تتبع النقرات على الإشعارات
- **معالجة الأخطاء:** تتبع وإعادة محاولة الإشعارات الفاشلة

### 4. نظام إدارة الأخطاء (Error Handling)
- **إعادة المحاولة:** إعادة إرسال الإشعارات الفاشلة تلقائياً
- **عداد المحاولات:** تتبع عدد المحاولات (حد أقصى 5)
- **رسائل الأخطاء:** حفظ رسائل الأخطاء ورموزها
- **تسجيل الأخطاء:** تسجيل مفصل لجميع الأخطاء

### 5. نظام الفئات والتنظيم (Categories & Organization)
- **فئات الإشعارات:** 9 فئات (ORDER, PRODUCT, SERVICE, PROMOTION, ACCOUNT, SYSTEM, SUPPORT, PAYMENT, MARKETING)
- **التنظيم:** تنظيم حسب النوع والفئة والأولوية
- **البحث:** بحث متقدم في الإشعارات
- **الفلترة:** فلترة حسب الحالة والقناة والمستلم

## هيكل البيانات

### حقول الإشعار الأساسية (UnifiedNotification Schema)
- `type`: نوع الإشعار (enum) - مطلوب
- `title`: عنوان الإشعار (string, max 200) - مطلوب
- `message`: رسالة الإشعار بالعربية (string, max 1000) - مطلوب
- `messageEn`: رسالة الإشعار بالإنجليزية (string, max 1000) - مطلوب
- `data`: بيانات إضافية (object) - افتراضي {}
- `channel`: قناة الإرسال (enum: IN_APP, PUSH, SMS, EMAIL, DASHBOARD) - افتراضي IN_APP
- `status`: حالة الإشعار (enum) - افتراضي PENDING
- `priority`: الأولوية (enum: LOW, MEDIUM, HIGH, URGENT) - افتراضي MEDIUM
- `category`: فئة الإشعار (enum) - يتم تحديدها تلقائياً حسب النوع

### حقول الاستهداف والمستلمين (Recipient Fields)
- `recipientId`: معرف المستلم (ObjectId) - اختياري
- `recipientEmail`: بريد المستلم (string, max 255) - اختياري
- `recipientPhone`: رقم المستلم (string, max 20) - اختياري

### حقول التوقيت والجدولة (Timing Fields)
- `scheduledFor`: تاريخ الجدولة (Date) - اختياري
- `sentAt`: تاريخ الإرسال (Date) - اختياري
- `deliveredAt`: تاريخ التوصيل (Date) - اختياري
- `readAt`: تاريخ القراءة (Date) - اختياري
- `clickedAt`: تاريخ النقر (Date) - اختياري
- `failedAt`: تاريخ الفشل (Date) - اختياري

### حقول معالجة الأخطاء (Error Handling Fields)
- `errorMessage`: رسالة الخطأ (string, max 500) - اختياري
- `errorCode`: رمز الخطأ (string, max 50) - اختياري
- `retryCount`: عدد المحاولات (number, 0-5) - افتراضي 0
- `nextRetryAt`: تاريخ إعادة المحاولة التالية (Date) - اختياري

### حقول التتبع والمعلومات الإضافية (Tracking Fields)
- `trackingId`: معرف تتبع فريد (string, unique) - يتم توليده تلقائياً
- `externalId`: معرف خارجي (string, max 100) - اختياري
- `templateId`: معرف القالب (ObjectId) - اختياري
- `templateKey`: مفتاح القالب (string, max 100) - اختياري

### حقول النظام والإدارة (System Fields)
- `createdBy`: منشئ الإشعار (ObjectId) - اختياري
- `isSystemGenerated`: هل منشأ تلقائياً (boolean) - افتراضي false
- `metadata`: معلومات إضافية (object) - افتراضي {}

### أنواع الإشعارات المتاحة (NotificationType)
- **ORDER_CONFIRMED** - تأكيد الطلب
- **ORDER_SHIPPED** - شحن الطلب
- **ORDER_DELIVERED** - تسليم الطلب
- **ORDER_CANCELLED** - إلغاء الطلب
- **ORDER_REFUNDED** - إرجاع المبلغ
- **SERVICE_REQUEST_OPENED** - فتح طلب خدمة
- **NEW_ENGINEER_OFFER** - عرض جديد من مهندس
- **OFFER_ACCEPTED** - قبول العرض
- **SERVICE_STARTED** - بدء الخدمة
- **SERVICE_COMPLETED** - اكتمال الخدمة
- **SERVICE_RATED** - تقييم الخدمة
- **PRODUCT_BACK_IN_STOCK** - عودة المنتج للمخزون
- **PRODUCT_PRICE_DROP** - انخفاض السعر
- **LOW_STOCK** - مخزون منخفض
- **OUT_OF_STOCK** - نفاد المخزون
- **PROMOTION_STARTED** - بدء العرض
- **PROMOTION_ENDING** - انتهاء العرض
- **ACCOUNT_VERIFIED** - تأكيد الحساب
- **PASSWORD_CHANGED** - تغيير كلمة المرور
- **LOGIN_ATTEMPT** - محاولة تسجيل دخول
- **TICKET_CREATED** - إنشاء تذكرة
- **TICKET_UPDATED** - تحديث تذكرة
- **TICKET_RESOLVED** - حل تذكرة
- **SYSTEM_MAINTENANCE** - صيانة النظام
- **NEW_FEATURE** - ميزة جديدة
- **SYSTEM_ALERT** - تنبيه النظام
- **WELCOME_NEW_USER** - ترحيب بالمستخدم الجديد
- **BIRTHDAY_GREETING** - تهنئة عيد الميلاد
- **CART_ABANDONMENT** - تذكير بسلة التسوق
- **PAYMENT_FAILED** - فشل الدفع
- **PAYMENT_SUCCESS** - نجاح الدفع

### حالات الإشعارات المتاحة (NotificationStatus)
- **PENDING** - في الانتظار
- **QUEUED** - في قائمة الانتظار
- **SENDING** - جاري الإرسال
- **SENT** - تم الإرسال
- **DELIVERED** - تم التوصيل
- **READ** - تم القراءة
- **CLICKED** - تم النقر
- **FAILED** - فشل الإرسال
- **BOUNCED** - مرتد
- **REJECTED** - مرفوض
- **CANCELLED** - ملغي

### قنوات الإشعارات المتاحة (NotificationChannel)
- **IN_APP** - داخل التطبيق
- **PUSH** - إشعارات فورية
- **SMS** - رسائل نصية
- **EMAIL** - بريد إلكتروني
- **DASHBOARD** - لوحة التحكم

### فئات الإشعارات (NotificationCategory)
- **ORDER** - طلبات
- **PRODUCT** - منتجات
- **SERVICE** - خدمات
- **PROMOTION** - عروض ترويجية
- **ACCOUNT** - حسابات
- **SYSTEM** - نظام
- **SUPPORT** - دعم
- **PAYMENT** - مدفوعات
- **MARKETING** - تسويق

## API Endpoints المتاحة

### إرسال الإشعارات (Unified Notification Controller)
- **POST /api/notifications/send** - إرسال إشعار واحد
- **POST /api/notifications/send-bulk** - إرسال إشعارات جماعية
- **POST /api/notifications/send-template** - إرسال إشعار باستخدام قالب

### إدارة الإشعارات
- **GET /api/notifications** - قائمة الإشعارات مع فلترة وبحث
- **GET /api/notifications/:id** - عرض إشعار محدد
- **PATCH /api/notifications/:id** - تحديث إشعار
- **DELETE /api/notifications/:id** - حذف إشعار
- **POST /api/notifications/:id/mark-read** - وضع علامة مقروء
- **POST /api/notifications/:id/mark-delivered** - وضع علامة تم التوصيل
- **POST /api/notifications/:id/mark-clicked** - وضع علامة تم النقر

### إحصائيات الإشعارات
- **GET /api/notifications/stats/overview** - إحصائيات عامة للإشعارات

## DTOs المتاحة

### إنشاء وإرسال الإشعارات
- `CreateNotificationDto`: إنشاء إشعار جديد
  - `type`: نوع الإشعار (required)
  - `title`: العنوان (required)
  - `message`: الرسالة بالعربية (required)
  - `messageEn`: الرسالة بالإنجليزية (required)
  - `data`: البيانات الإضافية (optional)
  - `channel`: قناة الإرسال (optional)
  - `priority`: الأولوية (optional)
  - `recipientId`: معرف المستلم (optional)
  - `recipientEmail`: بريد المستلم (optional)
  - `recipientPhone`: رقم المستلم (optional)
  - `scheduledFor`: تاريخ الجدولة (optional)
  - `templateKey`: مفتاح القالب (optional)

- `BulkSendNotificationDto`: إرسال إشعارات جماعية
  - `notifications`: مصفوفة من CreateNotificationDto (required)

- `SendTemplateNotificationDto`: إرسال إشعار بقالب
  - `templateKey`: مفتاح القالب (required)
  - `data`: بيانات المتغيرات (required)
  - `recipientId`: معرف المستلم (optional)
  - `recipientEmail`: بريد المستلم (optional)
  - `recipientPhone`: رقم المستلم (optional)
  - `channel`: قناة الإرسال (optional)
  - `scheduledFor`: تاريخ الجدولة (optional)

### إدارة الإشعارات
- `UpdateNotificationDto`: تحديث إشعار
  - `status`: حالة الإشعار (optional)
  - `priority`: الأولوية (optional)
  - `errorMessage`: رسالة الخطأ (optional)

- `ListNotificationsDto`: قائمة الإشعارات
  - `page`: رقم الصفحة (optional)
  - `limit`: عدد العناصر (optional)
  - `search`: البحث في العنوان والرسالة (optional)
  - `type`: فلترة حسب النوع (optional)
  - `status`: فلترة حسب الحالة (optional)
  - `channel`: فلترة حسب القناة (optional)
  - `category`: فلترة حسب الفئة (optional)
  - `recipientId`: فلترة حسب المستلم (optional)
  - `startDate`: تاريخ البداية (optional)
  - `endDate`: تاريخ النهاية (optional)

- `MarkAsReadDto`: وضع علامة مقروء
  - `notificationId`: معرف الإشعار (required)

## القوالب المتاحة

### إشعارات الطلبات (Order Notifications)
- `ORDER_CONFIRMED` - تأكيد الطلب ({{orderId}}, {{amount}}, {{currency}})
- `ORDER_SHIPPED` - شحن الطلب ({{orderId}})
- `ORDER_DELIVERED` - تسليم الطلب ({{orderId}})
- `ORDER_CANCELLED` - إلغاء الطلب ({{orderId}})
- `ORDER_REFUNDED` - إرجاع المبلغ ({{orderId}}, {{amount}}, {{currency}})

### إشعارات الخدمات (Service Notifications)
- `SERVICE_REQUEST_OPENED` - فتح طلب خدمة ({{requestId}})
- `NEW_ENGINEER_OFFER` - عرض جديد من مهندس ({{requestId}}, {{engineerName}})
- `OFFER_ACCEPTED` - قبول العرض ({{requestId}})
- `SERVICE_STARTED` - بدء الخدمة ({{requestId}}, {{engineerName}})
- `SERVICE_COMPLETED` - اكتمال الخدمة ({{requestId}})
- `SERVICE_RATED` - تقييم الخدمة ({{requestId}})
- `SERVICE_REQUEST_CANCELLED` - إلغاء طلب الخدمة ({{requestId}})

### إشعارات المنتجات (Product Notifications)
- `PRODUCT_BACK_IN_STOCK` - عودة المنتج للمخزون ({{productName}})
- `PRODUCT_PRICE_DROP` - انخفاض السعر ({{productName}}, {{oldPrice}}, {{newPrice}}, {{currency}})
- `LOW_STOCK` - مخزون منخفض ({{productName}})
- `OUT_OF_STOCK` - نفاد المخزون ({{productName}})

### إشعارات العروض (Promotion Notifications)
- `PROMOTION_STARTED` - بدء العرض ({{promotionName}}, {{discount}})
- `PROMOTION_ENDING` - انتهاء العرض ({{promotionName}}, {{timeLeft}})

### إشعارات الحساب (Account Notifications)
- `ACCOUNT_VERIFIED` - تأكيد الحساب ({{userName}})
- `PASSWORD_CHANGED` - تغيير كلمة المرور
- `LOGIN_ATTEMPT` - محاولة تسجيل دخول

### إشعارات الدعم (Support Notifications)
- `TICKET_CREATED` - إنشاء تذكرة ({{ticketId}})
- `TICKET_UPDATED` - تحديث تذكرة ({{ticketId}})
- `TICKET_RESOLVED` - حل تذكرة ({{ticketId}})

### إشعارات النظام (System Notifications)
- `SYSTEM_MAINTENANCE` - صيانة النظام
- `NEW_FEATURE` - ميزة جديدة
- `SYSTEM_ALERT` - تنبيه النظام

### إشعارات التسويق (Marketing Notifications)
- `WELCOME_NEW_USER` - ترحيب بالمستخدم الجديد
- `BIRTHDAY_GREETING` - تهنئة عيد الميلاد
- `CART_ABANDONMENT` - تذكير بسلة التسوق

### إشعارات المدفوعات (Payment Notifications)
- `PAYMENT_FAILED` - فشل الدفع
- `PAYMENT_SUCCESS` - نجاح الدفع

## نقاط مهمة
- **نظام موحد:** إشعارات موحدة مع تتبع شامل لحالة كل إشعار
- **قوالب جاهزة:** 25+ قالب مكتوب مسبقاً مع متغيرات ديناميكية
- **دعم ثنائي اللغة:** رسائل بالعربية والإنجليزية
- **تتبع شامل:** تتبع من البداية للنهاية مع حفظ جميع التواريخ
- **إعادة المحاولة:** نظام إعادة محاولة تلقائي (حد أقصى 5 محاولات)
- **فئات منظمة:** تنظيم الإشعارات حسب 9 فئات مختلفة
- **أولويات متعددة:** نظام أولويات (LOW, MEDIUM, HIGH, URGENT)
- **قنوات متعددة:** دعم 5 قنوات إرسال مختلفة
- **حالات مفصلة:** 11 حالة مختلفة لتتبع الإشعار بدقة
- **حذف تلقائي:** حذف الإشعارات القديمة تلقائياً بعد 90 يوم
- **معرفات تتبع:** معرفات فريدة لتتبع كل إشعار
- **فهرسة محسنة:** indexes محسنة للبحث والفلترة السريعة
