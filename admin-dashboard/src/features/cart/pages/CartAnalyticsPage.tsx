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
  useTheme,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  ShoppingCart,
  Email,
  Assessment,
  ArrowBack,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
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
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export const CartAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('cart');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();

  // State management
  const [period, setPeriod] = useState('30');
  const [tabValue, setTabValue] = useState(0);

  // Custom hooks
  const { analytics, statistics, conversionRates, isLoading, error } = useCartDashboard(period);
  const overview = analytics?.overview;

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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between" 
        mb={3}
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/carts')}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('actions.back')}
          </Button>
          <Assessment fontSize={isMobile ? 'medium' : 'large'} color="primary" />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: 'text.primary',
            }}
          >
            {t('navigation.analytics')}
          </Typography>
        </Box>
        <Box 
          display="flex" 
          gap={1}
          flexDirection={{ xs: 'column', sm: 'row' }}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <FormControl 
            size="small" 
            sx={{ minWidth: { xs: '100%', sm: 120 } }}
            fullWidth={isMobile}
          >
            <InputLabel>{t('stats.period.label')}</InputLabel>
            <Select 
              value={period} 
              onChange={(event) => handlePeriodChange(event as any)} 
              label={t('stats.period.label')}
            >
              <MenuItem value="7">{t('stats.period.7days')}</MenuItem>
              <MenuItem value="30">{t('stats.period.30days')}</MenuItem>
              <MenuItem value="90">{t('stats.period.90days')}</MenuItem>
              <MenuItem value="365">{t('stats.period.1year')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('actions.refresh')}
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
      <Paper 
        sx={{ 
          mt: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minHeight: { xs: 48, sm: 72 },
              padding: { xs: '8px 12px', sm: '12px 16px' },
            },
          }}
        >
          <Tab 
            label={isMobile ? undefined : t('analytics.tabs.overview')} 
            icon={<Assessment />}
            iconPosition={isMobile ? 'top' : 'start'}
          />
          <Tab 
            label={isMobile ? undefined : t('analytics.tabs.conversion')} 
            icon={<TrendingUp />}
            iconPosition={isMobile ? 'top' : 'start'}
          />
          <Tab 
            label={isMobile ? undefined : t('analytics.tabs.abandoned')} 
            icon={<TrendingDown />}
            iconPosition={isMobile ? 'top' : 'start'}
          />
          <Tab 
            label={isMobile ? undefined : t('analytics.tabs.revenue')} 
            icon={<MonetizationOn />}
            iconPosition={isMobile ? 'top' : 'start'}
          />
          <Tab 
            label={isMobile ? undefined : t('analytics.tabs.customerBehavior')} 
            icon={<ShoppingCart />}
            iconPosition={isMobile ? 'top' : 'start'}
          />
          <Tab 
            label={isMobile ? undefined : t('analytics.tabs.recovery')} 
            icon={<Email />}
            iconPosition={isMobile ? 'top' : 'start'}
          />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Conversion Rate Chart */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('analytics.charts.conversionRate')}
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : conversionRates?.daily ? (
                    <Box sx={{ height: { xs: 200, sm: 300 } }}>
                      {/* Line Chart would go here */}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center" 
                        height="100%"
                        sx={{
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, textAlign: 'center', p: 2 }}
                        >
                          {t('analytics.charts.conversionRateChart')}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('analytics.charts.noData')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('analytics.charts.keyMetrics')}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                      >
                        {t('analytics.charts.currentConversionRate')}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        color="primary.main"
                        sx={{ 
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          fontWeight: 'bold',
                          mb: 0.5,
                        }}
                      >
                        {statistics?.allTime?.conversionRate !== undefined
                          ? `${statistics.allTime.conversionRate.toFixed(1)}%`
                          : overview?.conversionRate !== undefined
                            ? `${overview.conversionRate.toFixed(1)}%`
                            : '0%'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          color: getConversionTrend() >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {getConversionTrend() >= 0 ? '+' : ''}
                        {getConversionTrend().toFixed(1)}% {t('analytics.charts.fromPreviousWeek')}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                      >
                        {t('analytics.charts.currentAbandonmentRate')}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        color="warning.main"
                        sx={{ 
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          fontWeight: 'bold',
                          mb: 0.5,
                        }}
                      >
                        {statistics?.allTime?.abandonmentRate !== undefined
                          ? `${statistics.allTime.abandonmentRate.toFixed(1)}%`
                          : overview?.abandonmentRate !== undefined
                            ? `${overview.abandonmentRate.toFixed(1)}%`
                            : '0%'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          color: getAbandonmentTrend() >= 0 ? 'error.main' : 'success.main',
                        }}
                      >
                        {getAbandonmentTrend() >= 0 ? '+' : ''}
                        {getAbandonmentTrend().toFixed(1)}% {t('analytics.charts.fromPreviousWeek')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Cart Status Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('analytics.charts.cartStatusDistribution')}
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : analytics ? (
                    <Box sx={{ height: { xs: 200, sm: 250 } }}>
                      {/* Pie Chart would go here */}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center" 
                        height="100%"
                        sx={{
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, textAlign: 'center', p: 2 }}
                        >
                          {t('analytics.charts.cartStatusDistributionChart')}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('analytics.charts.noData')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Trends */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('analytics.charts.revenueTrends')}
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box sx={{ height: { xs: 200, sm: 250 } }}>
                      {/* Bar Chart would go here */}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center" 
                        height="100%"
                        sx={{
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, textAlign: 'center', p: 2 }}
                        >
                          {t('analytics.charts.revenueTrendsChart')}
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
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('analytics.charts.detailedConversionRates')}
                  </Typography>
                  {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : conversionRates ? (
                    <Box>
                      <Grid container spacing={{ xs: 2, sm: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Paper 
                            sx={{ 
                              p: { xs: 1.5, sm: 2 },
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                              border: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              color="primary.main"
                              sx={{ 
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 'bold',
                                mb: 0.5,
                              }}
                            >
                              {t('analytics.charts.daily')}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {t('analytics.charts.last7Days')}: {conversionRates.daily?.slice(-7).length || 0} {t('analytics.charts.days')}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Paper 
                            sx={{ 
                              p: { xs: 1.5, sm: 2 },
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                              border: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              color="primary.main"
                              sx={{ 
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 'bold',
                                mb: 0.5,
                              }}
                            >
                              {t('analytics.charts.weekly')}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {t('analytics.charts.last4Weeks')}: {conversionRates.weekly?.length || 0} {t('analytics.charts.weeks')}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Paper 
                            sx={{ 
                              p: { xs: 1.5, sm: 2 },
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                              border: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              color="primary.main"
                              sx={{ 
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 'bold',
                                mb: 0.5,
                              }}
                            >
                              {t('analytics.charts.monthly')}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {t('analytics.charts.last12Months')}: {conversionRates.monthly?.length || 0} {t('analytics.charts.months')}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Typography 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('analytics.charts.noData')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Other tabs would contain similar chart components */}
        <TabPanel value={tabValue} index={2}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                color="text.primary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {t('analytics.charts.abandonedCartsContent')}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                color="text.primary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {t('analytics.charts.revenueContent')}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                color="text.primary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {t('analytics.charts.customerBehaviorContent')}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                color="text.primary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {t('analytics.charts.recoveryContent')}
              </Typography>
            </CardContent>
          </Card>
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
          bgcolor={theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'}
          zIndex={9999}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default CartAnalyticsPage;
