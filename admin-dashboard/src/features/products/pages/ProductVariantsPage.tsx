import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Inventory,
  AttachMoney,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useProduct,
  useProductVariants,
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '../hooks/useProducts';
import { VariantCard } from '../components/VariantCard';
import { StockManager } from '../components/StockManager';
import { PricingManager } from '../components/PricingManager';
import { FormInput } from '@/shared/components/Form/FormInput';
import type { Variant, CreateVariantDto, UpdateVariantDto } from '../types/product.types';

// Validation Schema for Variant
const variantSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر'),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stock: z.number().min(0, 'الكمية يجب أن تكون أكبر من أو يساوي صفر'),
  minStock: z.number().min(0).optional(),
  trackInventory: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  weight: z.number().min(0).optional(),
});

type VariantFormData = z.infer<typeof variantSchema>;

export const ProductVariantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form
  const methods = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: '',
      price: 0,
      stock: 0,
      minStock: 0,
      trackInventory: true,
      allowBackorder: false,
    },
  });

  // API
  const { data: product, isLoading: loadingProduct } = useProduct(id!);
  const { data: variants, isLoading: loadingVariants, refetch } = useProductVariants(id!);
  const { mutate: addVariant, isPending: addingVariant } = useAddVariant();
  const { mutate: updateVariant, isPending: updatingVariant } = useUpdateVariant();
  const { mutate: deleteVariant, isPending: deletingVariant } = useDeleteVariant();

  const handleAddVariant = () => {
    setIsEditMode(false);
    methods.reset({
      sku: '',
      price: 0,
      stock: 0,
      minStock: 0,
      trackInventory: true,
      allowBackorder: false,
    });
    setVariantDialogOpen(true);
  };

  const handleEditVariant = (variant: Variant) => {
    setIsEditMode(true);
    setSelectedVariant(variant);
    methods.reset({
      sku: variant.sku || '',
      price: variant.price,
      compareAtPrice: variant.compareAtPrice || 0,
      costPrice: variant.costPrice || 0,
      stock: variant.stock,
      minStock: variant.minStock,
      trackInventory: variant.trackInventory,
      allowBackorder: variant.allowBackorder,
      weight: variant.weight || 0,
    });
    setVariantDialogOpen(true);
  };

  const handleDeleteVariant = (variant: Variant) => {
    if (window.confirm(`هل أنت متأكد من حذف المتغير "${variant.sku || variant._id}"؟`)) {
      deleteVariant(
        { productId: id!, variantId: variant._id },
        {
          onSuccess: () => refetch(),
        }
      );
    }
  };

  const onSubmit = (data: VariantFormData) => {
    if (isEditMode && selectedVariant) {
      const updateData: UpdateVariantDto = {
        sku: data.sku,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        stock: data.stock,
        isActive: selectedVariant.isActive,
      };

      updateVariant(
        { productId: id!, variantId: selectedVariant._id, data: updateData },
        {
          onSuccess: () => {
            refetch();
            setVariantDialogOpen(false);
            setSelectedVariant(null);
          },
        }
      );
    } else {
      const createData: CreateVariantDto = {
        productId: id!,
        sku: data.sku,
        attributeValues: [], // This would be handled by attribute selection
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        stock: data.stock,
        trackInventory: data.trackInventory,
        weight: data.weight,
      };

      addVariant(createData, {
        onSuccess: () => {
          refetch();
          setVariantDialogOpen(false);
        },
      });
    }
  };

  const handleCloseDialog = () => {
    setVariantDialogOpen(false);
    setSelectedVariant(null);
    methods.reset();
  };

  if (loadingProduct) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/products/${id}`)}
        >
          العودة للمنتج
        </Button>
        <Typography variant="h4" component="h1">
          إدارة متغيرات المنتج
        </Typography>
      </Box>

      {/* Product Info */}
      {product && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {product.nameEn}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip label={product.status} color="primary" size="small" />
              {product.isFeatured && <Chip label="مميز" color="warning" size="small" />}
              {product.isNew && <Chip label="جديد" color="success" size="small" />}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          المتغيرات ({variants?.length || 0})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddVariant}
        >
          إضافة متغير
        </Button>
      </Box>

      {/* Variants Grid */}
      {loadingVariants ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : variants && variants.length > 0 ? (
        <Grid container spacing={3}>
          {variants.map((variant) => (
            <Grid item xs={12} sm={6} md={4} key={variant._id}>
              <VariantCard
                variant={variant}
                onEdit={handleEditVariant}
                onDelete={handleDeleteVariant}
                showActions={true}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          لا توجد متغيرات لهذا المنتج. قم بإضافة متغير جديد للبدء.
        </Alert>
      )}

      {/* Variant Form Dialog */}
      <Dialog
        open={variantDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'تعديل المتغير' : 'إضافة متغير جديد'}
        </DialogTitle>
        <DialogContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Box display="flex" flexDirection="column" gap={2} pt={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="sku"
                      label="رقم المنتج (SKU)"
                      helperText="اختياري - سيتم توليد رقم تلقائي إذا لم يتم تحديده"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="price"
                      label="السعر الأساسي *"
                      type="number"
                      helperText="بالدولار الأمريكي"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="compareAtPrice"
                      label="السعر الأصلي"
                      type="number"
                      helperText="للعرض قبل الخصم"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="costPrice"
                      label="سعر التكلفة"
                      type="number"
                      helperText="لحساب الربحية"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="stock"
                      label="الكمية في المخزون *"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="minStock"
                      label="الحد الأدنى للمخزون"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="weight"
                      label="الوزن (كجم)"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="trackInventory"
                      label="تتبع المخزون"
                      type="checkbox"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormInput
                      name="allowBackorder"
                      label="السماح بالطلب المسبق"
                      type="checkbox"
                    />
                  </Grid>
                </Grid>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>ملاحظة:</strong> السمات والمتغيرات ستكون متاحة في إصدارات لاحقة.
                    حالياً يمكنك إضافة متغير أساسي للمنتج.
                  </Typography>
                </Alert>
              </Box>
            </form>
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            إلغاء
          </Button>
          <Button
            onClick={methods.handleSubmit(onSubmit)}
            variant="contained"
            startIcon={addingVariant || updatingVariant ? <CircularProgress size={20} /> : <Save />}
            disabled={addingVariant || updatingVariant}
          >
            {isEditMode ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};