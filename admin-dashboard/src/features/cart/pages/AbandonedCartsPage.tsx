import React, { useState, useMemo, useCallback } from 'react';
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
  useTheme,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Checkbox,
  Stack,
  Divider,
  Pagination,
} from '@mui/material';
import { Refresh, Send, Email, TrendingDown, MonetizationOn, Schedule, ShoppingCartCheckout, Delete, Visibility } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { DataTable } from '@/shared/components';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { CartFilters, Cart } from '../types/cart.types';
import {
  useAbandonedCarts,
  useCartFilters,
  useCartSelection,
  useSendAllReminders,
} from '../hooks/useCart';
import { CartFilters as CartFiltersComponent, CartDetailsModal } from '../components';
import { SendReminderDialog } from './SendReminderDialog';
import { ConvertToOrderDialog } from './ConvertToOrderDialog';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getStatusColor,
  formatCartStatus,
  getCartSummary,
} from '../api/cartApi';

export const AbandonedCartsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('cart');
  const theme = useTheme();
  const { isMobile, isXs } = useBreakpoint();
  const { confirmDialog, dialogProps } = useConfirmDialog();

  // State management
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [showCartDetails, setShowCartDetails] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // Custom hooks
  const { filters, updateFilters, clearFilters } = useCartFilters({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    isAbandoned: true,
    sortBy: 'lastActivityAt',
    sortOrder: 'desc',
  });

  const { selectedCarts, selectAll, deselectAll } = useCartSelection();

  const { data: cartData, isLoading, error, refetch } = useAbandonedCarts(filters);

  const sendAllRemindersMutation = useSendAllReminders();

  // Event handlers
  const handleFiltersChange = (newFilters: CartFilters) => {
    updateFilters(newFilters);
    setPaginationModel({ page: 0, pageSize: newFilters.limit || 25 });
  };

  const handleSearch = () => {
    refetch();
  };

  const handleClearFilters = () => {
    clearFilters();
    setPaginationModel({ page: 0, pageSize: 25 });
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

  const handleDeleteCart = useCallback(async (cart: Cart) => {
    const confirmed = await confirmDialog({
      title: t('dialogs.delete.title', 'تأكيد الحذف'),
      message: `${t('dialogs.delete.message')} (${cart._id})`,
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      // Implement delete functionality
      enqueueSnackbar(t('messages.success.deleted'), { variant: 'success' });
    }
  }, [t, enqueueSnackbar, confirmDialog]);

  const handleSelectAll = useCallback((cartIds: string[]) => {
    if (cartIds.length === 0) {
      deselectAll();
    } else {
      selectAll(cartIds);
    }
  }, [selectAll, deselectAll]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    updateFilters({
      ...filters,
      page: model.page + 1,
      limit: model.pageSize,
    });
  };

  const handleSendAllReminders = () => {
    sendAllRemindersMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  // Toggle cart selection
  const handleToggleCartSelection = useCallback((cartId: string) => {
    const ids = selectedCarts.includes(cartId)
      ? selectedCarts.filter(id => id !== cartId)
      : [...selectedCarts, cartId];
    if (ids.length === 0) {
      deselectAll();
    } else {
      selectAll(ids);
    }
  }, [selectedCarts, selectAll, deselectAll]);

  // Handle pagination change for card view
  const handlePaginationChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    setPaginationModel({ ...paginationModel, page: value - 1 });
    updateFilters({
      ...filters,
      page: value,
      limit: paginationModel.pageSize,
    });
  }, [paginationModel, filters, updateFilters]);

  // Data preparation
  const carts = cartData?.carts || [];
  const total = cartData?.count || 0;
  
  // Calculate total pages for pagination
  const totalPages = Math.ceil(total / paginationModel.pageSize);

  // Calculate statistics
  const totalAbandonedValue = useMemo(
    () =>
      carts.reduce(
        (sum: number, cart: Cart) => sum + (getCartSummary(cart, cart.currency)?.total || 0),
        0,
      ),
    [carts]
  );
  const averageAbandonedValue = carts.length > 0 ? totalAbandonedValue / carts.length : 0;
  const cartsWithNoEmails = useMemo(() => 
    carts.filter((cart: Cart) => (cart.abandonmentEmailsSent || 0) === 0).length,
    [carts]
  );
  const cartsWithEmails = useMemo(() => 
    carts.filter((cart: Cart) => (cart.abandonmentEmailsSent || 0) > 0).length,
    [carts]
  );

  const getUserDisplayName = useCallback((cart: Cart) => {
    if (cart.user) {
      return cart.user.name || cart.user.email || cart.user.phone || t('list.user.unknown');
    }
    // If user object is not populated but userId exists, show loading or fetch user info
    if (cart.userId) {
      return t('list.user.loading', 'جاري التحميل...');
    }
    return cart.deviceId ? `${t('list.user.device')} ${cart.deviceId.slice(-8)}` : t('list.user.guest');
  }, [t]);

  const getUserContact = useCallback((cart: Cart) => {
    if (cart.user) {
      return cart.user.email || cart.user.phone || t('list.user.noContact');
    }
    // If user object is not populated but userId exists
    if (cart.userId) {
      return t('list.user.noContact');
    }
    return t('list.user.noContact');
  }, [t]);

  const getCartItemsCount = useCallback((cart: Cart) => cart.items?.length || 0, []);
  const getCartTotal = useCallback(
    (cart: Cart) => getCartSummary(cart, cart.currency)?.total || 0,
    [],
  );
  const getLastActivity = useCallback((cart: Cart) => 
    cart.lastActivityAt ? formatRelativeTime(cart.lastActivityAt) : formatRelativeTime(cart.updatedAt),
    []
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'user',
        headerName: t('list.columns.user') as string,
        flex: isMobile ? 0 : 1.2,
        minWidth: isMobile ? 150 : 200,
        sortable: false,
        renderCell: (params) => {
          const cart = params.row as Cart;
          const hasUser = !!cart.user;
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar 
                sx={{ 
                  width: { xs: 24, sm: 32 }, 
                  height: { xs: 24, sm: 32 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                {hasUser ? 'U' : 'D'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getUserDisplayName(cart)}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {getUserContact(cart)}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'status',
        headerName: t('list.columns.status') as string,
        width: isMobile ? 100 : 140,
        minWidth: 100,
        renderCell: (params) => {
          const cart = params.row as Cart;
          const color = getStatusColor(cart.status);
          return (
            <Chip
              label={formatCartStatus(cart.status)}
              size="small"
              sx={{ 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? `${color}30` 
                  : `${color}20`, 
                color,
                border: `1px solid ${color}${theme.palette.mode === 'dark' ? '60' : '40'}`,
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
              }}
            />
          );
        },
      },
      {
        field: 'itemsCount',
        headerName: t('list.columns.itemsCount') as string,
        width: isMobile ? 90 : 130,
        minWidth: 90,
        valueGetter: (_value, row) => getCartItemsCount(row as Cart),
      },
      {
        field: 'totalValue',
        headerName: t('list.columns.totalValue') as string,
        width: isMobile ? 110 : 150,
        minWidth: 110,
        renderCell: (params) => {
          const cart = params.row as Cart;
          return (
            <Typography 
              variant="body2" 
              fontWeight="medium"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: 'text.primary',
              }}
            >
              {formatCurrency(getCartTotal(cart), cart.currency)}
            </Typography>
          );
        },
      },
      {
        field: 'lastActivity',
        headerName: t('list.columns.lastActivity') as string,
        flex: isMobile ? 0 : 0.9,
        minWidth: isMobile ? 120 : 150,
        sortable: false,
        renderCell: (params) => {
          const cart = params.row as Cart;
          return (
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  display: 'block',
                }}
              >
                {formatDate(cart.createdAt)}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'text.primary',
                }}
              >
                {getLastActivity(cart)}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'additionalInfo',
        headerName: t('list.columns.additionalInfo') as string,
        flex: isMobile ? 0 : 1,
        minWidth: isMobile ? 120 : 150,
        sortable: false,
        renderCell: (params) => {
          const cart = params.row as Cart;
          return (
            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
              {cart.isAbandoned && (
                <Chip
                  label={t('list.status.emailsSent', { count: cart.abandonmentEmailsSent })}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
              {cart.convertedToOrderId && (
                <Chip
                  label={t('list.status.convertedToOrder')}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
            </Box>
          );
        },
      },
      {
        field: 'actions',
        headerName: t('list.columns.actions') as string,
        width: isMobile ? 120 : 170,
        minWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const cart = params.row as Cart;
          const canSendReminder = cart.isAbandoned || cart.status === 'abandoned';
          const canConvert = cart.status === 'active' && getCartItemsCount(cart) > 0;
          return (
            <Box display="flex" alignItems="center" gap={0.25}>
              <Tooltip title={t('list.menu.viewDetails') as string}>
                <IconButton 
                  size="small" 
                  onClick={() => handleViewCart(cart)}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  <Visibility fontSize="inherit" />
                </IconButton>
              </Tooltip>
              {canConvert && (
                <Tooltip title={t('list.menu.convertToOrder') as string}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleConvertToOrder(cart)}
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    <ShoppingCartCheckout fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
              {canSendReminder && (
                <Tooltip title={t('list.menu.sendReminder') as string}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleSendReminder(cart)}
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    <Email fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('list.menu.deleteCart') as string}>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleDeleteCart(cart)}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  <Delete fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [
      t,
      isMobile,
      theme.palette.mode,
      getUserDisplayName,
      getUserContact,
      getCartItemsCount,
      getCartTotal,
      getLastActivity,
      handleDeleteCart,
      handleViewCart,
      handleConvertToOrder,
      handleSendReminder,
    ]
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2rem' },
            color: 'text.primary',
          }}
        >
          {t('navigation.abandonedCarts')}
        </Typography>
        <Box 
          display="flex" 
          gap={1} 
          flexWrap="wrap"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('actions.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSendAllReminders}
            disabled={isLoading || sendAllRemindersMutation.isPending}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('actions.sendAllReminders')}
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
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flex={1}>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    color="warning.main"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                      fontWeight: 'bold',
                    }}
                  >
                    {total.toLocaleString('en-US')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('stats.totalAbandonedCarts')}
                  </Typography>
                </Box>
                <TrendingDown 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    color: 'warning.main',
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flex={1}>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    color="error.main"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                      fontWeight: 'bold',
                    }}
                  >
                    {totalAbandonedValue.toLocaleString('en-US')} $
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('stats.totalAbandonedValue')}
                  </Typography>
                </Box>
                <MonetizationOn 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    color: 'error.main',
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flex={1}>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    color="info.main"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                      fontWeight: 'bold',
                    }}
                  >
                    {averageAbandonedValue.toLocaleString('en-US')} $
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('stats.averageAbandonedValue')}
                  </Typography>
                </Box>
                <MonetizationOn 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    color: 'info.main',
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flex={1}>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    color="primary.main"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                      fontWeight: 'bold',
                    }}
                  >
                    {cartsWithEmails}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('stats.cartsWithEmails')}
                  </Typography>
                </Box>
                <Email 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    color: 'primary.main',
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: 'text.primary',
              mb: 2,
            }}
          >
            {t('actions.quickActions')}
          </Typography>
          <Box 
            display="flex" 
            gap={2} 
            flexWrap="wrap"
            flexDirection={{ xs: 'column', sm: 'row' }}
          >
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={() => {
                const cartsToRemind = carts.filter(
                  (cart) => (cart.abandonmentEmailsSent || 0) === 0
                );
                if (cartsToRemind.length === 0) {
                  enqueueSnackbar(t('actions.allCartsReminded'), { variant: 'info' });
                } else {
                  enqueueSnackbar(t('actions.remindersWillBeSent', { count: cartsToRemind.length }), {
                    variant: 'info',
                  });
                }
              }}
              disabled={cartsWithNoEmails === 0}
              fullWidth={isMobile}
              size={isMobile ? 'medium' : 'large'}
            >
              {t('actions.sendRemindersToNewCarts', { count: cartsWithNoEmails })}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => {
                const followUpCarts = carts.filter((cart) => {
                  const emailsSent = cart.abandonmentEmailsSent || 0;
                  return emailsSent > 0 && emailsSent < 3;
                });
                enqueueSnackbar(t('actions.followUpCartsCount', { count: followUpCarts.length }), {
                  variant: 'info',
                });
              }}
              fullWidth={isMobile}
              size={isMobile ? 'medium' : 'large'}
            >
              {t('actions.viewFollowUpCarts')}
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

      {/* DataTable - Desktop */}
      {!isXs ? (
        <DataTable
          columns={columns}
          rows={carts as unknown as any[]}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          selectable={true}
          onRowSelectionModelChange={(selection) => {
            const ids = selection as unknown as string[];
            handleSelectAll(ids || []);
          }}
          getRowId={(row) => (row as Cart)._id}
          height={isMobile ? 500 : 600}
          rowHeight={isMobile ? 80 : 56}
        />
      ) : (
        /* Card View - Mobile */
        <Box>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : carts.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('list.empty.message')}
            </Alert>
          ) : (
            <>
              <Grid container spacing={2}>
                {carts.map((cart) => {
                  const canSendReminder = cart.isAbandoned || cart.status === 'abandoned';
                  const canConvert = cart.status === 'active' && getCartItemsCount(cart) > 0;
                  const isSelected = selectedCarts.includes(cart._id);
                  
                  return (
                    <Grid key={cart._id} size={{ xs: 6 }}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => handleViewCart(cart)}
                      >
                        <CardContent sx={{ flex: 1, p: 2 }}>
                          {/* Checkbox */}
                          <Box display="flex" alignItems="center" mb={1}>
                            <Checkbox
                              checked={isSelected}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCartSelection(cart._id);
                              }}
                              size="small"
                              sx={{ p: 0.5 }}
                            />
                            <Box flex={1} />
                            <Chip
                              label={formatCartStatus(cart.status)}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? `${getStatusColor(cart.status)}30`
                                  : `${getStatusColor(cart.status)}20`,
                                color: getStatusColor(cart.status),
                                border: `1px solid ${getStatusColor(cart.status)}${theme.palette.mode === 'dark' ? '60' : '40'}`,
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          </Box>

                          {/* User Info */}
                          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.75rem',
                                bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                                color: 'primary.contrastText',
                              }}
                            >
                              {cart.user ? 'U' : 'D'}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{
                                  fontSize: '0.8rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {getUserDisplayName(cart)}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 1 }} />

                          {/* Cart Details */}
                          <Stack spacing={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {t('list.columns.itemsCount')}
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {getCartItemsCount(cart)}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {t('list.columns.totalValue')}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {formatCurrency(getCartTotal(cart), cart.currency)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {formatDate(cart.createdAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getLastActivity(cart)}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Additional Info */}
                          {(cart.isAbandoned || cart.convertedToOrderId) && (
                            <Box mt={1}>
                              {cart.isAbandoned && (
                                <Chip
                                  label={t('list.status.emailsSent', { count: cart.abandonmentEmailsSent })}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', mr: 0.5 }}
                                />
                              )}
                              {cart.convertedToOrderId && (
                                <Chip
                                  label={t('list.status.convertedToOrder')}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                        </CardContent>

                        {/* Actions */}
                        <Box
                          display="flex"
                          justifyContent="center"
                          gap={1}
                          p={1.5}
                          borderTop={1}
                          borderColor="divider"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip title={t('list.menu.viewDetails') as string}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewCart(cart)}
                              color="primary"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {canConvert && (
                            <Tooltip title={t('list.menu.convertToOrder') as string}>
                              <IconButton
                                size="small"
                                onClick={() => handleConvertToOrder(cart)}
                                color="success"
                              >
                                <ShoppingCartCheckout fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canSendReminder && (
                            <Tooltip title={t('list.menu.sendReminder') as string}>
                              <IconButton
                                size="small"
                                onClick={() => handleSendReminder(cart)}
                                color="warning"
                              >
                                <Email fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={t('list.menu.deleteCart') as string}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCart(cart)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={paginationModel.page + 1}
                    onChange={handlePaginationChange}
                    color="primary"
                    size="large"
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Box>
              )}
            </>
          )}
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

      {/* Floating Action Button - Mobile Only */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="refresh"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
          onClick={handleRefresh}
          disabled={isLoading}
          size="medium"
        >
          <Refresh />
        </Fab>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Box>
  );
};

export default AbandonedCartsPage;
