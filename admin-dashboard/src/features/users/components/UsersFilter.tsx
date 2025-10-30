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

} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { UserRole, UserStatus } from '../types/user.types';
import { useTranslation } from 'react-i18next';

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

export const UsersFilter: React.FC<UsersFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const { t } = useTranslation(['users', 'common']);

  const STATUS_LABELS: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: t('users:status.active', 'نشط'),
    [UserStatus.SUSPENDED]: t('users:status.suspended', 'معلق'),
    [UserStatus.PENDING]: t('users:status.pending', 'قيد الانتظار'),
    [UserStatus.DELETED]: t('users:status.deleted', 'محذوف'),
  };

  const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.USER]: t('users:roles.user', 'مستخدم'),
    [UserRole.ADMIN]: t('users:roles.admin', 'مدير'),
    [UserRole.SUPER_ADMIN]: t('users:roles.super_admin', 'مدير عام'),
    [UserRole.MERCHANT]: t('users:roles.merchant', 'تاجر'),
    [UserRole.ENGINEER]: t('users:roles.engineer', 'مهندس'),
  };
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
            {t('users:filter.title', 'فلاتر البحث')}
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={t('users:filter.activeFilters', '{{count}} فلتر نشط', { count: getActiveFiltersCount() })}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {/* البحث */}
          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label={t('users:filter.searchLabel', 'البحث في المستخدمين')}
              placeholder={t('users:filter.searchPlaceholder', 'رقم الهاتف، الاسم...')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* الحالة */}
          <Grid component="div" size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('users:filter.status', 'الحالة')}</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                label={t('users:filter.status', 'الحالة')}
              >
                <MenuItem value="">{t('users:filter.allStatuses', 'جميع الحالات')}</MenuItem>
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <MenuItem key={status} value={status}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* الدور */}
          <Grid component="div" size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('users:filter.role', 'الدور')}</InputLabel>
              <Select
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                label={t('users:filter.role', 'الدور')}
              >
                <MenuItem value="">{t('users:filter.allRoles', 'جميع الأدوار')}</MenuItem>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <MenuItem key={role} value={role}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* نوع المستخدم */}
          <Grid component="div" size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('users:filter.userType', 'نوع المستخدم')}</InputLabel>
              <Select
                value={filters.isAdmin === undefined ? '' : filters.isAdmin ? 'admin' : 'user'}
                onChange={(e) => {
                  const value = e.target.value as '' | 'admin' | 'user';
                  if (value === '') {
                    handleFilterChange('isAdmin', undefined);
                  } else {
                    handleFilterChange('isAdmin', value === 'admin');
                  }
                }}
                label={t('users:filter.userType', 'نوع المستخدم')}
              >
                <MenuItem value="">{t('users:filter.allTypes', 'جميع الأنواع')}</MenuItem>
                <MenuItem value="admin">{t('users:filter.admins', 'مديرين')}</MenuItem>
                <MenuItem value="user">{t('users:filter.regularUsers', 'مستخدمين عاديين')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* الإجراءات */}
          <Grid component="div" size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                {t('users:filter.clearFilters', 'مسح الفلاتر')}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* الفلاتر النشطة */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('users:filter.activeFiltersLabel', 'الفلاتر النشطة:')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.search && (
                <Chip
                  label={t('users:filter.search', 'بحث:') + ` ${filters.search}`}
                  onDelete={() => handleFilterChange('search', '')}
                  size="small"
                />
              )}
              {filters.status && (
                <Chip
                  label={t('users:filter.statusLabel', 'حالة:') + ` ${STATUS_LABELS[filters.status]}`}
                  onDelete={() => handleFilterChange('status', undefined)}
                  size="small"
                />
              )}
              {filters.role && (
                <Chip
                  label={t('users:filter.roleLabel', 'دور:') + ` ${ROLE_LABELS[filters.role]}`}
                  onDelete={() => handleFilterChange('role', undefined)}
                  size="small"
                />
              )}
              {filters.isAdmin !== undefined && (
                <Chip
                  label={t('users:filter.typeLabel', 'نوع:') + ` ${filters.isAdmin ? t('users:filter.admins', 'مديرين') : t('users:filter.regularUsers', 'مستخدمين عاديين')}`}
                  onDelete={() => handleFilterChange('isAdmin', undefined)}
                  size="small"
                />
              )}
              {filters.includeDeleted && (
                <Chip
                  label={t('users:filter.includeDeleted', 'يشمل المستخدمين المحذوفين')}
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
