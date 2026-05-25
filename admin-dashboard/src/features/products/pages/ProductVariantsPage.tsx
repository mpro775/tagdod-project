import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { Add, Edit, Delete, Inventory, ArrowBack } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  useProduct,
  useProductVariants,
  useAddVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '../hooks/useProducts';
import { ProductImage } from '../components/ProductImage';
import { SmartSkuInput } from '../components/SmartSkuInput';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import {
  PageShell,
  PageHeader,
  PageSummaryGrid,
  StatCard,
  DataToolbar,
  ResponsiveDataView,
  StatusChip,
  DetailsDrawer,
  ConfirmDialog,
  FormActionBar,
  LoadingState,
  RowActionsMenu,
} from '@/shared/design-system';
import type { Variant, CreateVariantDto } from '../types/product.types';

const variantSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().min(0),
});

type VariantFormData = z.infer<typeof variantSchema>;

const getColorValue = (colorName: string): string | null => {
  if (!colorName) return null;
  const colorMap: Record<string, string> = {
    'اسود': '#000000', 'أسود': '#000000',
    'ابيض': '#FFFFFF', 'أبيض': '#FFFFFF',
    'احمر': '#FF0000', 'أحمر': '#FF0000',
    'ازرق': '#0000FF', 'أزرق': '#0000FF',
    'اخضر': '#00FF00', 'أخضر': '#00FF00',
    'اصفر': '#FFFF00', 'أصفر': '#FFFF00',
    'برتقالي': '#FFA500', 'بنفسجي': '#800080',
    'وردي': '#FFC0CB', 'رمادي': '#808080',
    'بني': '#A52A2A',
    'black': '#000000', 'white': '#FFFFFF',
    'red': '#FF0000', 'blue': '#0000FF',
    'green': '#00FF00', 'yellow': '#FFFF00',
  };
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || (normalized.startsWith('#') ? normalized : null);
};

export const ProductVariantsPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { id } = useParams<{ id: string }>();
  const { confirmDialog, dialogProps } = useConfirmDialog();

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('sku');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [editSku, setEditSku] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);

  const [bulkEditDrawerOpen, setBulkEditDrawerOpen] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkStock, setBulkStock] = useState<string>('');

  const [onyxData, setOnyxData] = useState<{ isLinked: boolean; stock?: number }>({ isLinked: false });

  const methods = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: { sku: '', price: 0, stock: 0 },
  });

  const { data: product, isLoading: loadingProduct } = useProduct(id!);
  const { data: variants, isLoading: loadingVariants, refetch } = useProductVariants(id!);
  const { mutate: addVariant, isPending: addingVariant } = useAddVariant();
  const { mutate: updateVariant, isPending: updatingVariant } = useUpdateVariant();
  const { mutate: deleteVariant } = useDeleteVariant();

  const handleOnyxValidation = (result: { existsInOnyx: boolean; onyxStock?: number }) => {
    setOnyxData({ isLinked: result.existsInOnyx, stock: result.onyxStock });
    if (result.existsInOnyx && result.onyxStock !== undefined) {
      methods.setValue('stock', result.onyxStock);
      toast.success(t('products:integration.linkedSuccess', 'تم الربط مع أونكس'));
    }
  };

  const handleOpenAddDrawer = () => {
    setOnyxData({ isLinked: false });
    methods.reset({ sku: '', price: 0, stock: 0 });
    setAddDrawerOpen(true);
  };

  const handleCloseAddDrawer = () => {
    setAddDrawerOpen(false);
    methods.reset();
  };

  const handleOpenEditDrawer = (variant: Variant) => {
    setEditingVariant(variant);
    setEditSku(variant.sku || '');
    setEditPrice(variant.price ?? variant.basePriceUSD ?? 0);
    setEditStock(variant.stock || 0);
    setEditDrawerOpen(true);
  };

  const handleCloseEditDrawer = () => {
    setEditDrawerOpen(false);
    setEditingVariant(null);
  };

  const handleDeleteVariant = async (variant: Variant) => {
    const confirmed = await confirmDialog({
      title: t('products:variants.deleteTitle', 'تأكيد حذف المتغير'),
      message: `${t('products:variants.deleteConfirm', 'هل أنت متأكد من حذف المتغير')} "${variant.sku || variant._id}"؟`,
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      deleteVariant(
        { productId: id!, variantId: variant._id },
        { onSuccess: () => { toast.success(t('products:messages.deleteSuccess', 'تم الحذف بنجاح')); refetch(); } }
      );
    }
  };

  const handleSaveEdit = () => {
    if (!editingVariant) return;
    if (editPrice < 0 || editStock < 0) {
      toast.error(t('products:messages.priceStockRequired', 'السعر والكمية يجب أن تكون أكبر من أو تساوي صفر'));
      return;
    }
    updateVariant(
      {
        productId: id!,
        variantId: editingVariant._id,
        data: { sku: editSku.trim() || undefined, price: editPrice, stock: editStock },
      },
      {
        onSuccess: () => { toast.success(t('products:messages.updateSuccess', 'تم التحديث بنجاح')); refetch(); handleCloseEditDrawer(); },
        onError: (error: any) => {
          const errorCode = error?.response?.data?.error?.code;
          const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message;
          const lowerMsg = errorMessage?.toLowerCase() || '';
          if (errorCode === 'PRODUCT_314' || lowerMsg.includes('sku') || lowerMsg.includes('مكرر') || lowerMsg.includes('duplicate')) {
            toast.error(t('products:messages.duplicateSku', 'رمز SKU موجود مسبقاً'), { duration: 5000 });
          } else {
            toast.error(errorMessage || error?.message || t('products:messages.updateError', 'حدث خطأ أثناء تحديث المتغير'), { duration: 5000 });
          }
        },
      }
    );
  };

  const onSubmit = (data: VariantFormData) => {
    if (isNaN(data.price) || data.price < 0) { toast.error(t('products:messages.invalidPrice', 'السعر غير صحيح')); return; }
    if (isNaN(data.stock) || data.stock < 0) { toast.error(t('products:messages.invalidStock', 'المخزون غير صحيح')); return; }
    const createData: CreateVariantDto = {
      productId: id!,
      sku: data.sku?.trim() || undefined,
      attributeValues: [],
      price: Number(data.price),
      stock: Number(data.stock),
    };
    addVariant(createData, {
      onSuccess: () => { toast.success(t('products:messages.createSuccess', 'تم الإنشاء بنجاح')); refetch(); handleCloseAddDrawer(); },
      onError: (error: any) => {
        const errorCode = error?.response?.data?.error?.code;
        const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message;
        const lowerMsg = errorMessage?.toLowerCase() || '';
        if (errorCode === 'PRODUCT_314' || lowerMsg.includes('sku') || lowerMsg.includes('مكرر') || lowerMsg.includes('duplicate')) {
          toast.error(t('products:messages.duplicateSku', 'رمز SKU موجود مسبقاً'), { duration: 5000 });
        } else {
          toast.error(errorMessage || error?.message || t('products:messages.createError', 'حدث خطأ أثناء إضافة المتغير'), { duration: 5000 });
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedVariants.length === 0) return;
    const confirmed = await confirmDialog({
      title: t('products:variants.bulkDeleteTitle', 'تأكيد الحذف الجماعي'),
      message: t('products:variants.bulkDeleteConfirm', { count: selectedVariants.length }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      Promise.all(selectedVariants.map((variantId) =>
        new Promise((resolve) => {
          deleteVariant({ productId: id!, variantId }, { onSuccess: () => resolve(true), onError: () => resolve(false) });
        })
      )).then(() => { setSelectedVariants([]); refetch(); toast.success(t('products:messages.bulkDeleteSuccess', { count: selectedVariants.length })); });
    }
  };

  const handleBulkEditSave = () => {
    if (selectedVariants.length === 0) return;
    Promise.all(selectedVariants.map((variantId) =>
      new Promise((resolve) => {
        const updateData: any = {};
        if (bulkPrice !== '') updateData.price = Number(bulkPrice);
        if (bulkStock !== '') updateData.stock = Number(bulkStock);
        updateVariant(
          { productId: id!, variantId, data: updateData },
          { onSuccess: () => resolve(true), onError: () => resolve(false) }
        );
      })
    )).then(() => {
      setSelectedVariants([]);
      setBulkEditDrawerOpen(false);
      setBulkPrice('');
      setBulkStock('');
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

  const filteredVariants = useMemo(() => {
    if (!variants) return [];
    let result = [...variants];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((v) =>
        (v.sku?.toLowerCase().includes(q)) ||
        v.attributeValues?.some((a) => a.name?.toLowerCase().includes(q) || a.value?.toLowerCase().includes(q))
      );
    }

    if (stockFilter === 'inStock') result = result.filter((v) => v.stock > (v.minStock || 0));
    else if (stockFilter === 'lowStock') result = result.filter((v) => v.stock > 0 && v.stock <= (v.minStock || 0));
    else if (stockFilter === 'outOfStock') result = result.filter((v) => v.stock === 0);

    result.sort((a, b) => {
      let cmp = 0;
      const aVal = sortField === 'sku' ? (a.sku || '') : sortField === 'price' ? (a.price ?? a.basePriceUSD ?? 0) : a.stock;
      const bVal = sortField === 'sku' ? (b.sku || '') : sortField === 'price' ? (b.price ?? b.basePriceUSD ?? 0) : b.stock;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else cmp = (aVal as number) - (bVal as number);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [variants, search, stockFilter, sortField, sortDir]);

  const inStockCount = variants?.filter((v) => v.stock > (v.minStock || 0)).length ?? 0;
  const outOfStockCount = variants?.filter((v) => v.stock === 0).length ?? 0;
  const lowStockCount = variants?.filter((v) => v.stock > 0 && v.stock <= (v.minStock || 0)).length ?? 0;

  const columns: GridColDef[] = [
    {
      field: 'attributes',
      headerName: t('products:variants.columns.attributes', 'السمات'),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const v = params.row as Variant;
        if (!v.attributeValues || v.attributeValues.length === 0) {
          return <Typography variant="body2" color="text.secondary">{t('products:variants.noAttributes', 'بدون سمات')}</Typography>;
        }
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ py: 0.5 }}>
            {v.attributeValues.map((attr, idx) => {
              const isColorAttr = attr.name?.toLowerCase().includes('لون') || attr.name?.toLowerCase().includes('color');
              const colorVal = isColorAttr ? getColorValue(attr.value || '') : null;
              return (
                <Chip
                  key={attr.valueId || `${attr.attributeId}-${idx}`}
                  label={`${attr.name}: ${attr.value}`}
                  size="small"
                  variant="outlined"
                  sx={isColorAttr && colorVal ? { fontSize: 11, height: 22, borderColor: colorVal } : { fontSize: 11, height: 22 }}
                />
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: 'sku',
      headerName: t('products:variants.columns.sku', 'SKU'),
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
          {params.row.sku || '-'}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: t('products:variants.columns.price', 'السعر'),
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          ${params.row.price ?? params.row.basePriceUSD ?? 0}
        </Typography>
      ),
    },
    {
      field: 'stock',
      headerName: t('products:variants.columns.stock', 'المخزون'),
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const v = params.row as Variant;
        return <Typography variant="body2">{v.stock}</Typography>;
      },
    },
    {
      field: 'status',
      headerName: t('products:variants.columns.status', 'الحالة'),
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const v = params.row as Variant;
        const stockStatus: 'error' | 'warning' | 'success' =
          v.stock === 0 ? 'error' : v.stock <= (v.minStock || 0) ? 'warning' : 'success';
        const statusLabel =
          v.stock === 0
            ? t('products:variants.status.outOfStock', 'غير متوفر')
            : v.stock <= (v.minStock || 0)
              ? t('products:variants.status.low', 'منخفض')
              : t('products:variants.status.available', 'متوفر');
        return <StatusChip label={statusLabel} status={stockStatus} size="small" />;
      },
    },
    {
      field: 'actions',
      headerName: t('products:variants.columns.actions', 'الإجراءات'),
      width: 80,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const variant = params.row as Variant;
        return (
          <RowActionsMenu
            actions={[
              { label: t('products:variants.form.quickEdit', 'تعديل'), icon: <Edit fontSize="small" />, onClick: () => handleOpenEditDrawer(variant) },
              { label: t('common:actions.delete', 'حذف'), icon: <Delete fontSize="small" />, onClick: () => handleDeleteVariant(variant), danger: true },
            ]}
          />
        );
      },
    },
  ];

  const renderCompactCard = (variant: Variant) => {
    const stockStatus: 'error' | 'warning' | 'success' =
      variant.stock === 0 ? 'error' : variant.stock <= (variant.minStock || 0) ? 'warning' : 'success';
    const stockLabel =
      variant.stock === 0
        ? t('products:variants.status.outOfStock', 'غير متوفر')
        : variant.stock <= (variant.minStock || 0)
          ? t('products:variants.status.low', 'منخفض')
          : t('products:variants.status.available', 'متوفر');

    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': { borderColor: 'primary.main', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
        }}
        onClick={() => handleOpenEditDrawer(variant)}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <ProductImage image={variant.imageId as any} size={56} />
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between">
              <Typography variant="body2" fontWeight="bold" noWrap sx={{ fontFamily: 'monospace' }}>
                {variant.sku || t('products:variants.noSku', 'بدون SKU')}
              </Typography>
              <StatusChip label={stockLabel} status={stockStatus} size="small" />
            </Stack>
            <Typography variant="caption" color="primary" fontWeight="bold">
              ${variant.price ?? variant.basePriceUSD ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('products:variants.columns.stock', 'المخزون')}: {variant.stock}
            </Typography>
            {variant.attributeValues && variant.attributeValues.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {variant.attributeValues.slice(0, 3).map((attr, idx) => {
                  const isColorAttr = attr.name?.toLowerCase().includes('لون') || attr.name?.toLowerCase().includes('color');
                  const colorVal = isColorAttr ? getColorValue(attr.value || '') : null;
                  return (
                    <Chip
                      key={attr.valueId || `${attr.attributeId}-${idx}`}
                      label={`${attr.name}: ${attr.value}`}
                      size="small"
                      variant="outlined"
                      sx={isColorAttr && colorVal ? { fontSize: 10, height: 20, borderColor: colorVal } : { fontSize: 10, height: 20 }}
                    />
                  );
                })}
                {variant.attributeValues.length > 3 && (
                  <Chip label={`+${variant.attributeValues.length - 3}`} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                )}
              </Stack>
            )}
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Tooltip title={t('products:variants.form.quickEdit', 'تعديل')}>
                <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpenEditDrawer(variant); }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common:actions.delete', 'حذف')}>
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteVariant(variant); }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  const renderTable = (rows: Variant[]) => (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loadingVariants}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      sortModel={[{ field: sortField, sort: sortDir }]}
      onSortModelChange={(model) => {
        if (model.length > 0) {
          setSortField(model[0].field);
          setSortDir(model[0].sort as 'asc' | 'desc');
        }
      }}
      getRowId={(row: unknown) => (row as Variant)?._id || ''}
      selectable={true}
      onRowSelectionModelChange={(selection) => setSelectedVariants(selection as string[])}
      height={500}
    />
  );

  const activeFilters = [
    ...(stockFilter !== 'all' ? [{
      label: t('products:variants.filters.stockStatus', 'حالة المخزون'),
      value: stockFilter === 'inStock' ? t('products:variants.status.available', 'متوفر') :
        stockFilter === 'lowStock' ? t('products:variants.status.low', 'منخفض') :
        t('products:variants.status.outOfStock', 'غير متوفر'),
      onDelete: () => setStockFilter('all'),
    }] : []),
  ];

  if (loadingProduct) {
    return (
      <PageShell spacing="compact" fullHeight>
        <PageHeader variant="compact" title={t('products:variants.manage', 'إدارة المتغيرات')} />
        <LoadingState variant="skeleton" rows={4} />
      </PageShell>
    );
  }

  const productName = product?.name || t('products:variants.product', 'المنتج');

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={t('products:variants.manage', 'إدارة المتغيرات')}
        description={productName}
        breadcrumbs={[
          { label: t('common:navigation.dashboard', 'لوحة التحكم'), to: '/dashboard' },
          { label: t('products:list.title', 'المنتجات'), to: '/products' },
          { label: productName, to: `/products/${id}` },
          { label: t('products:variants.manage', 'المتغيرات') },
        ]}
        actions={[
          {
            label: t('products:variants.add', 'إضافة متغير'),
            icon: <Add />,
            onClick: handleOpenAddDrawer,
            variant: 'primary',
          },
          {
            label: t('products:variants.backToProduct', 'العودة إلى المنتج'),
            icon: <ArrowBack />,
            to: `/products/${id}`,
            variant: 'ghost',
          },
        ]}
      />

      <PageSummaryGrid columns={4} compact>
        <StatCard title={t('products:variants.totalVariants', 'إجمالي المتغيرات')} value={variants?.length || 0} icon={<Inventory fontSize="small" />} tone="primary" compact />
        <StatCard title={t('products:variants.inStock', 'متوفر')} value={inStockCount} tone="success" compact />
        <StatCard title={t('products:variants.lowStock', 'منخفض')} value={lowStockCount} tone="warning" compact />
        <StatCard title={t('products:variants.outOfStock', 'غير متوفر')} value={outOfStockCount} tone="error" compact />
      </PageSummaryGrid>

      <DataToolbar
        searchValue={search}
        searchPlaceholder={t('products:variants.searchSku', 'بحث بال SKU أو السمات...')}
        onSearchChange={setSearch}
        filters={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('products:variants.filters.stockStatus', 'حالة المخزون')}</InputLabel>
              <Select
                value={stockFilter}
                label={t('products:variants.filters.stockStatus', 'حالة المخزون')}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <MenuItem value="all">{t('common:all', 'الكل')}</MenuItem>
                <MenuItem value="inStock">{t('products:variants.status.available', 'متوفر')}</MenuItem>
                <MenuItem value="lowStock">{t('products:variants.status.low', 'منخفض')}</MenuItem>
                <MenuItem value="outOfStock">{t('products:variants.status.outOfStock', 'غير متوفر')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{t('products:variants.filters.sortBy', 'ترتيب حسب')}</InputLabel>
              <Select
                value={sortField}
                label={t('products:variants.filters.sortBy', 'ترتيب حسب')}
                onChange={(e) => setSortField(e.target.value)}
              >
                <MenuItem value="sku">SKU</MenuItem>
                <MenuItem value="price">{t('products:variants.columns.price', 'السعر')}</MenuItem>
                <MenuItem value="stock">{t('products:variants.columns.stock', 'المخزون')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>{t('products:variants.filters.direction', 'الاتجاه')}</InputLabel>
              <Select
                value={sortDir}
                label={t('products:variants.filters.direction', 'الاتجاه')}
                onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="asc">{t('products:variants.filters.ascending', 'تصاعدي')}</MenuItem>
                <MenuItem value="desc">{t('products:variants.filters.descending', 'تنازلي')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        }
        activeFilters={activeFilters}
        compact
      />

      {selectedVariants.length > 0 && (
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2 },
            border: '1px solid',
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
            borderRadius: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" fontWeight="bold">
              {t('products:variants.selectedCount', 'تم اختيار {{count}} متغير', { count: selectedVariants.length })}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button size="small" variant="contained" startIcon={<Edit />} onClick={() => setBulkEditDrawerOpen(true)}>
                {t('products:variants.bulkEdit', 'تعديل جماعي')}
              </Button>
              <Button size="small" variant="contained" color="error" startIcon={<Delete />} onClick={handleBulkDelete}>
                {t('products:variants.bulkDelete', 'حذف المحدد')}
              </Button>
              <Button size="small" variant="outlined" onClick={handleSelectAll}>
                {selectedVariants.length === (variants?.length || 0) ? t('products:variants.deselectAll', 'إلغاء تحديد الكل') : t('products:variants.selectAll', 'تحديد الكل')}
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setSelectedVariants([])}>
                {t('products:variants.clearSelection', 'مسح التحديد')}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <ResponsiveDataView
        rows={filteredVariants}
        renderCard={renderCompactCard}
        renderTable={renderTable}
        cardBreakpoint="md"
        loading={loadingVariants}
        emptyTitle={t('products:variants.empty', 'لا توجد متغيرات')}
        emptyDescription={t('products:variants.emptyDescription', 'أضف متغيرات للمنتج لبدء إدارتها')}
        emptyActionLabel={t('products:variants.add', 'إضافة متغير')}
        onEmptyAction={handleOpenAddDrawer}
        gridProps={{ columns: 2, spacing: 1.5 }}
        getRowId={(row) => row._id}
      />

      <DetailsDrawer
        open={addDrawerOpen}
        onClose={handleCloseAddDrawer}
        title={t('products:variants.addVariant', 'إضافة متغير')}
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ py: 0 }}>
                <Typography variant="caption">
                  {t('products:variants.generateTip', 'يمكنك توليد المتغيرات تلقائياً من السمات لاحقاً')}
                </Typography>
              </Alert>

              <Controller
                name="sku"
                control={methods.control}
                render={({ field }) => (
                  <SmartSkuInput
                    value={field.value || ''}
                    onChange={(val) => {
                      field.onChange(val);
                      if (val.length < 3) setOnyxData({ isLinked: false });
                    }}
                    onSkuValidated={handleOnyxValidation}
                    label={t('products:variants.form.sku', 'SKU')}
                    error={!!methods.formState.errors.sku}
                    helperText={methods.formState.errors.sku?.message as string | undefined}
                  />
                )}
              />

              {(methods.watch('sku') || '').length >= 3 && (
                <Box>
                  {onyxData.isLinked ? (
                    <Alert severity="success" sx={{ py: 0 }}>
                      <Typography variant="caption">
                        {t('products:integration.foundMsg', 'تم الربط مع أونكس. الكمية المتوفرة')}: <strong>{onyxData.stock}</strong>
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      <Typography variant="caption">
                        {t('products:integration.notFoundMsg', 'غير موجود في أونكس. سيتم تعيين المخزون يدوياً.')}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}

              <Controller
                name="price"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('products:variants.form.price', 'السعر') + ' *'}
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!methods.formState.errors.price}
                    helperText={methods.formState.errors.price?.message as string | undefined}
                  />
                )}
              />

              <Controller
                name="stock"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('products:variants.form.stock', 'المخزون') + ' *'}
                    type="number"
                    fullWidth
                    disabled={onyxData.isLinked}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    inputProps={{ min: 0 }}
                    sx={{
                      '& .MuiInputBase-root.Mui-disabled': { backgroundColor: onyxData.isLinked ? 'action.hover' : 'inherit' },
                      '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: onyxData.isLinked ? '#2e7d32' : undefined, fontWeight: onyxData.isLinked ? 'bold' : 'normal' },
                    }}
                    helperText={onyxData.isLinked ? t('products:integration.stockSynced', 'يتم جلب الكمية من أونكس تلقائياً') : t('products:variants.form.stockHelp', 'أدخل الكمية المتاحة')}
                  />
                )}
              />

              <Alert severity="warning">
                <Typography variant="body2">
                  {t('products:variants.form.discountNote', 'ملاحظة: يمكن تطبيق الخصومات لاحقاً من إعدادات التسعير')}
                </Typography>
              </Alert>
            </Stack>

            <FormActionBar
              onSubmit={methods.handleSubmit(onSubmit)}
              onCancel={handleCloseAddDrawer}
              submitLabel={t('common:actions.add', 'إضافة')}
              cancelLabel={t('products:variants.form.cancel', 'إلغاء')}
              loading={addingVariant}
            />
          </form>
        </FormProvider>
      </DetailsDrawer>

      <DetailsDrawer
        open={editDrawerOpen}
        onClose={handleCloseEditDrawer}
        title={editingVariant?.sku || t('products:variants.form.editVariant', 'تعديل المتغير')}
        description={
          editingVariant
            ? `${t('products:variants.columns.price', 'السعر')}: $${editingVariant.price ?? editingVariant.basePriceUSD ?? 0} | ${t('products:variants.columns.stock', 'المخزون')}: ${editingVariant.stock}`
            : undefined
        }
      >
        {editingVariant && (
          <Stack spacing={2.5}>
            {editingVariant.attributeValues && editingVariant.attributeValues.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {t('products:variants.columns.attributes', 'السمات')}
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {editingVariant.attributeValues.map((attr, idx) => (
                    <Chip
                      key={attr.valueId || `${attr.attributeId}-${idx}`}
                      label={`${attr.name}: ${attr.value}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <TextField
              label={t('products:variants.form.sku', 'SKU')}
              type="text"
              fullWidth
              value={editSku}
              onChange={(e) => setEditSku(e.target.value)}
              sx={{ fontFamily: 'monospace' }}
            />

            <TextField
              label={t('products:variants.form.price', 'السعر') + ' *'}
              type="number"
              fullWidth
              value={editPrice}
              onChange={(e) => setEditPrice(Number(e.target.value))}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label={t('products:variants.form.stock', 'المخزون') + ' *'}
              type="number"
              fullWidth
              value={editStock}
              onChange={(e) => setEditStock(Number(e.target.value))}
              inputProps={{ min: 0 }}
            />
          </Stack>
        )}

        <FormActionBar
          onSubmit={handleSaveEdit}
          onCancel={handleCloseEditDrawer}
          submitLabel={t('common:actions.save', 'حفظ')}
          cancelLabel={t('common:actions.cancel', 'إلغاء')}
          loading={updatingVariant}
        />
      </DetailsDrawer>

      <DetailsDrawer
        open={bulkEditDrawerOpen}
        onClose={() => { setBulkEditDrawerOpen(false); setBulkPrice(''); setBulkStock(''); }}
        title={t('products:variants.bulkEditTitle', 'تعديل جماعي للمتغيرات')}
        description={t('products:variants.bulkEditInfo', 'سيتم تطبيق التغييرات على {{count}} متغير', { count: selectedVariants.length })}
      >
        <Stack spacing={2.5}>
          <Alert severity="info">
            {t('products:variants.bulkEditInfo', 'سيتم تطبيق التغييرات على {{count}} متغير', { count: selectedVariants.length })}
          </Alert>
          <TextField
            label={t('products:variants.form.price', 'السعر')}
            type="number"
            fullWidth
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            helperText={t('products:variants.bulkEditPriceHelp', 'اتركه فارغاً إذا لم ترد تغييره')}
          />
          <TextField
            label={t('products:variants.form.stock', 'المخزون')}
            type="number"
            fullWidth
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
            inputProps={{ min: 0 }}
            helperText={t('products:variants.bulkEditStockHelp', 'اتركه فارغاً إذا لم ترد تغييره')}
          />
        </Stack>

        <FormActionBar
          onSubmit={handleBulkEditSave}
          onCancel={() => { setBulkEditDrawerOpen(false); setBulkPrice(''); setBulkStock(''); }}
          submitLabel={t('common:actions.save', 'حفظ')}
          cancelLabel={t('common:actions.cancel', 'إلغاء')}
          disabled={bulkPrice === '' && bulkStock === ''}
        />
      </DetailsDrawer>

      <ConfirmDialog {...dialogProps} />
    </PageShell>
  );
};