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
  const { attributes, isLoading } = useProductFormData();

  if (isLoading) {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          السمات
        </Typography>
        <Typography variant="body2" color="text.secondary">
          جاري تحميل السمات...
        </Typography>
      </Box>
    );
  }

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="attributes-label">السمات</InputLabel>
      <Select
        labelId="attributes-label"
        multiple
        value={value}
        onChange={(e) => onChange(e.target.value as string[])}
        input={<OutlinedInput label="السمات" />}
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
              secondary={`نوع: ${getAttributeTypeLabel(attribute.type)}`}
            />
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

const getAttributeTypeLabel = (type: string) => {
  switch (type) {
    case 'text':
      return 'نص';
    case 'select':
      return 'قائمة منسدلة';
    case 'multiselect':
      return 'قائمة متعددة';
    case 'number':
      return 'رقم';
    case 'boolean':
      return 'نعم/لا';
    default:
      return type;
  }
};
