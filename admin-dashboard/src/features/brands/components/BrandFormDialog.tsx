import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageField } from '@/features/media';
import { useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import type { Brand, CreateBrandDto, UpdateBrandDto } from '../types/brand.types';
import { MediaCategory } from '@/features/media/types/media.types';

const createBrandSchema = (t: (key: string, opts?: any) => string) => z.object({
  name: z
    .string()
    .min(2, t('validation.nameMinLength', { defaultValue: 'يجب أن يكون الاسم بالعربية 2 أحرف على الأقل' }))
    .max(100, t('validation.nameMaxLength', { defaultValue: 'يجب ألا يتجاوز الاسم 100 حرف' })),
  nameEn: z
    .string()
    .min(2, t('validation.nameEnRequired', { defaultValue: 'يجب إدخال الاسم بالإنجليزية (2 أحرف على الأقل)' }))
    .max(100, t('validation.nameMaxLength', { defaultValue: 'يجب ألا يتجاوز الاسم 100 حرف' })),
  image: z.string().min(1, t('validation.imageRequired', { defaultValue: 'الصورة مطلوبة' })),
  description: z.string().max(500, t('validation.descriptionMaxLength', { defaultValue: 'الوصف لا يجب أن يتجاوز 500 حرف' })).optional(),
  descriptionEn: z.string().max(500, t('validation.descriptionMaxLength', { defaultValue: 'الوصف لا يجب أن يتجاوز 500 حرف' })).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0, t('validation.sortOrderMin', { defaultValue: 'ترتيب العرض يجب أن يكون رقمًا موجبًا' })).optional(),
});

type BrandFormData = z.infer<ReturnType<typeof createBrandSchema>>;

interface BrandFormDialogProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand | null;
  mode: 'create' | 'edit';
}

export const BrandFormDialog: React.FC<BrandFormDialogProps> = ({ open, onClose, brand, mode }) => {
  const { t } = useTranslation('brands');
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

  const { mutate: createBrand, isPending: isCreating, error: createError } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating, error: updateError } = useUpdateBrand();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  useEffect(() => {
    if (mode === 'edit' && brand) {
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
  }, [brand, mode, methods]);

  const onSubmit = (data: BrandFormData) => {
    const brandData: CreateBrandDto | UpdateBrandDto = {
      ...data,
      image: selectedImage?.url || data.image,
    };

    if (mode === 'create') {
      createBrand(brandData as CreateBrandDto, {
        onSuccess: () => {
          onClose();
          methods.reset();
          setSelectedImage(null);
        },
      });
    } else if (brand) {
      updateBrand(
        { id: brand._id, data: brandData as UpdateBrandDto },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      methods.reset();
      setSelectedImage(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {mode === 'create' ? t('dialogs.createTitle', { defaultValue: 'إضافة علامة تجارية' }) : t('dialogs.editTitle', { defaultValue: 'تعديل علامة تجارية' })}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || t('messages.unknownError', { defaultValue: 'حدث خطأ غير معروف' })}
          </Alert>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              sx={{ mb: 3 }}
              variant="fullWidth"
            >
              <Tab label={t('form.tabs.arabic', { defaultValue: 'العربية' })} />
              <Tab label={t('form.tabs.english', { defaultValue: 'الإنجليزية' })} />
            </Tabs>

            <Grid container spacing={3}>
              {/* المحتوى العربي */}
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandNameAr', { defaultValue: 'اسم العلامة (عربي)' })}
                      {...methods.register('name')}
                      error={!!methods.formState.errors.name}
                      helperText={methods.formState.errors.name?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandDescriptionAr', { defaultValue: 'وصف العلامة (عربي)' })}
                      multiline
                      rows={3}
                      {...methods.register('description')}
                      error={!!methods.formState.errors.description}
                      helperText={methods.formState.errors.description?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                </>
              )}

              {/* المحتوى الإنجليزي */}
              {activeTab === 1 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandNameEn', { defaultValue: 'اسم العلامة (إنجليزي)' })}
                      {...methods.register('nameEn')}
                      error={!!methods.formState.errors.nameEn}
                      helperText={methods.formState.errors.nameEn?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandDescriptionEn', { defaultValue: 'وصف العلامة (إنجليزي)' })}
                      multiline
                      rows={3}
                      {...methods.register('descriptionEn')}
                      error={!!methods.formState.errors.descriptionEn}
                      helperText={methods.formState.errors.descriptionEn?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                </>
              )}

              {/* صورة العلامة التجارية */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('form.brandImage', { defaultValue: 'صورة العلامة التجارية' })}
                </Typography>
                <ImageField
                  label={t('form.brandLogo', { defaultValue: 'شعار العلامة' })}
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('image', media?.url || '');
                  }}
                  category={MediaCategory.BRAND}
                  helperText={t('form.imageHelper', { defaultValue: 'اختر صورة مناسبة للشعار' })}
                  disabled={isLoading}
                />
              </Grid>

              {/* إعدادات إضافية */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('form.settings', { defaultValue: 'إعدادات' })}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t('form.sortOrder', { defaultValue: 'ترتيب العرض' })}
                  type="number"
                  {...methods.register('sortOrder', { valueAsNumber: true })}
                  error={!!methods.formState.errors.sortOrder}
                  helperText={methods.formState.errors.sortOrder?.message}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={<Switch {...methods.register('isActive')} disabled={isLoading} />}
                    label={t('form.isActive', { defaultValue: 'نشط' })}
                  />
                </Box>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={handleClose}
          disabled={isLoading}
        >
          {t('form.cancel', { defaultValue: 'إلغاء' })}
        </Button>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
          onClick={methods.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {mode === 'create' ? t('form.create', { defaultValue: 'حفظ' }) : t('form.update', { defaultValue: 'تحديث' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
