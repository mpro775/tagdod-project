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
  useTheme,
  useMediaQuery,
  Stack,
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
  const { t } = useTranslation('system-monitoring');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      toast.error(t('messages.error.loadFailed'));
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
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: { xs: 300, sm: 400 },
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress 
          size={isMobile ? 40 : 48} 
          sx={{ mb: 2 }} 
        />
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {t('loading.message')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        bgcolor: 'background.default',
        minHeight: '100vh',
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          mb: { xs: 2, sm: 3, md: 4 },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="bold" 
            gutterBottom
            sx={{ color: 'text.primary', mb: { xs: 0.5, sm: 1 } }}
          >
            {t('navigation.title')}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {t('navigation.subtitle')}
          </Typography>
        </Box>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            fullWidth={isMobile}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {autoRefresh ? t('actions.disableAutoRefresh') : t('actions.enableAutoRefresh')}
          </Button>
          <Button
            variant="contained"
            size={isMobile ? 'small' : 'medium'}
            onClick={fetchData}
            disabled={loading}
            startIcon={<Refresh />}
            fullWidth={isMobile}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('actions.refresh')}
          </Button>
        </Stack>
      </Box>

      {/* System Status */}
      {health && (
        <Card 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            bgcolor: 'background.paper',
            boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
          }}
        >
          <CardHeader
            sx={{ 
              pb: { xs: 1, sm: 2 },
              px: { xs: 2, sm: 3 },
              pt: { xs: 2, sm: 3 },
            }}
            title={
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Box>
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    fontWeight="bold"
                    sx={{ color: 'text.primary' }}
                  >
                    {t('systemHealth.title')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('systemHealth.subtitle')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(health.status),
                      flexShrink: 0,
                    }}
                  />
                  <Chip
                    label={t(`systemHealth.status.${health.status}`)}
                    color={health.status === 'healthy' ? 'success' : health.status === 'warning' ? 'warning' : 'error'}
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Box>
              </Box>
            }
          />
          <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {t('systemHealth.metrics.uptime')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h6' : 'h5'} 
                  fontWeight="bold"
                  sx={{ color: 'text.primary' }}
                >
                  {formatUptime(health.uptime)}
                </Typography>
              </Grid>

              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {t('systemHealth.metrics.avgResponseTime')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h6' : 'h5'} 
                  fontWeight="bold"
                  sx={{ color: 'text.primary' }}
                >
                  {t('systemHealth.units.milliseconds', {
                    value: health.avgApiResponseTime.toFixed(2),
                  })}
                </Typography>
              </Grid>

              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {t('systemHealth.metrics.errorRate')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h6' : 'h5'} 
                  fontWeight="bold" 
                  sx={{ color: getUsageColor(health.errorRate) }}
                >
                  {t('systemHealth.units.percentage', {
                    value: health.errorRate.toFixed(2),
                  })}
                </Typography>
              </Grid>

              <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {t('systemHealth.metrics.activeRequests')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h6' : 'h5'} 
                  fontWeight="bold"
                  sx={{ color: 'text.primary' }}
                >
                  {health.activeRequests}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              mb: { xs: 2, sm: 3 },
              overflowX: 'auto',
              '& .MuiTabs-root': {
                minHeight: { xs: 48, sm: 48 },
              },
              '& .MuiTab-root': {
                minWidth: { xs: 100, sm: 140 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
              allowScrollButtonsMobile={isMobile}
              sx={{
                '& .MuiTabs-indicator': {
                  bgcolor: 'primary.main',
                  height: 3,
                },
                '& .MuiTab-root': {
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                },
              }}
            >
              <Tab 
                icon={isMobile ? <Speed fontSize="small" /> : <Speed />} 
                iconPosition="start" 
                label={t('tabs.resources')}
              />
              <Tab 
                icon={isMobile ? <Storage fontSize="small" /> : <Storage />} 
                iconPosition="start" 
                label={t('tabs.database')}
              />
              <Tab 
                icon={isMobile ? <Cloud fontSize="small" /> : <Cloud />} 
                iconPosition="start" 
                label={t('tabs.cache')}
              />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* CPU */}
              <Grid component="div" size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                    height: '100%',
                  }}
                >
                  <CardHeader
                    sx={{ 
                      pb: { xs: 1, sm: 2 },
                      px: { xs: 2, sm: 3 },
                      pt: { xs: 2, sm: 3 },
                    }}
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant={isMobile ? 'body2' : 'body1'} 
                          fontWeight="medium"
                          sx={{ color: 'text.primary' }}
                        >
                          {t('resources.cpu.title')}
                        </Typography>
                        <Speed 
                          color="action" 
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      </Box>
                    }
                  />
                  <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant={isMobile ? 'h5' : 'h4'} 
                      fontWeight="bold" 
                      sx={{ color: getUsageColor(resources.cpu.usage) }}
                    >
                      {resources.cpu.usage.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={resources.cpu.usage}
                        color={getProgressColor(resources.cpu.usage)}
                        sx={{ height: { xs: 6, sm: 8 }, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {t('resources.cpu.cores', {
                        count: resources.cpu.cores,
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Memory */}
              <Grid component="div" size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                    height: '100%',
                  }}
                >
                  <CardHeader
                    sx={{ 
                      pb: { xs: 1, sm: 2 },
                      px: { xs: 2, sm: 3 },
                      pt: { xs: 2, sm: 3 },
                    }}
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant={isMobile ? 'body2' : 'body1'} 
                          fontWeight="medium"
                          sx={{ color: 'text.primary' }}
                        >
                          {t('resources.memory.title')}
                        </Typography>
                        <Memory 
                          color="action" 
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      </Box>
                    }
                  />
                  <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant={isMobile ? 'h5' : 'h4'} 
                      fontWeight="bold" 
                      sx={{ color: getUsageColor(resources.memory.usagePercentage) }}
                    >
                      {resources.memory.usagePercentage.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={resources.memory.usagePercentage}
                        color={getProgressColor(resources.memory.usagePercentage)}
                        sx={{ height: { xs: 6, sm: 8 }, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {t('resources.memory.usage', {
                        used: formatBytes(resources.memory.used),
                        total: formatBytes(resources.memory.total),
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Disk */}
              <Grid component="div" size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                    height: '100%',
                  }}
                >
                  <CardHeader
                    sx={{ 
                      pb: { xs: 1, sm: 2 },
                      px: { xs: 2, sm: 3 },
                      pt: { xs: 2, sm: 3 },
                    }}
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant={isMobile ? 'body2' : 'body1'} 
                          fontWeight="medium"
                          sx={{ color: 'text.primary' }}
                        >
                          {t('resources.disk.title')}
                        </Typography>
                        <Storage 
                          color="action" 
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      </Box>
                    }
                  />
                  <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                    <Typography 
                      variant={isMobile ? 'h5' : 'h4'} 
                      fontWeight="bold" 
                      sx={{ color: getUsageColor(resources.disk.usagePercentage) }}
                    >
                      {resources.disk.usagePercentage.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={resources.disk.usagePercentage}
                        color={getProgressColor(resources.disk.usagePercentage)}
                        sx={{ height: { xs: 6, sm: 8 }, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {t('resources.disk.usage', {
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
            <Card
              sx={{
                bgcolor: 'background.paper',
                boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              }}
            >
              <CardHeader
                sx={{ 
                  pb: { xs: 1, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  pt: { xs: 2, sm: 3 },
                }}
                title={
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    fontWeight="bold"
                    sx={{ color: 'text.primary' }}
                  >
                    {t('database.title')}
                  </Typography>
                }
              />
              <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('database.metrics.status')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {health.databaseStatus.connected ? (
                        <CheckCircle 
                          color="success" 
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      ) : (
                        <Cancel 
                          color="error" 
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      )}
                      <Typography 
                        variant="body1" 
                        fontWeight="medium"
                        sx={{ color: 'text.primary' }}
                      >
                        {t(`database.status.${health.databaseStatus.connected ? 'connected' : 'disconnected'}`)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('database.metrics.responseTime')}
                    </Typography>
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      fontWeight="bold"
                      sx={{ color: 'text.primary' }}
                    >
                      {t('database.units.milliseconds', {
                        value: health.databaseStatus.responseTime,
                      })}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('database.metrics.collections')}
                    </Typography>
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      fontWeight="bold"
                      sx={{ color: 'text.primary' }}
                    >
                      {health.databaseStatus.collections}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('database.metrics.totalSize')}
                    </Typography>
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      fontWeight="bold"
                      sx={{ color: 'text.primary' }}
                    >
                      {formatBytes(health.databaseStatus.totalSize)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && health && (
            <Card
              sx={{
                bgcolor: 'background.paper',
                boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              }}
            >
              <CardHeader
                sx={{ 
                  pb: { xs: 1, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  pt: { xs: 2, sm: 3 },
                }}
                title={
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    fontWeight="bold"
                    sx={{ color: 'text.primary' }}
                  >
                    {t('cache.title')}
                  </Typography>
                }
              />
              <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('cache.metrics.status')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {health.redisStatus.connected ? (
                        <CheckCircle 
                          color="success" 
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      ) : (
                        <Cancel 
                          color="error" 
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                      )}
                      <Typography 
                        variant="body1" 
                        fontWeight="medium"
                        sx={{ color: 'text.primary' }}
                      >
                        {t(`cache.status.${health.redisStatus.connected ? 'connected' : 'disconnected'}`)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('cache.metrics.responseTime')}
                    </Typography>
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      fontWeight="bold"
                      sx={{ color: 'text.primary' }}
                    >
                      {t('cache.units.milliseconds', {
                        value: health.redisStatus.responseTime,
                      })}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('cache.metrics.hitRate')}
                    </Typography>
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      fontWeight="bold" 
                      color="success.main"
                    >
                      {t('cache.units.percentage', {
                        value: health.redisStatus.hitRate.toFixed(1),
                      })}
                    </Typography>
                  </Grid>

                  <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {t('cache.metrics.memoryUsage')}
                    </Typography>
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      fontWeight="bold"
                      sx={{ color: 'text.primary' }}
                    >
                      {t('cache.units.percentage', {
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
      <Box sx={{ mt: { xs: 3, sm: 4 } }}>
        <Typography 
          variant={isMobile ? 'subtitle1' : 'h6'} 
          fontWeight="bold" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            color: 'text.primary',
          }}
        >
          {t('charts.title')}
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <MetricsChart
              metricType="cpu"
              title={t('charts.metrics.cpu')}
              color="#3b82f6"
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <MetricsChart
              metricType="memory"
              title={t('charts.metrics.memory')}
              color="#10b981"
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <MetricsChart
            metricType="disk"
            title={t('charts.metrics.disk')}
            color="#f59e0b"
          />
        </Box>

        <ApiPerformanceChart />
      </Box>

      {/* Last Updated */}
      {health && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ 
            mt: { xs: 3, sm: 4 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          {t('actions.lastUpdated', {
            time: new Date(health.lastUpdated).toLocaleString('ar-YE'),
          })}
        </Typography>
      )}
    </Box>
  );
}

