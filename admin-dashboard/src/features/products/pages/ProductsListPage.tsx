import React, { useState } from 'react';
import {
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  TableChart,
  ViewModule,
  Inventory as InventoryIcon,
  Cached,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  ConfirmDialog,
  LoadingState,
  PageHeader,
  PageShell,
  ResponsiveDataView,
  usePageTitle,
} from '@/shared/design-system';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CurrencySelector } from '@/shared/components/CurrencySelector';
import { useProducts, useDeleteProduct, useRestoreProduct, useClearCache, useProductStats } from '../hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useBrands } from '@/features/brands/hooks/useBrands';
import { ProductStatsCards } from '../components/admin/ProductStatsCards';
import { ProductFilters, type ProductListFilters } from '../components/admin/ProductFilters';
import { useProductsTableColumns } from '../components/ProductsTableColumns';
import { ProductAdminCard } from '../components/admin/ProductAdminCard';
import type { Product } from '../types/product.types';
import { ProductStatus } from '../types/product.types';

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('products');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const pageTitle = t('list.title', 'المنتجات');

  usePageTitle(pageTitle);

  const parseStatus = (val: string | null): ProductStatus | undefined => {
    if (val === 'active' || val === 'draft' || val === 'archived') return val as ProductStatus;
    return undefined;
  };

  const parseStockState = (val: string | null): 'low' | 'out' | undefined => {
    if (val === 'low' || val === 'out') return val;
    return undefined;
  };

  const parseBool = (val: string | null): boolean | undefined => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  };

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: parseInt(searchParams.get('page') || '0', 10) || 0,
    pageSize: parseInt(searchParams.get('pageSize') || '20', 10),
  });

  const [sortModel, setSortModel] = useState<GridSortModel>(() => {
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    return [{ field: sortBy, sort: sortOrder }];
  });

  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    const saved = localStorage.getItem('products-view-mode');
    return saved === 'grid' || saved === 'table' ? saved : 'table';
  });

  const [filters, setFilters] = useState<ProductListFilters>(() => ({
    search: searchParams.get('search') || '',
    status: parseStatus(searchParams.get('status')),
    categoryId: searchParams.get('categoryId') || undefined,
    brandId: searchParams.get('brandId') || undefined,
    isFeatured: parseBool(searchParams.get('isFeatured')),
    isNew: parseBool(searchParams.get('isNew')),
    hasOffer: parseBool(searchParams.get('hasOffer')),
    stockState: parseStockState(searchParams.get('stockState')),
  }));

  const { data: categoriesData = [] } = useCategories({ isActive: true });
  const { data: brandsData } = useBrands({ isActive: true, limit: 500, sortBy: 'name', sortOrder: 'asc' });
  const brands = brandsData?.data ?? [];

  const { data, isLoading } = useProducts({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: filters.search || undefined,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
    status: filters.status,
    isFeatured: filters.isFeatured,
    isNew: filters.isNew,
    hasOffer: filters.hasOffer,
    categoryId: filters.categoryId,
    brandId: filters.brandId,
    lowStock: filters.stockState === 'low' ? true : undefined,
    outOfStock: filters.stockState === 'out' ? true : undefined,
  });

  const { data: productStats, isLoading: statsLoading } = useProductStats();

  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: restoreProduct } = useRestoreProduct();
  const { mutate: clearCache, isPending: isClearingCache } = useClearCache();

  const handleDelete = async (product: Product) => {
    const confirmed = await confirmDialog({
      title: t('messages.deleteTitle', 'تأكيد الحذف'),
      message: t('messages.confirmDelete', { name: product.name }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      deleteProduct(product._id);
    }
  };

  const handleRestore = async (product: Product) => {
    const confirmed = await confirmDialog({
      title: t('messages.restoreTitle', 'تأكيد الاستعادة'),
      message: t('messages.confirmRestore', { name: product.name }),
      type: 'question',
    });
    if (confirmed) {
      restoreProduct(product._id);
    }
  };

  const columns = useProductsTableColumns({
    onEdit: (product) => navigate(`/products/${product._id}`),
    onDelete: handleDelete,
    onRestore: handleRestore,
    onView: (product) => navigate(`/products/${product._id}/view`),
    onVariants: (product) => navigate(`/products/${product._id}/variants`),
    isMobile,
  });

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('products-view-mode', mode);
  };

  const handleFiltersChange = (newFilters: ProductListFilters) => {
    setFilters(newFilters);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      categoryId: undefined,
      brandId: undefined,
      isFeatured: undefined,
      isNew: undefined,
      hasOffer: undefined,
      stockState: undefined,
    });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (paginationModel.page !== 0) params.set('page', paginationModel.page.toString());
    if (paginationModel.pageSize !== 20) params.set('pageSize', paginationModel.pageSize.toString());
    if (filters.search) params.set('search', filters.search);
    const sortBy = sortModel[0]?.field || 'createdAt';
    const sortOrder = sortModel[0]?.sort || 'desc';
    if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }
    if (filters.status) params.set('status', filters.status);
    if (filters.isFeatured !== undefined) params.set('isFeatured', filters.isFeatured.toString());
    if (filters.isNew !== undefined) params.set('isNew', filters.isNew.toString());
    if (filters.hasOffer !== undefined) params.set('hasOffer', filters.hasOffer.toString());
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.brandId) params.set('brandId', filters.brandId);
    if (filters.stockState) params.set('stockState', filters.stockState);
    setSearchParams(params, { replace: true });
  }, [paginationModel, sortModel, filters, setSearchParams]);

  const toolbarActions = (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <CurrencySelector size="small" showLabel={false} />
      <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={(_, v) => v && handleViewModeChange(v)}>
        <ToggleButton value="table"><TableChart fontSize="small" /></ToggleButton>
        <ToggleButton value="grid"><ViewModule fontSize="small" /></ToggleButton>
      </ToggleButtonGroup>
      <Button variant="outlined" size="small" startIcon={<InventoryIcon />} onClick={() => navigate('/products/inventory')}>
        {t('list.inventoryManagement', 'المخزون')}
      </Button>
      <Button variant="outlined" size="small" startIcon={<Cached />} onClick={() => clearCache()} disabled={isClearingCache} color="secondary">
        {isClearingCache ? t('list.clearingCache', 'جاري المسح...') : t('list.clearCache', 'مسح الكاش')}
      </Button>
    </Stack>
  );

  if (isLoading && !data) {
    return (
      <PageShell spacing="compact" fullHeight>
        <PageHeader variant="compact" title={pageTitle} />
        <LoadingState variant="skeleton" rows={6} />
      </PageShell>
    );
  }

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        title={pageTitle}
        description={t('list.description', 'إدارة المنتجات، الفلاتر، الأسعار، والمخزون')}
        variant="compact"
        breadcrumbs={[
          { label: t('navigation.dashboard', 'لوحة التحكم'), to: '/dashboard' },
          { label: pageTitle },
        ]}
        actions={[
          {
            label: t('list.addNew', 'إضافة منتج جديد'),
            icon: <Add />,
            onClick: () => navigate('/products/new'),
            variant: 'primary',
          },
        ]}
      />

      {productStats && <ProductStatsCards stats={productStats} loading={statsLoading} compact />}

      <ProductFilters
        filters={filters}
        categories={categoriesData}
        brands={brands}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearAllFilters}
        actions={toolbarActions}
      />

      <ResponsiveDataView
        viewMode={viewMode === 'grid' ? 'grid' : 'auto'}
        rows={data?.data || []}
        renderCard={(product: Product) => (
          <ProductAdminCard
            product={product}
            onView={(p: Product) => navigate(`/products/${p._id}/view`)}
            onEdit={(p: Product) => navigate(`/products/${p._id}`)}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onVariants={(p: Product) => navigate(`/products/${p._id}/variants`)}
          />
        )}
        renderTable={(rows) => (
          <DataTable
            title={t('list.title')}
            columns={columns}
            rows={rows}
            loading={isLoading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={data?.meta?.total ?? 0}
            paginationMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            getRowId={(row) => (row as Product)._id}
            onRowClick={(params) => navigate(`/products/${(params.row as Product)._id}/view`)}
            height="calc(100vh - 300px)"
            rowHeight={74}
          />
        )}
        loading={isLoading}
        emptyTitle={t('list.empty', 'لا توجد منتجات')}
        emptyDescription={t('list.emptyDescription', 'لم يتم العثور على منتجات تطابق معايير البحث')}
        emptyActionLabel={t('list.addNew', 'إضافة منتج جديد')}
        onEmptyAction={() => navigate('/products/new')}
        getRowId={(row) => (row as Product)._id}
      />

      <ConfirmDialog {...dialogProps} />
    </PageShell>
  );
};