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
  Chip,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { ArrowBack, Add, Save, Cancel, Edit, Delete, Check, Close } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  useProduct,
  useProductVariants,
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '../hooks/useProducts';
import { VariantCard } from '../components/VariantCard';
import { FormInput } from '@/shared/components/Form/FormInput';
import type { Variant, CreateVariantDto, UpdateVariantDto } from '../types/product.types';

// Validation Schema for Variant (مبسط - فقط الأساسيات)
const variantSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر'),
  stock: z.number().min(0, 'الكمية يجب أن تكون أكبر من أو يساوي صفر'),
});

type VariantFormData = z.infer<typeof variantSchema>;

export const ProductVariantsPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ price: number; stock: number }>({ price: 0, stock: 0 });

  // Form
  const methods = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: '',
      price: 0,
      stock: 0,
    },
  });

  // API
  const { data: product, isLoading: loadingProduct } = useProduct(id!);
  const { data: variants, isLoading: loadingVariants, refetch } = useProductVariants(id!);
  const { mutate: addVariant, isPending: addingVariant } = useAddVariant();
  const { mutate: updateVariant, isPending: updatingVariant } = useUpdateVariant();
  const { mutate: deleteVariant } = useDeleteVariant();

  const handleAddVariant = () => {
    setIsEditMode(false);
    methods.reset({
      sku: '',
      price: 0,
      stock: 0,
    });
    setVariantDialogOpen(true);
  };

  const handleEditVariant = (variant: Variant) => {
    setIsEditMode(true);
    setSelectedVariant(variant);
    methods.reset({
      sku: variant.sku || '',
      price: variant.price,
      stock: variant.stock,
    });
    setVariantDialogOpen(true);
  };

  const handleDeleteVariant = (variant: Variant) => {
    if (
      window.confirm(
        `${t('products:variants.deleteConfirm', 'هل أنت متأكد من حذف المتغير')} "${
          variant.sku || variant._id
        }"؟`
      )
    ) {
      deleteVariant(
        { productId: id!, variantId: variant._id },
        {
          onSuccess: () => refetch(),
        }
      );
    }
  };

  const handleStartEdit = (variant: Variant) => {
    setEditingId(variant._id);
    setEditingData({
      price: variant.price || 0,
      stock: variant.stock || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({ price: 0, stock: 0 });
  };

  const handleSaveEdit = (variantId: string) => {
    if (editingData.price < 0 || editingData.stock < 0) {
      toast.error(t('products:messages.priceStockRequired'));
      return;
    }

    updateVariant(
      { 
        productId: id!, 
        variantId, 
        data: {
          price: editingData.price,
          stock: editingData.stock,
        } 
      },
      {
        onSuccess: () => {
          toast.success(t('products:messages.updateSuccess'));
          refetch();
          handleCancelEdit();
        },
      }
    );
  };

  const onSubmit = (data: VariantFormData) => {
    if (isEditMode && selectedVariant) {
      const updateData: UpdateVariantDto = {
        sku: data.sku,
        price: data.price,
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
        attributeValues: [], // سيتم إضافة السمات لاحقاً
        price: data.price,
        stock: data.stock,
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
          {t('products:variants.backToProduct', 'العودة إلى المنتج')}
        </Button>
        <Typography variant="h4" component="h1">
          {t('products:variants.manage', 'إدارة المتغيرات')}
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
          {t('products:variants.count', {
            count: variants?.length || 0,
            defaultValue: 'عدد المتغيرات: {{count}}',
          })}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddVariant}>
          {t('products:variants.add', 'إضافة متغير')}
        </Button>
      </Box>

      {/* Variants Table */}
      {loadingVariants ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : variants && variants.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.50' }}>
                <TableCell><strong>{t('products:variants.columns.attributes', 'السمات')}</strong></TableCell>
                <TableCell align="center"><strong>{t('products:variants.columns.price', 'السعر')}</strong></TableCell>
                <TableCell align="center"><strong>{t('products:variants.columns.stock', 'المخزون')}</strong></TableCell>
                <TableCell align="center"><strong>{t('products:variants.columns.status', 'الحالة')}</strong></TableCell>
                <TableCell align="center"><strong>{t('products:variants.columns.actions', 'الإجراءات')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant) => {
                const isEditing = editingId === variant._id;
                const getAttributeDisplay = () => {
                  if (!variant.attributeValues || variant.attributeValues.length === 0) {
                    return '⚪ ' + t('products:variants.noAttributes', 'لا توجد سمات');
                  }
                  return variant.attributeValues.map((attr) => {
                    // عرض اللون كنقطة ملونة إذا كان اللون
                    if (attr.name?.toLowerCase().includes('لون') || attr.name?.toLowerCase().includes('color')) {
                      return (
                        <Box key={attr.valueId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%', 
                              bgcolor: attr.value, 
                              border: '1px solid #ccc' 
                            }} 
                          />
                          <Typography>{attr.value}</Typography>
                        </Box>
                      );
                    }
                    return `${attr.name}: ${attr.value}`;
                  });
                };

                const getStockChip = () => {
                  if (variant.stock === 0) {
                    return (
                      <Chip
                        label={t('products:variants.status.outOfStock', 'غير متوفر')}
                        color="error"
                        size="small"
                      />
                    );
                  } else if (variant.stock <= variant.minStock) {
                    return (
                      <Chip
                        label={t('products:variants.status.low', 'منخفض')}
                        color="warning"
                        size="small"
                      />
                    );
                  } else {
                    return (
                      <Chip
                        label={t('products:variants.status.available', 'متوفر')}
                        color="success"
                        size="small"
                      />
                    );
                  }
                };

                return (
                  <TableRow key={variant._id} hover>
                    <TableCell>
                      {getAttributeDisplay()}
                      {variant.sku && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          SKU: {variant.sku}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <TextField
                          type="number"
                          size="small"
                          value={editingData.price}
                          onChange={(e) => setEditingData({ ...editingData, price: Number(e.target.value) })}
                          sx={{ width: 100 }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      ) : (
                        <Typography variant="h6" color="primary">
                          ${variant.price}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <TextField
                          type="number"
                          size="small"
                          value={editingData.stock}
                          onChange={(e) => setEditingData({ ...editingData, stock: Number(e.target.value) })}
                          sx={{ width: 100 }}
                          inputProps={{ min: 0 }}
                        />
                      ) : (
                        <Typography variant="h6">{variant.stock}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {getStockChip()}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title={t('common:actions.save', 'حفظ')}>
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleSaveEdit(variant._id)}
                              disabled={updatingVariant}
                            >
                              <Check />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common:actions.cancel', 'إلغاء')}>
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={handleCancelEdit}
                            >
                              <Close />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title={t('products:variants.form.quickEdit', 'تعديل سريع')}>
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleStartEdit(variant)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common:actions.delete', 'حذف')}>
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleDeleteVariant(variant)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('products:variants.empty', 'لا توجد متغيرات بعد')}
          </Typography>
          <Typography variant="body2">
            {t('products:variants.emptyDescription', 'أضف متغيرات للمنتج لبدء إدارتها هنا')}
          </Typography>
        </Alert>
      )}

      {/* Variant Form Dialog */}
      <Dialog open={variantDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode
            ? t('products:variants.edit', 'تعديل متغير')
            : t('products:variants.addVariant', 'إضافة متغير')}
        </DialogTitle>
        <DialogContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Box display="flex" flexDirection="column" gap={3} pt={2}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    💡 {t('products:variants.generateTip', 'يمكنك توليد المتغيرات تلقائياً من السمات لاحقاً')}
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <FormInput
                      name="sku"
                      label={t('products:variants.form.sku', 'SKU')}
                      helperText={t('products:variants.form.skuHelp', 'رمز التخزين (اختياري)')}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormInput
                      name="price"
                      label={t('products:variants.form.price', 'السعر') + ' *'}
                      type="number"
                      helperText={t('products:variants.form.priceHelp', 'أدخل السعر')}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormInput 
                      name="stock" 
                      label={t('products:variants.form.stock', 'المخزون') + ' *'}
                      type="number"
                      helperText={t('products:variants.form.stockHelp', 'أدخل الكمية المتاحة')}
                    />
                  </Grid>
                </Grid>

                <Alert severity="warning">
                  <Typography variant="body2">
                    {t('products:variants.form.discountNote', 'ملاحظة: يمكن تطبيق الخصومات لاحقاً من إعدادات التسعير')}
                  </Typography>
                </Alert>
              </Box>
            </form>
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            {t('products:variants.form.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={methods.handleSubmit(onSubmit)}
            variant="contained"
            startIcon={addingVariant || updatingVariant ? <CircularProgress size={20} /> : <Save />}
            disabled={addingVariant || updatingVariant}
          >
            {isEditMode ? t('common:actions.edit', 'تعديل') : t('common:actions.add', 'إضافة')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
