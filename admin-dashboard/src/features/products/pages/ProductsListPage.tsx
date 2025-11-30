import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Alert,
  Grid,
  Skeleton,
  Paper,
  Typography,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
  Badge,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  Visibility,
  Star,
  NewReleases,
  Inventory,
  FilterList,
  TrendingUp,
  ViewModule,
  TableChart,
  Close,
  Clear,
  CheckCircle,
  SelectAll,
  Deselect,
  Home,
  ChevronRight,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Cached,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ProductCard } from '@/shared/components/Cards/ProductCard';
import { useProducts, useDeleteProduct, useRestoreProduct, useClearCache } from '../hooks/useProducts';
import { formatDate } from '@/shared/utils/formatters';
import { CurrencySelector } from '@/shared/components/CurrencySelector';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import type { Product } from '../types/product.types';
import { ProductStatus } from '../types/product.types';
import { ProductImage } from '../components';

type ImageWithUrl = {
  url: string;
  [key: string]: unknown;
};

const isImageWithUrl = (value: unknown): value is ImageWithUrl =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { url?: unknown }).url === 'string';

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('products');
  const { isMobile } = useBreakpoint();
  const { confirmDialog, dialogProps } = useConfirmDialog();

  // Helper function to parse URL params
  const getParamNumber = useCallback((key: string, defaultValue: number) => {
    const value = searchParams.get(key);
    if (value === null) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }, [searchParams]);

  const getParamString = useCallback((key: string, defaultValue: string) => {
    return searchParams.get(key) ?? defaultValue;
  }, [searchParams]);

  const getParamBoolean = useCallback((key: string): boolean | 'all' => {
    const value = searchParams.get(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return 'all';
  }, [searchParams]);

  // State initialized from URL params (الأحدث أولاً كافتراضي)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(() => ({
    page: getParamNumber('page', 0),
    pageSize: getParamNumber('pageSize', 20),
  }));
  const [search, setSearch] = useState(() => getParamString('search', ''));
  const [sortModel, setSortModel] = useState<GridSortModel>(() => [{
    field: getParamString('sortBy', 'createdAt'),
    sort: (getParamString('sortOrder', 'desc') as 'asc' | 'desc'),
  }]);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>(() => {
    const status = searchParams.get('status');
    if (status === 'active' || status === 'draft' || status === 'archived') {
      return status as ProductStatus;
    }
    return 'all';
  });
  const [featuredFilter, setFeaturedFilter] = useState<boolean | 'all'>(() => getParamBoolean('isFeatured'));
  const [newFilter, setNewFilter] = useState<boolean | 'all'>(() => getParamBoolean('isNew'));
  const [bestsellerFilter, setBestsellerFilter] = useState<boolean | 'all'>(() => getParamBoolean('isBestseller'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    // Load from localStorage if available, default to 'table'
    const saved = localStorage.getItem('products-view-mode');
    return saved === 'grid' || saved === 'table' ? saved : 'table';
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Sync state changes to URL params
  useEffect(() => {
    const params = new URLSearchParams();

    // Pagination
    if (paginationModel.page !== 0) params.set('page', paginationModel.page.toString());
    if (paginationModel.pageSize !== 20) params.set('pageSize', paginationModel.pageSize.toString());

    // Search
    if (search) params.set('search', search);

    // Sort (only if different from default: createdAt desc)
    const sortBy = sortModel[0]?.field || 'createdAt';
    const sortOrder = sortModel[0]?.sort || 'desc';
    if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }

    // Filters
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (featuredFilter !== 'all') params.set('isFeatured', featuredFilter.toString());
    if (newFilter !== 'all') params.set('isNew', newFilter.toString());
    if (bestsellerFilter !== 'all') params.set('isBestseller', bestsellerFilter.toString());

    // Update URL without navigation (replace to avoid history pollution)
    setSearchParams(params, { replace: true });
  }, [paginationModel, search, sortModel, statusFilter, featuredFilter, newFilter, bestsellerFilter, setSearchParams]);

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (featuredFilter !== 'all') count++;
    if (newFilter !== 'all') count++;
    if (bestsellerFilter !== 'all') count++;
    return count;
  }, [statusFilter, featuredFilter, newFilter, bestsellerFilter]);

  // Clear all filters (also reset to first page)
  const clearAllFilters = () => {
    setStatusFilter('all');
    setFeaturedFilter('all');
    setNewFilter('all');
    setBestsellerFilter('all');
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  // API
  const { data, isLoading, refetch } = useProducts({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc', // الأحدث أولاً كافتراضي
    status: statusFilter !== 'all' ? statusFilter : undefined,
    isFeatured: featuredFilter !== 'all' ? featuredFilter : undefined,
    isNew: newFilter !== 'all' ? newFilter : undefined,
    isBestseller: bestsellerFilter !== 'all' ? bestsellerFilter : undefined,
  });

  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: restoreProduct } = useRestoreProduct();
  const { mutate: clearCache, isPending: isClearingCache } = useClearCache();

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    const confirmed = await confirmDialog({
      title: t('messages.bulkDeleteTitle', 'تأكيد الحذف الجماعي'),
      message: t('messages.bulkDeleteConfirm', { count: selectedProducts.length }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      // Delete products one by one (can be optimized with bulk API if available)
      Promise.all(
        selectedProducts.map(
          (id) =>
            new Promise((resolve) => {
              deleteProduct(id, {
                onSuccess: () => resolve(true),
                onError: () => resolve(false),
              });
            })
        )
      ).then(() => {
        setSelectedProducts([]);
        refetch();
        toast.success(t('messages.bulkDeleteSuccess', { count: selectedProducts.length }));
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === (data?.data?.length || 0)) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(data?.data?.map((p: Product) => p._id) || []);
    }
  };

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

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('products-view-mode', mode);
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
        const product = params.row as Product;
        const primaryImage =
          (typeof product.mainImageId === 'object' ? product.mainImageId : undefined) ??
          product.mainImage;

        const fallbackImages: Array<string | ImageWithUrl> = [];

        if (product.mainImage && typeof product.mainImage === 'string') {
          fallbackImages.push(product.mainImage);
        }

        if (Array.isArray(product.imageIds) && product.imageIds.length > 0) {
          const withUrl = product.imageIds.find(isImageWithUrl);
          if (withUrl) {
            fallbackImages.push(withUrl);
          }
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <ProductImage
                image={primaryImage}
                fallbackImages={fallbackImages}
                size={isMobile ? 36 : 48}
              />
              {product.isFeatured && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    bgcolor: 'warning.main',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  <Star sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                noWrap
                sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}
              >
                {product.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {product.nameEn}
              </Typography>
              {product.sku && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  noWrap
                  sx={{ display: 'block', fontSize: { xs: '0.6rem', sm: '0.7rem' }, mt: 0.25 }}
                >
                  SKU: {product.sku}
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'category',
      headerName: t('list.columns.category'),
      width: 150,
      valueGetter: (_value, row) =>
        (typeof row.categoryId === 'object' ? row.categoryId?.name : '-') || '-',
    },
    {
      field: 'brand',
      headerName: t('list.columns.brand'),
      width: 130,
      valueGetter: (_value, row) =>
        (typeof row.brandId === 'object' ? row.brandId?.name : '-') || '-',
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
      width: 150,
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
          {params.row.isBestseller && (
            <Tooltip title={t('badges.bestseller')}>
              <TrendingUp sx={{ fontSize: { xs: 16, sm: 18 }, color: 'success.main' }} />
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
      valueGetter: (_value, row) => row.createdAt || null,
      valueFormatter: (value) => {
        if (!value || value === null || value === undefined) return '-';
        return formatDate(value as Date | string);
      },
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

  // Show full page loading state
  if (isLoading) {
    return (
      <Box>
        {/* Header Skeleton */}
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={180} height={36} />
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Skeleton variant="rectangular" width={100} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
          </Box>
        </Box>

        {/* Content Skeleton */}
        {isMobile ? (
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
        ) : (
          <Box>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height="calc(100vh - 200px)" />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<ChevronRight fontSize="small" />}
        sx={{ mb: 2 }}
        aria-label="breadcrumb"
      >
        <Link
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('navigation.dashboard', 'لوحة التحكم')}
        </Link>
        <Typography color="text.primary">{t('list.title', 'المنتجات')}</Typography>
      </Breadcrumbs>

      {/* Header with filters */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Badge badgeContent={activeFiltersCount} color="primary">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFiltersDrawerOpen(true)}
              size={isMobile ? 'small' : 'medium'}
            >
              {t('list.filtersLabel', 'الفلاتر')}
            </Button>
          </Badge>

          {/* Quick Filters */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <Chip
              label={t('status.active', 'نشط')}
              onClick={() =>
                setStatusFilter(
                  statusFilter === ProductStatus.ACTIVE ? 'all' : ProductStatus.ACTIVE
                )
              }
              color={statusFilter === ProductStatus.ACTIVE ? 'primary' : 'default'}
              size="small"
              variant={statusFilter === ProductStatus.ACTIVE ? 'filled' : 'outlined'}
            />
            <Chip
              label={t('badges.featured', 'مميز')}
              onClick={() => setFeaturedFilter(featuredFilter === true ? 'all' : true)}
              color={featuredFilter === true ? 'warning' : 'default'}
              size="small"
              variant={featuredFilter === true ? 'filled' : 'outlined'}
              icon={<Star />}
            />
            <Chip
              label={t('badges.new', 'جديد')}
              onClick={() => setNewFilter(newFilter === true ? 'all' : true)}
              color={newFilter === true ? 'info' : 'default'}
              size="small"
              variant={newFilter === true ? 'filled' : 'outlined'}
              icon={<NewReleases />}
            />
            <Chip
              label={t('badges.bestseller', 'الأكثر مبيعاً')}
              onClick={() => setBestsellerFilter(bestsellerFilter === true ? 'all' : true)}
              color={bestsellerFilter === true ? 'success' : 'default'}
              size="small"
              variant={bestsellerFilter === true ? 'filled' : 'outlined'}
              icon={<TrendingUp />}
            />
          </Stack>

          <Button
            variant="outlined"
            startIcon={<Inventory />}
            onClick={() => navigate('/products/inventory')}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('list.inventoryManagement', 'إدارة المخزون')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cached />}
            onClick={() => clearCache()}
            disabled={isClearingCache}
            size={isMobile ? 'small' : 'medium'}
            color="secondary"
          >
            {isClearingCache ? t('list.clearingCache', 'جاري المسح...') : t('list.clearCache', 'مسح الكاش')}
          </Button>
        </Box>
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          {/* Sort Options */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Sort />}
            endIcon={
              sortModel[0]?.sort === 'desc' ? (
                <ArrowDownward fontSize="small" />
              ) : (
                <ArrowUpward fontSize="small" />
              )
            }
            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
            sx={{ minWidth: { xs: 'auto', sm: 140 } }}
          >
            {sortModel[0]?.field === 'createdAt' &&
              (sortModel[0]?.sort === 'desc'
                ? t('list.sort.newest', 'الأحدث')
                : t('list.sort.oldest', 'الأقدم'))}
            {sortModel[0]?.field === 'name' && t('list.sort.name', 'الاسم')}
            {sortModel[0]?.field === 'price' && t('list.sort.price', 'السعر')}
            {sortModel[0]?.field === 'stock' && t('list.sort.stock', 'المخزون')}
            {!sortModel[0]?.field && t('list.sort.newest', 'الأحدث')}
          </Button>
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={() => setSortMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setSortModel([{ field: 'createdAt', sort: 'desc' }]);
                setSortMenuAnchor(null);
              }}
              selected={sortModel[0]?.field === 'createdAt' && sortModel[0]?.sort === 'desc'}
            >
              <ArrowDownward fontSize="small" sx={{ mr: 1 }} />
              {t('list.sort.newest', 'الأحدث أولاً')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortModel([{ field: 'createdAt', sort: 'asc' }]);
                setSortMenuAnchor(null);
              }}
              selected={sortModel[0]?.field === 'createdAt' && sortModel[0]?.sort === 'asc'}
            >
              <ArrowUpward fontSize="small" sx={{ mr: 1 }} />
              {t('list.sort.oldest', 'الأقدم أولاً')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortModel([{ field: 'name', sort: 'asc' }]);
                setSortMenuAnchor(null);
              }}
              selected={sortModel[0]?.field === 'name' && sortModel[0]?.sort === 'asc'}
            >
              {t('list.sort.nameAsc', 'الاسم (أ-ي)')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortModel([{ field: 'name', sort: 'desc' }]);
                setSortMenuAnchor(null);
              }}
              selected={sortModel[0]?.field === 'name' && sortModel[0]?.sort === 'desc'}
            >
              {t('list.sort.nameDesc', 'الاسم (ي-أ)')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortModel([{ field: 'price', sort: 'asc' }]);
                setSortMenuAnchor(null);
              }}
              selected={sortModel[0]?.field === 'price' && sortModel[0]?.sort === 'asc'}
            >
              {t('list.sort.priceLow', 'السعر (منخفض-عالي)')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSortModel([{ field: 'price', sort: 'desc' }]);
                setSortMenuAnchor(null);
              }}
              selected={sortModel[0]?.field === 'price' && sortModel[0]?.sort === 'desc'}
            >
              {t('list.sort.priceHigh', 'السعر (عالي-منخفض)')}
            </MenuItem>
          </Menu>
          {/* View Mode Toggle */}
          <Box display="flex" gap={0.5} sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Tooltip title={t('list.viewMode.table', 'عرض الجدول')}>
              <IconButton
                size="small"
                color={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => handleViewModeChange('table')}
                sx={{
                  borderRadius: 0,
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                }}
              >
                <TableChart fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('list.viewMode.grid', 'العرض الشبكي')}>
              <IconButton
                size="small"
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => handleViewModeChange('grid')}
                sx={{
                  borderRadius: 0,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }}
              >
                <ViewModule fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <CurrencySelector size="small" showLabel={false} />
          <Button
            variant="contained"
            onClick={() => navigate('/products/new')}
            size={isMobile ? 'small' : 'medium'}
          >
            {t('list.addNew')}
          </Button>
        </Box>
      </Box>

      {/* Bulk Actions Toolbar */}
      {selectedProducts.length > 0 && (
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            bgcolor: 'primary.light',
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body1" fontWeight="medium">
              {t('list.selectedCount', 'تم اختيار {{count}} منتج', {
                count: selectedProducts.length,
              })}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {t('list.bulkDelete', 'حذف المحدد')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  selectedProducts.length === (data?.data?.length || 0) ? (
                    <Deselect />
                  ) : (
                    <SelectAll />
                  )
                }
                onClick={handleSelectAll}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {selectedProducts.length === (data?.data?.length || 0)
                  ? t('list.deselectAll', 'إلغاء تحديد الكل')
                  : t('list.selectAll', 'تحديد الكل')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={() => setSelectedProducts([])}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {t('list.clearSelection', 'مسح التحديد')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <Box mb={2}>
          <Alert
            severity="info"
            action={
              <Button size="small" onClick={clearAllFilters} startIcon={<Clear />}>
                {t('list.clearAll', 'مسح الكل')}
              </Button>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2">{t('list.activeFilters', 'الفلاتر النشطة')}:</Typography>
              {statusFilter !== 'all' && (
                <Chip
                  label={t(`status.${statusFilter}`, statusFilter)}
                  size="small"
                  onDelete={() => setStatusFilter('all')}
                  color="primary"
                />
              )}
              {featuredFilter !== 'all' && (
                <Chip
                  label={t('badges.featured', 'مميز')}
                  size="small"
                  onDelete={() => setFeaturedFilter('all')}
                  color="warning"
                  icon={<Star />}
                />
              )}
              {newFilter !== 'all' && (
                <Chip
                  label={t('badges.new', 'جديد')}
                  size="small"
                  onDelete={() => setNewFilter('all')}
                  color="info"
                  icon={<NewReleases />}
                />
              )}
              {bestsellerFilter !== 'all' && (
                <Chip
                  label={t('badges.bestseller', 'الأكثر مبيعاً')}
                  size="small"
                  onDelete={() => setBestsellerFilter('all')}
                  color="success"
                  icon={<TrendingUp />}
                />
              )}
            </Box>
          </Alert>
        </Box>
      )}

      {/* Display based on view mode */}
      {viewMode === 'grid' ? (
        /* Grid/Card Layout */
        <Box>
          {!data?.data || data.data.length === 0 ? (
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                  }}
                  key={product._id}
                >
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

          {/* Pagination */}
          {data?.meta && data.meta.total > paginationModel.pageSize && (
            <Box mt={3} display="flex" justifyContent="center" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                disabled={paginationModel.page === 0}
                onClick={() =>
                  setPaginationModel({ ...paginationModel, page: paginationModel.page - 1 })
                }
                size="small"
              >
                {t('common.previous', { ns: 'common' })}
              </Button>
              <Typography variant="body2">
                {paginationModel.page + 1} {t('common.of', { ns: 'common' })}{' '}
                {Math.ceil((data.meta.total || 0) / paginationModel.pageSize)}
              </Typography>
              <Button
                variant="outlined"
                disabled={
                  (paginationModel.page + 1) * paginationModel.pageSize >= (data.meta.total || 0)
                }
                onClick={() =>
                  setPaginationModel({ ...paginationModel, page: paginationModel.page + 1 })
                }
                size="small"
              >
                {t('common.next', { ns: 'common' })}
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        /* Table Layout */
        <DataTable
          title={t('list.title')}
          columns={columns}
          rows={data?.data || []}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={data?.meta?.total ?? 0}
          paginationMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          sortingMode="server"
          searchPlaceholder={t('list.search')}
          onSearch={setSearch}
          getRowId={(row) => (row as Product)._id}
          onRowClick={(params) => {
            navigate(`/products/${(params.row as Product)._id}`);
          }}
          selectable={true}
          onRowSelectionModelChange={(selection) => setSelectedProducts(selection as string[])}
          height="calc(100vh - 200px)"
        />
      )}

      {/* Advanced Filters Drawer */}
      <Drawer
        anchor="right"
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 3 },
        }}
      >
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h6" fontWeight="bold">
              {t('list.advancedFilters', 'الفلاتر المتقدمة')}
            </Typography>
            <IconButton onClick={() => setFiltersDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            {/* Status Filter */}
            <FormControl fullWidth>
              <InputLabel>{t('list.columns.status', 'الحالة')}</InputLabel>
              <Select
                value={statusFilter}
                label={t('list.columns.status', 'الحالة')}
                onChange={(e) => setStatusFilter(e.target.value as ProductStatus | 'all')}
              >
                <MenuItem value="all">{t('list.allStatuses', 'جميع الحالات')}</MenuItem>
                <MenuItem value={ProductStatus.ACTIVE}>{t('status.active', 'نشط')}</MenuItem>
                <MenuItem value={ProductStatus.DRAFT}>{t('status.draft', 'مسودة')}</MenuItem>
                <MenuItem value={ProductStatus.ARCHIVED}>{t('status.archived', 'مؤرشف')}</MenuItem>
              </Select>
            </FormControl>

            {/* Featured Filter */}
            <FormControl fullWidth>
              <InputLabel>{t('badges.featured', 'مميز')}</InputLabel>
              <Select
                value={featuredFilter}
                label={t('badges.featured', 'مميز')}
                onChange={(e) => setFeaturedFilter(e.target.value as boolean | 'all')}
              >
                <MenuItem value="all">{t('common.all', 'الكل')}</MenuItem>
                <MenuItem value="true">{t('common.yes', 'نعم')}</MenuItem>
                <MenuItem value="false">{t('common.no', 'لا')}</MenuItem>
              </Select>
            </FormControl>

            {/* New Filter */}
            <FormControl fullWidth>
              <InputLabel>{t('badges.new', 'جديد')}</InputLabel>
              <Select
                value={newFilter}
                label={t('badges.new', 'جديد')}
                onChange={(e) => setNewFilter(e.target.value as boolean | 'all')}
              >
                <MenuItem value="all">{t('common.all', 'الكل')}</MenuItem>
                <MenuItem value="true">{t('common.yes', 'نعم')}</MenuItem>
                <MenuItem value="false">{t('common.no', 'لا')}</MenuItem>
              </Select>
            </FormControl>

            {/* Bestseller Filter */}
            <FormControl fullWidth>
              <InputLabel>{t('badges.bestseller', 'الأكثر مبيعاً')}</InputLabel>
              <Select
                value={bestsellerFilter}
                label={t('badges.bestseller', 'الأكثر مبيعاً')}
                onChange={(e) => setBestsellerFilter(e.target.value as boolean | 'all')}
              >
                <MenuItem value="all">{t('common.all', 'الكل')}</MenuItem>
                <MenuItem value="true">{t('common.yes', 'نعم')}</MenuItem>
                <MenuItem value="false">{t('common.no', 'لا')}</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<Clear />} onClick={clearAllFilters} fullWidth>
                {t('list.clearAll', 'مسح الكل')}
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setFiltersDrawerOpen(false)}
                fullWidth
              >
                {t('common.apply', 'تطبيق')}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      {/* Filter Menu (Legacy - keeping for backward compatibility) */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleFilterChange('status', 'all')}>
          {t('list.allStatuses')}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.ACTIVE)}>
          {t('status.active')}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.DRAFT)}>
          {t('status.draft')}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', ProductStatus.ARCHIVED)}>
          {t('status.archived')}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('featured', true)}>
          {t('list.featuredProducts')}
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('featured', false)}>
          {t('list.normalProducts')}
        </MenuItem>
      </Menu>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Box>
  );
};
