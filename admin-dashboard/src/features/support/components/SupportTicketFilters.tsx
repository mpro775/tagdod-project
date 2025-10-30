import React from 'react';
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
} from '@mui/material';
import { Search, Clear, Refresh } from '@mui/icons-material';
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
  return t(`category.${category}`, { defaultValue: CATEGORY_FALLBACK_LABELS[category] });
};

const getPriorityLabel = (priority: SupportPriority, t: any): string => {
  return t(`priority.${priority}`, { defaultValue: PRIORITY_FALLBACK_LABELS[priority] });
};

const getStatusLabel = (status: SupportStatus, t: any): string => {
  return t(`status.${status}`, { defaultValue: STATUS_FALLBACK_LABELS[status] });
};

export const SupportTicketFilters: React.FC<SupportTicketFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onRefresh,
  isLoading = false,
}) => {
  const { t } = useTranslation('support');
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

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div">
          {t('filters.title', { defaultValue: 'الفلاتر' })}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={isLoading}
          >
            {t('labels.refresh', { defaultValue: 'تحديث' })}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={onReset}
            disabled={activeFiltersCount === 0}
          >
            {t('filters.clearFilters', { defaultValue: 'مسح الفلاتر' })}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid component="div" size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label={t('filters.searchPlaceholder', { defaultValue: 'البحث' })}
            placeholder={t('filters.searchPlaceholder', { defaultValue: 'البحث' } )}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('filters.statusLabel', { defaultValue: 'الحالة' })}</InputLabel>
            <Select
              value={filters.status || ''}
              label={t('filters.statusLabel', { defaultValue: 'الحالة' })}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>{t('status.all', { defaultValue: 'الكل' })}</em>
              </MenuItem>
              {Object.values(SupportStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status, t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('filters.priorityLabel', { defaultValue: 'الأولوية' })}</InputLabel>
            <Select
              value={filters.priority || ''}
              label={t('filters.priorityLabel', { defaultValue: 'الأولوية' })}
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>{t('priority.all', { defaultValue: 'الكل' })}</em>
              </MenuItem>
              {Object.values(SupportPriority).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {getPriorityLabel(priority, t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t('filters.categoryLabel', { defaultValue: 'الفئة' })}</InputLabel>
            <Select
              value={filters.category || ''}
              label={t('filters.categoryLabel', { defaultValue: 'الفئة' })}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>{t('category.all', { defaultValue: 'الكل' })}</em>
              </MenuItem>
              {Object.values(SupportCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {getCategoryLabel(category, t)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            label={t('filters.assignedToLabel', { defaultValue: 'المسؤول' })}
            placeholder={t('filters.assignedToPlaceholder', { defaultValue: 'البحث عن مسؤول' })}
            value={filters.assignedTo || ''}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value || undefined)}
          />
        </Grid>
      </Grid>

      {activeFiltersCount > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            {t('filters.activeFilters', { defaultValue: 'الفلاتر النشطة' })}:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.search && (
              <Chip
                label={`${t('filters.search', { defaultValue: 'البحث' })}: ${filters.search}`}
                onDelete={() => clearFilter('search')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.status && (
              <Chip
                label={`${t('filters.statusLabel', { defaultValue: 'الحالة' })}: ${getStatusLabel(filters.status, t)}`}
                onDelete={() => clearFilter('status')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.priority && (
              <Chip
                label={`${t('filters.priorityLabel', { defaultValue: 'الأولوية' })}: ${getPriorityLabel(filters.priority, t)}`}
                onDelete={() => clearFilter('priority')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.category && (
              <Chip
                label={`${t('filters.categoryLabel', { defaultValue: 'الفئة' })}: ${getCategoryLabel(filters.category, t)}`}
                onDelete={() => clearFilter('category')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.assignedTo && (
              <Chip
                label={`${t('filters.assignedToLabel', { defaultValue: 'المسؤول' }  )}: ${filters.assignedTo}`}
                onDelete={() => clearFilter('assignedTo')}
                deleteIcon={<Clear />}
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default SupportTicketFilters;
