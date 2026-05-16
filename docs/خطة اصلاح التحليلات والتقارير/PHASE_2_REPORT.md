# تقرير تنفيذ المرحلة الثانية — إصلاح صفحات التحليلات والرسوم البيانية

**التاريخ:** 2026-05-16
**الحالة:** مكتملة

---

## 1. ملخص التنفيذ

تم إنجاز المرحلة الثانية بشكل كامل وفق الخطة الموضوعة. تم إعادة بناء/إصلاح جميع الملفات المتعلقة بصفحات التحليلات والرسوم البيانية والبطاقات المتقدمة، مع الالتزام التام بقاعدة المرحلة:

> **API Response → Mapper / Normalizer → ViewModel → UI Component → Chart / Table / Card**

---

## 2. الملفات الجديدة (تم إنشاؤها)

### Utilities
- `admin-dashboard/src/features/analytics/utils/formatters.ts`
  - `formatNumber` — تنسيق الأرقام بالعربية (`ar-YE`)
  - `formatCurrency` — تنسيق العملة YER
  - `formatPercent` — تنسيق النسب
  - `formatDateLabel`, `formatMonthLabel`, `formatShortDate` — تنسيق التواريخ

- `admin-dashboard/src/features/analytics/utils/translations.ts`
  - `translatePaymentMethod`
  - `translateUserRole`
  - `translateStockMovementType`
  - `translateCampaignMetric`
  - `translateSystemStatus`
  - `translateSupportPriority`
  - `translateReportCategory`

### Components
- `EmptyAnalyticsState.tsx` — حالة البيانات الفارغة الموحدة
- `AnalyticsCardErrorBoundary.tsx` — Error Boundary لكل Card/Chart على حدة
- `UserTypesDistribution.tsx` — Pie/Donut chart لتوزيع أنواع المستخدمين
- `MonthlyRevenueChart.tsx` — مخطط الإيرادات الشهرية مع نسبة النمو

### Mapper جديد
- `advancedAnalyticsMappers.ts` — تمت إضافة `mapProductPerformance`

---

## 3. الملفات المُعدّلة

### Pages
- `AnalyticsDashboardPage.tsx` — إعادة بناء كاملة:
  - استخدام `mapAnalyticsDashboard` ViewModel
  - عرض KPI Cards من البيانات المُعالجة
  - ربط Charts بالـ ViewModels الصحيحة
  - استخدام YER في جميع الأرقام
  - عرض "غير متاح" لقيم `null`

- `AdvancedAnalyticsDashboardPage.tsx` — إعادة بناء كاملة:
  - تحميل بيانات كل تبويب عند فتحه فقط (Lazy Tab Loading)
  - إزالة التحميل الجماعي الذي كان يعطل الصفحة
  - كل تبويب يحمل بياناته بشكل مستقل
  - تحسين شريط الحالة الفوري

- `AnalyticsMainPage.tsx` — تحديث لاستخدام Page Components الجديدة بدلاً من Components القديمة

### Charts (إصلاح dataKeys + Safe Data + Tooltips عربية)
- `RevenueChart.tsx` — ComposedChart (Area + Bar)، dataKeys: `date`, `revenue`, `orders`
- `UserAnalyticsChart.tsx` — dataKeys: `date`, `newUsers`, `activeUsers`
- `ProductPerformanceChart.tsx` — BarChart أفقي، dataKeys: `name`, `sold`, `revenue`
- `ServiceAnalyticsChart.tsx` — LineChart، dataKeys: `date`, `requests`, `completed`
- `SupportAnalyticsChart.tsx` — BarChart، dataKeys: `date`, `newTickets`, `resolved`

### Advanced Cards (Self-fetching + YER + Null Handling)
- `SalesAnalyticsCard.tsx` — تستخدم `useSalesAnalytics({ period })`، تنسيق YER، ترجمة طرق الدفع
- `CustomerAnalyticsCard.tsx` — تستخدم `useCustomerAnalytics({ period })`، تُزيل `customerIds`
- `InventoryReportCard.tsx` — تستخدم `useInventoryReport({ period })`، ترجمة حركات المخزون
- `FinancialReportCard.tsx` — تستخدم `useFinancialReport({ period })`، تدفق نقدي + مصادر الإيراد
- `MarketingReportCard.tsx` — تستخدم `useMarketingReport({ period })`، تحذير ROI المرتفع
- `RealTimeMetricsCard.tsx` — عرض "غير متاح" لقيم `null`، تنسيق YER

### API
- `analyticsApi.ts` — `getProductPerformance` الآن يستخدم `mapProductPerformance`

### Exports
- `components/index.ts` — تمت إضافة Exports للمكونات الجديدة

---

## 4. القواعد المُطبّقة

| القاعدة | الحالة |
|---------|--------|
| لا تمرير raw response مباشرة إلى Charts | ✅ |
| استخدام `asArray(data)` بدل `data \|\| []` | ✅ |
| جميع dataKeys مطابقة للـ ViewModel | ✅ |
| العملة الافتراضية YER | ✅ |
| عرض "غير متاح" لقيم `null` | ✅ |
| Empty State لكل Chart | ✅ |
| Loading State لكل Card | ✅ |
| Error Boundary لكل Card رئيسي | ✅ |
| RTL مضبوط (direction: rtl في Tooltips) | ✅ |
| Responsive (ResponsiveContainer + Grid متجاوب) | ✅ |
| Lazy Tab Loading في Advanced | ✅ |

---

## 5. المخرجات

### صفحة `/analytics`
- تعرض Dashboard احترافي مع:
  - 6 KPI Cards (Users, Revenue, Orders, Services, Support, System Health)
  - RevenueChart (ComposedChart يومي)
  - MonthlyRevenueChart (شهري + نمو)
  - UserAnalyticsChart (جدد + نشطون)
  - UserTypesDistribution (Donut)
  - ProductPerformanceChart (أفقي)
  - ServiceAnalyticsChart (طلبات + مكتملة)
  - SupportAnalyticsChart (جديدة + محلولة)

### صفحة `/analytics/advanced`
- Tabs واضحة: نظرة فورية، مبيعات، منتجات، عملاء، مالية، تسويق، مخزون
- كل Tab يحمل بياناته عند فتحه
- لا يتم تحميل كل endpoints دفعة واحدة

### Console
- لا يوجد `slice is not a function`
- لا يتم تمرير object إلى Recharts
- لا توجد أخطاء runtime متوقعة

---

## 6. حقول Backend قد تكون ناقصة (للمرحلة الخامسة)

بناءً على فحص الـ Mappers والـ Types:

| الحقل | الملاحظة |
|-------|----------|
| `revenueCharts.daily[].orders` | Backend يرسل `revenue` فقط في بعض الحالات، `orders` يكون 0 |
| `serviceCharts.requestTrend` | قد لا يكون موجودًا في بعض الردود |
| `supportCharts.ticketTrend` | قد لا يكون موجودًا في بعض الردود |
| `systemHealth` | قد يرجع `null` — تم التعامل معه في الفرونت |
| `marketing.campaignPerformance[].cost` | غالبًا مفقود — يؤدي إلى ROI ضخم |
| `productCharts.topSelling[].name` | بعض المنتجات ترسل `product` بدل `name` — تم التعامل معه في Mapper |

---

## 7. التوصيات

1. **المرحلة الثالثة:** يُنصح بإضافة Backend endpoints لـ `orders` ضمن `revenueCharts.daily` إذا كانت مطلوبة.
2. **المرحلة الخامسة:** مراجعة `marketing.campaignPerformance[].cost` لضمان دقة ROI.
3. **اختبار يدوي:** يُنصح بفتح الصفحتين على أحجام شاشات مختلفة (375px, 768px, 1024px, 1440px) للتأكد من التجاوب.
