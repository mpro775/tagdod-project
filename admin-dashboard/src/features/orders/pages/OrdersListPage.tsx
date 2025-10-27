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
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ListOrdersParams,
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

export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
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
        notes: `تم تحديث ${selectedOrders.length} طلب إلى حالة ${orderStatusLabels[status]}`,
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
        headerName: 'رقم الطلب',
        width: 150,
        renderCell: (params) => (
          <Box sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main' }}>
            {params.row.orderNumber}
          </Box>
        ),
      },
      {
        field: 'customerName',
        headerName: 'العميل',
        width: 180,
        valueGetter: (_value, row) => row.deliveryAddress?.recipientName || 'غير محدد',
      },
      {
        field: 'items',
        headerName: 'المنتجات',
        width: 100,
        align: 'center',
        valueGetter: (_value, row) => row.items?.length || 0,
      },
      {
        field: 'total',
        headerName: 'المجموع',
        width: 130,
        renderCell: (params) => (
          <Box sx={{ fontWeight: 'bold' }}>
            {formatCurrency(params.row.total, params.row.currency)}
          </Box>
        ),
      },
      {
        field: 'paymentMethod',
        headerName: 'طريقة الدفع',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={
              paymentMethodLabels[params.row.paymentMethod as PaymentMethod] ||
              params.row.paymentMethod
            }
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'paymentStatus',
        headerName: 'حالة الدفع',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={paymentStatusLabels[params.row.paymentStatus as PaymentStatus]}
            color={params.row.paymentStatus === 'paid' ? 'success' : 'warning'}
            size="small"
          />
        ),
      },
      {
        field: 'status',
        headerName: 'حالة الطلب',
        width: 140,
        renderCell: (params) => (
          <Chip
            label={orderStatusLabels[params.row.status as OrderStatus]}
            color={orderStatusColors[params.row.status as OrderStatus]}
            size="small"
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: 'تاريخ الطلب',
        width: 140,
        valueFormatter: (value) => formatDate(value as Date),
      },
      {
        field: 'actions',
        headerName: 'الإجراءات',
        width: 120,
        sortable: false,
        renderCell: (params) => {
          const order = params.row as Order;
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title="عرض التفاصيل">
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            إدارة الطلبات
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              تحديث
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportOrders}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? 'جاري التصدير...' : 'تصدير'}
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
            فلاتر البحث
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="البحث"
                placeholder="رقم الطلب أو اسم العميل"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>حالة الطلب</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  label="حالة الطلب"
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.entries(orderStatusLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>حالة الدفع</InputLabel>
                <Select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                  label="حالة الدفع"
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.entries(paymentStatusLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>طريقة الدفع</InputLabel>
                <Select
                  value={filters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
                  label="طريقة الدفع"
                >
                  <MenuItem value="">الكل</MenuItem>
                  {Object.entries(paymentMethodLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="من تاريخ"
                value={filters.fromDate ? new Date(filters.fromDate) : null}
                onChange={(date) => handleFilterChange('fromDate', date?.toISOString())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="إلى تاريخ"
                value={filters.toDate ? new Date(filters.toDate) : null}
                onChange={(date) => handleFilterChange('toDate', date?.toISOString())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>ترتيب حسب</InputLabel>
                <Select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="ترتيب حسب"
                >
                  <MenuItem value="createdAt">تاريخ الطلب</MenuItem>
                  <MenuItem value="total">المجموع</MenuItem>
                  <MenuItem value="orderNumber">رقم الطلب</MenuItem>
                  <MenuItem value="status">حالة الطلب</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>اتجاه الترتيب</InputLabel>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) =>
                    handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')
                  }
                  label="اتجاه الترتيب"
                >
                  <MenuItem value="desc">تنازلي</MenuItem>
                  <MenuItem value="asc">تصاعدي</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<Clear />} onClick={handleClearFilters}>
                  مسح الفلاتر
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              تم تحديد {selectedOrders.length} طلب
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handleBulkStatusUpdate('processing' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                وضع في التجهيز
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                onClick={() => handleBulkStatusUpdate('shipped' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                وضع في الشحن
              </Button>
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => handleBulkStatusUpdate('on_hold' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                تعليق
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleBulkStatusUpdate('cancelled' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                إلغاء
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            حدث خطأ في تحميل الطلبات. يرجى المحاولة مرة أخرى.
          </Alert>
        )}

        {/* Data Table */}
        <Card>
          <CardContent>
            <DataTable
              title="قائمة الطلبات"
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
