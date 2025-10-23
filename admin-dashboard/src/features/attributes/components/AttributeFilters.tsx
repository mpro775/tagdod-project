import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Box,
  Collapse,
  Chip,
  Stack,
} from '@mui/material';
import { Search, FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { AttributeType, ListAttributesParams } from '../types/attribute.types';

interface AttributeFiltersProps {
  onFiltersChange: (filters: ListAttributesParams) => void;
  onClearFilters: () => void;
  initialFilters?: ListAttributesParams;
}

const AttributeFilters: React.FC<AttributeFiltersProps> = ({
  onFiltersChange,
  onClearFilters,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<ListAttributesParams>({
    search: initialFilters.search || '',
    type: initialFilters.type || undefined,
    isActive: initialFilters.isActive,
    isFilterable: initialFilters.isFilterable,
    groupId: initialFilters.groupId || '',
    includeDeleted: initialFilters.includeDeleted || false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const handleFilterChange = (key: keyof ListAttributesParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Check if any filters are active
    const active = Object.entries(newFilters).some(([k, v]) => {
      if (k === 'includeDeleted') return v === true;
      return v !== '' && v !== undefined && v !== null;
    });
    setHasActiveFilters(active);

    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      type: undefined,
      isActive: undefined,
      isFilterable: undefined,
      groupId: '',
      includeDeleted: false,
    };
    setFilters(clearedFilters);
    setHasActiveFilters(false);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type) count++;
    if (filters.isActive !== undefined) count++;
    if (filters.isFilterable !== undefined) count++;
    if (filters.groupId) count++;
    if (filters.includeDeleted) count++;
    return count;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6">البحث والفلترة</Typography>
          {hasActiveFilters && (
            <Chip label={`${getActiveFiltersCount()} فلتر نشط`} color="primary" size="small" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outlined"
            size="small"
          >
            {showAdvanced ? 'إخفاء الفلاتر المتقدمة' : 'إظهار الفلاتر المتقدمة'}
          </Button>
          {hasActiveFilters && (
            <Button
              startIcon={<Clear />}
              onClick={handleClearFilters}
              variant="outlined"
              color="error"
              size="small"
            >
              مسح الفلاتر
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* البحث الأساسي */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="البحث في السمات..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            helperText="البحث في الاسم العربي أو الإنجليزي"
          />
        </Grid>

        {/* الفلاتر الأساسية */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>نوع السمة</InputLabel>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              label="نوع السمة"
            >
              <MenuItem value="">جميع الأنواع</MenuItem>
              <MenuItem value="select">اختيار واحد</MenuItem>
              <MenuItem value="multiselect">اختيار متعدد</MenuItem>
              <MenuItem value="text">نص</MenuItem>
              <MenuItem value="number">رقم</MenuItem>
              <MenuItem value="boolean">نعم/لا</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={filters.isActive === undefined ? '' : filters.isActive}
              onChange={(e) =>
                handleFilterChange(
                  'isActive',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
              label="الحالة"
            >
              <MenuItem value="">جميع الحالات</MenuItem>
              <MenuItem value="true">نشط</MenuItem>
              <MenuItem value="false">غير نشط</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* الفلاتر المتقدمة */}
        <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                الفلاتر المتقدمة
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>قابل للفلترة</InputLabel>
                    <Select
                      value={filters.isFilterable === undefined ? '' : filters.isFilterable}
                      onChange={(e) =>
                        handleFilterChange(
                          'isFilterable',
                          e.target.value === '' ? undefined : e.target.value === 'true'
                        )
                      }
                      label="قابل للفلترة"
                    >
                      <MenuItem value="">جميع الحالات</MenuItem>
                      <MenuItem value="true">قابل للفلترة</MenuItem>
                      <MenuItem value="false">غير قابل للفلترة</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="معرف المجموعة"
                    value={filters.groupId}
                    onChange={(e) => handleFilterChange('groupId', e.target.value)}
                    helperText="فلترة حسب مجموعة معينة"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>تضمين المحذوفة</InputLabel>
                    <Select
                      value={filters.includeDeleted ? 'true' : 'false'}
                      onChange={(e) =>
                        handleFilterChange('includeDeleted', e.target.value === 'true')
                      }
                      label="تضمين المحذوفة"
                    >
                      <MenuItem value="false">إخفاء المحذوفة</MenuItem>
                      <MenuItem value="true">تضمين المحذوفة</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Collapse>
      </Grid>

      {/* عرض الفلاتر النشطة */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            الفلاتر النشطة:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {filters.search && (
              <Chip
                label={`البحث: "${filters.search}"`}
                onDelete={() => handleFilterChange('search', '')}
                color="primary"
                size="small"
              />
            )}
            {filters.type && (
              <Chip
                label={`النوع: ${filters.type}`}
                onDelete={() => handleFilterChange('type', '')}
                color="secondary"
                size="small"
              />
            )}
            {filters.isActive !== undefined && (
              <Chip
                label={`الحالة: ${filters.isActive ? 'نشط' : 'غير نشط'}`}
                onDelete={() => handleFilterChange('isActive', undefined)}
                color="success"
                size="small"
              />
            )}
            {filters.isFilterable !== undefined && (
              <Chip
                label={`فلترة: ${filters.isFilterable ? 'قابل' : 'غير قابل'}`}
                onDelete={() => handleFilterChange('isFilterable', undefined)}
                color="info"
                size="small"
              />
            )}
            {filters.groupId && (
              <Chip
                label={`المجموعة: ${filters.groupId}`}
                onDelete={() => handleFilterChange('groupId', '')}
                color="warning"
                size="small"
              />
            )}
            {filters.includeDeleted && (
              <Chip
                label="تضمين المحذوفة"
                onDelete={() => handleFilterChange('includeDeleted', false)}
                color="error"
                size="small"
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default AttributeFilters;
