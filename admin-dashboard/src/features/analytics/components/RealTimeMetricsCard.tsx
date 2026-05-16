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
  Stack,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Support as SupportIcon,
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
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { translateSystemStatus } from '../utils/translations';
import { AnalyticsCardErrorBoundary } from './AnalyticsCardErrorBoundary';

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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (data?.lastUpdated) {
      setLastUpdated(new Date(data.lastUpdated));
    }
  }, [data?.lastUpdated]);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: breakpoint.isXs ? 1 : 2 }}>
        {t('realTimeMetrics.loadError')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('realTimeMetrics.title')}
          </Typography>
          <Grid container spacing={2}>
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

  const formatValue = (value: number | undefined | null, fallback = 'غير متاح'): string => {
    if (value === undefined || value === null) return fallback;
    if (isNaN(value)) return fallback;
    return formatNumber(value);
  };

  const getSystemHealthColor = (status?: string) => {
    switch (status?.toLowerCase()) {
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

  const getSystemHealthIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
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

  const systemHealth = data?.systemHealth;
  const hasSystemHealth = systemHealth && systemHealth.status !== undefined;

  const realTimeData = [
    {
      time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      activeUsers: data?.activeUsers || 0,
      responseTime: systemHealth?.responseTime ?? systemHealth?.apiResponseTime ?? 0,
      errorRate: systemHealth?.errorRate ?? 0,
      memoryUsage: data?.memoryUsage ?? 0,
      cpuUsage: data?.cpuUsage ?? 0,
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
            gap: breakpoint.isXs ? 1.5 : 2,
          }}
        >
          <Typography variant={breakpoint.isXs ? 'h6' : 'h5'} component="h2">
            {t('realTimeMetrics.title')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<SpeedIcon sx={{ fontSize: breakpoint.isXs ? 16 : undefined }} />}
              label={`${t('realTimeMetrics.lastUpdate')}: ${lastUpdated.toLocaleTimeString('ar-YE')}`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <MuiTooltip title={t('realTimeMetrics.refresh')}>
              <IconButton size="small" onClick={() => window.location.reload()}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          </Stack>
        </Stack>

        {/* System Health */}
        {hasSystemHealth && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${getSystemHealthColor(systemHealth.status)}15, ${getSystemHealthColor(systemHealth.status)}05)`,
                border: `1px solid ${getSystemHealthColor(systemHealth.status)}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getSystemHealthIcon(systemHealth.status)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {t('realTimeMetrics.systemStatus')}: {translateSystemStatus(systemHealth.status)}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('realTimeMetrics.apiResponseTime')}
                  </Typography>
                  <Typography variant="h6">
                    {systemHealth.responseTime !== undefined && systemHealth.responseTime !== null
                      ? `${systemHealth.responseTime}ms`
                      : 'غير متاح'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('realTimeMetrics.errorRate')}
                  </Typography>
                  <Typography variant="h6">
                    {systemHealth.errorRate !== undefined && systemHealth.errorRate !== null
                      ? `${Number(systemHealth.errorRate).toFixed(2)}%`
                      : 'غير متاح'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('realTimeMetrics.uptime')}
                  </Typography>
                  <Typography variant="h6">
                    {systemHealth.uptime !== undefined && systemHealth.uptime !== null
                      ? `${Number(systemHealth.uptime).toFixed(1)}%`
                      : 'غير متاح'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('realTimeMetrics.activeConnections')}
                  </Typography>
                  <Typography variant="h6">
                    {formatValue(data?.activeConnections)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`, border: `1px solid ${theme.palette.primary.main}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="primary">{t('realTimeMetrics.activeUsers')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatValue(data?.activeUsers)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`, border: `1px solid ${theme.palette.secondary.main}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" color="secondary">{t('realTimeMetrics.todaySales')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data?.todaySales !== undefined && data.todaySales !== null ? formatCurrency(data.todaySales) : 'غير متاح'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`, border: `1px solid ${theme.palette.success.main}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" color="success.main">{t('realTimeMetrics.todayOrders')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatValue(data?.todayOrders)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`, border: `1px solid ${theme.palette.warning.main}20` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SupportIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" color="warning.main">{t('realTimeMetrics.supportTickets')}</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatValue(data?.pendingSupportTickets)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Resource Usage + Live Activity */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض الموارد">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>{t('realTimeMetrics.resourceUsage')}</Typography>
                {[
                  { label: t('realTimeMetrics.memory'), value: data?.memoryUsage, icon: <MemoryIcon />, color: 'primary' as const },
                  { label: t('realTimeMetrics.cpu'), value: data?.cpuUsage, icon: <SpeedIcon />, color: 'secondary' as const },
                  { label: t('realTimeMetrics.storage'), value: data?.diskUsage, icon: <StorageIcon />, color: 'success' as const },
                ].map((resource, idx) => {
                  const val = resource.value;
                  const hasValue = val !== undefined && val !== null && !isNaN(val);
                  return (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {React.cloneElement(resource.icon, { sx: { mr: 1, color: theme.palette[resource.color].main } })}
                          <Typography variant="body2">{resource.label}</Typography>
                        </Box>
                        <Typography variant="body2" color={`${resource.color}.main`}>
                          {hasValue ? `${val}%` : 'غير متاح'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={hasValue ? Math.min(val, 100) : 0}
                        color={resource.color}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض النشاط المباشر">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>{t('realTimeMetrics.liveActivity')}</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={asArray(realTimeData)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip contentStyle={{ direction: 'rtl', textAlign: 'right' }} />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      stackId="1"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
