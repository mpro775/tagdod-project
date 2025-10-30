import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
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
  Alert,
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
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useOrders, useOrderStats, useBulkUpdateOrderStatus, useExportOrders } from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ListOrdersParams,
} from '../types/order.types';
import { ar } from 'date-fns/locale';

// Order Status Labels and Colors

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

export const OrdersListPage: React.FC = () => {
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
        notes: `تم تحديث ${selectedOrders.length} طلب إلى حالة ${t(`orders.status.${status}`)}`,
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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'orderNumber',
        headerName: t('orders.list.columns.orderNumber', { defaultValue: 'رقم الطلب' }  ),
        width: 150,
        renderCell: (params) => (
          <Box sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
            {params.row.orderNumber}
          </Box>
        ),
      },
      {
        field: 'customerName',
        headerName: t('orders.list.columns.customerName', { defaultValue: 'اسم العميل' }  ),
        width: 180,
        valueGetter: (_value, row) => row.deliveryAddress?.recipientName || t('orders.list.user.notSpecified'),
      },
      {
        field: 'items',
        headerName: t('orders.list.columns.items', { defaultValue: 'المنتجات' }  ),
        width: 100,
        align: 'center',
        valueGetter: (_value, row) => row.items?.length || 0,
        renderCell: (params) => (
          <Typography variant="body2">
            {params.value === 1
              ? t('orders.list.items.single')
              : t('orders.list.items.count', { count: params.value })
            }
          </Typography>
        ),
      },
      {
        field: 'total',
        headerName: t('orders.list.columns.total', { defaultValue: 'المجموع' }  ),
        width: 130,
        renderCell: (params) => (
          <Box sx={{ fontWeight: 'bold' }}>
            {formatCurrency(params.row.total, params.row.currency)}
          </Box>
        ),
      },
      {
        field: 'paymentMethod',
        headerName: t('orders.list.columns.paymentMethod', { defaultValue: 'طريقة الدفع' }  ),
        width: 120,
        renderCell: (params) => (
          <Chip
            label={t(`orders.payment.method.${params.row.paymentMethod as PaymentMethod}`) || params.row.paymentMethod}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'paymentStatus',
        headerName: t('orders.list.columns.paymentStatus', { defaultValue: 'حالة الدفع' }  ),
        width: 120,
        renderCell: (params) => (
          <Chip
            label={t(`orders.payment.status.${params.row.paymentStatus as PaymentStatus}`)}
            color={params.row.paymentStatus === 'paid' ? 'success' : 'warning'}
            size="small"
          />
        ),
      },
      {
        field: 'status',
        headerName: t('orders.list.columns.status', { defaultValue: 'حالة الطلب' }  ),
        width: 140,
        renderCell: (params) => (
          <Chip
            label={t(`orders.status.${params.row.status as OrderStatus}`)}
            color={orderStatusColors[params.row.status as OrderStatus]}
            size="small"
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('orders.list.columns.createdAt', { defaultValue: 'تاريخ الطلب' }  ),
        width: 140,
        valueFormatter: (value) => formatDate(value as Date),
      },
      {
        field: 'actions',
        headerName: t('orders.list.columns.actions', { defaultValue: 'الإجراءات' }  ),
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const order = params.row as Order;
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title={t('orders.list.menu.viewDetails')}>
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
    [navigate]
  );

  const statsCards = useMemo(() => {
    if (!stats) return null;

    const statsData = [
      {
        title: t('orders.stats.total', { defaultValue: 'إجمالي الطلبات' }  ),
        value: stats.total,
        icon: <Assignment color="primary" />,
        color: 'primary',
      },
      {
        title: t('orders.stats.processing', { defaultValue: 'طلبات قيد التجهيز' }  ),
        value: stats.processing,
        icon: <TrendingUp color="warning" />,
        color: 'warning',
      },
      {
        title: t('orders.stats.shipped', { defaultValue: 'طلبات تم شحنها' }  ),
        value: stats.shipped,
        icon: <LocalShipping color="info" />,
        color: 'info',
      },
      {
        title: t('orders.stats.delivered', { defaultValue: 'طلبات تم تسليمها' }   ),
        value: stats.delivered,
        icon: <CheckCircle color="success" />,
        color: 'success',
      },
      {
        title: t('orders.stats.cancelled', { defaultValue: 'طلبات ملغية' }  ),
        value: stats.cancelled,
        icon: <Cancel color="error" />,
        color: 'error',
      },
    ];

    return statsData;
  }, [stats]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {t('orders.navigation.title', { defaultValue: 'لوحة التحكم في الطلبات' }  )}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {t('orders.actions.refresh', { defaultValue: 'تحديث' }  )}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportOrders}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? t('orders.actions.exporting', { defaultValue: 'جاري التصدير' }  ) : t('orders.actions.export', { defaultValue: 'تصدير' }  )}
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        {statsCards && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {statsCards.map((stat, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
                <Card component="div">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            {t('orders.filters.title', { defaultValue: 'فلترة الطلبات' }  )}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label={t('orders.filters.search', { defaultValue: 'بحث' }  )}
                placeholder={t('orders.list.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.filters.status.label', { defaultValue: 'حالة الطلب' }  )}</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  label={t('orders.filters.status.label', { defaultValue: 'حالة الطلب' }      )}
                >
                  <MenuItem value="">{t('orders.filters.status.all', { defaultValue: 'جميع الحالات' }  )}</MenuItem>
                  {Object.keys(orderStatusColors).map((key) => (
                    <MenuItem key={key} value={key}>
                      {t(`orders.status.${key}`, { defaultValue: key }  )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.filters.paymentStatus.label', { defaultValue: 'حالة الدفع' }  )}</InputLabel>
                <Select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                  label={t('orders.filters.paymentStatus.label', { defaultValue: 'حالة الدفع' }  )}
                >
                  <MenuItem value="">{t('orders.filters.paymentStatus.all', { defaultValue: 'جميع الحالات' }  )}</MenuItem>
                  <MenuItem value="pending">{t('orders.payment.status.pending', { defaultValue: 'معلق' }  )}</MenuItem>
                  <MenuItem value="authorized">{t('orders.payment.status.authorized')}</MenuItem>
                  <MenuItem value="paid">{t('orders.payment.status.paid', { defaultValue: 'مدفوع' }  )}</MenuItem>
                  <MenuItem value="failed">{t('orders.payment.status.failed', { defaultValue: 'فشل' }  )}</MenuItem>
                  <MenuItem value="refunded">{t('orders.payment.status.refunded', { defaultValue: 'مسترد' }  )}</MenuItem>
                  <MenuItem value="partially_refunded">{t('orders.payment.status.partially_refunded', { defaultValue: 'مسترد جزئياً' }  )}</MenuItem>
                  <MenuItem value="cancelled">{t('orders.payment.status.cancelled', { defaultValue: 'ملغي' }  )}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.filters.paymentMethod.label', { defaultValue: 'طريقة الدفع' }    )}</InputLabel>
                <Select
                  value={filters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
                  label={t('orders.filters.paymentMethod.label', { defaultValue: 'طريقة الدفع' }    )}
                >
                  <MenuItem value="">{t('orders.filters.paymentMethod.all', { defaultValue: 'جميع الطرق' }    )}</MenuItem>
                  <MenuItem value="COD">{t('orders.payment.method.COD', { defaultValue: 'عند الاستلام' }    )}</MenuItem>
                  <MenuItem value="ONLINE">{t('orders.payment.method.ONLINE', { defaultValue: 'أونلاين' }    )}</MenuItem>
                  <MenuItem value="WALLET">{t('orders.payment.method.WALLET', { defaultValue: 'محفظة' }    )}</MenuItem>
                  <MenuItem value="BANK_TRANSFER">{t('orders.payment.method.BANK_TRANSFER', { defaultValue: 'تحويل بنكي' }    )}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label={t('orders.filters.dateRange.from', { defaultValue: 'من تاريخ' }    )}
                value={filters.fromDate ? new Date(filters.fromDate) : null}
                onChange={(date) => handleFilterChange('fromDate', date?.toISOString())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label={t('orders.filters.dateRange.to', { defaultValue: 'إلى تاريخ' }    )}
                value={filters.toDate ? new Date(filters.toDate) : null}
                onChange={(date) => handleFilterChange('toDate', date?.toISOString())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.filters.sorting.sortBy', { defaultValue: 'ترتيب التصفية' }    )}</InputLabel>
                <Select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label={t('orders.filters.sorting.sortBy', { defaultValue: 'ترتيب التصفية' }    )}
                >
                  <MenuItem value="createdAt">{t('orders.filters.sorting.createdAt', { defaultValue: 'تاريخ الطلب' }    )}</MenuItem>
                  <MenuItem value="total">{t('orders.filters.sorting.total', { defaultValue: 'المجموع' }    )}</MenuItem>
                  <MenuItem value="orderNumber">{t('orders.filters.sorting.orderNumber', { defaultValue: 'رقم الطلب' }    )}</MenuItem>
                  <MenuItem value="status">{t('orders.filters.sorting.status', { defaultValue: 'حالة الطلب' }    )}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('orders.filters.sorting.sortOrder', { defaultValue: 'ترتيب التصفية' }    )}</InputLabel>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) =>
                    handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')
                  }
                  label={t('orders.filters.sorting.sortOrder', { defaultValue: 'ترتيب التصفية' }        )}
                >
                  <MenuItem value="desc">{t('orders.filters.sorting.descending', { defaultValue: 'تنازلي' }    )}</MenuItem>
                  <MenuItem value="asc">{t('orders.filters.sorting.ascending', { defaultValue: 'تصاعدي' }    )}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<Clear />} onClick={handleClearFilters}>
                  {t('orders.filters.clearFilters', { defaultValue: 'مسح الفلاتر' }    )}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {t('orders.bulk.selected', { count: selectedOrders.length })}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleBulkStatusUpdate('processing' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('orders.bulk.startProcessing', { defaultValue: 'بدء التجهيز' }    )}
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                onClick={() => handleBulkStatusUpdate('shipped' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('orders.bulk.markAsShipped', { defaultValue: 'تم الشحن' }    )}
              </Button>
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => handleBulkStatusUpdate('on_hold' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('orders.bulk.putOnHold', { defaultValue: 'وضع على الاحتياط' }    )}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleBulkStatusUpdate('cancelled' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('orders.bulk.cancelOrders', { defaultValue: 'إلغاء الطلبات' }    )}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t('orders.messages.error.loadFailed', { defaultValue: 'فشل تحميل البيانات' }    )}
          </Alert>
        )}

        {/* Data Table */}
        <Card>
          <CardContent>
            <DataTable
              title={t('orders.list.title', { defaultValue: 'قائمة الطلبات' }       )}
              columns={columns}
              rows={data?.data || []}
              loading={isLoading}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
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
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};
