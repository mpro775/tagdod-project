import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Close,
  Person,
  DeviceUnknown,
  ShoppingCart,
  Email,
  ShoppingCartCheckout,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Cart, CartStatus } from '../types/cart.types';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getStatusColor,
  formatCartStatus,
} from '../api/cartApi';

interface CartDetailsModalProps {
  cart: Cart | null;
  open: boolean;
  onClose: () => void;
  onConvertToOrder: (cart: Cart) => void;
  onSendReminder: (cart: Cart) => void;
  isLoading?: boolean;
}

export const CartDetailsModal: React.FC<CartDetailsModalProps> = ({
  cart,
  open,
  onClose,
  onConvertToOrder,
  onSendReminder,
  isLoading = false,
}) => {
  const { t } = useTranslation('cart');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();

  if (!cart && !isLoading) {
    return null;
  }

  const getCartTotal = () => {
    return cart?.pricingSummary?.total || 0;
  };

  const getCartItemsCount = () => {
    return cart?.items?.length || 0;
  };

  const getUserDisplayName = () => {
    if (cart?.user) {
      return cart.user.name || cart.user.email || t('list.user.unknown');
    }
    return cart?.deviceId 
      ? t('list.user.device', { id: cart.deviceId.slice(-8) })
      : t('list.user.guest');
  };

  const getUserContact = () => {
    if (cart?.user) {
      return cart.user.email || cart.user.phone || t('list.user.noContact');
    }
    return t('list.user.noContact');
  };

  const getLastActivity = () => {
    if (cart?.lastActivityAt) {
      return formatRelativeTime(cart.lastActivityAt);
    }
    return formatRelativeTime(cart?.updatedAt || new Date());
  };

  const canSendReminder = cart?.isAbandoned || cart?.status === CartStatus.ABANDONED;
  const canConvert = cart?.status === CartStatus.ACTIVE && getCartItemsCount() > 0;

  const handleConvertToOrder = () => {
    if (cart) {
      onConvertToOrder(cart);
    }
  };

  const handleSendReminder = () => {
    if (cart) {
      onSendReminder(cart);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : '60vh',
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          color: 'text.primary',
          pb: 1,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCart sx={{ color: 'primary.main', fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
            <Typography 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 'bold',
              }}
            >
              {t('details.title')}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent 
        dividers
        sx={{ 
          borderColor: 'divider',
          p: { xs: 2, sm: 3 },
        }}
      >
        {isLoading ? (
          <Box>
            <Skeleton 
              variant="rectangular" 
              sx={{ 
                height: { xs: 150, sm: 200 },
                borderRadius: 2,
              }} 
            />
            <Box mt={2}>
              <Skeleton 
                variant="text" 
                sx={{ 
                  height: { xs: 28, sm: 32 },
                  mb: 1,
                }} 
              />
              <Skeleton 
                variant="text" 
                sx={{ 
                  height: { xs: 20, sm: 24 },
                  mb: 0.5,
                }} 
              />
              <Skeleton 
                variant="text" 
                sx={{ 
                  height: { xs: 20, sm: 24 },
                }} 
              />
            </Box>
          </Box>
        ) : !cart ? (
          <Alert severity="error">{t('details.loadError')}</Alert>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Cart Overview */}
            <Grid size={{ xs: 12 }}>
              <Paper 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  mb: 2,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  {t('details.overview')}
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={formatCartStatus(cart.status)}
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? `${getStatusColor(cart.status)}30` 
                            : `${getStatusColor(cart.status)}20`,
                          color: getStatusColor(cart.status),
                          border: `1px solid ${getStatusColor(cart.status)}${theme.palette.mode === 'dark' ? '60' : '40'}`,
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.itemsCount')}
                    </Typography>
                    <Typography 
                      variant="h6"
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      {getCartItemsCount()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.totalValue')}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="primary.main"
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        fontWeight: 'bold',
                      }}
                    >
                      {formatCurrency(getCartTotal(), cart.currency)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.lastActivity')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {getLastActivity()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* User Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper 
                sx={{ 
                  p: { xs: 1.5, sm: 2 },
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  {t('details.userInfo')}
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {cart.user ? (
                    <Avatar 
                      sx={{ 
                        width: { xs: 40, sm: 48 }, 
                        height: { xs: 40, sm: 48 },
                        bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    >
                      <Person />
                    </Avatar>
                  ) : (
                    <Avatar 
                      sx={{ 
                        width: { xs: 40, sm: 48 }, 
                        height: { xs: 40, sm: 48 },
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                      }}
                    >
                      <DeviceUnknown />
                    </Avatar>
                  )}
                  <Box>
                    <Typography 
                      variant="h6"
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 'bold',
                        color: 'text.primary',
                      }}
                    >
                      {getUserDisplayName()}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {getUserContact()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'divider' }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.accountType')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {cart.accountType || t('details.retail')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.currency')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {cart.currency}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Cart Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper 
                sx={{ 
                  p: { xs: 1.5, sm: 2 },
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 'bold',
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  {t('details.cartDetails')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.createdAt')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {formatDate(cart.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.updatedAt')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {formatDate(cart.updatedAt)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.abandonmentStatus')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {cart.isAbandoned ? t('details.abandoned') : t('details.notAbandoned')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                    >
                      {t('details.emailsSent')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {cart.abandonmentEmailsSent || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Cart Items */}
            {cart.items && cart.items.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper 
                  sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('details.cartItems', { count: cart.items.length })}
                  </Typography>
                  <TableContainer>
                    <Table size={isMobile ? 'small' : 'medium'}>
                      <TableHead
                        sx={{
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'grey.50',
                        }}
                      >
                        <TableRow>
                          <TableCell 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'text.primary',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {t('details.itemsTable.product')}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'text.primary',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {t('details.itemsTable.quantity')}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'text.primary',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {t('details.itemsTable.price')}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: 'text.primary',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {t('details.itemsTable.total')}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="medium"
                                  sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    color: 'text.primary',
                                  }}
                                >
                                  {item.productSnapshot?.name || t('details.itemsTable.unknownProduct')}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                                >
                                  {item.productSnapshot?.brandName || t('details.itemsTable.unknownBrand')}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {item.qty}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {formatCurrency(item.pricing?.finalPrice || 0, cart.currency)}
                            </TableCell>
                            <TableCell
                              sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 'medium',
                              }}
                            >
                              {formatCurrency(
                                (item.pricing?.finalPrice || 0) * item.qty,
                                cart.currency
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}

            {/* Pricing Summary */}
            {cart.pricingSummary && (
              <Grid size={{ xs: 12 }}>
                <Paper 
                  sx={{ 
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {t('details.pricingSummary')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                      >
                        {t('details.subtotal')}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {formatCurrency(cart.pricingSummary.subtotal, cart.currency)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                      >
                        {t('details.promotionDiscount')}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {formatCurrency(cart.pricingSummary.promotionDiscount, cart.currency)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                      >
                        {t('details.couponDiscount')}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {formatCurrency(cart.pricingSummary.couponDiscount, cart.currency)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 0.5 }}
                      >
                        {t('details.finalTotal')}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color="primary.main"
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(cart.pricingSummary.total, cart.currency)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      <DialogActions
        sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 },
          borderTop: 1,
          borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button 
          onClick={onClose}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
          sx={{ 
            order: { xs: 3, sm: 1 },
            minWidth: { xs: '100%', sm: 'auto' },
          }}
        >
          {t('actions.close')}
        </Button>
        {cart && canSendReminder && (
          <Button 
            variant="outlined" 
            startIcon={<Email />} 
            onClick={handleSendReminder}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
            sx={{ 
              order: { xs: 2, sm: 2 },
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('actions.sendReminder')}
          </Button>
        )}
        {cart && canConvert && (
          <Button
            variant="contained"
            startIcon={<ShoppingCartCheckout />}
            onClick={handleConvertToOrder}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
            sx={{ 
              order: { xs: 1, sm: 3 },
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('actions.convert')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CartDetailsModal;
