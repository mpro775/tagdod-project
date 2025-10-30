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
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
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
                sx={{ ml: 0.5 }}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            backgroundColor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          <Icon />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const CouponAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('coupons');
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
    { value: 7, label: t('analytics.last7Days', { defaultValue: 'آخر 7 أيام' }) },
    { value: 30, label: t('analytics.last30Days', { defaultValue: 'آخر 30 يوم' }) },
    { value: 90, label: t('analytics.last3Months', { defaultValue: 'آخر 3 أشهر' }) },
    { value: 365, label: t('analytics.lastYear', { defaultValue: 'آخر 365 يوم' }) },
  ];

  const handleRefresh = () => {
    refetchAnalytics();
    refetchStats();
    toast.success(t('messages.dataRefreshed', { defaultValue: 'تم تحديث البيانات بنجاح' }));
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
      <Box p={3}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              {t('analytics.loading', { defaultValue: 'جاري التحميل...' })}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('analytics.title', { defaultValue: 'تحليلات الكوبونات' })}
        </Typography>

        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('analytics.timePeriod', { defaultValue: 'فترة الوقت' })}</InputLabel>
            <Select
              value={analyticsPeriod}
              label={t('analytics.timePeriod', { defaultValue: 'فترة الوقت' } )}
              onChange={(e) => setAnalyticsPeriod(Number(e.target.value))}
            >
              {periodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title={t('analytics.refreshData', { defaultValue: 'تحديث البيانات' })}>
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('analytics.exportData', { defaultValue: 'تصدير البيانات' })}>
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
                ? t('analytics.simpleView', { defaultValue: 'عرض مبسط' })
                : t('analytics.detailedView', { defaultValue: 'عرض مفصل' })
            }
          >
            <IconButton onClick={() => setShowDetailedView(!showDetailedView)} color="info">
              {showDetailedView ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalCoupons', { defaultValue: 'إجمالي الكوبونات' })}
            value={analytics?.totalCoupons || 0}
            icon={ConfirmationNumber}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.activeCoupons', { defaultValue: 'الكوبونات النشطة' })}
            value={analytics?.activeCoupons || 0}
            icon={TrendingUp}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalRedemptions', { defaultValue: 'إجمالي الاستخدامات' })}
            value={statistics?.totalRedemptions || 0}
            icon={People}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('analytics.totalSavings', { defaultValue: 'إجمالي التوفير' })}
            value={formatCurrency(statistics?.totalSavings || 0)}
            icon={AttachMoney}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6">
                {t('analytics.couponTypePerformance', { defaultValue: 'أداء الكوبونات حسب النوع' })}
              </Typography>
            </CardHeader>
            <CardContent>
              {statistics?.couponTypePerformance?.length > 0 ? (
                <Stack spacing={2}>
                  {statistics.couponTypePerformance.map((item: any) => (
                    <Box
                      key={item.type}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {item.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.usageCount} {t('analytics.usageCount', { defaultValue: 'استخدام' })}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(item.totalDiscount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.conversionRate}%{' '}
                          {t('analytics.conversionRate', { defaultValue: 'معدل التحويل' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  {t('analytics.noDataAvailable', { defaultValue: 'لا توجد بيانات متاحة' })}{' '}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6">
                {t('analytics.topCoupons', { defaultValue: 'الكوبونات الأكثر استخداماً' })}
              </Typography>
            </CardHeader>
            <CardContent>
              {statistics?.topCoupons?.length > 0 ? (
                <Stack spacing={2}>
                  {statistics.topCoupons.slice(0, 5).map((coupon: any, index: number) => (
                    <Box
                      key={coupon._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip label={index + 1} size="small" color="primary" variant="outlined" />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {coupon.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {coupon.code}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="medium">
                          {coupon.usageCount}{' '}
                          {t('analytics.usageCount', { defaultValue: 'استخدام' })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(coupon.totalDiscount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  {t('analytics.noDataAvailable', { defaultValue: 'لا توجد بيانات متاحة' })}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {showDetailedView && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader>
                <Typography variant="h6">
                  {t('analytics.detailedPerformance', { defaultValue: 'تحليل مفصل للأداء' })}
                </Typography>
              </CardHeader>
              <CardContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead
                      sx={{
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? theme.palette.grey[800]
                            : theme.palette.grey[100],
                      }}
                    >
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {t('analytics.index', { defaultValue: 'المؤشر' })}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {t('analytics.value', { defaultValue: 'القيمة' })}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {t('analytics.change', { defaultValue: 'التغيير' })}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {t('analytics.percentage', { defaultValue: 'النسبة' })}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          {t('analytics.conversionRate', { defaultValue: 'معدل التحويل' })}
                        </TableCell>
                        <TableCell align="right">{statistics?.conversionRate || 0}%</TableCell>
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
                              >
                                {`${Math.abs(statistics.conversionRateChange)}%`}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <LinearProgress
                            variant="determinate"
                            value={statistics?.conversionRate || 0}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          {t('analytics.averageOrderValue', { defaultValue: 'متوسط قيمة الطلب' })}
                        </TableCell>
                        <TableCell align="right">
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
                              >
                                {`${Math.abs(statistics.averageOrderValueChange)}%`}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          {t('analytics.totalRevenue', { defaultValue: 'إجمالي الإيرادات' })}
                        </TableCell>
                        <TableCell align="right">
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
                              >
                                {`${Math.abs(statistics.totalRevenueChange)}%`}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">—</Typography>
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
            <CardHeader>
              <Typography variant="h6">
                {t('analytics.usageTrends', { defaultValue: 'اتجاهات الاستخدام' })}
              </Typography>
            </CardHeader>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
                textAlign="center"
              >
                <Box>
                  <BarChart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {t('analytics.usageTrendsChart', {
                      defaultValue: 'مخطط اتجاهات الاستخدام قيد التطوير',
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('analytics.usageTrendsChartDescription', {
                      defaultValue: 'سيتم عرض الرسوم البيانية لاتجاهات استخدام الكوبونات هنا',
                    })}
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
