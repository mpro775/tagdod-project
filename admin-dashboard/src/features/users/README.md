# 👥 إدارة المستخدمين - User Management

## 📁 البنية الموحدة

```
users/
├── pages/
│   ├── UsersListPage.tsx       # قائمة المستخدمين
│   ├── UserFormPage.tsx        # نموذج موحد لجميع الأنواع ✨
│   ├── UserAnalyticsPage.tsx   # تحليلات المستخدمين
│   └── index.ts
├── components/
│   ├── UserRoleManager.tsx     # إدارة الأدوار والصلاحيات
│   ├── UserCapabilitiesManager.tsx  # إدارة القدرات
│   └── ... (مكونات أخرى)
├── api/
│   ├── usersApi.ts            # API المستخدمين
│   └── adminApi.ts            # API الأدمن
├── hooks/
│   └── useUsers.ts            # React Query hooks
├── types/
│   └── user.types.ts          # TypeScript types
└── styles/
    └── responsive-users.css   # أنماط responsive
```

---

## 🎯 UserFormPage - النموذج الموحد

### الميزات الرئيسية:
✅ **نموذج واحد لجميع أنواع المستخدمين**
- مستخدم عادي (User)
- مهندس (Engineer)
- تاجر (Merchant)
- أدمن (Admin)
- سوبر أدمن (Super Admin)

✅ **قوالب صلاحيات جاهزة** (للأدمن):
- مدير المنتجات
- مدير المبيعات
- مدير الدعم
- مدير التسويق
- مدير المحتوى
- قراءة فقط
- جميع الصلاحيات

✅ **حقول ديناميكية**:
- المسمى الوظيفي (للمهندسين فقط)
- نسبة التخفيض (للتجار فقط)
- الصلاحيات المخصصة (للأدمن فقط)

---

## 🔄 الاستخدام

### إنشاء مستخدم جديد
```typescript
navigate('/users/new')
```

### تعديل مستخدم
```typescript
navigate(`/users/${userId}`)
```

---

## 🔐 نظام الصلاحيات

### أدوار المستخدمين (UserRole):
```typescript
enum UserRole {
  USER = 'user',           // مستخدم عادي
  ENGINEER = 'engineer',   // مهندس
  MERCHANT = 'merchant',   // تاجر
  ADMIN = 'admin',         // أدمن
  SUPER_ADMIN = 'super_admin'  // سوبر أدمن
}
```

### حالات المستخدم (UserStatus):
```typescript
enum UserStatus {
  ACTIVE = 'active',       // نشط
  PENDING = 'pending',     // قيد الانتظار
  SUSPENDED = 'suspended', // معلق
  DELETED = 'deleted'      // محذوف
}
```

---

## 🎨 المكونات الرئيسية

### 1. UserRoleManager
إدارة الأدوار والصلاحيات المخصصة للأدمن
```tsx
<UserRoleManager
  roles={roles}
  permissions={permissions}
  onRolesChange={handleRolesChange}
  onPermissionsChange={handlePermissionsChange}
/>
```

### 2. UserCapabilitiesManager
عرض وإدارة قدرات المستخدم (مهندس، تاجر، إلخ)
```tsx
<UserCapabilitiesManager
  role={role}
  capabilities={capabilities}
  onCapabilitiesChange={handleCapabilitiesChange}
/>
```

---

## 🔧 API Hooks

```typescript
// جلب قائمة المستخدمين
const { data, isLoading } = useUsers(params);

// جلب مستخدم واحد
const { data: user } = useUser(userId);

// إنشاء مستخدم
const { mutate: createUser } = useCreateUser();

// تحديث مستخدم
const { mutate: updateUser } = useUpdateUser();

// حذف مستخدم
const { mutate: deleteUser } = useDeleteUser();

// إيقاف/تفعيل مستخدم
const { mutate: suspendUser } = useSuspendUser();
const { mutate: activateUser } = useActivateUser();
```

---

## 📊 نموذج البيانات

### User Interface:
```typescript
interface User {
  _id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
  roles: UserRole[];
  permissions: string[];
  status: UserStatus;
  preferredCurrency: Currency;
  lastActivityAt: Date;
  deletedAt?: Date | null;
  capabilities?: UserCapabilities;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserCapabilities Interface:
```typescript
interface UserCapabilities {
  customer_capable: boolean;
  engineer_capable: boolean;
  engineer_status: CapabilityStatus;
  wholesale_capable: boolean;
  wholesale_status: CapabilityStatus;
  wholesale_discount_percent: number;
  admin_capable: boolean;
  admin_status: CapabilityStatus;
}
```

---

## 🎯 أفضل الممارسات

1. **استخدم النموذج الموحد** - لا تنشئ نماذج منفصلة
2. **تحقق من الصلاحيات** - قبل إظهار خيارات معينة
3. **استخدم القوالب الجاهزة** - لتوفير الوقت
4. **اختبر جميع الأنواع** - تأكد من عمل كل دور بشكل صحيح

---

## 🚀 للمطورين

### إضافة قالب صلاحيات جديد:
1. افتح `@/shared/constants/permissions.ts`
2. أضف القالب في `PERMISSION_GROUPS`
3. أضف الزر في `UserFormPage.tsx`

### إضافة حقل مخصص لنوع معين:
```tsx
{primaryRole === UserRole.YOUR_TYPE && (
  <Grid size={{ xs: 12, sm: 6 }}>
    <FormInput
      name="customField"
      label="حقلك المخصص"
    />
  </Grid>
)}
```

---

## ✅ تم التوحيد بنجاح!

- ❌ ~~CreateAdminPage~~ (محذوف)
- ✅ UserFormPage (موحد لجميع الأنواع)
- ✅ نموذج واحد، منطق واحد، صيانة أسهل

---

تمت آخر مراجعة: 2025-10-29

