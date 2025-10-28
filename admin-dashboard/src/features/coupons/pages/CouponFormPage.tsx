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
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  useCreateCoupon,
  useUpdateCoupon,
  useCoupon,
} from '@/features/marketing/hooks/useMarketing';
import type { CreateCouponDto, UpdateCouponDto } from '@/features/marketing/api/marketingApi';


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
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [showPreview, setShowPreview] = useState(false);

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
            toast.success('تم تحديث الكوبون بنجاح');
            navigate('/coupons');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || 'فشل في تحديث الكوبون');
          },
        }
      );
    } else {
      createCoupon(data as CreateCouponDto, {
        onSuccess: () => {
          toast.success('تم إنشاء الكوبون بنجاح');
          navigate('/coupons');
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/coupons')}
            variant="outlined"
          >
            العودة
          </Button>
          <Typography variant="h4" component="h1">
            {isEditing ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
          </Typography>
        </Box>
        <Button
          startIcon={<Preview />}
          onClick={handlePreviewToggle}
          variant="outlined"
          color="info"
        >
          {showPreview ? 'إخفاء المعاينة' : 'معاينة الكوبون'}
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                المعلومات الأساسية
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="code"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="كود الكوبون"
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
                    label="اسم الكوبون"
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
                    label="وصف الكوبون"
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
                rules={{ required: 'نوع الكوبون مطلوب' }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>نوع الكوبون</InputLabel>
                    <Select {...field} label="نوع الكوبون">
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
                    <InputLabel>الحالة</InputLabel>
                    <Select {...field} label="الحالة">
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
                    <InputLabel>الظهور</InputLabel>
                    <Select {...field} label="الظهور">
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
                  إعدادات الخصم
                </Typography>
              </Grid>
            )}

            {couponType === 'percentage' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="discountValue"
                  control={control}
                  rules={{
                    required: 'نسبة الخصم مطلوبة',
                    min: { value: 0, message: 'يجب أن تكون النسبة أكبر من أو تساوي 0' },
                    max: { value: 100, message: 'يجب أن تكون النسبة أقل من أو تساوي 100' },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="نسبة الخصم (%)"
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
                    required: 'مبلغ الخصم مطلوب',
                    min: { value: 0, message: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="مبلغ الخصم"
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
                      min: { value: 0, message: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="الحد الأدنى للطلب"
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
                        min: { value: 0, message: 'يجب أن يكون المبلغ أكبر من أو يساوي 0' },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="الحد الأقصى للخصم"
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
                    إعدادات اشتر X احصل على Y
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="buyXQuantity"
                    control={control}
                    rules={{
                      required: 'كمية الشراء مطلوبة',
                      min: { value: 1, message: 'يجب أن تكون الكمية أكبر من 0' },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="كمية الشراء (X)"
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
                      required: 'كمية الهدية مطلوبة',
                      min: { value: 1, message: 'يجب أن تكون الكمية أكبر من 0' },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="كمية الهدية (Y)"
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
                حدود الاستخدام
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="usageLimit"
                control={control}
                rules={{
                  min: { value: 0, message: 'يجب أن يكون العدد أكبر من أو يساوي 0' },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="الحد الأقصى للاستخدام"
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
                  min: { value: 0, message: 'يجب أن يكون العدد أكبر من أو يساوي 0' },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="الحد الأقصى لكل مستخدم"
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
                فترة الصلاحية
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="validFrom"
                control={control}
                rules={{ required: 'تاريخ البداية مطلوب' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="تاريخ البداية"
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
                rules={{ required: 'تاريخ النهاية مطلوب' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="تاريخ النهاية"
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
                تطبيق الكوبون
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="appliesTo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>ينطبق على</InputLabel>
                    <Select {...field} label="ينطبق على">
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

      {/* Coupon Preview */}
      {showPreview && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            معاينة الكوبون
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    كود الكوبون
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {watch('code')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    اسم الكوبون
                  </Typography>
                  <Typography variant="body1">{watch('name') || 'غير محدد'}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    الوصف
                  </Typography>
                  <Typography variant="body2">{watch('description') || 'لا يوجد وصف'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    النوع
                  </Typography>
                  <Chip
                    label={couponTypeOptions.find((opt) => opt.value === watch('type'))?.label}
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    الحالة
                  </Typography>
                  <Chip
                    label={couponStatusOptions.find((opt) => opt.value === watch('status'))?.label}
                    color={watch('status') === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    الرؤية
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
                      نسبة الخصم
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {watch('discountValue')}%
                    </Typography>
                  </Grid>
                )}
                {watch('type') === 'fixed_amount' && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      مبلغ الخصم
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {watch('discountValue')} ريال
                    </Typography>
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    فترة الصلاحية
                  </Typography>
                  <Typography variant="body2">
                    {watch('validFrom') && watch('validUntil')
                      ? `${watch('validFrom')} - ${watch('validUntil')}`
                      : 'غير محدد'}
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
