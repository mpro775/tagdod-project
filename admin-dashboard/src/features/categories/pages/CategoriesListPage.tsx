import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
} from '@mui/material';
import { Edit, Delete, Restore, AccountTree, Star, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  useCategories,
  useDeleteCategory,
  useRestoreCategory,
  usePermanentDeleteCategory,
  useUpdateCategoryStats,
} from '../hooks/useCategories';
import { formatDate } from '@/shared/utils/formatters';
import type { Category, ListCategoriesParams } from '../types/category.types';
import { CategoryTreeView } from '../components/CategoryTreeView';
import { CategoryStatsCards } from '../components/CategoryStatsCards';
import { CategoryFilters } from '../components/CategoryFilters';
import { CategoryImage } from '../components/CategoryImage';

export const CategoriesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('categories');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });
  const [filters, setFilters] = useState<ListCategoriesParams>({});
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    category: Category | null;
    permanent: boolean;
  }>({ open: false, category: null, permanent: false });

  // API
  const { data: categoriesResponse, isLoading, refetch } = useCategories({
    ...filters,
    includeDeleted: filters.includeDeleted || false,
  });
  
  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : (categoriesResponse as any)?.data || [];

  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: restoreCategory } = useRestoreCategory();
  const { mutate: permanentDeleteCategory } = usePermanentDeleteCategory();
  const { mutate: updateStats } = useUpdateCategoryStats();

  // Actions
  const handleDelete = (category: Category, permanent = false) => {
    setDeleteDialog({
      open: true,
      category,
      permanent,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.category) return;

    if (deleteDialog.permanent) {
      permanentDeleteCategory(deleteDialog.category._id, {
        onSuccess: () => {
          setDeleteDialog({ open: false, category: null, permanent: false });
          refetch();
        },
      });
    } else {
      deleteCategory(deleteDialog.category._id, {
        onSuccess: () => {
          setDeleteDialog({ open: false, category: null, permanent: false });
          refetch();
        },
      });
    }
  };

  const handleRestore = (category: Category) => {
    restoreCategory(category._id, {
      onSuccess: () => refetch(),
    });
  };

  const handleUpdateStats = (category: Category) => {
    updateStats(category._id, {
      onSuccess: () => refetch(),
    });
  };

  const handleFiltersChange = (newFilters: ListCategoriesParams) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Columns for List View
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('fields.category'),
      width: 400,
      renderCell: (params) => {
        const category = params.row as Category;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
            <CategoryImage image={category.imageId} size={60} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                  {category.name}
                </Typography>
                {category.isFeatured && (
                  <Tooltip title={t('tooltips.featured')}>
                    <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                {category.nameEn}
              </Typography>
              {category.description && (
                <Tooltip title={category.description}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    display="block" 
                    noWrap
                    sx={{ fontSize: '0.7rem', mt: 0.25 }}
                  >
                    {category.description}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'parentId',
      headerName: t('fields.type'),
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.parentId ? t('types.sub') : t('types.main')}
          size="small"
          color={params.row.parentId ? 'info' : 'primary'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'productsCount',
      headerName: t('fields.products'),
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.productsCount || 0}
          size="small"
          color={params.row.productsCount > 0 ? 'success' : 'default'}
          variant={params.row.productsCount > 0 ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'childrenCount',
      headerName: t('fields.subcategories'),
      width: 90,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.childrenCount || 0}
          size="small"
          color={params.row.childrenCount > 0 ? 'secondary' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'isActive',
      headerName: t('fields.status'),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? t('status.active') : t('status.inactive')}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'order',
      headerName: t('fields.order'),
      width: 80,
      align: 'center',
    },
    {
      field: 'createdAt',
      headerName: t('fields.createdAt'),
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: t('fields.actions'),
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const category = params.row as Category;
        const isDeleted = !!category.deletedAt;

        if (isDeleted) {
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title={t('tooltips.restore')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(category);
                  }}
                >
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('tooltips.permanentDelete')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category, true);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('tooltips.edit')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/categories/${category._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltips.updateStats')}>
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStats(category);
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltips.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category);
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
    <Box suppressHydrationWarning>
      {/* Statistics Cards */}
      <CategoryStatsCards onRefresh={handleRefresh} />

      {/* Filters */}
      <CategoryFilters onFiltersChange={handleFiltersChange} />

      {/* View Mode Tabs */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={viewMode} onChange={(_, v) => setViewMode(v)}>
          <Tab icon={<AccountTree />} label={t('categories.treeView')} value="tree" iconPosition="start" />
          <Tab label={t('categories.listView')} value="list" />
        </Tabs>
        <Button
          startIcon={<Refresh />}
          onClick={() => refetch()}
          variant="outlined"
          size="small"
          sx={{ mr: 2 }}
        >
          {t('categories.refresh')}
        </Button>
      </Box>

      {/* Tree View */}
      {viewMode === 'tree' && (
        <CategoryTreeView
          onEdit={(category) => navigate(`/categories/${category._id}`)}
          onDelete={handleDelete}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <DataTable
          title={t('categories.manageCategories')}
          columns={columns}
          rows={categories}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onAdd={() => navigate('/categories/new')}
          addButtonText={t('categories.addNew')}
          getRowId={(row) => (row as Category)._id}
          onRowClick={(params) => {
            const row = params.row as Category;
            navigate(`/categories/${row._id}`);
          }}
          height="calc(100vh - 400px)"
          rowHeight={75}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null, permanent: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{deleteDialog.permanent ? 'حذف نهائي' : 'حذف الفئة'}</DialogTitle>
        <DialogContent>
          {deleteDialog.category && (
            <>
              <Alert severity={deleteDialog.permanent ? 'error' : 'warning'} sx={{ mb: 2 }}>
                {deleteDialog.permanent ? (
                  <>
                    <Typography variant="body2" fontWeight="bold">
                      {t('messages.permanentDeleteWarning')}
                    </Typography>
                    <Typography variant="body2">
                      {t('messages.permanentDeleteDesc', { name: deleteDialog.category.name })}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight="bold">
                      {t('messages.softDeleteDesc', { name: deleteDialog.category.name }).split('.')[0]}.
                    </Typography>
                    <Typography variant="body2">
                      {t('messages.softDeleteDesc', { name: deleteDialog.category.name }).split('.')[1]}.
                    </Typography>
                  </>
                )}
              </Alert>

              {deleteDialog.category.productsCount > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {t('messages.productsWarning', { count: deleteDialog.category.productsCount })}
                  </Typography>
                </Alert>
              )}

              {deleteDialog.category.childrenCount > 0 && (
                <Alert severity="info">
                  <Typography variant="body2">
                    {t('messages.subcategoriesWarning', { count: deleteDialog.category.childrenCount })}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, category: null, permanent: false })}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color={deleteDialog.permanent ? 'error' : 'warning'}
            variant="contained"
          >
            {deleteDialog.permanent ? 'حذف نهائياً' : 'حذف مؤقت'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
