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
  Typography,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  AttachMoney,
  ShoppingCart,
  People,
  Refresh,
  Support as SupportIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useDashboard, useRefreshAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { PeriodType } from '../types/analytics.types';

import { RevenueChart } from '../components/RevenueChart';
import { MonthlyRevenueChart } from '../components/MonthlyRevenueChart';
import { UserAnalyticsChart } from '../components/UserAnalyticsChart';
import { UserTypesDistribution } from '../components/UserTypesDistribution';
import { ProductPerformanceChart } from '../components/ProductPerformanceChart';
import { ServiceAnalyticsChart } from '../components/ServiceAnalyticsChart';
import { SupportAnalyticsChart } from '../components/SupportAnalyticsChart';
import { DashboardSkeleton } from '../components/AnalyticsSkeleton';
import { AnalyticsCardErrorBoundary } from '../components/AnalyticsCardErrorBoundary';

export const AnalyticsDashboardPage: React.FC = () => {
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
  const [period, setPeriod] = useState<PeriodType>(PeriodType.MONTHLY);

  const { data: view, isLoading } = useDashboard({ period });
  const { mutate: refresh, isPending: isRefreshing } = useRefreshAnalytics();

  if (isLoading || !view) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <DashboardSkeleton />
      </Box>
    );
  }

  const lastUpdated = new Date().toLocaleTimeString('ar-YE');

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
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
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.subtitle')}
          </Typography>
        </Box>

        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          sx={{ alignItems: isMobile ? 'stretch' : 'center' }}
        >
          <FormControl
            sx={{
              minWidth: isMobile ? '100%' : 200,
              width: isMobile ? '100%' : undefined,
            }}
            size="small"
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
            startIcon={
              isRefreshing ? (
                <CircularProgress size={isMobile ? 16 : 20} />
              ) : (
                <Refresh sx={{ fontSize: isMobile ? 18 : undefined }} />
              )
            }
            onClick={() => refresh()}
            disabled={isRefreshing}
            size="small"
            fullWidth={isMobile}
          >
            {t('dashboard.refresh')}
          </Button>
        </Stack>
      </Stack>

      {/* Last Updated */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 2, textAlign: isMobile ? 'center' : 'left' }}
      >
        {t('dashboard.lastUpdated')}: {lastUpdated}
      </Typography>

      {/* KPI Overview Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
          <KpiCard
            title={t('dashboard.totalUsers')}
            value={formatNumber(view.overview.totalUsers)}
            change={view.kpis.revenueGrowth}
            icon={<People sx={{ fontSize: isMobile ? 24 : 28, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
          <KpiCard
            title={t('salesAnalytics.totalRevenue')}
            value={formatCurrency(view.overview.totalRevenue)}
            change={view.kpis.revenueGrowth}
            icon={<AttachMoney sx={{ fontSize: isMobile ? 24 : 28, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
          <KpiCard
            title={t('salesAnalytics.totalOrders')}
            value={formatNumber(view.overview.totalOrders)}
            change={view.kpis.orderConversion}
            icon={<ShoppingCart sx={{ fontSize: isMobile ? 24 : 28, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
          <KpiCard
            title={t('dashboard.activeServices')}
            value={formatNumber(view.overview.activeServices)}
            change={view.kpis.serviceEfficiency}
            icon={<BuildIcon sx={{ fontSize: isMobile ? 24 : 28, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
          <KpiCard
            title={t('dashboard.openSupportTickets')}
            value={formatNumber(view.overview.openSupportTickets)}
            change={view.kpis.supportResolution}
            icon={<SupportIcon sx={{ fontSize: isMobile ? 24 : 28, color: 'error.main' }} />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }} sx={{ minWidth: 0 }}>
          <KpiCard
            title={t('dashboard.systemHealth')}
            value={
              view.overview.systemHealth === null
                ? 'غير متاح'
                : `${view.overview.systemHealth.status}`
            }
            change={view.kpis.systemUptime}
            icon={<SpeedIcon sx={{ fontSize: isMobile ? 24 : 28, color: 'secondary.main' }} />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Revenue Section */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض مخطط الإيرادات">
            <RevenueChart data={view.revenueDaily} title="الإيرادات والطلبات اليومية" />
          </AnalyticsCardErrorBoundary>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض الإيرادات الشهرية">
            <MonthlyRevenueChart data={view.revenueMonthly} title="الإيرادات الشهرية والنمو" />
          </AnalyticsCardErrorBoundary>
        </Grid>
      </Grid>

      {/* Users Section */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض اتجاه المستخدمين">
            <UserAnalyticsChart data={view.userRegistrationTrend} title="اتجاه التسجيل والنشاط" />
          </AnalyticsCardErrorBoundary>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض توزيع المستخدمين">
            <UserTypesDistribution data={view.userTypes} title="توزيع أنواع المستخدمين" />
          </AnalyticsCardErrorBoundary>
        </Grid>
      </Grid>

      {/* Products Section */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
          <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض أداء المنتجات">
            <ProductPerformanceChart data={view.topProducts} title="أفضل المنتجات مبيعًا" />
          </AnalyticsCardErrorBoundary>
        </Grid>
      </Grid>

      {/* Services & Support Section */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ minWidth: 0 }}>
          <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض طلبات الخدمة">
            <ServiceAnalyticsChart data={view.serviceRequests} title="طلبات الخدمة" />
          </AnalyticsCardErrorBoundary>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ minWidth: 0 }}>
          <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض تذاكر الدعم">
            <SupportAnalyticsChart data={view.supportTickets} title="تذاكر الدعم" />
          </AnalyticsCardErrorBoundary>
        </Grid>
      </Grid>
    </Box>
  );
};

// ------------------------------------------------------------------
// KPI Card (inline for this page)
// ------------------------------------------------------------------
interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, color }) => {
  const { isMobile } = useBreakpoint();
  const theme = useTheme();

  const changeValue = change ?? 0;
  const isPositive = changeValue >= 0;

  return (
    <Card
      sx={{
        background:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette[color].main}22, ${theme.palette[color].main}0D)`
            : `linear-gradient(135deg, ${theme.palette[color].main}11, ${theme.palette[color].main}05)`,
        border: `1px solid ${theme.palette[color].main}20`,
      }}
    >
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {icon}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 500, fontSize: isMobile ? '0.75rem' : '0.8125rem' }}
          >
            {title}
          </Typography>
        </Stack>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontWeight: 'bold', fontSize: isMobile ? '1.125rem' : undefined }}
        >
          {value}
        </Typography>
        {change !== undefined && change !== null && !isNaN(change) && (
          <Typography
            variant="caption"
            sx={{
              color: isPositive ? 'success.main' : 'error.main',
              fontWeight: 600,
              fontSize: isMobile ? '0.6875rem' : '0.75rem',
            }}
          >
            {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(changeValue))}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

