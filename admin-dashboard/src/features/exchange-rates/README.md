# نظام إدارة أسعار الصرف

## نظرة عامة

نظام إدارة أسعار الصرف المحسن والمطور باستخدام Material-UI (MUI) و TypeScript. يوفر واجهة إدارية احترافية لإدارة أسعار الصرف للعملات المدعومة في النظام.

## الميزات

### 🎯 العمليات المدعومة
- ✅ **عرض الأسعار الحالية**: عرض أسعار الصرف للدولار الأمريكي مقابل الريال اليمني والريال السعودي
- **تحديث الأسعار**: تحديث أسعار الصرف مع التحقق من صحة البيانات
- **تحويل العملات**: محول تفاعلي لتحويل العملات باستخدام الأسعار الحالية
- **الإحصائيات**: عرض معلومات تفصيلية عن أسعار الصرف وتاريخ التحديث

### 🎨 واجهة المستخدم
- **تصميم متجاوب**: يعمل على جميع أحجام الشاشات
- **مكونات MUI احترافية**: استخدام Material-UI حصرياً
- **تفاعلية**: Skeletons، Snackbars، Loaders، Dialogs
- **تبويبات منظمة**: تنظيم المحتوى في تبويبات واضحة
- **رسائل تنبيه**: نظام إشعارات متقدم للنجاح والأخطاء

### 🔧 التقنيات المستخدمة
- **React 18**: مع Hooks و TypeScript
- **Material-UI (MUI)**: واجهة المستخدم
- **Axios**: للاتصال بالـ API
- **TypeScript**: للكتابة الآمنة

## البنية

```
src/features/exchange-rates/
├── api/
│   └── exchangeRatesApi.ts          # API service
├── hooks/
│   └── useExchangeRates.ts          # Custom hook
├── components/
│   ├── ExchangeRateCard.tsx         # بطاقة عرض السعر
│   ├── ExchangeRateForm.tsx         # نموذج تحديث الأسعار
│   ├── CurrencyConverter.tsx        # محول العملات
│   ├── ExchangeRateStats.tsx       # إحصائيات الأسعار
│   └── index.ts                     # تصدير المكونات
├── pages/
│   └── ExchangeRatesPage.tsx       # الصفحة الرئيسية
└── README.md                        # هذا الملف
```

## الاستخدام

### 1. الصفحة الرئيسية
```tsx
import ExchangeRatesPage from '@/features/exchange-rates/pages/ExchangeRatesPage';

// في التوجيه
<Route path="/admin/exchange-rates" element={<ExchangeRatesPage />} />
```

### 2. استخدام Hook
```tsx
import { useExchangeRates } from '@/features/exchange-rates/hooks/useExchangeRates';

const MyComponent = () => {
  const {
    rates,
    loading,
    error,
    updateRates,
    convertCurrency,
    isUpdating,
    isConverting,
  } = useExchangeRates();

  // استخدام البيانات والعمليات
};
```

### 3. استخدام API Service
```tsx
import { ExchangeRatesApiService } from '@/features/exchange-rates/api/exchangeRatesApi';

// جلب الأسعار الحالية
const rates = await ExchangeRatesApiService.getCurrentRates();

// تحديث الأسعار
await ExchangeRatesApiService.updateRates({
  usdToYer: 250,
  usdToSar: 3.75,
  notes: 'تحديث الأسعار'
});

// تحويل العملة
const result = await ExchangeRatesApiService.convertCurrency({
  amount: 100,
  fromCurrency: 'USD',
  toCurrency: 'YER'
});
```

## API Endpoints

### للمديرين
- `GET /api/v1/admin/exchange-rates` - الحصول على الأسعار
- `POST /api/v1/admin/exchange-rates/update` - تحديث الأسعار
- `POST /api/v1/admin/exchange-rates/convert` - تحويل العملة
- `GET /api/v1/admin/exchange-rates/usd-to-yer` - سعر الدولار للريال اليمني
- `GET /api/v1/admin/exchange-rates/usd-to-sar` - سعر الدولار للريال السعودي

## أنواع البيانات

### ExchangeRatesData
```typescript
interface ExchangeRatesData {
  usdToYer: number;           // سعر الدولار للريال اليمني
  usdToSar: number;           // سعر الدولار للريال السعودي
  lastUpdatedAt?: string;     // تاريخ آخر تحديث
  lastUpdatedBy?: string;    // آخر من قام بالتحديث
  notes?: string;            // ملاحظات
}
```

### UpdateExchangeRatesRequest
```typescript
interface UpdateExchangeRatesRequest {
  usdToYer: number;         // سعر الدولار للريال اليمني
  usdToSar: number;          // سعر الدولار للريال السعودي
  notes?: string;           // ملاحظات (اختياري)
}
```

### ConvertCurrencyRequest
```typescript
interface ConvertCurrencyRequest {
  amount: number;           // المبلغ المراد تحويله
  fromCurrency: 'USD';     // العملة المصدر (دائماً USD)
  toCurrency: 'YER' | 'SAR'; // العملة الهدف
}
```

## المكونات

### ExchangeRateCard
بطاقة عرض سعر الصرف مع معلومات تفصيلية.

**Props:**
- `rates`: بيانات أسعار الصرف
- `loading`: حالة التحميل
- `error`: رسالة الخطأ
- `title`: عنوان البطاقة
- `currency`: رمز العملة
- `rate`: السعر
- `icon`: أيقونة البطاقة
- `color`: لون البطاقة

### ExchangeRateForm
نموذج تحديث أسعار الصرف مع التحقق من صحة البيانات.

**Props:**
- `initialData`: البيانات الأولية
- `onSave`: دالة الحفظ
- `onCancel`: دالة الإلغاء (اختياري)
- `loading`: حالة التحميل
- `error`: رسالة الخطأ

### CurrencyConverter
محول العملات التفاعلي.

**Props:**
- `onConvert`: دالة التحويل
- `loading`: حالة التحميل
- `error`: رسالة الخطأ

### ExchangeRateStats
عرض إحصائيات أسعار الصرف.

**Props:**
- `rates`: بيانات أسعار الصرف
- `loading`: حالة التحميل
- `error`: رسالة الخطأ

## إدارة الأخطاء

النظام يتعامل مع الأخطاء بطريقة احترافية:

1. **تحقق من صحة البيانات**: التحقق من صحة المدخلات قبل الإرسال
2. **رسائل خطأ واضحة**: رسائل خطأ باللغة العربية
3. **إعادة المحاولة**: إمكانية إعادة المحاولة عند الفشل
4. **حالات التحميل**: عرض حالات التحميل أثناء العمليات

## الأمان

- ✅ **التحقق من الصلاحيات**: يتطلب صلاحيات المدير
- ✅ **التحقق من البيانات**: التحقق من صحة جميع المدخلات
- ✅ **تشفير الاتصال**: استخدام HTTPS
- ✅ **تسجيل العمليات**: تسجيل جميع عمليات التحديث

## التطوير المستقبلي

- [ ] إضافة عملات أخرى
- [ ] تاريخ أسعار الصرف
- [ ] تنبيهات تغيير الأسعار
- [ ] تصدير البيانات
- [ ] API للعملاء

## المساهمة

1. تأكد من اتباع معايير الكود
2. اكتب اختبارات للميزات الجديدة
3. حدث الوثائق عند الحاجة
4. تأكد من عدم كسر الوظائف الموجودة

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
