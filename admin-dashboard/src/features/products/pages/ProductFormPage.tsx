import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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
  Rating,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  TextField,
  Alert,
} from '@mui/material';
import { Save, Cancel, Star, Visibility, ShoppingCart, RateReview } from '@mui/icons-material';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { ImageField, MediaCategory } from '@/features/media';
import { useProduct, useCreateProduct, useUpdateProduct, useGenerateVariants } from '../hooks/useProducts';
import { useProductFormData } from '../hooks/useProductData';
import { AttributeSelector } from '../components/AttributeSelector';
import { MultipleImagesSelector } from '../components/MultipleImagesSelector';
import { RelatedProductsSelector } from '../components/RelatedProductsSelector';
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
  // التقييم اليدوي
  useManualRating: z.boolean().optional(),
  manualRating: z.coerce.number().min(0).max(5).optional(),
  manualReviewsCount: z.coerce.number().min(0).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductFormPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new' && !!id;

  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<any>(null);
  const [selectedImages, setSelectedImages] = React.useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = React.useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = React.useState<string[]>([]);
  const [metaKeywords, setMetaKeywords] = React.useState<string[]>([]);
  const [defaultPrice, setDefaultPrice] = React.useState<number>(0);
  const [defaultStock, setDefaultStock] = React.useState<number>(0);
  const [useManualRating, setUseManualRating] = React.useState<boolean>(false);
  const [manualRating, setManualRating] = React.useState<number>(0);
  const [manualReviewsCount, setManualReviewsCount] = React.useState<number>(0);
  const [confirmGenerateOpen, setConfirmGenerateOpen] = React.useState(false);
  const [overwriteExisting, setOverwriteExisting] = React.useState<boolean>(false);

  // Form
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      categoryId: '',
      status: ProductStatus.ACTIVE, // ✅ نشط بشكل افتراضي
      isFeatured: false,
      isNew: false,
      isBestseller: false,
      useManualRating: false,
      manualRating: 0,
      manualReviewsCount: 0,
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
    // التحقق من المدخلات أولاً
    if (selectedAttributes.length === 0) {
      toast.error(t('products:messages.needAttributes', 'يجب اختيار سمات لتوليد المتغيرات'));
      return;
    }

    if (defaultPrice <= 0) {
      toast.error(t('products:messages.needPrice', 'السعر الافتراضي مطلوب'));
      return;
    }

    if (defaultStock < 0) {
      toast.error(t('products:messages.needStock', 'الكمية الافتراضية مطلوبة'));
      return;
    }

    try {
      let productId = id;

      // إذا كان المنتج جديداً (غير محفوظ)، نحفظه أولاً تلقائياً
      if (!isEditMode || !id) {
        toast.loading(t('products:messages.saveProduct', 'جارٍ حفظ المنتج...'), { id: 'save-product' });
        
        // التحقق من صحة البيانات الأساسية
        const isValid = await methods.trigger();
        if (!isValid) {
          toast.error(t('products:messages.fillRequired', 'الرجاء ملء الحقول المطلوبة'), { id: 'save-product' });
          return;
        }

        // حفظ المنتج
        const formData = methods.getValues();
        const productData: CreateProductDto = {
          name: formData.name,
          nameEn: formData.nameEn,
          description: formData.description,
          descriptionEn: formData.descriptionEn,
          categoryId: formData.categoryId,
          brandId: formData.brandId,
          sku: formData.sku,
          status: formData.status,
          isFeatured: formData.isFeatured,
          isNew: formData.isNew,
          isBestseller: formData.isBestseller,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          metaKeywords: metaKeywords,
          attributes: selectedAttributes,
          relatedProducts: relatedProducts,
          mainImageId: selectedImage?._id,
          imageIds: selectedImages.map((img: any) => img._id).filter(Boolean),
          useManualRating: useManualRating,
          manualRating: useManualRating ? manualRating : undefined,
          manualReviewsCount: useManualRating ? manualReviewsCount : undefined,
        };

        // حفظ المنتج والحصول على الـ ID
        const savedProduct = await new Promise<any>((resolve, reject) => {
          createProduct(productData, {
            onSuccess: (data) => {
              toast.success(t('products:messages.productSaved', 'تم حفظ المنتج بنجاح'), { id: 'save-product' });
              resolve(data);
            },
            onError: (error) => {
              toast.error(t('products:messages.productSaveFailed', 'فشل حفظ المنتج'), { id: 'save-product' });
              reject(error);
            },
          });
        });

        productId = savedProduct._id;
        
        // تحديث URL للانتقال لوضع التعديل
        navigate(`/products/${productId}`, { replace: true });
        
        // انتظار قليل لتحديث الحالة
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // الآن نولد المتغيرات
      toast.loading(t('products:messages.generateVariants', 'جارٍ توليد المتغيرات...'), { id: 'generate-variants' });
      
      await generateVariants({
        productId: productId!,
        data: {
          defaultPrice,
          defaultStock,
          overwriteExisting,
        },
      });

      toast.success(t('products:messages.variantsGenerated', 'تم توليد المتغيرات بنجاح'), { id: 'generate-variants' });
      
      // الانتقال لصفحة المتغيرات
      setTimeout(() => {
        navigate(`/products/${productId}/variants`);
      }, 1000);
    } catch {
      toast.dismiss('save-product');
      toast.dismiss('generate-variants');
      // الخطأ سيتم التعامل معه تلقائياً بواسطة ErrorHandler في الـ hook
    }
  };

  // Load product data in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      // تحويل categoryId و brandId من object إلى string إذا لزم الأمر
      let categoryId: string = '';
      let brandId: string = '';
      
      if (typeof product.categoryId === 'object' && product.categoryId) {
        categoryId = (product.categoryId as any)._id || '';
      } else {
        categoryId = product.categoryId as string || '';
      }
      
      if (typeof product.brandId === 'object' && product.brandId) {
        brandId = (product.brandId as any)._id || '';
      } else {
        brandId = product.brandId as string || '';
      }

      methods.reset({
        name: product.name,
        nameEn: product.nameEn,
        description: product.description,
        descriptionEn: product.descriptionEn,
        categoryId: categoryId || '',
        brandId: brandId || '',
        sku: product.sku,
        status: product.status,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        metaKeywords: product.metaKeywords || [],
        attributes: product.attributes || [],
        imageUrl: (product as any).mainImageId?.url,
      });
      
      // Set main image if exists from populated mainImageId
      const mainMedia = (product as any).mainImageId;
      if (mainMedia && mainMedia._id) {
        setSelectedImage({ _id: mainMedia._id, url: mainMedia.url, name: mainMedia.name || 'صورة المنتج' });
        methods.setValue('imageUrl', mainMedia.url || '');
      }

      // Set additional images from populated imageIds
      const populatedImages = (product as any).imageIds;
      if (Array.isArray(populatedImages) && populatedImages.length > 0) {
        const additionalImages = populatedImages
          .filter((m: any) => m && m._id)
          .map((m: any, index: number) => ({ _id: m._id, url: m.url, name: m.name || `صورة إضافية ${index + 1}` }));
        setSelectedImages(additionalImages);
      }

      // Set attributes and keywords
      setSelectedAttributes(product.attributes || []);
      setMetaKeywords(product.metaKeywords || []);
      setRelatedProducts(product.relatedProducts || []);
      
      // Set manual rating
      setUseManualRating(product.useManualRating || false);
      setManualRating(product.manualRating || 0);
      setManualReviewsCount(product.manualReviewsCount || 0);
    }
  }, [product, isEditMode, methods]);

  // Submit
  const onSubmit = (data: any) => {
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
      relatedProducts: relatedProducts,
      mainImageId: selectedImage?._id,
      imageIds: selectedImages.map((img: any) => img._id).filter(Boolean),
      // التقييم اليدوي
      useManualRating: useManualRating,
      manualRating: useManualRating ? manualRating : undefined,
      manualReviewsCount: useManualRating ? manualReviewsCount : undefined,
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
          {isEditMode ? t('products:form.edit', 'تعديل منتج') : t('products:form.new', 'إضافة منتج')}
        </Typography>

        {/* Product Stats - Only in Edit Mode */}
        {isEditMode && product && (
          <>
            <Box sx={{ my: 3 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card variant="outlined" sx={{ 
                    borderColor: product.useManualRating ? 'info.main' : 'divider',
                    position: 'relative' 
                  }}>
                    <CardContent>
                      {product.useManualRating && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          bgcolor: 'info.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.65rem'
                        }}>
                          يدوي
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Star sx={{ color: 'warning.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                          {product.useManualRating 
                            ? (product.manualRating?.toFixed(1) || '0.0')
                            : (product.averageRating?.toFixed(1) || '0.0')
                          }
                        </Typography>
                      </Box>
                      <Rating 
                        value={product.useManualRating ? (product.manualRating || 0) : (product.averageRating || 0)} 
                        readOnly 
                        precision={0.1} 
                        size="small" 
                      />
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {product.useManualRating 
                          ? `${product.manualReviewsCount || 0} تقييم (يدوي)`
                          : `${product.reviewsCount || 0} تقييم (حقيقي)`
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Visibility color="info" />
                        <Typography variant="h6" fontWeight="bold">
                          {product.viewsCount || 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        مشاهدة
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ShoppingCart color="success" />
                        <Typography variant="h6" fontWeight="bold">
                          {product.salesCount || 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        مبيعات
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => navigate(`/products/${id}/variants`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color={product.variantsCount > 0 ? 'primary.main' : 'text.primary'}>
                          {product.variantsCount || 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {product.variantsCount > 0 ? '🔗 متغير (اضغط للإدارة)' : '⚠️ لا توجد متغيرات'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 3 }} />
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Tabs for Languages */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label={(t('products:form.arabicInfo', 'المعلومات بالعربية') as string) + ' 🇸🇦'} />
          <Tab label={(t('products:form.englishInfo', 'المعلومات بالإنجليزية') as string) + ' 🇬🇧'} />
        </Tabs>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Arabic Fields */}
              {activeTab === 0 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('products:form.arabicInfo', 'المعلومات بالعربية')}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="name" label={t('products:form.nameAr', 'الاسم بالعربية') + ' *'} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="description" label={t('products:form.descriptionAr', 'الوصف بالعربية') + ' *'} multiline rows={4} />
                  </Grid>
                </>
              )}

              {/* English Fields */}
              {activeTab === 1 && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('products:form.englishInfo', 'المعلومات بالإنجليزية')}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput name="nameEn" label={t('products:form.nameEn', 'الاسم بالإنجليزية') + ' *'} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="descriptionEn"
                      label={t('products:form.descriptionEn', 'الوصف بالإنجليزية') + ' *'}
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
                  {t('products:form.basicInfo', 'معلومات أساسية')}
                </Typography>
              </Grid>

              {/* Product Images */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  {t('products:form.images', 'الصور')}
                </Typography>
              </Grid>

              {/* Main Image */}
              <Grid size={{ xs: 12 }}>
                <ImageField
                  label={t('products:form.mainImage', 'الصورة الرئيسية')}
                  value={selectedImage}
                  onChange={(media) => {
                    setSelectedImage(media);
                    methods.setValue('imageUrl', media?.url || '');
                  }}
                  category={MediaCategory.PRODUCT}
                  helperText={t('products:form.mainImageHelp', 'اختر صورة رئيسية للمنتج')}
                />
              </Grid>

              {/* Additional Images */}
              <Grid size={{ xs: 12 }}>
                <MultipleImagesSelector
                  label={t('products:form.additionalImages', 'صور إضافية')}
                  value={selectedImages}
                  onChange={setSelectedImages}
                  maxImages={8}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="categoryId"
                  label={t('products:form.category', 'الفئة') + ' *'}
                  options={[
                    { value: '', label: t('products:form.selectCategory', 'اختر فئة') },
                    ...categoryOptions,
                  ]}
                  disabled={dataLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="brandId"
                  label={t('products:form.brand', 'العلامة التجارية')}
                  options={[
                    { value: '', label: t('products:form.selectBrand', 'اختر علامة') },
                    ...brandOptions,
                  ]}
                  disabled={dataLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="sku" label={t('products:form.sku', 'SKU')} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="status"
                  label={t('products:form.status', 'الحالة') + ' *'}
                  options={[
                    { value: ProductStatus.DRAFT, label: t('products:status.draft', 'مسودة') },
                    { value: ProductStatus.ACTIVE, label: t('products:status.active', 'نشط') },
                    { value: ProductStatus.ARCHIVED, label: t('products:status.archived', 'مؤرشف') },
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
                  {t('products:form.badges', 'شارات المنتج')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('products:form.badgesDescription', 'خصص الشارات لتمييز المنتج في القوائم')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Controller
                    name="isFeatured"
                    control={methods.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                            <Typography>{t('products:form.isFeatured', 'مميز')}</Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                  
                  <Controller
                    name="isNew"
                    control={methods.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>🆕 {t('products:form.isNew', 'جديد')}</Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                  
                  <Controller
                    name="isBestseller"
                    control={methods.control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingCart sx={{ color: 'success.main', fontSize: 20 }} />
                            <Typography>{t('products:form.isBestseller', 'الأكثر مبيعاً')}</Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Box>
              </Grid>

              {/* Manual Rating Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <RateReview color="warning" />
                  <Typography variant="h6">
                    {t('products:form.rating', 'التقييم')}
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t('products:form.ratingDescription', 'يمكنك استخدام تقييم يدوي أو الاعتماد على التقييمات الحقيقية')}
                </Alert>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={useManualRating}
                      onChange={(e) => setUseManualRating(e.target.checked)}
                    />
                  }
                  label={t('products:form.useManualRating', 'استخدام تقييم يدوي') + ' (' + t('products:form.useManualRatingHelp', 'بدلاً من التقييم الحقيقي') + ')'}
                />
              </Grid>

              {useManualRating && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('products:form.manualRating', 'التقييم اليدوي')} ⭐
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Rating
                        value={manualRating}
                        onChange={(_, value) => setManualRating(value || 0)}
                        precision={0.5}
                        size="large"
                      />
                      <Typography variant="h6" fontWeight="bold">
                        {manualRating.toFixed(1)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label={t('products:form.manualReviewsCount', 'عدد التقييمات اليدوي')}
                      type="number"
                      value={manualReviewsCount}
                      onChange={(e) => setManualReviewsCount(Number(e.target.value))}
                      fullWidth
                      inputProps={{ min: 0 }}
                      helperText={t('products:form.manualReviewsCountHelp', 'يظهر فقط للعرض')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        {t('products:form.manualRatingWarning', 'تنبيه: التقييم اليدوي يظهر للمستخدمين وقد يؤثر على الثقة')}
                      </Typography>
                    </Alert>
                  </Grid>
                </>
              )}

              {/* Related Products */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <RelatedProductsSelector
                  value={relatedProducts}
                  onChange={setRelatedProducts}
                  currentProductId={isEditMode ? id : undefined}
                />
              </Grid>

              {/* Default Pricing and Inventory */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('products:form.pricing', 'التسعير وتوليد المتغيرات')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('products:form.generateVariantsDescription', 'استخدم السعر/المخزون الافتراضي لتوليد متغيرات تلقائياً')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('products:form.defaultPrice', 'السعر الافتراضي')} *
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
                  {t('products:form.defaultStock', 'المخزون الافتراضي')} *
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
                  <Card variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            💡 {t('products:form.generateVariantsAuto', 'توليد المتغيرات تلقائياً')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isEditMode 
                              ? t('products:form.generateVariantsDescription', 'سيتم إنشاء متغيرات بحسب السمات المختارة')
                              : t('products:form.generateVariantsNew', 'سيتم حفظ المنتج أولاً ثم توليد المتغيرات')
                            }
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="large"
                          disabled={defaultPrice <= 0 || defaultStock < 0 || isGeneratingVariants || isCreating}
                          onClick={() => setConfirmGenerateOpen(true)}
                          sx={{ minWidth: 150 }}
                        >
                          {isGeneratingVariants || isCreating
                            ? '⏳ ' + t('common:common.loading', 'جارٍ التحميل')
                            : '🚀 ' + t('products:form.generateVariants', 'توليد المتغيرات')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* SEO */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('products:form.seo', 'تحسين الظهور (SEO)')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormInput name="metaTitle" label={t('products:form.metaTitle', 'عنوان الميتا') } />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormInput
                  name="metaDescription"
                  label={t('products:form.metaDescription', 'وصف الميتا')}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('products:form.metaKeywords')}
                </Typography>
                <input
                  type="text"
                  placeholder={t('products:form.metaKeywordsHelp', 'أدخل كلمات مفتاحية مفصولة بفواصل')}
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
                  {t('products:form.metaKeywordsPlaceholder', 'مثال: كهرباء, قاطع, منزل')}
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
                    {t('products:form.save', 'حفظ')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/products')}
                  >
                    {t('products:form.cancel', 'إلغاء')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Paper>

      {/* Professional confirm dialog for generating variants */}
      <Dialog open={confirmGenerateOpen} onClose={() => setConfirmGenerateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('products:form.generateVariantsConfirm', 'تأكيد توليد المتغيرات')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="warning">
              {isEditMode
                ? t('products:form.generateVariantsWarningExisting', 'سيتم إنشاء متغيرات جديدة وفق السمات المحددة. لن يتم حذف المتغيرات الحالية.')
                : t('products:form.variantsWillBeSaved', 'سيتم حفظ المنتج أولاً قبل توليد المتغيرات')}
            </Alert>
            {isEditMode && (
              <FormControlLabel
                control={
                  <Switch
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                  />
                }
                label={t('products:form.overwriteExisting', 'استبدال المتغيرات الحالية (حذف وإعادة توليد)') as string}
              />
            )}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t('products:form.summary', 'الملخص')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('products:list.columns.price', 'السعر')}
                    </Typography>
                    <Typography variant="h6">${defaultPrice}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('products:list.columns.stock', 'المخزون')}
                    </Typography>
                    <Typography variant="h6">{defaultStock}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('products:form.attributes', 'عدد السمات')}
                    </Typography>
                    <Typography variant="h6">{selectedAttributes.length}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmGenerateOpen(false)} startIcon={<Cancel />}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={() => {
              setConfirmGenerateOpen(false);
              handleGenerateVariants();
            }}
            variant="contained"
            startIcon={<Save />}
            disabled={defaultPrice <= 0 || defaultStock < 0 || isGeneratingVariants || isCreating}
          >
            {t('products:form.generateVariants', 'توليد المتغيرات')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
