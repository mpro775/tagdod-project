import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
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

interface ExchangeRateSyncJobsTableProps {
  jobs: ExchangeRateSyncJob[];
  loading?: boolean;
  onViewDetails?: (jobId: string) => void;
}

const ExchangeRateSyncJobsTable: React.FC<ExchangeRateSyncJobsTableProps> = ({
  jobs,
  loading = false,
  onViewDetails,
}) => {
  return (
    <Paper variant="outlined" sx={{ borderRadius: { xs: 2, sm: 3 } }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          عمليات المزامنة الأخيرة
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 2 } }}>
          متابعة حالة المهام الجارية والمهام المكتملة لمزامنة أسعار المنتجات
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>الحالة</TableCell>
              <TableCell>السبب</TableCell>
              <TableCell>البدء</TableCell>
              <TableCell>الإنهاء</TableCell>
              <TableCell align="right">التقدم</TableCell>
              <TableCell align="right">الأخطاء</TableCell>
              <TableCell align="center">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    جاري التحميل...
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box
                    sx={{
                      py: 4,
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    لا توجد عمليات مزامنة مسجلة بعد.
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {jobs.map((job) => {
              const progress =
                job.totalProducts > 0
                  ? `${job.processedProducts}/${job.totalProducts}`
                  : `${job.processedProducts}`;
              const completionDate = job.completedAt || job.failedAt || '-';
              const errorCount = job.errors?.length ?? 0;

              return (
                <TableRow key={job._id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      color={statusColorMap[job.status]}
                      label={statusLabelMap[job.status]}
                    />
                  </TableCell>
                  <TableCell>{reasonLabelMap[job.reason] ?? job.reason}</TableCell>
                  <TableCell>{job.startedAt ? formatDate(job.startedAt) : '-'}</TableCell>
                  <TableCell>{completionDate !== '-' ? formatDate(completionDate) : '-'}</TableCell>
                  <TableCell align="right">{progress}</TableCell>
                  <TableCell align="right">{errorCount}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="عرض التفاصيل">
                      <span>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => onViewDetails?.(job._id)}
                        >
                          <Visibility fontSize="inherit" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ExchangeRateSyncJobsTable;

