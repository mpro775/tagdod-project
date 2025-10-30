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
  Snackbar
} from '@mui/material';
import {
  Edit,
  Delete,
  ToggleOn,
  ToggleOff,
  Assessment,
  Visibility,
  VisibilityOff,
  ContentCopy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useCoupons, useDeleteCoupon, useToggleCouponStatus } from '@/features/marketing/hooks/useMarketing';
import { BulkGenerateDialog } from '../components/BulkGenerateDialog';
import { formatDate } from '@/shared/utils/formatters';
import { toast } from 'react-hot-toast';
import type { Coupon } from '@/features/marketing/api/marketingApi';
import type { TFunction } from 'i18next';

// Type definitions for coupon types
type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted';

const createCouponTypeLabels = (t: TFunction): Record<CouponType, string> => ({
  percentage: t('types.percentage', { defaultValue: 'نسبة الخصم' }),
  fixed_amount: t('types.fixed_amount', { defaultValue: 'مبلغ الخصم' }),
  free_shipping: t('types.free_shipping', { defaultValue: 'شحن مجاني' }),
  buy_x_get_y: t('types.buy_x_get_y', { defaultValue: 'شراء X والحصول على Y' }),
});

const createCouponVisibilityLabels = (t: TFunction): Record<string, string> => ({
  public: t('visibility.public', { defaultValue: 'عام' }),
  private: t('visibility.private', { defaultValue: 'خاص' }),
  hidden: t('visibility.hidden', { defaultValue: 'مخفي' } ),
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
          setSnackbarMessage(t('messages.deleteSuccess', { defaultValue: 'تم حذف الكوبون بنجاح' }));
          setSnackbarOpen(true);
        },
        onError: () => {
          setSnackbarMessage(t('messages.deleteError', { error: 'Unknown error', defaultValue: 'حدث خطأ أثناء حذف الكوبون'     }));
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
        setSnackbarMessage(t('messages.toggleSuccess', { action, defaultValue: 'تم تعطيل الكوبون بنجاح' }));
        setSnackbarOpen(true);
      },
      onError: () => {
        setSnackbarMessage(t('messages.updateError', { error: 'Unknown error', defaultValue: 'حدث خطأ أثناء تعطيل الكوبون' }));
        setSnackbarOpen(true);
      },
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('messages.copySuccess', { defaultValue: 'تم النسخ بنجاح' }));
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: t('table.columns.code', { defaultValue: 'الكود' }),
      width: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: 'primary.main',
              backgroundColor: 'primary.50',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.875rem',
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
      headerName: t('table.columns.name', { defaultValue: 'الاسم' }),
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.name}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" color="text.secondary">
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: t('table.columns.type', { defaultValue: 'النوع' }),
      width: 150,
      renderCell: (params) => (
        <Chip
          label={couponTypeLabels[params.row.type as CouponType]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'discount',
      headerName: t('table.columns.discount', { defaultValue: 'الخصم' }),
      width: 120,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        if (coupon.type === 'percentage' && coupon.discountValue) {
          return `${coupon.discountValue}%`;
        }
        if (coupon.type === 'fixed_amount' && coupon.discountValue) {
          return `$${coupon.discountValue}`;
        }
        if (coupon.type === 'free_shipping') {
          return t('messages.freeShipping', { defaultValue: 'شحن مجاني' });
        }
        return '-';
      },
    },
    {
      field: 'usedCount',
      headerName: t('table.columns.usage', { defaultValue: 'الاستخدام' }),
      width: 120,
      renderCell: (params) => (
        <Box>
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
      headerName: t('table.columns.period', { defaultValue: 'الفترة' }),
      width: 180,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.85rem' }}>
          <Typography variant="body2">
            {formatDate(params.row.validFrom)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('fields.to')} {formatDate(params.row.validUntil)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: t('table.columns.status', { defaultValue: 'الحالة' }),
      width: 120,
      renderCell: (params) => {
        const statusLabels = {
          active: t('status.active', { defaultValue: 'نشط' }  ),
          inactive: t('status.inactive', { defaultValue: 'غير نشط' }  ),
          expired: t('status.expired', { defaultValue: 'منتهي' }    ),
          exhausted: t('status.exhausted', { defaultValue: 'مستهلك' }    ),
        };
        return (
          <Chip
            label={statusLabels[params.row.status as CouponStatus]}
            color={couponStatusColors[params.row.status as CouponStatus]}
            size="small"
          />
        );
      },
    },
    {
      field: 'visibility',
      headerName: t('table.columns.visibility', { defaultValue: 'الرؤية' }),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={couponVisibilityLabels[params.row.visibility]}
          variant="outlined"
          size="small"
          icon={params.row.visibility === 'public' ? <Visibility /> : <VisibilityOff />}
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('table.columns.actions', { defaultValue: 'الإجراءات' }),
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('tooltips.edit', { defaultValue: 'تعديل' })}>
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

            <Tooltip title={t('tooltips.analytics', { defaultValue: 'التحليلات' })}>
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

            <Tooltip title={coupon.status === 'active' ? t('tooltips.deactivate', { defaultValue: 'تعطيل' }) : t('tooltips.activate', { defaultValue: 'تفعيل' })}>
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

            <Tooltip title={t('tooltips.delete', { defaultValue: 'حذف' })}>
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

  return (
    <Box>
      <DataTable
        title={t('table.title', { defaultValue: 'الكوبونات' })}
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        getRowId={(row) => (row as Coupon)._id}
        onAdd={() => navigate('/coupons/new')}
        addButtonText={t('table.addButton', { defaultValue: 'إضافة كوبون' })}
        onRowClick={(params) => {
          const row = params.row as Coupon;
          navigate(`/coupons/${row._id}`);
        }}
        height="calc(100vh - 200px)"
      />

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
      >
        <DialogTitle>{t('messages.deleteConfirmTitle', { defaultValue: 'تأكيد الحذف' })}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('messages.confirmDelete', { code: couponToDelete?.code, defaultValue: 'هل أنت متأكد من الحذف؟' })}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('messages.deleteWarning', { defaultValue: 'هذا الكوبون سيتم حذفه بشكل دائم ولا يمكن التراجع عنه' } )}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('dialogs.cancel', { defaultValue: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? t('dialogs.deleting', { defaultValue: 'جاري الحذف...' }) : t('dialogs.delete', { defaultValue: 'حذف' }  )}
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
    </Box>
  );
};

