import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Stack,
  Tooltip,
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
} from '@mui/icons-material';
import { useEngineers, useEngineersOverviewStatistics } from '../hooks/useServices';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';

export const EngineersManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: engineersData, isLoading: isEngineersLoading, error: engineersError } = useEngineers({ search: searchTerm });
  const { data: engineersStats, isLoading: isStatsLoading, error: statsError } = useEngineersOverviewStatistics();

  const engineers = engineersData || [];
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
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
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <Engineering />
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  قائمة المهندسين
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {(engineers as any[]).length} مهندس مسجل
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={`${(engineers as any[]).filter((e: any) => e.isActive).length} نشط`} 
              color="success" 
              size="small" 
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>المهندس</TableCell>
                  <TableCell>الطلبات</TableCell>
                  <TableCell>معدل الإنجاز</TableCell>
                  <TableCell>التقييم</TableCell>
                  <TableCell>الإيرادات</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(engineers as any[]).map((engineer: any) => (
                  <TableRow key={engineer.engineerId}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {engineer.engineerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {engineer.engineerName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {engineer.engineerPhone}
                          </Typography>
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <Chip 
                              label={engineer.specialization || 'عام'} 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatNumber(engineer.totalRequests)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatNumber(engineer.completedRequests)} مكتمل
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {engineer.completionRate.toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={engineer.completionRate}
                          color={getCompletionRateColor(engineer.completionRate)}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Star 
                          sx={{ 
                            color: 'warning.main', 
                            mr: 0.5,
                            fontSize: '1rem'
                          }} 
                        />
                        <Chip
                          label={engineer.averageRating.toFixed(1)}
                          color={getRatingColor(engineer.averageRating)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {formatCurrency(engineer.totalRevenue)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={engineer.isActive ? 'نشط' : 'غير نشط'}
                        color={engineer.isActive ? 'success' : 'default'}
                        size="small"
                        icon={engineer.isActive ? <CheckCircle /> : <Cancel />}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(engineer)}
                            color="primary"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEditEngineer(engineer)}
                            color="info"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تغيير الحالة">
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(engineer)}
                            color={engineer.isActive ? 'warning' : 'success'}
                          >
                            {engineer.isActive ? <Block /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
                            <Typography variant="body2" color="textSecondary">
                              {selectedEngineer.engineerPhone}
                            </Typography>
                          </Box>
                          {selectedEngineer.engineerEmail && (
                            <Box display="flex" alignItems="center">
                              <Email sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="textSecondary">
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
                            <Typography variant="body2" color="textSecondary">
                              إجمالي الطلبات
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid  size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main">
                              {formatNumber(selectedEngineer.completedRequests)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              مكتمل
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid  size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main">
                              {selectedEngineer.averageRating.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              التقييم المتوسط
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid  size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="info.main">
                              {formatCurrency(selectedEngineer.totalRevenue)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
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
                      <Typography variant="body2" color="textSecondary" mt={1}>
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
