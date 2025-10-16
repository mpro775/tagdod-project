import React, { useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { Edit, Delete, Restore, AccountTree, Visibility, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useCategories, useDeleteCategory, useRestoreCategory } from '../hooks/useCategories';
import { formatDate } from '@/shared/utils/formatters';
import type { Category } from '../types/category.types';
import { CategoryTreeView } from '../components/CategoryTreeView';

export const CategoriesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });

  // API
  const { data: categoriesResponse, isLoading, refetch } = useCategories({});
  const categories = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || []);

  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: restoreCategory } = useRestoreCategory();

  // Actions
  const handleDelete = (category: Category) => {
    if (window.confirm(`هل أنت متأكد من حذف الفئة "${category.name}"؟`)) {
      deleteCategory(category._id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleRestore = (category: Category) => {
    if (window.confirm(`هل تريد استعادة الفئة "${category.name}"؟`)) {
      restoreCategory(category._id, {
        onSuccess: () => refetch(),
      });
    }
  };

  // Columns for List View
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'الفئة',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.image && (
            <Box
              component="img"
              src={params.row.image}
              alt={params.row.name}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                objectFit: 'cover',
              }}
            />
          )}
          {params.row.icon && !params.row.image && (
            <Box sx={{ fontSize: 32 }}>{params.row.icon}</Box>
          )}
          <Box>
            <Box sx={{ fontWeight: 'medium' }}>{params.row.name}</Box>
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.row.nameEn}</Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'path',
      headerName: 'المسار',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'text.secondary' }}>
          {params.row.path}
        </Box>
      ),
    },
    {
      field: 'depth',
      headerName: 'المستوى',
      width: 100,
      align: 'center',
    },
    {
      field: 'productsCount',
      headerName: 'المنتجات',
      width: 100,
      align: 'center',
    },
    {
      field: 'childrenCount',
      headerName: 'الفئات الفرعية',
      width: 120,
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
      field: 'badges',
      headerName: 'الشارات',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.isFeatured && (
            <Tooltip title="مميزة">
              <Star sx={{ fontSize: 18, color: 'warning.main' }} />
            </Tooltip>
          )}
          {params.row.showInMenu && (
            <Tooltip title="تظهر في القائمة">
              <Visibility sx={{ fontSize: 18, color: 'info.main' }} />
            </Tooltip>
          )}
        </Box>
      ),
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
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const category = params.row as Category;
        const isDeleted = !!category.deletedAt;

        if (isDeleted) {
          return (
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
    <Box>
      {/* View Mode Tabs */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={viewMode} onChange={(_, v) => setViewMode(v)}>
          <Tab icon={<AccountTree />} label="عرض شجري" value="tree" iconPosition="start" />
          <Tab label="عرض قائمة" value="list" />
        </Tabs>
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
          rowCount={categories.length}
          onAdd={() => navigate('/categories/new')}
          addButtonText="إضافة فئة"
          onRowClick={(params) => {
            const row = params.row as Category;
            navigate(`/categories/${row._id}`);
          }}
          height="calc(100vh - 250px)"
        />
      )}
    </Box>
  );
};
