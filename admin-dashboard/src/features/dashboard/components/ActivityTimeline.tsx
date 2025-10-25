import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  ShoppingCart, 
  Person, 
  Inventory, 
  LocalOffer,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

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

}) => {
  const theme = useTheme();

  // Ensure recentOrders is an array
  const ordersList = Array.isArray(recentOrders) ? recentOrders : [];

  // Convert recent orders to activities
  const displayActivities: Activity[] = ordersList.slice(0, 5).map((order: any) => {
    const timeAgo = getTimeAgo(order.createdAt);
    return {
      id: order._id,
      type: 'order' as const,
      title: order.status === 'completed' ? 'طلب مكتمل' : 
             order.status === 'pending' ? 'طلب جديد' :
             order.status === 'cancelled' ? 'طلب ملغي' : 'طلب قيد المعالجة',
      description: `طلب #${order.orderNumber} بقيمة ${order.total?.toLocaleString('ar-SA')} ر.س`,
      time: timeAgo,
      status: order.status === 'completed' ? 'success' :
              order.status === 'cancelled' ? 'error' : 'warning',
    };
  });

  // Helper function to calculate time ago
  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'منذ لحظات';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
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

  if (displayActivities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            النشاط الأخير
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              لا توجد أنشطة حديثة
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
          النشاط الأخير
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

