import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Order {
  id?: string;
  _id?: string;
  orderNumber?: string;
  customerName?: string;
  customer?: { name: string; avatar?: string };
  guestInfo?: { name: string };
  metadata?: { customer?: { firstName?: string; lastName?: string; phone?: string } };
  total?: number;
  status: 'completed' | 'pending' | 'cancelled' | 'processing' | 'confirmed' | string;
  paymentStatus?: 'paid' | 'pending' | 'failed' | string;
  items?: any[];
  date?: string;
  createdAt?: string;
}

interface CompactRecentOrdersProps {
  orders?: Order[];
  isLoading?: boolean;
}

const statusMap: Record<string, { key: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  completed: { key: 'completed', color: 'success' },
  pending: { key: 'pending', color: 'warning' },
  processing: { key: 'processing', color: 'info' },
  confirmed: { key: 'confirmed', color: 'info' },
  cancelled: { key: 'cancelled', color: 'error' },
};

const paymentStatusMap: Record<string, { key: string; color: 'success' | 'warning' | 'error' }> = {
  paid: { key: 'paid', color: 'success' },
  pending: { key: 'pending', color: 'warning' },
  failed: { key: 'failed', color: 'error' },
};

export const CompactRecentOrders: React.FC<CompactRecentOrdersProps> = ({
  orders,
  isLoading = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('dashboard');

  const dateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { day: 'numeric', month: 'short', calendar: 'gregory' }),
    [i18n.language],
  );
  const currencyFormatter = React.useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    [],
  );

  const formatDate = React.useCallback(
    (dateString: string): string => {
      try { return dateFormatter.format(new Date(dateString)); }
      catch { return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); }
    },
    [dateFormatter],
  );

  const displayOrders = (Array.isArray(orders) ? orders : []).slice(0, 4);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.08),
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            {t('recentOrders.title', 'الطلبات الأخيرة')}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => navigate('/orders')}
          >
            {t('recentOrders.viewAll', 'عرض الكل')}
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={84} />
            ))}
          </Stack>
        ) : displayOrders.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('recentOrders.empty', 'لا توجد طلبات حديثة')}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {displayOrders.map((order, index) => {
              const orderId = order._id || order.id || `order-${index}`;
              const customerName = order.customerName || order.customer?.name || order.guestInfo?.name || t('recentOrders.defaultCustomer', 'عميل');
              const orderTotalLabel = order.total !== undefined && order.total !== null
                ? currencyFormatter.format(order.total)
                : '—';
              const orderDate = order.createdAt ? formatDate(order.createdAt) : '';
              const normalized = order.status?.toLowerCase() || '';
              const sConfig = statusMap[normalized] || { key: normalized || 'unknown', color: 'default' as const };
              const pConfig = order.paymentStatus ? paymentStatusMap[order.paymentStatus.toLowerCase()] : null;

              return (
                <Stack
                  key={orderId}
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  onClick={() => {
                    const id = order._id || order.id;
                    if (id) navigate(`/orders/${id}`);
                  }}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.06),
                    cursor: 'pointer',
                    minHeight: 78,
                    maxHeight: 96,
                    overflow: 'hidden',
                    transition: 'border-color .2s ease, transform .2s ease',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      bgcolor: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    {customerName?.charAt(0) || t('recentOrders.defaultInitial', 'ع')}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Stack direction="row" spacing={0.75} alignItems="baseline">
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ flexShrink: 0 }}>
                        {order.orderNumber || (order._id || order.id || '').slice(-6)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                      {pConfig && (
                        <Chip label={t(`recentOrders.paymentStatus.${pConfig.key}`, order.paymentStatus!)} color={pConfig.color} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                      )}
                      <Chip label={t(`recentOrders.status.${sConfig.key}`, order.status)} color={sConfig.color} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                      {orderDate && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {orderDate}
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                    <Typography variant="body2" fontWeight={800} color="success.main">
                      {orderTotalLabel}
                    </Typography>
                    <IconButton size="small" sx={{ p: 0.25 }}>
                      <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </IconButton>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};