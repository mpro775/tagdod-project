import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search, FilterList, Clear, Refresh, Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ServiceFilterProps {
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  type: 'request' | 'engineer' | 'offer';
  showExport?: boolean;
  showRefresh?: boolean;
}

export const ServiceFilter: React.FC<ServiceFilterProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  type,
  showExport = true,
  showRefresh = true,
}) => {
  const { t } = useTranslation('services');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getFilterFields = () => {
    switch (type) {
      case 'request':
        return [
          {
            key: 'search',
            label: t('filters.searchLabel'),
            type: 'text',
            icon: <Search />,
            placeholder: t('placeholders.searchRequests'),
          },
          {
            key: 'status',
            label: t('filters.statusLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.statusOptions.all') },
              { value: 'OPEN', label: t('status.open') },
              { value: 'OFFERS_COLLECTING', label: t('status.offersCollecting') },
              { value: 'ASSIGNED', label: t('status.assigned') },
              { value: 'COMPLETED', label: t('status.completed') },
              { value: 'RATED', label: t('status.rated') },
              { value: 'CANCELLED', label: t('status.cancelled') },
            ],
          },
          {
            key: 'type',
            label: t('filters.typeLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.serviceTypeOptions.all') },
              { value: 'INSTALLATION', label: t('serviceTypes.installation') },
              { value: 'MAINTENANCE', label: t('serviceTypes.maintenance') },
              { value: 'REPAIR', label: t('serviceTypes.repair') },
              { value: 'CONSULTATION', label: t('serviceTypes.consultation') },
            ],
          },
          {
            key: 'dateRange',
            label: t('filters.dateRangeLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.dateRange.all') },
              { value: 'today', label: t('filters.dateRange.today') },
              { value: 'week', label: t('filters.dateRange.week') },
              { value: 'month', label: t('filters.dateRange.month') },
              { value: 'year', label: t('filters.dateRange.year') },
            ],
          },
        ];
      case 'engineer':
        return [
          {
            key: 'search',
            label: t('filters.searchLabel'),
            type: 'text',
            icon: <Search />,
            placeholder: t('placeholders.searchEngineers'),
          },
          {
            key: 'status',
            label: t('filters.statusLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.statusOptions.all') },
              { value: 'active', label: t('status.active') },
              { value: 'inactive', label: t('status.inactive') },
            ],
          },
          {
            key: 'specialization',
            label: t('filters.specializationLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.specializationOptions.all') },
              { value: 'SOLAR', label: t('specializations.solar') },
              { value: 'ELECTRICAL', label: t('specializations.electrical') },
              { value: 'PLUMBING', label: t('specializations.plumbing') },
              { value: 'HVAC', label: t('specializations.hvac') },
              { value: 'GENERAL', label: t('specializations.general') },
            ],
          },
          {
            key: 'rating',
            label: t('labels.rating'),
            type: 'select',
            options: [
              { value: '', label: t('filters.ratingOptions.all') },
              { value: '5', label: t('filters.ratingOptions.five') },
              { value: '4', label: t('filters.ratingOptions.four') },
              { value: '3', label: t('filters.ratingOptions.three') },
              { value: '2', label: t('filters.ratingOptions.two') },
              { value: '1', label: t('filters.ratingOptions.one') },
            ],
          },
        ];
      case 'offer':
        return [
          {
            key: 'search',
            label: t('filters.searchLabel'),
            type: 'text',
            icon: <Search />,
            placeholder: t('placeholders.searchOffers'),
          },
          {
            key: 'status',
            label: t('filters.offerStatusLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.statusOptions.all') },
              { value: 'OFFERED', label: t('status.offered') },
              { value: 'ACCEPTED', label: t('status.accepted') },
              { value: 'REJECTED', label: t('status.rejected') },
              { value: 'CANCELLED', label: t('status.cancelled') },
              { value: 'OUTBID', label: t('status.outbid') },
              { value: 'EXPIRED', label: t('status.expired') },
            ],
          },
          {
            key: 'amountRange',
            label: t('filters.amountRangeLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.amountRangeOptions.all') },
              { value: '0-1000', label: t('filters.amountRangeOptions.range1') },
              { value: '1000-5000', label: t('filters.amountRangeOptions.range2') },
              { value: '5000-10000', label: t('filters.amountRangeOptions.range3') },
              { value: '10000+', label: t('filters.amountRangeOptions.range4') },
            ],
          },
          {
            key: 'dateRange',
            label: t('filters.dateRangeLabel'),
            type: 'select',
            options: [
              { value: '', label: t('filters.dateRange.all') },
              { value: 'today', label: t('filters.dateRange.today') },
              { value: 'week', label: t('filters.dateRange.week') },
              { value: 'month', label: t('filters.dateRange.month') },
              { value: 'year', label: t('filters.dateRange.year') },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const filterFields = getFilterFields();
  const activeFiltersCount = Object.values(filters).filter((value) => value !== '').length;

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.background.paper 
          : theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={2}
          gap={2}
        >
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            <FilterList sx={{ color: 'text.secondary' }} />
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600 }}
            >
              {t('filters.title')}
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={t('filters.activeFiltersCount', { count: activeFiltersCount })}
                color="primary"
                size="small"
              />
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {showRefresh && (
              <Tooltip title={t('labels.refresh')}>
                <IconButton 
                  size="small" 
                  onClick={onApplyFilters}
                  sx={{
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.text.secondary 
                      : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
            {showExport && (
              <Tooltip title={t('labels.export')}>
                <IconButton
                  size="small"
                  sx={{
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.text.secondary 
                      : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} alignItems="flex-start">
          {filterFields.map((field) => (
            <Grid 
              key={field.key} 
              size={{ xs: 12, sm: 6, md: 3 }}
              sx={{ display: 'flex', alignItems: 'stretch' }}
            >
              {field.type === 'text' ? (
                <TextField
                  fullWidth
                  label={field.label}
                  value={filters[field.key] || ''}
                  onChange={(e) => onFilterChange(field.key, e.target.value)}
                  InputProps={{
                    startAdornment: field.icon,
                  }}
                  placeholder={field.placeholder}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.02)',
                    },
                  }}
                />
              ) : (
                <FormControl 
                  fullWidth 
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={filters[field.key] || ''}
                    label={field.label}
                    onChange={(e) => onFilterChange(field.key, e.target.value)}
                  >
                    {field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
          ))}

          <Grid 
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ display: 'flex', alignItems: 'stretch' }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1}
              sx={{ width: '100%' }}
            >
              <Button
                variant="contained"
                startIcon={<FilterList />}
                onClick={onApplyFilters}
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  minWidth: { xs: '100%', sm: 'auto' },
                }}
              >
                {t('filters.applyFilters')}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={onClearFilters}
                  color="error"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    minWidth: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {t('filters.clearFilters')}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        {activeFiltersCount > 0 && (
          <Box mt={3}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ mb: 1 }}
            >
              {t('filters.activeFilters')}:
            </Typography>
            <Stack 
              direction="row" 
              spacing={1} 
              flexWrap="wrap"
              useFlexGap
            >
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                const field = filterFields.find((f) => f.key === key);
                const option = field?.options?.find((o) => o.value === value);
                return (
                  <Chip
                    key={key}
                    label={`${field?.label}: ${option?.label || value}`}
                    onDelete={() => onFilterChange(key, '')}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      marginBottom: { xs: 0.5, sm: 0 },
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(25,118,210,0.1)'
                        : 'rgba(25,118,210,0.08)',
                      borderColor: theme.palette.mode === 'dark'
                        ? 'rgba(25,118,210,0.3)'
                        : 'rgba(25,118,210,0.5)',
                      '& .MuiChip-deleteIcon': {
                        color: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(0,0,0,0.6)',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
