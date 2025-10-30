import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Typography,
  Divider,
} from '@mui/material';
import { Search, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
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

  const [expanded, setExpanded] = useState(false);

  // Get categories for parent selection
  const { data: categories = [] } = useCategories({});

  const handleFilterChange = (key: keyof ListCategoriesParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: ListCategoriesParams = {
      search: '',
      parentId: null,
      isActive: undefined,
      isFeatured: undefined,
      includeDeleted: false,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.parentId) count++;
    if (filters.isActive !== undefined) count++;
    if (filters.isFeatured !== undefined) count++;
    if (filters.includeDeleted) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6" fontWeight="bold">
            {t('filters.categoryFilters')}
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={t('filters.filterCount', { count: activeFiltersCount })}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            disabled={activeFiltersCount === 0}
          >
            {t('filters.clearFilters')}
          </Button>
          <IconButton onClick={() => setExpanded(!expanded)} color="primary">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {/* Search */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label={t('filters.search')}
              placeholder={t('placeholders.search')}
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />
          </Grid>

          {/* Parent Category */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.parentCategory')}</InputLabel>
              <Select
                value={filters.parentId || ''}
                onChange={(e) => handleFilterChange('parentId', e.target.value || null)}
                label={t('filters.parentCategory')}
              >
                <MenuItem value="">
                  <em>{t('types.all')}</em>
                </MenuItem>
                <MenuItem value="null">
                  <em>{t('types.mainOnly')}</em>
                </MenuItem>
                {Array.isArray(categories) && categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name} ({category.nameEn})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
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
                <MenuItem value="">
                  <em>{t('filters.allStatuses')}</em>
                </MenuItem>
                <MenuItem value="true">{t('status.active')}</MenuItem>
                <MenuItem value="false">{t('status.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Featured */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('filters.featured')}</InputLabel>
              <Select
                value={filters.isFeatured === undefined ? '' : filters.isFeatured}
                onChange={(e) =>
                  handleFilterChange(
                    'isFeatured',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                label={t('filters.featured')}
              >
                <MenuItem value="">
                  <em>{t('filters.allCategories')}</em>
                </MenuItem>
                <MenuItem value="true">{t('filters.featuredYes')}</MenuItem>
                <MenuItem value="false">{t('filters.featuredNo')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Include Deleted */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
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
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('filters.activeFilters')}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filters.search && (
                <Chip
                  label={t('filters.searchFilter', { value: filters.search })}
                  onDelete={() => handleFilterChange('search', '')}
                  size="small"
                  color="primary"
                />
              )}
              {filters.parentId && (
                <Chip
                  label={t('filters.parentFilter', { value: categories.find((c) => c._id === filters.parentId)?.name || 'غير محدد' })}
                  onDelete={() => handleFilterChange('parentId', null)}
                  size="small"
                  color="secondary"
                />
              )}
              {filters.isActive !== undefined && (
                <Chip
                  label={t('filters.statusFilter', { value: filters.isActive ? t('status.active') : t('status.inactive') })}
                  onDelete={() => handleFilterChange('isActive', undefined)}
                  size="small"
                  color="success"
                />
              )}
              {filters.isFeatured !== undefined && (
                <Chip
                  label={t('filters.featuredFilter', { value: filters.isFeatured ? t('common.yes') : t('common.no') })}
                  onDelete={() => handleFilterChange('isFeatured', undefined)}
                  size="small"
                  color="warning"
                />
              )}
              {filters.includeDeleted && (
                <Chip
                  label={t('filters.includeDeletedFilter')}
                  onDelete={() => handleFilterChange('includeDeleted', false)}
                  size="small"
                  color="error"
                />
              )}
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};
