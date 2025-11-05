import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
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
  useTheme,
} from '@mui/material';
import { 
  Save, 
  Cancel, 
  ArrowBack, 
} from '@mui/icons-material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
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
  const theme = useTheme();
  const { isMobile, isXs } = useBreakpoint();
  const isEditMode = id !== 'new' && !!id;

  const categorySchema = createCategorySchema(t);
  type CategoryFormData = z.infer<typeof categorySchema>;

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
        imageId: typeof category.imageId === 'string' ? category.imageId : category.imageId?._id,
        metaTitle: category.metaTitle,
        metaDescription: category.metaDescription,
        metaKeywords: category.metaKeywords || [],
        order: category.order || 0,
        isActive: category.isActive,
        isFeatured: category.isFeatured,
      });
      
      // Set image if exists
      if (category.imageId) {
        if (typeof category.imageId === 'string') {
          setSelectedImage({ 
            _id: category.imageId, 
            url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/uploads/${category.imageId}`,
            filename: 'صورة الفئة' 
          });
        } else if (typeof category.imageId === 'object' && category.imageId !== null) {
          setSelectedImage({
            _id: category.imageId._id,
            url: category.imageId.url,
            filename: category.imageId.filename || 'صورة الفئة',
            mimeType: category.imageId.mimeType,
          });
        }
      }
    }
  }, [category, isEditMode, methods]);

  // Submit
  const onSubmit = (data: CategoryFormData) => {
    // eslint-disable-next-line no-console
    console.log('📤 Category form data:', data);
    // eslint-disable-next-line no-console
    console.log('🖼️ Selected image:', selectedImage);
    
    const categoryData: CreateCategoryDto = {
      parentId: data.parentId || null,
      name: data.name,
      nameEn: data.nameEn,
      description: data.description || undefined,
      descriptionEn: data.descriptionEn || undefined,
      imageId: selectedImage?._id || selectedImage?.id || data.imageId || undefined,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      metaKeywords: data.metaKeywords || undefined,
      order: data.order,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    };
    
    // eslint-disable-next-line no-console
    console.log('📦 Category data to send:', categoryData);

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
    t('form.basicInfo'),
    t('form.imagesMedia'),
    t('form.seo'),
    t('form.settings'),
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
        <Skeleton 
          variant="rectangular" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            height: { xs: 50, sm: 60 },
          }} 
        />
        <Skeleton 
          variant="rectangular" 
          sx={{
            borderRadius: 2,
            bgcolor: 'background.paper',
            height: { xs: 300, sm: 400 },
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 3 
        }}
      >
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <IconButton 
            onClick={() => navigate('/categories')} 
            sx={{ 
              fontSize: { xs: 'medium', sm: 'large' },
            }}
            size={isMobile ? 'medium' : 'large'}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h4" 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: 'text.primary',
            }}
          >
            {isEditMode ? t('categories.editCategory') : t('categories.createCategory')}
          </Typography>
        </Box>
        {isEditMode && category && (
          <Chip
            label={category.isActive ? t('status.active') : t('status.inactive')}
            color={category.isActive ? 'success' : 'default'}
            sx={{ 
              ml: { xs: 0, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          />
        )}
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel={!isXs}
            orientation={isXs ? 'vertical' : 'horizontal'}
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            }}
          >
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
            toast.error(t('validation.fillRequiredFields'));
          }
        )}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 3 },
              bgcolor: 'background.paper',
            }}
          >
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                  }}
                >
                  {t('form.basicInfo')}
                </Typography>
                
                <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                    <FormInput name="order" label={t('form.order')} type="number" placeholder={t('placeholders.order')} />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Images and Media */}
            {activeStep === 1 && (
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                  }}
                >
                  {t('form.imagesMedia')}
                </Typography>

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'grey.50',
                        border: 1,
                        borderColor: 'divider',
                        mb: 2,
                      }}
                    >
                      <ImageField
                        label={t('form.categoryImage')}
                        value={selectedImage}
                        onChange={(media: any) => {
                          // eslint-disable-next-line no-console
                          console.log('🖼️ ImageField onChange - media:', media);
                          setSelectedImage(media);
                          // استخراج ID من Media object (قد يكون _id أو id)
                          const mediaId = media?._id || media?.id || '';
                          // eslint-disable-next-line no-console
                          console.log('🆔 Extracted mediaId:', mediaId);
                          methods.setValue('imageId', mediaId);
                        }}
                        category={MediaCategory.CATEGORY}
                        helperText={t('form.imageHelper')}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 3: SEO */}
            {activeStep === 2 && (
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                  }}
                >
                  {t('form.seo')}
                </Typography>

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid size={{ xs: 12 }}>
                    <FormInput name="metaTitle" label={t('form.metaTitle')} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="metaDescription"
                      label={t('form.metaDescription')}
                      multiline
                      rows={3}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mt: { xs: 1, sm: 2 },
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(33, 150, 243, 0.1)' 
                          : undefined,
                      }}
                    >
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'text.primary',
                        }}
                      >
                        {t('form.seoHelper')}
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 4: Settings */}
            {activeStep === 3 && (
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: 'text.primary',
                  }}
                >
                  {t('form.settings')}
                </Typography>

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            {...methods.register('isActive')}
                            defaultChecked={methods.getValues('isActive')}
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              color: 'text.primary',
                            }}
                          >
                            {t('form.isActive')}
                          </Typography>
                        }
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            {...methods.register('isFeatured')}
                            defaultChecked={methods.getValues('isFeatured')}
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              color: 'text.primary',
                            }}
                          >
                            {t('form.isFeatured')}
                          </Typography>
                        }
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Alert 
                      severity="warning"
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(237, 108, 2, 0.1)' 
                          : undefined,
                      }}
                    >
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'text.primary',
                        }}
                      >
                        {t('form.inactiveWarning')}
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'stretch', sm: 'center' },
                mt: { xs: 3, sm: 4 },
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Box>
                {activeStep > 0 && (
                  <Button 
                    onClick={handleBack} 
                    startIcon={<ArrowBack />}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'large'}
                  >
                    {t('form.previous')}
                  </Button>
                )}
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/categories')}
                  fullWidth={isMobile}
                  size={isMobile ? 'medium' : 'large'}
                >
                  {t('form.cancel')}
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button 
                    variant="contained" 
                    onClick={handleNext}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'large'}
                  >
                    {t('form.next')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'large'}
                  >
                    {isEditMode ? t('form.update') : t('form.create')}
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
