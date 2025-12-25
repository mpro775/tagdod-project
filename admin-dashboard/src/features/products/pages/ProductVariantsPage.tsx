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
  Tooltip,
  Stack,
  Paper,
} from '@mui/material';
import { ArrowBack, Add, Save, Cancel, Edit, Delete, Check, Close, SelectAll, Deselect, Clear, Home, ChevronRight } from '@mui/icons-material';
import { Breadcrumbs, Link } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import {
  useProduct,
  useProductVariants,
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '../hooks/useProducts';
import { FormInput } from '@/shared/components/Form/FormInput';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { VariantCard } from '../components/VariantCard';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import type { Variant, CreateVariantDto } from '../types/product.types';

// Validation Schema for Variant (مبسط - فقط الأساسيات)
const variantSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().min(0),
});

type VariantFormData = z.infer<typeof variantSchema>;

export const ProductVariantsPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ sku?: string; price: number; stock: number }>({ price: 0, stock: 0 });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<{ price?: number; stock?: number }>({});

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
    methods.reset({
      sku: '',
      price: 0,
      stock: 0,
    });
    setVariantDialogOpen(true);
  };

  const handleDeleteVariant = async (variant: Variant) => {
    const confirmed = await confirmDialog({
      title: t('products:variants.deleteTitle', 'تأكيد حذف المتغير'),
      message: `${t('products:variants.deleteConfirm', 'هل أنت متأكد من حذف المتغير')} "${
        variant.sku || variant._id
      }"؟`,
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      deleteVariant(
        { productId: id!, variantId: variant._id },
        {
          onSuccess: () => {
            toast.success(t('products:messages.deleteSuccess', 'تم الحذف بنجاح'));
            refetch();
          },
        }
      );
    }
  };

  const handleStartEdit = (variant: Variant) => {
    setEditingId(variant._id);
    setEditingData({
      sku: variant.sku || '',
      price: variant.price ?? variant.basePriceUSD ?? 0,
      stock: variant.stock || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({ price: 0, stock: 0, sku: '' });
  };

  const handleSaveEdit = (variantId: string) => {
    if (editingData.price < 0 || editingData.stock < 0) {
      toast.error(t('products:messages.priceStockRequired', 'السعر والكمية يجب أن تكون أكبر من أو تساوي صفر'));
      return;
    }

    updateVariant(
      { 
        productId: id!, 
        variantId, 
        data: {
          sku: editingData.sku?.trim() || undefined,
          price: editingData.price,
          stock: editingData.stock,
        } 
      },
      {
        onSuccess: () => {
          toast.success(t('products:messages.updateSuccess', 'تم التحديث بنجاح'));
          refetch();
          handleCancelEdit();
        },
        onError: (error: any) => {
          // معالجة أخطاء SKU المكرر
          const errorCode = error?.response?.data?.error?.code;
          const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message;
          const lowerErrorMessage = errorMessage?.toLowerCase() || '';
          
          // التحقق من كود الخطأ أو وجود كلمات مفتاحية في الرسالة
          if (
            errorCode === 'PRODUCT_314' || 
            lowerErrorMessage.includes('sku') || 
            lowerErrorMessage.includes('مكرر') ||
            lowerErrorMessage.includes('موجود مسبقاً') ||
            lowerErrorMessage.includes('duplicate')
          ) {
            toast.error(
              t('products:messages.duplicateSku', 'رمز SKU موجود مسبقاً. الرجاء استخدام رمز آخر'),
              { duration: 5000 }
            );
          } else {
            // عرض رسالة الخطأ العامة
            const message = errorMessage || 
                          error?.message || 
                          t('products:messages.updateError', 'حدث خطأ أثناء تحديث المتغير');
            toast.error(message, { duration: 5000 });
          }
        },
      }
    );
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedVariants.length === 0) return;
    const confirmed = await confirmDialog({
      title: t('products:variants.bulkDeleteTitle', 'تأكيد الحذف الجماعي'),
      message: t('products:variants.bulkDeleteConfirm', { count: selectedVariants.length }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      Promise.all(selectedVariants.map(variantId => 
        new Promise((resolve) => {
          deleteVariant(
            { productId: id!, variantId },
            {
              onSuccess: () => resolve(true),
              onError: () => resolve(false),
            }
          );
        })
      )).then(() => {
        setSelectedVariants([]);
        refetch();
        toast.success(t('products:messages.bulkDeleteSuccess', { count: selectedVariants.length }));
      });
    }
  };

  const handleBulkEdit = () => {
    if (selectedVariants.length === 0) return;
    setBulkEditDialogOpen(true);
  };

  const handleBulkEditSave = () => {
    if (selectedVariants.length === 0) return;
    
    Promise.all(selectedVariants.map(variantId => 
      new Promise((resolve) => {
        const updateData: any = {};
        if (bulkEditData.price !== undefined) updateData.price = bulkEditData.price;
        if (bulkEditData.stock !== undefined) updateData.stock = bulkEditData.stock;
        
        updateVariant(
          { productId: id!, variantId, data: updateData },
          {
            onSuccess: () => resolve(true),
            onError: () => resolve(false),
          }
        );
      })
    )).then(() => {
      setSelectedVariants([]);
      setBulkEditDialogOpen(false);
      setBulkEditData({});
      refetch();
      toast.success(t('products:messages.bulkUpdateSuccess', { count: selectedVariants.length }));
    });
  };

  const handleSelectAll = () => {
    if (selectedVariants.length === (variants?.length || 0)) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(variants?.map((v: Variant) => v._id) || []);
    }
  };

  const onSubmit = (data: VariantFormData) => {
    // التحقق من صحة البيانات قبل الإرسال
    if (isNaN(data.price) || data.price < 0) {
      toast.error(t('products:messages.invalidPrice', 'السعر غير صحيح'));
      return;
    }
    
    if (isNaN(data.stock) || data.stock < 0) {
      toast.error(t('products:messages.invalidStock', 'المخزون غير صحيح'));
      return;
    }

    const createData: CreateVariantDto = {
      productId: id!,
      sku: data.sku?.trim() || undefined,
      attributeValues: [], // سيتم إضافة السمات لاحقاً
      price: Number(data.price),
      stock: Number(data.stock),
    };

    addVariant(createData, {
      onSuccess: () => {
        toast.success(t('products:messages.createSuccess', 'تم الإنشاء بنجاح'));
        refetch();
        setVariantDialogOpen(false);
        methods.reset();
      },
      onError: (error: any) => {
        // معالجة أخطاء SKU المكرر
        const errorCode = error?.response?.data?.error?.code;
        const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message;
        const lowerErrorMessage = errorMessage?.toLowerCase() || '';
        
        // التحقق من كود الخطأ أو وجود كلمات مفتاحية في الرسالة
        if (
          errorCode === 'PRODUCT_314' || 
          lowerErrorMessage.includes('sku') || 
          lowerErrorMessage.includes('مكرر') ||
          lowerErrorMessage.includes('موجود مسبقاً') ||
          lowerErrorMessage.includes('duplicate')
        ) {
          toast.error(
            t('products:messages.duplicateSku', 'رمز SKU موجود مسبقاً. الرجاء استخدام رمز آخر'),
            { duration: 5000 }
          );
        } else {
          // عرض رسالة الخطأ العامة
          const message = errorMessage || 
                        error?.message || 
                        t('products:messages.createError', 'حدث خطأ أثناء إضافة المتغير');
          toast.error(message, { duration: 5000 });
        }
      },
    });
  };

  const handleCloseDialog = () => {
    setVariantDialogOpen(false);
    methods.reset();
  };

  if (loadingProduct) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Helper function to convert Arabic color names to hex
  const getColorValue = (colorName: string): string | null => {
    if (!colorName) return null;
    
    const colorMap: Record<string, string> = {
      'اسود': '#000000',
      'أسود': '#000000',
      'ابيض': '#FFFFFF',
      'أبيض': '#FFFFFF',
      'احمر': '#FF0000',
      'أحمر': '#FF0000',
      'ازرق': '#0000FF',
      'أزرق': '#0000FF',
      'اخضر': '#00FF00',
      'أخضر': '#00FF00',
      'اصفر': '#FFFF00',
      'أصفر': '#FFFF00',
      'برتقالي': '#FFA500',
      'بنفسجي': '#800080',
      'وردي': '#FFC0CB',
      'رمادي': '#808080',
      'بني': '#A52A2A',
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#00FF00',
      'yellow': '#FFFF00',
    };
    
    const normalized = colorName.toLowerCase().trim();
    return colorMap[normalized] || (normalized.startsWith('#') ? normalized : null);
  };

  // Prepare data for DataTable
  const getAttributeDisplay = (variant: Variant) => {
    if (!variant.attributeValues || variant.attributeValues.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          {t('products:variants.noAttributes', 'بدون سمات')}
        </Typography>
      );
    }
    
    return (
      <Stack spacing={0.5} direction="column">
        {variant.attributeValues.map((attr, index) => {
          const isColorAttribute = attr.name?.toLowerCase().includes('لون') || 
                                   attr.name?.toLowerCase().includes('color');
          const colorValue = isColorAttribute ? getColorValue(attr.value || '') : null;
          const hasValidColor = colorValue !== null;
          const key = attr.valueId || `${attr.attributeId}-${index}`;
          
          return (
            <Box 
              key={key} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flexWrap: 'nowrap'
              }}
            >
              {isColorAttribute && hasValidColor && (
                <Box 
                  sx={{ 
                    width: 18, 
                    height: 18, 
                    borderRadius: '50%', 
                    bgcolor: colorValue,
                    border: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0
                  }} 
                />
              )}
              <Typography 
                variant="body2" 
                component="span"
                sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
              >
                <strong>{attr.name}:</strong> {attr.value}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    );
  };

  const getStockChip = (variant: Variant) => {
    if (variant.stock === 0) {
      return (
        <Chip
          label={t('products:variants.status.outOfStock', 'غير متوفر')}
          color="error"
          size="small"
        />
      );
    } else if (variant.stock <= (variant.minStock || 0)) {
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

  const columns: GridColDef[] = [
    {
      field: 'attributes',
      headerName: t('products:variants.columns.attributes', 'السمات'),
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ py: 0.5, width: '100%' }}>
          {getAttributeDisplay(params.row)}
        </Box>
      ),
    },
    {
      field: 'sku',
      headerName: t('products:variants.columns.sku', 'SKU'),
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isEditing = editingId === params.row._id;
        return isEditing ? (
          <TextField
            type="text"
            size="small"
            value={editingData.sku || ''}
            onChange={(e) => setEditingData({ ...editingData, sku: e.target.value })}
            sx={{ width: 120 }}
            onClick={(e) => e.stopPropagation()}
            placeholder={t('products:variants.form.sku', 'SKU')}
          />
        ) : (
          <Typography variant="body2" color={params.row.sku ? 'text.primary' : 'text.secondary'}>
            {params.row.sku || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'price',
      headerName: t('products:variants.columns.price', 'السعر'),
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isEditing = editingId === params.row._id;
        const price = params.row.price ?? params.row.basePriceUSD ?? 0;
        return isEditing ? (
          <TextField
            type="number"
            size="small"
            value={editingData.price}
            onChange={(e) => setEditingData({ ...editingData, price: Number(e.target.value) })}
            sx={{ width: 100 }}
            inputProps={{ min: 0, step: 0.01 }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Typography variant="h6" color="primary">
            ${price}
          </Typography>
        );
      },
    },
    {
      field: 'stock',
      headerName: t('products:variants.columns.stock', 'المخزون'),
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isEditing = editingId === params.row._id;
        return isEditing ? (
          <TextField
            type="number"
            size="small"
            value={editingData.stock}
            onChange={(e) => setEditingData({ ...editingData, stock: Number(e.target.value) })}
            sx={{ width: 100 }}
            inputProps={{ min: 0 }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Typography variant="body1">{params.row.stock}</Typography>
        );
      },
    },
    {
      field: 'status',
      headerName: t('products:variants.columns.status', 'الحالة'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => getStockChip(params.row),
    },
    {
      field: 'actions',
      headerName: t('products:variants.columns.actions', 'الإجراءات'),
      width: 180,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const variant = params.row;
        const isEditing = editingId === variant._id;
        return isEditing ? (
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
        );
      },
    },
  ];

  // Prepare rows for DataTable
  const rows = variants || [];

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
        <Link
          color="inherit"
          href={`/products/${id}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/products/${id}`);
          }}
          sx={{ textDecoration: 'none' }}
        >
          {product?.name || t('products:variants.product', 'المنتج')}
        </Link>
        <Typography color="text.primary">
          {t('products:variants.manage', 'إدارة المتغيرات')}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        gap={2}
        mb={3}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/products/${id}`)}
          fullWidth={isMobile}
        >
          {t('products:variants.backToProduct', 'العودة إلى المنتج')}
        </Button>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ flex: 1 }}>
          {t('products:variants.manage', 'إدارة المتغيرات')}
        </Typography>
      </Box>

      {/* Product Info */}
      {product && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {product.nameEn}
            </Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              <Chip label={t(`products:status.${product.status}`, product.status)} color="primary" size="small" />
              {product.isFeatured && (
                <Chip label={t('products:badges.featured', 'مميز')} color="warning" size="small" />
              )}
              {product.isNew && (
                <Chip label={t('products:badges.new', 'جديد')} color="success" size="small" />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'stretch' : 'center'}
        gap={2}
        mb={3}
      >
        <Typography variant={isMobile ? 'body1' : 'h6'}>
          {t('products:variants.count', {
            count: variants?.length || 0,
            defaultValue: 'عدد المتغيرات: {{count}}',
          })}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddVariant}
          fullWidth={isMobile}
        >
          {t('products:variants.add', 'إضافة متغير')}
        </Button>
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedVariants.length > 0 && (
        <Paper 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: 2,
            bgcolor: 'primary.light',
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1" fontWeight="medium">
              {t('products:variants.selectedCount', 'تم اختيار {{count}} متغير', { count: selectedVariants.length })}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Edit />}
                onClick={handleBulkEdit}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {t('products:variants.bulkEdit', 'تعديل جماعي')}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {t('products:variants.bulkDelete', 'حذف المحدد')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={selectedVariants.length === (variants?.length || 0) ? <Deselect /> : <SelectAll />}
                onClick={handleSelectAll}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {selectedVariants.length === (variants?.length || 0) 
                  ? t('products:variants.deselectAll', 'إلغاء تحديد الكل')
                  : t('products:variants.selectAll', 'تحديد الكل')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={() => setSelectedVariants([])}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {t('products:variants.clearSelection', 'مسح التحديد')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Variants Display */}
      {loadingVariants ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : variants && variants.length > 0 ? (
        <>
          {isMobile ? (
            /* Mobile Card Layout - 2 cards per row */
            <Grid container spacing={2}>
              {variants.map((variant) => {
                const isEditing = editingId === variant._id;
                return (
                  <Grid size={{ xs: 6 }} key={variant._id}>
                    <VariantCard
                      variant={variant}
                      onDelete={handleDeleteVariant}
                      showActions={true}
                    />
                    {isEditing && (
                      <Card sx={{ mt: 2, p: 2 }}>
                        <Stack spacing={2}>
                          <TextField
                            label={t('products:variants.form.sku', 'SKU')}
                            type="text"
                            size="small"
                            value={editingData.sku || ''}
                            onChange={(e) => setEditingData({ ...editingData, sku: e.target.value })}
                            fullWidth
                            helperText={t('products:variants.form.skuHelp', 'رمز التخزين (اختياري)')}
                          />
                          <TextField
                            label={t('products:variants.form.price', 'السعر')}
                            type="number"
                            size="small"
                            value={editingData.price}
                            onChange={(e) => setEditingData({ ...editingData, price: Number(e.target.value) })}
                            inputProps={{ min: 0, step: 0.01 }}
                            fullWidth
                          />
                          <TextField
                            label={t('products:variants.form.stock', 'المخزون')}
                            type="number"
                            size="small"
                            value={editingData.stock}
                            onChange={(e) => setEditingData({ ...editingData, stock: Number(e.target.value) })}
                            inputProps={{ min: 0 }}
                            fullWidth
                          />
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Check />}
                              onClick={() => handleSaveEdit(variant._id)}
                              disabled={updatingVariant}
                              fullWidth
                            >
                              {t('common:actions.save', 'حفظ')}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Close />}
                              onClick={handleCancelEdit}
                              fullWidth
                            >
                              {t('common:actions.cancel', 'إلغاء')}
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            /* Desktop DataTable Layout */
            <DataTable
              columns={columns}
              rows={rows}
              loading={loadingVariants}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              getRowId={(row: unknown) => (row as Variant)?._id || ''}
              selectable={true}
              onRowSelectionModelChange={(selection) => setSelectedVariants(selection as string[])}
              height={600}
            />
          )}
        </>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant={isMobile ? 'body1' : 'h6'} gutterBottom>
            {t('products:variants.empty', 'لا توجد متغيرات بعد')}
          </Typography>
          <Typography variant="body2">
            {t('products:variants.emptyDescription', 'أضف متغيرات للمنتج لبدء إدارتها هنا')}
          </Typography>
        </Alert>
      )}

      {/* Variant Form Dialog */}
      <Dialog
        open={variantDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {t('products:variants.addVariant', 'إضافة متغير')}
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
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />} fullWidth={isMobile}>
            {t('products:variants.form.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={methods.handleSubmit(onSubmit)}
            variant="contained"
            startIcon={addingVariant ? <CircularProgress size={20} /> : <Save />}
            disabled={addingVariant}
            fullWidth={isMobile}
          >
            {t('common:actions.add', 'إضافة')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog
        open={bulkEditDialogOpen}
        onClose={() => setBulkEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {t('products:variants.bulkEditTitle', 'تعديل جماعي للمتغيرات')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Alert severity="info">
              {t('products:variants.bulkEditInfo', 'سيتم تطبيق التغييرات على {{count}} متغير', { count: selectedVariants.length })}
            </Alert>
            <TextField
              label={t('products:variants.form.price', 'السعر')}
              type="number"
              value={bulkEditData.price || ''}
              onChange={(e) => setBulkEditData({ ...bulkEditData, price: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              helperText={t('products:variants.bulkEditPriceHelp', 'اتركه فارغاً إذا لم ترد تغييره')}
            />
            <TextField
              label={t('products:variants.form.stock', 'المخزون')}
              type="number"
              value={bulkEditData.stock || ''}
              onChange={(e) => setBulkEditData({ ...bulkEditData, stock: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 0 }}
              helperText={t('products:variants.bulkEditStockHelp', 'اتركه فارغاً إذا لم ترد تغييره')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEditDialogOpen(false)} startIcon={<Cancel />}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleBulkEditSave}
            variant="contained"
            startIcon={<Save />}
            disabled={bulkEditData.price === undefined && bulkEditData.stock === undefined}
          >
            {t('common:actions.save', 'حفظ')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Box>
  );
};
