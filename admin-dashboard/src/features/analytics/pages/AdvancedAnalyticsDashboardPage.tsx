import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  LinearProgress,
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

// Import ready-made components
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

// Import hooks
import { 
  useSalesAnalytics, 
  useCustomerAnalytics, 
  useInventoryReport, 
  useFinancialReport, 
  useMarketingReport, 
  useRealTimeMetrics,
} from '../hooks/useAnalytics';

// Import types
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
      {value === index && <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export const AdvancedAnalyticsDashboardPage: React.FC = () => {
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(PeriodType.MONTHLY);

  // Use analytics hooks
  const { data: realtimeMetrics, isLoading: realtimeLoading, error: realtimeError } = useRealTimeMetrics();
  const { data: salesAnalytics, isLoading: salesLoading, error: salesError } = useSalesAnalytics({ period: selectedPeriod });
  const { data: customerAnalytics, isLoading: customerLoading, error: customerError } = useCustomerAnalytics({ period: selectedPeriod });
  const { data: inventoryReport, isLoading: inventoryLoading, error: inventoryError } = useInventoryReport({ period: selectedPeriod });
  const { data: financialReport, isLoading: financialLoading, error: financialError } = useFinancialReport({ period: selectedPeriod });
  const { data: marketingReport, isLoading: marketingLoading, error: marketingError } = useMarketingReport({ period: selectedPeriod });

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

  const isLoading = realtimeLoading || salesLoading || customerLoading ||
                   inventoryLoading || financialLoading || marketingLoading;

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: { xs: 1, sm: 2 }, px: { xs: 1, sm: 0 } }}>
        <LinearProgress />
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 1, 
            textAlign: 'center',
            fontSize: isMobile ? '0.8125rem' : undefined,
          }}
        >
          {t('advancedDashboard.loadingAnalytics')}
        </Typography>
        <AnalyticsSkeleton />
      </Box>
    );
  }

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
              size={isMobile ? 'medium' : 'medium'}
              fullWidth={isMobile}
              sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
            >
              {t('advancedDashboard.refresh')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp sx={{ fontSize: isMobile ? 18 : undefined }} />}
              onClick={() => handleExportData('dashboard', 'pdf')}
              size={isMobile ? 'medium' : 'medium'}
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
              '& .MuiAlert-message': {
                width: '100%',
              },
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
                <Typography 
                  variant="body2"
                  sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                >
                  {t('advancedDashboard.realTimeStatus.activeUsers')}: {realtimeMetrics.activeUsers || 0}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                >
                  {t('advancedDashboard.realTimeStatus.todaySales')}: {(realtimeMetrics.todaySales || 0).toLocaleString()} $
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                >
                  {t('advancedDashboard.realTimeStatus.systemStatus')}: {realtimeMetrics.systemHealth?.status === 'healthy' 
                    ? t('realTimeMetrics.systemHealthy') 
                    : t('realTimeMetrics.systemUnderMaintenance')}
                </Typography>
              </Stack>
              <Typography 
                variant="caption"
                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
              >
                {t('realTimeMetrics.lastUpdate')}: {new Date(realtimeMetrics.lastUpdated || new Date()).toLocaleTimeString('ar-SA')}
              </Typography>
            </Stack>
          </Alert>
        )}

        {/* Period Selection and Quick Filters */}
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
            <Tab
              icon={<TrendingUp sx={{ fontSize: isMobile ? 18 : 20 }} />}
              iconPosition="start"
              label={t('advancedDashboard.tabs.overview')}
              id="analytics-tab-0"
              aria-controls="analytics-tabpanel-0"
            />
            <Tab
              icon={<ShoppingCart sx={{ fontSize: isMobile ? 18 : 20 }} />}
              iconPosition="start"
              label={t('advancedDashboard.tabs.sales')}
              id="analytics-tab-1"
              aria-controls="analytics-tabpanel-1"
            />
            <Tab
              icon={<Inventory sx={{ fontSize: isMobile ? 18 : 20 }} />}
              iconPosition="start"
              label={t('advancedDashboard.tabs.products')}
              id="analytics-tab-2"
              aria-controls="analytics-tabpanel-2"
            />
            <Tab
              icon={<People sx={{ fontSize: isMobile ? 18 : 20 }} />}
              iconPosition="start"
              label={t('advancedDashboard.tabs.customers')}
              id="analytics-tab-3"
              aria-controls="analytics-tabpanel-3"
            />
            <Tab
              icon={<AttachMoney sx={{ fontSize: isMobile ? 18 : 20 }} />}
              iconPosition="start"
              label={t('advancedDashboard.tabs.financial')}
              id="analytics-tab-4"
              aria-controls="analytics-tabpanel-4"
            />
            <Tab
              icon={<Assessment sx={{ fontSize: isMobile ? 18 : 20 }} />}
              iconPosition="start"
              label={t('advancedDashboard.tabs.marketing')}
              id="analytics-tab-5"
              aria-controls="analytics-tabpanel-5"
            />
            <Tab
              icon={<Support sx={{ fontSize: isMobile ? 18 : 20 }} />}
              iconPosition="start"
              label={t('advancedDashboard.tabs.inventory')}
              id="analytics-tab-6"
              aria-controls="analytics-tabpanel-6"
            />
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
            <SalesAnalyticsCard
              data={salesAnalytics}
              isLoading={salesLoading}
              error={salesError}
            />
          </TabPanel>

          {/* Products Tab */}
          <TabPanel value={activeTab} index={2}>
            <ProductPerformanceCard
              initialPeriod={selectedPeriod}
            />
          </TabPanel>

          {/* Customers Tab */}
          <TabPanel value={activeTab} index={3}>
            <CustomerAnalyticsCard
              data={customerAnalytics}
              isLoading={customerLoading}
              error={customerError}
            />
          </TabPanel>

          {/* Financial Tab */}
          <TabPanel value={activeTab} index={4}>
            <FinancialReportCard
              data={financialReport}
              isLoading={financialLoading}
              error={financialError}
            />
          </TabPanel>

          {/* Marketing Tab */}
          <TabPanel value={activeTab} index={5}>
            <MarketingReportCard
              data={marketingReport}
              isLoading={marketingLoading}
              error={marketingError}
            />
          </TabPanel>

          {/* Inventory Tab */}
          <TabPanel value={activeTab} index={6}>
            <InventoryReportCard
              data={inventoryReport}
              isLoading={inventoryLoading}
              error={inventoryError}
            />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};
