# Analytics & Reports System — API Contract & Architecture Documentation

## 1. Overview

This document defines the contracts, response shapes, and policies for the Analytics & Reports subsystem in the Tagadod platform. It covers:

- Dashboard Analytics
- Advanced Analytics (Sales, Products, Customers, Inventory, Financial, Cart, Marketing)
- Reports Management (Advanced Reports)
- Scheduled Reports
- Export Center

## 2. Endpoints

### 2.1 Dashboard Analytics

```
GET /analytics/dashboard
GET /analytics/overview
GET /analytics/kpis
GET /analytics/revenue
GET /analytics/users
GET /analytics/products
GET /analytics/services
GET /analytics/support
GET /analytics/performance
GET /analytics/trends/:metric
GET /analytics/comparison
```

### 2.2 Advanced Analytics

```
GET /analytics/advanced/sales
GET /analytics/advanced/products/performance
GET /analytics/advanced/customers
GET /analytics/advanced/inventory
GET /analytics/advanced/financial
GET /analytics/advanced/cart-analytics
GET /analytics/advanced/marketing
GET /analytics/advanced/realtime
GET /analytics/advanced/quick-stats
GET /analytics/advanced/comparison
GET /analytics/advanced/trends/:metric
GET /analytics/advanced/insights
```

### 2.3 Reports

```
POST /analytics/advanced/reports/generate
GET  /analytics/advanced/reports
GET  /analytics/advanced/reports/:reportId
POST /analytics/advanced/reports/:reportId/archive
DELETE /analytics/advanced/reports/:reportId
POST /analytics/advanced/reports/:reportId/export
GET  /analytics/advanced/reports/exports
POST /analytics/advanced/reports/custom/preview
POST /analytics/advanced/reports/custom/generate
```

### 2.4 Schedules

```
GET    /analytics/report-schedules
GET    /analytics/report-schedules/stats
GET    /analytics/report-schedules/:id
POST   /analytics/report-schedules
PATCH  /analytics/report-schedules/:id
DELETE /analytics/report-schedules/:id
POST   /analytics/report-schedules/:id/run-now
PATCH  /analytics/report-schedules/:id/toggle
```

### 2.5 Exports

```
GET /analytics/advanced/export/sales
GET /analytics/advanced/export/products
GET /analytics/advanced/export/customers
GET /analytics/export/:format
```

## 3. Response Shapes

### 3.1 Single Object Response

```ts
{
  success: true,
  data: T,
  requestId: string
}
```

### 3.2 Paginated List Response

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

## 4. Dashboard Data Contract

```ts
interface DashboardData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    activeServices?: number;
    openSupportTickets?: number;
    systemHealth?: {
      status: 'healthy' | 'warning' | 'critical' | 'unknown';
      score?: number | null;
      uptime?: number;
      responseTime?: number;
      errorRate?: number;
      lastCheckedAt?: string;
    } | null;
  };
  kpis: {
    revenueGrowth: number;
    userGrowth: number;
    orderGrowth: number;
    conversionRate: number;
    orderConversion?: number;
    customerSatisfaction?: number;
    serviceEfficiency?: number;
    supportResolution?: number;
    systemUptime?: number;
  };
  revenueCharts: {
    daily: Array<{ date: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
    byCategory: Array<{ category: string; revenue: number }>;
    byPaymentMethod: Array<{ method: string; amount: number }>;
  };
  userCharts: {
    registrations: Array<{ date: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    activeUsers: Array<{ date: string; count: number }>;
  };
  productCharts: {
    topSelling: Array<{ product: string; sales: number; revenue: number }>;
    byCategory: Array<{ category: string; count: number }>;
    lowStock: Array<{ product: string; stock: number }>;
  };
  serviceCharts?: {
    requests: Array<{ date: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    topEngineers: Array<{ name: string; jobs: number; rating: number }>;
  };
  supportCharts?: {
    tickets: Array<{ date: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
    satisfactionRate: number;
  };
}
```

## 5. Advanced Analytics Contracts

### 5.1 Sales Analytics

```ts
interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesGrowth?: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  salesByDate: Array<{ date: string; revenue: number; orders: number }>;
  salesByCategory: Array<{ category: string; revenue: number; percentage: number }>;
  salesByPaymentMethod: Array<{ method: string; amount: number; count: number }>;
  topProducts: Array<{ product: string; sales: number; revenue: number }>;
}
```

### 5.2 Customer Analytics

```ts
interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerLifetimeValue: number;
  totalCustomersGrowth?: number;
  newCustomersGrowth?: number;
  activeCustomersGrowth?: number;
  customerLifetimeValueGrowth?: number;
  topCustomers: Array<{ id: string; name: string; orders: number; totalSpent: number }>;
  customerSegments: Array<{ segment: string; count: number; percentage: number }>;
}
```

> **Note:** `customerSegments` does NOT include `customerIds` arrays by default. A separate endpoint is available for detailed segment customer lists.

### 5.3 Real-Time Metrics

```ts
interface RealTimeMetrics {
  activeUsers: number;
  todaySales: number;
  todayOrders: number;
  currentRevenue?: number;
  systemHealth: {
    status: string;
    uptime: number;
    responseTime: number;
    errorRate?: number;
  };
  lastUpdated: string;
}
```

> **Note:** Infrastructure-level metrics (CPU, RAM, Disk) are NOT returned in realtime metrics unless explicitly configured.

## 6. Reports Contract

### 6.1 Advanced Report

```ts
interface AdvancedReport {
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
    growth?: number;
  };
}
```

### 6.2 Paginated Reports List

```
GET /analytics/advanced/reports?page=1&limit=20
```

Response:
```ts
{
  success: true,
  data: {
    data: AdvancedReport[],
    meta: { total, page, limit, totalPages }
  },
  requestId: string
}
```

## 7. Schedules Contract

```ts
interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  reportType: string;
  frequency: string;
  formats: string[];
  recipients: string[];
  isActive: boolean;
  status: 'active' | 'paused' | 'inactive';
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  lastResult?: {
    success?: boolean;
    status?: string;
    message?: string;
    executionTime?: number;
    fileUrls?: string[];
    reportId?: string;
    error?: string;
  };
  runCount: number;
  successCount: number;
  failureCount: number;
  createdBy?: { _id: string; firstName?: string; lastName?: string };
  createdAt: string;
  updatedAt: string;
}
```

## 8. Export Contract

### 8.1 Export File

```ts
interface ExportFile {
  id?: string;
  reportId?: string;
  fileUrl: string;
  fileName: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  fileSize?: number;
  exportedAt?: string;
  generatedBy?: string;
  status?: 'available' | 'expired' | 'failed' | 'processing';
}
```

### 8.2 Supported Formats

- `pdf`
- `xlsx` (normalized from `excel`)
- `csv`
- `json`

## 9. Error Codes

| Code | Description |
|------|-------------|
| `ANALYTICS_DATE_RANGE_INVALID` | Date range is invalid or exceeds limits |
| `REPORT_NOT_FOUND` | Report ID does not exist |
| `REPORT_NOT_READY` | Report is still being generated |
| `EXPORT_FORMAT_UNSUPPORTED` | Requested export format is not supported |
| `EXPORT_FILE_NOT_FOUND` | Exported file does not exist or has expired |
| `SCHEDULE_NOT_FOUND` | Schedule ID does not exist |
| `SCHEDULE_RECIPIENTS_INVALID` | One or more recipient emails are invalid |
| `SCHEDULE_RUN_FAILED` | Schedule execution failed |
| `EXPORT_GENERATION_FAILED` | Export generation failed |

## 10. Currency Policy

- Default currency: **YER**
- All monetary values in analytics summaries, reports, and exports must use YER.
- If historical data lacks currency metadata, display as YER with documentation.

## 11. Date Range Policy

- Supported periods: `today`, `7d`, `30d`, `90d`, `month`, `quarter`, `year`, `custom`
- Custom ranges require both `startDate` and `endDate` (ISO 8601).
- Backend uses `resolveAnalyticsDateRange()` helper to normalize all date inputs.

## 12. Known Limitations

- Infrastructure CPU/RAM/Disk metrics are not available in realtime metrics unless a monitoring integration is explicitly configured.
- Export deletion may be disabled if backend storage deletion endpoint is not implemented.
- `customerIds` arrays inside customer segments are removed from default responses. Use a separate endpoint for detailed segment customer lists if needed.
- Schedule ownership checks are enforced; users cannot modify schedules they do not own.

## 13. Cache Strategy

| Endpoint Type | TTL |
|---------------|-----|
| Realtime metrics | 15s - 30s |
| Dashboard analytics | 60s - 5m |
| Advanced analytics | 5m - 15m |
| Reports list | 30s - 2m |
| Exports list | 30s - 2m |

Cache invalidation is triggered on new orders, order status changes, new users, inventory movements, and report/schedule/export generation events.

## 14. Pagination Rules

- Default limit: `20`
- Maximum limit: `100`
- Page minimum: `1`
- All list endpoints return `meta` with `total`, `page`, `limit`, `totalPages`.

## 15. Security Checks

- All analytics endpoints require `JwtAuthGuard` + `AdminGuard`.
- Report access is restricted by ownership (`createdBy`).
- Schedule modifications are restricted to the owner.
- Export file downloads verify user/store ownership.
- Path traversal is prevented; user-provided paths are rejected.

---

**Last Updated:** 2026-05-16
**Version:** 1.0.0 — Phase 5 Final Hardening
