import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Skeleton,
  useTheme,
  Tooltip,
  IconButton,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing } from '../utils/responsive';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkCheckIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { PerformanceMetrics } from '../types/analytics.types';

interface PerformanceMetricsCardProps {
  data?: PerformanceMetrics;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  data,
  isLoading = false,
  error,
  onRefresh,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: breakpoint.isXs ? 1 : 2 }}>
        {t('performanceMetrics.loadError')}
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
            {t('performanceMetrics.title')}
          </Typography>
          <Grid container spacing={cardSpacing}>
            {[...Array(4)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <Skeleton variant="rectangular" height={breakpoint.isXs ? 90 : breakpoint.isSm ? 95 : 100} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  const getPerformanceIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good)
      return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
    if (value <= thresholds.warning)
      return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
    return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
  };

  // Use current performance metrics from backend
  // For historical performance charts, would need to query SystemMetrics collection
  const performanceData = [
    {
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      responseTime: data?.averageApiResponseTime || 0,
      memoryUsage: data?.memoryUsage || 0,
      cpuUsage: data?.cpuUsage || 0,
      errorRate: data?.errorRate || 0,
    },
  ];

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }, isUptime?: boolean) => {
    if (isUptime) {
      if (value >= 99.9) return t('performanceMetrics.performanceStatus.excellent');
      if (value >= 99.0) return t('performanceMetrics.performanceStatus.good');
      return t('performanceMetrics.performanceStatus.needsImprovement');
    }
    if (value <= thresholds.good) return t('performanceMetrics.performanceStatus.excellent');
    if (value <= thresholds.warning) return t('performanceMetrics.performanceStatus.good');
    return t('performanceMetrics.performanceStatus.needsImprovement');
  };

  return (
    <Card>
      <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={breakpoint.isXs ? 1.5 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
          }}
        >
          <Typography 
            variant={breakpoint.isXs ? 'h6' : 'h5'} 
            component="h2"
            sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
          >
            {t('performanceMetrics.title')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              icon={<SpeedIcon />} 
              label={t('performanceMetrics.systemPerformance')} 
              color="primary" 
              variant="outlined"
              size={breakpoint.isXs ? 'small' : 'medium'}
              sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
            />
            {onRefresh && (
              <Tooltip title={t('performanceMetrics.refresh')}>
                <IconButton 
                  size={breakpoint.isXs ? 'medium' : 'small'} 
                  onClick={onRefresh}
                >
                  <RefreshIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Stack>

        {/* Key Performance Metrics */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon 
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
                  {t('performanceMetrics.responseTime')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatTime(data?.averageApiResponseTime || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon(data?.averageApiResponseTime || 0, { good: 200, warning: 500 })}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1,
                    fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                  }}
                >
                  {getPerformanceStatus(data?.averageApiResponseTime || 0, { good: 200, warning: 500 })}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon 
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
                  {t('performanceMetrics.errorRate')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {(data?.errorRate || 0).toFixed(2)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon((data?.errorRate || 0) * 100, { good: 1, warning: 5 })}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1,
                    fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                  }}
                >
                  {getPerformanceStatus((data?.errorRate || 0) * 100, { good: 1, warning: 5 })}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NetworkCheckIcon 
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
                  {t('performanceMetrics.uptime')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {(data?.uptime || 0).toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon(100 - (data?.uptime || 0), { good: 1, warning: 5 })}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1,
                    fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                  }}
                >
                  {getPerformanceStatus(data?.uptime || 0, { good: 99.9, warning: 99.0 }, true)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MemoryIcon 
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
                  {t('performanceMetrics.memoryUsage')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {(data?.memoryUsage || 0).toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon(data?.memoryUsage || 0, { good: 70, warning: 85 })}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1,
                    fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                  }}
                >
                  {getPerformanceStatus(data?.memoryUsage || 0, { good: 70, warning: 85 })}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Performance Charts */}
        <Grid container spacing={breakpoint.isXs ? 2 : 3} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box 
              sx={{ 
                p: breakpoint.isXs ? 1.5 : 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('performanceMetrics.systemPerformance24h')}
              </Typography>
              <ResponsiveContainer width="100%" height={breakpoint.isXs ? 250 : 300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: breakpoint.isXs ? 10 : 12 }}
                    angle={breakpoint.isXs ? -45 : 0}
                    textAnchor={breakpoint.isXs ? 'end' : 'middle'}
                    height={breakpoint.isXs ? 60 : undefined}
                  />
                  <YAxis 
                    tick={{ fontSize: breakpoint.isXs ? 10 : 12 }}
                    width={breakpoint.isXs ? 40 : undefined}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      fontSize: breakpoint.isXs ? '12px' : '14px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="responseTime"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.3}
                    name={t('performanceMetrics.responseTimeMs')}
                  />
                  <Area
                    type="monotone"
                    dataKey="memoryUsage"
                    stackId="2"
                    stroke={theme.palette.secondary.main}
                    fill={theme.palette.secondary.main}
                    fillOpacity={0.3}
                    name={t('performanceMetrics.memoryUsagePercent')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Box 
              sx={{ 
                p: breakpoint.isXs ? 1.5 : 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('performanceMetrics.resourceUsage')}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
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
                      {t('performanceMetrics.memoryUsage')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="primary"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {(data?.memoryUsage || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.memoryUsage || 0}
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
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
                      {t('performanceMetrics.cpuUsage')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="secondary"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {(data?.cpuUsage || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.cpuUsage || 0}
                  color="secondary"
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
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
                      {t('performanceMetrics.diskUsage')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="success.main"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {(data?.diskUsage || 0).toFixed(1)}%
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
        </Grid>

        {/* Database Stats */}
        {data?.databaseStats && (
          <Box 
            sx={{ 
              p: breakpoint.isXs ? 1.5 : 2, 
              border: `1px solid ${theme.palette.divider}`, 
              borderRadius: 2,
              mt: breakpoint.isXs ? 2 : 0,
            }}
          >
            <Typography 
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
            >
              {t('performanceMetrics.databaseStats')}
            </Typography>
            <Grid container spacing={breakpoint.isXs ? 1.5 : 2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant={breakpoint.isXs ? 'h5' : 'h4'} 
                    color="primary"
                    sx={{ fontSize: breakpoint.isXs ? '1.5rem' : undefined }}
                  >
                    {data.databaseStats.totalCollections}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {t('performanceMetrics.collections')}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant={breakpoint.isXs ? 'h5' : 'h4'} 
                    color="secondary"
                    sx={{ fontSize: breakpoint.isXs ? '1.5rem' : undefined }}
                  >
                    {formatBytes(data.databaseStats.totalDocuments)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {t('performanceMetrics.documents')}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant={breakpoint.isXs ? 'h5' : 'h4'} 
                    color="success.main"
                    sx={{ fontSize: breakpoint.isXs ? '1.5rem' : undefined }}
                  >
                    {formatBytes(data.databaseStats.databaseSize)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {t('performanceMetrics.databaseSize')}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant={breakpoint.isXs ? 'h5' : 'h4'} 
                    color="warning.main"
                    sx={{ fontSize: breakpoint.isXs ? '1.5rem' : undefined }}
                  >
                    {formatBytes(data.databaseStats.indexSize)}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {t('performanceMetrics.indexSize')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Slowest Endpoints */}
        {data?.slowestEndpoints && data.slowestEndpoints.length > 0 && (
          <Box sx={{ mt: breakpoint.isXs ? 2 : 3 }}>
            <Typography 
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
            >
              {t('performanceMetrics.slowestEndpoints')}
            </Typography>
            <Box sx={{ maxHeight: breakpoint.isXs ? 180 : 200, overflowY: 'auto' }}>
              {data.slowestEndpoints.map((endpoint, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: breakpoint.isXs ? '0.8125rem' : undefined,
                      }}
                    >
                      {endpoint.method} {endpoint.endpoint}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="primary"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      {formatTime(endpoint.averageTime)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                    >
                      {t('performanceMetrics.calls')}: {endpoint.callCount}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                    >
                      {t('performanceMetrics.maxTime')}: {formatTime(endpoint.maxTime)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(endpoint.averageTime / 1000) * 100}
                    sx={{ height: breakpoint.isXs ? 3 : 4, borderRadius: 2 }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
