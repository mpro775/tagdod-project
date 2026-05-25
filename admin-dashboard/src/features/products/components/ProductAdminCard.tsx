import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  Visibility,
  Inventory,
  Star,
  NewReleases,
  LocalOffer,
  TrendingUp,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StatusChip } from '@/shared/design-system';
import { formatDate } from '@/shared/utils/formatters';
import type { Product } from '../types/product.types';
import { ProductStatus } from '../types/product.types';
import { ProductImage } from './ProductImage';

type ImageWithUrl = { url: string; [key: string]: unknown };

const isImageWithUrl = (value: unknown): value is ImageWithUrl =>
  typeof value === 'object' && value !== null && typeof (value as { url?: unknown }).url === 'string';

interface ProductAdminCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestore?: (product: Product) => void;
  onVariants: (product: Product) => void;
}

export const ProductAdminCard: React.FC<ProductAdminCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onVariants,
}) => {
  const { t } = useTranslation('products');
  const isDeleted = !!product.deletedAt;

  const primaryImage =
    (typeof product.mainImageId === 'object' ? product.mainImageId : undefined) ?? product.mainImage;

  const fallbackImages: Array<string | ImageWithUrl> = [];
  if (product.mainImage && typeof product.mainImage === 'string') {
    fallbackImages.push(product.mainImage);
  }
  if (Array.isArray(product.imageIds) && product.imageIds.length > 0) {
    const withUrl = product.imageIds.find(isImageWithUrl);
    if (withUrl) fallbackImages.push(withUrl);
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
      onClick={() => onView(product)}
    >
      <Box sx={{ position: 'relative', height: 120, bgcolor: 'grey.50', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ProductImage
          image={primaryImage}
          fallbackImages={fallbackImages}
          size={120}
        />

        <Box sx={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 0.5, flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
          {product.appliedPriceRules && product.appliedPriceRules.length > 0 && (
            <Chip
              icon={<LocalOffer sx={{ fontSize: 12 }} />}
              label={product.appliedPriceRules[0]?.effects?.percentOff ? `${product.appliedPriceRules[0].effects.percentOff}%` : ''}
              size="small"
              color="error"
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 'bold', '& .MuiChip-icon': { fontSize: 12 } }}
            />
          )}
          {product.isFeatured && (
            <Tooltip title={t('badges.featured')}>
              <Box sx={{ bgcolor: 'warning.main', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star sx={{ fontSize: 12, color: 'white' }} />
              </Box>
            </Tooltip>
          )}
          {product.isNew && (
            <Tooltip title={t('badges.new')}>
              <Box sx={{ bgcolor: 'info.main', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NewReleases sx={{ fontSize: 12, color: 'white' }} />
              </Box>
            </Tooltip>
          )}
          {product.isBestseller && (
            <Tooltip title={t('badges.bestseller')}>
              <Box sx={{ bgcolor: 'success.main', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp sx={{ fontSize: 12, color: 'white' }} />
              </Box>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ position: 'absolute', bottom: 6, left: 6 }}>
          <StatusChip
            label={t(`status.${product.status}`)}
            status={product.status === ProductStatus.ACTIVE ? 'active' : product.status === ProductStatus.ARCHIVED ? 'archived' : 'draft'}
            size="small"
          />
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ fontSize: '0.85rem', lineHeight: 1.3 }}>
          {product.name}
        </Typography>
        {product.nameEn && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.7rem' }}>
            {product.nameEn}
          </Typography>
        )}
        {product.sku && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
            SKU: {product.sku}
          </Typography>
        )}

        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
          {typeof product.categoryId === 'object' && product.categoryId?.name && (
            <Chip label={product.categoryId.name} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
          {typeof product.brandId === 'object' && product.brandId?.name && (
            <Chip label={product.brandId.name} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
          )}
        </Stack>

        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            {formatDate(product.createdAt || product.updatedAt)}
          </Typography>
        </Box>
      </CardContent>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25, px: 1, pb: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        {isDeleted ? (
          onRestore && (
            <Tooltip title={t('actions.restore')}>
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onRestore(product); }}>
                <Restore fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        ) : (
          <>
            <Tooltip title={t('actions.view')}>
              <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); onView(product); }}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('actions.variants')}>
              <IconButton size="small" color="secondary" onClick={(e) => { e.stopPropagation(); onVariants(product); }}>
                <Inventory fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('actions.edit')}>
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('actions.delete')}>
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(product); }}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Card>
  );
};