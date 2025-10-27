import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
    CircularProgress,
  FormControlLabel,
  Switch,
  Alert,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  IconButton,
  Skeleton,
} from '@mui/material';
import { 
  Save, 
  Cancel, 
  ArrowBack, 
} from '@mui/icons-material';
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
import { MediaCategory } from '@/features/media/types/media.types';

// Validation Schema
const categorySchema = z.object({
  parentId: z.string().optional().nullable(),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية يجب أن يكون حرفين على الأقل'),
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

type CategoryFormData = z.infer<typeof categorySchema>;

export const CategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  const [selectedImage, setSelectedImage] = React.useState<any>(null);
  const [activeStep, setActiveStep] = React.useState(0);

  // Form
  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      parentId: null,
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      imageId: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      order: 0,
      isActive: true,
      isFeatured: false,
    },
  });

  // API
  const { data: category, isLoading } = useCategory(id!);
  const { data: categoriesResponse = [] } = useCategories({}); // For parent selector
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
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
        imageId: category.imageId,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        metaKeywords: category.metaKeywords || [],
        order: category.order || 0,
        isActive: category.isActive,
        isFeatured: category.isFeatured,
      });
      
      // Set image if exists
      if (category.imageId) {
        setSelectedImage({ id: category.imageId, name: 'صورة الفئة' });
      }
    }
  }, [category, isEditMode, methods]);

  // Submit
  const onSubmit = (data: CategoryFormData) => {
    const categoryData: CreateCategoryDto = {
      parentId: data.parentId || null,
      name: data.name,
      nameEn: data.nameEn,
      description: data.description || undefined,
      descriptionEn: data.descriptionEn || undefined,
      imageId: selectedImage?.id || data.imageId || undefined,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      metaKeywords: data.metaKeywords || undefined,
      order: data.order,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    };

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

  const steps = [
    'المعلومات الأساسية',
    'الصور والوسائط',
    'تحسين محركات البحث',
    'الإعدادات',
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (isEditMode && isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/categories')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
        </Typography>
        {isEditMode && category && (
          <Chip
            label={category.isActive ? 'نشط' : 'غير نشط'}
            color={category.isActive ? 'success' : 'default'}
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(
          onSubmit,
          () => {
            toast.error('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
          }
        )}>
          <Paper sx={{ p: 3 }}>
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  المعلومات الأساسية
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <FormInput name="name" label="اسم الفئة (عربي) *" />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="nameEn" label="Category Name (English) *" />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="description" label="وصف الفئة (عربي)" multiline rows={3} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="descriptionEn" label="Category Description (English)" multiline rows={3} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormSelect
                      name="parentId"
                      label="الفئة الأب (اختياري)"
                      options={[
                        { value: '', label: 'لا يوجد (فئة رئيسية)' },
                        ...categories
                          .filter((c: any) => !isEditMode || c._id !== id)
                          .map((c: any) => ({
                            value: c._id,
                            label: `${c.name} (${c.nameEn})`,
                          })),
                      ]}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormInput name="order" label="الترتيب" type="number" placeholder="0" />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Images and Media */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  الصور والوسائط
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <ImageField
                      label="صورة الفئة"
                      value={selectedImage}
                      onChange={(media: any) => {
                        setSelectedImage(media);
                        methods.setValue('imageId', media?.id || '');
                      }}
                      category={MediaCategory.CATEGORY}
                      helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 3: SEO */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  تحسين محركات البحث (SEO)
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <FormInput name="metaTitle" label="عنوان الصفحة (Meta Title)" />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="metaDescription"
                      label="وصف الصفحة (Meta Description)"
                      multiline
                      rows={3}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        هذه المعلومات تساعد في تحسين ظهور الفئة في محركات البحث
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 4: Settings */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  الإعدادات
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                            {...methods.register('isFeatured')}
                            defaultChecked={methods.getValues('isFeatured')}
                          />
                        }
                        label="فئة مميزة"
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        الفئات غير النشطة لن تظهر للعملاء في الموقع
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Box>
                {activeStep > 0 && (
                  <Button onClick={handleBack} startIcon={<ArrowBack />}>
                    السابق
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/categories')}
                >
                  إلغاء
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button variant="contained" onClick={handleNext}>
                    التالي
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                  >
                    {isEditMode ? 'تحديث' : 'إنشاء'}
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </form>
      </FormProvider>
    </Box>
  );
};
