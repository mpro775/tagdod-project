# 🏙️ تحسين حقل المدينة - City Field Enhancement

## ✅ التحسين المُطبق

### قبل التحسين:
- ❌ حقل المدينة يظهر **فقط للمهندسين**
- ❌ غير متاح للمستخدمين العاديين والتجار

### بعد التحسين:
- ✅ حقل المدينة يظهر **لجميع المستخدمين**:
  - 🔵 **مستخدم** (User) → المدينة متاحة
  - 🟡 **مهندس** (Engineer) → المدينة متاحة
  - 🟢 **تاجر** (Merchant) → المدينة متاحة
  - 🔴 **أدمن** (Admin) → المدينة غير مطلوبة
  - ⚫ **سوبر أدمن** (Super Admin) → المدينة غير مطلوبة

---

## 📍 قائمة المدن اليمنية المدعومة

تم إضافة **22 مدينة يمنية**:

1. صنعاء (الافتراضية) ⭐
2. عدن
3. تعز
4. الحديدة
5. إب
6. ذمار
7. المكلا
8. حجة
9. عمران
10. صعدة
11. سيئون
12. زنجبار
13. مأرب
14. البيضاء
15. لحج
16. أبين
17. شبوة
18. المحويت
19. حضرموت
20. الجوف
21. المهرة
22. سقطرى

---

## 🎯 موقع الحقل في النموذج

### المعلومات الأساسية:
```
┌─────────────────────────────────────────┐
│ رقم الهاتف *        │ الاسم الأول      │
├─────────────────────────────────────────┤
│ الاسم الأخير        │ الجنس           │
├─────────────────────────────────────────┤
│ المدينة ⭐          │ كلمة المرور      │
│ (للجميع عدا الأدمن) │                  │
└─────────────────────────────────────────┘
```

### معلومات المهندس (إضافية):
```
┌─────────────────────────────────────────┐
│ المسمى الوظيفي / التخصص               │
│ (مهندس كهربائي، طاقة شمسية...)        │
└─────────────────────────────────────────┘
```

---

## 🔧 التغييرات التقنية

### Backend:

#### 1. DTOs محدثة:
```typescript
// create-user-admin.dto.ts
export class CreateUserAdminDto {
  phone!: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
  city?: string;  // ✅ مضاف
  // ...
}

// update-user-admin.dto.ts
export class UpdateUserAdminDto {
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
  city?: string;  // ✅ مضاف
  // ...
}
```

#### 2. Controller محدث:
```typescript
// في createUser
const userData = {
  phone: dto.phone,
  firstName: dto.firstName,
  lastName: dto.lastName,
  gender: dto.gender,
  jobTitle: dto.jobTitle,
  city: dto.city || 'صنعاء',  // ✅ مضاف
  // ...
};

// في updateUser
if (dto.city !== undefined) user.city = dto.city;  // ✅ مضاف
```

### Frontend:

#### 1. Types محدثة:
```typescript
// user.types.ts
export interface User {
  phone: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
  city?: string;  // ✅ مضاف
  // ...
}

export interface CreateUserDto {
  // ...
  jobTitle?: string;
  city?: string;  // ✅ مضاف
  // ...
}
```

#### 2. Constants جديدة:
```typescript
// yemen-cities.ts ✅ ملف جديد
export const YEMEN_CITIES = [
  { value: 'صنعاء', label: 'صنعاء' },
  { value: 'عدن', label: 'عدن' },
  // ... 22 مدينة
];

export const DEFAULT_CITY = 'صنعاء';
```

#### 3. Form Schema محدث:
```typescript
const userSchema = z.object({
  // ...
  jobTitle: z.string().optional(),
  city: z.string().optional(),  // ✅ مضاف
  // ...
});
```

#### 4. Component محدث:
```tsx
{/* المدينة - لجميع المستخدمين عدا الأدمن */}
{!isAdminRole() && (
  <Grid size={{ xs: 12, sm: 6 }}>
    <FormSelect
      name="city"
      label="المدينة"
      options={YEMEN_CITIES}
      helperText={
        primaryRole === UserRole.ENGINEER 
          ? "المدينة التي يعمل فيها المهندس" 
          : "مدينة المستخدم"
      }
    />
  </Grid>
)}
```

---

## 💡 فوائد التحسين

### 1. **للمستخدمين العاديين**:
- يمكن تحديد مدينتهم لتحسين تجربة الشحن والتوصيل
- مفيد لعرض عروض خاصة بالمدينة

### 2. **للمهندسين**:
- **ضروري** لتحديد منطقة عملهم
- يُستخدم في مطابقة طلبات الخدمة بالمهندسين القريبين
- يظهر للعملاء عند اختيار المهندس

### 3. **للتجار**:
- تحديد مدينة المتجر/المخزن
- مفيد للتحليلات الجغرافية

### 4. **للأدمن**:
- غير مطلوب لأن الأدمن يعمل على مستوى النظام بأكمله

---

## 🔄 كيفية الاستخدام

### إنشاء مستخدم جديد:
1. اذهب إلى `/users/new`
2. املأ المعلومات الأساسية
3. اختر الدور (User/Engineer/Merchant)
4. **اختر المدينة** من القائمة المنسدلة ✅
5. للمهندس: أضف أيضاً المسمى الوظيفي
6. للتاجر: أضف أيضاً نسبة التخفيض
7. احفظ

---

## 📊 البيانات

### في قاعدة البيانات:
```javascript
// مثال: مهندس
{
  "_id": "...",
  "phone": "+967777123456",
  "firstName": "أحمد",
  "lastName": "محمد",
  "jobTitle": "مهندس كهربائي",
  "city": "صنعاء",  // ✅
  "roles": ["engineer"],
  "engineer_capable": true,
  "engineer_status": "approved"
}

// مثال: تاجر
{
  "_id": "...",
  "phone": "+967777654321",
  "firstName": "فاطمة",
  "city": "عدن",  // ✅
  "roles": ["merchant"],
  "wholesale_capable": true,
  "wholesale_discount_percent": 15
}

// مثال: مستخدم عادي
{
  "_id": "...",
  "phone": "+967777111222",
  "firstName": "علي",
  "city": "تعز",  // ✅
  "roles": ["user"],
  "customer_capable": true
}
```

---

## 📂 الملفات المعدلة

### Backend:
- ✅ `backend/src/modules/users/admin/dto/create-user-admin.dto.ts`
- ✅ `backend/src/modules/users/admin/dto/update-user-admin.dto.ts`
- ✅ `backend/src/modules/users/admin/users.admin.controller.ts`

### Frontend:
- ✅ جديد: `admin-dashboard/src/shared/constants/yemen-cities.ts`
- ✅ `admin-dashboard/src/features/users/types/user.types.ts`
- ✅ `admin-dashboard/src/features/users/pages/UserFormPage.tsx`

---

## ✅ النتيجة النهائية

**حقل المدينة الآن:**
- ✅ متاح لجميع المستخدمين (عدا الأدمن)
- ✅ في قسم المعلومات الأساسية
- ✅ قائمة منسدلة ب 22 مدينة يمنية
- ✅ صنعاء كقيمة افتراضية
- ✅ نص توضيحي مختلف حسب نوع المستخدم
- ✅ مُحفوظ في قاعدة البيانات
- ✅ يعمل في Create و Update

**جاهز للاستخدام! 🎉**

---

تاريخ التحديث: 2025-10-29

