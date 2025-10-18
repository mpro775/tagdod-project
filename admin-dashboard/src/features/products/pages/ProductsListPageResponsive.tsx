import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { ResponsiveListWrapper } from '@/shared/components/ResponsiveList';
import { ProductCard } from '@/shared/components/Cards';
import { useProducts } from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import type { Product } from '../types/product.types';

export const ProductsListPageResponsive: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([
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

  // Actions
  const handleEdit = (product: Product) => {
    navigate(`/products/${product._id}`);
  };

  const handleView = (product: Product) => {
    navigate(`/products/${product._id}`);
  };

  const handleDelete = (product: Product) => {
    // TODO: Implement delete functionality
    console.log('Delete product:', product);
  };

  const handleToggleStatus = (product: Product) => {
    // TODO: Implement status toggle
    console.log('Toggle status for product:', product);
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
          inactive: { label: 'غير نشط', color: 'default' },
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
    </Box>
  );
};

export default ProductsListPageResponsive;
