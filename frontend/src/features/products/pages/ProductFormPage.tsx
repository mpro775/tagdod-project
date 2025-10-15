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
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { ImageField } from '@/features/media';
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { ProductStatus } from '../types/product.types';
import type { CreateProductDto } from '../types/product.types';

// Validation Schema
const productSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  nameEn: z.string().min(2, 'الاسم بالإنجليزية يجب أن يكون حرفين على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  descriptionEn: z.string().min(10, 'الوصف بالإنجليزية يجب أن يكون 10 أحرف على الأقل'),
  categoryId: z.string().min(1, 'يجب اختيار فئة'),
  brandId: z.string().optional(),
  sku: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<any>(null);

  // Form
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      categoryId: '',
      status: ProductStatus.DRAFT,
      isFeatured: false,
      isNew: false,
    },
  });

  // API
  const { data: product, isLoading } = useProduct(id!);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  // Load product data in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      methods.reset({
        name: product.name,
        nameEn: product.nameEn,
        description: product.description,
        descriptionEn: product.descriptionEn,
        categoryId: product.categoryId,
        brandId: product.brandId,
        sku: product.sku,
        status: product.status,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        imageUrl: product.imageUrl,
      });
      
      // Set image if exists
      if (product.imageUrl) {
        setSelectedImage({ url: product.imageUrl, name: 'صورة المنتج' });
      }
    }
  }, [product, isEditMode, methods]);

  // Submit
  const onSubmit = (data: ProductFormData) => {
    const productData: CreateProductDto = {
      name: data.name,
      nameEn: data.nameEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      categoryId: data.categoryId,
      brandId: data.brandId,
      sku: data.sku,
      status: data.status,
      isFeatured: data.isFeatured,
      isNew: data.isNew,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      imageUrl: selectedImage?.url || data.imageUrl,
    };

    if (isEditMode) {
      updateProduct(
        { id: id!, data: productData },
        {
          onSuccess: () => {
            navigate('/products');
          },
        }
      );
    } else {
      createProduct(productData, {
        onSuccess: () => {
          navigate('/products');
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
          {isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}
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
                    <FormInput name="name" label="اسم المنتج (عربي) *" />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="description" label="وصف المنتج (عربي) *" multiline rows={4} />
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
                    <FormInput name="nameEn" label="Product Name (English) *" />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="descriptionEn"
                      label="Product Description (English) *"
                      multiline
                      rows={4}
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

              {/* Product Image */}
              <Grid size={{ xs: 12 }}>
                <ImageField
                  label="صورة المنتج"
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('imageUrl', media?.url || '');
                  }}
                  category="product"
                  helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="categoryId"
                  label="الفئة *"
                  options={[
                    { value: '', label: 'اختر الفئة' },
                    // TODO: Load from API
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="brandId"
                  label="العلامة التجارية"
                  options={[
                    { value: '', label: 'اختر العلامة' },
                    // TODO: Load from API
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="sku" label="رقم المنتج (SKU)" />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="status"
                  label="حالة المنتج *"
                  options={[
                    { value: ProductStatus.DRAFT, label: 'مسودة' },
                    { value: ProductStatus.ACTIVE, label: 'نشط' },
                    { value: ProductStatus.OUT_OF_STOCK, label: 'نفذ' },
                    { value: ProductStatus.DISCONTINUED, label: 'متوقف' },
                  ]}
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
                    onClick={() => navigate('/products')}
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
