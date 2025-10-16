import React from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBrands, useDeleteBrand, useToggleBrandStatus } from '../hooks/useBrands';
import { formatDate } from '@/shared/utils/formatters';
import type { Brand } from '../types/brand.types';

export const BrandsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: brands = [], isLoading, refetch } = useBrands({});
  const { mutate: deleteBrand } = useDeleteBrand();
  const { mutate: toggleStatus } = useToggleBrandStatus();

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'العلامة',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.logo && (
            <Box
              component="img"
              src={params.row.logo}
              alt={params.row.name}
              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'contain' }}
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
      field: 'productsCount',
      headerName: 'المنتجات',
      width: 100,
      align: 'center',
    },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'نشط' : 'غير نشط'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'isFeatured',
      headerName: 'مميزة',
      width: 80,
      renderCell: (params) =>
        params.row.isFeatured ? <Star sx={{ color: 'warning.main' }} /> : null,
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
        const brand = params.row as Brand;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/brands/${brand._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={brand.isActive ? 'تعطيل' : 'تفعيل'}>
              <IconButton
                size="small"
                color={brand.isActive ? 'warning' : 'success'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus(brand._id, { onSuccess: () => refetch() });
                }}
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
                  if (window.confirm(`هل تريد حذف العلامة "${brand.name}"؟`)) {
                    deleteBrand(brand._id, { onSuccess: () => refetch() });
                  }
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
        title="إدارة العلامات التجارية"
        columns={columns}
        rows={brands}
        loading={isLoading}
        paginationModel={{ page: 0, pageSize: 20 }}
        onPaginationModelChange={() => {}}
        rowCount={brands.length}
        onAdd={() => navigate('/brands/new')}
        addButtonText="إضافة علامة"
        onRowClick={(params) => {
          const row = params.row as Brand;
          navigate(`/brands/${row._id}`);
        }}
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};
