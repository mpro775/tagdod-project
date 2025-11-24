import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormHelperText,
  TextField,
  InputAdornment,
  Paper,
  Stack,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useProductFormData } from '../hooks/useProductData';

interface AttributeSelectorProps {
  value: string[];
  // eslint-disable-next-line no-unused-vars
  onChange: (attributes: string[]) => void;
  error?: boolean;
  helperText?: string;
}

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  value,
  onChange,
  error = false,
  helperText,
}) => {
  const { t } = useTranslation(['attributes', 'common']);
  const { attributes, isLoading } = useProductFormData();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter attributes based on search
  const filteredAttributes = React.useMemo(() => {
    if (!searchQuery) return attributes || [];
    const query = searchQuery.toLowerCase();
    return (attributes || []).filter(
      (attr) =>
        attr.name.toLowerCase().includes(query) ||
        attr.nameEn.toLowerCase().includes(query)
    );
  }, [attributes, searchQuery]);

  const getAttributeTypeLabel = (type: string): string => {
    switch (type) {
      case 'text':
        return t('attributes:typeLabels.text', 'نص');
      case 'select':
        return t('attributes:typeLabels.select', 'قائمة منسدلة');
      case 'multiselect':
        return t('attributes:typeLabels.multiselect', 'قائمة متعددة');
      case 'number':
        return t('attributes:typeLabels.number', 'رقم');
      case 'boolean':
        return t('attributes:typeLabels.boolean', 'نعم/لا');
      case 'color':
        return t('attributes:typeLabels.color', 'لون');
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('attributes:fields.name', 'السمات')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('common:common.loading', 'جارٍ التحميل...')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <FormControl fullWidth error={error}>
        <InputLabel id="attributes-label">{t('attributes:fields.name', 'السمات')}</InputLabel>
        <Select
          labelId="attributes-label"
          multiple
          value={value}
          onChange={(e) => onChange(e.target.value as string[])}
          input={<OutlinedInput label={t('attributes:fields.name', 'السمات')} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('attributes:fields.selectAttributes', 'اختر السمات')}
                </Typography>
              ) : (
                selected.map((attributeId) => {
                  const attribute = attributes?.find((attr) => attr._id === attributeId);
                  return (
                    <Chip
                      key={attributeId}
                      label={attribute?.name || attributeId}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  );
                })
              )}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 400 },
            },
          }}
        >
          {/* Search Field */}
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('attributes:fields.searchAttributes', 'ابحث عن السمات...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Box>

          {filteredAttributes.length === 0 ? (
            <MenuItem disabled>
              <ListItemText
                primary={t('attributes:fields.noAttributesFound', 'لا توجد سمات')}
              />
            </MenuItem>
          ) : (
            filteredAttributes.map((attribute) => (
              <MenuItem key={attribute._id} value={attribute._id}>
                <Checkbox checked={value.indexOf(attribute._id) > -1} />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {attribute.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({attribute.nameEn})
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Chip
                      label={getAttributeTypeLabel(attribute.type)}
                      size="small"
                      sx={{ mt: 0.5, height: 20 }}
                    />
                  }
                />
              </MenuItem>
            ))
          )}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {/* Selected Attributes Preview */}
      {value.length > 0 && (
        <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FilterList fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight="medium">
              {t('attributes:fields.selectedAttributes', 'السمات المحددة')} ({value.length})
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {value.map((attributeId) => {
              const attribute = attributes?.find((attr) => attr._id === attributeId);
              if (!attribute) return null;
              return (
                <Chip
                  key={attributeId}
                  label={`${attribute.name} (${attribute.nameEn})`}
                  size="small"
                  color="primary"
                  onDelete={() => onChange(value.filter((id) => id !== attributeId))}
                />
              );
            })}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};
