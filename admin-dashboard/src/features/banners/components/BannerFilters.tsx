import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import { Search, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import { BANNER_LOCATION_OPTIONS } from '../types/banner.types';
import type { ListBannersDto, BannerLocation } from '../types/banner.types';

interface BannerFiltersProps {
  filters: ListBannersDto;
  onFiltersChange: (filters: ListBannersDto) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const BannerFilters: React.FC<BannerFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<ListBannersDto>(filters);

  const handleFilterChange = (key: keyof ListBannersDto, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: ListBannersDto = {
      page: 1,
      limit: 20,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.location) count++;
    if (typeof localFilters.isActive === 'boolean') count++;
    if (localFilters.sortBy !== 'sortOrder') count++;
    if (localFilters.sortOrder !== 'asc') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">فلاتر البحث</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} فلتر نشط`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Grid container spacing={3}>
            {/* Search */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="البحث في البانرات"
                placeholder="ابحث في العنوان أو الوصف..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                disabled={isLoading}
              />
            </Grid>

            {/* Location Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>موقع العرض</InputLabel>
                <Select
                  value={localFilters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value as BannerLocation)}
                  label="موقع العرض"
                  disabled={isLoading}
                >
                  <MenuItem value="">جميع المواقع</MenuItem>
                  {BANNER_LOCATION_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={localFilters.isActive === undefined ? '' : localFilters.isActive}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('isActive', value === '' ? undefined : value === 'true');
                  }}
                  label="الحالة"
                  disabled={isLoading}
                >
                  <MenuItem value="">جميع الحالات</MenuItem>
                  <MenuItem value="true">نشط</MenuItem>
                  <MenuItem value="false">غير نشط</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Options */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>ترتيب حسب</InputLabel>
                <Select
                  value={localFilters.sortBy || 'sortOrder'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="ترتيب حسب"
                  disabled={isLoading}
                >
                  <MenuItem value="sortOrder">ترتيب العرض</MenuItem>
                  <MenuItem value="title">العنوان</MenuItem>
                  <MenuItem value="createdAt">تاريخ الإنشاء</MenuItem>
                  <MenuItem value="updatedAt">تاريخ التحديث</MenuItem>
                  <MenuItem value="viewCount">عدد المشاهدات</MenuItem>
                  <MenuItem value="clickCount">عدد النقرات</MenuItem>
                  <MenuItem value="conversionCount">عدد التحويلات</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>اتجاه الترتيب</InputLabel>
                <Select
                  value={localFilters.sortOrder || 'asc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  label="اتجاه الترتيب"
                  disabled={isLoading}
                >
                  <MenuItem value="asc">تصاعدي</MenuItem>
                  <MenuItem value="desc">تنازلي</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Pagination */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>عدد العناصر في الصفحة</InputLabel>
                <Select
                  value={localFilters.limit || 20}
                  onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                  label="عدد العناصر في الصفحة"
                  disabled={isLoading}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                gap={2}
                justifyContent="flex-end"
                alignItems="center"
                height="100%"
              >
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  إعادة تعيين
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                >
                  تطبيق الفلاتر
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Collapse>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              الفلاتر النشطة:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {localFilters.search && (
                <Chip
                  label={`البحث: ${localFilters.search}`}
                  onDelete={() => handleFilterChange('search', '')}
                  size="small"
                />
              )}
              {localFilters.location && (
                <Chip
                  label={`الموقع: ${
                    BANNER_LOCATION_OPTIONS.find((opt) => opt.value === localFilters.location)
                      ?.label
                  }`}
                  onDelete={() => handleFilterChange('location', undefined)}
                  size="small"
                />
              )}
              {typeof localFilters.isActive === 'boolean' && (
                <Chip
                  label={`الحالة: ${localFilters.isActive ? 'نشط' : 'غير نشط'}`}
                  onDelete={() => handleFilterChange('isActive', undefined)}
                  size="small"
                />
              )}
              {localFilters.sortBy && localFilters.sortBy !== 'sortOrder' && (
                <Chip
                  label={`الترتيب: ${localFilters.sortBy}`}
                  onDelete={() => handleFilterChange('sortBy', 'sortOrder')}
                  size="small"
                />
              )}
              {localFilters.sortOrder && localFilters.sortOrder !== 'asc' && (
                <Chip
                  label={`الاتجاه: ${localFilters.sortOrder === 'desc' ? 'تنازلي' : 'تصاعدي'}`}
                  onDelete={() => handleFilterChange('sortOrder', 'asc')}
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
