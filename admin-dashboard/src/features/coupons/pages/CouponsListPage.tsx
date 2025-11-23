import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Divider,
  Fab,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Delete,
  ToggleOn,
  ToggleOff,
  Assessment,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Add,
  Engineering,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useCoupons, useDeleteCoupon, useToggleCouponStatus } from '@/features/marketing/hooks/useMarketing';
import { BulkGenerateDialog } from '../components/BulkGenerateDialog';
import { toast } from 'react-hot-toast';
import type { Coupon } from '@/features/marketing/api/marketingApi';
import type { TFunction } from 'i18next';

const formatDateGregorian = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Type definitions for coupon types
type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted';

const createCouponTypeLabels = (t: TFunction): Record<CouponType, string> => ({
  percentage: t('types.percentage'),
  fixed_amount: t('types.fixed_amount'),
  free_shipping: t('types.free_shipping'),
  buy_x_get_y: t('types.buy_x_get_y'),
});

const createCouponVisibilityLabels = (t: TFunction): Record<string, string> => ({
  public: t('visibility.public'),
  private: t('visibility.private'),
  hidden: t('visibility.hidden'),
});

const couponStatusColors: Record<
  CouponStatus,
  'default' | 'success' | 'error' | 'warning'
> = {
  active: 'success',
  inactive: 'default',
  expired: 'error',
  exhausted: 'warning',
};

export const CouponsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('coupons');
  const theme = useTheme();
  const { isMobile, isXs } = useBreakpoint();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [bulkGenerateOpen, setBulkGenerateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const couponTypeLabels = createCouponTypeLabels(t);
  const couponVisibilityLabels = createCouponVisibilityLabels(t);

  const { data, isLoading } = useCoupons({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const { mutate: deleteCoupon, isPending: deleting } = useDeleteCoupon();
  const { mutate: toggleStatus, isPending: toggling } = useToggleCouponStatus();

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (couponToDelete) {
      deleteCoupon(couponToDelete._id, {
        onSuccess: () => {
          setSnackbarMessage(t('messages.deleteSuccess'));
          setSnackbarOpen(true);
        },
        onError: () => {
          setSnackbarMessage(t('messages.deleteError', { error: 'Unknown error' }));
          setSnackbarOpen(true);
        },
      });
    }
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  const handleToggleStatus = (coupon: Coupon) => {
    toggleStatus(coupon._id, {
      onSuccess: () => {
        const action = coupon.status === 'active' ? t('messages.toggleDeactivate') : t('messages.toggleActivate');
        setSnackbarMessage(t('messages.toggleSuccess', { action }));
        setSnackbarOpen(true);
      },
      onError: () => {
        setSnackbarMessage(t('messages.updateError', { error: 'Unknown error' }));
        setSnackbarOpen(true);
      },
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('messages.copySuccess'));
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: t('table.columns.code'),
      width: 200,
      flex: 0.2,
      minWidth: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="flex-start" gap={1} py={1} width="100%">
          <Box
            sx={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: 'primary.main',
              backgroundColor: 'primary.50',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.875rem',
              wordBreak: 'break-word',
            }}
          >
            {params.row.code}
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode(params.row.code);
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: t('table.columns.name'),
      width: 250,
      flex: 0.3,
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ py: 1, width: '100%' }}>
          <Typography 
            variant="body2" 
            fontWeight="medium"
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: 1.4,
            }}
          >
            {params.row.name}
          </Typography>
          {params.row.description && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                display: 'block',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.4,
                mt: 0.5,
              }}
            >
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: t('table.columns.type'),
      width: 150,
      flex: 0.15,
      minWidth: 130,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Chip
            label={couponTypeLabels[params.row.type as CouponType]}
            size="small"
            variant="outlined"
          />
        </Box>
      ),
    },
    {
      field: 'discount',
      headerName: t('table.columns.discount'),
      width: 140,
      flex: 0.15,
      minWidth: 120,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        return (
          <Box sx={{ py: 1 }}>
            {coupon.type === 'percentage' && coupon.discountValue && (
              <Typography variant="body2" fontWeight="medium">
                {coupon.discountValue}%
              </Typography>
            )}
            {coupon.type === 'fixed_amount' && coupon.discountValue && (
              <Typography variant="body2" fontWeight="medium">
                ${coupon.discountValue}
              </Typography>
            )}
            {coupon.type === 'free_shipping' && (
              <Typography variant="body2" fontWeight="medium">
                {t('messages.freeShipping')}
              </Typography>
            )}
            {!coupon.discountValue && coupon.type !== 'free_shipping' && (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'usedCount',
      headerName: t('table.columns.usage'),
      width: 130,
      flex: 0.15,
      minWidth: 110,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {params.row.usedCount}
          </Typography>
          {params.row.usageLimit && (
            <Typography variant="caption" color="text.secondary">
              / {params.row.usageLimit}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'validFrom',
      headerName: t('table.columns.period'),
      width: 200,
      flex: 0.2,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ py: 1, fontSize: '0.85rem', width: '100%' }}>
          <Typography 
            variant="body2"
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: 1.4,
            }}
          >
            {formatDateGregorian(params.row.validFrom)}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              display: 'block',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: 1.4,
              mt: 0.5,
            }}
          >
            {t('fields.to')} {formatDateGregorian(params.row.validUntil)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: t('table.columns.status'),
      width: 130,
      flex: 0.15,
      minWidth: 110,
      renderCell: (params) => {
        const statusLabels = {
          active: t('status.active'),
          inactive: t('status.inactive'),
          expired: t('status.expired'),
          exhausted: t('status.exhausted'),
        };
        return (
          <Box sx={{ py: 1 }}>
            <Chip
              label={statusLabels[params.row.status as CouponStatus]}
              color={couponStatusColors[params.row.status as CouponStatus]}
              size="small"
            />
          </Box>
        );
      },
    },
    {
      field: 'visibility',
      headerName: t('table.columns.visibility'),
      width: 130,
      flex: 0.15,
      minWidth: 110,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Chip
            label={couponVisibilityLabels[params.row.visibility]}
            variant="outlined"
            size="small"
            icon={params.row.visibility === 'public' ? <Visibility /> : <VisibilityOff />}
          />
        </Box>
      ),
    },
    {
      field: 'engineer',
      headerName: t('table.columns.engineer', 'المهندس'),
      width: 150,
      flex: 0.15,
      minWidth: 130,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        if (!coupon.engineerId) {
          return (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ py: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Engineering fontSize="small" color="primary" />
            <Chip
              label={t('table.columns.engineerCoupon', 'كوبون مهندس')}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('table.columns.actions'),
      width: 200,
      flex: 0.2,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        return (
          <Box display="flex" gap={0.5} alignItems="flex-start" py={1}>
            <Tooltip title={t('tooltips.edit')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/coupons/${coupon._id}`);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltips.analytics')}>
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/coupons/${coupon._id}/analytics`);
                }}
              >
                <Assessment fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={coupon.status === 'active' ? t('tooltips.deactivate') : t('tooltips.activate')}>
              <IconButton
                size="small"
                color={coupon.status === 'active' ? 'warning' : 'success'}
                disabled={toggling}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(coupon);
                }}
              >
                {coupon.status === 'active' ? (
                  <ToggleOff fontSize="small" />
                ) : (
                  <ToggleOn fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title={t('tooltips.delete')}>
              <IconButton
                size="small"
                color="error"
                disabled={deleting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(coupon);
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

  const coupons = data?.data || [];
  
  // Filter coupons by engineer if filter is set
  const filteredCoupons = engineerFilter !== null
    ? coupons.filter((coupon: Coupon) => 
        engineerFilter ? !!coupon.engineerId : !coupon.engineerId
      )
    : coupons;

  return (
    <Box>
      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
        <Chip
          label={t('filters.all', 'الكل')}
          onClick={() => setEngineerFilter(null)}
          color={engineerFilter === null ? 'primary' : 'default'}
          variant={engineerFilter === null ? 'filled' : 'outlined'}
        />
        <Chip
          label={t('filters.engineerCoupons', 'كوبونات المهندسين')}
          onClick={() => setEngineerFilter(true)}
          color={engineerFilter === true ? 'primary' : 'default'}
          variant={engineerFilter === true ? 'filled' : 'outlined'}
          icon={<Engineering />}
        />
        <Chip
          label={t('filters.regularCoupons', 'كوبونات عادية')}
          onClick={() => setEngineerFilter(false)}
          color={engineerFilter === false ? 'primary' : 'default'}
          variant={engineerFilter === false ? 'filled' : 'outlined'}
        />
      </Box>

      {/* Desktop View */}
      {!isXs ? (
        <DataTable
          title={t('table.title')}
          columns={columns}
          rows={filteredCoupons}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          getRowId={(row) => (row as Coupon)._id}
          onAdd={() => navigate('/coupons/new')}
          addButtonText={t('table.addButton')}
          onRowClick={(params) => {
            const row = params.row as Coupon;
            navigate(`/coupons/${row._id}`);
          }}
          height="calc(100vh - 200px)"
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
              display: 'flex',
              alignItems: 'flex-start',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            },
            '& .MuiDataGrid-row': {
              maxHeight: 'none !important',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
            '& .MuiDataGrid-cellContent': {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            },
          }}
        />
      ) : (
        /* Card View - Mobile */
        <Box>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredCoupons.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('messages.noData')}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {filteredCoupons.map((coupon) => (
                <Grid key={coupon._id} size={{ xs: 6 }}>
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
                    onClick={() => navigate(`/coupons/${coupon._id}`)}
                  >
                    <CardContent sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Code */}
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            color: 'primary.main',
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(25, 118, 210, 0.15)' 
                              : 'rgba(25, 118, 210, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                          }}
                        >
                          {coupon.code}
                        </Box>
                        <Tooltip title={t('messages.copySuccess')}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(coupon.code);
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Name */}
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{
                          fontSize: '0.85rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {coupon.name}
                      </Typography>

                      <Divider sx={{ my: 0.5 }} />

                      {/* Discount */}
                      <Box>
                        {coupon.type === 'percentage' && coupon.discountValue && (
                          <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {coupon.discountValue}%
                          </Typography>
                        )}
                        {coupon.type === 'fixed_amount' && coupon.discountValue && (
                          <Typography variant="h6" color="primary.main" fontWeight="bold">
                            ${coupon.discountValue}
                          </Typography>
                        )}
                        {coupon.type === 'free_shipping' && (
                          <Chip
                            label={t('messages.freeShipping')}
                            size="small"
                            color="success"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>

                      {/* Type */}
                      <Chip
                        label={couponTypeLabels[coupon.type as CouponType]}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', width: 'fit-content' }}
                      />

                      {/* Usage */}
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          {coupon.usedCount}
                        </Typography>
                        {coupon.usageLimit && (
                          <Typography variant="caption" color="text.secondary">
                            / {coupon.usageLimit}
                          </Typography>
                        )}
                      </Box>

                      {/* Status and Visibility */}
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        <Chip
                          label={couponStatusColors[coupon.status as CouponStatus] === 'success' 
                            ? t('status.active') 
                            : coupon.status === 'expired' 
                            ? t('status.expired')
                            : coupon.status === 'exhausted'
                            ? t('status.exhausted')
                            : t('status.inactive')}
                          color={couponStatusColors[coupon.status as CouponStatus] as any}
                          size="small"
                          sx={{ fontSize: '0.65rem' }}
                        />
                        <Chip
                          label={couponVisibilityLabels[coupon.visibility]}
                          variant="outlined"
                          size="small"
                          icon={coupon.visibility === 'public' ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                          sx={{ fontSize: '0.65rem' }}
                        />
                      </Box>

                      {/* Period */}
                      <Typography variant="caption" color="text.secondary">
                        {formatDateGregorian(coupon.validFrom)} - {formatDateGregorian(coupon.validUntil)}
                      </Typography>

                      {/* Engineer Badge */}
                      {coupon.engineerId && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <Engineering fontSize="small" color="primary" />
                          <Chip
                            label={t('table.columns.engineerCoupon', 'كوبون مهندس')}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem' }}
                          />
                          {coupon.commissionRate && (
                            <Typography variant="caption" color="text.secondary">
                              ({coupon.commissionRate}%)
                            </Typography>
                          )}
                        </Box>
                      )}
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
                      <Tooltip title={t('tooltips.edit')}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/coupons/${coupon._id}`);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('tooltips.analytics')}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/coupons/${coupon._id}/analytics`);
                          }}
                        >
                          <Assessment fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={coupon.status === 'active' ? t('tooltips.deactivate') : t('tooltips.activate')}>
                        <IconButton
                          size="small"
                          color={coupon.status === 'active' ? 'warning' : 'success'}
                          disabled={toggling}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(coupon);
                          }}
                        >
                          {coupon.status === 'active' ? (
                            <ToggleOff fontSize="small" />
                          ) : (
                            <ToggleOn fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('tooltips.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(coupon);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      <BulkGenerateDialog
        open={bulkGenerateOpen}
        onClose={() => setBulkGenerateOpen(false)}
        onSuccess={() => {
          setBulkGenerateOpen(false);
          // Refresh the list
          window.location.reload();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
        <DialogTitle>{t('messages.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('messages.confirmDelete', { code: couponToDelete?.code })}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('messages.deleteWarning')}
          </Alert>
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderTop: 1,
            borderColor: 'divider',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
            sx={{ 
              order: { xs: 2, sm: 1 },
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('dialogs.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
            sx={{ 
              order: { xs: 1, sm: 2 },
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            {deleting ? t('dialogs.deleting') : t('dialogs.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Floating Action Button - Mobile Only */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add coupon"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
          onClick={() => navigate('/coupons/new')}
          size="medium"
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

