import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Box,
  Collapse,
  Chip,
  Stack,
} from '@mui/material';
import { Search, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { ListAttributesParams } from '../types/attribute.types';

interface AttributeFiltersProps {
  onFiltersChange: (filters: ListAttributesParams) => void;
  onClearFilters: () => void;
  initialFilters?: ListAttributesParams;
}

const AttributeFilters: React.FC<AttributeFiltersProps> = ({
  onFiltersChange,
  onClearFilters,
  initialFilters = {},
}) => {
  const { t } = useTranslation('attributes');
  const [filters, setFilters] = useState<ListAttributesParams>({
    search: initialFilters.search || '',
    type: initialFilters.type || undefined,
    isActive: initialFilters.isActive,
    isFilterable: initialFilters.isFilterable,
    groupId: initialFilters.groupId || '',
    includeDeleted: initialFilters.includeDeleted || false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const handleFilterChange = (key: keyof ListAttributesParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Check if any filters are active
    const active = Object.entries(newFilters).some(([k, v]) => {
      if (k === 'includeDeleted') return v === true;
      return v !== '' && v !== undefined && v !== null;
    });
    setHasActiveFilters(active);

    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      type: undefined,
      isActive: undefined,
      isFilterable: undefined,
      groupId: '',
      includeDeleted: false,
    };
    setFilters(clearedFilters);
    setHasActiveFilters(false);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type) count++;
    if (filters.isActive !== undefined) count++;
    if (filters.isFilterable !== undefined) count++;
    if (filters.groupId) count++;
    if (filters.includeDeleted) count++;
    return count;
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mb: 2, gap: { xs: 2, sm: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <FilterList color="primary" />
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{t('filters.searchAndFilter')}</Typography>
          {hasActiveFilters && (
            <Chip label={t('filters.filterCount', { count: getActiveFiltersCount() })} color="primary" size="small" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            startIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outlined"
            size="small"
          >
            {showAdvanced ? t('filters.hideAdvanced') : t('filters.showAdvanced')}
          </Button>
          {hasActiveFilters && (
            <Button
              startIcon={<Clear />}
              onClick={handleClearFilters}
              variant="outlined"
              color="error"
              size="small"
            >
              {t('filters.clearFilters')}
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* البحث الأساسي */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder={t('placeholders.search')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            helperText={t('filters.searchHelper')}
          />
        </Grid>

        {/* الفلاتر الأساسية */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>{t('filters.attributeType')}</InputLabel>
            <Select
              value={filters.type ?? ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              label={t('filters.attributeType')}
            >
              <MenuItem value="">{t('filters.allTypes')}</MenuItem>
              <MenuItem value="select">{t('typeLabels.select')}</MenuItem>
              <MenuItem value="multiselect">{t('typeLabels.multiselect')}</MenuItem>
              <MenuItem value="color">{t('typeLabels.color')}</MenuItem>
              <MenuItem value="text">{t('typeLabels.text')}</MenuItem>
              <MenuItem value="number">{t('typeLabels.number')}</MenuItem>
              <MenuItem value="boolean">{t('typeLabels.boolean')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>{t('filters.status')}</InputLabel>
            <Select
              value={filters.isActive === undefined ? '' : filters.isActive}
              onChange={(e) =>
                handleFilterChange(
                  'isActive',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
              label={t('filters.status')}
            >
              <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
              <MenuItem value="true">{t('status.active')}</MenuItem>
              <MenuItem value="false">{t('status.inactive')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* الفلاتر المتقدمة */}
        <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                {t('filters.advancedFilters')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('filters.filterable')}</InputLabel>
                    <Select
                      value={filters.isFilterable === undefined ? '' : filters.isFilterable}
                      onChange={(e) =>
                        handleFilterChange(
                          'isFilterable',
                          e.target.value === '' ? undefined : e.target.value === 'true'
                        )
                      }
                      label={t('filters.filterable')}
                    >
                      <MenuItem value="">{t('filters.allFilterable')}</MenuItem>
                      <MenuItem value="true">{t('filters.yes')}</MenuItem>
                      <MenuItem value="false">{t('filters.no')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label={t('filters.groupId')}
                    value={filters.groupId}
                    onChange={(e) => handleFilterChange('groupId', e.target.value)}
                    helperText={t('filters.groupIdHelper')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('filters.includeDeleted')}</InputLabel>
                    <Select
                      value={filters.includeDeleted ? 'true' : 'false'}
                      onChange={(e) =>
                        handleFilterChange('includeDeleted', e.target.value === 'true')
                      }
                      label={t('filters.includeDeleted')}
                    >
                      <MenuItem value="false">{t('filters.hideDeleted')}</MenuItem>
                      <MenuItem value="true">{t('filters.includeDeletedOption')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Collapse>
      </Grid>

      {/* عرض الفلاتر النشطة */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('filters.activeFilters')}:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {filters.search && (
              <Chip
                label={t('filters.searchFilter', { value: filters.search })}
                onDelete={() => handleFilterChange('search', '')}
                color="primary"
                size="small"
              />
            )}
            {filters.type && (
              <Chip
                label={t('filters.typeFilter', { value: filters.type })}
                onDelete={() => handleFilterChange('type', '')}
                color="secondary"
                size="small"
              />
            )}
            {filters.isActive !== undefined && (
              <Chip
                label={t('filters.statusFilter', { value: filters.isActive ? t('status.active') : t('status.inactive') })}
                onDelete={() => handleFilterChange('isActive', undefined)}
                color="success"
                size="small"
              />
            )}
            {filters.isFilterable !== undefined && (
              <Chip
                label={t('filters.filterableFilter', { value: filters.isFilterable ? t('filters.yes') : t('filters.no') })}
                onDelete={() => handleFilterChange('isFilterable', undefined)}
                color="info"
                size="small"
              />
            )}
            {filters.groupId && (
              <Chip
                label={t('filters.groupFilter', { value: filters.groupId })}
                onDelete={() => handleFilterChange('groupId', '')}
                color="warning"
                size="small"
              />
            )}
            {filters.includeDeleted && (
              <Chip
                label={t('filters.includeDeletedFilter')}
                onDelete={() => handleFilterChange('includeDeleted', false)}
                color="error"
                size="small"
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default AttributeFilters;
