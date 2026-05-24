import React, { useMemo } from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import {
  AttachMoney,
  Inventory,
  People,
  Refresh,
  ShoppingCart,
  SupportAgent,
  AccessTime,
} from '@mui/icons-material';
import { usePerformanceMetrics } from '../../analytics/hooks/useAnalytics';
import { QuickStatsWidget, RevenueChart, TopProductsWidget, RecentOrders, QuickActions, AttentionCenter } from '../components';
import type { AttentionItem } from '../components/AttentionCenter';
import {
  useDashboardOverview,
  useRecentOrders,
  useProductsCount,
  useTopProducts,
  useSalesAnalytics,
} from '../hooks';
import { useOrderStats } from '@/features/orders/hooks/useOrders';
import { useUnreadSupportCount } from '@/features/support/hooks/useSupport';
import { useCartStatistics } from '@/features/cart/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/shared/utils/format';
import {
  ErrorState,
  PageHeader,
  PageShell,
  PageSummaryGrid,
  StatCard,
  usePageTitle,
} from '@/shared/design-system';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), []);
  const pageTitle = t('dashboard:header.title', 'لوحة التحكم الرئيسية');

  usePageTitle(pageTitle);

  const { data: dashboardData, isLoading, error, refetch } = useDashboardOverview();
  const { data: recentOrdersData, isLoading: ordersLoading } = useRecentOrders(5);
  const { data: productsData } = useProductsCount();
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts();
  const { data: salesAnalyticsData } = useSalesAnalytics();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceMetrics();
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStats();
  const { data: supportData } = useUnreadSupportCount(60000);
  const { data: cartStats, isLoading: cartStatsLoading } = useCartStatistics();

  const isOverviewLoading = isLoading && !dashboardData;

  const formatNumber = useMemo(
    () => (value?: number | null) => {
      if (value === undefined || value === null) return null;
      return numberFormatter.format(value);
    },
    [numberFormatter]
  );

  const calculateRevenueGrowth = (): number | undefined => {
    if (salesAnalyticsData?.growthRate !== undefined && salesAnalyticsData.growthRate !== null) {
      return salesAnalyticsData.growthRate;
    }
    if (dashboardData?.revenueCharts?.monthly && dashboardData.revenueCharts.monthly.length >= 2) {
      const latest = dashboardData.revenueCharts.monthly[dashboardData.revenueCharts.monthly.length - 1];
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
          value: `${numberFormatter.format(Math.abs(value))}%`,
          direction: (value > 0 ? 'up' : value < 0 ? 'down' : 'flat') as 'up' | 'down' | 'flat',
          label: t('dashboard:stats.trendLabel', 'عن الفترة السابقة'),
        };

  const pendingOrdersCount = orderStats?.pending_payment ?? 0;
  const openTicketsCount = supportData?.unreadTicketsCount ?? 0;
  const abandonedCartsCount = cartStats?.allTime?.abandoned ?? 0;
  const lowStockCount = dashboardData?.overview?.lowStockProducts ?? productsData?.lowStock ?? 0;

  const attentionItems = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    if (pendingOrdersCount > 0) {
      items.push({
        id: 'pending-orders',
        type: 'pending_order',
        title: t('dashboard:attention.pendingOrders', 'طلبات معلقة'),
        description: t('dashboard:attention.pendingOrdersDesc', 'طلبات بانتظار المراجعة أو الدفع'),
        count: pendingOrdersCount,
        linkTo: '/orders',
        tone: 'warning',
      });
    }
    if (lowStockCount > 0) {
      items.push({
        id: 'low-stock',
        type: 'low_stock',
        title: t('dashboard:attention.lowStock', 'منتجات منخفضة المخزون'),
        description: t('dashboard:attention.lowStockDesc', 'منتجات تحتاج إعادة توريد'),
        count: lowStockCount,
        linkTo: '/products/inventory',
        tone: 'error',
      });
    }
    if (abandonedCartsCount > 0) {
      items.push({
        id: 'abandoned-carts',
        type: 'abandoned_cart',
        title: t('dashboard:attention.abandonedCarts', 'سلات متروكة'),
        description: t('dashboard:attention.abandonedCartsDesc', 'سلات تحتاج متابعة واسترداد'),
        count: abandonedCartsCount,
        linkTo: '/carts',
        tone: 'info',
      });
    }
    if (openTicketsCount > 0) {
      items.push({
        id: 'open-tickets',
        type: 'open_ticket',
        title: t('dashboard:attention.openTickets', 'تذاكر دعم مفتوحة'),
        description: t('dashboard:attention.openTicketsDesc', 'تذاكر تحتاج رد'),
        count: openTicketsCount,
        linkTo: '/support',
        tone: 'warning',
      });
    }
    return items;
  }, [pendingOrdersCount, lowStockCount, abandonedCartsCount, openTicketsCount, t]);

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
        meta={
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {t('dashboard:header.lastUpdate', 'آخر تحديث: الآن')}
            </Typography>
          </Stack>
        }
      />

      {/* KPI Cards */}
      <PageSummaryGrid columns={4}>
        <StatCard
          title={t('dashboard:stats.totalRevenue.title', 'إجمالي المبيعات')}
          value={formatCurrency(dashboardData?.overview?.totalRevenue || 0)}
          icon={<AttachMoney fontSize="small" />}
          trend={buildTrend(revenueGrowth)}
          tone="success"
          loading={isOverviewLoading}
          linkTo="/analytics"
          description={t('dashboard:stats.totalRevenue.desc', 'إجمالي الإيرادات')}
        />
        <StatCard
          title={t('dashboard:stats.totalOrders.title', 'الطلبات الجديدة')}
          value={formatNumber(dashboardData?.overview?.totalOrders) ?? '-'}
          icon={<ShoppingCart fontSize="small" />}
          trend={buildTrend(dashboardData?.kpis?.orderGrowth)}
          tone="primary"
          loading={isOverviewLoading}
          linkTo="/orders"
          description={t('dashboard:stats.totalOrders.desc', 'جميع الطلبات')}
        />
        <StatCard
          title={t('dashboard:stats.totalUsers.title', 'المستخدمون الجدد')}
          value={formatNumber(dashboardData?.overview?.totalUsers) ?? '-'}
          icon={<People fontSize="small" />}
          trend={buildTrend(dashboardData?.kpis?.userGrowth)}
          tone="info"
          loading={isOverviewLoading}
          linkTo="/users"
        />
        <StatCard
          title={t('dashboard:stats.totalProducts.title', 'المنتجات')}
          value={formatNumber(productsData?.count) ?? '-'}
          icon={<Inventory fontSize="small" />}
          trend={buildTrend(dashboardData?.kpis?.conversionRate)}
          tone="neutral"
          loading={isOverviewLoading}
          linkTo="/products"
        />
        <StatCard
          title={t('dashboard:stats.supportTickets.title', 'تذاكر الدعم المفتوحة')}
          value={String(openTicketsCount)}
          icon={<SupportAgent fontSize="small" />}
          tone={openTicketsCount > 0 ? 'warning' : 'success'}
          loading={false}
          linkTo="/support"
          description={t('dashboard:stats.supportTickets.desc', 'تذاكر تحتاج رد')}
        />
        <StatCard
          title={t('dashboard:stats.abandonedCarts.title', 'السلات المتروكة')}
          value={String(abandonedCartsCount)}
          icon={<ShoppingCart fontSize="small" />}
          tone={abandonedCartsCount > 0 ? 'warning' : 'success'}
          loading={cartStatsLoading}
          linkTo="/carts"
          description={t('dashboard:stats.abandonedCarts.desc', 'سلات تحتاج متابعة')}
        />
      </PageSummaryGrid>

      {/* Attention Center */}
      <AttentionCenter
        items={attentionItems}
        isLoading={orderStatsLoading}
        maxItems={5}
      />

      {/* Charts Row */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <Box sx={{ overflow: 'hidden' }}>
            <RevenueChart revenueCharts={dashboardData?.revenueCharts} isLoading={isLoading} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <Box sx={{ overflow: 'hidden' }}>
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
          </Box>
        </Grid>
      </Grid>

      {/* Top Products & Recent Orders */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 6 }} sx={{ minWidth: 0 }}>
          <Box sx={{ overflow: 'hidden' }}>
            <TopProductsWidget products={topProductsData} isLoading={topProductsLoading} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 6 }} sx={{ minWidth: 0 }}>
          <Box sx={{ overflow: 'hidden' }}>
            <RecentOrders orders={recentOrdersData} isLoading={ordersLoading} />
          </Box>
        </Grid>
      </Grid>

      <QuickActions />
    </PageShell>
  );
};