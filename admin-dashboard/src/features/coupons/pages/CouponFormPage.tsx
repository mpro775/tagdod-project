import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import { Save, ArrowBack, Preview } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useCreateCoupon,
  useUpdateCoupon,
  useCoupon,
  useCreateEngineerCoupon,
} from '@/features/marketing/hooks/useMarketing';
import { useEngineers } from '@/features/services/hooks/useServices';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import type { CreateCouponDto, UpdateCouponDto } from '@/features/marketing/api/marketingApi';
import type { TFunction } from 'i18next';
import type { Product } from '@/features/products/types/product.types';
import type { Category } from '@/features/categories/types/category.types';
import type { Brand } from '@/features/brands/types/brand.types';

// Extended form data type that includes all fields needed for both create and update
type CouponFormData = Omit<CreateCouponDto, never> & Partial<UpdateCouponDto>;

const createCouponTypeOptions = (t: TFunction) => [
  { value: 'percentage', label: t('types.percentage') },
  { value: 'fixed_amount', label: t('types.fixed_amount') },
  { value: 'free_shipping', label: t('types.free_shipping') },
  { value: 'buy_x_get_y', label: t('types.buy_x_get_y') },
];

const createCouponStatusOptions = (t: TFunction) => [
  { value: 'active', label: t('status.active') },
  { value: 'inactive', label: t('status.inactive') },
];

const createVisibilityOptions = (t: TFunction) => [
  { value: 'public', label: t('visibility.public') },
  { value: 'private', label: t('visibility.private') },
  { value: 'hidden', label: t('visibility.hidden') },
];

const createAppliesToOptions = (t: TFunction) => [
  { value: 'all_products', label: t('appliesTo.all_products') },
  { value: 'specific_products', label: t('appliesTo.specific_products') },
  { value: 'specific_categories', label: t('appliesTo.specific_categories') },
  { value: 'specific_brands', label: t('appliesTo.specific_brands') },
  { value: 'minimum_order_amount', label: t('appliesTo.minimum_order_amount') },
];

// Helper function to generate random coupon code
const generateCouponCode = (prefix: string = 'COUPON', length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const CouponFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('coupons');
  const { isMobile } = useBreakpoint();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [showPreview, setShowPreview] = useState(false);

  const couponTypeOptions = createCouponTypeOptions(t);
  const couponStatusOptions = createCouponStatusOptions(t);
  const visibilityOptions = createVisibilityOptions(t);
  const appliesToOptions = createAppliesToOptions(t);

  const { data: coupon, isLoading: loadingCoupon } = useCoupon(id!);
  const { data: engineersData } = useEngineers({});
  const engineers = engineersData?.data || [];

  // Fetch products, categories, and brands for selection
  const [productSearch, setProductSearch] = useState('');
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
    search: productSearch,
  });
  const products = productsData?.data || [];

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({});
  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.data || [];

  const { data: brandsData, isLoading: brandsLoading } = useBrands({});
  const brands: Brand[] = brandsData?.data || [];

  const { mutate: createCoupon, isPending: creating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: updating } = useUpdateCoupon();
  const { mutate: createEngineerCoupon, isPending: creatingEngineer } = useCreateEngineerCoupon();

  const { control, handleSubmit, watch, reset } = useForm<CouponFormData>({
    defaultValues: {
      code: generateCouponCode(),
      name: '',
      description: '',
      type: 'percentage',
      status: 'active',
      visibility: 'public',
      discountValue: 0,
      minimumOrderAmount: 0,
      maximumDiscountAmount: 0,
      usageLimit: 0,
      usageLimitPerUser: 0,
      validFrom: '',
      validUntil: '',
      appliesTo: 'all_products',
      applicableProductIds: [],
      applicableCategoryIds: [],
      applicableBrandIds: [],
      applicableUserIds: [],
      excludedUserIds: [],
      buyXQuantity: undefined,
      getYQuantity: undefined,
      getYProductId: undefined,
      engineerId: undefined,
      commissionRate: undefined,
    },
  });

  const couponType = watch('type');
  const isEngineerCoupon = watch('engineerId');
  const appliesTo = watch('appliesTo');

  useEffect(() => {
    if (coupon && isEditing) {
      reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        status: coupon.status,
        visibility: coupon.visibility,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        usageLimit: coupon.usageLimit,
        usageLimitPerUser: coupon.usageLimitPerUser,
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
        validUntil: coupon.validUntil
          ? new Date(coupon.validUntil).toISOString().split('T')[0]
          : '',
        appliesTo: coupon.appliesTo,
        applicableProductIds: coupon.applicableProductIds,
        applicableCategoryIds: coupon.applicableCategoryIds,
        applicableBrandIds: coupon.applicableBrandIds,
        applicableUserIds: coupon.applicableUserIds,
        excludedUserIds: coupon.excludedUserIds,
        buyXQuantity: coupon.buyXQuantity,
        getYQuantity: coupon.getYQuantity,
        getYProductId: coupon.getYProductId,
        engineerId: coupon.engineerId,
        commissionRate: coupon.commissionRate,
      });
    }
  }, [coupon, isEditing, reset]);

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const onSubmit = (data: CouponFormData) => {
    // If it's an engineer coupon and we're creating (not editing), use createEngineerCoupon
    if (!isEditing && data.engineerId && data.commissionRate !== undefined) {
      const formData = data as CreateCouponDto;
      createEngineerCoupon(
        {
          engineerId: formData.engineerId!,
          code: formData.code!,
          name: formData.name!,
          description: formData.description,
          commissionRate: formData.commissionRate!,
          type: formData.type || 'percentage',
          discountValue: formData.discountValue,
          usageLimit: formData.usageLimit,
          usageLimitPerUser: formData.usageLimitPerUser,
          validFrom: formData.validFrom!,
          validUntil: formData.validUntil!,
          minimumOrderAmount: formData.minimumOrderAmount,
        },
        {
          onSuccess: () => {
            toast.success(t('messages.createSuccess'));
            navigate('/coupons');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || t('messages.createError'));
          },
        }
      );
      return;
    }

    if (isEditing) {
      // For update, exclude code, engineerId, and commissionRate as they're not in UpdateCouponDto
      const { code, engineerId, commissionRate, ...updateData } = data;
      updateCoupon(
        { id: id!, data: updateData as UpdateCouponDto },
        {
          onSuccess: () => {
            toast.success(t('messages.updateSuccess'));
            navigate('/coupons');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || t('messages.updateError'));
          },
        }
      );
    } else {
      // Ensure all required fields are present for create
      const createData: CreateCouponDto = {
        code: data.code!,
        name: data.name!,
        description: data.description,
        type: data.type || 'percentage',
        status: data.status || 'active',
        visibility: data.visibility || 'public',
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maximumDiscountAmount: data.maximumDiscountAmount,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,
        validFrom: data.validFrom!,
        validUntil: data.validUntil!,
        appliesTo: data.appliesTo || 'all_products',
        applicableProductIds: data.applicableProductIds,
        applicableCategoryIds: data.applicableCategoryIds,
        applicableBrandIds: data.applicableBrandIds,
        applicableUserIds: data.applicableUserIds,
        excludedUserIds: data.excludedUserIds,
        buyXQuantity: data.buyXQuantity,
        getYQuantity: data.getYQuantity,
        getYProductId: data.getYProductId,
        engineerId: data.engineerId,
        commissionRate: data.commissionRate,
      };
      createCoupon(createData, {
        onSuccess: () => {
          toast.success(t('messages.createSuccess'));
          navigate('/coupons');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error?.message || t('messages.createError'));
        },
      });
    }
  };

  if (loadingCoupon) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/coupons')}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
          >
            {t('buttons.back')}
          </Button>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            {isEditing ? t('buttons.edit') : t('buttons.create')}
          </Typography>
        </Box>
        <Button
          startIcon={<Preview />}
          onClick={handlePreviewToggle}
          variant="outlined"
          color="info"
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
        >
          {showPreview ? t('buttons.hidePreview') : t('buttons.preview')}
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {t('form.basicInformation')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="code"
                control={control}
                rules={{ required: t('validation.codeRequired') }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.code')}
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: t('validation.nameRequired') }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.name')}
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.description')}
                    multiline
                    rows={3}
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="type"
                control={control}
                rules={{ required: t('validation.typeRequired') }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error} size={isMobile ? 'small' : 'medium'}>
                    <InputLabel>{t('form.type')}</InputLabel>
                    <Select {...field} label={t('form.type')}>
                      {couponTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error} size={isMobile ? 'small' : 'medium'}>
                    <InputLabel>{t('form.status')}</InputLabel>
                    <Select {...field} label={t('form.status')}>
                      {couponStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="visibility"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error} size={isMobile ? 'small' : 'medium'}>
                    <InputLabel>{t('form.visibility')}</InputLabel>
                    <Select {...field} label={t('form.visibility')}>
                      {visibilityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Discount Configuration */}
            {(couponType === 'percentage' || couponType === 'fixed_amount') && (
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.discountSettings')}
                </Typography>
              </Grid>
            )}

            {couponType === 'percentage' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="discountValue"
                  control={control}
                  rules={{
                    required: t('validation.discountValueRequired'),
                    min: { value: 0, message: t('validation.discountValueMin') },
                    max: { value: 100, message: t('validation.discountValueMax') },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label={t('form.discountValue')}
                      type="number"
                      error={!!error}
                      helperText={error?.message}
                      fullWidth
                      size={isMobile ? 'small' : 'medium'}
                    />
                  )}
                />
              </Grid>
            )}

            {couponType === 'fixed_amount' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="discountValue"
                  control={control}
                  rules={{
                    required: t('validation.discountValueRequired'),
                    min: { value: 0, message: t('validation.discountValueMin') },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label={t('form.discountValue')}
                      type="number"
                      error={!!error}
                      helperText={error?.message}
                      fullWidth
                      size={isMobile ? 'small' : 'medium'}
                    />
                  )}
                />
              </Grid>
            )}

            {(couponType === 'percentage' || couponType === 'fixed_amount') && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="minimumOrderAmount"
                    control={control}
                    rules={{
                      min: { value: 0, message: t('validation.minimumOrderAmountMin') },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label={t('form.minimumOrderAmount')}
                        type="number"
                        error={!!error}
                        helperText={error?.message}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                      />
                    )}
                  />
                </Grid>

                {couponType === 'percentage' && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="maximumDiscountAmount"
                      control={control}
                      rules={{
                        min: { value: 0, message: t('validation.maximumDiscountAmountMin') },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={t('form.maximumDiscountAmount')}
                          type="number"
                          error={!!error}
                          helperText={error?.message}
                          fullWidth
                          size={isMobile ? 'small' : 'medium'}
                        />
                      )}
                    />
                  </Grid>
                )}
              </>
            )}

            {/* Buy X Get Y Configuration */}
            {couponType === 'buy_x_get_y' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {t('form.buyXGetYSettings')}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="buyXQuantity"
                    control={control}
                    rules={{
                      required: t('validation.buyXQuantityRequired'),
                      min: { value: 1, message: t('validation.buyXQuantityMin') },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label={t('form.buyXQuantity')}
                        type="number"
                        error={!!error}
                        helperText={error?.message}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="getYQuantity"
                    control={control}
                    rules={{
                      required: t('validation.getYQuantityRequired'),
                      min: { value: 1, message: t('validation.getYQuantityMin') },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label={t('form.getYQuantity')}
                        type="number"
                        error={!!error}
                        helperText={error?.message}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="getYProductId"
                    control={control}
                    rules={{
                      required: t('validation.getYProductIdRequired'),
                    }}
                    render={({ field, fieldState: { error } }) => {
                      const selectedProduct = products.find((p: Product) => p._id === field.value);

                      return (
                        <Autocomplete
                          options={products}
                          value={selectedProduct || null}
                          onChange={(_event, newValue) => {
                            field.onChange(newValue ? newValue._id : '');
                          }}
                          loading={productsLoading}
                          onInputChange={(_event, newInputValue) => {
                            setProductSearch(newInputValue);
                          }}
                          getOptionLabel={(option: Product) =>
                            `${option.name}${option.nameEn ? ` (${option.nameEn})` : ''}`
                          }
                          isOptionEqualToValue={(option: Product, value: Product) =>
                            option._id === value._id
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t('form.getYProductId')}
                              placeholder={t('form.searchProducts', 'ابحث واختر المنتج...')}
                              error={!!error}
                              helperText={error?.message}
                              size={isMobile ? 'small' : 'medium'}
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {productsLoading ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          renderOption={(props, option: Product) => (
                            <li {...props} key={option._id}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {option.name}
                                </Typography>
                                {option.nameEn && (
                                  <Typography variant="caption" color="text.secondary">
                                    {option.nameEn}
                                  </Typography>
                                )}
                              </Box>
                            </li>
                          )}
                          noOptionsText={t('form.noProductsFound', 'لا توجد منتجات')}
                          loadingText={t('form.loading', 'جاري التحميل...')}
                        />
                      );
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Usage Limits */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {t('form.usageLimits')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="usageLimit"
                control={control}
                rules={{
                  min: { value: 0, message: t('validation.usageLimitMin') },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.usageLimit')}
                    type="number"
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="usageLimitPerUser"
                control={control}
                rules={{
                  min: { value: 0, message: t('validation.usageLimitPerUserMin') },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.usageLimitPerUser')}
                    type="number"
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              />
            </Grid>

            {/* Validity Period */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {t('form.validityPeriod')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="validFrom"
                control={control}
                rules={{ required: t('validation.validFromRequired') }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.validFrom')}
                    type="date"
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="validUntil"
                control={control}
                rules={{
                  required: t('validation.validUntilRequired'),
                  validate: (value) => {
                    const validFrom = watch('validFrom');
                    if (validFrom && value && new Date(value) <= new Date(validFrom)) {
                      return t('validation.validUntilAfterFrom');
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.validUntil')}
                    type="date"
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              />
            </Grid>

            {/* Applicability */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {t('form.applicability')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="appliesTo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error} size={isMobile ? 'small' : 'medium'}>
                    <InputLabel>{t('form.appliesTo')}</InputLabel>
                    <Select {...field} label={t('form.appliesTo')}>
                      {appliesToOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Specific Products Selection */}
            {appliesTo === 'specific_products' && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="applicableProductIds"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || value.length === 0) {
                        return t('validation.applicableProductIdsRequired');
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => {
                    const selectedProducts = (field.value || [])
                      .map((id: string) => products.find((p: Product) => p._id === id))
                      .filter(Boolean) as Product[];

                    return (
                      <Autocomplete
                        multiple
                        options={products}
                        value={selectedProducts}
                        onChange={(_event, newValue) => {
                          field.onChange(newValue.map((p: Product) => p._id));
                        }}
                        loading={productsLoading}
                        onInputChange={(_event, newInputValue) => {
                          setProductSearch(newInputValue);
                        }}
                        getOptionLabel={(option: Product) =>
                          `${option.name}${option.nameEn ? ` (${option.nameEn})` : ''}`
                        }
                        isOptionEqualToValue={(option: Product, value: Product) =>
                          option._id === value._id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t('form.applicableProductIds', 'المنتجات المحددة')}
                            placeholder={t('form.searchProducts', 'ابحث واختر المنتجات...')}
                            error={!!error}
                            helperText={error?.message}
                            size={isMobile ? 'small' : 'medium'}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {productsLoading ? (
                                    <CircularProgress color="inherit" size={20} />
                                  ) : null}
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
                              {option.nameEn && (
                                <Typography variant="caption" color="text.secondary">
                                  {option.nameEn}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        )}
                        noOptionsText={t('form.noProductsFound', 'لا توجد منتجات')}
                        loadingText={t('form.loading', 'جاري التحميل...')}
                      />
                    );
                  }}
                />
              </Grid>
            )}

            {/* Specific Categories Selection */}
            {appliesTo === 'specific_categories' && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="applicableCategoryIds"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || value.length === 0) {
                        return t('validation.applicableCategoryIdsRequired');
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => {
                    const selectedCategories = (field.value || [])
                      .map((id: string) => categories.find((c: Category) => c._id === id))
                      .filter(Boolean) as Category[];

                    return (
                      <Autocomplete
                        multiple
                        options={categories}
                        value={selectedCategories}
                        onChange={(_event, newValue) => {
                          field.onChange(newValue.map((c: Category) => c._id));
                        }}
                        loading={categoriesLoading}
                        getOptionLabel={(option: Category) =>
                          `${option.name}${option.nameEn ? ` (${option.nameEn})` : ''}`
                        }
                        isOptionEqualToValue={(option: Category, value: Category) =>
                          option._id === value._id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t('form.applicableCategoryIds', 'الفئات المحددة')}
                            placeholder={t('form.searchCategories', 'ابحث واختر الفئات...')}
                            error={!!error}
                            helperText={error?.message}
                            size={isMobile ? 'small' : 'medium'}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {categoriesLoading ? (
                                    <CircularProgress color="inherit" size={20} />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderTags={(value: Category[], getTagProps) =>
                          value.map((option: Category, index: number) => (
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
                        renderOption={(props, option: Category) => (
                          <li {...props} key={option._id}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {option.name}
                              </Typography>
                              {option.nameEn && (
                                <Typography variant="caption" color="text.secondary">
                                  {option.nameEn}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        )}
                        noOptionsText={t('form.noCategoriesFound', 'لا توجد فئات')}
                        loadingText={t('form.loading', 'جاري التحميل...')}
                      />
                    );
                  }}
                />
              </Grid>
            )}

            {/* Specific Brands Selection */}
            {appliesTo === 'specific_brands' && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="applicableBrandIds"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || value.length === 0) {
                        return t('validation.applicableBrandIdsRequired');
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => {
                    const selectedBrands = (field.value || [])
                      .map((id: string) => brands.find((b: Brand) => b._id === id))
                      .filter(Boolean) as Brand[];

                    return (
                      <Autocomplete
                        multiple
                        options={brands}
                        value={selectedBrands}
                        onChange={(_event, newValue) => {
                          field.onChange(newValue.map((b: Brand) => b._id));
                        }}
                        loading={brandsLoading}
                        getOptionLabel={(option: Brand) =>
                          `${option.name}${option.nameEn ? ` (${option.nameEn})` : ''}`
                        }
                        isOptionEqualToValue={(option: Brand, value: Brand) =>
                          option._id === value._id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t('form.applicableBrandIds', 'العلامات التجارية المحددة')}
                            placeholder={t('form.searchBrands', 'ابحث واختر العلامات التجارية...')}
                            error={!!error}
                            helperText={error?.message}
                            size={isMobile ? 'small' : 'medium'}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {brandsLoading ? (
                                    <CircularProgress color="inherit" size={20} />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderTags={(value: Brand[], getTagProps) =>
                          value.map((option: Brand, index: number) => (
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
                        renderOption={(props, option: Brand) => (
                          <li {...props} key={option._id}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {option.name}
                              </Typography>
                              {option.nameEn && (
                                <Typography variant="caption" color="text.secondary">
                                  {option.nameEn}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        )}
                        noOptionsText={t('form.noBrandsFound', 'لا توجد علامات تجارية')}
                        loadingText={t('form.loading', 'جاري التحميل...')}
                      />
                    );
                  }}
                />
              </Grid>
            )}

            {/* Engineer Coupon Fields */}
            {!isEditing && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    {t('form.engineerCoupon', 'كوبون المهندس (اختياري)')}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="engineerId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error} size={isMobile ? 'small' : 'medium'}>
                        <InputLabel>{t('form.engineerId')}</InputLabel>
                        <Select {...field} label={t('form.engineerId')}>
                          <MenuItem value="">
                            <em>{t('form.none', 'لا يوجد')}</em>
                          </MenuItem>
                          {engineers.map((engineer: any) => (
                            <MenuItem key={engineer._id} value={engineer._id}>
                              {engineer.name || engineer.email || engineer._id}
                            </MenuItem>
                          ))}
                        </Select>
                        {error && <FormHelperText>{error.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>

                {isEngineerCoupon && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="commissionRate"
                      control={control}
                      rules={{
                        required: isEngineerCoupon ? t('validation.commissionRateRequired') : false,
                        min: {
                          value: 0,
                          message: t('validation.commissionRateMin'),
                        },
                        max: {
                          value: 100,
                          message: t('validation.commissionRateMax'),
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={t('form.commissionRate')}
                          type="number"
                          error={!!error}
                          helperText={error?.message}
                          fullWidth
                          size={isMobile ? 'small' : 'medium'}
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                        />
                      )}
                    />
                  </Grid>
                )}
              </>
            )}

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box
                display="flex"
                gap={2}
                justifyContent="flex-end"
                flexDirection={{ xs: 'column', sm: 'row' }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/coupons')}
                  disabled={creating || updating}
                  fullWidth={isMobile}
                  size={isMobile ? 'medium' : 'large'}
                >
                  {t('buttons.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    creating || updating || creatingEngineer ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Save />
                    )
                  }
                  disabled={creating || updating || creatingEngineer}
                  fullWidth={isMobile}
                  size={isMobile ? 'medium' : 'large'}
                >
                  {creating || updating || creatingEngineer
                    ? t('buttons.saving')
                    : t('buttons.save')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Coupon Preview */}
      {showPreview && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {t('form.preview')}
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.code')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {watch('code')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.name')}
                  </Typography>
                  <Typography variant="body1">{watch('name') || t('form.undefined')}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.description')}
                  </Typography>
                  <Typography variant="body2">{watch('description') || 'لا يوجد وصف'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.type')}
                  </Typography>
                  <Chip
                    label={couponTypeOptions.find((opt) => opt.value === watch('type'))?.label}
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.status')}
                  </Typography>
                  <Chip
                    label={couponStatusOptions.find((opt) => opt.value === watch('status'))?.label}
                    color={watch('status') === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.visibility')}
                  </Typography>
                  <Chip
                    label={
                      visibilityOptions.find((opt) => opt.value === watch('visibility'))?.label
                    }
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                {watch('type') === 'percentage' && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('form.discountValue')}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {watch('discountValue')}%
                    </Typography>
                  </Grid>
                )}
                {watch('type') === 'fixed_amount' && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('form.discountValue')}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${watch('discountValue')}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.validityPeriod')}
                  </Typography>
                  <Typography variant="body2">
                    {watch('validFrom') && watch('validUntil')
                      ? `${watch('validFrom')} - ${watch('validUntil')}`
                      : t('form.undefined')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Paper>
      )}
    </Box>
  );
};
