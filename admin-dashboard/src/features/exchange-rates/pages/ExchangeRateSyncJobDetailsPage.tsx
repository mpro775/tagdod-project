import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Replay, ArrowBack } from '@mui/icons-material';
import { formatDate } from '@/shared/utils/formatters';
import { useExchangeRateSyncJob } from '../hooks/useExchangeRateSyncJob';
import { ExchangeRateSyncJob, ExchangeRateSyncJobStatus } from '../api/exchangeRatesApi';

const statusColorMap: Record<ExchangeRateSyncJobStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  pending: 'warning',
  running: 'primary',
  completed: 'success',
  failed: 'error',
  cancelled: 'default',
};

const statusLabelMap: Record<ExchangeRateSyncJobStatus, string> = {
  pending: 'قيد الانتظار',
  running: 'قيد المعالجة',
  completed: 'مكتمل',
  failed: 'فشل',
  cancelled: 'تم الإلغاء',
};

const reasonLabelMap: Record<string, string> = {
  rate_update: 'تحديث سعر الصرف',
  manual: 'تشغيل يدوي',
};

const summarizeJob = (job: ExchangeRateSyncJob) => {
  const progress = job.totalProducts
    ? Math.round(Math.min(100, (job.processedProducts / job.totalProducts) * 100))
    : 0;
  const endDate = job.completedAt || job.failedAt;
  const duration =
    job.startedAt && endDate
      ? `${formatDate(job.startedAt)} - ${formatDate(endDate)}`
      : '-';

  return { progress, duration };
};

export const ExchangeRateSyncJobDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' | 'info'; open: boolean }>({
    message: '',
    severity: 'info',
    open: false,
  });

  const { job, loading, retryingProductId, error, retryProduct, refresh } = useExchangeRateSyncJob(id);

  const { progress, duration } = useMemo(() => {
    if (!job) {
      return { progress: 0, duration: '-' };
    }
    return summarizeJob(job);
  }, [job]);

  const handleRetry = useCallback(
    async (productId: string) => {
      try {
        await retryProduct(productId);
        setSnackbar({
          open: true,
          message: 'تمت إعادة مزامنة المنتج بنجاح',
          severity: 'success',
        });
      } catch {
        setSnackbar({
          open: true,
          message: 'فشل في إعادة محاولة المزامنة لهذا المنتج',
          severity: 'error',
        });
      }
    },
    [retryProduct],
  );

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading && !job) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" gutterBottom>
            لم يتم العثور على بيانات المهمة
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            تأكد من صحة الرابط أو حاول العودة لقائمة المهام.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/exchange-rates')}>
            العودة لإعدادات أسعار الصرف
          </Button>
        </Paper>
      </Container>
    );
  }

  const jobErrors = job.errors ?? [];
  const errorCount = jobErrors.length;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" onClick={() => navigate('/exchange-rates')} sx={{ cursor: 'pointer' }}>
            أسعار الصرف
          </Link>
          <Typography color="text.primary">تفاصيل مهمة المزامنة</Typography>
        </Breadcrumbs>

        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            تفاصيل مهمة المزامنة
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              رجوع
            </Button>
            <Button
              startIcon={<Replay />}
              variant="outlined"
              onClick={() => refresh()}
            >
              تحديث البيانات
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
          {error}
        </Alert>
      )}

      <Stack spacing={{ xs: 2, sm: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: { xs: 2, sm: 3 } }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={{ xs: 2, sm: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    معلومات المهمة
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                    <Chip
                      size="small"
                      color={statusColorMap[job.status]}
                      label={statusLabelMap[job.status]}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={reasonLabelMap[job.reason] ?? job.reason}
                    />
                  </Stack>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    رقم المهمة: {job._id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    نسخة أسعار الصرف: {job.exchangeRateVersion ?? '-'}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 3 }}
                divider={<Box sx={{ width: 1, borderBottom: { xs: '1px solid', md: 'none' }, borderRight: { xs: 'none', md: '1px solid' }, borderColor: 'divider' }} />}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    الوقت
                  </Typography>
                  <Typography variant="body1">
                    {duration}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    التقدم
                  </Typography>
                  <Typography variant="body1">
                    {job.processedProducts} / {job.totalProducts || '-'} منتج ({progress}%)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المتغيرات المعالجة: {job.processedVariants} | المتغيرات الفاشلة: {job.failedVariants}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    أخطاء
                  </Typography>
                  <Typography variant="body1">
                    {errorCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    تم التشغيل بواسطة: {job.triggeredBy ?? '-'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Paper variant="outlined" sx={{ borderRadius: { xs: 2, sm: 3 } }}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              المنتجات التي واجهت أخطاء
            </Typography>
            <Typography variant="body2" color="text.secondary">
              أعد محاولة المزامنة للمنتجات المتأثرة بشكل فردي بعد معالجة سبب الخطأ
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>المنتج</TableCell>
                  <TableCell>المتغير</TableCell>
                  <TableCell>الرسالة</TableCell>
                  <TableCell>الوقت</TableCell>
                  <TableCell align="center">إعادة المحاولة</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errorCount === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box
                        sx={{
                          py: 4,
                          textAlign: 'center',
                          color: 'text.secondary',
                        }}
                      >
                        لا توجد أخطاء مسجلة لهذه المهمة.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
                {jobErrors.map((entry) => {
                  const productId = entry.productId ?? '-';
                  const variantId = entry.variantId ?? '-';
                  const isRetrying = retryingProductId === entry.productId;
                  return (
                    <TableRow key={`${entry.productId}-${entry.variantId}-${entry.occurredAt}`}>
                      <TableCell>{productId}</TableCell>
                      <TableCell>{variantId}</TableCell>
                      <TableCell>{entry.message}</TableCell>
                      <TableCell>{formatDate(entry.occurredAt)}</TableCell>
                      <TableCell align="center">
                        {entry.productId ? (
                          <Tooltip title="إعادة مزامنة هذا المنتج">
                            <span>
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleRetry(entry.productId!)}
                                disabled={isRetrying}
                              >
                                {isRetrying ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <Replay fontSize="inherit" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: (theme) => theme.zIndex.snackbar,
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Container>
  );
};

export default ExchangeRateSyncJobDetailsPage;

