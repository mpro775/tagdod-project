import { Box, Typography, Tooltip, Chip } from '@mui/material';
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
import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import { StatusChip, RowActionsMenu } from '@/shared/design-system';
import type { Product } from '../types/product.types';
import { ProductStatus } from '../types/product.types';
import { ProductImage } from './ProductImage';

type ImageWithUrl = { url: string; [key: string]: unknown };

const isImageWithUrl = (value: unknown): value is ImageWithUrl =>
  typeof value === 'object' && value !== null && typeof (value as { url?: unknown }).url === 'string';

interface UseProductsTableColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestore: (product: Product) => void;
  onView: (product: Product) => void;
  onVariants: (product: Product) => void;
  isMobile?: boolean;
}

export const useProductsTableColumns = ({
  onEdit,
  onDelete,
  onRestore,
  onView,
  onVariants,
  isMobile = false,
}: UseProductsTableColumnsProps): GridColDef[] => {
  const { t } = useTranslation('products');

  return [
    {
      field: 'name',
      headerName: t('list.columns.product', 'المنتج'),
      width: isMobile ? 180 : 280,
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const product = params.row as Product;
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <ProductImage image={primaryImage} fallbackImages={fallbackImages} size={isMobile ? 36 : 44} />
              {(product.isFeatured || (product.appliedPriceRules && product.appliedPriceRules.length > 0)) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -3,
                    [product.appliedPriceRules && product.appliedPriceRules.length > 0 ? 'left' : 'right']: -3,
                    bgcolor: product.appliedPriceRules && product.appliedPriceRules.length > 0 ? 'error.main' : 'warning.main',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  {product.appliedPriceRules && product.appliedPriceRules.length > 0 ? (
                    <LocalOffer sx={{ fontSize: 10, color: 'white' }} />
                  ) : (
                    <Star sx={{ fontSize: 10, color: 'white' }} />
                  )}
                </Box>
              )}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                {product.name}
              </Typography>
              {product.nameEn && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  {product.nameEn}
                </Typography>
              )}
              {product.sku && (
                <Typography variant="caption" color="text.disabled" noWrap sx={{ display: 'block', fontSize: { xs: '0.6rem', sm: '0.7rem' }, mt: 0.25 }}>
                  SKU: {product.sku}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'category',
      headerName: t('list.columns.category', 'الفئة'),
      width: 140,
      valueGetter: (_value, row) => (typeof row.categoryId === 'object' ? row.categoryId?.name : '-') || '-',
    },
    {
      field: 'brand',
      headerName: t('list.columns.brand', 'العلامة التجارية'),
      width: 130,
      valueGetter: (_value, row) => (typeof row.brandId === 'object' ? row.brandId?.name : '-') || '-',
    },
    {
      field: 'variantsCount',
      headerName: t('list.columns.variants', 'المتغيرات'),
      width: 100,
      align: 'center',
    },
    {
      field: 'status',
      headerName: t('list.columns.status', 'الحالة'),
      width: 120,
      renderCell: (params) => {
        const statusMap: Record<ProductStatus, { label: string; status: 'active' | 'draft' | 'archived' }> = {
          [ProductStatus.ACTIVE]: { label: t('status.active', 'نشط'), status: 'active' },
          [ProductStatus.DRAFT]: { label: t('status.draft', 'مسودة'), status: 'draft' },
          [ProductStatus.ARCHIVED]: { label: t('status.archived', 'مؤرشف'), status: 'archived' },
        };
        const s = statusMap[params.row.status as ProductStatus] || { label: params.row.status, status: 'draft' as const };
        return <StatusChip label={s.label} status={s.status} />;
      },
    },
    {
      field: 'badges',
      headerName: t('list.columns.badges', 'الشارات'),
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const product = params.row as Product;
        const hasPriceRules = product.appliedPriceRules && product.appliedPriceRules.length > 0;
        const discountPercent = hasPriceRules && product.appliedPriceRules?.[0]?.effects?.percentOff;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'nowrap' }}>
            {hasPriceRules && (
              <Tooltip title={discountPercent ? `${t('badges.hasOffer', 'عرض')} ${discountPercent}%` : t('badges.hasOffer', 'يحتوي على عرض')}>
                <Chip icon={<LocalOffer sx={{ fontSize: 14 }} />} label={discountPercent ? `${discountPercent}%` : ''} size="small" color="error" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 'bold', '& .MuiChip-icon': { fontSize: 14 } }} />
              </Tooltip>
            )}
            {product.isFeatured && <Tooltip title={t('badges.featured', 'مميز')}><Star sx={{ fontSize: { xs: 16, sm: 18 }, color: 'warning.main' }} /></Tooltip>}
            {product.isNew && <Tooltip title={t('badges.new', 'جديد')}><NewReleases sx={{ fontSize: { xs: 16, sm: 18 }, color: 'info.main' }} /></Tooltip>}
            {product.isBestseller && <Tooltip title={t('badges.bestseller', 'الأكثر مبيعاً')}><TrendingUp sx={{ fontSize: { xs: 16, sm: 18 }, color: 'success.main' }} /></Tooltip>}
          </Box>
        );
      },
    },
    {
      field: 'salesCount',
      headerName: t('list.columns.sales', 'المبيعات'),
      width: 90,
      align: 'center',
    },
    {
      field: 'createdAt',
      headerName: t('list.columns.createdAt', 'تاريخ الإنشاء'),
      width: 130,
      valueGetter: (_value, row) => row.createdAt || row.updatedAt || null,
      valueFormatter: (value) => {
        if (!value) return '-';
        return formatDate(value as Date | string);
      },
    },
    {
      field: 'actions',
      headerName: t('list.columns.actions', 'إجراءات'),
      width: 50,
      sortable: false,
      renderCell: (params) => {
        const product = params.row as Product;
        const isDeleted = !!product.deletedAt;
        if (isDeleted) {
          return (
            <RowActionsMenu actions={[
              { label: t('actions.restore', 'استعادة'), icon: <Restore fontSize="small" />, onClick: () => onRestore(product) },
            ]} />
          );
        }
        return (
          <RowActionsMenu actions={[
            { label: t('actions.view', 'عرض'), icon: <Visibility fontSize="small" />, onClick: () => onView(product) },
            { label: t('actions.edit', 'تعديل'), icon: <Edit fontSize="small" />, onClick: () => onEdit(product) },
            { label: t('actions.variants', 'المتغيرات'), icon: <Inventory fontSize="small" />, onClick: () => onVariants(product) },
            { label: t('actions.delete', 'حذف'), icon: <Delete fontSize="small" />, onClick: () => onDelete(product), danger: true },
          ]} />
        );
      },
    },
  ];
};