import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Restore, Visibility, Star, NewReleases } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  useProducts,
  useDeleteProduct,
  useRestoreProduct,
} from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import type { Product, ProductStatus } from '../types/product.types';

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);

  // API
  const { data, isLoading, refetch } = useProducts({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: restoreProduct } = useRestoreProduct();

  // Actions
  const handleDelete = (product: Product) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
      deleteProduct(product._id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleRestore = (product: Product) => {
    if (window.confirm(`هل تريد استعادة المنتج "${product.name}"؟`)) {
      restoreProduct(product._id, {
        onSuccess: () => refetch(),
      });
    }
  };

  // Columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'المنتج',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.mainImage && (
            <Box
              component="img"
              src={params.row.mainImage}
              alt={params.row.name}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                objectFit: 'cover',
              }}
            />
          )}
          <Box>
            <Box sx={{ fontWeight: 'medium' }}>{params.row.name}</Box>
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {params.row.nameEn}
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'sku',
      headerName: 'رقم المنتج',
      width: 120,
    },
    {
      field: 'category',
      headerName: 'الفئة',
      width: 150,
      valueGetter: (_value, row) => row.category?.name || '-',
    },
    {
      field: 'brand',
      headerName: 'العلامة',
      width: 130,
      valueGetter: (_value, row) => row.brand?.name || '-',
    },
    {
      field: 'variantsCount',
      headerName: 'الخيارات',
      width: 100,
      align: 'center',
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 130,
      renderCell: (params) => {
        const statusMap: Record<
          ProductStatus,
          { label: string; color: 'success' | 'warning' | 'error' | 'default' }
        > = {
          active: { label: 'نشط', color: 'success' },
          draft: { label: 'مسودة', color: 'default' },
          out_of_stock: { label: 'نفذ', color: 'warning' },
          discontinued: { label: 'متوقف', color: 'error' },
        };
        const status = statusMap[params.row.status as ProductStatus];
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
    {
      field: 'badges',
      headerName: 'الشارات',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.isFeatured && (
            <Tooltip title="مميز">
              <Star sx={{ fontSize: 18, color: 'warning.main' }} />
            </Tooltip>
          )}
          {params.row.isNew && (
            <Tooltip title="جديد">
              <NewReleases sx={{ fontSize: 18, color: 'info.main' }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: 'salesCount',
      headerName: 'المبيعات',
      width: 100,
      align: 'center',
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const product = params.row as Product;
        const isDeleted = !!product.deletedAt;

        if (isDeleted) {
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title="استعادة">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(product);
                  }}
                >
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="عرض">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product._id}/view`);
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(product);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <DataTable
        title="إدارة المنتجات"
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.meta?.total || 0}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        searchPlaceholder="البحث في المنتجات..."
        onSearch={setSearch}
        onAdd={() => navigate('/products/new')}
        addButtonText="إضافة منتج"
        onRowClick={(params) => {
          const row = params.row as Product;
          navigate(`/products/${row._id}`);
        }}
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};

