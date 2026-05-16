import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  Stack,
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
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

import {
  SalesAnalyticsCard,
  ProductPerformanceCard,
  CustomerAnalyticsCard,
  InventoryReportCard,
  FinancialReportCard,
  MarketingReportCard,
  RealTimeMetricsCard,
  AnalyticsSkeleton,
} from '../components';

import { useRealTimeMetrics } from '../hooks/useAnalytics';
import { withAnalyticsErrorBoundary } from '../components/AnalyticsErrorBoundary';
import { PeriodType } from '../types/analytics.types';

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
      {value === index && (
        <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Track which tabs have been loaded at least once
const TABS = [
  { label: 'advancedDashboard.tabs.overview', icon: <TrendingUp /> },
  { label: 'advancedDashboard.tabs.sales', icon: <ShoppingCart /> },
  { label: 'advancedDashboard.tabs.products', icon: <Inventory /> },
  { label: 'advancedDashboard.tabs.customers', icon: <People /> },
  { label: 'advancedDashboard.tabs.financial', icon: <AttachMoney /> },
  { label: 'advancedDashboard.tabs.marketing', icon: <Assessment /> },
  { label: 'advancedDashboard.tabs.inventory', icon: <Support /> },
];

export const AdvancedAnalyticsDashboardPage = withAnalyticsErrorBoundary(function AdvancedAnalyticsDashboardPage() {
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(PeriodType.MONTHLY);
  const [loadedTabs, setLoadedTabs] = useState<Set<number>>(new Set([0]));

  const { data: realtimeMetrics, isLoading: realtimeLoading, error: realtimeError } = useRealTimeMetrics();

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
      setLoadedTabs((prev) => new Set(prev).add(newValue));
    },
    []
  );

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    // When period changes, reset loaded tabs so they refetch
    setLoadedTabs(new Set([0]));
    setActiveTab(0);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 0, sm: 2 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 0 } }}>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={isMobile ? 1.5 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            mb: { xs: 1.5, sm: 2 },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: isMobile ? '1.5rem' : undefined }}
            >
              {t('advancedDashboard.title')}
            </Typography>
            <Typography
              variant={isMobile ? 'body2' : 'body1'}
              color="text.secondary"
              sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
            >
              {t('advancedDashboard.subtitle')}
            </Typography>
          </Box>

          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={1}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh sx={{ fontSize: isMobile ? 18 : undefined }} />}
              onClick={handleRefresh}
              size="small"
              fullWidth={isMobile}
              sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
            >
              {t('advancedDashboard.refresh')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp sx={{ fontSize: isMobile ? 18 : undefined }} />}
              onClick={() => {/* noop */}}
              size="small"
              fullWidth={isMobile}
              sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
            >
              {t('advancedDashboard.exportReport')}
            </Button>
          </Stack>
        </Stack>

        {/* Real-time Status Bar */}
        {realtimeMetrics && (
          <Alert
            severity="info"
            sx={{
              mb: { xs: 1.5, sm: 2 },
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={isMobile ? 1 : 2}
              sx={{
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                width: '100%',
                flexWrap: 'wrap',
              }}
            >
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={isMobile ? 0.5 : 2}
                sx={{ flexWrap: 'wrap', gap: isMobile ? 0.5 : 2 }}
              >
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : undefined }}>
                  {t('advancedDashboard.realTimeStatus.activeUsers')}: {realtimeMetrics.activeUsers || 0}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : undefined }}>
                  {t('advancedDashboard.realTimeStatus.todaySales')}: {realtimeMetrics.todaySales || 0} YER
                </Typography>
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : undefined }}>
                  {t('advancedDashboard.realTimeStatus.systemStatus')}: {realtimeMetrics.systemHealth?.status === 'healthy'
                    ? t('realTimeMetrics.systemHealthy')
                    : t('realTimeMetrics.systemUnderMaintenance')}
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
              >
                {t('realTimeMetrics.lastUpdate')}: {new Date(realtimeMetrics.lastUpdated || new Date()).toLocaleTimeString('ar-YE')}
              </Typography>
            </Stack>
          </Alert>
        )}

        {/* Period Selection */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            mb: { xs: 1.5, sm: 2 },
            flexWrap: 'wrap',
          }}
        >
          {Object.values(PeriodType).map((period) => (
            <Chip
              key={period}
              label={t(`dashboard.periodTypes.${period}`)}
              onClick={() => handlePeriodChange(period)}
              color={selectedPeriod === period ? 'primary' : 'default'}
              variant={selectedPeriod === period ? 'filled' : 'outlined'}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                fontSize: isMobile ? '0.75rem' : undefined,
                height: isMobile ? 28 : undefined,
              }}
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
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: isMobile ? 64 : undefined,
                fontSize: isMobile ? '0.75rem' : undefined,
                px: isMobile ? 1 : 2,
              },
            }}
          >
            {TABS.map((tab, idx) => (
              <Tab
                key={idx}
                icon={React.cloneElement(tab.icon as any, {
                  sx: { fontSize: isMobile ? 18 : 20 },
                })}
                iconPosition="start"
                label={t(tab.label)}
                id={`analytics-tab-${idx}`}
                aria-controls={`analytics-tabpanel-${idx}`}
              />
            ))}
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <RealTimeMetricsCard
              data={realtimeMetrics}
              isLoading={realtimeLoading}
              error={realtimeError}
            />
          </TabPanel>

          {/* Sales Tab */}
          <TabPanel value={activeTab} index={1}>
            {loadedTabs.has(1) ? (
              <SalesAnalyticsCard period={selectedPeriod} />
            ) : (
              <AnalyticsSkeleton variant="card" count={2} />
            )}
          </TabPanel>

          {/* Products Tab */}
          <TabPanel value={activeTab} index={2}>
            {loadedTabs.has(2) ? (
              <ProductPerformanceCard initialPeriod={selectedPeriod} />
            ) : (
              <AnalyticsSkeleton variant="card" count={2} />
            )}
          </TabPanel>

          {/* Customers Tab */}
          <TabPanel value={activeTab} index={3}>
            {loadedTabs.has(3) ? (
              <CustomerAnalyticsCard period={selectedPeriod} />
            ) : (
              <AnalyticsSkeleton variant="card" count={2} />
            )}
          </TabPanel>

          {/* Financial Tab */}
          <TabPanel value={activeTab} index={4}>
            {loadedTabs.has(4) ? (
              <FinancialReportCard period={selectedPeriod} />
            ) : (
              <AnalyticsSkeleton variant="card" count={2} />
            )}
          </TabPanel>

          {/* Marketing Tab */}
          <TabPanel value={activeTab} index={5}>
            {loadedTabs.has(5) ? (
              <MarketingReportCard period={selectedPeriod} />
            ) : (
              <AnalyticsSkeleton variant="card" count={2} />
            )}
          </TabPanel>

          {/* Inventory Tab */}
          <TabPanel value={activeTab} index={6}>
            {loadedTabs.has(6) ? (
              <InventoryReportCard period={selectedPeriod} />
            ) : (
              <AnalyticsSkeleton variant="card" count={2} />
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
});
