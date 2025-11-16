import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  Avatar,
  IconButton,
  alpha,
  useTheme,
  Skeleton
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Order {
  id: string;
  _id?: string;
  orderNumber?: string;
  customer?: {
    name: string;
    avatar?: string;
  };
  guestInfo?: {
    name: string;
  };
  total?: number;
  status: 'completed' | 'pending' | 'cancelled' | 'processing' | string;
  items?: any[];
  date?: string;
  createdAt?: string;
}

interface RecentOrdersProps {
  orders?: Order[];
  isLoading?: boolean;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, isLoading }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['dashboard']);
  // Use Gregorian calendar (Miladi) - 'ar' uses Gregorian, 'ar-SA' uses Hijri
  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', {
        day: 'numeric',
        month: 'short',
        calendar: 'gregory', // Explicitly use Gregorian calendar
      }),
    [i18n.language]
  );
  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // دائماً استخدام الدولار
        maximumFractionDigits: 0,
      }),
    []
  );

  // Format date using Gregorian calendar - يجب أن يكون قبل أي early returns
  const formatDate = React.useCallback(
    (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return dateFormatter.format(date);
      } catch {
        // Fallback to simple format if Intl API fails
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
    },
    [dateFormatter]
  );

  const getStatusConfig = (status: string) => {
    const normalized = status?.toLowerCase();
    const statusMap: Record<string, { key: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' }> = {
      completed: { key: 'completed', color: 'success' },
      pending: { key: 'pending', color: 'warning' },
      processing: { key: 'processing', color: 'info' },
      cancelled: { key: 'cancelled', color: 'error' },
    };

    const fallback = { key: normalized || 'unknown', color: 'default' as const };
    const config = statusMap[normalized || ''] || fallback;
    return {
      label: t(`recentOrders.status.${config.key}`, status),
      color: config.color,
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('recentOrders.title', 'الطلبات الأخيرة')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={18} />
                  <Skeleton variant="text" width="40%" height={14} />
                </Box>
                <Skeleton variant="text" width={80} height={20} />
              </Box>
            ))}
          </Box>
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
            {t('recentOrders.title', 'الطلبات الأخيرة')}
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('recentOrders.empty', 'لا توجد طلبات حديثة')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            {t('recentOrders.title', 'الطلبات الأخيرة')}
          </Typography>
          <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            {t('recentOrders.viewAll', 'عرض الكل')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ordersList.map((order, index) => {
            const customerName = order.customer?.name || order.guestInfo?.name || t('recentOrders.defaultCustomer', 'عميل');
            const itemsCount = order.items?.length || 0;
            const orderDate = order.createdAt ? formatDate(order.createdAt) : '';
            const statusConfig = getStatusConfig(order.status);
            const orderKey = order._id || order.id || `order-${index}`;
            const orderTotalLabel = order.total !== undefined && order.total !== null
              ? currencyFormatter.format(order.total)
              : t('recentOrders.amountPlaceholder', '—');
            
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
                  {customerName?.charAt(0) || t('recentOrders.defaultInitial', 'ع')}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="600">
                      {t('recentOrders.orderNumber', 'طلب #{{number}}', {
                        number: order.orderNumber || (order._id || order.id || '').slice(-6),
                      })}
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
                    {itemsCount > 0 && ` • ${t('recentOrders.itemsCount', '{{count}} منتج', { count: itemsCount })}`}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {orderTotalLabel}
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

