import React from 'react';
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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { SalesAnalytics } from '../types/analytics.types';

interface SalesAnalyticsCardProps {
  data?: SalesAnalytics;
  isLoading?: boolean;
  error?: any;
}

export const SalesAnalyticsCard: React.FC<SalesAnalyticsCardProps> = ({
  data,
  isLoading = false,
  error,
}) => {
  const theme = useTheme();

  if (error) {
    return (
      <Alert severity="error">
        حدث خطأ في تحميل بيانات المبيعات
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            تحليلات المبيعات
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
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

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            تحليلات المبيعات
          </Typography>
          <Chip
            icon={<AssessmentIcon />}
            label="تحليل شامل"
            color="primary"
            variant="outlined"
          />
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
                <AttachMoneyIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="primary">
                  إجمالي الإيرادات
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(data?.totalRevenue || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12.5% من الشهر الماضي
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
                <ShoppingCartIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  إجمالي الطلبات
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.totalOrders || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +8.3% من الشهر الماضي
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
                <AttachMoneyIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  متوسط قيمة الطلب
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(data?.averageOrderValue || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="error.main">
                  -2.1% من الشهر الماضي
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
                <AssessmentIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  معدل النمو
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                15.2%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +3.2% من الشهر الماضي
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Sales Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                اتجاهات المبيعات
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.salesByDate || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                      name === 'revenue' ? 'الإيرادات' : 'الطلبات'
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke={theme.palette.secondary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Sales by Category */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                المبيعات حسب الفئة
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.salesByCategory || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {(data?.salesByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                طرق الدفع
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.salesByPaymentMethod || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                أفضل المنتجات
              </Typography>
              <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                {(data?.topProducts || []).map((product, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {product.product}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {formatCurrency(product.revenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        المبيعات: {formatNumber(product.sales)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round((product.sales / (data?.totalOrders || 1)) * 100)}% من إجمالي المبيعات
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(product.sales / (data?.totalOrders || 1)) * 100}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
