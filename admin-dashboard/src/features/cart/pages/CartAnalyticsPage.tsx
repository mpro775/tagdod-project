import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  ShoppingCart,
  Email,
  Assessment,
} from '@mui/icons-material';
import { useCartDashboard } from '../hooks/useCart';
import { CartStatsCards } from '../components';

// Chart components (you'll need to install and configure these)
// import { LineChart, BarChart, PieChart } from 'recharts';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const CartAnalyticsPage: React.FC = () => {
  // State management
  const [period, setPeriod] = useState('30');
  const [tabValue, setTabValue] = useState(0);

  // Custom hooks
  const { analytics, statistics, conversionRates, isLoading, error } = useCartDashboard(period);

  // Event handlers
  const handlePeriodChange = (event: any) => {
    setPeriod(event.target.value);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    // Refresh data by changing period briefly
    const currentPeriod = period;
    setPeriod('');
    setTimeout(() => setPeriod(currentPeriod), 100);
  };

  // Calculate additional metrics
  const getConversionTrend = () => {
    if (!conversionRates?.data?.daily || conversionRates.data.daily.length < 2) return 0;
    const recent = conversionRates.data.daily.slice(-7); // Last 7 days
    const older = conversionRates.data.daily.slice(-14, -7); // Previous 7 days

    if (recent.length === 0 || older.length === 0) return 0;

    const recentAvg =
      recent.reduce((sum: number, day: any) => sum + day.conversionRate, 0) / recent.length;
    const olderAvg =
      older.reduce((sum: number, day: any) => sum + day.conversionRate, 0) / older.length;

    if (olderAvg === 0) return 0;
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  const getAbandonmentTrend = () => {
    if (!conversionRates?.data?.daily || conversionRates.data.daily.length < 2) return 0;
    const recent = conversionRates.data.daily.slice(-7);
    const older = conversionRates.data.daily.slice(-14, -7);

    if (recent.length === 0 || older.length === 0) return 0;

    const recentAvg =
      recent.reduce((sum: number, day: any) => sum + day.abandonedCarts, 0) / recent.length;
    const olderAvg =
      older.reduce((sum: number, day: any) => sum + day.abandonedCarts, 0) / older.length;

    if (olderAvg === 0) return 0;
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          تحليلات السلة
        </Typography>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>الفترة</InputLabel>
            <Select value={period} onChange={(event) => handlePeriodChange(event as any)} label="الفترة">
              <MenuItem value="7">آخر 7 أيام</MenuItem>
              <MenuItem value="30">آخر 30 يوم</MenuItem>
              <MenuItem value="90">آخر 90 يوم</MenuItem>
              <MenuItem value="365">آخر سنة</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            تحديث
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <CartStatsCards
        statistics={statistics?.data}
        analytics={analytics?.data}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Analytics Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="نظرة عامة" icon={<Assessment />} />
          <Tab label="معدلات التحويل" icon={<TrendingUp />} />
          <Tab label="السلات المتروكة" icon={<TrendingDown />} />
          <Tab label="الإيرادات" icon={<MonetizationOn />} />
          <Tab label="سلوك العملاء" icon={<ShoppingCart />} />
          <Tab label="حملات الاسترداد" icon={<Email />} />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Conversion Rate Chart */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    معدل التحويل اليومي
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : conversionRates?.data?.daily ? (
                    <Box height={300}>
                      {/* Line Chart would go here */}
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">
                          مخطط معدل التحويل (يتطلب تثبيت مكتبة الرسوم البيانية)
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">لا توجد بيانات متاحة</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    المؤشرات الرئيسية
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        معدل التحويل الحالي
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {statistics?.data?.conversionRate
                          ? `${(statistics.data.conversionRate * 100).toFixed(1)}%`
                          : '0%'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={getConversionTrend() >= 0 ? 'success.main' : 'error.main'}
                      >
                        {getConversionTrend() >= 0 ? '+' : ''}
                        {getConversionTrend().toFixed(1)}% من الأسبوع الماضي
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        معدل الهجر الحالي
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {statistics?.data?.abandonmentRate
                          ? `${(statistics.data.abandonmentRate * 100).toFixed(1)}%`
                          : '0%'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={getAbandonmentTrend() >= 0 ? 'error.main' : 'success.main'}
                      >
                        {getAbandonmentTrend() >= 0 ? '+' : ''}
                        {getAbandonmentTrend().toFixed(1)}% من الأسبوع الماضي
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Cart Status Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    توزيع حالة السلات
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : analytics ? (
                    <Box height={250}>
                      {/* Pie Chart would go here */}
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">
                          مخطط توزيع السلات (يتطلب تثبيت مكتبة الرسوم البيانية)
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">لا توجد بيانات متاحة</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Trends */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    اتجاهات الإيرادات
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box height={250}>
                      {/* Bar Chart would go here */}
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">
                          مخطط الإيرادات (يتطلب تثبيت مكتبة الرسوم البيانية)
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Conversion Rates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    معدلات التحويل التفصيلية
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : conversionRates?.data ? (
                    <Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary">
                              يومياً
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              آخر 7 أيام: {conversionRates.data.daily?.slice(-7).length || 0} أيام
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary">
                              أسبوعياً
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              آخر 4 أسابيع: {conversionRates.data.weekly?.length || 0} أسابيع
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary">
                              شهرياً
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              آخر 12 شهر: {conversionRates.data.monthly?.length || 0} أشهر
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">لا توجد بيانات متاحة</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Other tabs would contain similar chart components */}
        <TabPanel value={tabValue} index={2}>
          <Typography>محتوى السلات المتروكة</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography>محتوى الإيرادات</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography>محتوى سلوك العملاء</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography>محتوى حملات الاسترداد</Typography>
        </TabPanel>
      </Paper>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.1)"
          zIndex={9999}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default CartAnalyticsPage;
