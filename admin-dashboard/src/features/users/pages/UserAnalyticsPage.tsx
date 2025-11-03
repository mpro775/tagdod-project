import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Paper,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Warning, EmojiEvents, Timeline, Assessment, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AnalyticsKPICards } from '../components/AnalyticsKPICards';
import { CustomerRankingsTable } from '../components/CustomerRankingsTable';
import { TopCustomersCards } from '../components/TopCustomersCards';
import { CustomerSegmentsSection } from '../components/CustomerSegmentsSection';
import { ChurnRiskAlerts } from '../components/ChurnRiskAlerts';
import { useUserAnalytics } from '../hooks/useUserAnalytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: { xs: 1.5, sm: 3 }, px: { xs: 0, sm: 0 } }}>{children}</Box>}
    </div>
  );
}

export const UserAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['users', 'common']);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = React.useState(0);

  const {
    loading,
    overallAnalytics,
    customerRankings,
    customerSegments,
    churnRiskAlerts,
    fetchOverallAnalytics,
    fetchCustomerRankings,
    fetchCustomerSegments,
    fetchChurnRiskAlerts,
  } = useUserAnalytics();

  useEffect(() => {
    fetchOverallAnalytics();
    fetchCustomerRankings();
  }, [fetchOverallAnalytics, fetchCustomerRankings]);

  useEffect(() => {
    if (selectedTab === 2) {
      fetchCustomerSegments();
    } else if (selectedTab === 3) {
      fetchChurnRiskAlerts();
    }
  }, [selectedTab, fetchCustomerSegments, fetchChurnRiskAlerts]);

  const handleRefresh = () => {
    fetchOverallAnalytics();
    fetchCustomerRankings();
    if (selectedTab === 2) fetchCustomerSegments();
    if (selectedTab === 3) fetchChurnRiskAlerts();
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 1.5, sm: 3 },
        px: { xs: 1, sm: 3 },
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: '1.25rem', sm: '2rem' },
              color: 'text.primary',
              mb: { xs: 0.5, sm: 1 },
            }}
          >
            {t('users:analytics.title', 'تحليلات المستخدمين')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '1rem' } }}
          >
            {t(
              'users:analytics.subtitle',
              'تحليلات شاملة عن سلوك وأداء المستخدمين في المنصة'
            )}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            minWidth: { xs: '100%', sm: 120 },
          }}
        >
          {t('common:actions.refresh', 'تحديث')}
        </Button>
      </Box>

      {/* KPI Cards */}
      <AnalyticsKPICards analytics={overallAnalytics} />

      {/* Tabs */}
      <Paper
        sx={{
          mb: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile={isMobile}
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              minHeight: { xs: 48, sm: 64 },
              px: { xs: 1, sm: 3 },
            },
          }}
        >
          <Tab
            icon={<EmojiEvents />}
            label={t('users:analytics.tabs.rankings', 'ترتيب العملاء')}
            iconPosition="start"
          />
          <Tab
            icon={<Assessment />}
            label={t('users:analytics.tabs.topCustomers', 'أفضل العملاء')}
            iconPosition="start"
          />
          <Tab
            icon={<Timeline />}
            label={t('users:analytics.tabs.segments', 'شرائح العملاء')}
            iconPosition="start"
          />
          <Tab
            icon={<Warning />}
            label={t('users:analytics.tabs.alerts', 'تنبيهات المخاطر')}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : customerRankings.length > 0 ? (
          <CustomerRankingsTable rankings={customerRankings} />
        ) : (
          <Alert severity="info">{t('users:analytics.noData', 'لا توجد بيانات متاحة')}</Alert>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : customerRankings.length > 0 ? (
          <TopCustomersCards customers={customerRankings} limit={10} />
        ) : (
          <Alert severity="info">{t('users:analytics.noData', 'لا توجد بيانات متاحة')}</Alert>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : customerSegments ? (
          <CustomerSegmentsSection segments={customerSegments} />
        ) : (
          <Alert severity="info">{t('users:analytics.noData', 'لا توجد بيانات متاحة')}</Alert>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : churnRiskAlerts.length > 0 ? (
          <ChurnRiskAlerts alerts={churnRiskAlerts} />
        ) : (
          <Alert severity="success">
            {t('users:analytics.noAlerts', 'لا توجد تنبيهات حالياً')}
          </Alert>
        )}
      </TabPanel>
    </Container>
  );
};

export default UserAnalyticsPage;
