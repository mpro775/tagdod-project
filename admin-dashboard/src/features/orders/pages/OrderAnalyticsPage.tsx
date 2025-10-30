import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  Download,
  Refresh,
  FilterList,
  AttachMoney,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useOrderAnalytics, useRevenueAnalytics, usePerformanceAnalytics, useExportOrderAnalytics } from '../hooks/useOrders';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import type { OrderAnalyticsParams } from '../types/order.types';
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const OrderAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [analyticsParams, setAnalyticsParams] = useState<OrderAnalyticsParams>({
    days: 7,
    groupBy: 'day',
  });
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const { data: analytics, isLoading: analyticsLoading } = useOrderAnalytics(analyticsParams);
  const { data: revenueAnalytics, isLoading: revenueLoading } = useRevenueAnalytics(
    fromDate?.toISOString(),
    toDate?.toISOString()
  );
  const { data: performanceAnalytics, isLoading: performanceLoading } = usePerformanceAnalytics();
  const exportMutation = useExportOrderAnalytics();

  const handleParamsChange = (key: keyof OrderAnalyticsParams, value: any) => {
    setAnalyticsParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExportAnalytics = async () => {
    try {
      await exportMutation.mutateAsync({
        format: 'csv',
        days: analyticsParams.days,
        fromDate: fromDate?.toISOString(),
        toDate: toDate?.toISOString(),
      });
    } catch {
      // Error handled by mutation onError
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle color="success" />;
      case 'shipped':
      case 'out_for_delivery':
        return <LocalShipping color="info" />;
      case 'processing':
      case 'ready_to_ship':
        return <Schedule color="primary" />;
      case 'cancelled':
      case 'refunded':
        return <Cancel color="error" />;
      default:
        return <ShoppingCart color="primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'success';
      case 'shipped':
      case 'out_for_delivery':
        return 'info';
      case 'processing':
      case 'ready_to_ship':
        return 'primary';
      case 'cancelled':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {t('orders.navigation.analytics', { defaultValue: 'تحليل الطلبات' })}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              تحديث
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportAnalytics}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? 'جاري التصدير...' : 'تصدير التقرير'}
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            {t('orders.filters.title', { defaultValue: 'فلاتر التحليل' })}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.filters.dateRange', { defaultValue: 'الفترة الزمنية' })}</InputLabel>
                <Select
                  value={analyticsParams.days}
                  onChange={(e) => handleParamsChange('days', e.target.value)}
                  label={t('orders.filters.dateRange', { defaultValue: 'الفترة الزمنية' })}
                >
                  <MenuItem value={7}>{t('orders.filters.last7Days', { defaultValue: 'آخر 7 أيام' })}</MenuItem>
                  <MenuItem value={30}>{t('orders.filters.last30Days', { defaultValue: 'آخر 30 يوم' })}</MenuItem>
                  <MenuItem value={90}>{t('orders.filters.last3Months', { defaultValue: 'آخر 3 أشهر' })}</MenuItem>
                  <MenuItem value={365}>{t('orders.filters.lastYear', { defaultValue: 'آخر سنة' })}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.filters.dataAggregation', { defaultValue: 'تجميع البيانات' })}</InputLabel>
                <Select
                  value={analyticsParams.groupBy}
                  onChange={(e) => handleParamsChange('groupBy', e.target.value)}
                  label={t('orders.filters.dataAggregation', { defaultValue: 'تجميع البيانات' })}
                >
                  <MenuItem value="day">{t('orders.filters.daily', { defaultValue: 'يومي' })}</MenuItem>
                  <MenuItem value="week">{t('orders.filters.weekly', { defaultValue: 'أسبوعي' })}</MenuItem>
                  <MenuItem value="month">{t('orders.filters.monthly', { defaultValue: 'شهري' })}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label={t('orders.filters.fromDate', { defaultValue: 'من تاريخ' })}
                value={fromDate}
                onChange={setFromDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label={t('orders.filters.toDate', { defaultValue: 'إلى تاريخ' })}
                value={toDate}
                onChange={setToDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Analytics Overview */}
        {analyticsLoading ? (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card component="div">
                  <CardContent>
                    <Skeleton variant="rectangular" height={100} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : analytics ? (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
                    <ShoppingCart fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {analytics.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.analytics.totalOrders', { defaultValue: 'إجمالي الطلبات' })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'success.main', mb: 1 }}>
                    <AttachMoney fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(analytics.totalRevenue, 'YER')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.analytics.totalRevenue', { defaultValue: 'إجمالي الإيرادات' })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'info.main', mb: 1 }}>
                    <Assessment fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(analytics.averageOrderValue, 'YER')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.analytics.averageOrderValue', { defaultValue: 'متوسط قيمة الطلب' })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'warning.main', mb: 1 }}>
                    <TrendingUp fontSize="large" />
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {analytics.ordersByStatus?.find(s => s.status === 'completed')?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('orders.analytics.completedOrders', { defaultValue: 'طلبات مكتملة' })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {/* Orders by Status */}
        {analytics && analytics.ordersByStatus && analytics.ordersByStatus.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChart />
                {t('orders.analytics.orderDistributionByStatus', { defaultValue: 'توزيع الطلبات حسب الحالة' })}
              </Typography>
              <Grid container spacing={2}>
                {analytics.ordersByStatus.map((statusData, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Box sx={{ color: `${getStatusColor(statusData.status)}.main`, mb: 1 }}>
                        {getStatusIcon(statusData.status)}
                      </Box>
                      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {statusData.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {statusData.status}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Revenue Analytics */}
        {revenueLoading ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        ) : revenueAnalytics ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart />
                {t('orders.analytics.revenueAnalysis', { defaultValue: 'تحليل الإيرادات' })}
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {t('orders.analytics.revenueSummary', { defaultValue: 'ملخص الإيرادات' })}  
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary={t('orders.analytics.totalRevenue', { defaultValue: 'إجمالي الإيرادات' })}
                          secondary={formatCurrency(revenueAnalytics.totalRevenue, 'YER')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={t('orders.analytics.totalOrders', { defaultValue: 'عدد الطلبات' })}
                          secondary={revenueAnalytics.totalOrders}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={t('orders.analytics.averageOrderValue', { defaultValue: 'متوسط قيمة الطلب' })}
                          secondary={formatCurrency(revenueAnalytics.averageOrderValue, 'YER')}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {t('orders.analytics.bestProducts', { defaultValue: 'أفضل المنتجات' })}
                    </Typography>
                    <List dense>
                      {revenueAnalytics.topProducts && revenueAnalytics.topProducts.length > 0 ? (
                        revenueAnalytics.topProducts.slice(0, 5).map((product, index) => (
                          <ListItem key={index} divider>
                            <ListItemText
                              primary={product.productName}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {t('orders.analytics.revenue', { defaultValue: 'الإيرادات' })}: {formatCurrency(product.revenue, 'YER')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {t('orders.analytics.orders', { defaultValue: 'الطلبات' })}: {product.orders}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                          {t('orders.analytics.noDataAvailable', { defaultValue: 'لا توجد بيانات متاحة' })}
                        </Typography>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : null}

        {/* Performance Analytics */}
        {performanceLoading ? (
          <Card>
            <CardContent>
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        ) : performanceAnalytics ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline />
                {t('orders.analytics.performanceAnalysis', { defaultValue: 'تحليل الأداء' })}
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main', mb: 1 }}>
                      <Schedule fontSize="large" />
                    </Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {performanceAnalytics.averageProcessingTime} يوم
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.analytics.averageProcessingTime', { defaultValue: 'متوسط وقت التجهيز' })}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: 'info.main', mb: 1 }}>
                      <LocalShipping fontSize="large" />
                    </Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {performanceAnalytics.averageShippingTime} يوم
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.analytics.averageShippingTime', { defaultValue: 'متوسط وقت الشحن' })}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: 'success.main', mb: 1 }}>
                      <CheckCircle fontSize="large" />
                    </Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {performanceAnalytics.averageDeliveryTime} يوم
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.analytics.averageDeliveryTime', { defaultValue: 'متوسط وقت التسليم' })}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: 'error.main', mb: 1 }}>
                      <Cancel fontSize="large" />
                    </Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {performanceAnalytics.cancellationRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.analytics.cancellationRate', { defaultValue: 'معدل الإلغاء' })}    
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: 'warning.main', mb: 1 }}>
                      <Refresh fontSize="large" />
                    </Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {performanceAnalytics.refundRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.analytics.refundRate', { defaultValue: 'معدل الاسترداد' })}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{ color: 'success.main', mb: 1 }}>
                      <TrendingUp fontSize="large" />
                    </Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {performanceAnalytics.customerSatisfactionScore}/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('orders.analytics.customerSatisfactionScore', { defaultValue: 'تقييم رضا العملاء' })}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : null}

        {/* Recent Orders */}
        {analytics && analytics.recentOrders && analytics.recentOrders.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart />
                {t('orders.analytics.recentOrders', { defaultValue: 'الطلبات الأخيرة' })}
              </Typography>
              <List>
                {analytics.recentOrders.slice(0, 10).map((order, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`#${order.orderNumber}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('orders.analytics.client', { defaultValue: 'العميل' })}: {order.deliveryAddress.recipientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('orders.analytics.total', { defaultValue: 'المجموع' })}: {formatCurrency(order.total, order.currency)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('orders.analytics.date', { defaultValue: 'التاريخ' })}: {formatDate(order.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={t(`orders.status.${order.status}`, { defaultValue: order.status })}  
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};
