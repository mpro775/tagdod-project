import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Stack,
  Tooltip,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Engineering,
  Star,
  TrendingUp,
  Visibility,
  Phone,
  Refresh,
  Download,
  CheckCircle,
  Cancel,
  Edit,
  Block,
  LocationCity,
  LocalOffer,
  Add,
  AttachMoney,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useEngineers, useEngineersOverviewStatistics } from '../hooks/useServices';
import { useSuspendUser, useActivateUser } from '../../users/hooks/useUsers';
import { useEngineerCoupons, useEngineerCouponStats } from '@/features/marketing/hooks/useMarketing';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { getCityEmoji } from '@/shared/constants/yemeni-cities';
import { useTranslation } from 'react-i18next';
import { EngineerCard } from '../components/EngineerCard';
import { useNavigate } from 'react-router-dom';

export const EngineersManagementPage: React.FC = () => {
  const { t } = useTranslation(['services', 'common']);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const { data: engineersData, isLoading: isEngineersLoading, error: engineersError, refetch } = useEngineers({ search: searchTerm });
  const { data: engineersStats, isLoading: isStatsLoading, error: statsError } = useEngineersOverviewStatistics();
  const suspendUserMutation = useSuspendUser();
  const activateUserMutation = useActivateUser();
  
  // Engineer coupons data
  const engineerId = selectedEngineer?.engineerId || selectedEngineer?._id;
  const { data: engineerCoupons, isLoading: couponsLoading } = useEngineerCoupons(engineerId || '');
  const { data: couponStats, isLoading: statsLoading } = useEngineerCouponStats(engineerId || '');

  const engineers = engineersData?.data || [];
  const stats = engineersStats || {};
  const isLoading = isEngineersLoading || isStatsLoading;
  const hasError = engineersError || statsError;

  const handleViewDetails = (engineer: any) => {
    setSelectedEngineer(engineer);
    setDetailsDialogOpen(true);
  };

  const handleEditEngineer = (engineer: any) => {
    // Navigate to edit page or open edit dialog
    setSelectedEngineer(engineer);
    setDetailsDialogOpen(true);
  };

  const handleToggleStatus = async (engineer: any) => {
    try {
      if (engineer.status === 'suspended' || engineer.isSuspended) {
        // Activate the engineer
        await activateUserMutation.mutateAsync(engineer._id || engineer.id);
        refetch();
      } else {
        // Suspend the engineer
        await suspendUserMutation.mutateAsync({
          id: engineer._id || engineer.id,
          data: { reason: t('services:engineers.suspendedByAdmin') },
        });
        refetch();
      }
    } catch {
      // Error handled by mutation onError
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  // تعريف الأعمدة
  const columns: GridColDef[] = [
    {
      field: 'engineerName',
      headerName: t('services:engineers.engineer'),
      minWidth: 200,
      flex: 1.5,
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
            {params.row.engineerName?.charAt(0) || '?'}
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
              {params.row.engineerName}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.3,
                mb: 0.25,
                display: 'block',
              }}
            >
              {params.row.engineerPhone}
            </Typography>
            <Box display="flex" alignItems="center" mt={0.25}>
              <Chip 
                label={params.row.specialization || t('services:engineers.general')} 
                size="small" 
                color="info" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'totalRequests',
      headerName: t('services:engineers.requests'),
      minWidth: 120,
      flex: 0.8,
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
            {formatNumber(params.row.totalRequests)}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              lineHeight: 1.3,
              display: 'block',
            }}
          >
            {formatNumber(params.row.completedRequests)} {t('services:engineers.completed')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'completionRate',
      headerName: t('services:engineers.completionRate'),
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ mr: 1 }}>
            {params.row.completionRate.toFixed(1)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={params.row.completionRate}
            color={getCompletionRateColor(params.row.completionRate) as any}
            sx={{ width: 60, height: 6, borderRadius: 3 }}
          />
        </Box>
      ),
    },
    {
      field: 'city',
      headerName: t('services:engineers.city'),
      minWidth: 130,
      flex: 0.9,
      renderCell: (params) => (
        <Chip
          icon={<LocationCity />}
          label={`${getCityEmoji(params.row.city || 'صنعاء')} ${params.row.city || 'صنعاء'}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'averageRating',
      headerName: t('services:engineers.rating'),
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Star 
            sx={{ 
              color: 'warning.main', 
              mr: 0.5,
              fontSize: '1rem'
            }} 
          />
          <Chip
            label={params.row.averageRating.toFixed(1)}
            color={getRatingColor(params.row.averageRating) as any}
            size="small"
          />
        </Box>
      ),
    },
    {
      field: 'totalRevenue',
      headerName: t('services:engineers.revenue'),
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          {formatCurrency(params.row.totalRevenue)}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: t('services:engineers.status'),
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? t('common:status.active') : t('common:status.inactive')}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
          icon={params.row.isActive ? <CheckCircle /> : <Cancel />}
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common:actions.title'),
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('common:actions.view')}>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common:actions.edit')}>
            <IconButton
              size="small"
              onClick={() => handleEditEngineer(params.row)}
              color="info"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isActive ? t('services:engineers.suspend') : t('services:engineers.activate')}>
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(params.row)}
              color={params.row.isActive ? 'warning' : 'success'}
            >
              <Block />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {t('services:engineers.title')}
          </Typography>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 6, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardContent>
            <Skeleton variant="rectangular" height={400} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {t('services:engineers.title')}
          </Typography>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()}>
            {t('common:actions.retry')}
          </Button>
        </Box>
        <Alert severity="error">
          {t('services:engineers.loadError')}: {engineersError?.message || statsError?.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        gap={{ xs: 2, sm: 0 }}
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('services:engineers.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('services:engineers.description')}
          </Typography>
        </Box>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <TextField
            label={t('services:engineers.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Engineering sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            size="small"
            fullWidth={isMobile}
          />
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            size="small"
            onClick={() => refetch()}
            fullWidth={isMobile}
          >
            {t('common:actions.refresh')}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />} 
            size="small"
            fullWidth={isMobile}
          >
            {t('common:actions.export')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* إحصائيات سريعة */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.totalEngineers')}
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber((stats as any).totalEngineers || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Engineering />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.averageRating')}
                  </Typography>
                  <Typography variant="h4">
                    {(stats as any).averageRating?.toFixed(1) || '0.0'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Star />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.averageCompletionRate')}
                  </Typography>
                  <Typography variant="h4">
                    {(stats as any).averageCompletionRate?.toFixed(1) || '0.0'}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('services:engineers.totalRevenue')}
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency((stats as any).totalRevenue || 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* جدول المهندسين / كروت المهندسين */}
      <Box sx={{ mb: 2 }}>
        {isMobile || isTablet ? (
          // عرض الكروت على الشاشات الصغيرة
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {t('services:engineers.listTitle', {
                total: engineers.length,
                active: engineers.filter((e: any) => e.isActive).length,
              })}
            </Typography>
            {engineers.length === 0 ? (
              <Alert severity="info">{t('services:engineers.noEngineers')}</Alert>
            ) : (
              <Box>
                {engineers.map((engineer: any) => (
                  <EngineerCard
                    key={engineer.engineerId || engineer._id}
                    engineer={engineer}
                    onView={handleViewDetails}
                    onEdit={handleEditEngineer}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </Box>
            )}
          </Box>
        ) : (
          // عرض الجدول على الشاشات الكبيرة
          <DataTable
            title={t('services:engineers.listTitle', {
              total: engineers.length,
              active: engineers.filter((e: any) => e.isActive).length,
            })}
            columns={columns}
            rows={engineers}
            loading={isEngineersLoading}
            searchPlaceholder={t('services:engineers.searchPlaceholder')}
            onSearch={setSearchTerm}
            getRowId={(row: any) => row.engineerId}
            rowHeight={90}
            height="calc(100vh - 450px)"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        )}
      </Box>

      {/* حوار تفاصيل المهندس */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
          },
        }}
      >
        <DialogTitle>
          {t('services:engineers.detailsTitle')}
        </DialogTitle>
        <DialogContent>
          {selectedEngineer && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('services:engineers.personalInfo')}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                          {selectedEngineer.engineerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedEngineer.engineerName}
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Phone sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {selectedEngineer.engineerPhone}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('services:engineers.statistics')}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary">
                              {formatNumber(selectedEngineer.totalRequests)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('services:engineers.totalRequests')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main">
                              {formatNumber(selectedEngineer.completedRequests)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('services:engineers.completed')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main">
                              {selectedEngineer.averageRating?.toFixed(1) || '0.0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('services:engineers.averageRating')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="info.main">
                              {formatCurrency(selectedEngineer.totalRevenue)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('services:engineers.totalRevenue')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card sx={{ bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('services:engineers.completionRate')}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="h3" color="primary" sx={{ mr: 2 }}>
                          {selectedEngineer.completionRate?.toFixed(1) || 0}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedEngineer.completionRate || 0}
                          color={getCompletionRateColor(selectedEngineer.completionRate || 0) as any}
                          sx={{ flexGrow: 1, height: 12, borderRadius: 6 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {t('services:engineers.completionDetails', {
                          completed: selectedEngineer.completedRequests,
                          total: selectedEngineer.totalRequests,
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            {t('common:actions.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
