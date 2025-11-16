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
  useTheme,
  useMediaQuery,
  Divider,
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
import { 
  useOffers, 
  useOffersStatistics,
  useAcceptOffer,
  useRejectOffer,
} from '../hooks/useServices';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';

const statusColors = {
  OFFERED: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
} as const;

export const OffersManagementPage: React.FC = () => {
  const { t } = useTranslation(['services', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  
  const acceptOfferMutation = useAcceptOffer();
  const rejectOfferMutation = useRejectOffer();

  const offers = offersData?.data || [];
  const isLoading = isOffersLoading || isStatisticsLoading;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: keyof typeof statusColors) => statusColors[status];
  
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      OFFERED: t('services:offers.status.offered'),
      ACCEPTED: t('services:offers.status.accepted'),
      REJECTED: t('services:offers.status.rejected'),
      CANCELLED: t('services:offers.status.cancelled'),
    };
    return statusMap[status] || status;
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleViewDetails = (offer: any) => {
    setSelectedOffer(offer);
    setDetailsDialogOpen(true);
  };

  const handleAcceptOffer = async (offer: any) => {
    try {
      // استخدام requestId من العرض مباشرة أو من الـ populated field
      const requestId = offer.requestId || offer.request?._id;
      
      if (!requestId) {
        showSnackbar(t('services:offers.requestIdNotFound'), 'error');
        return;
      }
      
      await acceptOfferMutation.mutateAsync({
        requestId,
        offerId: offer._id,
      });
    } catch {
      // الخطأ يتم معالجته في الـ mutation
    }
  };

  const handleRejectOffer = async (offer: any) => {
    try {
      await rejectOfferMutation.mutateAsync({
        offerId: offer._id,
        reason: t('services:offers.rejectedByAdmin'),
      });
    } catch {
      // الخطأ يتم معالجته في الـ mutation
    }
  };

  // تعريف الأعمدة
  const columns: GridColDef[] = [
    {
      field: 'amount',
      headerName: t('services:offers.offer'),
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ py: 0.5 }}>
          <Typography 
            variant="body2" 
            fontWeight="medium"
            sx={{ 
              lineHeight: 1.4,
              mb: 0.25,
            }}
          >
            {formatCurrency(params.row.amount)}
          </Typography>
          {params.row.note && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
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
      headerName: t('services:offers.engineer'),
      minWidth: 180,
      flex: 1.2,
      renderCell: (params) => (
        <Box 
          display="flex" 
          alignItems="center" 
          gap={1.5}
          sx={{ 
            width: '100%',
            height: '100%',
            py: 0.5,
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, flexShrink: 0 }}>
            {params.row.engineer?.firstName?.charAt(0) || params.row.engineerId?.firstName?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              fontWeight="medium"
              sx={{ 
                lineHeight: 1.4,
                mb: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {params.row.engineer?.firstName || params.row.engineerId?.firstName || ''} {params.row.engineer?.lastName || params.row.engineerId?.lastName || ''}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.3,
                display: 'block',
              }}
            >
              {params.row.engineer?.phone || params.row.engineerId?.phone || '-'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'request',
      headerName: t('services:offers.request'),
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ py: 0.5 }}>
          <Typography 
            variant="body2" 
            fontWeight="medium"
            sx={{ 
              lineHeight: 1.4,
              mb: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {params.row.request?.title || params.row.requestId?.title || '-'}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              lineHeight: 1.3,
              display: 'block',
            }}
          >
            {params.row.request?.type || params.row.requestId?.type || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'distanceKm',
      headerName: t('services:offers.distance'),
      minWidth: 100,
      flex: 0.7,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Typography variant="body2">
            {params.row.distanceKm ? `${params.row.distanceKm} ${t('services:offers.distanceKm')}` : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: t('services:labels.status'),
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.row.status)}
          color={getStatusColor(params.row.status as keyof typeof statusColors) as any}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('services:offers.date'),
      minWidth: 120,
      flex: 0.8,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: t('services:labels.actions'),
      minWidth: 180,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('services:offers.viewDetails')}>
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
              <Tooltip title={t('services:offers.acceptOffer')}>
                <IconButton
                  size="small"
                  onClick={() => handleAcceptOffer(params.row)}
                  color="success"
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('services:offers.rejectOffer')}>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {t('services:offers.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('services:offers.subtitle')}
            </Typography>
          </Box>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid key={i} size={{ xs: 6, sm: 6, md: 2.4 }}>
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
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('services:offers.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('services:offers.subtitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<Refresh />} size="small">
            {t('services:offers.refresh')}
          </Button>
          <Button variant="contained" startIcon={<Download />} size="small">
            {t('services:offers.export')}
          </Button>
        </Stack>
      </Box>

      {/* إحصائيات سريعة */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:offers.totalOffers')}
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
                    {totalOffers}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {t('services:offers.allOffers')}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'primary.main', width: 56, height: 56 }}>
                  <RequestQuote />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:offers.acceptedOffers')}
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'success.main' }}>
                    {acceptedOffers}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {t('services:offers.accepted')}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:offers.pendingOffers')}
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'warning.main' }}>
                    {pendingOffers}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {t('services:offers.pending')}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'warning.main', width: 56, height: 56 }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:offers.totalValue')}
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'info.main' }}>
                    {formatCurrency(totalValue)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {t('services:offers.totalValueLabel')}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'info.main', width: 56, height: 56 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:offers.averageOffer')}
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'secondary.main' }}>
                    {formatCurrency(averageOffer)}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {t('services:offers.average')}
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

      {/* جدول العروض أو عرض الكاردات للشاشات الصغيرة */}
      {isMobile ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t('services:offers.listTitle')} ({offers.length} {t('services:offers.offer')} • {offers.filter((o: any) => o.status === 'OFFERED').length} {t('services:offers.pendingCount')})
          </Typography>
          <Grid container spacing={2}>
            {offers.map((offer: any) => (
              <Grid key={offer._id} size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                          {formatCurrency(offer.amount)}
                        </Typography>
                        <Chip
                          label={getStatusLabel(offer.status)}
                          color={getStatusColor(offer.status as keyof typeof statusColors) as any}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('services:offers.engineer')}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {offer.engineer?.firstName?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {offer.engineer?.firstName} {offer.engineer?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {offer.engineer?.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('services:offers.request')}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {offer.request?.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {offer.request?.type}
                      </Typography>
                    </Box>
                    
                    {offer.distanceKm && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('services:offers.distance')}
                        </Typography>
                        <Typography variant="body2">
                          {offer.distanceKm} {t('services:offers.distanceKm')}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('services:offers.date')}
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(offer.createdAt)}
                      </Typography>
                    </Box>
                    
                    {offer.note && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('services:offers.notes')}
                        </Typography>
                        <Typography variant="body2">
                          {offer.note}
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title={t('services:offers.viewDetails')}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(offer)}
                          color="primary"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {offer.status === 'OFFERED' && (
                        <>
                          <Tooltip title={t('services:offers.acceptOffer')}>
                            <IconButton
                              size="small"
                              onClick={() => handleAcceptOffer(offer)}
                              color="success"
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('services:offers.rejectOffer')}>
                            <IconButton
                              size="small"
                              onClick={() => handleRejectOffer(offer)}
                              color="error"
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {offers.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {t('messages.noData')}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <DataTable
            title={`${t('services:offers.listTitle')} (${offers.length} ${t('services:offers.offer')} • ${offers.filter((o: any) => o.status === 'OFFERED').length} ${t('services:offers.pendingCount')})`}
            columns={columns}
            rows={offers}
            loading={isOffersLoading}
            searchPlaceholder={t('services:offers.searchPlaceholder')}
            onSearch={(search) => handleFilterChange('search', search)}
            getRowId={(row: any) => row._id}
            height="calc(100vh - 450px)"
            rowHeight={90}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Box>
      )}

      {/* حوار تفاصيل العرض */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('services:offers.offerDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('services:offers.offerInfo')}
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
                            {t('services:offers.offerValue')}
                          </Typography>
                        </Box>
                      </Box>
                      {selectedOffer.note && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {t('services:offers.notes')}:
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
                        {t('services:offers.engineerInfo')}
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
                        {t('services:offers.requestInfo')}
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
            {t('services:offers.close')}
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
