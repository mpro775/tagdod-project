# دليل نظام الصلاحيات الإدارية الشامل

## 📋 نظرة عامة

تم تطوير نظام صلاحيات إدارية شامل يغطي جميع عمليات النظام الإدارية. النظام مبني على مبدأ **least privilege** ويدعم تخصيص الصلاحيات بدقة عالية.

## 🏗️ بنية النظام

### 1. الأدوار (Roles)
```typescript
enum UserRole {
  USER = 'user',           // مستخدم عادي
  ADMIN = 'admin',         // أدمن
  SUPER_ADMIN = 'super_admin', // سوبر أدمن
  MERCHANT = 'merchant',   // تاجر
  ENGINEER = 'engineer',   // مهندس
}
```

### 2. الصلاحيات (Permissions)
```typescript
enum AdminPermission {
  // المستخدمون
  USERS_READ = 'users.read',
  USERS_CREATE = 'users.create',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',

  // المنتجات
  PRODUCTS_READ = 'products.read',
  PRODUCTS_CREATE = 'products.create',
  PRODUCTS_UPDATE = 'products.update',
  PRODUCTS_DELETE = 'products.delete',

  // الطلبات
  ORDERS_READ = 'orders.read',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_CANCEL = 'orders.cancel',
  ORDERS_REFUND = 'orders.refund',

  // السلة
  CARTS_READ = 'carts.read',
  CARTS_SEND_REMINDERS = 'carts.send_reminders',
  CARTS_CONVERT_TO_ORDER = 'carts.convert_to_order',

  // الخدمات
  SERVICES_READ = 'services.read',
  SERVICES_UPDATE = 'services.update',

  // الدعم الفني
  SUPPORT_READ = 'support.read',
  SUPPORT_UPDATE = 'support.update',
  SUPPORT_ASSIGN = 'support.assign',

  // التسويق
  MARKETING_READ = 'marketing.read',
  MARKETING_CREATE = 'marketing.create',
  MARKETING_UPDATE = 'marketing.update',

  // التحليلات
  ANALYTICS_READ = 'analytics.read',
  REPORTS_GENERATE = 'reports.generate',

  // الوصول العام
  ADMIN_ACCESS = 'admin.access',
  SUPER_ADMIN_ACCESS = 'super_admin.access',
}
```

## 👥 أنواع الأدمن المتاحة

### 1. Full Admin (الأدمن الكامل)
```json
{
  "roles": ["admin", "super_admin"],
  "permissions": ["ALL_PERMISSIONS"]
}
```
**الوصف:** صلاحيات كاملة على جميع أجزاء النظام

### 2. Product Manager (مدير المنتجات)
```json
{
  "permissions": [
    "products.*",
    "categories.*",
    "brands.*",
    "attributes.*",
    "admin.access"
  ]
}
```

### 3. Sales Manager (مدير المبيعات)
```json
{
  "permissions": [
    "orders.*",
    "carts.*",
    "analytics.read",
    "reports.generate",
    "admin.access"
  ]
}
```

### 4. Support Manager (مدير الدعم الفني)
```json
{
  "permissions": [
    "support.*",
    "users.read",
    "users.update",
    "admin.access"
  ]
}
```

### 5. Marketing Manager (مدير التسويق)
```json
{
  "permissions": [
    "marketing.*",
    "analytics.read",
    "reports.generate",
    "admin.access"
  ]
}
```

### 6. Content Manager (مدير المحتوى)
```json
{
  "permissions": [
    "products.read",
    "products.update",
    "categories.read",
    "categories.update",
    "marketing.read",
    "marketing.update",
    "upload.manage",
    "admin.access"
  ]
}
```

### 7. View Only Admin (أدمن للقراءة فقط)
```json
{
  "permissions": [
    "*.read",
    "analytics.read",
    "admin.access"
  ]
}
```

## 🚀 إنشاء أدمن جديد

### API Endpoints

#### 1. إنشاء أدمن مخصص
```http
POST /admin/users/create-admin
Content-Type: application/json
Authorization: Bearer <super_admin_token>

{
  "phone": "+966501234567",
  "firstName": "أحمد",
  "lastName": "محمد",
  "gender": "male",
  "roles": ["admin"],
  "permissions": [
    "users.read",
    "products.read",
    "orders.read",
    "admin.access"
  ],
  "temporaryPassword": "TempPass123!",
  "activateImmediately": true,
  "description": "أدمن محدود للمبيعات"
}
```

#### 2. إنشاء أدمن بناءً على الدور
```http
POST /admin/users/create-role-admin
Content-Type: application/json
Authorization: Bearer <super_admin_token>

{
  "adminType": "sales_manager",
  "phone": "+966507654321",
  "firstName": "فاطمة",
  "lastName": "أحمد",
  "additionalPermissions": [
    "system.logs"
  ],
  "description": "مديرة المبيعات مع صلاحيات السجلات"
}
```

## 📊 جدول الصلاحيات التفصيلي

| العملية | الصلاحية المطلوبة | الـ Controller |
|---------|-------------------|---------------|
| **المستخدمون** | | |
| عرض المستخدمين | `users.read` | `UsersAdminController` |
| إنشاء مستخدم | `users.create` | `UsersAdminController` |
| تحديث مستخدم | `users.update` | `UsersAdminController` |
| حذف مستخدم | `users.delete` | `UsersAdminController` |

| **المنتجات** | | |
| عرض المنتجات | `products.read` | `ProductsController` |
| إنشاء منتج | `products.create` | `ProductsController` |
| تحديث منتج | `products.update` | `ProductsController` |
| حذف منتج | `products.delete` | `ProductsController` |

| **الطلبات** | | |
| عرض الطلبات | `orders.read` | `AdminOrderController` |
| تحديث الطلبات | `orders.update` | `AdminOrderController` |
| إلغاء الطلبات | `orders.cancel` | `AdminOrderController` |
| استرداد الأموال | `orders.refund` | `AdminOrderController` |

| **السلة** | | |
| عرض السلات المهجورة | `carts.read` | `AdminCartController` |
| إرسال تذكيرات | `carts.send_reminders` | `AdminCartController` |
| تحويل للطلب | `carts.convert_to_order` | `AdminCartController` |

| **الخدمات** | | |
| عرض الخدمات | `services.read` | `AdminServicesController` |
| تحديث الخدمات | `services.update` | `AdminServicesController` |

| **الدعم الفني** | | |
| عرض التذاكر | `support.read` | `AdminSupportController` |
| تحديث التذاكر | `support.update` | `AdminSupportController` |
| تعيين التذاكر | `support.assign` | `AdminSupportController` |

| **التسويق** | | |
| عرض الحملات | `marketing.read` | `MarketingAdminController` |
| إنشاء حملة | `marketing.create` | `MarketingAdminController` |
| تحديث حملة | `marketing.update` | `MarketingAdminController` |

| **العلامات التجارية** | | |
| عرض العلامات | `brands.read` | `BrandsAdminController` |
| إنشاء علامة | `brands.create` | `BrandsAdminController` |
| تحديث علامة | `brands.update` | `BrandsAdminController` |

| **الفئات** | | |
| عرض الفئات | `categories.read` | `CategoriesAdminController` |
| إنشاء فئة | `categories.create` | `CategoriesAdminController` |
| تحديث فئة | `categories.update` | `CategoriesAdminController` |

| **الخصائص** | | |
| عرض الخصائص | `attributes.read` | `AttributesAdminController` |
| إنشاء خاصية | `attributes.create` | `AttributesAdminController` |
| تحديث خاصية | `attributes.update` | `AttributesAdminController` |

| **التحليلات** | | |
| عرض التحليلات | `analytics.read` | جميع Admin Controllers |
| إنشاء التقارير | `reports.generate` | `AnalyticsController` |

| **النظام** | | |
| سجلات النظام | `system.logs` | `AuditController` |
| نسخ احتياطي | `system.backup` | `SystemController` |
| صيانة النظام | `system.maintenance` | `SystemController` |

## 🔐 آلية عمل النظام

### 1. التحقق من الصلاحيات
```typescript
// في Controller
@RequirePermissions('users.read', 'admin.access')
@Get()
async getUsers() {
  // الكود هنا محمي بالصلاحيات
}
```

### 2. فحص الأدوار والصلاحيات
```typescript
// في RolesGuard
if (requiredPermissions) {
  for (const permission of requiredPermissions) {
    const hasPermission = await this.permissionService.hasPermission(user.sub, permission);
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
```

### 3. التسجيل في Audit Log
```typescript
// جميع العمليات الحساسة تُسجل تلقائياً
await this.auditService.logPermissionChange({
  userId: adminId,
  permission: 'users.create',
  action: 'grant',
  grantedBy: superAdminId,
  reason: 'إنشاء أدمن جديد'
});
```

## 🎯 سيناريوهات الاستخدام

### سيناريو 1: إنشاء أدمن مبيعات
```json
POST /admin/users/create-role-admin
{
  "adminType": "sales_manager",
  "phone": "+966501234567",
  "firstName": "سارة",
  "lastName": "أحمد",
  "description": "أدمن المبيعات والطلبات"
}

// الصلاحيات الممنوحة تلقائياً:
// - orders.* (جميع عمليات الطلبات)
// - carts.* (جميع عمليات السلة)
// - analytics.read (قراءة التحليلات)
// - reports.generate (إنشاء التقارير)
// - admin.access (الوصول للوحة الأدمن)
```

### سيناريو 2: إنشاء أدمن محدود
```json
POST /admin/users/create-admin
{
  "phone": "+966507654321",
  "firstName": "محمد",
  "lastName": "علي",
  "roles": ["admin"],
  "permissions": [
    "products.read",
    "categories.read",
    "brands.read",
    "analytics.read",
    "admin.access"
  ],
  "temporaryPassword": "Limited123!",
  "description": "أدمن للقراءة فقط"
}
```

### سيناريو 3: تحديث صلاحيات أدمن موجود
```json
PATCH /admin/users/{userId}
{
  "permissions": [
    "users.read",
    "users.update",
    "support.read",
    "support.update",
    "admin.access"
  ]
}
```

## 🚨 نقاط مهمة للأمان

### 1. مبدأ Least Privilege
- امنح فقط الصلاحيات المطلوبة للعمل
- استخدم أدوار محددة بدلاً من صلاحيات واسعة

### 2. المراجعة الدورية
- راجع صلاحيات الأدمن دورياً
- أزل الصلاحيات غير المستخدمة

### 3. التدقيق المستمر
- جميع العمليات الحساسة مُسجلة في Audit Log
- راقب السجلات بانتظام للكشف عن الأنشطة المشبوهة

### 4. إدارة كلمات المرور
- استخدم كلمات مرور مؤقتة للأدمن الجدد
- أجبر على تغيير كلمة المرور عند أول تسجيل دخول

## 🔧 استكشاف الأخطاء

### خطأ: "Insufficient permissions"
```
403 Forbidden
```
**الحل:**
- تحقق من الصلاحيات الممنوحة للأدمن
- تأكد من أن الـ token يحتوي على الصلاحيات المطلوبة
- راجع Audit Log لمعرفة سبب الرفض

### خطأ: "Permission not found"
```
Error: Unknown permission
```
**الحل:**
- تأكد من أن اسم الصلاحية صحيح من `AdminPermission` enum
- راجع قائمة الصلاحيات المتاحة في `permissions.ts`

### خطأ: "Role not assigned"
```
Error: User does not have required role
```
**الحل:**
- تأكد من أن الأدمن لديه الدور المطلوب
- استخدم endpoint تحديث الأدوار لإضافة الأدوار المفقودة

## 📈 التوسع المستقبلي

### إضافة صلاحيات جديدة
1. أضف الصلاحية في `AdminPermission` enum
2. أضفها للمجموعات المناسبة في `PERMISSION_GROUPS`
3. حدث Controllers لاستخدام الصلاحية الجديدة
4. اختبر الصلاحية الجديدة

### إضافة أدوار جديدة
1. أضف الدور في `UserRole` enum
2. أنشئ مجموعة صلاحيات جديدة في `PERMISSION_GROUPS`
3. أضف منطق الدور في `createRoleBasedAdmin`
4. حدث واجهة المستخدم لدعم الدور الجديد

---

## 📞 الدعم والمساعدة

### للمطورين
- راجع `permissions.ts` لقائمة جميع الصلاحيات
- استخدم `RequirePermissions` decorator في Controllers الجديدة
- تأكد من تسجيل جميع العمليات الحساسة في AuditService

### للمدراء
- استخدم endpoints إنشاء الأدمن لإدارة الصلاحيات
- راقب Audit Logs بانتظام
- راجع صلاحيات الأدمن دورياً

### في حالة المشاكل
1. راجع Audit Logs للتحقق من العمليات
2. تحقق من صحة الصلاحيات في قاعدة البيانات
3. راجع السجلات للكشف عن أي مشاكل

---

**تاريخ آخر تحديث:** 22 أكتوبر 2025
**حالة النظام:** ✅ جاهز للاستخدام الإنتاجي
**المسؤول:** فريق التطوير
