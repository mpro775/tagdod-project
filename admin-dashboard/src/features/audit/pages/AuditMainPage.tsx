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

export const AuditMainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const { stats, isLoading } = useAuditStats();

  const quickStats = [
    {
      title: 'إجمالي السجلات',
      value: stats?.totalLogs || 0,
      icon: DatabaseIcon,
      color: 'primary',
    },
    {
      title: 'العمليات الحساسة',
      value: stats?.sensitiveLogs || 0,
      icon: AlertTriangleIcon,
      color: 'error',
    },
    {
      title: 'الإجراءات الإدارية',
      value: stats?.adminActions || 0,
      icon: SettingsIcon,
      color: 'secondary',
    },
    {
      title: 'أحداث المصادقة',
      value: stats?.authEvents || 0,
      icon: KeyIcon,
      color: 'success',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h3" fontWeight="bold">
            نظام التدقيق
          </Typography>
          <Typography variant="body1" color="text.secondary">
            مراقبة وتتبع جميع العمليات في النظام
          </Typography>
        </Box>
        <Button variant="outlined" size="small" startIcon={<SettingsIcon />}>
          الإعدادات
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2}>
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card sx={{ '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.3s' }}>
                <CardHeader
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Paper sx={{ p: 1, borderRadius: '50%', bgcolor: `${stat.color}.light` }}>
                    <Icon sx={{ color: `${stat.color}.main` }} />
                  </Paper>
                </CardHeader>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {isLoading ? '...' : stat.value.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.title === 'العمليات الحساسة' && stats?.totalLogs
                      ? `${Math.round((stat.value / stats.totalLogs) * 100)}% من إجمالي العمليات`
                      : 'آخر تحديث'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Main Content Tabs */}
      <Box>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="logs" icon={<FileTextIcon />} iconPosition="start" label="سجلات التدقيق" />
            <Tab
              value="analytics"
              icon={<BarChartIcon />}
              iconPosition="start"
              label="التحليلات والإحصائيات"
            />
          </Box>
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 'logs' && <AuditLogsPage />}
          {activeTab === 'analytics' && <AuditAnalyticsPage />}
        </Box>
      </Box>

      {/* System Status */}
      <Card>
        <CardHeader>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon />
            حالة نظام التدقيق
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
                    النظام نشط
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    جميع العمليات يتم تسجيلها
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
                    آخر تحديث
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
                    المستخدمون النشطون
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.authEvents || 0} حدث مصادقة
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
