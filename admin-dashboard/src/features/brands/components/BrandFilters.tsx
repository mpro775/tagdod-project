import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Typography,
} from '@mui/material';
import { Search, FilterList, Clear, Sort } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ListBrandsParams } from '../types/brand.types';

interface BrandFiltersProps {
  filters: ListBrandsParams;
  onFiltersChange: (filters: ListBrandsParams) => void;
  onReset: () => void;
  loading?: boolean;
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

const createLanguageOptions = (t: (key: string, opts?: any) => string) => [
  { value: 'ar', label: t('filters.arabic') },
  { value: 'en', label: t('filters.english') },
];

export const BrandFilters: React.FC<BrandFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const { t } = useTranslation('brands');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const sortOptions = createSortOptions(t);
  const sortOrderOptions = createSortOrderOptions(t);
  const languageOptions = createLanguageOptions(t);

  const handleFilterChange = (key: keyof ListBrandsParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleSearch = () => {
    // البحث يتم تلقائياً عند تغيير الفلاتر
  };

  const handleReset = () => {
    onReset();
    setShowAdvanced(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.isActive !== undefined) count++;
    if (filters.sortBy && filters.sortBy !== 'name') count++;
    if (filters.sortOrder && filters.sortOrder !== 'asc') count++;
    if (filters.language && filters.language !== 'ar') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterList color="primary" />
              <Typography variant="h6" color="text.primary">
                {t('filters.searchAndFilter')}
              </Typography>
              {activeFiltersCount > 0 && (
                <Chip 
                  label={`${activeFiltersCount} ${t('filters.filterCount')}`} 
                  color="primary" 
                  size="small" 
                />
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowAdvanced(!showAdvanced)}
              startIcon={<Sort />}
            >
              {showAdvanced ? t('filters.hideAdvanced') : t('filters.showAdvanced')}
            </Button>
          </Box>

        <Grid container spacing={2}>
          {/* البحث الأساسي */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('filters.searchPlaceholder')}
              placeholder={t('placeholders.search')}
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              disabled={loading}
            />
          </Grid>

          {/* فلتر الحالة */}
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filters.status')}</InputLabel>
              <Select
                value={filters.isActive ?? ''}
                label={t('filters.status')}
                onChange={(e) =>
                  handleFilterChange(
                    'isActive',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                disabled={loading}
              >
                <MenuItem value="">{t('filters.allStatuses')}</MenuItem>
                <MenuItem value="true">{t('filters.active')}</MenuItem>
                <MenuItem value="false">{t('filters.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* اللغة */}
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filters.language')}</InputLabel>
              <Select
                value={filters.language || 'ar'}
                label={t('filters.language')}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                disabled={loading}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* الفلاتر المتقدمة */}
          {showAdvanced && (
            <>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Typography variant="subtitle1" color="text.primary" gutterBottom>
                    {t('filters.advancedFilters')}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('filters.sortBy')}</InputLabel>
                  <Select
                    value={filters.sortBy || 'name'}
                    label={t('filters.sortBy')}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    disabled={loading}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('filters.sortOrder')}</InputLabel>
                  <Select
                    value={filters.sortOrder || 'asc'}
                    label={t('filters.sortOrder')}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    disabled={loading}
                  >
                    {sortOrderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label={t('filters.itemsPerPage')}
                  type="number"
                  value={filters.limit || 20}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value) || 20)}
                  inputProps={{ min: 1, max: 100 }}
                  disabled={loading}
                />
              </Grid>
            </>
          )}

          {/* أزرار التحكم */}
          <Grid size={{ xs: 12 }}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleReset}
                disabled={loading || activeFiltersCount === 0}
              >
                {t('filters.clearFilters')}
              </Button>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                disabled={loading}
              >
                {t('filters.search')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
