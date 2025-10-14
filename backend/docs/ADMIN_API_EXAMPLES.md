# أمثلة API لإدارة المستخدمين

> ⚠️ **ملاحظة:** جميع الأمثلة تستخدم نظام الردود الموحد والحمايات.

## 📋 الفهرس

1. [إعداد البيئة](#إعداد-البيئة)
2. [قائمة المستخدمين](#1-قائمة-المستخدمين)
3. [عرض مستخدم](#2-عرض-مستخدم-واحد)
4. [إنشاء مستخدمين](#3-إنشاء-مستخدمين)
5. [تحديث مستخدم](#4-تحديث-مستخدم)
6. [إيقاف وتفعيل](#5-إيقاف-وتفعيل)
7. [الحذف والاستعادة](#6-الحذف-والاستعادة)
8. [الإحصائيات](#7-الإحصائيات)
9. [سيناريوهات كاملة](#سيناريوهات-كاملة)

---

## إعداد البيئة

```bash
# متغيرات البيئة
base_url=http://localhost:3000

# التوكنات
super_admin_token=eyJhbGciOiJIUzI1NiIs...
admin_token=eyJhbGciOiJIUzI1NiIs...
moderator_token=eyJhbGciOiJIUzI1NiIs...
```

---

## 1. قائمة المستخدمين

### مثال 1: عرض جميع المستخدمين (الصفحة الأولى)

```http
GET /admin/users?page=1&limit=20
Authorization: Bearer <admin_token>
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN, MODERATOR)`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user001",
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
    {
      "_id": "user002",
      "phone": "0555222222",
      "firstName": "خالد",
      "lastName": "المهندس",
      "gender": "male",
      "jobTitle": "كهربائي معتمد",
      "roles": ["user"],
      "permissions": [],
      "status": "active",
      "isAdmin": false,
      "capabilities": {
        "customer_capable": true,
        "engineer_capable": true,
        "engineer_status": "approved"
      },
      "createdAt": "2025-10-13T11:00:00Z"
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
  "requestId": "req-list001"
}
```

---

### مثال 2: البحث عن مستخدم

```http
GET /admin/users?search=0555&page=1&limit=10
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user001",
      "phone": "0555111111",
      "firstName": "أحمد"
    },
    {
      "_id": "user002",
      "phone": "0555222222",
      "firstName": "خالد"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2
  },
  "requestId": "req-search001"
}
```

---

### مثال 3: فلترة المستخدمين حسب الحالة

```http
GET /admin/users?status=suspended&page=1
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user050",
      "phone": "0555999999",
      "firstName": "مستخدم",
      "status": "suspended",
      "suspendedReason": "انتهاك سياسة الاستخدام",
      "suspendedAt": "2025-10-12T15:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  },
  "requestId": "req-filter001"
}
```

---

### مثال 4: عرض الأدمنز فقط

```http
GET /admin/users?isAdmin=true
Authorization: Bearer <super_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "admin001",
      "phone": "0550000001",
      "firstName": "مدير",
      "lastName": "النظام",
      "roles": ["admin"],
      "permissions": ["manage_users", "approve_capabilities"],
      "status": "active",
      "isAdmin": true
    },
    {
      "_id": "super001",
      "phone": "0550000000",
      "firstName": "المدير",
      "lastName": "الأعلى",
      "roles": ["super_admin"],
      "status": "active",
      "isAdmin": true
    }
  ],
  "meta": {
    "total": 2
  },
  "requestId": "req-admins001"
}
```

---

### مثال 5: عرض المحذوفين

```http
GET /admin/users?includeDeleted=true&page=1
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user099",
      "phone": "0555888888",
      "firstName": "محذوف",
      "status": "suspended",
      "deletedAt": "2025-10-10T12:00:00Z",
      "deletedBy": "admin001"
    }
  ],
  "meta": {
    "page": 1,
    "total": 25
  },
  "requestId": "req-deleted001"
}
```

---

### مثال 6: ترتيب حسب التاريخ (الأحدث أولاً)

```http
GET /admin/users?sortBy=createdAt&sortOrder=desc
Authorization: Bearer <admin_token>
```

---

## 2. عرض مستخدم واحد

```http
GET /admin/users/user001
Authorization: Bearer <admin_token>
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN, MODERATOR)`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user001",
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
    "suspendedReason": null,
    "capabilities": {
      "userId": "user001",
      "customer_capable": true,
      "engineer_capable": false,
      "engineer_status": "none",
      "wholesale_capable": false,
      "wholesale_status": "none",
      "wholesale_discount_percent": 0
    },
    "createdAt": "2025-10-13T10:00:00Z",
    "updatedAt": "2025-10-13T10:00:00Z"
  },
  "requestId": "req-get001"
}
```

---

### مثال خطأ: مستخدم غير موجود

```http
GET /admin/users/nonexistent123
Authorization: Bearer <admin_token>
```

**Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "المستخدم غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err001"
}
```

---

## 3. إنشاء مستخدمين

### مثال 1: إنشاء مستخدم عادي

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "0555333333",
  "firstName": "سعيد",
  "lastName": "العميل",
  "gender": "male",
  "password": "Customer123",
  "status": "active"
}
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user150",
    "phone": "0555333333",
    "firstName": "سعيد",
    "lastName": "العميل",
    "roles": ["user"],
    "status": "active"
  },
  "requestId": "req-create001"
}
```

---

### مثال 2: إنشاء مهندس

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "0555444444",
  "firstName": "محمد",
  "lastName": "الفني",
  "gender": "male",
  "jobTitle": "سباك معتمد",
  "password": "Engineer123",
  "capabilityRequest": "engineer",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user151",
    "phone": "0555444444",
    "firstName": "محمد",
    "lastName": "الفني",
    "roles": ["user"],
    "status": "active"
  },
  "requestId": "req-create002"
}
```

**ملاحظة:** يتم الموافقة على المهندس تلقائياً (`engineer_capable: true`)

---

### مثال 3: إنشاء تاجر بخصم 20%

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "0555555555",
  "firstName": "عبدالله",
  "lastName": "التاجر",
  "gender": "male",
  "password": "Wholesale123",
  "capabilityRequest": "wholesale",
  "wholesaleDiscountPercent": 20,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user152",
    "phone": "0555555555",
    "firstName": "عبدالله",
    "lastName": "التاجر",
    "roles": ["user"],
    "status": "active"
  },
  "requestId": "req-create003"
}
```

**ملاحظة:** يتم الموافقة على التاجر تلقائياً مع خصم 20%

---

### مثال 4: إنشاء أدمن (Super Admin فقط)

```http
POST /admin/users
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "phone": "0550000010",
  "firstName": "مشرف",
  "lastName": "جديد",
  "password": "Admin123456",
  "roles": ["admin"],
  "permissions": ["manage_users", "approve_capabilities"],
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "admin010",
    "phone": "0550000010",
    "firstName": "مشرف",
    "lastName": "جديد",
    "roles": ["admin"],
    "status": "active"
  },
  "requestId": "req-create004"
}
```

---

### مثال 5: إنشاء Moderator

```http
POST /admin/users
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "phone": "0550000020",
  "firstName": "مراقب",
  "lastName": "المحتوى",
  "password": "Moderator123",
  "roles": ["moderator"],
  "permissions": ["manage_products"],
  "status": "active"
}
```

---

### مثال خطأ: رقم مستخدم بالفعل

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "0555111111",
  "firstName": "test"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "رقم الهاتف مستخدم بالفعل",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err002"
}
```

---

### مثال خطأ: مهندس بدون jobTitle

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "0555666666",
  "capabilityRequest": "engineer"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "JOB_TITLE_REQUIRED",
    "message": "المسمى الوظيفي مطلوب للمهندسين",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err003"
}
```

---

## 4. تحديث مستخدم

### مثال 1: تحديث معلومات أساسية

```http
PATCH /admin/users/user001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "أحمد المحدث",
  "lastName": "محمد الجديد"
}
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "phone": "0555111111",
    "firstName": "أحمد المحدث",
    "lastName": "محمد الجديد",
    "roles": ["user"],
    "status": "active",
    "updated": true
  },
  "requestId": "req-update001"
}
```

---

### مثال 2: إضافة دور Moderator

```http
PATCH /admin/users/user001
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "roles": ["user", "moderator"],
  "permissions": ["manage_products", "view_analytics"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "phone": "0555111111",
    "firstName": "أحمد",
    "roles": ["user", "moderator"],
    "status": "active",
    "updated": true
  },
  "requestId": "req-update002"
}
```

---

### مثال 3: تحديث كلمة المرور

```http
PATCH /admin/users/user001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "password": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "updated": true
  },
  "requestId": "req-update003"
}
```

---

### مثال خطأ: Admin يحاول تعديل Super Admin

```http
PATCH /admin/users/super001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "test"
}
```

**Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "لا يمكن تعديل Super Admin",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err004"
}
```

---

## 5. إيقاف وتفعيل

### إيقاف مستخدم

```http
POST /admin/users/user001/suspend
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "انتهاك سياسة الاستخدام - نشر محتوى غير لائق"
}
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "status": "suspended",
    "suspended": true
  },
  "requestId": "req-suspend001"
}
```

---

### تفعيل مستخدم

```http
POST /admin/users/user001/activate
Authorization: Bearer <admin_token>
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "status": "active",
    "activated": true
  },
  "requestId": "req-activate001"
}
```

---

## 6. الحذف والاستعادة

### Soft Delete (حذف مؤقت)

```http
DELETE /admin/users/user001
Authorization: Bearer <admin_token>
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "deleted": true,
    "deletedAt": "2025-10-13T15:30:00Z"
  },
  "requestId": "req-delete001"
}
```

---

### استعادة مستخدم محذوف

```http
POST /admin/users/user001/restore
Authorization: Bearer <admin_token>
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(ADMIN, SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "restored": true
  },
  "requestId": "req-restore001"
}
```

---

### Hard Delete (حذف نهائي)

⚠️ **فقط Super Admin**

```http
DELETE /admin/users/user001/permanent
Authorization: Bearer <super_admin_token>
```

**Guards:** `JwtAuthGuard` + `RolesGuard` + `Roles(SUPER_ADMIN)`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user001",
    "permanentlyDeleted": true
  },
  "requestId": "req-harddelete001"
}
```

⚠️ **تحذير:** لا يمكن التراجع عن هذه العملية!

---

### مثال خطأ: محاولة حذف Super Admin

```http
DELETE /admin/users/super001
Authorization: Bearer <admin_token>
```

**Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SUPER_ADMIN",
    "message": "لا يمكن حذف Super Admin",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err005"
}
```

---

## 7. الإحصائيات

```http
GET /admin/users/stats/summary
Authorization: Bearer <admin_token>
```

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
  "requestId": "req-stats001"
}
```

---

## سيناريوهات كاملة

### سيناريو 1: إنشاء نظام كامل من الصفر

```http
# 1. إنشاء Super Admin (يدوياً في قاعدة البيانات أو seed)

# 2. Super Admin ينشئ Admin
POST /admin/users
Authorization: Bearer <super_admin_token>
{
  "phone": "0550000001",
  "firstName": "مدير",
  "lastName": "عام",
  "password": "AdminSecure123",
  "roles": ["admin"],
  "permissions": ["manage_users", "approve_capabilities"]
}

# 3. Admin ينشئ Moderator
POST /admin/users
Authorization: Bearer <admin_token>
{
  "phone": "0550000002",
  "firstName": "مشرف",
  "lastName": "المحتوى",
  "password": "ModeratorPass123",
  "roles": ["moderator"],
  "permissions": ["manage_products"]
}

# 4. Admin ينشئ مستخدمين
POST /admin/users
{
  "phone": "0555111111",
  "firstName": "أحمد",
  "capabilityRequest": "engineer",
  "jobTitle": "كهربائي"
}

POST /admin/users
{
  "phone": "0555222222",
  "firstName": "علي",
  "capabilityRequest": "wholesale",
  "wholesaleDiscountPercent": 15
}
```

---

### سيناريو 2: إدارة مستخدم مسيء

```http
# 1. تلقي بلاغ عن مستخدم
GET /admin/users/user123

# 2. إيقاف المستخدم مؤقتاً
POST /admin/users/user123/suspend
{
  "reason": "تم تلقي 3 بلاغات عن سلوك غير لائق"
}

# 3. مراجعة الحالة
GET /admin/users/user123

# 4أ. إذا كان البلاغ خاطئ: تفعيل
POST /admin/users/user123/activate

# 4ب. إذا كان البلاغ صحيح: حذف مؤقت
DELETE /admin/users/user123

# 5. بعد فترة: حذف نهائي (Super Admin)
DELETE /admin/users/user123/permanent
```

---

### سيناريو 3: البحث والفلترة

```http
# 1. البحث عن مستخدم برقم الهاتف
GET /admin/users?search=0555

# 2. عرض المستخدمين الموقوفين
GET /admin/users?status=suspended

# 3. عرض المهندسين المفعلين
GET /admin/users?role=user
# ثم فلترة النتائج بـ capabilities.engineer_capable = true

# 4. عرض المحذوفين للمراجعة
GET /admin/users?includeDeleted=true&page=1
```

---

## Checklist للاختبار

### CRUD الأساسية:
- [ ] قائمة المستخدمين مع pagination
- [ ] عرض مستخدم واحد
- [ ] إنشاء مستخدم عادي
- [ ] إنشاء مهندس
- [ ] إنشاء تاجر
- [ ] إنشاء أدمن (Super Admin فقط)
- [ ] تحديث معلومات مستخدم
- [ ] حذف مستخدم (soft delete)

### الصلاحيات:
- [ ] Admin يمكنه إنشاء مستخدمين
- [ ] Admin لا يمكنه تعديل Super Admin
- [ ] فقط Super Admin يمكنه الحذف النهائي
- [ ] RolesGuard يمنع الوصول غير المصرح

### البحث والفلترة:
- [ ] البحث بالهاتف
- [ ] البحث بالاسم
- [ ] فلترة حسب الحالة
- [ ] فلترة حسب الدور
- [ ] عرض المحذوفين

### إيقاف وتفعيل:
- [ ] إيقاف مستخدم
- [ ] تفعيل مستخدم موقوف
- [ ] مستخدم موقوف لا يمكنه الوصول

### الحذف والاستعادة:
- [ ] Soft delete
- [ ] استعادة محذوف
- [ ] Hard delete (Super Admin)
- [ ] منع حذف Super Admin

### الإحصائيات:
- [ ] عرض إحصائيات شاملة

---

**جاهز للاستخدام! 🚀**

---

**تم بواسطة:** Claude Sonnet 4.5  
**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Tagadodo

