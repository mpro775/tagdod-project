import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  ShoppingCartCheckout,
  Email,
  Delete,
  Person,
  DeviceUnknown,
  ShoppingCart,
} from '@mui/icons-material';
import { Cart, CartStatus } from '../types/cart.types';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getStatusColor,
  formatCartStatus,
} from '../api/cartApi';

interface CartTableProps {
  carts: Cart[];
  isLoading?: boolean;
  selectedCarts: string[];
  onSelectCart: (cartId: string) => void;
  onSelectAll: (cartIds: string[]) => void;
  onViewCart: (cart: Cart) => void;
  onConvertToOrder: (cart: Cart) => void;
  onSendReminder: (cart: Cart) => void;
  onDeleteCart: (cart: Cart) => void;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  error?: string;
}

interface CartTableRowProps {
  cart: Cart;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onConvertToOrder: () => void;
  onSendReminder: () => void;
  onDelete: () => void;
}

const CartTableRow: React.FC<CartTableRowProps> = ({
  cart,
  isSelected,
  onSelect,
  onView,
  onConvertToOrder,
  onSendReminder,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  const getCartTotal = () => {
    return cart.pricingSummary?.total || 0;
  };

  const getCartItemsCount = () => {
    return cart.items?.length || 0;
  };

  const getUserDisplayName = () => {
    if (cart.user) {
      return cart.user.name || cart.user.email || 'مستخدم غير معروف';
    }
    return cart.deviceId ? `جهاز ${cart.deviceId.slice(-8)}` : 'ضيف';
  };

  const getUserContact = () => {
    if (cart.user) {
      return cart.user.email || cart.user.phone || 'لا يوجد';
    }
    return 'غير متاح';
  };

  const getLastActivity = () => {
    if (cart.lastActivityAt) {
      return formatRelativeTime(cart.lastActivityAt);
    }
    return formatRelativeTime(cart.updatedAt);
  };

  const canSendReminder = cart.isAbandoned || cart.status === CartStatus.ABANDONED;
  const canConvert = cart.status === CartStatus.ACTIVE && getCartItemsCount() > 0;

  return (
    <TableRow hover selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={onSelect} color="primary" />
      </TableCell>

      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {cart.user ? (
            <Avatar sx={{ width: 32, height: 32 }}>
              <Person />
            </Avatar>
          ) : (
            <Avatar sx={{ width: 32, height: 32 }}>
              <DeviceUnknown />
            </Avatar>
          )}
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {getUserDisplayName()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getUserContact()}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Chip
          label={formatCartStatus(cart.status)}
          size="small"
          sx={{
            backgroundColor: `${getStatusColor(cart.status)}20`,
            color: getStatusColor(cart.status),
            border: `1px solid ${getStatusColor(cart.status)}40`,
          }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2">{getCartItemsCount()} منتج</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" fontWeight="medium">
          {formatCurrency(getCartTotal(), cart.currency)}
        </Typography>
      </TableCell>

      <TableCell>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {formatDate(cart.createdAt)}
          </Typography>
          <Typography variant="body2">{getLastActivity()}</Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {cart.isAbandoned && (
            <Chip
              label={`${cart.abandonmentEmailsSent} إيميل`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {cart.convertedToOrderId && (
            <Chip label="محولة" size="small" color="success" variant="outlined" />
          )}
        </Box>
      </TableCell>

      <TableCell>
        <Tooltip title="المزيد من الإجراءات">
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => handleAction(onView)}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>عرض التفاصيل</ListItemText>
          </MenuItem>

          {canConvert && (
            <MenuItem onClick={() => handleAction(onConvertToOrder)}>
              <ListItemIcon>
                <ShoppingCartCheckout fontSize="small" />
              </ListItemIcon>
              <ListItemText>تحويل إلى طلب</ListItemText>
            </MenuItem>
          )}

          {canSendReminder && (
            <MenuItem onClick={() => handleAction(onSendReminder)}>
              <ListItemIcon>
                <Email fontSize="small" />
              </ListItemIcon>
              <ListItemText>إرسال تذكير</ListItemText>
            </MenuItem>
          )}

          <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>حذف السلة</ListItemText>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

const LoadingSkeleton: React.FC = () => (
  <>
    {[...Array(5)].map((_, index) => (
      <TableRow key={index}>
        <TableCell padding="checkbox">
          <Skeleton variant="rectangular" width={20} height={20} />
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={16} />
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Skeleton variant="rectangular" width={60} height={24} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={40} height={20} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={80} height={20} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={100} height={20} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width={60} height={20} />
        </TableCell>
        <TableCell>
          <Skeleton variant="circular" width={32} height={32} />
        </TableCell>
      </TableRow>
    ))}
  </>
);

export const CartTable: React.FC<CartTableProps> = ({
  carts,
  isLoading = false,
  selectedCarts,
  onSelectCart,
  onSelectAll,
  onViewCart,
  onConvertToOrder,
  onSendReminder,
  onDeleteCart,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  error,
}) => {
  const allCartIds = carts.map((cart) => cart._id);
  const isAllSelected =
    allCartIds.length > 0 && allCartIds.every((id) => selectedCarts.includes(id));
  const isIndeterminate = selectedCarts.length > 0 && selectedCarts.length < allCartIds.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(allCartIds);
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[100],
            }}
          >
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>المستخدم</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>الحالة</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>عدد المنتجات</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>القيمة الإجمالية</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>آخر نشاط</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>معلومات إضافية</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton />
            ) : carts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <ShoppingCart color="disabled" sx={{ fontSize: 48 }} />
                    <Typography variant="h6" color="text.secondary">
                      لا توجد سلات
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      لم يتم العثور على أي سلات تطابق المعايير المحددة
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              carts.map((cart) => (
                <CartTableRow
                  key={cart._id}
                  cart={cart}
                  isSelected={selectedCarts.includes(cart._id)}
                  onSelect={() => onSelectCart(cart._id)}
                  onView={() => onViewCart(cart)}
                  onConvertToOrder={() => onConvertToOrder(cart)}
                  onSendReminder={() => onSendReminder(cart)}
                  onDelete={() => onDeleteCart(cart)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="عدد الصفوف في الصفحة:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
        sx={{
          '& .MuiTablePagination-toolbar': {
            direction: 'ltr',
          },
        }}
      />
    </Paper>
  );
};

export default CartTable;
