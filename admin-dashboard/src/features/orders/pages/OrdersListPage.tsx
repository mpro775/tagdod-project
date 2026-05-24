import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Stack,
  Paper,
  useTheme,
  alpha,
  Pagination,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Visibility,
  Download,
  Refresh,
  Clear,
  Assignment,
  TrendingUp,
  CheckCircle,
  Cancel,
  Warning,
  Replay,
  Paid,
  Payment,
  Verified,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ExportFieldsDialog } from '@/shared/components/ExportFieldsDialog';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useOrders, useOrderStats, useBulkUpdateOrderStatus, useExportOrders } from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PageShell,
  PageSummaryGrid,
  SectionCard,
  StatCard,
  StatusChip,
  DataToolbar,
  usePageTitle,
  ConfirmDialog,
} from '@/shared/design-system';
import { useConfirmDialog } from '@/shared/hooks';
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  ListOrdersParams,
} from '../types/order.types';
import { PaymentMethod } from '../types/order.types';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

const orderStatusToDesignStatus = (
  status: OrderStatus
): 'pending' | 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  if (status === 'completed') return 'success';
  if (status === 'cancelled' || status === 'refunded' || status === 'out_of_stock') return 'error';
  if (status === 'pending_payment' || status === 'on_hold') return 'warning';
  if (status === 'confirmed' || status === 'processing' || status === 'returned') return 'info';
  return 'neutral';
};

type StatusTabValue = 'all' | string;

export const OrdersListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('orders');
  const { isMobile } = useBreakpoint();
  const pageTitle = t('navigation.title');

  usePageTitle(pageTitle);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTabValue>('all');
  const [filters, setFilters] = useState<ListOrdersParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { confirmDialog, dialogProps: confirmDialogProps } = useConfirmDialog();

  const { data, isLoading, error, refetch } = useOrders(filters);
  const orders = data?.data ?? [];
  const usersMap = useMemo(() => {
    const map = new Map<string, { firstName?: string; lastName?: string; phone?: string }>();
    for (const order of orders) {
      if (!map.has(order.userId)) {
        const customer =
          order.metadata?.customer ??
          (order as unknown as { customer?: { firstName?: string; lastName?: string; phone?: string } }).customer;
        if (customer) {
          map.set(order.userId, customer);
        }
      }
    }
    return map;
  }, [orders]);
  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const bulkUpdateMutation = useBulkUpdateOrderStatus();
  const exportMutation = useExportOrders();

  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    }));
  }, [paginationModel]);

  React.useEffect(() => {
    if (sortModel.length > 0) {
      const sortField = sortModel[0].field;
      const sortOrder = sortModel[0].sort === 'asc' ? 'asc' : 'desc';
      setFilters((prev) => ({
        ...prev,
        sortBy: sortField,
        sortOrder,
        page: 1,
      }));
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  }, [sortModel]);

  const handleFilterChange = (key: keyof ListOrdersParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
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
    setSortModel([{ field: 'createdAt', sort: 'desc' }]);
    setActiveStatusTab('all');
  };

  const handleStatusTabChange = (_: React.SyntheticEvent, newValue: StatusTabValue) => {
    setActiveStatusTab(newValue);
    if (newValue === 'all') {
      setFilters((prev) => {
        const { status, ...rest } = prev;
        return rest as ListOrdersParams;
      });
    } else {
      setFilters((prev) => ({ ...prev, status: newValue as OrderStatus, page: 1 }));
    }
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleBulkStatusUpdate = async (status: OrderStatus) => {
    if (selectedOrders.length === 0) return;

    const isDangerous = status === 'cancelled';
    const proceed = isDangerous
      ? await confirmDialog({
          title: t('bulk.confirmTitle', 'تأكيد العملية'),
          message: t('bulk.confirmCancelMessage', 'هل أنت متأكد من إلغاء {{count}} طلب؟ لا يمكن التراجع عن هذا الإجراء.', { count: selectedOrders.length }),
          type: 'warning',
          confirmText: t('bulk.confirmYes', 'نعم، إلغاء'),
          cancelText: t('bulk.confirmNo', 'تراجع'),
          confirmColor: 'error',
        })
      : true;

    if (!proceed) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        orderIds: selectedOrders,
        status,
        notes: t('bulk.statusUpdateNote', 'تم تحديث {{count}} طلب إلى حالة {{status}}', {
          count: selectedOrders.length,
          status: t(`status.${status}`),
        }),
      });
      setSelectedOrders([]);
      toast.success(t('bulk.success', 'تم تحديث الحالة بنجاح'));
    } catch {
      toast.error(t('bulk.error', 'فشل تحديث الحالة'));
    }
  };

  const handleExportOrders = async (fields: string[]) => {
    const exportParams = Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) =>
          !['page', 'limit'].includes(key) &&
          value !== undefined &&
          value !== null &&
          value !== ''
      )
    ) as ListOrdersParams;

    try {
      await exportMutation.mutateAsync({
        format: 'xlsx',
        params: exportParams,
        fields,
      });
      toast.success(t('actions.exportSuccess', 'تم تصدير البيانات بنجاح'));
    } catch {
      toast.error(t('actions.exportError', 'فشل تصدير البيانات'));
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta?.total ?? 0) / Math.max(1, paginationModel.pageSize))
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.paymentStatus) count++;
    if (filters.paymentMethod) count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    return count;
  }, [filters]);

  const renderOrderCard = (order: Order) => {
    const customer = usersMap.get(order.userId) ?? null;
    const customerName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') ||
      order.customerName ||
      t('list.user.notSpecified');
    const paymentMethodLabel =
      order.localPaymentAccountType === 'wallet' && order.paymentMethod === PaymentMethod.BANK_TRANSFER
        ? t('payment.method.WALLET', { defaultValue: 'محفظة' })
        : order.localPaymentAccountType === 'bank' && order.paymentMethod === PaymentMethod.BANK_TRANSFER
          ? t('payment.method.BANK_TRANSFER', { defaultValue: 'تحويل بنكي' })
          : t(`payment.method.${order.paymentMethod as PaymentMethod}`) || order.paymentMethod;

    return (
      <Card
        key={order._id}
        onClick={() => navigate(`/orders/${order._id}`)}
        sx={{
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          borderRadius: 3,
          boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 10px 28px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: theme.transitions.create(['border-color', 'box-shadow', 'transform']),
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: theme.palette.mode === 'dark' ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}` : `0 8px 24px rgba(15, 23, 42, 0.12)`,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}>
                  {order.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {customerName}
                </Typography>
              </Box>
              <StatusChip
                label={t(`status.${order.status as OrderStatus}`)}
                status={orderStatusToDesignStatus(order.status as OrderStatus)}
              />
            </Box>

            <Divider />

            <Grid container spacing={1.25}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">{t('list.columns.total')}</Typography>
                <Typography variant="body2" fontWeight={800}>{formatCurrency(order.total, order.currency)}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">{t('list.columns.items')}</Typography>
                <Typography variant="body2" fontWeight={700}>{t('list.items.count', { count: order.items?.length || 0 })}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">{t('list.columns.paymentMethod')}</Typography>
                <Typography variant="body2" fontWeight={700}>{paymentMethodLabel}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">{t('list.columns.createdAt')}</Typography>
                <Typography variant="body2" fontWeight={700}>{formatDate(order.createdAt)}</Typography>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
              <StatusChip
                label={t(`payment.status.${order.paymentStatus as PaymentStatus}`)}
                status={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                variant="outlined"
              />
              <Button
                size="small"
                variant="contained"
                startIcon={<Visibility />}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/orders/${order._id}`);
                }}
              >
                {t('list.menu.viewDetails')}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'orderNumber',
        headerName: t('list.columns.orderNumber'),
        width: 150,
        renderCell: (params) => (
          <Box sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
            {params.row.orderNumber}
          </Box>
        ),
      },
      {
        field: 'customerName',
        headerName: t('list.columns.customerName'),
        width: 180,
        valueGetter: (_value, row) => {
          const customer = usersMap.get(row.userId) ?? null;
          const nameParts = [customer?.firstName, customer?.lastName].filter(Boolean);
          if (nameParts.length > 0) {
            return nameParts.join(' ');
          }
          return row.customerName || t('list.user.notSpecified');
        },
      },
      {
        field: 'items',
        headerName: t('list.columns.items'),
        width: 100,
        align: 'center',
        valueGetter: (_value, row) => row.items?.length || 0,
        renderCell: (params) => (
          <Typography variant="body2">
            {params.value === 1
              ? t('list.items.single')
              : t('list.items.count', { count: params.value })
            }
          </Typography>
        ),
      },
      {
        field: 'total',
        headerName: t('list.columns.total'),
        width: 130,
        renderCell: (params) => (
          <Box sx={{ fontWeight: 'bold' }}>
            {formatCurrency(params.row.total, params.row.currency)}
          </Box>
        ),
      },
      {
        field: 'paymentMethod',
        headerName: t('list.columns.paymentMethod'),
        width: 120,
        renderCell: (params) => {
          const order = params.row as Order;
          if (order.localPaymentAccountType === 'wallet' && order.paymentMethod === PaymentMethod.BANK_TRANSFER) {
            return (
              <Chip
                label={t('payment.method.WALLET', { defaultValue: 'محفظة' })}
                size="small"
                variant="outlined"
                color="primary"
              />
            );
          }
          if (order.localPaymentAccountType === 'bank' && order.paymentMethod === PaymentMethod.BANK_TRANSFER) {
            return (
              <Chip
                label={t('payment.method.BANK_TRANSFER', { defaultValue: 'تحويل بنكي' })}
                size="small"
                variant="outlined"
              />
            );
          }
          return (
            <Chip
              label={t(`payment.method.${order.paymentMethod as PaymentMethod}`) || order.paymentMethod}
              size="small"
              variant="outlined"
            />
          );
        },
      },
      {
        field: 'paymentStatus',
        headerName: t('list.columns.paymentStatus'),
        width: 120,
        renderCell: (params) => (
          <StatusChip
            label={t(`payment.status.${params.row.paymentStatus as PaymentStatus}`)}
            status={params.row.paymentStatus === 'paid' ? 'success' : 'warning'}
          />
        ),
      },
      {
        field: 'status',
        headerName: t('list.columns.status'),
        width: 140,
        renderCell: (params) => (
          <StatusChip
            label={t(`status.${params.row.status as OrderStatus}`)}
            status={orderStatusToDesignStatus(params.row.status as OrderStatus)}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('list.columns.createdAt'),
        width: 140,
        valueFormatter: (value) => formatDate(value as Date),
      },
      {
        field: 'actions',
        headerName: t('list.columns.actions'),
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const order = params.row as Order;
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title={t('list.menu.viewDetails')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order._id}`);
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [navigate, t]
  );

  const getStatusTabCount = (status: string): number => {
    if (!stats) return 0;
    const map: Record<string, number> = {
      pending_payment: stats.pending_payment ?? 0,
      confirmed: stats.confirmed ?? 0,
      processing: stats.processing ?? 0,
      completed: stats.completed ?? 0,
      on_hold: stats.onHold ?? 0,
      cancelled: stats.cancelled ?? 0,
      returned: stats.returned ?? 0,
      refunded: stats.refunded ?? 0,
    };
    return map[status] ?? 0;
  };

  const statusTabs: { value: StatusTabValue; label: string; count?: number }[] = [
    { value: 'all', label: t('statusTabs.all', 'الكل'), count: stats?.total },
    { value: 'pending_payment', label: t('status.pending_payment', 'بانتظار الدفع'), count: getStatusTabCount('pending_payment') },
    { value: 'confirmed', label: t('status.confirmed', 'مؤكد'), count: getStatusTabCount('confirmed') },
    { value: 'processing', label: t('status.processing', 'قيد المعالجة'), count: getStatusTabCount('processing') },
    { value: 'completed', label: t('status.completed', 'مكتمل'), count: getStatusTabCount('completed') },
    { value: 'on_hold', label: t('status.on_hold', 'معلق'), count: getStatusTabCount('on_hold') },
    { value: 'cancelled', label: t('status.cancelled', 'ملغي'), count: getStatusTabCount('cancelled') },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <ConfirmDialog {...confirmDialogProps} />
      <PageShell fullHeight>
        <PageHeader
          title={pageTitle}
          description={t('navigation.description', 'إدارة الطلبات، الحالات، الشحن، والإجراءات')}
          breadcrumbs={[
            { label: t('navigation.dashboard', 'لوحة التحكم'), to: '/dashboard' },
            { label: pageTitle },
          ]}
          actions={[
            {
              label: t('actions.refresh'),
              icon: <Refresh />,
              onClick: () => void refetch(),
            },
            {
              label: exportMutation.isPending ? t('actions.exporting') : t('actions.export'),
              icon: <Download />,
              onClick: () => setExportDialogOpen(true),
              variant: 'primary',
              disabled: exportMutation.isPending,
            },
          ]}
        />

        {/* Stats Cards */}
        {statsLoading ? (
          <PageSummaryGrid columns={3}>
            {Array.from({ length: 9 }).map((_, i) => (
              <StatCard
                key={i}
                title={t('stats.loading', 'جاري التحميل')}
                value="-"
                icon={<Assignment fontSize="small" />}
                tone="neutral"
                loading
              />
            ))}
          </PageSummaryGrid>
        ) : stats ? (
          <PageSummaryGrid columns={3}>
            <StatCard title={t('stats.total')} value={stats.total || 0} icon={<Assignment fontSize="small" />} tone="primary" linkTo="/orders" />
            <StatCard title={t('stats.pending_payment')} value={stats.pending_payment || 0} icon={<Payment fontSize="small" />} tone="warning" linkTo="/orders" />
            <StatCard title={t('stats.confirmed')} value={stats.confirmed || 0} icon={<Verified fontSize="small" />} tone="info" linkTo="/orders" />
            <StatCard title={t('stats.processing')} value={stats.processing || 0} icon={<TrendingUp fontSize="small" />} tone="primary" linkTo="/orders" />
            <StatCard title={t('stats.completed')} value={stats.completed || 0} icon={<CheckCircle fontSize="small" />} tone="success" linkTo="/orders" />
            <StatCard title={t('stats.onHold')} value={stats.onHold || 0} icon={<Warning fontSize="small" />} tone="warning" linkTo="/orders" />
            <StatCard title={t('stats.cancelled')} value={stats.cancelled || 0} icon={<Cancel fontSize="small" />} tone="error" linkTo="/orders" />
            <StatCard title={t('stats.returned')} value={stats.returned || 0} icon={<Replay fontSize="small" />} tone="info" linkTo="/orders" />
            <StatCard title={t('stats.refunded')} value={stats.refunded || 0} icon={<Paid fontSize="small" />} tone="success" linkTo="/orders" />
          </PageSummaryGrid>
        ) : null}

        {/* Status Tabs */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={activeStatusTab}
            onChange={handleStatusTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            {statusTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <Chip
                        label={tab.count}
                        size="small"
                        color={tab.value === activeStatusTab ? 'primary' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Paper>

        {/* Data Toolbar */}
        <DataToolbar
          searchValue={filters.search ?? ''}
          searchPlaceholder={t('list.searchPlaceholder', 'بحث برقم الطلب أو اسم العميل...')}
          onSearchChange={(value) => handleFilterChange('search', value || undefined)}
          activeFilters={[
            ...(filters.status ? [{ label: t('filters.status.label'), value: t(`status.${filters.status}`), onDelete: () => handleFilterChange('status', undefined) }] : []),
            ...(filters.paymentStatus ? [{ label: t('filters.paymentStatus.label'), value: t(`payment.status.${filters.paymentStatus}`), onDelete: () => handleFilterChange('paymentStatus', undefined) }] : []),
            ...(filters.paymentMethod ? [{ label: t('filters.paymentMethod.label'), value: filters.paymentMethod, onDelete: () => handleFilterChange('paymentMethod', undefined) }] : []),
            ...(filters.fromDate ? [{ label: t('filters.dateRange.from'), value: filters.fromDate, onDelete: () => handleFilterChange('fromDate', undefined) }] : []),
            ...(filters.toDate ? [{ label: t('filters.dateRange.to'), value: filters.toDate, onDelete: () => handleFilterChange('toDate', undefined) }] : []),
          ]}
          actions={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" gap={1}>
              {activeFilterCount > 0 && (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                >
                  {t('filters.clearFilters')}
                </Button>
              )}
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? t('filters.hideFilters', 'إخفاء الفلاتر') : t('filters.showFilters', 'فلاتر إضافية')}
              </Button>
            </Stack>
          }
        />

        {/* Filter Panel (collapsible) */}
        {showFilters && (
          <SectionCard>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filters.status.label')}</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    label={t('filters.status.label')}
                  >
                    <MenuItem value="">{t('filters.status.all')}</MenuItem>
                    <MenuItem value="pending_payment">{t('status.pending_payment')}</MenuItem>
                    <MenuItem value="confirmed">{t('status.confirmed')}</MenuItem>
                    <MenuItem value="processing">{t('status.processing')}</MenuItem>
                    <MenuItem value="completed">{t('status.completed')}</MenuItem>
                    <MenuItem value="on_hold">{t('status.on_hold')}</MenuItem>
                    <MenuItem value="cancelled">{t('status.cancelled')}</MenuItem>
                    <MenuItem value="returned">{t('status.returned')}</MenuItem>
                    <MenuItem value="refunded">{t('status.refunded')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filters.paymentStatus.label')}</InputLabel>
                  <Select
                    value={filters.paymentStatus || ''}
                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                    label={t('filters.paymentStatus.label')}
                  >
                    <MenuItem value="">{t('filters.paymentStatus.all')}</MenuItem>
                    <MenuItem value="pending">{t('payment.status.pending')}</MenuItem>
                    <MenuItem value="authorized">{t('payment.status.authorized')}</MenuItem>
                    <MenuItem value="paid">{t('payment.status.paid')}</MenuItem>
                    <MenuItem value="failed">{t('payment.status.failed')}</MenuItem>
                    <MenuItem value="refunded">{t('payment.status.refunded')}</MenuItem>
                    <MenuItem value="partially_refunded">{t('payment.status.partially_refunded')}</MenuItem>
                    <MenuItem value="cancelled">{t('payment.status.cancelled')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filters.paymentMethod.label')}</InputLabel>
                  <Select
                    value={filters.paymentMethod || ''}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
                    label={t('filters.paymentMethod.label')}
                  >
                    <MenuItem value="">{t('filters.paymentMethod.all')}</MenuItem>
                    <MenuItem value="COD">{t('payment.method.COD')}</MenuItem>
                    <MenuItem value="WALLET">{t('payment.method.WALLET')}</MenuItem>
                    <MenuItem value="BANK_TRANSFER">{t('payment.method.BANK_TRANSFER')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label={t('filters.dateRange.from')}
                  value={filters.fromDate ? new Date(filters.fromDate) : null}
                  onChange={(date) => handleFilterChange('fromDate', date?.toISOString())}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label={t('filters.dateRange.to')}
                  value={filters.toDate ? new Date(filters.toDate) : null}
                  onChange={(date) => handleFilterChange('toDate', date?.toISOString())}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filters.sorting.sortBy')}</InputLabel>
                  <Select
                    value={filters.sortBy || 'createdAt'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    label={t('filters.sorting.sortBy')}
                  >
                    <MenuItem value="createdAt">{t('filters.sorting.createdAt')}</MenuItem>
                    <MenuItem value="total">{t('filters.sorting.total')}</MenuItem>
                    <MenuItem value="orderNumber">{t('filters.sorting.orderNumber')}</MenuItem>
                    <MenuItem value="status">{t('filters.sorting.status')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('filters.sorting.sortOrder')}</InputLabel>
                  <Select
                    value={filters.sortOrder || 'desc'}
                    onChange={(e) =>
                      handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')
                    }
                    label={t('filters.sorting.sortOrder')}
                  >
                    <MenuItem value="desc">{t('filters.sorting.descending')}</MenuItem>
                    <MenuItem value="asc">{t('filters.sorting.ascending')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SectionCard>
        )}

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Paper
            sx={{
              p: isMobile ? 1.5 : 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: 'text.primary' }}>
              {t('bulk.selected', { count: selectedOrders.length })}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" gap={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleBulkStatusUpdate('processing' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('bulk.startProcessing')}
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleBulkStatusUpdate('completed' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('bulk.markAsCompleted')}
              </Button>
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => handleBulkStatusUpdate('on_hold' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('bulk.putOnHold')}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleBulkStatusUpdate('cancelled' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('bulk.cancelOrders')}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            title={t('messages.error.loadFailed')}
            onRetry={() => void refetch()}
            retryLabel={t('actions.refresh')}
          />
        )}

        {/* Data Table */}
        <SectionCard padding="none">
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2, overflow: 'hidden' }}>
              <Typography variant="h6" fontWeight={800}>{t('list.title')}</Typography>
              {orders.length === 0 && !isLoading ? (
                <EmptyState
                  icon={<Assignment sx={{ fontSize: 44 }} />}
                  title={t('messages.empty', { defaultValue: 'لا توجد طلبات' })}
                  description={t('messages.emptyDesc', { defaultValue: 'لا توجد طلبات مطابقة للفلاتر المحددة' })}
                  actionLabel={activeFilterCount > 0 ? t('filters.clearFilters') : undefined}
                  onAction={activeFilterCount > 0 ? handleClearFilters : undefined}
                />
              ) : (
                orders.map(renderOrderCard)
              )}
              {(data?.meta?.total ?? 0) > paginationModel.pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                  <Pagination
                    count={totalPages}
                    page={Math.min(paginationModel.page + 1, totalPages)}
                    onChange={(_event, page) => setPaginationModel((prev) => ({ ...prev, page: Math.max(0, page - 1) }))}
                    color="primary"
                    shape="rounded"
                    size="small"
                  />
                </Box>
              )}
            </Stack>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto', minWidth: 0 }}>
              <DataTable
                title={t('list.title')}
                columns={columns}
                rows={data?.data || []}
                loading={isLoading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                rowCount={data?.meta?.total ?? 0}
                paginationMode="server"
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                sortingMode="server"
                getRowId={(row: unknown) => (row as Order)._id as string}
                onRowClick={(params) => {
                  const row = params.row as Order;
                  navigate(`/orders/${row._id as string}`);
                }}
                selectable
                onRowSelectionModelChange={(newSelection) => {
                  setSelectedOrders(newSelection as unknown as string[]);
                }}
                height="calc(100vh - 400px)"
              />
            </Box>
          )}
        </SectionCard>

        <ExportFieldsDialog
          open={exportDialogOpen}
          title={t('actions.exportTitle', 'تصدير الطلبات')}
          loading={exportMutation.isPending}
          onClose={() => setExportDialogOpen(false)}
          onExport={handleExportOrders}
          activeFilters={[
            { label: 'بحث', value: filters.search },
            { label: 'حالة الطلب', value: filters.status },
            { label: 'حالة الدفع', value: filters.paymentStatus },
            { label: 'طريقة الدفع', value: filters.paymentMethod },
            { label: 'من تاريخ', value: filters.fromDate },
            { label: 'إلى تاريخ', value: filters.toDate },
            { label: 'الترتيب', value: filters.sortBy },
          ]}
          fields={[
            { key: 'orderNumber', label: 'رقم الطلب', default: true },
            { key: 'createdAt', label: 'تاريخ الطلب', default: true },
            { key: 'customerName', label: 'اسم العميل', default: true },
            { key: 'customerPhone', label: 'رقم الهاتف', default: true },
            { key: 'status', label: 'حالة الطلب', default: true },
            { key: 'paymentStatus', label: 'حالة الدفع', default: true },
            { key: 'paymentMethod', label: 'طريقة الدفع', default: true },
            { key: 'total', label: 'الإجمالي', default: true },
            { key: 'currency', label: 'العملة', default: true },
            { key: 'city', label: 'المدينة', default: true },
            { key: 'itemsCount', label: 'عدد المنتجات', default: true },
            { key: 'totalDiscount', label: 'إجمالي الخصومات', default: true },
            { key: 'shippingCost', label: 'الشحن', default: true },
            { key: 'rating', label: 'التقييم', default: true },
            { key: 'subtotal', label: 'المجموع الفرعي' },
            { key: 'couponDiscount', label: 'خصم الكوبون' },
            { key: 'invoiceNumber', label: 'رقم الفاتورة' },
            { key: 'completedAt', label: 'تاريخ الإكمال' },
          ]}
        />
      </PageShell>
    </LocalizationProvider>
  );
};