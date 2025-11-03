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
  useTheme,
  Divider,
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
  const { t } = useTranslation('cart');
  const theme = useTheme();
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
    { value: '', label: t('filters.status.all') },
    { value: CartStatus.ACTIVE, label: t('filters.status.active') },
    { value: CartStatus.ABANDONED, label: t('filters.status.abandoned') },
    { value: CartStatus.CONVERTED, label: t('filters.status.converted') },
    { value: CartStatus.EXPIRED, label: t('filters.status.expired') },
  ];

  const sortOptions = [
    { value: 'createdAt', label: t('filters.sorting.createdAt') },
    { value: 'updatedAt', label: t('filters.sorting.updatedAt') },
    { value: 'lastActivityAt', label: t('filters.sorting.lastActivity') },
    { value: 'total', label: t('filters.sorting.total') },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: t('filters.sorting.descending') },
    { value: 'asc', label: t('filters.sorting.ascending') },
  ];

  return (
    <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={2}
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={{ xs: 1, sm: 0 }}
        >
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <FilterList color="primary" />
            <Typography variant="h6" color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {t('filters.title')}
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip 
                label={t('filters.activeFilters.count', { count: activeFiltersCount })} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              />
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={onSearch}
              disabled={isLoading}
              size="small"
            >
              {t('filters.search')}
            </Button>
            <Tooltip title={t('filters.advanced.clearTooltip')}>
              <span>
                <IconButton onClick={handleClearFilters} disabled={isLoading} size="small">
                  <Clear />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={expanded ? t('filters.advanced.hide') : t('filters.advanced.show')}>
              <IconButton onClick={() => setExpanded(!expanded)} size="small">
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Basic Filters */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filters.status.label')}</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                label={t('filters.status.label')}
                disabled={isLoading}
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
              <InputLabel>{t('filters.type.label')}</InputLabel>
              <Select
                value={filters.isAbandoned === undefined ? '' : filters.isAbandoned}
                onChange={(e) =>
                  handleFilterChange(
                    'isAbandoned',
                    e.target.value === '' ? undefined : e.target.value
                  )
                }
                label={t('filters.type.label')}
                disabled={isLoading}
              >
                <MenuItem value="">{t('filters.type.all')}</MenuItem>
                <MenuItem value="true">{t('filters.type.abandonedOnly')}</MenuItem>
                <MenuItem value="false">{t('filters.type.notAbandoned')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('filters.sorting.sortBy')}</InputLabel>
              <Select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label={t('filters.sorting.sortBy')}
                disabled={isLoading}
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
              <InputLabel>{t('filters.sorting.sortOrder')}</InputLabel>
              <Select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                label={t('filters.sorting.sortOrder')}
                disabled={isLoading}
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
            <Divider sx={{ my: 2, borderColor: 'divider' }} />
            <Typography 
              variant="subtitle1" 
              gutterBottom
              sx={{ mb: 2, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {t('filters.advanced.title')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('filters.dateRange.from')}
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('filters.dateRange.to')}
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('filters.valueRange.minTotal')}
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
                      <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>
                        $
                      </Box>
                    ),
                  }}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('filters.valueRange.maxTotal')}
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
                      <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>
                        $
                      </Box>
                    ),
                  }}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('filters.content.label')}</InputLabel>
                  <Select
                    value={filters.hasItems === undefined ? '' : filters.hasItems}
                    onChange={(e) =>
                      handleFilterChange(
                        'hasItems',
                        e.target.value === '' ? undefined : e.target.value
                      )
                    }
                    label={t('filters.content.label')}
                    disabled={isLoading}
                  >
                    <MenuItem value="">{t('filters.content.all')}</MenuItem>
                    <MenuItem value="true">{t('filters.content.withItems')}</MenuItem>
                    <MenuItem value="false">{t('filters.content.empty')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('filters.user.id')}
                  value={filters.userId || ''}
                  onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                  placeholder={t('filters.user.idPlaceholder')}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('filters.user.deviceId')}
                  value={filters.deviceId || ''}
                  onChange={(e) => handleFilterChange('deviceId', e.target.value || undefined)}
                  placeholder={t('filters.user.deviceIdPlaceholder')}
                  disabled={isLoading}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Divider sx={{ mb: 2, borderColor: 'divider' }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('filters.activeFilters.title')}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {filters.status && (
                <Chip
                  label={t('filters.activeFilters.status', {
                    status: statusOptions.find((opt) => opt.value === filters.status)?.label
                  })}
                  onDelete={() => handleFilterChange('status', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
              {filters.isAbandoned !== undefined && (
                <Chip
                  label={t('filters.activeFilters.type', {
                    type: filters.isAbandoned ? t('filters.type.abandonedOnly') : t('filters.type.notAbandoned')
                  })}
                  onDelete={() => handleFilterChange('isAbandoned', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
              {filters.dateFrom && (
                <Chip
                  label={t('filters.activeFilters.from', { date: formatDate(filters.dateFrom) })}
                  onDelete={() => handleFilterChange('dateFrom', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
              {filters.dateTo && (
                <Chip
                  label={t('filters.activeFilters.to', { date: formatDate(filters.dateTo) })}
                  onDelete={() => handleFilterChange('dateTo', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
              {filters.minTotal && (
                <Chip
                  label={t('filters.activeFilters.minTotal', { value: filters.minTotal })}
                  onDelete={() => handleFilterChange('minTotal', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
              {filters.maxTotal && (
                <Chip
                  label={t('filters.activeFilters.maxTotal', { value: filters.maxTotal })}
                  onDelete={() => handleFilterChange('maxTotal', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              )}
              {filters.hasItems !== undefined && (
                <Chip
                  label={t('filters.activeFilters.content', {
                    content: filters.hasItems ? t('filters.content.withItems') : t('filters.content.empty')
                  })}
                  onDelete={() => handleFilterChange('hasItems', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
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
