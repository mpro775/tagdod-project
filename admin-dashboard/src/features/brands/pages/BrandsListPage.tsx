import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GridPaginationModel } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { PageShell, PageHeader, ResponsiveDataView } from '@/shared/design-system';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBrands, useDeleteBrand, useToggleBrandStatus } from '../hooks/useBrands';
import { BrandStatsCards } from '../components/BrandStatsCards';
import { BrandsToolbar } from '../components/BrandsToolbar';
import { BrandsTableColumns } from '../components/BrandsTableColumns';
import { BrandAdminCard } from '../components/BrandAdminCard';
import { BrandDeleteDialog } from '../components/BrandDeleteDialog';
import type { Brand, ListBrandsParams } from '../types/brand.types';

export const BrandsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('brands');

  const [filters, setFilters] = useState<ListBrandsParams>({
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    language: 'ar',
  });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; brand: Brand | null }>({ open: false, brand: null });

  const { data: brandsResponse, isLoading, refetch } = useBrands(filters);
  const { mutate: deleteBrand, isPending: isDeleting } = useDeleteBrand();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleBrandStatus();

  const brands = brandsResponse?.data || [];

  const handleFiltersChange = (newFilters: ListBrandsParams) => {
    setFilters(newFilters);
    setPaginationModel({ page: 0, pageSize: newFilters.limit || 20 });
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
    setFilters((prev) => ({ ...prev, page: model.page + 1, limit: model.pageSize }));
  };

  const handleToggleStatus = (brand: Brand) => {
    toggleStatus(brand._id, { onSuccess: () => refetch() });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.brand) {
      deleteBrand(deleteDialog.brand._id, {
        onSuccess: () => { setDeleteDialog({ open: false, brand: null }); refetch(); },
      });
    }
  };

  const onEdit = (brand: Brand) => navigate(`/brands/${brand._id}`);
  const onDelete = (brand: Brand) => setDeleteDialog({ open: true, brand });

  const columns = BrandsTableColumns(t, onEdit, onDelete, handleToggleStatus, isToggling);

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={t('pageTitle')}
        breadcrumbs={[
          { label: t('common.home', { ns: 'common' }), to: '/' },
          { label: t('pageTitle') },
        ]}
        actions={[
          { label: t('table.addButton'), icon: <Add />, variant: 'primary', to: '/brands/new' },
        ]}
      />

      <BrandStatsCards compact />

      <BrandsToolbar filters={filters} onFiltersChange={handleFiltersChange} />

      <ResponsiveDataView
        rows={brands}
        columns={columns}
        renderCard={(brand: Brand) => (
          <BrandAdminCard
            brand={brand}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={handleToggleStatus}
            isToggling={isToggling}
          />
        )}
        renderTable={(rows) => (
          <DataTable
            title={t('table.title')}
            columns={columns}
            rows={rows}
            loading={isLoading}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            onAdd={() => navigate('/brands/new')}
            addButtonText={t('table.addButton')}
            getRowId={(row) => (row as Brand)._id}
            onRowClick={(params) => navigate(`/brands/${(params.row as Brand)._id}`)}
            height="calc(100vh - 400px)"
            rowHeight={80}
          />
        )}
        emptyTitle={t('noBrands')}
        emptyDescription={t('noBrandsDescription')}
        emptyActionLabel={t('table.addButton')}
        onEmptyAction={() => navigate('/brands/new')}
        getRowId={(row) => (row as Brand)._id}
      />

      <BrandDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, brand: null })}
        onConfirm={handleDeleteConfirm}
        brand={deleteDialog.brand}
        loading={isDeleting}
      />
    </PageShell>
  );
};