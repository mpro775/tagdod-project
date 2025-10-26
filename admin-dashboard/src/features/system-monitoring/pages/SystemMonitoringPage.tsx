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
import { systemMonitoringApi } from '../api/systemMonitoringApi';
import type { SystemHealth, ResourceUsage } from '../api/systemMonitoringApi';
import { toast } from 'react-hot-toast';
import { formatBytes, formatUptime } from '@/shared/utils/format';
import { MetricsChart } from '../components/MetricsChart';
import { ApiPerformanceChart } from '../components/ApiPerformanceChart';

export function SystemMonitoringPage() {
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
      toast.error('فشل في تحميل بيانات المراقبة');
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
          جاري تحميل بيانات المراقبة...
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
            مراقبة النظام
          </Typography>
          <Typography variant="body1" color="text.secondary">
            مراقبة الأداء والموارد في الوقت الفعلي
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'إيقاف التحديث التلقائي' : 'تفعيل التحديث التلقائي'}
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={fetchData}
            disabled={loading}
            startIcon={<Refresh />}
          >
            تحديث
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
                    حالة النظام
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    نظرة عامة على صحة النظام
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
                    label={health.status === 'healthy' ? 'سليم' : health.status === 'warning' ? 'تحذير' : 'حرج'}
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
                  وقت التشغيل
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatUptime(health.uptime)}
                </Typography>
              </Grid>
              
              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  متوسط وقت الاستجابة
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {health.avgApiResponseTime.toFixed(2)}ms
                </Typography>
              </Grid>
              
              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  معدل الأخطاء
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: getUsageColor(health.errorRate) }}>
                  {health.errorRate.toFixed(2)}%
                </Typography>
              </Grid>
              
              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  الطلبات النشطة
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {health.activeRequests}
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
              <Tab icon={<Speed />} iconPosition="start" label="الموارد" />
              <Tab icon={<Storage />} iconPosition="start" label="قاعدة البيانات" />
              <Tab icon={<Cloud />} iconPosition="start" label="Cache" />
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
                          المعالج (CPU)
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
                      {resources.cpu.cores} نواة
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
                          الذاكرة (RAM)
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
                      {formatBytes(resources.memory.used)} / {formatBytes(resources.memory.total)}
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
                          القرص
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
                      {formatBytes(resources.disk.used)} / {formatBytes(resources.disk.total)}
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
                    MongoDB
                  </Typography>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      الحالة
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {health.databaseStatus.connected ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                      <Typography variant="body1" fontWeight="medium">
                        {health.databaseStatus.connected ? 'متصل' : 'غير متصل'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      وقت الاستجابة
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {health.databaseStatus.responseTime}ms
                    </Typography>
                  </Grid>
                  
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      عدد المجموعات
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {health.databaseStatus.collections}
                    </Typography>
                  </Grid>
                  
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      الحجم الإجمالي
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
                    Redis Cache
                  </Typography>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      الحالة
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {health.redisStatus.connected ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}
                      <Typography variant="body1" fontWeight="medium">
                        {health.redisStatus.connected ? 'متصل' : 'غير متصل'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      وقت الاستجابة
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {health.redisStatus.responseTime}ms
                    </Typography>
                  </Grid>
                  
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      معدل الإصابة
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {health.redisStatus.hitRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                  
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      استخدام الذاكرة
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {health.redisStatus.memoryUsage.toFixed(1)}%
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
          الرسوم البيانية - آخر 24 ساعة
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <MetricsChart 
              metricType="cpu" 
              title="استخدام المعالج (CPU)" 
              color="#3b82f6"
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <MetricsChart 
              metricType="memory" 
              title="استخدام الذاكرة (RAM)" 
              color="#10b981"
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <MetricsChart 
            metricType="disk" 
            title="استخدام القرص" 
            color="#f59e0b"
          />
        </Box>

        <ApiPerformanceChart />
      </Box>

      {/* Last Updated */}
      {health && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          آخر تحديث: {new Date(health.lastUpdated).toLocaleString('ar-YE')}
        </Typography>
      )}
    </Box>
  );
}

