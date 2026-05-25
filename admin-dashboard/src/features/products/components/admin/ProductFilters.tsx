import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from '@mui/material';
import { Clear as ClearIcon, LocalOffer, Star, NewReleases } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DataToolbar, type DataToolbarFilter } from '@/shared/design-system';
import { ProductStatus } from '../../types/product.types';

export interface ProductListFilters {
  search: string;
  status?: ProductStatus;
  categoryId?: string;
  brandId?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  hasOffer?: boolean;
  stockState?: 'low' | 'out';
}

interface ProductFiltersProps {
  filters: ProductListFilters;
  categories: Array<{ _id: string; name: string }>;
  brands: Array<{ _id: string; name: string }>;
  onFiltersChange: (filters: ProductListFilters) => void;
  onClearFilters: () => void;
  actions?: React.ReactNode;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  brands,
  onFiltersChange,
  onClearFilters,
  actions,
}) => {
  const { t } = useTranslation(['products', 'common']);

  const update = <K extends keyof ProductListFilters>(key: K, value: ProductListFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status ||
    filters.categoryId ||
    filters.brandId ||
    filters.isFeatured !== undefined ||
    filters.isNew !== undefined ||
    filters.hasOffer !== undefined ||
    filters.stockState,
  );

  const activeFilters: DataToolbarFilter[] = [];

  if (filters.search) {
    activeFilters.push({
      label: t('products:filter.search', 'بحث'),
      value: filters.search.length > 24 ? `${filters.search.slice(0, 24)}...` : filters.search,
      onDelete: () => update('search', ''),
    });
  }

  if (filters.status) {
    activeFilters.push({
      label: t('products:filter.status', 'الحالة'),
      value: t(`products:status.${filters.status}`, filters.status),
      onDelete: () => update('status', undefined),
    });
  }

  if (filters.categoryId) {
    const categoryName = categories.find((c) => c._id === filters.categoryId)?.name || filters.categoryId;
    activeFilters.push({
      label: t('products:filter.category', 'الفئة'),
      value: categoryName,
      onDelete: () => update('categoryId', undefined),
    });
  }

  if (filters.brandId) {
    const brandName = brands.find((b) => b._id === filters.brandId)?.name || filters.brandId;
    activeFilters.push({
      label: t('products:filter.brand', 'العلامة التجارية'),
      value: brandName,
      onDelete: () => update('brandId', undefined),
    });
  }

  if (filters.isFeatured !== undefined) {
    activeFilters.push({
      label: t('products:badges.featured', 'مميز'),
      value: filters.isFeatured ? t('common:yes', 'نعم') : t('common:no', 'لا'),
      onDelete: () => update('isFeatured', undefined),
    });
  }

  if (filters.isNew !== undefined) {
    activeFilters.push({
      label: t('products:badges.new', 'جديد'),
      value: filters.isNew ? t('common:yes', 'نعم') : t('common:no', 'لا'),
      onDelete: () => update('isNew', undefined),
    });
  }

  if (filters.hasOffer !== undefined) {
    activeFilters.push({
      label: t('products:filters.hasOffer', 'العروض'),
      value: filters.hasOffer ? t('products:filters.withOffer', 'عليها عرض') : t('products:filters.withoutOffer', 'بدون عرض'),
      onDelete: () => update('hasOffer', undefined),
    });
  }

  if (filters.stockState) {
    activeFilters.push({
      label: t('products:filter.stockState', 'المخزون'),
      value: filters.stockState === 'low'
        ? t('products:stats.lowStock', 'مخزون منخفض')
        : t('products:stats.outOfStock', 'نفد المخزون'),
      onDelete: () => update('stockState', undefined),
    });
  }

  const filterControls = (
    <>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>{t('products:filter.status', 'الحالة')}</InputLabel>
        <Select
          value={filters.status || ''}
          label={t('products:filter.status', 'الحالة')}
          onChange={(e) => update('status', (e.target.value || undefined) as ProductStatus | undefined)}
        >
          <MenuItem value="">{t('products:filter.allStatuses', 'جميع الحالات')}</MenuItem>
          <MenuItem value={ProductStatus.ACTIVE}>{t('products:status.active', 'نشط')}</MenuItem>
          <MenuItem value={ProductStatus.DRAFT}>{t('products:status.draft', 'مسودة')}</MenuItem>
          <MenuItem value={ProductStatus.ARCHIVED}>{t('products:status.archived', 'مؤرشف')}</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>{t('products:filter.category', 'الفئة')}</InputLabel>
        <Select
          value={filters.categoryId || ''}
          label={t('products:filter.category', 'الفئة')}
          onChange={(e) => update('categoryId', e.target.value || undefined)}
        >
          <MenuItem value="">{t('products:filter.allCategories', 'جميع الفئات')}</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>{t('products:filter.brand', 'العلامة التجارية')}</InputLabel>
        <Select
          value={filters.brandId || ''}
          label={t('products:filter.brand', 'العلامة التجارية')}
          onChange={(e) => update('brandId', e.target.value || undefined)}
        >
          <MenuItem value="">{t('products:filter.allBrands', 'جميع العلامات')}</MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton
          value="featured"
          selected={filters.isFeatured === true}
          onClick={() => update('isFeatured', filters.isFeatured === true ? undefined : true)}
        >
          <Star fontSize="small" />
          {t('products:badges.featured', 'مميز')}
        </ToggleButton>
        <ToggleButton
          value="new"
          selected={filters.isNew === true}
          onClick={() => update('isNew', filters.isNew === true ? undefined : true)}
        >
          <NewReleases fontSize="small" />
          {t('products:badges.new', 'جديد')}
        </ToggleButton>
        <ToggleButton
          value="offer"
          selected={filters.hasOffer === true}
          onClick={() => update('hasOffer', filters.hasOffer === true ? undefined : true)}
        >
          <LocalOffer fontSize="small" />
          {t('products:badges.hasOffer', 'عروض')}
        </ToggleButton>
      </ToggleButtonGroup>

      <FormControl size="small" sx={{ minWidth: 145 }}>
        <InputLabel>{t('products:filter.stockState', 'المخزون')}</InputLabel>
        <Select
          value={filters.stockState || ''}
          label={t('products:filter.stockState', 'المخزون')}
          onChange={(e) => update('stockState', (e.target.value || undefined) as 'low' | 'out' | undefined)}
        >
          <MenuItem value="">{t('products:filter.allStock', 'كل المخزون')}</MenuItem>
          <MenuItem value="low">{t('products:stats.lowStock', 'مخزون منخفض')}</MenuItem>
          <MenuItem value="out">{t('products:stats.outOfStock', 'نفد المخزون')}</MenuItem>
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Button variant="text" size="small" onClick={onClearFilters} startIcon={<ClearIcon />}>
          {t('products:filter.clearFilters', 'مسح الفلاتر')}
        </Button>
      )}
    </>
  );

  return (
    <DataToolbar
      searchValue={filters.search}
      searchPlaceholder={t('products:filter.searchPlaceholder', 'ابحث باسم المنتج أو SKU...')}
      onSearchChange={(value) => update('search', value)}
      filters={filterControls}
      activeFilters={activeFilters}
      actions={actions}
      layout="twoRow"
    />
  );
};