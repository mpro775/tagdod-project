# نظام الألوان - Tagadodo Theme System

## نظرة عامة

نظام الألوان في Tagadodo مصمم ليوفر تجربة بصرية متسقة وجذابة عبر التطبيق. يستخدم الألوان الأساسية للعلامة التجارية مع دعم كامل للوضع الفاتح والداكن.

## الألوان الأساسية

### 🎨 اللون الأساسي (Primary)
- **اللون الرئيسي**: `#1A8BC2` - أزرق Tagadodo
- **اللون الفاتح**: `#4DB8E6` - للخلفيات والتأثيرات الفاتحة
- **اللون الداكن**: `#1470A3` - للعناصر الداكنة والتأثيرات

### 🌿 اللون الثانوي (Secondary)
- **اللون الرئيسي**: `#90EE90` - أخضر فاتح
- **اللون الفاتح**: `#B8F5B8` - للخلفيات الفاتحة
- **اللون الداكن**: `#7DD87D` - للعناصر الداكنة

### ⚫ الألوان المحايدة
- **الأسود**: `#000000`
- **الرمادي الداكن**: `#333333`
- **الرمادي المتوسط**: `#666666`
- **الرمادي الفاتح**: `#F5F5F5`
- **الأبيض**: `#FFFFFF`

## الملفات الرئيسية

### 1. `colors.ts`
```typescript
import { colors } from '@/core/theme/colors';

// استخدام الألوان في المكونات
<Button sx={{ backgroundColor: colors.primary.main }}>
  زر أساسي
</Button>
```

### 2. `theme.ts`
```typescript
import { createAppTheme } from '@/core/theme/theme';

// إنشاء ثيم مخصص
const customTheme = createAppTheme('light', 'rtl', 'ar');
```

### 3. `brand-colors.css`
```css
/* متغيرات CSS للألوان */
:root {
  --tagadodo-primary: #1A8BC2;
  --tagadodo-secondary: #90EE90;
}
```

## الاستخدام في المكونات

### Material-UI Components
```jsx
import { Button, Card, Typography } from '@mui/material';
import { colors } from '@/core/theme/colors';

// زر أساسي
<Button
  variant="contained"
  sx={{
    backgroundColor: colors.primary.main,
    '&:hover': {
      backgroundColor: colors.primary.dark,
    },
  }}
>
  حفظ
</Button>

// بطاقة مخصصة
<Card
  sx={{
    backgroundColor: colors.background.paper,
    border: `2px solid ${colors.border.primary}`,
    boxShadow: `0 4px 8px ${colors.shadow.primary}`,
  }}
>
  <CardContent>
    <Typography color="primary" variant="h5">
      عنوان البطاقة
    </Typography>
  </CardContent>
</Card>
```

### CSS Classes
```jsx
// استخدام فئات CSS
<div className="bg-primary text-white">
  خلفية زرقاء مع نص أبيض
</div>

<div className="bg-secondary text-black">
  خلفية خضراء مع نص أسود
</div>
```

### CSS Variables
```css
.custom-component {
  background-color: var(--tagadodo-primary);
  color: var(--tagadodo-white);
  border: 1px solid var(--tagadodo-secondary);
}
```

## فئات CSS المتاحة

### الخلفيات
- `.bg-primary` - خلفية زرقاء
- `.bg-secondary` - خلفية خضراء
- `.bg-light` - خلفية فاتحة
- `.bg-dark` - خلفية داكنة

### النصوص
- `.text-primary` - نص أزرق
- `.text-secondary` - نص أخضر
- `.text-dark` - نص داكن
- `.text-light` - نص فاتح

### الأزرار
- `.btn-primary` - زر أزرق
- `.btn-secondary` - زر أخضر

### الحدود
- `.border-primary` - حدود زرقاء
- `.border-secondary` - حدود خضراء

## التدرجات المتاحة

```typescript
import { gradients } from '@/core/theme/colors';

// تدرج أساسي
<div style={{ background: gradients.primary }}>
  تدرج أزرق
</div>

// تدرج ثانوي
<div style={{ background: gradients.secondary }}>
  تدرج أخضر
</div>

// تدرج العلامة التجارية
<div style={{ background: gradients.brand }}>
  تدرج مختلط
</div>
```

## الوضع المظلم

```typescript
import { darkColors } from '@/core/theme/colors';

// استخدام ألوان الوضع المظلم
const darkTheme = createAppTheme('dark', 'rtl', 'ar');
```

## أدوات مساعدة

### تحويل الألوان
```typescript
import { colorUtils } from '@/core/theme/colors';

// تحويل hex إلى rgba
const rgba = colorUtils.hexToRgba('#1A8BC2', 0.5);

// تحويل hex إلى hsl
const hsl = colorUtils.hexToHsl('#1A8BC2');

// إنشاء تدرج
const gradient = colorUtils.createGradient('#1A8BC2', '#90EE90');

// فحص التباين
const contrast = colorUtils.getContrastRatio('#1A8BC2', '#FFFFFF');
```

## أمثلة عملية

### شريط تنقل
```jsx
<AppBar
  sx={{
    background: gradients.primary,
    boxShadow: `0 2px 4px ${colors.shadow.primary}`,
  }}
>
  <Toolbar>
    <Typography variant="h6" sx={{ color: colors.text.light }}>
      Tagadodo
    </Typography>
  </Toolbar>
</AppBar>
```

### بطاقة إحصائيات
```jsx
<Card
  sx={{
    background: gradients.brand,
    color: colors.text.light,
    borderRadius: 2,
    p: 3,
  }}
>
  <Typography variant="h4" gutterBottom>
    إجمالي المبيعات
  </Typography>
  <Typography variant="h2" color="inherit">
    1,234,567 ريال
  </Typography>
</Card>
```

### زر الحالة
```jsx
<Button
  variant="contained"
  sx={{
    backgroundColor: colors.status.success,
    '&:hover': {
      backgroundColor: colors.secondary.dark,
    },
  }}
>
  تم الحفظ بنجاح
</Button>
```

## أفضل الممارسات

### 1. التباين
- استخدم الأزرق على الخلفيات الفاتحة
- استخدم الأبيض على الخلفيات الزرقاء
- استخدم الأسود على الخلفيات الخضراء

### 2. التسلسل الهرمي
- الأزرق للعناصر الأساسية (أزرار، روابط)
- الأخضر للعناصر الثانوية (حالات النجاح)
- الرمادي للنصوص الثانوية

### 3. الحالات التفاعلية
- `:hover` - استخدم الألوان الداكنة
- `:active` - استخدم الألوان الفاتحة
- `:focus` - استخدم الحدود الزرقاء

## الاختبار

```bash
# تشغيل أمثلة الألوان
npm run storybook

# أو تشغيل المكونات مباشرة
import { ColorShowcase } from '@/core/theme/ColorExamples';
```

## الدعم

للحصول على مساعدة في استخدام نظام الألوان:

1. راجع ملف `COLORS_GUIDE.md`
2. شاهد أمثلة في `ColorExamples.tsx`
3. اختبر الألوان في `ColorShowcase`

---

**ملاحظة**: تأكد من اختبار الألوان على شاشات مختلفة وفي ظروف إضاءة متنوعة لضمان أفضل تجربة مستخدم.
