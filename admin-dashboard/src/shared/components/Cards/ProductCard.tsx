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
  Rating,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Inventory,
  AttachMoney,
  Category,
  Store,
} from '@mui/icons-material';
import { Product, ProductStatus } from '@/features/products/types/product.types';
import { STATUS_COLORS } from '@/config/constants';

interface ProductCardProps {
  product: Product;
  // eslint-disable-next-line no-unused-vars
  onEdit?: (product: Product) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete?: (product: Product) => void;
  // eslint-disable-next-line no-unused-vars
  onView?: (product: Product) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleStatus?: (product: Product) => void;
  showActions?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
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

  // eslint-disable-next-line no-unused-vars
  const handleAction = (action: (product: Product) => void) => {
    action(product);
    handleMenuClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: ProductStatus | string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        {/* Header with Image and Status */}
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar
            src={product.images?.[0] || product.mainImage}
            variant="rounded"
            sx={{ width: 80, height: 80, mr: 2 }}
          >
            <Inventory />
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" noWrap>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {product.sku || 'بدون كود'}
            </Typography>
            
            {product.averageRating && product.averageRating > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Rating 
                  value={product.averageRating} 
                  size="small" 
                  readOnly 
                />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  ({product.reviewsCount || 0})
                </Typography>
              </Box>
            )}
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

        {/* Product Info */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              السعر: {product.variants && product.variants.length > 0 
                ? formatPrice(product.variants[0].price)
                : 'غير محدد'
              }
            </Typography>
            {product.variants && product.variants.length > 0 && product.variants[0].compareAtPrice && (
              <Typography 
                variant="body2" 
                color="text.disabled" 
                sx={{ textDecoration: 'line-through', ml: 1 }}
              >
                {formatPrice(product.variants[0].compareAtPrice)}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Inventory sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              المخزون: {product.variants && product.variants.length > 0 
                ? product.variants.reduce((total, variant) => total + variant.stock, 0)
                : 0
              } وحدة
            </Typography>
          </Box>

          {product.category && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Category sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {product.category.name}
              </Typography>
            </Box>
          )}

          {product.brand && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Store sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {product.brand.name}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Tags and Categories */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={product.status || 'غير محدد'}
            color={getStatusColor(product.status || ProductStatus.DRAFT) as any}
            size="small"
            variant="outlined"
          />
          
          {product.attributes && product.attributes.length > 0 && (
            product.attributes.slice(0, 2).map((attribute: string) => (
              <Chip
                key={attribute}
                label={attribute}
                size="small"
                variant="outlined"
              />
            ))
          )}
          
          {product.attributes && product.attributes.length > 2 && (
            <Chip
              label={`+${product.attributes.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            تم الإنشاء: {formatDate(product.createdAt)}
          </Typography>
          
          {product.isFeatured && (
            <Chip
              label="مميز"
              color="warning"
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
          {onToggleStatus && (
            <Button
              size="small"
              color={product.isActive ? 'warning' : 'success'}
              onClick={() => handleAction(onToggleStatus)}
            >
              {product.isActive ? 'إيقاف' : 'تفعيل'}
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
        {onToggleStatus && (
          <MenuItem onClick={() => handleAction(onToggleStatus)}>
            <Chip
              label={product.isActive ? 'إيقاف' : 'تفعيل'}
              color={product.isActive ? 'warning' : 'success'}
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

export default ProductCard;
