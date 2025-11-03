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
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing, getChartHeight, getChartMargin, getChartLabelFontSize, getChartTooltipFontSize, getYAxisWidth, getXAxisHeight } from '../utils/responsive';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
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
  BarChart,
  Bar,
} from 'recharts';
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
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  const chartHeight = getChartHeight(breakpoint, 200);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);

  if (error) {
    return (
      <Alert 
        severity="error"
        sx={{ m: breakpoint.isXs ? 1 : 2 }}
      >
        {t('salesAnalytics.loadError')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: cardPadding }}>
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {t('salesAnalytics.title')}
          </Typography>
          <Grid container spacing={breakpoint.isXs ? 1.5 : 3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rectangular" height={breakpoint.isXs ? 180 : 200} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rectangular" height={breakpoint.isXs ? 180 : 200} />
            </Grid>
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
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
      <CardContent sx={{ p: cardPadding }}>
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={cardSpacing}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
            gap: breakpoint.isXs ? 1.5 : 2,
          }}
        >
          <Typography 
            variant={breakpoint.isXs ? 'h6' : 'h5'} 
            component="h2"
            sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
          >
            {t('salesAnalytics.title')}
          </Typography>
          <Chip 
            icon={<AssessmentIcon />} 
            label={t('salesAnalytics.comprehensiveAnalysis')} 
            color="primary" 
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
          />
        </Stack>

        {/* Key Metrics */}
          <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}25, ${theme.palette.primary.main}15)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="primary"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('salesAnalytics.totalRevenue')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatCurrency(data?.totalRevenue || 0)}
              </Typography>
              {data?.revenueGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.revenueGrowth >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.revenueGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}% {t('salesAnalytics.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.secondary.main}25, ${theme.palette.secondary.main}15)`
                  : `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('salesAnalytics.totalOrders')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.totalOrders || 0)}
              </Typography>
              {data?.ordersGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.ordersGrowth >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.ordersGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.ordersGrowth >= 0 ? '+' : ''}{data.ordersGrowth.toFixed(1)}% {t('salesAnalytics.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.success.main}25, ${theme.palette.success.main}15)`
                  : `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon 
                  sx={{ 
                    color: theme.palette.success.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="success.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('salesAnalytics.averageOrderValue')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatCurrency(data?.averageOrderValue || 0)}
              </Typography>
              {data?.totalOrders && data.totalOrders > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {formatNumber(data.totalOrders)} {t('salesAnalytics.orders')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.warning.main}25, ${theme.palette.warning.main}15)`
                  : `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon 
                  sx={{ 
                    color: theme.palette.warning.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="warning.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('salesAnalytics.salesGrowthRate')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {data?.salesGrowth !== undefined 
                  ? `${data.salesGrowth >= 0 ? '+' : ''}${data.salesGrowth.toFixed(1)}%`
                  : t('salesAnalytics.noData')}
              </Typography>
              {data?.salesGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.salesGrowth >= 0 ? (
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.salesGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.salesGrowth >= 0 ? t('salesAnalytics.positiveGrowth') : t('salesAnalytics.decline')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={cardSpacing}>
          {/* Sales Trend Chart */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('salesAnalytics.salesTrends')}
              </Typography>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart 
                  data={data?.salesByDate || []}
                  margin={chartMargin}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                    tick={{ fontSize: labelFontSize }}
                    angle={breakpoint.isXs ? -45 : 0}
                    textAnchor={breakpoint.isXs ? 'end' : 'middle'}
                    height={xAxisHeight}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)} 
                    tick={{ fontSize: labelFontSize }}
                    width={yAxisWidth}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                      name === 'revenue' ? t('salesAnalytics.revenue') : t('salesAnalytics.totalOrders'),
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                    contentStyle={{
                      fontSize: `${tooltipFontSize}px`,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.palette.primary.main}
                    strokeWidth={breakpoint.isXs ? 2 : 3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: breakpoint.isXs ? 3 : 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={breakpoint.isXs ? 2 : 3}
                    dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: breakpoint.isXs ? 3 : 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Sales by Category */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('salesAnalytics.salesByCategory')}
              </Typography>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={data?.salesByCategory || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={breakpoint.isXs ? 60 : 80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {(data?.salesByCategory || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      fontSize: `${tooltipFontSize}px`,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Payment Methods */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('salesAnalytics.paymentMethods')}
              </Typography>
              <ResponsiveContainer width="100%" height={breakpoint.isXs ? 220 : 250}>
                <BarChart 
                  data={data?.salesByPaymentMethod || []}
                  margin={chartMargin}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="method" 
                    tick={{ fontSize: labelFontSize }}
                    angle={breakpoint.isXs ? -45 : 0}
                    textAnchor={breakpoint.isXs ? 'end' : 'middle'}
                    height={xAxisHeight}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)} 
                    tick={{ fontSize: labelFontSize }}
                    width={yAxisWidth}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      fontSize: `${tooltipFontSize}px`,
                    }}
                  />
                  <Bar dataKey="amount" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Top Products */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('salesAnalytics.topProducts')}
              </Typography>
              <Box sx={{ maxHeight: breakpoint.isXs ? 200 : 250, overflowY: 'auto' }}>
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
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: breakpoint.isXs ? '0.8125rem' : undefined,
                        }}
                      >
                        {product.product}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="primary"
                        sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                      >
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
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                      >
                        {t('salesAnalytics.sales')}: {formatNumber(product.sales)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                      >
                        {Math.round((product.sales / (data?.totalOrders || 1)) * 100)}% {t('salesAnalytics.ofTotal')} {t('salesAnalytics.sales')}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(product.sales / (data?.totalOrders || 1)) * 100}
                      sx={{ height: breakpoint.isXs ? 3 : 4, borderRadius: 2 }}
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
