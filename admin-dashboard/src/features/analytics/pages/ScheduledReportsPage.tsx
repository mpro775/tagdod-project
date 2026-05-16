import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as RunIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ReportScheduleForm } from '../components/ReportScheduleForm';
import { EmptyAnalyticsState } from '../components/EmptyAnalyticsState';
import { ReportSchedule } from '../types/analytics.types';
import { useSchedules, useRunScheduleNow, usePauseSchedule, useResumeSchedule, useDeleteSchedule, useScheduleStats } from '../hooks/useAnalytics';
import { withAnalyticsErrorBoundary } from '../components/AnalyticsErrorBoundary';

export const ScheduledReportsPage = withAnalyticsErrorBoundary(function ScheduledReportsPage() {
  const { t } = useTranslation('analytics');
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openForm, setOpenForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  const [runDialog, setRunDialog] = useState<ReportSchedule | null>(null);
  const [lastResultDialog, setLastResultDialog] = useState<ReportSchedule | null>(null);

  const { data: schedulesData, isLoading, error, refetch } = useSchedules({
    page: page + 1,
    limit,
    search: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  const { data: statsData } = useScheduleStats();

  const runNowMutation = useRunScheduleNow();
  const pauseMutation = usePauseSchedule();
  const resumeMutation = useResumeSchedule();
  const deleteMutation = useDeleteSchedule();

  const handleToggle = (schedule: ReportSchedule) => {
    const id = schedule.id || schedule._id;
    if (!id) return;
    if (schedule.isActive || schedule.status === 'active') {
      pauseMutation.mutate(id);
    } else {
      resumeMutation.mutate(id);
    }
  };

  const handleDelete = (schedule: ReportSchedule) => {
    const id = schedule.id || schedule._id;
    if (!id) return;
    if (window.confirm(t('scheduledReports.deleteConfirm', 'هل أنت متأكد من حذف هذه الجدولة؟'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleRunNow = (schedule: ReportSchedule) => {
    setRunDialog(schedule);
  };

  const confirmRunNow = () => {
    const id = runDialog?.id || runDialog?._id;
    if (id) {
      runNowMutation.mutate(id);
    }
    setRunDialog(null);
  };

  const handleEdit = (schedule: ReportSchedule) => {
    setEditingSchedule(schedule);
    setOpenForm(true);
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    setEditingSchedule(null);
    queryClient.invalidateQueries({ queryKey: ['analytics', 'schedules'] });
  };

  const formatDate = (date?: Date | string | null) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('ar-SA');
    } catch {
      return '-';
    }
  };

  const schedules = Array.isArray(schedulesData?.data) ? schedulesData.data : [];

  // Compute stats from list if backend stats fail
  const total = statsData?.total ?? schedules.length;
  const active = statsData?.active ?? schedules.filter((s) => s.isActive || s.status === 'active').length;
  const paused = statsData?.inactive ?? schedules.filter((s) => s.status === 'paused' || !s.isActive).length;
  const failed = schedules.filter((s) => s.lastResult?.status === 'failed' || s.lastResult?.success === false).length;

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon />
            {t('scheduledReports.title', 'التقارير المجدولة')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {t('scheduledReports.loadError', 'تعذر تحميل الجداول')}
          </Typography>
          <Button startIcon={<RefreshIcon />} onClick={() => refetch()} variant="outlined" sx={{ mt: 2 }}>
            {t('scheduledReports.retry', 'إعادة المحاولة')}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon />
              {t('scheduledReports.title', 'التقارير المجدولة')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {t('scheduledReports.subtitle', 'إدارة وتشغيل التقارير التلقائية')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => { setEditingSchedule(null); setOpenForm(true); }}
            sx={{ bgcolor: 'white', color: '#764ba2', '&:hover': { bgcolor: '#f3f4f6' } }}
          >
            {t('scheduledReports.create', 'إنشاء جدولة')}
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('scheduledReports.total', 'إجمالي الجداول')}
                </Typography>
                <Typography variant="h5" fontWeight="bold">{total}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon color="success" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('scheduledReports.active', 'النشطة')}
                </Typography>
                <Typography variant="h5" fontWeight="bold">{active}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon color="warning" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('scheduledReports.paused', 'المتوقفة')}
                </Typography>
                <Typography variant="h5" fontWeight="bold">{paused}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ErrorIcon color="error" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('scheduledReports.failed', 'فاشلة')}
                </Typography>
                <Typography variant="h5" fontWeight="bold">{failed}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('scheduledReports.search', 'بحث...')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Tabs value={statusFilter} onChange={(_, v) => { setStatusFilter(v); setPage(0); }}>
              <Tab label={t('scheduledReports.all', 'الكل')} value="all" />
              <Tab label={t('scheduledReports.active', 'نشط')} value="active" />
              <Tab label={t('scheduledReports.inactive', 'متوقف')} value="inactive" />
            </Tabs>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" startIcon={<RefreshIcon />} onClick={() => refetch()}>
              {t('scheduledReports.refresh', 'تحديث')}
            </Button>
          </Grid>
        </Grid>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : schedules.length === 0 ? (
          <EmptyAnalyticsState
            title={t('scheduledReports.empty.title', 'لا توجد جداول')}
            description={t('scheduledReports.empty.description', 'لم يتم إنشاء أي جدولة بعد. يمكنك إنشاء جدولة جديدة من الزر بالأعلى.')}
            actionLabel={t('scheduledReports.create', 'إنشاء جدولة')}
            onAction={() => { setEditingSchedule(null); setOpenForm(true); }}
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('scheduledReports.name', 'الاسم')}</TableCell>
                  <TableCell>{t('scheduledReports.type', 'النوع')}</TableCell>
                  <TableCell>{t('scheduledReports.frequency', 'التكرار')}</TableCell>
                  <TableCell>{t('scheduledReports.status', 'الحالة')}</TableCell>
                  <TableCell>{t('scheduledReports.recipients', 'المستلمون')}</TableCell>
                  <TableCell>{t('scheduledReports.lastRun', 'آخر تشغيل')}</TableCell>
                  <TableCell>{t('scheduledReports.nextRun', 'التشغيل القادم')}</TableCell>
                  <TableCell>{t('scheduledReports.lastResult', 'آخر نتيجة')}</TableCell>
                  <TableCell align="center">{t('scheduledReports.actions', 'إجراءات')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => {
                  const scheduleId = schedule.id || schedule._id;
                  const isActive = schedule.isActive || schedule.status === 'active';

                  return (
                    <TableRow key={scheduleId || Math.random()} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {schedule.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {t('scheduledReports.reportType.' + schedule.reportType, schedule.reportType)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t('scheduledReports.frequency.' + schedule.frequency, schedule.frequency)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isActive ? t('scheduledReports.active', 'نشط') : t('scheduledReports.paused', 'متوقف')}
                          size="small"
                          color={isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {schedule.recipients?.length || 0} {t('scheduledReports.recipientCount', 'مستلم')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatDate(schedule.lastRunAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatDate(schedule.nextRunAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {schedule.lastResult ? (
                          <Chip
                            size="small"
                            color={schedule.lastResult.status === 'failed' || schedule.lastResult.success === false ? 'error' : 'success'}
                            label={
                              schedule.lastResult.status === 'failed' || schedule.lastResult.success === false
                                ? t('scheduledResults.failed', 'فاشل')
                                : t('scheduledResults.success', 'ناجح')
                            }
                            onClick={() => setLastResultDialog(schedule)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {t('scheduledReports.noLastResult', 'لم يتم التشغيل')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title={t('scheduledReports.runNow', 'تشغيل الآن')}>
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleRunNow(schedule)}
                                disabled={!scheduleId}
                              >
                                <RunIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={isActive ? t('scheduledReports.pause', 'إيقاف') : t('scheduledReports.resume', 'استئناف')}>
                            <span>
                              <IconButton
                                size="small"
                                color={isActive ? 'warning' : 'success'}
                                onClick={() => handleToggle(schedule)}
                                disabled={!scheduleId}
                              >
                                {isActive ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={t('scheduledReports.edit', 'تعديل')}>
                            <span>
                              <IconButton size="small" onClick={() => handleEdit(schedule)} disabled={!scheduleId}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={t('scheduledReports.delete', 'حذف')}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(schedule)}
                                disabled={!scheduleId}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={schedulesData?.meta?.total || 0}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
          labelRowsPerPage={t('scheduledReports.rowsPerPage', 'عدد الصفوف')}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('scheduledReports.of', 'من')} ${count}`}
        />
      </Paper>

      <ReportScheduleForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditingSchedule(null); }}
        onSuccess={handleFormSuccess}
        schedule={editingSchedule}
      />

      {/* Run Now Confirmation */}
      <Dialog open={!!runDialog} onClose={() => setRunDialog(null)}>
        <DialogTitle>{t('scheduledReports.runConfirmTitle', 'تأكيد التشغيل')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('scheduledReports.runConfirmMessage', 'هل تريد تشغيل "{{name}}" الآن؟', { name: runDialog?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunDialog(null)}>{t('scheduledReports.cancel', 'إلغاء')}</Button>
          <Button onClick={confirmRunNow} variant="contained" color="primary" disabled={runNowMutation.isPending}>
            {runNowMutation.isPending ? t('scheduledReports.running', 'جاري التشغيل...') : t('scheduledReports.runNow', 'تشغيل الآن')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Last Result Dialog */}
      <Dialog open={!!lastResultDialog} onClose={() => setLastResultDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('scheduledReports.lastResultTitle', 'آخر نتيجة')}</DialogTitle>
        <DialogContent>
          {lastResultDialog?.lastResult ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">{t('scheduledResults.status', 'الحالة')}</Typography>
                <Chip
                  size="small"
                  color={lastResultDialog.lastResult.status === 'failed' || lastResultDialog.lastResult.success === false ? 'error' : 'success'}
                  label={lastResultDialog.lastResult.status === 'failed' || lastResultDialog.lastResult.success === false
                    ? t('scheduledResults.failed', 'فاشل')
                    : t('scheduledResults.success', 'ناجح')
                  }
                />
              </Box>
              {lastResultDialog.lastResult.message && (
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('scheduledResults.message', 'الرسالة')}</Typography>
                  <Typography variant="body2">{lastResultDialog.lastResult.message}</Typography>
                </Box>
              )}
              {lastResultDialog.lastResult.generatedAt && (
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('scheduledResults.generatedAt', 'تاريخ التوليد')}</Typography>
                  <Typography variant="body2">{formatDate(lastResultDialog.lastResult.generatedAt)}</Typography>
                </Box>
              )}
              {lastResultDialog.lastResult.fileUrl && (
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('scheduledResults.fileUrl', 'رابط الملف')}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    href={lastResultDialog.lastResult.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('scheduledResults.openFile', 'فتح الملف')}
                  </Button>
                </Box>
              )}
              {lastResultDialog.lastResult.error && (
                <Box>
                  <Typography variant="body2" color="text.secondary">{t('scheduledResults.error', 'الخطأ')}</Typography>
                  <Typography variant="body2" color="error">{lastResultDialog.lastResult.error}</Typography>
                </Box>
              )}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              {t('scheduledReports.noLastResult', 'لم يتم تشغيل هذه الجدولة بعد')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLastResultDialog(null)}>{t('scheduledReports.close', 'إغلاق')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
