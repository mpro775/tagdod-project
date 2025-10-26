import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Support as SupportIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useDashboard, useRefreshAnalytics } from '../hooks/useAnalytics';
import { PeriodType } from '../types/analytics.types';
import { KPICard } from './KPICard';
import { RevenueChart } from './RevenueChart';
import { UserAnalyticsChart } from './UserAnalyticsChart';
import { ProductPerformanceChart } from './ProductPerformanceChart';
import { ServiceAnalyticsChart } from './ServiceAnalyticsChart';
import { SupportAnalyticsChart } from './SupportAnalyticsChart';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { AdvancedFilters } from './AdvancedFilters';
import { AnalyticsDataTable } from './AnalyticsDataTable';

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

interface AnalyticsDashboardProps {
  initialPeriod?: PeriodType;
  showAdvancedFilters?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  initialPeriod = PeriodType.MONTHLY,
  showAdvancedFilters = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTab, setSelectedTab] = useState(0);
  const [period] = useState<PeriodType>(initialPeriod);
  const [filters] = useState({
    startDate: '',
    endDate: '',
    compareWithPrevious: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useDashboard({
    period,
    ...filters,
  });

  const refreshAnalytics = useRefreshAnalytics();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleRefresh = async () => {
    await refreshAnalytics.mutateAsync();
    refetch();
  };


  const tabs = [
    { label: 'نظرة عامة', icon: <DashboardIcon />, value: 0 },
    { label: 'الإيرادات', icon: <TrendingUpIcon />, value: 1 },
    { label: 'المستخدمين', icon: <PeopleIcon />, value: 2 },
    { label: 'المنتجات', icon: <ShoppingCartIcon />, value: 3 },
    { label: 'الخدمات', icon: <SupportIcon />, value: 4 },
    { label: 'الدعم', icon: <AssessmentIcon />, value: 5 },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        حدث خطأ في تحميل البيانات التحليلية. يرجى المحاولة مرة أخرى.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              لوحة التحليلات
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              تحليلات شاملة لأداء النظام والمؤشرات الرئيسية
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<DateRangeIcon />}
              label={`الفترة: ${
                period === PeriodType.DAILY
                  ? 'يومي'
                  : period === PeriodType.WEEKLY
                  ? 'أسبوعي'
                  : period === PeriodType.MONTHLY
                  ? 'شهري'
                  : period === PeriodType.QUARTERLY
                  ? 'ربعي'
                  : 'سنوي'
              }`}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />

            <Tooltip title="تحديث البيانات">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshAnalytics.isPending}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {showAdvancedFilters && (
              <Tooltip title="فلاتر متقدمة">
                <IconButton onClick={() => setShowFilters(!showFilters)} sx={{ color: 'white' }}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Advanced Filters */}
      {showAdvancedFilters && showFilters && (
        <Fade in={showFilters}>
          <Paper elevation={2} sx={{ mb: 3 }}>
            <AdvancedFilters
              filters={[]}
              values={{}}
              onChange={() => {}}
            />
          </Paper>
        </Fade>
      )}

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minWidth: isMobile ? 120 : 160 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {/* Overview Tab */}
        <Grid container spacing={3}>
          {/* KPIs */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              المؤشرات الرئيسية
            </Typography>
            {isLoading ? (
              <Grid container spacing={2}>
                {[...Array(6)].map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
                    <Skeleton variant="rectangular" height={120} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {dashboardData?.kpis &&
                  Object.entries(dashboardData.kpis).map(([key, value]) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={key}>
                      <KPICard title={key} value={value} />
                    </Grid>
                  ))}
              </Grid>
            )}
          </Grid>

          {/* Charts Grid */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  اتجاهات الإيرادات
                </Typography>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : (
                  <RevenueChart data={dashboardData?.revenueCharts} />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  أداء النظام
                </Typography>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : (
                  <PerformanceMetricsCard />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {/* Revenue Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <RevenueChart data={dashboardData?.revenueCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {/* Users Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <UserAnalyticsChart data={dashboardData?.userCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {/* Products Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ProductPerformanceChart data={dashboardData?.productCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={4}>
        {/* Services Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ServiceAnalyticsChart data={dashboardData?.serviceCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={5}>
        {/* Support Tab */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <SupportAnalyticsChart data={dashboardData?.supportCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Data Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          البيانات التفصيلية
        </Typography>
        <AnalyticsDataTable data={[]} columns={[]} />
      </Box>
    </Box>
  );
};
