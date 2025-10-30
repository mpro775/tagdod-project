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
  { value: 'name', label: t('filters.sortByOptions.name', { defaultValue: 'الاسم (عربي)' }) },
  { value: 'nameEn', label: t('filters.sortByOptions.nameEn', { defaultValue: 'الاسم (إنجليزي)' }) },
  { value: 'createdAt', label: t('filters.sortByOptions.createdAt', { defaultValue: 'تاريخ الإنشاء' }) },
  { value: 'sortOrder', label: t('filters.sortByOptions.sortOrder', { defaultValue: 'ترتيب العرض' }) },
];

const createSortOrderOptions = (t: (key: string, opts?: any) => string) => [
  { value: 'asc', label: t('filters.sortOrderOptions.asc', { defaultValue: 'تصاعدي' }) },
  { value: 'desc', label: t('filters.sortOrderOptions.desc', { defaultValue: 'تنازلي' }) },
];

const createLanguageOptions = (t: (key: string, opts?: any) => string) => [
  { value: 'ar', label: t('filters.arabic', { defaultValue: 'العربية' }) },
  { value: 'en', label: t('filters.english', { defaultValue: 'الإنجليزية' }) },
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
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterList color="primary" />
              <Typography variant="h6">{t('filters.searchAndFilter', { defaultValue: 'بحث وتصفية' })}</Typography>
              {activeFiltersCount > 0 && (
                <Chip label={`${activeFiltersCount} ${t('filters.filterCount', { defaultValue: 'مرشّح' })}`} color="primary" size="small" />
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowAdvanced(!showAdvanced)}
              startIcon={<Sort />}
            >
              {showAdvanced ? t('filters.hideAdvanced', { defaultValue: 'إخفاء المتقدمة' }) : t('filters.showAdvanced', { defaultValue: 'إظهار المتقدمة' })}
            </Button>
          </Box>

        <Grid container spacing={2}>
          {/* البحث الأساسي */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('filters.searchPlaceholder', { defaultValue: 'ابحث عن علامة تجارية' })}
              placeholder={t('placeholders.search', { defaultValue: 'اكتب كلمات البحث' })}
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
              <InputLabel>{t('filters.status', { defaultValue: 'الحالة' })}</InputLabel>
              <Select
                value={filters.isActive ?? ''}
                label={t('filters.status', { defaultValue: 'الحالة' })}
                onChange={(e) =>
                  handleFilterChange(
                    'isActive',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                disabled={loading}
              >
                <MenuItem value="">{t('filters.allStatuses', { defaultValue: 'كل الحالات' })}</MenuItem>
                <MenuItem value="true">{t('filters.active', { defaultValue: 'نشط' })}</MenuItem>
                <MenuItem value="false">{t('filters.inactive', { defaultValue: 'غير نشط' })}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* اللغة */}
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filters.language', { defaultValue: 'اللغة' })}</InputLabel>
              <Select
                value={filters.language || 'ar'}
                label={t('filters.language', { defaultValue: 'اللغة' })}
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
                  <Typography variant="subtitle1" gutterBottom>
                    {t('filters.advancedFilters', { defaultValue: 'فلاتر متقدمة' })}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('filters.sortBy', { defaultValue: 'الترتيب حسب' })}</InputLabel>
                  <Select
                    value={filters.sortBy || 'name'}
                    label={t('filters.sortBy', { defaultValue: 'الترتيب حسب' })}
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
                  <InputLabel>{t('filters.sortOrder', { defaultValue: 'اتجاه الترتيب' })}</InputLabel>
                  <Select
                    value={filters.sortOrder || 'asc'}
                    label={t('filters.sortOrder', { defaultValue: 'اتجاه الترتيب' })}
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
                  label={t('filters.itemsPerPage', { defaultValue: 'عناصر لكل صفحة' })}
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
                {t('filters.clearFilters', { defaultValue: 'مسح الفلاتر' })}
              </Button>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                disabled={loading}
              >
                {t('filters.search', { defaultValue: 'بحث' })}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
