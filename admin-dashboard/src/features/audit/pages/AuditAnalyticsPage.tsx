import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Select,
  MenuItem,
  Box,
  Grid,
  FormControl,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  TrendingUp,
  CalendarMonth as CalendarIcon,
  Download,
  Refresh as RefreshIcon,
  Shield,
  Warning as AlertTriangleIcon,
  Work as ActivityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { AuditStatsCards, AuditLogsTable } from '../components';
import { useAuditStats, useAuditLogs, useAuditExport } from '../hooks/useAudit';
import toast from 'react-hot-toast';

export const AuditAnalyticsPage: React.FC = () => {
  const { t } = useTranslation('audit');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false);

  const {
    stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useAuditStats(dateRange.startDate, dateRange.endDate);

  const { logs, isLoading: logsLoading } = useAuditLogs({
    isSensitive: showSensitiveOnly || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 10,
  });

  const { exportLogs, isExporting } = useAuditExport();

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }

    setDateRange({
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  };

  const handleExport = async () => {
    try {
      await exportLogs({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        isSensitive: showSensitiveOnly || undefined,
      });
    } catch (error) {
      toast.error(t('messages.exportFailed'));
    }
  };

  const handleRefresh = () => {
    refetchStats();
  };

  const getPeriodLabel = (period: string) => {
    return t(`analytics.periods.${period}`, { defaultValue: t('analytics.periods.week') });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            {t('analytics.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('analytics.subtitle')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            '& > button': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            fullWidth={isSmallScreen}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            {t('buttons.refresh')}
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={isExporting}
            startIcon={<Download />}
            fullWidth={isSmallScreen}
            size={isSmallScreen ? 'small' : 'medium'}
          >
            {isExporting ? t('messages.exporting') : t('analytics.exportReport')}
          </Button>
        </Box>
      </Box>

      {/* Controls */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon />
                {t('analytics.timePeriod')}
              </Typography>
            </CardHeader>
            <CardContent>
              <FormControl fullWidth>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  size="small"
                >
                  <MenuItem value="today">{t('analytics.periods.today')}</MenuItem>
                  <MenuItem value="week">{t('analytics.periods.week')}</MenuItem>
                  <MenuItem value="month">{t('analytics.periods.month')}</MenuItem>
                  <MenuItem value="quarter">{t('analytics.periods.quarter')}</MenuItem>
                  <MenuItem value="year">{t('analytics.periods.year')}</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangleIcon />
                {t('analytics.logType')}
              </Typography>
            </CardHeader>
            <CardContent>
              <FormControl fullWidth>
                <Select
                  value={showSensitiveOnly ? 'sensitive' : 'all'}
                  onChange={(e) => setShowSensitiveOnly(e.target.value === 'sensitive')}
                  size="small"
                >
                  <MenuItem value="all">{t('analytics.allLogs')}</MenuItem>
                  <MenuItem value="sensitive">{t('analytics.sensitiveOnly')}</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ActivityIcon />
                {t('analytics.periodSummary')}
              </Typography>
            </CardHeader>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {getPeriodLabel(selectedPeriod)}
              </Typography>
              {dateRange.startDate && dateRange.endDate && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {format(new Date(dateRange.startDate), 'dd/MM/yyyy', { locale: ar })} -{' '}
                  {format(new Date(dateRange.endDate), 'dd/MM/yyyy', { locale: ar })}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <AuditStatsCards stats={stats} isLoading={statsLoading} />

      {/* Charts Section */}
      <Grid container spacing={2}>
        {/* Activity Overview */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart />
                {t('analytics.activityOverview')}
              </Typography>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                      <Box sx={{ width: '30%', height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
                    </Box>
                  ))}
                </Box>
              ) : stats ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.totalOperations')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats.totalLogs.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.sensitiveOperations')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {stats.sensitiveLogs.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.permissionChanges')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'warning.main' }}>
                      {stats.permissionChanges.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.adminActions')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'secondary.main' }}>
                      {stats.adminActions.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ActivityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
                    {t('analytics.noData')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('analytics.noDataDesc')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Overview */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield />
                {t('analytics.securityOverview')}
              </Typography>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                      <Box sx={{ width: '30%', height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
                    </Box>
                  ))}
                </Box>
              ) : stats ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.authEvents')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {stats.authEvents.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.roleChanges')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'secondary.main' }}>
                      {stats.roleChanges.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.capabilityDecisions')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {stats.capabilityDecisions.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ flex: '1 1 auto', minWidth: { xs: '100%', sm: 'auto' } }}>
                      {t('analytics.sensitivityRate')}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'warning.main' }}>
                      {stats.totalLogs > 0
                        ? Math.round((stats.sensitiveLogs / stats.totalLogs) * 100)
                        : 0}
                      %
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Shield sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
                    {t('analytics.noData')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('analytics.noSecurityDataDesc')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            {t('analytics.recentActivity')}
          </Typography>
        </CardHeader>
        <CardContent sx={{ overflowX: 'auto' }}>
          <AuditLogsTable logs={logs} isLoading={logsLoading} onViewDetails={() => {}} />
        </CardContent>
      </Card>
    </Box>
  );
};
