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
} from '@mui/material';
import {
  Close,
  Person,
  DeviceUnknown,
  ShoppingCart,
  Email,
  ShoppingCartCheckout,
} from '@mui/icons-material';
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
      return cart.user.name || cart.user.email || 'مستخدم غير معروف';
    }
    return cart?.deviceId ? `جهاز ${cart.deviceId.slice(-8)}` : 'ضيف';
  };

  const getUserContact = () => {
    if (cart?.user) {
      return cart.user.email || cart.user.phone || 'لا يوجد';
    }
    return 'غير متاح';
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCart />
            <Typography variant="h6">تفاصيل السلة</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box>
            <Skeleton variant="rectangular" height={200} />
            <Box mt={2}>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={24} />
            </Box>
          </Box>
        ) : !cart ? (
          <Alert severity="error">لا يمكن تحميل تفاصيل السلة</Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Cart Overview */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  نظرة عامة على السلة
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={formatCartStatus(cart.status)}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(cart.status)}20`,
                          color: getStatusColor(cart.status),
                          border: `1px solid ${getStatusColor(cart.status)}40`,
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      عدد المنتجات
                    </Typography>
                    <Typography variant="h6">{getCartItemsCount()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      القيمة الإجمالية
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(getCartTotal(), cart.currency)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      آخر نشاط
                    </Typography>
                    <Typography variant="body2">{getLastActivity()}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* User Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  معلومات المستخدم
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {cart.user ? (
                    <Avatar sx={{ width: 48, height: 48 }}>
                      <Person />
                    </Avatar>
                  ) : (
                    <Avatar sx={{ width: 48, height: 48 }}>
                      <DeviceUnknown />
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="h6">{getUserDisplayName()}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getUserContact()}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      نوع الحساب
                    </Typography>
                    <Typography variant="body2">{cart.accountType || 'تجزئة'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      العملة
                    </Typography>
                    <Typography variant="body2">{cart.currency}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Cart Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  تفاصيل السلة
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الإنشاء
                    </Typography>
                    <Typography variant="body2">{formatDate(cart.createdAt)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      آخر تحديث
                    </Typography>
                    <Typography variant="body2">{formatDate(cart.updatedAt)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      حالة الهجر
                    </Typography>
                    <Typography variant="body2">
                      {cart.isAbandoned ? 'متروكة' : 'غير متروكة'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      الإيميلات المرسلة
                    </Typography>
                    <Typography variant="body2">{cart.abandonmentEmailsSent || 0}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Cart Items */}
            {cart.items && cart.items.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    منتجات السلة ({cart.items.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>المنتج</TableCell>
                          <TableCell>الكمية</TableCell>
                          <TableCell>السعر</TableCell>
                          <TableCell>الإجمالي</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.productSnapshot?.name || 'منتج غير معروف'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.productSnapshot?.brandName || 'علامة تجارية غير معروفة'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>
                              {formatCurrency(item.pricing?.finalPrice || 0, cart.currency)}
                            </TableCell>
                            <TableCell>
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
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    ملخص التسعير
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        المجموع الفرعي
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(cart.pricingSummary.subtotal, cart.currency)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        خصم الترويج
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(cart.pricingSummary.promotionDiscount, cart.currency)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        خصم الكوبون
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency(cart.pricingSummary.couponDiscount, cart.currency)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        الإجمالي النهائي
                      </Typography>
                      <Typography variant="h6" color="primary">
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

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
        {cart && canSendReminder && (
          <Button variant="outlined" startIcon={<Email />} onClick={handleSendReminder}>
            إرسال تذكير
          </Button>
        )}
        {cart && canConvert && (
          <Button
            variant="contained"
            startIcon={<ShoppingCartCheckout />}
            onClick={handleConvertToOrder}
          >
            تحويل إلى طلب
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CartDetailsModal;
