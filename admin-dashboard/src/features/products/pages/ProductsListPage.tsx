import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Button, Menu, MenuItem, Alert } from '@mui/material';
import { 
  Edit, 
  Delete, 
  Restore, 
  Visibility, 
  Star, 
  NewReleases, 
  Inventory,
  FilterList,
  MoreVert,
  Archive,
  Unarchive,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useProducts, useDeleteProduct, useRestoreProduct } from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import { CurrencySelector } from '@/shared/components/CurrencySelector';
import type { Product, ProductStatus } from '../types/product.types';

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | 'all'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // API
  const { data, isLoading, refetch } = useProducts({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
    status: statusFilter !== 'all' ? statusFilter : undefined,
    isFeatured: featuredFilter !== 'all' ? featuredFilter : undefined,
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (filterType: 'status' | 'featured', value: any) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else {
      setFeaturedFilter(value);
    }
    handleMenuClose();
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
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.row.nameEn}</Box>
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
          archived: { label: 'مؤرشف', color: 'warning' },
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
      width: 220,
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

            <Tooltip title="المتغيرات">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product._id}/variants`);
                }}
              >
                <Inventory fontSize="small" />
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
      {/* Header with filters */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleMenuOpen}
          >
            الفلاتر
          </Button>
          <Button
            variant="outlined"
            startIcon={<Inventory />}
            onClick={() => navigate('/products/inventory')}
          >
            إدارة المخزون
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          <CurrencySelector size="sm" />
          <Button
            variant="contained"
            onClick={() => navigate('/products/new')}
          >
            إضافة منتج
          </Button>
        </Box>
      </Box>

      {/* Active filters */}
      {(statusFilter !== 'all' || featuredFilter !== 'all') && (
        <Box mb={2}>
          <Alert severity="info">
            الفلاتر النشطة:
            {statusFilter !== 'all' && (
              <Chip
                label={`الحالة: ${statusFilter === 'active' ? 'نشط' : statusFilter === 'draft' ? 'مسودة' : 'مؤرشف'}`}
                size="small"
                onDelete={() => setStatusFilter('all')}
                sx={{ ml: 1 }}
              />
            )}
            {featuredFilter !== 'all' && (
              <Chip
                label={`مميز: ${featuredFilter ? 'نعم' : 'لا'}`}
                size="small"
                onDelete={() => setFeaturedFilter('all')}
                sx={{ ml: 1 }}
              />
            )}
          </Alert>
        </Box>
      )}
      
      <DataTable
        title="إدارة المنتجات"
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        searchPlaceholder="البحث في المنتجات..."
        onSearch={setSearch}
        getRowId={(row) => row._id}
        onRowClick={(params) => {
          const row = params.row as Product;
          navigate(`/products/${row._id}`);
        }}
        height="calc(100vh - 200px)"
      />

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleFilterChange('status', 'all')}>
          جميع الحالات
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.ACTIVE)}>
          نشط
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.DRAFT)}>
          مسودة
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.ARCHIVED)}>
          مؤرشف
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('featured', true)}>
          منتجات مميزة
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('featured', false)}>
          منتجات عادية
        </MenuItem>
      </Menu>
    </Box>
  );
};
