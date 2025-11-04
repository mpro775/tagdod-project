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
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing, getChartHeight, getChartMargin, getChartLabelFontSize, getChartTooltipFontSize, getYAxisWidth, getXAxisHeight } from '../utils/responsive';
import {
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
import { CustomerAnalytics } from '../types/analytics.types';

interface CustomerAnalyticsCardProps {
  data?: CustomerAnalytics;
  isLoading?: boolean;
  error?: any;
}

export const CustomerAnalyticsCard: React.FC<CustomerAnalyticsCardProps> = ({
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
      <Alert severity="error" sx={{ m: breakpoint.isXs ? 1 : 2 }}>
        {t('customerAnalytics.loadError')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {t('customerAnalytics.title')}
          </Typography>
          <Grid container spacing={breakpoint.isXs ? 1.5 : 2}>
            {[...Array(4)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Skeleton variant="rectangular" height={breakpoint.isXs ? 90 : 100} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
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

  return (
    <Card>
      <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={breakpoint.isXs ? 1.5 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
          }}
        >
          <Typography 
            variant={breakpoint.isXs ? 'h6' : 'h5'} 
            component="h2"
            sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
          >
            {t('customerAnalytics.title')}
          </Typography>
          <Chip 
            icon={<AssessmentIcon />} 
            label={t('customerAnalytics.comprehensiveAnalysis')} 
            color="primary" 
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
          />
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={breakpoint.isXs ? 1.5 : 3} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}25, ${theme.palette.primary.main}15)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon 
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
                  {t('customerAnalytics.totalCustomers')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.totalCustomers || 0)}
              </Typography>
              {data?.totalCustomersGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.totalCustomersGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.totalCustomersGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.totalCustomersGrowth >= 0 ? '+' : ''}{data.totalCustomersGrowth.toFixed(1)}% {t('customerAnalytics.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.secondary.main}25, ${theme.palette.secondary.main}15)`
                  : `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonAddIcon 
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
                  {t('customerAnalytics.newCustomers')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.newCustomers || 0)}
              </Typography>
              {data?.newCustomersGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.newCustomersGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.newCustomersGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.newCustomersGrowth >= 0 ? '+' : ''}{data.newCustomersGrowth.toFixed(1)}% {t('customerAnalytics.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon 
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
                  {t('customerAnalytics.activeCustomers')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.activeCustomers || 0)}
              </Typography>
              {data?.activeCustomersGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.activeCustomersGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.activeCustomersGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.activeCustomersGrowth >= 0 ? '+' : ''}{data.activeCustomersGrowth.toFixed(1)}% {t('customerAnalytics.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon 
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
                  {t('customerAnalytics.customerValue')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatCurrency(data?.customerLifetimeValue || 0)}
              </Typography>
              {data?.customerLifetimeValueGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.customerLifetimeValueGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.customerLifetimeValueGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.customerLifetimeValueGrowth >= 0 ? '+' : ''}{data.customerLifetimeValueGrowth.toFixed(1)}% {t('customerAnalytics.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={breakpoint.isXs ? 2 : 3}>
          {/* Customer Segments */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box 
              sx={{ 
                p: breakpoint.isXs ? 1.5 : 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('customerAnalytics.customerSegments')}
              </Typography>
              <ResponsiveContainer width="100%" height={breakpoint.isXs ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={data?.customerSegments || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                    outerRadius={breakpoint.isXs ? 60 : 80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(data?.customerSegments || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      fontSize: breakpoint.isXs ? '12px' : '14px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Top Customers */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box 
              sx={{ 
                p: breakpoint.isXs ? 1.5 : 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('customerAnalytics.topCustomers')}
              </Typography>
              <ResponsiveContainer width="100%" height={breakpoint.isXs ? 250 : 300}>
                <BarChart 
                  data={data?.topCustomers || []}
                  margin={{ 
                    top: 5, 
                    right: breakpoint.isXs ? 10 : 30, 
                    left: breakpoint.isXs ? 0 : 20, 
                    bottom: breakpoint.isXs ? 0 : 5 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: breakpoint.isXs ? 10 : 12 }}
                    angle={breakpoint.isXs ? -45 : 0}
                    textAnchor={breakpoint.isXs ? 'end' : 'middle'}
                    height={breakpoint.isXs ? 60 : undefined}
                  />
                  <YAxis 
                    tick={{ fontSize: breakpoint.isXs ? 10 : 12 }}
                    width={breakpoint.isXs ? 40 : undefined}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: breakpoint.isXs ? '12px' : '14px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'orders' ? formatNumber(value) : formatCurrency(value),
                      name === 'orders' ? t('customerAnalytics.orders') : t('customerAnalytics.totalSpending'),
                    ]}
                  />
                  <Bar dataKey="orders" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
