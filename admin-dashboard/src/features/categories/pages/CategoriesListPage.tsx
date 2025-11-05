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
  useTheme,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Divider,
  Fab,
} from '@mui/material';
import { Edit, Delete, Restore, AccountTree, Star, Refresh, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
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
  const theme = useTheme();
  const { isMobile, isXs } = useBreakpoint();
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

  // Handle card click for mobile view
  const handleCategoryClick = (category: Category) => {
    navigate(`/categories/${category._id}`);
  };

  // Columns for List View
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('fields.category'),
      flex: isMobile ? 0 : 1,
      minWidth: isMobile ? 250 : 400,
      renderCell: (params) => {
        const category = params.row as Category;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, py: 0.5 }}>
            <CategoryImage image={category.imageId} size={isMobile ? 40 : 60} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight="bold" 
                  noWrap
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'text.primary',
                  }}
                >
                  {category.name}
                </Typography>
                {category.isFeatured && (
                  <Tooltip title={t('tooltips.featured')}>
                    <Star sx={{ fontSize: { xs: 14, sm: 18 }, color: 'warning.main' }} />
                  </Tooltip>
                )}
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                display="block" 
                noWrap
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {category.nameEn}
              </Typography>
              {category.description && (
                <Tooltip title={category.description}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    display="block" 
                    noWrap
                    sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, mt: 0.25 }}
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
      width: isMobile ? 90 : 120,
      minWidth: 90,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.parentId ? t('types.sub') : t('types.main')}
          size="small"
          color={params.row.parentId ? 'info' : 'primary'}
          variant="outlined"
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        />
      ),
    },
    {
      field: 'productsCount',
      headerName: t('fields.products'),
      width: isMobile ? 80 : 100,
      minWidth: 80,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.productsCount || 0}
          size="small"
          color={params.row.productsCount > 0 ? 'success' : 'default'}
          variant={params.row.productsCount > 0 ? 'filled' : 'outlined'}
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        />
      ),
    },
    {
      field: 'childrenCount',
      headerName: t('fields.subcategories'),
      width: isMobile ? 70 : 90,
      minWidth: 70,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.childrenCount || 0}
          size="small"
          color={params.row.childrenCount > 0 ? 'secondary' : 'default'}
          variant="outlined"
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        />
      ),
    },
    {
      field: 'isActive',
      headerName: t('fields.status'),
      width: isMobile ? 80 : 100,
      minWidth: 80,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? t('status.active') : t('status.inactive')}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        />
      ),
    },
    {
      field: 'order',
      headerName: t('fields.order'),
      width: isMobile ? 60 : 80,
      minWidth: 60,
      align: 'center',
    },
    {
      field: 'createdAt',
      headerName: t('fields.createdAt'),
      width: isMobile ? 100 : 140,
      minWidth: 100,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: t('fields.actions'),
      width: isMobile ? 120 : 200,
      minWidth: 120,
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
      <Box 
        sx={{ 
          mb: 2, 
          borderBottom: 1, 
          borderColor: 'divider', 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Tabs 
          value={viewMode} 
          onChange={(_, v) => setViewMode(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minHeight: { xs: 48, sm: 72 },
              padding: { xs: '8px 12px', sm: '12px 16px' },
            },
          }}
        >
          <Tab 
            icon={<AccountTree />} 
            label={isMobile ? undefined : t('categories.treeView')} 
            value="tree" 
            iconPosition={isMobile ? 'top' : 'start'}
          />
          <Tab label={t('categories.listView')} value="list" />
        </Tabs>
        <Button
          startIcon={<Refresh />}
          onClick={() => refetch()}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          sx={{ 
            mr: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
          }}
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
        !isXs ? (
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
            height={isMobile ? 500 : 'calc(100vh - 400px)'}
            rowHeight={isMobile ? 80 : 75}
          />
        ) : (
          /* Card View - Mobile */
          <Box>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : categories.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('categories.noCategories')}
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {(categories as Category[]).map((category: Category) => {
                  const isDeleted = !!category.deletedAt;
                  
                  return (
                    <Grid key={category._id} size={{ xs: 6 }}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => handleCategoryClick(category)}
                      >
                        <CardContent sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          {/* Image and Featured Badge */}
                          <Box display="flex" alignItems="center" justifyContent="center" mb={1} position="relative">
                            <CategoryImage image={category.imageId} size={40} />
                            {category.isFeatured && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -4,
                                  right: -4,
                                  bgcolor: 'warning.main',
                                  borderRadius: '50%',
                                  p: 0.25,
                                }}
                              >
                                <Star sx={{ fontSize: 12, color: 'white' }} />
                              </Box>
                            )}
                          </Box>

                          {/* Category Name */}
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            sx={{
                              fontSize: '0.8rem',
                              textAlign: 'center',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {category.name}
                          </Typography>

                          <Divider sx={{ my: 0.5, width: '100%' }} />

                          {/* Stats */}
                          <Box display="flex" gap={0.5} flexWrap="wrap" justifyContent="center">
                            <Chip
                              label={`${category.productsCount || 0}`}
                              size="small"
                              color={category.productsCount > 0 ? 'success' : 'default'}
                              sx={{ fontSize: '0.65rem' }}
                            />
                            <Chip
                              label={category.isActive ? t('status.active') : t('status.inactive')}
                              size="small"
                              color={category.isActive ? 'success' : 'default'}
                              sx={{ fontSize: '0.65rem' }}
                            />
                          </Box>
                        </CardContent>

                        {/* Actions */}
                        <Box
                          display="flex"
                          justifyContent="center"
                          gap={0.5}
                          p={1}
                          borderTop={1}
                          borderColor="divider"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isDeleted ? (
                            <>
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
                            </>
                          ) : (
                            <>
                              <Tooltip title={t('tooltips.edit')}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(category);
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
                            </>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null, permanent: false })}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            bgcolor: 'background.paper',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            color: deleteDialog.permanent ? 'error.main' : 'text.primary',
          }}
        >
          {deleteDialog.permanent ? t('dialogs.permanentDeleteTitle') : t('dialogs.deleteTitle')}
        </DialogTitle>
        <DialogContent
          sx={{
            borderColor: 'divider',
            p: { xs: 2, sm: 3 },
          }}
        >
          {deleteDialog.category && (
            <>
              <Alert 
                severity={deleteDialog.permanent ? 'error' : 'warning'} 
                sx={{ mb: 2 }}
              >
                {deleteDialog.permanent ? (
                  <>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {t('messages.permanentDeleteWarning')}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: 'text.secondary',
                      }}
                    >
                      {t('messages.permanentDeleteDesc', { name: deleteDialog.category.name })}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {t('messages.softDeleteDesc', { name: deleteDialog.category.name }).split('.')[0]}.
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        color: 'text.secondary',
                      }}
                    >
                      {t('messages.softDeleteDesc', { name: deleteDialog.category.name }).split('.')[1]}.
                    </Typography>
                  </>
                )}
              </Alert>

              {deleteDialog.category.productsCount > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'text.primary',
                    }}
                  >
                    {t('messages.productsWarning', { count: deleteDialog.category.productsCount })}
                  </Typography>
                </Alert>
              )}

              {deleteDialog.category.childrenCount > 0 && (
                <Alert severity="info">
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'text.primary',
                    }}
                  >
                    {t('messages.subcategoriesWarning', { count: deleteDialog.category.childrenCount })}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            borderTop: 1,
            borderColor: 'divider',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            onClick={() => setDeleteDialog({ open: false, category: null, permanent: false })}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
            sx={{ 
              order: { xs: 2, sm: 1 },
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color={deleteDialog.permanent ? 'error' : 'warning'}
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
            sx={{ 
              order: { xs: 1, sm: 2 },
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {deleteDialog.permanent ? t('dialogs.permanentDelete') : t('dialogs.temporaryDelete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button - Mobile Only */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add category"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
          onClick={() => navigate('/categories/new')}
          size="medium"
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};
