import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Grid,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar } from 'date-fns/locale';
import {
  AuditLogFilters,
  AuditAction,
  AuditResource,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
} from '../types/audit.types';

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: Partial<AuditLogFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  availableActions: AuditAction[];
  availableResources: AuditResource[];
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  availableActions,
  availableResources,
}) => {
  const { t } = useTranslation('audit');
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (field === 'startDate') {
      setStartDate(date);
      onFiltersChange({ startDate: date?.toISOString() });
    } else {
      setEndDate(date);
      onFiltersChange({ endDate: date?.toISOString() });
    }
  };

  const handleClearDate = (field: 'startDate' | 'endDate') => {
    if (field === 'startDate') {
      setStartDate(undefined);
      onFiltersChange({ startDate: undefined });
    } else {
      setEndDate(undefined);
      onFiltersChange({ endDate: undefined });
    }
  };

  return (
    <Card>
      <CardHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            {t('filters.title', { defaultValue: 'فلاتر السجلات' })}
          </Typography>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              size="small"
              onClick={onClearFilters}
              startIcon={<ClearIcon />}
            >
              {t('filters.clearFilters', { defaultValue: 'مسح الفلاتر' })}
            </Button>
          )}
        </Box>
      </CardHeader>
      <CardContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
        <Grid container spacing={3}>
          {/* User ID Filter */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextField
              fullWidth
              label="معرف المستخدم"
              placeholder="أدخل معرف المستخدم"
              value={filters.userId || ''}
              onChange={(e) => onFiltersChange({ userId: e.target.value || undefined })}
            />
          </Grid>

          {/* Performed By Filter */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextField
              fullWidth
              label="قام بالعملية"
              placeholder="أدخل معرف المستخدم"
              value={filters.performedBy || ''}
              onChange={(e) => onFiltersChange({ performedBy: e.target.value || undefined })}
            />
          </Grid>

          {/* Action Filter */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <FormControl fullWidth>
              <InputLabel>نوع العملية</InputLabel>
              <Select
                value={filters.action || ''}
                label="نوع العملية"
                onChange={(e) => onFiltersChange({ action: e.target.value as AuditAction || undefined })}
              >
                <MenuItem value="">جميع العمليات</MenuItem>
                {availableActions.map((action) => (
                  <MenuItem key={action} value={action}>
                    {AUDIT_ACTION_LABELS[action]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Resource Filter */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <FormControl fullWidth>
              <InputLabel>نوع المورد</InputLabel>
              <Select
                value={filters.resource || ''}
                label="نوع المورد"
                onChange={(e) => onFiltersChange({ resource: e.target.value as AuditResource || undefined })}
              >
                <MenuItem value="">جميع الموارد</MenuItem>
                {availableResources.map((resource) => (
                  <MenuItem key={resource} value={resource}>
                    {AUDIT_RESOURCE_LABELS[resource]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Resource ID Filter */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextField
              fullWidth
              label="معرف المورد"
              placeholder="أدخل معرف المورد"
              value={filters.resourceId || ''}
              onChange={(e) => onFiltersChange({ resourceId: e.target.value || undefined })}
            />
          </Grid>

          {/* Sensitive Filter */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.isSensitive || false}
                  onChange={(e) => onFiltersChange({ isSensitive: e.target.checked || undefined })}
                />
              }
              label="عرض العمليات الحساسة فقط"
            />
          </Grid>
        </Grid>

        {/* Date Range Filters */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Start Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="تاريخ البداية"
              value={startDate}
              onChange={(date) => handleDateChange('startDate', date || undefined)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: startDate && (
                    <Button
                      size="small"
                      onClick={() => handleClearDate('startDate')}
                      sx={{ mt: 1 }}
                    >
                      مسح التاريخ
                    </Button>
                  ),
                },
              }}
            />
          </Grid>

          {/* End Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <DatePicker
              label="تاريخ النهاية"
              value={endDate}
              onChange={(date) => handleDateChange('endDate', date || undefined)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: endDate && (
                    <Button
                      size="small"
                      onClick={() => handleClearDate('endDate')}
                      sx={{ mt: 1 }}
                    >
                      مسح التاريخ
                    </Button>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );
};
