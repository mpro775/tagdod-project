import React, { useEffect } from 'react';
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
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCreateBanner, useUpdateBanner, useBanner } from '../hooks/useBanners';
import {
  BANNER_LOCATION_OPTIONS,
  BANNER_PROMOTION_TYPE_OPTIONS,
  BannerPromotionType,
} from '../types/banner.types';
import type { CreateBannerDto, UpdateBannerDto } from '../types/banner.types';

type BannerFormData = CreateBannerDto | UpdateBannerDto;

// Using the imported options from types

export const BannerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: banner, isLoading: loadingBanner } = useBanner(id!, {
    enabled: isEditing,
  });

  const { mutate: createBanner, isPending: creating } = useCreateBanner();
  const { mutate: updateBanner, isPending: updating } = useUpdateBanner();

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
      imageUrl: '',
      linkUrl: '',
      altText: '',
      location: BANNER_LOCATION_OPTIONS[0].value,
      promotionType: BannerPromotionType.DISCOUNT,
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
            navigate('/banners');
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || 'فشل في تحديث البانر');
          },
        }
      );
    } else {
      createBanner(data as CreateBannerDto, {
        onSuccess: () => {
          toast.success('تم إنشاء البانر بنجاح');
          navigate('/banners');
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
          onClick={() => navigate('/banners')}
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
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                المعلومات الأساسية
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
                    label="عنوان البانر"
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
                  <TextField
                    {...field}
                    fullWidth
                    label="موقع العرض"
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
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
                    label="وصف البانر"
                
                />
              )}
              />
            </Grid>

            {/* Image and Link */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                الصورة والرابط
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="imageUrl"
                control={control}
                rules={{
                  required: 'رابط الصورة مطلوب',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'يجب أن يكون رابط صورة صحيح',
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رابط الصورة"
                    error={!!error}
                    helperText={error?.message || "رابط الصورة مطلوب"}
                  />
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
                    label="رابط التوجيه"
                    error={!!error}
                    helperText={error?.message || "اتركه فارغاً إذا لم يكن هناك رابط"}
                  />
                )}
              />
            </Grid>

            {imageUrl && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}
                >
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
                      boxShadow: 1,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Controller
                name="altText"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="نص بديل للصورة"
                    type="text"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            {/* Settings */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                الإعدادات
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="promotionType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نوع الترويج</InputLabel>
                    <Select
                      {...field}
                      label="نوع الترويج"
                      value={field.value || ''}
                    >
                      {BANNER_PROMOTION_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
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
                    label="ترتيب العرض"
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
                    label="مدة العرض (مللي ثانية)"
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
                  label="نشط"
                />
              </Box>
            </Grid>

            {/* Date Range */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                نطاق التاريخ
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
                    label="تاريخ البداية"
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
                    label="تاريخ النهاية"
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
