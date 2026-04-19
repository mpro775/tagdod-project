import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
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
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMarketersSurveyStats } from '../hooks/useMarketers';

const mapStoreSize = (value: string) => {
  if (value === 'small') return 'صغير';
  if (value === 'medium') return 'متوسط';
  if (value === 'large') return 'كبير';
  return 'غير محدد';
};

const mapPreviousCustomer = (value: string) => {
  if (value === 'yes') return 'نعم';
  if (value === 'no') return 'لا';
  return 'غير محدد';
};

const mapAwareness = (value: string) => {
  if (value === 'knows') return 'يعرف';
  if (value === 'heard_only') return 'سمع فقط';
  if (value === 'none') return 'لا يعرف';
  return 'غير محدد';
};

export const MarketersSurveyStatsPage = () => {
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  const statsQuery = useMarketersSurveyStats({ from: fromDate, to: toDate });

  const storeSizeData = useMemo(
    () =>
      Object.entries(statsQuery.data?.storeSize || {}).map(([key, value]) => ({
        name: mapStoreSize(key),
        value,
      })),
    [statsQuery.data?.storeSize],
  );

  const previousCustomerData = useMemo(
    () =>
      Object.entries(statsQuery.data?.previousCustomer || {}).map(([key, value]) => ({
        name: mapPreviousCustomer(key),
        value,
      })),
    [statsQuery.data?.previousCustomer],
  );

  const awarenessData = useMemo(
    () =>
      Object.entries(statsQuery.data?.tejadodAwareness || {}).map(([key, value]) => ({
        name: mapAwareness(key),
        value,
      })),
    [statsQuery.data?.tejadodAwareness],
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            إحصائيات استبيان التجار
          </Typography>
          <Typography variant="body2" color="text.secondary">
            تحليل إجابات أسئلة الاستبيان للتجار المضافين عبر المسوقين.
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
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
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  إجمالي التجار في الفترة
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsQuery.isLoading ? <CircularProgress size={20} /> : statsQuery.data?.totalMerchantLeads ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  أجابوا عن سؤال المعرفة بتجدد
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsQuery.isLoading
                    ? '...'
                    : (statsQuery.data?.tejadodAwareness.knows || 0) +
                      (statsQuery.data?.tejadodAwareness.heard_only || 0) +
                      (statsQuery.data?.tejadodAwareness.none || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  عملاء سابقون
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsQuery.isLoading ? '...' : statsQuery.data?.previousCustomer.yes ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  توزيع حجم المحل
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={storeSizeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#1e88e5" name="العدد" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  هل هو عميل سابق؟
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={previousCustomerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#43a047" name="العدد" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  مستوى المعرفة بتجدد
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={awarenessData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#fb8c00" name="العدد" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            التوزيع حسب المدينة
          </Typography>
          <TableContainer sx={{ maxHeight: 320 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>المدينة</TableCell>
                  <TableCell>عدد التجار</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(statsQuery.data?.cities || []).map((row) => (
                  <TableRow key={row.city} hover>
                    <TableCell>{row.city}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
                {!statsQuery.isLoading && (statsQuery.data?.cities || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      لا توجد بيانات ضمن الفترة المحددة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </Box>
  );
};

export default MarketersSurveyStatsPage;
