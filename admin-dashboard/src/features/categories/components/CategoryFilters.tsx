import React, { useState } from 'react';
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
            فلترة الفئات
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} فلتر نشط`}
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
            مسح الفلاتر
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
              label="البحث في الفئات"
              placeholder="ابحث بالاسم أو الوصف..."
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
              <InputLabel>الفئة الأب</InputLabel>
              <Select
                value={filters.parentId || ''}
                onChange={(e) => handleFilterChange('parentId', e.target.value || null)}
                label="الفئة الأب"
              >
                <MenuItem value="">
                  <em>جميع الفئات</em>
                </MenuItem>
                <MenuItem value="null">
                  <em>الفئات الرئيسية فقط</em>
                </MenuItem>
                {categories.map((category) => (
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
              <InputLabel>الحالة</InputLabel>
              <Select
                value={filters.isActive === undefined ? '' : filters.isActive}
                onChange={(e) =>
                  handleFilterChange(
                    'isActive',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                label="الحالة"
              >
                <MenuItem value="">
                  <em>جميع الحالات</em>
                </MenuItem>
                <MenuItem value="true">نشط</MenuItem>
                <MenuItem value="false">غير نشط</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Featured */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>المميزة</InputLabel>
              <Select
                value={filters.isFeatured === undefined ? '' : filters.isFeatured}
                onChange={(e) =>
                  handleFilterChange(
                    'isFeatured',
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                label="المميزة"
              >
                <MenuItem value="">
                  <em>جميع الفئات</em>
                </MenuItem>
                <MenuItem value="true">مميزة</MenuItem>
                <MenuItem value="false">غير مميزة</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Include Deleted */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>تضمين المحذوفة</InputLabel>
              <Select
                value={filters.includeDeleted ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('includeDeleted', e.target.value === 'true')}
                label="تضمين المحذوفة"
              >
                <MenuItem value="false">الفئات النشطة فقط</MenuItem>
                <MenuItem value="true">تضمين المحذوفة</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              الفلاتر النشطة:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filters.search && (
                <Chip
                  label={`بحث: ${filters.search}`}
                  onDelete={() => handleFilterChange('search', '')}
                  size="small"
                  color="primary"
                />
              )}
              {filters.parentId && (
                <Chip
                  label={`فئة أب: ${
                    categories.find((c) => c._id === filters.parentId)?.name || 'غير محدد'
                  }`}
                  onDelete={() => handleFilterChange('parentId', null)}
                  size="small"
                  color="secondary"
                />
              )}
              {filters.isActive !== undefined && (
                <Chip
                  label={`حالة: ${filters.isActive ? 'نشط' : 'غير نشط'}`}
                  onDelete={() => handleFilterChange('isActive', undefined)}
                  size="small"
                  color="success"
                />
              )}
              {filters.isFeatured !== undefined && (
                <Chip
                  label={`مميزة: ${filters.isFeatured ? 'نعم' : 'لا'}`}
                  onDelete={() => handleFilterChange('isFeatured', undefined)}
                  size="small"
                  color="warning"
                />
              )}
              {filters.includeDeleted && (
                <Chip
                  label="تضمين المحذوفة"
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
