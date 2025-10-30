import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { 
  People, 
  ShoppingCart, 
  AttachMoney, 
  Inventory, 
  Refresh, 
  TrendingUp
} from '@mui/icons-material';
import { usePerformanceMetrics } from '../../analytics/hooks/useAnalytics';
import {
  StatsCard,
  QuickStatsWidget,
  RevenueChart,
  TopProductsWidget,
  ActivityTimeline,
  CategoryDistribution,
  RecentOrders,
  QuickActions
} from '../components';
import {
  useDashboardOverview,
  useRecentOrders,
  useProductsCount,
  useTopProducts,
  useSalesAnalytics,
} from '../hooks';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/shared/utils/format';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  // Always use English numbers, regardless of language
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat('en-US'), []);
  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: i18n.language === 'ar' ? 'YER' : 'USD',
        maximumFractionDigits: 0,
      }),
    [i18n.language]
  );
  
  // Fetch real dashboard data from analytics API
  const { data: dashboardResponse, isLoading, error, refetch } = useDashboardOverview();
  const { data: recentOrdersData, isLoading: ordersLoading } = useRecentOrders(5);
  const { data: productsData } = useProductsCount();
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts();
  const { data: salesAnalyticsData, isLoading: salesLoading } = useSalesAnalytics();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceMetrics();

  // Extract dashboard data
  const dashboardData = dashboardResponse ?? dashboardResponse?.data;
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


  // Calculate real revenue growth from sales data
  const calculateRevenueGrowth = (): number | undefined => {
    // Try to get growth from sales analytics first (if available)
    if (salesAnalyticsData?.growthRate !== undefined && salesAnalyticsData.growthRate !== null) {
      return salesAnalyticsData.growthRate;
    }
    
    // Try to calculate from monthly data
    if (dashboardData?.revenueCharts?.monthly && dashboardData.revenueCharts.monthly.length >= 2) {
      const latest = dashboardData.revenueCharts.monthly[dashboardData.revenueCharts.monthly.length - 1];
      if (latest?.growth !== undefined && latest.growth !== null) {
        return latest.growth;
      }
    }
    
    // If no real data available, return undefined to hide the indicator
    return undefined;
  };

  const revenueGrowth = calculateRevenueGrowth();

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {t('dashboard:error.title', 'خطأ في تحميل البيانات')}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          {t('dashboard:error.retry', 'إعادة المحاولة')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {t('dashboard:header.title', 'لوحة التحكم الرئيسية')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                {t('dashboard:header.subtitle', 'مرحباً بك في لوحة تحكم تجدٌد')}
              </Typography>
              <TrendingUp sx={{ color: 'success.main' }} />
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.2s',
            }}
          >
            {t('dashboard:header.refresh', 'تحديث البيانات')}
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title={t('dashboard:stats.totalUsers.title', 'إجمالي المستخدمين')}
            value={formatNumber(dashboardData?.overview?.totalUsers)}
            icon={<People sx={{ fontSize: 32 }} />}
            growth={dashboardData?.kpis?.userGrowth ?? null}
            color="primary"
            subtitle={t('dashboard:stats.totalUsers.subtitle', 'مستخدم نشط')}
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title={t('dashboard:stats.totalOrders.title', 'إجمالي الطلبات')}
            value={formatNumber(dashboardData?.overview?.totalOrders)}
            icon={<ShoppingCart sx={{ fontSize: 32 }} />}
            growth={dashboardData?.kpis?.orderGrowth ?? null}
            color="success"
            subtitle={t('dashboard:stats.totalOrders.subtitle', 'طلب مكتمل')}
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title={t('dashboard:stats.totalRevenue.title', 'إجمالي الإيرادات')}
            value={formatCurrency(dashboardData?.overview?.totalRevenue || 0)}
            icon={<AttachMoney sx={{ fontSize: 32 }} />}
            growth={revenueGrowth}
            color="warning"
            subtitle={t('dashboard:stats.totalRevenue.subtitle', 'USD')}
            isLoading={isOverviewLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title={t('dashboard:stats.totalProducts.title', 'إجمالي المنتجات')}
            value={formatNumber(productsData?.count)}
            icon={<Inventory sx={{ fontSize: 32 }} />}
            growth={dashboardData?.kpis?.conversionRate ?? null}
            color="info"
            subtitle={t('dashboard:stats.totalProducts.subtitle', 'منتج متاح')}
            isLoading={isOverviewLoading}
          />
        </Grid>
      </Grid>

      {/* Revenue Chart & Performance Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueChart
            data={dashboardData?.revenueCharts?.daily || []}
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <QuickStatsWidget
            title={t('dashboard:quickStats.title', 'إحصائيات الأداء')}
            stats={{
              activeUsers: dashboardData?.overview?.totalUsers,
              systemHealth: performanceData?.uptime,
              errorRate: performanceData?.errorRate,
              responseTime: performanceData?.averageApiResponseTime,
            }}
            isLoading={performanceLoading}
          />
        </Grid>
      </Grid>

      {/* Top Products & Category Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopProductsWidget
            products={topProductsData}
            isLoading={topProductsLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoryDistribution
            salesData={salesAnalyticsData}
            isLoading={salesLoading}
          />
        </Grid>
      </Grid>

      {/* Recent Orders, Activity Timeline & Quick Actions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <RecentOrders
            orders={recentOrdersData}
            isLoading={ordersLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ActivityTimeline 
            recentOrders={recentOrdersData}
            isLoading={ordersLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <QuickActions />
        </Grid>
      </Grid>
    </Box>
  );
};
