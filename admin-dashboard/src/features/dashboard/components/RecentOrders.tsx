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
  Skeleton,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import { Visibility, Phone, LocationOn, Payment, Receipt, ShoppingCart } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Order {
  id?: string;
  _id?: string;
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customer?: {
    name: string;
    avatar?: string;
  };
  guestInfo?: {
    name: string;
  };
  metadata?: {
    customer?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
  };
  total?: number;
  status: 'completed' | 'pending' | 'cancelled' | 'processing' | 'confirmed' | string;
  paymentStatus?: 'paid' | 'pending' | 'failed' | string;
  paymentMethod?: 'COD' | 'BANK_TRANSFER' | 'WALLET' | 'CARD' | string;
  deliveryAddress?: {
    city?: string;
    line1?: string;
    label?: string;
  };
  invoiceNumber?: string;
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
  const navigate = useNavigate();
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
    const statusMap: Record<
      string,
      {
        key: string;
        color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
      }
    > = {
      completed: { key: 'completed', color: 'success' },
      pending: { key: 'pending', color: 'warning' },
      processing: { key: 'processing', color: 'info' },
      confirmed: { key: 'confirmed', color: 'info' },
      cancelled: { key: 'cancelled', color: 'error' },
    };

    const fallback = { key: normalized || 'unknown', color: 'default' as const };
    const config = statusMap[normalized || ''] || fallback;
    return {
      label: t(`recentOrders.status.${config.key}`, status),
      color: config.color,
    };
  };

  const getPaymentMethodLabel = (method?: string): string => {
    if (!method) return '';
    const methodMap: Record<string, string> = {
      COD: t('recentOrders.paymentMethod.cod', 'الدفع عند الاستلام'),
      BANK_TRANSFER: t('recentOrders.paymentMethod.bankTransfer', 'تحويل بنكي'),
      WALLET: t('recentOrders.paymentMethod.wallet', 'محفظة'),
      CARD: t('recentOrders.paymentMethod.card', 'بطاقة'),
    };
    return methodMap[method] || method;
  };

  const getPaymentStatusConfig = (status?: string) => {
    if (!status) return null;
    const normalized = status?.toLowerCase();
    const statusMap: Record<string, { key: string; color: 'success' | 'warning' | 'error' }> = {
      paid: { key: 'paid', color: 'success' },
      pending: { key: 'pending', color: 'warning' },
      failed: { key: 'failed', color: 'error' },
    };
    const config = statusMap[normalized || ''] || {
      key: normalized || 'unknown',
      color: 'warning' as const,
    };
    return {
      label: t(`recentOrders.paymentStatus.${config.key}`, status),
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {[1, 2, 3, 4].map((item) => (
              <Box
                key={item}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={56} height={56} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Skeleton variant="text" width={120} height={20} />
                      <Skeleton
                        variant="rectangular"
                        width={80}
                        height={22}
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                    <Skeleton variant="text" width="40%" height={18} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Skeleton variant="text" width={100} height={14} />
                      <Skeleton variant="text" width={80} height={14} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width={80} height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="60%" height={14} />
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {ordersList.map((order, index) => {
            const customerName =
              order.customerName ||
              order.customer?.name ||
              order.guestInfo?.name ||
              t('recentOrders.defaultCustomer', 'عميل');
            const customerPhone = order.customerPhone || order.metadata?.customer?.phone || '';
            const itemsCount = order.items?.length || 0;
            const orderDate = order.createdAt ? formatDate(order.createdAt) : '';
            const statusConfig = getStatusConfig(order.status);
            const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus);
            const orderKey = order._id || order.id || `order-${index}`;
            const orderTotalLabel =
              order.total !== undefined && order.total !== null
                ? currencyFormatter.format(order.total)
                : t('recentOrders.amountPlaceholder', '—');

            // Get first product name for preview
            const firstProduct = order.items?.[0]?.snapshot?.name || '';
            const city = order.deliveryAddress?.city || '';

            const handleOrderClick = () => {
              const orderId = order._id || order.id;
              if (orderId) {
                navigate(`/orders/${orderId}`);
              }
            };

            return (
              <Box
                key={orderKey}
                onClick={handleOrderClick}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                {/* Header Row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {customerName?.charAt(0) || t('recentOrders.defaultInitial', 'ع')}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight="700"
                        sx={{ color: 'primary.main' }}
                      >
                        {t('recentOrders.orderNumber', 'طلب #{{number}}', {
                          number: order.orderNumber || (order._id || order.id || '').slice(-6),
                        })}
                      </Typography>
                      <Chip
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                      />
                      {paymentStatusConfig && (
                        <Chip
                          label={paymentStatusConfig.label}
                          color={paymentStatusConfig.color}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 500 }}
                        />
                      )}
                    </Box>

                    <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                      {customerName}
                    </Typography>

                    {/* Customer Details Row */}
                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {customerPhone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {customerPhone}
                          </Typography>
                        </Box>
                      )}
                      {city && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {city}
                          </Typography>
                        </Box>
                      )}
                      {order.paymentMethod && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Payment sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Box sx={{ textAlign: i18n.language === 'ar' ? 'left' : 'right', minWidth: 100 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                      sx={{ mb: 0.5 }}
                    >
                      {orderTotalLabel}
                    </Typography>
                    {orderDate && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {orderDate}
                      </Typography>
                    )}
                  </Box>

                  <Tooltip title={t('recentOrders.viewDetails', 'عرض التفاصيل')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick();
                      }}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Order Details Row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    <ShoppingCart sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                      {firstProduct ? (
                        <>
                          <strong>{firstProduct}</strong>
                          {itemsCount > 1 &&
                            ` ${t('recentOrders.andMore', 'و {{count}} منتج آخر', {
                              count: itemsCount - 1,
                            })}`}
                        </>
                      ) : (
                        t('recentOrders.itemsCount', '{{count}} منتج', { count: itemsCount })
                      )}
                    </Typography>
                  </Box>

                  {order.invoiceNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Receipt sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        {t('recentOrders.invoice', 'فاتورة: {{number}}', {
                          number: order.invoiceNumber,
                        })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};
