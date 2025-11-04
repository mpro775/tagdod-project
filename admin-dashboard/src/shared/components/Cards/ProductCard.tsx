import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Inventory,
  AttachMoney,
  Category,
  Store,
  Star,
  NewReleases,
  Restore,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Product, ProductStatus } from '@/features/products/types/product.types';
import { formatDate } from '@/shared/utils/formatters';

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
  const { t } = useTranslation('products');

  const getStatusColor = (status: ProductStatus | string) => {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      [ProductStatus.ACTIVE]: 'success',
      [ProductStatus.DRAFT]: 'default',
      [ProductStatus.ARCHIVED]: 'warning',
    };
    return statusMap[status] || 'default';
  };

  const isDeleted = !!product.deletedAt;

  return (
    <Card sx={{ mb: 2, position: 'relative', cursor: 'pointer' }} onClick={() => onView?.(product)}>
      <CardContent>
        {/* Header with Image and Badges */}
        <Box sx={{ display: 'flex', mb: 2, gap: 1.5 }}>
          <Avatar
            src={
              product.mainImage || 
              (typeof product.mainImageId === 'object' ? product.mainImageId?.url : null) ||
              product.images?.[0]
            }
            variant="rounded"
            sx={{ width: 80, height: 80 }}
          >
            <Inventory />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="h6" component="div" noWrap sx={{ flex: 1 }}>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {product.isFeatured && (
                  <Tooltip title={t('badges.featured')}>
                    <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                  </Tooltip>
                )}
                {product.isNew && (
                  <Tooltip title={t('badges.new')}>
                    <NewReleases sx={{ fontSize: 18, color: 'info.main' }} />
                  </Tooltip>
                )}
              </Box>
            </Box>
            {product.nameEn && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {product.nameEn}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" noWrap>
              {product.sku || `-`}
            </Typography>
          </Box>
        </Box>

        {/* Product Info */}
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(typeof product.categoryId === 'object' && product.categoryId?.name) && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Category sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {product.categoryId.name}
              </Typography>
            </Box>
          )}

          {(typeof product.brandId === 'object' && product.brandId?.name) && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Store sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {product.brandId.name}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Inventory sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {t('list.columns.variants')}: {product.variantsCount || 0}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {t('list.columns.sales')}: {product.salesCount || 0}
            </Typography>
          </Box>
        </Box>

        {/* Footer with Status and Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={t(`status.${product.status}`)}
            color={getStatusColor(product.status) as any}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {formatDate(product.createdAt)}
          </Typography>
        </Box>
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
          {isDeleted && onToggleStatus && (
            <Tooltip title={t('actions.restore')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(product);
                }}
              >
                <Restore fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!isDeleted && (
            <>
              <Tooltip title={t('actions.view')}>
                <IconButton
                  size="small"
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(product);
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('actions.edit')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(product);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('actions.delete')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(product);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default ProductCard;
