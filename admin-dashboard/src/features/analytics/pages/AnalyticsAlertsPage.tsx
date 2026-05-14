import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Delete,
  Check,
  Visibility,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportBuilderApi } from '../api/reportBuilderApi';
import type { AnalyticsAlert, AlertStats } from '../types/reportBuilder.types';

const SEVERITY_COLORS: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'success',
};

const STATUS_COLORS: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  open: 'error',
  acknowledged: 'warning',
  resolved: 'success',
  ignored: 'default',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'حرج',
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'مفتوح',
  acknowledged: 'تمت المشاهدة',
  resolved: 'تم الحل',
  ignored: 'تم التجاهل',
};

export const AnalyticsAlertsPage: React.FC = () => {
  const { t, i18n } = useTranslation('analytics');
  const queryClient = useQueryClient();
  const isRTL = i18n.language === 'ar';

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<AnalyticsAlert | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['analytics-alerts', page, limit, statusFilter, severityFilter, sourceFilter],
    queryFn: () =>
      reportBuilderApi.getAlerts({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        source: sourceFilter || undefined,
        page: page + 1,
        limit,
      }),
  });

  const { data: stats } = useQuery<AlertStats>({
    queryKey: ['analytics-alerts-stats'],
    queryFn: () => reportBuilderApi.getAlertStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'open' | 'acknowledged' | 'resolved' | 'ignored' }) =>
      reportBuilderApi.updateAlertStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-alerts-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportBuilderApi.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-alerts-stats'] });
      setOpenDialog(false);
    },
  });

  const scanMutation = useMutation({
    mutationFn: () => reportBuilderApi.scanAlerts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-alerts-stats'] });
    },
  });

  const handleStatusChange = (id: string, status: 'open' | 'acknowledged' | 'resolved' | 'ignored') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleScan = () => {
    scanMutation.mutate();
  };

  const alerts = alertsData?.data || [];
  const total = alertsData?.meta?.total || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('analytics.alerts.title') || 'تنبيهات التحليلات'}</Typography>
        <Button
          variant="contained"
          startIcon={scanMutation.isPending ? <CircularProgress size={20} /> : <Refresh />}
          onClick={handleScan}
          disabled={scanMutation.isPending}
        >
          فحص التنبيهات
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">الإجمالي</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <Card sx={{ bgcolor: 'rgba(244, 67, 54, 0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="error">{stats.open}</Typography>
              <Typography variant="body2">مفتوح</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <Card sx={{ bgcolor: 'rgba(255, 152, 0, 0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">{stats.acknowledged}</Typography>
              <Typography variant="body2">تمت المشاهدة</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.08)' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">{stats.resolved}</Typography>
              <Typography variant="body2">تم الحل</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4">{stats.ignored}</Typography>
              <Typography variant="body2" color="text.secondary">تم التجاهل</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
            <Card sx={{ bgcolor: 'rgba(244, 67, 54, 0.08)' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error">
                  {stats.bySeverity?.critical || 0}
                </Typography>
                <Typography variant="body2">حرج</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterList />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={statusFilter}
              label="الحالة"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="open">مفتوح</MenuItem>
              <MenuItem value="acknowledged">تمت المشاهدة</MenuItem>
              <MenuItem value="resolved">تم الحل</MenuItem>
              <MenuItem value="ignored">تم التجاهل</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>الخطورة</InputLabel>
            <Select
              value={severityFilter}
              label="الخطورة"
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="critical">حرج</MenuItem>
              <MenuItem value="high">مرتفع</MenuItem>
              <MenuItem value="medium">متوسط</MenuItem>
              <MenuItem value="low">منخفض</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>المصدر</InputLabel>
            <Select
              value={sourceFilter}
              label="المصدر"
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="sales">المبيعات</MenuItem>
              <MenuItem value="orders">الطلبات</MenuItem>
              <MenuItem value="inventory">المخزون</MenuItem>
              <MenuItem value="customers">العملاء</MenuItem>
              <MenuItem value="support">الدعم</MenuItem>
              <MenuItem value="system">النظام</MenuItem>
              <MenuItem value="marketing">التسويق</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الخطورة</TableCell>
              <TableCell>العنوان</TableCell>
              <TableCell>المصدر</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Alert severity="info">لا توجد تنبيهات</Alert>
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert: AnalyticsAlert) => (
                <TableRow key={alert._id} hover>
                  <TableCell>
                    <Chip
                      label={SEVERITY_LABELS[alert.severity]}
                      color={SEVERITY_COLORS[alert.severity]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {isRTL ? alert.title : alert.titleEn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isRTL ? alert.description : alert.descriptionEn}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={alert.source} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[alert.status]}
                      color={STATUS_COLORS[alert.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(alert.createdAt).toLocaleDateString('ar-SA')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="عرض">
                        <IconButton size="small" onClick={() => { setSelectedAlert(alert); setOpenDialog(true); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {alert.status === 'open' && (
                        <Tooltip title="مشاهدة">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleStatusChange(alert._id, 'acknowledged')}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {alert.status !== 'resolved' && (
                        <Tooltip title="حل">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(alert._id, 'resolved')}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="حذف">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => { setSelectedAlert(alert); setOpenDialog(true); }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="عدد الصفوف"
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAlert ? (isRTL ? selectedAlert.title : selectedAlert.titleEn) : ''}
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {isRTL ? selectedAlert.description : selectedAlert.descriptionEn}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">الخطورة</Typography>
                  <Chip
                    label={SEVERITY_LABELS[selectedAlert.severity]}
                    color={SEVERITY_COLORS[selectedAlert.severity]}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">الحالة</Typography>
                  <Chip
                    label={STATUS_LABELS[selectedAlert.status]}
                    color={STATUS_COLORS[selectedAlert.status]}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">المصدر</Typography>
                  <Typography variant="body1">{selectedAlert.source}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">التاريخ</Typography>
                  <Typography variant="body1">
                    {new Date(selectedAlert.createdAt).toLocaleDateString('ar-SA')}
                  </Typography>
                </Grid>
                {selectedAlert.suggestedAction && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">الإجراء المقترح</Typography>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {isRTL ? selectedAlert.suggestedAction : selectedAlert.suggestedActionEn}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedAlert && selectedAlert.status !== 'resolved' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleStatusChange(selectedAlert._id, 'resolved');
                setOpenDialog(false);
              }}
            >
              تحديد كحل
            </Button>
          )}
          <Button
            variant="contained"
            color="error"
            onClick={() => selectedAlert && handleDelete(selectedAlert._id)}
            disabled={deleteMutation.isPending}
          >
            حذف
          </Button>
          <Button onClick={() => setOpenDialog(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
