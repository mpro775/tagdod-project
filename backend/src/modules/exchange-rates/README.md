# نظام أسعار الصرف (Exchange Rates Module)

> 🔄 **نظام شامل لإدارة أسعار الصرف مع تحويل العملات التلقائي**

---

## نظرة عامة

نظام متخصص لإدارة أسعار الصرف وتحويل العملات في الوقت الفعلي، يدعم العملات الرئيسية في المنطقة (الدولار الأمريكي، الريال اليمني، الريال السعودي).

## الميزات الرئيسية

### 💱 إدارة أسعار الصرف
- ✅ تحديث أسعار الصرف يدوياً من قبل الأدمن
- ✅ حفظ تاريخ التحديثات مع بيانات المسؤول
- ✅ أسعار افتراضية في حالة عدم وجود أسعار محدثة
- ✅ دعم ملاحظات لكل تحديث

### 🔄 تحويل العملات
- ✅ تحويل من الدولار للريال اليمني (USD → YER)
- ✅ تحويل من الدولار للريال السعودي (USD → SAR)
- ✅ تنسيق تلقائي للنتائج
- ✅ API موحد للتحويل

### 📊 APIs شاملة
- ✅ APIs عامة للعملاء
- ✅ APIs إدارية محمية
- ✅ تحقق من صحة البيانات
- ✅ تسجيل شامل للعمليات

---

## البنية التقنية

### الملفات المطبقة

```
exchange-rates/
├── schemas/
│   └── exchange-rate.schema.ts      # Schema أسعار الصرف
├── dto/
│   └── exchange-rate.dto.ts         # DTOs للتحقق من البيانات
├── exchange-rates.service.ts         # منطق الأعمال الأساسي
├── exchange-rates.controller.ts       # APIs عامة
├── admin-exchange-rates.controller.ts # APIs إدارية
└── exchange-rates.module.ts          # Module definition
```

### Schema أسعار الصرف

```typescript
{
  usdToYer: number;        // 1 دولار = كم ريال يمني
  usdToSar: number;        // 1 دولار = كم ريال سعودي
  lastUpdatedBy?: string;  // آخر من قام بالتحديث
  lastUpdatedAt?: Date;    // وقت آخر تحديث
  notes?: string;          // ملاحظات التحديث
}
```

---

## API Endpoints

### APIs عامة (للعملاء)

#### الحصول على أسعار الصرف الحالية
```http
GET /exchange-rates
```

**Response:**
```json
{
  "usdToYer": 250,
  "usdToSar": 3.75,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### تحويل العملة
```http
POST /exchange-rates/convert
```

**Request:**
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "YER"
}
```

**Response:**
```json
{
  "fromCurrency": "USD",
  "toCurrency": "YER",
  "amount": 100,
  "rate": 250,
  "result": 25000,
  "formatted": "25,000 ر.ي"
}
```

#### الحصول على سعر الدولار للريال اليمني
```http
GET /exchange-rates/usd-to-yer
```

**Response:**
```json
{
  "rate": 250,
  "currency": "YER",
  "formatted": "1 USD = 250 ر.ي"
}
```

#### الحصول على سعر الدولار للريال السعودي
```http
GET /exchange-rates/usd-to-sar
```

**Response:**
```json
{
  "rate": 3.75,
  "currency": "SAR",
  "formatted": "1 USD = 3.75 ر.س"
}
```

### APIs إدارية (للأدمن)

#### الحصول على أسعار الصرف الحالية (مع تفاصيل كاملة)
```http
GET /admin/exchange-rates
Authorization: Bearer <admin_token>
```

#### تحديث أسعار الصرف
```http
POST /admin/exchange-rates/update
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "usdToYer": 260,
  "usdToSar": 3.80,
  "notes": "تحديث يومي للأسعار"
}
```

**Response:**
```json
{
  "_id": "exchange_rate_123",
  "usdToYer": 260,
  "usdToSar": 3.80,
  "lastUpdatedBy": "admin_456",
  "lastUpdatedAt": "2024-01-15T12:00:00Z",
  "notes": "تحديث يومي للأسعار",
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

#### تحويل العملة (للتجربة)
```http
POST /admin/exchange-rates/convert
Authorization: Bearer <admin_token>
```

#### الحصول على سعر الدولار للريال اليمني
```http
GET /admin/exchange-rates/usd-to-yer
Authorization: Bearer <admin_token>
```

#### الحصول على سعر الدولار للريال السعودي
```http
GET /admin/exchange-rates/usd-to-sar
Authorization: Bearer <admin_token>
```

---

## الخدمات (Services)

### ExchangeRatesService

خدمة رئيسية تحتوي على جميع عمليات أسعار الصرف:

#### getCurrentRates()
يحصل على الأسعار الحالية، وإذا لم توجد ينشئ أسعار افتراضية

#### updateRates(updateDto, updatedBy)
يحدث أسعار الصرف مع حفظ تاريخ التحديث

#### convertCurrency(convertDto)
يقوم بتحويل العملة حسب الطلب

#### convertFromUSDToYER(amountUSD)
تحويل سريع من الدولار للريال اليمني

#### convertFromUSDToSAR(amountUSD)
تحويل سريع من الدولار للريال السعودي

#### getUSDToYERRate()
يحصل على سعر الدولار للريال اليمني الحالي

#### getUSDToSARRate()
يحصل على سعر الدولار للريال السعودي الحالي

---

## الأمان والصلاحيات

### للـ APIs العامة:
- ✅ لا تحتاج مصادقة
- ✅ محدودة بعدد الطلبات (Rate Limiting)

### للـ APIs الإدارية:
- ✅ تحتاج مصادقة JWT
- ✅ تحتاج صلاحيات Admin
- ✅ تحتاج صلاحيات EXCHANGE_RATES_READ أو EXCHANGE_RATES_WRITE
- ✅ تحتاج صلاحيات ADMIN_ACCESS

---

## الأداء والتحسين

### فهارس قاعدة البيانات:
```typescript
ExchangeRateSchema.index({ lastUpdatedAt: -1 });
```

### التخزين الفعال:
- حفظ سجل واحد فقط للأسعار الحالية
- حذف الأسعار القديمة عند التحديث الجديد
- استخدام lean queries لتحسين الأداء

### Rate Limiting:
- حماية من الإفراط في استخدام الـ APIs
- حدود مختلفة للعملاء والأدمن

---

## الاستخدام في التطبيق

### في Products Service (لتحويل الأسعار):
```typescript
@Injectable()
export class ProductsService {
  constructor(
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  async getProductPrice(productId: string, currency: string) {
    // الحصول على السعر بالدولار
    const usdPrice = await this.getProductUSDPrice(productId);

    if (currency === 'YER') {
      return this.exchangeRatesService.convertFromUSDToYER(usdPrice);
    } else if (currency === 'SAR') {
      return this.exchangeRatesService.convertFromUSDToSAR(usdPrice);
    }

    return { amount: usdPrice, currency: 'USD' };
  }
}
```

### في Orders Service (لتطبيق الخصومات):
```typescript
@Injectable()
export class OrdersService {
  constructor(
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  async calculateDiscount(order: Order, discountUSD: number) {
    const userCurrency = order.currency;

    if (userCurrency === 'YER') {
      const yerAmount = await this.exchangeRatesService.convertFromUSDToYER(discountUSD);
      return yerAmount.result;
    } else if (userCurrency === 'SAR') {
      const sarAmount = await this.exchangeRatesService.convertFromUSDToSAR(discountUSD);
      return sarAmount.result;
    }

    return discountUSD;
  }
}
```

---

## إعداد النظام

### 1. إضافة ExchangeRatesModule إلى AppModule

```typescript
// في app.module.ts
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';

@Module({
  imports: [
    // ... other modules
    ExchangeRatesModule,
  ],
})
export class AppModule {}
```

### 2. إعداد متغيرات البيئة

```env
# لم يتم استخدام API keys خارجية حالياً
# النظام يعتمد على تحديث يدوي للأسعار
```

### 3. أسعار افتراضية

إذا لم تكن هناك أسعار محدثة، سيتم استخدام الأسعار الافتراضية:
- USD → YER: 250 ريال يمني
- USD → SAR: 3.75 ريال سعودي

---

## اختبار النظام

### اختبار الـ APIs العامة:

```bash
# الحصول على الأسعار الحالية
curl http://localhost:3000/exchange-rates

# تحويل العملة
curl -X POST http://localhost:3000/exchange-rates/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "fromCurrency": "USD", "toCurrency": "YER"}'
```

### اختبار الـ APIs الإدارية:

```bash
# تحديث الأسعار (يحتاج token)
curl -X POST http://localhost:3000/admin/exchange-rates/update \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usdToYer": 255, "usdToSar": 3.80, "notes": "تحديث تجريبي"}'
```

---

## التطوير المستقبلي

### ميزات مخططة:
- [ ] ربط مع APIs خارجية للأسعار التلقائية (مثل fixer.io أو exchangerate-api.com)
- [ ] تاريخ أسعار الصرف للتحليل
- [ ] إشعارات عند تغير الأسعار الكبير
- [ ] دعم المزيد من العملات
- [ ] تحويل متعدد المستويات (مثل YER → SAR)

### تحسينات الأداء:
- [ ] Caching للأسعار (Redis)
- [ ] Background jobs للتحديث التلقائي
- [ ] Analytics لاستخدام التحويلات

---

## استكشاف الأخطاء

### مشاكل شائعة:

#### "Exchange rates not found"
- **السبب**: لا توجد أسعار في قاعدة البيانات
- **الحل**: انتظر إنشاء الأسعار الافتراضية أو قم بتحديثها يدوياً

#### "Currency conversion not supported"
- **السبب**: تحويل غير مدعوم (مثل YER → USD)
- **الحل**: النظام يدعم USD → YER و USD → SAR فقط حالياً

#### "Rate limit exceeded"
- **السبب**: تجاوز حد الطلبات المسموح
- **الحل**: انتظر قليلاً قبل إعادة المحاولة

---

## الخلاصة

نظام أسعار الصرف هذا يوفر:
- إدارة مركزية لأسعار الصرف
- تحويل موحد للعملات
- APIs آمنة ومحمية
- سهولة التكامل مع باقي النظام
- أساس قوي للتوسع المستقبلي

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** $(date)
