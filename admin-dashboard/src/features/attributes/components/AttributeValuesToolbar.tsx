import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataToolbar } from '@/shared/design-system';
import type { DataToolbarFilter } from '@/shared/design-system';

interface AttributeValuesToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export const AttributeValuesToolbar: React.FC<AttributeValuesToolbarProps> = ({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  const { t } = useTranslation('attributes');

  const activeFilters: DataToolbarFilter[] = [];
  if (statusFilter) activeFilters.push({ label: t('fields.status'), value: statusFilter === 'true' ? t('status.active') : t('status.inactive'), onDelete: () => onStatusChange('') });

  const filterContent = (
    <FormControl size="small" sx={{ minWidth: 140 }} fullWidth={false}>
      <InputLabel>{t('filters.status')}</InputLabel>
      <Select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        label={t('filters.status')}
      >
        <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
        <MenuItem value="true">{t('status.active')}</MenuItem>
        <MenuItem value="false">{t('status.inactive')}</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <DataToolbar
      searchValue={searchValue}
      searchPlaceholder={t('placeholders.search')}
      onSearchChange={onSearchChange}
      filters={filterContent}
      activeFilters={activeFilters}
      compact
    />
  );
};