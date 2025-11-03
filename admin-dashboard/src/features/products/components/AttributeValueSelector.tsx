import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormHelperText,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useProductFormData } from '../hooks/useProductData';
import type { VariantAttribute } from '../types/product.types';

interface AttributeValueSelectorProps {
  value: VariantAttribute[];
  // eslint-disable-next-line no-unused-vars
  onChange: (attributeValues: VariantAttribute[]) => void;
  error?: boolean;
  helperText?: string;
  productAttributes?: string[];
}

export const AttributeValueSelector: React.FC<AttributeValueSelectorProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  productAttributes = [],
}) => {
  const { t } = useTranslation(['attributes', 'common']);
  const { attributes, isLoading } = useProductFormData();

  if (isLoading) {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('attributes:valueDialog.editValue', 'قيم السمات')}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            {t('common:common.loading', 'جارٍ التحميل...')}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Filter attributes to only show those assigned to the product
  const availableAttributes = (Array.isArray(attributes) ? attributes : []).filter(
    (attr) => productAttributes.includes(attr._id)
  );

  const handleAttributeChange = (attributeId: string, valueId: string) => {
    const existingIndex = value.findIndex((item) => item.attributeId === attributeId);
    
    if (existingIndex >= 0) {
      // Update existing attribute value
      const newValues = [...value];
      newValues[existingIndex] = {
        attributeId,
        valueId,
        name: attributes?.find((attr) => attr._id === attributeId)?.name,
        value: attributes?.find((attr) => attr._id === attributeId)?.values.find((val) => val._id === valueId)?.value,
      };
      onChange(newValues);
    } else {
      // Add new attribute value
      const attribute = attributes?.find((attr) => attr._id === attributeId);
      const attributeValue = attribute?.values.find((val) => val._id === valueId);
      
      onChange([
        ...value,
        {
          attributeId,
          valueId,
          name: attribute?.name,
          value: attributeValue?.value,
        },
      ]);
    }
  };

  const getCurrentValue = (attributeId: string) => {
    const current = value.find((item) => item.attributeId === attributeId);
    return current?.valueId || '';
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t('attributes:valueDialog.editValue', 'قيم السمات')}
      </Typography>
      
      {availableAttributes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('attributes:attributes.noAttributesAssigned', 'لا توجد سمات محددة لهذا المنتج')}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {availableAttributes.map((attribute) => (
            <FormControl key={attribute._id} fullWidth error={error}>
              <InputLabel id={`attribute-${attribute._id}-label`}>
                {attribute.name}
              </InputLabel>
              <Select
                labelId={`attribute-${attribute._id}-label`}
                value={getCurrentValue(attribute._id)}
                onChange={(e) => handleAttributeChange(attribute._id, e.target.value)}
                input={<OutlinedInput label={attribute.name} />}
                renderValue={(selected) => {
                  if (!selected) return '';
                  const selectedValue = attribute.values.find((val) => val._id === selected);
                  return selectedValue?.value || selected;
                }}
              >
                {attribute.values
                  .filter((val) => val.isActive)
                  .map((attributeValue) => (
                    <MenuItem key={attributeValue._id} value={attributeValue._id}>
                      {attributeValue.value}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      )}
      
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </Box>
  );
};
