import React, { useState } from 'react';
import {
  Box,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
  Snackbar,
  Tooltip,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
  Pagination,
  Collapse,
  ImageList,
  ImageListItem,
  Paper,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  Cancel,
  PersonAdd,
  Refresh,
  Assignment,
  Engineering,
  AttachMoney,
  CheckCircle,
  Error,
  Warning,
  LocationCity,
  ExpandMore,
  ExpandLess,
  Image as ImageIcon,
  CalendarToday,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  useServices,
  useUpdateServiceStatus,
  useCancelService,
  useAssignEngineer,
} from '../hooks/useServices';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import type { ServiceStatus } from '../types/service.types';
import { getCityEmoji } from '@/shared/constants/yemeni-cities';
import { useTranslation } from 'react-i18next';

const statusColors: Record<ServiceStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> =
  {
    OPEN: 'warning',
    OFFERS_COLLECTING: 'default',
    ASSIGNED: 'primary',
    COMPLETED: 'success',
    RATED: 'success',
    CANCELLED: 'error',
  };

const getStatusLabel = (status: ServiceStatus, t: any): string => {
  const statusMap: Record<ServiceStatus, string> = {
    OPEN: 'open',
    OFFERS_COLLECTING: 'offersCollecting',
    ASSIGNED: 'assigned',
    COMPLETED: 'completed',
    RATED: 'rated',
    CANCELLED: 'cancelled',
  };
  return t(`status.${statusMap[status]}`, status);
};

const getServiceTypeLabel = (type: string, t: any): string => {
  const typeMap: Record<string, string> = {
    INSTALLATION: 'installation',
    MAINTENANCE: 'maintenance',
    REPAIR: 'repair',
    CONSULTATION: 'consultation',
    maintenance: 'maintenance',
    installation: 'installation',
    repair: 'repair',
    consultation: 'consultation',
  };
  const key = typeMap[type?.toUpperCase()] || type?.toLowerCase() || type;
  return t(`serviceTypes.${key}`, type);
};

const statusIcons: Record<ServiceStatus, React.ReactNode> = {
  OPEN: <Warning />,
  OFFERS_COLLECTING: <Assignment />,
  ASSIGNED: <Engineering />,
  COMPLETED: <CheckCircle />,
  RATED: <CheckCircle />,
  CANCELLED: <Error />,
};

export const ServicesListPage: React.FC = () => {
  const { t } = useTranslation('services');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filtersExpanded, setFiltersExpanded] = useState(!isMobile);
  
  // Update filtersExpanded when screen size changes
  React.useEffect(() => {
    setFiltersExpanded(!isMobile);
  }, [isMobile]);
  
  const [filters, setFilters] = useState({
    status: undefined as ServiceStatus | undefined,
    type: '',
    search: '',
    page: 1,
    limit: 20,
  });

  const [selectedService, setSelectedService] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'cancel' | 'assign'>('view');
  const [dialogData, setDialogData] = useState({
    status: '',
    note: '',
    reason: '',
    engineerId: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('success');

  const { data: servicesData, isLoading, error, refetch } = useServices(filters);
  const services = servicesData?.data || [];

  const updateStatusMutation = useUpdateServiceStatus();
  const cancelServiceMutation = useCancelService();
  const assignEngineerMutation = useAssignEngineer();

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'status' ? value || undefined : value,
      page: 1,
    }));
  };

  const handleAction = (type: 'view' | 'edit' | 'cancel' | 'assign', service: any) => {
    setSelectedService(service);
    setDialogType(type);
    setDialogData({
      status: service.status || '',
      note: '',
      reason: '',
      engineerId: '',
    });
    setDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (selectedService && dialogData.status) {
      try {
        await updateStatusMutation.mutateAsync({
          id: selectedService._id,
          status: dialogData.status,
          note: dialogData.note,
        });
        setDialogOpen(false);
        showSnackbar(
          t('messages.statusUpdated', { defaultValue: 'تم تعديل الحالة بنجاح' }),
          'success'
        );
      } catch (error: any) {
        showSnackbar(
          error.message || t('messages.errorUpdatingStatus', { defaultValue: 'فشل تعديل الحالة' }),
          'error'
        );
      }
    }
  };

  const handleCancel = async () => {
    if (selectedService) {
      if (!dialogData.reason || !dialogData.reason.trim()) {
        showSnackbar(
          t('messages.cancellationReasonRequired', { defaultValue: 'يجب إدخال سبب الإلغاء' }),
          'error'
        );
        return;
      }
      try {
        await cancelServiceMutation.mutateAsync({
          id: selectedService._id,
          reason: dialogData.reason.trim(),
        });
        setDialogOpen(false);
        showSnackbar(
          t('messages.requestCancelled', { defaultValue: 'تم إلغاء الطلب بنجاح' }),
          'success'
        );
      } catch (error: any) {
        showSnackbar(
          error.message ||
            t('messages.errorCancellingRequest', { defaultValue: 'فشل إلغاء الطلب' }),
          'error'
        );
      }
    }
  };

  const handleAssignEngineer = async () => {
    if (selectedService && dialogData.engineerId) {
      try {
        await assignEngineerMutation.mutateAsync({
          id: selectedService._id,
          engineerId: dialogData.engineerId,
          note: dialogData.note,
        });
        setDialogOpen(false);
        showSnackbar(
          t('messages.engineerAssigned', { defaultValue: 'تم تعيين مهندس بنجاح' }),
          'success'
        );
      } catch (error: any) {
        showSnackbar(
          error.message ||
            t('messages.errorAssigningEngineer', { defaultValue: 'فشل تعيين مهندس' }),
          'error'
        );
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogData({
      status: '',
      note: '',
      reason: '',
      engineerId: '',
    });
  };

  const handleDialogDataChange = (key: string, value: string) => {
    setDialogData((prev) => ({ ...prev, [key]: value }));
  };

  // Render service card for mobile view
  const renderServiceCard = (service: any) => (
    <Card
      key={service._id}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.background.paper 
          : undefined,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 1px 3px rgba(0,0,0,0.12)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 12px rgba(0,0,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Header with title and status */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <Assignment fontSize="small" />
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography 
                variant="subtitle2" 
                fontWeight="600"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  mb: 0.5,
                }}
              >
                {service.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {service.type}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={statusIcons[service.status as ServiceStatus] as React.ReactElement}
            label={getStatusLabel(service.status as ServiceStatus, t)}
            color={statusColors[service.status as ServiceStatus]}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Customer Info */}
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {t('labels.customer')}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'info.main', width: 28, height: 28 }}>
              {service.user?.firstName?.charAt(0) || '?'}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {service.user?.firstName} {service.user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {service.user?.phone}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* City */}
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {t('labels.city')}
          </Typography>
          <Chip
            icon={<LocationCity fontSize="small" />}
            label={`${getCityEmoji(service.city || 'صنعاء')} ${service.city || 'صنعاء'}`}
            size="small"
            variant="outlined"
            sx={{ height: 24 }}
          />
        </Box>

        {/* Engineer Info */}
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {t('labels.engineer')}
          </Typography>
          {service.engineer ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: 'success.main', width: 28, height: 28 }}>
                <Engineering fontSize="small" />
              </Avatar>
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {service.engineer.firstName} {service.engineer.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {service.engineer.phone}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {t('messages.unassigned')}
            </Typography>
          )}
        </Box>

        {/* Amount */}
        {service.acceptedOffer && (
          <Box mb={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {t('labels.amount')}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AttachMoney sx={{ color: 'success.main', fontSize: '1rem' }} />
              <Typography variant="body2" fontWeight="medium" color="success.main">
                {formatCurrency(service.acceptedOffer.amount)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Created Date */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            {formatDate(service.createdAt)}
          </Typography>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 0.5 }}>
        <Tooltip title={t('messages.viewDetails')}>
          <IconButton
            size="small"
            onClick={() => handleAction('view', service)}
            color="primary"
            sx={{
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(25,118,210,0.1)'
                : 'rgba(25,118,210,0.08)',
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('messages.editStatus')}>
          <IconButton
            size="small"
            onClick={() => handleAction('edit', service)}
            color="info"
            sx={{
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(33,150,243,0.1)'
                : 'rgba(33,150,243,0.08)',
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        {service.status !== 'COMPLETED' && service.status !== 'CANCELLED' && (
          <>
            <Tooltip title={t('messages.assignEngineer')}>
              <IconButton
                size="small"
                onClick={() => handleAction('assign', service)}
                color="success"
                sx={{
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(46,125,50,0.1)'
                    : 'rgba(46,125,50,0.08)',
                }}
              >
                <PersonAdd fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('messages.cancelRequest')}>
              <IconButton
                size="small"
                onClick={() => handleAction('cancel', service)}
                color="error"
                sx={{
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(211,47,47,0.1)'
                    : 'rgba(211,47,47,0.08)',
                }}
              >
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </CardActions>
    </Card>
  );

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('labels.title', { defaultValue: 'العنوان' }),
      width: 250,
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
            <Assignment fontSize="small" />
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
              {params.value}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.3,
                display: 'block',
              }}
            >
              {params.row.type}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'user',
      headerName: t('labels.customer', { defaultValue: 'العميل' }),
      width: 200,
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
          <Avatar sx={{ bgcolor: 'info.main', width: 36, height: 36, flexShrink: 0 }}>
            {params.value?.firstName?.charAt(0) || '?'}
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
              {params.value?.firstName} {params.value?.lastName}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.3,
                display: 'block',
              }}
            >
              {params.value?.phone}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'city',
      headerName: t('labels.city', { defaultValue: 'المدينة' }),
      width: 140,
      renderCell: (params) => (
        <Chip
          icon={<LocationCity />}
          label={`${getCityEmoji(params.value || 'صنعاء')} ${params.value || 'صنعاء'}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'engineer',
      headerName: t('labels.engineer', { defaultValue: 'المهندس' }),
      width: 200,
      renderCell: (params) =>
        params.value ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
              <Engineering />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {params.value.firstName} {params.value.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.value.phone}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: 'grey.300', width: 32, height: 32 }}>
              <Engineering />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {t('messages.unassigned')}
            </Typography>
          </Box>
        ),
    },
    {
      field: 'acceptedOffer',
      headerName: t('labels.amount', { defaultValue: 'المبلغ' }),
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Box display="flex" alignItems="center" gap={0.5}>
            <AttachMoney sx={{ color: 'success.main', fontSize: '1rem' }} />
            <Typography variant="body2" fontWeight="medium" color="success.main">
              {formatCurrency(params.value.amount)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      field: 'status',
      headerName: t('labels.status', { defaultValue: 'الحالة' }),
      width: 140,
      renderCell: (params) => (
        <Chip
          icon={statusIcons[params.value as ServiceStatus] as React.ReactElement}
          label={getStatusLabel(params.value as ServiceStatus, t)}
          color={statusColors[params.value as ServiceStatus]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('labels.createdAt', { defaultValue: 'تاريخ الإنشاء' }),
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: t('labels.actions', { defaultValue: 'الإجراءات' }),
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('messages.viewDetails', { defaultValue: 'عرض التفاصيل' })}>
            <IconButton
              size="small"
              onClick={() => handleAction('view', params.row)}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('messages.editStatus', { defaultValue: 'تعديل الحالة' })}>
            <IconButton size="small" onClick={() => handleAction('edit', params.row)} color="info">
              <Edit />
            </IconButton>
          </Tooltip>
          {params.row.status !== 'COMPLETED' && params.row.status !== 'CANCELLED' && (
            <>
              <Tooltip title={t('messages.assignEngineer', { defaultValue: 'تعيين مهندس' })}>
                <IconButton
                  size="small"
                  onClick={() => handleAction('assign', params.row)}
                  color="success"
                >
                  <PersonAdd />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('messages.cancelRequest', { defaultValue: 'إلغاء الطلب' })}>
                <IconButton
                  size="small"
                  onClick={() => handleAction('cancel', params.row)}
                  color="error"
                >
                  <Cancel />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <Box>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          gutterBottom
          sx={{ mb: 2 }}
        >
          {t('titles.servicesManagement')}
        </Typography>
        <Card 
          sx={{ 
            mb: 3,
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : undefined,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : undefined,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Skeleton variant="text" width={isMobile ? '60%' : '30%'} height={40} />
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="rectangular" height={56} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </CardContent>
        </Card>
        <Card
          sx={{
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : undefined,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : undefined,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Skeleton variant="rectangular" height={isMobile ? 300 : 400} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          gutterBottom
          sx={{ mb: 2 }}
        >
          {t('titles.servicesManagement')}
        </Typography>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(211,47,47,0.1)'
              : undefined,
          }}
        >
          {t('messages.failedToLoadData')}: {error.message}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<Refresh />} 
          onClick={() => refetch()}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('messages.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant={isMobile ? 'h5' : 'h4'} 
        gutterBottom
        sx={{ mb: 2 }}
      >
        {t('titles.servicesManagement')}
      </Typography>

      {/* الفلاتر */}
      <Card 
        sx={{ 
          mb: 3,
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.paper 
            : undefined,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : undefined,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: isMobile ? 1 : 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ 
              mb: filtersExpanded || !isMobile ? 2 : 0,
              cursor: isMobile ? 'pointer' : 'default',
            }}
            onClick={() => isMobile && setFiltersExpanded(!filtersExpanded)}
          >
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              sx={{ fontWeight: 600 }}
            >
              {t('filters.title')}
            </Typography>
            {isMobile && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltersExpanded(!filtersExpanded);
                }}
                sx={{
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.text.secondary 
                    : theme.palette.text.primary,
                }}
              >
                {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
          
          <Collapse in={filtersExpanded || !isMobile} timeout="auto" unmountOnExit>
            <Grid container spacing={{ xs: 2, sm: 2 }} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label={t('filters.searchLabel')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl 
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  },
                }}
              >
                <InputLabel>{t('filters.statusLabel')}</InputLabel>
                <Select
                  value={filters.status || ''}
                  label={t('filters.statusLabel')}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">
                    {t('filters.statusOptions.all')}
                  </MenuItem>
                  {Object.keys(statusColors).map((value) => (
                    <MenuItem key={value} value={value}>
                      {getStatusLabel(value as ServiceStatus, t)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label={t('filters.typeLabel')}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1}
                sx={{ width: '100%' }}
              >
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={() => refetch()}
                  fullWidth={isMobile}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {t('filters.applyFilters')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setFilters({
                      status: undefined,
                      type: '',
                      search: '',
                      page: 1,
                      limit: 20,
                    });
                    refetch();
                  }}
                  fullWidth={isMobile}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {t('filters.clearFilters')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* جدول البيانات - للشاشات الكبيرة */}
      {!isMobile && (
        <DataTable
          title={t('titles.serviceRequests')}
          columns={columns}
          rows={services}
          loading={isLoading}
          paginationModel={{ page: filters.page - 1, pageSize: filters.limit }}
          onPaginationModelChange={(model) => {
            setFilters((prev) => ({ ...prev, page: model.page + 1 }));
          }}
          getRowId={(row) => (row as any)._id}
          height="calc(100vh - 300px)"
          rowHeight={90}
        />
      )}

      {/* عرض الكاردات - للشاشات الصغيرة */}
      {isMobile && (
        <Box>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ mb: 2, fontWeight: 600 }}
          >
            {t('titles.serviceRequests')}
          </Typography>
          
          {isLoading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid key={i} size={{ xs: 6 }}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="rectangular" height={200} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : services.length === 0 ? (
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.background.paper 
                  : undefined,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {t('messages.noData') || t('labels.noData', { ns: 'common' }) || 'لا توجد بيانات متاحة'}
              </Typography>
            </Card>
          ) : (
            <>
              <Grid container spacing={2}>
                {services.map((service: any) => (
                  <Grid key={service._id} size={{ xs: 6 }}>
                    {renderServiceCard(service)}
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              {servicesData?.meta && servicesData.meta.total > filters.limit && (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center"
                  mt={3}
                  gap={2}
                  flexWrap="wrap"
                >
                  <Pagination
                    count={Math.ceil((servicesData.meta.total || 0) / filters.limit)}
                    page={filters.page}
                    onChange={(_event, value) => {
                      setFilters((prev) => ({ ...prev, page: value }));
                    }}
                    color="primary"
                    size="small"
                    showFirstButton
                    showLastButton
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t('labels.showing', { 
                      from: (filters.page - 1) * filters.limit + 1,
                      to: Math.min(filters.page * filters.limit, servicesData.meta.total || 0),
                      total: servicesData.meta.total || 0
                    })}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* حوار التفاصيل */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.background.paper 
              : undefined,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : undefined,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: isMobile ? 1 : 2,
          }}
        >
          <Typography 
            variant={isMobile ? 'h6' : 'h6'}
            sx={{
              fontSize: isMobile ? '1rem' : undefined,
            }}
          >
            {dialogType === 'view' && t('messages.viewDetails')}
            {dialogType === 'edit' && t('messages.editStatus')}
            {dialogType === 'cancel' && t('messages.cancelRequest')}
            {dialogType === 'assign' && t('messages.assignEngineer')}
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            padding: isMobile ? 2 : 3,
            '&.MuiDialogContent-root': {
              paddingTop: isMobile ? 2 : 3,
            },
          }}
        >
          {selectedService && (
            <Box>
              {dialogType === 'view' && (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {/* الصور */}
                  {selectedService.images && selectedService.images.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2,
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.05)' 
                            : 'grey.50',
                          borderRadius: 2,
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom
                          sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <ImageIcon fontSize="small" />
                          {t('labels.images', { defaultValue: 'الصور' })}
                        </Typography>
                        <ImageList 
                          cols={isMobile ? 2 : 3} 
                          gap={8}
                          sx={{ 
                            m: 0,
                            '& .MuiImageListItem-root': {
                              borderRadius: 1,
                              overflow: 'hidden',
                            },
                          }}
                        >
                          {selectedService.images.map((image: string, index: number) => (
                            <ImageListItem key={index}>
                              <img
                                src={image}
                                alt={`${selectedService.title} - ${index + 1}`}
                                loading="lazy"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                }}
                                onClick={() => window.open(image, '_blank')}
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                      </Paper>
                    </Grid>
                  )}

                  {/* تفاصيل الطلب */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'grey.50',
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom
                          sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Assignment fontSize="small" />
                          {t('messages.requestDetails')}
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('labels.title')}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedService.title}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('labels.type')}
                            </Typography>
                            <Chip
                              label={getServiceTypeLabel(selectedService.type, t)}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>

                          {selectedService.description && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {t('labels.description')}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {selectedService.description}
                              </Typography>
                            </Box>
                          )}

                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('labels.city')}
                            </Typography>
                            <Chip
                              icon={<LocationCity fontSize="small" />}
                              label={`${getCityEmoji(selectedService.city || 'صنعاء')} ${
                                selectedService.city || 'صنعاء'
                              }`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('labels.status')}
                            </Typography>
                            <Chip
                              icon={statusIcons[selectedService.status as ServiceStatus] as React.ReactElement}
                              label={getStatusLabel(selectedService.status as ServiceStatus, t)}
                              color={statusColors[selectedService.status as ServiceStatus]}
                              size="small"
                            />
                          </Box>

                          {selectedService.scheduledAt && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {t('labels.scheduledAt')}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarToday fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {formatDate(selectedService.scheduledAt)}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('labels.createdAt')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(selectedService.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* معلومات العميل */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'grey.50',
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom
                          sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }}>
                            {selectedService.user?.firstName?.charAt(0) || '?'}
                          </Avatar>
                          {t('messages.customerInfo')}
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('labels.customer')}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedService.user?.firstName} {selectedService.user?.lastName}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {t('labels.phone')}
                            </Typography>
                            <Typography variant="body2">
                              {selectedService.user?.phone}
                            </Typography>
                          </Box>

                          {selectedService.user?.email && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {t('labels.email')}
                              </Typography>
                              <Typography variant="body2">
                                {selectedService.user.email}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* معلومات المهندس */}
                  {selectedService.engineer && (
                    <Grid size={{ xs: 12 }}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.05)' 
                            : 'grey.50',
                        }}
                      >
                        <CardContent>
                          <Typography 
                            variant="subtitle1" 
                            gutterBottom
                            sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }}>
                              <Engineering fontSize="small" />
                            </Avatar>
                            {t('messages.engineerInfo')}
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {t('labels.engineer')}
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedService.engineer.firstName} {selectedService.engineer.lastName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {t('labels.phone')}
                              </Typography>
                              <Typography variant="body2">
                                {selectedService.engineer.phone}
                              </Typography>
                            </Box>
                            {selectedService.engineer.email && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  {t('labels.email')}
                                </Typography>
                                <Typography variant="body2">
                                  {selectedService.engineer.email}
                                </Typography>
                              </Box>
                            )}
                            {selectedService.engineer.jobTitle && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  {t('labels.jobTitle')}
                                </Typography>
                                <Typography variant="body2">
                                  {selectedService.engineer.jobTitle}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {/* العرض المقبول */}
                  {selectedService.acceptedOffer && (
                    <Grid size={{ xs: 12 }}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.05)' 
                            : 'grey.50',
                        }}
                      >
                        <CardContent>
                          <Typography 
                            variant="subtitle1" 
                            gutterBottom
                            sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <AttachMoney fontSize="small" color="success" />
                            {t('messages.acceptedOfferInfo')}
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {t('labels.amount')}
                              </Typography>
                              <Typography variant="h6" color="success.main" fontWeight="bold">
                                {formatCurrency(selectedService.acceptedOffer.amount)}
                              </Typography>
                            </Box>
                            {selectedService.acceptedOffer.note && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  {t('labels.note')}
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {selectedService.acceptedOffer.note}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {/* التقييم */}
                  {selectedService.rating && (
                    <Grid size={{ xs: 12 }}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.05)' 
                            : 'grey.50',
                        }}
                      >
                        <CardContent>
                          <Typography 
                            variant="subtitle1" 
                            gutterBottom
                            sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <CheckCircle fontSize="small" color="warning" />
                            {t('messages.serviceRating')}
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                {t('labels.rating')}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={`${selectedService.rating.score} / 5`}
                                  color="warning"
                                  size="small"
                                />
                              </Box>
                            </Box>
                            {selectedService.rating.comment && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  {t('labels.comment')}
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {selectedService.rating.comment}
                                </Typography>
                              </Box>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(selectedService.rating.at)}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {/* الملاحظات الإدارية */}
                  {selectedService.adminNotes && selectedService.adminNotes.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.05)' 
                            : 'grey.50',
                        }}
                      >
                        <CardContent>
                          <Typography 
                            variant="subtitle1" 
                            gutterBottom
                            sx={{ fontWeight: 600, mb: 2 }}
                          >
                            {t('messages.adminNotes')}
                          </Typography>
                          <Stack spacing={2}>
                            {selectedService.adminNotes.map((note: any, index: number) => (
                              <Paper 
                                key={index}
                                elevation={0}
                                sx={{ 
                                  p: 2, 
                                  bgcolor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255,255,255,0.08)' 
                                    : 'white', 
                                  borderRadius: 1,
                                  border: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                  {note.note}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(note.at)}
                                </Typography>
                              </Paper>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              )}

              {dialogType === 'edit' && (
                <Box>
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {t('messages.changeStatus')}
                  </Typography>
                  <FormControl 
                    fullWidth 
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                      },
                    }}
                  >
                    <InputLabel>{t('messages.newStatus')}</InputLabel>
                    <Select
                      value={dialogData.status}
                      label={t('messages.newStatus')}
                      onChange={(e) => handleDialogDataChange('status', e.target.value)}
                    >
                      {Object.keys(statusColors).map((value) => (
                        <MenuItem key={value} value={value}>
                          {getStatusLabel(value as ServiceStatus, t)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label={t('messages.optionalNote')}
                    multiline
                    rows={isMobile ? 3 : 4}
                    value={dialogData.note}
                    onChange={(e) => handleDialogDataChange('note', e.target.value)}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                      },
                    }}
                  />
                </Box>
              )}

              {dialogType === 'cancel' && (
                <Box>
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {t('messages.cancelRequest')}
                  </Typography>
                  <TextField
                    fullWidth
                    label={t('messages.cancellationReason')}
                    multiline
                    rows={isMobile ? 3 : 4}
                    value={dialogData.reason}
                    onChange={(e) => handleDialogDataChange('reason', e.target.value)}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                      },
                    }}
                  />
                </Box>
              )}

              {dialogType === 'assign' && (
                <Box>
                  <Typography 
                    variant={isMobile ? 'subtitle1' : 'h6'} 
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {t('messages.assignEngineer')}
                  </Typography>
                  <TextField
                    fullWidth
                    label={t('labels.engineerId')}
                    value={dialogData.engineerId}
                    onChange={(e) => handleDialogDataChange('engineerId', e.target.value)}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label={t('messages.optionalNote')}
                    multiline
                    rows={isMobile ? 3 : 4}
                    value={dialogData.note}
                    onChange={(e) => handleDialogDataChange('note', e.target.value)}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            padding: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column-reverse' : 'row',
            gap: isMobile ? 1 : 0,
            '& .MuiButton-root': {
              width: isMobile ? '100%' : 'auto',
              margin: isMobile ? '0 !important' : undefined,
            },
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            size={isMobile ? 'medium' : 'medium'}
            variant={isMobile ? 'outlined' : 'text'}
          >
            {t('labels.cancel')}
          </Button>
          {dialogType !== 'view' && (
            <Button
              variant="contained"
              onClick={() => {
                if (dialogType === 'edit') {
                  handleStatusUpdate();
                } else if (dialogType === 'cancel') {
                  handleCancel();
                } else if (dialogType === 'assign') {
                  handleAssignEngineer();
                }
              }}
              disabled={
                (dialogType === 'edit' && !dialogData.status) ||
                (dialogType === 'assign' && !dialogData.engineerId)
              }
              size={isMobile ? 'medium' : 'medium'}
            >
              {t('labels.save')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
