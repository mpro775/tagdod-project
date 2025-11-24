import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  ContentCopy,
  ToggleOn,
  ToggleOff,
  LocalOffer,
  TrendingUp,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  useEngineerCoupons,
  useEngineerCouponStats,
  useDeleteCoupon,
  useToggleCouponStatus,
} from '@/features/marketing/hooks/useMarketing';
import { useEngineerProfileAdmin } from '@/features/users/hooks/useEngineerProfileAdmin';
import { formatNumber, formatCurrency, formatDate } from '@/shared/utils/formatters';
import { toast } from 'react-hot-toast';
import type { Coupon } from '@/features/marketing/api/marketingApi';

export const EngineerCouponsPage: React.FC = () => {
  const { engineerId } = useParams<{ engineerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['services', 'coupons', 'common']);
  const theme = useTheme();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const { data: profile, isLoading: profileLoading } = useEngineerProfileAdmin(engineerId || '');
  const { data: coupons, isLoading: couponsLoading, refetch } = useEngineerCoupons(engineerId || '');
  const { data: stats, isLoading: statsLoading } = useEngineerCouponStats(engineerId || '');

  const deleteCouponMutation = useDeleteCoupon();
  const toggleStatusMutation = useToggleCouponStatus();

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (couponToDelete) {
      deleteCouponMutation.mutate(couponToDelete._id, {
        onSuccess: () => {
          toast.success(t('coupons:messages.deleteSuccess', 'تم حذف الكوبون بنجاح'));
          refetch();
          setDeleteDialogOpen(false);
          setCouponToDelete(null);
        },
        onError: () => {
          toast.error(t('coupons:messages.deleteError', 'فشل حذف الكوبون'));
        },
      });
    }
  };

  const handleToggleStatus = (coupon: Coupon) => {
    toggleStatusMutation.mutate(coupon._id, {
      onSuccess: () => {
        toast.success(
          coupon.status === 'active'
            ? t('coupons:messages.toggleDeactivate', 'تم تعطيل الكوبون')
            : t('coupons:messages.toggleActivate', 'تم تفعيل الكوبون')
        );
        refetch();
      },
      onError: () => {
        toast.error(t('coupons:messages.updateError', 'فشل تحديث حالة الكوبون'));
      },
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('coupons:messages.copySuccess', 'تم نسخ الكود'));
  };

  const handleCreateCoupon = () => {
    navigate(`/coupons/new?engineerId=${engineerId}`);
  };

  const handleEditCoupon = (couponId: string) => {
    navigate(`/coupons/${couponId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'expired':
        return 'error';
      case 'exhausted':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return t('coupons:types.percentage', 'نسبة مئوية');
      case 'fixed_amount':
        return t('coupons:types.fixed_amount', 'مبلغ ثابت');
      case 'free_shipping':
        return t('coupons:types.free_shipping', 'شحن مجاني');
      case 'buy_x_get_y':
        return t('coupons:types.buy_x_get_y', 'اشتري X واحصل على Y');
      default:
        return type;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: t('coupons:table.columns.code', 'الكود'),
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight="medium">
            {params.row.code}
          </Typography>
          <Tooltip title={t('common:actions.copy', 'نسخ')}>
            <IconButton
              size="small"
              onClick={() => handleCopyCode(params.row.code)}
              sx={{ p: 0.5 }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: t('coupons:table.columns.name', 'الاسم'),
      minWidth: 200,
      flex: 1.5,
    },
    {
      field: 'type',
      headerName: t('coupons:table.columns.type', 'النوع'),
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Chip label={getTypeLabel(params.row.type)} size="small" variant="outlined" />
      ),
    },
    {
      field: 'discountValue',
      headerName: t('coupons:table.columns.discount', 'الخصم'),
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.type === 'percentage'
            ? `${params.row.discountValue || 0}%`
            : formatCurrency(params.row.discountValue || 0)}
        </Typography>
      ),
    },
    {
      field: 'commissionRate',
      headerName: t('coupons:table.columns.commissionRate', 'نسبة العمولة'),
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={`${params.row.commissionRate || 0}%`}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'usedCount',
      headerName: t('coupons:table.columns.usedCount', 'عدد الاستخدامات'),
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatNumber(params.row.usedCount || 0)} / {params.row.usageLimit || '∞'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: t('coupons:table.columns.status', 'الحالة'),
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={
            params.row.status === 'active'
              ? t('common:status.active', 'نشط')
              : params.row.status === 'inactive'
                ? t('common:status.inactive', 'معطل')
                : params.row.status === 'expired'
                  ? t('coupons:status.expired', 'منتهي')
                  : t('coupons:status.exhausted', 'مستنفذ')
          }
          color={getStatusColor(params.row.status) as any}
          size="small"
          icon={params.row.status === 'active' ? <CheckCircle /> : <Cancel />}
        />
      ),
    },
    {
      field: 'validUntil',
      headerName: t('coupons:table.columns.validUntil', 'صالح حتى'),
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.row.validUntil)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('common:actions.title', 'الإجراءات'),
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common:actions.edit', 'تعديل')}>
            <IconButton
              size="small"
              onClick={() => handleEditCoupon(params.row._id)}
              color="primary"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              params.row.status === 'active'
                ? t('coupons:actions.deactivate', 'تعطيل')
                : t('coupons:actions.activate', 'تفعيل')
            }
          >
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(params.row)}
              color={params.row.status === 'active' ? 'warning' : 'success'}
            >
              {params.row.status === 'active' ? (
                <ToggleOff fontSize="small" />
              ) : (
                <ToggleOn fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common:actions.delete', 'حذف')}>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (profileLoading || couponsLoading || statsLoading) {
    return (
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const engineerName = profile?.userId && typeof profile.userId === 'object'
    ? `${(profile.userId as any).firstName || ''} ${(profile.userId as any).lastName || ''}`.trim() || 'المهندس'
    : 'المهندس';

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/services/engineers')}
            variant="outlined"
          >
            {t('common:actions.back', 'رجوع')}
          </Button>
          <Box>
            <Typography variant="h4" gutterBottom>
              {t('services:engineers.coupons', 'كوبونات المهندس')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {engineerName}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCoupon}
        >
          {t('services:engineers.createCoupon', 'إنشاء كوبون')}
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.totalCoupons', 'إجمالي الكوبونات')}
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(stats?.totalCoupons || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <LocalOffer />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.activeCoupons', 'كوبونات نشطة')}
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatNumber(stats?.activeCoupons || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.totalUses', 'إجمالي الاستخدامات')}
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {formatNumber(stats?.totalUses || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.totalCommission', 'إجمالي العمولات')}
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {formatCurrency(stats?.totalCommissionEarned || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Coupons Table */}
      <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          {coupons && coupons.length > 0 ? (
            <DataTable
              columns={columns}
              rows={coupons}
              loading={couponsLoading}
              getRowId={(row: any) => row._id}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              height="calc(100vh - 500px)"
            />
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('services:engineers.noCoupons', 'لا توجد كوبونات لهذا المهندس')}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('common:confirmDelete', 'تأكيد الحذف')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('coupons:messages.deleteConfirm', 'هل أنت متأكد من حذف هذا الكوبون؟')}
          </Typography>
          {couponToDelete && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {couponToDelete.code} - {couponToDelete.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteCouponMutation.isPending}
          >
            {deleteCouponMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              t('common:actions.delete', 'حذف')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

