import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Fab,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  Delete,
  Visibility,
  ShoppingCartCheckout,
  Email,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { CartFilters, Cart, BulkActionRequest } from '../types/cart.types';
import { useCartList, useCartFilters, useCartSelection, useBulkActions } from '../hooks/useCart';
import { CartStatsCards, CartFilters as CartFiltersComponent, CartDetailsModal } from '../components';
import { ConvertToOrderDialog } from './ConvertToOrderDialog';
import { SendReminderDialog } from './SendReminderDialog';
import { DataTable } from '@/shared/components';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor, formatCartStatus } from '../api/cartApi';

export const CartManagementPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  // State management
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [showCartDetails, setShowCartDetails] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);

  // Custom hooks
  const { filters, updateFilters, clearFilters } = useCartFilters({
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    selectedCarts,
    selectCart,
    selectAll,
    deselectAll,
  } = useCartSelection();

  const {
    data: cartData,
    isLoading,
    error,
    refetch,
  } = useCartList(filters);

  const bulkActionsMutation = useBulkActions();

  // Event handlers
  const handleFiltersChange = (newFilters: CartFilters) => {
    updateFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleSearch = () => {
    refetch();
  };

  const handleClearFilters = () => {
    clearFilters();
    setPage(0);
  };

  const handleViewCart = (cart: Cart) => {
    setSelectedCart(cart);
    setShowCartDetails(true);
  };

  const handleConvertToOrder = (cart: Cart) => {
    setSelectedCart(cart);
    setShowConvertDialog(true);
  };

  const handleSendReminder = (cart: Cart) => {
    setSelectedCart(cart);
    setShowReminderDialog(true);
  };

  const handleDeleteCart = (cart: Cart) => {
    if (window.confirm(t('cart.dialogs.delete.message', { defaultValue: 'هل أنت متأكد من حذف السلة؟' }))) {
      const bulkRequest: BulkActionRequest = {
        action: 'delete',
        cartIds: [cart._id],
      };
      bulkActionsMutation.mutate(bulkRequest);
    }
  };

  const handleSelectCart = (cartId: string) => {
    selectCart(cartId);
  };

  const handleSelectAll = (cartIds: string[]) => {
    if (cartIds.length === 0) {
      deselectAll();
    } else {
      selectAll(cartIds);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateFilters({ ...filters, page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
    updateFilters({ ...filters, page: 0, limit: newLimit });
  };

  const handleBulkDelete = () => {
    if (selectedCarts.length === 0) {
      enqueueSnackbar(t('cart.bulk.noneSelected', { defaultValue: 'لم يتم اختيار أي سلات' }), { variant: 'warning' });
      return;
    }

    if (window.confirm(t('cart.dialogs.bulkDelete.message', { count: selectedCarts.length, defaultValue: 'هل أنت متأكد من حذف السلات؟' }))) {
      const bulkRequest: BulkActionRequest = {
        action: 'delete',
        cartIds: selectedCarts,
      };
      bulkActionsMutation.mutate(bulkRequest);
    }
  };

  const handleBulkClear = () => {
    if (selectedCarts.length === 0) {
      enqueueSnackbar(t('cart.bulk.noneSelected', { defaultValue: 'لم يتم اختيار أي سلات' }), { variant: 'warning' });
      return;
    }

    if (window.confirm(t('cart.dialogs.bulkClear.message', { count: selectedCarts.length, defaultValue: 'هل أنت متأكد من حذف السلات؟' }))) {
      const bulkRequest: BulkActionRequest = {
        action: 'clear',
        cartIds: selectedCarts,
      };
      bulkActionsMutation.mutate(bulkRequest);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Data preparation
  const carts = cartData?.carts || [];
  const total = cartData?.pagination?.total || 0;

  const paginationModel: GridPaginationModel = useMemo(() => ({ page, pageSize: limit }), [page, limit]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.page !== page) {
      handlePageChange(model.page);
    }
    if (model.pageSize !== limit) {
      handleLimitChange(model.pageSize);
    }
  };

  const getUserDisplayName = (cart: Cart) => {
    if (cart.user) {
      return cart.user.name || cart.user.email || t('cart.list.user.unknown', { defaultValue: 'غير معروف' });
    }
    return cart.deviceId ? `${t('cart.list.user.device', { defaultValue: 'جهاز' })} ${cart.deviceId.slice(-8)}` : t('cart.list.user.guest', { defaultValue: 'زائر' });
  };

  const getUserContact = (cart: Cart) => {
    if (cart.user) {
      return cart.user.email || cart.user.phone || t('cart.list.user.noContact', { defaultValue: 'لا يوجد اتصال' });
    }
    return t('cart.list.user.noContact', { defaultValue: 'لا يوجد اتصال' });
  };

  const getCartItemsCount = (cart: Cart) => cart.items?.length || 0;
  const getCartTotal = (cart: Cart) => cart.pricingSummary?.total || 0;
  const getLastActivity = (cart: Cart) => cart.lastActivityAt ? formatRelativeTime(cart.lastActivityAt) : formatRelativeTime(cart.updatedAt);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'user',
      headerName: t('cart.list.columns.user', { defaultValue: 'المستخدم' }) as string,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => {
        const cart = params.row as Cart;
        const hasUser = !!cart.user;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {hasUser ? 'U' : 'D'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {getUserDisplayName(cart)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getUserContact(cart)}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: t('cart.list.columns.status', { defaultValue: 'الحالة' }) as string,
      width: 140,
      renderCell: (params) => {
        const cart = params.row as Cart;
        const color = getStatusColor(cart.status);
        return (
          <Chip
            label={formatCartStatus(cart.status)}
            size="small"
            sx={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
          />
        );
      },
    },
    {
      field: 'itemsCount',
      headerName: t('cart.list.columns.itemsCount', { defaultValue: 'عدد المنتجات' }) as string,
      width: 130,
      valueGetter: (params: any) => getCartItemsCount(params.row as Cart),
    },
    {
      field: 'totalValue',
      headerName: t('cart.list.columns.totalValue', { defaultValue: 'القيمة الإجمالية' }) as string,
      width: 150,
      renderCell: (params) => {
        const cart = params.row as Cart;
        return (
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(getCartTotal(cart), cart.currency)}
          </Typography>
        );
      },
    },
    {
      field: 'lastActivity',
      headerName: t('cart.list.columns.lastActivity', { defaultValue: 'آخر نشاط' }) as string,
      flex: 0.9,
      sortable: false,
      renderCell: (params) => {
        const cart = params.row as Cart;
        return (
          <Box>
            <Typography variant="caption" color="text.secondary">
              {formatDate(cart.createdAt)}
            </Typography>
            <Typography variant="body2">{getLastActivity(cart)}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'additionalInfo',
      headerName: t('cart.list.columns.additionalInfo', { defaultValue: 'معلومات إضافية' }) as string,
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const cart = params.row as Cart;
        return (
          <Box display="flex" alignItems="center" gap={1}>
            {cart.isAbandoned && (
              <Chip label={t('cart.list.status.emailsSent', { count: cart.abandonmentEmailsSent })} size="small" color="warning" variant="outlined" />
            )}
            {cart.convertedToOrderId && (
              <Chip label={t('cart.list.status.convertedToOrder')} size="small" color="success" variant="outlined" />
            )}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('cart.list.columns.actions', { defaultValue: 'الإجراءات' }) as string,
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const cart = params.row as Cart;
        const canSendReminder = cart.isAbandoned || cart.status === 'abandoned';
        const canConvert = cart.status === 'active' && getCartItemsCount(cart) > 0;
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title={t('cart.list.menu.viewDetails', { defaultValue: 'عرض التفاصيل' }) as string}>
              <IconButton size="small" onClick={() => handleViewCart(cart)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {canConvert && (
              <Tooltip title={t('cart.list.menu.convertToOrder', { defaultValue: 'تحويل إلى طلب' }) as string}>
                <IconButton size="small" onClick={() => handleConvertToOrder(cart)}>
                  <ShoppingCartCheckout fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canSendReminder && (
              <Tooltip title={t('cart.list.menu.sendReminder', { defaultValue: 'إرسال تذكير' }) as string}>
                <IconButton size="small" onClick={() => handleSendReminder(cart)}>
                  <Email fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('cart.list.menu.deleteCart', { defaultValue: 'حذف السلة' }) as string}>
              <IconButton size="small" color="error" onClick={() => handleDeleteCart(cart)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [t]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {t('cart.navigation.title', { defaultValue: 'إدارة السلات' })}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {t('cart.actions.refresh', { defaultValue: 'تحديث' }    )}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      {/* Statistics Cards */}
      <CartStatsCards
        statistics={undefined} // Will be fetched separately
        analytics={undefined} // Will be fetched separately
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Filters */}
      <CartFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Bulk Actions */}
      {selectedCarts.length > 0 && (
        <Box display="flex" alignItems="center" gap={2} mb={2} p={2} bgcolor="primary.light" borderRadius={1}>
          <Typography variant="body2" color="primary.contrastText">
            {t('cart.bulk.selected', { count: selectedCarts.length })}
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleBulkDelete}
            disabled={bulkActionsMutation.isPending}
          >
            {t('cart.actions.bulkDelete')}
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleBulkClear}
            disabled={bulkActionsMutation.isPending}
          >
            {t('cart.actions.bulkClear', { defaultValue: 'مسح السلات' })}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={deselectAll}
          >
            {t('cart.actions.deselectAll')}
          </Button>
        </Box>
      )}

      {/* DataTable - عام */}
      <DataTable
        columns={columns}
        rows={carts as unknown as any[]}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        selectable={true}
        onRowSelectionModelChange={(selection) => {
          const ids = selection as unknown as string[];
          if (!ids || ids.length === 0) {
            deselectAll();
          } else {
            selectAll(ids);
          }
        }}
        getRowId={(row) => (row as Cart)._id}
        height={600}
        rowHeight={56}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(0,0,0,0.1)"
          zIndex={9999}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Modals */}
      <CartDetailsModal
        cart={selectedCart}
        open={showCartDetails}
        onClose={() => setShowCartDetails(false)}
        onConvertToOrder={handleConvertToOrder}
        onSendReminder={handleSendReminder}
        isLoading={false}
      />

      <ConvertToOrderDialog
        cart={selectedCart}
        open={showConvertDialog}
        onClose={() => setShowConvertDialog(false)}
        onSuccess={() => {
          setShowConvertDialog(false);
          refetch();
        }}
      />

      <SendReminderDialog
        cart={selectedCart}
        open={showReminderDialog}
        onClose={() => setShowReminderDialog(false)}
        onSuccess={() => {
          setShowReminderDialog(false);
          refetch();
        }}
      />

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <Refresh />
      </Fab>
    </Box>
  );
};

export default CartManagementPage;