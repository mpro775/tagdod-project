import React, { useMemo, useState, useCallback } from 'react';
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
  useTheme,
  Card,
  CardContent,
  Grid,
  Checkbox,
  Stack,
  Divider,
  Pagination,
} from '@mui/material';
import { Refresh, Delete, Visibility, ShoppingCartCheckout, Email, ShoppingCart } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { CartFilters, Cart, BulkActionRequest } from '../types/cart.types';
import { useCartList, useCartFilters, useCartSelection, useBulkActions } from '../hooks/useCart';
import {
  CartStatsCards,
  CartFilters as CartFiltersComponent,
  CartDetailsModal,
} from '../components';
import { ConvertToOrderDialog } from './ConvertToOrderDialog';
import { SendReminderDialog } from './SendReminderDialog';
import { DataTable } from '@/shared/components';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getStatusColor,
  formatCartStatus,
} from '../api/cartApi';

export const CartManagementPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('cart');
  const theme = useTheme();
  const { isMobile, isXs } = useBreakpoint();
  const { confirmDialog, dialogProps } = useConfirmDialog();

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

  const { selectedCarts, selectAll, deselectAll } = useCartSelection();

  const { data: cartData, isLoading, error, refetch } = useCartList(filters);

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

  const handleViewCart = useCallback((cart: Cart) => {
    setSelectedCart(cart);
    setShowCartDetails(true);
  }, []);

  const handleConvertToOrder = useCallback((cart: Cart) => {
    setSelectedCart(cart);
    setShowConvertDialog(true);
  }, []);

  const handleSendReminder = useCallback((cart: Cart) => {
    setSelectedCart(cart);
    setShowReminderDialog(true);
  }, []);

  const handleDeleteCart = useCallback(
    async (cart: Cart) => {
      const confirmed = await confirmDialog({
        title: t('dialogs.delete.title', 'تأكيد الحذف'),
        message: t('dialogs.delete.message'),
        type: 'warning',
        confirmColor: 'error',
      });
      if (confirmed) {
        const bulkRequest: BulkActionRequest = {
          action: 'delete',
          cartIds: [cart._id],
        };
        bulkActionsMutation.mutate(bulkRequest);
      }
    },
    [t, bulkActionsMutation, confirmDialog]
  );
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

  const handleBulkDelete = async () => {
    if (selectedCarts.length === 0) {
      enqueueSnackbar(t('bulk.noneSelected'), {
        variant: 'warning',
      });
      return;
    }

    const confirmed = await confirmDialog({
      title: t('dialogs.bulkDelete.title', 'تأكيد الحذف الجماعي'),
      message: t('dialogs.bulkDelete.message', {
        count: selectedCarts.length,
      }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      const bulkRequest: BulkActionRequest = {
        action: 'delete',
        cartIds: selectedCarts,
      };
      bulkActionsMutation.mutate(bulkRequest);
    }
  };

  const handleBulkClear = async () => {
    if (selectedCarts.length === 0) {
      enqueueSnackbar(t('bulk.noneSelected'), {
        variant: 'warning',
      });
      return;
    }

    const confirmed = await confirmDialog({
      title: t('dialogs.bulkClear.title', 'تأكيد التصفية الجماعية'),
      message: t('dialogs.bulkClear.message', {
        count: selectedCarts.length,
      }),
      type: 'warning',
      confirmColor: 'warning',
    });
    if (confirmed) {
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

  const paginationModel: GridPaginationModel = useMemo(
    () => ({ page, pageSize: limit }),
    [page, limit]
  );

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (model.page !== page) {
      handlePageChange(model.page);
    }
    if (model.pageSize !== limit) {
      handleLimitChange(model.pageSize);
    }
  };

  const getUserDisplayName = useCallback(
    (cart: Cart) => {
      if (cart.user) {
        return (
          cart.user.name ||
          cart.user.email ||
          t('list.user.unknown')
        );
      }
      return cart.deviceId
        ? `${t('list.user.device')} ${cart.deviceId.slice(-8)}`
        : t('list.user.guest');
    },
    [t]
  );

  const getUserContact = useCallback(
    (cart: Cart) => {
      if (cart.user) {
        return (
          cart.user.email ||
          cart.user.phone ||
          t('list.user.noContact')
        );
      }
      return t('list.user.noContact');
    },
    [t]
  );

  const getCartItemsCount = useCallback((cart: Cart) => cart.items?.length || 0, []);
  const getCartTotal = (cart: Cart) => cart.pricingSummary?.total || 0;
  const getLastActivity = (cart: Cart) =>
    cart.lastActivityAt
      ? formatRelativeTime(cart.lastActivityAt)
      : formatRelativeTime(cart.updatedAt);

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
        valueGetter: (params: any) => getCartItemsCount(params.row as Cart),
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
      handleDeleteCart,
      handleSendReminder,
      handleConvertToOrder,
      getCartItemsCount,
      handleViewCart,
    ]
  );

  // Calculate total pages for pagination
  const totalPages = cartData?.pagination?.totalPages || 0;

  // Handle pagination change
  const handlePaginationChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    handlePageChange(value - 1);
  };

  // Toggle cart selection
  const handleToggleCartSelection = (cartId: string) => {
    const ids = selectedCarts.includes(cartId)
      ? selectedCarts.filter(id => id !== cartId)
      : [...selectedCarts, cartId];
    if (ids.length === 0) {
      deselectAll();
    } else {
      selectAll(ids);
    }
  };

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
        <Box display="flex" alignItems="center" gap={2}>
          <ShoppingCart fontSize={isMobile ? 'medium' : 'large'} color="primary" />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: 'text.primary',
            }}
          >
            {t('navigation.title')}
          </Typography>
        </Box>
        <Box display="flex" gap={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
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
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          mb={2}
          p={{ xs: 1.5, sm: 2 }}
          bgcolor={theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light'}
          borderRadius={1}
          flexWrap="wrap"
        >
          <Typography 
            variant="body2" 
            color={theme.palette.mode === 'dark' ? 'primary.contrastText' : 'primary.dark'}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              flex: { xs: '1 1 100%', sm: '0 0 auto' },
            }}
          >
            {t('bulk.selected', { count: selectedCarts.length })}
          </Typography>
          <Box 
            display="flex" 
            gap={1} 
            flexWrap="wrap"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              size={isMobile ? 'small' : 'medium'}
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={handleBulkDelete}
              disabled={bulkActionsMutation.isPending}
              fullWidth={isMobile}
            >
              {t('actions.bulkDelete')}
            </Button>
            <Button
              size={isMobile ? 'small' : 'medium'}
              variant="outlined"
              color="error"
              onClick={handleBulkClear}
              disabled={bulkActionsMutation.isPending}
              fullWidth={isMobile}
            >
              {t('actions.bulkClear')}
            </Button>
            <Button 
              size={isMobile ? 'small' : 'medium'}
              variant="outlined" 
              onClick={() => handleSelectAll([])}
              fullWidth={isMobile}
            >
              {t('actions.deselectAll')}
            </Button>
          </Box>
        </Box>
      )}

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
                    page={page + 1}
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

export default CartManagementPage;
