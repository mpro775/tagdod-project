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
} from '@mui/material';
import { Save, ArrowBack, Preview } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  useCreateCoupon,
  useUpdateCoupon,
  useCoupon,
} from '@/features/marketing/hooks/useMarketing';
import type { CreateCouponDto, UpdateCouponDto } from '@/features/marketing/api/marketingApi';
import type { TFunction } from 'i18next';


type CouponFormData = CreateCouponDto | UpdateCouponDto;

const createCouponTypeOptions = (t: TFunction) => [
  { value: 'percentage', label: t('types.percentage', { defaultValue: 'نسبة الخصم' }) },
  { value: 'fixed_amount', label: t('types.fixed_amount', { defaultValue: 'مبلغ الخصم' }) },
  { value: 'free_shipping', label: t('types.free_shipping', { defaultValue: 'شحن مجاني' }) },
  { value: 'buy_x_get_y', label: t('types.buy_x_get_y', { defaultValue: 'شراء X والحصول على Y' }) },
];

const createCouponStatusOptions = (t: TFunction) => [
  { value: 'active', label: t('status.active', { defaultValue: 'نشط' }) },
  { value: 'inactive', label: t('status.inactive', { defaultValue: 'غير نشط' }) },
];

const createVisibilityOptions = (t: TFunction) => [
  { value: 'public', label: t('visibility.public', { defaultValue: 'عام' }) },
  { value: 'private', label: t('visibility.private', { defaultValue: 'خاص' }) },
  { value: 'hidden', label: t('visibility.hidden', { defaultValue: 'مخفي' }) },
];

const createAppliesToOptions = (t: TFunction) => [
  { value: 'all_products', label: t('appliesTo.all_products', { defaultValue: 'جميع المنتجات' }) },
  { value: 'specific_products', label: t('appliesTo.specific_products', { defaultValue: 'منتجات محددة' }) },
  { value: 'specific_categories', label: t('appliesTo.specific_categories', { defaultValue: 'فئات محددة' }) },
  { value: 'specific_brands', label: t('appliesTo.specific_brands', { defaultValue: 'علامات محددة' }) },
  { value: 'minimum_order_amount', label: t('appliesTo.minimum_order_amount', { defaultValue: 'مبلغ الطلب الأدنى' }) },
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
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [showPreview, setShowPreview] = useState(false);

  const couponTypeOptions = createCouponTypeOptions(t);
  const couponStatusOptions = createCouponStatusOptions(t);
  const visibilityOptions = createVisibilityOptions(t);
  const appliesToOptions = createAppliesToOptions(t);

  const { data: coupon, isLoading: loadingCoupon } = useCoupon(id!);

  const { mutate: createCoupon, isPending: creating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: updating } = useUpdateCoupon();

  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<CouponFormData>({
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
    },
  });

  const couponType = watch('type');

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
      });
    }
  }, [coupon, isEditing, reset]);


  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const onSubmit = (data: CouponFormData) => {
    if (isEditing) {
      updateCoupon(
        { id: id!, data },
        {
          onSuccess: () => {
            toast.success(t('messages.updateSuccess', { defaultValue: 'تم تحديث الكوبون بنجاح' }));
            navigate('/coupons');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || t('messages.updateError', { defaultValue: 'فشل في تحديث الكوبون' }));
          },
        }
      );
    } else {
      createCoupon(data as CreateCouponDto, {
        onSuccess: () => {
          toast.success(t('messages.createSuccess', { defaultValue: 'تم إنشاء الكوبون بنجاح' }));
          navigate('/coupons');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error?.message || t('messages.createError', { defaultValue: 'فشل في إنشاء الكوبون' }));
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
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/coupons')}
            variant="outlined"
          >
            {t('buttons.back', { defaultValue: 'العودة' })}
          </Button>
          <Typography variant="h4" component="h1">
            {isEditing ? t('buttons.edit', { defaultValue: 'تعديل الكوبون' }) : t('buttons.create', { defaultValue: 'إنشاء كوبون جديد' })}
          </Typography>
        </Box>
        <Button
          startIcon={<Preview />}
          onClick={handlePreviewToggle}
          variant="outlined"
          color="info"
        >
          {showPreview ? t('buttons.hidePreview', { defaultValue: 'إخفاء المعاينة' }) : t('buttons.preview', { defaultValue: 'معاينة الكوبون' })}
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('form.basicInformation', { defaultValue: 'المعلومات الأساسية' })}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="code"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.code', { defaultValue: 'كود الكوبون' })}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.name', { defaultValue: 'اسم الكوبون' })}
                    error={!!error}
                    helperText={error?.message}
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
                    label={t('form.description', { defaultValue: 'وصف الكوبون' })}
                    multiline
                    rows={3}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="type"
                control={control}
                rules={{ required: t('validation.typeRequired', { defaultValue: 'نوع الكوبون مطلوب' })     }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>{t('form.type', { defaultValue: 'نوع الكوبون' })}</InputLabel>
                    <Select {...field} label={t('form.type', { defaultValue: 'نوع الكوبون' })}>
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
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>{t('form.status', { defaultValue: 'الحالة' })}</InputLabel>
                    <Select {...field} label={t('form.status', { defaultValue: 'الحالة' })}>
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
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>{t('form.visibility', { defaultValue: 'الظهور' })}</InputLabel>
                    <Select {...field} label={t('form.visibility', { defaultValue: 'الظهور' })}>
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
                <Typography variant="h6" gutterBottom>
                  {t('form.discountSettings', { defaultValue: 'إعدادات الخصم' })}
                </Typography>
              </Grid>
            )}

            {couponType === 'percentage' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="discountValue"
                  control={control}
                  rules={{
                    required: t('validation.discountValueRequired', { defaultValue: 'نسبة الخصم مطلوبة' }),
                    min: { value: 0, message: t('validation.discountValueMin', { defaultValue: 'يجب أن تكون النسبة أكبر من أو تساوي 0' }) },
                    max: { value: 100, message: t('validation.discountValueMax', { defaultValue: 'يجب أن تكون النسبة أقل من أو تساوي 100' }) },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label={t('form.discountValue', { defaultValue: 'نسبة الخصم (%)' })}
                      type="number"
                      error={!!error}
                      helperText={error?.message}
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
                    required: t('validation.discountValueRequired', { defaultValue: 'مبلغ الخصم مطلوب' }) ,
                    min: { value: 0, message: t('validation.discountValueMin', { defaultValue: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' }) },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label={t('form.discountValue', { defaultValue: 'مبلغ الخصم' })}
                      type="number"
                      error={!!error}
                      helperText={error?.message}
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
                      min: { value: 0, message: t('validation.minimumOrderAmountMin', { defaultValue: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' }) },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label={t('form.minimumOrderAmount', { defaultValue: 'الحد الأدنى للطلب' })}
                        type="number"
                        error={!!error}
                        helperText={error?.message}
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
                        min: { value: 0, message: t('validation.maximumDiscountAmountMin', { defaultValue: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' }) },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={t('form.maximumDiscountAmount', { defaultValue: 'الحد الأقصى للخصم' })}
                          type="number"
                          error={!!error}
                          helperText={error?.message}
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
                <Typography variant="h6" gutterBottom>
                  {t('form.buyXGetYSettings', { defaultValue: 'إعدادات الشراء X والحصول على Y' })}
                </Typography>
              </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="buyXQuantity"
                    control={control}
                    rules={{
                      required: t('validation.buyXQuantityRequired', { defaultValue: 'كمية الشراء مطلوبة' }),
                      min: { value: 1, message: t('validation.buyXQuantityMin') },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label={t('form.buyXQuantity', { defaultValue: 'كمية الشراء' }   )}
                        type="number"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="getYQuantity"
                    control={control}
                    rules={{
                      required: t('validation.getYQuantityRequired', { defaultValue: 'كمية الهدية مطلوبة' })    ,
                      min: { value: 1, message: t('validation.getYQuantityMin', { defaultValue: 'يجب أن تكون الكمية أكبر من 0' }) },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label={t('form.getYQuantity', { defaultValue: 'كمية الهدية' })}
                        type="number"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Usage Limits */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('form.usageLimits', { defaultValue: 'حدود الاستخدام' })}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="usageLimit"
                control={control}
                rules={{
                  min: { value: 0, message: t('validation.usageLimitMin', { defaultValue: 'يجب أن يكون العدد أكبر من أو يساوي 0' }) },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.usageLimit', { defaultValue: 'الحد الأقصى للاستخدام' })}
                    type="number"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="usageLimitPerUser"
                control={control}
                rules={{
                  min: { value: 0, message: t('validation.usageLimitPerUserMin', { defaultValue: 'يجب أن يكون العدد أكبر من أو يساوي 0' }) },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.usageLimitPerUser', { defaultValue: 'الحد الأقصى لكل مستخدم' })}
                    type="number"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/* Validity Period */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('form.validityPeriod', { defaultValue: 'فترة الصلاحية' })}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="validFrom"
                control={control}
                rules={{ required: t('validation.validFromRequired', { defaultValue: 'تاريخ البداية مطلوب' }) }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label={t('form.validFrom', { defaultValue: 'تاريخ البداية' })}
                    type="date"
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="validUntil"
                control={control}
                rules={{ required: t('validation.validUntilRequired', { defaultValue: 'تاريخ النهاية مطلوب' }) }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                        label={t('form.validUntil', { defaultValue: 'تاريخ النهاية' })}
                    type="date"
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Applicability */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {t('form.applicability', { defaultValue: 'تطبيق الكوبون' })}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="appliesTo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>{t('form.appliesTo', { defaultValue: 'ينطبق على' })}</InputLabel>
                    <Select {...field} label={t('form.appliesTo', { defaultValue: 'ينطبق على' })}>
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

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/coupons')}
                  disabled={creating || updating}
                >
                  {t('buttons.cancel', { defaultValue: 'إلغاء' })}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={creating || updating ? <CircularProgress size={20} /> : <Save />}
                  disabled={creating || updating}
                >
                  {creating || updating ? t('buttons.saving', { defaultValue: 'جاري الحفظ...' }) : t('buttons.save', { defaultValue: 'حفظ' })}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Coupon Preview */}
      {showPreview && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('form.preview', { defaultValue: 'معاينة الكوبون' })}
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.code', { defaultValue: 'كود الكوبون' })}
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {watch('code')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.name', { defaultValue: 'اسم الكوبون' })}
                  </Typography>
                  <Typography variant="body1">{watch('name') || t('form.undefined', { defaultValue: 'غير محدد' })}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.description', { defaultValue: 'الوصف' })}
                  </Typography>
                  <Typography variant="body2">{watch('description') || 'لا يوجد وصف'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.type', { defaultValue: 'النوع' })}
                  </Typography>
                  <Chip
                    label={couponTypeOptions.find((opt) => opt.value === watch('type'))?.label}
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.status', { defaultValue: 'الحالة' })}
                  </Typography>
                  <Chip
                    label={couponStatusOptions.find((opt) => opt.value === watch('status'))?.label}
                    color={watch('status') === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.visibility', { defaultValue: 'الرؤية' })}    
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
                      {t('form.discountValue', { defaultValue: 'نسبة الخصم' })}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {watch('discountValue')}%
                    </Typography>
                  </Grid>
                )}
                {watch('type') === 'fixed_amount' && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('form.discountValue', { defaultValue: 'مبلغ الخصم' })}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${watch('discountValue')}
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('form.validityPeriod', { defaultValue: 'فترة الصلاحية' })} 
                  </Typography>
                  <Typography variant="body2">
                    {watch('validFrom') && watch('validUntil')
                      ? `${watch('validFrom')} - ${watch('validUntil')}`
                      : t('form.undefined', { defaultValue: 'غير محدد' })}
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
