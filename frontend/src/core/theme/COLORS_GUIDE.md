# دليل ألوان Tagadodo - Colors Guide

## الألوان الأساسية

### اللون الأساسي (Primary)
- **اللون الرئيسي**: `#1A8BC2` - أزرق Tagadodo
- **اللون الفاتح**: `#4DB8E6` - للخلفيات الفاتحة
- **اللون الداكن**: `#1470A3` - للعناصر الداكنة

### اللون الثانوي (Secondary)
- **اللون الرئيسي**: `#90EE90` - أخضر فاتح
- **اللون الفاتح**: `#B8F5B8` - للخلفيات الفاتحة
- **اللون الداكن**: `#7DD87D` - للعناصر الداكنة

### الألوان المحايدة
- **الأسود**: `#000000`
- **الرمادي الداكن**: `#333333`
- **الرمادي الفاتح**: `#F5F5F5`
- **الأبيض**: `#FFFFFF`

## استخدام الألوان في الكود

### CSS Variables
```css
/* الألوان الأساسية */
--tagadodo-primary: #1A8BC2;
--tagadodo-secondary: #90EE90;
--tagadodo-black: #000000;
--tagadodo-dark: #333333;
--tagadodo-light: #F5F5F5;
```

### Material-UI Theme
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1A8BC2',
      light: '#4DB8E6',
      dark: '#1470A3',
    },
    secondary: {
      main: '#90EE90',
      light: '#B8F5B8',
      dark: '#7DD87D',
    },
  },
});
```

### React Components
```jsx
// استخدام الألوان في المكونات
<Button 
  sx={{ 
    backgroundColor: 'primary.main',
    color: 'white',
    '&:hover': {
      backgroundColor: 'primary.dark',
    }
  }}
>
  زر أساسي
</Button>
```

## فئات CSS المساعدة

### الخلفيات
```css
.bg-primary     /* خلفية زرقاء */
.bg-secondary   /* خلفية خضراء */
.bg-light       /* خلفية فاتحة */
.bg-dark        /* خلفية داكنة */
```

### النصوص
```css
.text-primary   /* نص أزرق */
.text-secondary /* نص أخضر */
.text-dark      /* نص داكن */
.text-light     /* نص فاتح */
```

### الأزرار
```css
.btn-primary    /* زر أزرق */
.btn-secondary  /* زر أخضر */
```

### الحدود
```css
.border-primary   /* حدود زرقاء */
.border-secondary /* حدود خضراء */
```

## أمثلة الاستخدام

### بطاقة (Card)
```jsx
<Card 
  sx={{
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'primary.light',
    boxShadow: '0 4px 8px rgba(26, 139, 194, 0.1)',
  }}
>
  محتوى البطاقة
</Card>
```

### زر أساسي
```jsx
<Button
  variant="contained"
  sx={{
    backgroundColor: 'primary.main',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
  }}
>
  حفظ
</Button>
```

### زر ثانوي
```jsx
<Button
  variant="outlined"
  sx={{
    borderColor: 'secondary.main',
    color: 'secondary.main',
    '&:hover': {
      backgroundColor: 'secondary.light',
      borderColor: 'secondary.dark',
    },
  }}
>
  إلغاء
</Button>
```

### شريط تنقل
```jsx
<AppBar
  sx={{
    backgroundColor: 'primary.main',
    boxShadow: '0 2px 4px rgba(26, 139, 194, 0.2)',
  }}
>
  <Toolbar>
    <Typography variant="h6" color="white">
      Tagadodo
    </Typography>
  </Toolbar>
</AppBar>
```

## نصائح التصميم

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

## الألوان في الوضع المظلم

```css
@media (prefers-color-scheme: dark) {
  :root {
    --tagadodo-bg-light: #1a1a1a;
    --tagadodo-text-primary: #ffffff;
    --tagadodo-text-secondary: #cccccc;
  }
}
```

## الألوان في الأجهزة المحمولة

```css
@media (max-width: 768px) {
  :root {
    --tagadodo-primary: #1A8BC2;
    --tagadodo-secondary: #90EE90;
  }
}
```

## أدوات مفيدة

### محول الألوان
- [Coolors.co](https://coolors.co) - لإنشاء لوحات ألوان
- [Adobe Color](https://color.adobe.com) - لتحليل الألوان
- [Material Design Colors](https://material.io/design/color/) - لألوان Material Design

### فحص التباين
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Oracle](https://colororacle.org/) - لمحاكاة عمى الألوان

---

**ملاحظة**: تأكد من اختبار الألوان على شاشات مختلفة وفي ظروف إضاءة متنوعة لضمان أفضل تجربة مستخدم.
