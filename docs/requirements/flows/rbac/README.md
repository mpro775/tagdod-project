# تدفقات إدارة الأدوار والصلاحيات (RBAC Flows)

## الملفات المتاحة

### المخططات الرئيسية
- `role-permissions.mmd` - مخطط نظام RBAC (نظرة عامة)
- `capabilities-management.mmd` - مخطط إدارة القدرات
- `authentication-flow.mmd` - مخطط تدفق المصادقة
- `permission-control.mmd` - مخطط فحص الصلاحيات
- `role-assignment.mmd` - مخطط تعيين الأدوار
- `security-measures.mmd` - مخطط إجراءات الأمان

## شرح التدفقات

### 1. نظام المصادقة (Authentication System)
- **OTP عبر SMS:** إرسال رمز التحقق عبر الرسائل النصية
- **JWT Tokens:** إنشاء وإدارة رموز JWT للمصادقة
- **تحقق الهوية:** التحقق من صحة الرموز والمستخدمين
- **إدارة الجلسات:** إنشاء وصيانة جلسات المستخدمين

### 2. نظام الأدوار والصلاحيات (Roles & Permissions)
- **الأدوار الأساسية:** USER, ADMIN, SUPER_ADMIN, MERCHANT, ENGINEER
- **الصلاحيات المخصصة:** مصفوفة صلاحيات قابلة للتخصيص
- **Capabilities:** نظام منفصل للقدرات (مهندس، تاجر، إدارة)
- **التحقق من الأدوار:** فحص الأدوار والصلاحيات للمستخدمين

### 3. نظام القدرات (Capabilities System)
- **طلبات القدرات:** طلب الحصول على أدوار إضافية
- **موافقة الإدارة:** مراجعة وموافقة طلبات الأدوار
- **حالات القدرات:** NONE, PENDING, APPROVED, REJECTED
- **خصومات التاجر:** إدارة نسب الخصم للتجار

### 4. إدارة المستخدمين (User Management)
- **إنشاء المستخدمين:** إضافة مستخدمين جدد للنظام
- **تحديث الأدوار:** تعديل أدوار وصلاحيات المستخدمين
- **إيقاف الحسابات:** تعليق وإلغاء تعليق الحسابات
- **مراقبة النشاط:** تتبع نشاط المستخدمين

### 5. أمان النظام (System Security)
- **حماية JWT:** التحقق من صحة الرموز والصلاحيات
- **تشفير البيانات:** حماية البيانات الحساسة
- **تسجيل العمليات:** تسجيل جميع العمليات الأمنية
- **حماية من الوصول غير المصرح:** منع الوصول غير المصرح به

## هيكل البيانات

### حقول المستخدم الأساسية (User Schema)
- `phone`: رقم الهاتف (string) - مطلوب، فريد
- `firstName`: الاسم الأول (string) - اختياري
- `lastName`: الاسم الأخير (string) - اختياري
- `gender`: الجنس (male/female/other) - اختياري
- `jobTitle`: المسمى الوظيفي (string) - اختياري للمهندس
- `passwordHash`: هاش كلمة المرور (string) - اختياري
- `roles`: مصفوفة الأدوار (UserRole[]) - افتراضي ['user']
- `permissions`: مصفوفة الصلاحيات (string[]) - افتراضي []

### حقول القدرات (Capabilities Fields)
- `customer_capable`: قابلية العميل (boolean) - افتراضي true
- `engineer_capable`: قابلية المهندس (boolean) - افتراضي false
- `engineer_status`: حالة المهندس (CapabilityStatus) - افتراضي NONE
- `wholesale_capable`: قابلية التاجر (boolean) - افتراضي false
- `wholesale_status`: حالة التاجر (CapabilityStatus) - افتراضي NONE
- `wholesale_discount_percent`: نسبة خصم التاجر (number) - افتراضي 0
- `admin_capable`: قابلية الإدارة (boolean) - افتراضي false
- `admin_status`: حالة الإدارة (CapabilityStatus) - افتراضي NONE

### حقول الحالة والتتبع (Status & Tracking)
- `status`: حالة الحساب (UserStatus) - افتراضي ACTIVE
- `preferredCurrency`: العملة المفضلة (Currency) - افتراضي USD
- `lastActivityAt`: تاريخ آخر نشاط (Date) - تلقائي
- `deletedAt`: تاريخ الحذف (Date) - افتراضي null

### الأدوار المتاحة (UserRole Enum)
- **USER** - المستخدم العادي: صلاحيات أساسية للتسوق
- **ADMIN** - المدير: صلاحيات إدارية محدودة
- **SUPER_ADMIN** - المدير العام: جميع الصلاحيات
- **MERCHANT** - التاجر: صلاحيات التجارة والخصومات
- **ENGINEER** - المهندس: صلاحيات الخدمات الفنية

### حالات القدرات (CapabilityStatus Enum)
- **NONE** - لا توجد: المستخدم لم يطلب القدرة
- **PENDING** - في انتظار: الطلب قيد المراجعة
- **APPROVED** - معتمد: القدرة مفعلة
- **REJECTED** - مرفوض: الطلب مرفوض

### حالات المستخدم (UserStatus Enum)
- **ACTIVE** - نشط: الحساب يعمل بشكل طبيعي
- **SUSPENDED** - معلق: الحساب موقوف مؤقتاً
- **PENDING** - في انتظار: الحساب ينتظر التفعيل
- **DELETED** - محذوف: الحساب محذوف (soft delete)

### العملات المدعومة (Currency Enum)
- **USD** - الدولار الأمريكي
- **YER** - الريال اليمني
- **SAR** - الريال السعودي

## API Endpoints المتاحة

### المصادقة (Auth Controller)
- **POST /auth/send-otp** - إرسال رمز OTP للتحقق
- **POST /auth/verify-otp** - التحقق من رمز OTP
- **POST /auth/set-password** - تعيين كلمة مرور جديدة
- **POST /auth/forgot-password** - طلب إعادة تعيين كلمة المرور
- **POST /auth/reset-password** - إعادة تعيين كلمة المرور
- **PATCH /auth/preferred-currency** - تحديث العملة المفضلة

### إدارة المستخدمين (Users Admin Controller)
- **GET /admin/users** - قائمة المستخدمين مع فلترة
- **POST /admin/users** - إنشاء مستخدم جديد
- **GET /admin/users/:id** - تفاصيل مستخدم محدد
- **PATCH /admin/users/:id** - تحديث بيانات المستخدم
- **POST /admin/users/:id/suspend** - إيقاف حساب المستخدم
- **POST /admin/users/:id/unsuspend** - إلغاء إيقاف الحساب
- **DELETE /admin/users/:id** - حذف المستخدم (soft delete)

### إدارة القدرات (Capabilities)
- **GET /admin/capabilities** - عرض قدرات المستخدمين
- **PATCH /admin/capabilities/:userId** - تحديث قدرات المستخدم
- **POST /admin/capabilities/:userId/approve-engineer** - الموافقة على دور المهندس
- **POST /admin/capabilities/:userId/approve-wholesale** - الموافقة على دور التاجر
- **POST /admin/capabilities/:userId/approve-admin** - الموافقة على دور الإدارة

## DTOs المتاحة

### المصادقة (Auth DTOs)
- `SendOtpDto`: إرسال OTP
  - `phone`: رقم الهاتف (required)

- `VerifyOtpDto`: التحقق من OTP
  - `phone`: رقم الهاتف (required)
  - `otp`: رمز OTP (required)

- `SetPasswordDto`: تعيين كلمة المرور
  - `password`: كلمة المرور الجديدة (required)
  - `confirmPassword`: تأكيد كلمة المرور (required)

### إدارة المستخدمين (User Management DTOs)
- `CreateAdminUserDto`: إنشاء مستخدم إداري
  - `phone`: رقم الهاتف (required)
  - `firstName`: الاسم الأول (optional)
  - `lastName`: الاسم الأخير (optional)
  - `roles`: الأدوار (optional)

- `UpdateUserAdminDto`: تحديث المستخدم
  - `firstName`: الاسم الأول (optional)
  - `lastName`: الاسم الأخير (optional)
  - `roles`: الأدوار (optional)
  - `permissions`: الصلاحيات (optional)

- `ListUsersDto`: قائمة المستخدمين
  - `page`: رقم الصفحة (optional)
  - `limit`: عدد العناصر (optional)
  - `search`: البحث (optional)
  - `status`: فلترة حسب الحالة (optional)
  - `roles`: فلترة حسب الأدوار (optional)

## نقاط مهمة
- **نظام أدوار مرن:** 5 أدوار أساسية قابلة للتخصيص
- **نظام صلاحيات مخصص:** مصفوفة صلاحيات قابلة للإضافة
- **نظام قدرات منفصل:** إدارة طلبات وموافقات الأدوار الإضافية
- **مصادقة OTP آمنة:** حماية عالية لعمليات تسجيل الدخول
- **JWT tokens:** إدارة آمنة للجلسات والمصادقة
- **إدارة شاملة للمستخدمين:** إنشاء، تحديث، إيقاف، حذف
- **تتبع النشاط:** مراقبة نشاط المستخدمين
- **حماية البيانات:** تشفير وإخفاء البيانات الحساسة
- **حالة المستخدمين:** إدارة متقدمة لحالة الحسابات
- **دعم العملات:** ربط بالنظام المالي للمنصة
