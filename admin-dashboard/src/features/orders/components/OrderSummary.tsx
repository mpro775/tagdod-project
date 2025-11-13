import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
} from '@mui/material';
import {
  AttachMoney,
  LocalShipping,
  Inventory,
  Person,
  LocationOn,
  Receipt,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { OrderStatusChip } from './OrderStatusChip';
import type { Order, PaymentStatus } from '../types/order.types';

interface OrderSummaryProps {
  order: Order;
  showDetails?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order, showDetails = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation('orders');
  
  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'error';
      case 'refunded':
      case 'partially_refunded':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          <Receipt />
          {t('summary.orderNumber', { number: order.orderNumber })}
        </Typography>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {/* Order Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {t('summary.status')}
              </Typography>
              <OrderStatusChip status={order.status} size="small" />
            </Box>
          </Grid>

          {/* Payment Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {t('summary.paymentStatus')}
              </Typography>
              <Chip
                label={t(`payment.status.${order.paymentStatus}`)}
                color={getPaymentStatusColor(order.paymentStatus) as any}
                size="small"
              />
            </Box>
          </Grid>

          {/* Order Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {t('summary.orderDate')} {formatDate(order.createdAt)}
            </Typography>
          </Grid>

          {/* Payment Method */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {t('summary.paymentMethod')} {t(`payment.method.${order.paymentMethod}` as const)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.divider, 0.1) }} />

        {/* Customer Information */}
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              color: 'text.primary',
              fontWeight: 'bold',
            }}
          >
            <Person />
            {t('details.customer')}
          </Typography>
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.text.secondary, theme.palette.mode === 'dark' ? 0.05 : 0.02),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              {order.deliveryAddress.recipientName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {order.deliveryAddress.recipientPhone}
            </Typography>
          </Paper>
        </Box>

        {/* Delivery Address */}
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              color: 'text.primary',
              fontWeight: 'bold',
            }}
          >
            <LocationOn />
            {t('details.shipping')}
          </Typography>
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.text.secondary, theme.palette.mode === 'dark' ? 0.05 : 0.02),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              {order.deliveryAddress.line1}
            </Typography>
            {order.deliveryAddress.line2 && (
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                {order.deliveryAddress.line2}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              {order.deliveryAddress.city}, {order.deliveryAddress.country}
            </Typography>
            {order.deliveryAddress.postalCode && (
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                {order.deliveryAddress.postalCode}
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Shipping Information */}
        {(order.shippingCompany || order.trackingNumber) && (
          <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                color: 'text.primary',
                fontWeight: 'bold',
              }}
            >
              <LocalShipping />
              {t('details.shippingInfo')}
            </Typography>
            <Paper
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.text.secondary, theme.palette.mode === 'dark' ? 0.05 : 0.02),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              {order.shippingCompany && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mb: 0.5 }}
                >
                  {t('details.shippingCompany')}: {order.shippingCompany}
                </Typography>
              )}
              {order.trackingNumber && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mb: 0.5 }}
                >
                    {t('details.trackingNumber')}: {order.trackingNumber}
                </Typography>
              )}
              {order.estimatedDeliveryDate && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                >
                  {t('details.estimatedDeliveryDate')}: {formatDate(order.estimatedDeliveryDate)}
                </Typography>
              )}
            </Paper>
          </Box>
        )}

        {/* Order Items Summary */}
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              color: 'text.primary',
              fontWeight: 'bold',
            }}
          >
            <Inventory />
            {t('details.items')} ({order.items.length})
          </Typography>
          <List dense sx={{ p: 0 }}>
            {order.items.map((item, index) => (
              <ListItem key={index} sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.5, sm: 0.75 } }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      }}
                    >
                      {item.snapshot.name}
                    </Typography>
                  }
                  secondary={
                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                      >
                        {item.qty} × {formatCurrency(item.finalPrice, order.currency)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                      >
                        {t('details.lineTotal')}: {formatCurrency(item.lineTotal, order.currency)}
                      </Typography>
                    </Stack>
                  }
                  primaryTypographyProps={{ sx: { color: 'text.primary' } }}
                  secondaryTypographyProps={{ sx: { color: 'text.secondary' } }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.divider, 0.1) }} />

        {/* Pricing Summary */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              color: 'text.primary',
              fontWeight: 'bold',
            }}
          >
            <AttachMoney />
            {t('details.summary')}
          </Typography>
          <List dense sx={{ p: 0 }}>
            <ListItem sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.5, sm: 0.75 } }}>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                  >
                    {t('summary.subtotal')}
                  </Typography>
                }
              />
              <Typography
                variant="body2"
                sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
              >
                {formatCurrency(order.subtotal, order.currency)}
              </Typography>
            </ListItem>

            {/* Items Discount (from promotions) */}
            {order.itemsDiscount > 0 && (
              <ListItem sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.5, sm: 0.75 } }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                    >
                      {t('summary.itemsDiscount', { defaultValue: 'خصم المنتجات' })}
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                >
                  -{formatCurrency(order.itemsDiscount, order.currency)}
                </Typography>
              </ListItem>
            )}

            {/* Multiple Coupons - Show all applied coupons */}
            {order.appliedCoupons && order.appliedCoupons.length > 0 ? (
              order.appliedCoupons.map((coupon, index) => (
                <ListItem key={index} sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.5, sm: 0.75 } }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                      >
                        {t('summary.coupon', { defaultValue: 'كوبون' })}: {coupon.code}
                        {coupon.details.title && ` - ${coupon.details.title}`}
                      </Typography>
                    }
                  />
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                  >
                    -{formatCurrency(coupon.discount, order.currency)}
                  </Typography>
                </ListItem>
              ))
            ) : (
              // Backward compatibility: show single coupon if exists
              order.couponDiscount > 0 && (
                <ListItem sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.5, sm: 0.75 } }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                      >
                        {order.appliedCouponCode || order.couponDetails?.code
                          ? `${t('summary.coupon', { defaultValue: 'كوبون' })}: ${order.appliedCouponCode || order.couponDetails?.code}`
                          : t('summary.couponDiscount', { defaultValue: 'خصم الكوبون' })}
                      </Typography>
                    }
                  />
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                  >
                    -{formatCurrency(order.couponDiscount, order.currency)}
                  </Typography>
                </ListItem>
              )
            )}

            {order.shippingCost > 0 && (
              <ListItem sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.5, sm: 0.75 } }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                    >
                        {t('summary.shipping')}
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                >
                  {formatCurrency(order.shippingCost, order.currency)}
                </Typography>
              </ListItem>
            )}

            {order.tax > 0 && (
              <ListItem sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.5, sm: 0.75 } }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                    >
                      {t('summary.tax')}
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                >
                  {formatCurrency(order.tax, order.currency)}
                </Typography>
              </ListItem>
            )}

            <Divider sx={{ my: { xs: 0.75, sm: 1 }, bgcolor: alpha(theme.palette.divider, 0.1) }} />

            <ListItem sx={{ px: { xs: 0.5, sm: 0 }, py: { xs: 0.75, sm: 1 } }}>
              <ListItemText
                primary={
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      fontSize: { xs: '0.9375rem', sm: '1.25rem' },
                    }}
                  >
                    {t('summary.total')}
                  </Typography>
                }
              />
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  fontSize: { xs: '0.9375rem', sm: '1.25rem' },
                }}
              >
                {formatCurrency(order.total, order.currency)}
              </Typography>
            </ListItem>
          </List>
        </Box>

        {/* Additional Details */}
        {showDetails && (
          <>
            <Divider sx={{ my: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.divider, 0.1) }} />

            {/* Notes */}
            {(order.customerNotes || order.adminNotes) && (
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  {t('summary.notes')}
                </Typography>
                {order.customerNotes && (
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      mb: 1,
                      bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                    >
                      <strong>{t('details.customerNotes')}:</strong> {order.customerNotes}
                    </Typography>
                  </Paper>
                )}
                {order.adminNotes && (
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                    >
                      <strong>{t('details.adminNotes')}:</strong> {order.adminNotes}
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* Refund Information */}
            {order.returnInfo?.isRefunded && (
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  {t('details.refundInfo')}
                </Typography>
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.1),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mb: 0.5 }}
                  >
                    <strong>{t('details.refundAmount')}:</strong>{' '}
                    {formatCurrency(order.returnInfo.refundAmount, order.currency)}
                  </Typography>
                  {order.returnInfo.refundReason && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      <strong>{t('details.refundReason')}:</strong>{' '}
                      {order.returnInfo.refundReason}
                    </Typography>
                  )}
                  {order.returnInfo.refundedAt && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                    >
                      <strong>{t('details.refundedAt')}:</strong>{' '}
                      {formatDate(order.returnInfo.refundedAt)}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
