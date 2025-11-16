import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Avatar,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import { 
  ShoppingCart, 
  Person, 
  Inventory, 
  LocalOffer,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Activity {
  id: string;
  type: 'order' | 'user' | 'product' | 'coupon';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'error' | 'warning';
}

interface ActivityTimelineProps {
  recentOrders?: any[];
  isLoading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  recentOrders,
  isLoading,
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['dashboard']);
  // Always use English numbers, regardless of language
  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // دائماً استخدام الدولار
        maximumFractionDigits: 0,
      }),
    []
  );

  // Ensure recentOrders is an array
  const ordersList = Array.isArray(recentOrders) ? recentOrders : [];

  // Convert recent orders to activities
  const displayActivities: Activity[] = ordersList.slice(0, 5).map((order: any) => {
    const timeAgo = getTimeAgo(order.createdAt);
    const normalizedStatus = (order.status || '').toLowerCase();
    const amountLabel = order.total !== undefined && order.total !== null
      ? currencyFormatter.format(order.total)
      : t('activityTimeline.amountPlaceholder', '—');
    return {
      id: order._id,
      type: 'order' as const,
      title: t(`activityTimeline.status.${normalizedStatus}`, getDefaultStatusTitle(normalizedStatus)),
      description: t('activityTimeline.description', 'طلب #{{number}} بقيمة {{amount}}', {
        number: order.orderNumber || (order._id || '').slice(-6),
        amount: amountLabel,
      }),
      time: timeAgo,
      status: normalizedStatus === 'completed' ? 'success' : normalizedStatus === 'cancelled' ? 'error' : 'warning',
    };
  });

  // Helper function to calculate time ago
  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return t('activityTimeline.time.justNow', 'منذ لحظات');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('activityTimeline.time.minutes', 'منذ {{count}} دقيقة', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('activityTimeline.time.hours', 'منذ {{count}} ساعة', { count: hours });
    const days = Math.floor(hours / 24);
    return t('activityTimeline.time.days', 'منذ {{count}} يوم', { count: days });
  }

  function getDefaultStatusTitle(status: string) {
    switch (status) {
      case 'completed':
        return 'طلب مكتمل';
      case 'pending':
        return 'طلب جديد';
      case 'cancelled':
        return 'طلب ملغي';
      default:
        return 'طلب قيد المعالجة';
    }
  }

  const getIcon = (type: Activity['type']) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (type) {
      case 'order': return <ShoppingCart {...iconProps} />;
      case 'user': return <Person {...iconProps} />;
      case 'product': return <Inventory {...iconProps} />;
      case 'coupon': return <LocalOffer {...iconProps} />;
      default: return <CheckCircle {...iconProps} />;
    }
  };

  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'order': return theme.palette.success.main;
      case 'user': return theme.palette.primary.main;
      case 'product': return theme.palette.warning.main;
      case 'coupon': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status?: Activity['status']) => {
    if (!status) return null;
    switch (status) {
      case 'success': return <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />;
      case 'error': return <Cancel sx={{ fontSize: 14, color: 'error.main' }} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('activityTimeline.title', 'النشاط الأخير')}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={14} />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (displayActivities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('activityTimeline.title', 'النشاط الأخير')}
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('activityTimeline.empty', 'لا توجد أنشطة حديثة')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t('activityTimeline.title', 'النشاط الأخير')}
        </Typography>

        <Box sx={{ position: 'relative', mt: 3 }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: 'absolute',
              right: 20,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          />

          {/* Activities */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {displayActivities.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  position: 'relative',
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: alpha(getColor(activity.type), 0.1),
                    color: getColor(activity.type),
                    zIndex: 1,
                  }}
                >
                  {getIcon(activity.type)}
                </Avatar>

                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateX(-4px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="600">
                      {activity.title}
                    </Typography>
                    {getStatusIcon(activity.status)}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    {activity.description}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

