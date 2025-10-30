# 🔄 القدرات التلقائية - Automatic Capabilities Assignment

## 📋 نظرة عامة

في النظام المُحسّن، **القدرات (Capabilities) تُحدد تلقائياً** بناءً على الدور المختار، بدلاً من عرض نموذج منفصل للمستخدم لتحديدها يدوياً.

---

## ✨ كيف يعمل النظام التلقائي

### الدور → القدرة التلقائية

عند إنشاء أو تعديل مستخدم، يتم تحديد القدرات تلقائياً كالتالي:

| الدور المختار | القدرة التلقائية | الحقول الإضافية |
|---------------|-------------------|------------------|
| **مستخدم** (User) | `customer_capable: true` | - |
| **مهندس** (Engineer) | `engineer_capable: true`<br/>`engineer_status: pending` | المسمى الوظيفي |
| **تاجر** (Merchant) | `wholesale_capable: true`<br/>`wholesale_status: pending` | نسبة التخفيض % |
| **أدمن** (Admin) | `admin_capable: true`<br/>`admin_status: approved` | الصلاحيات المخصصة |
| **سوبر أدمن** (Super Admin) | `admin_capable: true`<br/>`admin_status: approved` | جميع الصلاحيات |

---

## 🔧 المنطق في الكود

### في UserFormPage.tsx:

```typescript
// Submit handler
const onSubmit = (data: UserFormData) => {
  const userData = {
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    jobTitle: data.jobTitle,
    password: data.password,
    roles: data.roles,
    permissions: data.permissions || [],
    status: data.status,
  };

  // القدرات تُحدد تلقائياً حسب الدور
  const primaryRole = data.roles[0];
  
  if (primaryRole === UserRole.ENGINEER) {
    // ✅ تلقائياً: engineer_capable = true
    userData.capabilityRequest = 'engineer';
  } 
  else if (primaryRole === UserRole.MERCHANT) {
    // ✅ تلقائياً: wholesale_capable = true
    userData.capabilityRequest = 'wholesale';
    userData.wholesaleDiscountPercent = data.wholesaleDiscountPercent;
  }
  // else if Admin/SuperAdmin → تُحدد في الباك إند تلقائياً

  // إرسال للباك إند
  createUser(userData);
}
```

---

## 🎯 في الباك إند

### UsersAdminController / UsersService:

```typescript
async createUser(dto: CreateUserDto) {
  const user = new User();
  user.phone = dto.phone;
  user.roles = dto.roles;
  
  // تحديد القدرات تلقائياً
  if (dto.capabilityRequest === 'engineer') {
    user.engineer_capable = true;
    user.engineer_status = 'pending'; // يحتاج موافقة
  }
  else if (dto.capabilityRequest === 'wholesale') {
    user.wholesale_capable = true;
    user.wholesale_status = 'pending'; // يحتاج موافقة
    user.wholesale_discount_percent = dto.wholesaleDiscountPercent || 0;
  }
  else if (dto.roles.includes('admin') || dto.roles.includes('super_admin')) {
    user.admin_capable = true;
    user.admin_status = 'approved'; // مُوافق تلقائياً
  }
  else {
    user.customer_capable = true; // الافتراضي للمستخدم العادي
  }
  
  await user.save();
}
```

---

## 📝 الحقول في النموذج

### ما يظهر للمستخدم:

#### 1️⃣ مستخدم عادي (User):
```
✅ المعلومات الأساسية (هاتف، اسم، جنس)
✅ كلمة المرور
ℹ️ تنبيه: "سيحصل تلقائياً على قدرة عميل"
```

#### 2️⃣ مهندس (Engineer):
```
✅ المعلومات الأساسية
✅ كلمة المرور
✅ المسمى الوظيفي (مهندس كهربائي، إلخ)
ℹ️ تنبيه: "سيحصل تلقائياً على قدرة مهندس"
ℹ️ تنبيه: "ستحتاج الموافقة من الإدارة"
```

#### 3️⃣ تاجر (Merchant):
```
✅ المعلومات الأساسية
✅ كلمة المرور
✅ نسبة التخفيض % (0-100)
ℹ️ تنبيه: "سيحصل تلقائياً على قدرة تاجر جملة"
ℹ️ تنبيه: "يمكنك تحديد نسبة التخفيض"
```

#### 4️⃣ أدمن (Admin):
```
✅ المعلومات الأساسية
✅ كلمة المرور
✅ قوالب الصلاحيات الجاهزة
✅ تخصيص الصلاحيات (100+ صلاحية في 20 فئة)
ℹ️ يتم الموافقة على قدرة الأدمن تلقائياً
```

#### 5️⃣ سوبر أدمن (Super Admin):
```
✅ المعلومات الأساسية
✅ كلمة المرور
✅ قوالب الصلاحيات + "جميع الصلاحيات"
✅ تخصيص الصلاحيات
ℹ️ يحصل على جميع القدرات تلقائياً
```

---

## 🔄 حالات القدرات (Capability Status)

### حالات الموافقة:
- **none** - لا توجد قدرة
- **pending** - في انتظار الموافقة
- **approved** - تم الموافقة
- **rejected** - تم الرفض

### متى تُطبق كل حالة:

| الدور | الحالة الابتدائية | يحتاج موافقة؟ |
|-------|-------------------|---------------|
| User | customer_capable → automatic | ❌ لا |
| Engineer | engineer_capable → **pending** | ✅ نعم |
| Merchant | wholesale_capable → **pending** | ✅ نعم |
| Admin | admin_capable → **approved** | ❌ لا (فوري) |
| Super Admin | admin_capable → **approved** | ❌ لا (فوري) |

---

## 🎯 أمثلة عملية

### مثال 1: إنشاء مهندس

```typescript
// المدخلات:
{
  phone: "+967777123456",
  firstName: "أحمد",
  lastName: "محمد",
  jobTitle: "مهندس كهربائي",
  roles: ["engineer"],
  status: "active"
}

// النتيجة التلقائية في الباك إند:
{
  ...userInfo,
  roles: ["engineer"],
  customer_capable: false,
  engineer_capable: true,      // ✅ تلقائي
  engineer_status: "pending",  // ✅ يحتاج موافقة
  wholesale_capable: false,
  admin_capable: false
}
```

### مثال 2: إنشاء تاجر

```typescript
// المدخلات:
{
  phone: "+967777654321",
  firstName: "فاطمة",
  roles: ["merchant"],
  wholesaleDiscountPercent: 15  // خصم 15%
}

// النتيجة التلقائية:
{
  ...userInfo,
  roles: ["merchant"],
  customer_capable: false,
  engineer_capable: false,
  wholesale_capable: true,              // ✅ تلقائي
  wholesale_status: "pending",          // ✅ يحتاج موافقة
  wholesale_discount_percent: 15,       // ✅ من المدخلات
  admin_capable: false
}
```

### مثال 3: إنشاء أدمن

```typescript
// المدخلات:
{
  phone: "+967777999888",
  firstName: "محمد",
  roles: ["admin"],
  permissions: [
    "products.read",
    "products.create",
    "products.update",
    "admin.access"
  ]
}

// النتيجة التلقائية:
{
  ...userInfo,
  roles: ["admin"],
  permissions: [...selected],
  customer_capable: false,
  engineer_capable: false,
  wholesale_capable: false,
  admin_capable: true,       // ✅ تلقائي
  admin_status: "approved"   // ✅ موافق فوراً
}
```

---

## ✅ الفوائد

### 1. **تجربة مستخدم أبسط**
- ❌ لا حاجة لاختيار القدرات يدوياً
- ✅ النظام يعرف ما يحتاجه كل دور
- ✅ أقل خطوات، أسرع إنشاء

### 2. **أقل عرضة للأخطاء**
- ❌ لا يمكن نسيان تحديد قدرة
- ❌ لا يمكن تحديد قدرات متضاربة
- ✅ منطق ثابت ومتسق

### 3. **صيانة أسهل**
- ✅ المنطق في مكان واحد (onSubmit)
- ✅ سهل الفهم والتعديل
- ✅ موثق جيداً

---

## 🔍 الموافقة على القدرات

### لتفعيل قدرة مهندس أو تاجر:

1. اذهب إلى **قائمة المستخدمين**
2. افتح صفحة المستخدم
3. في قسم **"القدرات"**، ستجد:
   - 🟡 **قيد الانتظار** (Pending)
   - زر **"موافقة"** (Approve)
   - زر **"رفض"** (Reject)

4. اضغط **موافقة** → القدرة تصبح `approved` ✅

---

## 📞 للمطورين

### إضافة قدرة جديدة:

1. **في Schema** (`backend/src/modules/users/schemas/user.schema.ts`):
```typescript
@Prop({ default: false }) 
my_new_capability!: boolean;

@Prop({ type: String, enum: CapabilityStatus, default: 'none' })
my_new_capability_status!: CapabilityStatus;
```

2. **في المنطق** (`UserFormPage.tsx`):
```typescript
if (primaryRole === UserRole.MY_NEW_ROLE) {
  userData.capabilityRequest = 'my_new_capability';
}
```

3. **في التنبيه**:
```typescript
{primaryRole === UserRole.MY_NEW_ROLE && (
  <Box sx={{ mt: 1 }}>
    • سيحصل تلقائياً على قدرة "..."
  </Box>
)}
```

---

## ✅ الخلاصة

- ✅ **لا حاجة لـ UserCapabilitiesManager** في النموذج
- ✅ **القدرات تُحدد تلقائياً** حسب الدور
- ✅ **تنبيهات واضحة** للمستخدم
- ✅ **منطق بسيط** وسهل الصيانة

**النظام الآن أبسط وأكثر ذكاءً!** 🎯

---

تاريخ التحديث: 2025-10-29

