import React, { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  LocalShipping,
  Cancel,
  Refresh,
  Visibility,
  ExpandMore,
  CheckCircle,
  Schedule,
  Error,
  Warning,
  Info,
  Person,
  LocationOn,
  Phone,
  Inventory,
  Timeline,
  Notes,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import {
  useOrder,
  useUpdateOrderStatus,
  useShipOrder,
  useRefundOrder,
  useCancelOrder,
  useAddOrderNotes,
} from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import {
  type OrderStatus,
 
  type UpdateOrderStatusDto,
  type ShipOrderDto,
  type RefundOrderDto,
  type CancelOrderDto,
  type AddOrderNotesDto,
  PaymentStatus,
} from '../types/order.types';
import { ar } from 'date-fns/locale';

// Order Status Labels and Colors
const orderStatusLabels: Record<OrderStatus, string> = {
  draft: 'مسودة',
  pending_payment: 'انتظار الدفع',
  confirmed: 'مؤكد',
  payment_failed: 'فشل الدفع',
  processing: 'قيد التجهيز',
  ready_to_ship: 'جاهز للشحن',
  shipped: 'تم الشحن',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التسليم',
  completed: 'مكتمل',
  on_hold: 'معلق',
  cancelled: 'ملغي',
  refunded: 'مسترد',
  partially_refunded: 'مسترد جزئياً',
  returned: 'مرتجع',
};

const orderStatusColors: Record<
  OrderStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  draft: 'default',
  pending_payment: 'warning',
  confirmed: 'info',
  payment_failed: 'error',
  processing: 'primary',
  ready_to_ship: 'secondary',
  shipped: 'info',
  out_for_delivery: 'primary',
  delivered: 'success',
  completed: 'success',
  on_hold: 'warning',
  cancelled: 'error',
  refunded: 'error',
  partially_refunded: 'warning',
  returned: 'error',
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
    case 'completed':
      return <CheckCircle color="success" />;
    case 'shipped':
    case 'out_for_delivery':
      return <LocalShipping color="info" />;
    case 'processing':
    case 'ready_to_ship':
      return <Schedule color="primary" />;
    case 'cancelled':
    case 'refunded':
    case 'returned':
      return <Error color="error" />;
    case 'on_hold':
      return <Warning color="warning" />;
    default:
      return <Info color="info" />;
  }
};

export const OrderDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [activeStep] = useState(0);

  // Dialog states
  const [updateStatusDialog, setUpdateStatusDialog] = useState(false);
  const [shipDialog, setShipDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [notesDialog, setNotesDialog] = useState(false);

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

  const { data: order, isLoading, error } = useOrder(id || '');
  const updateStatusMutation = useUpdateOrderStatus();
  const shipMutation = useShipOrder();
  const refundMutation = useRefundOrder();
  const cancelMutation = useCancelOrder();
  const addNotesMutation = useAddOrderNotes();

  const handleUpdateStatus = async () => {
    if (!id) return;
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

  const getOrderTimeline = () => {
    if (!order) return [];

    const timeline = [
      {
        label: 'تم إنشاء الطلب',
        date: order.createdAt,
        completed: true,
        icon: <CheckCircle />,
      },
      {
        label: 'تم تأكيد الطلب',
        date: order.confirmedAt,
        completed: !!order.confirmedAt,
        icon: <CheckCircle />,
      },
      {
        label: 'قيد التجهيز',
        date: order.processingStartedAt,
        completed: !!order.processingStartedAt,
        icon: <Schedule />,
      },
      {
        label: 'تم الشحن',
        date: order.shippedAt,
        completed: !!order.shippedAt,
        icon: <LocalShipping />,
      },
      {
        label: 'تم التسليم',
        date: order.deliveredAt,
        completed: !!order.deliveredAt,
        icon: <CheckCircle />,
      },
    ];

    return timeline;
  };

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
        <Alert severity="error">{t('orders.messages.error.loadFailed')}</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/orders')}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {t('orders.details.title')} #{order.orderNumber}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              تم إنشاء الطلب في {formatDate(order.createdAt)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setUpdateStatusDialog(true)}
            >
              تحديث الحالة
            </Button>
            <Button
              variant="outlined"
              startIcon={<LocalShipping />}
              onClick={() => setShipDialog(true)}
              disabled={!['processing', 'ready_to_ship'].includes(order.status)}
            >
              شحن الطلب
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => setRefundDialog(true)}
              disabled={!['delivered', 'completed'].includes(order.status)}
            >
              استرداد
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => setCancelDialog(true)}
              disabled={['cancelled', 'delivered', 'completed'].includes(order.status)}
            >
              إلغاء الطلب
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Order Overview */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Info />
                  نظرة عامة على الطلب
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        حالة الطلب
                      </Typography>
                      <Chip
                        label={orderStatusLabels[order.status]}
                        color={orderStatusColors[order.status]}
                        icon={getStatusIcon(order.status)}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        حالة الدفع
                      </Typography>
                      <Chip
                        label={t(`orders.paymentStatus.${order.paymentStatus}`)}
                        color={order.paymentStatus === PaymentStatus.PAID ? 'success' : 'warning'}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        طريقة الدفع
                      </Typography>
                      <Chip label={t(`orders.paymentMethod.${order.paymentMethod}`)} variant="outlined" />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        المجموع
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(order.total, order.currency)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Inventory />
                  منتجات الطلب
                </Typography>
                <List>
                  {order.items.map((item, index) => (
                    <ListItem key={index} divider>
                      <Avatar src={item.snapshot.image} sx={{ mr: 2, width: 56, height: 56 }}>
                        {item.snapshot.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={item.snapshot.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              الكمية: {item.qty} | السعر:{' '}
                              {formatCurrency(item.finalPrice, order.currency)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              المجموع: {formatCurrency(item.lineTotal, order.currency)}
                            </Typography>
                            {item.snapshot.attributes && (
                              <Box sx={{ mt: 1 }}>
                                {Object.entries(item.snapshot.attributes).map(([key, value]) => (
                                  <Chip
                                    key={key}
                                    label={`${key}: ${value}`}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Timeline />
                  تتبع الطلب
                </Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {getOrderTimeline().map((step, index) => (
                    <Step key={index}>
                      <StepLabel
                        icon={step.icon}
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: step.completed ? 'success.main' : 'text.secondary',
                          },
                        }}
                      >
                        {step.label}
                      </StepLabel>
                      <StepContent>
                        {step.date && (
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(step.date)}
                          </Typography>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Details Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Customer Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Person />
                  معلومات العميل
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText primary="الاسم" secondary={order.deliveryAddress.recipientName} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="الهاتف"
                      secondary={order.deliveryAddress.recipientPhone}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocationOn />
                  عنوان التوصيل
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {order.deliveryAddress.recipientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddress.line1}
                  </Typography>
                  {order.deliveryAddress.line2 && (
                    <Typography variant="body2" color="text.secondary">
                      {order.deliveryAddress.line2}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddress.city}, {order.deliveryAddress.country}
                  </Typography>
                  {order.deliveryAddress.postalCode && (
                    <Typography variant="body2" color="text.secondary">
                      الرمز البريدي: {order.deliveryAddress.postalCode}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocalShipping />
                  معلومات الشحن
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="شركة الشحن"
                      secondary={order.shippingCompany || 'غير محدد'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="رقم التتبع"
                      secondary={order.trackingNumber || 'غير محدد'}
                    />
                  </ListItem>
                  {order.trackingUrl && (
                    <ListItem>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => window.open(order.trackingUrl, '_blank')}
                      >
                        تتبع الطلب
                      </Button>
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemText
                      primary="التاريخ المتوقع للتسليم"
                      secondary={
                        order.estimatedDeliveryDate
                          ? formatDate(order.estimatedDeliveryDate)
                          : 'غير محدد'
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardContent>
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
                    الملاحظات
                  </Typography>
                  <IconButton size="small" onClick={() => setNotesDialog(true)}>
                    <Edit />
                  </IconButton>
                </Box>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">ملاحظات العميل</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {order.customerNotes || 'لا توجد ملاحظات من العميل'}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">ملاحظات الإدارة</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {order.adminNotes || 'لا توجد ملاحظات إدارية'}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">ملاحظات داخلية</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {order.internalNotes || 'لا توجد ملاحظات داخلية'}
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
        >
          <DialogTitle>تحديث حالة الطلب</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>الحالة الجديدة</InputLabel>
              <Select
                value={statusForm.status}
                onChange={(e) =>
                  setStatusForm((prev) => ({ ...prev, status: e.target.value as OrderStatus }))
                }
                label="الحالة الجديدة"
              >
                {Object.entries(orderStatusLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="ملاحظات (اختياري)"
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={statusForm.notes || ''}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUpdateStatusDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              disabled={updateStatusMutation.isPending}
            >
              تحديث
            </Button>
          </DialogActions>
        </Dialog>

        {/* Ship Order Dialog */}
        <Dialog open={shipDialog} onClose={() => setShipDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>شحن الطلب</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="شركة الشحن"
              sx={{ mt: 2 }}
              value={shipForm.shippingCompany}
              onChange={(e) =>
                setShipForm((prev) => ({ ...prev, shippingCompany: e.target.value }))
              }
            />
            <TextField
              fullWidth
              label="رقم التتبع"
              sx={{ mt: 2 }}
              value={shipForm.trackingNumber}
              onChange={(e) => setShipForm((prev) => ({ ...prev, trackingNumber: e.target.value }))}
            />
            <TextField
              fullWidth
              label="رابط التتبع (اختياري)"
              sx={{ mt: 2 }}
              value={shipForm.trackingUrl || ''}
              onChange={(e) => setShipForm((prev) => ({ ...prev, trackingUrl: e.target.value }))}
            />
            <DatePicker
              label="التاريخ المتوقع للتسليم"
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
              label="ملاحظات (اختياري)"
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={shipForm.notes || ''}
              onChange={(e) => setShipForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShipDialog(false)}>إلغاء</Button>
            <Button onClick={handleShipOrder} variant="contained" disabled={shipMutation.isPending}>
              شحن الطلب
            </Button>
          </DialogActions>
        </Dialog>

        {/* Refund Order Dialog */}
        <Dialog open={refundDialog} onClose={() => setRefundDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>استرداد الطلب</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="مبلغ الاسترداد"
              type="number"
              sx={{ mt: 2 }}
              value={refundForm.amount}
              onChange={(e) =>
                setRefundForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
              }
            />
            <TextField
              fullWidth
              label="سبب الاسترداد"
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={refundForm.reason}
              onChange={(e) => setRefundForm((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRefundDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleRefundOrder}
              variant="contained"
              disabled={refundMutation.isPending}
            >
              استرداد
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>إلغاء الطلب</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="سبب الإلغاء"
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={cancelForm.reason}
              onChange={(e) => setCancelForm((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleCancelOrder}
              variant="contained"
              disabled={cancelMutation.isPending}
            >
              إلغاء الطلب
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Notes Dialog */}
        <Dialog open={notesDialog} onClose={() => setNotesDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>إضافة ملاحظات</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>نوع الملاحظة</InputLabel>
              <Select
                value={notesForm.type}
                onChange={(e) =>
                  setNotesForm((prev) => ({
                    ...prev,
                    type: e.target.value as 'customer' | 'admin' | 'internal',
                  }))
                }
                label="نوع الملاحظة"
              >
                <MenuItem value="admin">ملاحظات إدارية</MenuItem>
                <MenuItem value="internal">ملاحظات داخلية</MenuItem>
                <MenuItem value="customer">ملاحظات العميل</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="الملاحظة"
              multiline
              rows={4}
              sx={{ mt: 2 }}
              value={notesForm.notes}
              onChange={(e) => setNotesForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotesDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleAddNotes}
              variant="contained"
              disabled={addNotesMutation.isPending}
            >
              إضافة الملاحظة
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};
