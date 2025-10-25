import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  Paper,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  Refresh,
  Download,
  FilterList,
  BarChart,
  PieChart,
  ShowChart,
} from '@mui/icons-material';
import {
  useRequestsStatistics,
  useEngineersStatistics,
  useServiceTypesStatistics,
  useRevenueStatistics,
} from '../hooks/useServices';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Loading skeleton component
const AnalyticsSkeleton: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      <Skeleton variant="text" width="40%" />
    </Typography>
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid key={i} component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export const ServicesAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    dateFrom: '',
    dateTo: '',
    groupBy: 'day' as 'day' | 'week' | 'month',
  });

  const {
    data: requestsStats,
    isLoading: requestsLoading,
    error: requestsError,
  } = useRequestsStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    groupBy: dateRange.groupBy,
  });

  const {
    data: engineersStats,
    isLoading: engineersLoading,
    error: engineersError,
  } = useEngineersStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    limit: 10,
  });

  const {
    data: serviceTypesStats,
    isLoading: serviceTypesLoading,
    error: serviceTypesError,
  } = useServiceTypesStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  const {
    data: revenueStats,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    groupBy: dateRange.groupBy,
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (key: string, value: any) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            تحليلات الخدمات
          </Typography>
          <Typography variant="body1" color="textSecondary">
            تحليلات شاملة لأداء النظام والخدمات
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>الفترة الزمنية</InputLabel>
            <Select
              value={dateRange.groupBy}
              label="الفترة الزمنية"
              onChange={(e) => handleDateRangeChange('groupBy', e.target.value)}
            >
              <MenuItem value="day">يومي</MenuItem>
              <MenuItem value="week">أسبوعي</MenuItem>
              <MenuItem value="month">شهري</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<Refresh />} size="small">
            تحديث
          </Button>

          <Button variant="contained" startIcon={<Download />} size="small">
            تصدير التقرير
          </Button>
        </Stack>
      </Box>

      {/* فلاتر التاريخ */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">فلترة التاريخ</Typography>
          <Chip
            icon={<FilterList />}
            label="فلاتر نشطة"
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>من تاريخ</InputLabel>
              <Select
                value={dateRange.dateFrom}
                label="من تاريخ"
                onChange={(e) => handleDateRangeChange('dateFrom', e.target.value)}
              >
                <MenuItem value="">اختياري</MenuItem>
                <MenuItem value="2024-01-01">منذ بداية العام</MenuItem>
                <MenuItem value="2024-06-01">منذ 6 أشهر</MenuItem>
                <MenuItem value="2024-11-01">منذ 3 أشهر</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>إلى تاريخ</InputLabel>
              <Select
                value={dateRange.dateTo}
                label="إلى تاريخ"
                onChange={(e) => handleDateRangeChange('dateTo', e.target.value)}
              >
                <MenuItem value="">حتى الآن</MenuItem>
                <MenuItem value="2024-12-31">نهاية العام</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>تجميع البيانات</InputLabel>
              <Select
                value={dateRange.groupBy}
                label="تجميع البيانات"
                onChange={(e) => handleDateRangeChange('groupBy', e.target.value)}
              >
                <MenuItem value="day">يومي</MenuItem>
                <MenuItem value="week">أسبوعي</MenuItem>
                <MenuItem value="month">شهري</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button variant="contained" startIcon={<FilterList />} fullWidth size="large">
              تطبيق الفلاتر
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* التبويبات */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab icon={<Timeline />} label="اتجاهات الطلبات" iconPosition="start" />
            <Tab icon={<TrendingUp />} label="أداء المهندسين" iconPosition="start" />
            <Tab icon={<Assessment />} label="أنواع الخدمات" iconPosition="start" />
            <Tab icon={<TrendingDown />} label="الإيرادات" iconPosition="start" />
          </Tabs>
        </Box>

        {/* اتجاهات الطلبات */}
        <TabPanel value={activeTab} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">اتجاهات الطلبات</Typography>
            <Chip
              icon={<BarChart />}
              label={`${Array.isArray(requestsStats) ? requestsStats.length : 0} فترة`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {requestsLoading ? (
            <AnalyticsSkeleton />
          ) : requestsError ? (
            <Alert severity="error">فشل في تحميل بيانات الطلبات: {requestsError.message}</Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(requestsStats) ? requestsStats : [])?.map((stat, index) => (
                <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" color="primary">
                          {stat._id}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Timeline />
                        </Avatar>
                      </Box>

                      <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                        {stat.total}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        إجمالي الطلبات
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="success.main">
                              {stat.completed}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              مكتمل
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="error.main">
                              {stat.cancelled}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ملغي
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <LinearProgress
                        variant="determinate"
                        value={(stat.completed / stat.total) * 100}
                        color="success"
                        sx={{ mt: 2, height: 6, borderRadius: 3 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* أداء المهندسين */}
        <TabPanel value={activeTab} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">أفضل المهندسين</Typography>
            <Chip
              icon={<TrendingUp />}
              label={`${Array.isArray(engineersStats) ? engineersStats.length : 0} مهندس`}
              color="success"
              variant="outlined"
            />
          </Box>

          {engineersLoading ? (
            <AnalyticsSkeleton />
          ) : engineersError ? (
            <Alert severity="error">فشل في تحميل بيانات المهندسين: {engineersError.message}</Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(engineersStats) ? engineersStats : [])?.map((engineer, index) => (
                <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={engineer.engineerId}>
                  <Card sx={{ height: '100%', position: 'relative' }}>
                    {index < 3 && (
                      <Chip
                        label={`#${index + 1}`}
                        color="warning"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                      />
                    )}
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                          {engineer.engineerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {engineer.engineerName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {engineer.engineerPhone}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2} mt={1}>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary">
                              {engineer.totalRequests}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              طلبات
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main">
                              {engineer.completionRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              معدل الإنجاز
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main">
                              {engineer.averageRating.toFixed(1)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              التقييم
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="info.main">
                              {engineer.totalRevenue.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              الإيرادات
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <LinearProgress
                        variant="determinate"
                        value={engineer.completionRate}
                        color="success"
                        sx={{ mt: 2, height: 6, borderRadius: 3 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* أنواع الخدمات */}
        <TabPanel value={activeTab} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">إحصائيات أنواع الخدمات</Typography>
            <Chip
              icon={<PieChart />}
              label={`${Array.isArray(serviceTypesStats) ? serviceTypesStats.length : 0} نوع`}
              color="info"
              variant="outlined"
            />
          </Box>

          {serviceTypesLoading ? (
            <AnalyticsSkeleton />
          ) : serviceTypesError ? (
            <Alert severity="error">
              فشل في تحميل بيانات أنواع الخدمات: {serviceTypesError.message}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(serviceTypesStats) ? serviceTypesStats : [])?.map(
                (serviceType, index) => (
                  <Grid
                    component="div"
                    size={{ xs: 12, sm: 6, md: 4 }}
                    key={serviceType._id || index}
                  >
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={2}
                        >
                          <Typography variant="h6" color="info.main">
                            {serviceType._id || 'غير محدد'}
                          </Typography>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <Assessment />
                          </Avatar>
                        </Box>

                        <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                          {serviceType.total}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          إجمالي الطلبات
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                          <Grid component="div" size={{ xs: 6 }}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="success.main">
                                {serviceType.completed}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                مكتمل
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid component="div" size={{ xs: 6 }}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="info.main">
                                {serviceType.averageRevenue?.toFixed(0) || 0}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                متوسط السعر
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <LinearProgress
                          variant="determinate"
                          value={(serviceType.completed / serviceType.total) * 100}
                          color="info"
                          sx={{ mt: 2, height: 6, borderRadius: 3 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          )}
        </TabPanel>

        {/* الإيرادات */}
        <TabPanel value={activeTab} index={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">اتجاهات الإيرادات</Typography>
            <Chip
              icon={<ShowChart />}
              label={`${Array.isArray(revenueStats) ? revenueStats.length : 0} فترة`}
              color="success"
              variant="outlined"
            />
          </Box>

          {revenueLoading ? (
            <AnalyticsSkeleton />
          ) : revenueError ? (
            <Alert severity="error">فشل في تحميل بيانات الإيرادات: {revenueError.message}</Alert>
          ) : (
            <Grid container spacing={3}>
              {(Array.isArray(revenueStats) ? revenueStats : [])?.map((revenue, index) => (
                <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" color="success.main">
                          {revenue._id}
                        </Typography>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <ShowChart />
                        </Avatar>
                      </Box>

                      <Typography variant="h4" color="success.main" sx={{ mb: 1 }}>
                        {revenue.totalRevenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        إجمالي الإيرادات
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary">
                              {revenue.requestsCount}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              طلبات
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid component="div" size={{ xs: 6 }}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="info.main">
                              {revenue.averageRevenue?.toFixed(0) || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              متوسط السعر
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min((revenue.totalRevenue / 100000) * 100, 100)}
                        color="success"
                        sx={{ mt: 2, height: 6, borderRadius: 3 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};
