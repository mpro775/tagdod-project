# المرحلة الخامسة — الإغلاق النهائي، تحسين الباك إند، الأداء، الاختبارات، والتوثيق

## اسم المرحلة

**Phase 5 — Final Hardening, Backend Accuracy, Performance, Testing, Cleanup & Production Readiness**

---

## الهدف العام

تهدف هذه المرحلة إلى إغلاق قسم:

- الإحصائيات.
- التحليلات الرئيسية.
- التحليلات المتقدمة.
- إدارة التقارير.
- التقارير المجدولة.
- نظام التصدير.
- مركز التصدير.

بشكل نهائي واحترافي بحيث يصبح القسم جاهزًا للاستخدام الإنتاجي، وليس مجرد واجهات تعمل مؤقتًا.

هذه المرحلة لا تبني الواجهات من الصفر، بل تقوم بعملية:

```txt
Hardening
Accuracy
Performance
QA
Testing
Cleanup
Documentation
Production Readiness
```

---

## اعتماديات المرحلة

هذه المرحلة تعتمد على اكتمال المراحل السابقة:

```txt
Phase 1: Contract + Mappers + Safe Data
Phase 2: Analytics UI + Charts + Responsive
Phase 3: Reports Management + Scheduled Reports
Phase 4: Export System + Export Center
```

لا تبدأ هذه المرحلة قبل أن تكون الصفحات التالية تعمل أساسيًا:

```txt
/analytics
/analytics/advanced
/reports أو صفحة إدارة التقارير حسب الراوت
/report-schedules أو صفحة التقارير المجدولة
/export-center أو مركز التصدير
```

---

# 1. نطاق المرحلة

## داخل النطاق

تشمل هذه المرحلة:

```txt
Backend analytics accuracy
Date range handling
Currency consistency
System health correctness
Realtime metrics correctness
Advanced analytics response consistency
Reports performance
Schedules reliability
Export records reliability
Cache strategy
Pagination correctness
Validation
Error handling
Security checks
Frontend cleanup
Removing deprecated hooks
Removing duplicated API paths
Unit tests
Integration tests
Manual QA
Documentation
Production checklist
```

## خارج النطاق

لا تشمل هذه المرحلة:

```txt
إعادة بناء BI engine جديد بالكامل
إضافة Data Warehouse
إضافة Event Tracking system كامل من الصفر
إضافة Dashboard Builder مرئي جديد
إعادة تصميم الهوية البصرية من الصفر
```

---

# 2. القاعدة الصارمة لهذه المرحلة

ممنوع إضافة features جديدة كبيرة قبل إغلاق الموجود.

هذه المرحلة هدفها:

```txt
جعل الموجود صحيحًا، مستقرًا، سريعًا، موثقًا، ومختبرًا
```

وليست مرحلة لإضافة أفكار جديدة.

---

# 3. الصورة النهائية المطلوبة بعد الإغلاق

بعد تنفيذ هذه المرحلة يجب أن يصبح النظام كالتالي:

```txt
Analytics APIs:
  consistent
  accurate
  paginated where needed
  cache-aware
  date-range-aware
  currency-aware
  secured

Frontend:
  no runtime crashes
  no raw response usage in UI
  responsive
  RTL ready
  empty/loading/error states
  clean hooks
  stable query keys

Reports:
  generated correctly
  listed correctly
  view/download/archive/delete works
  scheduled reports reliable

Exports:
  formats unified
  files tracked
  export center accurate
  download works

QA:
  manual checklist completed
  unit tests for mappers
  integration tests for critical APIs
  documentation ready
```

---

# 4. Backend — توحيد شكل الاستجابات

## 4.1 شكل الاستجابة المعتمد

إذا كان المشروع يستخدم global response wrapper، يجب أن يكون الشكل:

```ts
{
  success: true,
  data: T,
  requestId: string
}
```

وللقوائم:

```ts
{
  success: true,
  data: {
    data: T[],
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  },
  requestId: string
}
```

## 4.2 ممنوع

```txt
- Endpoint يرجع array مباشرة.
- Endpoint يرجع string فقط لملف.
- Endpoint يرجع data.data أحيانًا و data أحيانًا بدون توثيق.
- Endpoint يرجع pagination بشكل مختلف عن البقية.
```

## 4.3 المطلوب

افحص كل endpoints التالية أو ما يعادلها:

```txt
GET  /analytics/dashboard
GET  /analytics/advanced/realtime
GET  /analytics/advanced/sales
GET  /analytics/advanced/customers
GET  /analytics/advanced/inventory
GET  /analytics/advanced/financial
GET  /analytics/advanced/marketing

GET  /analytics/advanced/reports
GET  /analytics/advanced/reports/:reportId
POST /analytics/advanced/reports
POST /analytics/advanced/reports/:reportId/export
GET  /analytics/advanced/reports/exports

GET    /analytics/report-schedules
GET    /analytics/report-schedules/stats
GET    /analytics/report-schedules/:id
POST   /analytics/report-schedules
PATCH  /analytics/report-schedules/:id
DELETE /analytics/report-schedules/:id
POST   /analytics/report-schedules/:id/run
POST   /analytics/report-schedules/:id/pause
POST   /analytics/report-schedules/:id/resume
```

وتأكد أن كلها تستخدم response shape واضح.

---

# 5. Backend — دعم التاريخ والفترات بشكل صحيح

## 5.1 المشكلة المحتملة

كثير من دوال التحليلات قد تستخدم آخر 30 يوم بشكل ثابت.

المطلوب أن كل analytics endpoint يدعم:

```ts
period?: 'today' | '7d' | '30d' | '90d' | 'month' | 'quarter' | 'year' | 'custom';
startDate?: string;
endDate?: string;
compareWithPrevious?: boolean;
```

## 5.2 قاعدة تحديد الفترة

أنشئ helper في الباك:

```ts
export function resolveAnalyticsDateRange(query: AnalyticsQueryDto) {
  const now = new Date();

  if (query.startDate && query.endDate) {
    return {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      period: 'custom',
    };
  }

  switch (query.period) {
    case 'today':
      return start/end of today;

    case '7d':
      return last 7 days;

    case '90d':
      return last 90 days;

    case 'month':
      return current month;

    case 'quarter':
      return current quarter;

    case 'year':
      return current year;

    case '30d':
    default:
      return last 30 days;
  }
}
```

## 5.3 المطلوب

يجب استخدام هذا helper في:

```txt
buildRevenueCharts
buildUserCharts
buildProductCharts
buildServiceCharts
buildSupportCharts
getSalesAnalytics
getCustomerAnalytics
getInventoryReport
getFinancialReport
getMarketingReport
generateReport
scheduledReportRun
exportData
```

---

# 6. Backend — العملة الرسمية

## 6.1 القرار المعتمد

العملة الافتراضية للمشروع:

```txt
YER
```

## 6.2 المطلوب

تأكد أن كل الحقول المالية ترجع:

```ts
currency: 'YER'
```

أو تقرأ العملة من إعدادات المتجر/النظام.

## 6.3 ممنوع

```txt
USD
$
```

كقيمة افتراضية في:

```txt
reports summary
financial analytics
sales analytics
exported files
frontend formatters
PDF reports
XLSX headers
```

## 6.4 ملاحظة

إذا كانت البيانات التاريخية مخزنة بدون عملة، اعرضها بـ YER افتراضيًا مع توثيق ذلك.

---

# 7. Backend — دقة مؤشرات النظام System Health

## 7.1 المشكلة

لا يجب أن يرجع:

```ts
systemHealth: 0
```

إذا لم يكن محسوبًا.

## 7.2 الشكل المطلوب

```ts
systemHealth: {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime?: number;
  responseTime?: number;
  errorRate?: number;
  lastCheckedAt?: string;
}
```

أو في dashboard summary:

```ts
systemHealthScore: number | null
```

## 7.3 القاعدة

```txt
0 = قيمة محسوبة فعليًا
null = غير متاح
unknown = حالة غير محسوبة
```

## 7.4 المطلوب في الفرونت

إذا القيمة `null` أو `unknown`:

```txt
غير متاح
```

ولا تعرض:

```txt
0%
```

---

# 8. Backend — تحسين RealTime Metrics

## 8.1 الشكل المطلوب

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
    errorRate?: number;
  };
  lastUpdated: string;
}
```

## 8.2 إن كانت حقول إضافية غير محسوبة

لا ترجعها كأصفار مضللة.

مثال:

```ts
cpuUsage: null
memoryUsage: null
diskUsage: null
```

أو لا ترجعها أصلًا حتى يتم دعمها.

## 8.3 توثيق

أضف تعليق أو documentation يوضح:

```txt
Realtime metrics currently represent application-level metrics, not infrastructure-level metrics unless explicitly configured.
```

---

# 9. Backend — إزالة البيانات الثقيلة من الاستجابات

## 9.1 المشكلة

في customer analytics، يتم إرجاع `customerIds` طويلة داخل `customerSegments`.

هذا غير مناسب للداشبورد.

## 9.2 المطلوب

في endpoint التحليلات الرئيسية:

```ts
customerSegments: [
  {
    segment: string;
    count: number;
    percentage: number;
  }
]
```

ممنوع إرجاع:

```ts
customerIds: string[]
```

افتراضيًا.

## 9.3 endpoint منفصل للتفاصيل

إذا احتجت العملاء داخل شريحة:

```txt
GET /analytics/advanced/customers/segments/:segment/customers?page=1&limit=50
```

يرجع:

```ts
{
  data: CustomerSummary[],
  meta
}
```

---

# 10. Backend — Pagination لكل القوائم الثقيلة

يجب تطبيق pagination على:

```txt
reports
exports
schedules
topCustomers if large
inventory movements if large
campaign performance if large
segment customer details
```

## 10.1 القاعدة

لا ترجع أكثر من:

```txt
50 - 100 record
```

في endpoint واحد إلا إذا كان تصدير.

---

# 11. Backend — Cache Strategy

## 11.1 الهدف

تقليل الحمل على قاعدة البيانات مع الحفاظ على الدقة.

## 11.2 المطلوب

استخدم cache للـ analytics الثقيلة:

```txt
dashboard analytics
advanced sales
customers
inventory
financial
marketing
report list stats
export center stats
```

## 11.3 cache key يجب أن يشمل

```txt
endpoint
tenant/store id إن وجد
period
startDate
endDate
filters
user role إن كان يؤثر على البيانات
```

مثال:

```ts
analytics:advanced:sales:${storeId}:${period}:${startDate}:${endDate}
```

## 11.4 TTL مقترح

```txt
Realtime metrics: 15s - 30s
Dashboard analytics: 60s - 5m
Advanced analytics: 5m - 15m
Reports list: 30s - 2m
Exports list: 30s - 2m
```

## 11.5 Cache invalidation

عند:

```txt
new order
order status change
new user
inventory movement
support ticket update
report generated
export generated
schedule run
```

يجب إما invalidation أو TTL قصير.

---

# 12. Backend — Validation

## 12.1 Analytics Query DTO

تأكد من وجود DTO مثل:

```ts
export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(['today', '7d', '30d', '90d', 'month', 'quarter', 'year', 'custom'])
  period?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  compareWithPrevious?: boolean;
}
```

## 12.2 List DTO

```ts
page
limit
search
status
category
format
startDate
endDate
```

مع:

```txt
limit max 100
page min 1
```

## 12.3 Export DTO

كما في المرحلة الرابعة:

```txt
format: pdf/xlsx/csv/json/excel/xls
type: supported data type
```

ثم normalize.

## 12.4 Schedule DTO

تأكد من:

```txt
reportType valid
frequency valid
recipients valid emails
timezone optional
time valid
```

---

# 13. Backend — Error Handling

## 13.1 أخطاء مفهومة

بدل:

```txt
Internal server error
```

استخدم:

```ts
throw new BadRequestException({
  code: 'UNSUPPORTED_EXPORT_FORMAT',
  message: 'صيغة التصدير غير مدعومة',
});
```

## 13.2 رموز مقترحة

```txt
ANALYTICS_DATE_RANGE_INVALID
REPORT_NOT_FOUND
REPORT_NOT_READY
EXPORT_FORMAT_UNSUPPORTED
EXPORT_FILE_NOT_FOUND
SCHEDULE_NOT_FOUND
SCHEDULE_RECIPIENTS_INVALID
SCHEDULE_RUN_FAILED
EXPORT_GENERATION_FAILED
```

## 13.3 في الفرونت

يجب أن يعرض toast أو error state واضح بناءً على message.

---

# 14. Backend — Security & Permissions

## 14.1 تقارير

قبل عرض أو تحميل أو حذف تقرير:

```txt
check user permission
check tenant/store ownership
check role
```

## 14.2 ملفات التصدير

ممنوع تحميل ملف لا يخص المستخدم/المتجر.

## 14.3 جدولة

لا يمكن للمستخدم تشغيل أو تعديل جدولة لا يملك صلاحيتها.

## 14.4 منع path traversal

ممنوع قبول path من المستخدم للتحميل.

لا تستخدم:

```txt
?path=...
```

إلا بتحقق شديد.

---

# 15. Frontend — تنظيف API Layer

## 15.1 المطلوب

بعد المراحل السابقة، يجب أن يكون عندك API layer نظيف:

```txt
analyticsApi.ts
reportsApi.ts أو جزء التقارير
schedulesApi.ts أو جزء الجدولة
exportsApi.ts أو جزء التصدير
```

## 15.2 ممنوع

```txt
- تكرار نفس endpoint في أكثر من ملف بدون سبب.
- وجود دوال قديمة تستخدم /analytics/reports/schedule.
- وجود دوال ترجع raw Axios response للصفحات.
- وجود response.data.data داخل Components.
```

## 15.3 المطلوب

كل API function ترجع typed data جاهز:

```ts
Promise<DashboardAnalyticsView>
Promise<SalesAnalyticsView>
Promise<PaginatedResponse<AdvancedReport>>
Promise<PaginatedResponse<ReportSchedule>>
Promise<PaginatedResponse<ExportFile>>
```

---

# 16. Frontend — إزالة hooks القديمة

ابحث عن hooks قديمة مثل:

```txt
useScheduleReport
useExportReport القديم
useReports القديم
useAnalyticsReport القديم
```

## 16.1 المطلوب

- احذف غير المستخدم.
- أو اجعله wrapper فوق API الجديد.
- لا تترك hook يستخدم endpoint قديم.
- لا تترك imports ميتة.

---

# 17. Frontend — Query Keys موحدة

أنشئ ملف:

```txt
analyticsQueryKeys.ts
```

مثال:

```ts
export const analyticsQueryKeys = {
  dashboard: (params: any) => ['analytics', 'dashboard', params],
  advancedSales: (params: any) => ['analytics', 'advanced', 'sales', params],
  advancedCustomers: (params: any) => ['analytics', 'advanced', 'customers', params],
  reports: (params: any) => ['analytics', 'reports', params],
  report: (id: string) => ['analytics', 'reports', id],
  schedules: (params: any) => ['analytics', 'schedules', params],
  scheduleStats: () => ['analytics', 'schedules', 'stats'],
  exports: (params: any) => ['analytics', 'exports', params],
};
```

## 17.1 الهدف

- منع cache conflicts.
- تسهيل invalidation.
- منع تكرار strings.

---

# 18. Frontend — Error Boundary النهائي

تأكد أن الصفحات الرئيسية ملتفة بـ ErrorBoundary:

```txt
AnalyticsPage
AdvancedAnalyticsPage
ReportsManagementPage
ReportSchedulesPage
ExportCenterPage
```

لكن يجب أن تكون هناك Error Boundaries داخلية للـ Cards أيضًا.

## 18.1 المطلوب

إذا فشل Chart واحد، لا تسقط الصفحة كاملة.

---

# 19. Frontend — Empty/Loading/Error consistency

كل صفحة يجب أن تحتوي:

```txt
Loading
Empty
Error
Success
```

## 19.1 ممنوع

```txt
- صفحة فارغة أثناء التحميل.
- جدول فارغ بدون رسالة.
- console error بدون UI feedback.
- زر يبقى loading للأبد.
```

---

# 20. Frontend — Responsive Final QA

اختبر على:

```txt
375px
430px
768px
1024px
1280px
1440px
```

## 20.1 صفحات يجب اختبارها

```txt
/analytics
/analytics/advanced
reports management
scheduled reports
export center
report details
create report dialog
schedule form dialog
data export dialog
```

---

# 21. Frontend — RTL Final QA

## المطلوب

- الاتجاه RTL صحيح.
- الجداول لا تكسر الاتجاه.
- الأزرار في أماكن منطقية.
- tooltips عربية.
- التواريخ واضحة.
- الأرقام واضحة.

---

# 22. Formatters النهائية

يجب أن تكون كل التنسيقات من مكان واحد:

```txt
formatNumber
formatCurrency
formatPercent
formatDate
formatDateTime
formatFileSize
formatDuration
```

## 22.1 ممنوع

```txt
value.toLocaleString()
```

مبعثر في كل مكان إذا يمكن استخدام helper.

---

# 23. Translation Cleanup

## 23.1 المطلوب

تأكد من وجود مفاتيح ترجمة لكل:

```txt
analytics
advanced analytics
reports
schedules
exports
statuses
formats
categories
errors
empty states
toasts
buttons
filters
```

## 23.2 ممنوع

- نصوص عربية hardcoded كثيرة داخل components إذا نظام i18n مستخدم.
- مفاتيح ناقصة تسبب ظهور `reports.table.title`.

---

# 24. Unit Tests — Mappers

أضف اختبارات للملفات التالية:

```txt
analyticsMappers
advancedAnalyticsMappers
reportMappers
scheduleMappers
exportMappers
formatters
```

## 24.1 اختبارات إلزامية

```txt
[ ] unwrapApiData يتعامل مع wrapper.
[ ] asArray يرجع [] عند object/null.
[ ] mapAdvancedReport يحول id إلى reportId.
[ ] mapAdvancedReport يضع currency YER عند غياب العملة.
[ ] mapSalesAnalytics يحول topProducts.name إلى product.
[ ] mapMarketingReport يحول impressions إلى reach.
[ ] mapReportSchedule يطبع status/isActive.
[ ] normalizeExportFormat يحول excel إلى xlsx.
[ ] normalizeFileResult يتعامل مع string response.
[ ] normalizeFileResult يتعامل مع object response.
```

---

# 25. Integration Tests — Backend

إذا يوجد test setup في الباك، أضف اختبارات للآتي:

## 25.1 Analytics

```txt
GET /analytics/dashboard
GET /analytics/advanced/sales
GET /analytics/advanced/customers
GET /analytics/advanced/inventory
GET /analytics/advanced/financial
GET /analytics/advanced/marketing
```

تحقق من:

```txt
success true
data موجودة
arrays هي arrays
numbers هي numbers
no customerIds في segments الافتراضية
currency YER
```

## 25.2 Reports

```txt
GET /analytics/advanced/reports
POST /analytics/advanced/reports
GET /analytics/advanced/reports/:reportId
```

تحقق من:

```txt
pagination shape
id/reportId موجودان
summary صحيح
status صحيح
```

## 25.3 Schedules

```txt
GET /analytics/report-schedules/stats
GET /analytics/report-schedules
POST /analytics/report-schedules
POST /analytics/report-schedules/:id/run
POST /analytics/report-schedules/:id/pause
POST /analytics/report-schedules/:id/resume
```

تحقق من:

```txt
stats لا يذهب إلى :id
create يعمل
run يحفظ lastResult
pause/resume يغير status
```

## 25.4 Exports

```txt
POST /analytics/advanced/reports/:reportId/export
GET /analytics/advanced/reports/exports
```

تحقق من:

```txt
format xlsx works
format excel becomes xlsx
fileUrl exists
exports[] updated
export center lists file
```

---

# 26. E2E / Manual Scenario Tests

نفذ السيناريوهات التالية يدويًا:

## 26.1 سيناريو التحليلات

```txt
1. افتح /analytics.
2. غيّر الفترة إلى آخر 30 يوم.
3. تأكد أن الرسوم تظهر.
4. افتح /analytics/advanced.
5. افتح كل تبويب.
6. تأكد أن لا يوجد crash.
7. تأكد أن العملة YER.
```

## 26.2 سيناريو التقارير

```txt
1. افتح إدارة التقارير.
2. أنشئ تقرير مبيعات.
3. تأكد أنه يظهر في الجدول.
4. افتح التفاصيل.
5. صدّر التقرير XLSX.
6. تأكد أن الملف يفتح.
7. تأكد أنه يظهر داخل تفاصيل التقرير.
```

## 26.3 سيناريو مركز التصدير

```txt
1. افتح مركز التصدير.
2. تأكد أن الملف الجديد ظاهر.
3. جرّب البحث.
4. فلتر XLSX.
5. افتح الملف.
6. انسخ الرابط.
```

## 26.4 سيناريو الجدولة

```txt
1. افتح التقارير المجدولة.
2. أنشئ جدولة أسبوعية.
3. اضغط Run Now.
4. تأكد أن lastResult ظهر.
5. أوقف الجدولة.
6. استأنف الجدولة.
7. احذف الجدولة.
```

---

# 27. Performance Checks

## 27.1 Network

تأكد من:

```txt
- لا يتم تحميل كل advanced endpoints مرة واحدة بدون حاجة.
- كل تبويب يحمل بياناته عند الحاجة.
- لا توجد requests مكررة بلا داعي.
- pagination يعمل.
```

## 27.2 Backend

راقب زمن الاستجابة:

```txt
Dashboard analytics < 1.5s إن أمكن
Advanced single tab < 2s إن أمكن
Reports list < 1s
Exports list < 1s
```

إذا كان أبطأ، فعّل cache أو حسّن الاستعلامات.

## 27.3 Payload size

تأكد أن customer analytics لا يرجع آلاف IDs.

---

# 28. Database Indexes

افحص وجود indexes مناسبة على الحقول المستخدمة في التحليلات والتقارير.

## 28.1 أمثلة

```txt
orders.createdAt
orders.status
orders.paymentMethod
orders.userId
orders.total

users.createdAt
users.role
users.status

products.categoryId
products.stock
products.createdAt

reports.reportId
reports.category
reports.status
reports.generatedAt
reports.createdBy

reportSchedules.status
reportSchedules.nextRunAt
reportSchedules.createdBy
```

## 28.2 MongoDB مثال

```ts
schema.index({ createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });
schema.index({ reportId: 1 }, { unique: true });
```

## 28.3 Postgres مثال

```sql
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);
```

طبق حسب قاعدة البيانات المستخدمة فعليًا.

---

# 29. Logging

## 29.1 المطلوب

أضف logs مفيدة عند:

```txt
report generation started
report generation completed
report generation failed
export started
export completed
export failed
schedule run started
schedule run completed
schedule run failed
analytics query failed
```

## 29.2 لا تسجل بيانات حساسة

ممنوع تسجيل:

```txt
tokens
private file paths if sensitive
customer PII in bulk
full customerIds arrays
```

---

# 30. Monitoring Hooks

إذا يوجد نظام monitoring أو logs مركزي، أضف counters أو logs قابلة للتتبع:

```txt
analytics.request.count
analytics.request.duration
reports.generated.count
reports.failed.count
exports.generated.count
exports.failed.count
schedules.run.count
schedules.failed.count
```

إذا لا يوجد نظام metrics، يكفي structured logs.

---

# 31. Cleanup — إزالة الكود القديم

ابحث واحذف/عطل:

```txt
old analytics mock data
old report schedule endpoint usage
old useScheduleReport
old export string handling scattered
unused components
unused types
duplicated enums
duplicated formatters
unused imports
console.log غير الضرورية
```

## 31.1 ممنوع

ترك كود قديم يسبب لبس للمطورين لاحقًا.

---

# 32. Documentation

أضف ملف توثيق داخلي:

```txt
docs/analytics-reports-contract.md
```

أو داخل:

```txt
admin-dashboard/src/features/analytics/README.md
backend/src/analytics/README.md
```

## 32.1 يجب أن يحتوي

```txt
1. Overview
2. Endpoints
3. Response shapes
4. Dashboard data contract
5. Advanced analytics contract
6. Reports contract
7. Schedules contract
8. Export contract
9. Supported formats
10. Error codes
11. Currency policy
12. Date range policy
13. Known limitations
```

---

# 33. Contract Documentation Example

اكتب مثالًا واضحًا:

```ts
GET /analytics/advanced/reports

Response:
{
  success: true,
  data: {
    data: AdvancedReport[],
    meta: {
      total,
      page,
      limit,
      totalPages
    }
  },
  requestId
}
```

و:

```ts
AdvancedReport:
{
  id: string;
  reportId: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  generatedAt: string;
  summary: {
    totalRecords: number;
    totalValue: number;
    currency: 'YER';
    growth: number;
  };
}
```

---

# 34. Production Checklist

قبل اعتبار القسم جاهزًا، أكمل:

```txt
[ ] .env يحتوي إعدادات التخزين الصحيحة للملفات.
[ ] public file URLs تعمل.
[ ] صلاحيات التحميل محمية.
[ ] العملة YER في كل مكان.
[ ] لا توجد customerIds ضخمة في dashboard.
[ ] لا توجد console errors.
[ ] لا توجد TypeScript errors.
[ ] لا توجد lint errors حرجة.
[ ] build ينجح.
[ ] backend tests تمر.
[ ] frontend tests تمر.
[ ] manual QA مكتمل.
[ ] docs محدثة.
```

---

# 35. أوامر الفحص المقترحة

حسب المشروع، نفذ ما يناسب:

## Frontend

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

أو:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Backend

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

أو حسب package manager المستخدم.

---

# 36. Manual API Testing

استخدم curl أو Postman لاختبار:

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://<API_URL>/analytics/advanced/reports?page=1&limit=10"
```

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://<API_URL>/analytics/advanced/reports/exports?page=1&limit=10"
```

```bash
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"format":"xlsx"}' \
  "https://<API_URL>/analytics/advanced/reports/<REPORT_ID>/export"
```

تأكد من:

```txt
success true
fileUrl موجود
format xlsx
```

---

# 37. معايير القبول النهائية

لا تعتبر المرحلة مكتملة إلا إذا تحقق كل التالي:

```txt
[ ] كل analytics endpoints تدعم date range أو موثق ما لا يدعمه.
[ ] كل القيم المالية تعرض YER.
[ ] systemHealth لا يعرض 0 مضلل.
[ ] realtime metrics متوافقة مع UI.
[ ] customerSegments لا تحتوي customerIds ضخمة.
[ ] كل list endpoints تستخدم pagination موحد.
[ ] cache مضاف أو موثق سبب عدم إضافته.
[ ] validation قوي للـ query/export/schedule.
[ ] أخطاء الباك واضحة ومترجمة/مفهومة.
[ ] صلاحيات التقارير والتصدير محمية.
[ ] API layer في الفرونت لا يرجع raw responses.
[ ] لا توجد hooks قديمة فعالة.
[ ] query keys موحدة.
[ ] Error boundaries موجودة.
[ ] Empty/loading/error states موجودة.
[ ] responsive وRTL مختبران.
[ ] unit tests للـ mappers موجودة.
[ ] integration tests للـ APIs الحرجة موجودة أو موثق سبب عدم توفرها.
[ ] build frontend ينجح.
[ ] build backend ينجح.
[ ] مركز التصدير يعمل.
[ ] التقارير المجدولة تعمل.
[ ] تقرير توثيق contract موجود.
[ ] checklist اليدوي مكتمل.
```

---

# 38. ممنوعات صارمة

ممنوع في هذه المرحلة:

```txt
- إضافة features ضخمة جديدة بدل إغلاق الموجود.
- ترك USD كعملة افتراضية.
- ترك systemHealth = 0 إذا غير محسوب.
- ترك customerIds ضخمة في customerSegments.
- ترك endpoint يرجع string فقط للتصدير.
- ترك route stats بعد :id.
- ترك hooks قديمة تستخدم endpoints قديمة.
- ترك response.data.data داخل Components.
- ترك any منتشر في Components الأساسية.
- ترك console.log في الإنتاج.
- تجاهل TypeScript errors.
- تجاهل build failure.
- عمل mock data لإخفاء مشاكل API.
- إخفاء الأزرار المكسورة دون إصلاح السبب أو توثيق عدم دعمها.
```

---

# 39. مخرجات المرحلة

بنهاية المرحلة يجب تسليم:

```txt
1. Backend analytics hardening مكتمل.
2. Date range موحد.
3. Currency YER موحدة.
4. System health صحيح وغير مضلل.
5. Customer analytics payload مخفف.
6. Pagination موحد.
7. Cache strategy مطبقة أو موثقة.
8. Validation وأخطاء محسنة.
9. Security checks للتقارير والتصدير.
10. Frontend API layer نظيف.
11. Hooks قديمة محذوفة أو موحدة.
12. Query keys موحدة.
13. Tests للـ mappers.
14. Tests للـ endpoints الحرجة.
15. Documentation للـ contracts.
16. Manual QA checklist مكتملة.
17. Build frontend/backend ناجح.
18. تقرير نهائي بما تم وما تبقى كتحسينات مستقبلية.
```

---

# 40. ترتيب التنفيذ الموصى به

اتبع هذا الترتيب:

```txt
1. افحص كل endpoints والـ response shapes.
2. وحّد date range helper في الباك.
3. وحّد العملة YER.
4. أصلح systemHealth و realtime.
5. أزل customerIds الثقيلة.
6. أضف pagination للقوائم الثقيلة.
7. أضف/حسّن cache.
8. حسّن validation والأخطاء.
9. أضف security checks.
10. نظّف frontend API layer.
11. احذف hooks القديمة.
12. وحّد query keys.
13. أضف tests للـ mappers.
14. أضف integration tests للباك.
15. نفذ manual QA كامل.
16. اكتب documentation.
17. شغّل lint/typecheck/test/build.
18. سلّم final report.
```

---

# 41. تقرير نهائي مطلوب من الوكيل المنفذ

في نهاية التنفيذ يجب إنشاء ملف:

```txt
ANALYTICS_REPORTS_FINAL_CLOSURE_REPORT.md
```

ويحتوي:

```txt
1. Summary
2. Completed items
3. Backend changes
4. Frontend changes
5. Tests added
6. Manual QA results
7. Known limitations
8. Future improvements
9. Files changed
10. How to verify
```

## مثال Known Limitations

```txt
- Infrastructure CPU/RAM metrics are not available yet unless monitoring integration is added.
- Export deletion is disabled because backend storage deletion endpoint is not implemented.
```

يجب أن تكون القيود واضحة، لا مخفية.

---

# 42. النتيجة المتوقعة بعد المرحلة الخامسة

بعد هذه المرحلة يجب أن ينتقل القسم من:

```txt
قسم يعمل بعد إصلاحات جزئية لكنه يحتاج ثقة واختبارات وتنظيف
```

إلى:

```txt
قسم إحصائيات وتقارير احترافي، مستقر، واضح العقود، قابل للصيانة، وجاهز للاستخدام الإنتاجي
```

هذه هي مرحلة الإغلاق الحقيقي بنسبة:

```txt
90% - 95%
```

والباقي يكون تحسينات مستقبلية مثل:

```txt
BI Builder
Custom dashboard widgets
Advanced cohort analysis
Data warehouse
Full infrastructure metrics integration
```
