# نظام أسعار الصرف المبسط - النظام الجديد

## نظرة عامة

نظام مبسط لإدارة أسعار الصرف يدعم عملتين فقط:
- **الدولار الأمريكي (USD)** - العملة الأساسية
- **الريال اليمني (YER)** 
- **الريال السعودي (SAR)**

## الميزات

- ✅ **بساطة**: سعرين فقط (USD→YER, USD→SAR)
- ✅ **واجهة إدارة بسيطة**: تحديث السعرين من لوحة التحكم
- ✅ **تطبيق تلقائي**: الأسعار تنعكس على المنتجات والفواتير فوراً
- ✅ **دعم العملاء**: عرض الأسعار بالعملة المختارة

## الاستخدام

### 1. تحديث أسعار الصرف (للمدير)

```bash
POST /api/admin/exchange-rates/update
{
  "usdToYer": 250,    // 1 دولار = 250 ريال يمني
  "usdToSar": 3.75    // 1 دولار = 3.75 ريال سعودي
}
```

### 2. الحصول على الأسعار الحالية

```bash
GET /api/exchange-rates
# Response:
{
  "usdToYer": 250,
  "usdToSar": 3.75,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### 3. تحويل العملة

```bash
POST /api/exchange-rates/convert
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "YER"
}
# Response:
{
  "fromCurrency": "USD",
  "toCurrency": "YER",
  "amount": 100,
  "rate": 250,
  "result": 25000,
  "formatted": "25,000 ر.ي"
}
```

## التكامل مع النظام

### 1. في خدمة المنتجات

```typescript
// تحويل سعر المنتج للعملة المختارة
const convertedPrice = await this.simpleExchangeRatesService.convertFromUSDToYER(
  product.basePriceUSD
);
// النتيجة: { amount: 25000, formatted: "25,000 ر.ي" }
```

### 2. في خدمة الفواتير

```typescript
// تحويل إجمالي الفاتورة
const totalYER = await this.simpleExchangeRatesService.convertFromUSDToYER(
  invoice.totalUSD
);
```

### 3. في الواجهة الأمامية

```tsx
import { SimplePriceDisplay } from '@/shared/components/SimplePriceDisplay';
import { SimpleCurrencySelector } from '@/shared/components/SimpleCurrencySelector';

// عرض السعر
<SimplePriceDisplay amountUSD={100} showOriginal={true} />

// اختيار العملة
<SimpleCurrencySelector />
```

## API Endpoints

### للمديرين
- `GET /api/admin/exchange-rates` - الحصول على الأسعار
- `POST /api/admin/exchange-rates/update` - تحديث الأسعار
- `GET /api/admin/exchange-rates/usd-to-yer` - سعر الدولار للريال اليمني
- `GET /api/admin/exchange-rates/usd-to-sar` - سعر الدولار للريال السعودي

### للعملاء
- `GET /api/exchange-rates` - الحصول على الأسعار
- `POST /api/exchange-rates/convert` - تحويل العملة
- `GET /api/exchange-rates/usd-to-yer` - سعر الدولار للريال اليمني
- `GET /api/exchange-rates/usd-to-sar` - سعر الدولار للريال السعودي

## الواجهة الأمامية

### صفحة إدارة أسعار الصرف
- مسار: `/admin/exchange-rates`
- مكون: `SimpleExchangeRatesPage`
- ميزات:
  - عرض الأسعار الحالية
  - تحديث الأسعار
  - معاينة التحويل
  - تاريخ آخر تحديث

### مكونات العملة
- `SimplePriceDisplay`: عرض السعر بالعملة المختارة
- `SimpleCurrencySelector`: منتقي العملة
- `useSimpleCurrency`: hook لإدارة العملة

## الأمان

- ✅ تحديث الأسعار يتطلب صلاحيات المدير
- ✅ التحقق من صحة البيانات
- ✅ تسجيل جميع العمليات

## التطوير المستقبلي

- إضافة عملات أخرى حسب الحاجة
- ربط بمصادر خارجية لأسعار الصرف
- إشعارات عند تغيير الأسعار
- تاريخ التغييرات

## مثال كامل

```typescript
// 1. تحديث الأسعار
await simpleExchangeRatesService.updateRates({
  usdToYer: 250,
  usdToSar: 3.75
}, 'admin-user-id');

// 2. تحويل سعر منتج
const productPrice = await simpleExchangeRatesService.convertFromUSDToYER(50);
console.log(productPrice.formatted); // "12,500 ر.ي"

// 3. تحويل إجمالي فاتورة
const invoiceTotal = await simpleExchangeRatesService.convertFromUSDToSAR(100);
console.log(invoiceTotal.formatted); // "375.00 ر.س"
```

هذا النظام البسيط يحل مشكلتك تماماً! 🎉

## ✅ تم الانتهاء من التحديث

تم حذف النظام المعقد القديم واستبداله بالنظام المبسط الجديد:

### الملفات المحذوفة:
- `exchange-rates.service.ts` (القديم)
- `currency-conversion.service.ts`
- `admin-exchange-rates.controller.ts` (القديم)
- `exchange-rates.controller.ts` (القديم)
- `schemas/exchange-rate.schema.ts` (القديم)
- `schemas/exchange-rate-history.schema.ts`
- `dto/exchange-rate.dto.ts` (القديم)

### الملفات الجديدة:
- `exchange-rates.service.ts` (مبسط)
- `exchange-rates.controller.ts` (مبسط)
- `admin-exchange-rates.controller.ts` (مبسط)
- `schemas/exchange-rate.schema.ts` (مبسط)
- `dto/exchange-rate.dto.ts` (مبسط)

### الواجهة الأمامية:
- تم تحديث المسارات في `routes.tsx`
- تم إضافة رابط في الشريط الجانبي
- تم حذف الملفات القديمة واستبدالها بالجديدة

النظام الآن جاهز للاستخدام! 🚀
