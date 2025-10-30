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
  const { t } = useTranslation();
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
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt />
          {t('orders.summary.orderNumber', { number: order.orderNumber })}
        </Typography>

        <Grid container spacing={2}>
          {/* Order Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('orders.summary.status')}
              </Typography>
              <OrderStatusChip status={order.status} size="small" />
            </Box>
          </Grid>

          {/* Payment Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('orders.summary.paymentStatus')}
              </Typography>
              <Chip
                label={t(`orders.payment.status.${order.paymentStatus}`)}
                color={getPaymentStatusColor(order.paymentStatus) as any}
                size="small"
              />
            </Box>
          </Grid>

          {/* Order Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('orders.summary.orderDate')} {formatDate(order.createdAt)}
            </Typography>
          </Grid>

          {/* Payment Method */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('orders.summary.paymentMethod')} {t(`orders.payment.method.${order.paymentMethod}` as const)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Customer Information */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Person />
            {t('orders.details.customer')}
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {order.deliveryAddress.recipientName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.deliveryAddress.recipientPhone}
            </Typography>
          </Paper>
        </Box>

        {/* Delivery Address */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <LocationOn />
            {t('orders.details.shipping')}
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2">{order.deliveryAddress.line1}</Typography>
            {order.deliveryAddress.line2 && (
              <Typography variant="body2">{order.deliveryAddress.line2}</Typography>
            )}
            <Typography variant="body2">
              {order.deliveryAddress.city}, {order.deliveryAddress.country}
            </Typography>
            {order.deliveryAddress.postalCode && (
                <Typography variant="body2">
                  {order.deliveryAddress.postalCode}
                </Typography>
            )}
          </Paper>
        </Box>

        {/* Shipping Information */}
        {(order.shippingCompany || order.trackingNumber) && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <LocalShipping />
              {t('orders.summary.shippingInfo', { defaultValue: 'معلومات الشحن' })}
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              {order.shippingCompany && (
                <Typography variant="body2">{t('orders.summary.shippingCompany', { defaultValue: 'شركة الشحن' })}: {order.shippingCompany}</Typography>
              )}
              {order.trackingNumber && (
                <Typography variant="body2">{t('orders.summary.trackingNumber', { defaultValue: 'رقم التتبع' })}: {order.trackingNumber}</Typography>
              )}
              {order.estimatedDeliveryDate && (
                <Typography variant="body2">
                  {t('orders.summary.estimatedDeliveryDate', { defaultValue: 'التاريخ المتوقع' })}: {formatDate(order.estimatedDeliveryDate)}
                </Typography>
              )}
            </Paper>
          </Box>
        )}

        {/* Order Items Summary */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Inventory />
            {t('orders.details.items')} ({order.items.length})
          </Typography>
          <List dense>
            {order.items.map((item, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={item.snapshot.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.qty} × {formatCurrency(item.finalPrice, order.currency)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('orders.summary.total', { defaultValue: 'المجموع' })}: {formatCurrency(item.lineTotal, order.currency)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Pricing Summary */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <AttachMoney />
            {t('orders.details.summary')}
          </Typography>
          <List dense>
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary={t('orders.summary.subtotal')} />
              <Typography variant="body2">
                {formatCurrency(order.subtotal, order.currency)}
              </Typography>
            </ListItem>

            {order.itemsDiscount > 0 && (
              <ListItem sx={{ px: 0 }}>
                <ListItemText primary={t('orders.summary.discount')} />
                <Typography variant="body2" color="success.main">
                  -{formatCurrency(order.itemsDiscount, order.currency)}
                </Typography>
              </ListItem>
            )}

            {order.couponDiscount > 0 && (
              <ListItem sx={{ px: 0 }}>
                <ListItemText primary={t('orders.summary.discount')} />
                <Typography variant="body2" color="success.main">
                  -{formatCurrency(order.couponDiscount, order.currency)}
                </Typography>
              </ListItem>
            )}

            {order.shippingCost > 0 && (
              <ListItem sx={{ px: 0 }}>
                <ListItemText primary={t('orders.summary.shipping')} />
                <Typography variant="body2">
                  {formatCurrency(order.shippingCost, order.currency)}
                </Typography>
              </ListItem>
            )}

            {order.tax > 0 && (
              <ListItem sx={{ px: 0 }}>
                <ListItemText primary={t('orders.summary.tax')} />
                <Typography variant="body2">{formatCurrency(order.tax, order.currency)}</Typography>
              </ListItem>
            )}

            <Divider sx={{ my: 1 }} />

            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {t('orders.summary.total')}
                  </Typography>
                }
              />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(order.total, order.currency)}
              </Typography>
            </ListItem>
          </List>
        </Box>

        {/* Additional Details */}
        {showDetails && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Notes */}
            {(order.customerNotes || order.adminNotes) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t('orders.summary.notes', { defaultValue: 'الملاحظات' })}
                </Typography>
                {order.customerNotes && (
                  <Paper sx={{ p: 2, bgcolor: 'info.light', mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{t('orders.summary.customerNotes', { defaultValue: 'ملاحظات العميل' })}:</strong> {order.customerNotes}
                    </Typography>
                  </Paper>
                )}
                {order.adminNotes && (
                  <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                    <Typography variant="body2">
                      <strong>{t('orders.summary.adminNotes', { defaultValue: 'ملاحظات الإدارة' })}:</strong> {order.adminNotes}
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}

            {/* Refund Information */}
            {order.returnInfo.isRefunded && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t('orders.summary.refundInfo', { defaultValue: 'معلومات الاسترداد' })}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                  <Typography variant="body2">
                    <strong>{t('orders.summary.refundAmount', { defaultValue: 'مبلغ الاسترداد' })}:</strong>{' '}
                    {formatCurrency(order.returnInfo.refundAmount, order.currency)}
                  </Typography>
                  {order.returnInfo.refundReason && (
                    <Typography variant="body2">
                      <strong>{t('orders.summary.refundReason', { defaultValue: 'سبب الاسترداد' })}:</strong> {order.returnInfo.refundReason}
                    </Typography>
                  )}
                  {order.returnInfo.refundedAt && (
                    <Typography variant="body2">
                      <strong>{t('orders.summary.refundedAt', { defaultValue: 'تاريخ الاسترداد' })} :</strong> {formatDate(order.returnInfo.refundedAt)}
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
