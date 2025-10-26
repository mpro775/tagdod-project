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
  Schedule,
  CheckCircle,
  Error,
  Warning,
  LocationCity,
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

const statusColors: Record<ServiceStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> =
  {
    OPEN: 'warning',
    OFFERS_COLLECTING: 'default',
    ASSIGNED: 'primary',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    RATED: 'success',
    CANCELLED: 'error',
  };

const statusLabels: Record<ServiceStatus, string> = {
  OPEN: 'مفتوح',
  OFFERS_COLLECTING: 'جمع العروض',
  ASSIGNED: 'مُعيَّن',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  RATED: 'مُقيَّم',
  CANCELLED: 'ملغي',
};

const statusIcons: Record<ServiceStatus, React.ReactNode> = {
  OPEN: <Warning />,
  OFFERS_COLLECTING: <Assignment />,
  ASSIGNED: <Engineering />,
  IN_PROGRESS: <Schedule />,
  COMPLETED: <CheckCircle />,
  RATED: <CheckCircle />,
  CANCELLED: <Error />,
};

export const ServicesListPage: React.FC = () => {
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
        showSnackbar('تم تحديث حالة الطلب بنجاح', 'success');
      } catch (error: any) {
        showSnackbar(error.message || 'فشل في تحديث حالة الطلب', 'error');
      }
    }
  };

  const handleCancel = async () => {
    if (selectedService) {
      try {
        await cancelServiceMutation.mutateAsync({
          id: selectedService._id,
          reason: dialogData.reason,
        });
        setDialogOpen(false);
        showSnackbar('تم إلغاء الطلب بنجاح', 'success');
      } catch (error: any) {
        showSnackbar(error.message || 'فشل في إلغاء الطلب', 'error');
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
        showSnackbar('تم تعيين المهندس بنجاح', 'success');
      } catch (error: any) {
        showSnackbar(error.message || 'فشل في تعيين المهندس', 'error');
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

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'عنوان الطلب',
      width: 250,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <Assignment />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.type}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'user',
      headerName: 'العميل',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
            {params.value?.firstName?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value?.firstName} {params.value?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.value?.phone}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'city',
      headerName: 'المدينة',
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
      headerName: 'المهندس',
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
              غير مُعيَّن
            </Typography>
          </Box>
        ),
    },
    {
      field: 'acceptedOffer',
      headerName: 'المبلغ',
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
      headerName: 'الحالة',
      width: 140,
      renderCell: (params) => (
        <Chip
          icon={statusIcons[params.value as ServiceStatus] as React.ReactElement}
          label={statusLabels[params.value as ServiceStatus] || params.value}
          color={statusColors[params.value as ServiceStatus]}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الطلب',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="عرض التفاصيل">
            <IconButton
              size="small"
              onClick={() => handleAction('view', params.row)}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل الحالة">
            <IconButton size="small" onClick={() => handleAction('edit', params.row)} color="info">
              <Edit />
            </IconButton>
          </Tooltip>
          {params.row.status !== 'COMPLETED' && params.row.status !== 'CANCELLED' && (
            <>
              <Tooltip title="تعيين مهندس">
                <IconButton
                  size="small"
                  onClick={() => handleAction('assign', params.row)}
                  color="success"
                >
                  <PersonAdd />
                </IconButton>
              </Tooltip>
              <Tooltip title="إلغاء الطلب">
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
        <Typography variant="h4" gutterBottom>
          إدارة الخدمات
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton variant="text" width="30%" height={40} />
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
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={400} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          إدارة الخدمات
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          فشل في تحميل البيانات: {error.message}
        </Alert>
        <Button variant="contained" startIcon={<Refresh />} onClick={() => refetch()}>
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        إدارة الخدمات
      </Typography>

      {/* الفلاتر */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            فلاتر البحث
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="البحث"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="الحالة"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">جميع الحالات</MenuItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="نوع الخدمة"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  onClick={() => refetch()}
                  fullWidth
                >
                  تطبيق الفلاتر
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
                >
                  إعادة تعيين
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* جدول البيانات */}
      <DataTable
        title="طلبات الخدمات"
        columns={columns}
        rows={services}
        loading={isLoading}
        paginationModel={{ page: filters.page - 1, pageSize: filters.limit }}
        onPaginationModelChange={(model) => {
          setFilters((prev) => ({ ...prev, page: model.page + 1 }));
        }}
        getRowId={(row) => (row as any)._id}
        height="calc(100vh - 300px)"
      />

      {/* حوار التفاصيل */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'view' && 'تفاصيل الطلب'}
          {dialogType === 'edit' && 'تعديل حالة الطلب'}
          {dialogType === 'cancel' && 'إلغاء الطلب'}
          {dialogType === 'assign' && 'تعيين مهندس'}
        </DialogTitle>
        <DialogContent>
          {selectedService && (
            <Box>
              {dialogType === 'view' && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>
                      معلومات الطلب
                    </Typography>
                    <Typography>
                      <strong>العنوان:</strong> {selectedService.title}
                    </Typography>
                    <Typography>
                      <strong>النوع:</strong> {selectedService.type}
                    </Typography>
                    <Typography>
                      <strong>الوصف:</strong> {selectedService.description}
                    </Typography>
                    <Typography>
                      <strong>المدينة:</strong>{' '}
                      <Chip
                        label={`${getCityEmoji(selectedService.city || 'صنعاء')} ${selectedService.city || 'صنعاء'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Typography>
                    <Typography>
                      <strong>الحالة:</strong>{' '}
                      {statusLabels[selectedService.status as ServiceStatus]}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>
                      معلومات العميل
                    </Typography>
                    <Typography>
                      <strong>الاسم:</strong> {selectedService.user?.firstName}{' '}
                      {selectedService.user?.lastName}
                    </Typography>
                    <Typography>
                      <strong>الهاتف:</strong> {selectedService.user?.phone}
                    </Typography>
                    <Typography>
                      <strong>البريد:</strong> {selectedService.user?.email}
                    </Typography>
                  </Grid>
                  {selectedService.engineer && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        معلومات المهندس
                      </Typography>
                      <Typography>
                        <strong>الاسم:</strong> {selectedService.engineer.firstName}{' '}
                        {selectedService.engineer.lastName}
                      </Typography>
                      <Typography>
                        <strong>الهاتف:</strong> {selectedService.engineer.phone}
                      </Typography>
                      <Typography>
                        <strong>البريد:</strong> {selectedService.engineer.email || 'غير محدد'}
                      </Typography>
                      <Typography>
                        <strong>المسمى الوظيفي:</strong>{' '}
                        {selectedService.engineer.jobTitle || 'غير محدد'}
                      </Typography>
                    </Grid>
                  )}
                  {selectedService.acceptedOffer && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        معلومات العرض المقبول
                      </Typography>
                      <Typography>
                        <strong>المبلغ:</strong>{' '}
                        {formatCurrency(selectedService.acceptedOffer.amount)}
                      </Typography>
                      <Typography>
                        <strong>الملاحظة:</strong> {selectedService.acceptedOffer.note}
                      </Typography>
                    </Grid>
                  )}
                  {selectedService.rating && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        تقييم الخدمة
                      </Typography>
                      <Typography>
                        <strong>النتيجة:</strong> {selectedService.rating.score} / 5
                      </Typography>
                      {selectedService.rating.comment && (
                        <Typography>
                          <strong>التعليق:</strong> {selectedService.rating.comment}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(selectedService.rating.at)}
                      </Typography>
                    </Grid>
                  )}
                  {selectedService.adminNotes && selectedService.adminNotes.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        ملاحظات إدارية
                      </Typography>
                      {selectedService.adminNotes.map((note: any, index: number) => (
                        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="body2">{note.note}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(note.at)}
                          </Typography>
                        </Box>
                      ))}
                    </Grid>
                  )}
                </Grid>
              )}

              {dialogType === 'edit' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    تغيير حالة الطلب
                  </Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>الحالة الجديدة</InputLabel>
                    <Select
                      value={dialogData.status}
                      label="الحالة الجديدة"
                      onChange={(e) => handleDialogDataChange('status', e.target.value)}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="ملاحظة (اختيارية)"
                    multiline
                    rows={3}
                    value={dialogData.note}
                    onChange={(e) => handleDialogDataChange('note', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}

              {dialogType === 'cancel' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    إلغاء الطلب
                  </Typography>
                  <TextField
                    fullWidth
                    label="سبب الإلغاء"
                    multiline
                    rows={3}
                    value={dialogData.reason}
                    onChange={(e) => handleDialogDataChange('reason', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}

              {dialogType === 'assign' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    تعيين مهندس
                  </Typography>
                  <TextField
                    fullWidth
                    label="معرف المهندس"
                    value={dialogData.engineerId}
                    onChange={(e) => handleDialogDataChange('engineerId', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="ملاحظة (اختيارية)"
                    multiline
                    rows={3}
                    value={dialogData.note}
                    onChange={(e) => handleDialogDataChange('note', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
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
            >
              حفظ
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
