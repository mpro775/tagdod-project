import React, { useState } from 'react';
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

export const CategoriesListPage: React.FC = () => {
  const navigate = useNavigate();
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
      headerName: 'الفئة',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ fontSize: 32, color: 'text.secondary' }}>📁</Box>
          <Box>
            <Box sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center', gap: 1 }}>
              {params.row.name}
              {params.row.isFeatured && <Star sx={{ fontSize: 16, color: 'warning.main' }} />}
            </Box>
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.row.nameEn}</Box>
            {params.row.description && (
              <Box sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}>
                {params.row.description.length > 50
                  ? `${params.row.description.substring(0, 50)}...`
                  : params.row.description}
              </Box>
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: 'parentId',
      headerName: 'الفئة الأب',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
          {params.row.parentId ? 'فئة فرعية' : 'فئة رئيسية'}
        </Box>
      ),
    },
    {
      field: 'productsCount',
      headerName: 'المنتجات',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.productsCount}
          size="small"
          color={params.row.productsCount > 0 ? 'primary' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'childrenCount',
      headerName: 'الفئات الفرعية',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.childrenCount}
          size="small"
          color={params.row.childrenCount > 0 ? 'secondary' : 'default'}
          variant="outlined"
        />
      ),
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
      field: 'order',
      headerName: 'الترتيب',
      width: 80,
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
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const category = params.row as Category;
        const isDeleted = !!category.deletedAt;

        if (isDeleted) {
          return (
            <Box display="flex" gap={0.5}>
              <Tooltip title="استعادة">
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
              <Tooltip title="حذف نهائي">
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
            <Tooltip title="تعديل">
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

            <Tooltip title="تحديث الإحصائيات">
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

            <Tooltip title="حذف">
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
          <Tab icon={<AccountTree />} label="عرض شجري" value="tree" iconPosition="start" />
          <Tab label="عرض قائمة" value="list" />
        </Tabs>
        <Button
          startIcon={<Refresh />}
          onClick={refetch}
          variant="outlined"
          size="small"
          sx={{ mr: 2 }}
        >
          تحديث
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
          title="إدارة الفئات"
          columns={columns}
          rows={categories}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onAdd={() => navigate('/categories/new')}
          addButtonText="إضافة فئة"
          getRowId={(row) => (row as Category)._id}
          onRowClick={(params) => {
            const row = params.row as Category;
            navigate(`/categories/${row._id}`);
          }}
          height="calc(100vh - 400px)"
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
                      تحذير: هذا الإجراء لا يمكن التراجع عنه!
                    </Typography>
                    <Typography variant="body2">
                      سيتم حذف الفئة "{deleteDialog.category.name}" نهائياً من النظام.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight="bold">
                      سيتم حذف الفئة "{deleteDialog.category.name}" مؤقتاً.
                    </Typography>
                    <Typography variant="body2">
                      يمكنك استعادتها لاحقاً من قائمة الفئات المحذوفة.
                    </Typography>
                  </>
                )}
              </Alert>

              {deleteDialog.category.productsCount > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    هذه الفئة تحتوي على {deleteDialog.category.productsCount} منتج.
                  </Typography>
                </Alert>
              )}

              {deleteDialog.category.childrenCount > 0 && (
                <Alert severity="info">
                  <Typography variant="body2">
                    هذه الفئة تحتوي على {deleteDialog.category.childrenCount} فئة فرعية.
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
            إلغاء
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
