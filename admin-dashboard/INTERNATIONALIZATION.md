# دليل الترجمة (Internationalization Guide)

## نظرة عامة
تم إعداد نظام الترجمة (i18n) في التطبيق لدعم اللغتين العربية والإنجليزية مع تغيير الاتجاه (RTL/LTR) تلقائياً.

## الملفات المهمة

### 1. ملفات الترجمة
- `src/core/i18n/locales/ar/common.json` - الترجمات العربية
- `src/core/i18n/locales/en/common.json` - الترجمات الإنجليزية

### 2. تكوين الترجمة
- `src/core/i18n/config.ts` - إعدادات i18next

### 3. إدارة الحالة
- `src/store/themeStore.ts` - إدارة الثيم والاتجاه

## كيفية الاستخدام

### 1. استخدام الترجمة في المكونات
```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

### 2. تغيير اللغة
```tsx
const { i18n } = useTranslation();

const handleChangeLanguage = (lang: 'ar' | 'en') => {
  i18n.changeLanguage(lang);
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  document.dir = direction;
  document.documentElement.setAttribute('dir', direction);
};
```

### 3. إضافة ترجمات جديدة
1. أضف المفتاح في ملف الترجمة العربية
2. أضف المفتاح في ملف الترجمة الإنجليزية
3. استخدم `t('key')` في المكون

## المفاتيح المتاحة

### التطبيق
- `app.name` - اسم التطبيق
- `app.slogan` - شعار التطبيق

### التنقل
- `navigation.dashboard` - لوحة التحكم
- `navigation.users` - المستخدمون
- `navigation.products` - المنتجات
- `navigation.categories` - الفئات
- `navigation.orders` - الطلبات
- `navigation.settings` - الإعدادات

### الإجراءات
- `actions.add` - إضافة
- `actions.edit` - تعديل
- `actions.delete` - حذف
- `actions.save` - حفظ
- `actions.cancel` - إلغاء

### الحالة
- `status.active` - نشط
- `status.inactive` - غير نشط
- `status.pending` - قيد الانتظار

### عام
- `common.loading` - جارٍ التحميل
- `common.noData` - لا توجد بيانات
- `common.error` - حدث خطأ
- `common.success` - تم بنجاح

## الميزات

### 1. تغيير تلقائي للاتجاه
عند تغيير اللغة، يتغير الاتجاه تلقائياً:
- العربية → RTL
- الإنجليزية → LTR

### 2. حفظ اللغة
يتم حفظ اللغة المختارة في localStorage

### 3. اكتشاف اللغة
يتم اكتشاف اللغة من:
1. localStorage
2. متصفح المستخدم

### 4. دعم CSS RTL
يتم تطبيق `stylis-plugin-rtl` لتعديل الأنماط تلقائياً

## الاختبار

تم إنشاء مكون اختبار في `src/components/LanguageTest.tsx` لاختبار وظائف الترجمة.

## إضافة لغات جديدة

1. أنشئ مجلد جديد في `src/core/i18n/locales/`
2. أضف ملف `common.json` للغة الجديدة
3. حدث `src/core/i18n/config.ts` لإضافة اللغة
4. حدث `src/config/constants.ts` لإضافة اللغة المدعومة
