# نظام إدارة المستخدمين والصلاحيات - Tagadodo

> 🎯 **نظام إدارة شامل ومتكامل للمستخدمين مع صلاحيات متقدمة**

## 📚 الملفات والوثائق

| الملف | الوصف | متى تستخدمه |
|------|-------|-------------|
| **ADMIN_QUICK_START.md** | 🔥 البدء السريع | ابدأ هنا! |
| **ADMIN_USERS_MANAGEMENT_SYSTEM.md** | 📘 الدليل الشامل | للفهم العميق |
| **ADMIN_API_EXAMPLES.md** | 🧪 أمثلة عملية | للاختبار والتطبيق |
| **ADMIN_SYSTEM_README.md** | 📖 هذا الملف | نظرة عامة |

---

## ✨ الميزات الرئيسية

### 1. نظام الصلاحيات المتقدم

```typescript
// الأدوار (Roles)
enum UserRole {
  USER = 'user',               // مستخدم عادي
  MODERATOR = 'moderator',     // مشرف
  ADMIN = 'admin',             // مدير
  SUPER_ADMIN = 'super_admin', // مدير أعلى
}

// الصلاحيات المخصصة (Permissions)
permissions: ['manage_users', 'approve_capabilities', 'view_analytics', ...]
```

### 2. إدارة شاملة للمستخدمين

✅ **CRUD كامل** مع Pagination  
✅ **البحث والفلترة** المتقدمة  
✅ **Soft Delete** مع إمكانية الاستعادة  
✅ **Hard Delete** للحذف النهائي  
✅ **إيقاف/تفعيل** الحسابات  
✅ **إحصائيات** في الوقت الفعلي  

### 3. إنشاء المستخدمين

يمكن للأدمن إنشاء أي نوع من المستخدمين:
- ✅ مستخدم عادي
- ✅ مهندس (مع الموافقة التلقائية)
- ✅ تاجر (مع نسبة خصم)
- ✅ مشرف (Moderator)
- ✅ مدير (Admin) - Super Admin فقط

### 4. الموافقة والرفض

للمهندسين والتجار:
- ✅ الموافقة التلقائية عند الإنشاء من الأدمن
- ✅ الموافقة/الرفض لطلبات المستخدمين
- ✅ تحديد نسبة الخصم للتاجر

### 5. حذف آمن

- ✅ **Soft Delete**: حذف مؤقت مع إمكانية الاستعادة
- ✅ **Hard Delete**: حذف نهائي (Super Admin فقط)
- ✅ تسجيل من قام بالحذف ومتى
- ✅ حماية Super Admin من الحذف

---

## 🏗️ البنية التقنية

### 1. الملفات المضافة/المعدلة

#### Schemas:
```
backend/src/modules/users/schemas/user.schema.ts
  └─ إضافة: roles, permissions, status, deletedAt, suspendedAt
```

#### DTOs:
```
backend/src/modules/users/admin/dto/
  ├─ create-user-admin.dto.ts
  ├─ update-user-admin.dto.ts
  ├─ list-users.dto.ts
  └─ suspend-user.dto.ts
```

#### Guards & Decorators:
```
backend/src/shared/
  ├─ guards/
  │   └─ roles.guard.ts
  └─ decorators/
      ├─ roles.decorator.ts
      └─ permissions.decorator.ts
```

#### Controllers:
```
backend/src/modules/users/admin/
  ├─ users.admin.controller.ts  (CRUD كامل)
  └─ users.admin.module.ts
```

---

## 🔐 نظام الصلاحيات

### جدول الصلاحيات:

| العملية | User | Moderator | Admin | Super Admin |
|---------|------|-----------|-------|-------------|
| **الشراء والتصفح** | ✅ | ✅ | ✅ | ✅ |
| **إدارة المحتوى** | ❌ | ✅ | ✅ | ✅ |
| **عرض المستخدمين** | ❌ | ✅ | ✅ | ✅ |
| **إنشاء مستخدمين** | ❌ | ❌ | ✅ | ✅ |
| **تعديل مستخدمين** | ❌ | ❌ | ✅ | ✅ |
| **حذف مؤقت** | ❌ | ❌ | ✅ | ✅ |
| **إنشاء Admins** | ❌ | ❌ | ❌ | ✅ |
| **حذف نهائي** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 الاستخدام السريع

### 1. قائمة المستخدمين:

```http
GET /admin/users?page=1&limit=20
Authorization: Bearer <admin_token>
```

### 2. إنشاء مستخدم:

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "0555111111",
  "firstName": "أحمد",
  "password": "SecurePass123"
}
```

### 3. البحث:

```http
GET /admin/users?search=0555
Authorization: Bearer <admin_token>
```

### 4. إيقاف:

```http
POST /admin/users/{id}/suspend
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "سبب الإيقاف"
}
```

### 5. حذف مؤقت:

```http
DELETE /admin/users/{id}
Authorization: Bearer <admin_token>
```

---

## 📊 Endpoints الكاملة

| Endpoint | Method | الوصف | الحماية |
|---------|--------|-------|---------|
| `/admin/users` | GET | قائمة المستخدمين (pagination) | Admin+ |
| `/admin/users/:id` | GET | عرض مستخدم واحد | Admin+ |
| `/admin/users` | POST | إنشاء مستخدم | Admin+ |
| `/admin/users/:id` | PATCH | تحديث مستخدم | Admin+ |
| `/admin/users/:id/suspend` | POST | إيقاف مستخدم | Admin+ |
| `/admin/users/:id/activate` | POST | تفعيل مستخدم | Admin+ |
| `/admin/users/:id` | DELETE | حذف مؤقت (soft) | Admin+ |
| `/admin/users/:id/restore` | POST | استعادة محذوف | Admin+ |
| `/admin/users/:id/permanent` | DELETE | حذف نهائي (hard) | Super Admin |
| `/admin/users/stats/summary` | GET | إحصائيات | Admin+ |

---

## 🎯 حالات الاستخدام

### حالة 1: إدارة مستخدم مسيء

```
1. تلقي بلاغ → GET /admin/users/{id}
2. إيقاف مؤقت → POST /admin/users/{id}/suspend
3. مراجعة → GET /admin/users?status=suspended
4أ. خطأ → POST /admin/users/{id}/activate
4ب. صحيح → DELETE /admin/users/{id}
```

### حالة 2: إنشاء فريق إدارة

```
1. Super Admin ينشئ Admin
2. Admin ينشئ Moderators
3. Moderators يديرون المحتوى
```

### حالة 3: تدقيق وحذف

```
1. عرض المحذوفين → GET /admin/users?includeDeleted=true
2. مراجعة الحسابات
3. استعادة إن لزم → POST /admin/users/{id}/restore
4. حذف نهائي → DELETE /admin/users/{id}/permanent
```

---

## 🛡️ الأمان

### التحققات الأمنية:

✅ **JWT Authentication** - كل الطلبات محمية  
✅ **RolesGuard** - التحقق من الأدوار  
✅ **Permissions Check** - التحقق من الصلاحيات  
✅ **Super Admin Protection** - لا يمكن حذفه  
✅ **Audit Trail** - تسجيل جميع العمليات  
✅ **Soft Delete** - حماية من الحذف الخاطئ  
✅ **Status Check** - منع الوصول للموقوفين/المحذوفين  

### Guards المستخدمة:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
```

---

## 📈 الإحصائيات

```http
GET /admin/users/stats/summary
```

**Response:**
```json
{
  "total": 1500,      // إجمالي المستخدمين
  "active": 1200,     // النشطون
  "suspended": 50,    // الموقوفون
  "deleted": 250,     // المحذوفون
  "admins": 10,       // المديرون
  "engineers": 150,   // المهندسون
  "wholesale": 80     // التجار
}
```

---

## 🔧 التكامل

### مع نظام التاجر والمهندس:

✅ يمكن للأدمن إنشاء مهندسين مباشرة  
✅ يمكن للأدمن إنشاء تجار مع نسبة الخصم  
✅ الموافقة التلقائية عند الإنشاء  
✅ متوافق مع نظام الردود الموحد  

### مع باقي الأنظمة:

✅ متوافق مع `JwtAuthGuard` الحالي  
✅ متوافق مع `AdminGuard` الحالي  
✅ يضيف `RolesGuard` للصلاحيات المتقدمة  
✅ Backward compatible - لا يكسر الكود الموجود  

---

## 📚 التوثيق الكامل

### للبدء السريع:
👉 [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md)

### للدليل الشامل:
👉 [`ADMIN_USERS_MANAGEMENT_SYSTEM.md`](./ADMIN_USERS_MANAGEMENT_SYSTEM.md)

### للأمثلة العملية:
👉 [`ADMIN_API_EXAMPLES.md`](./ADMIN_API_EXAMPLES.md)

### أنظمة أخرى:
- [`WHOLESALE_AND_ENGINEER_SYSTEM.md`](./WHOLESALE_AND_ENGINEER_SYSTEM.md)
- [`API_EXAMPLES_WHOLESALE_ENGINEER.md`](./API_EXAMPLES_WHOLESALE_ENGINEER.md)
- [`RESPONSE_ERROR_SYSTEM.md`](./RESPONSE_ERROR_SYSTEM.md)

---

## ✅ Checklist التطبيق

### للمطورين:
- [ ] فهم نظام الأدوار والصلاحيات
- [ ] مراجعة User Schema الجديد
- [ ] فهم RolesGuard وآلية عمله
- [ ] اختبار جميع الـ endpoints
- [ ] اختبار الحمايات والأمان

### للاختبار:
- [ ] CRUD الأساسية
- [ ] Pagination والفلترة
- [ ] البحث
- [ ] الصلاحيات (Admin vs Super Admin)
- [ ] Soft Delete والاستعادة
- [ ] Hard Delete
- [ ] منع حذف Super Admin
- [ ] الإحصائيات

### للإنتاج:
- [ ] إنشاء Super Admin الأول
- [ ] تعيين صلاحيات الفريق
- [ ] إعداد المراقبة والتسجيل
- [ ] اختبار الأمان
- [ ] مراجعة الأداء

---

## 🎓 المفاهيم الأساسية

### 1. Roles vs Permissions

**Roles (الأدوار):**
- مجموعة محددة مسبقاً
- `user`, `moderator`, `admin`, `super_admin`

**Permissions (الصلاحيات):**
- مخصصة وقابلة للإضافة
- `manage_users`, `approve_capabilities`, `view_analytics`, ...

### 2. Soft Delete vs Hard Delete

**Soft Delete:**
- حذف مؤقت
- يضع `deletedAt` timestamp
- قابل للاستعادة
- الأمان: عالي

**Hard Delete:**
- حذف نهائي
- يحذف من قاعدة البيانات
- غير قابل للاستعادة
- فقط Super Admin

### 3. User Status

```typescript
enum UserStatus {
  ACTIVE = 'active',       // نشط
  SUSPENDED = 'suspended', // موقوف
  PENDING = 'pending',     // قيد الانتظار
}
```

---

## 💡 نصائح مهمة

1. **ابدأ بالبدء السريع** - [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md)
2. **استخدم Soft Delete** - يمكن الاستعادة لاحقاً
3. **سجل الأسباب** - عند الإيقاف أو الحذف
4. **Super Admin محمي** - لا يمكن حذفه أو تعديله
5. **Pagination دائماً** - لا تحمل جميع المستخدمين
6. **الأمان أولاً** - استخدم الحمايات المناسبة

---

## 🚀 الخلاصة

✅ **نظام إدارة شامل** للمستخدمين  
✅ **صلاحيات متقدمة** (Roles & Permissions)  
✅ **Pagination & Filtering** احترافي  
✅ **Soft/Hard Delete** آمن  
✅ **توثيق كامل** مع أمثلة  
✅ **متوافق** مع الأنظمة الموجودة  
✅ **جاهز للإنتاج** 🚀  

---

**تم بواسطة:** Claude Sonnet 4.5  
**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Tagadodo  
**الإصدار:** 1.0.0

---

**للدعم والأسئلة:**  
راجع الملفات الموثقة أو تواصل مع فريق التطوير.

