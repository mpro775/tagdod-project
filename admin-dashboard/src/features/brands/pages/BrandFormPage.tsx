import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Grid, FormControlLabel, Switch, Typography, Alert, Skeleton } from '@mui/material';
import { PageShell, PageHeader, SectionCard, FormActionBar } from '@/shared/design-system';
import { FormInput } from '@/shared/components/Form/FormInput';
import { ImageField } from '@/features/media';
import { useBrand, useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import type { CreateBrandDto, UpdateBrandDto } from '../types/brand.types';
import { MediaCategory } from '@/features/media/types/media.types';

const createBrandSchema = (t: (key: string, opts?: any) => string) => z.object({
  name: z.string().min(2, t('validation.nameMinLength')).max(100, t('validation.nameMaxLength')),
  nameEn: z.string().min(2, t('validation.nameEnRequired')).max(100, t('validation.nameMaxLength')),
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
  const isEditMode = id !== 'new' && !!id;
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const brandSchema = createBrandSchema(t);
  const methods = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '', nameEn: '', image: '', description: '', descriptionEn: '', isActive: true, sortOrder: 0,
    },
  });

  const { data: brand, isLoading } = useBrand(id!);
  const { mutate: createBrand, isPending: isCreating, error: createError } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating, error: updateError } = useUpdateBrand();
  const isSubmitting = isCreating || isUpdating;
  const submitError = createError || updateError;

  useEffect(() => {
    if (isEditMode && brand) {
      methods.reset({
        name: brand.name, nameEn: brand.nameEn, image: brand.image,
        description: brand.description || '', descriptionEn: brand.descriptionEn || '',
        isActive: brand.isActive, sortOrder: brand.sortOrder,
      });
      setSelectedImage({ url: brand.image, name: brand.name });
    } else {
      methods.reset({ name: '', nameEn: '', image: '', description: '', descriptionEn: '', isActive: true, sortOrder: 0 });
      setSelectedImage(null);
    }
  }, [brand, isEditMode, methods]);

  const onSubmit = (data: BrandFormData) => {
    const brandData: CreateBrandDto | UpdateBrandDto = {
      ...data,
      image: selectedImage?.url || data.image,
    };
    if (isEditMode) {
      updateBrand({ id: id!, data: brandData as UpdateBrandDto }, { onSuccess: () => navigate('/brands') });
    } else {
      createBrand(brandData as CreateBrandDto, { onSuccess: () => navigate('/brands') });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <PageShell spacing="compact" fullHeight>
        <Skeleton variant="rectangular" sx={{ mb: 2, borderRadius: 2, bgcolor: 'background.paper', height: 50 }} />
        <Skeleton variant="rectangular" sx={{ borderRadius: 2, bgcolor: 'background.paper', height: 400 }} />
      </PageShell>
    );
  }

  return (
    <FormProvider {...methods}>
      <PageShell spacing="compact" fullHeight>
        <PageHeader
          variant="compact"
          title={isEditMode ? t('brands.editBrand') : t('brands.createBrand')}
          breadcrumbs={[
            { label: t('common.home', { ns: 'common' }), to: '/' },
            { label: t('pageTitle'), to: '/brands' },
            { label: isEditMode ? t('brands.editBrand') : t('brands.createBrand') },
          ]}
        />

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError.message || t('messages.unknownError')}
          </Alert>
        )}

        <SectionCard title={t('form.tabs.arabic')} description={t('form.basicInfoDesc')}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormInput name="name" label={t('form.brandNameAr')} disabled={isSubmitting} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="description" label={t('form.brandDescriptionAr')} multiline rows={3} disabled={isSubmitting} />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title={t('form.tabs.english')}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormInput name="nameEn" label={t('form.brandNameEn')} disabled={isSubmitting} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="descriptionEn" label={t('form.brandDescriptionEn')} multiline rows={3} disabled={isSubmitting} />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title={t('form.brandImage')}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
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
          </Grid>
        </SectionCard>

        <SectionCard title={t('form.settings')}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="sortOrder" label={t('form.sortOrder')} type="number" disabled={isSubmitting} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isActive"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} disabled={isSubmitting} />}
                    label={<Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('form.isActive')}</Typography>}
                  />
                )}
              />
            </Grid>
          </Grid>
        </SectionCard>

        <FormActionBar
          onSubmit={methods.handleSubmit(onSubmit)}
          onCancel={() => navigate('/brands')}
          submitLabel={isEditMode ? t('form.update') : t('form.create')}
          cancelLabel={t('form.cancel')}
          loading={isSubmitting}
        />
      </PageShell>
    </FormProvider>
  );
};