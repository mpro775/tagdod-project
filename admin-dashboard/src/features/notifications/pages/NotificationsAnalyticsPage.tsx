import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Alert,
  useTheme,
  CircularProgress
} from '@mui/material';
import { 
  Notifications,
  Send,
  Error,
  Schedule,
  Visibility,
  TrendingUp,
  TouchApp,
  ShoppingCart,
  Queue,
  Analytics
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useNotificationStats, useAdvancedAnalytics, useQueueStats } from '../hooks/useNotifications';

export const NotificationsAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const { data: stats, isLoading, error } = useNotificationStats();
  const { data: advancedAnalytics, isLoading: isLoadingAnalytics } = useAdvancedAnalytics();
  const { data: queueStats } = useQueueStats();

  if (isLoading) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 3 }}>
        <Typography variant={isMobile ? 'body1' : 'h6'}>
          {t('analytics.loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 3 }}>
        <Alert severity="error">
          {t('analytics.loadError')}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: isMobile ? 1.5 : 3 }}>
        <Alert severity="info">
          {t('analytics.noData')}
        </Alert>
      </Box>
    );
  }

  const channelLabels = {
    inapp: t('analytics.channels.inapp'),
    push: t('analytics.channels.push'),
    sms: t('analytics.channels.sms'),
    email: t('analytics.channels.email')
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'inapp': return <Notifications />;
      case 'push': return <Send />;
      case 'sms': return <Send />;
      case 'email': return <Send />;
      default: return <Notifications />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'inapp': return 'primary';
      case 'push': return 'success';
      case 'sms': return 'warning';
      case 'email': return 'info';
      default: return 'default';
    }
  };

  // معالجة البيانات بأمان
  const safeStats = {
    total: stats?.total || 0,
    sent: stats?.sent || 0,
    failed: stats?.failed || 0,
    queued: stats?.queued || 0,
    read: stats?.read || 0,
    recent24h: stats?.recent24h || 0,
    byChannel: stats?.byChannel || {},
    byType: stats?.byType || {},
    byStatus: stats?.byStatus || {},
    byCategory: stats?.byCategory || {},
    unreadCount: stats?.unreadCount || 0,
    readRate: stats?.readRate || 0,
    deliveryRate: stats?.deliveryRate || 0,
  };

  const successRate = safeStats.total > 0 ? ((safeStats.sent / safeStats.total) * 100).toFixed(1) : 0;
  const failureRate = safeStats.total > 0 ? ((safeStats.failed / safeStats.total) * 100).toFixed(1) : 0;

  return (
    <Box sx={{ p: isMobile ? 1.5 : 3 }}>
      <Typography 
        variant={isMobile ? 'h5' : 'h4'} 
        sx={{ 
          mb: isMobile ? 2 : 3,
          fontSize: isMobile ? '1.5rem' : undefined
        }}
      >
        {t('analytics.title')}
      </Typography>

      {/* Main Statistics */}
      <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <Notifications color="primary" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'}
                  sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                >
                  {safeStats.total}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
              >
                {t('analytics.total')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <Send color="success" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'} 
                  color="success.main"
                  sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                >
                  {safeStats.sent}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
              >
                {t('analytics.sent')}
              </Typography>
              <Typography 
                variant="caption" 
                color="success.main"
                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
              >
                {successRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <Schedule color="warning" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'} 
                  color="warning.main"
                  sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                >
                  {safeStats.queued}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
              >
                {t('analytics.queued')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <Error color="error" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'} 
                  color="error.main"
                  sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                >
                  {safeStats.failed}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
              >
                {t('analytics.failed')}
              </Typography>
              <Typography 
                variant="caption" 
                color="error.main"
                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
              >
                {failureRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <Visibility color="info" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'} 
                  color="info.main"
                  sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                >
                  {safeStats.read}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
              >
                {t('analytics.read')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <TrendingUp color="primary" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'}
                  sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                >
                  {safeStats.recent24h}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
              >
                {t('analytics.recent24h')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Channel Distribution */}
      <Grid container spacing={isMobile ? 1.5 : 3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            sx={{ 
              p: isMobile ? 2 : 3,
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
            }}
          >
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              sx={{ 
                mb: isMobile ? 1.5 : 2,
                fontSize: isMobile ? '1rem' : undefined,
                fontWeight: 600
              }}
            >
              {t('analytics.channelDistribution')}
            </Typography>
            
            {Object.keys(safeStats.byChannel).length > 0 ? (
              <List sx={{ pt: 0 }}>
                {Object.entries(safeStats.byChannel).map(([channel, count], index) => (
                  <React.Fragment key={channel}>
                    <ListItem 
                      sx={{ 
                        px: isMobile ? 0 : 2,
                        py: isMobile ? 1 : 1.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: isMobile ? 1 : 2 }}>
                        {getChannelIcon(channel)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            flexWrap: isMobile ? 'wrap' : 'nowrap'
                          }}>
                            <Typography 
                              variant={isMobile ? 'body2' : 'body1'}
                              sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                            >
                              {channelLabels[channel as keyof typeof channelLabels] || channel}
                            </Typography>
                            <Chip 
                              label={count} 
                              size={isMobile ? 'small' : 'medium'}
                              color={getChannelColor(channel) as any}
                              sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.75rem' : undefined, mt: 0.5 }}
                          >
                            {safeStats.total > 0 ? ((count as number / safeStats.total) * 100).toFixed(1) : 0}% {t('analytics.percentageOfTotal')}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < Object.keys(safeStats.byChannel).length - 1 && (
                      <Divider 
                        sx={{ 
                          ml: isMobile ? 0 : 4,
                          opacity: theme.palette.mode === 'dark' ? 0.3 : 0.5
                        }} 
                      />
                    )}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                {t('analytics.noChannelData')}
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            sx={{ 
              p: isMobile ? 2 : 3,
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
            }}
          >
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              sx={{ 
                mb: isMobile ? 1.5 : 2,
                fontSize: isMobile ? '1rem' : undefined,
                fontWeight: 600
              }}
            >
              {t('analytics.performanceSummary')}
            </Typography>
            
            <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
              >
                {t('analytics.successRate')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'grey.200', 
                    borderRadius: 1, 
                    height: isMobile ? 6 : 8 
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: 'success.main', 
                      height: '100%', 
                      borderRadius: 1,
                      width: `${successRate}%`,
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  color="success.main"
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : undefined,
                    minWidth: isMobile ? '35px' : '40px',
                    textAlign: 'right'
                  }}
                >
                  {successRate}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
              >
                {t('analytics.failureRate')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'grey.200', 
                    borderRadius: 1, 
                    height: isMobile ? 6 : 8 
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: 'error.main', 
                      height: '100%', 
                      borderRadius: 1,
                      width: `${failureRate}%`,
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  color="error.main"
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : undefined,
                    minWidth: isMobile ? '35px' : '40px',
                    textAlign: 'right'
                  }}
                >
                  {failureRate}%
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: isMobile ? 1.5 : 2 }} />

            <Box>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
              >
                {t('analytics.additionalStats')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                  >
                    {t('analytics.dailyAverage')}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                  >
                    {safeStats.recent24h}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                  >
                    {t('analytics.readNotifications')}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                  >
                    {safeStats.read} ({safeStats.total > 0 ? ((safeStats.read / safeStats.total) * 100).toFixed(1) : 0}%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                  >
                    {t('analytics.pendingNotifications')}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
                  >
                    {safeStats.queued}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Advanced Analytics Section */}
      {advancedAnalytics && (
        <>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            sx={{ 
              mt: isMobile ? 3 : 4,
              mb: isMobile ? 2 : 3,
              fontSize: isMobile ? '1.25rem' : undefined,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Analytics color="primary" />
            {t('analytics.advancedAnalytics', 'تحليلات متقدمة')}
          </Typography>

          <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
            {/* CTR Card */}
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
                border: `1px solid ${theme.palette.info.main}30`
              }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TouchApp color="info" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      color="info.main"
                      sx={{ fontWeight: 600 }}
                    >
                      {advancedAnalytics.overview?.overallCTR?.toFixed(1) || '0'}%
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('analytics.clickThroughRate', 'معدل النقر (CTR)')}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="info.main"
                    sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}
                  >
                    {advancedAnalytics.overview?.totalClicked || 0} / {advancedAnalytics.overview?.totalOpened || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Open Rate Card */}
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
                border: `1px solid ${theme.palette.success.main}30`
              }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Visibility color="success" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      color="success.main"
                      sx={{ fontWeight: 600 }}
                    >
                      {advancedAnalytics.overview?.overallOpenRate?.toFixed(1) || '0'}%
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('analytics.openRate', 'معدل الفتح')}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="success.main"
                    sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}
                  >
                    {advancedAnalytics.overview?.totalOpened || 0} / {advancedAnalytics.overview?.totalDelivered || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Conversion Rate Card */}
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}05 100%)`,
                border: `1px solid ${theme.palette.warning.main}30`
              }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShoppingCart color="warning" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      color="warning.main"
                      sx={{ fontWeight: 600 }}
                    >
                      {advancedAnalytics.overview?.overallConversionRate?.toFixed(1) || '0'}%
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('analytics.conversionRate', 'معدل التحويل')}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="warning.main"
                    sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}
                  >
                    {advancedAnalytics.overview?.totalConverted || 0} {t('analytics.conversions', 'تحويل')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Delivery Rate Card */}
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Card sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
                border: `1px solid ${theme.palette.primary.main}30`
              }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Send color="primary" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      color="primary.main"
                      sx={{ fontWeight: 600 }}
                    >
                      {advancedAnalytics.overview?.overallDeliveryRate?.toFixed(1) || '0'}%
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('analytics.deliveryRate', 'معدل التوصيل')}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="primary.main"
                    sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}
                  >
                    {advancedAnalytics.overview?.totalDelivered || 0} / {advancedAnalytics.overview?.totalSent || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Performing Types */}
          {advancedAnalytics.topPerformingTypes && advancedAnalytics.topPerformingTypes.length > 0 && (
            <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
              <Grid size={{ xs: 12 }}>
                <Paper 
                  sx={{ 
                    p: isMobile ? 2 : 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
                  }}
                >
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    sx={{ 
                      mb: isMobile ? 1.5 : 2,
                      fontSize: isMobile ? '1rem' : undefined,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <TrendingUp color="primary" />
                    {t('analytics.topPerformingTypes', 'أفضل أنواع الإشعارات أداءً')}
                  </Typography>

                  <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, minmax(120px, 1fr))',
                      gap: 2,
                      minWidth: 600
                    }}>
                      {advancedAnalytics.topPerformingTypes.slice(0, 5).map((type, index) => (
                        <Box 
                          key={type.category}
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight="medium"
                            sx={{ mb: 1, textTransform: 'capitalize' }}
                          >
                            #{index + 1} {type.category.replace(/_/g, ' ')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              CTR: <strong style={{ color: theme.palette.info.main }}>{type.ctr?.toFixed(1) || 0}%</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Open: <strong style={{ color: theme.palette.success.main }}>{type.openRate?.toFixed(1) || 0}%</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Sent: <strong>{type.sent || 0}</strong>
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {isLoadingAnalytics && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {/* Queue Stats Section */}
      {queueStats && (
        <Grid container spacing={isMobile ? 1.5 : 3}>
          <Grid size={{ xs: 12 }}>
            <Paper 
              sx={{ 
                p: isMobile ? 2 : 3,
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
              }}
            >
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'} 
                sx={{ 
                  mb: isMobile ? 1.5 : 2,
                  fontSize: isMobile ? '1rem' : undefined,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Queue color="primary" />
                {t('analytics.queueStats', 'إحصائيات الطوابير')}
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {t('analytics.sendQueue', 'طابور الإرسال')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip label={`انتظار: ${queueStats.send?.waiting || 0}`} size="small" />
                      <Chip label={`نشط: ${queueStats.send?.active || 0}`} size="small" color="primary" />
                      <Chip label={`مكتمل: ${queueStats.send?.completed || 0}`} size="small" color="success" />
                      <Chip label={`فشل: ${queueStats.send?.failed || 0}`} size="small" color="error" />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      {t('analytics.scheduledQueue', 'طابور المجدول')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip label={`انتظار: ${queueStats.scheduled?.waiting || 0}`} size="small" />
                      <Chip label={`مؤجل: ${queueStats.scheduled?.delayed || 0}`} size="small" color="warning" />
                      <Chip label={`مكتمل: ${queueStats.scheduled?.completed || 0}`} size="small" color="success" />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      {t('analytics.retryQueue', 'طابور إعادة المحاولة')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip label={`انتظار: ${queueStats.retry?.waiting || 0}`} size="small" />
                      <Chip label={`نشط: ${queueStats.retry?.active || 0}`} size="small" color="primary" />
                      <Chip label={`مؤجل: ${queueStats.retry?.delayed || 0}`} size="small" color="warning" />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: 2,
                    bgcolor: theme.palette.primary.main + '10',
                    borderRadius: 2
                  }}>
                    <Typography variant="h6" color="primary">
                      {t('analytics.totalPending', 'إجمالي المعلق')}: {queueStats.totalPending || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
