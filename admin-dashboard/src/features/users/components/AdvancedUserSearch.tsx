import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { UserRole, UserStatus } from '../types/user.types';
import { useTranslation } from 'react-i18next';

interface AdvancedSearchFilters {
  search: string;
  status?: UserStatus;
  role?: UserRole;
  isAdmin?: boolean;
  includeDeleted?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  capabilities?: {
    engineer?: boolean;
    merchant?: boolean;
    admin?: boolean;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedUserSearchProps {
  onSearch: (filters: AdvancedSearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  onSearch,
  onClear,
  loading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const ROLE_OPTIONS = [
    { value: UserRole.USER, label: t('users:roles.user', 'مستخدم') },
    { value: UserRole.ADMIN, label: t('users:roles.admin', 'مدير') },
    { value: UserRole.SUPER_ADMIN, label: t('users:roles.super_admin', 'مدير عام') },
    { value: UserRole.MERCHANT, label: t('users:roles.merchant', 'تاجر') },
    { value: UserRole.ENGINEER, label: t('users:roles.engineer', 'مهندس') },
  ];

  const STATUS_OPTIONS = [
    { value: UserStatus.ACTIVE, label: t('users:status.active', 'نشط') },
    { value: UserStatus.SUSPENDED, label: t('users:status.suspended', 'معلق') },
    { value: UserStatus.PENDING, label: t('users:status.pending', 'قيد الانتظار') },
    { value: UserStatus.DELETED, label: t('users:status.deleted', 'محذوف') },
  ];

  const SORT_OPTIONS = [
    { value: 'createdAt', label: t('users:search.sort.createdAt', 'تاريخ الإنشاء') },
    { value: 'firstName', label: t('users:search.sort.firstName', 'الاسم الأول') },
    { value: 'lastName', label: t('users:search.sort.lastName', 'الاسم الأخير') },
    { value: 'phone', label: t('users:search.sort.phone', 'رقم الهاتف') },
    { value: 'status', label: t('users:search.sort.status', 'الحالة') },
  ];

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    onClear();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.role) count++;
    if (filters.isAdmin !== undefined) count++;
    if (filters.includeDeleted) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (
      filters.capabilities?.engineer ||
      filters.capabilities?.merchant ||
      filters.capabilities?.admin
    )
      count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

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
            mb: 2,
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
              {t('users:search.advanced.title', 'البحث المتقدم')}
            </Typography>
          </Box>
          {activeFiltersCount > 0 && (
            <Chip
              label={t('users:search.advanced.activeFilters', '{{count}} فلتر نشط', {
                count: activeFiltersCount,
              })}
              size="small"
              color="primary"
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 24, sm: 28 },
              }}
            />
          )}
        </Box>

        {/* البحث الأساسي */}
        <Grid container spacing={{ xs: 2, sm: 2 }} sx={{ mb: 2 }}>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size={isMobile ? 'small' : 'medium'}
              label={t('users:search.basic.searchLabel', 'البحث في المستخدمين')}
              placeholder={t(
                'users:search.basic.searchPlaceholder',
                'رقم الهاتف، الاسم، المسمى الوظيفي...'
              )}
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
          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t('users:search.basic.sortBy', 'ترتيب حسب')}</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label={t('users:search.basic.sortBy', 'ترتيب حسب')}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>{t('users:search.basic.sortOrder', 'اتجاه الترتيب')}</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                label={t('users:search.basic.sortOrder', 'اتجاه الترتيب')}
              >
                <MenuItem value="asc">{t('users:search.basic.ascending', 'تصاعدي')}</MenuItem>
                <MenuItem value="desc">{t('users:search.basic.descending', 'تنازلي')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* البحث المتقدم */}
        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{
            bgcolor: 'background.paper',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              '& .MuiAccordionSummary-content': {
                my: 1,
              },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: 'text.primary',
              }}
            >
              {t('users:search.advanced.options', 'خيارات البحث المتقدمة')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={{ xs: 2, sm: 2 }}>
              {/* الحالة والدور */}
              <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>{t('users:filter.status', 'الحالة')}</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    label={t('users:filter.status', 'الحالة')}
                  >
                    <MenuItem value="">{t('users:filter.allStatuses', 'جميع الحالات')}</MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>{t('users:filter.role', 'الدور')}</InputLabel>
                  <Select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                    label={t('users:filter.role', 'الدور')}
                  >
                    <MenuItem value="">{t('users:filter.allRoles', 'جميع الأدوار')}</MenuItem>
                    {ROLE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>{t('users:filter.userType', 'نوع المستخدم')}</InputLabel>
                  <Select
                    value={
                      filters.isAdmin === undefined ? '' : filters.isAdmin ? 'admin' : 'user'
                    }
                    onChange={(e) => {
                      const value = e.target.value as '' | 'admin' | 'user';
                      handleFilterChange(
                        'isAdmin',
                        value === '' ? undefined : value === 'admin'
                      );
                    }}
                    label={t('users:filter.userType', 'نوع المستخدم')}
                  >
                    <MenuItem value="">{t('users:filter.allTypes', 'جميع الأنواع')}</MenuItem>
                    <MenuItem value="admin">{t('users:filter.admins', 'مديرين')}</MenuItem>
                    <MenuItem value="user">
                      {t('users:filter.regularUsers', 'مستخدمين عاديين')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* القدرات */}
              <Grid component="div" size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    color: 'text.primary',
                  }}
                >
                  {t('users:filter.capabilities', 'القدرات')}
                </Typography>
                <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.capabilities?.engineer || false}
                        onChange={(e) =>
                          handleFilterChange('capabilities', {
                            ...filters.capabilities,
                            engineer: e.target.checked,
                          })
                        }
                        size={isMobile ? 'small' : 'medium'}
                      />
                    }
                    label={t('users:capabilities.engineer', 'مهندس')}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      },
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.capabilities?.merchant || false}
                        onChange={(e) =>
                          handleFilterChange('capabilities', {
                            ...filters.capabilities,
                            merchant: e.target.checked,
                          })
                        }
                        size={isMobile ? 'small' : 'medium'}
                      />
                    }
                    label={t('users:capabilities.merchant', 'تاجر')}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      },
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.capabilities?.admin || false}
                        onChange={(e) =>
                          handleFilterChange('capabilities', {
                            ...filters.capabilities,
                            admin: e.target.checked,
                          })
                        }
                        size={isMobile ? 'small' : 'medium'}
                      />
                    }
                    label={t('users:roles.admin', 'مدير')}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* خيارات إضافية */}
              <Grid component="div" size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.includeDeleted || false}
                      onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  }
                  label={t('users:filter.includeDeleted', 'يشمل المستخدمين المحذوفين')}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* أزرار الإجراءات */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {loading
              ? t('users:search.searching', 'جاري البحث...')
              : t('common:actions.search', 'بحث')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('users:filter.clearFilters', 'مسح الفلاتر')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
