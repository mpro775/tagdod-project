import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  Grid,
  Button,
  Pagination,
} from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff, Visibility, VisibilityOff, Add, Business } from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { BrandStatsCards } from '../components/BrandStatsCards';
import { BrandFilters } from '../components/BrandFilters';
import { BrandCard } from '../components/BrandCard';
import { BrandFormDialog } from '../components/BrandFormDialog';
import { BrandDeleteDialog } from '../components/BrandDeleteDialog';
import { useBrands, useDeleteBrand, useToggleBrandStatus } from '../hooks/useBrands';
import { formatDate } from '@/shared/utils/formatters';
import type { Brand, ListBrandsParams } from '../types/brand.types';

export const BrandsListPage: React.FC = () => {
  const { t } = useTranslation('brands');
  const { isMobile } = useBreakpoint();

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
  const pagination = brandsResponse?.meta;

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
      headerName: t('table.columns.brand'),
      width: 300,
      renderCell: (params) => {
        const brand = params.row as Brand;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={brand.image}
                alt={brand.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: 0.5,
                }}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {brand.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {brand.nameEn}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ fontSize: '0.7rem' }}>
                {brand.slug}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'description',
      headerName: t('table.columns.description'),
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
            {brand.description || brand.descriptionEn || t('messages.noDescription')}
          </Typography>
        );
      },
    },
    {
      field: 'sortOrder',
      headerName: t('table.columns.sortOrder'),
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Chip label={params.row.sortOrder} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'isActive',
      headerName: t('table.columns.status'),
      width: 120,
      renderCell: (params) => {
        const brand = params.row as Brand;
        return (
          <Chip
            icon={brand.isActive ? <Visibility /> : <VisibilityOff />}
            label={brand.isActive ? t('status.active') : t('status.inactive')}
            color={brand.isActive ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: t('table.columns.createdAt'),
      width: 150,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: t('table.columns.actions'),
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const brand = params.row as Brand;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('tooltips.edit')}>
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

            <Tooltip title={brand.isActive ? t('tooltips.deactivate') : t('tooltips.activate')}>
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

            <Tooltip title={t('tooltips.delete')}>
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
      {/* Header */}
      <Box mb={3}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Business fontSize={isMobile ? 'medium' : 'large'} color="primary" />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              {t('pageTitle')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddBrand}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('table.addButton')}
          </Button>
        </Box>
      </Box>

      {/* إحصائيات العلامات التجارية */}
      <BrandStatsCards />

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
          {error.message || t('messages.loadError')}
        </Alert>
      )}

      {/* جدول أو كاردات العلامات التجارية */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Box
                    sx={{
                      height: 400,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : brands.length === 0 ? (
            <Box
              textAlign="center"
              py={8}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Business sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('noBrands')}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {t('noBrandsDescription')}
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddBrand}>
                {t('table.addButton')}
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {brands.map((brand) => (
                  <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={brand._id}>
                    <BrandCard
                      brand={brand}
                      onEdit={handleEditBrand}
                      onDelete={handleDeleteBrand}
                      onToggleStatus={handleToggleStatus}
                    />
                  </Grid>
                ))}
              </Grid>
              {pagination && pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={pagination.totalPages}
                    page={filters.page || 1}
                    onChange={(_, page) => {
                      handlePaginationModelChange({ page: page - 1, pageSize: filters.limit || 20 });
                    }}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      ) : (
        <DataTable
          title={t('table.title')}
          columns={columns}
          rows={brands}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          onAdd={handleAddBrand}
          addButtonText={t('table.addButton')}
          getRowId={(row) => (row as Brand)._id}
          onRowClick={(params) => {
            const row = params.row as Brand;
            handleEditBrand(row);
          }}
          height="calc(100vh - 400px)"
          rowHeight={80}
        />
      )}

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
