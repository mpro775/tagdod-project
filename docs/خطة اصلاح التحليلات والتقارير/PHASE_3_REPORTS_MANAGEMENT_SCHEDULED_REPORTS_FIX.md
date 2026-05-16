# المرحلة الثالثة — إصلاح إدارة التقارير والتقارير المجدولة

## اسم المرحلة

**Phase 3 — Reports Management & Scheduled Reports Full Fix**

---

## الهدف العام

تهدف هذه المرحلة إلى إصلاح وتطوير قسم:

- إدارة التقارير.
- جدول التقارير.
- تفاصيل التقرير.
- إنشاء تقرير جديد.
- تحميل التقرير.
- أرشفة التقرير.
- حذف التقرير.
- التقارير المجدولة.
- تشغيل التقرير المجدول يدويًا.
- إيقاف واستئناف الجدولة.
- إحصائيات الجدولة.
- ربط التقارير المجدولة بنتائج حقيقية قابلة للعرض.

> هذه المرحلة تعتمد إلزاميًا على مخرجات المرحلة الأولى:
>
> - `unwrapApiData`
> - `asArray`
> - `toNumber`
> - `mapAdvancedReport`
> - `mapReportSchedule`
> - `mapPaginatedResponse`
> - توحيد `id/reportId`
> - توحيد شكل `meta`
>
> وتعتمد بصريًا على مخرجات المرحلة الثانية:
>
> - Empty State
> - Skeletons
> - Error Boundaries
> - Formatters
> - RTL
> - Responsive layout

---

## القاعدة الصارمة لهذه المرحلة

ممنوع أن تقرأ صفحة التقارير أو الجدولة الريسبونس الخام مباشرة.

المسار الإلزامي:

```txt
Backend Response
  → analyticsApi / reportBuilderApi
  → unwrapApiData()
  → mapper / normalizer
  → typed model
  → page/component
```

---

# 1. نطاق المرحلة

## داخل النطاق

تشمل هذه المرحلة:

```txt
Reports Management
Scheduled Reports
Reports Table
Reports Cards
Report Details
Report Create Dialog
Report Download
Report Archive
Report Delete
Report Filters
Report Search
Report Pagination
Schedule Create
Schedule Update
Schedule Pause/Resume
Schedule Run Now
Schedule Delete
Schedule Stats
Schedule Last Result Display
```

## خارج النطاق

لا تشمل هذه المرحلة:

```txt
Export Center
General Data Export Center
Fixing file storage deeply
Rebuilding analytics calculations
Building new BI engine
Changing database architecture
```

> ملاحظة: إصلاح حفظ الصادرات داخل `exports[]` سيكون في المرحلة الرابعة، لكن هذه المرحلة يجب أن تجعل تحميل التقرير الحالي يعمل قدر الإمكان.

---

# 2. المشكلة الحالية المختصرة

قسم التقارير لا يظهر البيانات رغم أن الباك يرجعها لأن الريسبونس يأتي بهذا الشكل:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "REP-2026-05-000001",
        "title": "تقرير جديد"
      }
    ],
    "meta": {
      "total": 3,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

بينما الفرونت غالبًا يتوقع:

```ts
response.data.data = AdvancedReport[]
response.data.meta = meta
```

لكن الحقيقة:

```ts
response.data.data.data = AdvancedReport[]
response.data.data.meta = meta
```

كذلك الباك يرجع:

```ts
id
```

بينما الفرونت يستخدم:

```ts
reportId
```

وهذا يكسر أزرار العرض والتحميل والأرشفة والحذف.

---

# 3. الملفات المتوقع تعديلها

قد تختلف الأسماء حسب المشروع، لكن يجب فحص وتعديل ما يعادل:

```txt
admin-dashboard/src/features/analytics/api/analyticsApi.ts
admin-dashboard/src/features/analytics/api/reportBuilderApi.ts

admin-dashboard/src/features/analytics/hooks/useReports.ts
admin-dashboard/src/features/analytics/hooks/useReportSchedules.ts
admin-dashboard/src/features/analytics/hooks/useAnalytics.ts

admin-dashboard/src/features/analytics/pages/ReportsManagementPage.tsx
admin-dashboard/src/features/analytics/pages/ReportSchedulesPage.tsx
admin-dashboard/src/features/analytics/pages/ReportDetailsPage.tsx

admin-dashboard/src/features/analytics/components/ReportCard.tsx
admin-dashboard/src/features/analytics/components/ReportsTable.tsx
admin-dashboard/src/features/analytics/components/ReportFilters.tsx
admin-dashboard/src/features/analytics/components/ReportCreateDialog.tsx
admin-dashboard/src/features/analytics/components/ReportScheduleForm.tsx
admin-dashboard/src/features/analytics/components/ReportScheduleTable.tsx
admin-dashboard/src/features/analytics/components/ReportScheduleCard.tsx
admin-dashboard/src/features/analytics/components/ReportScheduleStats.tsx

admin-dashboard/src/features/analytics/types/reports.ts
admin-dashboard/src/features/analytics/types/schedules.ts
admin-dashboard/src/features/analytics/utils/reportMappers.ts
admin-dashboard/src/features/analytics/utils/scheduleMappers.ts
admin-dashboard/src/features/analytics/utils/formatters.ts
admin-dashboard/src/features/analytics/utils/translations.ts
```

وفي الباك إند افحص ما يعادل:

```txt
backend/src/analytics/
backend/src/analytics/controllers/
backend/src/analytics/services/
backend/src/analytics/schemas/
backend/src/analytics/dto/

AdvancedReportsController
AdvancedAnalyticsController
ReportSchedulesController
ReportSchedulesService
ReportGenerationService
AdvancedAnalyticsService
```

---

# 4. إصلاح API Layer للتقارير

## 4.1 إنشاء helper موحد للـ paginated response

إذا لم يكن موجودًا من المرحلة الأولى، أضفه:

```ts
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export const normalizePaginatedResponse = <T>(
  payload: any,
  mapper: (item: any) => T,
  fallback?: Partial<PaginationMeta>
): PaginatedResponse<T> => {
  const unwrapped = payload?.data?.data ?? payload?.data ?? payload;

  const rowsRaw = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(unwrapped?.data)
      ? unwrapped.data
      : [];

  const metaRaw = !Array.isArray(unwrapped)
    ? unwrapped?.meta ?? {}
    : {};

  const rows = rowsRaw.map(mapper);

  return {
    data: rows,
    meta: {
      total: Number(metaRaw.total ?? fallback?.total ?? rows.length),
      page: Number(metaRaw.page ?? fallback?.page ?? 1),
      limit: Number(metaRaw.limit ?? fallback?.limit ?? rows.length),
      totalPages: Number(metaRaw.totalPages ?? fallback?.totalPages ?? 1),
    },
  };
};
```

---

## 4.2 إصلاح `listAdvancedReports`

يجب أن تكون الدالة آمنة ضد:

```txt
response.data.data.data
response.data.data
response.data
```

### الشكل المطلوب

```ts
listAdvancedReports: async (
  params: ListReportsParams = {}
): Promise<PaginatedResponse<AdvancedReport>> => {
  const response = await apiClient.get('/analytics/advanced/reports', {
    params,
  });

  return normalizePaginatedResponse(
    response,
    mapAdvancedReport,
    {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    }
  );
};
```

أو إذا لم تستخدم `normalizePaginatedResponse`:

```ts
const payload = response.data?.data ?? response.data;
const rows = Array.isArray(payload) ? payload : payload?.data ?? [];
const meta = payload?.meta ?? {
  total: rows.length,
  page: params.page ?? 1,
  limit: params.limit ?? rows.length,
  totalPages: 1,
};

return {
  data: rows.map(mapAdvancedReport),
  meta,
};
```

---

## 4.3 إصلاح `mapAdvancedReport`

يجب أن يحل مشكلة `id/reportId`.

```ts
export const mapAdvancedReport = (report: any): AdvancedReport => {
  const reportId = report?.reportId ?? report?.id ?? report?._id ?? '';

  return {
    id: report?.id ?? reportId,
    _id: report?._id,
    reportId,

    title: report?.title ?? 'تقرير بدون عنوان',
    titleEn: report?.titleEn ?? report?.title ?? 'Untitled Report',

    category: report?.category ?? 'custom',
    type: report?.type ?? report?.category ?? 'custom',
    priority: report?.priority ?? 'medium',
    status: report?.status ?? 'pending',

    generatedAt: report?.generatedAt ?? report?.createdAt ?? null,
    createdAt: report?.createdAt ?? report?.generatedAt ?? null,
    updatedAt: report?.updatedAt ?? null,

    summary: {
      totalRecords: Number(report?.summary?.totalRecords ?? 0),
      totalValue: Number(report?.summary?.totalValue ?? 0),
      currency: report?.summary?.currency ?? 'YER',
      growth: Number(report?.summary?.growth ?? 0),
    },

    createdBy: report?.createdBy ?? null,
    creatorName: report?.creatorName ?? null,

    exports: Array.isArray(report?.exports) ? report.exports : [],
    isArchived: Boolean(report?.isArchived),
    archivedAt: report?.archivedAt ?? null,
  };
};
```

---

## 4.4 إصلاح دوال التقرير الفردي

يجب أن تكون الدوال التالية تستخدم `reportId` الموحد:

```txt
getAdvancedReport(reportId)
exportReport(reportId, payload)
archiveReport(reportId)
deleteReport(reportId)
downloadReport(reportId)
```

قاعدة:

```ts
const id = report.reportId ?? report.id;
```

ممنوع تمرير `undefined`.

---

# 5. إصلاح صفحة إدارة التقارير

## 5.1 الهدف

صفحة إدارة التقارير يجب أن تعرض التقارير القادمة من API في جدول أو Cards بشكل صحيح.

## 5.2 عناصر الصفحة المطلوبة

```txt
Reports Management Page
├── Header
│   ├── Title
│   ├── Subtitle
│   ├── Create Report Button
│   └── Refresh Button
│
├── Filters Bar
│   ├── Search
│   ├── Category Filter
│   ├── Status Filter
│   ├── Priority Filter
│   └── Date Range
│
├── Reports Summary Cards
│   ├── Total Reports
│   ├── Completed Reports
│   ├── Pending Reports
│   └── Failed Reports
│
├── Reports Table
│   ├── Title
│   ├── Category
│   ├── Status
│   ├── Priority
│   ├── Generated At
│   ├── Total Records
│   ├── Total Value
│   └── Actions
│
└── Pagination
```

---

## 5.3 إصلاح قراءة البيانات في الصفحة

يجب أن يكون:

```ts
const reports = reportsQuery.data?.data ?? [];
const meta = reportsQuery.data?.meta;
```

وليس:

```ts
const reports = reportsData?.data?.data ?? [];
```

لأن API layer يجب أن يرجع الشكل النهائي.

---

## 5.4 Empty State

إذا لا توجد تقارير:

```tsx
<EmptyAnalyticsState
  title="لا توجد تقارير"
  description="لم يتم إنشاء أي تقرير بعد. يمكنك إنشاء تقرير جديد من الزر بالأعلى."
  actionLabel="إنشاء تقرير"
  onAction={openCreateDialog}
/>
```

---

## 5.5 Loading State

أثناء التحميل:

```tsx
<ReportsTableSkeleton />
```

أو:

```tsx
<AnalyticsSkeleton />
```

---

## 5.6 Error State

إذا فشل تحميل التقارير:

```tsx
<ErrorState
  title="تعذر تحميل التقارير"
  description="حدث خطأ أثناء جلب قائمة التقارير."
  actionLabel="إعادة المحاولة"
  onAction={() => reportsQuery.refetch()}
/>
```

---

# 6. إصلاح جدول التقارير

## 6.1 الأعمدة المطلوبة

```txt
العنوان
التصنيف
الحالة
الأولوية
تاريخ الإنشاء/التوليد
عدد السجلات
القيمة
العملة
الإجراءات
```

## 6.2 أزرار الإجراءات

لكل تقرير:

```txt
View Details
Download / Export
Archive
Delete
```

## 6.3 قواعد الأزرار

- إذا `status !== completed` لا يظهر زر download أو يكون disabled.
- إذا `reportId` غير موجود لا تنفذ أي action.
- عند الضغط على delete يجب عرض confirmation dialog.
- عند archive يجب عرض confirmation أو toast واضح.
- بعد أي عملية يجب عمل invalidate للـ query.

---

## 6.4 مثال آمن

```tsx
const reportKey = report.reportId ?? report.id;

<Button
  disabled={!reportKey}
  onClick={() => onView(reportKey)}
>
  عرض
</Button>
```

---

# 7. إصلاح تفاصيل التقرير

## 7.1 المطلوب

صفحة أو Dialog تفاصيل التقرير يجب أن تعرض:

```txt
Report ID
Title
Category
Status
Priority
Generated At
Created By
Summary
Exports if available
Actions
```

## 7.2 جلب التفاصيل

```ts
const report = await analyticsApi.getAdvancedReport(reportId);
```

ثم:

```ts
return mapAdvancedReport(unwrapApiData(response));
```

## 7.3 إذا التقرير غير موجود

اعرض:

```txt
تعذر العثور على التقرير
```

مع زر العودة.

---

# 8. إصلاح إنشاء تقرير جديد

## 8.1 النموذج المطلوب

إنشاء التقرير يجب أن يحتوي:

```txt
Title
Category
Priority
Date Range
Format preference optional
Filters optional
Description optional
```

## 8.2 التصنيفات

يجب أن تتوافق مع الباك:

```ts
export enum ReportCategory {
  SALES = 'sales',
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  INVENTORY = 'inventory',
  FINANCIAL = 'financial',
  MARKETING = 'marketing',
  SERVICES = 'services',
  SUPPORT = 'support',
  CUSTOM = 'custom',
}
```

إذا الباك لا يقبل بعضها، يجب تعديل enum حسب الحقيقة.

---

## 8.3 الإرسال

```ts
await createReportMutation.mutateAsync({
  title,
  titleEn,
  category,
  priority,
  startDate,
  endDate,
  filters,
});
```

## 8.4 بعد النجاح

- أغلق النافذة.
- أظهر toast:
  - "تم إنشاء التقرير بنجاح"
- اعمل invalidate لقائمة التقارير.
- إذا الباك يرجع التقرير الجديد، يمكن فتح تفاصيله.

---

# 9. إصلاح الأرشفة والحذف

## 9.1 Archive

```ts
archiveReport(reportId)
```

بعد النجاح:

```ts
queryClient.invalidateQueries(['advancedReports']);
```

## 9.2 Delete

```ts
deleteReport(reportId)
```

بعد النجاح:

```ts
queryClient.invalidateQueries(['advancedReports']);
```

## 9.3 قواعد مهمة

- لا تحذف مباشرة بدون confirmation.
- إذا التقرير مؤرشف، يمكن عرض badge.
- إذا الحذف غير مدعوم في الباك، أخفِ الزر أو اجعله disabled مع tooltip.

---

# 10. إصلاح التحميل / Download

## 10.1 المشكلة الحالية

بعض دوال التصدير قد ترجع:

```ts
string
```

وبعضها ترجع:

```ts
{
  fileUrl
}
```

وبعضها:

```ts
{
  success: true,
  data: {
    fileUrl
  }
}
```

## 10.2 الحل داخل API layer

```ts
const normalizeFileResult = (payload: any) => {
  const data = payload?.data?.data ?? payload?.data ?? payload;

  if (typeof data === 'string') {
    return {
      fileUrl: data,
      fileName: data.split('/').pop() ?? 'report',
      format: undefined,
      fileSize: undefined,
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    fileUrl: data?.fileUrl ?? data?.url ?? '',
    fileName: data?.fileName ?? data?.filename ?? 'report',
    format: data?.format,
    fileSize: data?.fileSize ?? data?.size,
    exportedAt: data?.exportedAt ?? data?.generatedAt ?? new Date().toISOString(),
  };
};
```

## 10.3 واجهة التحميل

عند النجاح:

```ts
if (result.fileUrl) {
  window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
}
```

إذا لا يوجد fileUrl:

```txt
تم إنشاء التقرير لكن لم يتم العثور على رابط الملف
```

---

# 11. إصلاح التقارير المجدولة

## 11.1 المشكلة الحالية

الفورم يستخدم endpoint قديم:

```txt
POST /analytics/reports/schedule
```

بينما النظام الأحدث يستخدم:

```txt
/analytics/report-schedules
```

يجب نقل الصفحة والفورم إلى النظام الجديد.

---

## 11.2 endpoints المطلوبة

يجب استخدام:

```txt
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

إذا اختلفت أسماء endpoints في المشروع، التزم بالموجود لكن وحد API layer.

---

# 12. إصلاح route order في الباك

## المشكلة

إذا كان Controller يحتوي:

```ts
@Get(':id')
findOne()
```

قبل:

```ts
@Get('stats')
getStats()
```

فإن:

```txt
/report-schedules/stats
```

قد يتم تفسيرها كـ:

```txt
id = stats
```

## الحل

رتّب الراوتات هكذا:

```ts
@Get('stats')
getStats() {}

@Get(':id')
findOne() {}
```

يجب أن تكون كل routes الثابتة قبل dynamic routes.

---

# 13. توحيد ReportType للجدولة

## 13.1 القيم التي يجب اعتمادها

استخدم القيم المقبولة من الباك.

مثال:

```ts
export enum ScheduledReportType {
  DAILY_SUMMARY = 'daily_summary',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  REVENUE_REPORT = 'revenue_report',
  USER_ACTIVITY = 'user_activity',
  PRODUCT_PERFORMANCE = 'product_performance',
  SERVICE_ANALYTICS = 'service_analytics',
  SUPPORT_METRICS = 'support_metrics',
  CUSTOM_REPORT = 'custom_report',
}
```

## 13.2 ممنوع

إرسال قيم لا يقبلها الباك مثل:

```txt
daily_report
quarterly_report
yearly_report
```

إلا إذا تم دعمها صراحة في الباك.

---

# 14. توحيد Frequency

اعتمد enum واضح:

```ts
export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}
```

إذا الباك يدعم values مختلفة، عدّل الفرونت ليطابق الباك.

---

# 15. Mapper التقارير المجدولة

```ts
export const mapReportSchedule = (item: any): ReportSchedule => {
  const id = item?._id ?? item?.id ?? '';

  return {
    id,
    _id: item?._id ?? id,

    name: item?.name ?? item?.title ?? 'جدولة بدون اسم',
    title: item?.title ?? item?.name ?? 'جدولة بدون عنوان',

    reportType: item?.reportType ?? item?.type ?? 'custom_report',
    frequency: item?.frequency ?? 'monthly',

    status: item?.status ?? (item?.isActive === false ? 'paused' : 'active'),
    isActive: item?.isActive ?? item?.status !== 'paused',

    recipients: Array.isArray(item?.recipients) ? item.recipients : [],

    nextRunAt: item?.nextRunAt ?? item?.nextRun ?? null,
    lastRunAt: item?.lastRunAt ?? item?.lastRun ?? null,

    lastResult: item?.lastResult ?? null,
    fileUrls: Array.isArray(item?.fileUrls) ? item.fileUrls : [],

    createdAt: item?.createdAt ?? null,
    updatedAt: item?.updatedAt ?? null,
  };
};
```

---

# 16. إصلاح API Layer للجدولة

## 16.1 listSchedules

```ts
listSchedules: async (params = {}): Promise<PaginatedResponse<ReportSchedule>> => {
  const response = await apiClient.get('/analytics/report-schedules', { params });

  return normalizePaginatedResponse(
    response,
    mapReportSchedule,
    {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
  );
};
```

## 16.2 createSchedule

```ts
createSchedule: async (payload: CreateReportScheduleDto) => {
  const response = await apiClient.post('/analytics/report-schedules', payload);
  return mapReportSchedule(unwrapApiData(response));
};
```

## 16.3 updateSchedule

```ts
updateSchedule: async (id: string, payload: UpdateReportScheduleDto) => {
  const response = await apiClient.patch(`/analytics/report-schedules/${id}`, payload);
  return mapReportSchedule(unwrapApiData(response));
};
```

## 16.4 runScheduleNow

```ts
runScheduleNow: async (id: string) => {
  const response = await apiClient.post(`/analytics/report-schedules/${id}/run`);
  return unwrapApiData(response);
};
```

## 16.5 pause/resume

```ts
pauseSchedule: async (id: string) => {
  const response = await apiClient.post(`/analytics/report-schedules/${id}/pause`);
  return mapReportSchedule(unwrapApiData(response));
};

resumeSchedule: async (id: string) => {
  const response = await apiClient.post(`/analytics/report-schedules/${id}/resume`);
  return mapReportSchedule(unwrapApiData(response));
};
```

## 16.6 deleteSchedule

```ts
deleteSchedule: async (id: string) => {
  const response = await apiClient.delete(`/analytics/report-schedules/${id}`);
  return unwrapApiData(response);
};
```

---

# 17. إصلاح ReportScheduleForm

## 17.1 لا تستخدم hook القديم

ممنوع استخدام:

```ts
useScheduleReport()
```

إذا كان يرسل إلى:

```txt
/analytics/reports/schedule
```

## 17.2 استخدم hooks الجديدة

```ts
const createSchedule = useCreateSchedule();
const updateSchedule = useUpdateSchedule();
```

## 17.3 عند الحفظ

```ts
if (mode === 'edit' && schedule?.id) {
  await updateSchedule.mutateAsync({
    id: schedule.id,
    data: payload,
  });
} else {
  await createSchedule.mutateAsync(payload);
}
```

## 17.4 الحقول المطلوبة

```txt
Schedule Name
Report Type
Frequency
Recipients
Time
Day of Week if weekly
Day of Month if monthly
Format
Is Active
Filters optional
```

---

# 18. التحقق من recipients

## 18.1 Frontend validation

- يجب أن يكون هناك على الأقل بريد إلكتروني واحد.
- تحقق من صيغة البريد.
- لا تسمح بقائمة فارغة.

```ts
const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
```

## 18.2 Backend validation

يجب أن يتحقق DTO من:

```ts
@IsArray()
@ArrayMinSize(1)
@IsEmail({}, { each: true })
recipients: string[];
```

---

# 19. صفحة التقارير المجدولة

## 19.1 الهيكل المطلوب

```txt
Scheduled Reports Page
├── Header
│   ├── Title
│   ├── Create Schedule Button
│   └── Refresh Button
│
├── Stats Cards
│   ├── Total Schedules
│   ├── Active Schedules
│   ├── Paused Schedules
│   └── Failed Last Runs
│
├── Filters
│   ├── Search
│   ├── Report Type
│   ├── Frequency
│   └── Status
│
├── Schedules Table
│   ├── Name
│   ├── Report Type
│   ├── Frequency
│   ├── Status
│   ├── Recipients
│   ├── Last Run
│   ├── Next Run
│   ├── Last Result
│   └── Actions
│
└── Pagination
```

---

# 20. أزرار جدول الجدولة

لكل schedule:

```txt
Edit
Run Now
Pause / Resume
Delete
View Last Result
```

## قواعد

- إذا `status === active` يظهر Pause.
- إذا `status === paused` يظهر Resume.
- Run Now يعمل فقط إذا id موجود.
- Delete يحتاج confirmation.
- بعد أي عملية invalidate للـ queries.

---

# 21. عرض آخر نتيجة

إذا `lastResult` موجود:

```txt
status
message
generatedAt
fileUrl
error
```

يجب عرضها بشكل واضح.

إذا لا توجد نتيجة:

```txt
لم يتم تشغيل هذه الجدولة بعد
```

---

# 22. إصلاح Schedule Stats

## 22.1 API

```ts
getScheduleStats: async () => {
  const response = await apiClient.get('/analytics/report-schedules/stats');
  return unwrapApiData(response);
};
```

## 22.2 تأكد من route order

`stats` قبل `:id`.

## 22.3 UI

إذا stats غير متوفرة، احسبها مؤقتًا من القائمة:

```ts
const total = schedules.length;
const active = schedules.filter(s => s.isActive || s.status === 'active').length;
const paused = schedules.filter(s => s.status === 'paused').length;
const failed = schedules.filter(s => s.lastResult?.status === 'failed').length;
```

لكن الأفضل استخدامها من الباك عند توفرها.

---

# 23. Backend إصلاحات مطلوبة للتقارير

## 23.1 إرجاع `reportId` بجانب `id`

في قائمة التقارير، اجعل الباك يرجع:

```ts
{
  id: report.reportId,
  reportId: report.reportId,
  ...
}
```

هذا يقلل كسر الفرونت مستقبلًا.

## 23.2 توحيد العملة

إذا summary currency حاليًا:

```txt
USD
```

غيّرها إلى:

```txt
YER
```

أو اجعلها من إعدادات النظام/المتجر.

## 23.3 status موحد

اعتمد statuses:

```txt
pending
processing
completed
failed
archived
```

## 23.4 pagination موحد

كل list endpoint يجب أن يرجع:

```ts
{
  data: T[],
  meta: {
    total,
    page,
    limit,
    totalPages
  }
}
```

داخل global wrapper إن وجد:

```ts
{
  success: true,
  data: {
    data: T[],
    meta
  },
  requestId
}
```

---

# 24. Backend إصلاحات مطلوبة للجدولة

## 24.1 route order

كما سبق:

```ts
@Get('stats')
@Get(':id')
```

## 24.2 DTO Validation

يجب التأكد من:

```txt
reportType
frequency
recipients
format
time
timezone optional
filters optional
```

## 24.3 run now

`POST /:id/run` يجب أن:

- يجد الجدولة.
- يولد التقرير.
- يحفظ نتيجة التشغيل في `lastResult`.
- يحدث `lastRunAt`.
- يحسب `nextRunAt` إذا مطلوب.
- يرجع نتيجة واضحة.

مثال:

```ts
{
  scheduleId,
  status: 'success',
  reportId,
  fileUrl,
  generatedAt
}
```

أو عند الخطأ:

```ts
{
  scheduleId,
  status: 'failed',
  error,
  generatedAt
}
```

## 24.4 pause/resume

يجب أن تغير:

```ts
status
isActive
```

بشكل متسق.

---

# 25. الترجمة المطلوبة

أضف مفاتيح ترجمة عربية وإنجليزية لكل ما يلي:

```txt
reports.title
reports.subtitle
reports.create
reports.empty.title
reports.empty.description
reports.table.title
reports.table.category
reports.table.status
reports.table.priority
reports.table.generatedAt
reports.table.records
reports.table.value
reports.table.actions

reports.status.pending
reports.status.processing
reports.status.completed
reports.status.failed
reports.status.archived

reports.priority.low
reports.priority.medium
reports.priority.high
reports.priority.critical

reports.category.sales
reports.category.products
reports.category.customers
reports.category.inventory
reports.category.financial
reports.category.marketing
reports.category.services
reports.category.support
reports.category.custom

schedules.title
schedules.subtitle
schedules.create
schedules.edit
schedules.runNow
schedules.pause
schedules.resume
schedules.delete
schedules.empty.title
schedules.empty.description
schedules.lastRun
schedules.nextRun
schedules.lastResult
schedules.noLastResult

schedules.frequency.daily
schedules.frequency.weekly
schedules.frequency.monthly
schedules.frequency.quarterly

schedules.result.success
schedules.result.failed
schedules.result.processing
```

---

# 26. Responsive

## إدارة التقارير

- على desktop: جدول كامل.
- على tablet: جدول مع scroll أفقي.
- على mobile: Cards بدل جدول أو جدول scroll مناسب.

## التقارير المجدولة

- نفس القاعدة.
- لا تجعل أزرار actions تضغط بعضها.
- استخدم menu/dropdown للأزرار على الموبايل.

---

# 27. UX المطلوب

## Toasts

يجب إظهار رسائل واضحة:

```txt
تم إنشاء التقرير بنجاح
فشل إنشاء التقرير
تم أرشفة التقرير
تم حذف التقرير
تم إنشاء الجدولة
تم تعديل الجدولة
تم تشغيل الجدولة
فشل تشغيل الجدولة
تم إيقاف الجدولة
تم استئناف الجدولة
```

## Confirmation Dialogs

مطلوبة عند:

```txt
Delete report
Archive report
Delete schedule
```

---

# 28. React Query / Cache

بعد كل عملية mutation:

```ts
queryClient.invalidateQueries(['advancedReports']);
queryClient.invalidateQueries(['reportSchedules']);
queryClient.invalidateQueries(['reportScheduleStats']);
```

إذا كانت query keys مختلفة في المشروع، استخدم المعتمدة.

---

# 29. اختبارات يدوية إلزامية

## إدارة التقارير

```txt
[ ] فتح صفحة التقارير بدون أخطاء.
[ ] ظهور التقارير الثلاثة التي يرجعها API.
[ ] ظهور REP-2026-05-000001.
[ ] البحث يعمل.
[ ] فلترة الحالة تعمل.
[ ] فلترة التصنيف تعمل.
[ ] Pagination يعمل.
[ ] زر عرض التفاصيل يعمل.
[ ] زر تحميل لا يرسل undefined.
[ ] زر الأرشفة يعمل أو يظهر خطأ مفهوم.
[ ] زر الحذف يحتاج confirmation.
[ ] إنشاء تقرير جديد يعمل.
[ ] بعد الإنشاء تظهر القائمة محدثة.
```

## التقارير المجدولة

```txt
[ ] فتح صفحة الجدولة بدون أخطاء.
[ ] stats لا يذهب إلى :id.
[ ] قائمة الجدولات تظهر إن وجدت.
[ ] Empty State يظهر إن لم توجد جدولات.
[ ] إنشاء جدولة جديدة يعمل.
[ ] تعديل جدولة يعمل.
[ ] Run Now يعمل.
[ ] Pause يعمل.
[ ] Resume يعمل.
[ ] Delete يعمل بعد confirmation.
[ ] Last Result يظهر بشكل مفهوم.
[ ] Recipients validation يعمل.
```

## Console

```txt
[ ] لا يوجد runtime error.
[ ] لا يوجد undefined reportId في network.
[ ] لا يوجد 404 بسبب /stats كـ id.
[ ] لا يوجد validation error بسبب reportType قديم.
```

---

# 30. معايير القبول

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

```txt
[ ] reports list API يرجع PaginatedResponse موحد في الفرونت.
[ ] reports table يعرض البيانات القادمة من API.
[ ] id/reportId موحد ولا يوجد undefined في actions.
[ ] create report يعمل أو يعطي error واضح.
[ ] view report يعمل.
[ ] download/export report لا ينهار.
[ ] archive/delete يعملان أو يظهران disabled حسب دعم الباك.
[ ] schedule form يستخدم endpoint الجديد.
[ ] ReportType enum مطابق للباك.
[ ] route stats قبل :id في الباك.
[ ] list schedules يعمل.
[ ] create/update schedule يعملان.
[ ] run now يعمل أو يظهر خطأ مفهوم.
[ ] pause/resume يعملان.
[ ] delete schedule يعمل مع confirmation.
[ ] last result يظهر.
[ ] loading/empty/error states موجودة.
[ ] responsive مضبوط.
[ ] RTL مضبوط.
[ ] مفاتيح الترجمة الأساسية مضافة.
[ ] لا توجد hooks قديمة مستخدمة للتقارير المجدولة.
```

---

# 31. ممنوعات صارمة

ممنوع:

```txt
- قراءة response.data.data.data داخل الصفحة مباشرة.
- ترك listAdvancedReports يرجع object بدل array.
- استخدام report.reportId بدون fallback.
- تمرير undefined إلى download/archive/delete/view.
- استخدام endpoint القديم /analytics/reports/schedule.
- استخدام ReportType غير مدعوم من الباك.
- وضع @Get(':id') قبل @Get('stats').
- إخفاء أخطاء الجدولة بدون Toast.
- استخدام mock data بدل API الحقيقي.
- حذف مركز التقارير أو الجدولة بدل إصلاحهما.
- تعديل مرحلة التصدير العميقة هنا؛ مكانها المرحلة الرابعة.
```

---

# 32. مخرجات المرحلة

بنهاية المرحلة يجب تسليم:

```txt
1. إدارة التقارير تعرض البيانات في الجدول.
2. كل actions الأساسية تعمل أو تتعامل مع عدم الدعم بوضوح.
3. إنشاء تقرير جديد يعمل.
4. تفاصيل التقرير تعمل.
5. التقارير المجدولة تستخدم النظام الجديد.
6. إنشاء وتعديل وتشغيل وإيقاف واستئناف وحذف الجدولة يعمل.
7. Route stats مصلح في الباك.
8. ReportType موحد.
9. واجهة التقارير responsive وRTL.
10. تقرير مختصر بما تم إصلاحه وما تبقى للمرحلة الرابعة.
```

---

# 33. ملاحظات مهمة للوكيل المنفذ

ابدأ بالترتيب التالي:

```txt
1. أصلح API layer للتقارير.
2. أصلح mapper الخاص بالتقارير.
3. اجعل جدول التقارير يظهر البيانات.
4. أصلح actions واحدًا واحدًا.
5. أصلح API layer للجدولة.
6. أصلح route order في الباك.
7. أصلح ReportType enum.
8. اربط الفورم بالendpoint الجديد.
9. اختبر run/pause/resume/delete.
10. أضف empty/loading/error/translation/responsive.
```

لا تبدأ بتحسين الشكل قبل ظهور التقارير والجدولات فعليًا.

---

# 34. النتيجة المتوقعة بعد المرحلة الثالثة

بعد هذه المرحلة يجب أن ينتقل قسم التقارير من:

```txt
API يرجع بيانات لكن الجدول فارغ، والجدولة غير متماسكة وتستخدم endpoints قديمة
```

إلى:

```txt
نظام تقارير وجدولة واضح، يعرض البيانات، ويدير التقارير والجدولات من الواجهة بشكل مستقر وقابل للاستخدام
```

هذه المرحلة لا تغلق مركز التصدير نهائيًا، لكنها تجهز التقارير والجدولة للربط الكامل مع التصدير في المرحلة الرابعة.
