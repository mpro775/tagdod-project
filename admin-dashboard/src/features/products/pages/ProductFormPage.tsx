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
import { useProduct, useCreateProduct, useUpdateProduct, useGenerateVariants } from '../hooks/useProducts';
import { useProductFormData } from '../hooks/useProductData';
import { AttributeSelector } from '../components/AttributeSelector';
import { MultipleImagesSelector } from '../components/MultipleImagesSelector';
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
  isBestseller: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  attributes: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  // Default pricing and inventory for variants
  defaultPrice: z.number().min(0).optional(),
  defaultStock: z.number().min(0).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<any>(null);
  const [selectedImages, setSelectedImages] = React.useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = React.useState<string[]>([]);
  const [metaKeywords, setMetaKeywords] = React.useState<string[]>([]);
  const [defaultPrice, setDefaultPrice] = React.useState<number>(0);
  const [defaultStock, setDefaultStock] = React.useState<number>(0);

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
  const { mutateAsync: generateVariants, isPending: isGeneratingVariants } = useGenerateVariants();
  const { categoryOptions, brandOptions, isLoading: dataLoading } = useProductFormData();

  // Generate variants handler
  const handleGenerateVariants = async () => {
    if (!isEditMode || !id) {
      alert('يجب حفظ المنتج أولاً قبل توليد المتغيرات');
      return;
    }

    if (selectedAttributes.length === 0) {
      alert('يجب اختيار سمات واحدة على الأقل لتوليد المتغيرات');
      return;
    }

    if (defaultPrice <= 0 || defaultStock <= 0) {
      alert('يجب إدخال سعر وكمية افتراضية صحيحة');
      return;
    }

    try {
      await generateVariants({
        productId: id,
        data: {
          defaultPrice,
          defaultStock,
          overwriteExisting: false, // لا نريد الكتابة فوق المتغيرات الموجودة
        },
      });

      alert('تم توليد المتغيرات بنجاح! يمكنك الآن عرضها في صفحة المتغيرات.');
    } catch {
      // الخطأ سيتم التعامل معه تلقائياً بواسطة ErrorHandler في الـ hook
      // لا نحتاج لمعالجة إضافية هنا
    }
  };

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
        isBestseller: product.isBestseller,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        metaKeywords: product.metaKeywords || [],
        attributes: product.attributes || [],
        imageUrl: product.mainImage,
      });
      
      // Set main image if exists
      if (product.mainImage) {
        setSelectedImage({ url: product.mainImage, name: 'صورة المنتج' });
      }

      // Set additional images
      if (product.images && product.images.length > 0) {
        const additionalImages = product.images.map((url, index) => ({
          url,
          name: `صورة إضافية ${index + 1}`,
        }));
        setSelectedImages(additionalImages);
      }

      // Set attributes and keywords
      setSelectedAttributes(product.attributes || []);
      setMetaKeywords(product.metaKeywords || []);
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
      isBestseller: data.isBestseller,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: metaKeywords,
      attributes: selectedAttributes,
      mainImage: selectedImage?.url || data.imageUrl,
      images: selectedImages.map(img => img.url),
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

              {/* Product Images */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  صور المنتج
                </Typography>
              </Grid>

              {/* Main Image */}
              <Grid size={{ xs: 12 }}>
                <ImageField
                  label="الصورة الرئيسية"
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('imageUrl', media?.url || '');
                  }}
                  category="product"
                  helperText="الصورة الرئيسية التي ستظهر في قوائم المنتجات"
                />
              </Grid>

              {/* Additional Images */}
              <Grid size={{ xs: 12 }}>
                <MultipleImagesSelector
                  label="صور إضافية"
                  value={selectedImages}
                  onChange={setSelectedImages}
                  maxImages={8}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="categoryId"
                  label="الفئة *"
                  options={[
                    { value: '', label: 'اختر الفئة' },
                    ...categoryOptions,
                  ]}
                  disabled={dataLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="brandId"
                  label="العلامة التجارية"
                  options={[
                    { value: '', label: 'اختر العلامة' },
                    ...brandOptions,
                  ]}
                  disabled={dataLoading}
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
                    { value: ProductStatus.ARCHIVED, label: 'مؤرشف' },
                  ]}
                />
              </Grid>

              {/* Attributes */}
              <Grid size={{ xs: 12 }}>
                <AttributeSelector
                  value={selectedAttributes}
                  onChange={setSelectedAttributes}
                />
              </Grid>

              {/* Badges */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  الشارات
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="isFeatured"
                  label="منتج مميز"
                  type="checkbox"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="isNew"
                  label="منتج جديد"
                  type="checkbox"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormInput
                  name="isBestseller"
                  label="الأكثر مبيعاً"
                  type="checkbox"
                />
              </Grid>

              {/* Default Pricing and Inventory */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  السعر والكمية الافتراضية
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  هذه القيم ستُستخدم عند إنشاء متغيرات جديدة للمنتج
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  السعر الافتراضي (ريال سعودي) *
                </Typography>
                <input
                  type="number"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  الكمية الافتراضية *
                </Typography>
                <input
                  type="number"
                  value={defaultStock}
                  onChange={(e) => setDefaultStock(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </Grid>

              {/* Generate Variants Button */}
              {selectedAttributes.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      💡 يمكنك الآن توليد متغيرات تلقائياً بناءً على السمات المختارة
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={defaultPrice <= 0 || defaultStock <= 0 || isGeneratingVariants}
                      onClick={() => {
                        if (window.confirm(`هل تريد توليد متغيرات تلقائياً للسعر ${defaultPrice} ريال والكمية ${defaultStock}؟`)) {
                          handleGenerateVariants();
                        }
                      }}
                    >
                      {isGeneratingVariants ? 'جاري التوليد...' : 'توليد المتغيرات'}
                    </Button>
                  </Box>
                </Grid>
              )}

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

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  الكلمات المفتاحية
                </Typography>
                <input
                  type="text"
                  placeholder="أدخل الكلمات مفصولة بفاصلة"
                  value={metaKeywords.join(', ')}
                  onChange={(e) => {
                    const keywords = e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter((k) => k.length > 0);
                    setMetaKeywords(keywords);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  اكتب الكلمات مفصولة بفاصلة، مثال: منتج، جودة، سعر
                </Typography>
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
