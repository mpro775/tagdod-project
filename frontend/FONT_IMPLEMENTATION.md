# Graphik Arabic Font Implementation

## نظرة عامة
تم تطبيق خط GraphikArabic كخط رئيسي للمشروع بدلاً من خط Cairo. الخط محمل محلياً من مجلد `assets/fonts/` ويتم استخدامه في جميع أنحاء التطبيق.

## الملفات المحدثة

### 1. ملفات الخطوط
- `src/assets/fonts/stylesheet.css` - تعريفات @font-face لجميع أوزان الخط
- `src/assets/graphik-arabic.css` - ملف تنفيذ شامل للخط

### 2. ملفات التكوين
- `src/assets/fonts.css` - تحديث لاستخدام GraphikArabic كخط رئيسي
- `src/assets/font-fallback.css` - تحديث متغيرات CSS للخط الجديد
- `src/main.tsx` - إضافة تحميل ملف الخط الجديد

### 3. ملف HTML
- `index.html` - إزالة تحميل خطوط Google Fonts

## أوزان الخط المتاحة

| الوزن | القيمة | الوصف |
|--------|--------|--------|
| Thin | 100 | رفيع جداً |
| Extralight | 200 | رفيع جداً |
| Light | 300 | رفيع |
| Regular | 400 | عادي |
| Medium | 500 | متوسط |
| Semibold | 600 | شبه عريض |
| Bold | 700 | عريض |
| Black | 900 | عريض جداً |
| Super | 950 | عريض جداً |

## كيفية الاستخدام

### في CSS
```css
.my-text {
  font-family: 'Graphik Arabic', sans-serif;
  font-weight: 500; /* Medium */
}
```

### في JavaScript/React
```jsx
<div style={{ fontFamily: 'Graphik Arabic', fontWeight: 600 }}>
  النص بالعربية
</div>
```

### فئات CSS المساعدة
```html
<div class="font-medium">نص متوسط</div>
<div class="font-bold">نص عريض</div>
<div class="font-semibold">نص شبه عريض</div>
```

## الخطوط الاحتياطية
في حالة عدم توفر GraphikArabic، سيتم استخدام الخطوط التالية بالترتيب:
1. Graphik Arabic
2. Cairo
3. Tajawal
4. Segoe UI Arabic
5. System fonts

## ملاحظات مهمة
- جميع الخطوط محملة محلياً لضمان الأداء الأفضل
- الخط يدعم النصوص العربية واللاتينية
- تم تحسين عرض الخط باستخدام `font-feature-settings`
- الخط متوافق مع Material-UI components
