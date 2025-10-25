import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Typography, Alert } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff, Visibility, VisibilityOff } from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
// import { BrandStatsCards } from '../components/BrandStatsCards'; // معطل مؤقتاً
import { BrandFilters } from '../components/BrandFilters';
import { BrandFormDialog } from '../components/BrandFormDialog';
import { BrandDeleteDialog } from '../components/BrandDeleteDialog';
import { useBrands, useDeleteBrand, useToggleBrandStatus } from '../hooks/useBrands';
import { formatDate } from '@/shared/utils/formatters';
import type { Brand, ListBrandsParams } from '../types/brand.types';

export const BrandsListPage: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<ListBrandsParams>({
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    language: 'ar',
  });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    brand: Brand | null;
  }>({
    open: false,
    mode: 'create',
    brand: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    brand: Brand | null;
  }>({
    open: false,
    brand: null,
  });

  // API hooks
  const { data: brandsResponse, isLoading, error, refetch } = useBrands(filters);
  const { mutate: deleteBrand, isPending: isDeleting } = useDeleteBrand();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleBrandStatus();

  const brands = brandsResponse?.data || [];

  // Event handlers
  const handleFiltersChange = (newFilters: ListBrandsParams) => {
    setFilters(newFilters);
    setPaginationModel({ page: 0, pageSize: newFilters.limit || 20 });
  };

  const handleFiltersReset = () => {
    const defaultFilters: ListBrandsParams = {
      page: 1,
      limit: 20,
      sortBy: 'name',
      sortOrder: 'asc',
      language: 'ar',
    };
    setFilters(defaultFilters);
    setPaginationModel({ page: 0, pageSize: 20 });
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setFilters((prev) => ({
      ...prev,
      page: model.page + 1,
      limit: model.pageSize,
    }));
  };

  const handleAddBrand = () => {
    setFormDialog({ open: true, mode: 'create', brand: null });
  };

  const handleEditBrand = (brand: Brand) => {
    setFormDialog({ open: true, mode: 'edit', brand });
  };

  const handleDeleteBrand = (brand: Brand) => {
    setDeleteDialog({ open: true, brand });
  };

  const handleToggleStatus = (brand: Brand) => {
    toggleStatus(brand._id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.brand) {
      deleteBrand(deleteDialog.brand._id, {
        onSuccess: () => {
          setDeleteDialog({ open: false, brand: null });
          refetch();
        },
      });
    }
  };

  // Table columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'العلامة التجارية',
      width: 300,
      renderCell: (params) => {
        const brand = params.row as Brand;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src={brand.image}
              alt={brand.name}
              sx={{
                width: 50,
                height: 50,
                borderRadius: 1,
                objectFit: 'contain',
                backgroundColor: 'grey.100',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {brand.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {brand.nameEn}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Slug: {brand.slug}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'description',
      headerName: 'الوصف',
      width: 200,
      renderCell: (params) => {
        const brand = params.row as Brand;
        return (
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {brand.description || brand.descriptionEn || 'لا يوجد وصف'}
          </Typography>
        );
      },
    },
    {
      field: 'sortOrder',
      headerName: 'ترتيب العرض',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Chip label={params.row.sortOrder} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => {
        const brand = params.row as Brand;
        return (
          <Chip
            icon={brand.isActive ? <Visibility /> : <VisibilityOff />}
            label={brand.isActive ? 'نشط' : 'غير نشط'}
            color={brand.isActive ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 150,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const brand = params.row as Brand;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditBrand(brand);
                }}
                disabled={isToggling}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={brand.isActive ? 'إيقاف' : 'تفعيل'}>
              <IconButton
                size="small"
                color={brand.isActive ? 'warning' : 'success'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(brand);
                }}
                disabled={isToggling}
              >
                {brand.isActive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBrand(brand);
                }}
                disabled={isDeleting}
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
      {/* إحصائيات العلامات التجارية - معطلة مؤقتاً حتى تطوير API */}
      {/* <BrandStatsCards /> */}

      {/* فلاتر البحث */}
      <BrandFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
        loading={isLoading}
      />

      {/* رسالة الخطأ */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'فشل في تحميل العلامات التجارية'}
        </Alert>
      )}

      {/* جدول العلامات التجارية */}
      <DataTable
        title="إدارة العلامات التجارية"
        columns={columns}
        rows={brands}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        onAdd={handleAddBrand}
        addButtonText="إضافة علامة تجارية"
        onRowClick={(params) => {
          const row = params.row as Brand;
          handleEditBrand(row);
        }}
        height="calc(100vh - 400px)"
      />

      {/* نافذة إضافة/تعديل العلامة التجارية */}
      <BrandFormDialog
        open={formDialog.open}
        onClose={() => setFormDialog({ open: false, mode: 'create', brand: null })}
        brand={formDialog.brand}
        mode={formDialog.mode}
      />

      {/* نافذة تأكيد الحذف */}
      <BrandDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, brand: null })}
        onConfirm={handleDeleteConfirm}
        brand={deleteDialog.brand}
        loading={isDeleting}
      />
    </Box>
  );
};
