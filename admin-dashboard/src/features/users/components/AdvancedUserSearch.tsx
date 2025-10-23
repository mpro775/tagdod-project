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
  DatePicker,
  Autocomplete,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { UserRole, UserStatus } from '../types/user.types';

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
    wholesale?: boolean;
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

const ROLE_OPTIONS = [
  { value: UserRole.USER, label: 'مستخدم' },
  { value: UserRole.ADMIN, label: 'مدير' },
  { value: UserRole.SUPER_ADMIN, label: 'مدير عام' },
  { value: UserRole.MERCHANT, label: 'تاجر' },
  { value: UserRole.ENGINEER, label: 'مهندس' },
];

const STATUS_OPTIONS = [
  { value: UserStatus.ACTIVE, label: 'نشط' },
  { value: UserStatus.SUSPENDED, label: 'معلق' },
  { value: UserStatus.PENDING, label: 'قيد الانتظار' },
  { value: UserStatus.DELETED, label: 'محذوف' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'تاريخ الإنشاء' },
  { value: 'firstName', label: 'الاسم الأول' },
  { value: 'lastName', label: 'الاسم الأخير' },
  { value: 'phone', label: 'رقم الهاتف' },
  { value: 'status', label: 'الحالة' },
];

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  onSearch,
  onClear,
  loading = false,
}) => {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({
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
    if (filters.capabilities?.engineer || filters.capabilities?.wholesale || filters.capabilities?.admin) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            البحث المتقدم
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} فلتر نشط`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        {/* البحث الأساسي */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="البحث في المستخدمين"
              placeholder="رقم الهاتف، الاسم، المسمى الوظيفي..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>ترتيب حسب</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="ترتيب حسب"
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>اتجاه الترتيب</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                label="اتجاه الترتيب"
              >
                <MenuItem value="asc">تصاعدي</MenuItem>
                <MenuItem value="desc">تنازلي</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* البحث المتقدم */}
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              خيارات البحث المتقدمة
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* الحالة والدور */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>الحالة</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    label="الحالة"
                  >
                    <MenuItem value="">جميع الحالات</MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>الدور</InputLabel>
                  <Select
                    value={filters.role || ''}
                    onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                    label="الدور"
                  >
                    <MenuItem value="">جميع الأدوار</MenuItem>
                    {ROLE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>نوع المستخدم</InputLabel>
                  <Select
                    value={filters.isAdmin === undefined ? '' : filters.isAdmin ? 'admin' : 'user'}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('isAdmin', value === '' ? undefined : value === 'admin');
                    }}
                    label="نوع المستخدم"
                  >
                    <MenuItem value="">جميع الأنواع</MenuItem>
                    <MenuItem value="admin">مديرين</MenuItem>
                    <MenuItem value="user">مستخدمين عاديين</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* القدرات */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  القدرات
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.capabilities?.engineer || false}
                        onChange={(e) => handleFilterChange('capabilities', {
                          ...filters.capabilities,
                          engineer: e.target.checked,
                        })}
                      />
                    }
                    label="مهندسين"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.capabilities?.wholesale || false}
                        onChange={(e) => handleFilterChange('capabilities', {
                          ...filters.capabilities,
                          wholesale: e.target.checked,
                        })}
                      />
                    }
                    label="تجار"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.capabilities?.admin || false}
                        onChange={(e) => handleFilterChange('capabilities', {
                          ...filters.capabilities,
                          admin: e.target.checked,
                        })}
                      />
                    }
                    label="مديرين"
                  />
                </Box>
              </Grid>

              {/* خيارات إضافية */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.includeDeleted || false}
                      onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
                    />
                  }
                  label="يشمل المستخدمين المحذوفين"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* أزرار الإجراءات */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={loading}
          >
            مسح الفلاتر
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
