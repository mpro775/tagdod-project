# تحديث شعار الشريط الجانبي - Sidebar Logo Update

## نظرة عامة
تم استبدال نص "لوحة التحكم" في أعلى الشريط الجانبي بصورة الشعار (logo.png) لتحسين المظهر البصري للتطبيق.

## التغييرات المطبقة

### ملف Sidebar.tsx
- **الموقع**: `frontend/src/shared/components/Layout/Sidebar.tsx`
- **التغيير**: استبدال النص بالصورة في قسم Logo/Title

#### قبل التحديث:
```tsx
<Box sx={{ p: 2, textAlign: 'center' }}>
  <Typography variant="h6" fontWeight="bold">
    {t('app.name')}
  </Typography>
  <Typography variant="caption" color="text.secondary">
    {t('navigation.dashboard')}
  </Typography>
</Box>
```

#### بعد التحديث:
```tsx
<Box sx={{ p: 2, textAlign: 'center' }}>
  <Box
    component="img"
    src={logoImage}
    alt="Tagadodo Logo"
    sx={{
      height: 60,
      width: 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
      mb: 1,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    }}
  />
  <Typography variant="h6" fontWeight="bold">
    {t('app.name')}
  </Typography>
</Box>
```

## المميزات المضافة

### 1. استيراد الصورة
```tsx
import logoImage from '../../../assets/images/logo.png';
```

### 2. تصميم الصورة
- **الارتفاع**: 60px
- **العرض**: تلقائي (auto) مع الحفاظ على النسب
- **الحد الأقصى للعرض**: 100% لمنع تجاوز الحاوية
- **التناسب**: `contain` للحفاظ على النسب
- **الهامش السفلي**: 1 وحدة للمسافة من النص
- **التأثير البصري**: ظل خفيف `drop-shadow`

### 3. إمكانية الوصول
- **النص البديل**: "Tagadodo Logo" للمستخدمين الذين يعانون من ضعف البصر
- **الاستجابة**: الصورة تتكيف مع أحجام الشاشات المختلفة

## النتيجة النهائية
- الشريط الجانبي يعرض الآن شعار التطبيق بدلاً من نص "لوحة التحكم"
- تحسين المظهر البصري والهوية البصرية
- الحفاظ على اسم التطبيق أسفل الشعار
- تصميم متجاوب ومناسب لجميع أحجام الشاشات
