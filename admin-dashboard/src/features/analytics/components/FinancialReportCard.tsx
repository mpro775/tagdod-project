import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Alert,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FinancialReport } from '../types/analytics.types';

interface FinancialReportCardProps {
  data?: FinancialReport;
  isLoading?: boolean;
  error?: any;
}

export const FinancialReportCard: React.FC<FinancialReportCardProps> = ({
  data,
  isLoading = false,
  error,
}) => {
  const theme = useTheme();

  if (error) {
    return <Alert severity="error">حدث خطأ في تحميل التقرير المالي</Alert>;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            التقرير المالي
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

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            التقرير المالي
          </Typography>
          <Chip icon={<AssessmentIcon />} label="تحليل شامل" color="primary" variant="outlined" />
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="primary">
                    إجمالي الإيرادات
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(data?.revenue || 0)}
                  </Typography>
                </Box>
              </Box>
              {data?.revenueGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {data.revenueGrowth >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 20, mr: 1 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 20, mr: 1 }} />
                  )}
                  <Typography 
                    variant="h6" 
                    color={data.revenueGrowth >= 0 ? 'success.main' : 'error.main'}
                  >
                    {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}% من الفترة السابقة
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Cash Flow - Revenue Over Time */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                الإيرادات اليومية
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.cashFlow || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'revenue' ? 'الإيرادات اليومية' : 'الرصيد التراكمي',
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="balance"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Revenue by Source */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                الإيرادات حسب المصدر
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.revenueBySource || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {(data?.revenueBySource || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
