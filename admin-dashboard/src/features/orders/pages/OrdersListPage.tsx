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
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
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
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
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
  pending_payment: 'warning',
  confirmed: 'info',
  processing: 'primary',
  shipped: 'info',
  delivered: 'success',
  completed: 'success',
  on_hold: 'warning',
  cancelled: 'error',
  returned: 'error',
  refunded: 'error',
};

export const OrdersListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('orders');
  const { isMobile } = useBreakpoint();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [filters, setFilters] = useState<ListOrdersParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const { data, isLoading, error, refetch } = useOrders(filters);
  const { data: stats, isLoading: statsLoading } = useOrderStats();
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
        notes: `تم تحديث ${selectedOrders.length} طلب إلى حالة ${t(`status.${status}`)}`,
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
        valueGetter: (_value, row) => row.deliveryAddress?.recipientName || t('list.user.notSpecified'),
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
        renderCell: (params) => (
          <Chip
            label={t(`payment.method.${params.row.paymentMethod as PaymentMethod}`) || params.row.paymentMethod}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'paymentStatus',
        headerName: t('list.columns.paymentStatus'),
        width: 120,
        renderCell: (params) => (
          <Chip
            label={t(`payment.status.${params.row.paymentStatus as PaymentStatus}`)}
            color={params.row.paymentStatus === 'paid' ? 'success' : 'warning'}
            size="small"
          />
        ),
      },
      {
        field: 'status',
        headerName: t('list.columns.status'),
        width: 140,
        renderCell: (params) => (
          <Chip
            label={t(`status.${params.row.status as OrderStatus}`)}
            color={orderStatusColors[params.row.status as OrderStatus]}
            size="small"
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

  const statsCards = useMemo(() => {
    if (!stats) return null;

    const statsData = [
      {
        title: t('stats.total'),
        value: stats.total || 0,
        icon: <Assignment color="primary" />,
        color: 'primary' as const,
      },
      {
        title: t('stats.processing'),
        value: stats.processing || 0,
        icon: <TrendingUp color="warning" />,
        color: 'warning' as const,
      },
      {
        title: t('stats.shipped'),
        value: stats.shipped || 0,
        icon: <LocalShipping color="info" />,
        color: 'info' as const,
      },
      {
        title: t('stats.delivered'),
        value: stats.delivered || 0,
        icon: <CheckCircle color="success" />,
        color: 'success' as const,
      },
      {
        title: t('stats.cancelled'),
        value: stats.cancelled || 0,
        icon: <Cancel color="error" />,
        color: 'error' as const,
      },
    ];

    return statsData;
  }, [stats, t]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box
        sx={{
          p: isMobile ? 1.5 : 3,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: isMobile ? 2 : 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: isMobile ? '1.5rem' : undefined }}>
            {t('navigation.title')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              fullWidth={isMobile}
            >
              {t('actions.refresh')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportOrders}
              disabled={exportMutation.isPending}
              size={isMobile ? 'small' : 'medium'}
              fullWidth={isMobile}
            >
              {exportMutation.isPending ? t('actions.exporting') : t('actions.export')}
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        {statsLoading ? (
          <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 3 }}>
            {[...Array(5)].map((_, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={index}>
                <Card sx={{ bgcolor: 'background.paper', height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 1 }} />
                    <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="60%" sx={{ mx: 'auto' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : statsCards ? (
          <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 3 }}>
            {statsCards.map((stat, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={index}>
                <Card
                  component="div"
                  sx={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette[stat.color].main, theme.palette.mode === 'dark' ? 0.3 : 0.2)}`,
                    height: '100%',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 3 }}>
                    <Box sx={{ color: `${stat.color}.main`, mb: 1, display: 'flex', justifyContent: 'center', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: isMobile ? '1.5rem' : undefined }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : undefined }}>
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : null}

        {/* Filters */}
        <Paper
          sx={{
            mb: isMobile ? 2 : 3,
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography
                variant="h6"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', fontSize: isMobile ? '1rem' : undefined }}
              >
                <FilterList />
                {t('filters.title')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={isMobile ? 1.5 : 2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label={t('filters.search')}
                placeholder={t('list.searchPlaceholder')}
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('filters.status.label')}</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  label={t('filters.status.label')}
                >
                  <MenuItem value="">{t('filters.status.all')}</MenuItem>
                  {Object.keys(orderStatusColors).map((key) => (
                    <MenuItem key={key} value={key}>
                      {t(`status.${key}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
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
              <FormControl fullWidth>
                <InputLabel>{t('filters.paymentMethod.label')}</InputLabel>
                <Select
                  value={filters.paymentMethod || ''}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
                  label={t('filters.paymentMethod.label')}
                >
                  <MenuItem value="">{t('filters.paymentMethod.all')}</MenuItem>
                  <MenuItem value="COD">{t('payment.method.COD')}</MenuItem>
                  <MenuItem value="ONLINE">{t('payment.method.ONLINE')}</MenuItem>
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
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label={t('filters.dateRange.to')}
                value={filters.toDate ? new Date(filters.toDate) : null}
                onChange={(date) => handleFilterChange('toDate', date?.toISOString())}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
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
              <FormControl fullWidth>
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
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<Clear />} onClick={handleClearFilters}>
                  {t('filters.clearFilters')}
                </Button>
              </Stack>
            </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Paper
            sx={{
              p: isMobile ? 1.5 : 2,
              mb: isMobile ? 2 : 3,
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.light, 0.3),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.primary', fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('bulk.selected', { count: selectedOrders.length })}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
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
                color="info"
                size="small"
                onClick={() => handleBulkStatusUpdate('shipped' as OrderStatus)}
                disabled={bulkUpdateMutation.isPending}
              >
                {t('bulk.markAsShipped')}
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: isMobile ? 2 : 3, bgcolor: 'background.paper' }}>
            {t('messages.error.loadFailed')}
          </Alert>
        )}

        {/* Data Table */}
        <Card
          sx={{
            bgcolor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <CardContent>
            <DataTable
              title={t('list.title')}
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
              height={isMobile ? 'calc(100vh - 600px)' : 'calc(100vh - 400px)'}
            />
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};
