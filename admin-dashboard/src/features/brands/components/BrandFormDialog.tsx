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
  useTheme,
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

interface BrandFormDialogProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand | null;
  mode: 'create' | 'edit';
}

export const BrandFormDialog: React.FC<BrandFormDialogProps> = ({ open, onClose, brand, mode }) => {
  const { t } = useTranslation('brands');
  const theme = useTheme();
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
          sx: { 
            minHeight: '70vh',
            bgcolor: 'background.paper',
          },
        }}
      >
      <DialogTitle sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        {mode === 'create' ? t('dialogs.createTitle') : t('dialogs.editTitle')}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || t('messages.unknownError')}
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
              <Tab label={t('form.tabs.arabic')} />
              <Tab label={t('form.tabs.english')} />
            </Tabs>

            <Grid container spacing={3}>
              {/* المحتوى العربي */}
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandNameAr')}
                      {...methods.register('name')}
                      error={!!methods.formState.errors.name}
                      helperText={methods.formState.errors.name?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandDescriptionAr')}
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
                      label={t('form.brandNameEn')}
                      {...methods.register('nameEn')}
                      error={!!methods.formState.errors.nameEn}
                      helperText={methods.formState.errors.nameEn?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('form.brandDescriptionEn')}
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
                <Divider 
                  sx={{ 
                    my: 2,
                    borderColor: 'divider',
                  }} 
                />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: 'text.primary',
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  {t('form.brandImage')}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'grey.50',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <ImageField
                    label={t('form.brandLogo')}
                    value={selectedImage}
                    onChange={(media) => {
                      setSelectedImage(media);
                      methods.setValue('image', media?.url || '');
                    }}
                    category={MediaCategory.BRAND}
                    helperText={t('form.imageHelper')}
                    disabled={isLoading}
                    error={!!methods.formState.errors.image}
                  />
                  {methods.formState.errors.image && (
                    <Typography 
                      variant="caption" 
                      color="error" 
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {methods.formState.errors.image.message}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* إعدادات إضافية */}
              <Grid size={{ xs: 12 }}>
                <Divider 
                  sx={{ 
                    my: 2,
                    borderColor: 'divider',
                  }} 
                />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    color: 'text.primary',
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  {t('form.settings')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                    label={t('form.sortOrder')}
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
                    label={t('form.isActive')}
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
          {t('form.cancel')}
        </Button>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
          onClick={methods.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {mode === 'create' ? t('form.create') : t('form.update')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
