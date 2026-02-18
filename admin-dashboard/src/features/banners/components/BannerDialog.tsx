import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close, Save, Link as LinkIcon, Campaign, Navigation } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { 
  BannerLocation, 
  BannerPromotionType, 
  BannerNavigationType,
  BANNER_NAVIGATION_TYPE_OPTIONS,
  USER_ROLE_OPTIONS,
} from '../types/banner.types';
import type {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
} from '../types/banner.types';
import { ImageField, MediaCategory } from '@/features/media';
import type { Media } from '@/features/media/types/media.types';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { productsApi } from '@/features/products/api/productsApi';
import { Autocomplete, Chip } from '@mui/material';

interface BannerDialogProps {
  open: boolean;
  onClose: () => void;
  banner?: Banner;
  onSave: (data: CreateBannerDto | UpdateBannerDto) => void;
  isLoading?: boolean;
}

type BannerFormData = CreateBannerDto | UpdateBannerDto;

const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split('T')[0];
};

export const BannerDialog: React.FC<BannerDialogProps> = ({
  open,
  onClose,
  banner,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation('banners');
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const isEditing = !!banner;
  const title = isEditing ? t('editBanner') : t('createBanner');
  const titleId = `banner-dialog-title-${banner?._id || 'new'}`;
  const descriptionId = `banner-dialog-description-${banner?._id || 'new'}`;

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

  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [products, setProducts] = useState<Array<{ _id: string; name: string; nameEn?: string; sku?: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  // Get categories for navigation
  const { data: categories = [] } = useCategories({ isActive: true });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
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
      location: 'home_top' as any,
      promotionType: 'discount' as any,
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

  const watchedIsActive = watch('isActive');
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

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.list({
        page: 1,
        limit: 30,
        status: 'active' as any,
        search: productSearch.trim() || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      const productsData = Array.isArray(response.data) ? response.data : [];
      const mappedProducts = productsData.map((p: any) => ({
          _id: p._id, 
          name: p.name || p.nameEn || p.sku || 'بدون اسم',
          nameEn: p.nameEn,
          sku: p.sku,
        }));
      setProducts((prev) => mergeUniqueProducts([...mappedProducts, ...prev]));
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(t('messages.loadProductsFailed', 'فشل تحميل المنتجات'));
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [mergeUniqueProducts, productSearch, t]);

  useEffect(() => {
    if (watchedNavigationType !== BannerNavigationType.PRODUCT) {
      setProducts([]);
      setProductSearch('');
      return;
    }

    const timer = setTimeout(() => {
      void loadProducts();
    }, 350);

    return () => clearTimeout(timer);
  }, [watchedNavigationType, productSearch, loadProducts]);

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
      } else {
        setSelectedImage(null);
      }

      reset({
        title: banner.title,
        description: banner.description || '',
        imageId: imageId,
        linkUrl: banner.linkUrl || '',
        altText: banner.altText || '',
        navigationType: banner.navigationType || BannerNavigationType.NONE,
        navigationTarget: banner.navigationTarget || '',
        navigationParams: banner.navigationParams || {},
        location: banner.location,
        promotionType: banner.promotionType || ('discount' as BannerPromotionType),
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
        startDate: banner.startDate ? formatDate(banner.startDate) : '',
        endDate: banner.endDate ? formatDate(banner.endDate) : '',
        displayDuration: banner.displayDuration || 5000,
        targetAudiences: banner.targetAudiences || [],
        targetUserTypes: banner.targetUserTypes || [],
        targetCategories: banner.targetCategories || [],
        targetProducts: banner.targetProducts || [],
      });
    } else if (!isEditing) {
      setSelectedImage(null);
      reset({
        title: '',
        description: '',
        imageId: '',
        linkUrl: '',
        altText: '',
        navigationType: BannerNavigationType.NONE,
        navigationTarget: '',
        navigationParams: {},
        location: 'home_top' as any,
        promotionType: 'discount' as any,
        isActive: true,
        sortOrder: 0,
        startDate: '',
        endDate: '',
        displayDuration: 5000,
        targetAudiences: [],
        targetUserTypes: [],
        targetCategories: [],
        targetProducts: [],
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

    try {
      onSave(submitData);
    } catch (error) {
      toast.error(t('messages.error'));
    }
  };

  const handleClose = async () => {
    if (isDirty) {
      const confirmed = await confirmDialog({
        title: t('messages.unsavedChanges', 'تغييرات غير محفوظة'),
        message: 'هل تريد إلغاء التغييرات غير المحفوظة؟',
        type: 'warning',
      });
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle id={titleId}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Campaign />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers id={descriptionId}>
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
                rules={{ required: t('form.title.required') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.title.label')}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="location"
                control={control}
                rules={{ required: t('form.location.required') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.location}>
                    <InputLabel>{t('form.location.label')}</InputLabel>
                    <Select {...field} label={t('form.location.label')} disabled={isLoading}>
                      {locationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {t(`form.location.${option.value}`)}
                        </MenuItem>
                      ))}
                    </Select>
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
                    fullWidth
                    label={t('form.description.label')}
                    multiline
                    rows={3}
                    disabled={isLoading}
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
                rules={{
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: t('form.linkUrl.invalid'),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.linkUrl.label')}
                    error={!!errors.linkUrl}
                    helperText={errors.linkUrl?.message || t('form.linkUrl.helper')}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
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
                    helperText={t('form.altText.helper')}
                    disabled={isLoading}
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
                    <Select {...field} label={t('form.navigationType.label', 'نوع التنقل')} disabled={isLoading}>
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
                          <Select {...field} label={t('form.navigationTarget.label', 'الفئة')} disabled={isLoading}>
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
                            disabled={isLoading}
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
                          {!loadingProducts && products.length === 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                              {t('form.navigationTarget.noProductsHelper', 'لا توجد منتجات نشطة. يرجى التأكد من وجود منتجات نشطة أولاً.')}
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
                          disabled={isLoading}
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
                        disabled={isLoading}
                        InputProps={{
                          startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
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
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
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
                    <Select {...field} label={t('form.promotionType.label')} disabled={isLoading}>
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
                rules={{
                  min: { value: 0, message: t('form.sortOrder.min') },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.sortOrder.label')}
                    type="number"
                    error={!!errors.sortOrder}
                    helperText={errors.sortOrder?.message || t('form.sortOrder.helper')}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="displayDuration"
                control={control}
                rules={{
                  min: { value: 1000, message: t('form.displayDuration.min') },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('form.displayDuration.label')}
                    type="number"
                    error={!!errors.displayDuration}
                    helperText={
                      errors.displayDuration?.message || t('form.displayDuration.helper')
                    }
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      }
                      label={`${watchedIsActive ? t('stats.active') : t('stats.inactive')}`}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Date Range */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
          disabled={isLoading}
        >
          {isLoading ? t('saving') : t('save')}
        </Button>
      </DialogActions>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Dialog>
  );
};
