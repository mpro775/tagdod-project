import { useState } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { AttachMoney, ShoppingCart, People, TrendingUp, Refresh } from '@mui/icons-material';
import { useDashboard, useRefreshAnalytics } from '../hooks/useAnalytics';
import { StatsCard } from '../components/StatsCard';
import { RevenueChart } from '../components/RevenueChart';
import { PieChartComponent } from '../components/PieChartComponent';
import { PeriodType } from '../types/analytics.types';
import { formatCurrency } from '@/shared/utils/formatters';

export const AnalyticsDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>(PeriodType.MONTHLY);

  const { data, isLoading } = useDashboard({ period });
  const { mutate: refresh, isPending: isRefreshing } = useRefreshAnalytics();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>الفترة</InputLabel>
          <Select
            value={period}
            label="الفترة"
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
          >
            <MenuItem value={PeriodType.DAILY}>يومي</MenuItem>
            <MenuItem value={PeriodType.WEEKLY}>أسبوعي</MenuItem>
            <MenuItem value={PeriodType.MONTHLY}>شهري</MenuItem>
            <MenuItem value={PeriodType.QUARTERLY}>ربع سنوي</MenuItem>
            <MenuItem value={PeriodType.YEARLY}>سنوي</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={isRefreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={() => refresh()}
          disabled={isRefreshing}
        >
          تحديث
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الإيرادات"
            value={formatCurrency(data?.overview?.totalRevenue || 0)}
            change={data?.kpis?.revenueGrowth}
            icon={<AttachMoney sx={{ fontSize: 32, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي الطلبات"
            value={data?.overview?.totalOrders || 0}
            change={data?.kpis?.orderGrowth}
            icon={<ShoppingCart sx={{ fontSize: 32, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي المستخدمين"
            value={data?.overview?.totalUsers || 0}
            change={data?.kpis?.userGrowth}
            icon={<People sx={{ fontSize: 32, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="متوسط قيمة الطلب"
            value={formatCurrency(data?.overview?.averageOrderValue || 0)}
            change={data?.kpis?.conversionRate}
            icon={<TrendingUp sx={{ fontSize: 32, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueChart
            data={data?.revenueCharts?.daily || []}
            title="الإيرادات اليومية"
            type="area"
            height={350}
          />
        </Grid>

        {/* Revenue by Category */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <PieChartComponent
            data={
              data?.revenueCharts?.byCategory?.map((item) => ({
                name: item.category,
                value: item.revenue,
              })) || []
            }
            title="الإيرادات حسب الفئة"
            height={350}
          />
        </Grid>
      </Grid>

      {/* More Charts */}
      <Grid container spacing={3}>
        {/* Top Selling Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PieChartComponent
            data={
              data?.productCharts?.topSelling?.slice(0, 5).map((item) => ({
                name: item.product,
                value: item.sales,
              })) || []
            }
            title="أكثر المنتجات مبيعاً"
          />
        </Grid>

        {/* Payment Methods */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PieChartComponent
            data={
              data?.revenueCharts?.byPaymentMethod?.map((item) => ({
                name: item.method,
                value: item.amount,
              })) || []
            }
            title="طرق الدفع"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
