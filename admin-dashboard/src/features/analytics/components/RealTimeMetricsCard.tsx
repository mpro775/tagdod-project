import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
  useTheme,
  IconButton,
  Badge,
  Stack,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing, getChartHeight, getChartMargin, getChartLabelFontSize, getChartTooltipFontSize, getYAxisWidth, getXAxisHeight } from '../utils/responsive';
import {

  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Support as SupportIcon,
  Inventory as InventoryIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { RealTimeMetrics } from '../types/analytics.types';

interface RealTimeMetricsCardProps {
  data?: RealTimeMetrics;
  isLoading?: boolean;
  error?: any;
}

export const RealTimeMetricsCard: React.FC<RealTimeMetricsCardProps> = ({
  data,
  isLoading = false,
  error,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  const chartHeight = getChartHeight(breakpoint, 200);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (data?.lastUpdated) {
      setLastUpdated(new Date(data.lastUpdated));
    }
  }, [data?.lastUpdated]);

  if (error) {
    return (
      <Alert 
        severity="error"
        sx={{ m: breakpoint.isXs ? 1 : 2 }}
      >
        {t('realTimeMetrics.loadError')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: cardPadding }}>
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {t('realTimeMetrics.title')}
          </Typography>
          <Grid container spacing={cardSpacing}>
            {[...Array(6)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Skeleton variant="rectangular" height={breakpoint.isXs ? 100 : 120} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };


  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'critical':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getSystemHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'critical':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <WarningIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getSystemHealthText = (status: string) => {
    switch (status) {
      case 'healthy':
        return t('realTimeMetrics.healthy');
      case 'warning':
        return t('realTimeMetrics.warning');
      case 'critical':
        return t('realTimeMetrics.critical');
      default:
        return t('realTimeMetrics.unknown');
    }
  };

  // Use real-time data from backend (current snapshot only)
  // For historical charts, would need to implement real-time metrics collection
  const realTimeData = [
    {
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      activeUsers: data?.activeUsers || 0,
      apiResponseTime: data?.systemHealth?.apiResponseTime || 0,
      errorRate: data?.systemHealth?.errorRate || 0,
      memoryUsage: data?.memoryUsage || 0,
      cpuUsage: data?.cpuUsage || 0,
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: cardPadding }}>
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={cardSpacing}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
            gap: breakpoint.isXs ? 1.5 : 2,
          }}
        >
          <Typography 
            variant={breakpoint.isXs ? 'h6' : 'h5'} 
            component="h2"
            sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
          >
            {t('realTimeMetrics.title')}
          </Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Chip
              icon={<SpeedIcon sx={{ fontSize: breakpoint.isXs ? 16 : undefined }} />}
              label={`${t('realTimeMetrics.lastUpdate')}: ${lastUpdated.toLocaleTimeString('ar-SA')}`}
              color="primary"
              variant="outlined"
              size={breakpoint.isXs ? 'small' : 'small'}
              sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
            />
            <MuiTooltip title={t('realTimeMetrics.refresh')}>
              <IconButton 
                size={breakpoint.isXs ? 'medium' : 'small'}
              >
                <RefreshIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
              </IconButton>
            </MuiTooltip>
          </Stack>
        </Stack>

        {/* System Health Status */}
        <Box sx={{ mb: breakpoint.isXs ? 2 : 3 }}>
          <Box
            sx={{
              p: breakpoint.isXs ? 1.5 : 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${getSystemHealthColor(data?.systemHealth?.status || 'healthy')}15, ${getSystemHealthColor(data?.systemHealth?.status || 'healthy')}05)`,
              border: `1px solid ${getSystemHealthColor(data?.systemHealth?.status || 'healthy')}20`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: breakpoint.isXs ? 1.5 : 2 }}>
              {getSystemHealthIcon(data?.systemHealth?.status || 'healthy')}
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                sx={{ 
                  ml: 1,
                  fontSize: breakpoint.isXs ? '1rem' : undefined,
                }}
              >
                {t('realTimeMetrics.systemStatus')}: {getSystemHealthText(data?.systemHealth?.status || 'healthy')}
              </Typography>
            </Box>
            <Grid container spacing={cardSpacing}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {t('realTimeMetrics.apiResponseTime')}
                </Typography>
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {data?.systemHealth?.apiResponseTime || 0}ms
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {t('realTimeMetrics.errorRate')}
                </Typography>
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {(data?.systemHealth?.errorRate || 0).toFixed(2)}%
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {t('realTimeMetrics.uptime')}
                </Typography>
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {(data?.systemHealth?.uptime || 0).toFixed(1)}%
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {t('realTimeMetrics.activeConnections')}
                </Typography>
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {data?.activeConnections || 0}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="primary"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('realTimeMetrics.activeUsers')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.activeUsers || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                }}
              >
                {t('realTimeMetrics.currentlyActive')}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('realTimeMetrics.todaySales')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatCurrency(data?.todaySales || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                }}
              >
                {t('realTimeMetrics.totalTodaySales')}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon 
                  sx={{ 
                    color: theme.palette.success.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="success.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('realTimeMetrics.todayOrders')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.todayOrders || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                }}
              >
                {t('realTimeMetrics.totalTodayOrders')}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SupportIcon 
                  sx={{ 
                    color: theme.palette.warning.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="warning.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('realTimeMetrics.supportTickets')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.pendingSupportTickets || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                }}
              >
                {t('realTimeMetrics.pendingTickets')}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Performance Metrics */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('realTimeMetrics.resourceUsage')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MemoryIcon 
                      sx={{ 
                        mr: 1, 
                        color: theme.palette.primary.main,
                        fontSize: breakpoint.isXs ? '1.125rem' : undefined,
                      }} 
                    />
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      {t('realTimeMetrics.memory')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="primary"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {data?.memoryUsage || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.memoryUsage || 0}
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon 
                      sx={{ 
                        mr: 1, 
                        color: theme.palette.secondary.main,
                        fontSize: breakpoint.isXs ? '1.125rem' : undefined,
                      }} 
                    />
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      {t('realTimeMetrics.cpu')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="secondary"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {data?.cpuUsage || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.cpuUsage || 0}
                  color="secondary"
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StorageIcon 
                      sx={{ 
                        mr: 1, 
                        color: theme.palette.success.main,
                        fontSize: breakpoint.isXs ? '1.125rem' : undefined,
                      }} 
                    />
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      {t('realTimeMetrics.storage')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="success.main"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {data?.diskUsage || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.diskUsage || 0}
                  color="success"
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('realTimeMetrics.liveActivity')}
              </Typography>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <AreaChart 
                  data={realTimeData}
                  margin={chartMargin}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: labelFontSize }}
                    height={xAxisHeight}
                  />
                  <YAxis 
                    tick={{ fontSize: labelFontSize }}
                    width={yAxisWidth}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: `${tooltipFontSize}px`,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.3}
                    strokeWidth={breakpoint.isXs ? 1.5 : 2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Metrics */}
        <Grid container spacing={breakpoint.isXs ? 1.5 : 3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center', p: cardPadding }}>
              <Badge badgeContent={data?.lowStockAlerts || 0} color="error">
                <InventoryIcon 
                  sx={{ 
                    fontSize: breakpoint.isXs ? 32 : 40, 
                    color: theme.palette.warning.main 
                  }} 
                />
              </Badge>
              <Typography 
                variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                }}
              >
                {t('realTimeMetrics.inventoryAlerts')}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
              >
                {t('realTimeMetrics.productsNeedRestock')}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center', p: cardPadding }}>
              <Badge badgeContent={data?.activeOrders || 0} color="primary">
                <ShoppingCartIcon 
                  sx={{ 
                    fontSize: breakpoint.isXs ? 32 : 40, 
                    color: theme.palette.primary.main 
                  }} 
                />
              </Badge>
              <Typography 
                variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                }}
              >
                {t('realTimeMetrics.activeOrders')}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
              >
                {t('realTimeMetrics.ordersInProcessing')}
              </Typography>
            </Box>
          </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center', p: cardPadding }}>
              <Badge badgeContent={data?.todayNewCustomers || 0} color="success">
                <PeopleIcon 
                  sx={{ 
                    fontSize: breakpoint.isXs ? 32 : 40, 
                    color: theme.palette.success.main 
                  }} 
                />
              </Badge>
              <Typography 
                variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                }}
              >
                {t('realTimeMetrics.todayNewCustomers')}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
              >
                {t('realTimeMetrics.newRegistrations')}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ textAlign: 'center', p: cardPadding }}>
              <Badge badgeContent={data?.todayAbandonedCarts || 0} color="warning">
                <ShoppingCartIcon 
                  sx={{ 
                    fontSize: breakpoint.isXs ? 32 : 40, 
                    color: theme.palette.warning.main 
                  }} 
                />
              </Badge>
              <Typography 
                variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                }}
              >
                {t('realTimeMetrics.abandonedCarts')}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
              >
                {t('realTimeMetrics.incompleteCarts')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
