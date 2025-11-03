import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  useTheme,
  Drawer,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  LocalShipping,
  Cancel,
  Refresh,
  Visibility,
  ExpandMore,
  Info,
  Person,
  LocationOn,
  Phone,
  Inventory,
  Notes,
  AttachMoney,
  Warning,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import toast from 'react-hot-toast';
import {
  useOrder,
  useUpdateOrderStatus,
  useShipOrder,
  useRefundOrder,
  useCancelOrder,
  useAddOrderNotes,
  useVerifyPayment,
} from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import {
  OrderStatus,
  type UpdateOrderStatusDto,
  type ShipOrderDto,
  type RefundOrderDto,
  type CancelOrderDto,
  type AddOrderNotesDto,
  type VerifyPaymentDto,
  PaymentStatus,
  PaymentMethod,
} from '../types/order.types';
import { ar } from 'date-fns/locale';
import { OrderTimeline, OrderStatusChip } from '../components';

import { CreditCard } from '@mui/icons-material';

export const OrderDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('orders');
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  // Dialog states
  const [updateStatusDialog, setUpdateStatusDialog] = useState(false);
  const [shipDialog, setShipDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [notesDialog, setNotesDialog] = useState(false);
  const [verifyPaymentDialog, setVerifyPaymentDialog] = useState(false);

  // Form states
  const [statusForm, setStatusForm] = useState<UpdateOrderStatusDto>({
    status: 'processing' as OrderStatus,
  });
  const [shipForm, setShipForm] = useState<ShipOrderDto>({
    shippingCompany: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDeliveryDate: '',
  });
  const [refundForm, setRefundForm] = useState<RefundOrderDto>({
    amount: 0,
    reason: '',
  });
  const [cancelForm, setCancelForm] = useState<CancelOrderDto>({ reason: '' });
  const [notesForm, setNotesForm] = useState<AddOrderNotesDto>({
    notes: '',
    type: 'admin',
  });
  const [verifyPaymentForm, setVerifyPaymentForm] = useState<VerifyPaymentDto>({
    verifiedAmount: 0,
    verifiedCurrency: 'YER',
    notes: '',
  });

  const { data: order, isLoading, error } = useOrder(id || '');
  const updateStatusMutation = useUpdateOrderStatus();
  const shipMutation = useShipOrder();
  const refundMutation = useRefundOrder();
  const cancelMutation = useCancelOrder();
  const addNotesMutation = useAddOrderNotes();
  const verifyPaymentMutation = useVerifyPayment();

  const handleUpdateStatus = async () => {
    if (!id || !order) return;
    
    // التحقق من الدفع قبل السماح بتغيير الحالة
    const statusesRequiringPayment = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.READY_TO_SHIP,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    ];

    // استثناء CANCELLED من التحقق
    if (
      statusesRequiringPayment.includes(statusForm.status) &&
      statusForm.status !== OrderStatus.CANCELLED &&
      order.paymentStatus !== PaymentStatus.PAID
    ) {
      // إظهار تحذير للمستخدم
      toast.error(
        `لا يمكن تغيير حالة الطلب إلى ${t(`orders.status.${statusForm.status}`)} بدون إتمام الدفع. حالة الدفع الحالية: ${t(`orders.payment.status.${order.paymentStatus}`)}`
      );
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({ id, data: statusForm });
      setUpdateStatusDialog(false);
    } catch (error) {
      console.error('Update status failed:', error);
    }
  };

  const handleShipOrder = async () => {
    if (!id) return;
    try {
      await shipMutation.mutateAsync({ id, data: shipForm });
      setShipDialog(false);
    } catch (error) {
      console.error('Ship order failed:', error);
    }
  };

  const handleRefundOrder = async () => {
    if (!id) return;
    try {
      await refundMutation.mutateAsync({ id, data: refundForm });
      setRefundDialog(false);
    } catch (error) {
      console.error('Refund order failed:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!id) return;
    try {
      await cancelMutation.mutateAsync({ id, data: cancelForm });
      setCancelDialog(false);
    } catch (error) {
      console.error('Cancel order failed:', error);
    }
  };

  const handleAddNotes = async () => {
    if (!id) return;
    try {
      await addNotesMutation.mutateAsync({ id, data: notesForm });
      setNotesDialog(false);
      setNotesForm({ notes: '', type: 'admin' });
    } catch (error) {
      console.error('Add notes failed:', error);
    }
  };

  const handleVerifyPayment = async () => {
    if (!id) return;
    try {
      await verifyPaymentMutation.mutateAsync({ id, data: verifyPaymentForm });
      setVerifyPaymentDialog(false);
      setVerifyPaymentForm({
        verifiedAmount: 0,
        verifiedCurrency: order?.currency as 'YER' | 'SAR' | 'USD' || 'YER',
        notes: '',
      });
    } catch (error) {
      console.error('Verify payment failed:', error);
    }
  };

  // Initialize verify payment form when order loads or dialog opens
  useEffect(() => {
    if (order) {
      if (verifyPaymentDialog) {
        setVerifyPaymentForm({
          verifiedAmount: order.verifiedPaymentAmount || order.total || 0,
          verifiedCurrency: (order.verifiedPaymentCurrency || order.currency || 'YER') as 'YER' | 'SAR' | 'USD',
          notes: order.paymentVerificationNotes || '',
        });
      }
    }
  }, [order, verifyPaymentDialog]);


  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('messages.error.loadFailed')}</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            mb: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <IconButton onClick={() => navigate('/orders')} sx={{ mr: { xs: 0, sm: 1 } }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}
              >
                {t('details.title')} #{order.orderNumber}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('details.orderCreatedAt')} {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Box>
          {isMobile ? (
            <>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Edit />}
                onClick={() => setMobileActionsOpen(true)}
              >
                {t('actions.updateStatus')}
              </Button>
              <Drawer
                anchor="bottom"
                open={mobileActionsOpen}
                onClose={() => setMobileActionsOpen(false)}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('actions.updateStatus')}
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Edit />}
                      onClick={() => {
                        setMobileActionsOpen(false);
                        setUpdateStatusDialog(true);
                      }}
                    >
                      {t('actions.updateStatus')}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<LocalShipping />}
                      onClick={() => {
                        setMobileActionsOpen(false);
                        setShipDialog(true);
                      }}
                      disabled={!['processing', 'ready_to_ship'].includes(order.status)}
                    >
                      {t('actions.shipOrder')}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Refresh />}
                      onClick={() => {
                        setMobileActionsOpen(false);
                        setRefundDialog(true);
                      }}
                      disabled={!['delivered', 'completed'].includes(order.status)}
                    >
                      {t('actions.refundOrder')}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Cancel />}
                      onClick={() => {
                        setMobileActionsOpen(false);
                        setCancelDialog(true);
                      }}
                      disabled={['cancelled', 'delivered', 'completed'].includes(order.status)}
                    >
                      {t('actions.cancelOrder')}
                    </Button>
                  </Stack>
                </Box>
              </Drawer>
            </>
          ) : (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<Edit />}
                onClick={() => setUpdateStatusDialog(true)}
              >
                {t('actions.updateStatus')}
              </Button>
              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<LocalShipping />}
                onClick={() => setShipDialog(true)}
                disabled={!['processing', 'ready_to_ship'].includes(order.status)}
              >
                {t('actions.shipOrder')}
              </Button>
              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<Refresh />}
                onClick={() => setRefundDialog(true)}
                disabled={!['delivered', 'completed'].includes(order.status)}
              >
                {t('actions.refundOrder')}
              </Button>
              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<Cancel />}
                onClick={() => setCancelDialog(true)}
                disabled={['cancelled', 'delivered', 'completed'].includes(order.status)}
              >
                {t('actions.cancelOrder')}
              </Button>
            </Stack>
          )}
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Order Overview */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              sx={{
                mb: { xs: 2, md: 3 },
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Info />
                  {t('details.overview')}
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {t('details.orderStatus')}
                      </Typography>
                      <OrderStatusChip status={order.status} size={isMobile ? 'small' : 'medium'} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {t('details.paymentStatus')}
                      </Typography>
                      <Chip
                        label={t(`orders.payment.status.${order.paymentStatus}`)}
                        color={order.paymentStatus === PaymentStatus.PAID ? 'success' : 'warning'}
                        size={isMobile ? 'small' : 'medium'}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {t('details.paymentMethod')}
                      </Typography>
                      <Chip
                        label={t(`orders.payment.method.${order.paymentMethod}`)}
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {t('details.total')}
                      </Typography>
                      <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(order.total, order.currency)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card
              sx={{
                mb: { xs: 2, md: 3 },
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Inventory />
                  {t('details.orderItems')}
                </Typography>
                <List sx={{ p: 0 }}>
                  {order.items.map((item, index) => (
                    <ListItem
                      key={index}
                      divider
                      sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        py: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Avatar
                        src={item.snapshot.image}
                        sx={{
                          mr: { xs: 0, sm: 2 },
                          mb: { xs: 1, sm: 0 },
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                        }}
                      >
                        {item.snapshot.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant={isMobile ? 'body2' : 'body1'}
                            sx={{ fontWeight: 'medium', mb: 0.5 }}
                          >
                            {item.snapshot.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('details.quantity')}: {item.qty} | {t('details.price')}:{' '}
                              {formatCurrency(item.finalPrice, order.currency)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {t('details.lineTotal')}: {formatCurrency(item.lineTotal, order.currency)}
                            </Typography>
                            {item.snapshot.attributes && (
                              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {Object.entries(item.snapshot.attributes).map(([key, value]) => (
                                  <Chip
                                    key={key}
                                    label={`${key}: ${value}`}
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        theme.palette.mode === 'dark'
                                          ? 'rgba(255, 255, 255, 0.08)'
                                          : 'grey.100',
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                        sx={{ flex: 1, minWidth: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Discounts & Coupons Breakdown */}
            {(order.itemsDiscount > 0 || order.couponDiscount > 0 || (order.appliedCoupons && order.appliedCoupons.length > 0)) && (
              <Card
                sx={{
                  mb: { xs: 2, md: 3 },
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <AttachMoney />
                    {t('details.discountsAndCoupons', { defaultValue: 'الخصومات والكوبونات' })}
                  </Typography>
                  
                  {/* Items Discount */}
                  {order.itemsDiscount > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {t('details.itemsDiscount', { defaultValue: 'خصم المنتجات (من العروض الترويجية)' })}
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        -{formatCurrency(order.itemsDiscount, order.currency)}
                      </Typography>
                    </Box>
                  )}

                  {/* Multiple Coupons */}
                  {order.appliedCoupons && order.appliedCoupons.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                        {t('details.appliedCoupons', { defaultValue: 'الكوبونات المطبقة' })} ({order.appliedCoupons.length})
                      </Typography>
                      <Stack spacing={1.5}>
                        {order.appliedCoupons.map((coupon, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                              borderRadius: 1,
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {coupon.code}
                                </Typography>
                                {coupon.details.title && (
                                  <Typography variant="caption" color="text.secondary">
                                    {coupon.details.title}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="h6" color="success.main">
                                -{formatCurrency(coupon.discount, order.currency)}
                              </Typography>
                            </Box>
                            {coupon.details.discountPercentage && (
                              <Chip
                                label={`${coupon.details.discountPercentage}%`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                            {coupon.details.discountAmount && (
                              <Chip
                                label={formatCurrency(coupon.details.discountAmount, order.currency)}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        ))}
                      </Stack>
                      <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {t('details.totalCouponDiscount', { defaultValue: 'إجمالي خصم الكوبونات' })}
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            -{formatCurrency(order.couponDiscount, order.currency)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    // Backward compatibility: show single coupon
                    order.couponDiscount > 0 && (
                      <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {order.appliedCouponCode || order.couponDetails?.code
                            ? `${t('details.coupon', { defaultValue: 'كوبون' })}: ${order.appliedCouponCode || order.couponDetails?.code}`
                            : t('details.couponDiscount', { defaultValue: 'خصم الكوبون' })}
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          -{formatCurrency(order.couponDiscount, order.currency)}
                        </Typography>
                      </Box>
                    )
                  )}

                  {/* Total Discount */}
                  {order.totalDiscount > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: `2px solid ${theme.palette.divider}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {t('details.totalDiscount', { defaultValue: 'إجمالي الخصومات' })}
                        </Typography>
                        <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                          -{formatCurrency(order.totalDiscount, order.currency)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            {order && <OrderTimeline order={order} showHistory={true} />}
          </Grid>

          {/* Order Details Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Customer Information */}
            <Card
              sx={{
                mb: { xs: 2, md: 3 },
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Person />
                  {t('details.customer')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('details.customerName')}
                      secondary={order.deliveryAddress.recipientName}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('details.phone')}
                      secondary={order.deliveryAddress.recipientPhone}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card
              sx={{
                mb: { xs: 2, md: 3 },
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocationOn />
                  {t('details.deliveryAddress')}
                </Typography>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {order.deliveryAddress.recipientName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {order.deliveryAddress.line1}
                  </Typography>
                  {order.deliveryAddress.line2 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {order.deliveryAddress.line2}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {order.deliveryAddress.city}, {order.deliveryAddress.country}
                  </Typography>
                  {order.deliveryAddress.postalCode && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {t('details.postalCode')}: {order.deliveryAddress.postalCode}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Local Payment Information */}
            {order.paymentMethod === PaymentMethod.BANK_TRANSFER && order.localPaymentAccountId && (
              <Card
                sx={{
                  mb: { xs: 2, md: 3 },
                  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <CreditCard />
                      {t('details.localPaymentInfo')}
                    </Typography>
                    {order.paymentStatus === PaymentStatus.PENDING && (
                      <Button
                        variant="contained"
                        color="primary"
                        size={isMobile ? 'small' : 'medium'}
                        onClick={() => setVerifyPaymentDialog(true)}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        {t('details.verifyPayment')}
                      </Button>
                    )}
                  </Box>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={t('details.paymentReference')}
                        secondary={order.paymentReference || t('details.notSpecified')}
                        primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                        secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                      />
                    </ListItem>
                    {order.verifiedPaymentAmount !== undefined && (
                      <>
                        <ListItem>
                          <ListItemText
                            primary={t('details.verifiedAmount')}
                            secondary={formatCurrency(
                              order.verifiedPaymentAmount,
                              order.verifiedPaymentCurrency || order.currency
                            )}
                            primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                            secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={t('details.verificationDate')}
                            secondary={
                              order.paymentVerifiedAt
                                ? formatDate(order.paymentVerifiedAt)
                                : t('details.notSpecified')
                            }
                            primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                            secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                          />
                        </ListItem>
                        {order.paymentVerificationNotes && (
                          <ListItem>
                            <ListItemText
                              primary={t('details.verificationNotes')}
                              secondary={order.paymentVerificationNotes}
                              primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                              secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <Alert
                            severity={
                              order.paymentStatus === PaymentStatus.PAID ? 'success' : 'error'
                            }
                            sx={{ width: '100%' }}
                          >
                            {order.paymentStatus === PaymentStatus.PAID
                              ? t('details.paymentAccepted')
                              : t('details.paymentRejected', {
                                  amount: formatCurrency(order.total, order.currency),
                                })}
                          </Alert>
                        </ListItem>
                      </>
                    )}
                    {order.paymentStatus === PaymentStatus.PENDING && !order.verifiedPaymentAmount && (
                      <ListItem>
                        <Alert severity="warning" sx={{ width: '100%' }}>
                          {t('details.paymentPending')}
                        </Alert>
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Shipping Information */}
            <Card
              sx={{
                mb: { xs: 2, md: 3 },
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocalShipping />
                  {t('details.shippingInfo')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={t('details.shippingCompany')}
                      secondary={order.shippingCompany || t('details.notSpecified')}
                      primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                      secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t('details.trackingNumber')}
                      secondary={order.trackingNumber || t('details.notSpecified')}
                      primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                      secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                    />
                  </ListItem>
                  {order.trackingUrl && (
                    <ListItem>
                      <Button
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        fullWidth={isMobile}
                        startIcon={<Visibility />}
                        onClick={() => window.open(order.trackingUrl, '_blank')}
                      >
                        {t('details.trackOrder')}
                      </Button>
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemText
                      primary={t('details.estimatedDeliveryDate')}
                      secondary={
                        order.estimatedDeliveryDate
                          ? formatDate(order.estimatedDeliveryDate)
                          : t('details.notSpecified')
                      }
                      primaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                      secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Notes />
                    {t('details.notes')}
                  </Typography>
                  <IconButton size="small" onClick={() => setNotesDialog(true)}>
                    <Edit />
                  </IconButton>
                </Box>
                <Accordion
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    mb: 1,
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant={isMobile ? 'caption' : 'subtitle2'}>
                      {t('details.customerNotes')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      {order.customerNotes || t('details.noCustomerNotes')}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    mb: 1,
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant={isMobile ? 'caption' : 'subtitle2'}>
                      {t('details.adminNotes')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      {order.adminNotes || t('details.noAdminNotes')}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant={isMobile ? 'caption' : 'subtitle2'}>
                      {t('details.internalNotes')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                      {order.internalNotes || t('details.noInternalNotes')}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Update Status Dialog */}
        <Dialog
          open={updateStatusDialog}
          onClose={() => setUpdateStatusDialog(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>{t('dialogs.updateStatus.title')}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: { xs: 1, sm: 2 } }}>
              <InputLabel>{t('dialogs.updateStatus.newStatus')}</InputLabel>
              <Select
                value={statusForm.status}
                onChange={(e) =>
                  setStatusForm((prev) => ({ ...prev, status: e.target.value as OrderStatus }))
                }
                label={t('dialogs.updateStatus.newStatus')}
              >
                {Object.values(OrderStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(`status.${status}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Payment Status Warning */}
            {order && (() => {
              const statusesRequiringPayment = [
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.READY_TO_SHIP,
                OrderStatus.SHIPPED,
                OrderStatus.OUT_FOR_DELIVERY,
                OrderStatus.DELIVERED,
              ];

              const requiresPayment = 
                statusesRequiringPayment.includes(statusForm.status) &&
                statusForm.status !== OrderStatus.CANCELLED &&
                order.paymentStatus !== PaymentStatus.PAID;

              return requiresPayment ? (
                <Alert 
                  severity="warning" 
                  icon={<Warning />}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {t('dialogs.updateStatus.paymentRequired', { 
                      defaultValue: 'تحذير: هذه الحالة تتطلب إتمام الدفع' 
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('dialogs.updateStatus.paymentRequiredMessage', {
                      defaultValue: 'حالة الدفع الحالية: {status}',
                      status: t(`orders.payment.status.${order.paymentStatus}`)
                    })}
                  </Typography>
                  {order.paymentMethod === PaymentMethod.BANK_TRANSFER && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {t('dialogs.updateStatus.verifyPaymentFirst', {
                        defaultValue: 'يرجى التحقق من الدفع أولاً قبل تغيير الحالة'
                      })}
                    </Typography>
                  )}
                </Alert>
              ) : null;
            })()}

            <TextField
              fullWidth
              label={t('dialogs.updateStatus.notes')}
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={statusForm.notes || ''}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={() => setUpdateStatusDialog(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              disabled={updateStatusMutation.isPending}
            >
              {t('dialogs.updateStatus.confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ship Order Dialog */}
        <Dialog
          open={shipDialog}
          onClose={() => setShipDialog(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>{t('dialogs.shipOrder.title')}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('dialogs.shipOrder.carrier')}
              sx={{ mt: { xs: 1, sm: 2 } }}
              value={shipForm.shippingCompany}
              onChange={(e) =>
                setShipForm((prev) => ({ ...prev, shippingCompany: e.target.value }))
              }
            />
            <TextField
              fullWidth
              label={t('dialogs.shipOrder.trackingNumber')}
              sx={{ mt: 2 }}
              value={shipForm.trackingNumber}
              onChange={(e) => setShipForm((prev) => ({ ...prev, trackingNumber: e.target.value }))}
            />
            <TextField
              fullWidth
              label={t('dialogs.shipOrder.trackingUrl')}
              sx={{ mt: 2 }}
              value={shipForm.trackingUrl || ''}
              onChange={(e) => setShipForm((prev) => ({ ...prev, trackingUrl: e.target.value }))}
            />
            <DatePicker
              label={t('dialogs.shipOrder.estimatedDelivery')}
              value={
                shipForm.estimatedDeliveryDate ? new Date(shipForm.estimatedDeliveryDate) : null
              }
              onChange={(date) =>
                setShipForm((prev) => ({ ...prev, estimatedDeliveryDate: date?.toISOString() }))
              }
              slotProps={{ textField: { fullWidth: true, sx: { mt: 2 } } }}
            />
            <TextField
              fullWidth
              label={t('dialogs.shipOrder.notes')}
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={shipForm.notes || ''}
              onChange={(e) => setShipForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={() => setShipDialog(false)}>{t('actions.cancel')}</Button>
            <Button onClick={handleShipOrder} variant="contained" disabled={shipMutation.isPending}>
              {t('dialogs.shipOrder.confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Refund Order Dialog */}
        <Dialog
          open={refundDialog}
          onClose={() => setRefundDialog(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>{t('dialogs.refundOrder.title')}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('dialogs.refundOrder.amount')}
              type="number"
              sx={{ mt: { xs: 1, sm: 2 } }}
              value={refundForm.amount}
              onChange={(e) =>
                setRefundForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
              }
            />
            <TextField
              fullWidth
              label={t('dialogs.refundOrder.reason')}
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={refundForm.reason}
              onChange={(e) => setRefundForm((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={() => setRefundDialog(false)}>{t('actions.cancel')}</Button>
            <Button
              onClick={handleRefundOrder}
              variant="contained"
              disabled={refundMutation.isPending}
            >
              {t('dialogs.refundOrder.confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog
          open={cancelDialog}
          onClose={() => setCancelDialog(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>{t('dialogs.cancelOrder.title')}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t('dialogs.cancelOrder.reason')}
              multiline
              rows={3}
              sx={{ mt: { xs: 1, sm: 2 } }}
              value={cancelForm.reason}
              onChange={(e) => setCancelForm((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={() => setCancelDialog(false)}>{t('actions.cancel')}</Button>
            <Button
              onClick={handleCancelOrder}
              variant="contained"
              disabled={cancelMutation.isPending}
            >
              {t('dialogs.cancelOrder.confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Notes Dialog */}
        <Dialog
          open={notesDialog}
          onClose={() => setNotesDialog(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>{t('dialogs.addNotes.title')}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: { xs: 1, sm: 2 } }}>
              <InputLabel>{t('dialogs.addNotes.noteType')}</InputLabel>
              <Select
                value={notesForm.type}
                onChange={(e) =>
                  setNotesForm((prev) => ({
                    ...prev,
                    type: e.target.value as 'customer' | 'admin' | 'internal',
                  }))
                }
                label={t('dialogs.addNotes.noteType')}
              >
                <MenuItem value="admin">{t('dialogs.addNotes.adminNotes')}</MenuItem>
                <MenuItem value="internal">{t('dialogs.addNotes.internalNotes')}</MenuItem>
                <MenuItem value="customer">{t('dialogs.addNotes.customerNotes')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('dialogs.addNotes.notes')}
              multiline
              rows={4}
              sx={{ mt: 2 }}
              value={notesForm.notes}
              onChange={(e) => setNotesForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={() => setNotesDialog(false)}>{t('actions.cancel')}</Button>
            <Button
              onClick={handleAddNotes}
              variant="contained"
              disabled={addNotesMutation.isPending}
            >
              {t('dialogs.addNotes.confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Verify Payment Dialog */}
        <Dialog
          open={verifyPaymentDialog}
          onClose={() => setVerifyPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>{t('dialogs.verifyPayment.title')}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: { xs: 1, sm: 2 } }}>
              {order && (
                <Alert severity="info">
                  {t('dialogs.verifyPayment.requiredAmount', {
                    amount: formatCurrency(order.total, order.currency),
                  })}
                </Alert>
              )}

              <TextField
                label={t('dialogs.verifyPayment.verifiedAmount')}
                type="number"
                value={verifyPaymentForm.verifiedAmount}
                onChange={(e) =>
                  setVerifyPaymentForm({
                    ...verifyPaymentForm,
                    verifiedAmount: parseFloat(e.target.value) || 0,
                  })
                }
                fullWidth
                required
                inputProps={{ step: '0.01', min: 0 }}
              />

              <FormControl fullWidth>
                <InputLabel>{t('dialogs.verifyPayment.currency')}</InputLabel>
                <Select
                  value={verifyPaymentForm.verifiedCurrency}
                  onChange={(e) =>
                    setVerifyPaymentForm({
                      ...verifyPaymentForm,
                      verifiedCurrency: e.target.value as 'YER' | 'SAR' | 'USD',
                    })
                  }
                  label={t('dialogs.verifyPayment.currency')}
                >
                  <MenuItem value="YER">ريال يمني (YER)</MenuItem>
                  <MenuItem value="SAR">ريال سعودي (SAR)</MenuItem>
                  <MenuItem value="USD">دولار (USD)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label={t('dialogs.verifyPayment.notes')}
                value={verifyPaymentForm.notes || ''}
                onChange={(e) =>
                  setVerifyPaymentForm({
                    ...verifyPaymentForm,
                    notes: e.target.value,
                  })
                }
                fullWidth
                multiline
                rows={3}
              />

              {order && verifyPaymentForm.verifiedAmount > 0 && (
                <Alert
                  severity={
                    verifyPaymentForm.verifiedAmount >= order.total ? 'success' : 'warning'
                  }
                >
                  {verifyPaymentForm.verifiedAmount >= order.total
                    ? t('dialogs.verifyPayment.amountSufficient')
                    : t('dialogs.verifyPayment.amountInsufficient', {
                        amount: formatCurrency(
                          order.total - verifyPaymentForm.verifiedAmount,
                          order.currency
                        ),
                      })}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={() => setVerifyPaymentDialog(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleVerifyPayment}
              variant="contained"
              disabled={verifyPaymentMutation.isPending || !verifyPaymentForm.verifiedAmount}
            >
              {t('dialogs.verifyPayment.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};
