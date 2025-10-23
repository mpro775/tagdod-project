import React, { useEffect, useState } from 'react';
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
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Save, Cancel, Home, Business } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { ImageField } from '@/features/media';
import { useBrand, useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import type { CreateBrandDto, UpdateBrandDto } from '../types/brand.types';

const brandSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم لا يجب أن يتجاوز 100 حرف'),
  nameEn: z
    .string()
    .min(2, 'الاسم بالإنجليزية مطلوب')
    .max(100, 'الاسم بالإنجليزية لا يجب أن يتجاوز 100 حرف'),
  image: z.string().min(1, 'صورة العلامة التجارية مطلوبة'),
  description: z.string().max(500, 'الوصف لا يجب أن يتجاوز 500 حرف').optional(),
  descriptionEn: z.string().max(500, 'الوصف بالإنجليزية لا يجب أن يتجاوز 500 حرف').optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0, 'ترتيب العرض يجب أن يكون أكبر من أو يساوي 0').optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

export const BrandFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const methods = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      nameEn: '',
      image: '',
      description: '',
      descriptionEn: '',
      isActive: true,
      sortOrder: 0,
    },
  });

  const { data: brand, isLoading, error } = useBrand(id!);
  const { mutate: createBrand, isPending: isCreating, error: createError } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating, error: updateError } = useUpdateBrand();

  const isLoadingData = isLoading;
  const isSubmitting = isCreating || isUpdating;
  const submitError = createError || updateError;

  useEffect(() => {
    if (isEditMode && brand) {
      methods.reset({
        name: brand.name,
        nameEn: brand.nameEn,
        image: brand.image,
        description: brand.description || '',
        descriptionEn: brand.descriptionEn || '',
        isActive: brand.isActive,
        sortOrder: brand.sortOrder,
      });
      setSelectedImage({ url: brand.image, name: brand.name });
    } else {
      methods.reset({
        name: '',
        nameEn: '',
        image: '',
        description: '',
        descriptionEn: '',
        isActive: true,
        sortOrder: 0,
      });
      setSelectedImage(null);
    }
  }, [brand, isEditMode, methods]);

  const onSubmit = (data: BrandFormData) => {
    const brandData: CreateBrandDto | UpdateBrandDto = {
      ...data,
      image: selectedImage?.url || data.image,
    };

    if (isEditMode) {
      updateBrand(
        { id: id!, data: brandData as UpdateBrandDto },
        { onSuccess: () => navigate('/brands') }
      );
    } else {
      createBrand(brandData as CreateBrandDto, { onSuccess: () => navigate('/brands') });
    }
  };

  const handleCancel = () => {
    navigate('/brands');
  };

  if (isEditMode && isLoadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isEditMode && error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error.message || 'فشل في تحميل بيانات العلامة التجارية'}</Alert>
        <Button variant="outlined" onClick={() => navigate('/brands')} sx={{ mt: 2 }}>
          العودة للقائمة
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Home fontSize="small" />
          الرئيسية
        </Link>
        <Link
          color="inherit"
          href="/brands"
          onClick={(e) => {
            e.preventDefault();
            navigate('/brands');
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Business fontSize="small" />
          العلامات التجارية
        </Link>
        <Typography color="text.primary">
          {isEditMode ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية جديدة'}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isEditMode ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية جديدة'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {isEditMode
            ? 'قم بتعديل بيانات العلامة التجارية أدناه'
            : 'أدخل بيانات العلامة التجارية الجديدة أدناه'}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* رسائل الخطأ */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError.message || 'حدث خطأ أثناء حفظ البيانات'}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ mb: 4 }}
          variant="fullWidth"
        >
          <Tab label="العربية 🇸🇦" />
          <Tab label="English 🇬🇧" />
        </Tabs>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* المحتوى العربي */}
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="name"
                      label="اسم العلامة التجارية (عربي) *"
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="description"
                      label="وصف العلامة التجارية (عربي)"
                      multiline
                      rows={4}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </Grid>
                </>
              )}

              {/* المحتوى الإنجليزي */}
              {activeTab === 1 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="nameEn"
                      label="Brand Name (English) *"
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="descriptionEn"
                      label="Brand Description (English)"
                      multiline
                      rows={4}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </Grid>
                </>
              )}

              {/* صورة العلامة التجارية */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  صورة العلامة التجارية
                </Typography>
                <ImageField
                  label="شعار العلامة التجارية *"
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('image', media?.url || '');
                  }}
                  category="brand"
                  helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
                  disabled={isSubmitting}
                />
              </Grid>

              {/* إعدادات إضافية */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  الإعدادات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput
                  name="sortOrder"
                  label="ترتيب العرض"
                  type="number"
                  fullWidth
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={<Switch {...methods.register('isActive')} disabled={isSubmitting} />}
                    label="نشط"
                  />
                </Box>
              </Grid>

              {/* أزرار التحكم */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 3 }} />
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    size="large"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                    disabled={isSubmitting}
                    size="large"
                  >
                    {isEditMode ? 'حفظ التغييرات' : 'إنشاء العلامة التجارية'}
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
