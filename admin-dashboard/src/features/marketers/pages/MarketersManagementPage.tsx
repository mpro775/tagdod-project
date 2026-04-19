import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
  MenuItem,
  Divider,
} from '@mui/material';
import { Add, Campaign, Insights, People, PictureAsPdf, TableView, Download, Visibility } from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { PERMISSIONS } from '@/shared/constants/permissions';
import {
  useCreateMarketer,
  useMarketerAnalyticsDetails,
  useMarketers,
  useMarketersAnalyticsOverview,
  useMarketersAnalyticsRanking,
  useMarketersSummary,
} from '../hooks/useMarketers';
import {
  exportMarketersAnalyticsExcel,
  exportMarketerFullReport,
  exportMarketersAnalyticsPdf,
} from '../utils/marketersAnalyticsExport';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

const PAGE_SIZE = 10;

export const MarketersManagementPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    temporaryPassword: '',
    activateImmediately: true,
  });
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedMarketerId, setSelectedMarketerId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [rankingPaginationModel, setRankingPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const { hasPermission } = useAuthStore();
  const canCreateMarketers =
    hasPermission(PERMISSIONS.MARKETERS_CREATE) || hasPermission(PERMISSIONS.SUPER_ADMIN_ACCESS);

  const marketersQuery = useMarketers({ page, limit, search: search || undefined });
  const marketersSelectionQuery = useMarketers({ page: 1, limit: 100 });
  const summaryQuery = useMarketersSummary();
  const overviewQuery = useMarketersAnalyticsOverview({ from: fromDate, to: toDate });
  const rankingQuery = useMarketersAnalyticsRanking({ from: fromDate, to: toDate, limit: 15 });
  const marketerDetailsQuery = useMarketerAnalyticsDetails(
    selectedMarketerId || undefined,
    { from: fromDate, to: toDate },
  );
  const createMarketerMutation = useCreateMarketer();

  const handleExportExcel = () => {
    if (!overviewQuery.data) {
      toast.error('لا توجد بيانات كافية للتصدير');
      return;
    }

    exportMarketersAnalyticsExcel({
      overview: overviewQuery.data,
      ranking: rankingQuery.data,
      details: marketerDetailsQuery.data,
    });
    toast.success('تم تصدير تقرير Excel بنجاح');
  };

  const handleExportPdf = () => {
    if (!overviewQuery.data) {
      toast.error('لا توجد بيانات كافية للتصدير');
      return;
    }

    exportMarketersAnalyticsPdf({
      overview: overviewQuery.data,
      ranking: rankingQuery.data,
    });
    toast.success('تم تصدير تقرير PDF بنجاح');
  };

  const handleExportFullMarketerReport = () => {
    if (!selectedMarketerId || !marketerDetailsQuery.data) {
      toast.error('اختر مسوقاً أولاً ثم انتظر تحميل بياناته');
      return;
    }

    const marketerName =
      `${marketerDetailsQuery.data.marketer?.firstName || ''} ${marketerDetailsQuery.data.marketer?.lastName || ''}`
        .trim() ||
      marketerDetailsQuery.data.marketer?.phone ||
      'marketer';

    exportMarketerFullReport({
      marketerName,
      from: fromDate,
      to: toDate,
      details: marketerDetailsQuery.data,
    });

    toast.success('تم تصدير التقرير الكامل للمسوق بنجاح');
  };

  const dailyTrendData = overviewQuery.data?.dailyTrend || [];
  const selectedLead =
    marketerDetailsQuery.data?.latestLeads.find((lead) => lead._id === selectedLeadId) || null;

  function statusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
    if (status === 'active') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'suspended') return 'error';
    return 'default';
  }

  const mapStoreSize = (value?: string) => {
    if (value === 'small') return 'صغير';
    if (value === 'medium') return 'متوسط';
    if (value === 'large') return 'كبير';
    return '-';
  };

  const mapPreviousCustomer = (value?: string) => {
    if (value === 'yes') return 'نعم';
    if (value === 'no') return 'لا';
    return '-';
  };

  const mapAwareness = (value?: string) => {
    if (value === 'knows') return 'يعرف تجدد';
    if (value === 'heard_only') return 'سمع عنها فقط';
    if (value === 'none') return 'لا يعرف';
    return '-';
  };

  const marketersColumns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'name',
        headerName: 'الاسم',
        flex: 1,
        minWidth: 180,
        valueGetter: (_value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
      },
      { field: 'phone', headerName: 'الهاتف', flex: 1, minWidth: 140 },
      {
        field: 'status',
        headerName: 'الحالة',
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => (
          <Chip size="small" label={params.value} color={statusColor(String(params.value))} variant="outlined" />
        ),
      },
      {
        field: 'lastActivityAt',
        headerName: 'آخر نشاط',
        flex: 1.2,
        minWidth: 160,
        valueGetter: (value) => (value ? new Date(String(value)).toLocaleString('ar-YE') : '-'),
      },
      {
        field: 'createdAt',
        headerName: 'تاريخ الإنشاء',
        flex: 1,
        minWidth: 150,
        valueGetter: (value) => (value ? new Date(String(value)).toLocaleDateString('ar-YE') : '-'),
      },
    ],
    [],
  );

  const rankingColumns = useMemo<GridColDef[]>(
    () => [
      { field: 'rank', headerName: 'الترتيب', flex: 0.6, minWidth: 90, valueGetter: (v) => `#${v}` },
      {
        field: 'name',
        headerName: 'المسوق',
        flex: 1.3,
        minWidth: 170,
        valueGetter: (_value, row) => `${row.marketer?.firstName || ''} ${row.marketer?.lastName || ''}`.trim() || '-',
      },
      { field: 'phone', headerName: 'الهاتف', flex: 1, minWidth: 130, valueGetter: (_v, row) => row.marketer?.phone || '-' },
      { field: 'totalLeads', headerName: 'إجمالي العملاء', flex: 0.9, minWidth: 120 },
      { field: 'approvedTotal', headerName: 'المعتمدون', flex: 0.8, minWidth: 110 },
      {
        field: 'conversionRate',
        headerName: 'معدل التحويل',
        flex: 0.9,
        minWidth: 120,
        valueGetter: (value) => `${value ?? 0}%`,
      },
    ],
    [],
  );

  const stats = useMemo(
    () => [
      {
        title: 'إجمالي المسوقين',
        value: summaryQuery.data?.total ?? 0,
        icon: <People color="primary" />,
      },
      {
        title: 'المسوقون النشطون',
        value: summaryQuery.data?.active ?? 0,
        icon: <Campaign color="success" />,
      },
      {
        title: 'أُضيفوا هذا الشهر',
        value: summaryQuery.data?.createdThisMonth ?? 0,
        icon: <Insights color="info" />,
      },
    ],
    [summaryQuery.data],
  );

  const handleCreate = () => {
    if (!form.phone.trim() || !form.firstName.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف والاسم الأول');
      return;
    }

    createMarketerMutation.mutate(
      {
        phone: form.phone.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        temporaryPassword: form.temporaryPassword.trim() || undefined,
        activateImmediately: form.activateImmediately,
      },
      {
        onSuccess: (result) => {
          setCreatedPassword(result.temporaryPassword || null);
          setCreateDialogOpen(false);
          setForm({
            phone: '',
            firstName: '',
            lastName: '',
            temporaryPassword: '',
            activateImmediately: true,
          });
        },
      },
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              إدارة المسوقين
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إنشاء حسابات مسوقين ومتابعة بياناتهم الأساسية بشكل آمن.
            </Typography>
          </Box>
          {canCreateMarketers && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
              إنشاء حساب مسوق
            </Button>
          )}
        </Stack>

        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid size={{ xs: 12, md: 4 }} key={stat.title}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {summaryQuery.isLoading ? <CircularProgress size={20} /> : stat.value}
                      </Typography>
                    </Box>
                    {stat.icon}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              spacing={2}
            >
              <Typography variant="h6">تحليلات أداء المسوقين</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <TextField
                  type="date"
                  size="small"
                  label="من"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  size="small"
                  label="إلى"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="outlined"
                  startIcon={<TableView />}
                  onClick={handleExportExcel}
                  disabled={overviewQuery.isLoading}
                >
                  Excel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPdf}
                  disabled={overviewQuery.isLoading}
                >
                  PDF
                </Button>
              </Stack>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي العملاء من المسوقين
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {overviewQuery.isLoading
                        ? '...'
                        : (overviewQuery.data?.totalLeads ?? 0).toLocaleString('en-US')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      المهندسون المعتمدون
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {overviewQuery.isLoading
                        ? '...'
                        : (overviewQuery.data?.approvedEngineers ?? 0).toLocaleString('en-US')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      التجار المعتمدون
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {overviewQuery.isLoading
                        ? '...'
                        : (overviewQuery.data?.approvedMerchants ?? 0).toLocaleString('en-US')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      معدل التحويل الكلي
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {overviewQuery.isLoading
                        ? '...'
                        : `${overviewQuery.data?.overallConversionRate ?? 0}%`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <Chip
                color={
                  (overviewQuery.data?.comparison?.leadsGrowthPercent || 0) >= 0 ? 'success' : 'error'
                }
                label={`نمو العملاء: ${overviewQuery.data?.comparison?.leadsGrowthPercent ?? 0}%`}
              />
              <Chip
                color={
                  (overviewQuery.data?.comparison?.conversionGrowthPercent || 0) >= 0
                    ? 'success'
                    : 'error'
                }
                label={`تغير التحويل: ${overviewQuery.data?.comparison?.conversionGrowthPercent ?? 0}%`}
              />
              <Chip
                variant="outlined"
                label={`الفترة السابقة: ${overviewQuery.data?.previousPeriod?.from?.slice(0, 10) || '-'} -> ${overviewQuery.data?.previousPeriod?.to?.slice(0, 10) || '-'}`}
              />
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      منحنى العملاء اليومي
                    </Typography>
                    <Box sx={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={dailyTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="leads"
                            stroke="#1e88e5"
                            strokeWidth={2}
                            name="إجمالي العملاء"
                          />
                          <Line
                            type="monotone"
                            dataKey="approvedLeads"
                            stroke="#43a047"
                            strokeWidth={2}
                            name="المعتمدون"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      مقارنة أنواع العملاء
                    </Typography>
                    <Box sx={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={[
                            {
                              name: 'مهندس',
                              total: overviewQuery.data?.engineers ?? 0,
                              approved: overviewQuery.data?.approvedEngineers ?? 0,
                            },
                            {
                              name: 'تاجر',
                              total: overviewQuery.data?.merchants ?? 0,
                              approved: overviewQuery.data?.approvedMerchants ?? 0,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" fill="#1e88e5" name="الإجمالي" />
                          <Bar dataKey="approved" fill="#43a047" name="المعتمد" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
              ترتيب المسوقين حسب الأداء
            </Typography>

            <DataTable
              columns={rankingColumns}
              rows={rankingQuery.data?.items || []}
              loading={rankingQuery.isLoading}
              paginationModel={rankingPaginationModel}
              onPaginationModelChange={setRankingPaginationModel}
              rowCount={rankingQuery.data?.items?.length || 0}
              paginationMode="client"
              getRowId={(row: any) => row.marketerId}
              height={440}
            />

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                تفاصيل مسوق محدد
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="اختر المسوق"
                  value={selectedMarketerId}
                  onChange={(event) => setSelectedMarketerId(event.target.value)}
                  sx={{ maxWidth: 360 }}
                >
                  {(marketersSelectionQuery.data?.items || []).map((marketer) => (
                    <MenuItem value={marketer._id} key={marketer._id}>
                      {`${marketer.firstName || ''} ${marketer.lastName || ''}`.trim() || marketer.phone}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Download />}
                  onClick={handleExportFullMarketerReport}
                  disabled={!selectedMarketerId || marketerDetailsQuery.isLoading || !marketerDetailsQuery.data}
                >
                  تصدير التقرير الكامل
                </Button>
              </Stack>
            </Stack>

            {selectedMarketerId && (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          إجمالي العملاء
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {marketerDetailsQuery.isLoading
                            ? '...'
                            : marketerDetailsQuery.data?.summary.totalLeads ?? 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          معتمدون (مهندسون + تجار)
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {marketerDetailsQuery.isLoading
                            ? '...'
                            : (marketerDetailsQuery.data?.summary.approvedEngineers || 0) +
                              (marketerDetailsQuery.data?.summary.approvedMerchants || 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          معدل التحويل للمسوق
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {marketerDetailsQuery.isLoading
                            ? '...'
                            : `${marketerDetailsQuery.data?.summary.conversionRate ?? 0}%`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      جميع العملاء الذين سجّلهم هذا المسوق
                    </Typography>
                    <TableContainer sx={{ maxHeight: 360 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>الاسم</TableCell>
                            <TableCell>الهاتف</TableCell>
                            <TableCell>النوع</TableCell>
                            <TableCell>الحالة</TableCell>
                            <TableCell>تاريخ التسجيل</TableCell>
                            <TableCell align="center">عرض</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(marketerDetailsQuery.data?.latestLeads || []).map((lead) => {
                            const isEngineer = lead.roles?.includes('engineer');
                            const verification = isEngineer ? lead.engineer_status : lead.merchant_status;

                            return (
                              <TableRow key={lead._id} hover>
                                <TableCell>{`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || '-'}</TableCell>
                                <TableCell>{lead.phone}</TableCell>
                                <TableCell>{isEngineer ? 'مهندس' : 'تاجر'}</TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label={verification || '-'}
                                    color={verification === 'approved' ? 'success' : 'warning'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  {lead.marketerCreatedAt || lead.createdAt
                                    ? new Date(lead.marketerCreatedAt || lead.createdAt || '').toLocaleDateString('ar-YE')
                                    : '-'}
                                </TableCell>
                                <TableCell align="center">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Visibility fontSize="small" />}
                                    onClick={() => setSelectedLeadId(lead._id)}
                                  >
                                    عرض
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {!marketerDetailsQuery.isLoading && (marketerDetailsQuery.data?.latestLeads || []).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                لا توجد سجلات ضمن الفترة المحددة
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </Stack>
        </Paper>

        <Dialog
          open={!!selectedLead}
          onClose={() => setSelectedLeadId('')}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>تفاصيل السجل</DialogTitle>
          <DialogContent>
            <Stack spacing={1.25} sx={{ pt: 1 }}>
              <Typography variant="body2"><strong>الاسم:</strong> {`${selectedLead?.firstName || ''} ${selectedLead?.lastName || ''}`.trim() || '-'}</Typography>
              <Typography variant="body2"><strong>الهاتف:</strong> {selectedLead?.phone || '-'}</Typography>
              <Typography variant="body2"><strong>المدينة:</strong> {selectedLead?.city || '-'}</Typography>
              <Typography variant="body2"><strong>النوع:</strong> {selectedLead?.roles?.includes('engineer') ? 'مهندس' : 'تاجر'}</Typography>
              <Typography variant="body2"><strong>حالة المهندس:</strong> {selectedLead?.engineer_status || '-'}</Typography>
              <Typography variant="body2"><strong>حالة التاجر:</strong> {selectedLead?.merchant_status || '-'}</Typography>
              <Typography variant="body2"><strong>اسم المحل:</strong> {selectedLead?.storeName || '-'}</Typography>
              <Typography variant="body2"><strong>عنوان المحل:</strong> {selectedLead?.storeAddress || '-'}</Typography>
              <Typography variant="body2"><strong>حجم المحل:</strong> {mapStoreSize(selectedLead?.storeSize)}</Typography>
              <Typography variant="body2"><strong>عميل سابق:</strong> {mapPreviousCustomer(selectedLead?.previousCustomer)}</Typography>
              <Typography variant="body2"><strong>المعرفة بتجدد:</strong> {mapAwareness(selectedLead?.tejadodAwareness)}</Typography>
              <Typography variant="body2"><strong>ملاحظة التحقق:</strong> {selectedLead?.verificationNote || '-'}</Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedLeadId('')}>إغلاق</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>إضافة مسوق جديد</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="الاسم الأول"
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    label="الاسم الأخير"
                    value={form.lastName}
                    onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="كلمة مرور مؤقتة (اختياري)"
                    value={form.temporaryPassword}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, temporaryPassword: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.activateImmediately}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, activateImmediately: event.target.checked }))
                    }
                  />
                }
                label="تفعيل الحساب مباشرة"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>إلغاء</Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              disabled={createMarketerMutation.isPending}
            >
              إنشاء الحساب
            </Button>
          </DialogActions>
        </Dialog>

        {createdPassword && (
          <Alert severity="success">
            تم إنشاء الحساب. كلمة المرور المؤقتة: <strong>{createdPassword}</strong>
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">قائمة المسوقين</Typography>
            <DataTable
              columns={marketersColumns}
              rows={marketersQuery.data?.items || []}
              loading={marketersQuery.isLoading}
              title={undefined}
              onSearch={(query) => {
                setSearch(query);
                setPage(1);
              }}
              searchPlaceholder="بحث (اسم/هاتف)"
              paginationModel={{ page: page - 1, pageSize: limit }}
              onPaginationModelChange={(model) => {
                setPage(model.page + 1);
                setLimit(model.pageSize);
              }}
              rowCount={marketersQuery.data?.total || 0}
              paginationMode="server"
              getRowId={(row: any) => row._id}
              height={520}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default MarketersManagementPage;
