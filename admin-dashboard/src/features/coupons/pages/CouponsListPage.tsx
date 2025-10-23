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
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useCoupons, useDeleteCoupon, useToggleCouponStatus } from '@/features/marketing/hooks/useMarketing';
import { BulkGenerateDialog } from '../components/BulkGenerateDialog';
import { formatDate } from '@/shared/utils/formatters';
import { toast } from 'react-hot-toast';
import type { Coupon } from '@/features/marketing/api/marketingApi';

// Type definitions for coupon types
type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
type CouponStatus = 'active' | 'inactive' | 'expired' | 'exhausted';

const couponTypeLabels: Record<CouponType, string> = {
  percentage: 'نسبة مئوية',
  fixed_amount: 'مبلغ ثابت',
  free_shipping: 'شحن مجاني',
  buy_x_get_y: 'اشتر X احصل على Y',
};

const couponVisibilityLabels: Record<string, string> = {
  public: 'عام',
  private: 'خاص',
  hidden: 'مخفي',
};

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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [bulkGenerateOpen, setBulkGenerateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
          setSnackbarMessage('تم حذف الكوبون بنجاح');
          setSnackbarOpen(true);
        },
        onError: () => {
          setSnackbarMessage('فشل في حذف الكوبون');
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
        setSnackbarMessage(`تم ${coupon.status === 'active' ? 'تعطيل' : 'تفعيل'} الكوبون بنجاح`);
        setSnackbarOpen(true);
      },
      onError: () => {
        setSnackbarMessage('فشل في تحديث حالة الكوبون');
        setSnackbarOpen(true);
      },
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ كود الكوبون');
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'كود الكوبون',
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
      headerName: 'اسم الكوبون',
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
      headerName: 'النوع',
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
      headerName: 'الخصم',
      width: 120,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        if (coupon.type === 'percentage' && coupon.discountValue) {
          return `${coupon.discountValue}%`;
        }
        if (coupon.type === 'fixed_amount' && coupon.discountValue) {
          return `${coupon.discountValue} ريال`;
        }
        if (coupon.type === 'free_shipping') {
          return 'شحن مجاني';
        }
        return '-';
      },
    },
    {
      field: 'usedCount',
      headerName: 'الاستخدامات',
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
      headerName: 'الفترة',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ fontSize: '0.85rem' }}>
          <Typography variant="body2">
            {formatDate(params.row.validFrom)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            حتى {formatDate(params.row.validUntil)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => {
        const statusLabels = {
          active: 'نشط',
          inactive: 'غير نشط',
          expired: 'منتهي',
          exhausted: 'مستهلك',
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
      headerName: 'الرؤية',
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
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const coupon = params.row as Coupon;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="تعديل">
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

            <Tooltip title="الإحصائيات">
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

            <Tooltip title={coupon.status === 'active' ? 'تعطيل' : 'تفعيل'}>
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

            <Tooltip title="حذف">
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
        title="إدارة الكوبونات"
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onAdd={() => navigate('/coupons/new')}
        addButtonText="إضافة كوبون"
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
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الكوبون "{couponToDelete?.code}"؟
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            هذا الإجراء لا يمكن التراجع عنه
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'جاري الحذف...' : 'حذف'}
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

