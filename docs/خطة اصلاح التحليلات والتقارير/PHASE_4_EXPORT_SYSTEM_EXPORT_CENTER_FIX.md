# المرحلة الرابعة — إصلاح نظام التصدير ومركز التصدير

## اسم المرحلة

**Phase 4 — Export System & Export Center Full Professional Fix**

---

## الهدف العام

تهدف هذه المرحلة إلى إغلاق نظام التصدير بالكامل وربطه بشكل صحيح مع:

- إدارة التقارير.
- التقارير المجدولة.
- تصدير البيانات العامة.
- تصدير تقارير التحليلات.
- مركز التصدير.
- ملفات PDF / XLSX / CSV / JSON.
- حفظ سجل كل عملية تصدير.
- عرض الملفات المصدّرة.
- تحميل الملفات.
- حذف أو أرشفة ملفات التصدير إذا كان مدعومًا.
- توحيد شكل الريسبونس بين الباك والفرونت.

> هذه المرحلة تعتمد إلزاميًا على مخرجات المرحلة الأولى:
>
> - `unwrapApiData`
> - `asArray`
> - `toNumber`
> - `normalizeFileResult`
> - `mapExportFile`
> - `mapAdvancedReport`
> - `mapReportSchedule`
>
> وتعتمد على مخرجات المرحلة الثالثة:
>
> - إدارة التقارير تعمل.
> - `reportId` موحد.
> - إنشاء وعرض التقارير يعمل.
> - التقارير المجدولة تعمل.
> - تشغيل التقرير المجدول ينتج نتيجة قابلة للتتبع.

---

## القاعدة الصارمة لهذه المرحلة

أي عملية تصدير يجب أن ترجع object موحد، وليس string فقط.

الشكل المعتمد:

```ts
{
  fileUrl: string;
  fileName: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  fileSize?: number;
  exportedAt: string;
  reportId?: string;
  exportId?: string;
  status?: 'available' | 'processing' | 'failed' | 'expired';
}
```

ممنوع أن يرجع الباك:

```ts
return exportResult.url;
```

إلا لو تم تطبيعه في API layer مؤقتًا، لكن الهدف النهائي أن الباك يرجع object واضح.

---

# 1. نطاق المرحلة

## داخل النطاق

تشمل هذه المرحلة:

```txt
Export Report
Export Sales Data
Export Products Data
Export Customers Data
Export Inventory Data
Export Marketing Data
Export Financial Data
Export Advanced Reports
Export Scheduled Reports Output
Export Center Page
Exported Files List
Download Exported File
Delete Exported File إن كان مدعومًا
Export Status
Export Format Normalization
File Metadata
Saving exports[] inside reports
```

## خارج النطاق

لا تشمل هذه المرحلة:

```txt
إعادة بناء كل التحليلات
إعادة تصميم صفحة /analytics من الصفر
إعادة بناء الجدولة من الصفر
بناء file manager عام للنظام كله
بناء object storage جديد
```

---

# 2. المشكلة الحالية المختصرة

## 2.1 اختلاف صيغ التصدير

الفرونت يستخدم أحيانًا:

```txt
excel
```

بينما الباك يدعم:

```txt
xlsx
```

وهذا يؤدي إلى فشل التصدير.

---

## 2.2 اختلاف شكل الريسبونس

بعض دوال الباك ترجع:

```ts
string
```

وبعضها ترجع:

```ts
{
  fileUrl
}
```

وبعضها داخل wrapper:

```ts
{
  success: true,
  data: {
    fileUrl
  }
}
```

وهذا يسبب أن الفرونت لا يعرف أين يجد رابط الملف.

---

## 2.3 مركز التصدير يقرأ من المكان الخطأ

مركز التصدير يستخدم غالبًا:

```ts
listAdvancedReports()
```

ثم يحاول استخراج:

```ts
report.exports
```

لكن قائمة التقارير لا ترجع `exports` غالبًا، لذلك المركز يظهر فارغًا.

الصحيح استخدام endpoint مخصص مثل:

```txt
GET /analytics/advanced/reports/exports
```

---

## 2.4 exportReport لا يحفظ داخل `exports[]`

قد يتم توليد الملف فعلًا، لكن لا يتم حفظ أثر التصدير داخل التقرير، لذلك لا يظهر الملف في مركز التصدير.

---

# 3. الملفات المتوقع تعديلها

## Frontend

```txt
admin-dashboard/src/features/analytics/api/analyticsApi.ts
admin-dashboard/src/features/analytics/api/reportBuilderApi.ts

admin-dashboard/src/features/analytics/hooks/useExportReport.ts
admin-dashboard/src/features/analytics/hooks/useExports.ts
admin-dashboard/src/features/analytics/hooks/useReports.ts

admin-dashboard/src/features/analytics/pages/ExportCenterPage.tsx
admin-dashboard/src/features/analytics/pages/ReportsManagementPage.tsx
admin-dashboard/src/features/analytics/pages/ReportDetailsPage.tsx

admin-dashboard/src/features/analytics/components/DataExportDialog.tsx
admin-dashboard/src/features/analytics/components/ExportCenterTable.tsx
admin-dashboard/src/features/analytics/components/ExportFileCard.tsx
admin-dashboard/src/features/analytics/components/ExportFilters.tsx
admin-dashboard/src/features/analytics/components/ExportStatusBadge.tsx

admin-dashboard/src/features/analytics/types/exports.ts
admin-dashboard/src/features/analytics/types/reports.ts
admin-dashboard/src/features/analytics/utils/exportMappers.ts
admin-dashboard/src/features/analytics/utils/formatters.ts
admin-dashboard/src/features/analytics/utils/translations.ts
```

## Backend

```txt
backend/src/analytics/services/export.service.ts
backend/src/analytics/services/report-generation.service.ts
backend/src/analytics/services/advanced-analytics.service.ts
backend/src/analytics/controllers/advanced-reports.controller.ts
backend/src/analytics/controllers/analytics.controller.ts
backend/src/analytics/schemas/advanced-report.schema.ts
backend/src/analytics/dto/export-report.dto.ts
backend/src/analytics/dto/export-data.dto.ts
```

قد تختلف الأسماء، لكن يجب تعديل ما يعادلها.

---

# 4. توحيد صيغ التصدير

## 4.1 الصيغ المعتمدة

يجب اعتماد الصيغ التالية فقط:

```ts
export enum ExportFormat {
  PDF = 'pdf',
  XLSX = 'xlsx',
  CSV = 'csv',
  JSON = 'json',
}
```

## 4.2 دعم alias مؤقت

لمنع كسر الواجهة القديمة:

```ts
export const normalizeExportFormat = (format: string): ExportFormat => {
  const normalized = String(format || '').toLowerCase();

  if (normalized === 'excel') return ExportFormat.XLSX;
  if (normalized === 'xls') return ExportFormat.XLSX;

  if (normalized === 'xlsx') return ExportFormat.XLSX;
  if (normalized === 'pdf') return ExportFormat.PDF;
  if (normalized === 'csv') return ExportFormat.CSV;
  if (normalized === 'json') return ExportFormat.JSON;

  return ExportFormat.XLSX;
};
```

## 4.3 في الباك إند

يجب أيضًا دعم alias:

```ts
function normalizeExportFormat(format: string): 'pdf' | 'xlsx' | 'csv' | 'json' {
  const value = String(format || '').toLowerCase();

  if (value === 'excel' || value === 'xls') return 'xlsx';
  if (['pdf', 'xlsx', 'csv', 'json'].includes(value)) return value as any;

  return 'xlsx';
}
```

---

# 5. توحيد نتيجة التصدير في الفرونت

## 5.1 إنشاء type

```ts
export type ExportFileStatus =
  | 'available'
  | 'processing'
  | 'failed'
  | 'expired';

export type ExportFile = {
  exportId?: string;
  id?: string;

  reportId?: string;
  reportTitle?: string;

  fileUrl: string;
  fileName: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  fileSize?: number;

  status: ExportFileStatus;
  exportedAt: string;
  generatedAt?: string;

  generatedBy?: string;
  category?: string;
  source?: string;
};
```

---

## 5.2 إنشاء `normalizeFileResult`

```ts
export const normalizeFileResult = (payload: any): ExportFile => {
  const data = payload?.data?.data ?? payload?.data ?? payload;

  if (typeof data === 'string') {
    return {
      fileUrl: data,
      fileName: data.split('/').pop() || 'export-file',
      format: 'xlsx',
      status: 'available',
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    exportId: data?.exportId ?? data?.id ?? data?._id,
    id: data?.id ?? data?.exportId ?? data?._id,

    reportId: data?.reportId,
    reportTitle: data?.reportTitle ?? data?.title,

    fileUrl: data?.fileUrl ?? data?.url ?? '',
    fileName:
      data?.fileName ??
      data?.filename ??
      data?.name ??
      'export-file',

    format: normalizeExportFormat(data?.format),
    fileSize: Number(data?.fileSize ?? data?.size ?? 0),

    status: data?.status ?? 'available',
    exportedAt:
      data?.exportedAt ??
      data?.generatedAt ??
      data?.createdAt ??
      new Date().toISOString(),

    generatedAt: data?.generatedAt,
    generatedBy: data?.generatedBy,
    category: data?.category,
    source: data?.source,
  };
};
```

---

# 6. إصلاح API Layer للتصدير

## 6.1 exportReport

يجب أن تكون الدالة:

```ts
exportReport: async (
  reportId: string,
  payload: { format: ExportFormat | string }
): Promise<ExportFile> => {
  const response = await apiClient.post(
    `/analytics/advanced/reports/${reportId}/export`,
    {
      ...payload,
      format: normalizeExportFormat(payload.format),
    }
  );

  return normalizeFileResult(response);
};
```

## 6.2 exportSalesData

```ts
exportSalesData: async (params: ExportDataParams): Promise<ExportFile> => {
  const response = await apiClient.post('/analytics/advanced/export/sales', {
    ...params,
    format: normalizeExportFormat(params.format),
  });

  return normalizeFileResult(response);
};
```

## 6.3 exportProductsData

```ts
exportProductsData: async (params: ExportDataParams): Promise<ExportFile> => {
  const response = await apiClient.post('/analytics/advanced/export/products', {
    ...params,
    format: normalizeExportFormat(params.format),
  });

  return normalizeFileResult(response);
};
```

## 6.4 exportCustomersData

```ts
exportCustomersData: async (params: ExportDataParams): Promise<ExportFile> => {
  const response = await apiClient.post('/analytics/advanced/export/customers', {
    ...params,
    format: normalizeExportFormat(params.format),
  });

  return normalizeFileResult(response);
};
```

## 6.5 أي export function أخرى

يجب تطبيق نفس القاعدة:

```txt
normalize format before request
unwrap/normalize result after response
return ExportFile
```

---

# 7. إصلاح Backend export response

## 7.1 القاعدة

كل دالة export في الباك يجب أن ترجع:

```ts
{
  fileUrl,
  fileName,
  format,
  fileSize,
  path,
  exportedAt
}
```

## 7.2 ممنوع

```ts
return exportResult.url;
```

## 7.3 مثال صحيح

```ts
const exportResult = await this.exportService.exportData({
  data,
  format,
  filename,
});

return {
  fileUrl: exportResult.url,
  fileName: exportResult.filename,
  format: exportResult.format,
  fileSize: exportResult.size,
  path: exportResult.path,
  exportedAt: new Date().toISOString(),
};
```

## 7.4 دعم global wrapper

إذا كان عندكم interceptor يلف الريسبونس:

```ts
{
  success: true,
  data,
  requestId
}
```

فالدالة ترجع object فقط، والـ interceptor يلفه.

---

# 8. حفظ التصدير داخل التقرير `exports[]`

## 8.1 الهدف

عند تصدير تقرير معيّن، يجب أن يتم حفظ الملف داخل التقرير حتى يظهر لاحقًا في:

- تفاصيل التقرير.
- مركز التصدير.
- سجل التصديرات.

## 8.2 schema المتوقع

داخل التقرير:

```ts
exports: [
  {
    format: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    generatedAt: Date;
    generatedBy?: string;
    status?: string;
  }
]
```

## 8.3 كود Backend مقترح

بعد توليد الملف:

```ts
await this.advancedReportModel.updateOne(
  { reportId },
  {
    $push: {
      exports: {
        format: exportResult.format,
        fileUrl: exportResult.url,
        fileName: exportResult.filename,
        fileSize: exportResult.size,
        generatedAt: new Date(),
        generatedBy: userId,
        status: 'available',
      },
    },
  }
);
```

## 8.4 إذا كان هناك `ReportGenerationService.exportReport`

إذا كان هذا السيرفس موجودًا ويحفظ `exports[]` بالفعل، يجب توحيد كل export report عليه بدل وجود مسارين مختلفين.

الهدف:

```txt
كل تصدير تقرير يمر من مكان واحد فقط
```

---

# 9. إصلاح endpoint مركز التصدير

## 9.1 endpoint المطلوب

```txt
GET /analytics/advanced/reports/exports
```

يجب أن يرجع قائمة ملفات مصدّرة، وليس قائمة تقارير.

## 9.2 الريسبونس المطلوب

```ts
{
  data: ExportFile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

داخل wrapper:

```ts
{
  success: true,
  data: {
    data: ExportFile[],
    meta
  },
  requestId
}
```

---

## 9.3 طريقة بناء القائمة في الباك

إذا الصادرات محفوظة داخل التقارير:

```ts
const reports = await this.advancedReportModel
  .find({ 'exports.0': { $exists: true } })
  .select('reportId title category exports')
  .lean();
```

ثم flatMap:

```ts
const files = reports.flatMap(report =>
  (report.exports || []).map((file, index) => ({
    exportId: `${report.reportId}-${index}`,
    reportId: report.reportId,
    reportTitle: report.title,
    category: report.category,

    fileUrl: file.fileUrl,
    fileName: file.fileName,
    format: file.format,
    fileSize: file.fileSize,
    status: file.status || 'available',
    exportedAt: file.generatedAt,
    generatedBy: file.generatedBy,
    source: 'report',
  }))
);
```

ثم طبّق:

```txt
search
format filter
status filter
category filter
pagination
sort by exportedAt desc
```

---

# 10. إصلاح ExportCenterPage

## 10.1 المشكلة الحالية

ممنوع أن يعتمد المركز على:

```ts
listAdvancedReports()
```

ثم:

```ts
report.exports
```

الصحيح:

```ts
getExportedFiles()
```

---

## 10.2 API الصحيح

```ts
getExportedFiles: async (
  params: ExportFilesParams = {}
): Promise<PaginatedResponse<ExportFile>> => {
  const response = await apiClient.get('/analytics/advanced/reports/exports', {
    params,
  });

  return normalizePaginatedResponse(
    response,
    normalizeFileResult,
    {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    }
  );
};
```

---

## 10.3 الصفحة المطلوبة

```txt
Export Center Page
├── Header
│   ├── Title
│   ├── Subtitle
│   ├── Refresh Button
│   └── Export New Button
│
├── Stats Cards
│   ├── Total Files
│   ├── Available Files
│   ├── Failed Exports
│   └── Total Size
│
├── Filters
│   ├── Search
│   ├── Format
│   ├── Status
│   ├── Category
│   └── Date Range
│
├── Exported Files Table / Cards
│   ├── File Name
│   ├── Report Title
│   ├── Format
│   ├── Size
│   ├── Status
│   ├── Exported At
│   └── Actions
│
└── Pagination
```

---

## 10.4 قراءة البيانات

```ts
const files = exportsQuery.data?.data ?? [];
const meta = exportsQuery.data?.meta;
```

ممنوع:

```ts
const files = reports.flatMap(...)
```

داخل الصفحة.

---

# 11. أزرار مركز التصدير

لكل ملف:

```txt
Download
Open
Copy Link
Delete إن كان مدعومًا
```

## 11.1 Download/Open

```ts
if (file.fileUrl) {
  window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
}
```

## 11.2 Copy Link

```ts
await navigator.clipboard.writeText(file.fileUrl);
toast.success('تم نسخ رابط الملف');
```

## 11.3 Delete

إذا كان الباك لا يدعم حذف ملف تصدير، أخف الزر.

إذا يدعم:

```txt
DELETE /analytics/advanced/reports/exports/:exportId
```

بعد الحذف:

```ts
invalidateQueries(['exportedFiles']);
```

---

# 12. إصلاح DataExportDialog

## 12.1 الهدف

نافذة تصدير البيانات العامة يجب أن تدعم:

```txt
نوع البيانات
الفترة
الصيغة
الفلاتر
```

## 12.2 أنواع البيانات

```ts
export enum ExportDataType {
  SALES = 'sales',
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  INVENTORY = 'inventory',
  FINANCIAL = 'financial',
  MARKETING = 'marketing',
}
```

## 12.3 الصيغ

يجب أن تكون:

```txt
PDF
XLSX
CSV
JSON
```

وقيمها:

```txt
pdf
xlsx
csv
json
```

لا تستخدم:

```txt
excel
```

في الواجهة.

---

## 12.4 onSubmit

```ts
const payload = {
  type,
  format: normalizeExportFormat(format),
  startDate,
  endDate,
  filters,
};

const result = await exportMutation.mutateAsync(payload);

if (result.fileUrl) {
  window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
}
```

---

# 13. ربط Export Dialog بالـ API المناسب

## 13.1 switch حسب النوع

```ts
switch (payload.type) {
  case 'sales':
    return analyticsApi.exportSalesData(payload);

  case 'products':
    return analyticsApi.exportProductsData(payload);

  case 'customers':
    return analyticsApi.exportCustomersData(payload);

  case 'inventory':
    return analyticsApi.exportInventoryData(payload);

  case 'financial':
    return analyticsApi.exportFinancialData(payload);

  case 'marketing':
    return analyticsApi.exportMarketingData(payload);

  default:
    throw new Error('نوع تصدير غير مدعوم');
}
```

## 13.2 إذا بعض الأنواع غير مدعومة في الباك

- لا تعرضها في dropdown.
- أو اعرضها disabled مع tooltip:
  - "سيتم دعم هذا النوع لاحقًا"

---

# 14. ربط التصدير بالتقارير المجدولة

## 14.1 عند تشغيل schedule

عند `run now` أو التشغيل التلقائي، يجب أن ينتج:

```ts
lastResult: {
  status: 'success' | 'failed';
  reportId?: string;
  fileUrl?: string;
  fileName?: string;
  format?: string;
  generatedAt: Date;
  error?: string;
}
```

## 14.2 إذا schedule ينتج export

يجب أن يظهر الملف في مركز التصدير أيضًا.

هناك خياران:

### الخيار الأفضل

كل scheduled report يولد AdvancedReport، ثم يصدّره ويحفظه في `exports[]`.

### خيار مؤقت

يحفظ نتيجة التصدير في collection منفصلة `exported_files`.

لكن لا تترك الملف فقط داخل `lastResult` لأنه لن يظهر في مركز التصدير إذا المركز يعتمد على تقارير.

---

# 15. تحسين Backend ExportService

## 15.1 المطلوب

`ExportService` يجب أن يدعم:

```txt
pdf
xlsx
csv
json
```

## 15.2 يجب أن يرجع

```ts
{
  url: string;
  filename: string;
  format: string;
  size?: number;
  path?: string;
}
```

## 15.3 إذا الحجم غير معروف

يمكن حسابه بعد الكتابة:

```ts
const stats = await fs.promises.stat(filePath);
```

أو اتركه 0 مؤقتًا.

---

# 16. Storage و URL

## 16.1 تأكد أن fileUrl قابل للفتح

يجب أن يكون:

```txt
https://...
```

أو مسار public واضح.

## 16.2 ممنوع

إرجاع path داخلي فقط مثل:

```txt
/app/uploads/report.xlsx
```

بدون public URL.

## 16.3 إذا يستخدم MinIO/S3

يجب إرجاع signed URL أو public URL حسب نظامكم.

## 16.4 إذا يستخدم local storage

يجب أن يكون هناك static serving route مثل:

```txt
/uploads/reports/filename.xlsx
```

---

# 17. حالات الملف

اعتمد statuses:

```txt
available
processing
failed
expired
```

## 17.1 UI Badge

```txt
available  → متاح
processing → قيد المعالجة
failed     → فشل
expired    → منتهي
```

## 17.2 إذا failed

- لا تعرض زر Download.
- اعرض سبب الفشل إن وجد.

## 17.3 إذا expired

- لا تعرض Download.
- يمكن عرض زر "إعادة التصدير" إذا مدعوم.

---

# 18. Pagination والفلترة

## 18.1 Params

```ts
type ExportFilesParams = {
  page?: number;
  limit?: number;
  search?: string;
  format?: 'pdf' | 'xlsx' | 'csv' | 'json';
  status?: 'available' | 'processing' | 'failed' | 'expired';
  category?: string;
  startDate?: string;
  endDate?: string;
};
```

## 18.2 Backend يجب أن يدعم على الأقل

```txt
page
limit
format
search
```

والباقي إن أمكن.

---

# 19. Stats في مركز التصدير

## 19.1 إذا الباك يدعم stats endpoint

```txt
GET /analytics/advanced/reports/exports/stats
```

يرجع:

```ts
{
  totalFiles: number;
  availableFiles: number;
  failedFiles: number;
  totalSize: number;
}
```

## 19.2 إذا غير مدعوم

احسب مؤقتًا من القائمة الحالية:

```ts
const totalFiles = files.length;
const availableFiles = files.filter(f => f.status === 'available').length;
const failedFiles = files.filter(f => f.status === 'failed').length;
const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
```

مع ملاحظة أن هذا فقط للصفحة الحالية، وليس كل الملفات.

---

# 20. تنسيق حجم الملف

أضف helper:

```ts
export const formatFileSize = (bytes?: number) => {
  const value = Number(bytes || 0);

  if (value <= 0) return 'غير معروف';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};
```

---

# 21. الترجمة المطلوبة

أضف مفاتيح عربية وإنجليزية:

```txt
exports.title
exports.subtitle
exports.empty.title
exports.empty.description
exports.refresh
exports.exportNew
exports.searchPlaceholder

exports.table.fileName
exports.table.reportTitle
exports.table.format
exports.table.size
exports.table.status
exports.table.exportedAt
exports.table.actions

exports.actions.download
exports.actions.open
exports.actions.copyLink
exports.actions.delete
exports.actions.retry

exports.status.available
exports.status.processing
exports.status.failed
exports.status.expired

exports.format.pdf
exports.format.xlsx
exports.format.csv
exports.format.json

exports.toast.exportSuccess
exports.toast.exportFailed
exports.toast.copySuccess
exports.toast.downloadUnavailable
exports.toast.deleteSuccess
exports.toast.deleteFailed

exports.dialog.title
exports.dialog.dataType
exports.dialog.format
exports.dialog.dateRange
exports.dialog.submit
exports.dialog.cancel

exports.dataType.sales
exports.dataType.products
exports.dataType.customers
exports.dataType.inventory
exports.dataType.financial
exports.dataType.marketing
```

---

# 22. Responsive Design

## 22.1 Desktop

استخدم جدول كامل.

## 22.2 Tablet

جدول مع horizontal scroll.

## 22.3 Mobile

يفضل Cards بدل جدول:

```txt
File Card
├── File Name
├── Format Badge
├── Status Badge
├── Size
├── Exported At
└── Actions Dropdown
```

## 22.4 ممنوع

- كسر عرض الصفحة.
- أزرار كثيرة مزدحمة في صف صغير.
- روابط طويلة بدون تقصير.

---

# 23. UX المطلوبة

## 23.1 عند بدء التصدير

اعرض:

```txt
جاري تجهيز الملف...
```

## 23.2 عند النجاح

```txt
تم تجهيز الملف بنجاح
```

ثم افتح الملف أو اعرض زر التحميل.

## 23.3 عند الفشل

```txt
فشل تصدير الملف
```

مع تفاصيل إن وجدت.

## 23.4 عند عدم توفر رابط الملف

```txt
تمت العملية لكن لم يتم العثور على رابط الملف
```

---

# 24. React Query / Cache

بعد أي export ناجح:

```ts
queryClient.invalidateQueries(['exportedFiles']);
queryClient.invalidateQueries(['advancedReports']);
```

بعد delete export:

```ts
queryClient.invalidateQueries(['exportedFiles']);
```

بعد export report:

```ts
queryClient.invalidateQueries(['advancedReport', reportId]);
queryClient.invalidateQueries(['advancedReports']);
queryClient.invalidateQueries(['exportedFiles']);
```

---

# 25. Backend validation

## 25.1 DTO

```ts
export class ExportReportDto {
  @IsIn(['pdf', 'xlsx', 'csv', 'json', 'excel', 'xls'])
  format: string;
}
```

ثم normalize داخل service.

## 25.2 Export data DTO

```ts
export class ExportDataDto {
  @IsIn(['sales', 'products', 'customers', 'inventory', 'financial', 'marketing'])
  type: string;

  @IsIn(['pdf', 'xlsx', 'csv', 'json', 'excel', 'xls'])
  format: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  filters?: Record<string, any>;
}
```

---

# 26. أمن الملفات

## 26.1 لا تعرض ملفات غير مصرح بها

تأكد أن user لا يستطيع تحميل ملف تقرير لا يملك صلاحية الوصول له.

## 26.2 تحقق من report ownership/permission

قبل export أو download:

```ts
checkPermission(user, report)
```

## 26.3 لا تقبل file path من المستخدم

ممنوع endpoint مثل:

```txt
/download?path=/app/...
```

بدون تحقق صارم.

---

# 27. اختبارات يدوية إلزامية

## 27.1 Export Report

```txt
[ ] تصدير تقرير PDF يعمل.
[ ] تصدير تقرير XLSX يعمل.
[ ] تصدير تقرير CSV يعمل.
[ ] تصدير تقرير JSON يعمل.
[ ] excel يتحول إلى xlsx ولا يفشل.
[ ] الريسبونس يرجع fileUrl.
[ ] الملف يفتح من المتصفح.
[ ] التقرير يتم تحديث exports[] داخله.
[ ] تفاصيل التقرير تعرض الملف الجديد.
```

## 27.2 Data Export

```txt
[ ] تصدير sales يعمل.
[ ] تصدير products يعمل.
[ ] تصدير customers يعمل.
[ ] الأنواع غير المدعومة لا تظهر أو disabled.
[ ] عند التصدير يفتح الملف أو يظهر رابط التحميل.
[ ] لا يوجد undefined fileUrl.
```

## 27.3 Export Center

```txt
[ ] الصفحة تستخدم getExportedFiles وليس listAdvancedReports.
[ ] الملفات تظهر.
[ ] البحث يعمل.
[ ] فلتر format يعمل.
[ ] pagination يعمل.
[ ] download يعمل.
[ ] copy link يعمل.
[ ] status badge يظهر.
[ ] empty state يظهر عند عدم وجود ملفات.
[ ] loading state يظهر.
[ ] error state يظهر.
```

## 27.4 Scheduled Reports Integration

```txt
[ ] Run Now يولد نتيجة.
[ ] إذا تم توليد ملف، يظهر في مركز التصدير.
[ ] lastResult يعرض fileUrl إن وجد.
```

## 27.5 Console / Network

```txt
[ ] لا يوجد format=excel يسبب 400.
[ ] لا يوجد response string غير مطبع في الفرونت.
[ ] لا يوجد fileUrl undefined.
[ ] لا يوجد مركز تصدير فارغ رغم وجود exports.
```

---

# 28. معايير القبول

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

```txt
[ ] كل export formats موحدة إلى pdf/xlsx/csv/json.
[ ] excel alias مدعوم مؤقتًا.
[ ] كل export APIs ترجع ExportFile موحد في الفرونت.
[ ] الباك لا يرجع string فقط في export functions الجديدة.
[ ] exportReport يحفظ الملف داخل exports[].
[ ] مركز التصدير يستخدم getExportedFiles.
[ ] مركز التصدير يعرض الملفات فعليًا.
[ ] Download/Open يعمل.
[ ] Copy Link يعمل.
[ ] Filters تعمل.
[ ] Pagination يعمل.
[ ] Empty/Loading/Error states موجودة.
[ ] Responsive مضبوط.
[ ] RTL مضبوط.
[ ] الترجمة الأساسية مضافة.
[ ] scheduled report output يظهر أو يمكن تتبعه.
[ ] لا توجد أخطاء runtime في console.
```

---

# 29. ممنوعات صارمة

ممنوع:

```txt
- استخدام excel كقيمة رسمية بدل xlsx.
- ترك export function ترجع string فقط.
- الاعتماد على listAdvancedReports في Export Center.
- استخراج exports داخل الصفحة بـ flatMap من reports.
- فتح window.open على undefined.
- إخفاء خطأ التصدير بدون toast.
- إضافة mock exported files.
- تجاهل حفظ exports[] بعد export report.
- إرجاع path داخلي بدل URL قابل للفتح.
- حذف أزرار التصدير بدل إصلاحها.
- كسر تقارير المرحلة الثالثة أثناء إصلاح التصدير.
```

---

# 30. مخرجات المرحلة

بنهاية المرحلة يجب تسليم:

```txt
1. نظام تصدير موحد الصيغ.
2. كل عمليات التصدير ترجع ExportFile موحد.
3. تصدير التقرير يحفظ داخل exports[].
4. مركز التصدير يعرض الملفات من endpoint صحيح.
5. تحميل وفتح ونسخ روابط الملفات يعمل.
6. تصدير البيانات العامة يعمل للأنواع المدعومة.
7. التقارير المجدولة يمكن أن تنتج ملفات قابلة للتتبع.
8. الواجهة responsive وRTL.
9. لا توجد runtime errors.
10. تقرير مختصر بما تم إصلاحه وما تبقى للمرحلة الخامسة.
```

---

# 31. ترتيب التنفيذ الموصى به

اتبع هذا الترتيب حرفيًا:

```txt
1. وحّد ExportFormat في الفرونت.
2. أضف normalizeExportFormat.
3. أضف normalizeFileResult و mapExportFile.
4. أصلح export APIs في analyticsApi/reportBuilderApi.
5. أصلح Backend export response ليعيد object.
6. أصلح exportReport ليحفظ exports[].
7. أنشئ/أصلح getExportedFiles endpoint.
8. عدّل ExportCenterPage ليستخدم getExportedFiles.
9. أصلح DataExportDialog.
10. اربط export success بفتح الملف وتحديث cache.
11. اختبر report export.
12. اختبر data export.
13. اختبر export center.
14. اختبر scheduled reports output.
15. أضف الترجمة والـ responsive والتحسينات النهائية.
```

---

# 32. النتيجة المتوقعة بعد المرحلة الرابعة

بعد هذه المرحلة يجب أن ينتقل النظام من:

```txt
التصدير ينجح أحيانًا لكن لا يظهر في مركز التصدير، والفرونت لا يعرف أين fileUrl، وصيغة excel/xlsx تسبب أخطاء
```

إلى:

```txt
نظام تصدير احترافي موحد، كل ملف يتم توليده له سجل واضح، يظهر في مركز التصدير، ويمكن تحميله وإدارته بثبات
```

بعد هذه المرحلة يبقى فقط المرحلة الخامسة للإغلاق النهائي:

```txt
Backend hardening
performance
tests
cleanup
documentation
final QA
```
