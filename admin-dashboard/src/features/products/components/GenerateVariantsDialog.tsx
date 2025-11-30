import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Save,
  Cancel,
  SelectAll,
  Deselect,
  DeleteSweep,
  Warning,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useProductFormData } from '../hooks/useProductData';
import { attributesApi } from '@/features/attributes/api/attributesApi';
import type { AttributeValue } from '@/features/attributes/types/attribute.types';

interface AttributeWithValues {
  _id: string;
  name: string;
  nameEn: string;
  values: AttributeValue[];
}

interface VariantOption {
  id: string; // unique ID for this combination
  attributeValues: Array<{
    attributeId: string;
    attributeName: string;
    valueId: string;
    value: string;
  }>;
  selected: boolean;
  price: number;
  stock: number;
}

interface GenerateVariantsDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (variants: Array<{
    attributeValues: Array<{ attributeId: string; valueId: string }>;
    price: number;
    stock: number;
  }>, replaceExisting: boolean) => Promise<void>;
  selectedAttributeIds: string[];
  defaultPrice: number;
  defaultStock: number;
  isEditMode?: boolean;
  existingVariantsCount?: number;
}

export const GenerateVariantsDialog: React.FC<GenerateVariantsDialogProps> = ({
  open,
  onClose,
  onGenerate,
  selectedAttributeIds,
  defaultPrice,
  defaultStock,
  isEditMode = false,
  existingVariantsCount = 0,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const { attributes } = useProductFormData();
  const [loading, setLoading] = useState(false);
  const [attributesWithValues, setAttributesWithValues] = useState<AttributeWithValues[]>([]);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [useDefaultForAll, setUseDefaultForAll] = useState(true);
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Fetch attribute values when dialog opens
  useEffect(() => {
    if (open && selectedAttributeIds.length > 0) {
      fetchAttributeValues();
    } else {
      // Reset when dialog closes
      setAttributesWithValues([]);
      setVariantOptions([]);
      setSelectAll(true);
      setUseDefaultForAll(true);
      setReplaceExisting(false);
    }
  }, [open, selectedAttributeIds]);

  // Calculate variant combinations when attributes are loaded
  useEffect(() => {
    if (attributesWithValues.length > 0 && 
        selectedAttributeIds.length === attributesWithValues.length &&
        attributesWithValues.every(attr => attr.values.length > 0)) {
      calculateVariants();
    }
  }, [attributesWithValues, selectedAttributeIds]);

  const fetchAttributeValues = async () => {
    setLoading(true);
    try {
      const attributesData = (attributes || []).filter(attr => 
        selectedAttributeIds.includes(attr._id)
      );

      // Fetch values for each attribute
      const attributesWithValuesPromises = attributesData.map(async (attr) => {
        try {
          const values = await attributesApi.listValues(attr._id);
          
          return {
            _id: attr._id,
            name: attr.name,
            nameEn: attr.nameEn,
            values: values.filter((v: AttributeValue) => v.isActive),
          };
        } catch (error) {
          console.error(`Error fetching values for attribute ${attr._id}:`, error);
          return {
            _id: attr._id,
            name: attr.name,
            nameEn: attr.nameEn,
            values: [],
          };
        }
      });

      const results = await Promise.all(attributesWithValuesPromises);
      setAttributesWithValues(results);
    } catch (error) {
      console.error('Error fetching attribute values:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate all possible variant combinations (cartesian product)
  const calculateVariants = () => {
    if (attributesWithValues.length === 0) return;

    // Get all value arrays
    const valueArrays = attributesWithValues.map(attr => 
      attr.values.map(value => ({
        attributeId: attr._id,
        attributeName: attr.name,
        valueId: value._id,
        value: value.value || value.valueEn || '',
      }))
    );

    // Calculate cartesian product
    function cartesianProduct<T>(arrays: T[][]): T[][] {
      if (arrays.length === 0) return [[]];
      if (arrays.length === 1) return arrays[0].map(item => [item]);
      
      const [first, ...rest] = arrays;
      const restProduct = cartesianProduct(rest);
      
      const result: T[][] = [];
      for (const item of first) {
        for (const combination of restProduct) {
          result.push([item, ...combination]);
        }
      }
      return result;
    }

    const allCombinations = cartesianProduct(valueArrays);
    
    const variants: VariantOption[] = allCombinations.map((combination, index) => ({
      id: `variant-${index}`,
      attributeValues: combination,
      selected: true,
      price: defaultPrice,
      stock: defaultStock,
    }));

    setVariantOptions(variants);
    setSelectAll(true);
  };

  const handleToggleSelect = (variantId: string) => {
    setVariantOptions(prev =>
      prev.map(v => 
        v.id === variantId ? { ...v, selected: !v.selected } : v
      )
    );
  };

  const handleToggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setVariantOptions(prev =>
      prev.map(v => ({ ...v, selected: newSelectAll }))
    );
  };

  const handlePriceChange = (variantId: string, price: number) => {
    setVariantOptions(prev =>
      prev.map(v => 
        v.id === variantId ? { ...v, price } : v
      )
    );
  };

  const handleStockChange = (variantId: string, stock: number) => {
    setVariantOptions(prev =>
      prev.map(v => 
        v.id === variantId ? { ...v, stock } : v
      )
    );
  };

  const handleApplyDefaultToAll = () => {
    setVariantOptions(prev =>
      prev.map(v => ({
        ...v,
        price: defaultPrice,
        stock: defaultStock,
      }))
    );
  };

  const handleGenerate = async () => {
    const selectedVariants = variantOptions.filter(v => v.selected);
    
    if (selectedVariants.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const variantsToCreate = selectedVariants.map(v => ({
        attributeValues: v.attributeValues.map(av => ({
          attributeId: av.attributeId,
          valueId: av.valueId,
        })),
        price: v.price,
        stock: v.stock,
      }));

      await onGenerate(variantsToCreate, replaceExisting);
      onClose();
    } catch (error) {
      console.error('Error generating variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = useMemo(() => 
    variantOptions.filter(v => v.selected).length,
    [variantOptions]
  );
  const totalCount = variantOptions.length;

  // Update selectAll state when variants change
  useEffect(() => {
    if (variantOptions.length > 0) {
      const allSelected = variantOptions.every(v => v.selected);
      const noneSelected = variantOptions.every(v => !v.selected);
      if (allSelected) {
        setSelectAll(true);
      } else if (noneSelected) {
        setSelectAll(false);
      }
    }
  }, [variantOptions]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {t('products:form.generateVariants', 'توليد المتغيرات')}
          </Typography>
          {totalCount > 0 && (
            <Chip 
              label={`${selectedCount} / ${totalCount}`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading && attributesWithValues.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : variantOptions.length === 0 ? (
          <Alert severity="info">
            {t('products:form.noVariantsToGenerate', 'لا توجد متغيرات لتوليدها. تأكد من أن السمات المختارة تحتوي على قيم نشطة')}
          </Alert>
        ) : (
          <Box>
            {/* Replace Existing Warning */}
            {isEditMode && existingVariantsCount > 0 && (
              <Alert 
                severity={replaceExisting ? 'warning' : 'info'} 
                sx={{ mb: 2 }}
                icon={replaceExisting ? <Warning /> : undefined}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {replaceExisting 
                        ? t('products:form.replaceExistingWarning', '⚠️ سيتم حذف {{count}} متغير حالي واستبدالها بالمتغيرات الجديدة', {
                            count: existingVariantsCount,
                          })
                        : t('products:form.existingVariantsInfo', 'يوجد {{count}} متغير حالي. المتغيرات الجديدة ستُضاف إليها.', {
                            count: existingVariantsCount,
                          })
                      }
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={replaceExisting}
                        onChange={(e) => setReplaceExisting(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DeleteSweep fontSize="small" color={replaceExisting ? 'warning' : 'inherit'} />
                        <Typography variant="body2" color={replaceExisting ? 'warning.main' : 'inherit'}>
                          {t('products:form.replaceExisting', 'استبدال الحالية')}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Alert>
            )}

            {/* Controls */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
              <Button
                size="small"
                startIcon={selectAll ? <Deselect /> : <SelectAll />}
                onClick={handleToggleSelectAll}
                variant="outlined"
              >
                {selectAll 
                  ? t('products:form.deselectAll', 'إلغاء تحديد الكل')
                  : t('products:form.selectAll', 'تحديد الكل')
                }
              </Button>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={useDefaultForAll}
                    onChange={(e) => {
                      setUseDefaultForAll(e.target.checked);
                      if (e.target.checked) {
                        handleApplyDefaultToAll();
                      }
                    }}
                  />
                }
                label={t('products:form.useDefaultForAll', 'استخدام القيم الافتراضية للكل')}
              />
              
              {!useDefaultForAll && (
                <Button
                  size="small"
                  onClick={handleApplyDefaultToAll}
                  variant="outlined"
                >
                  {t('products:form.applyDefaults', 'تطبيق القيم الافتراضية')}
                </Button>
              )}
            </Stack>

            {/* Variants Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" width={50}>
                      <Checkbox
                        checked={selectAll && variantOptions.length > 0}
                        indeterminate={selectedCount > 0 && selectedCount < totalCount}
                        onChange={handleToggleSelectAll}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {t('products:variants.columns.attributes', 'السمات')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" width={150}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {t('products:variants.columns.price', 'السعر')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" width={150}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {t('products:variants.columns.stock', 'المخزون')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variantOptions.map((variant) => (
                    <TableRow
                      key={variant.id}
                      selected={variant.selected}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: variant.selected ? 'action.selected' : 'transparent',
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={variant.selected}
                          onChange={() => handleToggleSelect(variant.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {variant.attributeValues.map((av, idx) => (
                            <Chip
                              key={`${av.attributeId}-${av.valueId}-${idx}`}
                              label={`${av.attributeName}: ${av.value}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={variant.price}
                          onChange={(e) => handlePriceChange(variant.id, Number(e.target.value))}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 120 }}
                          disabled={!variant.selected}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={variant.stock}
                          onChange={(e) => handleStockChange(variant.id, Number(e.target.value))}
                          inputProps={{ min: 0 }}
                          sx={{ width: 120 }}
                          disabled={!variant.selected}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('products:form.variantsPreviewInfo', 'سيتم إنشاء {{count}} متغير من المتغيرات المحددة', {
                  count: selectedCount,
                })}
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          onClick={onClose}
          startIcon={<Cancel />}
          disabled={loading}
        >
          {t('common:actions.cancel', 'إلغاء')}
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          color={replaceExisting ? 'warning' : 'primary'}
          startIcon={loading ? <CircularProgress size={20} /> : replaceExisting ? <DeleteSweep /> : <Save />}
          disabled={loading || selectedCount === 0}
        >
          {replaceExisting 
            ? t('products:form.replaceAndGenerate', 'استبدال وتوليد ({{count}})', {
                count: selectedCount,
              })
            : t('products:form.generateSelected', 'توليد المحدد ({{count}})', {
                count: selectedCount,
              })
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

