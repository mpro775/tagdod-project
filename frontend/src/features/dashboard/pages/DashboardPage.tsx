import React from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress, Button, CircularProgress } from '@mui/material';
import { People, ShoppingCart, AttachMoney, TrendingUp, Inventory, Refresh, Support } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useDashboard, useRefreshAnalytics, usePerformanceMetrics } from '../../analytics/hooks/useAnalytics';
import { useSupportStats } from '../../support/hooks/useSupport';
import { apiClient } from '@/core/api/client';
import { QuickStatsWidget } from '../components/QuickStatsWidget';
import { MiniChartWidget } from '../components/MiniChartWidget';

// Interfaces
interface RecentOrder {
  id: string;
  orderNumber?: string;
  customer?: {
    name: string;
  };
  total?: number;
  status: 'completed' | 'pending' | 'cancelled' | string;
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  growth?: number;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, growth, color }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {growth !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp
                  sx={{
                    fontSize: 16,
                    mr: 0.5,
                    color: growth >= 0 ? 'success.main' : 'error.main',
                    transform: growth < 0 ? 'rotate(180deg)' : 'none',
                  }}
                />
                <Typography variant="body2" color={growth >= 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(growth)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  // Fetch real dashboard data from analytics API
  const { data: dashboardData, isLoading, error } = useDashboard();
  const { data: supportStats } = useSupportStats();
  const { mutate: refresh, isPending: isRefreshing } = useRefreshAnalytics();

  // Get additional stats for products count
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const response = await apiClient.get('/products/count');
      return response.data.data;
    },
  });

  // Get recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders/recent?limit=5');
      return response.data.data;
    },
  });

  // Get performance metrics
  const { data: performanceData, isLoading: performanceLoading } = usePerformanceMetrics();

  if (isLoading || productsLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          خطأ في تحميل البيانات
        </Typography>
        <Button variant="outlined" onClick={() => refresh()}>
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            لوحة التحكم
          </Typography>
          <Typography variant="body1" color="text.secondary">
            مرحباً بك في لوحة تحكم تقدودو
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={isRefreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={() => refresh()}
          disabled={isRefreshing}
        >
          تحديث البيانات
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي المستخدمين"
            value={dashboardData?.overview?.totalUsers?.toLocaleString('ar-SA') || 0}
            icon={<People sx={{ fontSize: 30 }} />}
            growth={dashboardData?.kpis?.userGrowth}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الطلبات"
            value={dashboardData?.overview?.totalOrders?.toLocaleString('ar-SA') || 0}
            icon={<ShoppingCart sx={{ fontSize: 30 }} />}
            growth={dashboardData?.kpis?.orderGrowth}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الإيرادات"
            value={`${dashboardData?.overview?.totalRevenue?.toLocaleString('ar-SA') || 0} ر.س`}
            icon={<AttachMoney sx={{ fontSize: 30 }} />}
            growth={dashboardData?.kpis?.revenueGrowth}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي المنتجات"
            value={productsData?.count?.toLocaleString('ar-SA') || 0}
            icon={<Inventory sx={{ fontSize: 30 }} />}
            growth={dashboardData?.kpis?.conversionRate}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="تذاكر الدعم المفتوحة"
            value={supportStats?.open?.toLocaleString('ar-SA') || 0}
            icon={<Support sx={{ fontSize: 30 }} />}
            growth={supportStats?.slaBreached ? -1 : 0}
            color={supportStats?.slaBreached && supportStats.slaBreached > 0 ? "error" : "success"}
          />
        </Grid>
      </Grid>

      {/* Performance Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
          <MiniChartWidget
            title="الاتجاهات اليومية"
            data={dashboardData?.revenueCharts?.daily?.slice(-7).map((item) => ({
              name: new Date(item.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }),
              value: item.revenue,
            })) || []}
            color="#4caf50"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Recent Orders & Quick Actions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                الطلبات الأخيرة
              </Typography>
              {ordersLoading ? (
                <LinearProgress />
              ) : recentOrders && recentOrders.length > 0 ? (
                <Box>
                  {recentOrders.map((order: RecentOrder, index: number) => (
                    <Box
                      key={order.id || index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < recentOrders.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          طلب #{order.orderNumber || order.id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer?.name || 'عميل'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {order.total?.toLocaleString('ar-SA') || 0} ر.س
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: order.status === 'completed' ? 'success.main' : 
                                   order.status === 'pending' ? 'warning.main' : 'error.main'
                          }}
                        >
                          {order.status === 'completed' ? 'مكتمل' :
                           order.status === 'pending' ? 'معلق' :
                           order.status === 'cancelled' ? 'ملغي' : order.status}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  لا توجد طلبات حديثة
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                إجراءات سريعة
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" size="small" fullWidth>
                  إضافة منتج جديد
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  إنشاء كوبون خصم
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  إضافة فئة جديدة
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  إدارة المخزون
                </Button>
                <Button variant="outlined" size="small" fullWidth>
                  عرض التقارير
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
