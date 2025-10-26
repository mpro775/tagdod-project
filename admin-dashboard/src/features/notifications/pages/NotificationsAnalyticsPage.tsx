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
  Alert
} from '@mui/material';
import { 
  Notifications,
  Send,
  Error,
  Schedule,
  Visibility,
  TrendingUp
} from '@mui/icons-material';
import { useNotificationStats } from '../hooks/useNotifications';

export const NotificationsAnalyticsPage: React.FC = () => {
  const { data: stats, isLoading, error } = useNotificationStats();

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>جاري تحميل الإحصائيات...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          حدث خطأ في تحميل الإحصائيات
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          لا توجد بيانات متاحة
        </Alert>
      </Box>
    );
  }

  const channelLabels = {
    inapp: 'داخل التطبيق',
    push: 'إشعار دفع',
    sms: 'رسالة نصية',
    email: 'بريد إلكتروني'
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        إحصائيات الإشعارات
      </Typography>

      {/* Main Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Notifications color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{safeStats.total}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                إجمالي التنبيهات
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Send color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success.main">{safeStats.sent}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                مرسل بنجاح
              </Typography>
              <Typography variant="caption" color="success.main">
                {successRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="warning.main">{safeStats.queued}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                قيد الانتظار
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" color="error.main">{safeStats.failed}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                فشل في الإرسال
              </Typography>
              <Typography variant="caption" color="error.main">
                {failureRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Visibility color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" color="info.main">{safeStats.read}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                تم القراءة
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{safeStats.recent24h}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                آخر 24 ساعة
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Channel Distribution */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              توزيع التنبيهات حسب القناة
            </Typography>
            
            {Object.keys(safeStats.byChannel).length > 0 ? (
              <List>
                {Object.entries(safeStats.byChannel).map(([channel, count], index) => (
                  <React.Fragment key={channel}>
                    <ListItem>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        {getChannelIcon(channel)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {channelLabels[channel as keyof typeof channelLabels] || channel}
                            </Typography>
                            <Chip 
                              label={count} 
                              size="small" 
                              color={getChannelColor(channel) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {safeStats.total > 0 ? ((count as number / safeStats.total) * 100).toFixed(1) : 0}% من إجمالي التنبيهات
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < Object.keys(safeStats.byChannel).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                لا توجد بيانات متاحة لتوزيع القنوات
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ملخص الأداء
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                معدل النجاح
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'success.main', 
                      height: '100%', 
                      borderRadius: 1,
                      width: `${successRate}%`
                    }} 
                  />
                </Box>
                <Typography variant="body2" color="success.main">
                  {successRate}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                معدل الفشل
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexGrow: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'error.main', 
                      height: '100%', 
                      borderRadius: 1,
                      width: `${failureRate}%`
                    }} 
                  />
                </Box>
                <Typography variant="body2" color="error.main">
                  {failureRate}%
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                إحصائيات إضافية
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">متوسط التنبيهات يومياً:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {safeStats.recent24h}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">التنبيهات المقروءة:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {safeStats.read} ({safeStats.total > 0 ? ((safeStats.read / safeStats.total) * 100).toFixed(1) : 0}%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">التنبيهات المعلقة:</Typography>
                  <Typography variant="body2" fontWeight="medium">
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
