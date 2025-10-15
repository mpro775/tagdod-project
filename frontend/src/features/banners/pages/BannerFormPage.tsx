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
import { useBanner, useCreateBanner, useUpdateBanner } from '../hooks/useBanners';
import { BannerType, BannerLocation } from '../types/banner.types';

const bannerSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  image: z.string().url('رابط غير صحيح'),
  type: z.nativeEnum(BannerType).optional(),
  location: z.nativeEnum(BannerLocation).optional(),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export const BannerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  const methods = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const { data: banner, isLoading } = useBanner(id!);
  const { mutate: createBanner, isPending: isCreating } = useCreateBanner();
  const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner();

  useEffect(() => {
    if (isEditMode && banner) methods.reset(banner as BannerFormData);
  }, [banner, isEditMode, methods]);

  const onSubmit = (data: BannerFormData) => {
    if (isEditMode) {
      updateBanner({ id: id!, data }, { onSuccess: () => navigate('/banners') });
    } else {
      createBanner(data, { onSuccess: () => navigate('/banners') });
    }
  };

  if (isEditMode && isLoading)
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isEditMode ? 'تعديل البانر' : 'إضافة بانر جديد'}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <FormInput name="title" label="العنوان *" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormInput name="description" label="الوصف" multiline rows={2} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormInput name="image" label="رابط الصورة *" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelect
                  name="type"
                  label="النوع"
                  options={[
                    { value: BannerType.IMAGE, label: 'صورة' },
                    { value: BannerType.VIDEO, label: 'فيديو' },
                    { value: BannerType.CAROUSEL, label: 'سلايدر' },
                  ]}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelect
                  name="location"
                  label="الموقع"
                  options={[
                    { value: BannerLocation.HOME_TOP, label: 'الرئيسية - أعلى' },
                    { value: BannerLocation.HOME_MIDDLE, label: 'الرئيسية - وسط' },
                    { value: BannerLocation.HOME_BOTTOM, label: 'الرئيسية - أسفل' },
                    { value: BannerLocation.CATEGORY_TOP, label: 'الفئات - أعلى' },
                    { value: BannerLocation.PRODUCT_SIDEBAR, label: 'المنتج - جانبي' },
                  ]}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput name="sortOrder" label="الترتيب" type="number" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="linkUrl" label="رابط الانتقال" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="linkText" label="نص الزر" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Switch {...methods.register('isActive')} defaultChecked />}
                  label="نشط"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                  >
                    حفظ
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/banners')}
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
