import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Button, CircularProgress, FormControlLabel, Switch } from '@mui/material';
import { Save, ArrowBack, Image } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useCreateBanner, useUpdateBanner, useBanner } from '@/features/marketing/hooks/useMarketing';
import type { CreateBannerDto, UpdateBannerDto } from '@/features/marketing/api/marketingApi';

type BannerFormData = CreateBannerDto | UpdateBannerDto;

const locationOptions = [
  { value: 'home_top', label: 'أعلى الصفحة الرئيسية' },
  { value: 'home_middle', label: 'وسط الصفحة الرئيسية' },
  { value: 'home_bottom', label: 'أسفل الصفحة الرئيسية' },
  { value: 'category_top', label: 'أعلى صفحة الفئة' },
  { value: 'product_page', label: 'صفحة المنتج' },
  { value: 'cart_page', label: 'صفحة سلة المشتريات' },
  { value: 'checkout_page', label: 'صفحة الدفع' },
  { value: 'sidebar', label: 'الشريط الجانبي' },
  { value: 'footer', label: 'أسفل الصفحة' },
];

const promotionTypeOptions = [
  { value: 'discount', label: 'خصم' },
  { value: 'free_shipping', label: 'شحن مجاني' },
  { value: 'new_arrival', label: 'منتج جديد' },
  { value: 'sale', label: 'تخفيض' },
  { value: 'seasonal', label: 'موسمي' },
  { value: 'brand_promotion', label: 'ترويج العلامة التجارية' },
];

export const BannerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: banner, isLoading: loadingBanner } = useBanner(id!, {
    enabled: isEditing,
  });

  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner();

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<BannerFormData>({
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      altText: '',
      location: 'home_top',
      promotionType: 'discount',
      isActive: true,
      sortOrder: 0,
      startDate: '',
      endDate: '',
      displayDuration: 5000,
      targetAudiences: [],
      targetCategories: [],
      targetProducts: [],
    },
  });

  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (banner && isEditing) {
      reset({
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        altText: banner.altText,
        location: banner.location,
        promotionType: banner.promotionType,
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
        displayDuration: banner.displayDuration,
        targetAudiences: banner.targetAudiences,
        targetCategories: banner.targetCategories,
        targetProducts: banner.targetProducts,
      });
    }
  }, [banner, isEditing, reset]);

  const onSubmit = (data: BannerFormData) => {
    if (isEditing) {
      updateBanner(
        { id: id!, data },
        {
          onSuccess: () => {
            toast.success('تم تحديث البانر بنجاح');
            navigate('/admin/banners');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || 'فشل في تحديث البانر');
          },
        }
      );
    } else {
      createBanner(data, {
        onSuccess: () => {
          toast.success('تم إنشاء البانر بنجاح');
          navigate('/admin/banners');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'فشل في إنشاء البانر');
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
          onClick={() => navigate('/admin/banners')}
          variant="outlined"
        >
          العودة
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'تعديل البانر' : 'إنشاء بانر جديد'}
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

            <Grid item xs={12} md={8}>
              <FormInput
                name="title"
                control={control}
                label="عنوان البانر"
                rules={{ required: 'عنوان البانر مطلوب' }}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormSelect
                name="location"
                control={control}
                label="موقع العرض"
                options={locationOptions}
                rules={{ required: 'موقع العرض مطلوب' }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="description"
                control={control}
                label="وصف البانر"
                multiline
                rows={3}
              />
            </Grid>

            {/* Image and Link */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                الصورة والرابط
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="imageUrl"
                control={control}
                label="رابط الصورة"
                rules={{
                  required: 'رابط الصورة مطلوب',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'يجب أن يكون رابط صورة صحيح'
                  }
                }}
                error={!!errors.imageUrl}
                helperText={errors.imageUrl?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="linkUrl"
                control={control}
                label="رابط التوجيه"
                rules={{
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'يجب أن يكون رابط صحيح'
                  }
                }}
                helperText="اتركه فارغاً إذا لم يكن هناك رابط"
              />
            </Grid>

            {imageUrl && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    معاينة الصورة:
                  </Typography>
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Banner preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      borderRadius: 1,
                      boxShadow: 1
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormInput
                name="altText"
                control={control}
                label="نص بديل للصورة"
                helperText="مهم لإمكانية الوصول"
              />
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                الإعدادات
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="promotionType"
                control={control}
                label="نوع الترويج"
                options={promotionTypeOptions}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="sortOrder"
                control={control}
                label="ترتيب العرض"
                type="number"
                rules={{
                  min: { value: 0, message: 'يجب أن يكون الترتيب أكبر من أو يساوي 0' },
                }}
                helperText="رقم أقل = أولوية أعلى"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="displayDuration"
                control={control}
                label="مدة العرض (مللي ثانية)"
                type="number"
                rules={{
                  min: { value: 1000, message: 'يجب أن تكون المدة على الأقل 1000 مللي ثانية' },
                }}
                helperText="مدة عرض البانر في الشرائح المتحركة"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={watch('isActive')}
                      onChange={(e) => setValue('isActive', e.target.checked)}
                    />
                  }
                  label="نشط"
                />
              </Box>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                نطاق التاريخ
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="startDate"
                control={control}
                label="تاريخ البداية"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="endDate"
                control={control}
                label="تاريخ النهاية"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/banners')}
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
