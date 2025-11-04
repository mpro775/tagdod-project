import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Button, Menu, MenuItem, Alert, Grid, Skeleton, Paper, Typography } from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  Visibility,
  Star,
  NewReleases,
  Inventory,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ProductCard } from '@/shared/components/Cards/ProductCard';
import { useProducts, useDeleteProduct, useRestoreProduct } from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import { CurrencySelector } from '@/shared/components/CurrencySelector';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import type { Product } from '../types/product.types';
import { ProductStatus } from '../types/product.types';

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('products');
  const { isMobile } = useBreakpoint();
  const { confirmDialog, dialogProps } = useConfirmDialog();

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
  const handleDelete = async (product: Product) => {
    const confirmed = await confirmDialog({
      title: t('messages.deleteTitle', 'تأكيد الحذف'),
      message: t('messages.confirmDelete', { name: product.name }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      deleteProduct(product._id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleRestore = async (product: Product) => {
    const confirmed = await confirmDialog({
      title: t('messages.restoreTitle', 'تأكيد الاستعادة'),
      message: t('messages.confirmRestore', { name: product.name }),
      type: 'question',
    });
    if (confirmed) {
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
      headerName: t('list.columns.product'),
      width: isMobile ? 150 : 250,
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const imageUrl = params.row.mainImage || 
          (typeof params.row.mainImageId === 'object' ? params.row.mainImageId?.url : null) ||
          params.row.images?.[0];
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {imageUrl && (
              <Box
                component="img"
                src={imageUrl}
                alt={params.row.name}
                sx={{
                  width: { xs: 30, sm: 40 },
                  height: { xs: 30, sm: 40 },
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            )}
            <Box>
              <Box sx={{ fontWeight: 'medium', fontSize: { xs: '0.875rem', sm: '1rem' } }}>{params.row.name}</Box>
              <Box sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, color: 'text.secondary' }}>{params.row.nameEn}</Box>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'sku',
      headerName: t('list.columns.sku'),
      width: 120,
    },
    {
      field: 'category',
      headerName: t('list.columns.category'),
      width: 150,
      valueGetter: (_value, row) => (typeof row.categoryId === 'object' ? row.categoryId?.name : '-') || '-',
    },
    {
      field: 'brand',
      headerName: t('list.columns.brand'),
      width: 130,
      valueGetter: (_value, row) => (typeof row.brandId === 'object' ? row.brandId?.name : '-') || '-',
    },
    {
      field: 'variantsCount',
      headerName: t('list.columns.variants'),
      width: 100,
      align: 'center',
    },
    {
      field: 'status',
      headerName: t('list.columns.status'),
      width: 130,
      renderCell: (params) => {
        const statusMap: Record<
          ProductStatus,
          { label: string; color: 'success' | 'warning' | 'error' | 'default' }
        > = {
          active: { label: t('status.active'), color: 'success' },
          draft: { label: t('status.draft'), color: 'default' },
          archived: { label: t('status.archived'), color: 'warning' },
        };
        const status = statusMap[params.row.status as ProductStatus];
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
    {
      field: 'badges',
      headerName: t('list.columns.badges'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.isFeatured && (
            <Tooltip title={t('badges.featured')}>
              <Star sx={{ fontSize: { xs: 16, sm: 18 }, color: 'warning.main' }} />
            </Tooltip>
          )}
          {params.row.isNew && (
            <Tooltip title={t('badges.new')}>
              <NewReleases sx={{ fontSize: { xs: 16, sm: 18 }, color: 'info.main' }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: 'salesCount',
      headerName: t('list.columns.sales'),
      width: 100,
      align: 'center',
    },
    {
      field: 'createdAt',
      headerName: t('list.columns.createdAt'),
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: t('list.columns.actions'),
      width: 220,
      sortable: false,
      renderCell: (params) => {
        const product = params.row as Product;
        const isDeleted = !!product.deletedAt;

        if (isDeleted) {
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title={t('actions.restore')}>
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
            <Tooltip title={t('actions.view')}>
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

            <Tooltip title={t('actions.variants')}>
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

            <Tooltip title={t('actions.edit')}>
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

            <Tooltip title={t('actions.delete')}>
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
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Button variant="outlined" startIcon={<FilterList />} onClick={handleMenuOpen} size={isMobile ? 'small' : 'medium'}>
            {t('list.filters')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Inventory />}
            onClick={() => navigate('/products/inventory')}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('list.inventoryManagement')}
          </Button>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <CurrencySelector size="small" showLabel={false} />
          <Button variant="contained" onClick={() => navigate('/products/new')} size={isMobile ? 'small' : 'medium'}>
            {t('list.addNew')}
          </Button>
        </Box>
      </Box>

      {/* Active filters */}
      {(statusFilter !== 'all' || featuredFilter !== 'all') && (
        <Box mb={2}>
          <Alert severity="info">
            {t('list.activeFilters')}
            {statusFilter !== 'all' && (
              <Chip
                label={`${t('list.statusColon')} ${t(`status.${statusFilter}`)}`}
                size="small"
                onDelete={() => setStatusFilter('all')}
                sx={{ ml: 1 }}
              />
            )}
            {featuredFilter !== 'all' && (
              <Chip
                label={`${t('list.filters.featured')}: ${featuredFilter ? t('common.yes', { ns: 'common' }) : t('common.no', { ns: 'common' })}`}
                size="small"
                onDelete={() => setFeaturedFilter('all')}
                sx={{ ml: 1 }}
              />
            )}
          </Alert>
        </Box>
      )}

      {/* Display based on screen size */}
      {isMobile ? (
        /* Mobile Card Layout */
        <Box>
          {isLoading ? (
            /* Loading Skeleton */
            <Box>
              {Array.from({ length: 5 }).map((_, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" gap={2}>
                    <Skeleton variant="rounded" width={80} height={80} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="80%" height={28} />
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                  <Box mt={2} display="flex" gap={1}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="30%" height={32} />
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : !data?.data || data.data.length === 0 ? (
            /* Empty State */
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('list.empty')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('list.emptyDescription')}
              </Typography>
            </Paper>
          ) : (
            /* Products Grid */
            <Grid container spacing={2}>
              {data.data.map((product) => (
                <Grid size={{ xs: 12 }} key={product._id}>
                  <ProductCard
                    product={product}
                    onView={(p) => navigate(`/products/${p._id}/view`)}
                    onEdit={(p) => navigate(`/products/${p._id}`)}
                    onDelete={handleDelete}
                    onToggleStatus={product.deletedAt ? handleRestore : undefined}
                    showActions={true}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Mobile Pagination */}
          {data?.meta && data.meta.total > paginationModel.pageSize && (
            <Box mt={3} display="flex" justifyContent="center" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                disabled={paginationModel.page === 0}
                onClick={() => setPaginationModel({ ...paginationModel, page: paginationModel.page - 1 })}
                size="small"
              >
                {t('common.previous', { ns: 'common' })}
              </Button>
              <Typography variant="body2">
                {t('common.of', { ns: 'common' })} {Math.ceil((data.meta.total || 0) / paginationModel.pageSize)}
              </Typography>
              <Button
                variant="outlined"
                disabled={(paginationModel.page + 1) * paginationModel.pageSize >= (data.meta.total || 0)}
                onClick={() => setPaginationModel({ ...paginationModel, page: paginationModel.page + 1 })}
                size="small"
              >
                {t('common.next', { ns: 'common' })}
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        /* Desktop Table Layout */
        <DataTable
          title={t('list.title')}
          columns={columns}
          rows={data?.data || []}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          searchPlaceholder={t('list.search')}
          onSearch={setSearch}
          getRowId={(row) => (row as Product)._id}
          onRowClick={(params) => {
            navigate(`/products/${(params.row as Product)._id}`);
          }}
          height="calc(100vh - 200px)"
        />
      )}

      {/* Filter Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleFilterChange('status', 'all')}>{t('list.allStatuses')}</MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.ACTIVE)}>{t('status.active')}</MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.DRAFT)}>{t('status.draft')}</MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.ARCHIVED)}>
          {t('status.archived')}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('featured', true)}>{t('list.featuredProducts')}</MenuItem>
        <MenuItem onClick={() => handleFilterChange('featured', false)}>{t('list.normalProducts')}</MenuItem>
      </Menu>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Box>
  );
};
