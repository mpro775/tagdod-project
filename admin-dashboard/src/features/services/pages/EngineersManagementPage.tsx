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
} from '@mui/material';
import {
  Engineering,
  Star,
  TrendingUp,
  Visibility,
  Phone,
  Email,
  Person,
} from '@mui/icons-material';
import { useEngineers, useEngineerStatistics } from '../hooks/useServices';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';

export const EngineersManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: engineers = [], isLoading } = useEngineers({ search: searchTerm });
  const { data: engineerStats } = useEngineerStatistics(selectedEngineer?._id || '');

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
        <Typography variant="h4" gutterBottom>
          إدارة المهندسين
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          إدارة المهندسين
        </Typography>
        <TextField
          label="البحث عن مهندس"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Engineering sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* إحصائيات سريعة */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    إجمالي المهندسين
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(engineers.length)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Engineering />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    متوسط التقييم
                  </Typography>
                  <Typography variant="h4">
                    {engineers.length > 0 
                      ? (engineers.reduce((sum, eng) => sum + eng.averageRating, 0) / engineers.length).toFixed(1)
                      : '0.0'
                    }
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Star />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    متوسط معدل الإنجاز
                  </Typography>
                  <Typography variant="h4">
                    {engineers.length > 0 
                      ? (engineers.reduce((sum, eng) => sum + eng.completionRate, 0) / engineers.length).toFixed(1)
                      : '0.0'
                    }%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(engineers.reduce((sum, eng) => sum + eng.totalRevenue, 0))}
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
          <Typography variant="h6" gutterBottom>
            قائمة المهندسين
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>المهندس</TableCell>
                  <TableCell>الطلبات</TableCell>
                  <TableCell>معدل الإنجاز</TableCell>
                  <TableCell>التقييم</TableCell>
                  <TableCell>الإيرادات</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {engineers.map((engineer) => (
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
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(engineer)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
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
                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        الإحصائيات
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary">
                              {formatNumber(selectedEngineer.totalRequests)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              إجمالي الطلبات
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main">
                              {formatNumber(selectedEngineer.completedRequests)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              مكتمل
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main">
                              {selectedEngineer.averageRating.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              التقييم المتوسط
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
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

                <Grid item xs={12}>
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
