import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Rating,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
} from '@mui/material';
import {
  Save,
  Cancel,
  Star,
  Visibility,
  ShoppingCart,
  RateReview,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Home,
  ChevronRight,
} from '@mui/icons-material';
import { Breadcrumbs, Link } from '@mui/material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { FormInput } from '@/shared/components/Form/FormInput';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { ImageField, MediaCategory } from '@/features/media';
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useProductVariants,
} from '../hooks/useProducts';
import { productsApi } from '../api/productsApi';
import { useProductFormData } from '../hooks/useProductData';
import { AttributeSelector } from '../components/AttributeSelector';
import { MultipleImagesSelector } from '../components/MultipleImagesSelector';
import { RelatedProductsSelector } from '../components/RelatedProductsSelector';
import { GenerateVariantsDialog } from '../components/GenerateVariantsDialog';
import { SmartSkuInput } from '../components/SmartSkuInput';
import { ProductStatus } from '../types/product.types';
import type { CreateProductDto, UpdateProductDto } from '../types/product.types';

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

// Step definitions
const STEP_BASIC_INFO = 0;
const STEP_IMAGES = 1;
const STEP_CATEGORY_ATTRIBUTES = 2;
const STEP_PRICING = 3;
const STEP_BADGES_RATING = 4;
const STEP_SEO_RELATED = 5;

const TOTAL_STEPS = 6;

export const ProductFormPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const isEditMode = id !== 'new' && !!id;

  // Prefill data from navigation state (from UnlinkedProductsPage)
  const prefillData = location.state as {
    prefillSku?: string;
    prefillStock?: number;
    prefillName?: string;
  } | null;

  const [activeStep, setActiveStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [activeLanguageTab, setActiveLanguageTab] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<any>(null);
  const [selectedImages, setSelectedImages] = React.useState<any[]>([]);
  const [selectedAttributes, setSelectedAttributes] = React.useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = React.useState<string[]>([]);

  // ✅ استخدام useRef للحفاظ على القيمة الحالية (حل مشكلة stale closure)
  const relatedProductsRef = React.useRef<string[]>([]);

  // ✅ Debug: Log relatedProducts changes وتحديث الـ ref
  React.useEffect(() => {
    console.log('📝 relatedProducts state changed:', relatedProducts);
    relatedProductsRef.current = relatedProducts;
  }, [relatedProducts]);

  const [metaKeywords, setMetaKeywords] = React.useState<string[]>([]);
  const [defaultPrice, setDefaultPrice] = React.useState<number>(0);
  const [defaultStock, setDefaultStock] = React.useState<number>(0);
  const [simpleCompareAtPrice, setSimpleCompareAtPrice] = React.useState<string>('');
  const [simpleCostPrice, setSimpleCostPrice] = React.useState<string>('');
  const [useManualRating, setUseManualRating] = React.useState<boolean>(false);
  const [manualRating, setManualRating] = React.useState<number>(0);
  const [manualReviewsCount, setManualReviewsCount] = React.useState<number>(0);
  const [generateVariantsDialogOpen, setGenerateVariantsDialogOpen] = React.useState(false);

  // State for Onyx integration
  const [isLinkedToOnyx, setIsLinkedToOnyx] = React.useState(false);
  const [onyxStockValue, setOnyxStockValue] = React.useState<number | undefined>(undefined);

  const parseOptionalNumber = React.useCallback((value: string): number | undefined => {
    if (!value) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, []);

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
  const { categoryOptions, brandOptions, isLoading: dataLoading } = useProductFormData();
  const queryClient = useQueryClient();
  const { data: existingVariants } = useProductVariants(id || '');

  // Step labels
  const steps = [
    t('products:form.steps.basicInfo', 'المعلومات الأساسية'),
    t('products:form.steps.images', 'الصور والوسائط'),
    t('products:form.steps.categoryAttributes', 'التصنيف والسمات'),
    t('products:form.steps.pricing', 'التسعير والمخزون'),
    t('products:form.steps.badgesRating', 'الشارات والتقييم'),
    t('products:form.steps.seoRelated', 'SEO والمنتجات الشبيهة'),
  ];

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    return Math.round((completedSteps.size / TOTAL_STEPS) * 100);
  }, [completedSteps]);

  // Check if current step is valid
  const validateStep = React.useCallback(
    async (step: number): Promise<boolean> => {
      switch (step) {
        case STEP_BASIC_INFO:
          return await methods.trigger(['name', 'nameEn', 'description', 'descriptionEn']);
        case STEP_IMAGES:
          // التحقق من وجود صورة رئيسية على الأقل
          return !!selectedImage;
        case STEP_CATEGORY_ATTRIBUTES:
          return await methods.trigger(['categoryId']);
        default:
          return true;
      }
    },
    [methods, selectedImage]
  );

  // Handle step navigation
  const handleNext = React.useCallback(async () => {
    const isValid = await validateStep(activeStep);
    if (isValid) {
      setCompletedSteps((prev) => new Set(prev).add(activeStep));
      if (activeStep < TOTAL_STEPS - 1) {
        setActiveStep((prev) => prev + 1);
      }
    } else {
      if (activeStep === STEP_IMAGES) {
        toast.error(t('products:form.mainImageRequired', 'يجب اختيار صورة رئيسية للمنتج'));
      } else {
        toast.error(t('products:form.fillRequiredFields', 'الرجاء ملء الحقول المطلوبة'));
      }
    }
  }, [activeStep, validateStep, t]);

  const handleBack = React.useCallback(() => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  }, [activeStep]);

  const handleStepClick = React.useCallback(
    async (step: number) => {
      // السماح بالرجوع للخطوات السابقة أو المكتملة
      if (step <= activeStep || completedSteps.has(step)) {
        setActiveStep(step);
        return;
      }

      // للانتقال للخطوات المستقبلية، يجب أن تكون الخطوة السابقة مكتملة
      if (step > activeStep) {
        // التحقق من أن جميع الخطوات السابقة مكتملة
        let canProceed = true;
        for (let i = activeStep; i < step; i++) {
          if (!completedSteps.has(i)) {
            // محاولة التحقق من صحة الخطوة الحالية قبل الانتقال
            const isValid = await validateStep(i);
            if (isValid) {
              setCompletedSteps((prev) => new Set(prev).add(i));
            } else {
              canProceed = false;
              // إذا كانت الخطوة الأولى (المعلومات الأساسية)، السماح بالانتقال
              if (i === STEP_BASIC_INFO) {
                canProceed = true;
              }
              break;
            }
          }
        }

        if (canProceed) {
          setActiveStep(step);
        } else {
          toast.error(t('products:form.completePreviousSteps', 'يجب إكمال الخطوات السابقة أولاً'));
        }
      }
    },
    [activeStep, completedSteps, validateStep, t]
  );

  // تحديث حالة خطوة الصور تلقائياً عند اختيار صورة رئيسية
  React.useEffect(() => {
    if (selectedImage) {
      setCompletedSteps((prev) => new Set(prev).add(STEP_IMAGES));
    } else {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(STEP_IMAGES);
        return newSet;
      });
    }
  }, [selectedImage]);

  // Handle prefill from navigation state (from UnlinkedProductsPage)
  React.useEffect(() => {
    if (!isEditMode && prefillData) {
      if (prefillData.prefillSku) {
        methods.setValue('sku', prefillData.prefillSku);
      }
      if (prefillData.prefillStock !== undefined) {
        setDefaultStock(prefillData.prefillStock);
      }
      if (prefillData.prefillName) {
        methods.setValue('name', prefillData.prefillName);
      }
    }
  }, [isEditMode, prefillData, methods]);

  // Open generate variants dialog
  const handleOpenGenerateDialog = () => {
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

    setGenerateVariantsDialogOpen(true);
  };

  // Generate selected variants handler
  const handleGenerateSelectedVariants = async (
    variants: Array<{
      attributeValues: Array<{ attributeId: string; valueId: string }>;
      price: number;
      stock: number;
    }>,
    replaceExisting: boolean = false
  ) => {
    try {
      let productId = id;

      // إذا كان المنتج جديداً (غير محفوظ)، نحفظه أولاً تلقائياً في الخلفية
      if (!isEditMode || !id) {
        // التحقق من صحة البيانات الأساسية
        const isValid = await methods.trigger();
        if (!isValid) {
          toast.error(t('products:messages.fillRequired', 'الرجاء ملء الحقول المطلوبة'));
          return;
        }

        // حفظ المنتج في الخلفية بدون إظهار رسائل مفرطة
        const formData = methods.getValues();
        const basePriceValue = defaultPrice > 0 ? defaultPrice : undefined;
        const compareAtValue = parseOptionalNumber(simpleCompareAtPrice);
        const costValue = parseOptionalNumber(simpleCostPrice);
        const stockValue = defaultStock >= 0 ? defaultStock : undefined;
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
          // ✅ استخدام الـ ref للحصول على القيمة الحالية
          relatedProducts: Array.isArray(relatedProductsRef.current)
            ? relatedProductsRef.current
            : [],
          mainImageId: selectedImage?._id,
          imageIds: selectedImages.map((img: any) => img._id).filter(Boolean),
          useManualRating: useManualRating,
          manualRating: useManualRating ? manualRating : undefined,
          manualReviewsCount: useManualRating ? manualReviewsCount : undefined,
          basePriceUSD: basePriceValue,
          compareAtPriceUSD: compareAtValue,
          costPriceUSD: costValue,
          stock: stockValue,
        };

        // التحقق من صحة البيانات قبل الإرسال
        if (basePriceValue !== undefined && (isNaN(basePriceValue) || basePriceValue < 0)) {
          toast.error(t('products:messages.invalidPrice', 'السعر غير صحيح'));
          return;
        }

        if (compareAtValue !== undefined && (isNaN(compareAtValue) || compareAtValue < 0)) {
          toast.error(t('products:messages.invalidCompareAtPrice', 'سعر المقارنة غير صحيح'));
          return;
        }

        if (costValue !== undefined && (isNaN(costValue) || costValue < 0)) {
          toast.error(t('products:messages.invalidCostPrice', 'سعر التكلفة غير صحيح'));
          return;
        }

        // حفظ المنتج في الخلفية بدون إظهار toast - استخدام API مباشرة
        try {
          const savedProduct = await productsApi.create(productData);
          productId = savedProduct._id;

          // تحديث URL بدون إعادة تحميل الصفحة
          window.history.replaceState({}, '', `/products/${productId}`);

          // تحديث query cache بدون إعادة تحميل
          queryClient.setQueryData(['products', productId], savedProduct);
          queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            t('products:messages.productSaveFailed', 'فشل حفظ المنتج');
          toast.error(errorMessage);
          return;
        }
      }

      // توليد المتغيرات في الخلفية
      toast.loading(
        replaceExisting
          ? t('products:messages.replacingVariants', 'جارٍ استبدال المتغيرات...')
          : t('products:messages.generateVariants', 'جارٍ توليد المتغيرات...'),
        { id: 'generate-variants' }
      );

      // إذا كان الاستبدال مفعلاً، نحذف المتغيرات الحالية أولاً
      if (replaceExisting && existingVariants && existingVariants.length > 0) {
        let deleteCount = 0;
        for (const variant of existingVariants) {
          try {
            await productsApi.deleteVariant(variant._id);
            deleteCount++;
          } catch (error) {
            console.error('Error deleting variant:', error);
          }
        }
        console.log(`Deleted ${deleteCount} existing variants`);
      }

      // إنشاء المتغيرات واحداً تلو الآخر في الخلفية
      let successCount = 0;
      let errorCount = 0;

      for (const variant of variants) {
        try {
          // استخدام API مباشرة لتجنب toast من الـ hook
          await productsApi.addVariant({
            productId: productId!,
            sku: undefined,
            attributeValues: variant.attributeValues,
            price: variant.price,
            stock: variant.stock,
          });
          successCount++;
        } catch (error) {
          console.error('Error creating variant:', error);
          errorCount++;
        }
      }

      // تحديث cache بعد إنشاء المتغيرات
      queryClient.invalidateQueries({ queryKey: ['products', productId, 'variants'] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });

      toast.dismiss('generate-variants');

      // إظهار رسالة نجاح بسيطة فقط
      if (errorCount === 0) {
        toast.success(
          t('products:messages.variantsGenerated', 'تم توليد {{count}} متغير بنجاح', {
            count: successCount,
          }),
          { duration: 2000 }
        );
      } else if (successCount > 0) {
        toast.success(
          t(
            'products:messages.variantsPartiallyGenerated',
            'تم توليد {{success}} من {{total}} متغير',
            {
              success: successCount,
              total: variants.length,
            }
          ),
          { duration: 2000 }
        );
      } else {
        toast.error(t('products:messages.variantsGenerationFailed', 'فشل في توليد المتغيرات'));
        return;
      }

      // إغلاق الدايلوج فقط - لا ننتقل لأي صفحة
      // الدايلوج سيُغلق تلقائياً من خلال onClose في GenerateVariantsDialog
    } catch (error) {
      toast.dismiss('save-product');
      toast.dismiss('generate-variants');
      console.error('Error generating variants:', error);
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
        categoryId = (product.categoryId as string) || '';
      }

      if (typeof product.brandId === 'object' && product.brandId) {
        brandId = (product.brandId as any)._id || '';
      } else {
        brandId = (product.brandId as string) || '';
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
        setSelectedImage({
          _id: mainMedia._id,
          url: mainMedia.url,
          name: mainMedia.name || 'صورة المنتج',
        });
        methods.setValue('imageUrl', mainMedia.url || '');
      }

      // Set additional images from populated imageIds
      const populatedImages = (product as any).imageIds;
      if (Array.isArray(populatedImages) && populatedImages.length > 0) {
        const additionalImages = populatedImages
          .filter((m: any) => m && m._id)
          .map((m: any, index: number) => ({
            _id: m._id,
            url: m.url,
            name: m.name || `صورة إضافية ${index + 1}`,
          }));
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

      // Mark steps as completed based on filled data
      const newCompletedSteps = new Set<number>();
      if (product.name && product.nameEn && product.description && product.descriptionEn) {
        newCompletedSteps.add(STEP_BASIC_INFO);
      }
      if (selectedImage || selectedImages.length > 0) {
        newCompletedSteps.add(STEP_IMAGES);
      }
      if (product.categoryId) {
        newCompletedSteps.add(STEP_CATEGORY_ATTRIBUTES);
      }
      if (defaultPrice > 0 || product.basePriceUSD) {
        newCompletedSteps.add(STEP_PRICING);
      }
      if (product.isFeatured || product.isNew || product.isBestseller || product.useManualRating) {
        newCompletedSteps.add(STEP_BADGES_RATING);
      }
      if (
        product.metaTitle ||
        product.metaDescription ||
        (product.metaKeywords && product.metaKeywords.length > 0) ||
        (product.relatedProducts && product.relatedProducts.length > 0)
      ) {
        newCompletedSteps.add(STEP_SEO_RELATED);
      }
      setCompletedSteps(newCompletedSteps);

      const productBasePrice =
        typeof (product as any).basePriceUSD === 'number'
          ? (product as any).basePriceUSD
          : typeof (product as any).basePrice === 'number'
            ? (product as any).basePrice
            : undefined;
      if (typeof productBasePrice === 'number' && !Number.isNaN(productBasePrice)) {
        setDefaultPrice(productBasePrice);
      }

      const productCompareAt =
        typeof (product as any).compareAtPriceUSD === 'number'
          ? (product as any).compareAtPriceUSD
          : undefined;
      setSimpleCompareAtPrice(
        productCompareAt !== undefined && !Number.isNaN(productCompareAt)
          ? productCompareAt.toString()
          : ''
      );

      const productCost =
        typeof (product as any).costPriceUSD === 'number'
          ? (product as any).costPriceUSD
          : undefined;
      setSimpleCostPrice(
        productCost !== undefined && !Number.isNaN(productCost) ? productCost.toString() : ''
      );

      // Load stock value
      const productStock =
        typeof (product as any).stock === 'number' ? (product as any).stock : undefined;
      if (typeof productStock === 'number' && !Number.isNaN(productStock)) {
        setDefaultStock(productStock);
      }
    }
  }, [product, isEditMode, methods]);

  // Submit
  const onSubmit = (data: any) => {
    const basePriceValue = defaultPrice > 0 ? defaultPrice : undefined;
    const compareAtValue = parseOptionalNumber(simpleCompareAtPrice);
    const costValue = parseOptionalNumber(simpleCostPrice);
    const stockValue = defaultStock >= 0 ? defaultStock : undefined;

    if (isEditMode) {
      // ✅ استخدام relatedProductsRef.current للحصول على القيمة الحالية (حل مشكلة stale closure)
      const currentRelatedProducts = relatedProductsRef.current;

      // عند التحديث، استخدم UpdateProductDto
      const updateData: UpdateProductDto = {
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
        // ✅ استخدام الـ ref للحصول على القيمة الحالية
        relatedProducts: Array.isArray(currentRelatedProducts) ? currentRelatedProducts : [],
        mainImageId: selectedImage?._id,
        imageIds: selectedImages.map((img: any) => img._id).filter(Boolean),
        // التقييم اليدوي
        useManualRating: useManualRating,
        manualRating: useManualRating ? manualRating : undefined,
        manualReviewsCount: useManualRating ? manualReviewsCount : undefined,
        basePriceUSD: basePriceValue,
        compareAtPriceUSD: compareAtValue,
        costPriceUSD: costValue,
        // المخزون
        stock: stockValue,
      };

      // ✅ التحقق من البيانات قبل الإرسال
      console.log('🔍 Updating product with relatedProducts:', {
        productId: id,
        relatedProductsFromRef: currentRelatedProducts,
        relatedProductsInData: updateData.relatedProducts,
        relatedProductsLength: updateData.relatedProducts?.length || 0,
      });

      updateProduct(
        { id: id!, data: updateData },
        {
          onSuccess: (updatedProduct) => {
            console.log('✅ Product updated successfully:', {
              productId: updatedProduct._id,
              relatedProducts: updatedProduct.relatedProducts,
            });
            // العودة للصفحة السابقة مع الحفاظ على الـ pagination params
            navigate(-1);
          },
          onError: (error) => {
            console.error('❌ Error updating product:', error);
          },
        }
      );
    } else {
      // ✅ استخدام relatedProductsRef.current للحصول على القيمة الحالية
      const currentRelatedProducts = relatedProductsRef.current;

      // عند الإنشاء، استخدم CreateProductDto
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
        // ✅ استخدام الـ ref للحصول على القيمة الحالية
        relatedProducts: Array.isArray(currentRelatedProducts) ? currentRelatedProducts : [],
        mainImageId: selectedImage?._id,
        imageIds: selectedImages.map((img: any) => img._id).filter(Boolean),
        // التقييم اليدوي
        useManualRating: useManualRating,
        manualRating: useManualRating ? manualRating : undefined,
        manualReviewsCount: useManualRating ? manualReviewsCount : undefined,
        basePriceUSD: basePriceValue,
        compareAtPriceUSD: compareAtValue,
        costPriceUSD: costValue,
        // المخزون
        stock: stockValue,
      };

      createProduct(productData, {
        onSuccess: () => {
          // العودة للصفحة السابقة مع الحفاظ على الـ pagination params
          navigate(-1);
        },
      });
    }
  };

  const handleSave = React.useCallback(async () => {
    // التحقق من صحة آخر خطوة قبل الحفظ
    const isValid = await validateStep(activeStep);
    if (isValid) {
      // استدعاء onSubmit يدوياً
      methods.handleSubmit(onSubmit)();
    } else {
      toast.error(t('products:form.fillRequiredFields', 'الرجاء ملء الحقول المطلوبة'));
    }
  }, [activeStep, validateStep, methods, t]);

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case STEP_BASIC_INFO:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t(
                'products:form.steps.basicInfoDescription',
                'أدخل المعلومات الأساسية للمنتج بالعربية والإنجليزية'
              )}
            </Alert>

            {/* Language Tabs */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={activeLanguageTab === 0 ? 'contained' : 'outlined'}
                    onClick={() => setActiveLanguageTab(0)}
                    startIcon={<Typography>🇸🇦</Typography>}
                    sx={{ flex: 1 }}
                  >
                    {t('products:form.arabicInfo', 'العربية')}
                  </Button>
                  <Button
                    variant={activeLanguageTab === 1 ? 'contained' : 'outlined'}
                    onClick={() => setActiveLanguageTab(1)}
                    startIcon={<Typography>🇬🇧</Typography>}
                    sx={{ flex: 1 }}
                  >
                    {t('products:form.englishInfo', 'الإنجليزية')}
                  </Button>
                </Box>
              </Box>

              {activeLanguageTab === 0 && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="name"
                      label={t('products:form.nameAr', 'الاسم بالعربية') + ' *'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="description"
                      label={t('products:form.descriptionAr', 'الوصف بالعربية') + ' *'}
                      multiline
                      rows={6}
                    />
                  </Grid>
                </Grid>
              )}

              {activeLanguageTab === 1 && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="nameEn"
                      label={t('products:form.nameEn', 'الاسم بالإنجليزية') + ' *'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="descriptionEn"
                      label={t('products:form.descriptionEn', 'الوصف بالإنجليزية') + ' *'}
                      multiline
                      rows={6}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        );

      case STEP_IMAGES:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t(
                'products:form.steps.imagesDescription',
                'أضف الصورة الرئيسية والصور الإضافية للمنتج'
              )}
            </Alert>

            <Grid container spacing={3}>
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
              <Grid size={{ xs: 12 }}>
                <MultipleImagesSelector
                  label={t('products:form.additionalImages', 'صور إضافية')}
                  value={selectedImages}
                  onChange={setSelectedImages}
                  maxImages={8}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case STEP_CATEGORY_ATTRIBUTES:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t(
                'products:form.steps.categoryAttributesDescription',
                'اختر الفئة والعلامة التجارية والسمات للمنتج'
              )}
            </Alert>

            <Grid container spacing={3}>
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

              {/* ✅ قسم SKU المحسن */}
              <Grid size={{ xs: 12, md: 6 }}>
                <SmartSkuInput
                  value={methods.watch('sku') || ''}
                  onChange={(value) => {
                    methods.setValue('sku', value);
                    // إذا قام المستخدم بتغيير الـ SKU، نعيد تعيين حالة الربط مؤقتاً حتى يتم التحقق
                    if (value.length < 3) {
                      setIsLinkedToOnyx(false);
                      setOnyxStockValue(undefined);
                    }
                  }}
                  onSkuValidated={(result) => {
                    setIsLinkedToOnyx(result.existsInOnyx);

                    if (result.existsInOnyx && result.onyxStock !== undefined) {
                      // ✅ حالة النجاح: تعبئة المخزون ومنع التعديل
                      setOnyxStockValue(result.onyxStock);
                      setDefaultStock(result.onyxStock);
                      toast.success(t('products:integration.linkedSuccess', 'تم الربط مع أونكس بنجاح'));
                    } else {
                      // ⚠️ حالة عدم الوجود: السماح بالتعديل اليدوي
                      setOnyxStockValue(undefined);
                    }
                  }}
                  label={t('products:form.sku', 'رمز الصنف (SKU)')}
                />

                {/* رسائل توضيحية بناءً على حالة الربط */}
                {(methods.watch('sku') || '').length >= 3 && (
                  <Box mt={1}>
                    {isLinkedToOnyx ? (
                      <Alert severity="success" icon={<CheckCircle fontSize="inherit" />}>
                        {t('products:integration.foundMsg', 'المنتج موجود في أونكس. سيتم إدارة المخزون تلقائياً.')}
                        <strong> ({t('products:stock', 'المتوفر')}: {onyxStockValue?.toLocaleString('ar-SA')})</strong>
                      </Alert>
                    ) : (
                      <Alert severity="warning">
                        {t('products:integration.notFoundMsg', 'هذا الرمز غير موجود في أونكس. يجب إدارة المخزون يدوياً.')}
                      </Alert>
                    )}
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  name="status"
                  label={t('products:form.status', 'الحالة') + ' *'}
                  options={[
                    { value: ProductStatus.DRAFT, label: t('products:status.draft', 'مسودة') },
                    { value: ProductStatus.ACTIVE, label: t('products:status.active', 'نشط') },
                    {
                      value: ProductStatus.ARCHIVED,
                      label: t('products:status.archived', 'مؤرشف'),
                    },
                  ]}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <AttributeSelector value={selectedAttributes} onChange={setSelectedAttributes} />
              </Grid>
            </Grid>
          </Box>
        );

      case STEP_PRICING:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('products:form.steps.pricingDescription', 'حدد الأسعار والمخزون الافتراضي للمنتج')}
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={t('products:form.defaultPrice', 'السعر الافتراضي') + ' *'}
                  type="number"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(Number(e.target.value))}
                  placeholder="0.00"
                  fullWidth
                  inputProps={{ min: 0, step: '0.01' }}
                  helperText={t(
                    'products:form.defaultPriceHint',
                    'يستخدم كالسعر الأساسي للمنتج البسيط أو السعر الافتراضي لتوليد المتغيرات'
                  )}
                />
              </Grid>
              {/* ✅ حقل المخزون المحسن */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={t('products:form.defaultStock', 'المخزون الافتراضي') + (isLinkedToOnyx ? '' : ' *')}
                  type="number"
                  // إذا كان مربوطاً، نستخدم قيمة أونكس، وإلا نستخدم القيمة المدخلة يدوياً
                  value={isLinkedToOnyx ? onyxStockValue : defaultStock}
                  onChange={(e) => {
                    // نمنع التغيير إذا كان مربوطاً
                    if (!isLinkedToOnyx) {
                      setDefaultStock(Number(e.target.value));
                    }
                  }}
                  placeholder="0"
                  fullWidth
                  inputProps={{ min: 0 }}
                  // تعطيل الحقل إذا كان مربوطاً
                  disabled={isLinkedToOnyx}
                  // تلوين الخلفية إذا كان معطلاً لتمييزه
                  sx={{
                    '& .MuiInputBase-root.Mui-disabled': {
                      backgroundColor: isLinkedToOnyx ? 'action.hover' : 'inherit',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: isLinkedToOnyx ? '#2e7d32' : undefined, // لون أخضر غامق للقيمة
                      fontWeight: isLinkedToOnyx ? 'bold' : 'normal',
                    },
                  }}
                  // رسالة مساعدة توضح السبب
                  helperText={
                    isLinkedToOnyx ? (
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                        <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                        {t('products:integration.stockSynced', 'يتم جلب الكمية تلقائياً من نظام أونكس')}
                      </Box>
                    ) : (
                      t('products:form.stockManualHelp', 'أدخل الكمية المتوفرة يدوياً')
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    'products:form.simplePricingNotice',
                    'إذا لم يكن لدى المنتج متغيرات، سيتم استخدام هذه الأسعار الثلاثية (USD) كسعر العرض الأساسي'
                  )}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={t('products:form.simpleComparePrice', 'السعر الأصلي (منتج بسيط)')}
                  type="number"
                  value={simpleCompareAtPrice}
                  onChange={(e) => setSimpleCompareAtPrice(e.target.value)}
                  placeholder="0.00"
                  fullWidth
                  inputProps={{ min: 0, step: '0.01' }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={t('products:form.simpleCostPrice', 'سعر التكلفة (منتج بسيط)')}
                  type="number"
                  value={simpleCostPrice}
                  onChange={(e) => setSimpleCostPrice(e.target.value)}
                  placeholder="0.00"
                  fullWidth
                  inputProps={{ min: 0, step: '0.01' }}
                />
              </Grid>

              {/* Generate Variants Button */}
              {selectedAttributes.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Card
                    variant="outlined"
                    sx={{ bgcolor: 'primary.50', borderColor: 'primary.main' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            💡 {t('products:form.generateVariantsAuto', 'توليد المتغيرات تلقائياً')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isEditMode
                              ? t(
                                'products:form.generateVariantsDescription',
                                'سيتم إنشاء متغيرات بحسب السمات المختارة'
                              )
                              : t(
                                'products:form.generateVariantsNew',
                                'سيتم حفظ المنتج أولاً ثم توليد المتغيرات'
                              )}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="large"
                          disabled={defaultPrice <= 0 || defaultStock < 0 || isCreating}
                          onClick={handleOpenGenerateDialog}
                          sx={{
                            minWidth: { xs: '100%', sm: 150 },
                            width: { xs: '100%', sm: 'auto' },
                          }}
                        >
                          {isCreating
                            ? '⏳ ' + t('common:common.loading', 'جارٍ التحميل')
                            : '🚀 ' + t('products:form.generateVariants', 'توليد المتغيرات')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case STEP_BADGES_RATING:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('products:form.steps.badgesRatingDescription', 'خصص الشارات والتقييم للمنتج')}
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
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
                            <Typography>
                              {t('products:form.isBestseller', 'الأكثر مبيعاً')}
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <RateReview color="warning" />
                  <Typography variant="h6">{t('products:form.rating', 'التقييم')}</Typography>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  {t(
                    'products:form.ratingDescription',
                    'يمكنك استخدام تقييم يدوي أو الاعتماد على التقييمات الحقيقية'
                  )}
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
                  label={
                    t('products:form.useManualRating', 'استخدام تقييم يدوي') +
                    ' (' +
                    t('products:form.useManualRatingHelp', 'بدلاً من التقييم الحقيقي') +
                    ')'
                  }
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
                        {t(
                          'products:form.manualRatingWarning',
                          'تنبيه: التقييم اليدوي يظهر للمستخدمين وقد يؤثر على الثقة'
                        )}
                      </Typography>
                    </Alert>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );

      case STEP_SEO_RELATED:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('products:form.steps.seoRelatedDescription', 'أضف معلومات SEO والمنتجات الشبيهة')}
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  {t('products:form.seo', 'تحسين الظهور (SEO)')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormInput name="metaTitle" label={t('products:form.metaTitle', 'عنوان الميتا')} />
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
                <TextField
                  label={t('products:form.metaKeywords')}
                  placeholder={t(
                    'products:form.metaKeywordsHelp',
                    'أدخل كلمات مفتاحية مفصولة بفواصل'
                  )}
                  value={metaKeywords.join(', ')}
                  onChange={(e) => {
                    const keywords = e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter((k) => k.length > 0);
                    setMetaKeywords(keywords);
                  }}
                  fullWidth
                  helperText={t(
                    'products:form.metaKeywordsPlaceholder',
                    'مثال: كهرباء, قاطع, منزل'
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RelatedProductsSelector
                  value={relatedProducts}
                  onChange={(productIds) => {
                    console.log('🔄 RelatedProductsSelector onChange called:', productIds);
                    setRelatedProducts(productIds);
                  }}
                  currentProductId={isEditMode ? id : undefined}
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
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
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<ChevronRight fontSize="small" />}
        sx={{ mb: 2 }}
        aria-label="breadcrumb"
      >
        <Link
          color="inherit"
          href="/products"
          onClick={(e) => {
            e.preventDefault();
            navigate('/products');
          }}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('products:list.title', 'المنتجات')}
        </Link>
        <Typography color="text.primary">
          {isEditMode
            ? t('products:form.edit', 'تعديل منتج')
            : t('products:form.new', 'إضافة منتج')}
        </Typography>
      </Breadcrumbs>

      {/* Header with Progress */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" gutterBottom>
              {isEditMode
                ? t('products:form.edit', 'تعديل منتج')
                : t('products:form.new', 'إضافة منتج')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('products:form.completion', 'الإكمال: {{percent}}%', {
                percent: completionPercentage,
              })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              size={isMobile ? 'small' : 'medium'}
            >
              {t('common:actions.back', 'رجوع')}
            </Button>
            {isEditMode && (
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => navigate(`/products/${id}/view`)}
                size={isMobile ? 'small' : 'medium'}
              >
                {t('common:actions.view', 'عرض')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={completionPercentage}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Paper>

      {/* Product Stats - Only in Edit Mode */}
      {isEditMode && product && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: product.useManualRating ? 'info.main' : 'divider',
                  position: 'relative',
                }}
              >
                <CardContent>
                  {product.useManualRating && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'info.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                      }}
                    >
                      {t('products:stats.manual', 'يدوي')}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Star sx={{ color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      {product.useManualRating
                        ? product.manualRating?.toFixed(1) || '0.0'
                        : product.averageRating?.toFixed(1) || '0.0'}
                    </Typography>
                  </Box>
                  <Rating
                    value={
                      product.useManualRating
                        ? product.manualRating || 0
                        : product.averageRating || 0
                    }
                    readOnly
                    precision={0.1}
                    size="small"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    {product.useManualRating
                      ? `${product.manualReviewsCount || 0} ${t(
                        'products:stats.reviewsManual',
                        'تقييم (يدوي)'
                      )}`
                      : `${product.reviewsCount || 0} ${t(
                        'products:stats.reviewsReal',
                        'تقييم (حقيقي)'
                      )}`}
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
                    {t('products:stats.view', 'مشاهدة')}
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
                    {t('products:stats.sales', 'مبيعات')}
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
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(`/products/${id}/variants`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={product.variantsCount > 0 ? 'primary.main' : 'text.primary'}
                    >
                      {product.variantsCount || 0}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {product.variantsCount > 0
                      ? `🔗 ${t('products:stats.variantClickToManage', 'متغير (اضغط للإدارة)')}`
                      : `⚠️ ${t('products:stats.noVariants', 'لا توجد متغيرات')}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Stepper */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, overflowX: 'auto' }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{
            '& .MuiStepLabel-root': {
              cursor: 'pointer',
            },
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          {steps.map((label, index) => (
            <Step
              key={label}
              completed={completedSteps.has(index)}
              onClick={() => handleStepClick(index)}
            >
              <StepLabel
                StepIconComponent={({ active, completed }) => (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed
                        ? 'success.main'
                        : active
                          ? 'primary.main'
                          : 'action.disabledBackground',
                      color: completed || active ? 'white' : 'action.disabled',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                    }}
                  >
                    {completed ? <CheckCircle sx={{ fontSize: 20 }} /> : index + 1}
                  </Box>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>{renderStepContent(activeStep)}</Paper>

          {/* Navigation Buttons */}
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={handleBack}
                disabled={activeStep === 0}
                size={isMobile ? 'medium' : 'large'}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {t('common:actions.back', 'السابق')}
              </Button>

              <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {activeStep < TOTAL_STEPS - 1 ? (
                  <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={handleNext}
                    size={isMobile ? 'medium' : 'large'}
                    sx={{ width: { xs: '100%', sm: 'auto' }, flex: { xs: 1, sm: 'none' } }}
                  >
                    {t('common:actions.next', 'التالي')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : <Save />}
                    disabled={isCreating || isUpdating}
                    size={isMobile ? 'medium' : 'large'}
                    sx={{ width: { xs: '100%', sm: 'auto' }, flex: { xs: 1, sm: 'none' } }}
                  >
                    {t('products:form.save', 'حفظ المنتج')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(-1)}
                  size={isMobile ? 'medium' : 'large'}
                  sx={{ width: { xs: '100%', sm: 'auto' }, flex: { xs: 1, sm: 'none' } }}
                >
                  {t('products:form.cancel', 'إلغاء')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </form>
      </FormProvider>

      {/* Generate Variants Dialog */}
      <GenerateVariantsDialog
        open={generateVariantsDialogOpen}
        onClose={() => setGenerateVariantsDialogOpen(false)}
        onGenerate={handleGenerateSelectedVariants}
        selectedAttributeIds={selectedAttributes}
        defaultPrice={defaultPrice}
        defaultStock={defaultStock}
        isEditMode={isEditMode}
        existingVariantsCount={existingVariants?.length || 0}
      />
    </Box>
  );
};
