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
  IconButton,
  Tooltip,
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
  FilterList,
  DateRange,
  Category,
  Print,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

// Import existing components
import { StatsCard } from '../components/StatsCard';
import { PieChartComponent } from '../components/PieChartComponent';
import { RevenueChart } from '../components/RevenueChart';

// Import API functions
import { analyticsApi } from '../api/analyticsApi';

// Import types
import {
  PeriodType,
  SalesAnalytics,
  ProductPerformance,
  CustomerAnalytics,
  InventoryReport,
  FinancialReport,
  MarketingReport,
  RealTimeMetrics,
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

  // Real-time metrics query
  const { data: realtimeMetrics, isLoading: realtimeLoading } = useQuery<RealTimeMetrics>({
    queryKey: ['realtime-metrics'],
    queryFn: analyticsApi.getRealTimeMetrics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Sales analytics query
  const { data: salesAnalytics, isLoading: salesLoading } = useQuery<SalesAnalytics>({
    queryKey: ['sales-analytics', selectedPeriod],
    queryFn: () => analyticsApi.getSalesAnalytics({ period: selectedPeriod }),
  });

  // Product performance query
  const { data: productPerformance, isLoading: productLoading } = useQuery<ProductPerformance>({
    queryKey: ['product-performance', selectedPeriod],
    queryFn: () => analyticsApi.getProductPerformance({ period: selectedPeriod }),
  });

  // Customer analytics query
  const { data: customerAnalytics, isLoading: customerLoading } = useQuery<CustomerAnalytics>({
    queryKey: ['customer-analytics', selectedPeriod],
    queryFn: () => analyticsApi.getCustomerAnalytics({ period: selectedPeriod }),
  });

  // Inventory report query
  const { data: inventoryReport, isLoading: inventoryLoading } = useQuery<InventoryReport>({
    queryKey: ['inventory-report', selectedPeriod],
    queryFn: () => analyticsApi.getInventoryReport({ period: selectedPeriod }),
  });

  // Financial report query
  const { data: financialReport, isLoading: financialLoading } = useQuery<FinancialReport>({
    queryKey: ['financial-report', selectedPeriod],
    queryFn: () => analyticsApi.getFinancialReport({ period: selectedPeriod }),
  });

  // Marketing report query
  const { data: marketingReport, isLoading: marketingLoading } = useQuery<MarketingReport>({
    queryKey: ['marketing-report', selectedPeriod],
    queryFn: () => analyticsApi.getMarketingReport({ period: selectedPeriod }),
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  const handleExportData = (type: string, format: string) => {
    // Implementation for data export
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
                  المستخدمون النشطون: {realtimeMetrics.activeUsers}
                </Typography>
                <Typography variant="body2">
                  المبيعات اليوم: {realtimeMetrics.todaySales.toLocaleString()} ر.س
                </Typography>
                <Typography variant="body2">
                  حالة النظام: {realtimeMetrics.systemHealth.status === 'healthy' ? 'سليم' : 'تحت الصيانة'}
                </Typography>
              </Box>
              <Typography variant="caption">
                آخر تحديث: {new Date(realtimeMetrics.lastUpdated).toLocaleTimeString('ar-SA')}
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
              <Grid item xs={12} md={3}>
                <StatsCard
                  title="إجمالي الإيرادات"
                  value={`${salesAnalytics?.totalRevenue?.toLocaleString() || 0} ر.س`}
                  change={15.5}
                  icon={<AttachMoney sx={{ fontSize: 32, color: 'primary.main' }} />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatsCard
                  title="إجمالي الطلبات"
                  value={salesAnalytics?.totalOrders?.toLocaleString() || 0}
                  change={8.3}
                  icon={<ShoppingCart sx={{ fontSize: 32, color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatsCard
                  title="متوسط قيمة الطلب"
                  value={`${salesAnalytics?.averageOrderValue?.toLocaleString() || 0} ر.س`}
                  change={12.1}
                  icon={<TrendingUp sx={{ fontSize: 32, color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StatsCard
                  title="العملاء الجدد"
                  value={customerAnalytics?.newCustomers?.toLocaleString() || 0}
                  change={22.4}
                  icon={<People sx={{ fontSize: 32, color: 'info.main' }} />}
                  color="info"
                />
              </Grid>

              {/* Charts Row */}
              <Grid item xs={12} lg={8}>
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

              <Grid item xs={12} lg={4}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تحليلات المبيعات التفصيلية
                    </Typography>
                    {/* Sales analytics content will be implemented here */}
                    <Typography variant="body2" color="text.secondary">
                      محتوى تحليلات المبيعات التفصيلية قيد التطوير...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Products Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      أداء المنتجات
                    </Typography>
                    {/* Product performance content will be implemented here */}
                    <Typography variant="body2" color="text.secondary">
                      محتوى أداء المنتجات قيد التطوير...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Customers Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تحليلات العملاء
                    </Typography>
                    {/* Customer analytics content will be implemented here */}
                    <Typography variant="body2" color="text.secondary">
                      محتوى تحليلات العملاء قيد التطوير...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Financial Tab */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      التقارير المالية
                    </Typography>
                    {/* Financial report content will be implemented here */}
                    <Typography variant="body2" color="text.secondary">
                      محتوى التقارير المالية قيد التطوير...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Marketing Tab */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تحليلات التسويق
                    </Typography>
                    {/* Marketing analytics content will be implemented here */}
                    <Typography variant="body2" color="text.secondary">
                      محتوى تحليلات التسويق قيد التطوير...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Inventory Tab */}
          <TabPanel value={activeTab} index={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      تقرير المخزون
                    </Typography>
                    {/* Inventory report content will be implemented here */}
                    <Typography variant="body2" color="text.secondary">
                      محتوى تقرير المخزون قيد التطوير...
                    </Typography>
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
