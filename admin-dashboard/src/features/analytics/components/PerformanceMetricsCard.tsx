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
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkCheckIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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

  if (error) {
    return (
      <Alert severity="error">
        حدث خطأ في تحميل مقاييس الأداء
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            مقاييس الأداء
          </Typography>
          <Grid container spacing={2}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Skeleton variant="rectangular" height={100} />
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

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return theme.palette.success.main;
    if (value <= thresholds.warning) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPerformanceIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
    if (value <= thresholds.warning) return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
    return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
  };

  // Generate mock performance data for charts
  const generatePerformanceData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour
      data.push({
        time: time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        responseTime: Math.floor(Math.random() * 200) + 100,
        memoryUsage: Math.random() * 30 + 60,
        cpuUsage: Math.random() * 40 + 30,
        errorRate: Math.random() * 2,
      });
    }
    return data;
  };

  const performanceData = generatePerformanceData();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            مقاييس الأداء
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<SpeedIcon />}
              label="أداء النظام"
              color="primary"
              variant="outlined"
            />
            {onRefresh && (
              <Tooltip title="تحديث البيانات">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Key Performance Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="primary">
                  وقت الاستجابة
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatTime(data?.averageApiResponseTime || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon(data?.averageApiResponseTime || 0, { good: 200, warning: 500 })}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {data?.averageApiResponseTime && data.averageApiResponseTime <= 200 ? 'ممتاز' :
                   data?.averageApiResponseTime && data.averageApiResponseTime <= 500 ? 'جيد' : 'يحتاج تحسين'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  معدل الأخطاء
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {(data?.errorRate || 0).toFixed(2)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon((data?.errorRate || 0) * 100, { good: 1, warning: 5 })}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {data?.errorRate && data.errorRate <= 0.01 ? 'ممتاز' :
                   data?.errorRate && data.errorRate <= 0.05 ? 'جيد' : 'يحتاج تحسين'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NetworkCheckIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  وقت التشغيل
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {(data?.uptime || 0).toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon(100 - (data?.uptime || 0), { good: 1, warning: 5 })}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {data?.uptime && data.uptime >= 99.9 ? 'ممتاز' :
                   data?.uptime && data.uptime >= 99.0 ? 'جيد' : 'يحتاج تحسين'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MemoryIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  استخدام الذاكرة
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {(data?.memoryUsage || 0).toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getPerformanceIcon(data?.memoryUsage || 0, { good: 70, warning: 85 })}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {data?.memoryUsage && data.memoryUsage <= 70 ? 'ممتاز' :
                   data?.memoryUsage && data.memoryUsage <= 85 ? 'جيد' : 'يحتاج تحسين'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Performance Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                أداء النظام على مدار 24 ساعة
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="responseTime"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.3}
                    name="وقت الاستجابة (ms)"
                  />
                  <Area
                    type="monotone"
                    dataKey="memoryUsage"
                    stackId="2"
                    stroke={theme.palette.secondary.main}
                    fill={theme.palette.secondary.main}
                    fillOpacity={0.3}
                    name="استخدام الذاكرة (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                استخدام الموارد
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MemoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2">الذاكرة</Typography>
                  </Box>
                  <Typography variant="body2" color="primary">
                    {(data?.memoryUsage || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.memoryUsage || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">المعالج</Typography>
                  </Box>
                  <Typography variant="body2" color="secondary">
                    {(data?.cpuUsage || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.cpuUsage || 0}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StorageIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="body2">التخزين</Typography>
                  </Box>
                  <Typography variant="body2" color="success.main">
                    {(data?.diskUsage || 0).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.diskUsage || 0}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Database Stats */}
        {data?.databaseStats && (
          <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              إحصائيات قاعدة البيانات
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {data.databaseStats.totalCollections}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المجموعات
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    {formatBytes(data.databaseStats.totalDocuments)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المستندات
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {formatBytes(data.databaseStats.databaseSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    حجم قاعدة البيانات
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {formatBytes(data.databaseStats.indexSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    حجم الفهارس
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Slowest Endpoints */}
        {data?.slowestEndpoints && data.slowestEndpoints.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              أبطأ نقاط النهاية
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {data.slowestEndpoints.map((endpoint, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {endpoint.method} {endpoint.endpoint}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {formatTime(endpoint.averageTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      المكالمات: {endpoint.callCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      أقصى وقت: {formatTime(endpoint.maxTime)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(endpoint.averageTime / 1000) * 100}
                    sx={{ height: 4, borderRadius: 2 }}
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
