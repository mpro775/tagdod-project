import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GridPaginationModel } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { PageShell, PageHeader, ResponsiveDataView } from '@/shared/design-system';
import { useCategories, useDeleteCategory, useRestoreCategory, usePermanentDeleteCategory, useUpdateCategoryStats } from '../hooks/useCategories';
import type { Category, ListCategoriesParams } from '../types/category.types';
import { CategoryStatsCards } from '../components/CategoryStatsCards';
import { CategoriesToolbar } from '../components/CategoriesToolbar';
import { CategoriesTableColumns } from '../components/CategoriesTableColumns';
import { CategoryAdminCard } from '../components/CategoryAdminCard';
import { CategoryTreeView } from '../components/CategoryTreeView';
import { DataTable } from '@/shared/components/DataTable/DataTable';

export const CategoriesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('categories');
  const [viewMode] = useState<'list' | 'tree'>('list');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 50 });
  const [filters, setFilters] = useState<ListCategoriesParams>({});

  const { data: categoriesResponse, isLoading, refetch } = useCategories({
    ...filters,
    includeDeleted: filters.includeDeleted || false,
  });
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse as any)?.data || [];
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: permanentDeleteCategory } = usePermanentDeleteCategory();
  const { mutate: restoreCategory } = useRestoreCategory();
  const { mutate: updateStats } = useUpdateCategoryStats();

  const handleDelete = (category: Category, permanent = false) => {
    if (permanent) {
      permanentDeleteCategory(category._id, { onSuccess: () => refetch() });
    } else {
      deleteCategory(category._id, { onSuccess: () => refetch() });
    }
  };

  const handleRestore = (category: Category) => {
    restoreCategory(category._id, { onSuccess: () => refetch() });
  };

  const handleUpdateStats = (category: Category) => {
    updateStats(category._id, { onSuccess: () => refetch() });
  };

  const columns = CategoriesTableColumns(t, (c) => navigate(`/categories/${c._id}`), handleDelete, handleRestore, handleUpdateStats);

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        variant="compact"
        title={t('categories.manageCategories')}
        description={t('categories.subtitle', { defaultValue: '' })}
        breadcrumbs={[
          { label: t('common.home', { ns: 'common' }), to: '/' },
          { label: t('categories.manageCategories') },
        ]}
        actions={[
          { label: t('categories.addNew'), icon: <Add />, variant: 'primary', to: '/categories/new' },
        ]}
      />

      <CategoryStatsCards compact onRefresh={() => refetch()} />

      <CategoriesToolbar filters={filters} onFiltersChange={setFilters} />

      {viewMode === 'tree' ? (
        <CategoryTreeView
          onEdit={(category) => navigate(`/categories/${category._id}`)}
          onDelete={handleDelete}
          filters={filters}
        />
      ) : (
        <ResponsiveDataView
          rows={categories}
          columns={columns}
          renderCard={(category: Category) => (
            <CategoryAdminCard
              category={category}
              onEdit={(c) => navigate(`/categories/${c._id}`)}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onUpdateStats={handleUpdateStats}
            />
          )}
          renderTable={(rows) => (
            <DataTable
              title=""
              columns={columns}
              rows={rows}
              loading={isLoading}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onAdd={() => navigate('/categories/new')}
              addButtonText={t('categories.addNew')}
              getRowId={(row) => (row as Category)._id}
              onRowClick={(params) => navigate(`/categories/${(params.row as Category)._id}`)}
              height="calc(100vh - 400px)"
              rowHeight={75}
            />
          )}
          emptyTitle={t('categories.noCategories')}
          emptyActionLabel={t('categories.addNew')}
          onEmptyAction={() => navigate('/categories/new')}
          getRowId={(row) => (row as Category)._id}
        />
      )}
    </PageShell>
  );
};