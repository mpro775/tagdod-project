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
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}>
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
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useCouponAnalytics(undefined, analyticsPeriod);
  const {
    data: statistics,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useCouponStatistics(analyticsPeriod);

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
            title={
              showDetailedView
                ? t('analytics.simpleView')
                : t('analytics.detailedView')
            }
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
            value={analytics?.totalCoupons || 0}
            icon={ConfirmationNumber}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.activeCoupons')}
            value={analytics?.activeCoupons || 0}
            icon={TrendingUp}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalRedemptions')}
            value={statistics?.totalRedemptions || 0}
            icon={People}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalSavings')}
            value={formatCurrency(statistics?.totalSavings || 0)}
            icon={AttachMoney}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('analytics.couponTypePerformance')}
              </Typography>
            </CardHeader>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 } }}>
              {statistics?.couponTypePerformance?.length > 0 ? (
                <Stack spacing={2}>
                  {statistics.couponTypePerformance.map((item: any) => (
                    <Box
                      key={item.type}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                      gap={1}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {item.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {item.usageCount} {t('analytics.usageCount')}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {formatCurrency(item.totalDiscount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {item.conversionRate}% {t('analytics.conversionRate')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  {t('analytics.noData')}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('analytics.topCoupons')}
              </Typography>
            </CardHeader>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1.5 } }}>
              {statistics?.topCoupons?.length > 0 ? (
                <Stack spacing={2}>
                  {statistics.topCoupons.slice(0, 5).map((coupon: any, index: number) => (
                    <Box
                      key={coupon._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
                      gap={1}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip label={index + 1} size="small" color="primary" variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                        <Box>
                          <Typography variant="body1" fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {coupon.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {coupon.code}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {coupon.usageCount} {t('analytics.usageCount')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {formatCurrency(coupon.totalDiscount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  {t('analytics.noData')}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {showDetailedView && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {t('analytics.detailedPerformance')}
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
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.index')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.value')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.change')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.percentage')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.conversionRate')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{statistics?.conversionRate || 0}%</TableCell>
                        <TableCell align="right">
                          {statistics?.conversionRateChange !== undefined ? (
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              {statistics.conversionRateChange >= 0 ? (
                                <ArrowUpward color="success" fontSize="small" />
                              ) : (
                                <ArrowDownward color="error" fontSize="small" />
                              )}
                              <Typography
                                variant="body2"
                                color={statistics.conversionRateChange >= 0 ? 'success.main' : 'error.main'}
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {`${Math.abs(statistics.conversionRateChange)}%`}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <LinearProgress
                            variant="determinate"
                            value={statistics?.conversionRate || 0}
                            sx={{ width: { xs: 60, sm: 100 } }}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.averageOrderValue')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {formatCurrency(statistics?.averageOrderValue || 0)}
                        </TableCell>
                        <TableCell align="right">
                          {statistics?.averageOrderValueChange !== undefined ? (
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              {statistics.averageOrderValueChange >= 0 ? (
                                <ArrowUpward color="success" fontSize="small" />
                              ) : (
                                <ArrowDownward color="error" fontSize="small" />
                              )}
                              <Typography
                                variant="body2"
                                color={statistics.averageOrderValueChange >= 0 ? 'success.main' : 'error.main'}
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {`${Math.abs(statistics.averageOrderValueChange)}%`}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>—</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {t('analytics.totalRevenue')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {formatCurrency(statistics?.totalRevenue || 0)}
                        </TableCell>
                        <TableCell align="right">
                          {statistics?.totalRevenueChange !== undefined ? (
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              {statistics.totalRevenueChange >= 0 ? (
                                <ArrowUpward color="success" fontSize="small" />
                              ) : (
                                <ArrowDownward color="error" fontSize="small" />
                              )}
                              <Typography
                                variant="body2"
                                color={statistics.totalRevenueChange >= 0 ? 'success.main' : 'error.main'}
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {`${Math.abs(statistics.totalRevenueChange)}%`}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>—</Typography>
                        </TableCell>
                      </TableRow>
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
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}>
                    {t('analytics.usageTrendsChart')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
