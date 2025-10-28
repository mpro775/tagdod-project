import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  CircularProgress,
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

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  
  // Fetch real dashboard data from analytics API
  const { data: dashboardResponse, isLoading, error, refetch } = useDashboardOverview();
  const { data: recentOrdersData, isLoading: ordersLoading } = useRecentOrders(5);
  const { data: productsData } = useProductsCount();
  const { data: topProductsData, isLoading: topProductsLoading } = useTopProducts();
  const { data: salesAnalyticsData, isLoading: salesLoading } = useSalesAnalytics();
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceMetrics();

  // Extract dashboard data
  const dashboardData = dashboardResponse?.data;

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

  if (isLoading) return <Box sx={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <CircularProgress size={60} />
  </Box>; // اعتمد فقط على overview

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          خطأ في تحميل البيانات
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          إعادة المحاولة
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
              لوحة التحكم الرئيسية
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                مرحباً بك في لوحة تحكم تجدٌد
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
            تحديث البيانات
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي المستخدمين"
            value={dashboardData?.overview?.totalUsers?.toLocaleString('ar-SA') || 0}
            icon={<People sx={{ fontSize: 32 }} />}
            growth={dashboardData?.kpis?.userGrowth}
            color="primary"
            subtitle="مستخدم نشط"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الطلبات"
            value={dashboardData?.overview?.totalOrders?.toLocaleString('ar-SA') || 0}
            icon={<ShoppingCart sx={{ fontSize: 32 }} />}
            growth={dashboardData?.kpis?.orderGrowth}
            color="success"
            subtitle="طلب مكتمل"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الإيرادات"
            value={dashboardData?.overview?.totalRevenue?.toLocaleString('ar-YE') || 0}
            icon={<AttachMoney sx={{ fontSize: 32 }} />}
            growth={revenueGrowth}
            color="warning"
            subtitle="ريال يمني"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي المنتجات"
            value={productsData?.count?.toLocaleString('ar-SA') || 0}
            icon={<Inventory sx={{ fontSize: 32 }} />}
            growth={dashboardData?.kpis?.conversionRate}
            color="info"
            subtitle="منتج متاح"
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
            title="إحصائيات الأداء"
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
