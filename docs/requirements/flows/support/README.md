# تدفقات الدعم الفني (Support Flows)

## الملفات المتاحة

### المخططات الرئيسية
- `ticket-flow.mmd` - مخطط تدفق تذاكر الدعم
- `sla-analytics.mmd` - مخطط تحليلات SLA

## شرح التدفقات

### 1. نظام التذاكر (Ticket System)
- **إنشاء التذاكر:** إنشاء تذاكر دعم جديدة مع الفئة والأولوية
- **حالات التذاكر:** OPEN، IN_PROGRESS، WAITING_FOR_USER، RESOLVED، CLOSED
- **إدارة التذاكر:** عرض، تحديث، أرشفة التذاكر
- **تقييم التذاكر:** تقييم التذاكر المحلولة من 1-5 نجوم

### 2. نظام الرسائل (Message System)
- **أنواع الرسائل:** رسائل المستخدم، ردود الأدمن، رسائل النظام
- **المرفقات:** دعم رفع الملفات في الرسائل
- **الرسائل الداخلية:** رسائل خاصة للأدمن فقط
- **إدارة الرسائل:** إضافة وعرض الرسائل

### 3. نظام SLA (SLA System)
- **تتبع SLA:** تتبع أوقات الحل حسب الأولوية
- **أوقات SLA:** ساعات مختلفة حسب الأولوية
- **تجاوز SLA:** تتبع حالات تجاوز SLA
- **إشعارات SLA:** تنبيهات عند اقتراب انتهاء SLA

### 4. نظام الردود الجاهزة (Canned Responses)
- **إدارة الردود:** إنشاء وإدارة ردود جاهزة
- **التصنيف:** تصنيف الردود حسب الفئة
- **الاختصارات:** اختصارات للوصول السريع
- **تتبع الاستخدام:** عدد مرات استخدام كل رد

### 5. نظام الإحصائيات (Statistics System)
- **إحصائيات عامة:** عدد التذاكر حسب الحالة والفئة
- **إحصائيات SLA:** التذاكر التي تجاوزت SLA
- **إحصائيات الأداء:** أداء الفريق والأفراد

## هيكل البيانات

### حقول تذكرة الدعم الأساسية (Support Ticket Schema)
- `userId`: معرف العميل (ObjectId) - مطلوب، مفهرس
- `title`: عنوان المشكلة (string) - مطلوب
- `description`: وصف المشكلة (string) - مطلوب
- `category`: فئة المشكلة (enum) - افتراضي OTHER، مفهرس
- `priority`: أولوية المشكلة (enum) - افتراضي MEDIUM، مفهرس
- `status`: حالة التذكرة (enum) - افتراضي OPEN، مفهرس
- `assignedTo`: معين إلى (ObjectId) - اختياري، افتراضي null
- `attachments`: المرفقات (array of strings) - افتراضي []
- `tags`: الوسوم (array of strings) - افتراضي []
- `isArchived`: مؤرشف (boolean) - افتراضي false

### حقول التوقيت والـ SLA (Timing & SLA Fields)
- `firstResponseAt`: أول رد من الدعم (Date) - اختياري
- `resolvedAt`: تاريخ الحل (Date) - اختياري
- `closedAt`: تاريخ الإغلاق (Date) - اختياري
- `slaHours`: ساعات SLA (number) - افتراضي 24
- `slaDueDate`: تاريخ انتهاء SLA (Date) - اختياري
- `slaBreached`: تجاوز SLA (boolean) - افتراضي false

### حقول التقييم والملاحظات (Rating & Feedback Fields)
- `rating`: التقييم (number, 1-5) - اختياري
- `feedback`: التعليق (string) - اختياري
- `feedbackAt`: تاريخ التقييم (Date) - اختياري
- `metadata`: بيانات إضافية (object) - افتراضي {}

### حقول رسالة الدعم (Support Message Schema)
- `ticketId`: معرف التذكرة (ObjectId) - مطلوب، مفهرس
- `senderId`: معرف المرسل (ObjectId) - مطلوب
- `messageType`: نوع الرسالة (enum) - مطلوب، مفهرس
- `content`: محتوى الرسالة (string) - مطلوب
- `attachments`: المرفقات (array of strings) - افتراضي []
- `isInternal`: رسالة داخلية (boolean) - افتراضي false
- `metadata`: بيانات إضافية (object) - افتراضي {}

### حقول الرد الجاهز (Canned Response Schema)
- `title`: عنوان الرد (string) - مطلوب
- `content`: محتوى الرد (string) - مطلوب
- `contentEn`: محتوى بالإنجليزية (string) - مطلوب
- `category`: فئة اختيارية (enum) - اختياري
- `tags`: وسوم للبحث (array of strings) - افتراضي []
- `isActive`: نشط (boolean) - افتراضي true
- `usageCount`: عدد مرات الاستخدام (number) - افتراضي 0
- `shortcut`: اختصار (string) - اختياري، فريد

### فئات الدعم المتاحة (Support Categories)
- **TECHNICAL** - فني
- **BILLING** - فواتير
- **PRODUCTS** - منتجات
- **SERVICES** - خدمات
- **ACCOUNT** - حساب
- **OTHER** - أخرى

### أولويات الدعم المتاحة (Support Priorities)
- **LOW** - منخفضة
- **MEDIUM** - متوسطة
- **HIGH** - عالية
- **URGENT** - عاجلة

### حالات التذاكر المتاحة (Support Status)
- **OPEN** - مفتوحة
- **IN_PROGRESS** - قيد المعالجة
- **WAITING_FOR_USER** - في انتظار المستخدم
- **RESOLVED** - محلولة
- **CLOSED** - مغلقة

### أنواع الرسائل المتاحة (Message Types)
- **USER_MESSAGE** - رسالة من المستخدم
- **ADMIN_REPLY** - رد من الأدمن
- **SYSTEM_MESSAGE** - رسالة نظام

### فهارس الأداء (Performance Indexes)
- فهارس مركبة للبحث حسب المستخدم والحالة والتاريخ
- فهرس نصي للبحث في العنوان والوصف
- فهارس للبحث حسب الفئة والأولوية والحالة

## API Endpoints المتاحة

### APIs العملاء (Customer APIs - 7 endpoints)
- **POST /support/tickets** - إنشاء تذكرة دعم جديدة
- **GET /support/tickets/my** - عرض تذاكر العميل
- **GET /support/tickets/:id** - تفاصيل تذكرة محددة
- **GET /support/tickets/:id/messages** - جلب رسائل التذكرة
- **POST /support/tickets/:id/messages** - إضافة رسالة جديدة
- **PUT /support/tickets/:id/archive** - أرشفة التذكرة
- **POST /support/tickets/:id/rate** - تقييم التذكرة المحلولة

### APIs الإدارة (Admin APIs - 9 endpoints)
- **GET /admin/support/tickets** - عرض جميع التذاكر مع فلاتر
- **GET /admin/support/tickets/:id** - تفاصيل تذكرة محددة
- **PATCH /admin/support/tickets/:id** - تحديث التذكرة (الحالة، المعين إليه، إلخ)
- **GET /admin/support/tickets/:id/messages** - رسائل التذكرة
- **POST /admin/support/tickets/:id/messages** - إضافة رسالة من الأدمن
- **GET /admin/support/stats** - إحصائيات الدعم العامة
- **GET /admin/support/sla/breached** - التذاكر التي تجاوزت SLA
- **POST /admin/support/sla/:id/check** - فحص حالة SLA لتذكرة
- **POST /admin/support/canned-responses** - إدارة الردود الجاهزة

## DTOs المتاحة

### إنشاء التذكرة (CreateSupportTicketDto)
- `title`: عنوان المشكلة (required, string)
- `description`: وصف المشكلة (required, string)
- `category`: فئة المشكلة (optional, enum)
- `priority`: أولوية المشكلة (optional, enum)
- `attachments`: المرفقات (optional, string[])
- `metadata`: بيانات إضافية (optional, object)

### إضافة الرسائل (AddSupportMessageDto)
- `content`: محتوى الرسالة (required, string)
- `attachments`: المرفقات (optional, string[])
- `messageType`: نوع الرسالة (optional, enum)
- `isInternal`: رسالة داخلية (optional, boolean)

### تقييم التذكرة (RateSupportTicketDto)
- `rating`: التقييم (required, number 1-5)
- `feedback`: التعليق (optional, string)

### تحديث التذكرة (UpdateSupportTicketDto)
- `status`: الحالة (optional, enum)
- `priority`: الأولوية (optional, enum)
- `assignedTo`: معين إلى (optional, ObjectId)
- `tags`: الوسوم (optional, string[])
- `slaHours`: ساعات SLA (optional, number)

## نقاط مهمة
- **نظام تذاكر شامل:** إدارة كاملة لتذاكر الدعم مع حالات متعددة
- **نظام رسائل متطور:** دعم أنواع مختلفة من الرسائل مع مرفقات
- **تتبع SLA:** تتبع أوقات الحل وتجاوز SLA
- **الردود الجاهزة:** نظام للردود الجاهزة مع اختصارات
- **تقييمات العملاء:** نظام تقييم بسيط من 1-5 نجوم
- **إحصائيات شاملة:** إحصائيات للتذاكر والأداء وSLA
- **فهارس محسنة:** فهارس قاعدة البيانات للأداء المحسن
- **أرشفة التذاكر:** إمكانية أرشفة التذاكر المحلولة
- **بيانات إضافية:** دعم metadata لتخزين بيانات إضافية
- **تصنيف متقدم:** تصنيف بالفئات والأولويات والوسوم
