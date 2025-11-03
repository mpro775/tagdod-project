# 🚀 دليل سريع: استخدام i18n في المكونات

## 💡 الاستخدام الأساسي

### 1. استيراد واستخدام الترجمة:
```typescript
import { useTranslation } from 'react-i18next';

function ProductsPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.products')}</h1>
      <button>{t('actions.add')}</button>
    </div>
  );
}
```

### 2. تغيير اللغة:
```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}>
      {i18n.language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
}
```

### 3. الترجمة مع متغيرات:
```typescript
// في قاعدة البيانات: "الحد الأدنى {{min}} أحرف"
<p>{t('validation.minLength', { min: 6 })}</p>
// النتيجة: "الحد الأدنى 6 أحرف"
```

---

## 📋 الترجمات الجاهزة

### القوائم:
- `navigation.dashboard` → "لوحة التحكم"
- `navigation.products` → "المنتجات"
- `navigation.users` → "المستخدمون"
- `navigation.orders` → "الطلبات"
- `navigation.settings` → "الإعدادات"

### الأزرار:
- `actions.add` → "إضافة"
- `actions.edit` → "تعديل"
- `actions.delete` → "حذف"
- `actions.save` → "حفظ"
- `actions.cancel` → "إلغاء"
- `actions.search` → "بحث"

### الحالات:
- `status.active` → "نشط"
- `status.inactive` → "غير نشط"
- `status.pending` → "قيد الانتظار"
- `status.confirmed` → "مؤكد"

### عام:
- `common.loading` → "جارٍ التحميل..."
- `common.success` → "تم بنجاح"
- `common.error` → "حدث خطأ"
- `common.yes` → "نعم"
- `common.no` → "لا"

### التحقق:
- `validation.required` → "هذا الحقل مطلوب"
- `validation.email` → "البريد الإلكتروني غير صحيح"
- `validation.phone` → "رقم الهاتف غير صحيح"

---

## 🎯 أمثلة عملية

### صفحة منتجات:
```typescript
function ProductsPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.products')}</h1>
      
      <button>
        {t('actions.add')}
      </button>
      
      <input 
        placeholder={t('actions.search')}
      />
      
      <table>
        <thead>
          <tr>
            <th>{t('common.name')}</th>
            <th>{t('status.title')}</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
```

### نموذج إضافة:
```typescript
function ProductForm() {
  const { t } = useTranslation();
  
  return (
    <form>
      <label>{t('common.name')}</label>
      <input required />
      <span className="error">{t('validation.required')}</span>
      
      <button type="submit">{t('actions.save')}</button>
      <button type="button">{t('actions.cancel')}</button>
    </form>
  );
}
```

### رسائل النجاح:
```typescript
import { toast } from 'sonner';

function handleSave() {
  const { t } = useTranslation();
  
  toast.success(t('messages.saveSuccess'));
  // "تم الحفظ بنجاح"
}
```

---

## ⚡ نصائح سريعة

1. **استخدم `t()` دائماً** بدلاً من النصوص الثابتة
2. **اللغة الافتراضية** هي العربية
3. **الترجمات محفوظة في Cache** لمدة 24 ساعة
4. **إذا لم تجد ترجمة**، أضفها من لوحة إدارة i18n

---

## 🔧 إضافة ترجمة جديدة

### من لوحة التحكم:
1. اذهب إلى **إدارة i18n**
2. اضغط **إضافة ترجمة**
3. املأ:
   - Key: `products.addToCart`
   - Arabic: `إضافة إلى السلة`
   - English: `Add to Cart`
   - Namespace: `products`
4. احفظ واستخدمها مباشرة: `t('products.addToCart')`

---

**للمزيد من التفاصيل، راجع:** `I18N_INTEGRATION_README.md`

