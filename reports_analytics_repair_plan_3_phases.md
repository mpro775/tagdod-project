# خطة إصلاح وتطوير نظام التقارير والتحليلات

## المشروع

لوحة التحكم + الباك إند

## الهدف

تحويل نظام التقارير الحالي من نظام تحليلات وتقارير جزئي إلى نظام تقارير احترافي قابل للتوسع، يدعم:

- توليد تقارير موثوقة.
- عرض تفاصيل التقرير داخل لوحة التحكم.
- تصدير PDF / Excel / CSV / JSON بشكل احترافي.
- جدولة التقارير وتشغيلها تلقائيًا.
- توضيح جودة البيانات وعدم عرض الأرقام التقديرية كأنها حقيقية.
- دعم مفاتيح الترجمة للواجهات بالعربية والإنجليزية.

---

# 1. الوضع الحالي المختصر

النظام الحالي يحتوي على أساس جيد في الباك إند والفرونت، مثل:

- Analytics Dashboard.
- Advanced Analytics.
- Sales / Products / Customers / Inventory / Financial / Marketing analytics.
- Reports Management Page.
- Data Export Page.
- Export Service يدعم عدة صيغ.
- Schemas للتقارير والجدولة.

لكن النظام لا يزال يحتاج إلى تنظيم وإكمال ليصبح احترافيًا.

---

# 2. أهم المشاكل الحالية

## 2.1 في الباك إند

### المشكلة 1: جدولة التقارير غير مكتملة

يوجد Schema للجدولة، لكن لا يوجد تشغيل حقيقي للجدولة عبر Cron أو Queue.

المطلوب:

- حفظ الجدولة في قاعدة البيانات.
- تشغيل تلقائي حسب `nextRun`.
- تحديث `lastRun`, `nextRun`, `lastResult`.
- إرسال التقرير للمستلمين.
- عرض نجاح وفشل كل تشغيل.

---

### المشكلة 2: بعض البيانات تقديرية أو Placeholder

بعض التقارير تحتوي على أرقام ثابتة أو تقديرية مثل:

- دقة المخزون.
- مصادر الزيارات.
- أداء الحملات.
- تكلفة الإعلانات.
- بعض مؤشرات التسويق.

المطلوب:

- عدم عرض هذه الأرقام كبيانات حقيقية.
- إضافة `dataQuality`.
- إظهار "غير متاح" أو "تقديري" في الواجهة.
- إخفاء أي تقرير يعتمد على Placeholder حتى يتم ربطه فعليًا.

---

### المشكلة 3: توليد reportId قد يسبب تكرار

التقرير يستخدم رقم عشوائي قصير، وهذا غير مضمون.

المطلوب:

- استخدام Counter في قاعدة البيانات.
- أو الاعتماد على ObjectId مع رقم منسق.
- إضافة unique index على `reportId`.

---

### المشكلة 4: createdBy غير موحد

بعض نقاط إنشاء التقرير تستخدم:

```ts
createdBy: 'system'
```

بينما الـSchema يتوقع ObjectId.

المطلوب:

- أخذ المستخدم من `req.user.sub`.
- عدم استخدام `"system"` إلا لو عندكم مستخدم نظام حقيقي.
- توحيد توليد التقارير عبر Advanced Reports endpoint.

---

### المشكلة 5: التصدير غير احترافي كفاية

التصدير الحالي موجود، لكنه بسيط.

المطلوب:

- PDF به غلاف، ملخص، KPIs، رسوم، جداول، توصيات، Footer.
- Excel به Sheets منظمة.
- CSV للبيانات الخام.
- JSON للتكاملات.
- دعم RTL والهوية البصرية.

---

### المشكلة 6: الصلاحيات عامة جدًا

حاليًا التقارير غالبًا محمية بـ AdminGuard فقط.

المطلوب إضافة صلاحيات دقيقة مثل:

```txt
analytics.view
analytics.export
analytics.reports.create
analytics.reports.delete
analytics.reports.schedule
analytics.financial.view
analytics.system.view
```

---

### المشكلة 7: لا يوجد Audit Log للتصدير

التصدير حساس، خصوصًا تقارير العملاء والمالية.

المطلوب تسجيل:

- من صدّر التقرير.
- نوع التقرير.
- صيغة التصدير.
- الفترة والفلاتر.
- وقت العملية.
- IP و User Agent إن كانت متاحة.
- رابط الملف الناتج.

---

## 2.2 في الفرونت إند

### المشكلة 1: تجربة التقارير مشتتة

يوجد أكثر من صفحة تحليل وتقرير، لكن لا يوجد مركز واحد واضح.

المطلوب:

صفحة مركزية:

```txt
Reports & Analytics Center
```

وتحتها أقسام:

```txt
Overview
Sales
Orders
Products
Customers
Inventory
Financial
Marketing
Support
System
Tejo
Saved Reports
Scheduled Reports
Export Center
```

---

### المشكلة 2: لا توجد صفحة تفاصيل تقرير احترافية

المطلوب إنشاء صفحة:

```txt
/analytics/reports/:id
```

تعرض:

- معلومات التقرير.
- حالة التقرير.
- جودة البيانات.
- KPIs.
- Charts.
- Tables.
- Insights.
- Recommendations.
- ملفات التصدير.
- سجل التصدير أو التشغيل.

---

### المشكلة 3: كروت التقارير تحتاج تطوير

الكارد الحالي يجب أن يعرض:

- اسم التقرير.
- النوع.
- الفترة.
- الحالة.
- جودة البيانات.
- من أنشأه.
- تاريخ الإنشاء.
- مدة التوليد.
- الأزرار: عرض / تحميل / تكرار / أرشفة / حذف.

---

### المشكلة 4: واجهة الجدولة موجودة جزئيًا لكن تحتاج ربط حقيقي

بعد إكمال الباك إند، تعرض الواجهة:

- اسم الجدولة.
- نوع التقرير.
- التكرار.
- المستلمين.
- آخر تشغيل.
- التشغيل القادم.
- نسبة النجاح.
- آخر خطأ.
- تفعيل/إيقاف.
- تشغيل الآن.

---

# 3. خطة الإصلاح على ثلاث مراحل

---

# المرحلة الأولى: إصلاح أساس التقارير الحالية

## الهدف

تثبيت البنية الحالية وجعل التقارير موثوقة وقابلة للعرض والتصدير بشكل منظم.

## 3.1 مهام الباك إند

### 3.1.1 توحيد توليد التقارير

المطلوب:

- اعتماد مسار واحد رئيسي لتوليد التقارير.
- منع التكرار بين endpoints القديمة والمتقدمة.
- أي endpoint قديم يجب أن يستدعي نفس Service المركزي.

المقترح:

```txt
ReportGenerationService
```

المسؤول عن:

- تجهيز الفلاتر.
- توليد البيانات.
- حفظ التقرير.
- تحديث الحالة.
- توليد reportId.
- إرجاع النتيجة.

---

### 3.1.2 إصلاح createdBy

المطلوب:

- استخدام المستخدم الحالي من JWT.
- حفظ `createdBy` كـObjectId.
- دعم `createdByType` عند الحاجة:

```ts
createdByType: 'user' | 'system'
```

لكن الافتراضي يكون:

```ts
createdByType: 'user'
```

---

### 3.1.3 إضافة حالة التقرير

إضافة status workflow:

```ts
status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
```

مع حقول:

```ts
startedAt?: Date;
completedAt?: Date;
failedAt?: Date;
failureReason?: string;
generationDurationMs?: number;
```

---

### 3.1.4 إضافة جودة البيانات

إضافة داخل التقرير:

```ts
dataQuality: {
  overall: 'real' | 'mixed' | 'estimated' | 'incomplete';
  sources: {
    sales: 'real';
    products: 'real';
    customers: 'real';
    marketing: 'not_connected';
    inventoryAccuracy: 'estimated';
  };
  notes: string[];
}
```

الهدف:

- عدم خلط البيانات الحقيقية بالتقديرية.
- تمكين الفرونت من عرض Badge واضح.

---

### 3.1.5 منع بيانات Placeholder من الظهور كحقيقة

المطلوب:

- أي دالة ترجع بيانات ثابتة يجب تعديلها.
- إذا لا توجد بيانات فعلية يرجع الباك إند:

```ts
{
  available: false,
  reason: 'tracking_not_connected'
}
```

بدل أرقام وهمية.

---

### 3.1.6 تحسين reportId

المطلوب:

- إضافة Counter أو استخدام رقم تسلسلي.
- شكل مقترح:

```txt
REP-2026-05-000001
```

مع unique index.

---

### 3.1.7 حفظ ملفات التصدير داخل التقرير

إضافة:

```ts
exports: [
  {
    format: 'pdf' | 'xlsx' | 'csv' | 'json';
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    generatedAt: Date;
    generatedBy: ObjectId;
  }
]
```

---

### 3.1.8 إضافة Audit Log للتقارير

عند كل عملية:

- توليد.
- تصدير.
- حذف.
- أرشفة.
- تشغيل يدوي.
- جدولة.

يتم تسجيل Event.

مثال:

```ts
{
  action: 'report.exported',
  reportId,
  userId,
  format,
  filters,
  createdAt,
  ip,
  userAgent
}
```

---

## 3.2 مهام الفرونت إند

### 3.2.1 تطوير Reports Management Page

المطلوب:

- عرض التقارير ككروت أو جدول احترافي.
- دعم الفلاتر:
  - النوع.
  - الحالة.
  - الفترة.
  - المستخدم.
  - جودة البيانات.
- دعم البحث.
- دعم الترتيب.

---

### 3.2.2 إنشاء Report Details Page

المسار:

```txt
/analytics/reports/:id
```

المحتوى:

- Header فيه اسم التقرير وحالته.
- Summary Cards.
- Data Quality Badge.
- Applied Filters.
- Charts.
- Tables.
- Insights.
- Recommendations.
- Export Actions.
- Activity / Audit Timeline.

---

### 3.2.3 إضافة مكونات جديدة

المقترح:

```txt
ReportCard.tsx
ReportStatusBadge.tsx
DataQualityBadge.tsx
ReportFilters.tsx
ReportExportActions.tsx
ReportPreview.tsx
ReportAuditTimeline.tsx
```

---

### 3.2.4 تحسين رسائل الخطأ

بدل:

```txt
Request failed with status code 500
```

تظهر رسائل مفهومة:

```txt
تعذر توليد التقرير، يرجى المحاولة مرة أخرى.
```

أو:

```txt
لا توجد بيانات كافية للفترة المحددة.
```

---

## 3.3 نتيجة المرحلة الأولى

بعد هذه المرحلة يصبح النظام قادرًا على:

- توليد تقارير موثوقة.
- عرض تفاصيل التقرير.
- تمييز البيانات الحقيقية من التقديرية.
- تصدير الملفات وربطها بالتقرير.
- تتبع من أنشأ أو صدّر التقرير.

---

# المرحلة الثانية: تفعيل جدولة التقارير والتصدير الاحترافي

## الهدف

تحويل التقارير من عملية يدوية فقط إلى نظام تشغيل تلقائي ومنظم.

---

## 4.1 مهام الباك إند

### 4.1.1 إنشاء ReportSchedules Module

المقترح:

```txt
analytics/reports/schedules/
├── report-schedules.controller.ts
├── report-schedules.service.ts
├── report-schedule-cron.service.ts
└── dto/
```

---

### 4.1.2 Endpoints المطلوبة

```txt
POST   /analytics/report-schedules
GET    /analytics/report-schedules
GET    /analytics/report-schedules/:id
PATCH  /analytics/report-schedules/:id
PATCH  /analytics/report-schedules/:id/toggle
DELETE /analytics/report-schedules/:id
POST   /analytics/report-schedules/:id/run-now
```

---

### 4.1.3 شكل الجدولة

```ts
{
  name: string;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  filters: object;
  recipients: string[];
  formats: ['pdf', 'xlsx'];
  isActive: boolean;
  nextRun: Date;
  lastRun?: Date;
  lastResult?: {
    status: 'success' | 'failed';
    reportId?: string;
    error?: string;
  };
  runCount: number;
  successCount: number;
  failureCount: number;
}
```

---

### 4.1.4 Cron Service

المطلوب:

- يعمل كل 5 أو 10 دقائق.
- يبحث عن الجداول النشطة.
- يشغل التقرير.
- يصدر الملف.
- يرسل إشعار أو بريد.
- يحدث `nextRun`.

---

### 4.1.5 دعم run-now

زر تشغيل الآن يجب أن:

- ينفذ نفس منطق الجدولة.
- لا يغيّر موعد التشغيل القادم إلا إذا تم تحديد ذلك.
- يسجل Audit Log.

---

### 4.1.6 تحسين Export Service

## PDF

يجب أن يحتوي:

- Cover Page.
- Executive Summary.
- KPIs.
- Charts.
- Tables.
- Insights.
- Recommendations.
- Appendix.
- Footer.
- Page numbers.
- RTL Arabic support.
- Branding.

## Excel

Sheets مقترحة:

```txt
Summary
KPIs
Sales
Products
Customers
Inventory
Financial
Raw Data
```

## CSV

يستخدم للبيانات الخام فقط.

## JSON

يستخدم للتكاملات أو API consumers.

---

## 4.2 مهام الفرونت إند

### 4.2.1 إنشاء Scheduled Reports Page

المسار المقترح:

```txt
/analytics/scheduled-reports
```

تعرض:

- اسم الجدولة.
- نوع التقرير.
- التكرار.
- المستلمين.
- آخر تشغيل.
- التشغيل القادم.
- نسبة النجاح.
- آخر خطأ.
- الحالة.
- أزرار:
  - تشغيل الآن.
  - تعديل.
  - إيقاف/تفعيل.
  - حذف.

---

### 4.2.2 تطوير ReportScheduleForm

الحقول:

- اسم الجدولة.
- نوع التقرير.
- الفترة.
- الفلاتر.
- التكرار.
- اليوم أو الوقت.
- المستلمين.
- الصيغ.
- تفعيل/إيقاف.

---

### 4.2.3 إضافة Export Center

المسار:

```txt
/analytics/export-center
```

يعرض:

- كل الملفات المصدرة.
- نوع التقرير.
- الصيغة.
- الحجم.
- تاريخ الإنشاء.
- أنشئ بواسطة.
- زر التحميل.
- حالة الملف.
- انتهاء صلاحية الرابط إن وجدت.

---

## 4.3 نتيجة المرحلة الثانية

بعد هذه المرحلة يصبح النظام:

- يدعم جدولة حقيقية.
- يشغل التقارير تلقائيًا.
- يصدر ملفات احترافية.
- يسمح بمتابعة نجاح وفشل كل جدول.
- يقدم تجربة إدارية واضحة للتقارير الدورية.

---

# المرحلة الثالثة: Report Builder و Insights متقدمة

## الهدف

نقل النظام إلى مستوى احترافي متقدم يسمح بإنشاء تقارير مخصصة وتحليلات قابلة لاتخاذ القرار.

---

## 5.1 مهام الباك إند

### 5.1.1 إنشاء Report Templates

أنواع مقترحة:

```txt
sales_report
orders_report
products_report
customers_report
inventory_report
financial_report
marketing_report
support_report
system_report
tejo_report
custom_report
```

كل قالب يحتوي:

```ts
{
  key: string;
  name: string;
  description: string;
  availableSections: string[];
  availableMetrics: string[];
  availableCharts: string[];
  availableFilters: string[];
  defaultSections: string[];
}
```

---

### 5.1.2 إنشاء Report Builder API

Endpoints مقترحة:

```txt
GET  /analytics/report-templates
GET  /analytics/report-templates/:key
POST /analytics/reports/custom/preview
POST /analytics/reports/custom/generate
```

---

### 5.1.3 دعم اختيار الأقسام

مثال:

```ts
sections: [
  'summary',
  'kpis',
  'salesTrend',
  'topProducts',
  'lowStock',
  'customerSegments',
  'recommendations'
]
```

---

### 5.1.4 دعم Insights

إضافة خدمة:

```txt
AnalyticsInsightsService
```

تولّد ملاحظات مثل:

- انخفاض المبيعات مقارنة بالفترة السابقة.
- المنتجات الأكثر نموًا.
- المنتجات الأقل أداءً.
- العملاء الأكثر قيمة.
- ارتفاع الطلبات الملغية.
- مخزون منخفض.
- أداء ضعيف لقناة معينة.

---

### 5.1.5 دعم Alerts

تنبيهات مقترحة:

```txt
sales_drop
orders_cancellation_spike
low_stock
out_of_stock
high_value_customer_inactive
api_errors_spike
slow_response_time
```

---

## 5.2 مهام الفرونت إند

### 5.2.1 إنشاء Report Builder Page

المسار:

```txt
/analytics/report-builder
```

الخطوات:

1. اختيار نوع التقرير.
2. اختيار الفترة والفلاتر.
3. اختيار الأقسام.
4. اختيار الرسوم البيانية.
5. معاينة التقرير.
6. حفظ أو توليد.
7. جدولة أو تصدير.

---

### 5.2.2 إنشاء Insights Panel

داخل مركز التقارير تظهر بطاقات مثل:

- مبيعاتك انخفضت 18% مقارنة بالأسبوع السابق.
- 5 منتجات قريبة من النفاد.
- أعلى 10 عملاء حققوا 42% من الإيرادات.
- معدل إلغاء الطلبات ارتفع هذا الشهر.

---

### 5.2.3 إنشاء Alerts Center

المسار المقترح:

```txt
/analytics/alerts
```

يعرض:

- نوع التنبيه.
- الخطورة.
- المصدر.
- تاريخ الاكتشاف.
- الحالة.
- الإجراء المقترح.

---

## 5.3 نتيجة المرحلة الثالثة

بعد هذه المرحلة يصبح النظام:

- يدعم تقارير مخصصة.
- يقدم رؤى ذكية.
- يدعم تنبيهات تشغيلية.
- يساعد الإدارة على اتخاذ قرارات وليس فقط رؤية أرقام.
- قابل للتوسع مستقبلًا مع AI Insights.

---

# 6. الهيكلة المقترحة بعد التطوير

## 6.1 Backend

```txt
src/modules/analytics/
├── dashboard/
├── metrics/
├── reports/
│   ├── controllers/
│   │   ├── reports.controller.ts
│   │   ├── report-schedules.controller.ts
│   │   └── report-templates.controller.ts
│   ├── services/
│   │   ├── report-generation.service.ts
│   │   ├── report-export.service.ts
│   │   ├── report-schedules.service.ts
│   │   ├── report-schedule-cron.service.ts
│   │   ├── report-templates.service.ts
│   │   └── report-id.service.ts
│   ├── processors/
│   │   └── report-jobs.processor.ts
│   ├── schemas/
│   │   ├── advanced-report.schema.ts
│   │   ├── report-schedule.schema.ts
│   │   ├── report-template.schema.ts
│   │   └── report-audit-log.schema.ts
│   └── dto/
├── snapshots/
├── insights/
├── data-quality/
└── analytics.module.ts
```

---

## 6.2 Frontend

```txt
src/features/analytics/
├── pages/
│   ├── AnalyticsCenterPage.tsx
│   ├── ReportDetailsPage.tsx
│   ├── ReportsManagementPage.tsx
│   ├── ScheduledReportsPage.tsx
│   ├── ExportCenterPage.tsx
│   ├── ReportBuilderPage.tsx
│   └── AnalyticsAlertsPage.tsx
├── components/
│   ├── report/
│   │   ├── ReportCard.tsx
│   │   ├── ReportStatusBadge.tsx
│   │   ├── DataQualityBadge.tsx
│   │   ├── ReportPreview.tsx
│   │   ├── ReportExportActions.tsx
│   │   ├── ReportAuditTimeline.tsx
│   │   └── ReportFilters.tsx
│   ├── schedule/
│   │   ├── ReportScheduleForm.tsx
│   │   ├── ScheduledReportCard.tsx
│   │   └── ScheduleStatusBadge.tsx
│   ├── builder/
│   │   ├── ReportTypeStep.tsx
│   │   ├── ReportFiltersStep.tsx
│   │   ├── ReportSectionsStep.tsx
│   │   ├── ReportPreviewStep.tsx
│   │   └── ReportBuilderSummary.tsx
│   └── insights/
│       ├── InsightsPanel.tsx
│       └── AlertCard.tsx
├── services/
│   ├── reportsApi.ts
│   ├── reportSchedulesApi.ts
│   ├── reportTemplatesApi.ts
│   └── analyticsAlertsApi.ts
└── types/
    ├── reports.types.ts
    ├── schedules.types.ts
    └── analytics.types.ts
```

---

# 7. مفاتيح الترجمة المقترحة

> ملاحظة: المفاتيح التالية مقترحة لاستخدامها في ملفات الترجمة مثل `ar.json` و `en.json`.  
> يمكن تعديل البادئة حسب نظام الترجمة الحالي، لكن الأفضل اعتماد namespace واضح باسم `analytics`.

---

## 7.1 مفاتيح عامة

```json
{
  "analytics.title": "التقارير والتحليلات",
  "analytics.subtitle": "تابع أداء المنصة واتخذ قرارات مبنية على البيانات",
  "analytics.center": "مركز التقارير والتحليلات",
  "analytics.overview": "نظرة عامة",
  "analytics.dashboard": "لوحة التحليلات",
  "analytics.reports": "التقارير",
  "analytics.savedReports": "التقارير المحفوظة",
  "analytics.scheduledReports": "التقارير المجدولة",
  "analytics.exportCenter": "مركز التصدير",
  "analytics.reportBuilder": "منشئ التقارير",
  "analytics.alerts": "التنبيهات",
  "analytics.insights": "الرؤى",
  "analytics.refresh": "تحديث",
  "analytics.loading": "جاري تحميل البيانات...",
  "analytics.noData": "لا توجد بيانات متاحة",
  "analytics.noResults": "لا توجد نتائج مطابقة",
  "analytics.tryAgain": "حاول مرة أخرى"
}
```

---

## 7.2 أنواع التقارير

```json
{
  "analytics.reportTypes.sales": "تقرير المبيعات",
  "analytics.reportTypes.orders": "تقرير الطلبات",
  "analytics.reportTypes.products": "تقرير المنتجات",
  "analytics.reportTypes.customers": "تقرير العملاء",
  "analytics.reportTypes.inventory": "تقرير المخزون",
  "analytics.reportTypes.financial": "التقرير المالي",
  "analytics.reportTypes.marketing": "تقرير التسويق",
  "analytics.reportTypes.support": "تقرير الدعم",
  "analytics.reportTypes.system": "تقرير النظام",
  "analytics.reportTypes.tejo": "تقرير تيجو",
  "analytics.reportTypes.custom": "تقرير مخصص"
}
```

---

## 7.3 حالات التقرير

```json
{
  "analytics.reportStatus.pending": "قيد الانتظار",
  "analytics.reportStatus.processing": "قيد المعالجة",
  "analytics.reportStatus.completed": "مكتمل",
  "analytics.reportStatus.failed": "فشل",
  "analytics.reportStatus.archived": "مؤرشف"
}
```

---

## 7.4 جودة البيانات

```json
{
  "analytics.dataQuality.title": "جودة البيانات",
  "analytics.dataQuality.real": "بيانات حقيقية",
  "analytics.dataQuality.mixed": "بيانات مختلطة",
  "analytics.dataQuality.estimated": "بيانات تقديرية",
  "analytics.dataQuality.incomplete": "بيانات غير مكتملة",
  "analytics.dataQuality.notConnected": "غير متصل",
  "analytics.dataQuality.placeholderDisabled": "غير متاح حاليًا",
  "analytics.dataQuality.note": "بعض المؤشرات قد تكون تقديرية أو غير متاحة حسب مصادر البيانات المتصلة"
}
```

---

## 7.5 أزرار وإجراءات التقارير

```json
{
  "analytics.actions.view": "عرض",
  "analytics.actions.generate": "توليد تقرير",
  "analytics.actions.regenerate": "إعادة التوليد",
  "analytics.actions.export": "تصدير",
  "analytics.actions.download": "تحميل",
  "analytics.actions.downloadPdf": "تحميل PDF",
  "analytics.actions.downloadExcel": "تحميل Excel",
  "analytics.actions.downloadCsv": "تحميل CSV",
  "analytics.actions.downloadJson": "تحميل JSON",
  "analytics.actions.schedule": "جدولة",
  "analytics.actions.runNow": "تشغيل الآن",
  "analytics.actions.duplicate": "نسخ",
  "analytics.actions.archive": "أرشفة",
  "analytics.actions.delete": "حذف",
  "analytics.actions.cancel": "إلغاء",
  "analytics.actions.save": "حفظ",
  "analytics.actions.update": "تحديث",
  "analytics.actions.enable": "تفعيل",
  "analytics.actions.disable": "إيقاف",
  "analytics.actions.backToReports": "العودة إلى التقارير"
}
```

---

## 7.6 فلاتر التقارير

```json
{
  "analytics.filters.title": "الفلاتر",
  "analytics.filters.dateRange": "الفترة الزمنية",
  "analytics.filters.period": "الفترة",
  "analytics.filters.status": "الحالة",
  "analytics.filters.reportType": "نوع التقرير",
  "analytics.filters.category": "التصنيف",
  "analytics.filters.brand": "البراند",
  "analytics.filters.city": "المدينة",
  "analytics.filters.paymentMethod": "طريقة الدفع",
  "analytics.filters.customerType": "نوع العميل",
  "analytics.filters.orderSource": "مصدر الطلب",
  "analytics.filters.minAmount": "أقل مبلغ",
  "analytics.filters.maxAmount": "أعلى مبلغ",
  "analytics.filters.groupBy": "تجميع حسب",
  "analytics.filters.compareWithPrevious": "مقارنة بالفترة السابقة",
  "analytics.filters.apply": "تطبيق الفلاتر",
  "analytics.filters.reset": "إعادة ضبط"
}
```

---

## 7.7 الفترات الزمنية

```json
{
  "analytics.periods.today": "اليوم",
  "analytics.periods.yesterday": "أمس",
  "analytics.periods.last7Days": "آخر 7 أيام",
  "analytics.periods.last30Days": "آخر 30 يومًا",
  "analytics.periods.thisMonth": "هذا الشهر",
  "analytics.periods.lastMonth": "الشهر السابق",
  "analytics.periods.thisQuarter": "هذا الربع",
  "analytics.periods.thisYear": "هذه السنة",
  "analytics.periods.custom": "فترة مخصصة"
}
```

---

## 7.8 التجميع

```json
{
  "analytics.groupBy.day": "اليوم",
  "analytics.groupBy.week": "الأسبوع",
  "analytics.groupBy.month": "الشهر",
  "analytics.groupBy.quarter": "الربع",
  "analytics.groupBy.year": "السنة"
}
```

---

## 7.9 صفحة تفاصيل التقرير

```json
{
  "analytics.reportDetails.title": "تفاصيل التقرير",
  "analytics.reportDetails.summary": "الملخص",
  "analytics.reportDetails.kpis": "مؤشرات الأداء",
  "analytics.reportDetails.charts": "الرسوم البيانية",
  "analytics.reportDetails.tables": "الجداول",
  "analytics.reportDetails.insights": "الرؤى",
  "analytics.reportDetails.recommendations": "التوصيات",
  "analytics.reportDetails.appliedFilters": "الفلاتر المستخدمة",
  "analytics.reportDetails.exports": "ملفات التصدير",
  "analytics.reportDetails.auditTimeline": "سجل النشاط",
  "analytics.reportDetails.createdBy": "أنشئ بواسطة",
  "analytics.reportDetails.createdAt": "تاريخ الإنشاء",
  "analytics.reportDetails.generatedAt": "تاريخ التوليد",
  "analytics.reportDetails.duration": "مدة التوليد",
  "analytics.reportDetails.failureReason": "سبب الفشل"
}
```

---

## 7.10 الجدولة

```json
{
  "analytics.schedule.title": "جدولة التقرير",
  "analytics.schedule.create": "إنشاء جدولة",
  "analytics.schedule.edit": "تعديل الجدولة",
  "analytics.schedule.name": "اسم الجدولة",
  "analytics.schedule.frequency": "التكرار",
  "analytics.schedule.daily": "يومي",
  "analytics.schedule.weekly": "أسبوعي",
  "analytics.schedule.monthly": "شهري",
  "analytics.schedule.quarterly": "ربع سنوي",
  "analytics.schedule.recipients": "المستلمون",
  "analytics.schedule.formats": "صيغ التصدير",
  "analytics.schedule.nextRun": "التشغيل القادم",
  "analytics.schedule.lastRun": "آخر تشغيل",
  "analytics.schedule.lastResult": "آخر نتيجة",
  "analytics.schedule.successRate": "نسبة النجاح",
  "analytics.schedule.runCount": "عدد مرات التشغيل",
  "analytics.schedule.active": "نشط",
  "analytics.schedule.inactive": "متوقف",
  "analytics.schedule.lastError": "آخر خطأ"
}
```

---

## 7.11 مركز التصدير

```json
{
  "analytics.export.title": "مركز التصدير",
  "analytics.export.fileName": "اسم الملف",
  "analytics.export.format": "الصيغة",
  "analytics.export.fileSize": "حجم الملف",
  "analytics.export.generatedBy": "تم التصدير بواسطة",
  "analytics.export.generatedAt": "تاريخ التصدير",
  "analytics.export.expiresAt": "ينتهي في",
  "analytics.export.available": "متاح",
  "analytics.export.expired": "منتهي",
  "analytics.export.failed": "فشل التصدير"
}
```

---

## 7.12 منشئ التقارير

```json
{
  "analytics.builder.title": "منشئ التقارير",
  "analytics.builder.step.type": "نوع التقرير",
  "analytics.builder.step.filters": "الفلاتر",
  "analytics.builder.step.sections": "الأقسام",
  "analytics.builder.step.preview": "المعاينة",
  "analytics.builder.step.confirm": "التأكيد",
  "analytics.builder.chooseReportType": "اختر نوع التقرير",
  "analytics.builder.chooseFilters": "حدد الفلاتر",
  "analytics.builder.chooseSections": "اختر أقسام التقرير",
  "analytics.builder.previewReport": "معاينة التقرير",
  "analytics.builder.saveTemplate": "حفظ كقالب",
  "analytics.builder.generateReport": "توليد التقرير"
}
```

---

## 7.13 الرؤى والتنبيهات

```json
{
  "analytics.insights.title": "الرؤى الذكية",
  "analytics.insights.salesDrop": "انخفاض في المبيعات",
  "analytics.insights.salesGrowth": "نمو في المبيعات",
  "analytics.insights.lowStock": "مخزون منخفض",
  "analytics.insights.topCustomers": "أفضل العملاء",
  "analytics.insights.weakProducts": "منتجات ضعيفة الأداء",
  "analytics.insights.cancellationSpike": "ارتفاع في الإلغاءات",

  "analytics.alerts.title": "تنبيهات التحليلات",
  "analytics.alerts.severity.low": "منخفض",
  "analytics.alerts.severity.medium": "متوسط",
  "analytics.alerts.severity.high": "مرتفع",
  "analytics.alerts.severity.critical": "حرج",
  "analytics.alerts.status.open": "مفتوح",
  "analytics.alerts.status.resolved": "تم الحل",
  "analytics.alerts.status.ignored": "تم التجاهل"
}
```

---

## 7.14 رسائل النجاح والخطأ

```json
{
  "analytics.messages.reportGenerated": "تم توليد التقرير بنجاح",
  "analytics.messages.reportGenerationFailed": "تعذر توليد التقرير",
  "analytics.messages.reportArchived": "تمت أرشفة التقرير",
  "analytics.messages.reportDeleted": "تم حذف التقرير",
  "analytics.messages.exportStarted": "بدأت عملية التصدير",
  "analytics.messages.exportCompleted": "تم التصدير بنجاح",
  "analytics.messages.exportFailed": "فشل التصدير",
  "analytics.messages.scheduleCreated": "تم إنشاء الجدولة بنجاح",
  "analytics.messages.scheduleUpdated": "تم تحديث الجدولة",
  "analytics.messages.scheduleDeleted": "تم حذف الجدولة",
  "analytics.messages.scheduleEnabled": "تم تفعيل الجدولة",
  "analytics.messages.scheduleDisabled": "تم إيقاف الجدولة",
  "analytics.messages.notEnoughData": "لا توجد بيانات كافية للفترة المحددة",
  "analytics.messages.trackingNotConnected": "مصدر البيانات غير متصل حاليًا",
  "analytics.messages.permissionDenied": "ليس لديك صلاحية للوصول إلى هذا التقرير"
}
```

---

# 8. مفاتيح الترجمة الإنجليزية المقترحة

يمكن إنشاء `en.json` بنفس المفاتيح، مثال مختصر:

```json
{
  "analytics.title": "Reports & Analytics",
  "analytics.subtitle": "Track platform performance and make data-driven decisions",
  "analytics.center": "Reports & Analytics Center",
  "analytics.overview": "Overview",
  "analytics.dashboard": "Analytics Dashboard",
  "analytics.reports": "Reports",
  "analytics.savedReports": "Saved Reports",
  "analytics.scheduledReports": "Scheduled Reports",
  "analytics.exportCenter": "Export Center",
  "analytics.reportBuilder": "Report Builder",
  "analytics.alerts": "Alerts",
  "analytics.insights": "Insights",

  "analytics.reportStatus.pending": "Pending",
  "analytics.reportStatus.processing": "Processing",
  "analytics.reportStatus.completed": "Completed",
  "analytics.reportStatus.failed": "Failed",
  "analytics.reportStatus.archived": "Archived",

  "analytics.dataQuality.real": "Real data",
  "analytics.dataQuality.mixed": "Mixed data",
  "analytics.dataQuality.estimated": "Estimated data",
  "analytics.dataQuality.incomplete": "Incomplete data",
  "analytics.dataQuality.notConnected": "Not connected",

  "analytics.actions.view": "View",
  "analytics.actions.generate": "Generate Report",
  "analytics.actions.export": "Export",
  "analytics.actions.download": "Download",
  "analytics.actions.schedule": "Schedule",
  "analytics.actions.runNow": "Run Now",
  "analytics.actions.archive": "Archive",
  "analytics.actions.delete": "Delete",

  "analytics.messages.reportGenerated": "Report generated successfully",
  "analytics.messages.reportGenerationFailed": "Failed to generate report",
  "analytics.messages.exportCompleted": "Export completed successfully",
  "analytics.messages.exportFailed": "Export failed",
  "analytics.messages.notEnoughData": "Not enough data for the selected period",
  "analytics.messages.trackingNotConnected": "The data source is not connected yet",
  "analytics.messages.permissionDenied": "You do not have permission to access this report"
}
```

---

# 9. ترتيب التنفيذ المقترح

## Sprint 1

- إصلاح createdBy.
- توحيد ReportGenerationService.
- إضافة status workflow.
- إضافة dataQuality.
- تعديل ReportCard.
- إنشاء ReportDetailsPage.

## Sprint 2

- تحسين ExportService.
- حفظ export files داخل التقرير.
- إضافة Audit Log.
- تحسين PDF وExcel.
- إنشاء ExportCenterPage.

## Sprint 3

- تنفيذ ReportSchedulesService.
- تنفيذ ReportScheduleCronService.
- ربط ReportScheduleForm.
- إنشاء ScheduledReportsPage.
- دعم run-now.

## Sprint 4

- إنشاء Report Templates.
- إنشاء Report Builder.
- إنشاء Insights Service.
- إنشاء Alerts Center.

---

# 10. ملاحظات مهمة للمطور

- لا تحذف النظام الحالي.
- لا تبنِ من الصفر.
- طوّر فوق البنية الموجودة.
- أي بيانات Placeholder يجب إخفاؤها أو تمييزها كتقديرية.
- لا تعرض أرقام مالية أو تسويقية بدون مصدر حقيقي.
- التصدير يجب أن يكون مبنيًا على التقرير المحفوظ وليس على طلب جديد مختلف.
- كل عملية حساسة يجب أن تسجل في Audit Log.
- التقارير الكبيرة يجب أن تنتقل لاحقًا إلى Queue لتجنب timeout.
- مفاتيح الترجمة يجب اعتمادها قبل بناء الواجهة الجديدة لتجنب النصوص الثابتة.
