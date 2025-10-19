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
  Chip,
  IconButton,
  Collapse,
  Divider,
  Grid,
  Autocomplete,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  FilterList,
  ExpandMore,
  ExpandLess,
  Search,
  Refresh,
  Save,
  BookmarkBorder,
} from '@mui/icons-material';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'slider' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: string | string[] | number | boolean | { start: string; end: string };
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  values: FilterValues;
  // eslint-disable-next-line no-unused-vars
  onChange: (values: FilterValues) => void;
  onApply?: () => void;
  onReset?: () => void;
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showSaveFilters?: boolean;
  savedFilters?: Array<{ id: string; name: string; values: FilterValues }>;
  // eslint-disable-next-line no-unused-vars
  onSaveFilter?: (name: string, values: FilterValues) => void;
  // eslint-disable-next-line no-unused-vars
  onLoadFilter?: (filter: { id: string; name: string; values: FilterValues }) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  values,
  onChange,
  onApply,
  onReset,
  title = 'الفلاتر المتقدمة',
  collapsible = true,
  defaultExpanded = true,
  showSaveFilters = true,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [newFilterName, setNewFilterName] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: string, value: any) => {
    const newValues = { ...values, [key]: value };
    onChange(newValues);

    // Track active filters
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      setActiveFilters((prev) => [...new Set([...prev, key])]);
    } else {
      setActiveFilters((prev) => prev.filter((f) => f !== key));
    }
  };

  const handleApplyFilters = () => {
    onApply?.();
  };

  const handleResetFilters = () => {
    const resetValues: FilterValues = {};
    filters.forEach((filter) => {
      switch (filter.type) {
        case 'multiselect':
          resetValues[filter.key] = [];
          break;
        case 'boolean':
          resetValues[filter.key] = false;
          break;
        default:
          resetValues[filter.key] = '';
      }
    });
    onChange(resetValues);
    setActiveFilters([]);
    onReset?.();
  };

  const handleSaveFilter = () => {
    if (newFilterName && onSaveFilter) {
      onSaveFilter(newFilterName, values);
      setNewFilterName('');
    }
  };

  const renderFilter = (filter: FilterOption) => {
    const currentValue = values[filter.key];

    switch (filter.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            label={filter.label}
            placeholder={filter.placeholder}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={currentValue || ''}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <MenuItem value="">
                <em>الكل</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <Autocomplete
            multiple
            size="small"
            options={filter.options || []}
            getOptionLabel={(option) => option.label}
            value={
              filter.options?.filter((opt) => (currentValue as string[])?.includes(opt.value)) || []
            }
            onChange={(_, newValue) => {
              handleFilterChange(
                filter.key,
                newValue.map((item) => item.value)
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label={filter.label} placeholder="اختر متعدد" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.value}
                  label={option.label}
                  size="small"
                />
              ))
            }
          />
        );

      case 'date':
        return (
          <TextField
            fullWidth
            size="small"
            type="date"
            label={filter.label}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'daterange':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              type="date"
              label="من"
              value={(currentValue as { start: string; end: string })?.start || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, {
                  ...(currentValue as { start: string; end: string }),
                  start: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="date"
              label="إلى"
              value={(currentValue as { start: string; end: string })?.end || ''}
              onChange={(e) =>
                handleFilterChange(filter.key, {
                  ...(currentValue as { start: string; end: string }),
                  end: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>
        );

      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={filter.label}
            placeholder={filter.placeholder}
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filter.key, Number(e.target.value))}
            inputProps={{ min: filter.min, max: filter.max }}
          />
        );

      case 'slider':
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              {filter.label}: {typeof currentValue === 'number' ? currentValue : filter.min}
            </Typography>
            <Slider
              value={(currentValue as number) || filter.min || 0}
              onChange={(_, value) => handleFilterChange(filter.key, value)}
              min={filter.min}
              max={filter.max}
              step={filter.step}
              marks={[
                { value: filter.min || 0, label: filter.min?.toString() },
                { value: filter.max || 100, label: filter.max?.toString() },
              ]}
            />
          </Box>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={(currentValue as boolean) || false}
                onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
              />
            }
            label={filter.label}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant="h6">{title}</Typography>
            {activeFilters.length > 0 && (
              <Chip label={`${activeFilters.length} فلتر نشط`} size="small" color="primary" />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {showSaveFilters && (
              <>
                <Button size="small" startIcon={<Save />}>
                  حفظ الفلاتر
                </Button>
                {savedFilters.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>الفلاتر المحفوظة</InputLabel>
                    <Select
                      value=""
                      label="الفلاتر المحفوظة"
                      onChange={(e) => {
                        const filter = savedFilters.find((f) => f.id === e.target.value);
                        if (filter && onLoadFilter) {
                          onLoadFilter(filter);
                          onChange(filter.values);
                        }
                      }}
                    >
                      {savedFilters.map((filter) => (
                        <MenuItem key={filter.id} value={filter.id}>
                          {filter.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}

            {collapsible && (
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              الفلاتر النشطة:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {activeFilters.map((filterKey) => {
                const filter = filters.find((f) => f.key === filterKey);
                const value = values[filterKey];

                return (
                  <Chip
                    key={filterKey}
                    label={`${filter?.label}: ${
                      Array.isArray(value)
                        ? value.join(', ')
                        : filter?.type === 'boolean'
                        ? value
                          ? 'نعم'
                          : 'لا'
                        : value
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange(filterKey, '')}
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
              <Chip
                label="مسح الكل"
                size="small"
                onClick={handleResetFilters}
                color="error"
                variant="outlined"
              />
            </Box>
          </Box>
        )}

        {/* Filters Content */}
        <Collapse in={expanded}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {filters.map((filter) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={filter.key}>
                {renderFilter(filter)}
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleResetFilters}>
              إعادة تعيين
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => onApply?.()}>
                تطبيق الفلاتر
              </Button>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={activeFilters.length === 0}
              >
                بحث
              </Button>
            </Box>
          </Box>
        </Collapse>

        {/* Save Filter Dialog */}
        {showSaveFilters && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              حفظ الفلاتر الحالية للاستخدام المستقبلي:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="اسم الفلتر"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<BookmarkBorder />}
                onClick={handleSaveFilter}
                disabled={!newFilterName}
              >
                حفظ
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
