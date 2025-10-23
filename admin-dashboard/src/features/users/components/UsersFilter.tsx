import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { UserRole, UserStatus } from '../types/user.types';

interface UsersFilterProps {
  filters: {
    search: string;
    status?: UserStatus;
    role?: UserRole;
    isAdmin?: boolean;
    includeDeleted?: boolean;
  };
  onFiltersChange: (filters: {
    search: string;
    status?: UserStatus;
    role?: UserRole;
    isAdmin?: boolean;
    includeDeleted?: boolean;
  }) => void;
  onClearFilters: () => void;
}

const STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'نشط',
  [UserStatus.SUSPENDED]: 'معلق',
  [UserStatus.PENDING]: 'قيد الانتظار',
  [UserStatus.DELETED]: 'محذوف',
};

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: 'مستخدم',
  [UserRole.ADMIN]: 'مدير',
  [UserRole.SUPER_ADMIN]: 'مدير عام',
  [UserRole.MERCHANT]: 'تاجر',
  [UserRole.ENGINEER]: 'مهندس',
};

export const UsersFilter: React.FC<UsersFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.status ||
    filters.role ||
    filters.isAdmin !== undefined ||
    filters.includeDeleted;

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.role) count++;
    if (filters.isAdmin !== undefined) count++;
    if (filters.includeDeleted) count++;
    return count;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            فلاتر البحث
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={`${getActiveFiltersCount()} فلتر نشط`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {/* البحث */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="البحث في المستخدمين"
              placeholder="رقم الهاتف، الاسم..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* الحالة */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                label="الحالة"
              >
                <MenuItem value="">جميع الحالات</MenuItem>
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <MenuItem key={status} value={status}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* الدور */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>الدور</InputLabel>
              <Select
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                label="الدور"
              >
                <MenuItem value="">جميع الأدوار</MenuItem>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <MenuItem key={role} value={role}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* نوع المستخدم */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>نوع المستخدم</InputLabel>
              <Select
                value={filters.isAdmin === undefined ? '' : filters.isAdmin ? 'admin' : 'user'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleFilterChange('isAdmin', undefined);
                  } else {
                    handleFilterChange('isAdmin', value === 'admin');
                  }
                }}
                label="نوع المستخدم"
              >
                <MenuItem value="">جميع الأنواع</MenuItem>
                <MenuItem value="admin">مديرين</MenuItem>
                <MenuItem value="user">مستخدمين عاديين</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* الإجراءات */}
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                مسح الفلاتر
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* الفلاتر النشطة */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              الفلاتر النشطة:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.search && (
                <Chip
                  label={`بحث: ${filters.search}`}
                  onDelete={() => handleFilterChange('search', '')}
                  size="small"
                />
              )}
              {filters.status && (
                <Chip
                  label={`حالة: ${STATUS_LABELS[filters.status]}`}
                  onDelete={() => handleFilterChange('status', undefined)}
                  size="small"
                />
              )}
              {filters.role && (
                <Chip
                  label={`دور: ${ROLE_LABELS[filters.role]}`}
                  onDelete={() => handleFilterChange('role', undefined)}
                  size="small"
                />
              )}
              {filters.isAdmin !== undefined && (
                <Chip
                  label={`نوع: ${filters.isAdmin ? 'مديرين' : 'مستخدمين عاديين'}`}
                  onDelete={() => handleFilterChange('isAdmin', undefined)}
                  size="small"
                />
              )}
              {filters.includeDeleted && (
                <Chip
                  label="يشمل المحذوفين"
                  onDelete={() => handleFilterChange('includeDeleted', false)}
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
