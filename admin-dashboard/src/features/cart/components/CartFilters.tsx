import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Typography,
} from '@mui/material';
import { FilterList, Clear, ExpandMore, ExpandLess, Search, DateRange } from '@mui/icons-material';
import { CartStatus, CartFilters as CartFiltersType } from '../types/cart.types';
import { formatDate } from '../api/cartApi';

interface CartFiltersProps {
  filters: CartFiltersType;
  onFiltersChange: (filters: CartFiltersType) => void;
  onSearch: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export const CartFilters: React.FC<CartFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isLoading = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleFilterChange = (key: keyof CartFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onClear();
    setExpanded(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.isAbandoned !== undefined) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.minTotal) count++;
    if (filters.maxTotal) count++;
    if (filters.hasItems !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: CartStatus.ACTIVE, label: 'نشطة' },
    { value: CartStatus.ABANDONED, label: 'متروكة' },
    { value: CartStatus.CONVERTED, label: 'محولة' },
    { value: CartStatus.EXPIRED, label: 'منتهية الصلاحية' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'تاريخ الإنشاء' },
    { value: 'updatedAt', label: 'تاريخ التحديث' },
    { value: 'lastActivityAt', label: 'آخر نشاط' },
    { value: 'total', label: 'القيمة الإجمالية' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'تنازلي' },
    { value: 'asc', label: 'تصاعدي' },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">تصفية السلات</Typography>
            {activeFiltersCount > 0 && (
              <Chip label={activeFiltersCount} size="small" color="primary" variant="outlined" />
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={onSearch}
              disabled={isLoading}
            >
              بحث
            </Button>
            <Tooltip title="مسح جميع المرشحات">
              <IconButton onClick={handleClearFilters} disabled={isLoading}>
                <Clear />
              </IconButton>
            </Tooltip>
            <Tooltip title={expanded ? 'إخفاء المرشحات المتقدمة' : 'عرض المرشحات المتقدمة'}>
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Basic Filters */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>حالة السلة</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                label="حالة السلة"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>نوع السلة</InputLabel>
              <Select
                value={filters.isAbandoned === undefined ? '' : filters.isAbandoned}
                onChange={(e) =>
                  handleFilterChange(
                    'isAbandoned',
                    e.target.value === '' ? undefined : e.target.value
                  )
                }
                label="نوع السلة"
              >
                <MenuItem value="">جميع الأنواع</MenuItem>
                <MenuItem value="true">متروكة فقط</MenuItem>
                <MenuItem value="false">غير متروكة</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>ترتيب حسب</InputLabel>
              <Select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="ترتيب حسب"
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>اتجاه الترتيب</InputLabel>
              <Select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                label="اتجاه الترتيب"
              >
                {sortOrderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="من تاريخ"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="إلى تاريخ"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="الحد الأدنى للقيمة"
                  type="number"
                  value={filters.minTotal || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minTotal',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ mr: 1 }}>
                        ر.ي
                      </Box>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="الحد الأقصى للقيمة"
                  type="number"
                  value={filters.maxTotal || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'maxTotal',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ mr: 1 }}>
                        ر.ي
                      </Box>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>حالة المحتوى</InputLabel>
                  <Select
                    value={filters.hasItems === undefined ? '' : filters.hasItems}
                    onChange={(e) =>
                      handleFilterChange(
                        'hasItems',
                        e.target.value === '' ? undefined : e.target.value
                      )
                    }
                    label="حالة المحتوى"
                  >
                    <MenuItem value="">جميع السلات</MenuItem>
                    <MenuItem value="true">تحتوي على منتجات</MenuItem>
                    <MenuItem value="false">فارغة</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="معرف المستخدم"
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                  placeholder="أدخل معرف المستخدم"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="معرف الجهاز"
                  value={filters.deviceId || ''}
                  onChange={(e) => handleFilterChange('deviceId', e.target.value || undefined)}
                  placeholder="أدخل معرف الجهاز"
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              المرشحات النشطة:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {filters.status && (
                <Chip
                  label={`حالة: ${
                    statusOptions.find((opt) => opt.value === filters.status)?.label
                  }`}
                  onDelete={() => handleFilterChange('status', undefined)}
                  size="small"
                />
              )}
              {filters.isAbandoned !== undefined && (
                <Chip
                  label={`نوع: ${filters.isAbandoned ? 'متروكة فقط' : 'غير متروكة'}`}
                  onDelete={() => handleFilterChange('isAbandoned', undefined)}
                  size="small"
                />
              )}
              {filters.dateFrom && (
                <Chip
                  label={`من: ${formatDate(filters.dateFrom)}`}
                  onDelete={() => handleFilterChange('dateFrom', undefined)}
                  size="small"
                />
              )}
              {filters.dateTo && (
                <Chip
                  label={`إلى: ${formatDate(filters.dateTo)}`}
                  onDelete={() => handleFilterChange('dateTo', undefined)}
                  size="small"
                />
              )}
              {filters.minTotal && (
                <Chip
                  label={`الحد الأدنى: ${filters.minTotal} ر.ي`}
                  onDelete={() => handleFilterChange('minTotal', undefined)}
                  size="small"
                />
              )}
              {filters.maxTotal && (
                <Chip
                  label={`الحد الأقصى: ${filters.maxTotal} ر.ي`}
                  onDelete={() => handleFilterChange('maxTotal', undefined)}
                  size="small"
                />
              )}
              {filters.hasItems !== undefined && (
                <Chip
                  label={`محتوى: ${filters.hasItems ? 'تحتوي على منتجات' : 'فارغة'}`}
                  onDelete={() => handleFilterChange('hasItems', undefined)}
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

export default CartFilters;
