import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { productsApi } from '../api/productsApi';
import type { Product } from '../types/product.types';

interface RelatedProductsSelectorProps {
  value: string[];
  onChange: (productIds: string[]) => void;
  currentProductId?: string;
}

export const RelatedProductsSelector: React.FC<RelatedProductsSelectorProps> = ({
  value,
  onChange,
  currentProductId,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available products
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load selected products when value changes
  useEffect(() => {
    if (value && value.length > 0) {
      loadSelectedProducts();
    } else {
      setSelectedProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsApi.list({
        page: 1,
        limit: 100,
        status: 'active' as any,
      });
      
      // تحقق من أن response.data array
      const productsData = Array.isArray(response.data) ? response.data : [];
      
      // Filter out current product if in edit mode
      const filteredProducts = currentProductId
        ? productsData.filter((p: Product) => p._id !== currentProductId)
        : productsData;
      
      setProducts(filteredProducts || []);
    } catch (err) {
      setError('فشل تحميل المنتجات');
      console.error('Error loading products:', err);
      setProducts([]); // تعيين array فارغ عند الخطأ
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedProducts = async () => {
    try {
      const loadedProducts = (products || []).filter((p: Product) => value.includes(p._id));
      setSelectedProducts(loadedProducts || []);
    } catch (err) {
      console.error('Error loading selected products:', err);
      setSelectedProducts([]);
    }
  };

  const handleChange = (_: any, newValue: Product[]) => {
    setSelectedProducts(newValue);
    onChange(newValue.map((p) => p._id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LinkIcon color="primary" />
        <Typography variant="h6">
          المنتجات الشبيهة
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        اختر المنتجات المشابهة التي تريد عرضها في صفحة تفاصيل هذا المنتج
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Autocomplete
        multiple
        id="related-products-selector"
        options={products || []}
        value={selectedProducts || []}
        onChange={handleChange}
        loading={loading}
        getOptionLabel={(option: Product) => option ? `${option.name} (${option.nameEn})` : ''}
        isOptionEqualToValue={(option: Product, value: Product) => option?._id === value?._id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="ابحث واختر المنتجات"
            placeholder="ابحث عن منتج..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderTags={(value: Product[], getTagProps) =>
          value.map((option: Product, index: number) => (
            <Chip
              {...getTagProps({ index })}
              key={option._id}
              label={option.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))
        }
        renderOption={(props, option: Product) => (
          <li {...props} key={option._id}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" fontWeight="medium">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.nameEn} {option.category && `• ${option.category.name}`}
              </Typography>
            </Box>
          </li>
        )}
        noOptionsText="لا توجد منتجات متاحة"
        loadingText="جاري التحميل..."
        sx={{
          '& .MuiOutlinedInput-root': {
            minHeight: '56px',
          },
        }}
      />

      {selectedProducts.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            المنتجات المحددة ({selectedProducts.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedProducts.map((product: Product) => (
              <Chip
                key={product._id}
                label={product.name}
                size="small"
                color="success"
                variant="filled"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

