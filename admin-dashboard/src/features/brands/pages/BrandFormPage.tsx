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
} from '@mui/material';
import { Save, Cancel, Business, ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { FormInput } from '@/shared/components/Form/FormInput';
import { ImageField } from '@/features/media';
import { useBrand, useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import type { CreateBrandDto, UpdateBrandDto } from '../types/brand.types';
import { MediaCategory } from '@/features/media/types/media.types';

const createBrandSchema = (t: (key: string, opts?: any) => string) => z.object({
  name: z
    .string()
    .min(2, t('validation.nameMinLength'))
    .max(100, t('validation.nameMaxLength')),
  nameEn: z
    .string()
    .min(2, t('validation.nameEnRequired'))
    .max(100, t('validation.nameMaxLength')),
  image: z.string().min(1, t('validation.imageRequired')),
  description: z.string().max(500, t('validation.descriptionMaxLength')).optional(),
  descriptionEn: z.string().max(500, t('validation.descriptionMaxLength')).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0, t('validation.sortOrderMin')).optional(),
});

type BrandFormData = z.infer<ReturnType<typeof createBrandSchema>>;

export const BrandFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('brands');
  const { isMobile } = useBreakpoint();
  const isEditMode = id !== 'new' && !!id;
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const brandSchema = createBrandSchema(t);
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
      <Box p={{ xs: 2, sm: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || t('messages.loadError')}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/brands')}
          fullWidth={isMobile}
        >
          {t('back')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/brands')}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('back')}
          </Button>
          <Business fontSize={isMobile ? 'medium' : 'large'} color="primary" />
          <Typography 
            variant="h4" 
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            {isEditMode ? t('brands.editBrand') : t('brands.createBrand')}
          </Typography>
        </Box>
      </Box>

      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: 'background.paper',
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}
        >
          {isEditMode ? t('brands.editBrand') : t('brands.createBrand')}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          {isEditMode ? t('form.settingsDesc') : t('form.basicInfoDesc')}
        </Typography>

        <Divider sx={{ mb: { xs: 3, sm: 4 } }} />

        {/* رسائل الخطأ */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError.message || t('messages.unknownError')}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ mb: { xs: 3, sm: 4 } }}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
        >
          <Tab label={t('form.tabs.arabic')} />
          <Tab label={t('form.tabs.english')} />
        </Tabs>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {/* المحتوى العربي */}
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="name"
                      label={t('form.brandNameAr')}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="description"
                      label={t('form.brandDescriptionAr')}
                      multiline
                      rows={isMobile ? 3 : 4}
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
                      label={t('form.brandNameEn')}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="descriptionEn"
                      label={t('form.brandDescriptionEn')}
                      multiline
                      rows={isMobile ? 3 : 4}
                      fullWidth
                      disabled={isSubmitting}
                    />
                  </Grid>
                </>
              )}

              {/* صورة العلامة التجارية */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.brandImage')}
                </Typography>
                <ImageField
                  label={t('form.brandLogo')}
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('image', media?.url || '');
                  }}
                  category={MediaCategory.BRAND}
                  helperText={t('form.imageHelper')}
                  disabled={isSubmitting}
                />
              </Grid>

              {/* إعدادات إضافية */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  {t('form.settings')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput
                  name="sortOrder"
                  label={t('form.sortOrder')}
                  type="number"
                  fullWidth
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: { xs: 2, sm: 3 }, 
                    alignItems: 'center', 
                    height: '100%',
                    pt: { xs: 1, md: 0 },
                  }}
                >
                  <FormControlLabel
                    control={<Switch {...methods.register('isActive')} disabled={isSubmitting} />}
                    label={t('form.isActive')}
                  />
                </Box>
              </Grid>

              {/* أزرار التحكم */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: { xs: 2, sm: 3 } }} />
                <Box 
                  display="flex" 
                  gap={2} 
                  justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    size={isMobile ? 'medium' : 'large'}
                    fullWidth={isMobile}
                  >
                    {t('form.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                    disabled={isSubmitting}
                    size={isMobile ? 'medium' : 'large'}
                    fullWidth={isMobile}
                  >
                    {isEditMode ? t('form.update') : t('form.create')}
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
