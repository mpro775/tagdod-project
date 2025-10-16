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
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { ImageField } from '@/features/media';
import {
  useCategory,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from '../hooks/useCategories';
import type { CreateCategoryDto } from '../types/category.types';

// Validation Schema
const categorySchema = z.object({
  parentId: z.string().optional().nullable(),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية يجب أن يكون حرفين على الأقل'),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  order: z.union([
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? 0 : num;
    }),
    z.number(),
  ]).optional(),
  isActive: z.boolean().optional(),
  showInMenu: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const CategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<any>(null);

  // Form
  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      parentId: null,
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      order: '0',
      isActive: true,
      showInMenu: true,
      isFeatured: false,
    },
  });

  // API
  const { data: category, isLoading } = useCategory(id!);
  const { data: categoriesResponse = [] } = useCategories({}); // For parent selector
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || []);
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  // Load category data in edit mode
  useEffect(() => {
    if (isEditMode && category) {
      methods.reset({
        parentId: category.parentId,
        name: category.name,
        nameEn: category.nameEn,
        description: category.description,
        descriptionEn: category.descriptionEn,
        image: category.image,
        icon: category.icon,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        order: category.order?.toString() || '0',
        isActive: category.isActive,
        showInMenu: category.showInMenu,
        isFeatured: category.isFeatured,
      });
      
      // Set image if exists
      if (category.image) {
        setSelectedImage({ url: category.image, name: 'صورة الفئة' });
      }
    }
  }, [category, isEditMode, methods]);

  // Submit
  const onSubmit = (data: CategoryFormData) => {
    console.log('📤 Form data before submit:', data);
    
    const categoryData: CreateCategoryDto = {
      parentId: data.parentId || null,
      name: data.name,
      nameEn: data.nameEn,
      description: data.description || undefined,
      descriptionEn: data.descriptionEn || undefined,
      image: selectedImage?.url || data.image || undefined,
      icon: data.icon || undefined,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      order: data.order, // Already transformed by zod
      isActive: data.isActive,
      showInMenu: data.showInMenu,
      isFeatured: data.isFeatured,
    };

    console.log('📤 Category data to send:', categoryData);

    if (isEditMode) {
      updateCategory(
        { id: id!, data: categoryData },
        {
          onSuccess: () => {
            navigate('/categories');
          },
        }
      );
    } else {
      createCategory(categoryData, {
        onSuccess: () => {
          navigate('/categories');
        },
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {isEditMode ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Tabs for Languages */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="العربية 🇸🇦" />
          <Tab label="English 🇬🇧" />
        </Tabs>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Arabic Fields */}
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" gutterBottom>
                      المعلومات بالعربية
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="name" label="اسم الفئة (عربي) *" />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="description" label="وصف الفئة (عربي)" multiline rows={3} />
                  </Grid>
                </>
              )}

              {/* English Fields */}
              {activeTab === 1 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" gutterBottom>
                      English Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="nameEn" label="Category Name (English) *" />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="descriptionEn"
                      label="Category Description (English)"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </>
              )}

              {/* Common Fields */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  معلومات عامة
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="parentId"
                  label="الفئة الأب (اختياري)"
                  options={[
                    { value: '', label: 'لا يوجد (فئة رئيسية)' },
                    ...categories
                      .filter((c) => !isEditMode || c._id !== id)
                      .map((c) => ({
                        value: c._id,
                        label: `${c.name} (${c.nameEn})`,
                      })),
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="order" label="الترتيب" type="number" placeholder="0" />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="icon" label="الأيقونة (Emoji)" placeholder="🛍️" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ImageField
                  label="صورة الفئة"
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('image', media?.url || '');
                  }}
                  category="category"
                  helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
                />
              </Grid>

              {/* SEO */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  تحسين محركات البحث (SEO)
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormInput name="metaTitle" label="عنوان الصفحة (Meta Title)" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormInput
                  name="metaDescription"
                  label="وصف الصفحة (Meta Description)"
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Settings */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  الإعدادات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...methods.register('isActive')}
                        defaultChecked={methods.getValues('isActive')}
                      />
                    }
                    label="نشط"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        {...methods.register('showInMenu')}
                        defaultChecked={methods.getValues('showInMenu')}
                      />
                    }
                    label="عرض في القائمة الرئيسية"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        {...methods.register('isFeatured')}
                        defaultChecked={methods.getValues('isFeatured')}
                      />
                    }
                    label="فئة مميزة"
                  />
                </Box>
              </Grid>

              {/* Actions */}
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
                    onClick={() => navigate('/categories')}
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
