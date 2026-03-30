import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Pagination,
  FormControlLabel,
  Switch,
  MenuItem,
  Divider,
} from '@mui/material';
import { Add, Campaign, Insights, People, PictureAsPdf, TableView, Download } from '@mui/icons-material';
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

const PAGE_SIZE = 10;

export const MarketersManagementPage = () => {
  const [page, setPage] = useState(1);
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

  const { hasPermission } = useAuthStore();
  const canCreateMarketers =
    hasPermission(PERMISSIONS.MARKETERS_CREATE) || hasPermission(PERMISSIONS.SUPER_ADMIN_ACCESS);

  const marketersQuery = useMarketers({ page, limit: PAGE_SIZE, search: search || undefined });
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

  const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    if (status === 'active') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'suspended') return 'error';
    return 'default';
  };

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
        <Box>
          <Typography variant="h5" fontWeight={700}>
            إدارة المسوقين
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إنشاء حسابات مسوقين ومتابعة بياناتهم الأساسية بشكل آمن.
          </Typography>
        </Box>

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

            {rankingQuery.isLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={26} />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>الترتيب</TableCell>
                    <TableCell>المسوق</TableCell>
                    <TableCell>الهاتف</TableCell>
                    <TableCell>إجمالي العملاء</TableCell>
                    <TableCell>المعتمدون</TableCell>
                    <TableCell>معدل التحويل</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rankingQuery.data?.items || []).map((item) => (
                    <TableRow key={item.marketerId} hover>
                      <TableCell>#{item.rank}</TableCell>
                      <TableCell>{`${item.marketer.firstName || ''} ${item.marketer.lastName || ''}`.trim() || '-'}</TableCell>
                      <TableCell>{item.marketer.phone || '-'}</TableCell>
                      <TableCell>{item.totalLeads}</TableCell>
                      <TableCell>{item.approvedTotal}</TableCell>
                      <TableCell>{item.conversionRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

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
                  {(marketersQuery.data?.items || []).map((marketer) => (
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
            )}
          </Stack>
        </Paper>

        {canCreateMarketers && (
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6">إضافة مسوق جديد</Typography>
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

              <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreate}
                  disabled={createMarketerMutation.isPending}
                >
                  إنشاء حساب المسوق
                </Button>
              </Stack>

              {createdPassword && (
                <Alert severity="success">
                  تم إنشاء الحساب. كلمة المرور المؤقتة: <strong>{createdPassword}</strong>
                </Alert>
              )}
            </Stack>
          </Paper>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Typography variant="h6">قائمة المسوقين</Typography>
              <TextField
                label="بحث (اسم/هاتف)"
                size="small"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: { xs: '100%', md: 280 } }}
              />
            </Stack>

            {marketersQuery.isLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>الاسم</TableCell>
                      <TableCell>الهاتف</TableCell>
                      <TableCell>الحالة</TableCell>
                      <TableCell>آخر نشاط</TableCell>
                      <TableCell>تاريخ الإنشاء</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(marketersQuery.data?.items || []).map((marketer) => (
                      <TableRow key={marketer._id} hover>
                        <TableCell>{`${marketer.firstName || ''} ${marketer.lastName || ''}`.trim() || '-'}</TableCell>
                        <TableCell>{marketer.phone}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={marketer.status}
                            color={statusColor(marketer.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {marketer.lastActivityAt
                            ? new Date(marketer.lastActivityAt).toLocaleString('ar-YE')
                            : '-'}
                        </TableCell>
                        <TableCell>{new Date(marketer.createdAt).toLocaleDateString('ar-YE')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
                  <Pagination
                    page={page}
                    count={marketersQuery.data?.totalPages || 1}
                    onChange={(_event, value) => setPage(value)}
                    color="primary"
                  />
                </Stack>
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default MarketersManagementPage;
