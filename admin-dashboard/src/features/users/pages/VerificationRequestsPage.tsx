import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person,
  Store,
  Description,
  Visibility,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { usePendingVerifications } from '../hooks/useUsers';
import { VerificationRequestDialog } from '../components/VerificationRequestDialog';
import type { VerificationRequest } from '../types/user.types';
import { formatDate } from '@/shared/utils/formatters';

export const VerificationRequestsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: requestsData, isLoading, error, refetch } = usePendingVerifications();
  const requests = requestsData || [];

  const handleViewDetails = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    // Refresh data after dialog closes (in case of approve/reject)
    setTimeout(() => {
      refetch();
    }, 500);
  };

  const getVerificationTypeLabel = (type: 'engineer' | 'merchant') => {
    return type === 'engineer' ? 'مهندس' : 'تاجر';
  };

  const getVerificationTypeIcon = (type: 'engineer' | 'merchant') => {
    return type === 'engineer' ? <Person /> : <Store />;
  };

  const getVerificationTypeColor = (type: 'engineer' | 'merchant') => {
    return type === 'engineer' ? 'primary' : 'secondary';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        }>
          حدث خطأ أثناء تحميل طلبات التحقق
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              طلبات التحقق قيد المراجعة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              مراجعة واعتماد طلبات التحقق للمهندسين والتجار
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            تحديث
          </Button>
        </Stack>
      </Paper>

      {/* Statistics */}
      {requests && requests.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">
                  {requests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الطلبات
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">
                  {requests.filter((r) => r.verificationType === 'engineer').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  طلبات المهندسين
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="secondary">
                  {requests.filter((r) => r.verificationType === 'merchant').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  طلبات التجار
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Requests List */}
      {!requests || requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لا توجد طلبات تحقق قيد المراجعة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            جميع الطلبات تمت مراجعتها
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {requests.map((request) => (
            <Grid item xs={12} sm={6} md={4} key={request.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Chip
                        icon={getVerificationTypeIcon(request.verificationType)}
                        label={getVerificationTypeLabel(request.verificationType)}
                        color={getVerificationTypeColor(request.verificationType) as any}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {request.createdAt ? formatDate(request.createdAt) : 'غير متوفر'}
                      </Typography>
                    </Stack>

                    {/* User Info */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {request.firstName || request.lastName
                          ? `${request.firstName || ''} ${request.lastName || ''}`.trim()
                          : 'غير متوفر'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.phone || 'غير متوفر'}
                      </Typography>
                    </Box>

                    {/* Store Name (for merchants) */}
                    {request.verificationType === 'merchant' && request.storeName && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          اسم المحل:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {request.storeName}
                        </Typography>
                      </Box>
                    )}

                    {/* File Status */}
                    <Box>
                      {request.verificationType === 'engineer' ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Description fontSize="small" color={request.cvFileUrl ? 'success' : 'error'} />
                          <Typography variant="body2" color={request.cvFileUrl ? 'success.main' : 'error.main'}>
                            {request.cvFileUrl ? 'تم رفع السيرة الذاتية' : 'لا يوجد ملف'}
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Store fontSize="small" color={request.storePhotoUrl ? 'success' : 'error'} />
                          <Typography variant="body2" color={request.storePhotoUrl ? 'success.main' : 'error.main'}>
                            {request.storePhotoUrl ? 'تم رفع صورة المحل' : 'لا توجد صورة'}
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {/* Note Preview */}
                    {request.verificationNote && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {request.verificationNote}
                        </Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(request)}
                      sx={{ mt: 'auto' }}
                    >
                      عرض التفاصيل
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog */}
      <VerificationRequestDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        request={selectedRequest}
      />
    </Box>
  );
};

