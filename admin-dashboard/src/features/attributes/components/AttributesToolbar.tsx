import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { DataToolbar } from '@/shared/design-system';
import type { DataToolbarFilter } from '@/shared/design-system';
import type { ListAttributesParams } from '../types/attribute.types';

interface AttributesToolbarProps {
  filters: ListAttributesParams;
  onFiltersChange: (filters: ListAttributesParams) => void;
}

export const AttributesToolbar: React.FC<AttributesToolbarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation('attributes');
  const [showAdvanced] = useState(false);

  const handleFilterChange = (key: keyof ListAttributesParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilters: DataToolbarFilter[] = [];
  if (filters.search) activeFilters.push({ label: t('filters.search'), value: filters.search, onDelete: () => handleFilterChange('search', '') });
  if (filters.type) activeFilters.push({ label: t('fields.type'), value: String(filters.type), onDelete: () => handleFilterChange('type', undefined) });
  if (filters.isActive !== undefined) activeFilters.push({ label: t('filters.status'), value: filters.isActive ? t('status.active') : t('status.inactive'), onDelete: () => handleFilterChange('isActive', undefined) });
  if (filters.isFilterable !== undefined) activeFilters.push({ label: t('fields.filterable'), value: filters.isFilterable ? t('filters.yes') : t('filters.no'), onDelete: () => handleFilterChange('isFilterable', undefined) });
  if (filters.includeDeleted) activeFilters.push({ label: t('filters.includeDeleted'), value: t('common.yes', { ns: 'common' }), onDelete: () => handleFilterChange('includeDeleted', false) });

  const filterContent = (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 140 }} fullWidth={false}>
          <InputLabel>{t('filters.attributeType')}</InputLabel>
          <Select
            value={filters.type ?? ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            label={t('filters.attributeType')}
          >
            <MenuItem value="">{t('filters.allTypes')}</MenuItem>
            <MenuItem value="text">{t('typeLabels.text')}</MenuItem>
            <MenuItem value="color">{t('typeLabels.color')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }} fullWidth={false}>
          <InputLabel>{t('filters.status')}</InputLabel>
          <Select
            value={filters.isActive !== undefined ? String(filters.isActive) : ''}
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
            <InputLabel>{t('filters.filterable')}</InputLabel>
            <Select
              value={filters.isFilterable !== undefined ? String(filters.isFilterable) : ''}
              onChange={(e) => handleFilterChange('isFilterable', e.target.value === '' ? undefined : e.target.value === 'true')}
              label={t('filters.filterable')}
            >
              <MenuItem value="">{t('filters.allFilterable')}</MenuItem>
              <MenuItem value="true">{t('filters.yes')}</MenuItem>
              <MenuItem value="false">{t('filters.no')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }} fullWidth={false}>
            <InputLabel>{t('filters.includeDeleted')}</InputLabel>
            <Select
              value={filters.includeDeleted ? 'true' : 'false'}
              onChange={(e) => handleFilterChange('includeDeleted', e.target.value === 'true')}
              label={t('filters.includeDeleted')}
            >
              <MenuItem value="false">{t('filters.hideDeleted')}</MenuItem>
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