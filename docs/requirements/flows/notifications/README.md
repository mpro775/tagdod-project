# تدفقات الإشعارات (Notification Flows)

## الملفات المتاحة
- `notification-system.mmd` - مخطط نظام الإشعارات

## شرح التدفقات

### 1. نظام الإشعارات المتقدم (Advanced Notification System)
- **أنواع الإشعارات:** 6 أنواع مختلفة (LOW_STOCK, OUT_OF_STOCK, ORDER_STATUS, PAYMENT_FAILED, SYSTEM_ALERT, PROMOTION)
- **قنوات الإرسال:** 4 قنوات (EMAIL, SMS, PUSH, DASHBOARD)
- **حالات الإشعارات:** 4 حالات (PENDING, SENT, FAILED, READ)
- **الجدولة:** إرسال فوري أو مؤجل
- **الاستهداف:** إرسال لمستخدمين محددين أو مجموعات

### 2. نظام القوالب المتقدم (Advanced Templates System)
- **قوالب جاهزة:** 20+ قالب جاهز للاستخدام
- **المتغيرات:** دعم المتغيرات الديناميكية ({{orderId}}, {{userName}}, etc.)
- **الروابط:** روابط ديناميكية حسب السياق
- **التخصيص:** إمكانية إنشاء قوالب مخصصة
- **الأمثلة:** أمثلة للبيانات المطلوبة

### 3. نظام الإشعارات متعددة اللغات (Multi-language Notifications)
- **العربية:** رسائل باللغة العربية
- **الإنجليزية:** رسائل باللغة الإنجليزية
- **التلقائي:** اختيار اللغة حسب تفضيلات المستخدم
- **القوالب:** قوالب منفصلة لكل لغة
- **الترجمة:** ترجمة تلقائية للقوالب

### 4. نظام الجدولة المتقدم (Advanced Scheduling System)
- **الإرسال الفوري:** للإشعارات العاجلة
- **الإرسال المؤجل:** للعروض والترويجات
- **الجدولة الذكية:** تجنب الأوقات غير المناسبة
- **المناطق الزمنية:** دعم المناطق الزمنية المختلفة
- **التحكم:** إمكانية إلغاء أو تعديل الإشعارات المجدولة

### 5. نظام إعادة المحاولة (Retry Logic System)
- **إعادة المحاولة:** إعادة إرسال الإشعارات الفاشلة
- **عداد المحاولات:** تتبع عدد المحاولات
- **الاستراتيجية:** استراتيجيات مختلفة لإعادة المحاولة
- **التسجيل:** تسجيل أخطاء الإرسال
- **التنبيه:** تنبيه المديرين عند فشل متكرر

### 6. نظام إدارة الأخطاء (Error Handling System)
- **تسجيل الأخطاء:** تسجيل مفصل للأخطاء
- **رسائل الخطأ:** رسائل خطأ واضحة ومفيدة
- **التصنيف:** تصنيف الأخطاء حسب النوع
- **المتابعة:** متابعة الأخطاء وحلها
- **التقارير:** تقارير أخطاء للمديرين

### 7. نظام تحليلات الإشعارات (Notification Analytics)
- **معدلات الإرسال:** تتبع معدلات نجاح الإرسال
- **معدلات القراءة:** تتبع معدلات قراءة الإشعارات
- **الاستجابة:** تتبع استجابة المستخدمين
- **التوقيت:** تحليل أفضل أوقات الإرسال
- **التحسين:** اقتراحات لتحسين الأداء

### 8. نظام الصلاحيات (Role-based Access System)
- **المديرين:** صلاحيات كاملة لإرسال الإشعارات
- **التجار:** صلاحيات محدودة لإرسال إشعارات المنتجات
- **المهندسين:** صلاحيات لإرسال إشعارات الخدمات
- **التحكم:** تحكم دقيق في الصلاحيات
- **التسجيل:** تسجيل جميع العمليات

### 9. نظام تنبيهات المخزون (Stock Alerts System)
- **مخزون منخفض:** تنبيهات عند انخفاض المخزون
- **نفاد المخزون:** تنبيهات عند نفاد المخزون
- **العتبات:** عتبات قابلة للتخصيص
- **التلقائي:** تنبيهات تلقائية للمديرين
- **التفاصيل:** تفاصيل دقيقة عن حالة المخزون

### 10. نظام الإشعارات الذكية (Smart Notifications)
- **التخصيص:** إشعارات مخصصة حسب المستخدم
- **التوقيت:** إرسال في الأوقات المناسبة
- **التجميع:** تجميع الإشعارات المتشابهة
- **الأولوية:** نظام أولويات للإشعارات
- **التصفية:** تصفية الإشعارات غير المرغوب فيها

## هيكل البيانات

### حقول الإشعار الأساسية (Notification)
- `type`: نوع الإشعار (enum) - مطلوب
- `title`: عنوان الإشعار (string) - مطلوب
- `message`: رسالة الإشعار (string) - مطلوب
- `messageEn`: رسالة الإشعار بالإنجليزية (string) - مطلوب
- `data`: بيانات إضافية (object) - مطلوب
- `channel`: قناة الإرسال (enum) - افتراضي DASHBOARD
- `status`: حالة الإشعار (enum) - افتراضي PENDING

### حقول الاستهداف (Targeting Fields)
- `recipientId`: معرف المستلم (ObjectId) - اختياري
- `recipientEmail`: بريد المستلم (string) - اختياري
- `recipientPhone`: رقم المستلم (string) - اختياري

### حقول التتبع (Tracking Fields)
- `sentAt`: تاريخ الإرسال (Date) - اختياري
- `readAt`: تاريخ القراءة (Date) - اختياري
- `errorMessage`: رسالة الخطأ (string) - اختياري
- `retryCount`: عدد المحاولات (number) - افتراضي 0

### حقول الجدولة (Scheduling Fields)
- `scheduledFor`: تاريخ الجدولة (Date) - اختياري
- `createdBy`: منشئ الإشعار (ObjectId) - اختياري
- `isSystemGenerated`: هل منشأ تلقائياً (boolean) - افتراضي false

### أنواع الإشعارات المتاحة (NotificationType)
1. **LOW_STOCK** - مخزون منخفض
2. **OUT_OF_STOCK** - نفاد المخزون
3. **ORDER_STATUS** - حالة الطلب
4. **PAYMENT_FAILED** - فشل الدفع
5. **SYSTEM_ALERT** - تنبيه النظام
6. **PROMOTION** - عرض ترويجي

### حالات الإشعارات المتاحة (NotificationStatus)
1. **PENDING** - في الانتظار
2. **SENT** - تم الإرسال
3. **FAILED** - فشل الإرسال
4. **READ** - تم القراءة

### قنوات الإشعارات المتاحة (NotificationChannel)
1. **EMAIL** - البريد الإلكتروني
2. **SMS** - الرسائل النصية
3. **PUSH** - الإشعارات الفورية
4. **DASHBOARD** - لوحة التحكم

## API Endpoints المتاحة

### إرسال الإشعارات
- **POST /notifications/send** - إرسال إشعار لعدة قنوات
- **POST /notifications/template/:templateId/send** - إرسال إشعار باستخدام قالب
- **POST /notifications/bulk** - إرسال إشعارات جماعية

### إدارة الإشعارات
- **GET /notifications** - قائمة الإشعارات مع فلترة
- **GET /notifications/:id** - عرض إشعار محدد
- **PATCH /notifications/:id/read** - وضع علامة مقروء
- **DELETE /notifications/:id** - حذف إشعار

### إدارة القوالب
- **GET /notifications/templates** - قائمة القوالب
- **POST /notifications/templates** - إنشاء قالب جديد
- **PATCH /notifications/templates/:id** - تحديث قالب
- **DELETE /notifications/templates/:id** - حذف قالب

### التحليلات والإحصائيات
- **GET /notifications/analytics** - تحليلات الإشعارات
- **GET /notifications/stats** - إحصائيات الإشعارات
- **GET /notifications/performance** - أداء الإشعارات

## DTOs المتاحة

### إنشاء الإشعارات
- `CreateNotificationDto`: إنشاء إشعار جديد
  - `title`: العنوان (required)
  - `message`: الرسالة (required)
  - `data`: البيانات الإضافية (optional)
  - `imageUrl`: رابط الصورة (optional)
  - `clickAction`: إجراء النقر (optional)
  - `template`: القالب (optional)
  - `priority`: الأولوية (optional)
  - `category`: الفئة (optional)
  - `tags`: الوسوم (optional)
  - `scheduledAt`: تاريخ الجدولة (optional)
  - `expiresAt`: تاريخ الانتهاء (optional)

- `SendNotificationDto`: إرسال إشعار
  - `target`: الهدف (required)
    - `userIds`: معرفات المستخدمين (optional)
    - `userGroups`: مجموعات المستخدمين (optional)
    - `topics`: المواضيع (optional)
    - `fcmTokens`: رموز FCM (optional)
    - `phoneNumbers`: أرقام الهواتف (optional)
    - `emailAddresses`: عناوين البريد (optional)
  - `channels`: القنوات (required)
    - `push`: الإشعارات الفورية (optional)
    - `sms`: الرسائل النصية (optional)
    - `email`: البريد الإلكتروني (optional)

### إدارة القوالب
- `NotificationTemplateDto`: قالب الإشعار
  - `name`: الاسم (required)
  - `title`: العنوان (required)
  - `message`: الرسالة (required)
  - `template`: القالب (optional)
  - `channels`: القنوات (required)
  - `type`: النوع (optional)
  - `category`: الفئة (optional)
  - `description`: الوصف (optional)
  - `isActive`: نشط (optional)
  - `variables`: المتغيرات (optional)
  - `exampleData`: بيانات المثال (optional)

## القوالب المتاحة

### إشعارات الطلبات
- `ORDER_CONFIRMED` - تأكيد الطلب
- `ORDER_SHIPPED` - شحن الطلب
- `ORDER_DELIVERED` - تسليم الطلب
- `ORDER_CANCELLED` - إلغاء الطلب
- `ORDER_REFUNDED` - إرجاع المبلغ

### إشعارات الخدمات
- `SERVICE_REQUEST_OPENED` - فتح طلب خدمة
- `NEW_ENGINEER_OFFER` - عرض جديد من مهندس
- `OFFER_ACCEPTED` - قبول العرض
- `SERVICE_STARTED` - بدء الخدمة
- `SERVICE_COMPLETED` - اكتمال الخدمة
- `SERVICE_RATED` - تقييم الخدمة

### إشعارات المنتجات
- `PRODUCT_BACK_IN_STOCK` - عودة المنتج للمخزون
- `PRODUCT_PRICE_DROP` - انخفاض السعر

### إشعارات العروض
- `PROMOTION_STARTED` - بدء العرض
- `PROMOTION_ENDING` - انتهاء العرض

### إشعارات الحساب
- `ACCOUNT_VERIFIED` - تأكيد الحساب
- `PASSWORD_CHANGED` - تغيير كلمة المرور
- `LOGIN_ATTEMPT` - محاولة تسجيل دخول

### إشعارات الدعم
- `TICKET_CREATED` - إنشاء تذكرة
- `TICKET_UPDATED` - تحديث تذكرة
- `TICKET_RESOLVED` - حل تذكرة

### إشعارات النظام
- `SYSTEM_MAINTENANCE` - صيانة النظام
- `NEW_FEATURE` - ميزة جديدة

### إشعارات التسويق
- `WELCOME_NEW_USER` - ترحيب بالمستخدم الجديد
- `BIRTHDAY_GREETING` - تهنئة عيد الميلاد
- `CART_ABANDONMENT` - تذكير بسلة التسوق

## نقاط مهمة
- **قوالب متقدمة:** 20+ قالب جاهز مع متغيرات ديناميكية
- **دعم متعدد اللغات:** عربي وإنجليزي مع ترجمة تلقائية
- **جدولة ذكية:** إرسال فوري أو مؤجل مع تجنب الأوقات غير المناسبة
- **إعادة المحاولة:** نظام إعادة محاولة ذكي للإشعارات الفاشلة
- **تحليلات شاملة:** تتبع معدلات الإرسال والقراءة والاستجابة
- **صلاحيات متدرجة:** تحكم دقيق في الصلاحيات حسب الدور
- **تنبيهات المخزون:** تنبيهات تلقائية لحالة المخزون
- **إشعارات ذكية:** تخصيص وتجميع وفلترة الإشعارات
- **فهرسة محسنة:** indexes محسنة للبحث السريع
- **تسجيل شامل:** تسجيل جميع العمليات والأخطاء
