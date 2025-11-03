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
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing } from '../utils/responsive';
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
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: cardPadding }}>{children}</Box>}
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
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);

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
    { label: t('dashboard.tabs.overview'), icon: <DashboardIcon />, value: 0 },
    { label: t('dashboard.tabs.revenue'), icon: <TrendingUpIcon />, value: 1 },
    { label: t('dashboard.tabs.users'), icon: <PeopleIcon />, value: 2 },
    { label: t('dashboard.tabs.products'), icon: <ShoppingCartIcon />, value: 3 },
    { label: t('dashboard.tabs.services'), icon: <SupportIcon />, value: 4 },
    { label: t('dashboard.tabs.support'), icon: <AssessmentIcon />, value: 5 },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ m: breakpoint.isXs ? 1 : 2 }}>
        {t('dashboard.errors.loadError')}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', px: breakpoint.isXs ? 1 : 0 }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: cardPadding,
          mb: cardSpacing,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={cardSpacing}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
          }}
        >
          <Box>
            <Typography 
              variant={breakpoint.isXs ? 'h5' : 'h4'} 
              component="h1" 
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1.5rem' : undefined }}
            >
              {t('dashboard.title')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9,
                fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              }}
            >
              {t('dashboard.subtitle')}
            </Typography>
          </Box>

          <Stack 
              direction={breakpoint.isXs ? 'column' : 'row'} 
            spacing={1} 
            sx={{ 
              alignItems: breakpoint.isXs ? 'stretch' : 'center',
              width: breakpoint.isXs ? '100%' : 'auto',
            }}
          >
            <Chip
              icon={<DateRangeIcon />}
              label={`${t('dashboard.period')}: ${t(`dashboard.periodTypes.${period}`)}`}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                fontSize: breakpoint.isXs ? '0.75rem' : undefined,
              }}
            />

            <Stack direction="row" spacing={1}>
              <Tooltip title={t('dashboard.refresh')}>
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshAnalytics.isPending}
                  sx={{ color: 'white' }}
                  size={breakpoint.isXs ? 'medium' : 'small'}
                >
                  <RefreshIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                </IconButton>
              </Tooltip>

              {showAdvancedFilters && (
                <Tooltip title={t('dashboard.advancedFilters')}>
                  <IconButton 
                    onClick={() => setShowFilters(!showFilters)} 
                    sx={{ color: 'white' }}
                    size={breakpoint.isXs ? 'medium' : 'small'}
                  >
                    <FilterListIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Advanced Filters */}
      {showAdvancedFilters && showFilters && (
        <Fade in={showFilters}>
          <Paper elevation={2} sx={{ mb: breakpoint.isXs ? 2 : 3 }}>
            <AdvancedFilters
              filters={[]}
              values={{}}
              onChange={() => {}}
            />
          </Paper>
        </Fade>
      )}

      {/* Tabs */}
      <Paper 
        elevation={1} 
        sx={{ 
          mb: breakpoint.isXs ? 2 : 3,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={breakpoint.isXs ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
                minHeight: breakpoint.isXs ? 56 : 64,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              px: breakpoint.isXs ? 1.5 : 2,
              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : undefined,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={breakpoint.isXs && !breakpoint.isXs ? undefined : tab.label}
              icon={tab.icon}
              iconPosition={breakpoint.isXs && !breakpoint.isXs ? 'top' : 'start'}
              sx={{ 
                minWidth: breakpoint.isXs ? (breakpoint.isXs ? 80 : 64) : 160,
              }}
              aria-label={tab.label}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {/* Overview Tab */}
          <Grid container spacing={cardSpacing}>
          {/* KPIs */}
          <Grid size={{ xs: 12 }}>
            <Typography 
              variant={breakpoint.isXs ? 'h6' : 'h5'} 
              gutterBottom 
              sx={{ 
                mb: breakpoint.isXs ? 1.5 : 2,
                fontSize: breakpoint.isXs ? '1.25rem' : undefined,
              }}
            >
              {t('dashboard.sections.kpis')}
            </Typography>
            {isLoading ? (
              <Grid container spacing={cardSpacing}>
                {[...Array(6)].map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
                    <Skeleton variant="rectangular" height={breakpoint.isXs ? 100 : 120} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={cardSpacing}>
                {dashboardData?.kpis &&
                  Object.entries(dashboardData.kpis).map(([key, value]) => (
                    <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }} key={key}>
                      <KPICard title={key} value={value} />
                    </Grid>
                  ))}
              </Grid>
            )}
          </Grid>

          {/* Charts Grid */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent sx={{ p: cardPadding }}>
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                  gutterBottom
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {t('dashboard.sections.revenueTrends')}
                </Typography>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={breakpoint.isXs ? 250 : 300} />
                ) : (
                  <RevenueChart data={dashboardData?.revenueCharts} />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent sx={{ p: cardPadding }}>
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                  gutterBottom
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {t('dashboard.sections.systemPerformance')}
                </Typography>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={breakpoint.isXs ? 250 : 300} />
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
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <RevenueChart data={dashboardData?.revenueCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {/* Users Tab */}
          <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <UserAnalyticsChart data={dashboardData?.userCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {/* Products Tab */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <ProductPerformanceChart data={dashboardData?.productCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={4}>
        {/* Services Tab */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <ServiceAnalyticsChart data={dashboardData?.serviceCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={5}>
        {/* Support Tab */}
          <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <SupportAnalyticsChart data={dashboardData?.supportCharts} />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Data Table - Using existing data from charts */}
      <Box sx={{ mt: breakpoint.isXs ? 2 : 4 }}>
        <Typography 
          variant={breakpoint.isXs ? 'h6' : 'h5'} 
          gutterBottom
          sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
        >
          {t('dashboard.sections.detailedData')}
        </Typography>
        {isLoading ? (
          <Skeleton variant="rectangular" height={breakpoint.isXs ? 300 : 400} />
        ) : (
          <AnalyticsDataTable 
            data={dashboardData?.productCharts?.topSelling || []} 
            columns={[
              { id: 'product', label: t('dashboard.tableColumns.product'), minWidth: 200 },
              { id: 'sales', label: t('dashboard.tableColumns.sales'), minWidth: 120 },
              { id: 'revenue', label: t('dashboard.tableColumns.revenue'), minWidth: 120 },
            ]} 
          />
        )}
      </Box>
    </Box>
  );
};
