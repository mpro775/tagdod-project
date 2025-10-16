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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
} from '@mui/icons-material';
import { 
  useRequestsStatistics, 
  useEngineersStatistics, 
  useServiceTypesStatistics, 
  useRevenueStatistics 
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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ServicesAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    dateFrom: '',
    dateTo: '',
    groupBy: 'day' as 'day' | 'week' | 'month',
  });

  const { data: requestsStats, isLoading: requestsLoading } = useRequestsStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    groupBy: dateRange.groupBy,
  });

  const { data: engineersStats, isLoading: engineersLoading } = useEngineersStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    limit: 10,
  });

  const { data: serviceTypesStats, isLoading: serviceTypesLoading } = useServiceTypesStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  const { data: revenueStats, isLoading: revenueLoading } = useRevenueStatistics({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    groupBy: dateRange.groupBy,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (key: string, value: any) => {
    setDateRange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          تحليلات الخدمات
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center">
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
          
          <Button
            variant="contained"
            startIcon={<Assessment />}
          >
            تصدير التقرير
          </Button>
        </Box>
      </Box>

      {/* فلاتر التاريخ */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            فلترة التاريخ
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
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
            
            <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
        </CardContent>
      </Card>

      {/* التبويبات */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<Timeline />} label="اتجاهات الطلبات" />
            <Tab icon={<TrendingUp />} label="أداء المهندسين" />
            <Tab icon={<Assessment />} label="أنواع الخدمات" />
            <Tab icon={<TrendingDown />} label="الإيرادات" />
          </Tabs>
        </Box>

        {/* اتجاهات الطلبات */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            اتجاهات الطلبات
          </Typography>
          {requestsLoading ? (
            <Typography>جاري تحميل البيانات...</Typography>
          ) : (
            <Grid container spacing={3}>
              {requestsStats?.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {stat._id}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stat.total}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        إجمالي الطلبات
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Box>
                          <Typography variant="body2" color="success.main">
                            ✓ {stat.completed}
                          </Typography>
                          <Typography variant="caption">مكتمل</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="error.main">
                            ✗ {stat.cancelled}
                          </Typography>
                          <Typography variant="caption">ملغي</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* أداء المهندسين */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            أفضل المهندسين
          </Typography>
          {engineersLoading ? (
            <Typography>جاري تحميل البيانات...</Typography>
          ) : (
            <Grid container spacing={3}>
              {engineersStats?.map((engineer, index) => (
                <Grid item xs={12} sm={6} md={4} key={engineer.engineerId}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {engineer.engineerName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {engineer.engineerPhone}
                      </Typography>
                      
                      <Grid container spacing={2} mt={1}>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="primary">
                            {engineer.totalRequests}
                          </Typography>
                          <Typography variant="caption">طلبات</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="success.main">
                            {engineer.completionRate.toFixed(1)}%
                          </Typography>
                          <Typography variant="caption">معدل الإنجاز</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="warning.main">
                            {engineer.averageRating.toFixed(1)}
                          </Typography>
                          <Typography variant="caption">التقييم</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h4" color="info.main">
                            {engineer.totalRevenue.toLocaleString()}
                          </Typography>
                          <Typography variant="caption">الإيرادات</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* أنواع الخدمات */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            إحصائيات أنواع الخدمات
          </Typography>
          {serviceTypesLoading ? (
            <Typography>جاري تحميل البيانات...</Typography>
          ) : (
            <Grid container spacing={3}>
              {serviceTypesStats?.map((serviceType, index) => (
                <Grid item xs={12} sm={6} md={4} key={serviceType._id || index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {serviceType._id || 'غير محدد'}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {serviceType.total}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        إجمالي الطلبات
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Box>
                          <Typography variant="body2" color="success.main">
                            {serviceType.completed}
                          </Typography>
                          <Typography variant="caption">مكتمل</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="info.main">
                            {serviceType.averageRevenue?.toFixed(0) || 0}
                          </Typography>
                          <Typography variant="caption">متوسط السعر</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* الإيرادات */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            اتجاهات الإيرادات
          </Typography>
          {revenueLoading ? (
            <Typography>جاري تحميل البيانات...</Typography>
          ) : (
            <Grid container spacing={3}>
              {revenueStats?.map((revenue, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {revenue._id}
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {revenue.totalRevenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        إجمالي الإيرادات
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        <Box>
                          <Typography variant="body2" color="primary">
                            {revenue.requestsCount}
                          </Typography>
                          <Typography variant="caption">طلبات</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="info.main">
                            {revenue.averageRevenue?.toFixed(0) || 0}
                          </Typography>
                          <Typography variant="caption">متوسط السعر</Typography>
                        </Box>
                      </Box>
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
