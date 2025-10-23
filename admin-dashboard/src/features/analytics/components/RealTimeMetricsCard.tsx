import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
  useTheme,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Support as SupportIcon,
  Inventory as InventoryIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkCheckIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { RealTimeMetrics } from '../types/analytics.types';

interface RealTimeMetricsCardProps {
  data?: RealTimeMetrics;
  isLoading?: boolean;
  error?: any;
}

export const RealTimeMetricsCard: React.FC<RealTimeMetricsCardProps> = ({
  data,
  isLoading = false,
  error,
}) => {
  const theme = useTheme();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (data?.lastUpdated) {
      setLastUpdated(new Date(data.lastUpdated));
    }
  }, [data?.lastUpdated]);

  if (error) {
    return (
      <Alert severity="error">
        حدث خطأ في تحميل المقاييس الفورية
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            المقاييس الفورية
          </Typography>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'critical':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getSystemHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'critical':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <WarningIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getSystemHealthText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'صحي';
      case 'warning':
        return 'تحذير';
      case 'critical':
        return 'حرج';
      default:
        return 'غير معروف';
    }
  };

  // Generate mock real-time data for charts
  const generateRealTimeData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000); // Every minute
      data.push({
        time: time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        activeUsers: Math.floor(Math.random() * 100) + 50,
        apiResponseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: Math.random() * 5,
        memoryUsage: Math.random() * 20 + 60,
        cpuUsage: Math.random() * 30 + 40,
      });
    }
    return data;
  };

  const realTimeData = generateRealTimeData();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            المقاييس الفورية
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<SpeedIcon />}
              label={`آخر تحديث: ${lastUpdated.toLocaleTimeString('ar-SA')}`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Tooltip title="تحديث البيانات">
              <IconButton size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* System Health Status */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${getSystemHealthColor(data?.systemHealth?.status || 'healthy')}15, ${getSystemHealthColor(data?.systemHealth?.status || 'healthy')}05)`,
              border: `1px solid ${getSystemHealthColor(data?.systemHealth?.status || 'healthy')}20`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getSystemHealthIcon(data?.systemHealth?.status || 'healthy')}
              <Typography variant="h6" sx={{ ml: 1 }}>
                حالة النظام: {getSystemHealthText(data?.systemHealth?.status || 'healthy')}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  وقت استجابة API
                </Typography>
                <Typography variant="h6">
                  {data?.systemHealth?.apiResponseTime || 0}ms
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  معدل الأخطاء
                </Typography>
                <Typography variant="h6">
                  {(data?.systemHealth?.errorRate || 0).toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  وقت التشغيل
                </Typography>
                <Typography variant="h6">
                  {(data?.systemHealth?.uptime || 0).toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  الاتصالات النشطة
                </Typography>
                <Typography variant="h6">
                  {data?.activeConnections || 0}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="primary">
                  المستخدمون النشطون
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.activeUsers || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +5.2% من الساعة الماضية
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  مبيعات اليوم
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(data?.todaySales || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12.8% من أمس
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  طلبات اليوم
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.todayOrders || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +8.5% من أمس
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SupportIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  تذاكر الدعم
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.pendingSupportTickets || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDownIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  -3.2% من أمس
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Performance Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                استخدام الموارد
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MemoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2">الذاكرة</Typography>
                  </Box>
                  <Typography variant="body2" color="primary">
                    {data?.systemHealth?.memoryUsage || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.systemHealth?.memoryUsage || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">المعالج</Typography>
                  </Box>
                  <Typography variant="body2" color="secondary">
                    {data?.systemHealth?.cpuUsage || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.systemHealth?.cpuUsage || 0}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StorageIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="body2">التخزين</Typography>
                  </Box>
                  <Typography variant="body2" color="success.main">
                    {data?.systemHealth?.diskUsage || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.systemHealth?.diskUsage || 0}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                النشاط الفوري
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Metrics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Badge badgeContent={data?.lowStockAlerts || 0} color="error">
                <InventoryIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                تنبيهات المخزون
              </Typography>
              <Typography variant="body2" color="text.secondary">
                منتجات تحتاج إعادة تموين
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Badge badgeContent={data?.activeOrders || 0} color="primary">
                <ShoppingCartIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                الطلبات النشطة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                طلبات قيد المعالجة
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Badge badgeContent={data?.todayNewCustomers || 0} color="success">
                <PeopleIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                عملاء جدد اليوم
              </Typography>
              <Typography variant="body2" color="text.secondary">
                تسجيلات جديدة
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Badge badgeContent={data?.todayAbandonedCarts || 0} color="warning">
                <ShoppingCartIcon sx={{ fontSize: 40, color: theme.palette.warning.main }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                سلات مهجورة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                سلات لم تكتمل
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
