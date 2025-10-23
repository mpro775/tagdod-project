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
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Refresh,
  Download,
  DateRange,
  LocationOn,
  Person,
  Assignment,
} from '@mui/icons-material';

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
  const getFilterFields = () => {
    switch (type) {
      case 'request':
        return [
          {
            key: 'search',
            label: 'البحث',
            type: 'text',
            icon: <Search />,
            placeholder: 'البحث في الطلبات...',
          },
          {
            key: 'status',
            label: 'حالة الطلب',
            type: 'select',
            options: [
              { value: '', label: 'جميع الحالات' },
              { value: 'PENDING', label: 'معلق' },
              { value: 'IN_PROGRESS', label: 'قيد التنفيذ' },
              { value: 'COMPLETED', label: 'مكتمل' },
              { value: 'CANCELLED', label: 'ملغي' },
            ],
          },
          {
            key: 'type',
            label: 'نوع الخدمة',
            type: 'select',
            options: [
              { value: '', label: 'جميع الأنواع' },
              { value: 'INSTALLATION', label: 'تركيب' },
              { value: 'MAINTENANCE', label: 'صيانة' },
              { value: 'REPAIR', label: 'إصلاح' },
              { value: 'CONSULTATION', label: 'استشارة' },
            ],
          },
          {
            key: 'dateRange',
            label: 'الفترة الزمنية',
            type: 'select',
            options: [
              { value: '', label: 'جميع الفترات' },
              { value: 'today', label: 'اليوم' },
              { value: 'week', label: 'هذا الأسبوع' },
              { value: 'month', label: 'هذا الشهر' },
              { value: 'year', label: 'هذا العام' },
            ],
          },
        ];
      case 'engineer':
        return [
          {
            key: 'search',
            label: 'البحث',
            type: 'text',
            icon: <Search />,
            placeholder: 'البحث في المهندسين...',
          },
          {
            key: 'status',
            label: 'الحالة',
            type: 'select',
            options: [
              { value: '', label: 'جميع الحالات' },
              { value: 'active', label: 'نشط' },
              { value: 'inactive', label: 'غير نشط' },
            ],
          },
          {
            key: 'specialization',
            label: 'التخصص',
            type: 'select',
            options: [
              { value: '', label: 'جميع التخصصات' },
              { value: 'SOLAR', label: 'طاقة شمسية' },
              { value: 'ELECTRICAL', label: 'كهرباء' },
              { value: 'PLUMBING', label: 'سباكة' },
              { value: 'HVAC', label: 'تكييف' },
              { value: 'GENERAL', label: 'عام' },
            ],
          },
          {
            key: 'rating',
            label: 'التقييم',
            type: 'select',
            options: [
              { value: '', label: 'جميع التقييمات' },
              { value: '5', label: '5 نجوم' },
              { value: '4', label: '4 نجوم' },
              { value: '3', label: '3 نجوم' },
              { value: '2', label: '2 نجوم' },
              { value: '1', label: '1 نجمة' },
            ],
          },
        ];
      case 'offer':
        return [
          {
            key: 'search',
            label: 'البحث',
            type: 'text',
            icon: <Search />,
            placeholder: 'البحث في العروض...',
          },
          {
            key: 'status',
            label: 'حالة العرض',
            type: 'select',
            options: [
              { value: '', label: 'جميع الحالات' },
              { value: 'OFFERED', label: 'مُقدم' },
              { value: 'ACCEPTED', label: 'مقبول' },
              { value: 'REJECTED', label: 'مرفوض' },
              { value: 'CANCELLED', label: 'ملغي' },
            ],
          },
          {
            key: 'amountRange',
            label: 'نطاق المبلغ',
            type: 'select',
            options: [
              { value: '', label: 'جميع المبالغ' },
              { value: '0-1000', label: '0 - 1,000' },
              { value: '1000-5000', label: '1,000 - 5,000' },
              { value: '5000-10000', label: '5,000 - 10,000' },
              { value: '10000+', label: 'أكثر من 10,000' },
            ],
          },
          {
            key: 'dateRange',
            label: 'الفترة الزمنية',
            type: 'select',
            options: [
              { value: '', label: 'جميع الفترات' },
              { value: 'today', label: 'اليوم' },
              { value: 'week', label: 'هذا الأسبوع' },
              { value: 'month', label: 'هذا الشهر' },
              { value: 'year', label: 'هذا العام' },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const filterFields = getFilterFields();
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6">
              فلاتر البحث
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} فلتر نشط`}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {showRefresh && (
              <Tooltip title="تحديث">
                <IconButton size="small" onClick={onApplyFilters}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
            {showExport && (
              <Tooltip title="تصدير">
                <IconButton size="small">
                  <Download />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        <Grid container spacing={2} alignItems="center">
          {filterFields.map((field) => (
            <Grid key={field.key} size={{ xs: 12, sm: 6, md: 3 }}>
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
                />
              ) : (
                <FormControl fullWidth>
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
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<FilterList />}
                onClick={onApplyFilters}
                fullWidth
              >
                تطبيق الفلاتر
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={onClearFilters}
                  color="error"
                >
                  مسح الكل
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              الفلاتر النشطة:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                const field = filterFields.find(f => f.key === key);
                const option = field?.options?.find(o => o.value === value);
                return (
                  <Chip
                    key={key}
                    label={`${field?.label}: ${option?.label || value}`}
                    onDelete={() => onFilterChange(key, '')}
                    size="small"
                    color="primary"
                    variant="outlined"
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
