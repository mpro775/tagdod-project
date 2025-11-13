import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Sync, Autorenew } from '@mui/icons-material';
import { formatDate } from '@/shared/utils/formatters';
import {
  ExchangeRateSyncJob,
  ExchangeRateSyncJobStatus,
} from '../api/exchangeRatesApi';

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

interface ExchangeRateSyncSummaryProps {
  latestJob: ExchangeRateSyncJob | null;
  onTriggerSync: () => Promise<void>;
  triggering: boolean;
}

const getProgress = (job: ExchangeRateSyncJob | null): number => {
  if (!job || !job.totalProducts || job.totalProducts <= 0) {
    return 0;
  }
  const ratio = job.processedProducts / job.totalProducts;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
};

const isSyncDisabled = (job: ExchangeRateSyncJob | null, triggering: boolean): boolean => {
  if (triggering) {
    return true;
  }

  if (!job) {
    return false;
  }

  return job.status === 'pending' || job.status === 'running';
};

const ExchangeRateSyncSummary: React.FC<ExchangeRateSyncSummaryProps> = ({
  latestJob,
  onTriggerSync,
  triggering,
}) => {
  const progress = getProgress(latestJob);
  const disabled = isSyncDisabled(latestJob, triggering);

  return (
    <Card variant="outlined" sx={{ borderRadius: { xs: 2, sm: 3 } }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              مزامنة أسعار المنتجات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إعادة توليد أسعار المنتجات والمتغيرات بالاعتماد على أسعار الصرف الحالية
            </Typography>
          </Box>

          <CardActions sx={{ p: 0, flexShrink: 0 }}>
            <Tooltip
              title={
                disabled
                  ? 'يوجد مزامنة جارية حالياً'
                  : 'إعادة مزامنة الأسعار الآن'
              }
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={triggering ? <Autorenew sx={{ animation: 'spin 1.5s linear infinite' }} /> : <Sync />}
                  disabled={disabled}
                  onClick={onTriggerSync}
                  sx={{
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  إعادة مزامنة الأسعار
                </Button>
              </span>
            </Tooltip>
          </CardActions>
        </Stack>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <Stack spacing={2}>
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                حالة المزامنة الحالية:
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  color={statusColorMap[latestJob?.status ?? 'completed']}
                  label={latestJob ? statusLabelMap[latestJob.status] : 'لا توجد مهمة'}
                />
                {latestJob?.reason && (
                  <Chip size="small" variant="outlined" label={reasonLabelMap[latestJob.reason] ?? latestJob.reason} />
                )}
              </Stack>
            </Stack>

            {latestJob && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2 }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  آخر تحديث: {formatDate(latestJob.completedAt || latestJob.startedAt || latestJob.enqueuedAt)}
                </Typography>
                {latestJob.exchangeRateVersion && (
                  <Typography variant="body2" color="text.secondary">
                    نسخة أسعار الصرف: {latestJob.exchangeRateVersion}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                تقدّم المزامنة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {latestJob
                  ? `${latestJob.processedProducts} / ${latestJob.totalProducts || '-'} منتج`
                  : 'لا توجد بيانات'}
              </Typography>
            </Stack>
            <LinearProgress
              variant={latestJob ? 'determinate' : 'indeterminate'}
              value={latestJob ? progress : undefined}
              color="primary"
              sx={{ height: 10, borderRadius: 999 }}
            />
            {latestJob && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.5, sm: 2 }}
                sx={{ mt: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  المتغيرات المعالجة: {latestJob.processedVariants}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  الأخطاء: {latestJob.errors?.length ?? 0}
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateSyncSummary;

