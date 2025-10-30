import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  Warning,
  Star,
  EmojiEvents,
  Timeline,
  Assessment,
  Refresh,
} from '@mui/icons-material';
import { apiClient } from '@/core/api/client';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface OverallAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  topSpenders: Array<{ userId: string; totalSpent: number }>;
  userGrowth: Array<{ month: string; newUsers: number }>;
}

interface CustomerRanking {
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
  rank: number;
  tier: string;
}

interface CustomerSegments {
  segments: {
    vip: number;
    premium: number;
    regular: number;
    new: number;
  };
  totalCustomers: number;
  generatedAt: string;
  recommendations: string[];
}

interface ChurnRiskAlert {
  userId: string;
  name: string;
  email: string;
  churnRisk: 'high' | 'medium' | 'low';
  lastOrderDays: number;
  recommendedAction: string;
  totalSpent: number;
}

export const UserAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['users', 'common']);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // State for different data
  const [overallAnalytics, setOverallAnalytics] = useState<OverallAnalytics | null>(null);
  const [customerRankings, setCustomerRankings] = useState<CustomerRanking[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegments | null>(null);
  const [churnRiskAlerts, setChurnRiskAlerts] = useState<ChurnRiskAlert[]>([]);

  // Fetch overall analytics
  const fetchOverallAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/overview');
      setOverallAnalytics(response.data.data);
    } catch  {
      toast.error(t('users:analytics.errors.loadOverview', 'فشل تحميل الإحصائيات العامة'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch customer rankings
  const fetchCustomerRankings = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/rankings', {
        params: { limit: 50 },
      });
      setCustomerRankings(response.data.data || []);
    } catch  {
      toast.error(t('users:analytics.errors.loadRankings', 'فشل تحميل ترتيب العملاء'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch customer segments
  const fetchCustomerSegments = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/reports/customer-segments');
      setCustomerSegments(response.data.data || response.data);
    } catch  {
      toast.error(t('users:analytics.errors.loadSegments', 'فشل تحميل شرائح العملاء'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch churn risk alerts
  const fetchChurnRiskAlerts = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/alerts/churn-risk');
      const data = response.data.data || response.data;
      setChurnRiskAlerts(data.customers || []);
    } catch  {
      toast.error(t('users:analytics.errors.loadAlerts', 'فشل تحميل تنبيهات المخاطر'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

  const getTierColor = (tier: string) => {
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            {t('users:analytics.title', 'تحليلات المستخدمين')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('users:analytics.subtitle', 'تحليلات شاملة عن سلوك وأداء المستخدمين في المنصة')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {t('common:actions.refresh', 'تحديث')}
        </Button>
      </Box>

      {/* KPI Cards */}
      {overallAnalytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {overallAnalytics.totalUsers.toLocaleString('en-US')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('users:analytics.kpi.totalUsers', 'إجمالي المستخدمين')}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={t('users:analytics.kpi.activeUsers', '{{count}} نشط', { count: overallAnalytics.activeUsers })}
                  size="small"
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {overallAnalytics.customerLifetimeValue.toFixed(2)} $
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('users:analytics.kpi.customerLifetimeValue', 'القيمة الدائمة للعميل')}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={t('users:analytics.kpi.averageOrderValue', 'معدل الطلب: {{value}} $', { value: overallAnalytics.averageOrderValue.toFixed(2) })}
                  size="small"
                  color="info"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, color: theme.palette.warning.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {overallAnalytics.newUsersThisMonth.toLocaleString('en-US')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('users:analytics.kpi.newUsersThisMonth', 'مستخدمون جدد هذا الشهر')}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={t('users:analytics.kpi.topSpenders', 'أفضل العملاء: {{count}}', { count: overallAnalytics.topSpenders.length })}
                  size="small"
                  color="warning"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<EmojiEvents />} label={t('users:analytics.tabs.rankings', 'ترتيب العملاء')} iconPosition="start" />
          <Tab icon={<Assessment />} label={t('users:analytics.tabs.topCustomers', 'أفضل العملاء')} iconPosition="start" />
          <Tab icon={<Timeline />} label={t('users:analytics.tabs.segments', 'شرائح العملاء')} iconPosition="start" />
          <Tab icon={<Warning />} label={t('users:analytics.tabs.alerts', 'تنبيهات المخاطر')} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : customerRankings.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('users:analytics.table.rank', 'الترتيب')}</TableCell>
                  <TableCell>{t('users:analytics.table.customer', 'العميل')}</TableCell>
                  <TableCell>{t('users:analytics.table.email', 'البريد الإلكتروني')}</TableCell>
                  <TableCell align="center">{t('users:analytics.table.tier', 'الفئة')}</TableCell>
                  <TableCell align="right">{t('users:analytics.table.totalSpent', 'إجمالي الإنفاق')}</TableCell>
                  <TableCell align="center">{t('users:analytics.table.orderCount', 'عدد الطلبات')}</TableCell>
                  <TableCell align="right">{t('users:analytics.table.averageOrder', 'متوسط الطلب')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerRankings.map((customer, index) => (
                  <TableRow key={customer.userId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index < 3 && <Star sx={{ color: 'gold', mr: 1 }} />}
                        #{index + 1}
                      </Box>
                    </TableCell>
                    <TableCell>{customer.name || t('users:analytics.unknown', 'غير معروف')}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={customer.tier ? t(`users:analytics.tiers.${customer.tier.toLowerCase()}`, customer.tier) : t('users:analytics.tiers.regular', 'عادي')}
                        size="small"
                        color={getTierColor(customer.tier)}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {customer.totalSpent.toLocaleString('en-US')} $
                    </TableCell>
                    <TableCell align="center">{customer.orderCount}</TableCell>
                    <TableCell align="right">
                      {customer.averageOrderValue.toFixed(2)} $
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          <Grid container spacing={3}>
            {customerRankings.slice(0, 10).map((customer, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={customer.userId}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index < 3 && <Star sx={{ color: 'gold', mr: 1 }} />}
                        <Typography variant="h6">{customer.name || 'غير معروف'}</Typography>
                      </Box>
                      <Chip
                        label={customer.tier ? t(`users:analytics.tiers.${customer.tier.toLowerCase()}`, customer.tier) : t('users:analytics.tiers.regular', 'عادي')}
                        size="small"
                        color={getTierColor(customer.tier)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {customer.email}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('users:analytics.table.totalSpent', 'إجمالي الإنفاق')}
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {customer.totalSpent.toLocaleString('en-US')} $
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('users:analytics.table.orderCount', 'عدد الطلبات')}
                        </Typography>
                        <Typography variant="h6">{customer.orderCount}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#fef2f2' }}>
                  <CardContent>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      {customerSegments.segments.vip}
                    </Typography>
                    <Typography variant="body2">{t('users:analytics.segments.vip', 'عملاء VIP')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('users:analytics.segments.range.vip', 'أكثر من 5,000 $')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#fffbeb' }}>
                  <CardContent>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {customerSegments.segments.premium}
                    </Typography>
                    <Typography variant="body2">{t('users:analytics.segments.premium', 'عملاء مميزون')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('users:analytics.segments.range.premium', '2,000 - 5,000 $')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#eff6ff' }}>
                  <CardContent>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {customerSegments.segments.regular}
                    </Typography>
                    <Typography variant="body2">{t('users:analytics.segments.regular', 'عملاء عاديون')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('users:analytics.segments.range.regular', '500 - 2,000 $')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#f0fdf4' }}>
                  <CardContent>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {customerSegments.segments.new}
                    </Typography>
                    <Typography variant="body2">{t('users:analytics.segments.new', 'عملاء جدد')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('users:analytics.segments.range.new', 'أقل من 500 $')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {customerSegments.recommendations.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('users:analytics.recommendations.title', 'توصيات')}
                  </Typography>
                  {customerSegments.recommendations.map((rec, index) => (
                    <Alert key={index} severity="info" sx={{ mb: 1 }}>
                      {rec}
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
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
          <Grid container spacing={3}>
            {churnRiskAlerts.map((alert) => (
              <Grid component="div" size={{ xs: 12, md: 6 }} key={alert.userId}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Warning sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography variant="h6">{alert.name || t('users:analytics.unknown', 'غير معروف')}</Typography>
                      </Box>
                      <Chip
                        label={t(`users:analytics.churnRisk.${alert.churnRisk}`, alert.churnRisk)}
                        size="small"
                        color={getRiskColor(alert.churnRisk)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {alert.email}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('users:analytics.churnRisk.lastOrder', 'آخر طلب منذ: {{days}} يوم', { days: alert.lastOrderDays })}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('users:analytics.churnRisk.recommendedAction', 'الإجراء الموصى به:')}
                      </Typography>
                      <Typography variant="body2">{alert.recommendedAction}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('users:analytics.churnRisk.totalSpent', 'إجمالي الإنفاق:')}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {alert.totalSpent.toLocaleString('en-US')} $
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="success">{t('users:analytics.noAlerts', 'لا توجد تنبيهات حالياً')}</Alert>
        )}
      </TabPanel>
    </Container>
  );
};

export default UserAnalyticsPage;

