# تدفقات نظام المستخدمين (Users Flows)

## الملفات المتاحة

### المخططات الرئيسية
- `users-overview.mmd` - نظرة عامة على نظام المستخدمين
- `user-management.mmd` - مخطط تدفق إدارة المستخدمين
- `user-analytics.mmd` - مخطط تدفق تحليلات المستخدمين
- `user-ranking.mmd` - مخطط تدفق ترتيب المستخدمين
- `user-behavior.mmd` - مخطط تدفق تحليل سلوك المستخدمين
- `user-predictions.mmd` - مخطط تدفق تنبؤات المستخدمين

## شرح التدفقات

### 1. إدارة المستخدمين (User Management)
- **إدارة الحسابات:** إنشاء وتحديث وحذف حسابات المستخدمين
- **نظام الأدوار:** إدارة أدوار المستخدمين (USER, ADMIN, SUPER_ADMIN, MERCHANT, ENGINEER)
- **نظام الصلاحيات:** إدارة الصلاحيات المخصصة للمستخدمين
- **نظام Capabilities:** إدارة capabilities (customer, engineer, wholesale, admin)
- **إدارة الحالات:** تعليق وتفعيل وإعادة تفعيل الحسابات

### 2. تحليلات المستخدمين (User Analytics)
- **إحصائيات المستخدمين:** عدد المستخدمين حسب الدور والحالة
- **إحصائيات مفصلة:** تحليلات مفصلة لكل مستخدم
- **ترتيب العملاء:** ترتيب العملاء حسب النقاط والأداء
- **تقارير شاملة:** تقارير شاملة عن المستخدمين والأداء

### 3. ترتيب المستخدمين (User Ranking)
- **نظام النقاط:** حساب نقاط الولاء والقيمة والنشاط
- **ترتيب العملاء:** ترتيب العملاء حسب الأداء والنشاط
- **إحصائيات الترتيب:** إحصائيات الترتيب والتصنيفات

### 4. تحليل سلوك المستخدمين (User Behavior Analysis)
- **تتبع النشاط:** تتبع نشاط المستخدمين وتفاعلاتهم
- **تحليل السلوك:** تحليل سلوك المستخدمين والأنماط
- **إحصائيات السلوك:** إحصائيات مفصلة عن سلوك المستخدمين

### 5. تنبؤات المستخدمين (User Predictions)
- **تنبؤات أساسية:** تنبؤات بسيطة حول نشاط المستخدمين
- **تحليل المخاطر:** تحليل مخاطر عدم النشاط والتوقف

## هيكل البيانات

### حقول المستخدم الأساسية (User Schema)
- `phone`: رقم الهاتف (string) - مطلوب، فريد، مفهرس
- `firstName`: الاسم الأول (string) - اختياري
- `lastName`: اسم العائلة (string) - اختياري
- `gender`: الجنس (enum: male/female/other) - اختياري
- `jobTitle`: المسمى الوظيفي (string) - اختياري (للمهندسين)
- `passwordHash`: هاش كلمة المرور (string) - اختياري

### حقول الأدوار والصلاحيات (Roles & Permissions Fields)
- `roles`: الأدوار (array of UserRole) - افتراضي ['user']، مفهرس
- `permissions`: الصلاحيات المخصصة (array of string) - افتراضي []

### حقول Capabilities (Capabilities Fields)
- `customer_capable`: قادر كعميل (boolean) - افتراضي true
- `engineer_capable`: قادر كمهندس (boolean) - افتراضي false
- `engineer_status`: حالة المهندس (enum: none/pending/approved/rejected) - افتراضي none
- `wholesale_capable`: قادر كتاجر جملة (boolean) - افتراضي false
- `wholesale_status`: حالة التاجر (enum: none/pending/approved/rejected) - افتراضي none
- `wholesale_discount_percent`: نسبة الخصم (number) - افتراضي 0، بين 0-100
- `admin_capable`: قادر كمدير (boolean) - افتراضي false
- `admin_status`: حالة المدير (enum: none/pending/approved/rejected) - افتراضي none

### حقول الحالة والتفضيلات (Status & Preferences Fields)
- `status`: حالة الحساب (enum: active/suspended/pending/deleted) - افتراضي active
- `preferredCurrency`: العملة المفضلة (enum: USD/YER/SAR) - افتراضي USD
- `lastActivityAt`: آخر نشاط (Date) - افتراضي الآن

### حقول Soft Delete والتعليق (Soft Delete & Suspension Fields)
- `deletedAt`: تاريخ الحذف (Date) - اختياري
- `deletedBy`: معرف المدير الذي حذف (string) - اختياري
- `suspendedReason`: سبب التعليق (string) - اختياري
- `suspendedBy`: معرف المدير الذي علق (string) - اختياري
- `suspendedAt`: تاريخ التعليق (Date) - اختياري

### أدوار المستخدمين المتاحة (User Roles)
- **USER** - مستخدم عادي
- **ADMIN** - مدير
- **SUPER_ADMIN** - مدير عام
- **MERCHANT** - تاجر
- **ENGINEER** - مهندس

### حالات Capabilities المتاحة (Capability Status)
- **NONE** - غير محدد
- **PENDING** - قيد المراجعة
- **APPROVED** - مقبول
- **REJECTED** - مرفوض

### حالات المستخدمين المتاحة (User Status)
- **ACTIVE** - نشط
- **SUSPENDED** - معلق
- **PENDING** - قيد الانتظار
- **DELETED** - محذوف

### العملات المتاحة (Currencies)
- **USD** - دولار أمريكي
- **YER** - ريال يمني
- **SAR** - ريال سعودي

### طرق المساعد (Helper Methods)
- `isAdmin()`: فحص إذا كان مديراً
- `isSuperAdmin()`: فحص إذا كان مديراً عاماً
- `hasRole(role)`: فحص إذا كان له دور محدد
- `hasAnyRole(roles)`: فحص إذا كان له أي من الأدوار
- `hasPermission(permission)`: فحص إذا كان له صلاحية محددة

## API Endpoints المتاحة

### APIs إدارة المستخدمين (User Management APIs - 11 endpoints)
- **GET /admin/users** - عرض قائمة المستخدمين مع فلاتر وبحث
- **GET /admin/users/:id** - تفاصيل مستخدم محدد
- **POST /admin/users/create-admin** - إنشاء حساب مدير جديد
- **POST /admin/users/create-role-admin** - إنشاء حساب مع دور محدد
- **POST /admin/users** - إنشاء مستخدم جديد
- **PATCH /admin/users/:id** - تحديث بيانات مستخدم
- **POST /admin/users/:id/suspend** - تعليق حساب مستخدم
- **POST /admin/users/:id/activate** - تفعيل حساب معلق
- **DELETE /admin/users/:id** - حذف مستخدم (soft delete)
- **POST /admin/users/:id/restore** - إعادة تفعيل حساب محذوف
- **DELETE /admin/users/:id/permanent** - حذف نهائي
- **GET /admin/users/stats/summary** - إحصائيات عامة للمستخدمين

### APIs تحليلات المستخدمين (User Analytics APIs - 8 endpoints)
- **GET /admin/user-analytics/overview** - نظرة عامة على التحليلات
- **GET /admin/user-analytics/users-by-role** - المستخدمون حسب الدور
- **GET /admin/user-analytics/users-by-status** - المستخدمون حسب الحالة
- **GET /admin/user-analytics/customer-rankings** - ترتيب العملاء
- **GET /admin/user-analytics/user-stats** - إحصائيات المستخدمين مع تصفية
- **GET /admin/user-analytics/user/:id** - إحصائيات مستخدم محدد
- **GET /admin/user-analytics/scoring-config** - إعدادات النقاط
- **PUT /admin/user-analytics/scoring-config** - تحديث إعدادات النقاط

## نظام النقاط والترتيب

### حساب نقاط المستخدمين (User Scoring)
- **نظام نقاط شامل:** حساب نقاط بناءً على النشاط والأداء
- **عوامل متعددة:** مراعاة الطلبات، الإيرادات، النشاط، الدعم
- **ترتيب ديناميكي:** تحديث النقاط والترتيب بشكل دوري

### إحصائيات الترتيب (Ranking Statistics)
- **ترتيب العملاء:** ترتيب العملاء حسب النقاط والأداء
- **إحصائيات مفصلة:** إحصائيات شاملة عن الترتيبات والتصنيفات

## نقاط مهمة
- **نظام أدوار شامل:** إدارة أدوار وصلاحيات متعددة المستويات
- **نظام Capabilities موحد:** إدارة القدرات للعملاء والمهندسين والتجار والإداريين
- **تحليلات مستخدمين:** إحصائيات وترتيب شامل للمستخدمين
- **نظام نقاط ذكي:** حساب نقاط بناءً على الأداء والنشاط
- **إدارة حالات متقدمة:** soft delete وتعليق الحسابات مع تتبع
- **تكامل مع الأنظمة:** ربط مع الطلبات والخدمات والدعم
- **أمان محسن:** حماية البيانات مع تتبع النشاط
- **سهولة الصيانة:** هيكل منظم وقابل للتوسع
