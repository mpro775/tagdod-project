import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { DataToolbar } from '@/shared/design-system';
import type { DataToolbarFilter } from '@/shared/design-system';
import type { ListBrandsParams } from '../types/brand.types';

interface BrandsToolbarProps {
  filters: ListBrandsParams;
  onFiltersChange: (filters: ListBrandsParams) => void;
}

const createSortOptions = (t: (key: string, opts?: any) => string) => [
  { value: 'name', label: t('filters.sortByOptions.name') },
  { value: 'nameEn', label: t('filters.sortByOptions.nameEn') },
  { value: 'createdAt', label: t('filters.sortByOptions.createdAt') },
  { value: 'sortOrder', label: t('filters.sortByOptions.sortOrder') },
];

const createSortOrderOptions = (t: (key: string, opts?: any) => string) => [
  { value: 'asc', label: t('filters.sortOrderOptions.asc') },
  { value: 'desc', label: t('filters.sortOrderOptions.desc') },
];

export const BrandsToolbar: React.FC<BrandsToolbarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation('brands');
  const [showAdvanced] = useState(false);
  const sortOptions = createSortOptions(t);
  const sortOrderOptions = createSortOrderOptions(t);

  const handleFilterChange = (key: keyof ListBrandsParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilters: DataToolbarFilter[] = [];
  if (filters.search) activeFilters.push({ label: t('filters.searchAndFilter'), value: filters.search, onDelete: () => handleFilterChange('search', '') });
  if (filters.isActive !== undefined) activeFilters.push({ label: t('filters.status'), value: filters.isActive ? t('status.active') : t('status.inactive'), onDelete: () => handleFilterChange('isActive', undefined) });
  if (filters.sortBy && filters.sortBy !== 'name') activeFilters.push({ label: t('filters.sortBy'), value: sortOptions.find(o => o.value === filters.sortBy)?.label || String(filters.sortBy), onDelete: () => handleFilterChange('sortBy', 'name') });
  if (filters.sortOrder && filters.sortOrder !== 'asc') activeFilters.push({ label: t('filters.sortOrder'), value: sortOrderOptions.find(o => o.value === filters.sortOrder)?.label || String(filters.sortOrder), onDelete: () => handleFilterChange('sortOrder', 'asc') });

  const filterContent = (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 140 }} fullWidth={false}>
          <InputLabel>{t('filters.status')}</InputLabel>
          <Select
            value={filters.isActive ?? ''}
            label={t('filters.status')}
            onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
          >
            <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
            <MenuItem value="true">{t('status.active')}</MenuItem>
            <MenuItem value="false">{t('status.inactive')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {showAdvanced && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 160 }} fullWidth={false}>
            <InputLabel>{t('filters.sortBy')}</InputLabel>
            <Select value={filters.sortBy || 'name'} label={t('filters.sortBy')} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }} fullWidth={false}>
            <InputLabel>{t('filters.sortOrder')}</InputLabel>
            <Select value={filters.sortOrder || 'asc'} label={t('filters.sortOrder')} onChange={(e) => handleFilterChange('sortOrder', e.target.value)}>
              {sortOrderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}
    </Stack>
  );

  return (
    <DataToolbar
      searchValue={filters.search || ''}
      searchPlaceholder={t('placeholders.search')}
      onSearchChange={(value) => handleFilterChange('search', value)}
      filters={filterContent}
      activeFilters={activeFilters}
      compact
    />
  );
};