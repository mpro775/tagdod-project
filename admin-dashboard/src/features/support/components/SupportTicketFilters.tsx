import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Stack,
  Paper,
  Typography,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search, Clear, Refresh, FilterList, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SupportStatus, SupportPriority, SupportCategory } from '../types/support.types';

export interface SupportTicketFilters {
  search?: string;
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
  assignedTo?: string;
}

interface SupportTicketFiltersProps {
  filters: SupportTicketFilters;
  onFiltersChange: (filters: SupportTicketFilters) => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const STATUS_FALLBACK_LABELS: Record<SupportStatus, string> = {
  [SupportStatus.OPEN]: 'مفتوح',
  [SupportStatus.IN_PROGRESS]: 'قيد التنفيذ',
  [SupportStatus.WAITING_FOR_USER]: 'بانتظار العميل',
  [SupportStatus.RESOLVED]: 'تم الحل',
  [SupportStatus.CLOSED]: 'مغلق',
};

const PRIORITY_FALLBACK_LABELS: Record<SupportPriority, string> = {
  [SupportPriority.LOW]: 'منخفضة',
  [SupportPriority.MEDIUM]: 'متوسطة',
  [SupportPriority.HIGH]: 'عالية',
  [SupportPriority.URGENT]: 'عاجلة',
};

const CATEGORY_FALLBACK_LABELS: Record<SupportCategory, string> = {
  [SupportCategory.TECHNICAL]: 'تقني',
  [SupportCategory.BILLING]: 'الفواتير',
  [SupportCategory.PRODUCTS]: 'المنتجات',
  [SupportCategory.SERVICES]: 'الخدمات',
  [SupportCategory.ACCOUNT]: 'الحساب',
  [SupportCategory.OTHER]: 'أخرى',
};

const getCategoryLabel = (category: SupportCategory, t: any): string => {
  return t(`category.${category}`);
};

const getPriorityLabel = (priority: SupportPriority, t: any): string => {
  return t(`priority.${priority}`);
};

const getStatusLabel = (status: SupportStatus, t: any): string => {
  return t(`status.${status}`);
};

export const SupportTicketFilters: React.FC<SupportTicketFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onRefresh,
  isLoading = false,
}) => {
  const { t } = useTranslation('support');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile);

  const handleFilterChange = (key: keyof SupportTicketFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilter = (key: keyof SupportTicketFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <Paper 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: { xs: 2, sm: 3 },
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 1.5, sm: 0 }}
        mb={filtersExpanded ? 2 : 0}
      >
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {isMobile && (
            <IconButton
              onClick={toggleFilters}
              size="small"
              sx={{ 
                color: 'text.primary',
                p: 0.5,
              }}
            >
              <FilterList fontSize="small" />
            </IconButton>
          )}
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            component="div"
            sx={{ 
              color: 'text.primary',
              fontWeight: isMobile ? 'medium' : 'bold',
            }}
          >
            {t('filters.title')}
          </Typography>
          {isMobile && (
            <IconButton
              onClick={toggleFilters}
              size="small"
              sx={{ 
                color: 'text.primary',
                ml: 'auto',
                p: 0.5,
              }}
            >
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Stack>
        <Stack 
          direction={{ xs: 'row', sm: 'row' }} 
          spacing={1}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-end', sm: 'flex-end' },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
              minWidth: { xs: 'auto', sm: 100 },
              px: { xs: 1.5, sm: 2 },
            }}
          >
            {isMobile ? null : t('labels.refresh')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={onReset}
            disabled={activeFiltersCount === 0}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
              '&:disabled': {
                borderColor: 'divider',
                opacity: 0.5,
              },
              minWidth: { xs: 'auto', sm: 120 },
              px: { xs: 1.5, sm: 2 },
            }}
          >
            {isMobile ? null : t('filters.clearFilters')}
          </Button>
        </Stack>
      </Stack>

      <Collapse in={filtersExpanded}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label={t('filters.searchPlaceholder')}
              placeholder={t('filters.searchPlaceholder')}
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              size={isMobile ? 'small' : 'medium'}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default',
                },
              }}
            />
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t('filters.statusLabel')}</InputLabel>
              <Select
                value={filters.status || ''}
                label={t('filters.statusLabel')}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                sx={{
                  backgroundColor: 'background.default',
                }}
              >
                <MenuItem value="">
                  <em>{t('status.all')}</em>
                </MenuItem>
                {Object.values(SupportStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status, t)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t('filters.priorityLabel')}</InputLabel>
              <Select
                value={filters.priority || ''}
                label={t('filters.priorityLabel')}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                sx={{
                  backgroundColor: 'background.default',
                }}
              >
                <MenuItem value="">
                  <em>{t('priority.all')}</em>
                </MenuItem>
                {Object.values(SupportPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {getPriorityLabel(priority, t)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t('filters.categoryLabel')}</InputLabel>
              <Select
                value={filters.category || ''}
                label={t('filters.categoryLabel')}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                sx={{
                  backgroundColor: 'background.default',
                }}
              >
                <MenuItem value="">
                  <em>{t('category.all')}</em>
                </MenuItem>
                {Object.values(SupportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category, t)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              label={t('filters.assignedToLabel')}
              placeholder={t('filters.assignedToPlaceholder')}
              value={filters.assignedTo || ''}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value || undefined)}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.default',
                },
              }}
            />
          </Grid>
        </Grid>
      </Collapse>

      {activeFiltersCount > 0 && (
        <Box mt={filtersExpanded ? 2 : 0}>
          <Collapse in={filtersExpanded}>
            <Typography 
              variant="subtitle2" 
              gutterBottom
              sx={{ 
                color: 'text.primary',
                mb: 1,
              }}
            >
              {t('filters.activeFilters')}:
            </Typography>
          </Collapse>
          <Stack 
            direction="row" 
            spacing={1} 
            flexWrap="wrap" 
            useFlexGap
            sx={{ gap: 0.5 }}
          >
            {filters.search && (
              <Chip
                label={`${t('filters.search')}: ${filters.search}`}
                onDelete={() => clearFilter('search')}
                deleteIcon={<Clear fontSize="small" />}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  },
                }}
              />
            )}
            {filters.status && (
              <Chip
                label={`${t('filters.statusLabel')}: ${getStatusLabel(filters.status, t)}`}
                onDelete={() => clearFilter('status')}
                deleteIcon={<Clear fontSize="small" />}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  },
                }}
              />
            )}
            {filters.priority && (
              <Chip
                label={`${t('filters.priorityLabel')}: ${getPriorityLabel(filters.priority, t)}`}
                onDelete={() => clearFilter('priority')}
                deleteIcon={<Clear fontSize="small" />}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  },
                }}
              />
            )}
            {filters.category && (
              <Chip
                label={`${t('filters.categoryLabel')}: ${getCategoryLabel(filters.category, t)}`}
                onDelete={() => clearFilter('category')}
                deleteIcon={<Clear fontSize="small" />}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  },
                }}
              />
            )}
            {filters.assignedTo && (
              <Chip
                label={`${t('filters.assignedToLabel')}: ${filters.assignedTo}`}
                onDelete={() => clearFilter('assignedTo')}
                deleteIcon={<Clear fontSize="small" />}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '& .MuiChip-label': {
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  },
                }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default SupportTicketFilters;
