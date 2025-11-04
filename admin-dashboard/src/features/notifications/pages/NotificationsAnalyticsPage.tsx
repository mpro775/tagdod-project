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
  useTheme
} from '@mui/material';
import { 
  Notifications,
  Send,
  Error,
  Schedule,
  Visibility,
  TrendingUp
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useNotificationStats } from '../hooks/useNotifications';

export const NotificationsAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const { data: stats, isLoading, error } = useNotificationStats();

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
    </Box>
  );
};
