# Analytics & Reports — Frontend Feature Documentation

## Overview

This document describes the frontend architecture, API layer, hooks, and contracts for the Analytics & Reports feature in the admin-dashboard.

## API Layer

All API calls are centralized in `features/analytics/api/analyticsApi.ts`. Each function returns typed data, not raw Axios responses.

### Typed Returns

```ts
getDashboard(params) => Promise<DashboardData>
getSalesAnalytics(params) => Promise<SalesAnalytics>
getCustomerAnalytics(params) => Promise<CustomerAnalytics>
getRealTimeMetrics() => Promise<RealTimeMetrics>
listAdvancedReports(params) => Promise<PaginatedResponse<AdvancedReport>>
```

No component should access `response.data.data` directly.

## Query Keys

All query keys are centralized in `features/analytics/utils/analyticsQueryKeys.ts`.

Example:
```ts
analyticsQueryKeys.dashboard(params)
analyticsQueryKeys.advancedSales(params)
analyticsQueryKeys.reports(params)
```

## Mappers

All backend-to-frontend mapping is done in:

- `utils/advancedAnalyticsMappers.ts`
- `utils/reportMappers.ts`
- `utils/exportMappers.ts`
- `utils/analyticsDashboardMappers.ts`

## Error Boundaries

Main pages are wrapped with `AnalyticsErrorBoundary`:

- `AnalyticsMainPage`
- `AdvancedAnalyticsDashboardPage`
- `ReportsManagementPage`
- `ScheduledReportsPage`
- `ExportCenterPage`

## Formatters

All formatting utilities are in `utils/formatters.ts`:

```ts
formatNumber(value) => string
formatCurrency(value, currency = 'YER') => string
formatPercent(value) => string
formatDateLabel(dateStr) => string
formatMonthLabel(dateStr) => string
formatShortDate(dateStr) => string
formatFileSize(bytes) => string
formatDuration(seconds) => string
```

## Currency Policy

- Default currency: **YER**
- `formatCurrency` defaults to YER.
- `reportMappers` defaults `summary.currency` to YER when missing from backend.

## State Management

- React Query (TanStack Query) is used for server state.
- Zustand is NOT used for analytics server state.
- Hooks in `hooks/useAnalytics.ts` encapsulate all queries and mutations.

## Testing

Unit tests are located in `utils/__tests__/`:

- `advancedAnalyticsMappers.test.ts`
- `reportMappers.test.ts`
- `analyticsDataGuards.test.ts`
- `formatters.test.ts`

Run tests:
```bash
npm run test
```

## Responsive & RTL

- All pages support RTL.
- Responsive breakpoints tested: 375px, 430px, 768px, 1024px, 1280px, 1440px.
- `useBreakpoint` hook is used for responsive layouts.

## Known Limitations

- Infrastructure metrics (CPU/RAM/Disk) are not shown in realtime unless backend monitoring integration is configured.
- Export deletion may be disabled depending on backend storage implementation.
- `customerIds` are not included in customer segment cards by default.

## Change Log

### Phase 5 — Final Hardening
- Unified response wrappers across all endpoints.
- Added `resolveAnalyticsDateRange` helper on backend.
- Changed default currency from USD to YER.
- Fixed `systemHealth` shape (object instead of raw number).
- Removed `customerIds` from default customer segments.
- Added pagination with `meta` to all list endpoints.
- Added security checks for schedule ownership.
- Created centralized `analyticsQueryKeys`.
- Added Error Boundaries to all main pages.
- Added unit tests for mappers and formatters.
- Updated contract documentation.
