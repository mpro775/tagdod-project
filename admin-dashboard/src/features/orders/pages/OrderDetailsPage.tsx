import React, { useState, useEffect, useMemo } from 'react';
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
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Menu,
  Tooltip,
  Paper,
  Divider,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  CheckCircle,
  MoreVert,
  KeyboardArrowDown,
  CreditCard,
  Email,
  AssignmentReturn,
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
  useSendInvoice,
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
import { OrderTimeline, OrderStatusChip, RatingCard } from '../components';
import { useUser } from '@/features/users/hooks/useUsers';

export const OrderDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('orders');
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

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
    reason: '',
    isFullRefund: false,
    items: [],
  });
  const [refundDialogTab, setRefundDialogTab] = useState<'full' | 'partial'>('full');
  const [selectedReturnItems, setSelectedReturnItems] = useState<Record<string, number>>({});
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
  const sendInvoiceMutation = useSendInvoice();
  const { data: customer, isLoading: isCustomerLoading } = useUser(order?.userId ?? '');

  // Helper function to round to 2 decimal places
  const roundToTwoDecimals = (value: number): number => {
    return Math.round(value * 100) / 100;
  };

  // Quick payment verification handler - يفتح dialog مع ملء المبلغ تلقائياً
  const handleQuickVerifyPayment = () => {
    if (!order) return;

    // ملء المبلغ المطلوب تلقائياً
    setVerifyPaymentForm({
      verifiedAmount: roundToTwoDecimals(order.total),
      verifiedCurrency: (order.currency || 'YER') as 'YER' | 'SAR' | 'USD',
      notes: '',
    });

    setVerifyPaymentDialog(true);
  };

  // Get next available statuses based on backend state machine logic
  const getNextAvailableStatuses = useMemo(() => {
    if (!order) return [];

    const currentStatus = order.status;
    const isPaid = order.paymentStatus === PaymentStatus.PAID;

    // State machine transitions from backend
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED,
        OrderStatus.OUT_OF_STOCK,
      ],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [
        OrderStatus.COMPLETED,
        OrderStatus.RETURNED,
        OrderStatus.ON_HOLD,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.ON_HOLD]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.OUT_OF_STOCK]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
    };

    // Get valid next states from state machine
    const validNextStates = transitions[currentStatus] || [];

    // Filter based on payment requirements
    const statusesRequiringPayment = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.COMPLETED,
    ];

    return validNextStates.filter((status) => {
      // Don't show if payment required but not paid (except CANCELLED)
      if (
        statusesRequiringPayment.includes(status) &&
        status !== OrderStatus.CANCELLED &&
        !isPaid
      ) {
        return false;
      }
      return true;
    });
  }, [order]);

  // Get quick actions based on order status and backend logic
  const getQuickActions = useMemo(() => {
    if (!order) return [];

    const actions: Array<{
      label: string;
      icon: React.ReactNode;
      color: 'primary' | 'success' | 'warning' | 'error';
      onClick: () => void;
      priority?: number; // للترتيب حسب الأولوية
    }> = [];

    const currentStatus = order.status;
    const paymentStatus = order.paymentStatus;
    const isPaid = paymentStatus === PaymentStatus.PAID;
    const isBankTransfer = order.paymentMethod === PaymentMethod.BANK_TRANSFER;
    const hasLocalPaymentAccount = !!order.localPaymentAccountId;

    // 1. التحقق من الدفع (أولوية عالية) - فقط للطلبات في انتظار الدفع
    if (
      currentStatus === OrderStatus.PENDING_PAYMENT &&
      isBankTransfer &&
      hasLocalPaymentAccount &&
      paymentStatus === PaymentStatus.PENDING
    ) {
      actions.push({
        label: t('actions.verifyPayment', { defaultValue: 'التحقق من الدفع' }),
        icon: <CreditCard />,
        color: 'primary',
        priority: 1,
        onClick: handleQuickVerifyPayment,
      });
    }

    // 2. تأكيد الطلب - بعد التحقق من الدفع أو إذا كان الدفع مكتملاً
    if (currentStatus === OrderStatus.PENDING_PAYMENT && isPaid) {
      actions.push({
        label: t('actions.confirmOrder', { defaultValue: 'تأكيد الطلب' }),
        icon: <CheckCircle />,
        color: 'success',
        priority: 2,
        onClick: async () => {
          if (!id) return;
          try {
            await updateStatusMutation.mutateAsync({
              id,
              data: { status: OrderStatus.CONFIRMED },
            });
          } catch (error) {
            console.error('Confirm order failed:', error);
          }
        },
      });
    }

    // 3. بدء التجهيز - من حالة CONFIRMED
    if (currentStatus === OrderStatus.CONFIRMED && isPaid) {
      actions.push({
        label: t('actions.startProcessing', { defaultValue: 'بدء التجهيز' }),
        icon: <LocalShipping />,
        color: 'primary',
        priority: 3,
        onClick: async () => {
          if (!id) return;
          try {
            await updateStatusMutation.mutateAsync({
              id,
              data: { status: OrderStatus.PROCESSING },
            });
          } catch (error) {
            console.error('Start processing failed:', error);
          }
        },
      });
    }

    // 4. إعادة التجهيز - من حالة ON_HOLD
    if (currentStatus === OrderStatus.ON_HOLD && isPaid) {
      actions.push({
        label: t('actions.resumeProcessing', { defaultValue: 'إعادة التجهيز' }),
        icon: <LocalShipping />,
        color: 'primary',
        priority: 4,
        onClick: async () => {
          if (!id) return;
          try {
            await updateStatusMutation.mutateAsync({
              id,
              data: { status: OrderStatus.PROCESSING },
            });
          } catch (error) {
            console.error('Resume processing failed:', error);
          }
        },
      });
    }

    // 5. شحن الطلب - من حالة PROCESSING
    if (currentStatus === OrderStatus.PROCESSING) {
      actions.push({
        label: t('actions.shipOrder'),
        icon: <LocalShipping />,
        color: 'success',
        priority: 5,
        onClick: () => setShipDialog(true),
      });
    }

    // 6. إتمام الطلب - من حالة PROCESSING
    if (currentStatus === OrderStatus.PROCESSING && isPaid) {
      actions.push({
        label: t('actions.completeOrder', { defaultValue: 'إتمام الطلب' }),
        icon: <CheckCircle />,
        color: 'success',
        priority: 6,
        onClick: async () => {
          if (!id) return;
          try {
            await updateStatusMutation.mutateAsync({
              id,
              data: { status: OrderStatus.COMPLETED },
            });
          } catch (error) {
            console.error('Complete order failed:', error);
          }
        },
      });
    }

    // 7. إرجاع الطلب - من حالة PROCESSING
    if (currentStatus === OrderStatus.PROCESSING) {
      actions.push({
        label: t('actions.returnOrder', { defaultValue: 'إرجاع الطلب' }),
        icon: <Refresh />,
        color: 'warning',
        priority: 7,
        onClick: async () => {
          if (!id) return;
          try {
            await updateStatusMutation.mutateAsync({
              id,
              data: { status: OrderStatus.RETURNED },
            });
          } catch (error) {
            console.error('Return order failed:', error);
          }
        },
      });
    }

    // 8. استرداد المبلغ - من حالة COMPLETED أو RETURNED
    if ([OrderStatus.COMPLETED, OrderStatus.RETURNED].includes(currentStatus)) {
      actions.push({
        label: t('actions.refundOrder'),
        icon: <Refresh />,
        color: 'warning',
        priority: 8,
        onClick: () => setRefundDialog(true),
      });
    }

    // 9. استرداد نهائي - من حالة RETURNED
    if (currentStatus === OrderStatus.RETURNED) {
      actions.push({
        label: t('actions.markRefunded', { defaultValue: 'تسجيل الاسترداد' }),
        icon: <Refresh />,
        color: 'warning',
        priority: 9,
        onClick: async () => {
          if (!id) return;
          try {
            await updateStatusMutation.mutateAsync({
              id,
              data: { status: OrderStatus.REFUNDED },
            });
          } catch (error) {
            console.error('Mark refunded failed:', error);
          }
        },
      });
    }

    // 10. إرسال فاتورة يدوياً - متاح لجميع الطلبات المؤكدة أو المكتملة
    if (
      [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.COMPLETED].includes(currentStatus)
    ) {
      actions.push({
        label: t('actions.sendInvoice', { defaultValue: 'إرسال الفاتورة' }),
        icon: <Email />,
        color: 'primary',
        priority: 11,
        onClick: async () => {
          if (!id) return;
          try {
            await sendInvoiceMutation.mutateAsync(id);
          } catch (error) {
            console.error('Send invoice failed:', error);
          }
        },
      });
    }

    // 11. إلغاء الطلب - من الحالات المسموح إلغاؤها
    const cancellableStatuses = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.ON_HOLD,
    ];

    if (cancellableStatuses.includes(currentStatus)) {
      actions.push({
        label: t('actions.cancelOrder'),
        icon: <Cancel />,
        color: 'error',
        priority: 12,
        onClick: () => setCancelDialog(true),
      });
    }

    // ترتيب الإجراءات حسب الأولوية
    return actions.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  }, [order, id, t, updateStatusMutation, handleQuickVerifyPayment, sendInvoiceMutation]);

  // Handle status change from chip
  const handleStatusChipClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusSelect = async (newStatus: OrderStatus) => {
    if (!id || !order) return;

    setStatusMenuAnchor(null);

    // Check payment requirement
    const statusesRequiringPayment = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.COMPLETED,
    ];

    if (
      statusesRequiringPayment.includes(newStatus) &&
      order.paymentStatus !== PaymentStatus.PAID
    ) {
      toast.error(`لا يمكن تغيير حالة الطلب إلى ${t(`status.${newStatus}`)} بدون إتمام الدفع.`);
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error('Update status failed:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !order) return;

    // التحقق من الدفع قبل السماح بتغيير الحالة
    const statusesRequiringPayment = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.COMPLETED,
    ];

    // استثناء CANCELLED من التحقق
    if (
      statusesRequiringPayment.includes(statusForm.status) &&
      statusForm.status !== OrderStatus.CANCELLED &&
      order.paymentStatus !== PaymentStatus.PAID
    ) {
      // إظهار تحذير للمستخدم
      toast.error(
        `لا يمكن تغيير حالة الطلب إلى ${t(
          `status.${statusForm.status}`
        )} بدون إتمام الدفع. حالة الدفع الحالية: ${t(`payment.status.${order.paymentStatus}`)}`
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

  // Calculate refund amount from selected items
  const calculateRefundAmount = useMemo(() => {
    if (!order) return 0;
    if (refundForm.isFullRefund) {
      return order.total;
    }
    if (selectedReturnItems && Object.keys(selectedReturnItems).length > 0) {
      return order.items.reduce((total, item) => {
        const returnQty = selectedReturnItems[item.variantId] || 0;
        if (returnQty > 0) {
          // Calculate proportional refund based on item's share of total
          const itemShare = item.lineTotal / order.subtotal;
          const refundAmount = (order.total * itemShare * returnQty) / item.qty;
          return total + refundAmount;
        }
        return total;
      }, 0);
    }
    return refundForm.amount || 0;
  }, [order, selectedReturnItems, refundForm.isFullRefund, refundForm.amount]);

  // Get available return quantity for an item
  const getAvailableReturnQty = (item: any) => {
    return item.qty - (item.returnQty || 0);
  };

  const handleRefundOrder = async () => {
    if (!id || !order) return;

    // Validate form
    if (!refundForm.reason || refundForm.reason.trim().length < 3) {
      toast.error(
        t('dialogs.refundOrder.reasonRequired', { defaultValue: 'يجب إدخال سبب الإرجاع' })
      );
      return;
    }

    try {
      const refundData: RefundOrderDto = {
        reason: refundForm.reason,
      };

      if (refundForm.isFullRefund) {
        refundData.isFullRefund = true;
        refundData.amount = order.total;
      } else {
        // Partial refund with items
        const items = Object.entries(selectedReturnItems)
          .filter(([_, qty]) => qty > 0)
          .map(([variantId, qty]) => ({ variantId, qty }));

        if (items.length === 0) {
          toast.error(
            t('dialogs.refundOrder.itemsRequired', { defaultValue: 'يجب اختيار أصناف للإرجاع' })
          );
          return;
        }

        refundData.items = items;
        refundData.amount = calculateRefundAmount;
      }

      await refundMutation.mutateAsync({ id, data: refundData });
      setRefundDialog(false);
      setSelectedReturnItems({});
      setRefundForm({ reason: '', isFullRefund: false, items: [] });
      toast.success(t('dialogs.refundOrder.success', { defaultValue: 'تم إرجاع الطلب بنجاح' }));
    } catch (error) {
      console.error('Refund order failed:', error);
      toast.error(t('dialogs.refundOrder.error', { defaultValue: 'فشل إرجاع الطلب' }));
    }
  };

  // Reset refund dialog when opened/closed
  useEffect(() => {
    if (refundDialog && order) {
      setRefundForm({ reason: '', isFullRefund: false, items: [] });
      setSelectedReturnItems({});
      setRefundDialogTab('full');
    }
  }, [refundDialog, order]);

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
      // التأكد من تقريب المبلغ قبل الإرسال
      const roundedAmount = roundToTwoDecimals(verifyPaymentForm.verifiedAmount);
      await verifyPaymentMutation.mutateAsync({
        id,
        data: {
          ...verifyPaymentForm,
          verifiedAmount: roundedAmount,
        },
      });
      setVerifyPaymentDialog(false);
      setVerifyPaymentForm({
        verifiedAmount: 0,
        verifiedCurrency: (order?.currency as 'YER' | 'SAR' | 'USD') || 'YER',
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
        const initialAmount = order.verifiedPaymentAmount || order.total || 0;
        setVerifyPaymentForm({
          verifiedAmount: roundToTwoDecimals(initialAmount),
          verifiedCurrency: (order.verifiedPaymentCurrency || order.currency || 'YER') as
            | 'YER'
            | 'SAR'
            | 'USD',
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

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const deliveryAddress = order?.deliveryAddress;
  const addressLabel = (deliveryAddress as { label?: string } | undefined)?.label;
  const customerNameFromUser = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const displayCustomerName =
    customerNameFromUser ||
    deliveryAddress?.recipientName ||
    addressLabel ||
    t('details.unknownCustomer', { defaultValue: 'عميل غير معروف' });
  const displayCustomerPhone =
    customer?.phone ||
    deliveryAddress?.recipientPhone ||
    t('details.noPhoneAvailable', { defaultValue: 'لا يوجد رقم هاتف' });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Enhanced Header with Quick Actions */}
        <Box
          sx={{
            mb: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Title Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
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

            {/* Unified Action Menu */}
            {!isMobile && (
              <Tooltip title={t('actions.moreActions', { defaultValue: 'المزيد من الإجراءات' })}>
                <IconButton
                  onClick={(e) => setActionMenuAnchor(e.currentTarget)}
                  sx={{ ml: 'auto' }}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Quick Actions Bar */}
          {getQuickActions.length > 0 && (
            <Paper
              elevation={2}
              sx={{
                p: 1.5,
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 'bold', mr: 1 }}
                >
                  {t('actions.quickActions', { defaultValue: 'إجراءات سريعة' })}:
                </Typography>
                {getQuickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="contained"
                    color={action.color}
                    size="small"
                    startIcon={action.icon}
                    onClick={action.onClick}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Paper>
          )}

          {/* Status Overview with Inline Change */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'grey.50',
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {t('details.orderStatus')}
              </Typography>
              <Tooltip title={t('actions.clickToChange', { defaultValue: 'انقر لتغيير الحالة' })}>
                <Chip
                  label={t(`status.${order.status}`)}
                  onClick={handleStatusChipClick}
                  icon={<KeyboardArrowDown />}
                  color={
                    order.status === OrderStatus.COMPLETED
                      ? 'success'
                      : order.status === OrderStatus.CANCELLED
                      ? 'error'
                      : order.status === OrderStatus.PROCESSING
                      ? 'primary'
                      : 'default'
                  }
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                />
              </Tooltip>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {t('details.paymentStatus')}
              </Typography>
              <Chip
                label={t(`payment.status.${order.paymentStatus}`)}
                color={order.paymentStatus === PaymentStatus.PAID ? 'success' : 'warning'}
              />
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {t('details.total')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(order.total, order.currency)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Status Change Menu */}
        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={() => setStatusMenuAnchor(null)}
          PaperProps={{
            sx: { minWidth: 200, maxHeight: 400 },
          }}
        >
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              {t('actions.selectNewStatus', { defaultValue: 'اختر الحالة الجديدة' })}
            </Typography>
          </MenuItem>
          <Divider />
          {getNextAvailableStatuses.map((status) => {
            const requiresPayment =
              [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.COMPLETED].includes(
                status
              ) && order?.paymentStatus !== PaymentStatus.PAID;

            return (
              <MenuItem
                key={status}
                onClick={() => handleStatusSelect(status)}
                disabled={requiresPayment}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography>{t(`status.${status}`)}</Typography>
                  {requiresPayment && (
                    <Tooltip
                      title={t('actions.paymentRequired', { defaultValue: 'يتطلب إتمام الدفع' })}
                    >
                      <Warning fontSize="small" color="warning" />
                    </Tooltip>
                  )}
                </Box>
              </MenuItem>
            );
          })}
        </Menu>

        {/* Unified Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => setActionMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setActionMenuAnchor(null);
              setUpdateStatusDialog(true);
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.updateStatus')}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setActionMenuAnchor(null);
              setShipDialog(true);
            }}
            disabled={order.status !== OrderStatus.PROCESSING}
          >
            <ListItemIcon>
              <LocalShipping fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.shipOrder')}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setActionMenuAnchor(null);
              setRefundDialog(true);
            }}
            disabled={![OrderStatus.COMPLETED, OrderStatus.RETURNED].includes(order.status)}
          >
            <ListItemIcon>
              <Refresh fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.refundOrder')}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setActionMenuAnchor(null);
              setCancelDialog(true);
            }}
            disabled={[
              OrderStatus.CANCELLED,
              OrderStatus.COMPLETED,
              OrderStatus.RETURNED,
              OrderStatus.REFUNDED,
            ].includes(order.status)}
          >
            <ListItemIcon>
              <Cancel fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.cancelOrder')}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setActionMenuAnchor(null);
              setNotesDialog(true);
            }}
          >
            <ListItemIcon>
              <Notes fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.addNotes', { defaultValue: 'إضافة ملاحظات' })}</ListItemText>
          </MenuItem>
        </Menu>

        {/* Mobile Actions - Simplified */}
        {isMobile && (
          <Button
            variant="contained"
            fullWidth
            startIcon={<Edit />}
            onClick={() => setMobileActionsOpen(true)}
          >
            {t('actions.updateStatus')}
          </Button>
        )}

        {/* Mobile Actions Drawer */}
        {isMobile && (
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
                  disabled={order.status !== OrderStatus.PROCESSING}
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
                  disabled={![OrderStatus.COMPLETED, OrderStatus.RETURNED].includes(order.status)}
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
                  disabled={[
                    OrderStatus.CANCELLED,
                    OrderStatus.COMPLETED,
                    OrderStatus.RETURNED,
                    OrderStatus.REFUNDED,
                  ].includes(order.status)}
                >
                  {t('actions.cancelOrder')}
                </Button>
              </Stack>
            </Box>
          </Drawer>
        )}

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
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {t('details.orderStatus')}
                      </Typography>
                      <OrderStatusChip status={order.status} size={isMobile ? 'small' : 'medium'} />
                    </Box>
                  </Grid>
                  {/* Note: Status can be changed inline from the header Quick Actions */}
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {t('details.paymentStatus')}
                      </Typography>
                      <Chip
                        label={t(`payment.status.${order.paymentStatus}`)}
                        color={order.paymentStatus === PaymentStatus.PAID ? 'success' : 'warning'}
                        size={isMobile ? 'small' : 'medium'}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {t('details.paymentMethod')}
                      </Typography>
                      <Chip
                        label={
                          order.localPaymentAccountType === 'wallet' &&
                          order.paymentMethod === PaymentMethod.BANK_TRANSFER
                            ? t('payment.method.WALLET', { defaultValue: 'محفظة' })
                            : order.localPaymentAccountType === 'bank' &&
                              order.paymentMethod === PaymentMethod.BANK_TRANSFER
                            ? t('payment.method.BANK_TRANSFER', { defaultValue: 'تحويل بنكي' })
                            : t(`payment.method.${order.paymentMethod}`)
                        }
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        color={order.localPaymentAccountType === 'wallet' ? 'primary' : undefined}
                      />
                      {order.paymentMethod === PaymentMethod.BANK_TRANSFER &&
                        order.localPaymentProviderName && (
                          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                            {order.localPaymentProviderName}
                          </Typography>
                        )}
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
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
                  {orderItems.map((item, index) => {
                    const isReturned = item.isReturned || item.returnQty > 0;
                    const isFullyReturned = item.returnQty >= item.qty;
                    const isPartiallyReturned = item.returnQty > 0 && item.returnQty < item.qty;

                    return (
                      <ListItem
                        key={index}
                        divider
                        sx={{
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          py: { xs: 1.5, sm: 2 },
                          bgcolor: isReturned
                            ? theme.palette.mode === 'dark'
                              ? 'rgba(255, 152, 0, 0.08)'
                              : 'rgba(255, 152, 0, 0.05)'
                            : 'transparent',
                          borderLeft: isReturned
                            ? `4px solid ${theme.palette.warning.main}`
                            : 'none',
                          pl: isReturned ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 3 },
                        }}
                      >
                        <Avatar
                          src={item.snapshot.image}
                          sx={{
                            mr: { xs: 0, sm: 2 },
                            mb: { xs: 1, sm: 0 },
                            width: { xs: 48, sm: 56 },
                            height: { xs: 48, sm: 56 },
                            opacity: isFullyReturned ? 0.6 : 1,
                          }}
                        >
                          {item.snapshot.name.charAt(0)}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Typography
                                variant={isMobile ? 'body2' : 'body1'}
                                sx={{
                                  fontWeight: 'medium',
                                  mb: 0.5,
                                  textDecoration: isFullyReturned ? 'line-through' : 'none',
                                  opacity: isFullyReturned ? 0.7 : 1,
                                }}
                              >
                                {item.snapshot.name}
                              </Typography>
                              {isReturned && (
                                <Chip
                                  icon={<Refresh />}
                                  label={
                                    isFullyReturned
                                      ? t('details.fullyReturned', {
                                          defaultValue: '↩️ مرتجع بالكامل',
                                        })
                                      : t('details.partiallyReturned', {
                                          defaultValue: '↩️ مرتجع جزئياً',
                                        })
                                  }
                                  size="small"
                                  color="warning"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}
                              >
                                {t('details.quantity', { defaultValue: 'الكمية' })}:{' '}
                                {isPartiallyReturned ? (
                                  <span>
                                    {item.qty} ({t('details.returned', { defaultValue: 'مرتجع' })}:{' '}
                                    <strong style={{ color: theme.palette.warning.main }}>
                                      {item.returnQty}
                                    </strong>
                                    )
                                  </span>
                                ) : (
                                  item.qty
                                )}{' '}
                                | {t('details.price', { defaultValue: 'السعر' })}:{' '}
                                {formatCurrency(item.finalPrice, order.currency)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                {t('details.lineTotal', { defaultValue: 'المجموع' })}:{' '}
                                {formatCurrency(item.lineTotal, order.currency)}
                              </Typography>
                              {isReturned && item.returnReason && (
                                <Typography
                                  variant="caption"
                                  color="warning.main"
                                  sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
                                >
                                  {t('details.returnReason', { defaultValue: 'سبب الإرجاع' })}:{' '}
                                  {item.returnReason}
                                </Typography>
                              )}
                              {/* Variant Attributes - Professional Display */}
                              {item.snapshot.variantAttributes &&
                                item.snapshot.variantAttributes.length > 0 && (
                                  <Box sx={{ mt: 1.5 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: 'block',
                                        mb: 1,
                                        fontWeight: 'medium',
                                        color: 'text.secondary',
                                      }}
                                    >
                                      {t('details.variantAttributes', {
                                        defaultValue: 'السمات المختارة',
                                      })}
                                      :
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        p: 1.5,
                                        bgcolor:
                                          theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'grey.50',
                                        borderRadius: 1,
                                        border: `1px solid ${theme.palette.divider}`,
                                      }}
                                    >
                                      {item.snapshot.variantAttributes.map((attr, attrIndex) => (
                                        <Box
                                          key={attrIndex}
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 'bold',
                                              color: 'primary.main',
                                              minWidth: 'fit-content',
                                            }}
                                          >
                                            {attr.attributeName || attr.attributeNameEn || 'سمة'}:
                                          </Typography>
                                          <Chip
                                            label={attr.value || attr.valueEn || 'غير محدد'}
                                            size="small"
                                            sx={{
                                              bgcolor:
                                                theme.palette.mode === 'dark'
                                                  ? 'rgba(255, 255, 255, 0.12)'
                                                  : 'background.paper',
                                              border: `1px solid ${theme.palette.primary.main}20`,
                                              fontWeight: 'medium',
                                              '& .MuiChip-label': {
                                                px: 1.5,
                                              },
                                            }}
                                          />
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              {/* Fallback to old attributes format for backward compatibility */}
                              {(!item.snapshot.variantAttributes ||
                                item.snapshot.variantAttributes.length === 0) &&
                                item.snapshot.attributes && (
                                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {Object.entries(item.snapshot.attributes).map(
                                      ([key, value]) => (
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
                                      )
                                    )}
                                  </Box>
                                )}
                            </Box>
                          }
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>

            {/* Return Summary */}
            {order.returnInfo?.isReturned && (
              <Card
                sx={{
                  mb: { xs: 2, md: 3 },
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                  border: `2px solid ${theme.palette.warning.main}40`,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <AssignmentReturn />
                    {t('details.returnSummary', { defaultValue: 'ملخص الإرجاع' })}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 152, 0, 0.1)'
                              : 'rgba(255, 152, 0, 0.05)',
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {t('details.returnAmount', { defaultValue: 'المبلغ المرتجع' })}
                        </Typography>
                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(
                            order.returnInfo.returnAmount || order.returnInfo.refundAmount || 0,
                            order.currency
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 152, 0, 0.1)'
                              : 'rgba(255, 152, 0, 0.05)',
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {t('details.returnedItemsCount', {
                            defaultValue: 'عدد الأصناف المرتجعة',
                          })}
                        </Typography>
                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                          {
                            order.items.filter((item) => item.isReturned || item.returnQty > 0)
                              .length
                          }{' '}
                          / {order.items.length}
                        </Typography>
                      </Box>
                    </Grid>
                    {order.returnInfo.returnReason && (
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor:
                              theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'grey.50',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {t('details.returnReason', { defaultValue: 'سبب الإرجاع' })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.returnInfo.returnReason}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {order.returnInfo.returnedAt && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('details.returnedAt', { defaultValue: 'تاريخ الإرجاع' })}:{' '}
                          {formatDate(order.returnInfo.returnedAt)}
                        </Typography>
                      </Grid>
                    )}
                    {order.returnInfo.returnedBy && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('details.returnedBy', { defaultValue: 'تم الإرجاع بواسطة' })}:{' '}
                          {order.returnInfo.returnedBy}
                        </Typography>
                      </Grid>
                    )}
                    {order.returnInvoiceUrl && (
                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<Visibility />}
                          onClick={() => window.open(order.returnInvoiceUrl, '_blank')}
                          fullWidth
                        >
                          {t('details.viewReturnInvoice', { defaultValue: 'عرض فاتورة الإرجاع' })}
                          {order.returnInvoiceNumber && ` (${order.returnInvoiceNumber})`}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Discounts & Coupons Breakdown */}
            {(order.itemsDiscount > 0 ||
              (order.couponDiscount ?? 0) > 0 ||
              (order.appliedCoupons?.length ?? 0) > 0) && (
              <Card
                sx={{
                  mb: { xs: 2, md: 3 },
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
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
                    <Box
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor:
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {t('details.itemsDiscount', {
                          defaultValue: 'خصم المنتجات (من العروض الترويجية)',
                        })}
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
                        {t('details.appliedCoupons', { defaultValue: 'الكوبونات المطبقة' })} (
                        {order.appliedCoupons.length})
                      </Typography>
                      <Stack spacing={1.5}>
                        {order.appliedCoupons.map((coupon, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              bgcolor:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.05)'
                                  : 'grey.50',
                              borderRadius: 1,
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 0.5,
                              }}
                            >
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
                                label={formatCurrency(
                                  coupon.details.discountAmount,
                                  order.currency
                                )}
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
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {t('details.totalCouponDiscount', {
                              defaultValue: 'إجمالي خصم الكوبونات',
                            })}
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
                      <Box
                        sx={{
                          p: 2,
                          bgcolor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {order.appliedCouponCode || order.couponDetails?.code
                            ? `${t('details.coupon', { defaultValue: 'كوبون' })}: ${
                                order.appliedCouponCode || order.couponDetails?.code
                              }`
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
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
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

            {/* Rating Card */}
            <RatingCard
              ratingInfo={order.ratingInfo || {}}
              orderNumber={order.orderNumber}
              orderStatus={order.status}
              orderTotal={order.total}
              orderCurrency={order.currency}
              ratedAt={order.ratingInfo?.ratedAt}
            />
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
                      secondary={
                        isCustomerLoading
                          ? t('details.loadingCustomer', {
                              defaultValue: 'جاري تحميل بيانات العميل...',
                            })
                          : displayCustomerName
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('details.phone')}
                      secondary={
                        isCustomerLoading
                          ? t('details.loadingCustomer', {
                              defaultValue: 'جاري تحميل بيانات العميل...',
                            })
                          : displayCustomerPhone
                      }
                    />
                  </ListItem>
                  {!customer && (
                    <ListItem>
                      <ListItemText
                        primary={t('details.customerId', { defaultValue: 'معرف العميل' })}
                        secondary={order.userId}
                      />
                    </ListItem>
                  )}
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
                {deliveryAddress ? (
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {deliveryAddress.recipientName || addressLabel || displayCustomerName}
                    </Typography>
                    {deliveryAddress.line1 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {deliveryAddress.line1}
                      </Typography>
                    )}
                    {deliveryAddress.line2 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {deliveryAddress.line2}
                      </Typography>
                    )}
                    {(deliveryAddress.city ||
                      deliveryAddress.region ||
                      deliveryAddress.country) && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {[deliveryAddress.city, deliveryAddress.region, deliveryAddress.country]
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    )}
                    {deliveryAddress.postalCode && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {t('details.postalCode')}: {deliveryAddress.postalCode}
                      </Typography>
                    )}
                    {deliveryAddress.notes && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {t('details.addressNotes', { defaultValue: 'ملاحظات العنوان' })}:{' '}
                        {deliveryAddress.notes}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('details.noDeliveryAddress', {
                      defaultValue: 'لا توجد بيانات عنوان للتسليم',
                    })}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Local Payment Information */}
            {order.paymentMethod === PaymentMethod.BANK_TRANSFER && order.localPaymentAccountId && (
              <Card
                sx={{
                  mb: { xs: 2, md: 3 },
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
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
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    {order.paymentStatus === PaymentStatus.PENDING &&
                      !order.verifiedPaymentAmount && (
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
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
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
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
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
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
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
            {order &&
              (() => {
                const statusesRequiringPayment = [
                  OrderStatus.CONFIRMED,
                  OrderStatus.PROCESSING,
                  OrderStatus.COMPLETED,
                ];

                const requiresPayment =
                  statusesRequiringPayment.includes(statusForm.status) &&
                  statusForm.status !== OrderStatus.CANCELLED &&
                  order.paymentStatus !== PaymentStatus.PAID;

                return requiresPayment ? (
                  <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {t('dialogs.updateStatus.paymentRequired', {
                        defaultValue: 'تحذير: هذه الحالة تتطلب إتمام الدفع',
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('dialogs.updateStatus.paymentRequiredMessage', {
                        defaultValue: 'حالة الدفع الحالية: {status}',
                        status: t(`payment.status.${order.paymentStatus}`),
                      })}
                    </Typography>
                    {order.paymentMethod === PaymentMethod.BANK_TRANSFER && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {t('dialogs.updateStatus.verifyPaymentFirst', {
                          defaultValue: 'يرجى التحقق من الدفع أولاً قبل تغيير الحالة',
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
            <Button onClick={() => setUpdateStatusDialog(false)}>{t('actions.cancel')}</Button>
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
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            {t('dialogs.refundOrder.title', { defaultValue: 'إرجاع الطلب' })}
          </DialogTitle>
          <DialogContent>
            {/* Tabs for Full vs Partial Refund */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={refundDialogTab}
                onChange={(_, newValue) => {
                  setRefundDialogTab(newValue);
                  setRefundForm((prev) => ({ ...prev, isFullRefund: newValue === 'full' }));
                  if (newValue === 'full') {
                    setSelectedReturnItems({});
                  }
                }}
              >
                <Tab
                  label={t('dialogs.refundOrder.fullRefund', { defaultValue: 'إرجاع كامل' })}
                  value="full"
                />
                <Tab
                  label={t('dialogs.refundOrder.partialRefund', { defaultValue: 'إرجاع تفصيلي' })}
                  value="partial"
                />
              </Tabs>
            </Box>

            {/* Full Refund Tab */}
            {refundDialogTab === 'full' && (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={refundForm.isFullRefund}
                      onChange={(e) =>
                        setRefundForm((prev) => ({ ...prev, isFullRefund: e.target.checked }))
                      }
                    />
                  }
                  label={t('dialogs.refundOrder.refundFullOrder', {
                    defaultValue: 'إرجاع الفاتورة كاملة',
                  })}
                  sx={{ mb: 2 }}
                />
                {refundForm.isFullRefund && order && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {t('dialogs.refundOrder.fullRefundAmount', {
                      defaultValue: 'المبلغ المراد استرداده',
                    })}
                    : <strong>{formatCurrency(order.total, order.currency)}</strong>
                  </Alert>
                )}
              </Box>
            )}

            {/* Partial Refund Tab */}
            {refundDialogTab === 'partial' && order && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {t('dialogs.refundOrder.selectItems', {
                    defaultValue: 'اختر الأصناف المراد إرجاعها',
                  })}
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          {t('dialogs.refundOrder.select', { defaultValue: 'اختيار' })}
                        </TableCell>
                        <TableCell>
                          {t('dialogs.refundOrder.product', { defaultValue: 'المنتج' })}
                        </TableCell>
                        <TableCell align="center">
                          {t('dialogs.refundOrder.originalQty', { defaultValue: 'الكمية الأصلية' })}
                        </TableCell>
                        <TableCell align="center">
                          {t('dialogs.refundOrder.returnedQty', { defaultValue: 'مرتجع' })}
                        </TableCell>
                        <TableCell align="center">
                          {t('dialogs.refundOrder.availableQty', { defaultValue: 'متاح للإرجاع' })}
                        </TableCell>
                        <TableCell align="center">
                          {t('dialogs.refundOrder.returnQty', { defaultValue: 'كمية الإرجاع' })}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => {
                        const availableQty = getAvailableReturnQty(item);
                        const isSelected = selectedReturnItems[item.variantId] > 0;
                        const returnQty = selectedReturnItems[item.variantId] || 0;

                        return (
                          <TableRow
                            key={item.variantId}
                            sx={{
                              bgcolor: isSelected
                                ? theme.palette.mode === 'dark'
                                  ? 'rgba(25, 118, 210, 0.1)'
                                  : 'rgba(25, 118, 210, 0.05)'
                                : 'transparent',
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isSelected}
                                disabled={availableQty <= 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedReturnItems((prev) => ({
                                      ...prev,
                                      [item.variantId]: 1,
                                    }));
                                  } else {
                                    setSelectedReturnItems((prev) => {
                                      const newItems = { ...prev };
                                      delete newItems[item.variantId];
                                      return newItems;
                                    });
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={item.snapshot.image} sx={{ width: 32, height: 32 }}>
                                  {item.snapshot.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">{item.snapshot.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">{item.qty}</TableCell>
                            <TableCell align="center">
                              {item.returnQty > 0 ? (
                                <Chip
                                  label={item.returnQty}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {availableQty > 0 ? (
                                <Chip
                                  label={availableQty}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip label="0" size="small" color="default" disabled />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {isSelected && (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={returnQty}
                                  onChange={(e) => {
                                    const qty = Math.max(
                                      0,
                                      Math.min(parseInt(e.target.value) || 0, availableQty)
                                    );
                                    if (qty > 0) {
                                      setSelectedReturnItems((prev) => ({
                                        ...prev,
                                        [item.variantId]: qty,
                                      }));
                                    } else {
                                      setSelectedReturnItems((prev) => {
                                        const newItems = { ...prev };
                                        delete newItems[item.variantId];
                                        return newItems;
                                      });
                                    }
                                  }}
                                  inputProps={{ min: 0, max: availableQty }}
                                  sx={{ width: 80 }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {Object.keys(selectedReturnItems).length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t('dialogs.refundOrder.calculatedAmount', {
                      defaultValue: 'المبلغ المحسوب',
                    })}
                    : <strong>{formatCurrency(calculateRefundAmount, order.currency)}</strong>
                  </Alert>
                )}
              </Box>
            )}

            {/* Reason Field */}
            <TextField
              fullWidth
              label={t('dialogs.refundOrder.reason', { defaultValue: 'سبب الإرجاع' })}
              multiline
              rows={3}
              required
              sx={{ mt: 3 }}
              value={refundForm.reason}
              onChange={(e) => setRefundForm((prev) => ({ ...prev, reason: e.target.value }))}
              error={refundForm.reason.length > 0 && refundForm.reason.length < 3}
              helperText={
                refundForm.reason.length > 0 && refundForm.reason.length < 3
                  ? t('dialogs.refundOrder.reasonMinLength', {
                      defaultValue: 'يجب أن يكون السبب 3 أحرف على الأقل',
                    })
                  : ''
              }
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={() => setRefundDialog(false)}>
              {t('actions.cancel', { defaultValue: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleRefundOrder}
              variant="contained"
              disabled={
                refundMutation.isPending ||
                !refundForm.reason ||
                refundForm.reason.trim().length < 3 ||
                (refundDialogTab === 'full' && !refundForm.isFullRefund) ||
                (refundDialogTab === 'partial' && Object.keys(selectedReturnItems).length === 0)
              }
            >
              {t('dialogs.refundOrder.confirm', { defaultValue: 'تأكيد الإرجاع' })}
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
                value={roundToTwoDecimals(verifyPaymentForm.verifiedAmount)}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // السماح بإدخال فارغ أثناء الكتابة
                  if (inputValue === '' || inputValue === '.') {
                    setVerifyPaymentForm({
                      ...verifyPaymentForm,
                      verifiedAmount: 0,
                    });
                    return;
                  }
                  const parsedValue = parseFloat(inputValue);
                  if (!isNaN(parsedValue)) {
                    // تقريب إلى منزلتين عشريتين
                    const roundedValue = roundToTwoDecimals(parsedValue);
                    setVerifyPaymentForm({
                      ...verifyPaymentForm,
                      verifiedAmount: roundedValue,
                    });
                  }
                }}
                onBlur={(e) => {
                  // التأكد من التقريب عند فقدان التركيز
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    const roundedValue = roundToTwoDecimals(value);
                    if (Math.abs(roundedValue - verifyPaymentForm.verifiedAmount) > 0.001) {
                      setVerifyPaymentForm({
                        ...verifyPaymentForm,
                        verifiedAmount: roundedValue,
                      });
                    }
                  }
                }}
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
                  severity={verifyPaymentForm.verifiedAmount >= order.total ? 'success' : 'warning'}
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
            <Button onClick={() => setVerifyPaymentDialog(false)}>{t('actions.cancel')}</Button>
            <Button
              onClick={handleVerifyPayment}
              variant="contained"
              disabled={verifyPaymentMutation.isPending || !verifyPaymentForm.verifiedAmount}
            >
              {t('dialogs.verifyPayment.confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Speed Dial for Mobile */}
        {isMobile && getQuickActions.length > 0 && (
          <SpeedDial
            ariaLabel="Order Actions"
            sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
            icon={<SpeedDialIcon />}
            onClose={() => setSpeedDialOpen(false)}
            onOpen={() => setSpeedDialOpen(true)}
            open={speedDialOpen}
          >
            {getQuickActions.map((action, index) => (
              <SpeedDialAction
                key={index}
                icon={action.icon}
                tooltipTitle={action.label}
                onClick={() => {
                  setSpeedDialOpen(false);
                  action.onClick();
                }}
                FabProps={{ color: action.color }}
              />
            ))}
            <SpeedDialAction
              icon={<Edit />}
              tooltipTitle={t('actions.updateStatus')}
              onClick={() => {
                setSpeedDialOpen(false);
                setUpdateStatusDialog(true);
              }}
            />
            <SpeedDialAction
              icon={<Notes />}
              tooltipTitle={t('actions.addNotes', { defaultValue: 'إضافة ملاحظات' })}
              onClick={() => {
                setSpeedDialOpen(false);
                setNotesDialog(true);
              }}
            />
          </SpeedDial>
        )}
      </Box>
    </LocalizationProvider>
  );
};
