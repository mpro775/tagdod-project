import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  LocalOffer as OfferIcon,
  Inventory2 as VariantsIcon,
  Category as CategoryIcon,
  Store as BrandIcon,
  ImageNotSupported,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StatusChip, designRadius, designColors } from '@/shared/design-system';
import type { Product } from '../../types/product.types';
import { ProductStatus } from '../../types/product.types';

interface ProductAdminCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestore?: (product: Product) => void;
  onVariants: (product: Product) => void;
}

function getImageUrl(product: Product): string | undefined {
  if (typeof product.mainImageId === 'object' && product.mainImageId?.url) {
    return product.mainImageId.url;
  }
  if (product.mainImage) {
    return product.mainImage;
  }
  return undefined;
}

function getCategoryName(product: Product): string | undefined {
  if (typeof product.categoryId === 'object' && product.categoryId?.name) {
    return product.categoryId.name;
  }
  return product.category?.name || undefined;
}

function getBrandName(product: Product): string | undefined {
  if (typeof product.brandId === 'object' && product.brandId?.name) {
    return product.brandId.name;
  }
  return product.brand?.name || undefined;
}

function getProductStatusLabel(status: ProductStatus): string {
  switch (status) {
    case ProductStatus.ACTIVE:
      return 'active';
    case ProductStatus.DRAFT:
      return 'draft';
    case ProductStatus.ARCHIVED:
      return 'archived';
    default:
      return 'neutral';
  }
}

function getProductStatusDisplay(status: ProductStatus, t: (key: string, fallback: string) => string): string {
  switch (status) {
    case ProductStatus.ACTIVE:
      return t('products:status.active', 'نشط');
    case ProductStatus.DRAFT:
      return t('products:status.draft', 'مسودة');
    case ProductStatus.ARCHIVED:
      return t('products:status.archived', 'مؤرشف');
    default:
      return status;
  }
}

export const ProductAdminCard: React.FC<ProductAdminCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onVariants,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const imageUrl = getImageUrl(product);
  const categoryName = getCategoryName(product);
  const brandName = getBrandName(product);
  const hasOffer = product.hasOffer || (product.appliedPriceRules && product.appliedPriceRules.length > 0);
  const isDeleted = Boolean(product.deletedAt);

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isDeleted ? 'error.light' : 'divider',
        borderRadius: `${designRadius.lg}px`,
        overflow: 'hidden',
        opacity: isDeleted ? 0.7 : 1,
        position: 'relative',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          borderColor: isDeleted ? 'error.main' : 'primary.main',
          boxShadow: isDeleted ? undefined : `0 2px 12px ${designColors.brand.primary}18`,
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ position: 'relative', bgcolor: 'grey.50', height: 120, overflow: 'hidden' }}>
        {imageUrl ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.nameEn || product.name}
            sx={{
              height: 120,
              width: '100%',
              objectFit: 'contain',
              p: 1,
            }}
          />
        ) : (
          <Box
            sx={{
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
            }}
          >
            <ImageNotSupported sx={{ fontSize: 40 }} />
          </Box>
        )}

        {hasOffer && (
          <Chip
            icon={<OfferIcon sx={{ fontSize: '14px !important' }} />}
            label={t('products:badges.hasOffer', 'عرض')}
            size="small"
            sx={{
              position: 'absolute',
              top: 6,
              left: 6,
              bgcolor: designColors.status.error,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24,
              '& .MuiChip-icon': { color: '#fff' },
            }}
          />
        )}

        {product.isFeatured && (
          <Chip
            label={t('products:badges.featured', 'مميز')}
            size="small"
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              bgcolor: designColors.status.warning,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ px: 1.5, pt: 1, pb: '8px !important', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            lineHeight: 1.3,
            height: '2.6em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 0.5,
          }}
        >
          {product.name}
        </Typography>

        {product.sku && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontFamily: 'monospace',
              letterSpacing: 0.5,
            }}
          >
            SKU: {product.sku}
          </Typography>
        )}

        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75, gap: 0.5 }}>
          <StatusChip
            label={getProductStatusDisplay(product.status, t)}
            status={getProductStatusLabel(product.status) as any}
            size="small"
          />
          {categoryName && (
            <Chip
              icon={<CategoryIcon sx={{ fontSize: '13px !important' }} />}
              label={categoryName}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22, '& .MuiChip-icon': { fontSize: '13px' } }}
            />
          )}
          {brandName && (
            <Chip
              icon={<BrandIcon sx={{ fontSize: '13px !important' }} />}
              label={brandName}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22, '& .MuiChip-icon': { fontSize: '13px' } }}
            />
          )}
        </Stack>

        {product.basePriceUSD != null && (
          <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
            ${product.basePriceUSD.toFixed(2)}
          </Typography>
        )}
      </CardContent>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 0.25,
          px: 0.5,
          pb: 0.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 0.5,
        }}
      >
        <Tooltip title={t('common:view', 'عرض')}>
          <IconButton size="small" onClick={() => onView(product)} color="primary">
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common:edit', 'تعديل')}>
          <IconButton size="small" onClick={() => onEdit(product)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('products:variants', 'المتغيرات')}>
          <IconButton size="small" onClick={() => onVariants(product)} color="default">
            <VariantsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {isDeleted ? (
          onRestore && (
            <Tooltip title={t('common:restore', 'استعادة')}>
              <IconButton size="small" onClick={() => onRestore(product)} color="success">
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        ) : (
          <Tooltip title={t('common:delete', 'حذف')}>
            <IconButton size="small" onClick={() => onDelete(product)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Card>
  );
};

export default ProductAdminCard;