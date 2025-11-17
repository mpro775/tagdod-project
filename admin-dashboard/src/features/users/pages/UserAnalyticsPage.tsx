import React, { useEffect, useMemo } from 'react';
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
  Chip,
} from '@mui/material';
import { Warning, EmojiEvents, Timeline, Assessment, Refresh, Star } from '@mui/icons-material';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { AnalyticsKPICards } from '../components/AnalyticsKPICards';
import { TopCustomersCards } from '../components/TopCustomersCards';
import { CustomerSegmentsSection } from '../components/CustomerSegmentsSection';
import { ChurnRiskAlerts } from '../components/ChurnRiskAlerts';
import { useUserAnalytics, CustomerRanking } from '../hooks/useUserAnalytics';

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
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

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

  const getTierColor = (tier: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (tier?.toLowerCase()) {
      case 'vip':
        return 'error';
      case 'premium':
        return 'warning';
      case 'regular':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'rank',
        headerName: t('users:analytics.table.rank', 'الترتيب'),
        width: 100,
        align: 'center',
        renderCell: (params) => {
          const row = params.row as CustomerRanking & { userInfo?: { phone?: string; firstName?: string; lastName?: string } };
          const rank = row.rank || (paginationModel.page * paginationModel.pageSize) + params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {rank <= 3 && <Star sx={{ color: 'gold', fontSize: { xs: 16, sm: 20 } }} />}
              <span>#{rank}</span>
            </Box>
          );
        },
      },
      {
        field: 'name',
        headerName: t('users:analytics.table.customer', 'العميل'),
        width: 200,
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => {
          const customerRow = row as CustomerRanking & { userInfo?: { phone?: string; firstName?: string; lastName?: string } };
          return (
            customerRow.name ||
            (customerRow.userInfo?.firstName && customerRow.userInfo?.lastName
              ? `${customerRow.userInfo.firstName} ${customerRow.userInfo.lastName}`
              : customerRow.userInfo?.firstName || customerRow.userInfo?.phone || t('users:analytics.unknown', 'غير معروف'))
          );
        },
      },
      {
        field: 'email',
        headerName: t('users:analytics.table.email', 'البريد الإلكتروني'),
        width: 200,
        minWidth: 150,
        valueGetter: (_value, row) => {
          const customerRow = row as CustomerRanking & { userInfo?: { phone?: string } };
          return customerRow.email || customerRow.userInfo?.phone || '-';
        },
      },
      {
        field: 'tier',
        headerName: t('users:analytics.table.tier', 'الفئة'),
        width: 120,
        align: 'center',
        renderCell: (params) => {
          const tier = params.row.tier || (params.row.totalSpent >= 5000 ? 'vip' : params.row.totalSpent >= 2000 ? 'premium' : params.row.totalSpent >= 500 ? 'regular' : 'new');
          const tierLabel = String(t(`users:analytics.tiers.${tier.toLowerCase()}`, tier));
          return (
            <Chip
              label={tierLabel}
              size="small"
              color={getTierColor(tier)}
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
          );
        },
      },
      {
        field: 'totalSpent',
        headerName: t('users:analytics.table.totalSpent', 'إجمالي الإنفاق'),
        width: 150,
        align: 'right',
        type: 'number',
        valueFormatter: (value) => {
          if (!value || value === null || value === undefined) return '0.00 $';
          return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
        },
        renderCell: (params) => (
          <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
            {params.formattedValue}
          </Typography>
        ),
      },
      {
        field: 'orderCount',
        headerName: t('users:analytics.table.orderCount', 'عدد الطلبات'),
        width: 120,
        align: 'center',
        type: 'number',
        valueGetter: (_value, row) => {
          const customerRow = row as CustomerRanking & { totalOrders?: number };
          return customerRow.orderCount || customerRow.totalOrders || 0;
        },
      },
      {
        field: 'averageOrderValue',
        headerName: t('users:analytics.table.averageOrder', 'متوسط الطلب'),
        width: 150,
        align: 'right',
        type: 'number',
        valueGetter: (_value, row) => {
          const customerRow = row as CustomerRanking & { totalOrders?: number };
          const orderCount = customerRow.orderCount || customerRow.totalOrders || 0;
          return customerRow.averageOrderValue ?? (orderCount > 0 ? customerRow.totalSpent / orderCount : 0);
        },
        valueFormatter: (value) => {
          if (!value || value === null || value === undefined) return '0.00 $';
          return `${Number(value).toFixed(2)} $`;
        },
      },
    ],
    [t, paginationModel]
  );

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
        {customerRankings.length > 0 ? (
          <DataTable
            columns={columns}
            rows={customerRankings}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            getRowId={(row) => (row as CustomerRanking).userId}
            height={600}
            searchPlaceholder={t('users:analytics.search', 'بحث في العملاء...')}
            onSearch={() => {
              // يمكن إضافة منطق البحث هنا إذا لزم الأمر
            }}
          />
        ) : !loading ? (
          <Alert severity="info">{t('users:analytics.noData', 'لا توجد بيانات متاحة')}</Alert>
        ) : null}
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
