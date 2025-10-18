import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  ShoppingCart,
  AttachMoney,
  Person,
  LocalShipping,
  AccessTime,
} from '@mui/icons-material';
import { Order } from '@/features/orders/types/order.types';
import { STATUS_COLORS } from '@/config/constants';

interface OrderCardProps {
  order: Order;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onView?: (order: Order) => void;
  onUpdateStatus?: (order: Order) => void;
  showActions?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onEdit,
  onDelete,
  onView,
  onUpdateStatus,
  showActions = true,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: (order: Order) => void) => {
    action(order);
    handleMenuClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'في الانتظار',
      confirmed: 'مؤكد',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغي',
      refunded: 'مسترد',
    };
    return statusMap[status] || status;
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              bgcolor: 'primary.main'
            }}
          >
            <ShoppingCart />
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              طلب #{order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(order.createdAt)}
            </Typography>
          </Box>

          {showActions && (
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Order Info */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {order.customer?.name || order.customer?.email || 'عميل غير معروف'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              المجموع: {formatPrice(order.total)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ShoppingCart sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {order.items?.length || 0} عنصر
            </Typography>
          </Box>

          {order.shippingAddress && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalShipping sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Status and Payment */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={getStatusText(order.status)}
            color={getStatusColor(order.status) as any}
            size="small"
            variant="outlined"
          />
          
          {order.paymentStatus && (
            <Chip
              label={order.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}
              color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Items Summary */}
        {order.items && order.items.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              العناصر:
            </Typography>
            {order.items.slice(0, 2).map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                  {item.product?.name || 'منتج غير معروف'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  x{item.quantity}
                </Typography>
              </Box>
            ))}
            {order.items.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{order.items.length - 2} عنصر آخر
              </Typography>
            )}
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(order.updatedAt)}
            </Typography>
          </Box>
          
          {order.isUrgent && (
            <Chip
              label="عاجل"
              color="error"
              size="small"
            />
          )}
        </Box>
      </CardContent>

      {showActions && (
        <CardActions>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => handleAction(onView || (() => {}))}
          >
            عرض
          </Button>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => handleAction(onEdit || (() => {}))}
          >
            تعديل
          </Button>
          {onUpdateStatus && (
            <Button
              size="small"
              color="primary"
              onClick={() => handleAction(onUpdateStatus)}
            >
              تحديث الحالة
            </Button>
          )}
        </CardActions>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {onView && (
          <MenuItem onClick={() => handleAction(onView)}>
            <Visibility sx={{ mr: 1 }} fontSize="small" />
            عرض التفاصيل
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => handleAction(onEdit)}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            تعديل
          </MenuItem>
        )}
        {onUpdateStatus && (
          <MenuItem onClick={() => handleAction(onUpdateStatus)}>
            <Chip
              label="تحديث الحالة"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem 
            onClick={() => handleAction(onDelete)}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            حذف
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default OrderCard;
