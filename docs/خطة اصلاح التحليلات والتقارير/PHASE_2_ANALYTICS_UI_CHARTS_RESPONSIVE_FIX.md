# المرحلة الثانية — إصلاح صفحات التحليلات والرسوم والواجهة الاحترافية

## اسم المرحلة

**Phase 2 — Analytics Dashboards UI, Charts, Responsiveness & Professional Presentation**

---

## الهدف العام

تهدف هذه المرحلة إلى إصلاح وتطوير واجهات:

- صفحة التحليلات الرئيسية `/analytics`
- صفحة التحليلات المتقدمة `/analytics/advanced`
- كل الرسوم البيانية المرتبطة بها
- كل البطاقات الإحصائية
- حالات التحميل والخطأ والبيانات الفارغة
- التوافق مع الموبايل والتابلت
- دعم RTL واللغة العربية
- عرض الأرقام والعملة والنسب بشكل احترافي

> هذه المرحلة تعتمد إلزاميًا على مخرجات المرحلة الأولى:
>
> - `unwrapApiData`
> - `asArray`
> - `toNumber`
> - جميع الـ Mappers / Normalizers
> - ViewModels الثابتة للفرونت
> - منع تمرير object إلى Recharts

---

## القاعدة الصارمة لهذه المرحلة

ممنوع ربط أي Chart أو Component مباشرة بالـ API raw response.

يجب أن يكون المسار دائمًا:

```txt
API Response
  → analyticsApi
  → Mapper / Normalizer
  → ViewModel
  → UI Component
  → Chart / Table / Card
```

أي Component في هذه المرحلة يجب أن يستقبل بيانات جاهزة وآمنة، وليس raw response.

---

## نطاق المرحلة

هذه المرحلة تشمل الفرونت إند بشكل أساسي، مع تعديلات Backend صغيرة فقط إذا كانت ضرورية لعرض الواجهة بشكل صحيح.

### داخل النطاق

- إصلاح صفحة `/analytics`.
- إصلاح صفحة `/analytics/advanced`.
- إصلاح كل مكونات Recharts.
- إصلاح `dataKey` الخاطئة.
- تحسين شكل KPI Cards.
- تحسين Charts.
- إضافة Empty States.
- إضافة Skeleton Loading.
- إضافة Error Boundaries.
- تحسين Responsive.
- تحسين RTL.
- تنسيق الأرقام والعملة.
- إظهار البيانات القادمة فعليًا من الباك.
- إزالة أو تعطيل أي UI يعتمد على حقول غير موجودة بعد.
- تحسين Tabs الخاصة بالتحليلات المتقدمة.
- جعل كل تبويب يحمل بياناته بشكل آمن.

### خارج النطاق

- لا يتم في هذه المرحلة إعادة بناء نظام التقارير.
- لا يتم إصلاح التقارير المجدولة.
- لا يتم إصلاح مركز التصدير.
- لا يتم تغيير جذري في Backend analytics aggregation إلا للضرورة.
- لا يتم إضافة نظام صلاحيات جديد.
- لا يتم إضافة features جديدة غير موجودة أصلًا.

---

# القسم الأول — فحص الملفات الحالية

قبل التعديل يجب فحص الملفات التالية أو ما يعادلها في المشروع:

```txt
admin-dashboard/src/features/analytics/
admin-dashboard/src/features/analytics/pages/
admin-dashboard/src/features/analytics/components/
admin-dashboard/src/features/analytics/api/
admin-dashboard/src/features/analytics/hooks/
admin-dashboard/src/features/analytics/types/
admin-dashboard/src/features/analytics/utils/
```

وابحث تحديدًا عن:

```txt
AnalyticsDashboard
AdvancedAnalyticsDashboard
RevenueChart
UserAnalyticsChart
ProductPerformanceChart
ServiceAnalyticsChart
SupportAnalyticsChart
SalesAnalyticsCard
CustomerAnalyticsCard
InventoryReportCard
FinancialReportCard
MarketingReportCard
RealTimeMetricsCard
AnalyticsDataTable
KpiCard
StatCard
```

أي ملف Chart يستخدم Recharts يجب مراجعته.

---

# القسم الثاني — إصلاح صفحة التحليلات الرئيسية `/analytics`

## 2.1 الهدف

تحويل الصفحة من واجهة قديمة تقرأ البيانات بشكل خاطئ إلى Dashboard تنفيذية واضحة تعرض:

- الملخص العام.
- الإيرادات.
- المستخدمين.
- المنتجات.
- الخدمات.
- الدعم.
- مؤشرات الأداء KPIs.

---

## 2.2 هيكل الصفحة المطلوب

يجب أن يكون ترتيب الصفحة كالتالي:

```txt
Analytics Page
├── Page Header
│   ├── Title
│   ├── Subtitle
│   ├── Date Range Selector
│   ├── Refresh Button
│   └── Last Updated
│
├── KPI Overview Cards
│   ├── Total Users
│   ├── Total Revenue
│   ├── Total Orders
│   ├── Active Services
│   ├── Open Support Tickets
│   └── System Health
│
├── Revenue Section
│   ├── Daily Revenue / Orders Chart
│   └── Monthly Revenue Growth Chart
│
├── Users Section
│   ├── Registration Trend Chart
│   └── User Types Distribution
│
├── Products Section
│   ├── Top Selling Products Chart
│   └── Products Table
│
├── Services Section
│   ├── Request Trend Chart
│   └── Response Time Summary
│
├── Support Section
│   ├── Ticket Trend Chart
│   └── Category Breakdown
│
└── KPI Score Section
    ├── Revenue Growth
    ├── Customer Satisfaction
    ├── Order Conversion
    ├── Service Efficiency
    ├── Support Resolution
    └── System Uptime
```

---

## 2.3 إصلاح مصادر البيانات

يجب استخدام ViewModel من المرحلة الأولى مثل:

```ts
const view = useMemo(
  () => mapDashboardToAnalyticsView(dashboardData),
  [dashboardData]
);
```

ثم تمرير بيانات آمنة فقط:

```tsx
<RevenueChart data={view.revenueDaily} />
<UserAnalyticsChart data={view.userRegistrationTrend} />
<ProductPerformanceChart data={view.topProducts} />
<ServiceAnalyticsChart data={view.serviceRequests} />
<SupportAnalyticsChart data={view.supportTickets} />
```

ممنوع:

```tsx
<RevenueChart data={dashboardData?.revenueCharts} />
```

لأن `revenueCharts` object وليس array.

---

# القسم الثالث — إصلاح الرسوم البيانية الرئيسية

## 3.1 قاعدة إلزامية لكل Chart

داخل أي Chart:

```ts
const safeData = Array.isArray(data) ? data : [];
```

أو استخدام helper من المرحلة الأولى:

```ts
const safeData = asArray(data);
```

ثم:

```tsx
<LineChart data={safeData}>
```

ممنوع نهائيًا:

```tsx
<LineChart data={data || []}>
```

لأن `data || []` لا يمنع تمرير object.

---

## 3.2 RevenueChart

### البيانات المتوقعة

```ts
type RevenueDailyItem = {
  date: string;
  revenue: number;
  orders: number;
};
```

### المطلوب

- استخدام `ComposedChart`.
- عرض الإيراد كـ Line أو Area.
- عرض الطلبات كـ Bar.
- تنسيق التاريخ في المحور X.
- Tooltip عربي.
- عرض العملة YER.
- Empty state إذا لا توجد بيانات.

### dataKeys الصحيحة

```txt
date
revenue
orders
```

### ممنوع

```txt
amount
sales
value
```

إلا إذا تم تحويلها في Mapper.

---

## 3.3 MonthlyRevenueChart

### البيانات المتوقعة

```ts
type RevenueMonthlyItem = {
  date: string;
  revenue: number;
  growth: number;
};
```

### المطلوب

- عرض الإيراد الشهري.
- عرض نسبة النمو.
- التعامل مع النمو السالب بشكل واضح.
- Tooltip يوضح:
  - الشهر
  - الإيراد
  - نسبة النمو

---

## 3.4 UserAnalyticsChart

### البيانات المتوقعة

```ts
type UserTrendItem = {
  date: string;
  newUsers: number;
  activeUsers: number;
};
```

### dataKeys الصحيحة

```txt
newUsers
activeUsers
```

### يجب إزالة أي استخدام لـ:

```txt
users
registrations
active
```

إلا إذا تم تحويلها في Mapper.

---

## 3.5 UserTypesDistribution

### البيانات المتوقعة

```ts
type UserTypeItem = {
  name: string;
  value: number;
  percentage: number;
};
```

### المطلوب

- PieChart أو DonutChart.
- عرض اسم الدور بالعربي.
- إذا النسبة 0 لكن العدد موجود، يجب إظهار العدد.
- لا تعتمد على percentage فقط.

---

## 3.6 ProductPerformanceChart

### البيانات المتوقعة

```ts
type TopProductItem = {
  name: string;
  sold: number;
  revenue: number;
};
```

### dataKeys الصحيحة

```txt
name
sold
revenue
```

### المطلوب

- BarChart أفقي للمنتجات الأكثر مبيعًا.
- تقصير أسماء المنتجات الطويلة في المحور.
- Tooltip يعرض الاسم الكامل.
- جدول أسفل الرسم يعرض:
  - المنتج
  - الكمية المباعة
  - الإيراد

---

## 3.7 ServiceAnalyticsChart

### البيانات المتوقعة

```ts
type ServiceRequestItem = {
  date: string;
  requests: number;
  completed: number;
};
```

### المطلوب

- LineChart أو ComposedChart.
- عرض الطلبات مقابل المكتمل.
- إذا كل القيم صفر، اعرض Empty State ذكي:
  - "لا توجد طلبات خدمة خلال الفترة المحددة"

---

## 3.8 SupportAnalyticsChart

### البيانات المتوقعة

```ts
type SupportTicketItem = {
  date: string;
  newTickets: number;
  resolved: number;
};
```

### المطلوب

- عرض التذاكر الجديدة والمحلولة.
- دعم field aliases إن كانت موجودة من Mapper.
- لا تستخدم `new` مباشرة في UI إن أمكن، لأن `new` كلمة مزعجة في JS.
- استخدم `newTickets`.

---

# القسم الرابع — إصلاح صفحة التحليلات المتقدمة `/analytics/advanced`

## 4.1 الهدف

تحويل الصفحة إلى مركز تحليلات تفصيلي يحتوي تبويبات واضحة:

```txt
Advanced Analytics
├── Overview / Real Time
├── Sales
├── Customers
├── Inventory
├── Financial
├── Marketing
└── Reports Shortcut
```

---

## 4.2 قاعدة تحميل البيانات

لا تحمل كل endpoints دفعة واحدة إذا الصفحة ثقيلة.

الأفضل:

- تحميل Overview / RealTime عند فتح الصفحة.
- تحميل Sales عند فتح تبويب Sales.
- تحميل Customers عند فتح تبويب Customers.
- تحميل Inventory عند فتح تبويب Inventory.
- تحميل Financial عند فتح تبويب Financial.
- تحميل Marketing عند فتح تبويب Marketing.

مع إمكانية استخدام prefetch لاحقًا، لكن ليس ضروريًا.

---

## 4.3 RealTimeMetricsCard

### البيانات الحالية من الباك

```ts
{
  activeUsers: number;
  todaySales: number;
  todayOrders: number;
  currentRevenue: number;
  systemHealth: {
    status: string;
    uptime: number;
    responseTime: number;
  };
  lastUpdated: string;
}
```

### المطلوب

- لا تعرض كروت تعتمد على حقول غير موجودة إلا إذا لها fallback منطقي.
- اعرض:
  - المستخدمون النشطون
  - مبيعات اليوم
  - طلبات اليوم
  - الإيراد الحالي
  - حالة النظام
  - زمن الاستجابة
  - آخر تحديث

### ممنوع

عرض كروت مثل:

```txt
cpuUsage
memoryUsage
diskUsage
activeConnections
lowStockAlerts
pendingSupportTickets
```

إذا لم تكن موجودة في ViewModel أو لها fallback واضح.

---

## 4.4 SalesAnalyticsCard

### البيانات المتوقعة

```ts
{
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesGrowth: number;
  revenueGrowth: number;
  ordersGrowth: number;
  salesByDate: Array<{ date; revenue; orders }>;
  salesByCategory: Array<any>;
  salesByPaymentMethod: Array<{ method; amount; count }>;
  topProducts: Array<{ id; product; name; sales; revenue }>;
}
```

### المطلوب

- KPI cards:
  - إجمالي الإيرادات
  - عدد الطلبات
  - متوسط قيمة الطلب
  - نمو المبيعات
- Chart للمبيعات حسب التاريخ.
- Chart لطريقة الدفع.
- جدول أفضل المنتجات.

### dataKeys

```txt
salesByDate: date, revenue, orders
salesByPaymentMethod: method, amount, count
topProducts: product/name, sales, revenue
```

---

## 4.5 CustomerAnalyticsCard

### المطلوب

- عرض:
  - إجمالي العملاء
  - العملاء الجدد
  - العملاء النشطون
  - Customer Lifetime Value
- Pie/DonutChart للشرائح.
- جدول أفضل العملاء.

### تحذير مهم

لا تعرض `customerIds` في الواجهة.

إذا وصلت من الباك، تجاهلها في الفرونت.

```ts
customerSegments.map(({ customerIds, ...safeSegment }) => safeSegment)
```

---

## 4.6 InventoryReportCard

### المطلوب

- عرض:
  - إجمالي المنتجات
  - المتوفر
  - منخفض المخزون
  - نفد المخزون
  - قيمة المخزون
- Chart لحركة المخزون.
- جدول آخر الحركات.

### البيانات

```ts
movements: Array<{
  date: string;
  type: 'in' | 'out';
  quantity: number;
  product?: string;
}>
```

### يجب ترجمة النوع

```txt
in  → إدخال
out → إخراج
```

---

## 4.7 FinancialReportCard

### البيانات المتوقعة

```ts
{
  revenue: number;
  revenueGrowth: number;
  cashFlow: Array<{ date; revenue; balance }>;
  revenueBySource: Array<{ source; amount; percentage }>;
}
```

### المطلوب

- عرض إجمالي الإيراد.
- عرض النمو.
- Chart للتدفق النقدي.
- توزيع الإيراد حسب المصدر.
- تنسيق العملة YER.

---

## 4.8 MarketingReportCard

### البيانات المتوقعة

```ts
{
  totalCampaigns: number;
  activeCampaigns: number;
  totalCoupons: number;
  activeCoupons: number;
  roi: number;
  conversionRate: number;
  totalDiscountGiven: number;
  campaignPerformance: Array<{
    campaignId?: string;
    campaign: string;
    name?: string;
    reach: number;
    impressions?: number;
    clicks?: number;
    conversions: number;
    cost?: number;
    revenue: number;
    roi?: number;
  }>;
  topCoupons: Array<{
    code: string;
    uses: number;
    revenue: number;
    discount: number;
  }>;
}
```

### المطلوب

- إصلاح dataKeys:
  - `campaign` بدل `name` أو العكس حسب Mapper.
  - `reach` يجب أن تأتي من `impressions`.
- عرض الحملات.
- عرض الكوبونات.
- عرض ROI.
- إذا `roi` ضخم جدًا يجب تنسيقه أو عرضه بتحذير:
  - "ROI مرتفع بسبب غياب تكلفة الحملة"

---

# القسم الخامس — Empty States

يجب إنشاء Component موحد:

```txt
EmptyAnalyticsState
```

مثال props:

```ts
type EmptyAnalyticsStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};
```

استخدامات:

```tsx
<EmptyAnalyticsState
  title="لا توجد بيانات مبيعات"
  description="لا توجد طلبات ضمن الفترة المحددة."
/>
```

يجب استخدامه عند:

```ts
safeData.length === 0
```

أو إذا كل القيم صفر:

```ts
const hasMeaningfulData = safeData.some(item =>
  Object.values(item).some(value => typeof value === 'number' && value > 0)
);
```

---

# القسم السادس — Loading States

يجب عدم عرض الصفحة فارغة أثناء التحميل.

أنشئ أو استخدم:

```txt
AnalyticsSkeleton
ChartSkeleton
KpiCardsSkeleton
TableSkeleton
```

## مثال

```tsx
if (isLoading) {
  return <AnalyticsSkeleton />;
}
```

ولكل Card متقدمة:

```tsx
<Card>
  {isLoading ? <ChartSkeleton /> : <Chart />}
</Card>
```

---

# القسم السابع — Error Boundaries

يجب ألا يكسر Chart واحد الصفحة كاملة.

أنشئ:

```txt
AnalyticsCardErrorBoundary
```

أو استخدم ErrorBoundary موجود.

كل Card أو Chart رئيسي يلتف بـ:

```tsx
<AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض مخطط الإيرادات">
  <RevenueChart data={view.revenueDaily} />
</AnalyticsCardErrorBoundary>
```

المطلوب:

- إظهار رسالة خطأ لطيفة.
- زر إعادة المحاولة إن أمكن.
- عدم إغلاق الصفحة كلها.

---

# القسم الثامن — تنسيق الأرقام والعملة

## 8.1 أداة تنسيق الأرقام

استخدم helper موحد:

```ts
export const formatNumber = (value: number) =>
  new Intl.NumberFormat('ar-YE').format(value || 0);
```

## 8.2 أداة تنسيق العملة

العملة المعتمدة:

```txt
YER
```

لا تستخدم:

```txt
USD
$
```

إلا إذا كانت العملة آتية صراحة من الباك وكانت صحيحة.

الأفضل:

```ts
export const formatCurrency = (value: number, currency = 'YER') => {
  return `${new Intl.NumberFormat('ar-YE').format(value || 0)} ${currency}`;
};
```

## 8.3 النسب

```ts
export const formatPercent = (value: number) =>
  `${Number(value || 0).toFixed(1)}%`;
```

---

# القسم التاسع — Responsive Design

## 9.1 قواعد عامة

يجب أن تعمل الصفحات على:

```txt
Mobile
Tablet
Desktop
Large Desktop
```

## 9.2 Grid للكروت

مثال:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
```

## 9.3 Charts

يجب استخدام:

```tsx
<ResponsiveContainer width="100%" height={320}>
```

على الموبايل:

```txt
height: 260 - 300
```

على الديسكتوب:

```txt
height: 320 - 420
```

## 9.4 الجداول

- يجب أن تكون داخل container فيه horizontal scroll.
- لا تكسر عرض الصفحة.
- أسماء المنتجات الطويلة يجب تقصيرها مع tooltip.

---

# القسم العاشر — RTL واللغة العربية

## المطلوب

- الاتجاه RTL في الجداول والبطاقات.
- Tooltip عربي.
- Labels عربية.
- ترجمة أسماء:
  - user roles
  - statuses
  - payment methods
  - stock movement types
  - campaign metrics
  - report categories

## مثال

```ts
const translatePaymentMethod = (method: string) => {
  const map: Record<string, string> = {
    BANK_TRANSFER: 'تحويل بنكي',
    CASH: 'نقدًا',
    CARD: 'بطاقة',
  };

  return map[method] ?? method;
};
```

---

# القسم الحادي عشر — تحسين الـ Tabs في التحليلات المتقدمة

## المطلوب

- Tabs واضحة ومقسمة.
- كل تبويب له Icon مناسب إن كانت مكتبة الأيقونات موجودة.
- لا تظهر كل الرسوم دفعة واحدة.
- عند فتح تبويب:
  - يظهر Loading خاص به.
  - إذا فشل، يظهر Error خاص به.
  - إذا لا توجد بيانات، يظهر Empty State.

## التبويبات المقترحة

```txt
نظرة فورية
المبيعات
العملاء
المخزون
المالية
التسويق
```

---

# القسم الثاني عشر — منع UI مضلل

يجب عدم عرض رقم 0 إذا كانت القيمة غير محسوبة.

مثال:

```ts
systemHealth: null
```

يعرض:

```txt
غير متاح
```

وليس:

```txt
0%
```

## القاعدة

- صفر يعني قيمة محسوبة فعلًا.
- `null` أو `undefined` يعني غير متاح.

---

# القسم الثالث عشر — تحسين الـ Tooltips

كل Chart يجب أن يحتوي Tooltip مخصص أو منسق.

## مثال

```tsx
<Tooltip
  formatter={(value, name) => {
    if (name === 'revenue') return [formatCurrency(Number(value)), 'الإيراد'];
    if (name === 'orders') return [formatNumber(Number(value)), 'الطلبات'];
    return [value, name];
  }}
  labelFormatter={(label) => formatDate(label)}
/>
```

---

# القسم الرابع عشر — Accessibility

يجب مراعاة:

- تباين الألوان.
- عدم الاعتماد على اللون وحده.
- إضافة `aria-label` للأزرار المهمة.
- الجداول قابلة للقراءة.
- لا توجد نصوص صغيرة جدًا.
- حالات الخطأ واضحة.

---

# القسم الخامس عشر — الملفات المتوقع تعديلها

قد تختلف الأسماء حسب المشروع، لكن غالبًا سيتم تعديل:

```txt
admin-dashboard/src/features/analytics/pages/AnalyticsDashboard.tsx
admin-dashboard/src/features/analytics/pages/AdvancedAnalyticsDashboard.tsx

admin-dashboard/src/features/analytics/components/RevenueChart.tsx
admin-dashboard/src/features/analytics/components/UserAnalyticsChart.tsx
admin-dashboard/src/features/analytics/components/ProductPerformanceChart.tsx
admin-dashboard/src/features/analytics/components/ServiceAnalyticsChart.tsx
admin-dashboard/src/features/analytics/components/SupportAnalyticsChart.tsx

admin-dashboard/src/features/analytics/components/SalesAnalyticsCard.tsx
admin-dashboard/src/features/analytics/components/CustomerAnalyticsCard.tsx
admin-dashboard/src/features/analytics/components/InventoryReportCard.tsx
admin-dashboard/src/features/analytics/components/FinancialReportCard.tsx
admin-dashboard/src/features/analytics/components/MarketingReportCard.tsx
admin-dashboard/src/features/analytics/components/RealTimeMetricsCard.tsx

admin-dashboard/src/features/analytics/components/AnalyticsDataTable.tsx
admin-dashboard/src/features/analytics/components/KpiCard.tsx
admin-dashboard/src/features/analytics/components/StatCard.tsx

admin-dashboard/src/features/analytics/components/EmptyAnalyticsState.tsx
admin-dashboard/src/features/analytics/components/AnalyticsSkeleton.tsx
admin-dashboard/src/features/analytics/components/AnalyticsCardErrorBoundary.tsx

admin-dashboard/src/features/analytics/utils/formatters.ts
admin-dashboard/src/features/analytics/utils/translations.ts
```

---

# القسم السادس عشر — Backend تعديلات صغيرة مسموحة

هذه المرحلة Frontend أساسًا، لكن يسمح بتعديلات Backend صغيرة إذا كانت ضرورية:

## مسموح

- جعل العملة الافتراضية `YER`.
- إضافة alias لحقل واضح بدون تغيير جذري:
  - `campaign = name`
  - `reach = impressions`
  - `product = name`
- جعل `systemHealth` يرجع `null` بدل `0` إذا غير محسوب.

## غير مسموح

- إعادة كتابة خدمات التحليلات بالكامل.
- تغيير قاعدة البيانات.
- تغيير جوهري في نظام التقارير.
- بناء نظام export جديد.

---

# القسم السابع عشر — اختبارات يدوية إلزامية

بعد التنفيذ يجب اختبار:

## صفحة `/analytics`

- الصفحة تفتح بدون console errors.
- لا يوجد خطأ `slice is not a function`.
- KPI cards تظهر.
- الإيرادات اليومية تظهر.
- المستخدمون يظهرون.
- المنتجات الأكثر مبيعًا تظهر.
- الخدمات لا تكسر إذا كانت صفر.
- الدعم لا يكسر إذا بعض البيانات فارغة.
- Empty states تظهر بدل الفراغ.
- Refresh يعمل.
- Date range لا يكسر الصفحة.

## صفحة `/analytics/advanced`

- تبويب النظرة الفورية يعمل.
- تبويب المبيعات يعمل.
- تبويب العملاء يعمل.
- تبويب المخزون يعمل.
- تبويب المالية يعمل.
- تبويب التسويق يعمل.
- لا يتم عرض حقول غير موجودة كأنها بيانات حقيقية.
- الجداول لا تكسر الموبايل.
- الرسوم لا تتجاوز عرض الصفحة.

## Responsive

اختبر على:

```txt
375px
768px
1024px
1440px
```

## RTL

- النصوص العربية تظهر بشكل صحيح.
- الجداول لا تنقلب بشكل خاطئ.
- الأرقام والعملة واضحة.

---

# القسم الثامن عشر — معايير القبول

لا تعتبر المرحلة مكتملة إلا إذا تحقق كل التالي:

```txt
[ ] لا يوجد خطأ slice is not a function.
[ ] لا يتم تمرير object إلى أي Recharts component.
[ ] صفحة /analytics تعرض بيانات حقيقية.
[ ] صفحة /analytics/advanced تعرض بيانات حقيقية.
[ ] كل Chart لديه Empty State.
[ ] كل Chart لديه Loading State.
[ ] كل Card لا يكسر الصفحة إذا فشل.
[ ] كل dataKey مطابق للـ ViewModel.
[ ] لا توجد أسماء حقول قديمة مستخدمة مباشرة في Components.
[ ] العملة تظهر YER أو من إعدادات صحيحة.
[ ] التصميم متجاوب على الموبايل والتابلت.
[ ] RTL مضبوط.
[ ] لا توجد كروت مضللة تعرض 0 لقيم غير محسوبة.
[ ] Product names و Campaign names تظهر بشكل صحيح.
[ ] Payment methods مترجمة أو معروضة بشكل مفهوم.
[ ] Console نظيف من أخطاء runtime.
```

---

# القسم التاسع عشر — ممنوعات صارمة

ممنوع:

```txt
- تمرير response.data مباشرة إلى Chart.
- استخدام data || [] بدل asArray(data).
- استخدام any داخل Components إذا كان يمكن استخدام ViewModel.
- قراءة data.data.data داخل الصفحة مباشرة.
- جعل كل endpoints تتحمل مرة واحدة بدون داعي.
- عرض USD أو $ افتراضيًا.
- إخفاء errors بدون إظهار رسالة للمستخدم.
- حذف أقسام كاملة بدل إصلاحها.
- إضافة mock data كبديل عن البيانات الحقيقية.
- تغيير أسماء API بدون تحديث كل الاستخدامات.
```

---

# القسم العشرون — مخرجات المرحلة

بنهاية المرحلة يجب تسليم:

```txt
1. صفحة /analytics تعمل بشكل احترافي.
2. صفحة /analytics/advanced تعمل بشكل احترافي.
3. كل الرسوم تعرض بيانات حقيقية أو Empty State.
4. لا توجد runtime crashes.
5. الواجهة responsive.
6. RTL مضبوط.
7. أرقام ونسب وعملة منسقة.
8. Components محمية من البيانات الفارغة والخاطئة.
9. تقرير مختصر بما تم تعديله.
10. قائمة بأي حقول Backend ما زالت ناقصة للمرحلة الخامسة.
```

---

# ملاحظة مهمة للوكيل المنفذ

لا تبدأ بتحسين الشكل قبل التأكد أن البيانات التي تدخل لكل Chart صحيحة.

الترتيب الصحيح داخل التنفيذ:

```txt
1. افحص ViewModels من المرحلة الأولى.
2. اربط الصفحة بالـ ViewModels.
3. أصلح dataKeys.
4. أضف safeData لكل Chart.
5. أضف Empty/Loading/Error.
6. حسّن التصميم.
7. اختبر Responsive.
8. اختبر Console.
```

أي تنفيذ يبدأ بالتصميم قبل إصلاح البيانات يعتبر تنفيذًا غير مقبول.

---

# النتيجة المتوقعة بعد المرحلة الثانية

بعد هذه المرحلة يجب أن ينتقل قسم التحليلات من:

```txt
بيانات موجودة في API لكن لا تظهر أو تكسر الرسوم
```

إلى:

```txt
Dashboard احترافي يعرض البيانات الحقيقية بوضوح، بدون انهيارات، وبتجربة عربية متجاوبة
```

هذه المرحلة لا تغلق نظام التقارير أو التصدير، لكنها تجعل التحليلات نفسها جاهزة بصريًا ووظيفيًا بنسبة عالية.
