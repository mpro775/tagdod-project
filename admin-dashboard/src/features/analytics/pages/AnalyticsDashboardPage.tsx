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
  Stack,
} from '@mui/material';
import { AttachMoney, ShoppingCart, People, TrendingUp, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useDashboard, useRefreshAnalytics } from '../hooks/useAnalytics';
import { StatsCard } from '../components/StatsCard';
import { RevenueChart } from '../components/RevenueChart';
import { PieChartComponent } from '../components/PieChartComponent';
import { PeriodType } from '../types/analytics.types';
import { formatCurrency, formatNumber } from '@/shared/utils/formatters';

export const AnalyticsDashboardPage: React.FC = () => {
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
  const [period, setPeriod] = useState<PeriodType>(PeriodType.MONTHLY);

  const { data, isLoading } = useDashboard({ period });
  const { mutate: refresh, isPending: isRefreshing } = useRefreshAnalytics();

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center"
        sx={{ 
          p: { xs: 2, sm: 4 },
          minHeight: { xs: 200, sm: 300 },
        }}
      >
        <CircularProgress size={isMobile ? 32 : 40} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 0 } }}>
      {/* Header */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={isMobile ? 1.5 : 0}
        sx={{
          mb: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <FormControl 
          sx={{ 
            minWidth: isMobile ? '100%' : 200,
            width: isMobile ? '100%' : undefined,
          }}
          size={isMobile ? 'medium' : 'medium'}
        >
          <InputLabel>{t('dashboard.period')}</InputLabel>
          <Select
            value={period}
            label={t('dashboard.period')}
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
            fullWidth={isMobile}
          >
            <MenuItem value={PeriodType.DAILY}>{t('dashboard.periodTypes.DAILY')}</MenuItem>
            <MenuItem value={PeriodType.WEEKLY}>{t('dashboard.periodTypes.WEEKLY')}</MenuItem>
            <MenuItem value={PeriodType.MONTHLY}>{t('dashboard.periodTypes.MONTHLY')}</MenuItem>
            <MenuItem value={PeriodType.QUARTERLY}>{t('dashboard.periodTypes.QUARTERLY')}</MenuItem>
            <MenuItem value={PeriodType.YEARLY}>{t('dashboard.periodTypes.YEARLY')}</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={isRefreshing ? <CircularProgress size={isMobile ? 16 : 20} /> : <Refresh sx={{ fontSize: isMobile ? 18 : undefined }} />}
          onClick={() => refresh()}
          disabled={isRefreshing}
          size={isMobile ? 'medium' : 'medium'}
          fullWidth={isMobile}
          sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
        >
          {t('dashboard.refresh')}
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatsCard
            title={t('salesAnalytics.totalRevenue')}
            value={formatCurrency(data?.overview?.totalRevenue || 0, 'USD', 'en')}
            change={data?.kpis?.revenueGrowth}
            icon={<AttachMoney sx={{ fontSize: isMobile ? 28 : 32, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatsCard
            title={t('salesAnalytics.totalOrders')}
            value={formatNumber(data?.overview?.totalOrders || 0, 'en')}
            change={data?.kpis?.orderGrowth}
            icon={<ShoppingCart sx={{ fontSize: isMobile ? 28 : 32, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatsCard
            title={t('dashboard.totalUsers')}
            value={formatNumber(data?.overview?.totalUsers || 0, 'en')}
            change={data?.kpis?.userGrowth}
            icon={<People sx={{ fontSize: isMobile ? 28 : 32, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatsCard
            title={t('salesAnalytics.averageOrderValue')}
            value={formatCurrency(data?.overview?.averageOrderValue || 0, 'USD', 'en')}
            change={data?.kpis?.conversionRate}
            icon={<TrendingUp sx={{ fontSize: isMobile ? 28 : 32, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
        {/* Revenue Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueChart
            data={data?.revenueCharts?.daily || []}
            title={t('financialReport.dailyRevenue')}
            type="area"
            height={isMobile ? 280 : 350}
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
            title={t('financialReport.revenueBySource')}
            height={isMobile ? 280 : 350}
          />
        </Grid>
      </Grid>

      {/* More Charts */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Top Selling Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PieChartComponent
            data={
              data?.productCharts?.topSelling?.slice(0, 5).map((item) => ({
                name: item.product,
                value: item.sales,
              })) || []
            }
            title={t('productPerformance.topProducts')}
            height={isMobile ? 280 : 300}
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
            title={t('salesAnalytics.paymentMethods')}
            height={isMobile ? 280 : 300}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
