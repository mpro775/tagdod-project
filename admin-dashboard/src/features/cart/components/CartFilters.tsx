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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    { value: '', label: t('cart.filters.status.all', { defaultValue: 'الكل' }) },
    { value: CartStatus.ACTIVE, label: t('cart.filters.status.active', { defaultValue: 'نشط' }) },
    { value: CartStatus.ABANDONED, label: t('cart.filters.status.abandoned', { defaultValue: 'مهمل' }) },
    { value: CartStatus.CONVERTED, label: t('cart.filters.status.converted', { defaultValue: 'محول' }) },
    { value: CartStatus.EXPIRED, label: t('cart.filters.status.expired', { defaultValue: 'منتهي' }) },
  ];

  const sortOptions = [
    { value: 'createdAt', label: t('cart.filters.sorting.createdAt', { defaultValue: 'تاريخ الإنشاء' }) },
    { value: 'updatedAt', label: t('cart.filters.sorting.updatedAt', { defaultValue: 'تاريخ التحديث' }) },
    { value: 'lastActivityAt', label: t('cart.filters.sorting.lastActivity', { defaultValue: 'تاريخ النشاط الأخير' }) },
    { value: 'total', label: t('cart.filters.sorting.total', { defaultValue: 'المجموع' }) },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: t('cart.filters.sorting.descending', { defaultValue: 'تنازلي' }) },
    { value: 'asc', label: t('cart.filters.sorting.ascending', { defaultValue: 'تصاعدي' }) },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6">{t('cart.filters.title', { defaultValue: 'فلاتر البحث' })}</Typography>
            {activeFiltersCount > 0 && (
              <Chip label={t('cart.filters.activeFilters.count', { count: activeFiltersCount })} size="small" color="primary" variant="outlined" />
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={onSearch}
              disabled={isLoading}
            >
              {t('cart.filters.search', { defaultValue: 'بحث' })}
            </Button>
            <Tooltip title={t('cart.filters.advanced.clearTooltip', { defaultValue: 'مسح الفلاتر' })}>
              <IconButton onClick={handleClearFilters} disabled={isLoading}>
                <Clear />
              </IconButton>
            </Tooltip>
            <Tooltip title={expanded ? t('cart.filters.advanced.hide', { defaultValue: 'إخفاء الفلاتر' }) : t('cart.filters.advanced.show', { defaultValue: 'عرض الفلاتر' })}>
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
              <InputLabel>{t('cart.filters.status.label', { defaultValue: 'حالة السلة' })}</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                label={t('cart.filters.status.label', { defaultValue: 'حالة السلة' }    )}
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
              <InputLabel>{t('cart.filters.type.label', { defaultValue: 'نوع السلة' }    )}</InputLabel>
              <Select
                value={filters.isAbandoned === undefined ? '' : filters.isAbandoned}
                onChange={(e) =>
                  handleFilterChange(
                    'isAbandoned',
                    e.target.value === '' ? undefined : e.target.value
                  )
                }
                label={t('cart.filters.type.label', { defaultValue: 'نوع السلة' }    )}
              >
                <MenuItem value="">{t('cart.filters.type.all', { defaultValue: 'الكل' }    )}</MenuItem>
                <MenuItem value="true">{t('cart.filters.type.abandonedOnly', { defaultValue: 'مهمل' }    )}</MenuItem>
                <MenuItem value="false">{t('cart.filters.type.notAbandoned', { defaultValue: 'غير مهمل' }    
                  
                )}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('cart.filters.sorting.sortBy', { defaultValue: 'ترتيب التصفية' }    )}</InputLabel>
              <Select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label={t('cart.filters.sorting.sortBy', { defaultValue: 'ترتيب التصفية' }    )}
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
              <InputLabel>{t('cart.filters.sorting.sortOrder', { defaultValue: 'ترتيب التصفية' }    )}</InputLabel>
              <Select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                label={t('cart.filters.sorting.sortOrder', { defaultValue: 'ترتيب التصفية' }    )}
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
                  label={t('cart.filters.dateRange.from', { defaultValue: 'من تاريخ' }    )}
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
                  label={t('cart.filters.dateRange.to', { defaultValue: 'إلى تاريخ' }    )}
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
                  label={t('cart.filters.valueRange.minTotal', { defaultValue: 'الحد الأدنى للمجموع' }    )}
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
                        $
                      </Box>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('cart.filters.valueRange.maxTotal', { defaultValue: 'الحد الأعلى للمجموع' }    )}
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
                        $
                      </Box>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('cart.filters.content.label', { defaultValue: 'المحتوى' }    )}</InputLabel>
                  <Select
                    value={filters.hasItems === undefined ? '' : filters.hasItems}
                    onChange={(e) =>
                      handleFilterChange(
                        'hasItems',
                        e.target.value === '' ? undefined : e.target.value
                      )
                    }
                    label={t('cart.filters.content.label', { defaultValue: 'المحتوى' }      )}
                  >
                    <MenuItem value="">{t('cart.filters.content.all', { defaultValue: 'الكل' }    )}</MenuItem>
                    <MenuItem value="true">{t('cart.filters.content.withItems', { defaultValue: 'مع المنتجات' }    )}</MenuItem>
                    <MenuItem value="false">{t('cart.filters.content.empty', { defaultValue: 'فارغ' }    )}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('cart.filters.user.id', { defaultValue: 'رقم المستخدم' }    )}
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                  placeholder={t('cart.filters.user.idPlaceholder', { defaultValue: 'رقم المستخدم' }    )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('cart.filters.user.deviceId', { defaultValue: 'رقم الجهاز' }    )}
                  value={filters.deviceId || ''}
                  onChange={(e) => handleFilterChange('deviceId', e.target.value || undefined)}
                  placeholder={t('cart.filters.user.deviceIdPlaceholder', { defaultValue: 'رقم الجهاز' }    )}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('cart.filters.activeFilters.title', { defaultValue: 'الفلاتر النشطة' }    )}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {filters.status && (
                <Chip
                  label={t('cart.filters.activeFilters.status', {
                    status: statusOptions.find((opt) => opt.value === filters.status)?.label
                  })}
                  onDelete={() => handleFilterChange('status', undefined)}
                  size="small"
                />
              )}
              {filters.isAbandoned !== undefined && (
                <Chip
                  label={t('cart.filters.activeFilters.type', {
                    type: filters.isAbandoned ? t('cart.filters.type.abandonedOnly', { defaultValue: 'مهمل' }) : t('cart.filters.type.notAbandoned', { defaultValue: 'غير مهمل' }    )
                  })}
                  onDelete={() => handleFilterChange('isAbandoned', undefined)}
                  size="small"
                />
              )}
              {filters.dateFrom && (
                <Chip
                    label={t('cart.filters.activeFilters.from', { date: formatDate(filters.dateFrom) })}
                  onDelete={() => handleFilterChange('dateFrom', undefined)}
                  size="small"
                />
              )}
              {filters.dateTo && (
                <Chip
                  label={t('cart.filters.activeFilters.to', { date: formatDate(filters.dateTo) })}
                  onDelete={() => handleFilterChange('dateTo', undefined)}
                  size="small"
                />
              )}
              {filters.minTotal && (
                <Chip
                  label={t('cart.filters.activeFilters.minTotal', { value: filters.minTotal })}
                  onDelete={() => handleFilterChange('minTotal', undefined)}
                  size="small"
                />
              )}
              {filters.maxTotal && (
                <Chip
                  label={t('cart.filters.activeFilters.maxTotal', { value: filters.maxTotal })}
                  onDelete={() => handleFilterChange('maxTotal', undefined)}
                  size="small"
                />
              )}
              {filters.hasItems !== undefined && (
                <Chip
                  label={t('cart.filters.activeFilters.content', {
                    content: filters.hasItems ? t('cart.filters.content.withItems', { defaultValue: 'مع المنتجات' }) : t('cart.filters.content.empty', { defaultValue: 'فارغ' }       )
                  })}
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
