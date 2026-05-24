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
import {
  getCardPadding,
  getCardSpacing,
  getChartHeight,
  getChartMargin,
  getChartLabelFontSize,
  getChartTooltipFontSize,
  getYAxisWidth,
  getXAxisHeight,
} from '../utils/responsive';
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
import { useSalesAnalytics } from '../hooks/useAnalytics';
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { translatePaymentMethod } from '../utils/translations';
import { AnalyticsCardErrorBoundary } from './AnalyticsCardErrorBoundary';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';
import { PeriodType } from '../types/analytics.types';

interface SalesAnalyticsCardProps {
  period?: PeriodType;
}

export const SalesAnalyticsCard: React.FC<SalesAnalyticsCardProps> = ({ period }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  const chartHeight = getChartHeight(breakpoint, 220);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);

  const { data, isLoading, error } = useSalesAnalytics({ period });

  if (error) {
    return (
      <Alert severity="error" sx={{ m: breakpoint.isXs ? 1 : 2 }}>
        {t('salesAnalytics.loadError')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: cardPadding }}>
          <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
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

  const salesByDate = asArray(data?.salesByDate);
  const salesByCategory = asArray(data?.salesByCategory);
  const salesByPaymentMethod = asArray(data?.salesByPaymentMethod);
  const topProducts = asArray(data?.topProducts);

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
          <Typography variant={breakpoint.isXs ? 'h6' : 'h5'} component="h2">
            {t('salesAnalytics.title')}
          </Typography>
          <Chip
            icon={<AssessmentIcon />}
            label={t('salesAnalytics.comprehensiveAnalysis')}
            color="primary"
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
          />
        </Stack>

        {/* KPIs */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          {[
            {
              label: t('salesAnalytics.totalRevenue'),
              value: formatCurrency(data?.totalRevenue),
              growth: data?.revenueGrowth,
              icon: <AttachMoneyIcon />,
              color: 'primary' as const,
            },
            {
              label: t('salesAnalytics.totalOrders'),
              value: formatNumber(data?.totalOrders),
              growth: data?.ordersGrowth,
              icon: <ShoppingCartIcon />,
              color: 'secondary' as const,
            },
            {
              label: t('salesAnalytics.averageOrderValue'),
              value: formatCurrency(data?.averageOrderValue),
              growth: undefined,
              icon: <AttachMoneyIcon />,
              color: 'success' as const,
            },
            {
              label: t('salesAnalytics.salesGrowthRate'),
              value: data?.salesGrowth !== undefined ? `${data.salesGrowth >= 0 ? '+' : ''}${Number(data.salesGrowth).toFixed(1)}%` : '—',
              growth: undefined,
              icon: <AssessmentIcon />,
              color: 'warning' as const,
            },
          ].map((kpi, idx) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={idx}>
              <Box
                sx={{
                  p: cardPadding,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette[kpi.color].main}15, ${theme.palette[kpi.color].main}05)`,
                  border: `1px solid ${theme.palette[kpi.color].main}20`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {React.cloneElement(kpi.icon, {
                    sx: { color: theme.palette[kpi.color].main, mr: 1, fontSize: breakpoint.isXs ? '1.25rem' : undefined },
                  })}
                  <Typography variant={breakpoint.isXs ? 'subtitle2' : 'h6'} color={`${kpi.color}.main`}>
                    {kpi.label}
                  </Typography>
                </Box>
                <Typography variant={breakpoint.isXs ? 'h5' : 'h4'} sx={{ fontWeight: 'bold' }}>
                  {kpi.value}
                </Typography>
                {kpi.growth !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {kpi.growth >= 0 ? (
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: 'error.main', fontSize: breakpoint.isXs ? 14 : 16, mr: 0.5 }} />
                    )}
                    <Typography variant="body2" color={kpi.growth >= 0 ? 'success.main' : 'error.main'}>
                      {kpi.growth >= 0 ? '+' : ''}{Number(kpi.growth).toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={cardSpacing}>
          {/* Sales Trend */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض اتجاه المبيعات">
              <Box sx={{ p: cardPadding, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
                  {t('salesAnalytics.salesTrends')}
                </Typography>
                {salesByDate.length > 0 ? (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <LineChart data={salesByDate} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          try {
                            return new Date(value).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' });
                          } catch {
                            return value;
                          }
                        }}
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
formatter={(value, name) => [
                           name === 'revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                           name === 'revenue' ? 'الإيراد' : 'الطلبات',
                         ]}
                        labelFormatter={(value) => {
                          try {
                            return new Date(value).toLocaleDateString('ar-YE');
                          } catch {
                            return value;
                          }
                        }}
                        contentStyle={{ fontSize: `${tooltipFontSize}px`, direction: 'rtl', textAlign: 'right' }}
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
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد بيانات مبيعات حسب التاريخ." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          {/* Sales by Category */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض الفئات">
              <Box sx={{ p: cardPadding, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
                  {t('salesAnalytics.salesByCategory')}
                </Typography>
                {salesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }: any) => `${category}: ${percentage}%`}
                        outerRadius={breakpoint.isXs ? 60 : 80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {salesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ fontSize: `${tooltipFontSize}px`, direction: 'rtl', textAlign: 'right' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد فئات مبيعات." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          {/* Payment Methods */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض طرق الدفع">
              <Box sx={{ p: cardPadding, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
                  {t('salesAnalytics.paymentMethods')}
                </Typography>
                {salesByPaymentMethod.length > 0 ? (
                  <ResponsiveContainer width="100%" height={breakpoint.isXs ? 220 : 250}>
                    <BarChart data={salesByPaymentMethod} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="method"
                        tickFormatter={(value) => translatePaymentMethod(value)}
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
formatter={(value, name) => [
                           formatCurrency(Number(value)),
                           name === 'amount' ? 'المبلغ' : 'العدد',
                         ]}
                        contentStyle={{ fontSize: `${tooltipFontSize}px`, direction: 'rtl', textAlign: 'right' }}
                      />
                      <Bar dataKey="amount" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد بيانات طرق الدفع." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          {/* Top Products */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض أفضل المنتجات">
              <Box sx={{ p: cardPadding, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
                  {t('salesAnalytics.topProducts')}
                </Typography>
                {topProducts.length > 0 ? (
                  <Box sx={{ maxHeight: breakpoint.isXs ? 200 : 250, overflowY: 'auto' }}>
                    {topProducts.map((product, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {product.name ?? product.product ?? '—'}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {formatCurrency(product.revenue)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            المبيعات: {formatNumber(product.sales ?? product.sold)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            ((product.sales ?? product.sold ?? 0) / Math.max(data?.totalOrders || 1, 1)) * 100,
                            100
                          )}
                          sx={{ height: breakpoint.isXs ? 3 : 4, borderRadius: 2 }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد منتجات مباعة." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
