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
} from '@mui/material';
import {
  Engineering,
  Star,
  TrendingUp,
  Visibility,
  Phone,
  Email,
  Refresh,
  Download,
  CheckCircle,
  Cancel,
  Edit,
  Block,
  LocationCity,
} from '@mui/icons-material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useEngineers, useEngineersOverviewStatistics } from '../hooks/useServices';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { getCityEmoji } from '@/shared/constants/yemeni-cities';

export const EngineersManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const { data: engineersData, isLoading: isEngineersLoading, error: engineersError } = useEngineers({ search: searchTerm });
  const { data: engineersStats, isLoading: isStatsLoading, error: statsError } = useEngineersOverviewStatistics();

  const engineers = engineersData?.data || [];
  const stats = engineersStats || {};
  const isLoading = isEngineersLoading || isStatsLoading;
  const hasError = engineersError || statsError;

  const handleViewDetails = (engineer: any) => {
    setSelectedEngineer(engineer);
    setDetailsDialogOpen(true);
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
      headerName: 'المهندس',
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {params.row.engineerName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.engineerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.engineerPhone}
            </Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              <Chip 
                label={params.row.specialization || 'عام'} 
                size="small" 
                color="info" 
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'totalRequests',
      headerName: 'الطلبات',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(params.row.totalRequests)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatNumber(params.row.completedRequests)} مكتمل
          </Typography>
        </Box>
      ),
    },
    {
      field: 'completionRate',
      headerName: 'معدل الإنجاز',
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
      headerName: 'المدينة',
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
      headerName: 'التقييم',
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
      headerName: 'الإيرادات',
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
      headerName: 'الحالة',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'نشط' : 'غير نشط'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
          icon={params.row.isActive ? <CheckCircle /> : <Cancel />}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="عرض التفاصيل">
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
              color="primary"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل">
            <IconButton
              size="small"
              onClick={() => handleEditEngineer(params.row)}
              color="info"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isActive ? 'إيقاف' : 'تفعيل'}>
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
            إدارة المهندسين
          </Typography>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
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

  if (hasError) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            إدارة المهندسين
          </Typography>
          <Button variant="outlined" startIcon={<Refresh />}>
            إعادة المحاولة
          </Button>
        </Box>
        <Alert severity="error">
          فشل في تحميل البيانات: {engineersError?.message || statsError?.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            إدارة المهندسين
          </Typography>
          <Typography variant="body1" color="textSecondary">
            إدارة وتتبع أداء المهندسين في النظام
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            label="البحث عن مهندس"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Engineering sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            size="small"
          />
          <Button variant="outlined" startIcon={<Refresh />} size="small">
            تحديث
          </Button>
          <Button variant="contained" startIcon={<Download />} size="small">
            تصدير
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* إحصائيات سريعة */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    إجمالي المهندسين
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    متوسط التقييم
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    متوسط معدل الإنجاز
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    إجمالي الإيرادات
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

      {/* جدول المهندسين */}
      <Box sx={{ mb: 2 }}>
        <DataTable
          title={`قائمة المهندسين (${engineers.length} مهندس • ${engineers.filter((e: any) => e.isActive).length} نشط)`}
          columns={columns}
          rows={engineers}
          loading={isEngineersLoading}
          searchPlaceholder="البحث عن مهندس..."
          onSearch={setSearchTerm}
          getRowId={(row: any) => row.engineerId}
          height="calc(100vh - 450px)"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>

      {/* حوار تفاصيل المهندس */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          تفاصيل المهندس
        </DialogTitle>
        <DialogContent>
          {selectedEngineer && (
            <Box>
              <Grid container spacing={3}>
                <Grid  size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        معلومات شخصية
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
                          {selectedEngineer.engineerEmail && (
                            <Box display="flex" alignItems="center">
                              <Email sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {selectedEngineer.engineerEmail}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid  size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        الإحصائيات
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid  size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary">
                              {formatNumber(selectedEngineer.totalRequests)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              إجمالي الطلبات
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid  size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main">
                              {formatNumber(selectedEngineer.completedRequests)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              مكتمل
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid  size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main">
                              {selectedEngineer.averageRating.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              التقييم المتوسط
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid  size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="info.main">
                              {formatCurrency(selectedEngineer.totalRevenue)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              إجمالي الإيرادات
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid  size={{ xs: 12 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        معدل الإنجاز
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="h3" color="primary" sx={{ mr: 2 }}>
                          {selectedEngineer.completionRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedEngineer.completionRate}
                          color={getCompletionRateColor(selectedEngineer.completionRate)}
                          sx={{ flexGrow: 1, height: 12, borderRadius: 6 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {selectedEngineer.completedRequests} من أصل {selectedEngineer.totalRequests} طلب
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
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper functions
const handleEditEngineer = (engineer: any) => {
  // TODO: Implement engineer edit
  console.log('Edit engineer:', engineer);
};

const handleToggleStatus = (engineer: any) => {
  // TODO: Implement toggle engineer status
  console.log('Toggle engineer status:', engineer);
};
