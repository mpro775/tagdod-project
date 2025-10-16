# إصلاح: دور واحد فقط للمستخدم

## التغيير المطلوب

بناءً على طلب المستخدم، تم تغيير النظام من دعم عدة أدوار إلى دور واحد فقط للمستخدم.

## التغييرات المطبقة

### 1. مخطط التحقق (Validation Schema)
```typescript
// ❌ قبل التغيير
roles: z.array(z.nativeEnum(UserRole)).min(1, 'يجب اختيار دور واحد على الأقل'),

// ✅ بعد التغيير
role: z.nativeEnum(UserRole, { required_error: 'يجب اختيار دور' }),
```

### 2. القيم الافتراضية
```typescript
// ❌ قبل التغيير
defaultValues: {
  // ...
  roles: [UserRole.USER],
  // ...
}

// ✅ بعد التغيير
defaultValues: {
  // ...
  role: UserRole.USER,
  // ...
}
```

### 3. تحميل بيانات المستخدم
```typescript
// ❌ قبل التغيير
roles: user.roles || [UserRole.USER],

// ✅ بعد التغيير
role: user.roles?.[0] || UserRole.USER, // نأخذ الدور الأول فقط
```

### 4. إرسال البيانات للخادم
```typescript
// ✅ نرسل الدور كمصفوفة كما يتوقع الـ backend
roles: [data.role],
```

### 5. واجهة المستخدم
```typescript
// ❌ قبل التغيير - اختيار متعدد
<FormMultiSelect
  name="roles"
  label="الدور *"
  options={[...]}
/>

// ✅ بعد التغيير - اختيار واحد
<FormSelect
  name="role"
  label="الدور *"
  options={[
    { value: UserRole.USER, label: 'مستخدم' },
    { value: UserRole.MODERATOR, label: 'مشرف' },
    { value: UserRole.ADMIN, label: 'مدير' },
    { value: UserRole.SUPER_ADMIN, label: 'مدير عام' },
  ]}
/>
```

## الأدوار المتاحة

بناءً على تعريف الـ backend في `backend/src/modules/users/schemas/user.schema.ts`:

```typescript
export enum UserRole {
  USER = 'user',           // مستخدم عادي
  ADMIN = 'admin',         // مدير
  SUPER_ADMIN = 'super_admin', // مدير عام
  MODERATOR = 'moderator', // مشرف
}
```

## التوافق مع الـ Backend

- ✅ **الخادم يتوقع**: `roles: UserRole[]` (مصفوفة)
- ✅ **نرسل**: `roles: [data.role]` (مصفوفة تحتوي على دور واحد)
- ✅ **التوافق**: كامل مع API الخادم

## الملفات المحذوفة

- `FormMultiSelect.tsx` - لم يعد مطلوباً

## النتائج

✅ المستخدم يمكن أن يكون له دور واحد فقط  
✅ الواجهة أبسط وأوضح  
✅ التوافق الكامل مع الـ backend  
✅ لا توجد أخطاء "expected array, received string"  
✅ تجربة مستخدم محسنة  

## ملاحظات مهمة

1. **الخادم**: ما زال يدعم عدة أدوار في المخطط، لكن الواجهة ترسل دور واحد فقط
2. **المرونة**: يمكن تغيير هذا في المستقبل إذا احتجنا دعم عدة أدوار
3. **البيانات الموجودة**: المستخدمون الحاليون الذين لديهم عدة أدوار سيعرضون الدور الأول فقط في الواجهة
