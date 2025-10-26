import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  Skeleton,
  Snackbar,
  Button,
  Alert,
} from '@mui/material';
import {
  RequestQuote,
  Visibility,
  CheckCircle,
  Cancel,
  TrendingUp,
  Schedule,
  Person,
  Assignment,
  Refresh,
  Download,
  AttachMoney,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useOffers, useOffersStatistics } from '../hooks/useServices';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';

const statusColors = {
  OFFERED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
} as const;

const statusLabels = {
  OFFERED: 'مُقدم',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
} as const;

export const OffersManagementPage: React.FC = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const { data: offersData, isLoading: isOffersLoading } = useOffers(filters);
  const { data: statistics, isLoading: isStatisticsLoading } = useOffersStatistics();

  const offers = offersData?.data || [];
  const isLoading = isOffersLoading || isStatisticsLoading;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: keyof typeof statusColors) => statusColors[status];
  const getStatusLabel = (status: keyof typeof statusLabels) => statusLabels[status];

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleViewDetails = (offer: any) => {
    setSelectedOffer(offer);
    setDetailsDialogOpen(true);
  };

  const handleEditOffer = (offer: any) => {
    // TODO: Implement offer edit
    console.log('Edit offer:', offer);
    showSnackbar('تم فتح نموذج التعديل', 'info');
  };

  const handleAcceptOffer = (offer: any) => {
    // TODO: Implement accept offer
    console.log('Accept offer:', offer);
    showSnackbar('تم قبول العرض بنجاح', 'success');
  };

  const handleRejectOffer = (offer: any) => {
    // TODO: Implement reject offer
    console.log('Reject offer:', offer);
    showSnackbar('تم رفض العرض', 'warning');
  };

  const handleCancelOffer = (offer: any) => {
    // TODO: Implement cancel offer
    console.log('Cancel offer:', offer);
    showSnackbar('تم إلغاء العرض', 'info');
  };

  // تعريف الأعمدة
  const columns: GridColDef[] = [
    {
      field: 'amount',
      headerName: 'العرض',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(params.row.amount)}
          </Typography>
          {params.row.note && (
            <Typography variant="caption" color="text.secondary">
              {params.row.note.length > 50 
                ? `${params.row.note.substring(0, 50)}...` 
                : params.row.note
              }
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'engineer',
      headerName: 'المهندس',
      minWidth: 180,
      flex: 1.2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}>
            {params.row.engineer?.firstName?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.engineer?.firstName} {params.row.engineer?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.engineer?.phone}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'request',
      headerName: 'الطلب',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.request?.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.request?.type}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'distanceKm',
      headerName: 'المسافة',
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Typography variant="body2">
            {params.row.distanceKm ? `${params.row.distanceKm} كم` : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.row.status as keyof typeof statusLabels)}
          color={getStatusColor(params.row.status as keyof typeof statusColors) as any}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'التاريخ',
      minWidth: 120,
      flex: 0.8,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      minWidth: 180,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="عرض التفاصيل">
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
              color="primary"
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'OFFERED' && (
            <>
              <Tooltip title="قبول العرض">
                <IconButton
                  size="small"
                  onClick={() => handleAcceptOffer(params.row)}
                  color="success"
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="رفض العرض">
                <IconButton
                  size="small"
                  onClick={() => handleRejectOffer(params.row)}
                  color="error"
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              إدارة العروض
            </Typography>
            <Typography variant="body1" color="text.secondary">
              إدارة وتتبع عروض المهندسين
            </Typography>
          </Box>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={400} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  // إحصائيات من الباك ايند
  const totalOffers = (statistics as any)?.totalOffers || 0;
  const acceptedOffers = (statistics as any)?.acceptedOffers || 0;
  const pendingOffers = (statistics as any)?.pendingOffers || 0;
  const totalValue = (statistics as any)?.totalValue || 0;
  const averageOffer = (statistics as any)?.averageOffer || 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            إدارة العروض
          </Typography>
          <Typography variant="body1" color="text.secondary">
            إدارة وتتبع عروض المهندسين
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} size="small">
            تحديث
          </Button>
          <Button variant="contained" startIcon={<Download />} size="small">
            تصدير
          </Button>
        </Stack>
      </Box>

      {/* إحصائيات سريعة */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    إجمالي العروض
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
                    {totalOffers}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    جميع العروض
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'primary.main', width: 56, height: 56 }}>
                  <RequestQuote />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    العروض المقبولة
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'success.main' }}>
                    {acceptedOffers}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    تم قبولها
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    العروض المعلقة
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'warning.main' }}>
                    {pendingOffers}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    في الانتظار
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'warning.main', width: 56, height: 56 }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    إجمالي قيمة العروض
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'info.main' }}>
                    {formatCurrency(totalValue)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    القيمة الإجمالية
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'info.main', width: 56, height: 56 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    متوسط قيمة العرض
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'secondary.main' }}>
                    {formatCurrency(averageOffer)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    المتوسط
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'secondary.main', width: 56, height: 56 }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* جدول العروض */}
      <Box sx={{ mb: 2 }}>
        <DataTable
          title={`قائمة العروض (${offers.length} عرض • ${offers.filter((o: any) => o.status === 'OFFERED').length} معلق)`}
          columns={columns}
          rows={offers}
          loading={isOffersLoading}
          searchPlaceholder="البحث في العروض..."
          onSearch={(search) => handleFilterChange('search', search)}
          getRowId={(row: any) => row._id}
          height="calc(100vh - 450px)"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>

      {/* حوار تفاصيل العرض */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          تفاصيل العرض
        </DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        معلومات العرض
                      </Typography>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                          <RequestQuote />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {formatCurrency(selectedOffer.amount)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            قيمة العرض
                          </Typography>
                        </Box>
                      </Box>
                      {selectedOffer.note && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            ملاحظات:
                          </Typography>
                          <Typography variant="body2">
                            {selectedOffer.note}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        معلومات المهندس
                      </Typography>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedOffer.engineer?.firstName} {selectedOffer.engineer?.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedOffer.engineer?.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        معلومات الطلب
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'info.main', width: 56, height: 56 }}>
                          <Assignment />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedOffer.request?.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedOffer.request?.type}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar للتنبيهات */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
