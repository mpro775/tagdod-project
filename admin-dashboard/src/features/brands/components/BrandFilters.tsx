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
import type { ListBrandsParams } from '../types/brand.types';

interface BrandFiltersProps {
  filters: ListBrandsParams;
  onFiltersChange: (filters: ListBrandsParams) => void;
  onReset: () => void;
  loading?: boolean;
}

const sortOptions = [
  { value: 'name', label: 'الاسم (عربي)' },
  { value: 'nameEn', label: 'الاسم (إنجليزي)' },
  { value: 'createdAt', label: 'تاريخ الإنشاء' },
  { value: 'sortOrder', label: 'ترتيب العرض' },
];

const sortOrderOptions = [
  { value: 'asc', label: 'تصاعدي' },
  { value: 'desc', label: 'تنازلي' },
];

const languageOptions = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

export const BrandFilters: React.FC<BrandFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
            <Typography variant="h6">فلترة العلامات التجارية</Typography>
            {activeFiltersCount > 0 && (
              <Chip label={`${activeFiltersCount} فلتر نشط`} color="primary" size="small" />
            )}
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
            startIcon={<Sort />}
          >
            {showAdvanced ? 'إخفاء الفلاتر المتقدمة' : 'فلاتر متقدمة'}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* البحث الأساسي */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="البحث في العلامات التجارية"
              placeholder="ابحث بالاسم أو الوصف..."
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
              <InputLabel>الحالة</InputLabel>
              <Select
                value={filters.isActive ?? ''}
                label="الحالة"
                onChange={(e) =>
                  handleFilterChange(
                    'isActive',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                disabled={loading}
              >
                <MenuItem value="">جميع الحالات</MenuItem>
                <MenuItem value="true">نشط</MenuItem>
                <MenuItem value="false">غير نشط</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* اللغة */}
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>اللغة</InputLabel>
              <Select
                value={filters.language || 'ar'}
                label="اللغة"
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
                    فلاتر متقدمة
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>ترتيب حسب</InputLabel>
                  <Select
                    value={filters.sortBy || 'name'}
                    label="ترتيب حسب"
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
                  <InputLabel>اتجاه الترتيب</InputLabel>
                  <Select
                    value={filters.sortOrder || 'asc'}
                    label="اتجاه الترتيب"
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
                  label="عدد العناصر في الصفحة"
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
                مسح الفلاتر
              </Button>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                disabled={loading}
              >
                بحث
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
