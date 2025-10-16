# نظام أسعار الصرف (Exchange Rates Module)

## نظرة عامة

هذا المودول يدير أسعار الصرف بين العملات المختلفة في النظام، مما يسمح بتسعير المنتجات بالدولار الأمريكي وعرضها بالعملة المختارة من قبل العميل.

## الميزات

- **إدارة أسعار الصرف**: إضافة وتحديث وحذف أسعار الصرف
- **تحويل العملات**: تحويل الأسعار بين العملات المختلفة
- **دعم العملات**: الدولار الأمريكي (USD)، الريال اليمني (YER)، الريال السعودي (SAR)
- **تحديث تلقائي**: إمكانية ربط النظام بمصادر خارجية لأسعار الصرف
- **تاريخ السريان**: تحديد تواريخ بداية ونهاية لأسعار الصرف

## الهيكل

```
exchange-rates/
├── schemas/
│   └── exchange-rate.schema.ts    # نموذج بيانات سعر الصرف
├── dto/
│   └── exchange-rate.dto.ts       # DTOs للتحقق من البيانات
├── exchange-rates.service.ts      # خدمة إدارة أسعار الصرف
├── currency-conversion.service.ts  # خدمة تحويل العملات
├── exchange-rates.controller.ts    # API endpoints
└── exchange-rates.module.ts       # تعريف المودول
```

## الاستخدام

### 1. إضافة سعر صرف جديد

```typescript
const exchangeRate = await exchangeRatesService.create({
  fromCurrency: Currency.USD,
  toCurrency: Currency.YER,
  rate: 250.5,
  effectiveDate: new Date(),
  notes: 'سعر الصرف اليومي'
});
```

### 2. تحويل سعر

```typescript
const convertedPrice = await currencyConversionService.convertFromUSD(
  100, // 100 دولار
  Currency.YER // إلى الريال اليمني
);
// النتيجة: { amount: 25050, currency: 'YER', formatted: 'ر.ي25050' }
```

### 3. الحصول على السعر الحالي

```typescript
const currentRate = await exchangeRatesService.getCurrentRate(
  Currency.USD,
  Currency.YER
);
```

## API Endpoints

### GET /exchange-rates
الحصول على جميع أسعار الصرف النشطة

### POST /exchange-rates
إنشاء سعر صرف جديد (للمدير فقط)

### GET /exchange-rates/:id
الحصول على سعر صرف محدد

### PATCH /exchange-rates/:id
تحديث سعر صرف (للمدير فقط)

### DELETE /exchange-rates/:id
حذف سعر صرف (للمدير فقط)

### POST /exchange-rates/convert
تحويل مبلغ بين عملتين

### GET /exchange-rates/currencies/supported
الحصول على العملات المدعومة

## التكامل مع النظام

### 1. تحديث نظام المنتجات

تم تحديث `VariantPrice` schema لاستخدام الدولار كسعر أساسي:

```typescript
export class VariantPrice {
  @Prop({ required: true, min: 0 }) 
  basePriceUSD!: number; // السعر الأساسي بالدولار
  
  @Prop() 
  compareAtUSD?: number; // السعر المقارن بالدولار
  
  @Prop() 
  wholesalePriceUSD?: number; // السعر بالجملة بالدولار
}
```

### 2. تحديث خدمة الكتالوج

تم تحديث `CatalogService` لاستخدام خدمة تحويل العملات:

```typescript
// تحويل الأسعار عند عرض المنتج
const convertedPrices = await Promise.all(
  prices.map(async (price) => {
    const converted = await this.currencyConversionService.convertFromUSD(
      price.basePriceUSD, 
      currency
    );
    return {
      ...price,
      convertedAmount: converted.amount,
      formattedPrice: converted.formatted
    };
  })
);
```

## الواجهة الأمامية

### 1. مكونات العملة

- `CurrencySelector`: منتقي العملة
- `PriceDisplay`: عرض السعر بالعملة المختارة
- `useCurrency`: hook لإدارة العملة

### 2. صفحات الإدارة

- `AdminExchangeRatesPage`: صفحة إدارة أسعار الصرف
- `ExchangeRatesList`: قائمة أسعار الصرف
- `ExchangeRateForm`: نموذج إضافة/تعديل سعر صرف

## الأمان

- جميع عمليات التعديل تتطلب صلاحيات المدير
- التحقق من صحة البيانات باستخدام DTOs
- تسجيل جميع العمليات في logs

## التطوير المستقبلي

- ربط بمصادر خارجية لأسعار الصرف (Fixer.io, CurrencyLayer)
- تحديث تلقائي لأسعار الصرف
- دعم عملات إضافية
- إشعارات عند تغيير أسعار الصرف
