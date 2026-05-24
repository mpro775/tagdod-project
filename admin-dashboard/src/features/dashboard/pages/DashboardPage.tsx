import React from 'react';
import { Grid } from '@mui/material';
import { AttachMoney, Inventory, People, Refresh, ShoppingCart } from '@mui/icons-material';
import { usePerformanceMetrics } from '../../analytics/hooks/useAnalytics';
import { QuickStatsWidget, RevenueChart, TopProductsWidget, RecentOrders, QuickActions } from '../components';
import {
  useDashboardOverview,
  useRecentOrders,
  useProductsCount,
  useTopProducts,
  useSalesAnalytics,
} from '../hooks';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/shared/utils/format';
import { ErrorState, PageHeader, PageShell, StatCard, usePageTitle } from '@/shared/design-system';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat('en-US'), []);
  const pageTitle = t('dashboard:header.title', 'لوحة التحكم الرئيسية');

  usePageTitle(pageTitle);

  const { data: dashboardResponse, isLoading, error, refetch } = useDashboardOverview();
  const { data: recentOrdersData, isLoading: ordersLoading } = useRecentOrders(5);
  const { data: productsData } = useProductsCount();
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts();
  const { data: salesAnalyticsData } = useSalesAnalytics();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceMetrics();

  const dashboardData = dashboardResponse;
  const isOverviewLoading = isLoading && !dashboardData;

  const formatNumber = React.useCallback(
    (value?: number | null) => {
      if (value === undefined || value === null) {
        return null;
      }
      return numberFormatter.format(value);
    },
    [numberFormatter]
  );

  const calculateRevenueGrowth = (): number | undefined => {
    if (salesAnalyticsData?.growthRate !== undefined && salesAnalyticsData.growthRate !== null) {
      return salesAnalyticsData.growthRate;
    }

    if (dashboardData?.revenueCharts?.monthly && dashboardData.revenueCharts.monthly.length >= 2) {
      const latest =
        dashboardData.revenueCharts.monthly[dashboardData.revenueCharts.monthly.length - 1];
      if (latest?.growth !== undefined && latest.growth !== null) {
        return latest.growth;
      }
    }

    return undefined;
  };

  const revenueGrowth = calculateRevenueGrowth();
  const buildTrend = (value?: number | null) =>
    value === undefined || value === null
      ? undefined
      : {
          value: `${numberFormatter.format(value)}%`,
          direction: value > 0 ? ('up' as const) : value < 0 ? ('down' as const) : ('flat' as const),
          label: t('dashboard:stats.trendLabel', 'عن الفترة السابقة'),
        };

  if (error) {
    return (
      <PageShell fullHeight>
        <PageHeader
          title={pageTitle}
          description={t('dashboard:header.subtitle', 'مرحباً بك في لوحة تحكم تجدد')}
        />
        <ErrorState
          title={t('dashboard:error.title', 'حدث خطأ أثناء تحميل البيانات')}
          onRetry={() => void refetch()}
          retryLabel={t('dashboard:error.retry', 'إعادة المحاولة')}
        />
      </PageShell>
    );
  }

  return (
    <PageShell fullHeight>
      <PageHeader
        title={pageTitle}
        description={t('dashboard:header.subtitle', 'مرحباً بك في لوحة تحكم تجدد')}
        actions={[
          {
            label: t('dashboard:header.refresh', 'تحديث البيانات'),
            icon: <Refresh />,
            onClick: () => void refetch(),
            variant: 'primary',
            loading: isLoading,
          },
        ]}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard:stats.totalUsers.title', 'إجمالي المستخدمين')}
            value={formatNumber(dashboardData?.overview?.totalUsers) ?? '-'}
            icon={<People fontSize="small" />}
            trend={buildTrend(dashboardData?.kpis?.userGrowth)}
            tone="primary"
            loading={isOverviewLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard:stats.totalOrders.title', 'إجمالي الطلبات')}
            value={formatNumber(dashboardData?.overview?.totalOrders) ?? '-'}
            icon={<ShoppingCart fontSize="small" />}
            trend={buildTrend(dashboardData?.kpis?.orderGrowth)}
            tone="success"
            loading={isOverviewLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard:stats.totalRevenue.title', 'إجمالي الإيرادات')}
            value={formatCurrency(dashboardData?.overview?.totalRevenue || 0)}
            icon={<AttachMoney fontSize="small" />}
            trend={buildTrend(revenueGrowth)}
            tone="warning"
            loading={isOverviewLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('dashboard:stats.totalProducts.title', 'إجمالي المنتجات')}
            value={formatNumber(productsData?.count) ?? '-'}
            icon={<Inventory fontSize="small" />}
            trend={buildTrend(dashboardData?.kpis?.conversionRate)}
            tone="info"
            loading={isOverviewLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueChart revenueCharts={dashboardData?.revenueCharts} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <QuickStatsWidget
            title={t('dashboard:quickStats.title', 'إحصائيات الأداء')}
            stats={{
              activeUsers: dashboardData?.overview?.totalUsers,
              systemHealth: performanceData?.uptime,
              errorRate: performanceData?.errorRate,
              responseTime: performanceData?.apiResponseTime,
            }}
            isLoading={performanceLoading}
          />
        </Grid>
      </Grid>

      <TopProductsWidget products={topProductsData} isLoading={topProductsLoading} />
      <RecentOrders orders={recentOrdersData} isLoading={ordersLoading} />
      <QuickActions />
    </PageShell>
  );
};
