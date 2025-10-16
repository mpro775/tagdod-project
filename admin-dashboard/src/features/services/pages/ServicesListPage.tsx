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
  Fab,
} from '@mui/material';
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
import { useServices, useUpdateServiceStatus, useCancelService, useAssignEngineer } from '../hooks/useServices';
import { formatDate, formatCurrency } from '@/shared/utils/formatters';
import type { ServiceStatus } from '../types/service.types';

const statusColors: Record<ServiceStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  OPEN: 'warning',
  OFFERS_COLLECTING: 'info',
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
    status: '',
    type: '',
    search: '',
    page: 1,
    limit: 20,
  });
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'cancel' | 'assign'>('view');

  const { data: services = [], isLoading, refetch } = useServices(filters);
  const updateStatusMutation = useUpdateServiceStatus();
  const cancelServiceMutation = useCancelService();
  const assignEngineerMutation = useAssignEngineer();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleAction = (type: 'view' | 'edit' | 'cancel' | 'assign', service: any) => {
    setSelectedService(service);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleStatusUpdate = async (status: string, note?: string) => {
    if (selectedService) {
      await updateStatusMutation.mutateAsync({
        id: selectedService._id,
        status,
        note,
      });
      setDialogOpen(false);
      refetch();
    }
  };

  const handleCancel = async (reason?: string) => {
    if (selectedService) {
      await cancelServiceMutation.mutateAsync({
        id: selectedService._id,
        reason,
      });
      setDialogOpen(false);
      refetch();
    }
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
      renderCell: (params) => (
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
        )
      ),
    },
    {
      field: 'acceptedOffer',
      headerName: 'المبلغ',
      width: 120,
      renderCell: (params) => (
        params.value ? (
          <Typography variant="body2" fontWeight="medium" color="success.main">
            {formatCurrency(params.value.amount)}
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
            -
          </Typography>
        )
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
          <IconButton
            size="small"
            onClick={() => handleAction('view', params.row)}
            color="primary"
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleAction('edit', params.row)}
            color="info"
          >
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
            <Grid item xs={12} sm={6} md={3}>
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
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={filters.status}
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
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="نوع الخدمة"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
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
                      status: '',
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
          setFilters(prev => ({ ...prev, page: model.page + 1 }));
        }}
        rowCount={services.length}
        height="calc(100vh - 300px)"
      />

      {/* حوار التفاصيل */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
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
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>معلومات الطلب</Typography>
                    <Typography><strong>العنوان:</strong> {selectedService.title}</Typography>
                    <Typography><strong>النوع:</strong> {selectedService.type}</Typography>
                    <Typography><strong>الوصف:</strong> {selectedService.description}</Typography>
                    <Typography><strong>الحالة:</strong> {statusLabels[selectedService.status as ServiceStatus]}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>معلومات العميل</Typography>
                    <Typography><strong>الاسم:</strong> {selectedService.user?.firstName} {selectedService.user?.lastName}</Typography>
                    <Typography><strong>الهاتف:</strong> {selectedService.user?.phone}</Typography>
                    <Typography><strong>البريد:</strong> {selectedService.user?.email}</Typography>
                  </Grid>
                  {selectedService.engineer && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>معلومات المهندس</Typography>
                      <Typography><strong>الاسم:</strong> {selectedService.engineer.firstName} {selectedService.engineer.lastName}</Typography>
                      <Typography><strong>الهاتف:</strong> {selectedService.engineer.phone}</Typography>
                    </Grid>
                  )}
                  {selectedService.acceptedOffer && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>معلومات العرض المقبول</Typography>
                      <Typography><strong>المبلغ:</strong> {formatCurrency(selectedService.acceptedOffer.amount)}</Typography>
                      <Typography><strong>الملاحظة:</strong> {selectedService.acceptedOffer.note}</Typography>
                    </Grid>
                  )}
                </Grid>
              )}
              
              {dialogType === 'edit' && (
                <Box>
                  <Typography variant="h6" gutterBottom>تغيير حالة الطلب</Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>الحالة الجديدة</InputLabel>
                    <Select
                      value=""
                      label="الحالة الجديدة"
                      onChange={(e) => {
                        // Handle status change
                      }}
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
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}
              
              {dialogType === 'cancel' && (
                <Box>
                  <Typography variant="h6" gutterBottom>إلغاء الطلب</Typography>
                  <TextField
                    fullWidth
                    label="سبب الإلغاء"
                    multiline
                    rows={3}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}
              
              {dialogType === 'assign' && (
                <Box>
                  <Typography variant="h6" gutterBottom>تعيين مهندس</Typography>
                  <TextField
                    fullWidth
                    label="معرف المهندس"
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="ملاحظة (اختيارية)"
                    multiline
                    rows={3}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Handle action based on dialogType
              setDialogOpen(false);
            }}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
