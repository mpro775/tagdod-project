import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  Stack,
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreatePriceRule } from '../hooks/useMarketing';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { productsApi } from '@/features/products/api/productsApi';
import toast from 'react-hot-toast';
import type { Category } from '@/features/categories/types/category.types';
import type { Product, Variant } from '@/features/products/types/product.types';
import type { Brand } from '@/features/brands/types/brand.types';

type DiscountType = 'percent' | 'fixed' | 'special' | null;

const CreatePriceRulePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('marketing');
  const { isMobile } = useBreakpoint();
  const createPriceRule = useCreatePriceRule();

  const [discountType, setDiscountType] = useState<DiscountType>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedGiftProduct, setSelectedGiftProduct] = useState<Product | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    active: true,
    priority: 1,
    startAt: '',
    endAt: '',
    conditions: {
      categoryId: '',
      productId: '',
      variantId: '',
      brandId: '',
      currency: 'USD',
      minQty: 1,
      accountType: '',
    },
    effects: {
      percentOff: undefined,
      amountOff: undefined,
      specialPrice: undefined,
      badge: '',
      giftSku: '',
    },
    usageLimits: {
      maxUses: 0,
      maxUsesPerUser: 0,
      currentUses: 0,
    },
    metadata: {
      title: '',
      description: '',
      termsAndConditions: '',
    },
    couponCode: '',
  });

  // Fetch categories, products, brands
  const { data: categories = [], isLoading: categoriesLoading } = useCategories({ isActive: true });
  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
    search: productSearchQuery || undefined,
    isActive: true,
  });
  const products = productsResponse?.data || [];
  const { data: brandsResponse, isLoading: brandsLoading } = useBrands({ isActive: true, limit: 100 });
  const brands = brandsResponse?.data || [];

  // Fetch variants when product is selected
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  React.useEffect(() => {
    if (selectedProduct?._id) {
      setVariantsLoading(true);
      productsApi.listVariants(selectedProduct._id)
        .then((data) => {
          setVariants(data);
          setVariantsLoading(false);
        })
        .catch(() => {
          setVariants([]);
          setVariantsLoading(false);
        });
    } else {
      setVariants([]);
    }
  }, [selectedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate discount type is selected
    if (!discountType) {
      toast.error('يرجى اختيار نوع الخصم');
      return;
    }

    // Clean up formData before submit - remove undefined values and ensure currency is USD
    const submitData = {
      ...formData,
      conditions: {
        ...formData.conditions,
        currency: 'USD',
        categoryId: formData.conditions.categoryId || undefined,
        productId: formData.conditions.productId || undefined,
        variantId: formData.conditions.variantId || undefined,
        brandId: formData.conditions.brandId || undefined,
      },
      effects: {
        percentOff: discountType === 'percent' ? formData.effects.percentOff : undefined,
        amountOff: discountType === 'fixed' ? formData.effects.amountOff : undefined,
        specialPrice: discountType === 'special' ? formData.effects.specialPrice : undefined,
        giftSku: formData.effects.giftSku || undefined,
      },
    };

    try {
      await createPriceRule.mutateAsync(submitData);
      navigate('/marketing/price-rules');
    } catch (error) {
      // Error is handled by the hook with toast notification
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, any>),
        [field]: value,
      },
    }));
  };

  const handleDiscountTypeChange = (type: DiscountType) => {
    setDiscountType(type);
    // Reset all discount values when changing type
    setFormData((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        percentOff: undefined,
        amountOff: undefined,
        specialPrice: undefined,
      },
    }));
  };

  const handleCategoryChange = (_event: any, value: Category | null) => {
    setSelectedCategory(value);
    handleNestedChange('conditions', 'categoryId', value?._id || '');
  };

  const handleProductChange = (_event: any, value: Product | null) => {
    setSelectedProduct(value);
    setSelectedVariant(null);
    handleNestedChange('conditions', 'productId', value?._id || '');
    handleNestedChange('conditions', 'variantId', '');
  };

  const handleVariantChange = (_event: any, value: Variant | null) => {
    setSelectedVariant(value);
    handleNestedChange('conditions', 'variantId', value?._id || '');
  };

  const handleBrandChange = (_event: any, value: Brand | null) => {
    setSelectedBrand(value);
    handleNestedChange('conditions', 'brandId', value?._id || '');
  };

  const handleGiftProductChange = (_event: any, value: Product | null) => {
    setSelectedGiftProduct(value);
    handleNestedChange('effects', 'giftSku', value?.sku || '');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/marketing/price-rules')}
          sx={{ mb: 2 }}
          size={isMobile ? 'small' : 'medium'}
        >
          {t('form.cancel')}
        </Button>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          {t('priceRules.createNew')}
        </Typography>
      </Box>

      {createPriceRule.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('messages.unknownError')}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.basicInfo')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.ruleTitle')}
                      value={formData.metadata.title}
                      onChange={(e) => handleNestedChange('metadata', 'title', e.target.value)}
                      required
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.priority')}
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                      required
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.startDate')}
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) => handleInputChange('startAt', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.endDate')}
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) => handleInputChange('endAt', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.ruleDescription')}
                      multiline
                      rows={3}
                      value={formData.metadata.description}
                      onChange={(e) =>
                        handleNestedChange('metadata', 'description', e.target.value)
                      }
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.active}
                          onChange={(e) => handleInputChange('active', e.target.checked)}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      }
                      label={t('form.active')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Conditions */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.conditions')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={categories}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      loading={categoriesLoading}
                      size={isMobile ? 'small' : 'medium'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.categoryId')}
                          placeholder="جميع الفئات (تطبق على الكل)"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="لا توجد فئات"
                      loadingText="جاري التحميل..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedProduct}
                      onChange={handleProductChange}
                      loading={productsLoading}
                      size={isMobile ? 'small' : 'medium'}
                      inputValue={productSearchQuery}
                      onInputChange={(_event, newInputValue) => {
                        setProductSearchQuery(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.productId')}
                          placeholder="جميع المنتجات (تطبق على الكل)"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="لا توجد منتجات"
                      loadingText="جاري التحميل..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={variants}
                      getOptionLabel={(option) => {
                        const attrs = option.attributeValues?.map((av: any) => av.value).join(', ') || '';
                        return `${selectedProduct?.name || ''} - ${attrs || option.sku || option._id}`;
                      }}
                      value={selectedVariant}
                      onChange={handleVariantChange}
                      loading={variantsLoading}
                      disabled={!selectedProduct}
                      size={isMobile ? 'small' : 'medium'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.variantId')}
                          placeholder={selectedProduct ? "جميع المتغيرات (تطبق على الكل)" : "اختر منتج أولاً"}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText={selectedProduct ? "لا توجد متغيرات" : "اختر منتج أولاً"}
                      loadingText="جاري التحميل..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={brands}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedBrand}
                      onChange={handleBrandChange}
                      loading={brandsLoading}
                      size={isMobile ? 'small' : 'medium'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.brandId')}
                          placeholder="جميع العلامات التجارية (تطبق على الكل)"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="لا توجد علامات تجارية"
                      loadingText="جاري التحميل..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.currency')}
                      value="USD"
                      disabled
                      size={isMobile ? 'small' : 'medium'}
                      helperText="العملة حالياً: دولار أمريكي (USD)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.minQty')}
                      type="number"
                      value={formData.conditions.minQty}
                      onChange={(e) =>
                        handleNestedChange('conditions', 'minQty', parseInt(e.target.value))
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Effects */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.effects')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">نوع الخصم</FormLabel>
                      <RadioGroup
                        row
                        value={discountType || ''}
                        onChange={(e) => handleDiscountTypeChange(e.target.value as DiscountType)}
                      >
                        <FormControlLabel value="percent" control={<Radio />} label="نسبة مئوية (%)" />
                        <FormControlLabel value="fixed" control={<Radio />} label="قيمة ثابتة ($)" />
                        <FormControlLabel value="special" control={<Radio />} label="سعر خاص ($)" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  {discountType === 'percent' && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="نسبة الخصم (%)"
                        type="number"
                        value={formData.effects.percentOff || ''}
                        onChange={(e) =>
                          handleNestedChange('effects', 'percentOff', parseFloat(e.target.value) || 0)
                        }
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          inputProps: { min: 0, max: 100, step: 0.01 }
                        }}
                        helperText="الخصم سيظهر تلقائياً كـ: خصم {النسبة}%"
                      />
                    </Grid>
                  )}
                  {discountType === 'fixed' && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="قيمة الخصم ($)"
                        type="number"
                        value={formData.effects.amountOff || ''}
                        onChange={(e) =>
                          handleNestedChange('effects', 'amountOff', parseFloat(e.target.value) || 0)
                        }
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 }
                        }}
                        helperText="الخصم سيظهر تلقائياً كـ: خصم {القيمة}$"
                      />
                    </Grid>
                  )}
                  {discountType === 'special' && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="السعر الخاص ($)"
                        type="number"
                        value={formData.effects.specialPrice || ''}
                        onChange={(e) =>
                          handleNestedChange('effects', 'specialPrice', parseFloat(e.target.value) || 0)
                        }
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 }
                        }}
                        helperText="سيظهر تلقائياً كـ: عرض خاص"
                      />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedGiftProduct}
                      onChange={handleGiftProductChange}
                      loading={productsLoading}
                      size={isMobile ? 'small' : 'medium'}
                      inputValue={productSearchQuery}
                      onInputChange={(_event, newInputValue) => {
                        setProductSearchQuery(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.giftSku')}
                          placeholder="اختر منتج كهدية (اختياري)"
                          helperText="SKU للمنتج الذي سيتم إعطاؤه كهدية مجاناً عند تطبيق الخصم"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="لا توجد منتجات"
                      loadingText="جاري التحميل..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Usage Limits */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.usageLimits')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.maxUses')}
                      type="number"
                      value={formData.usageLimits.maxUses}
                      onChange={(e) =>
                        handleNestedChange('usageLimits', 'maxUses', parseInt(e.target.value))
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('form.maxUsesPerUser')}
                      type="number"
                      value={formData.usageLimits.maxUsesPerUser}
                      onChange={(e) =>
                        handleNestedChange(
                          'usageLimits',
                          'maxUsesPerUser',
                          parseInt(e.target.value)
                        )
                      }
                      size={isMobile ? 'small' : 'medium'}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              sx={{ 
                justifyContent: 'flex-end',
                width: '100%'
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/marketing/price-rules')}
                fullWidth={isMobile}
                size={isMobile ? 'medium' : 'large'}
              >
                {t('dialogs.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={createPriceRule.isPending}
                fullWidth={isMobile}
                size={isMobile ? 'medium' : 'large'}
              >
                {createPriceRule.isPending ? t('dialogs.saving') : t('dialogs.save')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreatePriceRulePage;
