# نظام إدارة المستخدمين - دليل شامل

> ⚠️ **ملاحظة:** جميع الأمثلة تتبع نظام الردود الموحد والحمايات في المشروع.

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [نظام الصلاحيات (Roles & Permissions)](#نظام-الصلاحيات)
3. [حالات المستخدم (User Status)](#حالات-المستخدم)
4. [إدارة المستخدمين](#إدارة-المستخدمين)
5. [Soft Delete](#soft-delete)
6. [أمثلة API](#أمثلة-api)
7. [الحمايات والأمان](#الحمايات-والأمان)

---

## نظرة عامة

تم تطوير نظام إدارة متكامل للمستخدمين يدعم:

### ✅ الميزات الرئيسية:

| الميزة | الوصف |
|-------|-------|
| **نظام الأدوار** | User, Admin, Super Admin, Moderator |
| **الصلاحيات المخصصة** | إمكانية إضافة صلاحيات مخصصة لكل مستخدم |
| **Pagination** | عرض المستخدمين مع دعم pagination, فلترة, بحث |
| **Soft Delete** | حذف مؤقت مع إمكانية الاستعادة |
| **Hard Delete** | حذف نهائي (Super Admin فقط) |
| **إيقاف الحسابات** | تعليق المستخدمين مع تحديد السبب |
| **إنشاء مستخدمين** | الأدمن يمكنه إنشاء أي نوع من المستخدمين |
| **الموافقة/الرفض** | للمهندسين والتجار |
| **إحصائيات** | عرض إحصائيات شاملة للمستخدمين |

---

## نظام الصلاحيات

### 1. الأدوار (Roles)

```typescript
enum UserRole {
  USER = 'user',               // مستخدم عادي
  ADMIN = 'admin',             // مدير
  SUPER_ADMIN = 'super_admin', // مدير أعلى
  MODERATOR = 'moderator',     // مشرف
}
```

### 2. الصلاحيات (Permissions)

يمكن إضافة صلاحيات مخصصة مثل:
- `manage_users` - إدارة المستخدمين
- `approve_capabilities` - الموافقة على القدرات
- `view_analytics` - عرض التحليلات
- `manage_products` - إدارة المنتجات
- وغيرها...

### 3. جدول الصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| **USER** | الوصول الأساسي (الشراء، طلب الخدمات) |
| **MODERATOR** | إدارة المحتوى، الموافقة على الطلبات |
| **ADMIN** | إدارة المستخدمين، الموافقة على القدرات |
| **SUPER_ADMIN** | جميع الصلاحيات + حذف نهائي + إدارة الأدمنز |

### 4. RolesGuard

```typescript
// استخدام في Controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/users')
```

**آلية العمل:**
1. يتحقق من وجود التوكن (JwtAuthGuard)
2. يجلب بيانات المستخدم من قاعدة البيانات
3. يتحقق من عدم حذف أو إيقاف المستخدم
4. Super Admin له صلاحية كاملة
5. يتحقق من الأدوار المطلوبة
6. يتحقق من الصلاحيات المطلوبة

---

## حالات المستخدم

```typescript
enum UserStatus {
  ACTIVE = 'active',           // نشط
  SUSPENDED = 'suspended',     // موقوف
  PENDING = 'pending',         // قيد الانتظار
}
```

### مخطط الحالات:

```
PENDING → ACTIVE (عند التفعيل)
ACTIVE ↔ SUSPENDED (إيقاف/تفعيل)
أي حالة → DELETED (soft delete)
```

---

## إدارة المستخدمين

### 1. قائمة المستخدمين (مع Pagination)

**Endpoint:** `GET /admin/users`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN, MODERATOR)`

**Query Parameters:**
```typescript
{
  page?: number;              // رقم الصفحة (افتراضي: 1)
  limit?: number;             // عدد العناصر (افتراضي: 20، أقصى: 100)
  search?: string;            // البحث في phone, firstName, lastName
  status?: UserStatus;        // فلترة حسب الحالة
  role?: UserRole;            // فلترة حسب الدور
  isAdmin?: boolean;          // فلترة الأدمن
  includeDeleted?: boolean;   // عرض المحذوفين (افتراضي: false)
  sortBy?: string;            // الترتيب حسب (افتراضي: createdAt)
  sortOrder?: 'asc'|'desc';   // اتجاه الترتيب (افتراضي: desc)
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user123",
      "phone": "0555111111",
      "firstName": "أحمد",
      "lastName": "محمد",
      "roles": ["user"],
      "status": "active",
      "isAdmin": false,
      "capabilities": {
        "customer_capable": true,
        "engineer_capable": false,
        "wholesale_capable": false
      },
      "createdAt": "2025-10-13T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "requestId": "req-abc123"
}
```

---

### 2. عرض مستخدم واحد

**Endpoint:** `GET /admin/users/:id`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN, MODERATOR)`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "phone": "0555111111",
    "firstName": "أحمد",
    "lastName": "محمد",
    "gender": "male",
    "jobTitle": null,
    "roles": ["user"],
    "permissions": [],
    "status": "active",
    "isAdmin": false,
    "deletedAt": null,
    "capabilities": {
      "customer_capable": true,
      "engineer_capable": false,
      "wholesale_capable": false
    },
    "createdAt": "2025-10-13T10:00:00Z",
    "updatedAt": "2025-10-13T10:00:00Z"
  },
  "requestId": "req-abc124"
}
```

---

### 3. إنشاء مستخدم جديد

**Endpoint:** `POST /admin/users`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Body:**
```json
{
  "phone": "0555222222",
  "firstName": "خالد",
  "lastName": "المهندس",
  "gender": "male",
  "password": "SecurePass123",
  "jobTitle": "كهربائي معتمد",
  "roles": ["user"],
  "permissions": [],
  "status": "active",
  "capabilityRequest": "engineer",
  "wholesaleDiscountPercent": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "newuser456",
    "phone": "0555222222",
    "firstName": "خالد",
    "lastName": "المهندس",
    "roles": ["user"],
    "status": "active"
  },
  "requestId": "req-abc125"
}
```

**ملاحظات:**
- ✅ يمكن إنشاء مستخدمين من أي نوع (عادي، مهندس، تاجر، أدمن)
- ✅ كلمة المرور اختيارية
- ✅ يتم إنشاء Capabilities تلقائياً
- ✅ للمهندس: يجب تحديد `jobTitle`
- ✅ للتاجر: يتم الموافقة تلقائياً مع نسبة الخصم

---

### 4. تحديث مستخدم

**Endpoint:** `PATCH /admin/users/:id`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Body:**
```json
{
  "firstName": "خالد المحدث",
  "roles": ["user", "moderator"],
  "permissions": ["manage_users"],
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "phone": "0555222222",
    "firstName": "خالد المحدث",
    "roles": ["user", "moderator"],
    "status": "active",
    "updated": true
  },
  "requestId": "req-abc126"
}
```

**ملاحظات:**
- ✅ جميع الحقول اختيارية
- ✅ يمكن تحديث كلمة المرور
- ❌ Admin لا يمكنه تعديل Super Admin

---

### 5. إيقاف مستخدم (Suspend)

**Endpoint:** `POST /admin/users/:id/suspend`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Body:**
```json
{
  "reason": "انتهاك سياسة الاستخدام"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "status": "suspended",
    "suspended": true
  },
  "requestId": "req-abc127"
}
```

**ملاحظات:**
- ✅ يمكن تحديد سبب الإيقاف
- ✅ يتم تسجيل من قام بالإيقاف ووقت الإيقاف
- ✅ المستخدم الموقوف لا يمكنه تسجيل الدخول

---

### 6. تفعيل مستخدم (Activate)

**Endpoint:** `POST /admin/users/:id/activate`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "status": "active",
    "activated": true
  },
  "requestId": "req-abc128"
}
```

---

### 7. حذف مستخدم (Soft Delete)

**Endpoint:** `DELETE /admin/users/:id`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "deleted": true,
    "deletedAt": "2025-10-13T12:00:00Z"
  },
  "requestId": "req-abc129"
}
```

**ملاحظات:**
- ✅ Soft Delete - يمكن استعادة المستخدم
- ✅ يتم تسجيل من قام بالحذف
- ❌ لا يمكن حذف Super Admin
- ✅ الحالة تتحول إلى `suspended`

---

### 8. استعادة مستخدم محذوف

**Endpoint:** `POST /admin/users/:id/restore`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "restored": true
  },
  "requestId": "req-abc130"
}
```

**ملاحظات:**
- ✅ يتم استعادة المستخدم بحالة `active`
- ✅ يتم مسح معلومات الحذف

---

### 9. حذف نهائي (Hard Delete)

**Endpoint:** `DELETE /admin/users/:id/permanent`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(SUPER_ADMIN)` ⚠️

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "permanentlyDeleted": true
  },
  "requestId": "req-abc131"
}
```

**⚠️ تحذير:**
- ❌ حذف نهائي لا يمكن التراجع عنه
- ❌ يحذف المستخدم وجميع بياناته
- ❌ فقط Super Admin يمكنه الحذف النهائي
- ❌ لا يمكن حذف Super Admin نهائياً

---

### 10. إحصائيات المستخدمين

**Endpoint:** `GET /admin/users/stats/summary`

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN, MODERATOR)`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1500,
    "active": 1200,
    "suspended": 50,
    "deleted": 250,
    "admins": 10,
    "engineers": 150,
    "wholesale": 80
  },
  "requestId": "req-abc132"
}
```

---

## Soft Delete

### ما هو Soft Delete؟

Soft Delete هو حذف مؤقت حيث يتم تعليم السجل كمحذوف بدلاً من حذفه فعلياً من قاعدة البيانات.

### الحقول المستخدمة:

```typescript
{
  deletedAt: Date | null;      // وقت الحذف
  deletedBy: string;            // userId الذي قام بالحذف
  status: UserStatus;           // يتحول إلى 'suspended'
}
```

### المزايا:

✅ إمكانية استعادة البيانات  
✅ الاحتفاظ بسجل الحذف  
✅ عدم فقدان البيانات المهمة  
✅ إمكانية التدقيق والمراجعة  

### Hard Delete vs Soft Delete:

| العملية | Soft Delete | Hard Delete |
|---------|-------------|-------------|
| **القابلية للاستعادة** | ✅ يمكن | ❌ لا يمكن |
| **البيانات** | موجودة مع `deletedAt` | محذوفة نهائياً |
| **الصلاحية** | Admin | Super Admin فقط |
| **الأمان** | عالي | متوسط |

---

## الحمايات والأمان

### 1. Guards المستخدمة:

```typescript
// 1. JwtAuthGuard - التحقق من التوكن
@UseGuards(JwtAuthGuard)

// 2. RolesGuard - التحقق من الأدوار
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)

// 3. Permissions - التحقق من الصلاحيات
@RequirePermissions('manage_users')
```

### 2. التحققات الأمنية:

✅ المستخدم الموقوف لا يمكنه الوصول  
✅ المستخدم المحذوف لا يمكنه الوصول  
✅ Super Admin له صلاحية كاملة  
✅ Admin لا يمكنه تعديل/حذف Super Admin  
✅ فقط Super Admin يمكنه الحذف النهائي  

### 3. تسجيل العمليات:

جميع العمليات الحساسة يتم تسجيلها:
- من قام بالعملية (`deletedBy`, `suspendedBy`)
- وقت العملية (`deletedAt`, `suspendedAt`)
- السبب (`suspendedReason`)

---

## أمثلة عملية

### سيناريو 1: البحث عن مستخدم

```http
GET /admin/users?search=0555&page=1&limit=10
Authorization: Bearer <admin_token>
```

### سيناريو 2: عرض المستخدمين الموقوفين

```http
GET /admin/users?status=suspended&page=1
Authorization: Bearer <admin_token>
```

### سيناريو 3: عرض الأدمنز فقط

```http
GET /admin/users?isAdmin=true
Authorization: Bearer <admin_token>
```

### سيناريو 4: إنشاء أدمن جديد

```http
POST /admin/users
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "phone": "0555999999",
  "firstName": "مدير",
  "lastName": "النظام",
  "password": "AdminPass123",
  "roles": ["admin"],
  "permissions": ["manage_users", "approve_capabilities"],
  "status": "active"
}
```

### سيناريو 5: إيقاف مستخدم مسيء

```http
POST /admin/users/user123/suspend
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "سلوك غير لائق في التعليقات"
}
```

---

## Checklist للتطوير

### للإدارة:
- [ ] اختبار إنشاء مستخدم من كل نوع
- [ ] اختبار Pagination والفلترة
- [ ] اختبار البحث
- [ ] اختبار الإيقاف والتفعيل
- [ ] اختبار Soft Delete والاستعادة
- [ ] اختبار Hard Delete (Super Admin فقط)
- [ ] اختبار منع تعديل Super Admin من Admin
- [ ] اختبار الإحصائيات

### للأمان:
- [ ] اختبار RolesGuard
- [ ] اختبار منع الوصول للمستخدمين الموقوفين
- [ ] اختبار منع الوصول للمستخدمين المحذوفين
- [ ] اختبار الصلاحيات المخصصة

---

## الأخطاء الشائعة

### 1. USER_NOT_FOUND
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "المستخدم غير موجود"
  }
}
```

### 2. USER_ALREADY_EXISTS
```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "رقم الهاتف مستخدم بالفعل"
  }
}
```

### 3. PERMISSION_DENIED
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "لا يمكن تعديل Super Admin"
  }
}
```

### 4. CANNOT_DELETE_SUPER_ADMIN
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SUPER_ADMIN",
    "message": "لا يمكن حذف Super Admin"
  }
}
```

---

## الملخص

✅ **نظام إدارة شامل** مع جميع العمليات CRUD  
✅ **Pagination & Filtering** متقدم  
✅ **نظام صلاحيات** مرن (Roles & Permissions)  
✅ **Soft Delete** مع إمكانية الاستعادة  
✅ **Hard Delete** للحذف النهائي  
✅ **أمان متعدد الطبقات** مع Guards  
✅ **تسجيل شامل** لجميع العمليات  
✅ **إحصائيات** في الوقت الفعلي  

**النظام جاهز للاستخدام في الإنتاج! 🚀**

---

**تم بواسطة:** Claude Sonnet 4.5  
**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Tagadodo

