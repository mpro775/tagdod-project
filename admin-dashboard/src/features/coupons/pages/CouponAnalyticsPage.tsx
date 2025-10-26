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
import { useCouponAnalytics, useCouponStatistics } from '../../marketing/hooks/useMarketing';
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

  const periodOptions = [
    { value: 7, label: 'آخر 7 أيام' },
    { value: 30, label: 'آخر 30 يوم' },
    { value: 90, label: 'آخر 3 أشهر' },
    { value: 365, label: 'آخر سنة' },
  ];

  const handleRefresh = () => {
    refetchAnalytics();
    refetchStats();
    toast.success('تم تحديث البيانات');
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    toast.success('ميزة التصدير قيد التطوير');
  };

  if (analyticsLoading || statsLoading) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              جاري تحميل البيانات...
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
          تحليلات الكوبونات
        </Typography>

        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>الفترة الزمنية</InputLabel>
            <Select
              value={analyticsPeriod}
              label="الفترة الزمنية"
              onChange={(e) => setAnalyticsPeriod(Number(e.target.value))}
            >
              {periodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="تحديث البيانات">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="تصدير البيانات">
            <IconButton onClick={handleExportData} color="secondary">
              <Download />
            </IconButton>
          </Tooltip>

          <Tooltip title={showDetailedView ? 'عرض مبسط' : 'عرض مفصل'}>
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
            title="إجمالي الكوبونات"
            value={analytics?.totalCoupons || 0}
            icon={ConfirmationNumber}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="الكوبونات النشطة"
            value={analytics?.activeCoupons || 0}
            icon={TrendingUp}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="إجمالي الاستخدامات"
            value={statistics?.totalRedemptions || 0}
            icon={People}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="إجمالي التوفير"
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
              <Typography variant="h6">أداء الكوبونات حسب النوع</Typography>
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
                          {item.usageCount} استخدام
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(item.totalDiscount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.conversionRate}% معدل التحويل
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">لا توجد بيانات متاحة</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6">الكوبونات الأكثر استخداماً</Typography>
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
                          {coupon.usageCount} استخدام
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(coupon.totalDiscount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">لا توجد بيانات متاحة</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {showDetailedView && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader>
                <Typography variant="h6">تحليل مفصل للأداء</Typography>
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
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>المؤشر</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>القيمة</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>التغيير</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>النسبة</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>معدل التحويل</TableCell>
                        <TableCell align="right">{statistics?.conversionRate || 0}%</TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <ArrowUpward color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              +5.2%
                            </Typography>
                          </Box>
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
                        <TableCell>متوسط قيمة الطلب</TableCell>
                        <TableCell align="right">
                          {formatCurrency(statistics?.averageOrderValue || 0)}
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <ArrowUpward color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              +12.3%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <LinearProgress variant="determinate" value={75} sx={{ width: 100 }} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>إجمالي الإيرادات</TableCell>
                        <TableCell align="right">
                          {formatCurrency(statistics?.totalRevenue || 0)}
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <ArrowUpward color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              +8.7%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <LinearProgress variant="determinate" value={85} sx={{ width: 100 }} />
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
              <Typography variant="h6">اتجاهات الاستخدام</Typography>
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
                    مخطط اتجاهات الاستخدام قيد التطوير
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    سيتم عرض الرسوم البيانية لاتجاهات استخدام الكوبونات هنا
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
