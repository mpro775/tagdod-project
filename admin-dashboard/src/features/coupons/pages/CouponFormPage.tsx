import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useCreateCoupon, useUpdateCoupon, useCoupon } from '@/features/marketing/hooks/useMarketing';
import type { CreateCouponDto, UpdateCouponDto } from '@/features/marketing/api/marketingApi';

// Type definitions for coupon types
type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted';

type CouponFormData = CreateCouponDto | UpdateCouponDto;

const couponTypeOptions = [
  { value: 'percentage', label: 'نسبة مئوية' },
  { value: 'fixed_amount', label: 'مبلغ ثابت' },
  { value: 'free_shipping', label: 'شحن مجاني' },
  { value: 'buy_x_get_y', label: 'اشتر X احصل على Y' },
];

const couponStatusOptions = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
];

const visibilityOptions = [
  { value: 'public', label: 'عام' },
  { value: 'private', label: 'خاص' },
  { value: 'hidden', label: 'مخفي' },
];

const appliesToOptions = [
  { value: 'all_products', label: 'جميع المنتجات' },
  { value: 'specific_products', label: 'منتجات محددة' },
  { value: 'specific_categories', label: 'فئات محددة' },
  { value: 'specific_brands', label: 'علامات تجارية محددة' },
  { value: 'minimum_order_amount', label: 'حد أدنى للطلب' },
];

export const CouponFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: coupon, isLoading: loadingCoupon } = useCoupon(id!, {
    enabled: isEditing,
  });

  const { mutate: createCoupon, isPending: creating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: updating } = useUpdateCoupon();

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<CouponFormData>({
    defaultValues: {
      code: '',
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
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
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

  const onSubmit = (data: CouponFormData) => {
    if (isEditing) {
      updateCoupon(
        { id: id!, data },
        {
          onSuccess: () => {
            toast.success('تم تحديث الكوبون بنجاح');
            navigate('/admin/coupons');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || 'فشل في تحديث الكوبون');
          },
        }
      );
    } else {
      createCoupon(data, {
        onSuccess: () => {
          toast.success('تم إنشاء الكوبون بنجاح');
          navigate('/admin/coupons');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'فشل في إنشاء الكوبون');
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
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/coupons')}
          variant="outlined"
        >
          العودة
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                المعلومات الأساسية
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="code"
                control={control}
                label="كود الكوبون"
                rules={{ required: 'كود الكوبون مطلوب' }}
                error={!!errors.code}
                helperText={errors.code?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="name"
                control={control}
                label="اسم الكوبون"
                rules={{ required: 'اسم الكوبون مطلوب' }}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="description"
                control={control}
                label="وصف الكوبون"
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="type"
                control={control}
                label="نوع الكوبون"
                options={couponTypeOptions}
                rules={{ required: 'نوع الكوبون مطلوب' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="status"
                control={control}
                label="الحالة"
                options={couponStatusOptions}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="visibility"
                control={control}
                label="الظهور"
                options={visibilityOptions}
              />
            </Grid>

            {/* Discount Configuration */}
            {(couponType === 'percentage' || couponType === 'fixed_amount') && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  إعدادات الخصم
                </Typography>
              </Grid>
            )}

            {couponType === 'percentage' && (
              <Grid item xs={12} md={6}>
                <FormInput
                  name="discountValue"
                  control={control}
                  label="نسبة الخصم (%)"
                  type="number"
                  rules={{
                    required: 'نسبة الخصم مطلوبة',
                    min: { value: 0, message: 'يجب أن تكون النسبة أكبر من أو تساوي 0' },
                    max: { value: 100, message: 'يجب أن تكون النسبة أقل من أو تساوي 100' },
                  }}
                  error={!!errors.discountValue}
                  helperText={errors.discountValue?.message}
                />
              </Grid>
            )}

            {couponType === 'fixed_amount' && (
              <Grid item xs={12} md={6}>
                <FormInput
                  name="discountValue"
                  control={control}
                  label="مبلغ الخصم"
                  type="number"
                  rules={{
                    required: 'مبلغ الخصم مطلوب',
                    min: { value: 0, message: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' },
                  }}
                  error={!!errors.discountValue}
                  helperText={errors.discountValue?.message}
                />
              </Grid>
            )}

            {(couponType === 'percentage' || couponType === 'fixed_amount') && (
              <>
                <Grid item xs={12} md={6}>
                  <FormInput
                    name="minimumOrderAmount"
                    control={control}
                    label="الحد الأدنى للطلب"
                    type="number"
                    rules={{
                      min: { value: 0, message: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' },
                    }}
                  />
                </Grid>

                {couponType === 'percentage' && (
                  <Grid item xs={12} md={6}>
                    <FormInput
                      name="maximumDiscountAmount"
                      control={control}
                      label="الحد الأقصى للخصم"
                      type="number"
                      rules={{
                        min: { value: 0, message: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' },
                      }}
                    />
                  </Grid>
                )}
              </>
            )}

            {/* Buy X Get Y Configuration */}
            {couponType === 'buy_x_get_y' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    إعدادات اشتر X احصل على Y
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormInput
                    name="buyXQuantity"
                    control={control}
                    label="كمية الشراء (X)"
                    type="number"
                    rules={{
                      required: 'كمية الشراء مطلوبة',
                      min: { value: 1, message: 'يجب أن تكون الكمية أكبر من 0' },
                    }}
                    error={!!errors.buyXQuantity}
                    helperText={errors.buyXQuantity?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormInput
                    name="getYQuantity"
                    control={control}
                    label="كمية الهدية (Y)"
                    type="number"
                    rules={{
                      required: 'كمية الهدية مطلوبة',
                      min: { value: 1, message: 'يجب أن تكون الكمية أكبر من 0' },
                    }}
                    error={!!errors.getYQuantity}
                    helperText={errors.getYQuantity?.message}
                  />
                </Grid>
              </>
            )}

            {/* Usage Limits */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                حدود الاستخدام
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="usageLimit"
                control={control}
                label="الحد الأقصى للاستخدام"
                type="number"
                rules={{
                  min: { value: 0, message: 'يجب أن يكون العدد أكبر من أو يساوي 0' },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="usageLimitPerUser"
                control={control}
                label="الحد الأقصى لكل مستخدم"
                type="number"
                rules={{
                  min: { value: 0, message: 'يجب أن يكون العدد أكبر من أو يساوي 0' },
                }}
              />
            </Grid>

            {/* Validity Period */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                فترة الصلاحية
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="validFrom"
                control={control}
                label="تاريخ البداية"
                type="date"
                rules={{ required: 'تاريخ البداية مطلوب' }}
                error={!!errors.validFrom}
                helperText={errors.validFrom?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="validUntil"
                control={control}
                label="تاريخ النهاية"
                type="date"
                rules={{ required: 'تاريخ النهاية مطلوب' }}
                error={!!errors.validUntil}
                helperText={errors.validUntil?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Applicability */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                تطبيق الكوبون
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="appliesTo"
                control={control}
                label="ينطبق على"
                options={appliesToOptions}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/coupons')}
                  disabled={creating || updating}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={creating || updating ? <CircularProgress size={20} /> : <Save />}
                  disabled={creating || updating}
                >
                  {creating || updating ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
