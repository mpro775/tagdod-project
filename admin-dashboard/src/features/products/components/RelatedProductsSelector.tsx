import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Paper,
  Stack,
} from '@mui/material';
import { Link as LinkIcon, Image as ImageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['products', 'common']);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mergeUniqueById = (items: Product[]) => {
    const map = new Map<string, Product>();
    items.forEach((item) => {
      if (item?._id) map.set(item._id, item);
    });
    return Array.from(map.values());
  };

  const fetchProducts = async (searchTerm = ''): Promise<Product[]> => {
    const response = await productsApi.list({
      page: 1,
      limit: 30,
      status: 'active' as any,
      search: searchTerm.trim() || undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });

    const data = Array.isArray(response.data) ? response.data : [];
    return currentProductId ? data.filter((p) => p._id !== currentProductId) : data;
  };

  const resolveSelectedProducts = async (ids: string[]): Promise<Product[]> => {
    if (!ids.length) return [];

    const known = mergeUniqueById([...products, ...selectedProducts]);
    const byId = new Map(known.map((p) => [p._id, p]));
    const missingIds = ids.filter((id) => !byId.has(id));

    if (missingIds.length > 0) {
      const results = await Promise.allSettled(missingIds.map((id) => productsApi.getById(id)));
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?._id) {
          byId.set(result.value._id, result.value);
        }
      });
    }

    return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  };

  // Initial load
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const loaded = await fetchProducts('');
        setProducts(loaded);
      } catch (err) {
        setError(t('products:messages.loadProductsFailed', 'فشل تحميل المنتجات'));
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  // Server-side search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const loaded = await fetchProducts(inputValue);
        setProducts((prev) => mergeUniqueById([...loaded, ...prev.filter((p) => value.includes(p._id))]));
      } catch (err) {
        setError(t('products:messages.loadProductsFailed', 'فشل تحميل المنتجات'));
        console.error('Error searching products:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue, value, t]);

  // Keep selected products synced with incoming IDs
  useEffect(() => {
    const run = async () => {
      if (!value || value.length === 0) {
        setSelectedProducts([]);
        return;
      }
      const resolved = await resolveSelectedProducts(value);
      setSelectedProducts(resolved);
    };
    void run();
  }, [value]);

  const options = useMemo(
    () => mergeUniqueById([...products, ...selectedProducts]),
    [products, selectedProducts],
  );

  const handleChange = (_: any, newValue: Product[]) => {
    setSelectedProducts(newValue);
    const productIds = newValue.map((p) => p._id);
    onChange(productIds);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LinkIcon color="primary" />
        <Typography variant="h6">
          {t('products:form.relatedProducts', 'المنتجات الشبيهة')}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('products:form.relatedProductsHelp', 'اختر المنتجات المشابهة التي تريد عرضها في صفحة تفاصيل هذا المنتج')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Autocomplete
        multiple
        id="related-products-selector"
        options={options}
        value={selectedProducts || []}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(_, value) => setInputValue(value)}
        loading={loading}
        getOptionLabel={(option: Product) => option ? `${option.name} (${option.nameEn})` : ''}
        isOptionEqualToValue={(option: Product, value: Product) => option?._id === value?._id}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('products:form.searchAndSelectProducts', 'ابحث واختر المنتجات')}
            placeholder={t('products:form.searchProduct', 'ابحث عن منتج...')}
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
        renderOption={(props, option: Product) => {
          const imageUrl = typeof option.mainImageId === 'object' 
            ? option.mainImageId?.url 
            : option.mainImage || undefined;
          
          return (
            <li {...props} key={option._id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={option.name}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    <ImageIcon sx={{ color: 'text.secondary' }} />
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {option.nameEn}
                  </Typography>
                  {option.category && (
                    <Chip 
                      label={typeof option.category === 'object' ? option.category.name : option.category} 
                      size="small" 
                      sx={{ mt: 0.5, height: 20 }}
                    />
                  )}
                </Box>
              </Box>
            </li>
          );
        }}
        noOptionsText={t('products:form.noProductsAvailable', 'لا توجد منتجات متاحة')}
        loadingText={t('common:common.loading', 'جاري التحميل...')}
        sx={{
          '& .MuiOutlinedInput-root': {
            minHeight: '56px',
          },
        }}
      />

      {selectedProducts.length > 0 && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
            {t('products:form.selectedProducts', 'المنتجات المحددة')} ({selectedProducts.length})
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
            {selectedProducts.map((product: Product) => {
              const imageUrl = typeof product.mainImageId === 'object' 
                ? product.mainImageId?.url 
                : product.mainImage || undefined;
              
              return (
                <Card
                  key={product._id}
                  sx={{
                    width: { xs: '100%', sm: 200 },
                    position: 'relative',
                  }}
                  variant="outlined"
                >
                  {imageUrl && (
                    <CardMedia
                      component="img"
                      height="100"
                      image={imageUrl}
                      alt={product.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {product.nameEn}
                    </Typography>
                  </CardContent>
                  <Chip
                    label={product.name}
                    size="small"
                    color="primary"
                    onDelete={() => {
                      const newProducts = selectedProducts.filter((p) => p._id !== product._id);
                      setSelectedProducts(newProducts);
                      onChange(newProducts.map((p) => p._id));
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                    }}
                  />
                </Card>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

