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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { UserRole, UserStatus } from '../types/user.types';
import { useTranslation } from 'react-i18next';

interface UsersFilterProps {
  filters: {
    search: string;
    status?: UserStatus;
    role?: UserRole;
    includeDeleted?: boolean;
  };
  onFiltersChange: (filters: {
    search: string;
    status?: UserStatus;
    role?: UserRole;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isExpanded, setIsExpanded] = React.useState(true);

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
    filters.includeDeleted;

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.role) count++;
    if (filters.includeDeleted) count++;
    return count;
  };

  return (
    <Card
      sx={{
        mb: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: isExpanded ? 2 : 0,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <FilterIcon
              sx={{
                mr: 1,
                color: 'primary.main',
                fontSize: { xs: 20, sm: 24 },
              }}
            />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: 'text.primary',
              }}
            >
              {t('users:filter.title', 'فلاتر البحث')}
            </Typography>
          </Box>
          {hasActiveFilters && (
            <Chip
              label={t('users:filter.activeFilters', '{{count}} فلتر نشط', {
                count: getActiveFiltersCount(),
              })}
              size="small"
              color="primary"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 24, sm: 28 },
              }}
            />
          )}
          <Button
            variant="text"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              minWidth: 'auto',
              px: 1,
              color: 'text.secondary',
            }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
        </Box>

        {isExpanded && (
          <>
            <Grid container spacing={{ xs: 2, sm: 2 }}>
          {/* البحث */}
          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size={isMobile ? 'small' : 'medium'}
              label={t('users:filter.searchLabel', 'البحث في المستخدمين')}
              placeholder={t('users:filter.searchPlaceholder', 'رقم الهاتف، الاسم...')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: 'text.secondary',
                      fontSize: { xs: 18, sm: 20 },
                    }}
                  />
                ),
              }}
            />
          </Grid>

          {/* الحالة */}
          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
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
          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
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

          {/* الإجراءات */}
          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                height: '100%',
                alignItems: isMobile ? 'stretch' : 'center',
              }}
            >
              <Button
                variant="outlined"
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                startIcon={<ClearIcon />}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                {t('users:filter.clearFilters', 'مسح الفلاتر')}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* الفلاتر النشطة */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {t('users:filter.activeFiltersLabel', 'الفلاتر النشطة:')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.search && (
                <Chip
                  label={
                    t('users:filter.search', 'بحث:') +
                    ` ${filters.search.length > 20 ? filters.search.substring(0, 20) + '...' : filters.search}`
                  }
                  onDelete={() => handleFilterChange('search', '')}
                  size="small"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    maxWidth: isMobile ? '100%' : 'auto',
                  }}
                />
              )}
              {filters.status && (
                <Chip
                  label={t('users:filter.statusLabel', 'حالة:') + ` ${STATUS_LABELS[filters.status]}`}
                  onDelete={() => handleFilterChange('status', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              )}
              {filters.role && (
                <Chip
                  label={t('users:filter.roleLabel', 'دور:') + ` ${ROLE_LABELS[filters.role]}`}
                  onDelete={() => handleFilterChange('role', undefined)}
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              )}
              {filters.includeDeleted && (
                <Chip
                  label={t('users:filter.includeDeleted', 'يشمل المستخدمين المحذوفين')}
                  onDelete={() => handleFilterChange('includeDeleted', false)}
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              )}
            </Box>
          </Box>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
