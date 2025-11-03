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
import { useTranslation } from 'react-i18next';
import { BannerLocation } from '../types/banner.types';
import type { ListBannersDto } from '../types/banner.types';

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
  const { t } = useTranslation('banners');

  // Location options with translations
  const locationOptions = [
    { value: BannerLocation.HOME_TOP },
    { value: BannerLocation.HOME_MIDDLE },
    { value: BannerLocation.HOME_BOTTOM },
    { value: BannerLocation.CATEGORY_TOP },
    { value: BannerLocation.PRODUCT_PAGE },
    { value: BannerLocation.CART_PAGE },
    { value: BannerLocation.CHECKOUT_PAGE },
    { value: BannerLocation.SIDEBAR },
    { value: BannerLocation.FOOTER },
  ];

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
            <Typography variant="h6">{t('filters.title')}</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} ${t('filters.activeFilter')}`}
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
                label={t('filters.search.label')}
                placeholder={t('filters.search.placeholder')}
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
                <InputLabel>{t('filters.location.label')}</InputLabel>
                <Select
                  value={localFilters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value as BannerLocation)}
                  label={t('filters.location.label')}
                  disabled={isLoading}
                >
                  <MenuItem value="">{t('filters.location.all')}</MenuItem>
                  {locationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {t(`form.location.${option.value}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>{t('filters.status.label')}</InputLabel>
                <Select
                  value={localFilters.isActive === undefined ? '' : localFilters.isActive}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('isActive', value === '' ? undefined : value === 'true');
                  }}
                  label={t('filters.status.label')}
                  disabled={isLoading}
                >
                  <MenuItem value="">{t('filters.status.all')}</MenuItem>
                  <MenuItem value="true">{t('filters.status.active')}</MenuItem>
                  <MenuItem value="false">{t('filters.status.inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Options */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>{t('filters.sortBy.label')}</InputLabel>
                <Select
                  value={localFilters.sortBy || 'sortOrder'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label={t('filters.sortBy.label')}
                  disabled={isLoading}
                >
                  <MenuItem value="sortOrder">{t('filters.sortBy.sortOrder')}</MenuItem>
                  <MenuItem value="title">{t('filters.sortBy.title')}</MenuItem>
                  <MenuItem value="createdAt">{t('filters.sortBy.createdAt')}</MenuItem>
                  <MenuItem value="updatedAt">{t('filters.sortBy.updatedAt')}</MenuItem>
                  <MenuItem value="viewCount">{t('filters.sortBy.viewCount')}</MenuItem>
                  <MenuItem value="clickCount">{t('filters.sortBy.clickCount')}</MenuItem>
                  <MenuItem value="conversionCount">{t('filters.sortBy.conversionCount')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>{t('filters.sortOrder.label')}</InputLabel>
                <Select
                  value={localFilters.sortOrder || 'asc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  label={t('filters.sortOrder.label')}
                  disabled={isLoading}
                >
                  <MenuItem value="asc">{t('filters.sortOrder.asc')}</MenuItem>
                  <MenuItem value="desc">{t('filters.sortOrder.desc')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Pagination */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>{t('filters.limit.label')}</InputLabel>
                <Select
                  value={localFilters.limit || 20}
                  onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                  label={t('filters.limit.label')}
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
                  {t('filters.reset')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                >
                  {t('filters.apply')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Collapse>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('filters.activeFilters')}:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {localFilters.search && (
                <Chip
                  label={`${t('filters.search.label')}: ${localFilters.search}`}
                  onDelete={() => handleFilterChange('search', '')}
                  size="small"
                />
              )}
              {localFilters.location && (
                <Chip
                  label={`${t('filters.location.label')}: ${t(`form.location.${localFilters.location}`)}`}
                  onDelete={() => handleFilterChange('location', undefined)}
                  size="small"
                />
              )}
              {typeof localFilters.isActive === 'boolean' && (
                <Chip
                  label={`${t('filters.status.label')}: ${localFilters.isActive ? t('filters.status.active') : t('filters.status.inactive')}`}
                  onDelete={() => handleFilterChange('isActive', undefined)}
                  size="small"
                />
              )}
              {localFilters.sortBy && localFilters.sortBy !== 'sortOrder' && (
                <Chip
                  label={`${t('filters.sortBy.label')}: ${localFilters.sortBy}`}
                  onDelete={() => handleFilterChange('sortBy', 'sortOrder')}
                  size="small"
                />
              )}
              {localFilters.sortOrder && localFilters.sortOrder !== 'asc' && (
                <Chip
                  label={`${t('filters.sortOrder.label')}: ${localFilters.sortOrder === 'desc' ? t('filters.sortOrder.desc') : t('filters.sortOrder.asc')}`}
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
