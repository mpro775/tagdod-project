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

const getCategoryLabel = (category: SupportCategory): string => {
  switch (category) {
    case SupportCategory.TECHNICAL:
      return 'تقني';
    case SupportCategory.BILLING:
      return 'الفواتير';
    case SupportCategory.PRODUCTS:
      return 'المنتجات';
    case SupportCategory.SERVICES:
      return 'الخدمات';
    case SupportCategory.ACCOUNT:
      return 'الحساب';
    case SupportCategory.OTHER:
      return 'أخرى';
    default:
      return 'جميع الفئات';
  }
};

const getPriorityLabel = (priority: SupportPriority): string => {
  switch (priority) {
    case SupportPriority.LOW:
      return 'منخفضة';
    case SupportPriority.MEDIUM:
      return 'متوسطة';
    case SupportPriority.HIGH:
      return 'عالية';
    case SupportPriority.URGENT:
      return 'عاجلة';
    default:
      return 'جميع الأولويات';
  }
};

const getStatusLabel = (status: SupportStatus): string => {
  switch (status) {
    case SupportStatus.OPEN:
      return 'مفتوحة';
    case SupportStatus.IN_PROGRESS:
      return 'قيد المعالجة';
    case SupportStatus.WAITING_FOR_USER:
      return 'في انتظار المستخدم';
    case SupportStatus.RESOLVED:
      return 'محلولة';
    case SupportStatus.CLOSED:
      return 'مغلقة';
    default:
      return 'جميع الحالات';
  }
};

export const SupportTicketFilters: React.FC<SupportTicketFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onRefresh,
  isLoading = false,
}) => {
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
          فلترة التذاكر
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={isLoading}
          >
            تحديث
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={onReset}
            disabled={activeFiltersCount === 0}
          >
            مسح الفلاتر
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid component="div" size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="البحث في التذاكر"
            placeholder="ابحث في العنوان أو الوصف..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={filters.status || ''}
              label="الحالة"
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>جميع الحالات</em>
              </MenuItem>
              {Object.values(SupportStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>الأولوية</InputLabel>
            <Select
              value={filters.priority || ''}
              label="الأولوية"
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>جميع الأولويات</em>
              </MenuItem>
              {Object.values(SupportPriority).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {getPriorityLabel(priority)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>الفئة</InputLabel>
            <Select
              value={filters.category || ''}
              label="الفئة"
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>جميع الفئات</em>
              </MenuItem>
              {Object.values(SupportCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {getCategoryLabel(category)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            label="المسؤول"
            placeholder="معرف المسؤول..."
            value={filters.assignedTo || ''}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value || undefined)}
          />
        </Grid>
      </Grid>

      {activeFiltersCount > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            الفلاتر النشطة:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.search && (
              <Chip
                label={`البحث: ${filters.search}`}
                onDelete={() => clearFilter('search')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.status && (
              <Chip
                label={`الحالة: ${getStatusLabel(filters.status)}`}
                onDelete={() => clearFilter('status')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.priority && (
              <Chip
                label={`الأولوية: ${getPriorityLabel(filters.priority)}`}
                onDelete={() => clearFilter('priority')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.category && (
              <Chip
                label={`الفئة: ${getCategoryLabel(filters.category)}`}
                onDelete={() => clearFilter('category')}
                deleteIcon={<Clear />}
              />
            )}
            {filters.assignedTo && (
              <Chip
                label={`المسؤول: ${filters.assignedTo}`}
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
