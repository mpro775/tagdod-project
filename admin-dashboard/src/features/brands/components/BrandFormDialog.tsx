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
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageField } from '@/features/media';
import { useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import type { Brand, CreateBrandDto, UpdateBrandDto } from '../types/brand.types';

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

interface BrandFormDialogProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand | null;
  mode: 'create' | 'edit';
}

export const BrandFormDialog: React.FC<BrandFormDialogProps> = ({ open, onClose, brand, mode }) => {
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
          {mode === 'create' ? 'إضافة علامة تجارية جديدة' : 'تعديل العلامة التجارية'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'حدث خطأ أثناء العملية'}
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
              <Tab label="العربية 🇸🇦" />
              <Tab label="English 🇬🇧" />
            </Tabs>

            <Grid container spacing={3}>
              {/* المحتوى العربي */}
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="اسم العلامة التجارية (عربي) *"
                      {...methods.register('name')}
                      error={!!methods.formState.errors.name}
                      helperText={methods.formState.errors.name?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="وصف العلامة التجارية (عربي)"
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
                      label="Brand Name (English) *"
                      {...methods.register('nameEn')}
                      error={!!methods.formState.errors.nameEn}
                      helperText={methods.formState.errors.nameEn?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Brand Description (English)"
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
                  صورة العلامة التجارية
                </Typography>
                <ImageField
                  label="شعار العلامة التجارية"
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('image', media?.url || '');
                  }}
                  category="brand"
                  helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
                  disabled={isLoading}
                />
              </Grid>

              {/* إعدادات إضافية */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  الإعدادات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="ترتيب العرض"
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
                    label="نشط"
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
          إلغاء
        </Button>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
          onClick={methods.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {mode === 'create' ? 'إنشاء' : 'حفظ التغييرات'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
