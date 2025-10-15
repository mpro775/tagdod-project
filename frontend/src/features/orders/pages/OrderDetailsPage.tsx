import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, LocalShipping, CheckCircle, Cancel, MonetizationOn } from '@mui/icons-material';
import {
  useOrder,
  useShipOrder,
  useConfirmDelivery,
  useCancelOrder,
  useRefundOrder,
} from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import { OrderStatus } from '../types/order.types';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipDialog, setShipDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);

  const [shipData, setShipData] = useState({ shippingCompany: '', trackingNumber: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const { data: order, isLoading } = useOrder(id!);
  const { mutate: shipOrder } = useShipOrder();
  const { mutate: confirmDelivery } = useConfirmDelivery();
  const { mutate: cancelOrder } = useCancelOrder();
  const { mutate: refundOrder } = useRefundOrder();

  if (isLoading || !order) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/orders')}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              طلب #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(order.createdAt!)}
            </Typography>
          </Box>
          <Chip label={order.status} color="primary" />
          <Chip
            label={order.paymentStatus}
            color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {order.status === OrderStatus.READY_TO_SHIP && (
            <Button
              variant="contained"
              startIcon={<LocalShipping />}
              onClick={() => setShipDialog(true)}
            >
              شحن الطلب
            </Button>
          )}
          {order.status === OrderStatus.SHIPPED && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => confirmDelivery(id!)}
            >
              تأكيد التسليم
            </Button>
          )}
          {!['cancelled', 'delivered', 'completed'].includes(order.status) && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setCancelDialog(true)}
            >
              إلغاء الطلب
            </Button>
          )}
          {order.paymentStatus === 'paid' && !order.isRefunded && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<MonetizationOn />}
              onClick={() => setRefundDialog(true)}
            >
              استرداد المبلغ
            </Button>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              المنتجات ({order.items?.length || 0})
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>المنتج</TableCell>
                  <TableCell align="center">الكمية</TableCell>
                  <TableCell align="right">السعر</TableCell>
                  <TableCell align="right">المجموع</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.snapshot.image && (
                          <Box
                            component="img"
                            src={item.snapshot.image}
                            sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                          />
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.snapshot.name}
                          </Typography>
                          {item.snapshot.sku && (
                            <Typography variant="caption" color="text.secondary">
                              SKU: {item.snapshot.sku}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{item.qty}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.finalPrice, item.currency)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.lineTotal, item.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', gap: 10 }}>
                <Typography>المجموع الفرعي:</Typography>
                <Typography fontWeight="bold">
                  {formatCurrency(order.subtotal, order.currency)}
                </Typography>
              </Box>
              {order.totalDiscount > 0 && (
                <Box sx={{ display: 'flex', gap: 10, color: 'error.main' }}>
                  <Typography>الخصم:</Typography>
                  <Typography fontWeight="bold">
                    -{formatCurrency(order.totalDiscount, order.currency)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 10 }}>
                <Typography>الشحن:</Typography>
                <Typography fontWeight="bold">
                  {formatCurrency(order.shippingCost, order.currency)}
                </Typography>
              </Box>
              {order.tax > 0 && (
                <Box sx={{ display: 'flex', gap: 10 }}>
                  <Typography>الضريبة ({order.taxRate}%):</Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(order.tax, order.currency)}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ width: '100%', my: 1 }} />
              <Box sx={{ display: 'flex', gap: 10 }}>
                <Typography variant="h6">المجموع الكلي:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatCurrency(order.total, order.currency)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Order Info */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Customer Info */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معلومات العميل
              </Typography>
              <Typography variant="body2">
                <strong>الاسم:</strong> {order.deliveryAddress.recipientName}
              </Typography>
              <Typography variant="body2">
                <strong>الهاتف:</strong> {order.deliveryAddress.recipientPhone}
              </Typography>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                عنوان التوصيل
              </Typography>
              <Typography variant="body2">{order.deliveryAddress.line1}</Typography>
              {order.deliveryAddress.line2 && (
                <Typography variant="body2">{order.deliveryAddress.line2}</Typography>
              )}
              <Typography variant="body2">
                {order.deliveryAddress.city}, {order.deliveryAddress.country}
              </Typography>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {order.trackingNumber && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  معلومات الشحن
                </Typography>
                <Typography variant="body2">
                  <strong>الشركة:</strong> {order.shippingCompany}
                </Typography>
                <Typography variant="body2">
                  <strong>رقم التتبع:</strong> {order.trackingNumber}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Ship Dialog */}
      <Dialog open={shipDialog} onClose={() => setShipDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>شحن الطلب</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="شركة الشحن"
                value={shipData.shippingCompany}
                onChange={(e) => setShipData({ ...shipData, shippingCompany: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="رقم التتبع"
                value={shipData.trackingNumber}
                onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShipDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={() => {
              shipOrder({ id: id!, data: shipData }, { onSuccess: () => setShipDialog(false) });
            }}
            disabled={!shipData.shippingCompany || !shipData.trackingNumber}
          >
            شحن
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إلغاء الطلب</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="سبب الإلغاء"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              cancelOrder(
                { id: id!, reason: cancelReason },
                { onSuccess: () => setCancelDialog(false) }
              );
            }}
            disabled={!cancelReason}
          >
            إلغاء الطلب
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onClose={() => setRefundDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>استرداد المبلغ</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="سبب الاسترداد"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              refundOrder(
                { id: id!, data: { reason: refundReason } },
                { onSuccess: () => setRefundDialog(false) }
              );
            }}
            disabled={!refundReason}
          >
            استرداد
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
