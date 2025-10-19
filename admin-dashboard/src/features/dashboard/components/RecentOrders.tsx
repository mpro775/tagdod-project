import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  Avatar,
  IconButton,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import { Visibility } from '@mui/icons-material';

interface Order {
  id: string;
  orderNumber?: string;
  customer?: {
    name: string;
    avatar?: string;
  };
  total?: number;
  status: 'completed' | 'pending' | 'cancelled' | 'processing' | string;
  items?: number;
  date?: string;
}

interface RecentOrdersProps {
  orders?: Order[];
  isLoading?: boolean;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, isLoading }) => {
  const theme = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'مكتمل', color: 'success' as const };
      case 'pending':
        return { label: 'معلق', color: 'warning' as const };
      case 'processing':
        return { label: 'قيد المعالجة', color: 'info' as const };
      case 'cancelled':
        return { label: 'ملغي', color: 'error' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            الطلبات الأخيرة
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  // Ensure orders is an array
  const ordersList = Array.isArray(orders) ? orders : [];

  if (!ordersList || ordersList.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            الطلبات الأخيرة
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              لا توجد طلبات حديثة
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            الطلبات الأخيرة
          </Typography>
          <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            عرض الكل
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ordersList.map((order, index) => {
            const customerName = order.customer?.name || order.guestInfo?.name || 'عميل';
            const itemsCount = order.items?.length || 0;
            const orderDate = order.createdAt ? formatDate(order.createdAt) : '';
            const statusConfig = getStatusConfig(order.status);
            const orderKey = order._id || order.id || `order-${index}`;
            
            return (
            <Box
              key={orderKey}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                  transform: 'translateX(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48,
                  }}
                >
                  {customerName?.charAt(0) || 'ع'}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="600">
                      طلب #{order.orderNumber || (order._id || order.id).slice(-6)}
                    </Typography>
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    {customerName}
                    {itemsCount > 0 && ` • ${itemsCount} منتج`}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {order.total?.toLocaleString('ar-SA') || 0} ر.س
                  </Typography>
                  {orderDate && (
                    <Typography variant="caption" color="text.secondary">
                      {orderDate}
                    </Typography>
                  )}
                </Box>

                <IconButton size="small" sx={{ color: 'primary.main' }}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

