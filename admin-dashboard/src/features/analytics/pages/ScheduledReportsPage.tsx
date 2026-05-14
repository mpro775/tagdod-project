import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { analyticsApi } from '../api/analyticsApi';
import { ReportScheduleForm } from '../components/ReportScheduleForm';
import {
  ScheduleFrequency,
  ReportSchedule,
} from '../types/analytics.types';

const frequencyLabels: Record<ScheduleFrequency, string> = {
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
  quarterly: 'ربع سنوي',
};

const reportTypeLabels: Record<string, string> = {
  daily_report: 'ملخص يومي',
  weekly_report: 'تقرير أسبوعي',
  monthly_report: 'تقرير شهري',
  quarterly_report: 'تقرير ربع سنوي',
  yearly_report: 'تقرير سنوي',
  custom_report: 'تقرير مخصص',
};

export const ScheduledReportsPage: React.FC = () => {
  const { t } = useTranslation('analytics');
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openForm, setOpenForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  const [runDialog, setRunDialog] = useState<ReportSchedule | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['schedules', page, limit, search, statusFilter],
    queryFn: () =>
      analyticsApi.listSchedules({
        page: page + 1,
        limit,
        search: search || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      analyticsApi.toggleSchedule(id, isActive),
    onSuccess: () => {
      toast.success('تم تحديث الحالة');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: () => toast.error('فشل في تحديث الحالة'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => analyticsApi.deleteSchedule(id),
    onSuccess: () => {
      toast.success('تم حذف الجدولة');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: () => toast.error('فشل في حذف الجدولة'),
  });

  const runNowMutation = useMutation({
    mutationFn: (id: string) => analyticsApi.runScheduleNow(id),
    onSuccess: () => {
      toast.success('تم تشغيل الجدولة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setRunDialog(null);
    },
    onError: () => toast.error('فشل في تشغيل الجدولة'),
  });

  const handleToggle = (schedule: ReportSchedule) => {
    toggleMutation.mutate({ id: schedule._id, isActive: !schedule.isActive });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الجدولة؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRunNow = (schedule: ReportSchedule) => {
    setRunDialog(schedule);
  };

  const confirmRunNow = () => {
    if (runDialog) {
      runNowMutation.mutate(runDialog._id);
    }
  };

  const handleEdit = (schedule: ReportSchedule) => {
    setEditingSchedule(schedule);
    setOpenForm(true);
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    setEditingSchedule(null);
    queryClient.invalidateQueries({ queryKey: ['schedules'] });
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('ar-SA');
  };

  const getSuccessRate = (schedule: ReportSchedule) => {
    if (schedule.runCount === 0) return '-';
    return `${Math.round((schedule.successCount / schedule.runCount) * 100)}%`;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('scheduledReports.search', 'بحث...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            <Tabs
              value={statusFilter}
              onChange={(_, v) => setStatusFilter(v)}
            >
              <Tab label="الكل" value="all" />
              <Tab label="نشط" value="active" />
              <Tab label="متوقف" value="inactive" />
            </Tabs>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              تحديث
            </Button>
          </Grid>
        </Grid>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('scheduledReports.name', 'الاسم')}</TableCell>
                  <TableCell>{t('scheduledReports.type', 'النوع')}</TableCell>
                  <TableCell>{t('scheduledReports.frequency', 'التكرار')}</TableCell>
                  <TableCell>{t('scheduledReports.formats', 'الصيغ')}</TableCell>
                  <TableCell>{t('scheduledReports.nextRun', 'التشغيل القادم')}</TableCell>
                  <TableCell>{t('scheduledReports.lastRun', 'آخر تشغيل')}</TableCell>
                  <TableCell>{t('scheduledReports.successRate', 'نسبة النجاح')}</TableCell>
                  <TableCell>{t('scheduledReports.status', 'الحالة')}</TableCell>
                  <TableCell align="center">{t('scheduledReports.actions', 'إجراءات')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {t('scheduledReports.noData', 'لا توجد جداول')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((schedule) => (
                    <TableRow key={schedule._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {schedule.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {reportTypeLabels[schedule.reportType] || schedule.reportType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={frequencyLabels[schedule.frequency] || schedule.frequency}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {schedule.formats?.map((f) => (
                            <Chip key={f} label={f.toUpperCase()} size="small" sx={{ fontSize: '0.65rem' }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatDate(schedule.nextRun)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {formatDate(schedule.lastRun)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.75rem',
                            color:
                              schedule.runCount === 0
                                ? 'text.secondary'
                                : schedule.successCount / schedule.runCount > 0.8
                                ? 'success.main'
                                : 'warning.main',
                          }}
                        >
                          {getSuccessRate(schedule)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={schedule.isActive ? 'نشط' : 'متوقف'}
                          size="small"
                          color={schedule.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="تشغيل الآن">
                            <IconButton size="small" color="primary" onClick={() => handleRunNow(schedule)}>
                              <RunIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={schedule.isActive ? 'إيقاف' : 'تفعيل'}>
                            <IconButton
                              size="small"
                              color={schedule.isActive ? 'warning' : 'success'}
                              onClick={() => handleToggle(schedule)}
                            >
                              {schedule.isActive ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton size="small" onClick={() => handleEdit(schedule)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small" color="error" onClick={() => handleDelete(schedule._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={data?.meta?.total || 0}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
          labelRowsPerPage="عدد الصفوف"
        />
      </Paper>

      <ReportScheduleForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditingSchedule(null); }}
        onSuccess={handleFormSuccess}
        schedule={editingSchedule || undefined}
      />

      <Dialog open={!!runDialog} onClose={() => setRunDialog(null)}>
        <DialogTitle>تأكيد التشغيل</DialogTitle>
        <DialogContent>
          <Typography>
            هل تريد تشغيل "{runDialog?.name}" الآن؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunDialog(null)}>إلغاء</Button>
          <Button
            onClick={confirmRunNow}
            variant="contained"
            color="primary"
            disabled={runNowMutation.isPending}
          >
            {runNowMutation.isPending ? 'جاري التشغيل...' : 'تشغيل الآن'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
