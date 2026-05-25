import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { DataToolbar } from '@/shared/design-system';
import type { DataToolbarFilter } from '@/shared/design-system';
import { useCategories } from '../hooks/useCategories';
import type { ListCategoriesParams } from '../types/category.types';

interface CategoryFiltersProps {
  onFiltersChange: (filters: ListCategoriesParams) => void;
  initialFilters?: ListCategoriesParams;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
}) => {
  const { t } = useTranslation('categories');
  const [filters, setFilters] = useState<ListCategoriesParams>({
    search: '',
    parentId: null,
    isActive: undefined,
    isFeatured: undefined,
    includeDeleted: false,
    ...initialFilters,
  });
  const [showAdvanced] = useState(false);

  const { data: categories = [] } = useCategories({});

  const handleFilterChange = (key: keyof ListCategoriesParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const activeFilters: DataToolbarFilter[] = [];
  if (filters.search) activeFilters.push({ label: t('filters.search'), value: filters.search, onDelete: () => handleFilterChange('search', '') });
  if (filters.parentId) activeFilters.push({ label: t('filters.parentCategory'), value: filters.parentId, onDelete: () => handleFilterChange('parentId', null) });
  if (filters.isActive !== undefined) activeFilters.push({ label: t('filters.status'), value: filters.isActive ? t('status.active') : t('status.inactive'), onDelete: () => handleFilterChange('isActive', undefined) });
  if (filters.isFeatured !== undefined) activeFilters.push({ label: t('filters.featured'), value: filters.isFeatured ? t('common.yes', { ns: 'common' }) : t('common.no', { ns: 'common' }), onDelete: () => handleFilterChange('isFeatured', undefined) });
  if (filters.includeDeleted) activeFilters.push({ label: t('filters.includeDeleted'), value: t('common.yes', { ns: 'common' }), onDelete: () => handleFilterChange('includeDeleted', false) });

  const filterContent = (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 160 }} fullWidth={false}>
          <InputLabel>{t('filters.parentCategory')}</InputLabel>
          <Select
            value={filters.parentId || ''}
            onChange={(e) => handleFilterChange('parentId', e.target.value || null)}
            label={t('filters.parentCategory')}
          >
            <MenuItem value="">{t('types.all')}</MenuItem>
            <MenuItem value="null">{t('types.mainOnly')}</MenuItem>
            {Array.isArray(categories) && categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>{category.name} ({category.nameEn})</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }} fullWidth={false}>
          <InputLabel>{t('filters.status')}</InputLabel>
          <Select
            value={filters.isActive === undefined ? '' : String(filters.isActive)}
            onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
            label={t('filters.status')}
          >
            <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
            <MenuItem value="true">{t('status.active')}</MenuItem>
            <MenuItem value="false">{t('status.inactive')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {showAdvanced && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 140 }} fullWidth={false}>
            <InputLabel>{t('filters.featured')}</InputLabel>
            <Select
              value={filters.isFeatured === undefined ? '' : String(filters.isFeatured)}
              onChange={(e) => handleFilterChange('isFeatured', e.target.value === '' ? undefined : e.target.value === 'true')}
              label={t('filters.featured')}
            >
              <MenuItem value="">{t('filters.allCategories')}</MenuItem>
              <MenuItem value="true">{t('filters.featuredYes')}</MenuItem>
              <MenuItem value="false">{t('filters.featuredNo')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }} fullWidth={false}>
            <InputLabel>{t('filters.includeDeleted')}</InputLabel>
            <Select
              value={filters.includeDeleted ? 'true' : 'false'}
              onChange={(e) => handleFilterChange('includeDeleted', e.target.value === 'true')}
              label={t('filters.includeDeleted')}
            >
              <MenuItem value="false">{t('filters.activeOnly')}</MenuItem>
              <MenuItem value="true">{t('filters.includeDeletedOption')}</MenuItem>
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
