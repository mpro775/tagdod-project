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
import { useCustomerAnalytics } from '../hooks/useAnalytics';
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { translateUserRole } from '../utils/translations';
import { AnalyticsCardErrorBoundary } from './AnalyticsCardErrorBoundary';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';
import { PeriodType } from '../types/analytics.types';

interface CustomerAnalyticsCardProps {
  period?: PeriodType;
}

export const CustomerAnalyticsCard: React.FC<CustomerAnalyticsCardProps> = ({ period }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

  const { data, isLoading, error } = useCustomerAnalytics({ period });

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
          <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
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

  const customerSegments = asArray(data?.customerSegments).map(({ customerIds, ...safe }) => safe);
  const topCustomers = asArray(data?.topCustomers);

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
          <Typography variant={breakpoint.isXs ? 'h6' : 'h5'} component="h2">
            {t('customerAnalytics.title')}
          </Typography>
          <Chip
            icon={<AssessmentIcon />}
            label={t('customerAnalytics.comprehensiveAnalysis')}
            color="primary"
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
          />
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={breakpoint.isXs ? 1.5 : 3} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          {[
            {
              label: t('customerAnalytics.totalCustomers'),
              value: formatNumber(data?.totalCustomers),
              growth: data?.totalCustomersGrowth,
              icon: <PeopleIcon />,
              color: 'primary' as const,
            },
            {
              label: t('customerAnalytics.newCustomers'),
              value: formatNumber(data?.newCustomers),
              growth: data?.newCustomersGrowth,
              icon: <PersonAddIcon />,
              color: 'secondary' as const,
            },
            {
              label: t('customerAnalytics.activeCustomers'),
              value: formatNumber(data?.activeCustomers),
              growth: data?.activeCustomersGrowth,
              icon: <PeopleIcon />,
              color: 'success' as const,
            },
            {
              label: t('customerAnalytics.customerValue'),
              value: formatCurrency(data?.customerLifetimeValue),
              growth: data?.customerLifetimeValueGrowth,
              icon: <AttachMoneyIcon />,
              color: 'warning' as const,
            },
          ].map((kpi, idx) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={idx}>
              <Box
                sx={{
                  p: breakpoint.isXs ? 1.5 : 2,
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
        <Grid container spacing={breakpoint.isXs ? 2 : 3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض شرائح العملاء">
              <Box sx={{ p: breakpoint.isXs ? 1.5 : 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
                  {t('customerAnalytics.customerSegments')}
                </Typography>
                {customerSegments.length > 0 ? (
                  <ResponsiveContainer width="100%" height={breakpoint.isXs ? 250 : 300}>
                    <PieChart>
                      <Pie
                        data={customerSegments}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, percentage }: any) => `${translateUserRole(segment)}: ${percentage}%`}
                        outerRadius={breakpoint.isXs ? 60 : 80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {customerSegments.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: breakpoint.isXs ? '12px' : '14px', direction: 'rtl', textAlign: 'right' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد شرائح عملاء." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض أفضل العملاء">
              <Box sx={{ p: breakpoint.isXs ? 1.5 : 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant={breakpoint.isXs ? 'subtitle1' : 'h6'} gutterBottom>
                  {t('customerAnalytics.topCustomers')}
                </Typography>
                {topCustomers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={breakpoint.isXs ? 250 : 300}>
                    <BarChart
                      data={topCustomers}
                      margin={{
                        top: 5,
                        right: breakpoint.isXs ? 10 : 30,
                        left: breakpoint.isXs ? 0 : 20,
                        bottom: breakpoint.isXs ? 0 : 5,
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
                        contentStyle={{ fontSize: breakpoint.isXs ? '12px' : '14px', direction: 'rtl', textAlign: 'right' }}
                        formatter={(value: number, name: string) => [
                          name === 'orders' ? formatNumber(value) : formatCurrency(value),
                          name === 'orders' ? 'الطلبات' : 'إجمالي الإنفاق',
                        ]}
                      />
                      <Bar dataKey="orders" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا يوجد عملاء مميزون." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
