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
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { ImageField } from '@/features/media';
import { useBrand, useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import type { CreateBrandDto } from '../types/brand.types';

const brandSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

export const BrandFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedLogo, setSelectedLogo] = React.useState<any>(null);

  const methods = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      nameEn: '',
      isActive: true,
      isFeatured: false,
      order: 0,
    },
  });

  const { data: brand, isLoading } = useBrand(id!);
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();

  useEffect(() => {
    if (isEditMode && brand) {
      methods.reset(brand as BrandFormData);
      
      // Set logo if exists
      if (brand.logo) {
        setSelectedLogo({ url: brand.logo, name: 'شعار البراند' });
      }
    }
  }, [brand, isEditMode, methods]);

  const onSubmit = (data: BrandFormData) => {
    const brandData: CreateBrandDto = {
      ...data,
      logo: selectedLogo?.url || data.logo,
    };

    if (isEditMode) {
      updateBrand({ id: id!, data: brandData }, { onSuccess: () => navigate('/brands') });
    } else {
      createBrand(brandData, { onSuccess: () => navigate('/brands') });
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
          {isEditMode ? 'تعديل العلامة' : 'إضافة علامة جديدة'}
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="العربية 🇸🇦" />
          <Tab label="English 🇬🇧" />
        </Tabs>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormInput name="name" label="اسم العلامة (عربي) *" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput name="description" label="الوصف (عربي)" multiline rows={3} />
                  </Grid>
                </>
              )}
              {activeTab === 1 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormInput name="nameEn" label="Brand Name (English) *" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="descriptionEn"
                      label="Description (English)"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">معلومات الاتصال</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput name="website" label="الموقع الإلكتروني" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput name="email" label="البريد الإلكتروني" type="email" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput name="phone" label="رقم الهاتف" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ImageField
                  label="شعار البراند"
                  value={selectedLogo}
                  onChange={(media) => {
                    setSelectedLogo(media);
                    methods.setValue('logo', media?.url || '');
                  }}
                  category="brand"
                  helperText="يمكنك اختيار شعار من المكتبة أو رفع شعار جديد"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch {...methods.register('isActive')} defaultChecked />}
                    label="نشط"
                  />
                  <FormControlLabel
                    control={<Switch {...methods.register('isFeatured')} />}
                    label="مميزة"
                  />
                </Box>
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
                    onClick={() => navigate('/brands')}
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
