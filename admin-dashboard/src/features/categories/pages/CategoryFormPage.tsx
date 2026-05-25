import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Grid, FormControlLabel, Switch, Typography, Skeleton } from '@mui/material';
import { PageShell, PageHeader, SectionCard, FormActionBar } from '@/shared/design-system';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { ImageField } from '@/features/media';
import { useCategory, useCategories, useCreateCategory, useUpdateCategory } from '../hooks/useCategories';
import type { CreateCategoryDto } from '../types/category.types';
import { MediaCategory } from '@/features/media/types/media.types';

const createCategorySchema = (t: (key: string) => string) => z.object({
  parentId: z.string().optional().nullable(),
  name: z.string().min(2, t('validation.nameRequired')),
  nameEn: z.string().min(2, t('validation.nameEnRequired')),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  imageId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  order: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const CategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('categories');
  const isEditMode = id !== 'new' && !!id;

  const categorySchema = createCategorySchema(t);
  type CategoryFormData = z.infer<typeof categorySchema>;

  const [selectedImage, setSelectedImage] = React.useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      parentId: null, name: '', nameEn: '', description: '', descriptionEn: '',
      imageId: '', metaTitle: '', metaDescription: '', metaKeywords: [],
      order: 0, isActive: true, isFeatured: false,
    },
  });

  const { data: category, isLoading } = useCategory(id!, { refetchOnWindowFocus: false });
  const { data: categoriesResponse = [] } = useCategories({});
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  useEffect(() => {
    if (isEditMode && category && !isDataLoaded && !isLoading) {
      methods.reset({
        parentId: category.parentId, name: category.name, nameEn: category.nameEn,
        description: category.description, descriptionEn: category.descriptionEn,
        imageId: typeof category.imageId === 'string' ? category.imageId : category.imageId?._id,
        metaTitle: category.metaTitle, metaDescription: category.metaDescription,
        metaKeywords: category.metaKeywords || [], order: category.order || 0,
        isActive: category.isActive, isFeatured: category.isFeatured,
      });
      if (category.imageId) {
        const img = typeof category.imageId === 'string'
          ? { _id: category.imageId, url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/uploads/${category.imageId}`, filename: 'صورة الفئة' }
          : { _id: category.imageId._id, url: category.imageId.url, filename: category.imageId.filename || 'صورة الفئة', mimeType: category.imageId.mimeType };
        setSelectedImage(img);
      }
      setIsDataLoaded(true);
    }
  }, [category, isEditMode, methods, isDataLoaded, isLoading]);

  const onSubmit = (data: CategoryFormData) => {
    const categoryData: CreateCategoryDto = {
      parentId: data.parentId || null, name: data.name, nameEn: data.nameEn,
      description: data.description || undefined, descriptionEn: data.descriptionEn || undefined,
      imageId: selectedImage?._id || selectedImage?.id || data.imageId || undefined,
      metaTitle: data.metaTitle || undefined, metaDescription: data.metaDescription || undefined,
      metaKeywords: data.metaKeywords || undefined, order: data.order,
      isActive: data.isActive, isFeatured: data.isFeatured,
    };
    const mutation = isEditMode ? updateCategory : createCategory;
    const payload = isEditMode ? { id: id!, data: categoryData } : categoryData;
    mutation(payload as any, { onSuccess: () => navigate('/categories') });
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
          title={isEditMode ? t('categories.editCategory') : t('categories.createCategory')}
          breadcrumbs={[
            { label: t('common.home', { ns: 'common' }), to: '/' },
            { label: t('categories.manageCategories'), to: '/categories' },
            { label: isEditMode ? t('categories.editCategory') : t('categories.createCategory') },
          ]}
        />

        <SectionCard title={t('form.basicInfo')} description={t('form.basicInfoDesc', { defaultValue: '' })}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormInput name="name" label={t('form.categoryNameAr')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="nameEn" label={t('form.categoryNameEn')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="description" label={t('form.descriptionAr')} multiline rows={3} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="descriptionEn" label={t('form.descriptionEn')} multiline rows={3} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="parentId"
                label={t('form.parentCategory')}
                options={[
                  { value: '', label: t('form.noParent') },
                  ...categories.filter((c: any) => !isEditMode || c._id !== id).map((c: any) => ({ value: c._id, label: `${c.name} (${c.nameEn})` })),
                ]}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="order" label={t('form.order')} type="number" placeholder={t('placeholders.order')} />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title={t('form.imagesMedia')} description={t('form.imageHelper', { defaultValue: '' })}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ImageField
                label={t('form.categoryImage')}
                value={selectedImage}
                onChange={(media: any) => {
                  setSelectedImage(media);
                  methods.setValue('imageId', media?._id || media?.id || '');
                }}
                category={MediaCategory.CATEGORY}
                helperText={t('form.imageHelper')}
              />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title={t('form.seo')} description={t('form.seoHelper', { defaultValue: '' })}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormInput name="metaTitle" label={t('form.metaTitle')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormInput name="metaDescription" label={t('form.metaDescription')} multiline rows={3} />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title={t('form.settings')}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isActive"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value ?? true} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('form.isActive')}</Typography>}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isFeatured"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('form.isFeatured')}</Typography>}
                  />
                )}
              />
            </Grid>
          </Grid>
        </SectionCard>

        <FormActionBar
          onSubmit={methods.handleSubmit(onSubmit, () => toast.error(t('validation.fillRequiredFields')))}
          onCancel={() => navigate('/categories')}
          submitLabel={isEditMode ? t('form.update') : t('form.create')}
          cancelLabel={t('form.cancel')}
          loading={isCreating || isUpdating}
        />
      </PageShell>
    </FormProvider>
  );
};