import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  ConfirmationNumber,
  People,
  BarChart,
  ArrowDownward,
  ArrowUpward,
  Refresh,
  Download,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useCouponAnalytics,
  useCouponStatistics,
  useExportCouponsData,
} from '../../marketing/hooks/useMarketing';
import { formatCurrency } from '../../cart/api/cartApi';
import { toast } from 'react-hot-toast';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
}) => (
  <Card>
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="div"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
          >
            {value}
          </Typography>
          {change !== undefined && (
            <Box display="flex" alignItems="center" mt={1}>
              {change >= 0 ? (
                <ArrowUpward color="success" fontSize="small" />
              ) : (
                <ArrowDownward color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={change >= 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: { xs: 1, sm: 2 },
            borderRadius: '50%',
            backgroundColor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          <Icon sx={{ fontSize: { xs: 24, sm: 32 } }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const CouponAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('coupons');
  const { isMobile } = useBreakpoint();
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const {
    data: analyticsRaw,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useCouponAnalytics(undefined, analyticsPeriod);
  const {
    data: statisticsRaw,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useCouponStatistics(analyticsPeriod);

  // Extract data from nested response structure
  // extractResponseData should handle most cases, but we add an extra safety layer
  const getNestedData = (data: any): any => {
    if (!data) return null;

    // If it's an array, return as is
    if (Array.isArray(data)) return data;

    // Check if data has the properties we need directly
    const hasAnalyticsProps =
      data.statusBreakdown ||
      data.typeBreakdown ||
      data.topUsedCoupons ||
      data.totalInPeriod !== undefined ||
      data.period !== undefined;
    const hasStatsProps =
      data.totalCoupons !== undefined ||
      data.activeCoupons !== undefined ||
      data.expiredCoupons !== undefined ||
      data.totalUses !== undefined ||
      data.totalLimit !== undefined ||
      data.usageRate !== undefined;

    if (hasAnalyticsProps || hasStatsProps) {
      return data;
    }

    // If data has a nested 'data' property, try to extract it
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      const innerData = data.data;
      const innerHasAnalyticsProps =
        innerData.statusBreakdown ||
        innerData.typeBreakdown ||
        innerData.topUsedCoupons ||
        innerData.totalInPeriod !== undefined ||
        innerData.period !== undefined;
      const innerHasStatsProps =
        innerData.totalCoupons !== undefined ||
        innerData.activeCoupons !== undefined ||
        innerData.expiredCoupons !== undefined ||
        innerData.totalUses !== undefined ||
        innerData.totalLimit !== undefined ||
        innerData.usageRate !== undefined;

      if (innerHasAnalyticsProps || innerHasStatsProps) {
        return innerData;
      }

      // Check for double nesting: data.data.data
      if (innerData.data && typeof innerData.data === 'object' && !Array.isArray(innerData.data)) {
        const doubleNestedData = innerData.data;
        const doubleHasAnalyticsProps =
          doubleNestedData.statusBreakdown ||
          doubleNestedData.typeBreakdown ||
          doubleNestedData.topUsedCoupons ||
          doubleNestedData.totalInPeriod !== undefined ||
          doubleNestedData.period !== undefined;
        const doubleHasStatsProps =
          doubleNestedData.totalCoupons !== undefined ||
          doubleNestedData.activeCoupons !== undefined ||
          doubleNestedData.expiredCoupons !== undefined ||
          doubleNestedData.totalUses !== undefined ||
          doubleNestedData.totalLimit !== undefined ||
          doubleNestedData.usageRate !== undefined;

        if (doubleHasAnalyticsProps || doubleHasStatsProps) {
          return doubleNestedData;
        }
      }
    }

    // If data has 'success' and 'data', unwrap the data
    if (data.success && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      return getNestedData(data.data);
    }

    return data;
  };

  // Note: The API endpoints are swapped - analytics endpoint returns statistics and vice versa
  // So we swap them here to match the expected data structure
  const analytics = getNestedData(statisticsRaw); // statisticsRaw contains analytics data
  const statistics = getNestedData(analyticsRaw); // analyticsRaw contains statistics data

  const exportMutation = useExportCouponsData();

  const periodOptions = [
    { value: 7, label: t('analytics.last7Days') },
    { value: 30, label: t('analytics.last30Days') },
    { value: 90, label: t('analytics.last3Months') },
    { value: 365, label: t('analytics.lastYear') },
  ];

  const handleRefresh = () => {
    refetchAnalytics();
    refetchStats();
    toast.success(t('messages.dataRefreshed'));
  };

  const handleExportData = async () => {
    try {
      await exportMutation.mutateAsync({
        format: 'csv',
        period: analyticsPeriod,
      });
    } catch {
      // Error handled by mutation onError
    }
  };

  if (analyticsLoading || statsLoading) {
    return (
      <Box p={{ xs: 2, sm: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {t('analytics.loading')}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {t('analytics.title')}
        </Typography>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 } }}>
            <InputLabel>{t('analytics.timePeriod')}</InputLabel>
            <Select
              value={analyticsPeriod}
              label={t('analytics.timePeriod')}
              onChange={(e) => setAnalyticsPeriod(Number(e.target.value))}
            >
              {periodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title={t('analytics.refreshData')}>
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('analytics.exportData')}>
            <IconButton
              onClick={handleExportData}
              color="secondary"
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? <CircularProgress size={24} /> : <Download />}
            </IconButton>
          </Tooltip>

          <Tooltip
            title={showDetailedView ? t('analytics.simpleView') : t('analytics.detailedView')}
          >
            <IconButton onClick={() => setShowDetailedView(!showDetailedView)} color="info">
              {showDetailedView ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalCoupons')}
            value={statistics?.totalCoupons || analytics?.totalInPeriod || 0}
            icon={ConfirmationNumber}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.activeCoupons')}
            value={statistics?.activeCoupons || analytics?.statusBreakdown?.active || 0}
            icon={TrendingUp}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalUses')}
            value={statistics?.totalUses || 0}
            icon={People}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.usageRate')}
            value={`${statistics?.usageRate || '0.00'}%`}
            icon={AttachMoney}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Additional Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.expiredCoupons')}
            value={statistics?.expiredCoupons || analytics?.statusBreakdown?.expired || 0}
            icon={ConfirmationNumber}
            color="error"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.inactiveCoupons')}
            value={analytics?.statusBreakdown?.inactive || 0}
            icon={ConfirmationNumber}
            color="secondary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.scheduledCoupons')}
            value={analytics?.statusBreakdown?.scheduled || 0}
            icon={ConfirmationNumber}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalLimit')}
            value={statistics?.totalLimit || 0}
            icon={BarChart}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      {analytics?.statusBreakdown && (
        <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {t('analytics.statusBreakdown')}
                </Typography>
              </CardHeader>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 } }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box
                      textAlign="center"
                      p={2}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="success.main"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                      >
                        {analytics.statusBreakdown.active || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 1 }}
                      >
                        {t('analytics.statusActive')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box
                      textAlign="center"
                      p={2}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="error.main"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                      >
                        {analytics.statusBreakdown.expired || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 1 }}
                      >
                        {t('analytics.statusExpired')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box
                      textAlign="center"
                      p={2}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                      >
                        {analytics.statusBreakdown.inactive || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 1 }}
                      >
                        {t('analytics.statusInactive')}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box
                      textAlign="center"
                      p={2}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="info.main"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                      >
                        {analytics.statusBreakdown.scheduled || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 1 }}
                      >
                        {t('analytics.statusScheduled')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detailed Analytics */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('analytics.typeBreakdown')}
              </Typography>
            </CardHeader>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 } }}>
              {analytics?.typeBreakdown ? (
                <Stack spacing={2}>
                  {Object.entries(analytics.typeBreakdown).map(([type, count]: [string, any]) => (
                    <Box
                      key={type}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                      gap={1}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          {type === 'percentage'
                            ? t('analytics.typePercentage')
                            : type === 'fixed'
                            ? t('analytics.typeFixed')
                            : type === 'freeShipping'
                            ? t('analytics.typeFreeShipping')
                            : type}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {t('analytics.count')}: {count}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Chip
                          label={count}
                          size="small"
                          color={
                            type === 'percentage'
                              ? 'primary'
                              : type === 'fixed'
                              ? 'secondary'
                              : 'info'
                          }
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">{t('analytics.noData')}</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('analytics.topUsedCoupons')}
              </Typography>
            </CardHeader>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 } }}>
              {analytics?.topUsedCoupons && analytics.topUsedCoupons.length > 0 ? (
                <Stack spacing={2}>
                  {analytics.topUsedCoupons.map((coupon: any, index: number) => (
                    <Box
                      key={coupon._id || index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                      gap={1}
                      p={1.5}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" gap={2} flex={1}>
                        <Chip
                          label={index + 1}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                        <Box flex={1}>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {coupon.code}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                            <Chip
                              label={
                                coupon.type === 'percentage'
                                  ? t('analytics.typePercentage')
                                  : coupon.type === 'fixed_amount'
                                  ? t('analytics.typeFixed')
                                  : coupon.type
                              }
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {coupon.type === 'percentage'
                                ? `${coupon.discountValue}%`
                                : formatCurrency(coupon.discountValue)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box textAlign="right" minWidth={{ xs: '100%', sm: 'auto' }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {t('analytics.usedCount')}: {coupon.usedCount || 0}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {t('analytics.usageLimit')}:{' '}
                          {coupon.usageLimit || t('analytics.unlimited')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">{t('analytics.noData')}</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {showDetailedView && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {t('analytics.detailedStatistics')}
                </Typography>
              </CardHeader>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 } }}>
                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead
                      sx={{
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? theme.palette.grey[800]
                            : theme.palette.grey[100],
                      }}
                    >
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            color: 'text.primary',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {t('analytics.metric')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 'bold',
                            color: 'text.primary',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {t('analytics.value')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.totalCoupons')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {statistics?.totalCoupons || analytics?.totalInPeriod || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.activeCoupons')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {statistics?.activeCoupons || analytics?.statusBreakdown?.active || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.expiredCoupons')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {statistics?.expiredCoupons || analytics?.statusBreakdown?.expired || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.totalUses')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {statistics?.totalUses || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.totalLimit')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {statistics?.totalLimit || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.usageRate')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {statistics?.usageRate ? `${statistics.usageRate}%` : '0.00%'}
                          {statistics?.usageRate !== undefined && (
                            <Box mt={1}>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(statistics.usageRate) || 0}
                                sx={{ width: { xs: 60, sm: 100 } }}
                              />
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                      {analytics?.totalInPeriod !== undefined && (
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {t('analytics.totalInPeriod')}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {analytics.totalInPeriod}
                          </TableCell>
                        </TableRow>
                      )}
                      {analytics?.period !== undefined && (
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {t('analytics.period')}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {analytics.period} {t('analytics.days')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('analytics.usageTrends')}
              </Typography>
            </CardHeader>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 } }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
                textAlign="center"
              >
                <Box>
                  <BarChart sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.secondary', mb: 2 }} />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}
                  >
                    {t('analytics.usageTrendsChart')}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('analytics.usageTrendsChartDescription')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
