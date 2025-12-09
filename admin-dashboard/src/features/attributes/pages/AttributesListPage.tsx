import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Alert,
  Snackbar,
  Stack,
  Skeleton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
} from '@mui/material';
import { Edit, Delete, Restore, AddCircle, Add, ShoppingBag } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
import { AttributeCard } from '../components/AttributeCard';
import {
  useAttributes,
  useDeleteAttribute,
  useRestoreAttribute,
  useAttributeStats,
  useAttributeProducts,
} from '../hooks/useAttributes';
import { formatDate } from '@/shared/utils/formatters';
import { AttributeStatsCards } from '../components/AttributeStatsCards';
import AttributeFilters from '../components/AttributeFilters';
import type { Attribute, AttributeType, ListAttributesParams } from '../types/attribute.types';

// eslint-disable-next-line no-unused-vars
const getAttributeTypeLabels = (t: (key: string) => string): Record<AttributeType, string> => ({
  text: t('typeLabels.text'),
  color: t('typeLabels.color'),
});

const attributeTypeColors: Record<
  AttributeType,
  'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success'
> = {
  text: 'default',
  color: 'info',
};

export const AttributesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('attributes');
  const breakpoint = useBreakpoint();
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const [filters, setFilters] = useState<ListAttributesParams>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [productsDialog, setProductsDialog] = useState<{
    open: boolean;
    attribute: Attribute | null;
    page: number;
    pageSize: number;
    search: string;
  }>({
    open: false,
    attribute: null,
    page: 1,
    pageSize: 10,
    search: '',
  });

  const { data: attributesResponse, isLoading, refetch } = useAttributes(filters);
  const { data: stats, isLoading: statsLoading } = useAttributeStats();
  const { mutate: deleteAttribute } = useDeleteAttribute();
  const { mutate: restoreAttribute } = useRestoreAttribute();
  const activeAttributeId = productsDialog.attribute?._id || '';
  const {
    data: attributeProducts,
    isLoading: productsLoading,
  } = useAttributeProducts(activeAttributeId, {
    page: productsDialog.page,
    limit: productsDialog.pageSize,
    search: productsDialog.search,
  });

  const attributes = attributesResponse?.data || [];

  const handleFiltersChange = (newFilters: ListAttributesParams) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteAttribute(id, {
      onSuccess: () => {
        showSnackbar(t('messages.deleteSuccess', { item: t('messages.attribute') }), 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          t('messages.deleteError', {
            item: t('messages.attribute'),
            error: error instanceof Error ? error.message : t('messages.unknownError')
          }),
          'error'
        );
      },
    });
  }, [deleteAttribute, showSnackbar, t, refetch]);

  const handleRestore = useCallback((id: string) => {
    restoreAttribute(id, {
      onSuccess: () => {
        showSnackbar(t('messages.restoreSuccess', { item: t('messages.attribute') }), 'success');
        refetch();
      },
      onError: (error) => {
        showSnackbar(
          t('messages.restoreError', {
            item: t('messages.attribute'),
            error: error instanceof Error ? error.message : t('messages.unknownError')
          }),
          'error'
        );
      },
    });
  }, [restoreAttribute, showSnackbar, t, refetch]);

  const openProductsDialog = useCallback((attribute: Attribute) => {
    setProductsDialog({
      open: true,
      attribute,
      page: 1,
      pageSize: 10,
      search: '',
    });
  }, []);

  const closeProductsDialog = () => {
    setProductsDialog((prev) => ({
      ...prev,
      open: false,
      attribute: null,
    }));
  };

  const handleProductsPageChange = (_: unknown, page: number) => {
    setProductsDialog((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleProductsSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setProductsDialog((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const attributeTypeLabels = getAttributeTypeLabels(t);
  const attributeTypeColorsMemo = useMemo(() => attributeTypeColors, []);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: t('fields.name'),
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {params.row.nameEn}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: t('fields.type'),
      minWidth: 130,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={String(attributeTypeLabels[params.row.type as AttributeType])}
          color={attributeTypeColors[params.row.type as AttributeType]}
          size="small"
        />
      ),
    },
    {
      field: 'usageCount',
      headerName: t('fields.usage'),
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 0}
        </Typography>
      ),
    },
    {
      field: 'isFilterable',
      headerName: t('fields.filterable'),
      minWidth: 110,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.row.isFilterable ? (
          <Chip label={String(t('common.yes', { ns: 'common' }))} color="success" size="small" />
        ) : (
          <Chip label={String(t('common.no', { ns: 'common' }))} color="default" size="small" />
        ),
    },
    {
      field: 'isRequired',
      headerName: t('fields.required'),
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.row.isRequired ? (
          <Chip label={String(t('common.yes', { ns: 'common' }))} color="error" size="small" />
        ) : null,
    },
    {
      field: 'isActive',
      headerName: t('fields.status'),
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={String(params.row.isActive ? t('status.active') : t('status.inactive'))}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('fields.createdAt'),
      minWidth: 140,
      flex: 0.8,
      valueFormatter: (value) => formatDate(value as Date),
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.formattedValue || '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('fields.actions'),
      minWidth: 180,
      flex: 1,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const attr = params.row as Attribute;
        const isDeleted = !!attr.deletedAt;

        if (isDeleted) {
          return (
            <Tooltip title={t('tooltips.restore')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(attr._id);
                }}
              >
                <Restore fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        }

        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="عرض المنتجات المرتبطة">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  openProductsDialog(attr);
                }}
              >
                <ShoppingBag fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltips.edit')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/attributes/${attr._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltips.manageValues')}>
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/attributes/${attr._id}/values`);
                }}
              >
                <AddCircle fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltips.delete')}>
              <IconButton
                size="small"
                color="error"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const confirmed = await confirmDialog({
                      title: t('messages.deleteTitle', 'تأكيد الحذف'),
                      message: t('messages.deleteConfirm', { name: attr.name }),
                      type: 'warning',
                      confirmColor: 'error',
                    });
                    if (confirmed) {
                      handleDelete(attr._id);
                    }
                  }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [t, attributeTypeLabels, navigate, handleRestore, handleDelete, openProductsDialog]);

  // Calculate total pages for mobile pagination
  const totalPages = attributesResponse?.meta ? Math.ceil(attributesResponse.meta.total / paginationModel.pageSize) : 0;
  const linkedProducts = attributeProducts?.items || [];
  const linkedProductsMeta = attributeProducts?.meta;
  const linkedProductsTotalPages = linkedProductsMeta ? linkedProductsMeta.totalPages : 0;

  // Show full page loading state
  const isPageLoading = isLoading || statsLoading;

  if (isPageLoading) {
    return (
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 2, sm: 3 } }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={300} height={24} sx={{ display: { xs: 'none', sm: 'block' } }} />
            </Box>
            <Skeleton variant="rectangular" width={breakpoint.isMobile ? '100%' : 150} height={42} />
          </Box>
        </Box>

        {/* Statistics Cards Skeleton */}
        <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
          <AttributeStatsCards stats={undefined} isLoading={true} />
        </Box>

        {/* Filters Skeleton */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Content Skeleton */}
        {breakpoint.isMobile ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : (
          <Box>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 1 }} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 2, sm: 3 } }}>
      {/* Header Section - Responsive */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography
              variant={breakpoint.isMobile ? 'h5' : 'h4'}
              component="h1"
              gutterBottom
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
            >
              {t('attributes.title')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {t('attributes.subtitle')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/attributes/new')}
            size={breakpoint.isMobile ? 'medium' : 'large'}
            fullWidth={breakpoint.isMobile}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 'auto', sm: 120 },
            }}
          >
            {t('attributes.addNew')}
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards - Enhanced */}
      <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
        <AttributeStatsCards stats={stats} isLoading={false} />
      </Box>

      {/* Filters */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <AttributeFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          initialFilters={filters}
        />
      </Box>

      {/* Desktop View - Table */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <DataTable
          title=""
          columns={columns}
          rows={attributes}
          loading={false}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onAdd={() => navigate('/attributes/new')}
          addButtonText={t('attributes.addNew')}
          onRowClick={(params) => {
            const row = params.row as Attribute;
            navigate(`/attributes/${row._id}`);
          }}
          height={600}
          getRowId={(row) => (row as Attribute)._id}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: (theme: { palette: { mode: string } }) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
              },
            },
          }}
        />
      </Box>

      {/* Mobile/Tablet View - Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {attributes && attributes.length > 0 ? (
          <>
            <Stack spacing={2}>
              {attributes.map((attribute: Attribute) => (
                <AttributeCard
                  key={attribute._id}
                  attribute={attribute}
                  attributeTypeLabels={attributeTypeLabels}
                  attributeTypeColors={attributeTypeColorsMemo}
                  onEdit={() => navigate(`/attributes/${attribute._id}`)}
                  onDelete={async () => {
                    const confirmed = await confirmDialog({
                      title: t('messages.deleteTitle', 'تأكيد الحذف'),
                      message: t('messages.deleteConfirm', { name: attribute.name }),
                      type: 'warning',
                      confirmColor: 'error',
                    });
                    if (confirmed) {
                      handleDelete(attribute._id);
                    }
                  }}
                  onRestore={attribute.deletedAt ? () => handleRestore(attribute._id) : undefined}
                  onManageValues={() => navigate(`/attributes/${attribute._id}/values`)}
                />
              ))}
            </Stack>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <Pagination
                  count={totalPages}
                  page={paginationModel.page + 1}
                  onChange={(_, page) => {
                    setPaginationModel((prev) => ({ ...prev, page: page - 1 }));
                  }}
                  color="primary"
                  size={breakpoint.isXs ? 'small' : 'medium'}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('messages.noAttributes', { defaultValue: 'لا توجد خصائص' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('messages.noAttributesDesc', { defaultValue: 'ابدأ بإضافة خاصية جديدة' })}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Linked Products Dialog */}
      <Dialog open={productsDialog.open} onClose={closeProductsDialog} fullWidth maxWidth="md">
        <DialogTitle>
          المنتجات المرتبطة بالسمة {productsDialog.attribute?.name ? `(${productsDialog.attribute?.name})` : ''}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="بحث عن منتج"
              placeholder="اكتب اسم المنتج أو الـ slug"
              value={productsDialog.search}
              onChange={handleProductsSearchChange}
              fullWidth
              size="small"
            />

            {productsLoading ? (
              <Stack spacing={1.5}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            ) : linkedProducts.length > 0 ? (
              <Stack spacing={2}>
                {linkedProducts.map((product) => (
                  <Box
                    key={product._id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.nameEn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        slug: {product.slug}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        size="small"
                        color={product.isActive ? 'success' : 'default'}
                        label={product.isActive ? 'نشط' : 'غير نشط'}
                      />
                      <Chip size="small" label={`الحالة: ${product.status}`} />
                      <Chip
                        size="small"
                        color="info"
                        label={`متغيرات مطابقة: ${product.matchedVariantsCount ?? 0}`}
                      />
                      <Chip size="small" label={`إجمالي المتغيرات: ${product.variantsCount ?? 0}`} />
                    </Stack>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/products/${product._id}/view`)}
                    >
                      عرض المنتج
                    </Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">لا توجد منتجات مرتبطة بهذه السمة حالياً</Alert>
            )}

            {linkedProductsTotalPages > 1 && (
              <>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={linkedProductsTotalPages}
                    page={productsDialog.page}
                    onChange={handleProductsPageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProductsDialog}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Box>
  );
};
