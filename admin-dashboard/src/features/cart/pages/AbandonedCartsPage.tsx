import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Fab,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Refresh, Send, Email, TrendingDown, MonetizationOn, Schedule } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { CartFilters, Cart } from '../types/cart.types';
import {
  useAbandonedCarts,
  useCartFilters,
  useCartSelection,
  useSendAllReminders,
} from '../hooks/useCart';
import { CartFilters as CartFiltersComponent, CartTable, CartDetailsModal } from '../components';
import { SendReminderDialog } from './SendReminderDialog';
import { ConvertToOrderDialog } from './ConvertToOrderDialog';

export const AbandonedCartsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // State management
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [showCartDetails, setShowCartDetails] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);

  // Custom hooks
  const { filters, updateFilters, clearFilters } = useCartFilters({
    page,
    limit,
    isAbandoned: true,
    sortBy: 'lastActivityAt',
    sortOrder: 'desc',
  });

  const { selectedCarts, selectCart, selectAll, deselectAll } = useCartSelection();

  const { data: cartData, isLoading, error, refetch } = useAbandonedCarts(filters);

  const sendAllRemindersMutation = useSendAllReminders();

  // Event handlers
  const handleFiltersChange = (newFilters: CartFilters) => {
    updateFilters(newFilters);
    setPage(0);
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
      // Implement delete functionality
      enqueueSnackbar('تم حذف السلة بنجاح', { variant: 'success' });
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

  const handleSendAllReminders = () => {
    sendAllRemindersMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  // Data preparation
  const carts = cartData?.carts || [];
  const total = cartData?.count || 0;

  // Calculate statistics
  const totalAbandonedValue = carts.reduce(
    (sum: number, cart: Cart) => sum + (cart.pricingSummary?.total || 0),
    0
  );
  const averageAbandonedValue = carts.length > 0 ? totalAbandonedValue / carts.length : 0;
  const cartsWithNoEmails = carts.filter(
    (cart: Cart) => (cart.abandonmentEmailsSent || 0) === 0
  ).length;
  const cartsWithEmails = carts.filter(
    (cart: Cart) => (cart.abandonmentEmailsSent || 0) > 0
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          السلات المتروكة
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
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSendAllReminders}
            disabled={isLoading || sendAllRemindersMutation.isPending}
          >
            إرسال جميع التذكيرات
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="warning.main">
                    {total.toLocaleString('ar-YE')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي السلات المتروكة
                  </Typography>
                </Box>
                <TrendingDown color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="error.main">
                    {totalAbandonedValue.toLocaleString('ar-YE')} $
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي القيمة المتروكة
                  </Typography>
                </Box>
                <MonetizationOn color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="info.main">
                    {averageAbandonedValue.toLocaleString('ar-YE')} $
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    متوسط قيمة السلة المتروكة
                  </Typography>
                </Box>
                <MonetizationOn color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="primary.main">
                    {cartsWithEmails}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    سلات تم إرسال تذكيرات لها
                  </Typography>
                </Box>
                <Email color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            إجراءات سريعة
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={() => {
                // Send reminders to carts with no emails
                const cartsToRemind = carts.filter(
                  (cart) => (cart.abandonmentEmailsSent || 0) === 0
                );
                if (cartsToRemind.length === 0) {
                  enqueueSnackbar('جميع السلات المتروكة تم إرسال تذكيرات لها', { variant: 'info' });
                } else {
                  enqueueSnackbar(`سيتم إرسال تذكيرات لـ ${cartsToRemind.length} سلة`, {
                    variant: 'info',
                  });
                  // Implement bulk reminder sending
                }
              }}
              disabled={cartsWithNoEmails === 0}
            >
              إرسال تذكيرات للسلات الجديدة ({cartsWithNoEmails})
            </Button>

            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => {
                // Show carts that need follow-up
                const followUpCarts = carts.filter((cart) => {
                  const emailsSent = cart.abandonmentEmailsSent || 0;
                  return emailsSent > 0 && emailsSent < 3;
                });
                enqueueSnackbar(`هناك ${followUpCarts.length} سلة تحتاج متابعة`, {
                  variant: 'info',
                });
              }}
            >
              عرض السلات التي تحتاج متابعة
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Filters */}
      <CartFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Cart Table */}
      <CartTable
        carts={carts}
        isLoading={isLoading}
        selectedCarts={selectedCarts}
        onSelectCart={handleSelectCart}
        onSelectAll={handleSelectAll}
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

      <SendReminderDialog
        cart={selectedCart}
        open={showReminderDialog}
        onClose={() => setShowReminderDialog(false)}
        onSuccess={() => {
          setShowReminderDialog(false);
          refetch();
        }}
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

export default AbandonedCartsPage;
