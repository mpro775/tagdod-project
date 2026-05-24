import React, { useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import {
  AttachMoney,
  Inventory,
  People,
  ShoppingCart,
} from '@mui/icons-material';
import { usePerformanceMetrics } from '../../analytics/hooks/useAnalytics';
import {
  DashboardHero,
  CompactKpiCard,
  CompactAttentionCenter,
  RevenueIntelligence,
  CompactPerformanceWidget,
  CompactRecentOrders,
  CompactTopProducts,
  QuickActionsPanel,
} from '../components';
import type { AttentionActionItem } from '../components/CompactAttentionCenter';
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
import { ErrorState, PageShell, usePageTitle } from '@/shared/design-system';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), []);
  const pageTitle = t('dashboard:header.title', 'لوحة التحكم الرئيسية');
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly' | 'custom'>('monthly');

  usePageTitle(pageTitle);

  const { data: dashboardData, isLoading, error, refetch } = useDashboardOverview();
  const { data: recentOrdersData, isLoading: ordersLoading } = useRecentOrders(4);
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
    [numberFormatter],
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
          label: t('dashboard:stats.periodComparison', 'من الفترة السابقة'),
        };

  const pendingOrdersCount = orderStats?.pending_payment ?? 0;
  const openTicketsCount = supportData?.unreadTicketsCount ?? 0;
  const abandonedCartsCount = cartStats?.allTime?.abandoned ?? 0;
  const lowStockCount = dashboardData?.overview?.lowStockProducts ?? productsData?.lowStock ?? 0;

  const attentionItems = useMemo<AttentionActionItem[]>(() => {
    const items: AttentionActionItem[] = [
      {
        id: 'abandoned-carts',
        title: t('dashboard:attention.abandonedCarts', 'سلات متروكة'),
        count: abandonedCartsCount,
        description: abandonedCartsCount > 0
          ? t('dashboard:attention.abandonedCartsDesc', 'تحتاج متابعة واسترداد')
          : t('dashboard:attention.noCriticalItems', 'لا توجد سلات حرجة'),
        linkTo: '/carts',
        tone: abandonedCartsCount > 0 ? 'warning' : 'success',
      },
      {
        id: 'pending-orders',
        title: t('dashboard:attention.pendingOrders', 'طلبات معلقة'),
        count: pendingOrdersCount,
        description: pendingOrdersCount > 0
          ? t('dashboard:attention.pendingOrdersDesc', 'بانتظار مراجعة أو دفع')
          : t('dashboard:attention.noPendingOrders', 'لا توجد طلبات معلقة'),
        linkTo: '/orders',
        tone: pendingOrdersCount > 0 ? 'warning' : 'success',
      },
      {
        id: 'open-tickets',
        title: t('dashboard:attention.openTickets', 'تذاكر دعم'),
        count: openTicketsCount,
        description: openTicketsCount > 0
          ? t('dashboard:attention.openTicketsDesc', 'تحتاج رد')
          : t('dashboard:attention.allGood', 'كل شيء جيد'),
        linkTo: '/support',
        tone: openTicketsCount > 0 ? 'info' : 'success',
      },
      {
        id: 'low-stock',
        title: t('dashboard:attention.lowStock', 'مخزون منخفض'),
        count: lowStockCount,
        description: lowStockCount > 0
          ? t('dashboard:attention.lowStockDesc', 'منتجات تحتاج توريد')
          : t('dashboard:attention.stockStable', 'المخزون مستقر'),
        linkTo: '/products/inventory',
        tone: lowStockCount > 0 ? 'error' : 'success',
      },
    ];
    return items;
  }, [abandonedCartsCount, pendingOrdersCount, openTicketsCount, lowStockCount, t]);

  if (error) {
    return (
      <PageShell fullHeight>
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
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 1.5, sm: 2 },
          pb: 3,
        }}
      >
        <DashboardHero
          title={pageTitle}
          subtitle={t('dashboard:header.subtitle', 'نظرة تشغيلية سريعة على أداء منصة تجدد')}
          lastUpdateLabel={t('dashboard:header.lastUpdate', 'آخر تحديث: الآن')}
          isRefreshing={isLoading}
          onRefresh={() => void refetch()}
          period={period}
          onPeriodChange={setPeriod}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <CompactKpiCard
            title={t('dashboard:stats.totalRevenue.title', 'إجمالي الإيرادات')}
            value={formatCurrency(dashboardData?.overview?.totalRevenue || 0)}
            icon={<AttachMoney sx={{ fontSize: 20 }} />}
            tone="green"
            trend={buildTrend(revenueGrowth)}
            loading={isOverviewLoading}
            linkTo="/analytics"
            description={t('dashboard:stats.totalRevenue.subtitle', 'إجمالي الإيرادات')}
          />
          <CompactKpiCard
            title={t('dashboard:stats.totalOrders.title', 'إجمالي الطلبات')}
            value={formatNumber(dashboardData?.overview?.totalOrders) ?? '—'}
            icon={<ShoppingCart sx={{ fontSize: 20 }} />}
            tone="blue"
            trend={buildTrend(dashboardData?.kpis?.orderGrowth)}
            loading={isOverviewLoading}
            linkTo="/orders"
            description={t('dashboard:stats.totalOrders.subtitle', 'جميع الطلبات')}
          />
          <CompactKpiCard
            title={t('dashboard:stats.totalUsers.title', 'إجمالي المستخدمين')}
            value={formatNumber(dashboardData?.overview?.totalUsers) ?? '—'}
            icon={<People sx={{ fontSize: 20 }} />}
            tone="cyan"
            trend={buildTrend(dashboardData?.kpis?.userGrowth)}
            loading={isOverviewLoading}
            linkTo="/users"
          />
          <CompactKpiCard
            title={t('dashboard:stats.totalProducts.title', 'إجمالي المنتجات')}
            value={formatNumber(productsData?.count) ?? '—'}
            icon={<Inventory sx={{ fontSize: 20 }} />}
            tone="amber"
            trend={buildTrend(dashboardData?.kpis?.conversionRate)}
            loading={isOverviewLoading}
            linkTo="/products"
          />
        </Box>

        <CompactAttentionCenter
          items={attentionItems}
          isLoading={orderStatsLoading || cartStatsLoading}
        />

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RevenueIntelligence
              revenueCharts={dashboardData?.revenueCharts}
              salesAnalytics={salesAnalyticsData}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <CompactPerformanceWidget
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

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CompactRecentOrders orders={recentOrdersData} isLoading={ordersLoading} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <CompactTopProducts products={topProductsData} isLoading={topProductsLoading} />
          </Grid>
        </Grid>

        <QuickActionsPanel />
      </Box>
    </PageShell>
  );
};