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
  Stack,
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
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

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
  title,
  collapsible = true,
  defaultExpanded = true,
  showSaveFilters = true,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
}) => {
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [newFilterName, setNewFilterName] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const filterTitle = title || t('filters.title');

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
                <em>{t('filters.all')}</em>
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
              <TextField {...params} label={filter.label} placeholder={t('filters.selectMultiple')} />
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
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <TextField
              size="small"
              type="date"
              label={t('filters.from')}
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
              label={t('filters.to')}
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
          </Stack>
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
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        {/* Header */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={isMobile ? 2 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            mb: 2,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterList fontSize={isMobile ? 'small' : 'medium'} />
            <Typography 
              variant="h6"
              sx={{ fontSize: isMobile ? '1.1rem' : undefined }}
            >
              {filterTitle}
            </Typography>
            {activeFilters.length > 0 && (
              <Chip 
                label={t('filters.activeFiltersCount', { count: activeFilters.length })} 
                size="small" 
                color="primary"
                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
              />
            )}
          </Stack>

          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={1}
            sx={{ 
              width: isMobile ? '100%' : 'auto',
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            {showSaveFilters && (
              <>
                <Button 
                  size={isMobile ? 'medium' : 'small'} 
                  startIcon={<Save />}
                  fullWidth={isMobile}
                  variant="outlined"
                >
                  {t('filters.saveFilters')}
                </Button>
                {savedFilters.length > 0 && (
                  <FormControl 
                    size={isMobile ? 'medium' : 'small'} 
                    sx={{ minWidth: isMobile ? '100%' : 150 }}
                    fullWidth={isMobile}
                  >
                    <InputLabel>{t('filters.savedFilters')}</InputLabel>
                    <Select
                      value=""
                      label={t('filters.savedFilters')}
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
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                size={isMobile ? 'medium' : 'small'}
                sx={{ alignSelf: isMobile ? 'flex-end' : 'auto' }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="body2" 
              gutterBottom
              sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
            >
              {t('filters.activeFiltersLabel')}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
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
                          ? t('filters.yes')
                          : t('filters.no')
                        : value
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange(filterKey, '')}
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
                  />
                );
              })}
              <Chip
                label={t('filters.clearAll')}
                size="small"
                onClick={handleResetFilters}
                color="error"
                variant="outlined"
                sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
              />
            </Stack>
          </Box>
        )}

        {/* Filters Content */}
        <Collapse in={expanded}>
          <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 2 : 3 }}>
            {filters.map((filter) => (
              <Grid 
                size={{ 
                  xs: 12, 
                  sm: isMobile ? 12 : 6, 
                  md: 4, 
                  lg: 3 
                }} 
                key={filter.key}
              >
                {renderFilter(filter)}
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: isMobile ? 1.5 : 2 }} />

          {/* Actions */}
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={isMobile ? 1.5 : 1}
            sx={{ 
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            <Button 
              variant="outlined" 
              startIcon={<Refresh />} 
              onClick={handleResetFilters}
              size={isMobile ? 'medium' : 'small'}
              fullWidth={isMobile}
            >
              {t('filters.reset')}
            </Button>

            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={1}
              sx={{ width: isMobile ? '100%' : 'auto' }}
            >
              <Button 
                variant="outlined" 
                onClick={() => onApply?.()}
                size={isMobile ? 'medium' : 'small'}
                fullWidth={isMobile}
              >
                {t('filters.apply')}
              </Button>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={activeFilters.length === 0}
                size={isMobile ? 'medium' : 'small'}
                fullWidth={isMobile}
              >
                {t('filters.search')}
              </Button>
            </Stack>
          </Stack>
        </Collapse>

        {/* Save Filter Dialog */}
        {showSaveFilters && (
          <Box 
            sx={{ 
              mt: isMobile ? 1.5 : 2, 
              p: isMobile ? 1.5 : 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1 
            }}
          >
            <Typography 
              variant="body2" 
              gutterBottom
              sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
            >
              {t('filters.saveFilterTitle')}
            </Typography>
            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={1}
              sx={{ width: '100%' }}
            >
              <TextField
                size={isMobile ? 'medium' : 'small'}
                placeholder={t('filters.filterName')}
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                sx={{ flex: 1 }}
                fullWidth={isMobile}
              />
              <Button
                size={isMobile ? 'medium' : 'small'}
                variant="outlined"
                startIcon={<BookmarkBorder />}
                onClick={handleSaveFilter}
                disabled={!newFilterName}
                fullWidth={isMobile}
              >
                {t('filters.save')}
              </Button>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
