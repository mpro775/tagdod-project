import React, { useState, useMemo } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreatePriceRule, useUpdatePriceRule, usePriceRule } from '../hooks/useMarketing';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { productsApi } from '@/features/products/api/productsApi';
import toast from 'react-hot-toast';
import type { Category } from '@/features/categories/types/category.types';
import { ProductStatus } from '@/features/products/types/product.types';
import type { Product, Variant } from '@/features/products/types/product.types';
import type { Brand } from '@/features/brands/types/brand.types';

type DiscountType = 'percent' | 'fixed' | 'special' | null;

// خيار "الكل" للفئات والمنتجات والعلامات التجارية
const ALL_OPTION_CATEGORY: Category = {
  _id: '__ALL__',
  name: 'الكل (تطبق على الجميع)',
  nameEn: 'All',
  slug: '__all__',
  parentId: null,
  order: 0,
  isActive: true,
  isFeatured: false,
  productsCount: 0,
  childrenCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ALL_OPTION_PRODUCT: Product = {
  _id: '__ALL__',
  name: 'الكل (تطبق على الجميع)',
  nameEn: 'All',
  slug: '__all__',
  description: '',
  descriptionEn: '',
  categoryId: '',
  status: ProductStatus.ACTIVE,
  isActive: true,
  isFeatured: false,
  isNew: false,
  isBestseller: false,
  viewsCount: 0,
  salesCount: 0,
  variantsCount: 0,
  reviewsCount: 0,
  averageRating: 0,
  order: 0,
  attributes: [],
  imageIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ALL_OPTION_BRAND: Brand = {
  _id: '__ALL__',
  name: 'الكل (تطبق على الجميع)',
  nameEn: 'All',
  slug: '__all__',
  image: '',
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CreatePriceRulePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('marketing');
  const { isMobile } = useBreakpoint();
  const isEditMode = !!id;
  const createPriceRule = useCreatePriceRule();
  const updatePriceRule = useUpdatePriceRule();
  const { data: existingRule, isLoading: isLoadingRule } = usePriceRule(id || '');

  const [discountType, setDiscountType] = useState<DiscountType>(null);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([]);
  const [selectedGiftProduct, setSelectedGiftProduct] = useState<Product | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const [formData, setFormData] = useState<{
    active: boolean;
    priority: number;
    startAt: string;
    endAt: string;
    conditions: {
      categoryId: string | string[];
      productId: string | string[];
      variantId: string | string[];
      brandId: string | string[];
      currency: string;
      minQty: number;
      accountType: string;
    };
    effects: {
      percentOff: number | undefined;
      amountOff: number | undefined;
      specialPrice: number | undefined;
      badge: string;
      giftSku: string;
    };
    usageLimits: {
      maxUses: number;
      maxUsesPerUser: number;
      currentUses: number;
    };
    metadata: {
      title: string;
      description: string;
      termsAndConditions: string;
    };
    couponCode: string;
  }>({
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
  // تثبيت كائن الفلاتر باستخدام useMemo لتجنب حلقة التحديثات اللانهائية
  const categoriesQuery = useMemo(
    () => ({
      isActive: true,
    }),
    []
  );

  const { data: categories = [], isLoading: categoriesLoading } = useCategories(categoriesQuery);

  // تصفية المنتجات حسب الفئات المختارة
  // تثبيت كائن فلاتر المنتجات - هذا هو السبب الرئيسي للخطأ
  const productsQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      search: productSearchQuery || undefined,
      status: ProductStatus.ACTIVE,
      categoryId:
        selectedCategories.length > 0 && selectedCategories.length === 1
          ? selectedCategories[0]._id !== ALL_OPTION_CATEGORY._id
            ? selectedCategories[0]._id
            : undefined
          : undefined,
    }),
    [productSearchQuery, selectedCategories] // لا يُعاد إنشاؤه إلا إذا تغير البحث أو الفئات
  );

  const { data: productsResponse, isLoading: productsLoading } = useProducts(productsQuery);
  const products = productsResponse?.data || [];

  // تثبيت كائن فلاتر العلامات التجارية
  const brandsQuery = useMemo(
    () => ({
      isActive: true,
      limit: 100,
    }),
    []
  );

  const { data: brandsResponse, isLoading: brandsLoading } = useBrands(brandsQuery);
  const brands = brandsResponse?.data || [];

  // إضافة خيار "الكل" في بداية القوائم (غير مستخدم حالياً، لكن قد نحتاجه لاحقاً)
  // const categoriesWithAll = useMemo(() => [ALL_OPTION_CATEGORY, ...categories], [categories]);
  // const productsWithAll = useMemo(() => [ALL_OPTION_PRODUCT, ...products], [products]);
  // const brandsWithAll = useMemo(() => [ALL_OPTION_BRAND, ...brands], [brands]);

  // Fetch variants when products are selected
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  React.useEffect(() => {
    // جلب variants لجميع المنتجات المختارة
    const productIds = selectedProducts
      .filter((p) => p._id !== ALL_OPTION_PRODUCT._id)
      .map((p) => p._id);

    if (productIds.length > 0) {
      setVariantsLoading(true);
      Promise.all(productIds.map((id) => productsApi.listVariants(id)))
        .then((results) => {
          setVariants(results.flat());
          setVariantsLoading(false);
        })
        .catch(() => {
          setVariants([]);
          setVariantsLoading(false);
        });
    } else {
      setVariants([]);
      setVariantsLoading(false);
    }
  }, [selectedProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate discount type is selected
    if (!discountType) {
      toast.error('يرجى اختيار نوع الخصم');
      return;
    }

    // Clean up formData before submit - remove undefined values and ensure currency is USD
    const categoryIds = selectedCategories
      .filter((c) => c._id !== ALL_OPTION_CATEGORY._id)
      .map((c) => c._id);
    const productIds = selectedProducts
      .filter((p) => p._id !== ALL_OPTION_PRODUCT._id)
      .map((p) => p._id);
    const variantIds = selectedVariants.map((v) => v._id);
    const brandIds = selectedBrands
      .filter((b) => b._id !== ALL_OPTION_BRAND._id)
      .map((b) => b._id);

    const submitData = {
      ...formData,
      conditions: {
        ...formData.conditions,
        currency: 'USD',
        categoryId: categoryIds.length > 0 ? (categoryIds.length === 1 ? categoryIds[0] : categoryIds) : undefined,
        productId: productIds.length > 0 ? (productIds.length === 1 ? productIds[0] : productIds) : undefined,
        variantId: variantIds.length > 0 ? (variantIds.length === 1 ? variantIds[0] : variantIds) : undefined,
        brandId: brandIds.length > 0 ? (brandIds.length === 1 ? brandIds[0] : brandIds) : undefined,
      },
      effects: {
        percentOff: discountType === 'percent' ? formData.effects.percentOff : undefined,
        amountOff: discountType === 'fixed' ? formData.effects.amountOff : undefined,
        specialPrice: discountType === 'special' ? formData.effects.specialPrice : undefined,
        giftSku: formData.effects.giftSku || undefined,
      },
    };

    try {
      if (isEditMode && id) {
        await updatePriceRule.mutateAsync({ id, data: submitData });
      } else {
        await createPriceRule.mutateAsync(submitData);
      }
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

  const handleCategoriesChange = (_event: any, value: Category[]) => {
    // تحديث الفئات أولاً
    setSelectedCategories(value);
    
    const categoryIds = value
      .filter((c) => c._id !== ALL_OPTION_CATEGORY._id)
      .map((c) => c._id);
    
    handleNestedChange(
      'conditions',
      'categoryId',
      categoryIds.length > 0 ? (categoryIds.length === 1 ? categoryIds[0] : categoryIds) : ''
    );
    
    // إعادة تعيين المنتجات إذا تم إلغاء جميع الفئات أو اختيار "الكل"
    if (value.length === 0 || value.some(c => c._id === ALL_OPTION_CATEGORY._id)) {
      setSelectedProducts([]);
      setSelectedVariants([]);
    }
    // ملاحظة: تصفية المنتجات سيتم في useEffect منفصل لتجنب re-render متزامن
  };

  // useEffect لتصفية المنتجات عند تغيير الفئات
  React.useEffect(() => {
    if (selectedCategories.length > 0 && !selectedCategories.some(c => c._id === ALL_OPTION_CATEGORY._id)) {
      const categoryIds = selectedCategories
        .filter((c) => c._id !== ALL_OPTION_CATEGORY._id)
        .map((c) => c._id);
      const categoryIdsSet = new Set(categoryIds);
      
      setSelectedProducts((prevProducts) => {
        const filtered = prevProducts.filter((p) => {
          if (p._id === ALL_OPTION_PRODUCT._id) return false;
          const productCategoryId = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id;
          return categoryIdsSet.has(productCategoryId);
        });
        // فقط إذا تغيرت القائمة فعلياً
        if (filtered.length !== prevProducts.length) {
          return filtered;
        }
        return prevProducts;
      });
    }
  }, [selectedCategories]);

  const handleProductsChange = (_event: any, value: Product[]) => {
    setSelectedProducts(value);
    const productIds = value
      .filter((p) => p._id !== ALL_OPTION_PRODUCT._id)
      .map((p) => p._id);
    handleNestedChange(
      'conditions',
      'productId',
      productIds.length > 0 ? (productIds.length === 1 ? productIds[0] : productIds) : ''
    );
    
    // إعادة تعيين المتغيرات إذا تم تغيير المنتجات
    if (value.length === 0) {
      setSelectedVariants([]);
    }
  };

  const handleVariantsChange = (_event: any, value: Variant[]) => {
    setSelectedVariants(value);
    const variantIds = value.map((v) => v._id);
    handleNestedChange(
      'conditions',
      'variantId',
      variantIds.length > 0 ? (variantIds.length === 1 ? variantIds[0] : variantIds) : ''
    );
  };

  const handleBrandsChange = (_event: any, value: Brand[]) => {
    setSelectedBrands(value);
    const brandIds = value
      .filter((b) => b._id !== ALL_OPTION_BRAND._id)
      .map((b) => b._id);
    handleNestedChange(
      'conditions',
      'brandId',
      brandIds.length > 0 ? (brandIds.length === 1 ? brandIds[0] : brandIds) : ''
    );
  };

  const handleGiftProductChange = (_event: any, value: Product | null) => {
    setSelectedGiftProduct(value);
    handleNestedChange('effects', 'giftSku', value?.sku || '');
  };

  // Load existing rule data when editing
  React.useEffect(() => {
    if (isEditMode && existingRule) {
      // Determine discount type
      if (existingRule.effects?.percentOff) {
        setDiscountType('percent');
      } else if (existingRule.effects?.amountOff) {
        setDiscountType('fixed');
      } else if (existingRule.effects?.specialPrice) {
        setDiscountType('special');
      }

      // Set form data
      setFormData({
        active: existingRule.active ?? true,
        priority: existingRule.priority ?? 1,
        startAt: existingRule.startAt
          ? new Date(existingRule.startAt).toISOString().slice(0, 16)
          : '',
        endAt: existingRule.endAt
          ? new Date(existingRule.endAt).toISOString().slice(0, 16)
          : '',
        conditions: {
          categoryId: existingRule.conditions?.categoryId || '',
          productId: existingRule.conditions?.productId || '',
          variantId: existingRule.conditions?.variantId || '',
          brandId: existingRule.conditions?.brandId || '',
          currency: existingRule.conditions?.currency || 'USD',
          minQty: existingRule.conditions?.minQty || 1,
          accountType: existingRule.conditions?.accountType || '',
        },
        effects: {
          percentOff: existingRule.effects?.percentOff,
          amountOff: existingRule.effects?.amountOff,
          specialPrice: existingRule.effects?.specialPrice,
          badge: existingRule.effects?.badge || '',
          giftSku: existingRule.effects?.giftSku || '',
        },
        usageLimits: {
          maxUses: existingRule.usageLimits?.maxUses || 0,
          maxUsesPerUser: existingRule.usageLimits?.maxUsesPerUser || 0,
          currentUses: existingRule.usageLimits?.currentUses || 0,
        },
        metadata: {
          title: existingRule.metadata?.title || '',
          description: existingRule.metadata?.description || '',
          termsAndConditions: existingRule.metadata?.termsAndConditions || '',
        },
        couponCode: existingRule.couponCode || '',
      });

      // Set selected categories, products, brands if they exist
      if (existingRule.conditions?.categoryId) {
        const categoryIds = Array.isArray(existingRule.conditions.categoryId)
          ? existingRule.conditions.categoryId
          : [existingRule.conditions.categoryId];
        const foundCategories = categories.filter((c) => categoryIds.includes(c._id));
        setSelectedCategories(foundCategories);
      } else {
        setSelectedCategories([]);
      }

      if (existingRule.conditions?.productId) {
        const productIds = Array.isArray(existingRule.conditions.productId)
          ? existingRule.conditions.productId
          : [existingRule.conditions.productId];
        const foundProducts = products.filter((p) => productIds.includes(p._id));
        setSelectedProducts(foundProducts);
        
        // جلب variants للمنتجات المختارة
        if (foundProducts.length > 0) {
          const variantIds = Array.isArray(existingRule.conditions.variantId)
            ? existingRule.conditions.variantId
            : existingRule.conditions.variantId
            ? [existingRule.conditions.variantId]
            : [];
          
          Promise.all(foundProducts.map((p) => productsApi.listVariants(p._id)))
            .then((results) => {
              const allVariants = results.flat();
              if (variantIds.length > 0) {
                const foundVariants = allVariants.filter((v) => variantIds.includes(v._id));
                setSelectedVariants(foundVariants);
              } else {
                setSelectedVariants([]);
              }
            })
            .catch(() => {
              setSelectedVariants([]);
            });
        } else {
          setSelectedVariants([]);
        }
      } else {
        setSelectedProducts([]);
        setSelectedVariants([]);
      }

      if (existingRule.conditions?.brandId) {
        const brandIds = Array.isArray(existingRule.conditions.brandId)
          ? existingRule.conditions.brandId
          : [existingRule.conditions.brandId];
        const foundBrands = brands.filter((b) => brandIds.includes(b._id));
        setSelectedBrands(foundBrands);
      } else {
        setSelectedBrands([]);
      }

      if (existingRule.effects?.giftSku) {
        const giftProduct = products.find((p) => p.sku === existingRule.effects?.giftSku);
        if (giftProduct) {
          setSelectedGiftProduct(giftProduct);
        }
      }
    }
  }, [existingRule, isEditMode, categories, products, brands]);

  // Show loading state while fetching rule data
  if (isEditMode && isLoadingRule) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>{t('messages.loading') || 'جاري التحميل...'}</Typography>
      </Box>
    );
  }

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
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {isEditMode ? t('priceRules.edit') || 'تعديل قاعدة السعر' : t('priceRules.createNew')}
        </Typography>
      </Box>

      {(createPriceRule.isError || updatePriceRule.isError) && (
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
                        inputProps: { min: 1 },
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
                      multiple
                      options={categories}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedCategories}
                      onChange={handleCategoriesChange}
                      loading={categoriesLoading}
                      size={isMobile ? 'small' : 'medium'}
                      disableCloseOnSelect
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.categoryId')}
                          placeholder="اختر فئات (يمكن اختيار أكثر من فئة)"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="لا توجد فئات"
                      loadingText="جاري التحميل..."
                      renderOption={(props, option) => (
                        <li {...props} key={option._id}>
                          <strong>{option.name}</strong>
                        </li>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      multiple
                      options={products}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedProducts}
                      onChange={handleProductsChange}
                      loading={productsLoading}
                      size={isMobile ? 'small' : 'medium'}
                      inputValue={productSearchQuery}
                      onInputChange={(_event, newInputValue, reason) => {
                        if (reason === 'input' || reason === 'clear') {
                          setProductSearchQuery(newInputValue);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.productId')}
                          placeholder={
                            selectedCategories.length > 0
                              ? `منتجات من ${selectedCategories.length} فئة`
                              : 'اختر منتجات (يمكن اختيار أكثر من منتج)'
                          }
                          helperText={
                            selectedCategories.length > 0
                              ? `يتم عرض المنتجات من الفئات المختارة فقط`
                              : undefined
                          }
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="لا توجد منتجات"
                      loadingText="جاري التحميل..."
                      renderOption={(props, option) => (
                        <li {...props} key={option._id}>
                          <strong>{option.name}</strong>
                        </li>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      multiple
                      options={variants}
                      getOptionLabel={(option) => {
                        const attrs =
                          option.attributeValues?.map((av: any) => av.value).join(', ') || '';
                        return `${attrs || option.sku || option._id}`;
                      }}
                      value={selectedVariants}
                      onChange={handleVariantsChange}
                      loading={variantsLoading}
                      disabled={selectedProducts.length === 0}
                      size={isMobile ? 'small' : 'medium'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.variantId')}
                          placeholder={
                            selectedProducts.length > 0
                              ? `متغيرات من ${selectedProducts.length} منتج`
                              : 'اختر منتجات أولاً'
                          }
                          helperText={
                            selectedProducts.length > 0
                              ? `يتم عرض متغيرات المنتجات المختارة`
                              : undefined
                          }
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText={
                        selectedProducts.length > 0
                          ? 'لا توجد متغيرات'
                          : 'اختر منتجات أولاً'
                      }
                      loadingText="جاري التحميل..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      multiple
                      options={brands}
                      getOptionLabel={(option) => option.name || ''}
                      value={selectedBrands}
                      onChange={handleBrandsChange}
                      loading={brandsLoading}
                      size={isMobile ? 'small' : 'medium'}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('form.brandId')}
                          placeholder="اختر علامات تجارية (يمكن اختيار أكثر من علامة)"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      noOptionsText="لا توجد علامات تجارية"
                      loadingText="جاري التحميل..."
                      renderOption={(props, option) => (
                        <li {...props} key={option._id}>
                          <strong>{option.name}</strong>
                        </li>
                      )}
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
                        inputProps: { min: 1 },
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
                        <FormControlLabel
                          value="percent"
                          control={<Radio />}
                          label="نسبة مئوية (%)"
                        />
                        <FormControlLabel
                          value="fixed"
                          control={<Radio />}
                          label="قيمة ثابتة ($)"
                        />
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
                          handleNestedChange(
                            'effects',
                            'percentOff',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          inputProps: { min: 0, max: 100, step: 0.01 },
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
                          handleNestedChange(
                            'effects',
                            'amountOff',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 },
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
                          handleNestedChange(
                            'effects',
                            'specialPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size={isMobile ? 'small' : 'medium'}
                        InputProps={{
                          inputProps: { min: 0, step: 0.01 },
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
                      onInputChange={(_event, newInputValue, reason) => {
                        // تحديث البحث فقط عند الكتابة أو المسح، وليس عند اختيار عنصر
                        if (reason === 'input' || reason === 'clear') {
                          setProductSearchQuery(newInputValue);
                        }
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
                        inputProps: { min: 0 },
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
                        inputProps: { min: 0 },
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
                width: '100%',
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
                disabled={createPriceRule.isPending || updatePriceRule.isPending}
                fullWidth={isMobile}
                size={isMobile ? 'medium' : 'large'}
              >
                {(createPriceRule.isPending || updatePriceRule.isPending)
                  ? t('dialogs.saving')
                  : t('dialogs.save')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreatePriceRulePage;
