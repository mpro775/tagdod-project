import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  AutoFixHigh,
} from '@mui/icons-material';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useProduct, useAddVariant, useUpdateVariant, useDeleteVariant, useGenerateVariants } from '../hooks/useProducts';
import { formatCurrency } from '@/shared/utils/formatters';
import type { Variant, VariantAttribute } from '../types/product.types';
import { AttributeValueSelector } from '../components/AttributeValueSelector';

interface VariantFormData {
  _id?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  isActive: boolean;
  imageId?: string;
  attributeValues: VariantAttribute[];
}

export const ProductVariantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variantFormOpen, setVariantFormOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantFormData | null>(null);

  // API Hooks
  const { data: productData, isLoading, refetch } = useProduct(id!);
  const { mutate: addVariant, isPending: isAdding } = useAddVariant();
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant();
  const { mutate: deleteVariant } = useDeleteVariant();
  const { mutate: generateVariants, isPending: isGenerating } = useGenerateVariants();

  const product = productData;
  const variants = productData?.variants || [];

  // Actions
  const handleAddVariant = () => {
    setEditingVariant({
      price: 0,
      stock: 0,
      isActive: true,
      attributeValues: [],
    });
    setVariantFormOpen(true);
  };

  const handleEditVariant = (variant: Variant) => {
    setEditingVariant({
      _id: variant._id,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      costPrice: variant.costPrice,
      stock: variant.stock,
      isActive: variant.isActive,
      imageId: variant.imageId,
      attributeValues: variant.attributeValues || [],
    });
    setVariantFormOpen(true);
  };

  const handleDeleteVariant = (variant: Variant) => {
    if (window.confirm(`هل أنت متأكد من حذف هذا المتغير؟`)) {
      deleteVariant(
        { productId: id!, variantId: variant._id },
        {
          onSuccess: () => refetch(),
        }
      );
    }
  };

  const handleGenerateVariants = () => {
    setGenerateDialogOpen(true);
  };

  const handleSubmitVariant = (formData: VariantFormData) => {
    if (editingVariant?._id) {
      // Update existing variant
      updateVariant(
        {
          productId: id!,
          variantId: editingVariant._id,
          data: {
            sku: formData.sku,
            price: formData.price,
            compareAtPrice: formData.compareAtPrice,
            costPrice: formData.costPrice,
            stock: formData.stock,
            isActive: formData.isActive,
            imageId: formData.imageId,
          },
        },
        {
          onSuccess: () => {
            setVariantFormOpen(false);
            setEditingVariant(null);
            refetch();
          },
        }
      );
    } else {
      // Create new variant
      addVariant(
        {
          productId: id!,
          sku: formData.sku,
          attributeValues: formData.attributeValues,
          price: formData.price,
          compareAtPrice: formData.compareAtPrice,
          costPrice: formData.costPrice,
          stock: formData.stock,
          trackInventory: true,
          imageId: formData.imageId,
        },
        {
          onSuccess: () => {
            setVariantFormOpen(false);
            setEditingVariant(null);
            refetch();
          },
        }
      );
    }
  };

  const handleGenerateSubmit = (_defaultPrice: number, _defaultStock: number) => {
    generateVariants(
      {
        productId: id!,
        data: {
          defaultPrice: _defaultPrice,
          defaultStock: _defaultStock,
          overwriteExisting: false,
        },
      },
      {
        onSuccess: () => {
          setGenerateDialogOpen(false);
          refetch();
        },
      }
    );
  };

  // Table columns
  const columns = [
    {
      field: 'sku',
      headerName: 'SKU',
      width: 120,
      renderCell: (params: any) => params.value || '-',
    },
    {
      field: 'attributes',
      headerName: 'السمات',
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.row.attributeValues?.map((attr: any, index: number) => (
            <Chip
              key={index}
              label={`${attr.name}: ${attr.value}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'السعر',
      width: 120,
      renderCell: (params: any) => formatCurrency(params.value),
    },
    {
      field: 'compareAtPrice',
      headerName: 'سعر المقارنة',
      width: 130,
      renderCell: (params: any) => 
        params.value ? formatCurrency(params.value) : '-',
    },
    {
      field: 'stock',
      headerName: 'المخزون',
      width: 100,
      align: 'center' as const,
    },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params: any) => (
        <Chip
          label={params.value ? 'نشط' : 'غير نشط'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      sortable: false,
      renderCell: (params: any) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="تعديل">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditVariant(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteVariant(params.row)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Alert severity="error">
        المنتج غير موجود
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/products')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          متغيرات المنتج: {product.name}
        </Typography>
      </Box>

      {/* Product Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              معلومات المنتج
            </Typography>
            <Typography><strong>الاسم:</strong> {product.name}</Typography>
            <Typography><strong>الاسم بالإنجليزية:</strong> {product.nameEn}</Typography>
            <Typography><strong>الفئة:</strong> {product.category?.name || '-'}</Typography>
            <Typography><strong>العلامة التجارية:</strong> {product.brand?.name || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              إحصائيات
            </Typography>
            <Typography><strong>عدد المتغيرات:</strong> {variants.length}</Typography>
            <Typography><strong>المشاهدات:</strong> {product.viewsCount}</Typography>
            <Typography><strong>المبيعات:</strong> {product.salesCount}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Actions */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddVariant}
        >
          إضافة متغير
        </Button>
        <Button
          variant="outlined"
          startIcon={<AutoFixHigh />}
          onClick={handleGenerateVariants}
          disabled={!product.attributes?.length}
        >
          توليد متغيرات تلقائياً
        </Button>
      </Box>

      {/* Variants Table */}
      <Paper>
        <DataTable
          columns={columns}
          rows={variants}
          loading={isLoading}
          height="calc(100vh - 400px)"
          paginationModel={{ page: 0, pageSize: 10 }}
          onPaginationModelChange={() => {}}
          rowCount={variants.length}
        />
      </Paper>

      {/* Variant Form Dialog */}
      <VariantFormDialog
        open={variantFormOpen}
        onClose={() => {
          setVariantFormOpen(false);
          setEditingVariant(null);
        }}
        onSubmit={handleSubmitVariant}
        variant={editingVariant}
        isSubmitting={isAdding || isUpdating}
        productId={id!}
      />

      {/* Generate Variants Dialog */}
      <GenerateVariantsDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onSubmit={handleGenerateSubmit}
        isSubmitting={isGenerating}
      />
    </Box>
  );
};

// Variant Form Dialog Component
interface VariantFormDialogProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (formData: VariantFormData) => void;
  variant?: VariantFormData | null;
  isSubmitting: boolean;
  productId: string;
}

const VariantFormDialog: React.FC<VariantFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  variant,
  isSubmitting,
  productId,
}) => {
  const { data: productData } = useProduct(productId);
  const [formData, setFormData] = useState<VariantFormData>({
    price: 0,
    stock: 0,
    isActive: true,
    attributeValues: [],
  });

  React.useEffect(() => {
    if (variant) {
      setFormData(variant);
    } else {
      setFormData({
        price: 0,
        stock: 0,
        isActive: true,
        attributeValues: [],
      });
    }
  }, [variant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {variant?._id ? 'تعديل المتغير' : 'إضافة متغير جديد'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                SKU
              </Typography>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                placeholder="رقم المنتج الفريد"
              />
            </Grid>
            
            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                السعر *
              </Typography>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="0"
                step="0.01"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                سعر المقارنة
              </Typography>
              <input
                type="number"
                value={formData.compareAtPrice || ''}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) || undefined })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="0"
                step="0.01"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                سعر التكلفة
              </Typography>
              <input
                type="number"
                value={formData.costPrice || ''}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) || undefined })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="0"
                step="0.01"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                المخزون *
              </Typography>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="0"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                الحالة
              </Typography>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AttributeValueSelector
                value={formData.attributeValues}
                onChange={(attributeValues) => setFormData({ ...formData, attributeValues })}
                productAttributes={productData?.attributes || []}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {variant?._id ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Generate Variants Dialog Component
interface GenerateVariantsDialogProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (defaultPrice: number, defaultStock: number) => void;
  isSubmitting: boolean;
}

const GenerateVariantsDialog: React.FC<GenerateVariantsDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [defaultStock, setDefaultStock] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(defaultPrice, defaultStock);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>توليد متغيرات تلقائياً</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            سيتم إنشاء جميع التركيبات الممكنة من السمات المحددة للمنتج
          </Alert>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                السعر الافتراضي *
              </Typography>
              <input
                type="number"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="0"
                step="0.01"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                المخزون الافتراضي *
              </Typography>
              <input
                type="number"
                required
                value={defaultStock}
                onChange={(e) => setDefaultStock(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                min="0"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            توليد المتغيرات
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
