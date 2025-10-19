import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,

  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  People,
  Assessment,
  Inventory,
  AttachMoney,
  Support,
  GetApp,
  Refresh,
  
} from '@mui/icons-material';

// Import existing components
import { StatsCard } from '../components/StatsCard';
import { PieChartComponent } from '../components/PieChartComponent';
import { RevenueChart } from '../components/RevenueChart';

// Import hooks
import { 
  useSalesAnalytics, 
  useProductPerformance, 
  useCustomerAnalytics, 
  useInventoryReport, 
  useFinancialReport, 
  useMarketingReport, 
  useRealTimeMetrics 
} from '../hooks/useAnalytics';

// Import types
import {
  PeriodType,

} from '../types/analytics.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdvancedAnalyticsDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(PeriodType.MONTHLY);

  // Use analytics hooks
  const { data: realtimeMetrics, isLoading: realtimeLoading } = useRealTimeMetrics();
  const { data: salesAnalytics, isLoading: salesLoading } = useSalesAnalytics({ period: selectedPeriod });
  const { data: productPerformance, isLoading: productLoading } = useProductPerformance({ period: selectedPeriod });
  const { data: customerAnalytics, isLoading: customerLoading } = useCustomerAnalytics({ period: selectedPeriod });
  const { data: inventoryReport, isLoading: inventoryLoading } = useInventoryReport({ period: selectedPeriod });
  const { data: financialReport, isLoading: financialLoading } = useFinancialReport({ period: selectedPeriod });
  const { data: marketingReport, isLoading: marketingLoading } = useMarketingReport({ period: selectedPeriod });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  const handleExportData = (type: string, format: string) => {
    // Implementation for data export
    // eslint-disable-next-line no-console
    console.log(`Exporting ${type} data in ${format} format`);
  };

  const handleRefresh = () => {
    // Refetch all data
    window.location.reload();
  };

  const isLoading = realtimeLoading || salesLoading || productLoading || customerLoading ||
                   inventoryLoading || financialLoading || marketingLoading;

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          جاري تحميل بيانات التحليلات...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              لوحة التحليلات المتقدمة
            </Typography>
            <Typography variant="body1" color="text.secondary">
              تحليل شامل لجميع جوانب الأعمال مع تقارير مفصلة وتوصيات
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              تحديث البيانات
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => handleExportData('dashboard', 'pdf')}
            >
              تصدير التقرير
            </Button>
          </Box>
        </Box>

        {/* Real-time Status Bar */}
        {realtimeMetrics && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2">
                  المستخدمون النشطون: {realtimeMetrics.activeUsers || 0}
                </Typography>
                <Typography variant="body2">
                  المبيعات اليوم: {(realtimeMetrics.todaySales || 0).toLocaleString()} ر.س
                </Typography>
                <Typography variant="body2">
                  حالة النظام: {realtimeMetrics.systemHealth?.status === 'healthy' ? 'سليم' : 'تحت الصيانة'}
                </Typography>
              </Box>
              <Typography variant="caption">
                آخر تحديث: {new Date(realtimeMetrics.lastUpdated || new Date()).toLocaleTimeString('ar-SA')}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Period Selection and Quick Filters */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {Object.values(PeriodType).map((period) => (
            <Chip
              key={period}
              label={
                period === PeriodType.DAILY ? 'يومي' :
                period === PeriodType.WEEKLY ? 'أسبوعي' :
                period === PeriodType.MONTHLY ? 'شهري' :
                period === PeriodType.QUARTERLY ? 'ربع سنوي' : 'سنوي'
              }
              onClick={() => handlePeriodChange(period)}
              color={selectedPeriod === period ? 'primary' : 'default'}
              variant={selectedPeriod === period ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Main Analytics Tabs */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="analytics tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<TrendingUp />}
              label="نظرة عامة"
              id="analytics-tab-0"
              aria-controls="analytics-tabpanel-0"
            />
            <Tab
              icon={<ShoppingCart />}
              label="المبيعات"
              id="analytics-tab-1"
              aria-controls="analytics-tabpanel-1"
            />
            <Tab
              icon={<Inventory />}
              label="المنتجات"
              id="analytics-tab-2"
              aria-controls="analytics-tabpanel-2"
            />
            <Tab
              icon={<People />}
              label="العملاء"
              id="analytics-tab-3"
              aria-controls="analytics-tabpanel-3"
            />
            <Tab
              icon={<AttachMoney />}
              label="المالية"
              id="analytics-tab-4"
              aria-controls="analytics-tabpanel-4"
            />
            <Tab
              icon={<Assessment />}
              label="التسويق"
              id="analytics-tab-5"
              aria-controls="analytics-tabpanel-5"
            />
            <Tab
              icon={<Support />}
              label="المخزون"
              id="analytics-tab-6"
              aria-controls="analytics-tabpanel-6"
            />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Key Metrics Cards */}
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي الإيرادات"
                  value={`${salesAnalytics?.totalRevenue?.toLocaleString() || 0} ر.س`}
                  change={15.5}
                  icon={<AttachMoney sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي الطلبات"
                  value={salesAnalytics?.totalOrders?.toLocaleString() || 0}
                  change={8.3}
                  icon={<ShoppingCart sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="متوسط قيمة الطلب"
                  value={`${salesAnalytics?.averageOrderValue?.toLocaleString() || 0} ر.س`}
                  change={12.1}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="العملاء الجدد"
                  value={customerAnalytics?.newCustomers?.toLocaleString() || 0}
                  change={22.4}
                  icon={<People sx={{ fontSize: 32, color: 'info.main' }} />}
                  color="info"
                />
              </Grid>

              {/* Charts Row */}
              <Grid size={{xs: 12, lg: 8}}>
                <RevenueChart
                  data={salesAnalytics?.salesByDate?.map(item => ({
                    date: item.date,
                    revenue: item.revenue,
                  })) || []}
                  title="اتجاه المبيعات"
                  type="area"
                  height={350}
                />
              </Grid>

              <Grid size={{xs: 12, lg: 4}}>
                <PieChartComponent
                  data={salesAnalytics?.salesByCategory?.map(item => ({
                    name: item.category,
                    value: item.revenue,
                  })) || []}
                  title="المبيعات حسب الفئة"
                  height={350}
                />
              </Grid>

              {/* Top Products */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أفضل المنتجات مبيعاً
                    </Typography>
                    {productPerformance?.topProducts?.slice(0, 5).map((product, index) => (
                      <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">
                          {index + 1}. {product.name}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {product.sales} مبيعة
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Customer Segments */}
                <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      قطاعات العملاء
                    </Typography>
                    {customerAnalytics?.customerSegments?.map((segment) => (
                      <Box key={segment.segment} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">
                          {segment.segment}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {segment.count} عميل ({segment.percentage}%)
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Sales Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              {/* Sales Overview Cards */}
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي الإيرادات"
                  value={`${salesAnalytics?.totalRevenue?.toLocaleString() || 0} ر.س`}
                  change={15.5}
                  icon={<AttachMoney sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي الطلبات"
                  value={salesAnalytics?.totalOrders?.toLocaleString() || 0}
                  change={8.3}
                  icon={<ShoppingCart sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="متوسط قيمة الطلب"
                  value={`${salesAnalytics?.averageOrderValue?.toLocaleString() || 0} ر.س`}
                  change={12.1}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="نمو المبيعات"
                  value="+15.5%"
                  change={15.5}
                  icon={<Assessment sx={{ fontSize: 32, color: 'info.main' }} />}
                  color="info"
                />
              </Grid>

              {/* Sales Trends Chart */}
              <Grid size={{xs: 12, lg: 8}}>
                <RevenueChart
                  data={salesAnalytics?.salesByDate?.map(item => ({
                    date: item.date,
                    revenue: item.revenue,
                  })) || []}
                  title="اتجاه المبيعات"
                  type="line"
                  height={350}
                />
              </Grid>

              {/* Sales by Category */}
              <Grid size={{xs: 12, lg: 4}}>
                <PieChartComponent
                  data={salesAnalytics?.salesByCategory?.map(item => ({
                    name: item.category,
                    value: item.revenue,
                  })) || []}
                  title="المبيعات حسب الفئة"
                  height={350}
                />
              </Grid>

              {/* Sales by Payment Method */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      المبيعات حسب طريقة الدفع
                    </Typography>
                    {salesAnalytics?.salesByPaymentMethod?.map((method) => (
                      <Box key={method.method} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">
                          {method.method}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {method.amount.toLocaleString()} ر.س ({method.count} طلب)
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Selling Products */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أفضل المنتجات مبيعاً
                    </Typography>
                    {salesAnalytics?.topProducts?.slice(0, 5).map((product, index) => (
                      <Box key={product.product} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">
                          {index + 1}. {product.product}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {product.sales} مبيعة ({product.revenue.toLocaleString()} ر.س)
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Products Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              {/* Product Overview Cards */}
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي المنتجات"
                  value={productPerformance?.totalProducts?.toLocaleString() || 0}
                  change={5.2}
                  icon={<Inventory sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي المبيعات"
                  value={productPerformance?.totalSales?.toLocaleString() || 0}
                  change={12.8}
                  icon={<ShoppingCart sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="منتجات قليلة المخزون"
                  value={productPerformance?.lowStockProducts?.length?.toLocaleString() || 0}
                  change={-2.1}
                  icon={<Support sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="متوسط التقييم"
                  value="4.2"
                  change={0.3}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'info.main' }} />}
                  color="info"
                />
              </Grid>

              {/* Top Products Performance */}
              <Grid size={{xs: 12, lg: 8}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أفضل المنتجات أداءً
                    </Typography>
                    {productPerformance?.topProducts?.slice(0, 10).map((product, index) => (
                      <Box key={product.id} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: index < 9 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              تقييم: {product.rating}/5
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="primary" fontWeight="medium">
                            {product.sales} مبيعة
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.revenue.toLocaleString()} ر.س
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Products by Category */}
              <Grid size={{xs: 12, lg: 4}}>
                <PieChartComponent
                  data={productPerformance?.byCategory?.map(item => ({
                    name: item.category,
                    value: item.count,
                  })) || []}
                  title="المنتجات حسب الفئة"
                  height={350}
                />
              </Grid>

              {/* Low Stock Products Alert */}
              <Grid size={{xs: 12, md: 6}}>
                <Card sx={{ border: '1px solid', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      تنبيه: منتجات قليلة المخزون
                    </Typography>
                    {productPerformance?.lowStockProducts?.slice(0, 5).map((product) => (
                      <Box key={product.id} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        py: 1,
                        bgcolor: 'warning.light',
                        px: 1,
                        borderRadius: 1,
                        mb: 1
                      }}>
                        <Typography variant="body2">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="warning.dark" fontWeight="bold">
                          {product.stock} متبقي
                        </Typography>
                      </Box>
                    ))}
                    {productPerformance?.lowStockProducts?.length === 0 && (
                      <Typography variant="body2" color="success.main">
                        ✅ جميع المنتجات متوفرة في المخزون
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Category Performance */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أداء الفئات
                    </Typography>
                    {productPerformance?.byCategory?.map((category) => (
                      <Box key={category.category} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2">
                          {category.category}
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="primary">
                            {category.count} منتج
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.sales} مبيعة
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Customers Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              {/* Customer Overview Cards */}
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي العملاء"
                  value={customerAnalytics?.totalCustomers?.toLocaleString() || 0}
                  change={8.7}
                  icon={<People sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="العملاء الجدد"
                  value={customerAnalytics?.newCustomers?.toLocaleString() || 0}
                  change={15.3}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="العملاء النشطون"
                  value={customerAnalytics?.activeCustomers?.toLocaleString() || 0}
                  change={12.1}
                  icon={<Assessment sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="القيمة مدى الحياة"
                  value={`${customerAnalytics?.customerLifetimeValue?.toLocaleString() || 0} ر.س`}
                  change={9.4}
                  icon={<AttachMoney sx={{ fontSize: 32, color: 'info.main' }} />}
                  color="info"
                />
              </Grid>

              {/* Customer Segments Chart */}
              <Grid size={{xs: 12, lg: 6}}>
                <PieChartComponent
                  data={customerAnalytics?.customerSegments?.map(item => ({
                    name: item.segment,
                    value: item.count,
                  })) || []}
                  title="توزيع العملاء حسب القطاعات"
                  height={350}
                />
              </Grid>

              {/* Top Customers */}
              <Grid size={{xs: 12, lg: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أفضل العملاء
                    </Typography>
                    {customerAnalytics?.topCustomers?.slice(0, 8).map((customer, index) => (
                      <Box key={customer.id} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: index < 7 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            #{index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.orders} طلب
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          {customer.totalSpent.toLocaleString()} ر.س
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Customer Segments Details */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تفاصيل قطاعات العملاء
                    </Typography>
                    {customerAnalytics?.customerSegments?.map((segment) => (
                      <Box key={segment.segment} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2">
                          {segment.segment}
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="primary" fontWeight="medium">
                            {segment.count} عميل
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {segment.percentage}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Customer Growth Insights */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      رؤى نمو العملاء
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'primary.light',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" fontWeight="medium">
                          معدل نمو العملاء الجدد
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          +15.3%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'success.light',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" fontWeight="medium">
                          معدل الاحتفاظ بالعملاء
                        </Typography>
                        <Typography variant="body2" color="success.dark" fontWeight="bold">
                          78.5%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'warning.light',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" fontWeight="medium">
                          متوسط القيمة لكل عميل
                        </Typography>
                        <Typography variant="body2" color="warning.dark" fontWeight="bold">
                          2,450 ر.س
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Financial Tab */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              {/* Financial Overview Cards */}
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي الإيرادات"
                  value={`${financialReport?.revenue?.toLocaleString() || 0} ر.س`}
                  change={12.5}
                  icon={<AttachMoney sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي المصروفات"
                  value={`${financialReport?.expenses?.toLocaleString() || 0} ر.س`}
                  change={-5.2}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'error.main' }} />}
                  color="error"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="صافي الربح"
                  value={`${financialReport?.profit?.toLocaleString() || 0} ر.س`}
                  change={18.7}
                  icon={<Assessment sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="هامش الربح"
                  value={`${financialReport?.profitMargin?.toFixed(1) || 0}%`}
                  change={3.2}
                  icon={<Inventory sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>

              {/* Cash Flow Chart */}
              <Grid size={{xs: 12, lg: 8}}>
                <RevenueChart
                  data={financialReport?.cashFlow?.map(item => ({
                    date: item.date,
                    revenue: item.inflow - item.outflow,
                  })) || []}
                  title="تدفق السيولة النقدية"
                  type="area"
                  height={350}
                />
              </Grid>

              {/* Revenue by Source */}
              <Grid size={{xs: 12, lg: 4}}>
                <PieChartComponent
                  data={financialReport?.revenueBySource?.map(item => ({
                    name: item.source,
                    value: item.amount,
                  })) || []}
                  title="الإيرادات حسب المصدر"
                  height={350}
                />
              </Grid>

              {/* Detailed Cash Flow */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تفاصيل التدفق النقدي
                    </Typography>
                    {financialReport?.cashFlow?.slice(-7).map((flow, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: index < 6 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(flow.date).toLocaleDateString('ar-SA')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            تدفق داخلي: {flow.inflow.toLocaleString()} ر.س
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography 
                            variant="body2" 
                            color={flow.balance >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            {flow.balance.toLocaleString()} ر.س
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            تدفق خارجي: {flow.outflow.toLocaleString()} ر.س
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Revenue Sources */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      مصادر الإيرادات
                    </Typography>
                    {financialReport?.revenueBySource?.map((source) => (
                      <Box key={source.source} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2">
                          {source.source}
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="primary" fontWeight="medium">
                            {source.amount.toLocaleString()} ر.س
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {source.percentage}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Financial Health Indicators */}
              <Grid size={{xs: 12}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      مؤشرات الصحة المالية
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <Box sx={{ 
                          p: 2,
                          bgcolor: 'success.light',
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" color="success.dark" fontWeight="bold">
                            {((financialReport?.profit || 0) / (financialReport?.revenue || 1) * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="success.dark">
                            هامش الربح
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <Box sx={{ 
                          p: 2,
                          bgcolor: 'primary.light',
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" color="primary.dark" fontWeight="bold">
                            {((financialReport?.revenue || 0) / (financialReport?.expenses || 1)).toFixed(1)}x
                          </Typography>
                          <Typography variant="body2" color="primary.dark">
                            نسبة الإيرادات للمصروفات
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <Box sx={{ 
                          p: 2,
                          bgcolor: 'warning.light',
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" color="warning.dark" fontWeight="bold">
                            {financialReport?.cashFlow?.length ? 
                              (financialReport.cashFlow[financialReport.cashFlow.length - 1]?.balance || 0).toLocaleString() : 
                              0} ر.س
                          </Typography>
                          <Typography variant="body2" color="warning.dark">
                            الرصيد النقدي الحالي
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 3}}>
                        <Box sx={{ 
                          p: 2,
                          bgcolor: 'info.light',
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" color="info.dark" fontWeight="bold">
                            +12.5%
                          </Typography>
                          <Typography variant="body2" color="info.dark">
                            نمو الإيرادات
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Marketing Tab */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              {/* Marketing Overview Cards */}
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي الحملات"
                  value={marketingReport?.totalCampaigns?.toLocaleString() || 0}
                  change={8.2}
                  icon={<Assessment sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="الحملات النشطة"
                  value={marketingReport?.activeCampaigns?.toLocaleString() || 0}
                  change={12.5}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي الكوبونات"
                  value={marketingReport?.totalCoupons?.toLocaleString() || 0}
                  change={15.7}
                  icon={<ShoppingCart sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="عائد الاستثمار"
                  value={`${marketingReport?.roi?.toFixed(1) || 0}%`}
                  change={22.3}
                  icon={<AttachMoney sx={{ fontSize: 32, color: 'info.main' }} />}
                  color="info"
                />
              </Grid>

              {/* Campaign Performance */}
              <Grid size={{xs: 12, lg: 8}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أداء الحملات التسويقية
                    </Typography>
                    {marketingReport?.campaignPerformance?.map((campaign, index) => (
                      <Box key={campaign.campaign} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 2,
                        borderBottom: index < marketingReport.campaignPerformance.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {campaign.campaign}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            وصول: {campaign.reach.toLocaleString()} | تحويلات: {campaign.conversions}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="primary" fontWeight="medium">
                            {campaign.revenue.toLocaleString()} ر.س
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            معدل التحويل: {((campaign.conversions / campaign.reach) * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Marketing Metrics */}
              <Grid size={{xs: 12, lg: 4}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      مؤشرات التسويق
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'primary.light',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" fontWeight="medium">
                          معدل التحويل
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {marketingReport?.conversionRate?.toFixed(1) || 0}%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'success.light',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" fontWeight="medium">
                          إجمالي الخصومات
                        </Typography>
                        <Typography variant="body2" color="success.dark" fontWeight="bold">
                          {marketingReport?.totalDiscountGiven?.toLocaleString() || 0} ر.س
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'warning.light',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" fontWeight="medium">
                          عائد الاستثمار
                        </Typography>
                        <Typography variant="body2" color="warning.dark" fontWeight="bold">
                          {marketingReport?.roi?.toFixed(1) || 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Coupons */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أفضل الكوبونات أداءً
                    </Typography>
                    {marketingReport?.topCoupons?.slice(0, 8).map((coupon, index) => (
                      <Box key={coupon.code} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: index < 7 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {coupon.code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {coupon.uses} استخدام
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          {coupon.revenue.toLocaleString()} ر.س
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Marketing Insights */}
              <Grid size={{xs: 12, md: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      رؤى التسويق
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: 'success.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'success.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="success.dark">
                          🎯 أفضل حملة أداءً
                        </Typography>
                        <Typography variant="caption" color="success.dark">
                          {marketingReport?.campaignPerformance?.[0]?.campaign || 'لا توجد بيانات'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: 'primary.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'primary.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="primary.dark">
                          💰 إجمالي العائد من التسويق
                        </Typography>
                        <Typography variant="caption" color="primary.dark">
                          {marketingReport?.campaignPerformance?.reduce((sum, campaign) => sum + campaign.revenue, 0)?.toLocaleString() || 0} ر.س
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: 'warning.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'warning.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="warning.dark">
                          🎫 أكثر كوبون استخداماً
                        </Typography>
                        <Typography variant="caption" color="warning.dark">
                          {marketingReport?.topCoupons?.[0]?.code || 'لا توجد بيانات'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: 'info.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'info.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="info.dark">
                          📈 متوسط معدل التحويل
                        </Typography>
                        <Typography variant="caption" color="info.dark">
                          {marketingReport?.conversionRate?.toFixed(1) || 0}% من إجمالي الوصول
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Inventory Tab */}
          <TabPanel value={activeTab} index={6}>
            <Grid container spacing={3}>
              {/* Inventory Overview Cards */}
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="إجمالي المنتجات"
                  value={inventoryReport?.totalProducts?.toLocaleString() || 0}
                  change={5.2}
                  icon={<Inventory sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="متوفر في المخزون"
                  value={inventoryReport?.inStock?.toLocaleString() || 0}
                  change={3.8}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="نفد من المخزون"
                  value={inventoryReport?.outOfStock?.toLocaleString() || 0}
                  change={-2.1}
                  icon={<Support sx={{ fontSize: 32, color: 'error.main' }} />}
                  color="error"
                />
              </Grid>
              <Grid size={{xs: 12, md: 3}}>
                <StatsCard
                  title="قيمة المخزون"
                  value={`${inventoryReport?.totalValue?.toLocaleString() || 0} ر.س`}
                  change={8.9}
                  icon={<AttachMoney sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>

              {/* Inventory by Category */}
              <Grid size={{xs: 12, lg: 6}}>
                <PieChartComponent
                  data={inventoryReport?.byCategory?.map(item => ({
                    name: item.category,
                    value: item.count,
                  })) || []}
                  title="توزيع المخزون حسب الفئة"
                  height={350}
                />
              </Grid>

              {/* Inventory Status Overview */}
              <Grid size={{xs: 12, lg: 6}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      حالة المخزون
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'success.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'success.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="success.dark">
                          ✅ متوفر في المخزون
                        </Typography>
                        <Typography variant="body2" color="success.dark" fontWeight="bold">
                          {inventoryReport?.inStock || 0} منتج
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'warning.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'warning.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="warning.dark">
                          ⚠️ قليل المخزون
                        </Typography>
                        <Typography variant="body2" color="warning.dark" fontWeight="bold">
                          {inventoryReport?.lowStock || 0} منتج
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'error.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'error.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="error.dark">
                          ❌ نفد من المخزون
                        </Typography>
                        <Typography variant="body2" color="error.dark" fontWeight="bold">
                          {inventoryReport?.outOfStock || 0} منتج
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'primary.light',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'primary.main'
                      }}>
                        <Typography variant="body2" fontWeight="medium" color="primary.dark">
                          💰 إجمالي القيمة
                        </Typography>
                        <Typography variant="body2" color="primary.dark" fontWeight="bold">
                          {inventoryReport?.totalValue?.toLocaleString() || 0} ر.س
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Inventory Movements */}
              <Grid size={{xs: 12, lg: 8}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      حركة المخزون الأخيرة
                    </Typography>
                    {inventoryReport?.movements?.slice(-10).map((movement, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: index < 9 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography 
                            variant="body2" 
                            color={movement.type === 'in' ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {movement.type === 'in' ? '⬆️' : '⬇️'}
                          </Typography>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {new Date(movement.date).toLocaleDateString('ar-SA')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {movement.type === 'in' ? 'دخول للمخزون' : 'خروج من المخزون'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color={movement.type === 'in' ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Category Breakdown */}
              <Grid size={{xs: 12, lg: 4}}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تفصيل المخزون حسب الفئة
                    </Typography>
                    {inventoryReport?.byCategory?.map((category) => (
                      <Box key={category.category} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2">
                          {category.category}
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="primary" fontWeight="medium">
                            {category.count} منتج
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {category.value.toLocaleString()} ر.س
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Inventory Alerts */}
              <Grid size={{xs: 12}}>
                <Card sx={{ border: '2px solid', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      🚨 تنبيهات المخزون
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{xs: 12, sm: 6, md: 4}}>
                        <Box sx={{ 
                          p: 2,
                          bgcolor: 'error.light',
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" color="error.dark" fontWeight="bold">
                            {inventoryReport?.outOfStock || 0}
                          </Typography>
                          <Typography variant="body2" color="error.dark">
                            منتجات نفدت من المخزون
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 4}}>
                        <Box sx={{ 
                          p: 2,
                          bgcolor: 'warning.light',
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" color="warning.dark" fontWeight="bold">
                            {inventoryReport?.lowStock || 0}
                          </Typography>
                          <Typography variant="body2" color="warning.dark">
                            منتجات قليلة المخزون
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{xs: 12, sm: 6, md: 4}}>
                        <Box sx={{ 
                          p: 2,
                          bgcolor: 'success.light',
                          borderRadius: 1,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" color="success.dark" fontWeight="bold">
                            {inventoryReport?.inStock || 0}
                          </Typography>
                          <Typography variant="body2" color="success.dark">
                            منتجات متوفرة في المخزون
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};
