import React from 'react';
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
} from '@mui/material';
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
            {selected.map((attributeId) => {
              const attribute = attributes?.find((attr) => attr._id === attributeId);
              return (
                <Chip
                  key={attributeId}
                  label={attribute?.name || attributeId}
                  size="small"
                />
              );
            })}
          </Box>
        )}
      >
        {(Array.isArray(attributes) ? attributes : []).map((attribute) => (
          <MenuItem key={attribute._id} value={attribute._id}>
            <Checkbox checked={value.indexOf(attribute._id) > -1} />
            <ListItemText
              primary={`${attribute.name} (${attribute.nameEn})`}
              secondary={`${t('attributes:fields.type', 'النوع')}: ${getAttributeTypeLabel(attribute.type)}`}
            />
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
