import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useCoupon, useCreateCoupon, useUpdateCoupon } from '../hooks/useCoupons';
import { CouponType, CouponVisibility, DiscountAppliesTo } from '../types/coupon.types';
import type { CreateCouponDto } from '../types/coupon.types';

const couponSchema = z.object({
  code: z.string().min(3, 'الكود يجب أن يكون 3 أحرف على الأقل'),
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().optional(),
  type: z.nativeEnum(CouponType),
  visibility: z.nativeEnum(CouponVisibility).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  appliesTo: z.nativeEnum(DiscountAppliesTo).optional(),
  minOrderAmount: z.number().min(0).optional(),
  currency: z.string().optional(),
  maxTotalUses: z.number().min(1).optional(),
  maxUsesPerUser: z.number().min(1).optional(),
  startDate: z.string(),
  endDate: z.string(),
  firstOrderOnly: z.boolean().optional(),
  newUsersOnly: z.boolean().optional(),
  oneTimeUse: z.boolean().optional(),
  stackable: z.boolean().optional(),
  excludeSaleItems: z.boolean().optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

export const CouponFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  const methods = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      title: '',
      type: CouponType.PERCENTAGE,
      visibility: CouponVisibility.PUBLIC,
      appliesTo: DiscountAppliesTo.ENTIRE_ORDER,
      maxUsesPerUser: 1,
      firstOrderOnly: false,
      newUsersOnly: false,
      oneTimeUse: false,
      stackable: false,
      excludeSaleItems: false,
    },
  });

  const { data: coupon, isLoading } = useCoupon(id!);
  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupon();

  useEffect(() => {
    if (isEditMode && coupon) {
      methods.reset({
        ...coupon,
        startDate: new Date(coupon.startDate).toISOString().split('T')[0],
        endDate: new Date(coupon.endDate).toISOString().split('T')[0],
      } as CouponFormData);
    }
  }, [coupon, isEditMode, methods]);

  const onSubmit = (data: CouponFormData) => {
    const couponData: CreateCouponDto = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    if (isEditMode) {
      updateCoupon({ id: id!, data: couponData }, { onSuccess: () => navigate('/coupons') });
    } else {
      createCoupon(couponData, { onSuccess: () => navigate('/coupons') });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isEditMode ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
        </Typography>
        <Divider sx={{ my: 3 }} />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="code" label="كود الكوبون *" disabled={isEditMode} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="title" label="العنوان *" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormInput name="description" label="الوصف" multiline rows={2} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelect
                  name="type"
                  label="نوع الكوبون *"
                  options={[
                    { value: CouponType.PERCENTAGE, label: 'نسبة مئوية' },
                    { value: CouponType.FIXED_AMOUNT, label: 'مبلغ ثابت' },
                    { value: CouponType.FREE_SHIPPING, label: 'شحن مجاني' },
                    { value: CouponType.BUY_X_GET_Y, label: 'اشتر X احصل على Y' },
                    { value: CouponType.FIRST_ORDER, label: 'الطلب الأول' },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelect
                  name="visibility"
                  label="الظهور"
                  options={[
                    { value: CouponVisibility.PUBLIC, label: 'عام' },
                    { value: CouponVisibility.PRIVATE, label: 'خاص' },
                    { value: CouponVisibility.AUTO_APPLY, label: 'تطبيق تلقائي' },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelect
                  name="appliesTo"
                  label="يطبق على"
                  options={[
                    { value: DiscountAppliesTo.ENTIRE_ORDER, label: 'الطلب بالكامل' },
                    { value: DiscountAppliesTo.SPECIFIC_PRODUCTS, label: 'منتجات محددة' },
                    { value: DiscountAppliesTo.SPECIFIC_CATEGORIES, label: 'فئات محددة' },
                    { value: DiscountAppliesTo.SPECIFIC_BRANDS, label: 'براندات محددة' },
                    { value: DiscountAppliesTo.CHEAPEST_ITEM, label: 'أرخص منتج' },
                    { value: DiscountAppliesTo.MOST_EXPENSIVE, label: 'أغلى منتج' },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="discountPercentage"
                  label="نسبة الخصم (%)"
                  type="number"
                  placeholder="0-100"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="discountAmount"
                  label="مبلغ الخصم"
                  type="number"
                  placeholder="0"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="maxDiscountAmount"
                  label="الحد الأقصى للخصم"
                  type="number"
                  placeholder="0"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="minOrderAmount"
                  label="الحد الأدنى للطلب"
                  type="number"
                  placeholder="0"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput name="currency" label="العملة" placeholder="YER" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="maxUsesPerUser"
                  label="الحد الأقصى لكل مستخدم"
                  type="number"
                  placeholder="1"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="startDate" label="تاريخ البداية *" type="date" />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="endDate" label="تاريخ النهاية *" type="date" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  خيارات إضافية
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch {...methods.register('firstOrderOnly')} />}
                    label="للطلب الأول فقط"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('newUsersOnly')} />}
                    label="للمستخدمين الجدد فقط"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('oneTimeUse')} />}
                    label="استخدام مرة واحدة"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('stackable')} />}
                    label="قابل للدمج مع كوبونات أخرى"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('excludeSaleItems')} />}
                    label="استبعاد المنتجات المخفضة"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />
                    }
                    disabled={isCreating || isUpdating}
                  >
                    حفظ
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/coupons')}
                  >
                    إلغاء
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>
    </Box>
  );
};

