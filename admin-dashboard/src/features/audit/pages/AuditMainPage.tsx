import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Grid,
  Paper,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Security as ShieldIcon,
  BarChart as BarChartIcon,
  Description as FileTextIcon,
  Settings as SettingsIcon,
  Warning as AlertTriangleIcon,
  AutoAwesome as ActivityIcon,
  People as UsersIcon,
  VpnKey as KeyIcon,
  Storage as DatabaseIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';
import { AuditLogsPage } from './AuditLogsPage';
import { AuditAnalyticsPage } from './AuditAnalyticsPage';
import { useAuditStats } from '../hooks/useAudit';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

export const AuditMainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const { stats, isLoading } = useAuditStats();
  const { t } = useTranslation('audit');
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const quickStats = [
    {
      title: t('stats.totalLogs'),
      value: stats?.totalLogs || 0,
      icon: DatabaseIcon,
      color: 'primary',
    },
    {
      title: t('stats.sensitiveLogs'),
      value: stats?.sensitiveLogs || 0,
      icon: AlertTriangleIcon,
      color: 'error',
    },
    {
      title: t('stats.adminActions'),
      value: stats?.adminActions || 0,
      icon: SettingsIcon,
      color: 'secondary',
    },
    {
      title: t('stats.authEvents'),
      value: stats?.authEvents || 0,
      icon: KeyIcon,
      color: 'success',
    },
  ];

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
      {/* Header - Enhanced Responsive */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        justifyContent: 'space-between',
        gap: { xs: 1.5, sm: 2 },
        pb: { xs: 2, sm: 0 },
        borderBottom: { xs: '1px solid', sm: 'none' },
        borderColor: { xs: 'divider', sm: 'transparent' },
      }}>
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Typography 
            variant="h4" 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
              mb: { xs: 0.5, sm: 1 },
              lineHeight: 1.2,
            }}
          >
            {t('audit.title')}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              display: { xs: 'none', sm: 'block' },
              lineHeight: 1.4,
            }}
          >
            {t('audit.subtitle')}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          size={isMobile ? 'medium' : 'small'} 
          startIcon={<SettingsIcon />}
          fullWidth={isMobile}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: 'auto', sm: 120 },
          }}
        >
          {t('audit.settings')}
        </Button>
      </Box>

      {/* Quick Stats - Enhanced Responsive */}
      {isLoading ? (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 6, sm: 6, lg: 3 }} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid size={{ xs: 6, sm: 6, lg: 3 }} key={index}>
                <Card sx={{ 
                  height: '100%',
                  '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }, 
                  transition: 'all 0.3s ease',
                  borderLeft: `3px solid`,
                  borderLeftColor: `${stat.color}.main`,
                }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: { xs: 1, sm: 1.5 },
                    }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                          fontWeight: 500,
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Paper sx={{ 
                        p: { xs: 0.75, sm: 1 }, 
                        borderRadius: '50%', 
                        bgcolor: `${stat.color}.light`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon sx={{ 
                          color: `${stat.color}.main`,
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                        }} />
                      </Paper>
                    </Box>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                        mb: 0.5,
                        color: `${stat.color}.main`,
                      }}
                    >
                      {stat.value.toLocaleString()}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                        display: 'block',
                      }}
                    >
                      {stat.title === t('stats.sensitiveLogs') && stats?.totalLogs
                        ? `${Math.round((stat.value / stats.totalLogs) * 100)}% ${t('audit.ofTotalOperations')}`
                        : t('audit.lastUpdate')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Main Content Tabs - Enhanced Responsive */}
      <Box>
        <Paper sx={{ mb: { xs: 2, sm: 3 }, overflowX: 'auto' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, value) => setActiveTab(value)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                minHeight: { xs: 48, sm: 64 },
                px: { xs: 1.5, sm: 2 },
              },
            }}
          >
            <Tab 
              value="logs" 
              icon={<FileTextIcon />} 
              iconPosition="start" 
              label={t('audit.logs')}
              sx={{ 
                '& .MuiTab-iconWrapper': {
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                },
              }}
            />
            <Tab
              value="analytics"
              icon={<BarChartIcon />}
              iconPosition="start"
              label={t('audit.analytics')}
              sx={{ 
                '& .MuiTab-iconWrapper': {
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                },
              }}
            />
          </Tabs>
        </Paper>

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          {activeTab === 'logs' && <AuditLogsPage />}
          {activeTab === 'analytics' && <AuditAnalyticsPage />}
        </Box>
      </Box>

      {/* System Status */}
      <Card>
        <CardHeader>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon />
            {t('audit.status')}  
          </Typography>
        </CardHeader>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Paper sx={{ p: 1, borderRadius: '50%', bgcolor: 'success.light' }}>
                  <ActivityIcon sx={{ color: 'success.main' }} />
                </Paper>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {t('audit.active')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('audit.allOperationsLogged')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Paper sx={{ p: 1, borderRadius: '50%', bgcolor: 'primary.light' }}>
                  <ClockIcon sx={{ color: 'primary.main' }} />
                </Paper>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {t('audit.lastUpdate')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date().toLocaleString('ar-SA')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Paper sx={{ p: 1, borderRadius: '50%', bgcolor: 'secondary.light' }}>
                  <UsersIcon sx={{ color: 'secondary.main' }} />
                </Paper>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {t('audit.activeUsers')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.authEvents || 0} {t('stats.authEvents')}  
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
