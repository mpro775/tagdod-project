import React, { useState } from 'react';
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
  Tooltip as MuiTooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PeriodType } from '../types/analytics.types';
import { useProductPerformance } from '../hooks/useAnalytics';

interface ProductPerformanceCardProps {
  initialPeriod?: PeriodType;
}

export const ProductPerformanceCard: React.FC<ProductPerformanceCardProps> = ({
  initialPeriod = PeriodType.MONTHLY,
}) => {
  const theme = useTheme();
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);

  const { data, isLoading, error, refetch } = useProductPerformance({ period });

  const handleRefresh = () => {
    refetch();
  };

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  };

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton size="small" onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      }>
        حدث خطأ في تحميل بيانات أداء المنتجات. الرجاء المحاولة مرة أخرى.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            أداء المنتجات
          </Typography>
          <Grid container spacing={2}>
            {[...Array(4)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };


  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const getTrendIcon = (growth?: number) => {
    if (!growth && growth !== 0) return null;
    return growth >= 0 ? (
      <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
    ) : (
      <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 16, mr: 0.5 }} />
    );
  };

  const getTrendColor = (growth?: number) => {
    if (!growth && growth !== 0) return 'text.secondary';
    return growth >= 0 ? 'success.main' : 'error.main';
  };

  const formatGrowth = (growth?: number) => {
    if (!growth && growth !== 0) return '0%';
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}% من الفترة السابقة`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="h2">
              أداء المنتجات
            </Typography>
            <Chip icon={<AssessmentIcon />} label="تحليل شامل" color="primary" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>الفترة الزمنية</InputLabel>
              <Select
                value={period}
                label="الفترة الزمنية"
                onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
              >
                <MenuItem value={PeriodType.DAILY}>يومي</MenuItem>
                <MenuItem value={PeriodType.WEEKLY}>أسبوعي</MenuItem>
                <MenuItem value={PeriodType.MONTHLY}>شهري</MenuItem>
                <MenuItem value={PeriodType.QUARTERLY}>ربع سنوي</MenuItem>
                <MenuItem value={PeriodType.YEARLY}>سنوي</MenuItem>
              </Select>
            </FormControl>
            <MuiTooltip title="تحديث البيانات">
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="primary">
                  إجمالي المنتجات
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.totalProducts || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.totalProductsGrowth)}
                <Typography variant="body2" color={getTrendColor(data?.totalProductsGrowth)}>
                  {formatGrowth(data?.totalProductsGrowth)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  إجمالي المبيعات
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.totalSales || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.totalSalesGrowth)}
                <Typography variant="body2" color={getTrendColor(data?.totalSalesGrowth)}>
                  {formatGrowth(data?.totalSalesGrowth)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  متوسط التقييم
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data?.averageRating?.toFixed(1) || '0.0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.averageRatingGrowth)}
                <Typography variant="body2" color={getTrendColor(data?.averageRatingGrowth)}>
                  {formatGrowth(data?.averageRatingGrowth)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  تنبيهات المخزون
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data?.lowStockProducts?.length || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.lowStockGrowth)}
                <Typography variant="body2" color={getTrendColor(data?.lowStockGrowth)}>
                  {formatGrowth(data?.lowStockGrowth)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Top Products Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                أفضل المنتجات
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'sales' ? formatNumber(value) : formatCurrency(value),
                      name === 'sales' ? 'المبيعات' : 'الإيرادات',
                    ]}
                  />
                  <Bar dataKey="sales" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Category Distribution */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                التوزيع حسب الفئة
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.byCategory || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(data?.byCategory || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Low Stock Products */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                منتجات مخزون منخفض
              </Typography>
              <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                {(data?.lowStockProducts || []).map((product, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        {product.stock} وحدة
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(product.stock / 100) * 100}
                      color="warning"
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Top Products List */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                قائمة أفضل المنتجات
              </Typography>
              <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                {(data?.topProducts || []).map((product, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {formatCurrency(product.revenue)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        المبيعات: {formatNumber(product.sales)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        التقييم: {product.rating}/5
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(product.sales / (data?.totalSales || 1)) * 100}
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
