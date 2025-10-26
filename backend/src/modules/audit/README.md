# نظام التدقيق (Audit System)

## نظرة عامة

نظام التدقيق هو نظام شامل لتتبع وتسجيل جميع الإجراءات الحساسة والأحداث الهامة في المنصة. يوفر النظام آلية موثوقة لمراقبة التغييرات في الصلاحيات، الأدوار، عمليات المصادقة، والإجراءات الإدارية.

## 📊 مصدر البيانات

### قاعدة البيانات
- **Collection**: `audit_logs`
- **Database**: MongoDB
- **Schema**: `AuditLog` (`audit-log.schema.ts`)

### كيفية جلب البيانات

البيانات يتم تسجيلها **تلقائياً** من خلال `AuditService` عند حدوث الأحداث التالية:

1. **تغييرات الصلاحيات**: عند منح أو إلغاء صلاحية
2. **تغييرات الأدوار**: عند تعيين أو إزالة دور
3. **قرارات Capabilities**: عند الموافقة أو الرفض
4. **أحداث المصادقة**: تسجيل دخول، خروج، تغيير كلمة المرور
5. **إجراءات الإدارة**: أي عملية إدارية حساسة

## 🏗️ البنية المعمارية

```
audit/
├── schemas/
│   └── audit-log.schema.ts      # Schema الرئيسي
├── audit.controller.ts           # API Endpoints
├── audit.module.ts              # Module Configuration
└── README.md                    # هذا الملف
```

### الخدمة المشتركة
```
shared/services/audit.service.ts  # الخدمة المسؤولة عن التسجيل
```

## 📋 بنية البيانات (Schema)

### AuditLog Schema

```typescript
{
  userId: ObjectId,           // المستخدم المؤثر عليه
  performedBy: ObjectId,      // المستخدم الذي قام بالعملية
  action: AuditAction,        // نوع الإجراء
  resource: AuditResource,    // نوع المورد
  resourceId: string,         // معرف المورد
  oldValues: Object,          // القيم القديمة قبل التغيير
  newValues: Object,          // القيم الجديدة بعد التغيير
  metadata: Object,           // بيانات إضافية
  ipAddress: string,          // عنوان IP
  userAgent: string,          // معلومات المتصفح
  reason: string,             // سبب العملية
  isSensitive: boolean,       // هل العملية حساسة
  sessionId: string,          // معرف الجلسة
  timestamp: Date,            // وقت العملية
  createdAt: Date,            // تاريخ الإنشاء
  updatedAt: Date             // تاريخ التحديث
}
```

## 🎯 أنواع الإجراءات (AuditAction)

### إدارة المستخدمين
- `USER_CREATED` - إنشاء مستخدم
- `USER_UPDATED` - تحديث مستخدم
- `USER_DELETED` - حذف مستخدم
- `USER_SUSPENDED` - تعليق مستخدم
- `USER_ACTIVATED` - تفعيل مستخدم

### المصادقة والتخويل
- `LOGIN_SUCCESS` - تسجيل دخول ناجح
- `LOGIN_FAILED` - محاولة تسجيل دخول فاشلة
- `LOGOUT` - تسجيل خروج
- `PASSWORD_CHANGED` - تغيير كلمة المرور
- `PASSWORD_RESET` - إعادة تعيين كلمة المرور

### الصلاحيات والأدوار
- `PERMISSION_GRANTED` - منح صلاحية
- `PERMISSION_REVOKED` - إلغاء صلاحية
- `ROLE_ASSIGNED` - تعيين دور
- `ROLE_REMOVED` - إزالة دور
- `CAPABILITY_APPROVED` - الموافقة على قدرة
- `CAPABILITY_REJECTED` - رفض قدرة

### إجراءات النظام
- `ADMIN_ACTION` - إجراء إداري
- `SYSTEM_BACKUP` - نسخ احتياطي
- `SYSTEM_MAINTENANCE` - صيانة
- `DATA_MIGRATION` - ترحيل بيانات

## 🔖 أنواع الموارد (AuditResource)

- `USER` - مستخدم
- `PERMISSION` - صلاحية
- `ROLE` - دور
- `CAPABILITY` - قدرة
- `SYSTEM` - نظام
- `AUTH` - مصادقة
- `ADMIN` - إدارة

## 🔌 API Endpoints

### 1. الحصول على سجلات التدقيق
```http
GET /admin/audit/logs
```

**Query Parameters:**
- `userId` - معرف المستخدم المؤثر عليه
- `performedBy` - معرف المستخدم الذي قام بالعملية
- `action` - نوع الإجراء (AuditAction)
- `resource` - نوع المورد (AuditResource)
- `resourceId` - معرف المورد
- `startDate` - تاريخ البداية (ISO format)
- `endDate` - تاريخ النهاية (ISO format)
- `isSensitive` - فلتر العمليات الحساسة (true/false)
- `limit` - عدد النتائج (default: 50)
- `skip` - تخطي عدد من النتائج (default: 0)

**مثال:**
```bash
GET /admin/audit/logs?action=PERMISSION_GRANTED&limit=20&skip=0
```

**Response:**
```json
{
  "logs": [
    {
      "userId": "64abc123...",
      "performedBy": "64def456...",
      "action": "permission.granted",
      "resource": "permission",
      "resourceId": "manage_users",
      "reason": "ترقية المستخدم",
      "timestamp": "2024-01-15T10:30:00Z",
      "isSensitive": true
    }
  ],
  "meta": {
    "total": 150,
    "limit": 20,
    "skip": 0,
    "hasMore": true
  }
}
```

### 2. الحصول على إحصائيات التدقيق
```http
GET /admin/audit/stats
```

**Query Parameters:**
- `startDate` - تاريخ البداية (اختياري)
- `endDate` - تاريخ النهاية (اختياري)

**Response:**
```json
{
  "totalLogs": 1250,
  "sensitiveLogs": 450,
  "permissionChanges": 120,
  "roleChanges": 80,
  "capabilityDecisions": 60,
  "adminActions": 95,
  "authEvents": 895,
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }
}
```

### 3. الحصول على أنواع الإجراءات المتاحة
```http
GET /admin/audit/actions
```

**Response:**
```json
[
  "user.created",
  "user.updated",
  "permission.granted",
  "role.assigned",
  "auth.login.success",
  ...
]
```

### 4. الحصول على أنواع الموارد المتاحة
```http
GET /admin/audit/resources
```

**Response:**
```json
[
  "user",
  "permission",
  "role",
  "capability",
  "system",
  "auth",
  "admin"
]
```

## 🔐 الصلاحيات المطلوبة

جميع endpoints تتطلب:
- **Authentication**: Bearer Token
- **Roles**: `ADMIN` أو `SUPER_ADMIN`

## 📝 استخدام AuditService

### 1. تسجيل تغيير صلاحية

```typescript
await this.auditService.logPermissionChange({
  userId: '64abc123...',
  permission: 'manage_users',
  action: 'grant',
  grantedBy: '64def456...',
  reason: 'ترقية المستخدم إلى مدير',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  sessionId: 'sess_xyz'
});
```

### 2. تسجيل تغيير دور

```typescript
await this.auditService.logRoleChange({
  userId: '64abc123...',
  role: 'ADMIN',
  action: 'assign',
  changedBy: '64def456...',
  reason: 'تعيين كمدير نظام',
  oldValues: { role: 'USER' },
  newValues: { role: 'ADMIN' }
});
```

### 3. تسجيل قرار Capability

```typescript
await this.auditService.logCapabilityDecision({
  userId: '64abc123...',
  capability: 'engineer_approval',
  action: 'approve',
  decidedBy: '64def456...',
  reason: 'استيفاء جميع المتطلبات'
});
```

### 4. تسجيل حدث مصادقة

```typescript
await this.auditService.logAuthEvent({
  userId: '64abc123...',
  action: 'login_success',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  sessionId: 'sess_xyz'
});
```

### 5. تسجيل إجراء إداري

```typescript
await this.auditService.logAdminAction({
  adminId: '64def456...',
  action: 'bulk_update_users',
  resource: 'user',
  resourceId: 'bulk_operation_123',
  details: {
    affectedUsers: 50,
    operation: 'status_update'
  },
  reason: 'تحديث جماعي للحالة'
});
```

## 🔍 الفهارس (Indexes)

النظام يستخدم الفهارس التالية لتحسين الأداء:

```typescript
{ userId: 1, timestamp: -1 }
{ performedBy: 1, timestamp: -1 }
{ action: 1, timestamp: -1 }
{ resource: 1, timestamp: -1 }
{ resourceId: 1, timestamp: -1 }
{ timestamp: -1 }
{ isSensitive: 1, timestamp: -1 }
{ userId: 1, action: 1, timestamp: -1 }
```

## 🧹 تنظيف السجلات القديمة

```typescript
// حذف السجلات غير الحساسة الأقدم من 90 يوم
const deletedCount = await this.auditService.cleanupOldLogs(90);
```

**ملاحظة**: السجلات الحساسة (`isSensitive: true`) يتم الاحتفاظ بها لفترة أطول ولا يتم حذفها تلقائياً.

## 🔄 التكامل مع الخدمات الأخرى

### AuthService
```typescript
// في auth.service.ts
await this.auditService.logAuthEvent({
  userId: user._id,
  action: 'login_success',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

### PermissionsService
```typescript
// في permissions.service.ts
await this.auditService.logPermissionChange({
  userId: targetUserId,
  permission: permissionName,
  action: 'grant',
  grantedBy: adminId,
  reason: dto.reason
});
```

### UsersService
```typescript
// في users.service.ts
await this.auditService.logRoleChange({
  userId: user._id,
  role: newRole,
  action: 'assign',
  changedBy: adminId
});
```

## 📊 حالات الاستخدام

### 1. مراجعة التغييرات الأمنية
```typescript
// الحصول على جميع تغييرات الصلاحيات في آخر 7 أيام
const logs = await auditService.searchAuditLogs({
  resource: AuditResource.PERMISSION,
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  isSensitive: true
});
```

### 2. تتبع نشاط مستخدم معين
```typescript
// جميع الإجراءات التي قام بها مدير
const adminActions = await auditService.searchAuditLogs({
  performedBy: adminId,
  startDate: startOfMonth,
  endDate: endOfMonth
});
```

### 3. مراقبة محاولات تسجيل الدخول الفاشلة
```typescript
const failedLogins = await auditService.searchAuditLogs({
  action: AuditAction.LOGIN_FAILED,
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
});
```

## ⚠️ ملاحظات هامة

1. **الأداء**: النظام مصمم ليكون غير معرقل - فشل التسجيل لا يؤثر على العملية الأساسية
2. **الأمان**: جميع العمليات الحساسة يتم تمييزها بـ `isSensitive: true`
3. **البيانات الحساسة**: لا تقم بتسجيل كلمات المرور أو tokens في الـ metadata
4. **الحجم**: يُنصح بإعداد job دوري لتنظيف السجلات القديمة
5. **الاحتفاظ**: السجلات الحساسة يُنصح بالاحتفاظ بها 180+ يوم

## 🔧 الإعدادات الموصى بها

```typescript
// في cron job أو scheduled task
@Cron('0 0 * * 0') // كل أسبوع
async cleanupOldAuditLogs() {
  const deletedCount = await this.auditService.cleanupOldLogs(90);
  this.logger.log(`Cleaned up ${deletedCount} old audit logs`);
}
```

## 📈 التطوير المستقبلي

- [ ] إضافة تنبيهات للأنشطة المشبوهة
- [ ] تصدير السجلات بصيغات مختلفة (CSV, PDF)
- [ ] لوحة تحكم تفاعلية لمراقبة السجلات
- [ ] تكامل مع أنظمة SIEM خارجية
- [ ] تشفير البيانات الحساسة في السجلات

## 📞 الدعم

للاستفسارات والدعم الفني، يرجى التواصل مع فريق التطوير.

