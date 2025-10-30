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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    if (!conversionRates?.daily || conversionRates.daily.length < 2) return 0;
    const recent = conversionRates.daily.slice(-7); // Last 7 days
    const older = conversionRates.daily.slice(-14, -7); // Previous 7 days

    if (recent.length === 0 || older.length === 0) return 0;

    const recentAvg =
      recent.reduce((sum: number, day: any) => sum + day.conversionRate, 0) / recent.length;
    const olderAvg =
      older.reduce((sum: number, day: any) => sum + day.conversionRate, 0) / older.length;

    if (olderAvg === 0) return 0;
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  const getAbandonmentTrend = () => {
    if (!conversionRates?.daily || conversionRates.daily.length < 2) return 0;
    const recent = conversionRates.daily.slice(-7);
    const older = conversionRates.daily.slice(-14, -7);

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
          {t('cart.navigation.analytics')}
        </Typography>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('cart.stats.period.label')}</InputLabel>
            <Select value={period} onChange={(event) => handlePeriodChange(event as any)} label={t('cart.stats.period.label')}>
              <MenuItem value="7">{t('cart.stats.period.7days')}</MenuItem>
              <MenuItem value="30">{t('cart.stats.period.30days')}</MenuItem>
              <MenuItem value="90">{t('cart.stats.period.90days')}</MenuItem>
              <MenuItem value="365">{t('cart.stats.period.1year')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {t('cart.actions.refresh')}
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
        statistics={statistics}
        analytics={analytics}
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
          <Tab label={t('cart.analytics.tabs.overview', { defaultValue: 'نظرة عامة' })} icon={<Assessment />} />
          <Tab label={t('cart.analytics.tabs.conversion', { defaultValue: 'معدل التحويل' })} icon={<TrendingUp />} />
          <Tab label={t('cart.analytics.tabs.abandoned', { defaultValue: 'السلات المتروكة' })} icon={<TrendingDown />} />
          <Tab label={t('cart.analytics.tabs.revenue', { defaultValue: 'الإيرادات' })} icon={<MonetizationOn />} />
          <Tab label={t('cart.analytics.tabs.customerBehavior', { defaultValue: 'سلوك العملاء' })} icon={<ShoppingCart />} />
          <Tab label={t('cart.analytics.tabs.recovery', { defaultValue: 'حملات الاسترداد' })} icon={<Email />} />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Conversion Rate Chart */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('cart.analytics.charts.conversionRate', { defaultValue: 'معدل التحويل اليومي' })}
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : conversionRates?.daily ? (
                    <Box height={300}>
                      {/* Line Chart would go here */}
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">
                          {t('cart.analytics.charts.conversionRateChart', { defaultValue: 'مخطط معدل التحويل (يتطلب تثبيت مكتبة الرسوم البيانية)' })}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">{t('cart.analytics.charts.noData', { defaultValue: 'لا توجد بيانات متاحة' })}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('cart.analytics.charts.keyMetrics', { defaultValue: 'المؤشرات الرئيسية' })}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('cart.analytics.charts.conversionRate', { defaultValue: 'معدل التحويل الحالي' })}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {statistics?.conversionRate
                          ? `${(statistics.conversionRate * 100).toFixed(1)}%`
                          : '0%'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={getConversionTrend() >= 0 ? 'success.main' : 'error.main'}
                      >
                        {getConversionTrend() >= 0 ? '+' : ''}
                        {getConversionTrend().toFixed(1)}% {t('cart.analytics.charts.fromPreviousWeek', { defaultValue: 'من الأسبوع الماضي' })}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('cart.analytics.charts.abandonmentRate', { defaultValue: 'معدل الهجر الحالي' })}
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {statistics?.abandonmentRate
                          ? `${(statistics.abandonmentRate * 100).toFixed(1)}%`
                          : '0%'}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={getAbandonmentTrend() >= 0 ? 'error.main' : 'success.main'}
                      >
                        {getAbandonmentTrend() >= 0 ? '+' : ''}
                        {getAbandonmentTrend().toFixed(1)}% {t('cart.analytics.charts.fromPreviousWeek', { defaultValue: 'من الأسبوع الماضي' })}
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
                    {t('cart.analytics.charts.cartStatusDistribution', { defaultValue: 'توزيع حالة السلات' })}    
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
                          {t('cart.analytics.charts.cartStatusDistributionChart', { defaultValue: 'مخطط توزيع السلات (يتطلب تثبيت مكتبة الرسوم البيانية)' })}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">{t('cart.analytics.charts.noData', { defaultValue: 'لا توجد بيانات متاحة' })}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Trends */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('cart.analytics.charts.revenueTrends', { defaultValue: 'اتجاهات الإيرادات' })}
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
                          {t('cart.analytics.charts.revenueTrendsChart', { defaultValue: 'مخطط الإيرادات (يتطلب تثبيت مكتبة الرسوم البيانية)' })}
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
                    {t('cart.analytics.charts.detailedConversionRates', { defaultValue: 'معدلات التحويل التفصيلية' })}
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : conversionRates ? (
                    <Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary">
                              {t('cart.analytics.charts.daily', { defaultValue: 'يومياً' })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('cart.analytics.charts.last7Days', { defaultValue: 'آخر 7 أيام' })}: {conversionRates.daily?.slice(-7).length || 0} {t('cart.analytics.charts.days', { defaultValue: 'أيام' })}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary">
                              {t('cart.analytics.charts.weekly', { defaultValue: 'أسبوعياً' })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('cart.analytics.charts.last4Weeks', { defaultValue: 'آخر 4 أسابيع' })}: {conversionRates.weekly?.length || 0} {t('cart.analytics.charts.weeks', { defaultValue: 'أسابيع' })}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" color="primary">
                              {t('cart.analytics.charts.monthly', { defaultValue: 'شهرياً' })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('cart.analytics.charts.last12Months', { defaultValue: 'آخر 12 شهر' })}: {conversionRates.monthly?.length || 0} {t('cart.analytics.charts.months', { defaultValue: 'أشهر' })} 
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">{t('cart.analytics.charts.noData', { defaultValue: 'لا توجد بيانات متاحة' })}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Other tabs would contain similar chart components */}
        <TabPanel value={tabValue} index={2}>
          <Typography>{t('cart.analytics.charts.abandonedCartsContent', { defaultValue: 'محتوى السلات المتروكة' })}</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography>{t('cart.analytics.charts.revenueContent', { defaultValue: 'محتوى الإيرادات' })}</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography>{t('cart.analytics.charts.customerBehaviorContent', { defaultValue: 'محتوى سلوك العملاء' })}</Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography>{t('cart.analytics.charts.recoveryContent', { defaultValue: 'محتوى حملات الاسترداد' })}</Typography>
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
