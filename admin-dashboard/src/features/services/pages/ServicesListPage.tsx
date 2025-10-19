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
} from '@mui/material';
import toast from 'react-hot-toast';
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  Cancel,
  PersonAdd,
  Refresh,
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

  const { data: servicesData, isLoading, refetch } = useServices(filters);
  const services = servicesData?.data || [];
  const meta = servicesData?.meta;

  const updateStatusMutation = useUpdateServiceStatus();
  const cancelServiceMutation = useCancelService();
  const assignEngineerMutation = useAssignEngineer();

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
        refetch();
        toast.success('تم تحديث حالة الطلب بنجاح');
      } catch {
        toast.error('فشل في تحديث حالة الطلب');
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
        refetch();
        toast.success('تم إلغاء الطلب بنجاح');
      } catch {
        toast.error('فشل في إلغاء الطلب');
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
        refetch();
        toast.success('تم تعيين المهندس بنجاح');
      } catch {
        toast.error('فشل في تعيين المهندس');
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
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.type}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'user',
      headerName: 'العميل',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.value?.firstName} {params.value?.lastName}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.value?.phone}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'engineer',
      headerName: 'المهندس',
      width: 200,
      renderCell: (params) =>
        params.value ? (
          <Box>
            <Typography variant="body2">
              {params.value.firstName} {params.value.lastName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.value.phone}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            غير مُعيَّن
          </Typography>
        ),
    },
    {
      field: 'acceptedOffer',
      headerName: 'المبلغ',
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Typography variant="body2" fontWeight="medium" color="success.main">
            {formatCurrency(params.value.amount)}
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
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
          label={statusLabels[params.value as ServiceStatus] || params.value}
          color={statusColors[params.value as ServiceStatus]}
          size="small"
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
        <Box display="flex" gap={1}>
          <IconButton size="small" onClick={() => handleAction('view', params.row)} color="primary">
            <Visibility />
          </IconButton>
          <IconButton size="small" onClick={() => handleAction('edit', params.row)} color="info">
            <Edit />
          </IconButton>
          {params.row.status !== 'COMPLETED' && params.row.status !== 'CANCELLED' && (
            <>
              <IconButton
                size="small"
                onClick={() => handleAction('assign', params.row)}
                color="success"
              >
                <PersonAdd />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleAction('cancel', params.row)}
                color="error"
              >
                <Cancel />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
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
              <Box display="flex" gap={1}>
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
              </Box>
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
        rowCount={meta?.total || 0}
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
                      <Typography variant="caption" color="textSecondary">
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
                          <Typography variant="caption" color="textSecondary">
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
    </Box>
  );
};
