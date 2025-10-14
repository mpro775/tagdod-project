# البدء السريع - نظام إدارة المستخدمين

## 🚀 في 5 دقائق!

### 1. الفهم السريع

```
المستخدم → الدور (Role) → الصلاحيات (Permissions)
```

**الأدوار الموجودة:**
- `user` - مستخدم عادي
- `moderator` - مشرف محتوى
- `admin` - مدير
- `super_admin` - مدير أعلى (صلاحيات كاملة)

---

### 2. القراءة بالترتيب

```bash
1. ADMIN_QUICK_START.md           # ← أنت هنا! 🔥
2. ADMIN_USERS_MANAGEMENT_SYSTEM.md  # دليل شامل
3. ADMIN_API_EXAMPLES.md          # أمثلة عملية
```

---

### 3. أول خطوة: عرض المستخدمين

```http
GET /admin/users?page=1&limit=20
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 4. إنشاء مستخدم

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "0555111111",
  "firstName": "أحمد",
  "password": "SecurePass123",
  "status": "active"
}
```

---

### 5. البحث عن مستخدم

```http
GET /admin/users?search=0555
Authorization: Bearer <admin_token>
```

---

### 6. إيقاف مستخدم

```http
POST /admin/users/{id}/suspend
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "سبب الإيقاف"
}
```

---

### 7. حذف مؤقت (Soft Delete)

```http
DELETE /admin/users/{id}
Authorization: Bearer <admin_token>
```

---

### 8. استعادة محذوف

```http
POST /admin/users/{id}/restore
Authorization: Bearer <admin_token>
```

---

## 📊 العمليات الأساسية

| العملية | Endpoint | Method | الحماية |
|---------|----------|--------|---------|
| **قائمة المستخدمين** | `/admin/users` | GET | Admin |
| **عرض مستخدم** | `/admin/users/:id` | GET | Admin |
| **إنشاء** | `/admin/users` | POST | Admin |
| **تحديث** | `/admin/users/:id` | PATCH | Admin |
| **إيقاف** | `/admin/users/:id/suspend` | POST | Admin |
| **تفعيل** | `/admin/users/:id/activate` | POST | Admin |
| **حذف مؤقت** | `/admin/users/:id` | DELETE | Admin |
| **استعادة** | `/admin/users/:id/restore` | POST | Admin |
| **حذف نهائي** | `/admin/users/:id/permanent` | DELETE | **Super Admin** |
| **إحصائيات** | `/admin/users/stats/summary` | GET | Admin |

---

## 🔐 الصلاحيات

### Admin يمكنه:
✅ عرض جميع المستخدمين  
✅ إنشاء مستخدمين جدد  
✅ تحديث المستخدمين  
✅ إيقاف/تفعيل  
✅ حذف مؤقت واستعادة  
❌ حذف Super Admin  
❌ حذف نهائي (Hard Delete)  

### Super Admin يمكنه:
✅ **جميع صلاحيات Admin**  
✅ حذف نهائي للمستخدمين  
✅ إنشاء/تعديل/حذف Admins  
✅ صلاحيات كاملة  

---

## 📋 سيناريوهات سريعة

### إنشاء مهندس:

```http
POST /admin/users
{
  "phone": "0555222222",
  "firstName": "خالد",
  "jobTitle": "كهربائي",
  "capabilityRequest": "engineer"
}
```

### إنشاء تاجر بخصم 15%:

```http
POST /admin/users
{
  "phone": "0555333333",
  "firstName": "علي",
  "capabilityRequest": "wholesale",
  "wholesaleDiscountPercent": 15
}
```

### إنشاء أدمن (Super Admin فقط):

```http
POST /admin/users
Authorization: Bearer <super_admin_token>
{
  "phone": "0550000010",
  "firstName": "مدير",
  "password": "AdminPass123",
  "roles": ["admin"],
  "permissions": ["manage_users"]
}
```

---

## 🔍 البحث والفلترة

```http
# البحث برقم الهاتف
GET /admin/users?search=0555

# المستخدمين الموقوفين
GET /admin/users?status=suspended

# الأدمنز فقط
GET /admin/users?isAdmin=true

# المحذوفين
GET /admin/users?includeDeleted=true

# الصفحة الثانية
GET /admin/users?page=2&limit=20
```

---

## ⚠️ أخطاء شائعة

### 1. محاولة إنشاء مستخدم موجود:
```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "رقم الهاتف مستخدم بالفعل"
  }
}
```

### 2. Admin يحاول تعديل Super Admin:
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "لا يمكن تعديل Super Admin"
  }
}
```

### 3. محاولة حذف Super Admin:
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

## ✅ Checklist سريع

- [ ] عرض قائمة المستخدمين
- [ ] البحث عن مستخدم
- [ ] إنشاء مستخدم عادي
- [ ] إنشاء مهندس
- [ ] إنشاء تاجر
- [ ] تحديث معلومات مستخدم
- [ ] إيقاف مستخدم
- [ ] تفعيل مستخدم
- [ ] حذف مؤقت
- [ ] استعادة محذوف
- [ ] عرض الإحصائيات

---

## 🎯 ما التالي؟

### للتفاصيل الكاملة:
👉 [`ADMIN_USERS_MANAGEMENT_SYSTEM.md`](./ADMIN_USERS_MANAGEMENT_SYSTEM.md)

### للأمثلة العملية:
👉 [`ADMIN_API_EXAMPLES.md`](./ADMIN_API_EXAMPLES.md)

---

## 💡 نصائح سريعة

1. **استخدم Pagination** - لا تحمل جميع المستخدمين مرة واحدة
2. **Soft Delete أولاً** - يمكن الاستعادة لاحقاً
3. **سجل الأسباب** - عند الإيقاف، دائماً أضف السبب
4. **Super Admin محمي** - لا يمكن حذفه أو تعديله من Admin عادي
5. **الأمان أولاً** - استخدم الـ Guards دائماً

---

**جاهز للبدء! 🚀**

**تم بواسطة:** Claude Sonnet 4.5  
**المشروع:** Tagadodo

