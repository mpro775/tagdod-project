import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Skeleton,
  Alert,
  Paper,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  useTheme,
  Collapse,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  Refresh,
  Download,
  FilterList,
  BarChart,
  PieChart,
  ShowChart,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  useRequestsStatistics,
  useEngineersStatistics,
  useServiceTypesStatistics,
  useRevenueStatistics,
} from '../hooks/useServices';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';

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

// Loading skeleton component
const AnalyticsSkeleton: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <Skeleton variant="text" width="40%" />
      </Typography>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
              }}
            >
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const ServicesAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('services');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [filterExpanded, setFilterExpanded] = useState(!isMobile);
  const [dateRange, setDateRange] = useState({
    dateFrom: '',
    dateTo: '',
    groupBy: 'day' as 'day' | 'week' | 'month',
  });

  // Update filter expanded state when screen size changes
  useEffect(() => {
    setFilterExpanded(!isMobile);
  }, [isMobile]);

  const {
    data: requestsStats,
    isLoading: requestsLoading,
    error: requestsError,
  } = useRequestsStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    groupBy: dateRange.groupBy,
  });

  const {
    data: engineersStats,
    isLoading: engineersLoading,
    error: engineersError,
  } = useEngineersStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    limit: 10,
  });

  const {
    data: serviceTypesStats,
    isLoading: serviceTypesLoading,
    error: serviceTypesError,
  } = useServiceTypesStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  const {
    data: revenueStats,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    groupBy: dateRange.groupBy,
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (key: string, value: any) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('titles.servicesAnalytics')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('stats.comprehensiveAnalytics')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('stats.timePeriod')}</InputLabel>
            <Select
              value={dateRange.groupBy}
              label={t('stats.timePeriod')}
              onChange={(e) => handleDateRangeChange('groupBy', e.target.value)}
            >
              <MenuItem value="day">{t('stats.daily')}</MenuItem>
              <MenuItem value="week">{t('stats.weekly')}</MenuItem>
              <MenuItem value="month">{t('stats.monthly')}</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<Refresh />} size="small">
            {t('labels.refresh')}
          </Button>

          <Button variant="contained" startIcon={<Download />} size="small">
            {t('stats.exportReport')}
          </Button>
        </Stack>
      </Box>

      <Paper 
        sx={{ 
          mb: 3, 
          p: { xs: 2, sm: 2 },
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
        }}
      >
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between" 
          gap={2}
          mb={filterExpanded ? 2 : 0}
        >
          <Box display="flex" alignItems="center" gap={1} width="100%">
            <Typography variant="h6" sx={{ flex: 1 }}>
              {t('stats.dateFilter')}
            </Typography>
            {isMobile && (
              <IconButton
                onClick={() => setFilterExpanded(!filterExpanded)}
                size="small"
                color="primary"
              >
                {filterExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
          {!isMobile && (
            <Chip
              icon={<FilterList />}
              label={t('stats.activeFilters')}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
          <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('stats.fromDate')}</InputLabel>
              <Select
                value={dateRange.dateFrom}
                label={t('stats.fromDate')}
                onChange={(e) => handleDateRangeChange('dateFrom', e.target.value)}
              >
                <MenuItem value="">{t('stats.optional')}</MenuItem>
                <MenuItem value="2024-01-01">{t('stats.sinceYearStart')}</MenuItem>
                <MenuItem value="2024-06-01">{t('stats.since6Months')}</MenuItem>
                <MenuItem value="2024-11-01">{t('stats.since3Months')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('stats.toDate')}</InputLabel>
              <Select
                value={dateRange.dateTo}
                label={t('stats.toDate')}
                onChange={(e) => handleDateRangeChange('dateTo', e.target.value)}
              >
                <MenuItem value="">{t('stats.untilNow')}</MenuItem>
                <MenuItem value="2024-12-31">{t('stats.yearEnd')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('stats.dataGrouping')}</InputLabel>
              <Select
                value={dateRange.groupBy}
                label={t('stats.dataGrouping')}
                onChange={(e) => handleDateRangeChange('groupBy', e.target.value)}
              >
                <MenuItem value="day">{t('stats.daily')}</MenuItem>
                <MenuItem value="week">{t('stats.weekly')}</MenuItem>
                <MenuItem value="month">{t('stats.monthly')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Button variant="contained" startIcon={<FilterList />} fullWidth size="large">
              {t('stats.applyFilters')}
            </Button>
          </Grid>
          </Grid>
        </Collapse>
      </Paper>

      <Card
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 500,
              },
            }}
          >
            <Tab icon={<Timeline />} label={t('stats.requestTrends')} iconPosition="start" />
            <Tab icon={<TrendingUp />} label={t('stats.engineerPerformance')} iconPosition="start" />
            <Tab icon={<Assessment />} label={t('stats.serviceTypes')} iconPosition="start" />
            <Tab icon={<TrendingDown />} label={t('stats.revenueTrends')} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={3}
          >
            <Typography variant="h6">{t('stats.requestTrends')}</Typography>
            <Chip
              icon={<BarChart />}
              label={`${formatNumber(Array.isArray(requestsStats) ? requestsStats.length : 0, 'en')} ${t('stats.period')}`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {requestsLoading ? (
            <AnalyticsSkeleton />
          ) : requestsError ? (
            <Alert severity="error">{t('stats.failedToLoadRequests')}: {requestsError.message}</Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(requestsStats) ? requestsStats : [])?.map((stat, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" color="primary">
                          {stat._id}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Timeline />
                        </Avatar>
                      </Box>

                      <Typography 
                        variant="h4" 
                        color="primary" 
                        sx={{ 
                          mb: 1,
                          fontFeatureSettings: '"tnum"',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatNumber(stat.total, 'en')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('stats.totalRequestsCount')}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h6" 
                              color="success.main"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatNumber(stat.completed, 'en')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.completed')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h6" 
                              color="error.main"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatNumber(stat.cancelled, 'en')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.cancelled')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <LinearProgress
                        variant="determinate"
                        value={(stat.completed / stat.total) * 100}
                        color="success"
                        sx={{ mt: 2, height: 6, borderRadius: 3 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={3}
          >
            <Typography variant="h6">{t('stats.topEngineers')}</Typography>
            <Chip
              icon={<TrendingUp />}
              label={`${formatNumber(Array.isArray(engineersStats) ? engineersStats.length : 0, 'en')} ${t('stats.engineer')}`}
              color="success"
              variant="outlined"
            />
          </Box>

          {engineersLoading ? (
            <AnalyticsSkeleton />
          ) : engineersError ? (
            <Alert severity="error">{t('stats.failedToLoadEngineers')}: {engineersError.message}</Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(engineersStats) ? engineersStats : [])?.map((engineer, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={engineer.engineerId}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      position: 'relative',
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
                    }}
                  >
                    {index < 3 && (
                      <Chip
                        label={`#${formatNumber(index + 1, 'en')}`}
                        color="warning"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                      />
                    )}
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                          {engineer.engineerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {engineer.engineerName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {engineer.engineerPhone}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2} mt={1}>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h4" 
                              color="primary"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatNumber(engineer.totalRequests, 'en')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.requestsCount')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h4" 
                              color="success.main"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatNumber(engineer.completionRate, 'en', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.completionRate')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h4" 
                              color="warning.main"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatNumber(engineer.averageRating, 'en', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.rating')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h4" 
                              color="info.main"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatCurrency(engineer.totalRevenue, 'USD', 'en')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.revenue')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <LinearProgress
                        variant="determinate"
                        value={engineer.completionRate}
                        color="success"
                        sx={{ mt: 2, height: 6, borderRadius: 3 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={3}
          >
            <Typography variant="h6">{t('stats.serviceTypesStats')}</Typography>
            <Chip
              icon={<PieChart />}
              label={`${formatNumber(Array.isArray(serviceTypesStats) ? serviceTypesStats.length : 0, 'en')} ${t('stats.type')}`}
              color="info"
              variant="outlined"
            />
          </Box>

          {serviceTypesLoading ? (
            <AnalyticsSkeleton />
          ) : serviceTypesError ? (
            <Alert severity="error">
              {t('stats.failedToLoadServiceTypes')}: {serviceTypesError.message}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(serviceTypesStats) ? serviceTypesStats : [])?.map(
                (serviceType, index) => (
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    key={serviceType._id || index}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
                      }}
                    >
                      <CardContent>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={2}
                        >
                          <Typography variant="h6" color="info.main">
                            {serviceType._id || t('stats.notSpecified')}
                          </Typography>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <Assessment />
                          </Avatar>
                        </Box>

                        <Typography 
                          variant="h4" 
                          color="primary" 
                          sx={{ 
                            mb: 1,
                            fontFeatureSettings: '"tnum"',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatNumber(serviceType.total, 'en')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {t('stats.totalRequestsCount')}
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <Box textAlign="center">
                              <Typography 
                                variant="h6" 
                                color="success.main"
                                sx={{
                                  fontFeatureSettings: '"tnum"',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {formatNumber(serviceType.completed, 'en')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {t('stats.completed')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Box textAlign="center">
                              <Typography 
                                variant="h6" 
                                color="info.main"
                                sx={{
                                  fontFeatureSettings: '"tnum"',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {formatCurrency(serviceType.averageRevenue || 0, 'USD', 'en')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {t('stats.averagePrice')}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <LinearProgress
                          variant="determinate"
                          value={(serviceType.completed / serviceType.total) * 100}
                          color="info"
                          sx={{ mt: 2, height: 6, borderRadius: 3 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={3}
          >
            <Typography variant="h6">{t('stats.revenueTrends')}</Typography>
            <Chip
              icon={<ShowChart />}
              label={`${formatNumber(Array.isArray(revenueStats) ? revenueStats.length : 0, 'en')} ${t('stats.period')}`}
              color="success"
              variant="outlined"
            />
          </Box>

          {revenueLoading ? (
            <AnalyticsSkeleton />
          ) : revenueError ? (
            <Alert severity="error">{t('stats.failedToLoadRevenue')}: {revenueError.message}</Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(revenueStats) ? revenueStats : [])?.map((revenue, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" color="success.main">
                          {revenue._id}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <ShowChart />
                        </Avatar>
                      </Box>

                      <Typography 
                        variant="h4" 
                        color="success.main" 
                        sx={{ 
                          mb: 1,
                          fontFeatureSettings: '"tnum"',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatCurrency(revenue.totalRevenue, 'USD', 'en')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('stats.totalRevenue')}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h6" 
                              color="primary"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatNumber(revenue.requestsCount, 'en')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.requestsCount')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="h6" 
                              color="info.main"
                              sx={{
                                fontFeatureSettings: '"tnum"',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatCurrency(revenue.averageRevenue || 0, 'USD', 'en')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t('stats.averagePrice')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min((revenue.totalRevenue / 100000) * 100, 100)}
                        color="success"
                        sx={{ mt: 2, height: 6, borderRadius: 3 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};
