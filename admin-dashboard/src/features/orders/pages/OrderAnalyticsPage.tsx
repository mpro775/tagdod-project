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
import { useOrderAnalytics, useRevenueAnalytics, usePerformanceAnalytics } from '../hooks/useOrders';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import type { OrderAnalyticsParams } from '../types/order.types';
import { ar } from 'date-fns/locale';

export const OrderAnalyticsPage: React.FC = () => {
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

  const handleParamsChange = (key: keyof OrderAnalyticsParams, value: any) => {
    setAnalyticsParams(prev => ({
      ...prev,
      [key]: value,
    }));
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
            تحليلات الطلبات
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
              onClick={() => {
                // TODO: Implement export functionality
              }}
              disabled
            >
              تصدير التقرير
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            فلاتر التحليل
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>الفترة الزمنية</InputLabel>
                <Select
                  value={analyticsParams.days}
                  onChange={(e) => handleParamsChange('days', e.target.value)}
                  label="الفترة الزمنية"
                >
                  <MenuItem value={7}>آخر 7 أيام</MenuItem>
                  <MenuItem value={30}>آخر 30 يوم</MenuItem>
                  <MenuItem value={90}>آخر 3 أشهر</MenuItem>
                  <MenuItem value={365}>آخر سنة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>تجميع البيانات</InputLabel>
                <Select
                  value={analyticsParams.groupBy}
                  onChange={(e) => handleParamsChange('groupBy', e.target.value)}
                  label="تجميع البيانات"
                >
                  <MenuItem value="day">يومي</MenuItem>
                  <MenuItem value="week">أسبوعي</MenuItem>
                  <MenuItem value="month">شهري</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="من تاريخ"
                value={fromDate}
                onChange={setFromDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="إلى تاريخ"
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
                    إجمالي الطلبات
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
                    إجمالي الإيرادات
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
                    متوسط قيمة الطلب
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
                    طلبات مكتملة
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
                توزيع الطلبات حسب الحالة
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
                تحليل الإيرادات
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      ملخص الإيرادات
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="إجمالي الإيرادات"
                          secondary={formatCurrency(revenueAnalytics.totalRevenue, 'YER')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="عدد الطلبات"
                          secondary={revenueAnalytics.totalOrders}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="متوسط قيمة الطلب"
                          secondary={formatCurrency(revenueAnalytics.averageOrderValue, 'YER')}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      أفضل المنتجات
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
                                    الإيرادات: {formatCurrency(product.revenue, 'YER')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    الطلبات: {product.orders}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                          لا توجد بيانات متاحة
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
                تحليل الأداء
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
                      متوسط وقت التجهيز
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
                      متوسط وقت الشحن
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
                      متوسط وقت التسليم
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
                      معدل الإلغاء
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
                      معدل الاسترداد
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
                      تقييم رضا العملاء
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
                الطلبات الأخيرة
              </Typography>
              <List>
                {analytics.recentOrders.slice(0, 10).map((order, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`#${order.orderNumber}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            العميل: {order.deliveryAddress.recipientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            المجموع: {formatCurrency(order.total, order.currency)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            التاريخ: {formatDate(order.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={order.status}
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
