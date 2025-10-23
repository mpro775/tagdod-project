import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Refresh,
  Delete,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { CartFilters, Cart, BulkActionRequest } from '../types/cart.types';
import { useCartList, useCartFilters, useCartSelection, useBulkActions } from '../hooks/useCart';
import { CartStatsCards, CartFilters as CartFiltersComponent, CartTable, CartDetailsModal } from '../components';
import { ConvertToOrderDialog } from './ConvertToOrderDialog';
import { SendReminderDialog } from './SendReminderDialog';

export const CartManagementPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
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
    if (window.confirm(`هل أنت متأكد من حذف السلة ${cart._id}؟`)) {
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
      enqueueSnackbar('يرجى اختيار سلة واحدة على الأقل', { variant: 'warning' });
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف ${selectedCarts.length} سلة؟`)) {
      const bulkRequest: BulkActionRequest = {
        action: 'delete',
        cartIds: selectedCarts,
      };
      bulkActionsMutation.mutate(bulkRequest);
    }
  };

  const handleBulkClear = () => {
    if (selectedCarts.length === 0) {
      enqueueSnackbar('يرجى اختيار سلة واحدة على الأقل', { variant: 'warning' });
      return;
    }

    if (window.confirm(`هل أنت متأكد من مسح محتوى ${selectedCarts.length} سلة؟`)) {
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
  const carts = cartData?.data?.carts || [];
  const total = cartData?.meta?.total || 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          إدارة السلات
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            تحديث
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
            {selectedCarts.length} سلة محددة
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleBulkDelete}
            disabled={bulkActionsMutation.isPending}
          >
            حذف
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleBulkClear}
            disabled={bulkActionsMutation.isPending}
          >
            مسح المحتوى
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={deselectAll}
          >
            إلغاء التحديد
          </Button>
        </Box>
      )}

      {/* Cart Table */}
      <CartTable
        carts={carts}
        isLoading={isLoading}
        selectedCarts={selectedCarts}
        onSelectCart={handleSelectCart}
        onSelectAll={(cartIds: string[]) => handleSelectAll(cartIds)}
        onViewCart={handleViewCart}
        onConvertToOrder={handleConvertToOrder}
        onSendReminder={handleSendReminder}
        onDeleteCart={handleDeleteCart}
        page={page}
        limit={limit}
        total={total}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        error={error?.message}
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