import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { ResponsiveListWrapper } from '@/shared/components/ResponsiveList';
import { ProductCard } from '@/shared/components/Cards';
import { useProducts, useDeleteProduct, useUpdateProduct } from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import type { Product } from '../types/product.types';

export const ProductsListPageResponsive: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [paginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [search] = useState('');
  const [sortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' }
  ]);

  // API
  const { data, isLoading, error } = useProducts({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  // Mutations
  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    product: Product | null;
    action: 'delete' | 'toggle_status' | null;
  }>({
    open: false,
    product: null,
    action: null,
  });

  // Actions
  const handleEdit = (product: Product) => {
    navigate(`/products/${product._id}`);
  };

  const handleView = (product: Product) => {
    navigate(`/products/${product._id}`);
  };

  const handleDelete = (product: Product) => {
    setConfirmDialog({
      open: true,
      product,
      action: 'delete',
    });
  };

  const handleToggleStatus = (product: Product) => {
    setConfirmDialog({
      open: true,
      product,
      action: 'toggle_status',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.product || !confirmDialog.action) return;

    const { product, action } = confirmDialog;

    if (action === 'delete') {
      await deleteProductMutation.mutateAsync(product._id);
    } else if (action === 'toggle_status') {
      // Toggle between active and archived
      const newStatus = product.status === 'active' ? 'archived' : 'active';
      await updateProductMutation.mutateAsync({
        id: product._id,
        data: { status: newStatus as any }
      });
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      product: null,
      action: null,
    });
  };

  // Columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'اسم المنتج',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium' }}>
          {params.row.name}
        </Box>
      ),
    },
    {
      field: 'sku',
      headerName: 'كود المنتج',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {params.row.sku || '-'}
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'السعر',
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          {new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
          }).format(params.row.price)}
        </Box>
      ),
    },
    {
      field: 'stock',
      headerName: 'المخزون',
      minWidth: 80,
      flex: 0.6,
      renderCell: (params) => (
        <Box sx={{ 
          color: params.row.stock > 10 ? 'success.main' : params.row.stock > 0 ? 'warning.main' : 'error.main',
          fontWeight: 'medium'
        }}>
          {params.row.stock || 0}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => {
        const statusMap: Record<string, { label: string; color: any }> = {
          active: { label: 'نشط', color: 'success' },
          archived: { label: 'غير نشط', color: 'default' },
          draft: { label: 'مسودة', color: 'warning' },
        };
        const status = statusMap[params.row.status] || { label: 'غير محدد', color: 'default' };
        return (
          <Box sx={{ 
            px: 1, 
            py: 0.5, 
            borderRadius: 1, 
            bgcolor: `${status.color}.light`,
            color: `${status.color}.main`,
            fontSize: '0.75rem',
            fontWeight: 'medium'
          }}>
            {status.label}
          </Box>
        );
      },
    },
    {
      field: 'category',
      headerName: 'الفئة',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.875rem' }}>
          {params.row.category?.name || '-'}
        </Box>
      ),
    },
    {
      field: 'brand',
      headerName: 'العلامة التجارية',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.875rem' }}>
          {params.row.brand?.name || '-'}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      minWidth: 120,
      flex: 0.8,
      valueFormatter: (value) => formatDate(value as Date),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        إدارة المنتجات
      </Typography>

      <ResponsiveListWrapper
        data={data?.data || []}
        loading={isLoading}
        error={error}
        columns={columns}
        CardComponent={ProductCard}
        getRowId={(product) => product._id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onToggleStatus={handleToggleStatus}
        showActions={true}
        cardBreakpoint="md"
        emptyMessage="لا يوجد منتجات"
        emptyDescription="لم يتم العثور على أي منتجات في النظام"
        errorMessage="حدث خطأ أثناء تحميل المنتجات"
        pagination={true}
        pageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        cardContainerProps={{
          sx: { 
            px: { xs: 2, sm: 3 },
            py: 1
          }
        }}
        gridProps={{
          sx: { 
            height: 'calc(100vh - 200px)',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
          }
        }}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.action === 'delete' ? 'تأكيد حذف المنتج' : 'تأكيد تغيير الحالة'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'delete'
              ? `هل أنت متأكد من حذف المنتج "${confirmDialog.product?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `هل أنت متأكد من تغيير حالة المنتج "${confirmDialog.product?.name}" إلى "${
                  confirmDialog.product?.status === 'active' ? 'غير نشط' : 'نشط'
                }"?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
            variant="contained"
            disabled={deleteProductMutation.isPending || updateProductMutation.isPending}
          >
            {deleteProductMutation.isPending || updateProductMutation.isPending
              ? 'جاري التنفيذ...'
              : confirmDialog.action === 'delete'
                ? 'حذف'
                : 'تأكيد'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsListPageResponsive;
