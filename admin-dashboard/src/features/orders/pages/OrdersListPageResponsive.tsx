import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Stack,
  Paper,
  Divider,
  Alert,
  Skeleton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  FilterList,
  Download,
  Refresh,
  Search,
  Clear,
  Assignment,
  TrendingUp,
  LocalShipping,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  Menu,
  Close,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useOrders, useOrderStats, useBulkUpdateOrderStatus, useExportOrders } from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import { OrderStatusChip } from '../components/OrderStatusChip';
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ListOrdersParams,
} from '../types/order.types';
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'معلق',
  authorized: 'مصرح',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترد',
  partially_refunded: 'مسترد جزئياً',
  cancelled: 'ملغي',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  COD: 'عند الاستلام',
  ONLINE: 'أونلاين',
  WALLET: 'محفظة',
  BANK_TRANSFER: 'تحويل بنكي',
};

export const OrdersListPageResponsive: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [filters, setFilters] = useState<ListOrdersParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useOrders(filters);
  const { data: stats } = useOrderStats();
  const bulkUpdateMutation = useBulkUpdateOrderStatus();
  const exportMutation = useExportOrders();

  // Update filters when pagination changes
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    }));
  }, [paginationModel]);

  const handleFilterChange = (key: keyof ListOrdersParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPaginationModel({ page: 0, pageSize: 20 });
  };

  const handleBulkStatusUpdate = async (status: OrderStatus) => {
    if (selectedOrders.length === 0) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        orderIds: selectedOrders,
        status,
        notes: `تم تحديث ${selectedOrders.length} طلب إلى حالة ${t(`orders.status.${status}`, { defaultValue: status })}`,
      });
      setSelectedOrders([]);
    } catch {
      // Error handled by mutation onError
    }
  };

  const handleExportOrders = async () => {
    try {
      await exportMutation.mutateAsync({
        format: 'csv',
        params: filters,
      });
    } catch {
      // Error handled by mutation onError
    }
  };

  const statsCards = useMemo(() => {
    if (!stats) return null;

    const statsData = [
      {
        title: 'إجمالي الطلبات',
        value: stats.total,
        icon: <Assignment color="primary" />,
        color: 'primary',
      },
      {
        title: 'طلبات قيد التجهيز',
        value: stats.processing,
        icon: <TrendingUp color="warning" />,
        color: 'warning',
      },
      {
        title: 'طلبات تم شحنها',
        value: stats.shipped,
        icon: <LocalShipping color="info" />,
        color: 'info',
      },
      {
        title: 'طلبات مكتملة',
        value: stats.delivered,
        icon: <CheckCircle color="success" />,
        color: 'success',
      },
      {
        title: 'طلبات ملغية',
        value: stats.cancelled,
        icon: <Cancel color="error" />,
        color: 'error',
      },
    ];

    return statsData;
  }, [stats]);

  const renderFilters = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterList />
        فلاتر البحث
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
              label={t('orders.filters.search.label', { defaultValue: 'البحث' })}
            placeholder={t('orders.filters.search.placeholder', { defaultValue: 'رقم الطلب أو اسم العميل' })}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>{t('orders.filters.status.label', { defaultValue: 'حالة الطلب' })}</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              label={t('orders.filters.status.label', { defaultValue: 'حالة الطلب' })}
            >
              <MenuItem value="">{t('orders.filters.status.all', { defaultValue: 'الكل' })}</MenuItem>
              <MenuItem value="pending_payment">{t('orders.status.pending_payment', { defaultValue: 'انتظار الدفع' })}</MenuItem>
              <MenuItem value="confirmed">{t('orders.status.confirmed', { defaultValue: 'مؤكد' })}</MenuItem>
              <MenuItem value="processing">{t('orders.status.processing', { defaultValue: 'قيد التجهيز' })}</MenuItem>
              <MenuItem value="shipped">{t('orders.status.shipped', { defaultValue: 'تم الشحن' })}  </MenuItem>
              <MenuItem value="delivered">{t('orders.status.delivered', { defaultValue: 'تم التسليم' })}</MenuItem>
              <MenuItem value="cancelled">{t('orders.status.cancelled', { defaultValue: 'ملغي' })}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>{t('orders.filters.paymentStatus.label', { defaultValue: 'حالة الدفع' })}</InputLabel>
            <Select
              value={filters.paymentStatus || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                  label={t('orders.filters.paymentStatus.label', { defaultValue: 'حالة الدفع' })}
            >
              <MenuItem value="">{t('orders.filters.paymentStatus.all', { defaultValue: 'الكل' })}</MenuItem>
              <MenuItem value="pending">{t('orders.payment.status.pending', { defaultValue: 'معلق' })}</MenuItem>
              <MenuItem value="paid">{t('orders.payment.status.paid', { defaultValue: 'مدفوع' })}</MenuItem>
              <MenuItem value="failed">{t('orders.payment.status.failed', { defaultValue: 'فشل' })}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Clear />} onClick={handleClearFilters} fullWidth>
              {t('orders.filters.clearFilters', { defaultValue: 'مسح الفلاتر' })}       
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderOrderCard = (order: Order) => (
    <Card key={order._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.deliveryAddress?.recipientName || t('orders.deliveryAddress.notDefined', { defaultValue: 'غير محدد' })}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <OrderStatusChip status={order.status} size="small" />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
              {formatCurrency(order.total, order.currency)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('orders.products.label', { defaultValue: 'المنتجات' })}: {order.items?.length || 0}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t(`orders.paymentMethod.${order.paymentMethod}`, { defaultValue: order.paymentMethod })}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Chip
              label={t(`orders.paymentStatus.${order.paymentStatus}`, { defaultValue: order.paymentStatus })}
              color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('orders.createdAt', { defaultValue: 'تاريخ الطلب' })}: {formatDate(order.createdAt)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => navigate(`/orders/${order._id}`)}
            size="small"
          >
            {t('orders.actions.view', { defaultValue: 'عرض التفاصيل' })}
          </Button>

          <IconButton
            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
            size="small"
          >
            {expandedOrder === order._id ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expandedOrder === order._id}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('orders.products.label', { defaultValue: 'منتجات الطلب' })}:
            </Typography>
            <List dense>
              {order.items?.slice(0, 3).map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar src={item.snapshot.image} sx={{ width: 32, height: 32 }}>
                      {item.snapshot.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.snapshot.name}
                    secondary={`${item.qty} × ${formatCurrency(item.finalPrice, order.currency)}`}
                  />
                </ListItem>
              ))}
              {order.items && order.items.length > 3 && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemText secondary={`${t('orders.products.other', { defaultValue: 'و' })} ${order.items.length - 3} ${t('orders.products.other', { defaultValue: 'منتج آخر...' })}`} />
                </ListItem>
              )}
            </List>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '2rem' } }}
          >
            {t('orders.list.title', { defaultValue: 'إدارة الطلبات' })}
          </Typography>
          <Stack direction="row" spacing={1}>
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<Menu />}
                onClick={() => setMobileFiltersOpen(true)}
              >
                {t('orders.filters.title', { defaultValue: 'فلاتر' })}
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {t('orders.actions.refresh', { defaultValue: 'تحديث' })}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportOrders}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? t('orders.actions.exporting', { defaultValue: 'جاري التصدير...' }) : t('orders.actions.export', { defaultValue: 'تصدير' })    }
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        {statsCards && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statsCards.map((stat, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={index}>
                <Card component="div">
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t(`orders.stats.${stat.title}`, { defaultValue: stat.title })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Desktop Filters */}
        {!isMobile && <Paper sx={{ p: 3, mb: 3 }}>{renderFilters()}</Paper>}

        {/* Mobile Filters Drawer */}
        <Drawer
          anchor="right"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: '80%', maxWidth: 400 } }}
        >
          <Box
            sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="h6">{t('orders.filters.title', { defaultValue: 'فلاتر البحث' })}</Typography>
            <IconButton onClick={() => setMobileFiltersOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
          {renderFilters()}
        </Drawer>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {t('orders.bulk.selectedOrders', { defaultValue: 'تم تحديد' })} {selectedOrders.length} {t('orders.bulk.orders', { defaultValue: 'طلب' })}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleBulkStatusUpdate('processing' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('orders.bulk.putOnProcessing', { defaultValue: 'وضع في التجهيز' })}
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                onClick={() => handleBulkStatusUpdate('shipped' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('orders.bulk.putOnShipped', { defaultValue: 'وضع في الشحن' })}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleBulkStatusUpdate('cancelled' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('orders.bulk.cancel', { defaultValue: 'إلغاء' })}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t('orders.messages.error.loadFailed', { defaultValue: 'حدث خطأ في تحميل الطلبات. يرجى المحاولة مرة أخرى.' })}
          </Alert>
        )}

        {/* Orders List */}
        <Card>
          <CardContent>
            {isLoading ? (
              <Box>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={120} sx={{ mb: 2 }} />
                ))}
              </Box>
            ) : (
              <Box>
                {data?.data?.map(renderOrderCard)}

                {/* Pagination */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      disabled={paginationModel.page === 0}
                      onClick={() =>
                        setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                    >
                      {t('orders.pagination.previous', { defaultValue: 'السابق' })}   
                    </Button>
                    <Button variant="outlined" disabled>
                      {paginationModel.page + 1} {t('orders.pagination.of', { defaultValue: 'من' })} {Math.ceil((data?.meta?.total || 0) / paginationModel.pageSize)}
                      {Math.ceil((data?.meta?.total || 0) / paginationModel.pageSize)}
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={
                        paginationModel.page >=
                        Math.ceil((data?.meta?.total || 0) / paginationModel.pageSize) - 1
                      }
                      onClick={() =>
                        setPaginationModel((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                    >
                      {t('orders.pagination.next', { defaultValue: 'التالي' })}   
                    </Button>
                  </Stack>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};
