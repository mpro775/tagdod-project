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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  Skeleton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  RequestQuote,
  LocationOn,
  AttachMoney,
  Search,
  FilterList,
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  Block,
  Refresh,
  Download,
  TrendingUp,
  Schedule,
  Person,
  Assignment,
} from '@mui/icons-material';
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

  const { data: offersData, isLoading: isOffersLoading } = useOffers(filters);
  const { data: statistics, isLoading: isStatisticsLoading } = useOffersStatistics();

  const offers = offersData || [];
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

  if (isLoading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              إدارة العروض
            </Typography>
            <Typography variant="body1" color="textSecondary">
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
          <Typography variant="body1" color="textSecondary">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    إجمالي العروض
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
                    {totalOffers}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    العروض المقبولة
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'success.main' }}>
                    {acceptedOffers}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    العروض المعلقة
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'warning.main' }}>
                    {pendingOffers}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    إجمالي قيمة العروض
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'info.main' }}>
                    {formatCurrency(totalValue)}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
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
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    متوسط قيمة العرض
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1, color: 'secondary.main' }}>
                    {formatCurrency(averageOffer)}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
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

      {/* الفلاتر */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            فلاتر البحث
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
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
            
            <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>حالة العرض</InputLabel>
                <Select
                  value={filters.status}
                  label="حالة العرض"
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
            
              <Grid  size={{ xs: 12, sm: 6, md: 4 }}>
              <Button
                variant="contained"
                startIcon={<FilterList />}
                fullWidth
              >
                تطبيق الفلاتر
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* جدول العروض */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                <RequestQuote />
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  قائمة العروض
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {(offers as any[]).length} عرض مسجل
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={`${(offers as any[]).filter((o: any) => o.status === 'OFFERED').length} معلق`} 
              color="warning" 
              size="small" 
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>العرض</TableCell>
                  <TableCell>المهندس</TableCell>
                  <TableCell>الطلب</TableCell>
                  <TableCell>المبلغ</TableCell>
                  <TableCell>المسافة</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>التاريخ</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(offers as any[]).map((offer: any) => (
                  <TableRow key={offer._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(offer.amount)}
                        </Typography>
                        {offer.note && (
                          <Typography variant="caption" color="textSecondary">
                            {offer.note.length > 50 
                              ? `${offer.note.substring(0, 50)}...` 
                              : offer.note
                            }
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {offer.engineer?.firstName?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {offer.engineer?.firstName} {offer.engineer?.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {offer.engineer?.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {offer.request?.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {offer.request?.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {formatCurrency(offer.amount)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationOn sx={{ mr: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {offer.distanceKm ? `${offer.distanceKm} كم` : '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={getStatusLabel(offer.status as keyof typeof statusLabels)}
                        color={getStatusColor(offer.status as keyof typeof statusColors)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(offer.createdAt)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(offer)}
                            color="primary"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            onClick={() => handleEditOffer(offer)}
                            color="info"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {offer.status === 'OFFERED' && (
                          <>
                            <Tooltip title="قبول العرض">
                              <IconButton
                                size="small"
                                onClick={() => handleAcceptOffer(offer)}
                                color="success"
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="رفض العرض">
                              <IconButton
                                size="small"
                                onClick={() => handleRejectOffer(offer)}
                                color="error"
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {offer.status !== 'CANCELLED' && (
                          <Tooltip title="إلغاء العرض">
                            <IconButton
                              size="small"
                              onClick={() => handleCancelOffer(offer)}
                              color="warning"
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
                          <Typography variant="body2" color="textSecondary">
                            قيمة العرض
                          </Typography>
                        </Box>
                      </Box>
                      {selectedOffer.note && (
                        <Box>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
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
                          <Typography variant="body2" color="textSecondary">
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
                          <Typography variant="body2" color="textSecondary">
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
