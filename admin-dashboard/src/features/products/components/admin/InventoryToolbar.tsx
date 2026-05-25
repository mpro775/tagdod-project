import { useCallback } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DataToolbar, type DataToolbarFilter } from '@/shared/design-system';
import { useQueryClient } from '@tanstack/react-query';

export type StockStatus = 'all' | 'available' | 'low' | 'out';
export type ItemType = 'all' | 'direct' | 'variant';
export type InventorySortField = 'name' | 'sku' | 'stock' | 'price' | 'updatedAt';

export interface InventoryFilters {
  search: string;
  stockStatus: StockStatus;
  itemType: ItemType;
  sortField: InventorySortField;
  sortOrder: 'asc' | 'desc';
}

interface InventoryToolbarProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  loading?: boolean;
}

export const InventoryToolbar: React.FC<InventoryToolbarProps> = ({
  filters,
  onFiltersChange,
  loading = false,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const queryClient = useQueryClient();

  const update = <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['products', 'inventory'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);

  const stockStatusLabels: Record<StockStatus, string> = {
    all: t('products:inventory.filter.allStock', 'كل المخزون'),
    available: t('products:inventory.filter.available', 'متوفر'),
    low: t('products:inventory.filter.lowStock', 'مخزون منخفض'),
    out: t('products:inventory.filter.outOfStock', 'نفذ'),
  };

  const itemTypeLabels: Record<ItemType, string> = {
    all: t('products:inventory.filter.allTypes', 'جميع الأنواع'),
    direct: t('products:inventory.filter.directProduct', 'منتج مباشر'),
    variant: t('products:inventory.filter.variant', 'متغير'),
  };

  const sortLabels: Record<InventorySortField, string> = {
    name: t('products:inventory.sort.name', 'الاسم'),
    sku: t('products:inventory.sort.sku', 'SKU'),
    stock: t('products:inventory.sort.stock', 'المخزون'),
    price: t('products:inventory.sort.price', 'السعر'),
    updatedAt: t('products:inventory.sort.updatedAt', 'تاريخ التحديث'),
  };

  const activeFilters: DataToolbarFilter[] = [];

  if (filters.search) {
    activeFilters.push({
      label: t('products:filter.search', 'بحث'),
      value: filters.search.length > 24 ? `${filters.search.slice(0, 24)}...` : filters.search,
      onDelete: () => update('search', ''),
    });
  }

  if (filters.stockStatus !== 'all') {
    activeFilters.push({
      label: t('products:inventory.filter.stockStatus', 'حالة المخزون'),
      value: stockStatusLabels[filters.stockStatus],
      onDelete: () => update('stockStatus', 'all'),
    });
  }

  if (filters.itemType !== 'all') {
    activeFilters.push({
      label: t('products:inventory.filter.itemType', 'نوع العنصر'),
      value: itemTypeLabels[filters.itemType],
      onDelete: () => update('itemType', 'all'),
    });
  }

  if (filters.sortField !== 'name' || filters.sortOrder !== 'asc') {
    const sortLabel = `${sortLabels[filters.sortField]} (${filters.sortOrder === 'asc'
      ? t('common:sort.ascending', 'تصاعدي')
      : t('common:sort.descending', 'تنازلي')})`;
    activeFilters.push({
      label: t('products:inventory.filter.sort', 'ترتيب'),
      value: sortLabel,
      onDelete: () => update('sortField', 'name'),
    });
  }

  const filterControls = (
    <>
      <FormControl size="small" sx={{ minWidth: 145 }}>
        <InputLabel>{t('products:inventory.filter.stockStatus', 'حالة المخزون')}</InputLabel>
        <Select
          value={filters.stockStatus}
          label={t('products:inventory.filter.stockStatus', 'حالة المخزون')}
          onChange={(e) => update('stockStatus', e.target.value as StockStatus)}
          disabled={loading}
        >
          <MenuItem value="all">{stockStatusLabels.all}</MenuItem>
          <MenuItem value="available">{stockStatusLabels.available}</MenuItem>
          <MenuItem value="low">{stockStatusLabels.low}</MenuItem>
          <MenuItem value="out">{stockStatusLabels.out}</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>{t('products:inventory.filter.itemType', 'نوع العنصر')}</InputLabel>
        <Select
          value={filters.itemType}
          label={t('products:inventory.filter.itemType', 'نوع العنصر')}
          onChange={(e) => update('itemType', e.target.value as ItemType)}
          disabled={loading}
        >
          <MenuItem value="all">{itemTypeLabels.all}</MenuItem>
          <MenuItem value="direct">{itemTypeLabels.direct}</MenuItem>
          <MenuItem value="variant">{itemTypeLabels.variant}</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 145 }}>
        <InputLabel>{t('products:inventory.filter.sortBy', 'ترتيب حسب')}</InputLabel>
        <Select
          value={filters.sortField}
          label={t('products:inventory.filter.sortBy', 'ترتيب حسب')}
          onChange={(e) => update('sortField', e.target.value as InventorySortField)}
          disabled={loading}
        >
          <MenuItem value="name">{sortLabels.name}</MenuItem>
          <MenuItem value="sku">{sortLabels.sku}</MenuItem>
          <MenuItem value="stock">{sortLabels.stock}</MenuItem>
          <MenuItem value="price">{sortLabels.price}</MenuItem>
          <MenuItem value="updatedAt">{sortLabels.updatedAt}</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>{t('products:inventory.filter.sortOrder', 'ترتيب')}</InputLabel>
        <Select
          value={filters.sortOrder}
          label={t('products:inventory.filter.sortOrder', 'ترتيب')}
          onChange={(e) => update('sortOrder', e.target.value as 'asc' | 'desc')}
          disabled={loading}
        >
          <MenuItem value="asc">{t('common:sort.ascending', 'تصاعدي')}</MenuItem>
          <MenuItem value="desc">{t('common:sort.descending', 'تنازلي')}</MenuItem>
        </Select>
      </FormControl>
    </>
  );

  const actions = (
    <Tooltip title={t('common:actions.refresh', 'تحديث')}>
      <IconButton size="small" onClick={handleRefresh} disabled={loading}>
        <Refresh />
      </IconButton>
    </Tooltip>
  );

  return (
    <DataToolbar
      searchValue={filters.search}
      searchPlaceholder={t('products:inventory.filter.searchPlaceholder', 'ابحث بالاسم أو SKU...')}
      onSearchChange={(value: string) => update('search', value)}
      filters={filterControls}
      activeFilters={activeFilters}
      actions={actions}
      compact
    />
  );
};