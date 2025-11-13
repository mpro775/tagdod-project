import React, { useState } from 'react';
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
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Skeleton,
  useTheme,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  Download,
  Refresh,
  FilterList,
  AttachMoney,
  ShoppingCart,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  Replay,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  useOrderAnalytics,
  useRevenueAnalytics,
  usePerformanceAnalytics,
  useExportOrderAnalytics,
} from '../hooks/useOrders';
import { formatCurrency, formatDate, formatNumber } from '@/shared/utils/formatters';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import type { OrderAnalyticsParams } from '../types/order.types';
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const OrderAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('orders');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [analyticsParams, setAnalyticsParams] = useState<OrderAnalyticsParams>({
    days: 7,
    groupBy: 'day',
  });
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const { data: analytics, isLoading: analyticsLoading } = useOrderAnalytics(analyticsParams);
  const { data: revenueAnalytics, isLoading: revenueLoading } = useRevenueAnalytics(
    fromDate?.toISOString(),
    toDate?.toISOString()
  );
  const { data: performanceAnalytics, isLoading: performanceLoading } = usePerformanceAnalytics();
  const exportMutation = useExportOrderAnalytics();

  const handleParamsChange = (key: keyof OrderAnalyticsParams, value: any) => {
    setAnalyticsParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExportAnalytics = async () => {
    try {
      await exportMutation.mutateAsync({
        format: 'csv',
        days: analyticsParams.days,
        fromDate: fromDate?.toISOString(),
        toDate: toDate?.toISOString(),
      });
    } catch {
      // Error handled by mutation onError
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Schedule color="primary" />;
      case 'on_hold':
        return <Warning color="warning" />;
      case 'cancelled':
      case 'refunded':
        return <Cancel color="error" />;
      case 'returned':
        return <Replay color="info" />;
      default:
        return <ShoppingCart color="primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'processing':
        return 'primary';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
      case 'refunded':
        return 'error';
      case 'returned':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            mb: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ fontWeight: 'bold' }}>
            {t('analytics.title')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              fullWidth={isMobile}
            >
              {t('actions.refresh')}
            </Button>
            <Button
              variant="contained"
              size={isMobile ? 'small' : 'medium'}
              startIcon={<Download />}
              onClick={handleExportAnalytics}
              disabled={exportMutation.isPending}
              fullWidth={isMobile}
            >
              {exportMutation.isPending ? t('actions.exporting') : t('analytics.exportReport')}
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 2, md: 3 },
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: filtersExpanded ? 2 : 0,
              cursor: 'pointer',
            }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              {t('filters.analysisFilters')}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setFiltersExpanded(!filtersExpanded);
              }}
            >
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={filtersExpanded}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('analytics.period.label')}</InputLabel>
                  <Select
                    value={analyticsParams.days}
                    onChange={(e) => handleParamsChange('days', e.target.value)}
                    label={t('analytics.period.label')}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    <MenuItem value={7}>{t('filters.last7Days')}</MenuItem>
                    <MenuItem value={30}>{t('filters.last30Days')}</MenuItem>
                    <MenuItem value={90}>{t('filters.last3Months')}</MenuItem>
                    <MenuItem value={365}>{t('filters.lastYear')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('filters.dataAggregation')}</InputLabel>
                  <Select
                    value={analyticsParams.groupBy}
                    onChange={(e) => handleParamsChange('groupBy', e.target.value)}
                    label={t('filters.dataAggregation')}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    <MenuItem value="day">{t('filters.daily')}</MenuItem>
                    <MenuItem value="week">{t('filters.weekly')}</MenuItem>
                    <MenuItem value="month">{t('filters.monthly')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label={t('filters.fromDate')}
                  value={fromDate}
                  onChange={setFromDate}
                  slotProps={{
                    textField: { fullWidth: true, size: isMobile ? 'small' : 'medium' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label={t('filters.toDate')}
                  value={toDate}
                  onChange={setToDate}
                  slotProps={{
                    textField: { fullWidth: true, size: isMobile ? 'small' : 'medium' },
                  }}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        {/* Analytics Overview */}
        {analyticsLoading ? (
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Skeleton variant="rectangular" height={100} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : analytics ? (
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                  height: '100%',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
                    <ShoppingCart fontSize={isMobile ? 'medium' : 'large'} />
                  </Box>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {formatNumber(analytics.totalOrders ?? 0)}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                    {t('analytics.metrics.totalOrders')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                  height: '100%',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ color: 'success.main', mb: 1 }}>
                    <AttachMoney fontSize={isMobile ? 'medium' : 'large'} />
                  </Box>
                  <Typography
                    variant={isMobile ? 'h6' : 'h4'}
                    component="div"
                    sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}
                  >
                    {formatCurrency(analytics.totalRevenue ?? 0, 'USD', 'en')}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                    {t('analytics.metrics.totalRevenue')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                  height: '100%',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ color: 'info.main', mb: 1 }}>
                    <Assessment fontSize={isMobile ? 'medium' : 'large'} />
                  </Box>
                  <Typography
                    variant={isMobile ? 'h6' : 'h4'}
                    component="div"
                    sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}
                  >
                    {formatCurrency(analytics.averageOrderValue ?? 0, 'USD', 'en')}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                    {t('analytics.metrics.averageOrderValue')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <Card
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                  height: '100%',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ color: 'warning.main', mb: 1 }}>
                    <TrendingUp fontSize={isMobile ? 'medium' : 'large'} />
                  </Box>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {formatNumber(
                      analytics.ordersByStatus?.find((s) => s.status === 'completed')?.count ?? 0
                    )}
                  </Typography>
                  <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                    {t('analytics.metrics.completedOrders')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {/* Orders by Status */}
        {analytics && analytics.ordersByStatus && analytics.ordersByStatus.length > 0 && (
          <Card
            sx={{
              mb: { xs: 2, md: 3 },
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PieChart />
                {t('analytics.orderDistributionByStatus')}
              </Typography>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {analytics.ordersByStatus.map((statusData, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Paper
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        textAlign: 'center',
                        bgcolor:
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      }}
                    >
                      <Box sx={{ color: `${getStatusColor(statusData.status)}.main`, mb: 1 }}>
                        {getStatusIcon(statusData.status)}
                      </Box>
                      <Typography
                        variant={isMobile ? 'h6' : 'h5'}
                        component="div"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {formatNumber(statusData.count ?? 0)}
                      </Typography>
                      <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                        {t(`status.${statusData.status}`)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Revenue Analytics */}
        {revenueLoading ? (
          <Card
            sx={{
              mb: { xs: 2, md: 3 },
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        ) : revenueAnalytics ? (
          <Card
            sx={{
              mb: { xs: 2, md: 3 },
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <BarChart />
                {t('analytics.revenueAnalysis')}
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    }}
                  >
                    <Typography
                      variant={isMobile ? 'body1' : 'subtitle1'}
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    >
                      {t('analytics.revenueSummary')}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary={t('analytics.metrics.totalRevenue')}
                          secondary={formatCurrency(revenueAnalytics.totalRevenue ?? 0, 'USD', 'en')}
                          primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                          secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={t('analytics.metrics.totalOrders')}
                          secondary={formatNumber(revenueAnalytics.totalOrders ?? 0)}
                          primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                          secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={t('analytics.metrics.averageOrderValue')}
                          secondary={formatCurrency(revenueAnalytics.averageOrderValue ?? 0, 'USD', 'en')}
                          primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                          secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    }}
                  >
                    <Typography
                      variant={isMobile ? 'body1' : 'subtitle1'}
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    >
                      {t('analytics.bestProducts')}
                    </Typography>
                    <List dense>
                      {revenueAnalytics.topProducts && revenueAnalytics.topProducts.length > 0 ? (
                        revenueAnalytics.topProducts.slice(0, 5).map((product, index) => (
                          <ListItem key={index} divider>
                            <ListItemText
                              primary={product.productName}
                              secondary={
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('analytics.revenue')}:{' '}
                                    {formatCurrency(product.revenue ?? 0, 'USD', 'en')}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block' }}
                                  >
                                    {t('analytics.orders')}: {formatNumber(product.orders ?? 0)}
                                  </Typography>
                                </Box>
                              }
                              primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Typography
                          variant={isMobile ? 'caption' : 'body2'}
                          color="text.secondary"
                          sx={{ p: 2 }}
                        >
                          {t('analytics.noDataAvailable')}
                        </Typography>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : null}

        {/* Performance Analytics */}
        {performanceLoading ? (
          <Card
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        ) : performanceAnalytics ? (
          <Card
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Timeline />
                {t('analytics.performanceAnalysis')}
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 1 }}>
                      <Schedule fontSize={isMobile ? 'medium' : 'large'} />
                    </Box>
                    <Typography
                      variant={isMobile ? 'h6' : 'h5'}
                      component="div"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {formatNumber(performanceAnalytics.averageProcessingTime ?? 0)}{' '}
                      {t('analytics.day')}
                    </Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      {t('analytics.averageProcessingTime')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    }}
                  >
                    <Box sx={{ color: 'error.main', mb: 1 }}>
                      <Cancel fontSize={isMobile ? 'medium' : 'large'} />
                    </Box>
                    <Typography
                      variant={isMobile ? 'h6' : 'h5'}
                      component="div"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {formatNumber(performanceAnalytics.cancellationRate ?? 0)}%
                    </Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      {t('analytics.cancellationRate')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    }}
                  >
                    <Box sx={{ color: 'warning.main', mb: 1 }}>
                      <Refresh fontSize={isMobile ? 'medium' : 'large'} />
                    </Box>
                    <Typography
                      variant={isMobile ? 'h6' : 'h5'}
                      component="div"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {formatNumber(performanceAnalytics.refundRate ?? 0)}%
                    </Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      {t('analytics.refundRate')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      textAlign: 'center',
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    }}
                  >
                    <Box sx={{ color: 'success.main', mb: 1 }}>
                      <TrendingUp fontSize={isMobile ? 'medium' : 'large'} />
                    </Box>
                    <Typography
                      variant={isMobile ? 'h6' : 'h5'}
                      component="div"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {formatNumber(performanceAnalytics.customerSatisfactionScore ?? 0)}/5
                    </Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      {t('analytics.customerSatisfactionScore')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : null}

        {/* Recent Orders */}
        {analytics && analytics.recentOrders && analytics.recentOrders.length > 0 && (
          <Card
            sx={{
              mt: { xs: 2, md: 3 },
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ShoppingCart />
                {t('analytics.recentOrders')}
              </Typography>
              <List sx={{ p: 0 }}>
                {analytics.recentOrders.slice(0, 10).map((order, index) => (
                  <ListItem
                    key={index}
                    divider
                    sx={{
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      py: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <ListItemText
                      primary={`#${order.orderNumber}`}
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {t('analytics.client')}: {order.deliveryAddress.recipientName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {t('analytics.total')}: {formatCurrency(order.total ?? 0, 'USD', 'en')}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {t('analytics.date')}: {formatDate(order.createdAt)}
                          </Typography>
                        </Box>
                      }
                      primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}
                      sx={{ flex: 1, minWidth: 0, mb: { xs: 1, sm: 0 } }}
                    />
                    <Chip
                      label={t(`status.${order.status}`)}
                      color={getStatusColor(order.status) as any}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};
