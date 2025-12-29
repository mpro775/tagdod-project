import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Grid,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { Visibility, Refresh, Search, Clear, Warning, Inventory2 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useOutOfStockOrders, useUpdateOrderStatus, useCancelOrder } from '../hooks/useOrders';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import type { Order, ListOrdersParams, InventoryError } from '../types/order.types';
import { OrderStatus } from '../types/order.types';
import toast from 'react-hot-toast';

export const OutOfStockOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('orders');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [filters, setFilters] = useState<ListOrdersParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch } = useOutOfStockOrders(filters);
  const orders = data?.data ?? [];
  const updateStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  // Update filters when pagination changes
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    }));
  }, [paginationModel]);

  // Update filters when sort model changes
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

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery || undefined,
      page: 1,
    }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters((prev) => ({
      ...prev,
      search: undefined,
      page: 1,
    }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleMoveToPending = async (orderId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        data: { status: OrderStatus.PENDING_PAYMENT, notes: 'تم نقل الطلب بعد توفر المخزون' },
      });
      toast.success('تم نقل الطلب إلى قائمة الطلبات المعلقة بنجاح');
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = async (orderId: string) => {
    if (window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      try {
        await cancelOrderMutation.mutateAsync({
          id: orderId,
          data: { reason: 'تم الإلغاء من صفحة الطلبات غير المتوفرة' },
        });
        toast.success('تم إلغاء الطلب بنجاح');
        refetch();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  // Extract inventory errors from status history
  const getInventoryErrors = (order: Order): InventoryError[] => {
    const lastHistory = order.statusHistory?.[order.statusHistory.length - 1];
    if (lastHistory?.metadata?.inventoryErrors) {
      return lastHistory.metadata.inventoryErrors as InventoryError[];
    }
    return order.inventoryErrors || [];
  };

  const columns: GridColDef<Order>[] = [
    {
      field: 'orderNumber',
      headerName: t('outOfStock.orderNumber') || 'رقم الطلب',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.row.orderNumber}
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: t('outOfStock.customer') || 'العميل',
      width: 200,
      renderCell: (params) => {
        const customer = params.row.metadata?.customer;
        const customerName =
          params.row.customerName ||
          (customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'غير محدد');
        const customerPhone = params.row.customerPhone || customer?.phone || '-';
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {customerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {customerPhone}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'items',
      headerName: t('outOfStock.items') || 'المنتجات',
      width: 300,
      renderCell: (params) => (
        <Box>
          {params.row.items.map((item, idx) => (
            <Box key={idx} sx={{ mb: 0.5 }}>
              <Typography variant="body2">
                {item.snapshot.name} (x{item.qty})
              </Typography>
            </Box>
          ))}
        </Box>
      ),
    },
    {
      field: 'inventoryErrors',
      headerName: t('outOfStock.inventoryError') || 'خطأ المخزون',
      width: 300,
      renderCell: (params) => {
        const errors = getInventoryErrors(params.row);
        if (errors.length === 0) return <Typography variant="body2">-</Typography>;
        return (
          <Box>
            {errors.map((error, idx) => (
              <Box key={idx} sx={{ mb: 0.5 }}>
                <Typography variant="body2" color="error">
                  {t('outOfStock.requestedQty') || 'المطلوب'}: {error.requestedQty} |{' '}
                  {t('outOfStock.availableStock') || 'المتوفر'}: {error.availableStock}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      },
    },
    {
      field: 'total',
      headerName: t('outOfStock.total') || 'الإجمالي',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {formatCurrency(params.row.total, params.row.currency)}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: t('outOfStock.date') || 'التاريخ',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">{formatDate(params.row.createdAt)}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('outOfStock.actions') || 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('outOfStock.view') || 'عرض التفاصيل'}>
            <IconButton size="small" onClick={() => navigate(`/admin/orders/${params.row._id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('outOfStock.moveToPending') || 'نقل إلى قائمة المعلقة'}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleMoveToPending(params.row._id)}
              disabled={updateStatusMutation.isPending}
            >
              <Inventory2 fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('outOfStock.cancel') || 'إلغاء'}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleCancel(params.row._id)}
              disabled={cancelOrderMutation.isPending}
            >
              <Clear fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('outOfStock.errorLoading') || 'حدث خطأ أثناء تحميل الطلبات'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {t('outOfStock.title') || 'الطلبات غير المتوفرة'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('outOfStock.description') || 'قائمة الطلبات التي فشلت بسبب عدم توفر المخزون'}
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={() => refetch()}
          disabled={isLoading}
          variant="outlined"
        >
          {t('outOfStock.refresh') || 'تحديث'}
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 8, md: 10 }}>
              <TextField
                fullWidth
                placeholder={
                  t('outOfStock.searchPlaceholder') || 'البحث برقم الطلب أو اسم العميل...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: searchQuery && (
                    <IconButton size="small" onClick={handleClearSearch}>
                      <Clear />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Button fullWidth variant="contained" onClick={handleSearch} disabled={isLoading}>
                {t('outOfStock.search') || 'بحث'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {orders.length === 0 && !isLoading ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Warning sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {t('outOfStock.noOrders') || 'لا توجد طلبات غير متوفرة'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <DataTable
              rows={orders}
              columns={columns}
              loading={isLoading}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={data?.meta.total ?? 0}
              sortModel={sortModel}
              onSortModelChange={setSortModel}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
