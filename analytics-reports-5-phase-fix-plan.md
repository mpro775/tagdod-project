# خطة إصلاح وتطوير نظام التحليلات والتقارير — 5 مراحل

> هذا الملف مخصص لوكيل AI / Codex لتنفيذ إصلاحات نظام التحليلات والتقارير في مشروع **Kaleem Stores** اعتمادًا على المصادر الحالية:
>
> - `backend/`
> - `admin-dashboard/`
>
> الهدف: إصلاح مشاكل المبيعات حسب الفئة، العملات، تقارير المخزون على مستوى المنتجات والمتغيرات، تصدير التقارير، ومركز البيانات/مركز التصدير.

---

## 0) قواعد صارمة قبل التنفيذ

### ممنوع تغيير منطق اعتماد الطلبات المحتسبة كمبيعات

منطق مبيعات الفئات يجب أن يبقى كما هو من ناحية حالة الطلب والدفع:

```ts
status: { $in: ['completed'] }
paymentStatus: 'paid'
```

لا تقم بتوسيع الحالات إلى `confirmed` أو `processing` أو غيرها. المشكلة الحالية ليست في شرط الحالة والدفع، لأن النظام يحتوي فعلًا على طلبات `completed + paid` ومع ذلك لا تظهر الفئات.

### ممنوع تنفيذ حلول سطحية

لا تقم بأي من التالي:

- إرجاع بيانات وهمية.
- إخفاء الأخطاء بـ `catch { return [] }`.
- إجبار كل العملات على `YER` داخل الكود.
- حساب المخزون من المنتجات فقط وتجاهل المتغيرات.
- تعديل أسماء routes بدون تحديث الفرونت والاختبارات.
- تغيير تصميم الواجهة جذريًا خارج نطاق الإصلاح.

### المطلوب النهائي

بعد تنفيذ المراحل الخمس يجب أن يتحقق التالي:

1. صفحة مركز البيانات/مركز التصدير لا تعطي خطأ `reportId: exports`.
2. تنزيل التقرير لا يرجع `GENERAL_002` بدون تفاصيل.
3. المبيعات حسب الفئة تظهر للطلبات المكتملة والمدفوعة.
4. التحليلات المالية تدعم اختيار العملة: `YER`, `USD`, `SAR`.
5. المخزون يحسب المنتجات البسيطة والمتغيرات Variants بشكل صحيح.
6. التقارير والتصدير يعتمدان نفس مصادر الحسابات، وليس كل صفحة بمنطق مستقل.

---

## 1) المرحلة الأولى — إصلاح الأعطال العاجلة في مركز البيانات والتصدير

### الهدف

إصلاح الأخطاء التي تمنع استخدام النظام حاليًا:

- خطأ مركز البيانات:

```json
{
  "code": "ANALYTICS_1150",
  "message": "التقرير غير موجود",
  "details": { "reportId": "exports" }
}
```

- خطأ تنزيل التقرير:

```json
{
  "code": "GENERAL_002",
  "message": "حدث خطأ داخلي في الخادم"
}
```

---

### الملفات الأساسية

#### Backend

```txt
backend/src/modules/analytics/advanced-analytics.controller.ts
backend/src/modules/analytics/advanced-analytics.service.ts
backend/src/modules/analytics/services/export.service.ts
backend/src/modules/analytics/services/file-storage.service.ts
backend/src/modules/analytics/dto/advanced-analytics.dto.ts
backend/src/modules/analytics/schemas/advanced-report.schema.ts
backend/src/shared/exceptions/*
```

#### Frontend

```txt
admin-dashboard/src/features/analytics/api/analyticsApi.ts
admin-dashboard/src/features/analytics/types/exports.ts
admin-dashboard/src/features/analytics/utils/exportMappers.ts
admin-dashboard/src/features/analytics/pages/*Export* أو *DataCenter*
admin-dashboard/src/core/i18n/locales/ar/analytics.json
admin-dashboard/src/core/i18n/locales/en/analytics.json
```

---

### 1.1 إصلاح تعارض Route الخاص بـ exports

#### السبب الحالي

في `advanced-analytics.controller.ts` يوجد route عام:

```ts
@Get('reports/:reportId')
```

قبل route خاص:

```ts
@Get('reports/exports')
```

لذلك NestJS يفسر:

```txt
/reports/exports
```

على أن:

```txt
reportId = exports
```

ثم يبحث عن تقرير بهذا المعرف ويرجع `ANALYTICS_1150`.

#### المطلوب

اعمل أحد الخيارين، والأفضل تنفيذ الخيار الآمن التالي:

1. أضف route جديد واضح:

```ts
@Get('exports')
async getExportedFiles(...) {}
```

ليصبح المسار:

```txt
GET /api/v1/analytics/advanced/exports?page=1&limit=10
```

2. أبقِ route القديم للتوافق، ولكن انقله فوق كل routes الديناميكية:

```ts
@Get('reports/exports')
async getExportedFilesLegacy(...) {}

@Get('reports/:reportId')
async getAdvancedReport(...) {}
```

3. حدّث الفرونت ليستخدم المسار الجديد:

```ts
'/analytics/advanced/exports'
```

بدل:

```ts
'/analytics/advanced/reports/exports'
```

4. أضف تعليق واضح أن `/reports/exports` مسار Legacy وسيتم إزالته لاحقًا.

---

### 1.2 إصلاح خطأ تنزيل التقرير GENERAL_002

#### السبب المحتمل من البنية الحالية

تصدير التقرير يمر عبر:

```txt
advancedAnalyticsService.exportReport()
ExportService
FileStorageService
```

و `FileStorageService` يعتمد غالبًا على إعدادات تخزين خارجية مثل Bunny Storage. عند غياب أو خطأ الإعدادات قد يفشل الرفع ويرجع الخطأ العام `GENERAL_002`.

#### المطلوب

1. لا تجعل أخطاء التصدير ترجع كـ `GENERAL_002`.
2. أضف Domain Exceptions واضحة، مثل:

```ts
ANALYTICS_EXPORT_FAILED
ANALYTICS_EXPORT_STORAGE_NOT_CONFIGURED
ANALYTICS_EXPORT_UPLOAD_FAILED
ANALYTICS_EXPORT_FILE_GENERATION_FAILED
```

3. أضف Logging واضح داخل `exportReport()`:

```ts
this.logger.error('Report export failed', {
  reportId,
  format,
  userId,
  storageProvider,
  error: error?.message,
  stack: error?.stack,
});
```

4. في `FileStorageService`:
   - تحقق من وجود env قبل الرفع.
   - لو البيئة development أو staging ولا يوجد Bunny config، استخدم fallback local storage.
   - لو production ولا توجد الإعدادات، ارجع خطأ واضح وليس `GENERAL_002`.

#### متغيرات البيئة التي يجب فحصها

```env
BUNNY_STORAGE_ZONE=
BUNNY_API_KEY=
BUNNY_HOSTNAME=
BUNNY_CDN_HOSTNAME=
```

لا تضف قيمًا وهمية داخل الكود.

---

### 1.3 تنفيذ أو ضبط Routes التصدير الناقصة

#### المشكلة

الفرونت لديه أنواع تصدير مثل:

```txt
inventory
financial
marketing
```

بينما `advanced-analytics.controller.ts` يحتوي بوضوح على:

```txt
GET /analytics/advanced/export/sales
GET /analytics/advanced/export/products
GET /analytics/advanced/export/customers
```

وقد لا توجد routes مقابلة لـ:

```txt
GET /analytics/advanced/export/inventory
GET /analytics/advanced/export/financial
GET /analytics/advanced/export/marketing
```

#### المطلوب

1. أضف endpoints الناقصة في الباك إند:

```ts
@Get('export/inventory')
@Get('export/financial')
@Get('export/marketing')
```

2. اجعلها تستخدم نفس خدمات التقارير الجديدة بعد المراحل التالية.
3. في هذه المرحلة يمكن تنفيذ هيكل مبدئي يمرر إلى الخدمات الموجودة، لكن لا ترجع dummy data.
4. حدث `analyticsApi.ts` حتى لا يستدعي مسارًا قديمًا أو غير مطابق.

---

### 1.4 شروط قبول المرحلة الأولى

يجب أن تنجح هذه السيناريوهات:

```txt
GET /api/v1/analytics/advanced/exports?page=1&limit=10
```

لا يرجع:

```txt
reportId: exports
```

وعند فشل التصدير بسبب التخزين، يجب أن يرجع خطأ واضح مثل:

```json
{
  "success": false,
  "error": {
    "code": "ANALYTICS_EXPORT_STORAGE_NOT_CONFIGURED",
    "message": "إعدادات تخزين التقارير غير مكتملة"
  }
}
```

وليس:

```txt
GENERAL_002
```

---

## 2) المرحلة الثانية — إصلاح المبيعات حسب الفئة نهائيًا

### الهدف

إظهار المبيعات حسب الفئة للطلبات المكتملة والمدفوعة فقط، بدون تغيير منطق الحالات.

---

### السبب الفني المرجح

في `advanced-analytics.service.ts` توجد دالة:

```ts
private async getSalesByCategory(startDate: Date, endDate: Date)
```

وفيها تحويل غير آمن:

```ts
$toObjectId: '$items.snapshot.categoryId'
```

إذا كانت `snapshot.categoryId` ليست ObjectId صحيح، فإن aggregation قد يفشل بالكامل. ثم الكود الحالي يعمل تقريبًا:

```ts
catch (error) {
  logger.error(...)
  return [];
}
```

وهذا يخفي السبب الحقيقي ويجعل الواجهة تعرض أن الفئات غير موجودة.

---

### الملفات الأساسية

```txt
backend/src/modules/analytics/advanced-analytics.service.ts
backend/src/modules/analytics/services/advanced-reports.service.ts
backend/src/modules/analytics/analytics.service.ts
backend/src/modules/analytics/services/analytics-calculation.service.ts
backend/src/modules/checkout/schemas/order.schema.ts
backend/src/modules/products/schemas/product.schema.ts
backend/src/modules/categories/*
```

ويُفضل إنشاء ملف جديد:

```txt
backend/src/modules/analytics/services/sales-category-analytics.service.ts
```

---

### 2.1 إنشاء خدمة مشتركة لحساب المبيعات حسب الفئة

أنشئ service جديدة:

```txt
sales-category-analytics.service.ts
```

تكون مسؤولة عن حساب الفئات بدل تكرار المنطق في أكثر من مكان.

#### المطلوب من الخدمة

تستقبل:

```ts
{
  startDate: Date;
  endDate: Date;
  currency?: 'YER' | 'USD' | 'SAR';
}
```

وترجع:

```ts
Array<{
  categoryId?: string | null;
  categoryName: string;
  revenue: number;
  sales: number;
  ordersCount?: number;
  percentage: number;
  unresolved?: boolean;
}>
```

---

### 2.2 ترتيب استخراج الفئة

يجب اعتماد هذا الترتيب:

```txt
1. items.snapshot.categoryName إذا كان موجودًا وصالحًا.
2. categoryFromSnapshot بناءً على items.snapshot.categoryId إذا كان ObjectId صالحًا.
3. categoryFromProduct بناءً على product.categoryId.
4. fallback: غير مصنف.
```

لا تقم بحذف العناصر التي لا تحتوي فئة. بدل حذفها، اجمعها تحت:

```txt
غير مصنف
```

مع `unresolved: true` حتى نعرف أن هناك بيانات ناقصة.

---

### 2.3 استبدال `$toObjectId` بـ `$convert`

ممنوع استخدام:

```ts
$toObjectId
```

داخل pipeline لأن أي قيمة غير صالحة قد تسقط الاستعلام كله.

استخدم:

```ts
$convert: {
  input: '$items.snapshot.categoryId',
  to: 'objectId',
  onError: null,
  onNull: null,
}
```

---

### 2.4 دعم productId لو كان String أو ObjectId

رغم أن `OrderItem.productId` في schema هو `Types.ObjectId`، يجب أن يكون الـ aggregation متسامحًا مع البيانات القديمة.

لو احتجت تحويلًا آمنًا استخدم `$convert` بنفس الطريقة.

---

### 2.5 لا تخفِ الخطأ

استبدل:

```ts
catch (error) {
  return [];
}
```

بـ:

```ts
catch (error) {
  this.logger.error('Sales by category aggregation failed', {
    startDate,
    endDate,
    error: error?.message,
    stack: error?.stack,
  });
  throw new AnalyticsException(
    'فشل حساب المبيعات حسب الفئة',
    'ANALYTICS_SALES_BY_CATEGORY_FAILED',
    { startDate, endDate }
  );
}
```

استخدم صيغة الاستثناء المتوافقة مع نظام المشروع الحالي.

---

### 2.6 الحفاظ على شرط الطلبات

داخل `$match` يجب أن يبقى:

```ts
{
  createdAt: { $gte: startDate, $lte: endDate },
  status: { $in: ['completed'] },
  paymentStatus: 'paid',
}
```

لا توسع الحالات.

---

### 2.7 حقول الإيراد والكمية

استخدم من `OrderItem`:

```ts
qty
lineTotal
currency
```

الكمية:

```ts
sales: { $sum: '$items.qty' }
```

الإيراد مؤقتًا في هذه المرحلة:

```ts
revenue: { $sum: '$items.lineTotal' }
```

وفي المرحلة الثالثة سيتم ربطه بالعملة المختارة.

---

### 2.8 ربط الخدمة بكل أماكن الفئات

أي مكان يستخدم `salesByCategory` يجب أن يعتمد الخدمة الجديدة، خصوصًا:

```txt
advanced-analytics.service.ts
advanced-reports.service.ts
analytics.service.ts
report-generation.service.ts إن وجد
```

---

### 2.9 شروط قبول المرحلة الثانية

يجب اختبار الحالات التالية:

1. طلب `completed + paid` وعنصر الطلب يحتوي `snapshot.categoryName`.
2. طلب `completed + paid` لا يحتوي `categoryName` لكن يحتوي `snapshot.categoryId` صالح.
3. طلب `completed + paid` يحتوي `snapshot.categoryId` غير صالح، لكن المنتج مرتبط بفئة.
4. طلب `completed + paid` لا يمكن حل فئته، يظهر تحت `غير مصنف`.
5. لا يتم إرجاع `[]` بسبب عنصر واحد تالف.

---

## 3) المرحلة الثالثة — دعم العملات في التحليلات والتقارير

### الهدف

جعل التحليلات المالية والتقارير تدعم العملة المختارة بدل إجبار كل شيء على `YER` أو وجود أماكن hard-coded بـ `USD`.

العملة الافتراضية للنظام تبقى:

```txt
YER
```

لكن يجب دعم:

```txt
YER / USD / SAR
```

---

### الملفات الأساسية

#### Backend

```txt
backend/src/modules/analytics/base-analytics.controller.ts
backend/src/modules/analytics/advanced-analytics.controller.ts
backend/src/modules/analytics/advanced-analytics.service.ts
backend/src/modules/analytics/services/advanced-reports.service.ts
backend/src/modules/analytics/services/export.service.ts
backend/src/modules/analytics/dto/advanced-analytics.dto.ts
backend/src/modules/checkout/schemas/order.schema.ts
backend/src/modules/products/schemas/product.schema.ts
backend/src/modules/products/schemas/variant.schema.ts
```

#### Frontend

```txt
admin-dashboard/src/features/analytics/types/analytics.types.ts
admin-dashboard/src/features/analytics/api/analyticsApi.ts
admin-dashboard/src/features/analytics/utils/formatters.ts
admin-dashboard/src/features/analytics/utils/advancedAnalyticsMappers.ts
admin-dashboard/src/features/analytics/components/SalesAnalyticsCard.tsx
admin-dashboard/src/features/analytics/components/FinancialReportCard.tsx
admin-dashboard/src/features/analytics/components/InventoryReportCard.tsx
admin-dashboard/src/features/analytics/components/MarketingReportCard.tsx
admin-dashboard/src/features/analytics/pages/*Analytics*
admin-dashboard/src/core/i18n/locales/ar/analytics.json
admin-dashboard/src/core/i18n/locales/en/analytics.json
```

---

### 3.1 إضافة نوع العملة في الباك إند

أضف type موحد:

```ts
export type AnalyticsCurrency = 'YER' | 'USD' | 'SAR';
```

أو enum:

```ts
export enum AnalyticsCurrency {
  YER = 'YER',
  USD = 'USD',
  SAR = 'SAR',
}
```

---

### 3.2 تحديث AnalyticsParams

في `base-analytics.controller.ts`:

```ts
export interface QueryParams {
  period?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
  status?: string;
  format?: string;
  currency?: 'YER' | 'USD' | 'SAR';
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  period?: string;
  limit?: number;
  page?: number;
  currency?: 'YER' | 'USD' | 'SAR';
}
```

وحدث `convertQueryParams`:

```ts
currency: normalizeAnalyticsCurrency(params.currency),
```

حيث تكون الدالة:

```ts
function normalizeAnalyticsCurrency(value?: string): 'YER' | 'USD' | 'SAR' {
  return value === 'USD' || value === 'SAR' || value === 'YER' ? value : 'YER';
}
```

---

### 3.3 حساب قيمة الطلب حسب العملة

بما أن `Order` يحتوي:

```ts
totalsInAllCurrencies?: {
  USD: { total: number; ... };
  YER: { total: number; ... };
  SAR: { total: number; ... };
}
```

يجب استخدام هذا الحقل عند حساب إجماليات الطلب.

#### منطق إجمالي الطلب

```txt
1. إذا totalsInAllCurrencies[currency].total موجود → استخدمه.
2. إذا order.currency == currency → استخدم order.total.
3. وإلا أرجع 0 أو fallback موثق، ولا تخلط العملات بدون تحويل.
```

---

### 3.4 حساب قيمة item حسب العملة للمبيعات حسب الفئة والمنتجات

لأن `OrderItem` يحتوي `lineTotal` و `currency`، ولا يحتوي بالضرورة `lineTotal` لكل العملات، اتبع هذا المنطق:

```txt
1. إذا items.currency == selectedCurrency → استخدم items.lineTotal.
2. إذا order.totalsInAllCurrencies[selectedCurrency].total موجود و order.total > 0:
   itemConvertedTotal = (items.lineTotal / order.total) * order.totalsInAllCurrencies[selectedCurrency].total
3. وإلا أرجع 0 مع logging/debug counter.
```

هذا يمنع خلط العملات ويعطي توزيعًا نسبيًا مقبولًا عندما تكون إجماليات الطلب متوفرة بكل العملات.

---

### 3.5 إزالة hard-coded currency

ابحث عن:

```txt
currency: 'YER'
currency: 'USD'
formatCurrency(value)
```

في الباك والفرونت.

المطلوب:

- `YER` تبقى default فقط عند عدم تمرير العملة.
- لا تجعل تقريرًا ماليًا يرجع `USD` بينما الواجهة تعرض `YER`.
- كل response مالي يجب أن يحتوي:

```ts
currency: selectedCurrency
```

---

### 3.6 تحديث كل الدوال المالية

يجب تحديث هذه الأنواع من الحسابات:

```txt
totalRevenue
averageOrderValue
salesByDate
salesByCategory
salesByPaymentMethod
topProducts revenue
financial report revenue/cost/profit
marketing coupon revenue/discounts
inventory total value
advanced report summary
exports
```

---

### 3.7 تحديث الفرونت

#### 3.7.1 إضافة currency في query params

أضف في `AnalyticsQueryDto`:

```ts
currency?: 'YER' | 'USD' | 'SAR';
```

#### 3.7.2 تمرير العملة لكل APIs

كل هذه الدوال يجب أن تقبل وتمرر `currency`:

```ts
getSalesAnalytics(params)
getInventoryReport(params)
getFinancialReport(params)
getMarketingReport(params)
exportReport(...)
exportData(...)
getExportedFiles(...)
```

#### 3.7.3 عرض العملة في الكروت

لا تستخدم:

```ts
formatCurrency(value)
```

في كروت التحليلات المالية، بل:

```ts
formatCurrency(value, data?.currency ?? selectedCurrency ?? 'YER')
```

#### 3.7.4 إضافة فلتر العملة

في صفحة التحليلات المتقدمة أو Filters المشتركة أضف selector:

```txt
العملة: YER / USD / SAR
```

مع مفاتيح ترجمة عربية وإنجليزية.

---

### 3.8 شروط قبول المرحلة الثالثة

1. عند اختيار `YER` تظهر كل القيم بالريال اليمني.
2. عند اختيار `USD` تظهر كل القيم بالدولار.
3. عند اختيار `SAR` تظهر كل القيم بالريال السعودي.
4. لا يوجد كرت يظهر عملة مختلفة عن بقية الصفحة.
5. التصدير يستخدم نفس العملة المختارة.
6. report summary يحتوي:

```json
{
  "currency": "YER"
}
```

أو العملة المختارة.

---

## 4) المرحلة الرابعة — إعادة بناء تحليلات المخزون لتدعم Variants

### الهدف

إصلاح تقارير المخزون التي ترجع 0 رغم وجود منتجات أو متغيرات نافدة.

المشكلة الحالية أن بعض الحسابات تعتمد على `productModel` فقط، بينما المخزون الحقيقي قد يكون في:

```txt
Variant.stock
Variant.minStock
Variant.trackInventory
Variant.productId
Variant.isActive
```

---

### الملفات الأساسية

```txt
backend/src/modules/analytics/advanced-analytics.service.ts
backend/src/modules/analytics/services/advanced-reports.service.ts
backend/src/modules/analytics/services/analytics-calculation.service.ts
backend/src/modules/products/schemas/product.schema.ts
backend/src/modules/products/schemas/variant.schema.ts
admin-dashboard/src/features/analytics/types/analytics.types.ts
admin-dashboard/src/features/analytics/components/InventoryReportCard.tsx
admin-dashboard/src/features/analytics/utils/advancedAnalyticsMappers.ts
admin-dashboard/src/core/i18n/locales/ar/analytics.json
admin-dashboard/src/core/i18n/locales/en/analytics.json
```

ويُفضل إنشاء:

```txt
backend/src/modules/analytics/services/inventory-analytics.service.ts
```

---

### 4.1 إنشاء InventoryAnalyticsService

أنشئ خدمة واحدة مسؤولة عن المخزون:

```ts
class InventoryAnalyticsService {
  getInventoryReport(params)
  getProductInventorySummary(params)
  getVariantInventorySummary(params)
  getInventoryByCategory(params)
  getLowStockItems(params)
  getOutOfStockItems(params)
  calculateInventoryValue(params)
}
```

---

### 4.2 لا تخلط المنتجات البسيطة مع المنتجات التي لديها Variants

#### المنتج البسيط

يحسب من `Product.stock` فقط إذا:

```txt
product.variantsCount == 0
أو لا توجد variants active لهذا المنتج
```

#### المنتج الذي لديه متغيرات

لا تعتمد على `Product.stock`، بل احسب من:

```txt
Variant.stock
```

---

### 4.3 out of stock

#### للمنتجات البسيطة

```txt
product.status = active
product.isActive = true
product.deletedAt = null
product.stock = 0
```

مع التأكد أن المنتج لا يحتوي variants فعالة.

#### للمتغيرات

```txt
variant.isActive = true
variant.deletedAt = null
variant.trackInventory = true
variant.stock = 0
```

---

### 4.4 low stock

#### للمنتجات البسيطة

```txt
product.stock > 0
product.stock <= product.minStock
```

#### للمتغيرات

```txt
variant.stock > 0
variant.stock <= variant.minStock
variant.trackInventory = true
```

لو `minStock` غير موجود أو 0، استخدم threshold افتراضي configurable مثل 5 أو 10، لكن وثقه ولا تجعله hard-coded في أكثر من مكان.

---

### 4.5 response جديد للمخزون

يجب أن يرجع `getInventoryReport` شكلًا يدعم القديم والجديد قدر الإمكان.

مثال:

```ts
{
  currency: 'YER',
  totalValue: 120000,
  productSummary: {
    totalProducts: 100,
    activeProducts: 80,
    simpleProducts: 40,
    productsWithVariants: 40,
    lowStockProducts: 3,
    outOfStockProducts: 2
  },
  variantSummary: {
    totalVariants: 220,
    activeVariants: 200,
    lowStockVariants: 12,
    outOfStockVariants: 8,
    affectedProducts: 6
  },
  totals: {
    lowStockItems: 15,
    outOfStockItems: 10,
    affectedProducts: 8
  },
  byCategory: [
    {
      categoryId: '...',
      categoryName: '...',
      productCount: 10,
      variantCount: 30,
      totalStock: 120,
      lowStockVariants: 4,
      outOfStockVariants: 2,
      value: 50000
    }
  ],
  lowStockItems: [],
  outOfStockItems: []
}
```

---

### 4.6 حساب قيمة المخزون حسب العملة

للمنتجات:

```txt
basePriceYER / basePriceUSD / basePriceSAR
```

للمتغيرات:

```txt
basePriceYER / basePriceUSD / basePriceSAR
```

استخدم helper:

```ts
getPriceByCurrency(entity, currency) {
  if (currency === 'YER') return entity.basePriceYER ?? 0;
  if (currency === 'SAR') return entity.basePriceSAR ?? 0;
  return entity.basePriceUSD ?? 0;
}
```

قيمة المخزون:

```txt
stock * priceByCurrency
```

---

### 4.7 تحديث واجهة InventoryReportCard

لا تعرض فقط:

```txt
منتجات منخفضة المخزون
منتجات نافدة
```

بل أضف بوضوح:

```txt
متغيرات منخفضة المخزون
متغيرات نافدة
المنتجات المتأثرة
قيمة المخزون بالعملة المختارة
```

لا تكسر الشكل القديم؛ يمكن عرض هذه القيم في كروت إضافية أو tabs صغيرة.

---

### 4.8 شروط قبول المرحلة الرابعة

يجب تجهيز بيانات اختبار كالتالي:

1. منتج بسيط stock = 0.
2. منتج بسيط stock أقل من minStock.
3. منتج لديه 3 variants:
   - variant A stock = 0
   - variant B stock = 2 و minStock = 5
   - variant C stock = 20
4. التقرير يجب أن يرجع:
   - `outOfStockProducts = 1`
   - `lowStockProducts = 1`
   - `outOfStockVariants = 1`
   - `lowStockVariants = 1`
   - `affectedProducts` يحسب المنتج صاحب المتغيرات مرة واحدة.

---

## 5) المرحلة الخامسة — توحيد التقارير والتصدير والاختبارات النهائية

### الهدف

منع تكرار نفس المشاكل مستقبلًا عن طريق توحيد مصادر الحسابات بين:

```txt
صفحات التحليلات
Report Builder
التقارير المجدولة
مركز التصدير
تصدير PDF/Excel/CSV/JSON
```

---

### الملفات الأساسية

```txt
backend/src/modules/analytics/services/advanced-reports.service.ts
backend/src/modules/analytics/services/report-generation.service.ts
backend/src/modules/analytics/services/report-schedules.service.ts
backend/src/modules/analytics/services/report-schedule-cron.service.ts
backend/src/modules/analytics/services/export.service.ts
backend/src/modules/analytics/schemas/advanced-report.schema.ts
admin-dashboard/src/features/analytics/components/report/*
admin-dashboard/src/features/analytics/pages/*
admin-dashboard/src/features/analytics/api/analyticsApi.ts
```

---

### 5.1 لا تكرر الحسابات

أي تقرير يجب ألا يكتب aggregation مستقل إذا يوجد service مشتركة.

استخدم الخدمات الجديدة:

```txt
SalesCategoryAnalyticsService
InventoryAnalyticsService
Currency/Money helpers
```

في:

```txt
advanced-analytics.service.ts
advanced-reports.service.ts
report-generation.service.ts
report-schedules.service.ts
export.service.ts
```

---

### 5.2 توحيد export payload

كل export file يجب أن يحتوي metadata واضحة:

```ts
{
  reportId,
  reportType,
  category,
  format,
  currency,
  startDate,
  endDate,
  generatedAt,
  generatedBy,
  status,
  fileUrl,
  fileSize,
}
```

---

### 5.3 مركز التصدير

مركز التصدير يجب أن يعرض:

```txt
اسم التقرير
نوع التقرير
الصيغة
الحالة
العملة
الحجم
تاريخ الإنشاء
رابط التنزيل
رسالة الخطأ إن فشل
```

لو فشل التصدير، لا تخفِ السجل؛ اعرضه بالحالة:

```txt
failed
```

مع رسالة مفهومة.

---

### 5.4 دعم صيغ التصدير

يجب دعم:

```txt
pdf
xlsx
csv
json
```

وتوحيد التحويل:

```ts
normalizeExportFormat(format)
```

في الباك والفرونت.

---

### 5.5 تحديث Report Builder

تأكد أن Report Builder عندما يختار:

```txt
sales
inventory
financial
marketing
products
customers
```

يستخدم نفس APIs أو services الجديدة.

لا تسمح بتقرير يظهر أرقامًا مختلفة عن صفحة التحليلات لنفس الفترة والعملة.

---

### 5.6 الاختبارات المطلوبة

#### Backend unit/integration tests

أضف أو حدّث اختبارات لهذه الحالات:

```txt
1. export center route لا يتعارض مع reports/:reportId
2. report export يرجع خطأ واضح عند غياب storage config
3. sales by category with snapshot.categoryName
4. sales by category with valid snapshot.categoryId
5. sales by category with invalid snapshot.categoryId fallback to product.categoryId
6. sales by category unresolved item يظهر تحت غير مصنف
7. currency YER totals
8. currency USD totals
9. currency SAR totals
10. inventory simple product out of stock
11. inventory simple product low stock
12. inventory variant out of stock
13. inventory variant low stock
14. inventory affected products count
15. inventory value by currency
16. export inventory/financial/marketing routes
```

#### Frontend tests

أضف أو حدّث اختبارات:

```txt
1. Export center يستدعي /analytics/advanced/exports
2. Download report يعرض رسالة خطأ واضحة عند فشل التصدير
3. SalesAnalyticsCard يعرض العملة القادمة من API
4. FinancialReportCard يعرض العملة المختارة
5. InventoryReportCard يعرض productSummary و variantSummary
6. Empty state للفئات لا يظهر إذا البيانات تحتوي غير مصنف
7. Currency selector يمرر currency في params
```

---

### 5.7 أوامر التحقق النهائية

من داخل `backend`:

```bash
npm run build
npm run test
npm run lint
```

إذا لا يوجد lint في المشروع، نفذ المتاح فقط ولا تضف scripts عشوائية.

من داخل `admin-dashboard`:

```bash
npm run build
npm run test
npm run typecheck
```

إذا كان `typecheck` غير موجود، استخدم:

```bash
npx tsc --noEmit
```

---

## Curl/اختبارات يدوية بعد التنفيذ

### مركز التصدير

```bash
curl -X GET "https://api.kaleemstores.com/api/v1/analytics/advanced/exports?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

يجب ألا يرجع:

```json
{ "reportId": "exports" }
```

---

### المبيعات حسب الفئة

```bash
curl -X GET "https://api.kaleemstores.com/api/v1/analytics/advanced/sales?startDate=2026-05-01&endDate=2026-05-17&currency=YER" \
  -H "Authorization: Bearer <TOKEN>"
```

يجب أن يحتوي response على:

```json
{
  "salesByCategory": [
    {
      "categoryName": "...",
      "revenue": 0,
      "sales": 0,
      "percentage": 0
    }
  ],
  "currency": "YER"
}
```

---

### المخزون

```bash
curl -X GET "https://api.kaleemstores.com/api/v1/analytics/advanced/inventory?currency=YER" \
  -H "Authorization: Bearer <TOKEN>"
```

يجب أن يحتوي على:

```json
{
  "productSummary": {},
  "variantSummary": {},
  "totals": {},
  "currency": "YER"
}
```

---

### تصدير تقرير

```bash
curl -X POST "https://api.kaleemstores.com/api/v1/analytics/advanced/reports/<REPORT_ID>/export" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"format":"pdf","currency":"YER"}'
```

يجب أن يرجع ملف أو سجل failed واضح، وليس `GENERAL_002`.

---

## مفاتيح الترجمة المطلوبة

### عربي

أضف في:

```txt
admin-dashboard/src/core/i18n/locales/ar/analytics.json
```

```json
{
  "currency": "العملة",
  "currencies": {
    "YER": "ريال يمني",
    "USD": "دولار أمريكي",
    "SAR": "ريال سعودي"
  },
  "inventory": {
    "productSummary": "ملخص المنتجات",
    "variantSummary": "ملخص المتغيرات",
    "simpleProducts": "منتجات بسيطة",
    "productsWithVariants": "منتجات بمتغيرات",
    "lowStockVariants": "متغيرات منخفضة المخزون",
    "outOfStockVariants": "متغيرات نافدة",
    "affectedProducts": "منتجات متأثرة",
    "uncategorized": "غير مصنف"
  },
  "exports": {
    "exportCenter": "مركز التصدير",
    "downloadFailed": "فشل تنزيل التقرير",
    "storageNotConfigured": "إعدادات تخزين التقارير غير مكتملة",
    "fileGenerationFailed": "فشل إنشاء ملف التقرير"
  }
}
```

### إنجليزي

أضف في:

```txt
admin-dashboard/src/core/i18n/locales/en/analytics.json
```

```json
{
  "currency": "Currency",
  "currencies": {
    "YER": "Yemeni Rial",
    "USD": "US Dollar",
    "SAR": "Saudi Riyal"
  },
  "inventory": {
    "productSummary": "Product Summary",
    "variantSummary": "Variant Summary",
    "simpleProducts": "Simple Products",
    "productsWithVariants": "Products With Variants",
    "lowStockVariants": "Low Stock Variants",
    "outOfStockVariants": "Out of Stock Variants",
    "affectedProducts": "Affected Products",
    "uncategorized": "Uncategorized"
  },
  "exports": {
    "exportCenter": "Export Center",
    "downloadFailed": "Report download failed",
    "storageNotConfigured": "Report storage configuration is incomplete",
    "fileGenerationFailed": "Report file generation failed"
  }
}
```

ادمج هذه المفاتيح مع الموجود ولا تستبدل الملف كاملًا عشوائيًا.

---

## الترتيب التنفيذي الإلزامي

نفّذ بالترتيب التالي:

```txt
1. إصلاح route conflict + export errors.
2. إصلاح salesByCategory aggregation.
3. دعم currency في الباك والفرونت.
4. إعادة بناء inventory analytics على Product + Variant.
5. توحيد reports/export/schedules + الاختبارات.
```

لا تنتقل من مرحلة لأخرى إلا بعد تشغيل build واختبار السيناريوهات الأساسية للمرحلة.

---

## تعريف الإغلاق النهائي

يعتبر العمل مغلقًا 100% عندما:

- لا يظهر خطأ `ANALYTICS_1150 reportId exports`.
- لا يظهر `GENERAL_002` عند فشل التصدير، بل خطأ واضح.
- salesByCategory تظهر من طلبات `completed + paid`.
- العناصر غير القابلة للتصنيف تظهر تحت `غير مصنف` بدل اختفاء التقرير.
- كل التحليلات المالية تعرض العملة المختارة.
- تقارير المخزون تعرض المنتجات والمتغيرات.
- export center يعرض الملفات الناجحة والفاشلة بوضوح.
- نفس الفترة ونفس العملة تعطي نفس الأرقام في الصفحة والتقرير والتصدير.
- `npm run build` ينجح في الباك والفرونت.
