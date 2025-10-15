import React from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { People, ShoppingCart, AttachMoney, TrendingUp, Inventory } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  usersGrowth: number;
  ordersGrowth: number;
  revenueGrowth: number;
  productsGrowth: number;
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
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // This will be replaced with actual API call
      // const response = await apiClient.get('/admin/dashboard/stats');
      // return response.data;

      // Mock data for now
      return {
        totalUsers: 1250,
        totalOrders: 847,
        totalRevenue: 125000,
        totalProducts: 456,
        usersGrowth: 12.5,
        ordersGrowth: 8.3,
        revenueGrowth: 15.7,
        productsGrowth: 5.2,
      };
    },
  });

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          لوحة التحكم
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مرحباً بك في لوحة تحكم تقدودو
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي المستخدمين"
            value={stats?.totalUsers.toLocaleString('ar-SA') || 0}
            icon={<People sx={{ fontSize: 30 }} />}
            growth={stats?.usersGrowth}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الطلبات"
            value={stats?.totalOrders.toLocaleString('ar-SA') || 0}
            icon={<ShoppingCart sx={{ fontSize: 30 }} />}
            growth={stats?.ordersGrowth}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الإيرادات"
            value={`${stats?.totalRevenue?.toLocaleString('ar-SA') || 0} ر.س`}
            icon={<AttachMoney sx={{ fontSize: 30 }} />}
            growth={stats?.revenueGrowth}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي المنتجات"
            value={stats?.totalProducts.toLocaleString('ar-SA') || 0}
            icon={<Inventory sx={{ fontSize: 30 }} />}
            growth={stats?.productsGrowth}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                الطلبات الأخيرة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                سيتم عرض الطلبات الأخيرة هنا...
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                إجراءات سريعة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إضافة منتج، إنشاء كوبون، إلخ...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
