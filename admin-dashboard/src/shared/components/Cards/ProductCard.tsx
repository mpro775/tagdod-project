import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
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

  // Get image source
  const primaryImage =
    (typeof product.mainImageId === 'object' ? product.mainImageId : undefined) ??
    product.mainImage;

  const fallbackImages: Array<string | { url?: string }> = [];
  if (product.mainImage && typeof product.mainImage === 'string') {
    fallbackImages.push(product.mainImage);
  }
  if (Array.isArray(product.imageIds) && product.imageIds.length > 0) {
    const withUrl = product.imageIds.find(
      (img) => typeof img === 'object' && img !== null && typeof (img as { url?: unknown }).url === 'string'
    );
    if (withUrl) {
      fallbackImages.push(withUrl as { url: string });
    }
  }

  return (
    <Card 
      sx={{ 
        mb: 2, 
        position: 'relative', 
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
        },
      }} 
      onClick={() => onView?.(product)}
    >
      {/* Product Image - Large at top */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%', // 4:3 aspect ratio
          backgroundColor: 'grey.100',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 1,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(() => {
              const imageUrl = 
                (typeof primaryImage === 'object' && primaryImage !== null && 'url' in primaryImage 
                  ? primaryImage.url 
                  : typeof primaryImage === 'string' 
                    ? primaryImage 
                    : null) ||
                (fallbackImages.find((img) => 
                  typeof img === 'string' || (typeof img === 'object' && img !== null && 'url' in img)
                ) as string | { url: string } | undefined);
              
              const resolvedUrl = 
                typeof imageUrl === 'string' 
                  ? imageUrl 
                  : typeof imageUrl === 'object' && imageUrl !== null && 'url' in imageUrl
                    ? imageUrl.url
                    : null;

              if (resolvedUrl) {
                return (
                  <Box
                    component="img"
                    src={resolvedUrl}
                    alt={product.name}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                );
              }
              
              return (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.200',
                    borderRadius: 1,
                  }}
                >
                  <Inventory sx={{ fontSize: 64, color: 'grey.400' }} />
                </Box>
              );
            })()}
          </Box>
        </Box>
        
        {/* Badges overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            flexDirection: 'column',
          }}
        >
          {product.isFeatured && (
            <Tooltip title={t('badges.featured')}>
              <Box
                sx={{
                  bgcolor: 'warning.main',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <Star sx={{ fontSize: 18, color: 'white' }} />
              </Box>
            </Tooltip>
          )}
          {product.isNew && (
            <Tooltip title={t('badges.new')}>
              <Box
                sx={{
                  bgcolor: 'info.main',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <NewReleases sx={{ fontSize: 18, color: 'white' }} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Product Name */}
        <Box sx={{ mb: 1.5 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              mb: 0.5,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </Typography>
          {product.nameEn && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.nameEn}
            </Typography>
          )}
          {product.sku && (
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              SKU: {product.sku}
            </Typography>
          )}
        </Box>

        {/* Product Info - Grid Layout */}
        <Box 
          sx={{ 
            mb: 2, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
            flex: 1,
          }}
        >
          {(typeof product.categoryId === 'object' && product.categoryId?.name) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Category sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                  {t('list.columns.category')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                {product.categoryId.name}
              </Typography>
            </Box>
          )}

          {(typeof product.brandId === 'object' && product.brandId?.name) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Store sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                  {t('list.columns.brand')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                {product.brandId.name}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Inventory sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                {t('list.columns.variants')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
              {product.variantsCount || 0}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoney sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                {t('list.columns.sales')}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
              {product.salesCount || 0}
            </Typography>
          </Box>
        </Box>

        {/* Footer with Status and Date */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 1,
            mt: 'auto',
            pt: 1.5,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
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
