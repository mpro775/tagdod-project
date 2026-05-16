# المرحلة 1 — تثبيت Contract البيانات ومنع انهيارات قسم الإحصائيات والتقارير

## الهدف العام

هذه المرحلة هي الأساس الإجباري قبل أي تطوير بصري أو تحسينات متقدمة.
هدفها إصلاح طريقة قراءة البيانات بين الفرونت والباك إند في قسم:

- صفحة التحليلات العامة `/analytics`
- صفحة التحليلات المتقدمة `/analytics/advanced`
- إدارة التقارير
- التقارير المجدولة
- تصدير البيانات
- مركز التصدير

المطلوب في هذه المرحلة ليس إعادة تصميم الواجهات، وليس بناء Features جديدة، بل **تثبيت طبقة بيانات آمنة وموحدة** تمنع الأخطاء الحالية مثل:

```txt
TypeError: r.slice is not a function
```

وتمنع مشاكل مثل:

```txt
data.data
id vs reportId
excel vs xlsx
object passed to Recharts instead of array
undefined fileUrl
empty table despite API returning data
```

بعد هذه المرحلة يجب أن تصبح كل صفحات القسم قادرة على استقبال بيانات الباك إند بشكل آمن، حتى لو كانت بعض الحقول ناقصة أو فارغة.

---

## نطاق المرحلة

هذه المرحلة تشمل تعديلات Frontend أساسية، وتعديلات Backend بسيطة فقط عند الحاجة لتوحيد الاستجابة.

### ضمن النطاق

- إضافة helpers موحدة لقراءة API responses.
- إضافة mappers / normalizers لكل قسم.
- منع تمرير object إلى Recharts.
- توحيد أسماء الحقول الحرجة.
- توحيد صيغ التصدير.
- إصلاح قراءة الجداول من responses المتداخلة.
- إصلاح `reportId` و `id`.
- إصلاح قراءة روابط الملفات المصدرة.
- إضافة Types أو تحديثها لتطابق الواقع الحالي.
- إضافة حماية للـ components بدون تغيير تصميمها جذريًا.

### خارج النطاق في هذه المرحلة

لا تنفذ الآتي في هذه المرحلة:

- لا تعيد تصميم صفحات التحليلات بالكامل.
- لا تضف Charts جديدة.
- لا تغير Layout العام للصفحات.
- لا تبني نظام تقارير جديد.
- لا تعيد كتابة Backend Services بالكامل.
- لا تضف صلاحيات جديدة.
- لا تضف نظام تنبيهات جديد.
- لا تعمل Optimization عميق للكاش أو الاستعلامات.

هذه الأمور ستكون في مراحل لاحقة.

---

## المشكلة الحالية المختصرة

الباك إند يرجع بيانات، لكنها لا تُقرأ بشكل صحيح في الفرونت.

مثال إدارة التقارير يرجع:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "REP-2026-05-000001",
        "title": "تقرير جديد",
        "category": "sales",
        "status": "completed"
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

لكن الفرونت يقرأه أحيانًا كأنه:

```ts
response.data.data // Array
```

بينما الحقيقة:

```ts
response.data.data.data // Array
response.data.data.meta // Meta
```

مثال آخر: Recharts يتوقع Array، لكن يتم تمرير object مثل:

```ts
dashboardData.revenueCharts
```

بينما الصحيح:

```ts
dashboardData.revenueCharts.daily
```

---

## معايير النجاح في نهاية المرحلة

تعتبر المرحلة مكتملة فقط إذا تحققت الشروط التالية:

1. لا يظهر خطأ `slice is not a function` في أي صفحة تحليلات.
2. لا يتم تمرير أي object إلى Recharts كـ `data`.
3. جدول إدارة التقارير يعرض التقارير القادمة من API.
4. كل تقرير لديه `reportId` صالح حتى لو الباك أرجع `id` فقط.
5. كل API function في `analyticsApi` ترجع ViewModel ثابت وليس raw response عشوائي.
6. كل arrays يتم تمريرها بعد فحص `Array.isArray`.
7. كل أرقام التحليلات يتم تحويلها بأمان إلى number.
8. كل exports تقرأ `fileUrl` سواء رجع الباك object أو string.
9. صيغة Excel موحدة إلى `xlsx` مع دعم alias لـ `excel`.
10. لا توجد كروت أو جداول تختفي بسبب اختلاف `data.data`.

---

# الجزء الأول — إنشاء Utilities موحدة

## 1. إنشاء ملف helpers عام للتحليلات

أنشئ الملف:

```txt
admin-dashboard/src/features/analytics/utils/analyticsDataGuards.ts
```

وأضف التالي:

```ts
export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  data?: T;
  requestId?: string;
  message?: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

export const unwrapApiData = <T = any>(response: any): T => {
  return response?.data?.data ?? response?.data ?? response;
};

export const unwrapNestedApiData = <T = any>(response: any): T => {
  const first = unwrapApiData<any>(response);
  return first?.data ?? first;
};

export const asArray = <T = any>(value: unknown): T[] => {
  return Array.isArray(value) ? value : [];
};

export const toNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const toStringValue = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

export const normalizeFormat = (format?: string): string => {
  if (!format) return 'pdf';
  const lowered = String(format).toLowerCase();
  if (lowered === 'excel') return 'xlsx';
  return lowered;
};

export const buildPaginationMeta = (
  meta: any,
  rowsLength: number,
  defaults?: Partial<PaginationMeta>
): PaginationMeta => {
  const page = toNumber(meta?.page, defaults?.page ?? 1);
  const limit = toNumber(meta?.limit, defaults?.limit ?? rowsLength);
  const total = toNumber(meta?.total, defaults?.total ?? rowsLength);
  const totalPages = toNumber(
    meta?.totalPages,
    defaults?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)))
  );

  return { total, page, limit, totalPages };
};

export const unwrapPaginatedResult = <T = any>(
  response: any,
  mapper?: (item: any) => T,
  defaults?: Partial<PaginationMeta>
): PaginatedResult<T> => {
  const payload = unwrapApiData<any>(response);

  const rowsSource = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  const rows = mapper ? rowsSource.map(mapper) : rowsSource;
  const meta = buildPaginationMeta(payload?.meta ?? payload, rows.length, defaults);

  return { data: rows, meta };
};
```

## ملاحظات مهمة

- لا تستخدم `response.data.data` مباشرة بعد الآن داخل `analyticsApi`.
- لا تستخدم `data || []` لحماية الرسوم، لأن object سيظل truthy.
- استخدم دائمًا:

```ts
asArray(data)
```

---

# الجزء الثاني — إنشاء Mappers للتحليلات العامة

## 2. إنشاء ملف dashboard analytics mapper

أنشئ الملف:

```txt
admin-dashboard/src/features/analytics/utils/analyticsDashboardMappers.ts
```

وأضف:

```ts
import { asArray, toNumber } from './analyticsDataGuards';

export const mapAnalyticsDashboard = (data: any) => {
  const overview = data?.overview ?? {};
  const kpis = data?.kpis ?? {};

  return {
    overview: {
      totalUsers: toNumber(overview.totalUsers),
      totalRevenue: toNumber(overview.totalRevenue),
      totalOrders: toNumber(overview.totalOrders),
      activeServices: toNumber(overview.activeServices),
      openSupportTickets: toNumber(overview.openSupportTickets),
      systemHealth: overview.systemHealth === null || overview.systemHealth === undefined
        ? null
        : toNumber(overview.systemHealth),
    },

    kpis: {
      revenueGrowth: toNumber(kpis.revenueGrowth),
      customerSatisfaction: toNumber(kpis.customerSatisfaction),
      orderConversion: toNumber(kpis.orderConversion),
      serviceEfficiency: toNumber(kpis.serviceEfficiency),
      supportResolution: toNumber(kpis.supportResolution),
      systemUptime: toNumber(kpis.systemUptime),
    },

    revenueDaily: asArray<any>(data?.revenueCharts?.daily).map((item) => ({
      date: item.date,
      revenue: toNumber(item.revenue),
      orders: toNumber(item.orders),
    })),

    revenueMonthly: asArray<any>(data?.revenueCharts?.monthly).map((item) => ({
      month: item.month,
      date: item.month,
      revenue: toNumber(item.revenue),
      growth: toNumber(item.growth),
    })),

    revenueByCategory: asArray<any>(data?.revenueCharts?.byCategory),

    userRegistrationTrend: asArray<any>(data?.userCharts?.registrationTrend).map((item) => ({
      date: item.date,
      newUsers: toNumber(item.newUsers),
      activeUsers: toNumber(item.activeUsers),
    })),

    userTypes: asArray<any>(data?.userCharts?.userTypes).map((item) => ({
      type: item.type,
      name: item.type,
      count: toNumber(item.count),
      value: toNumber(item.count),
      percentage: toNumber(item.percentage),
    })),

    geographic: asArray<any>(data?.userCharts?.geographic),

    topProducts: asArray<any>(data?.productCharts?.topSelling).map((item) => ({
      name: item.name ?? item.product ?? 'غير معروف',
      product: item.product ?? item.name ?? 'غير معروف',
      sold: toNumber(item.sold ?? item.sales),
      sales: toNumber(item.sales ?? item.sold),
      revenue: toNumber(item.revenue),
    })),

    categoryPerformance: asArray<any>(data?.productCharts?.categoryPerformance),
    stockAlerts: asArray<any>(data?.productCharts?.stockAlerts),

    serviceRequests: asArray<any>(data?.serviceCharts?.requestTrend).map((item) => ({
      date: item.date,
      requests: toNumber(item.requests),
      completed: toNumber(item.completed),
    })),

    engineerPerformance: asArray<any>(data?.serviceCharts?.engineerPerformance),

    responseTimes: {
      average: toNumber(data?.serviceCharts?.responseTimes?.average),
      target: toNumber(data?.serviceCharts?.responseTimes?.target),
      trend: asArray<any>(data?.serviceCharts?.responseTimes?.trend).map((value, index) => ({
        index: index + 1,
        value: toNumber(value),
        hours: toNumber(value),
      })),
    },

    supportTickets: asArray<any>(data?.supportCharts?.ticketTrend).map((item) => ({
      date: item.date,
      new: toNumber(item.new),
      newTickets: toNumber(item.new),
      resolved: toNumber(item.resolved),
    })),

    supportCategories: asArray<any>(data?.supportCharts?.categoryBreakdown).map((item) => ({
      category: item.category,
      name: item.category,
      count: toNumber(item.count),
      value: toNumber(item.count),
      avgResolutionTime: toNumber(item.avgResolutionTime),
    })),

    agentPerformance: asArray<any>(data?.supportCharts?.agentPerformance),

    raw: data,
  };
};
```

---

# الجزء الثالث — إنشاء Mappers للتحليلات المتقدمة

## 3. إنشاء ملف advanced analytics mapper

أنشئ الملف:

```txt
admin-dashboard/src/features/analytics/utils/advancedAnalyticsMappers.ts
```

وأضف:

```ts
import { asArray, toNumber, toStringValue } from './analyticsDataGuards';

export const mapSalesAnalytics = (data: any) => ({
  totalRevenue: toNumber(data?.totalRevenue),
  totalOrders: toNumber(data?.totalOrders),
  averageOrderValue: toNumber(data?.averageOrderValue),
  salesGrowth: toNumber(data?.salesGrowth),
  revenueGrowth: toNumber(data?.revenueGrowth),
  ordersGrowth: toNumber(data?.ordersGrowth),

  salesByDate: asArray<any>(data?.salesByDate).map((item) => ({
    date: item.date,
    revenue: toNumber(item.revenue),
    orders: toNumber(item.orders),
  })),

  salesByCategory: asArray<any>(data?.salesByCategory),
  salesByPaymentMethod: asArray<any>(data?.salesByPaymentMethod).map((item) => ({
    method: item.method,
    amount: toNumber(item.amount),
    count: toNumber(item.count),
  })),

  topProducts: asArray<any>(data?.topProducts).map((item) => ({
    id: item.id,
    product: item.product ?? item.name ?? 'غير معروف',
    name: item.name ?? item.product ?? 'غير معروف',
    sales: toNumber(item.sales ?? item.sold),
    sold: toNumber(item.sold ?? item.sales),
    revenue: toNumber(item.revenue),
  })),
});

export const mapFinancialReport = (data: any) => ({
  revenue: toNumber(data?.revenue ?? data?.totalRevenue),
  revenueGrowth: toNumber(data?.revenueGrowth),

  cashFlow: asArray<any>(data?.cashFlow).map((item) => ({
    date: item.date,
    revenue: toNumber(item.revenue),
    balance: toNumber(item.balance),
  })),

  revenueBySource: asArray<any>(data?.revenueBySource).map((item) => ({
    source: item.source,
    amount: toNumber(item.amount),
    percentage: toNumber(item.percentage),
  })),
});

export const mapInventoryReport = (data: any) => ({
  totalProducts: toNumber(data?.totalProducts),
  inStock: toNumber(data?.inStock),
  lowStock: toNumber(data?.lowStock),
  outOfStock: toNumber(data?.outOfStock),
  totalValue: toNumber(data?.totalValue),

  totalProductsGrowth: toNumber(data?.totalProductsGrowth),
  inStockGrowth: toNumber(data?.inStockGrowth),
  outOfStockGrowth: toNumber(data?.outOfStockGrowth),
  totalValueGrowth: toNumber(data?.totalValueGrowth),

  byCategory: asArray<any>(data?.byCategory),
  movements: asArray<any>(data?.movements).map((item) => ({
    date: item.date,
    type: item.type,
    quantity: toNumber(item.quantity),
    product: item.product ?? 'غير معروف',
  })),
});

export const mapMarketingReport = (data: any) => ({
  totalCampaigns: toNumber(data?.totalCampaigns),
  activeCampaigns: toNumber(data?.activeCampaigns),
  totalCoupons: toNumber(data?.totalCoupons),
  activeCoupons: toNumber(data?.activeCoupons),
  roi: toNumber(data?.roi),
  conversionRate: toNumber(data?.conversionRate),
  totalDiscountGiven: toNumber(data?.totalDiscountGiven),

  totalCouponsGrowth: toNumber(data?.totalCouponsGrowth),
  totalDiscountGrowth: toNumber(data?.totalDiscountGrowth),
  roiGrowth: toNumber(data?.roiGrowth),
  conversionRateGrowth: toNumber(data?.conversionRateGrowth),

  campaignPerformance: asArray<any>(data?.campaignPerformance).map((item) => ({
    campaignId: item.campaignId,
    campaign: item.campaign ?? item.name ?? 'حملة غير معروفة',
    name: item.name ?? item.campaign ?? 'حملة غير معروفة',
    reach: toNumber(item.reach ?? item.impressions),
    impressions: toNumber(item.impressions ?? item.reach),
    clicks: toNumber(item.clicks),
    conversions: toNumber(item.conversions),
    cost: toNumber(item.cost),
    revenue: toNumber(item.revenue),
    roi: toNumber(item.roi),
  })),

  topCoupons: asArray<any>(data?.topCoupons).map((item) => ({
    code: item.code,
    uses: toNumber(item.uses),
    revenue: toNumber(item.revenue),
    discount: toNumber(item.discount),
  })),
});

export const mapRealTimeMetrics = (data: any) => ({
  activeUsers: toNumber(data?.activeUsers),
  todaySales: toNumber(data?.todaySales),
  todayOrders: toNumber(data?.todayOrders),
  currentRevenue: toNumber(data?.currentRevenue),

  monthSales: toNumber(data?.monthSales ?? data?.currentRevenue),
  todayNewCustomers: toNumber(data?.todayNewCustomers),
  activeOrders: toNumber(data?.activeOrders),
  pendingOrders: toNumber(data?.pendingOrders),
  todayAbandonedCarts: toNumber(data?.todayAbandonedCarts),
  lowStockAlerts: toNumber(data?.lowStockAlerts),
  pendingSupportTickets: toNumber(data?.pendingSupportTickets),

  cpuUsage: toNumber(data?.cpuUsage),
  memoryUsage: toNumber(data?.memoryUsage),
  diskUsage: toNumber(data?.diskUsage),
  activeConnections: toNumber(data?.activeConnections),

  systemHealth: {
    status: toStringValue(data?.systemHealth?.status, 'healthy'),
    uptime: toNumber(data?.systemHealth?.uptime),
    responseTime: toNumber(data?.systemHealth?.responseTime),
    apiResponseTime: toNumber(data?.systemHealth?.apiResponseTime ?? data?.systemHealth?.responseTime),
    errorRate: toNumber(data?.systemHealth?.errorRate),
    diskUsage: toNumber(data?.systemHealth?.diskUsage),
  },

  lastUpdated: data?.lastUpdated ?? new Date().toISOString(),
});

export const mapCustomerAnalytics = (data: any) => ({
  totalCustomers: toNumber(data?.totalCustomers),
  newCustomers: toNumber(data?.newCustomers),
  activeCustomers: toNumber(data?.activeCustomers),
  customerLifetimeValue: toNumber(data?.customerLifetimeValue),

  totalCustomersGrowth: toNumber(data?.totalCustomersGrowth),
  newCustomersGrowth: toNumber(data?.newCustomersGrowth),
  activeCustomersGrowth: toNumber(data?.activeCustomersGrowth),
  customerLifetimeValueGrowth: toNumber(data?.customerLifetimeValueGrowth),

  customerSegments: asArray<any>(data?.customerSegments).map((item) => ({
    segment: item.segment,
    name: item.segment,
    count: toNumber(item.count),
    value: toNumber(item.count),
    percentage: toNumber(item.percentage),
  })),

  topCustomers: asArray<any>(data?.topCustomers).map((item) => ({
    id: item.id,
    name: item.name ?? 'عميل غير معروف',
    orders: toNumber(item.orders),
    totalSpent: toNumber(item.totalSpent),
  })),
});
```

---

# الجزء الرابع — Mappers للتقارير والتصدير والجدولة

## 4. إنشاء ملف report mappers

أنشئ الملف:

```txt
admin-dashboard/src/features/analytics/utils/reportMappers.ts
```

وأضف:

```ts
import { normalizeFormat, toBoolean, toNumber, toStringValue } from './analyticsDataGuards';

export const mapAdvancedReport = (report: any) => {
  const reportId = report?.reportId ?? report?.id;

  return {
    ...report,
    id: report?.id ?? reportId,
    reportId,
    title: toStringValue(report?.title, 'تقرير بدون عنوان'),
    titleEn: toStringValue(report?.titleEn, report?.title ?? 'Untitled Report'),
    category: toStringValue(report?.category, 'custom'),
    priority: toStringValue(report?.priority, 'medium'),
    status: toStringValue(report?.status, 'pending'),
    generatedAt: report?.generatedAt,
    createdAt: report?.createdAt,
    updatedAt: report?.updatedAt,
    createdBy: report?.createdBy,
    creatorName: report?.creatorName,
    isArchived: toBoolean(report?.isArchived),
    summary: {
      totalRecords: toNumber(report?.summary?.totalRecords),
      totalValue: toNumber(report?.summary?.totalValue),
      currency: report?.summary?.currency ?? 'YER',
      growth: toNumber(report?.summary?.growth),
    },
  };
};

export const mapExportFile = (file: any) => {
  const raw = typeof file === 'string' ? { fileUrl: file } : file ?? {};

  return {
    id: raw.id ?? raw._id ?? raw.fileUrl ?? raw.url,
    reportId: raw.reportId,
    fileUrl: raw.fileUrl ?? raw.url ?? raw.downloadUrl ?? '',
    fileName: raw.fileName ?? raw.filename ?? 'export-file',
    format: normalizeFormat(raw.format),
    fileSize: toNumber(raw.fileSize ?? raw.size),
    exportedAt: raw.exportedAt ?? raw.generatedAt ?? raw.createdAt,
    generatedAt: raw.generatedAt ?? raw.exportedAt ?? raw.createdAt,
    generatedBy: raw.generatedBy,
    status: raw.status ?? 'available',
  };
};

export const mapExportResult = (result: any) => {
  if (typeof result === 'string') {
    return {
      fileUrl: result,
      fileName: 'export-file',
      format: 'unknown',
      fileSize: 0,
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    fileUrl: result?.fileUrl ?? result?.url ?? result?.downloadUrl ?? '',
    fileName: result?.fileName ?? result?.filename ?? 'export-file',
    format: normalizeFormat(result?.format),
    fileSize: toNumber(result?.fileSize ?? result?.size),
    path: result?.path,
    exportedAt: result?.exportedAt ?? result?.generatedAt ?? new Date().toISOString(),
  };
};

export const mapSchedule = (schedule: any) => ({
  ...schedule,
  id: schedule?.id ?? schedule?._id,
  _id: schedule?._id ?? schedule?.id,
  name: schedule?.name ?? schedule?.title ?? 'جدولة بدون اسم',
  reportType: schedule?.reportType ?? schedule?.type ?? 'custom_report',
  frequency: schedule?.frequency ?? 'daily',
  format: normalizeFormat(schedule?.format),
  isActive: toBoolean(schedule?.isActive, true),
  lastRunAt: schedule?.lastRunAt,
  nextRunAt: schedule?.nextRunAt,
  lastResult: schedule?.lastResult,
  recipients: Array.isArray(schedule?.recipients) ? schedule.recipients : [],
});
```

---

# الجزء الخامس — تعديل analyticsApi لاستخدام Mappers

## 5. تعديل ملف API الرئيسي

افتح الملف الأقرب لهذا المسار:

```txt
admin-dashboard/src/features/analytics/api/analyticsApi.ts
```

أضف imports:

```ts
import {
  unwrapApiData,
  unwrapPaginatedResult,
} from '../utils/analyticsDataGuards';

import { mapAnalyticsDashboard } from '../utils/analyticsDashboardMappers';

import {
  mapSalesAnalytics,
  mapCustomerAnalytics,
  mapInventoryReport,
  mapFinancialReport,
  mapMarketingReport,
  mapRealTimeMetrics,
} from '../utils/advancedAnalyticsMappers';

import {
  mapAdvancedReport,
  mapExportFile,
  mapExportResult,
  mapSchedule,
} from '../utils/reportMappers';
```

## 5.1 إصلاح dashboard API

أي function تجلب dashboard analytics يجب أن تصبح:

```ts
getDashboardAnalytics: async (params?: any) => {
  const response = await apiClient.get('/analytics/dashboard', { params });
  return mapAnalyticsDashboard(unwrapApiData(response));
};
```

إذا كان endpoint اسمه مختلفًا مثل:

```txt
/analytics
/analytics/overview
```

استخدم endpoint الموجود فعليًا، لكن لا ترجع raw response.

## 5.2 إصلاح advanced APIs

```ts
getSalesAnalytics: async (params?: any) => {
  const response = await apiClient.get('/analytics/advanced/sales', { params });
  return mapSalesAnalytics(unwrapApiData(response));
};

getCustomerAnalytics: async (params?: any) => {
  const response = await apiClient.get('/analytics/advanced/customers', { params });
  return mapCustomerAnalytics(unwrapApiData(response));
};

getInventoryReport: async (params?: any) => {
  const response = await apiClient.get('/analytics/advanced/inventory', { params });
  return mapInventoryReport(unwrapApiData(response));
};

getFinancialReport: async (params?: any) => {
  const response = await apiClient.get('/analytics/advanced/financial', { params });
  return mapFinancialReport(unwrapApiData(response));
};

getMarketingReport: async (params?: any) => {
  const response = await apiClient.get('/analytics/advanced/marketing', { params });
  return mapMarketingReport(unwrapApiData(response));
};

getRealTimeMetrics: async () => {
  const response = await apiClient.get('/analytics/advanced/realtime');
  return mapRealTimeMetrics(unwrapApiData(response));
};
```

## 5.3 إصلاح إدارة التقارير

استبدل دالة `listAdvancedReports` بمنطق آمن:

```ts
listAdvancedReports: async (params: any = {}) => {
  const response = await apiClient.get('/analytics/advanced/reports', { params });

  return unwrapPaginatedResult(
    response,
    mapAdvancedReport,
    {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    }
  );
};
```

## 5.4 إصلاح جلب تقرير واحد

```ts
getAdvancedReport: async (reportId: string) => {
  const response = await apiClient.get(`/analytics/advanced/reports/${reportId}`);
  return mapAdvancedReport(unwrapApiData(response));
};
```

## 5.5 إصلاح تصدير تقرير

```ts
exportReport: async (reportId: string, data: any) => {
  const payload = {
    ...data,
    format: data?.format === 'excel' ? 'xlsx' : data?.format,
  };

  const response = await apiClient.post(
    `/analytics/advanced/reports/${reportId}/export`,
    payload
  );

  return mapExportResult(unwrapApiData(response));
};
```

## 5.6 إصلاح مركز التصدير

```ts
getExportedFiles: async (params: any = {}) => {
  const response = await apiClient.get('/analytics/advanced/reports/exports', { params });

  return unwrapPaginatedResult(
    response,
    mapExportFile,
    {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    }
  );
};
```

## 5.7 إصلاح التقارير المجدولة

أي دالة list schedules يجب أن تستخدم:

```ts
listSchedules: async (params: any = {}) => {
  const response = await apiClient.get('/analytics/report-schedules', { params });

  return unwrapPaginatedResult(
    response,
    mapSchedule,
    {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    }
  );
};
```

ودالة get schedule:

```ts
getSchedule: async (id: string) => {
  const response = await apiClient.get(`/analytics/report-schedules/${id}`);
  return mapSchedule(unwrapApiData(response));
};
```

---

# الجزء السادس — إصلاح Types المهمة

## 6. تحديث ReportFormat

ابحث عن enum الخاص بصيغ التقارير وعدّله إلى:

```ts
export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'xlsx',
  XLSX = 'xlsx',
  CSV = 'csv',
  JSON = 'json',
}
```

لا تستخدم `excel` كقيمة مرسلة للباك.

إذا كان هناك UI label باسم Excel، اتركه للعرض فقط، لكن القيمة تكون `xlsx`.

## 6.1 تحديث AdvancedReport

تأكد أن Type يدعم الاثنين:

```ts
export interface AdvancedReport {
  id?: string;
  reportId: string;
  title: string;
  titleEn?: string;
  category: string;
  priority: string;
  status: string;
  generatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  creatorName?: string;
  isArchived?: boolean;
  summary?: {
    totalRecords: number;
    totalValue: number;
    currency: string;
    growth: number;
  };
}
```

## 6.2 تحديث ExportFile

```ts
export interface ExportFile {
  id?: string;
  reportId?: string;
  fileUrl: string;
  fileName: string;
  format: string;
  fileSize?: number;
  exportedAt?: string;
  generatedAt?: string;
  generatedBy?: string;
  status?: 'available' | 'expired' | 'failed' | 'processing' | string;
}
```

## 6.3 تحديث RealTimeMetrics

```ts
export interface RealTimeMetrics {
  activeUsers: number;
  todaySales: number;
  todayOrders: number;
  currentRevenue: number;
  monthSales?: number;
  todayNewCustomers?: number;
  activeOrders?: number;
  pendingOrders?: number;
  todayAbandonedCarts?: number;
  lowStockAlerts?: number;
  pendingSupportTickets?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  activeConnections?: number;
  systemHealth: {
    status: string;
    uptime: number;
    responseTime?: number;
    apiResponseTime?: number;
    errorRate?: number;
    diskUsage?: number;
  };
  lastUpdated: string;
}
```

---

# الجزء السابع — حماية Recharts في كل Components

## 7. قاعدة إجبارية

أي component يستخدم:

```tsx
<LineChart data={...}>
<BarChart data={...}>
<PieChart>
<AreaChart data={...}>
<ComposedChart data={...}>
```

يجب ألا يمرر data إلا بعد `asArray`.

## مثال خاطئ

```tsx
<LineChart data={data || []}>
```

## مثال صحيح

```tsx
import { asArray } from '../utils/analyticsDataGuards';

const safeData = asArray(data);

<LineChart data={safeData}>
```

## 7.1 ابحث وعدّل كل المكونات التالية إن وجدت

- `RevenueChart.tsx`
- `UserAnalyticsChart.tsx`
- `ProductPerformanceChart.tsx`
- `ServiceAnalyticsChart.tsx`
- `SupportAnalyticsChart.tsx`
- `SalesAnalyticsCard.tsx`
- `CustomerAnalyticsCard.tsx`
- `InventoryReportCard.tsx`
- `FinancialReportCard.tsx`
- `MarketingReportCard.tsx`
- `RealTimeMetricsCard.tsx`
- أي component آخر يستخدم Recharts داخل feature analytics

## 7.2 إضافة حماية PieChart

أي Pie data يجب أن تكون array:

```tsx
const pieData = asArray(data).filter((item) => Number(item.value ?? item.count ?? 0) > 0);
```

لا تمرر object للـ Pie.

---

# الجزء الثامن — إصلاح استخدام البيانات في الصفحات

## 8. صفحة Analytics Dashboard

في صفحة `/analytics` أو component الرئيسي الخاص بها، يجب استخدام الـ mapper output فقط.

مثال:

```tsx
const { data: analytics } = useDashboardAnalytics(filters);
```

ثم:

```tsx
<RevenueChart data={analytics?.revenueDaily} />
<UserAnalyticsChart data={analytics?.userRegistrationTrend} />
<ProductPerformanceChart data={analytics?.topProducts} />
<ServiceAnalyticsChart data={analytics?.serviceRequests} />
<SupportAnalyticsChart data={analytics?.supportTickets} />
```

ممنوع تمرير:

```tsx
analytics?.revenueCharts
analytics?.userCharts
analytics?.productCharts
analytics?.serviceCharts
analytics?.supportCharts
```

لأنها objects.

---

## 8.1 صفحة التقارير

في صفحة إدارة التقارير، تأكد أن القراءة تكون:

```tsx
const reports = reportsData?.data ?? [];
const meta = reportsData?.meta;
```

لا تستخدم:

```tsx
Array.isArray(reportsData?.data) ? reportsData.data : []
```

إذا كانت دالة API أصبحت ترجع `PaginatedResult` موحد.

تأكد أن كل actions تستخدم:

```tsx
report.reportId
```

وليس:

```tsx
report.id
```

إلا كـ fallback.

---

## 8.2 صفحة مركز التصدير

يجب أن تستخدم:

```ts
analyticsApi.getExportedFiles()
```

وليس:

```ts
analyticsApi.listAdvancedReports()
```

لا تعتمد على `report.exports` في هذه المرحلة، لأن القائمة يجب أن تأتي من endpoint الصادرات.

---

# الجزء التاسع — تعديلات Backend بسيطة ومطلوبة في المرحلة الأولى

هذه المرحلة ليست Backend heavy، لكن هناك 3 تعديلات صغيرة ضرورية.

## 9.1 دعم alias لصيغة excel

في خدمة التصدير أو controller، أضف normalization:

```ts
function normalizeExportFormat(format: string) {
  const value = String(format || 'pdf').toLowerCase();
  return value === 'excel' ? 'xlsx' : value;
}
```

واستخدمها قبل استدعاء ExportService.

## 9.2 إرجاع reportId بجانب id في قائمة التقارير

في endpoint:

```txt
GET /analytics/advanced/reports
```

عند map النتائج، اجعل response يحتوي الاثنين:

```ts
{
  id: report.reportId,
  reportId: report.reportId,
  title: report.title,
  ...
}
```

هذا يقلل مشاكل الفرونت.

## 9.3 إرجاع currency = YER مؤقتًا

أي summary مالي يرجع:

```ts
currency: 'USD'
```

عدله إلى:

```ts
currency: 'YER'
```

أو اقرأها من إعدادات المتجر/النظام إن كانت موجودة.

---

# الجزء العاشر — قائمة بحث إلزامية داخل الكود

يجب البحث عن هذه العبارات وإصلاحها إن وجدت:

```txt
response.data.data
response.data.meta
report.id
report.reportId
data || []
LineChart data={data
BarChart data={data
AreaChart data={data
ComposedChart data={data
Pie data={data
format: 'excel'
ReportFormat.EXCEL = 'excel'
listAdvancedReports(
report.exports
fileUrl
window.open(response.data
```

ليست كل نتيجة خاطئة، لكن يجب مراجعتها ضمن نطاق analytics/reports/export.

---

# الجزء الحادي عشر — اختبارات يدوية إلزامية بعد التنفيذ

بعد تنفيذ المرحلة، اختبر يدويًا:

## 11.1 صفحة `/analytics`

- تفتح الصفحة بدون console errors.
- لا يظهر `slice is not a function`.
- كروت الأرقام تظهر.
- رسوم الإيرادات تظهر.
- رسوم المستخدمين تظهر.
- المنتجات تظهر بأسماء صحيحة.
- أقسام البيانات الفارغة لا تكسر الصفحة.

## 11.2 صفحة `/analytics/advanced`

- تبويب المبيعات يظهر.
- تبويب العملاء لا يتجمد بسبب customerIds.
- تبويب المخزون يظهر الحركات.
- تبويب الماليات يظهر cashFlow.
- تبويب التسويق يظهر أسماء الحملات.
- realtime لا يعرض undefined.

## 11.3 إدارة التقارير

- التقارير تظهر في الجدول.
- يظهر التقرير `REP-2026-05-000001` أو ما يعادله من API.
- أزرار view/download لا تستخدم undefined.
- pagination يقرأ meta الصحيح.

## 11.4 مركز التصدير

- الصفحة تستخدم endpoint الصادرات.
- لا تعتمد على `listAdvancedReports`.
- إذا لم توجد صادرات، يظهر empty state ولا تكسر الصفحة.

## 11.5 التصدير

- اختيار Excel يرسل `xlsx`.
- إذا رجع الباك string URL يتم فتحه.
- إذا رجع object فيه fileUrl يتم فتحه.

---

# الجزء الثاني عشر — اختبارات Unit بسيطة للـ Mappers

إن كان المشروع يحتوي test setup، أضف اختبارات لـ:

```txt
analyticsDataGuards.test.ts
analyticsDashboardMappers.test.ts
advancedAnalyticsMappers.test.ts
reportMappers.test.ts
```

اختبر على الأقل:

```ts
asArray({}) // []
asArray([]) // []
toNumber('33.25') // 33.25
normalizeFormat('excel') // xlsx
mapAdvancedReport({ id: 'REP-1' }).reportId // REP-1
mapExportResult('https://file.xlsx').fileUrl // https://file.xlsx
mapSalesAnalytics({ topProducts: [{ name: 'A', sales: 1 }] }).topProducts[0].product // A
```

إذا لا يوجد test setup، لا توقف التنفيذ، لكن اذكر في التقرير النهائي أنها لم تضاف بسبب عدم وجود test setup.

---

# الجزء الثالث عشر — ممنوعات المرحلة

ممنوع في هذه المرحلة:

- حذف endpoints قديمة بدون التأكد من عدم استخدامها.
- تغيير جذري في UI.
- تغيير أسماء Routes العامة.
- كسر backward compatibility.
- تحويل كل النظام إلى بنية جديدة مرة واحدة.
- تجاهل empty arrays.
- إخفاء الأخطاء بـ try/catch صامت.
- ترك `any` في كل مكان بدون سبب، لكن يسمح به داخل mappers فقط كطبقة عزل.

---

# الجزء الرابع عشر — تقرير التسليم المطلوب من وكيل AI

بعد التنفيذ، يجب أن يكتب الوكيل تقريرًا باسم:

```txt
IMPLEMENTATION_NOTES_PHASE_1_ANALYTICS_REPORTS.md
```

ويحتوي:

## 1. ما تم تنفيذه

- الملفات الجديدة.
- الملفات المعدلة.
- APIs التي تم إصلاحها.
- Components التي تم حمايتها.

## 2. المشاكل التي تم حلها

- `slice is not a function`
- `data.data`
- `id/reportId`
- `excel/xlsx`
- `fileUrl`

## 3. ما لم يتم تنفيذه ولماذا

أي شيء لم يتم تنفيذه يجب ذكر سببه بوضوح.

## 4. نتائج الاختبار اليدوي

ضع checklist:

```md
- [ ] /analytics opens without console errors
- [ ] /analytics/advanced opens without console errors
- [ ] Reports table shows API reports
- [ ] Export Center opens without crash
- [ ] Excel export sends xlsx
```

## 5. ملاحظات للمرحلة الثانية

اذكر أي مكونات تحتاج إعادة تصميم UI أو تحسينات بصرية في المرحلة القادمة.

---

# الخلاصة التنفيذية

هذه المرحلة تؤسس طبقة آمنة بين الباك والفرونت:

```txt
Raw API Response
  ↓
unwrapApiData / unwrapPaginatedResult
  ↓
Mapper / Normalizer
  ↓
Stable ViewModel
  ↓
Safe UI Components
```

بعدها تصبح مراحل تحسين الواجهة، التقارير، التصدير، والجدولة أسهل وأقل خطورة.

لا تنتقل إلى المرحلة الثانية قبل التأكد من أن هذه المرحلة أغلقت كل أخطاء قراءة البيانات والـ console crashes.
