import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Divider,
} from '@mui/material';
import { Save, ArrowBack, Navigation } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useCreateBanner, useUpdateBanner, useBanner } from '../hooks/useBanners';
import {
  BannerLocation,
  BannerPromotionType,
  BannerNavigationType,
  BANNER_NAVIGATION_TYPE_OPTIONS,
  USER_ROLE_OPTIONS,
} from '../types/banner.types';
import type { CreateBannerDto, UpdateBannerDto } from '../types/banner.types';
import { ImageField, MediaCategory } from '@/features/media';
import type { Media } from '@/features/media/types/media.types';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { productsApi } from '@/features/products/api/productsApi';

type BannerFormData = CreateBannerDto | UpdateBannerDto;

// Using the imported options from types

export const BannerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { t } = useTranslation('banners');

  // Location options with translations
  const locationOptions = [
    { value: BannerLocation.HOME_TOP },
    { value: BannerLocation.HOME_MIDDLE },
    { value: BannerLocation.HOME_BOTTOM },
    { value: BannerLocation.CATEGORY_TOP },
    { value: BannerLocation.PRODUCT_PAGE },
    { value: BannerLocation.CART_PAGE },
    { value: BannerLocation.CHECKOUT_PAGE },
    { value: BannerLocation.SIDEBAR },
    { value: BannerLocation.FOOTER },
  ];

  // Promotion type options with translations
  const promotionTypeOptions = [
    { value: BannerPromotionType.DISCOUNT },
    { value: BannerPromotionType.FREE_SHIPPING },
    { value: BannerPromotionType.NEW_ARRIVAL },
    { value: BannerPromotionType.SALE },
    { value: BannerPromotionType.SEASONAL },
    { value: BannerPromotionType.BRAND_PROMOTION },
  ];

  const { data: banner, isLoading: loadingBanner } = useBanner(id!, {
    enabled: isEditing,
  });

  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner();

  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [products, setProducts] = useState<Array<{ _id: string; name: string; nameEn?: string; sku?: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  // Get categories for navigation
  const { data: categories = [] } = useCategories({ isActive: true });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BannerFormData>({
    defaultValues: {
      title: '',
      description: '',
      imageId: '',
      linkUrl: '',
      altText: '',
      navigationType: BannerNavigationType.NONE,
      navigationTarget: '',
      navigationParams: {},
      location: BannerLocation.HOME_TOP,
      promotionType: BannerPromotionType.DISCOUNT,
      isActive: true,
      sortOrder: 0,
      startDate: '',
      endDate: '',
      displayDuration: 5000,
      targetAudiences: [],
      targetUserTypes: [],
      targetCategories: [],
      targetProducts: [],
    },
  });

  const watchedNavigationType = watch('navigationType');
  const watchedNavigationTarget = watch('navigationTarget');

  const mergeUniqueProducts = useCallback(
    (items: Array<{ _id: string; name: string; nameEn?: string; sku?: string }>) => {
      const map = new Map<string, { _id: string; name: string; nameEn?: string; sku?: string }>();
      items.forEach((item) => {
        if (item?._id) {
          map.set(item._id, item);
        }
      });
      return Array.from(map.values());
    },
    []
  );

  const loadProducts = useCallback(async (searchTerm = '') => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.list({
        page: 1,
        limit: 30,
        status: 'active' as any,
        search: searchTerm.trim() || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      const productsData = Array.isArray(response.data) ? response.data : [];
      const mappedProducts = productsData.map((p: any) => ({
        _id: p._id,
        name: p.name || p.nameAr || p.nameEn || p.sku || 'بدون اسم',
        nameEn: p.nameEn,
        sku: p.sku,
      }));
      setProducts((prev) => mergeUniqueProducts([...mappedProducts, ...prev]));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [mergeUniqueProducts]);

  // Load products with server-side search when navigation type is PRODUCT
  useEffect(() => {
    if (watchedNavigationType !== BannerNavigationType.PRODUCT) {
      setProducts([]);
      setProductSearch('');
      return;
    }

    const timer = setTimeout(() => {
      void loadProducts(productSearch);
    }, 350);

    return () => clearTimeout(timer);
  }, [watchedNavigationType, productSearch, loadProducts]);

  // Ensure selected product exists in options when editing
  useEffect(() => {
    const selectedId = watchedNavigationType === BannerNavigationType.PRODUCT ? watchedNavigationTarget : '';
    if (!selectedId || products.some((p) => p._id === selectedId)) {
      return;
    }

    const loadSelectedProduct = async () => {
      try {
        const product = await productsApi.getById(selectedId);
        if (!product?._id) return;

        setProducts((prev) =>
          mergeUniqueProducts([
            {
              _id: product._id,
              name: product.name || product.nameEn || product.sku || 'بدون اسم',
              nameEn: product.nameEn,
              sku: product.sku,
            },
            ...prev,
          ])
        );
      } catch (error) {
        console.error('Error loading selected product:', error);
      }
    };

    void loadSelectedProduct();
  }, [watchedNavigationType, watchedNavigationTarget, products, mergeUniqueProducts]);

  useEffect(() => {
    if (banner && isEditing) {
      // Handle imageId - could be a Media object (populated) or string (ID)
      const imageId = typeof banner.imageId === 'string' 
        ? banner.imageId 
        : banner.imageId?._id || '';
      
      // If imageId is a Media object, set it for display
      if (banner.imageId && typeof banner.imageId === 'object') {
        setSelectedImage(banner.imageId);
      }

      reset({
        title: banner.title,
        description: banner.description,
        imageId: imageId,
        linkUrl: banner.linkUrl,
        altText: banner.altText,
        navigationType: banner.navigationType || BannerNavigationType.NONE,
        navigationTarget: banner.navigationTarget || '',
        navigationParams: banner.navigationParams || {},
        location: banner.location,
        promotionType: banner.promotionType,
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
        displayDuration: banner.displayDuration,
        targetAudiences: banner.targetAudiences,
        targetUserTypes: banner.targetUserTypes || [],
        targetCategories: banner.targetCategories,
        targetProducts: banner.targetProducts,
      });
    }
  }, [banner, isEditing, reset]);

  const onSubmit = (data: BannerFormData) => {
    // Ensure imageId is set
    if (!data.imageId) {
      toast.error(t('form.imageUrl.required'));
      return;
    }

    // Prepare the data - only send imageId, not imageUrl
    const submitData = {
      ...data,
      imageId: data.imageId,
    };

    if (isEditing) {
      updateBanner(
        { id: id!, data: submitData },
        {
          onSuccess: () => {
            toast.success(t('messages.updated'));
            navigate('/banners');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || t('messages.updateError'));
          },
        }
      );
    } else {
      createBanner(submitData as CreateBannerDto, {
        onSuccess: () => {
          toast.success(t('messages.created'));
          navigate('/banners');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error?.message || t('messages.createError'));
        },
      });
    }
  };

  if (loadingBanner) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/banners')}
          variant="outlined"
        >
          {t('back')}
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? t('editBanner') : t('createBanner')}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('basicInfo')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.title.label')}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.location}>
                    <InputLabel>{t('form.location.label')}</InputLabel>
                    <Select {...field} label={t('form.location.label')}>
                      {locationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(`form.location.${option.value}`)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.location && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.location.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={3}
                    fullWidth
                    label={t('form.description.label')}
                  />
              )}
              />
            </Grid>

            {/* Image and Link */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('imageAndLink')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="imageId"
                control={control}
                rules={{
                  required: t('form.imageUrl.required'),
                }}
                render={({ fieldState: { error } }) => (
                  <Box
                    sx={{
                      bgcolor: watch('imageId') ? 'background.paper' : 'grey.50',
                      border: 1,
                      borderColor: error ? 'error.main' : 'divider',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <ImageField
                      label={t('form.imageUrl.label')}
                      value={selectedImage || undefined}
                      onChange={(media: Media | null) => {
                        setSelectedImage(media);
                        // استخراج ID من Media object
                        const mediaId = media?._id || '';
                        setValue('imageId', mediaId, { shouldValidate: true });
                      }}
                      category={MediaCategory.BANNER}
                      required
                      error={!!error}
                      helperText={error?.message || t('form.imageUrl.helper')}
                    />
                  </Box>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="linkUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.linkUrl.label')}
                    error={!!error}
                    helperText={error?.message || t('form.linkUrl.helper')}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="altText"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.altText.label')}
                    type="text"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            {/* Navigation Settings */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Navigation />
                <Typography variant="h6">
                  {t('navigation', 'إعدادات التنقل')}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="navigationType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('form.navigationType.label', 'نوع التنقل')}</InputLabel>
                    <Select {...field} label={t('form.navigationType.label', 'نوع التنقل')}>
                      {BANNER_NAVIGATION_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {watchedNavigationType && watchedNavigationType !== BannerNavigationType.NONE && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="navigationTarget"
                  control={control}
                  rules={{
                    required: t('form.navigationTarget.required', 'الهدف مطلوب'),
                  }}
                  render={({ field }) => {
                    if (watchedNavigationType === BannerNavigationType.CATEGORY) {
                      return (
                        <FormControl fullWidth error={!!errors.navigationTarget}>
                          <InputLabel>{t('form.navigationTarget.label', 'الفئة')}</InputLabel>
                          <Select {...field} label={t('form.navigationTarget.label', 'الفئة')}>
                            {categories.map((cat) => (
                              <MenuItem key={cat._id} value={cat._id}>
                                {cat.name} {cat.nameEn ? `(${cat.nameEn})` : ''}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.navigationTarget && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                              {errors.navigationTarget.message}
                            </Typography>
                          )}
                        </FormControl>
                      );
                    }
                    if (watchedNavigationType === BannerNavigationType.PRODUCT) {
                      return (
                        <Box>
                          <Autocomplete
                            options={products}
                            value={products.find((p) => p._id === field.value) || null}
                            onChange={(_, value) => field.onChange(value?._id || '')}
                            inputValue={productSearch}
                            onInputChange={(_, value) => setProductSearch(value)}
                            loading={loadingProducts}
                            filterOptions={(options) => options}
                            getOptionLabel={(option) => option.name || option.nameEn || option.sku || option._id}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            noOptionsText={t('form.navigationTarget.noProducts', 'لا توجد منتجات متاحة')}
                            loadingText={t('loading', 'جاري التحميل...')}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} key={option._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography variant="body2">{option.name || option._id}</Typography>
                                {(option.nameEn || option.sku) && (
                                  <Typography variant="caption" color="text.secondary">
                                    {[option.nameEn, option.sku].filter(Boolean).join(' - ')}
                                  </Typography>
                                )}
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={t('form.navigationTarget.label', 'المنتج')}
                                placeholder={t('form.navigationTarget.searchPlaceholder', 'ابحث عن منتج...')}
                                error={!!errors.navigationTarget}
                              />
                            )}
                          />
                          {errors.navigationTarget && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                              {errors.navigationTarget.message}
                            </Typography>
                          )}
                        </Box>
                      );
                    }
                    if (watchedNavigationType === BannerNavigationType.SECTION) {
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('form.navigationTarget.label', 'اسم القسم')}
                          placeholder="products, categories, cart, etc."
                          error={!!errors.navigationTarget}
                          helperText={errors.navigationTarget?.message || t('form.navigationTarget.helper', 'اسم القسم في التطبيق')}
                        />
                      );
                    }
                    // EXTERNAL_URL
                    return (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('form.navigationTarget.label', 'الرابط الخارجي')}
                        placeholder="https://example.com"
                        error={!!errors.navigationTarget}
                        helperText={errors.navigationTarget?.message || t('form.navigationTarget.helper', 'رابط خارجي')}
                      />
                    );
                  }}
                />
              </Grid>
            )}

            {/* Targeting Settings */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('targeting', 'استهداف المستخدمين')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="targetUserTypes"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={USER_ROLE_OPTIONS}
                    getOptionLabel={(option) => option.label}
                    value={USER_ROLE_OPTIONS.filter(opt => field.value?.includes(opt.value))}
                    onChange={(_, newValue) => {
                      field.onChange(newValue.map(v => v.value));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('form.targetUserTypes.label', 'أنواع المستخدمين المستهدفين')}
                        helperText={t('form.targetUserTypes.helper', 'اتركه فارغاً لعرض البانر للجميع')}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.value}
                          label={option.label}
                        />
                      ))
                    }
                  />
                )}
              />
            </Grid>

            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('settings')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="promotionType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('form.promotionType.label')}</InputLabel>
                    <Select
                      {...field}
                      label={t('form.promotionType.label')}
                      value={field.value || ''}
                    >
                      {promotionTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(`form.promotionType.${option.value}`)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.sortOrder.label')}
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="displayDuration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.displayDuration.label')}
                    type="number"
                    InputProps={{ inputProps: { min: 1000 } }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={watch('isActive')}
                      onChange={(e) => setValue('isActive', e.target.checked)}
                    />
                  }
                  label={t('form.isActive.label')}
                />
              </Box>
            </Grid>

            {/* Date Range */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('dateRange')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.startDate.label')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.endDate.label')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/banners')}
                  disabled={creating || updating}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={creating || updating ? <CircularProgress size={20} /> : <Save />}
                  disabled={creating || updating}
                >
                  {creating || updating ? t('saving') : t('save')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
