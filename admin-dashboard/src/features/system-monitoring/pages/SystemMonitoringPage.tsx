import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Speed,
  Storage,
  Memory,
  Refresh,
  CheckCircle,
  Cancel,
  Cloud,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { systemMonitoringApi } from '../api/systemMonitoringApi';
import type { SystemHealth, ResourceUsage } from '../api/systemMonitoringApi';
import { toast } from 'react-hot-toast';
import { formatBytes, formatUptime } from '@/shared/utils/format';
import { MetricsChart } from '../components/MetricsChart';
import { ApiPerformanceChart } from '../components/ApiPerformanceChart';

export function SystemMonitoringPage() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [resources, setResources] = useState<ResourceUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const fetchData = async () => {
    try {
      const [healthData, resourcesData] = await Promise.all([
        systemMonitoringApi.getSystemHealth(),
        systemMonitoringApi.getResourceUsage(),
      ]);
      
      setHealth(healthData);
      setResources(resourcesData);
    } catch {
      toast.error(t('system-monitoring.messages.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'critical':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage > 90) return 'error.main';
    if (usage > 70) return 'warning.main';
    return 'success.main';
  };

  const getProgressColor = (usage: number): 'error' | 'warning' | 'success' => {
    if (usage > 90) return 'error';
    if (usage > 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          {t('system-monitoring.loading.message', { defaultValue: 'جاري تحميل البيانات...' })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('system-monitoring.navigation.title', { defaultValue: 'مراقبة النظام' })}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('system-monitoring.navigation.subtitle', { defaultValue: 'مراقبة النظام' })}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? t('system-monitoring.actions.disableAutoRefresh', { defaultValue: 'تعطيل التحديث التلقائي' }) : t('system-monitoring.actions.enableAutoRefresh', { defaultValue: 'تمكين التحديث التلقائي' })}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={fetchData}
            disabled={loading}
            startIcon={<Refresh />}
          >
            {t('system-monitoring.actions.refresh', { defaultValue: 'تحديث' })}
          </Button>
        </Box>
      </Box>

      {/* System Status */}
      {health && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {t('system-monitoring.systemHealth.title', { defaultValue: 'صحة النظام' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('system-monitoring.systemHealth.subtitle', { defaultValue: 'صحة النظام' })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(health.status),
                    }}
                  />
                  <Chip
                    label={t(`system-monitoring.systemHealth.status.${health.status}`, { defaultValue: 'صحة النظام' })}
                    color={health.status === 'healthy' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('system-monitoring.systemHealth.metrics.uptime', { defaultValue: 'وقت التشغيل' })}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatUptime(health.uptime)}
                </Typography>
              </Grid>

              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('system-monitoring.systemHealth.metrics.avgResponseTime', { defaultValue: 'متوسط وقت الاستجابة' })}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {t('system-monitoring.systemHealth.units.milliseconds', {
                    defaultValue: 'مللي ثانية',
                    value: health.avgApiResponseTime.toFixed(2),
                  })}
                </Typography>
              </Grid>

              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('system-monitoring.systemHealth.metrics.errorRate', { defaultValue: 'معدل الأخطاء' })}
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: getUsageColor(health.errorRate) }}>
                  {t('system-monitoring.systemHealth.units.percentage', {
                    defaultValue: 'نسبة الأخطاء',
                    value: health.errorRate.toFixed(2),
                  })}
                </Typography>
              </Grid>

              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('system-monitoring.systemHealth.metrics.activeRequests', { defaultValue: 'عدد الطلبات النشطة' }    )}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {t('system-monitoring.systemHealth.metrics.activeRequests', {
                    defaultValue: 'عدد الطلبات النشطة',
                    value: health.activeRequests,
                  })}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab icon={<Speed />} iconPosition="start" label={t('system-monitoring.tabs.resources', { defaultValue: 'الموارد' })} />
              <Tab icon={<Storage />} iconPosition="start" label={t('system-monitoring.tabs.database', { defaultValue: 'القاعدة البيانية' })} />
              <Tab icon={<Cloud />} iconPosition="start" label={t('system-monitoring.tabs.cache', { defaultValue: 'الذاكرة المؤقتة' })} />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* CPU */}
              <Grid component="div" size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {t('system-monitoring.resources.cpu.title', { defaultValue: 'المعالج' })}
                        </Typography>
                        <Speed color="action" />
                      </Box>
                    }
                  />
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: getUsageColor(resources.cpu.usage) }}>
                      {resources.cpu.usage.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={resources.cpu.usage}
                        color={getProgressColor(resources.cpu.usage)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {t('system-monitoring.resources.cpu.cores', {
                        defaultValue: 'عدد المعالجات',
                        count: resources.cpu.cores,
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Memory */}
              <Grid component="div" size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {t('system-monitoring.resources.memory.title', { defaultValue: 'الذاكرة' })}
                        </Typography>
                        <Memory color="action" />
                      </Box>
                    }
                  />
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: getUsageColor(resources.memory.usagePercentage) }}>
                      {resources.memory.usagePercentage.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={resources.memory.usagePercentage}
                        color={getProgressColor(resources.memory.usagePercentage)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {t('system-monitoring.resources.memory.usage', {
                        defaultValue: 'استخدام الذاكرة',
                        used: formatBytes(resources.memory.used),
                        total: formatBytes(resources.memory.total),
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Disk */}
              <Grid component="div" size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {t('system-monitoring.resources.disk.title', { defaultValue: 'القرص' })}
                        </Typography>
                        <Storage color="action" />
                      </Box>
                    }
                  />
                  <CardContent>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: getUsageColor(resources.disk.usagePercentage) }}>
                      {resources.disk.usagePercentage.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={resources.disk.usagePercentage}
                        color={getProgressColor(resources.disk.usagePercentage)}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {t('system-monitoring.resources.disk.usage', {
                        defaultValue: 'استخدام القرص',
                        used: formatBytes(resources.disk.used),
                        total: formatBytes(resources.disk.total),
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && health && (
            <Card>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight="bold">
                    {t('system-monitoring.database.title', { defaultValue: 'القاعدة البيانية' })}
                  </Typography>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.database.metrics.status', { defaultValue: 'الحالة' })}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {health.databaseStatus.connected ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                      <Typography variant="body1" fontWeight="medium">
                        {t(`system-monitoring.database.status.${health.databaseStatus.connected ? 'connected' : 'disconnected'}`, {
                          defaultValue: health.databaseStatus.connected ? 'متصل' : 'غير متصل',
                        })}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.database.metrics.responseTime', { defaultValue: 'وقت الاستجابة' })}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {t('system-monitoring.database.units.milliseconds', {
                        defaultValue: 'مللي ثانية',
                        value: health.databaseStatus.responseTime,
                      })}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.database.metrics.collections', { defaultValue: 'عدد المجموعات' })}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {t('system-monitoring.database.metrics.collections', {
                        defaultValue: 'عدد المجموعات',
                        value: health.databaseStatus.collections,
                      })}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.database.metrics.totalSize', { defaultValue: 'حجم القاعدة البيانية' })}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatBytes(health.databaseStatus.totalSize)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && health && (
            <Card>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight="bold">
                    {t('system-monitoring.cache.title', { defaultValue: 'الذاكرة المؤقتة' })}
                  </Typography>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.cache.metrics.status', { defaultValue: 'الحالة' })}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {health.redisStatus.connected ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                      <Typography variant="body1" fontWeight="medium">
                          {t(`system-monitoring.cache.status.${health.redisStatus.connected ? 'connected' : 'disconnected'}`, {
                          defaultValue: health.redisStatus.connected ? 'متصل' : 'غير متصل',
                        })}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.cache.metrics.responseTime', { defaultValue: 'وقت الاستجابة' })}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold"  >
                      {t('system-monitoring.cache.units.milliseconds', {
                        defaultValue: 'مللي ثانية',
                        value: health.redisStatus.responseTime,
                      })}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.cache.metrics.hitRate', { defaultValue: 'معدل الإصابة' })}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {t('system-monitoring.cache.units.percentage', {
                        defaultValue: 'نسبة الإصابة',
                        value: health.redisStatus.hitRate.toFixed(1),
                      })}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('system-monitoring.cache.metrics.memoryUsage', { defaultValue: 'استخدام الذاكرة' })}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {t('system-monitoring.cache.units.percentage', {
                        defaultValue: 'نسبة الاستخدام',
                        value: health.redisStatus.memoryUsage.toFixed(1),
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Charts Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          {t('system-monitoring.charts.title', { defaultValue: 'الرسوم البيانية' }  )}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <MetricsChart
              metricType="cpu"
              title={t('system-monitoring.charts.metrics.cpu', { defaultValue: 'المعالج' })}
              color="#3b82f6"
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <MetricsChart
              metricType="memory"
              title={t('system-monitoring.charts.metrics.memory', { defaultValue: 'الذاكرة' })}
              color="#10b981"
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <MetricsChart
            metricType="disk"
            title={t('system-monitoring.charts.metrics.disk', { defaultValue: 'القرص' } )}
            color="#f59e0b"
          />
        </Box>

        <ApiPerformanceChart />
      </Box>

      {/* Last Updated */}
      {health && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          {t('system-monitoring.actions.lastUpdated', {
            defaultValue: 'تم التحديث في',
            time: new Date(health.lastUpdated).toLocaleString('ar-YE'),
          })}
        </Typography>
      )}
    </Box>
  );
}

