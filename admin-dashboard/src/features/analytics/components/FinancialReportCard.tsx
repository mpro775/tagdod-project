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
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
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
import { useFinancialReport } from '../hooks/useAnalytics';
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency } from '../utils/formatters';
import { AnalyticsCardErrorBoundary } from './AnalyticsCardErrorBoundary';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';
import { PeriodType } from '../types/analytics.types';

interface FinancialReportCardProps {
  period?: PeriodType;
}

export const FinancialReportCard: React.FC<FinancialReportCardProps> = ({ period }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

  const { data, isLoading, error } = useFinancialReport({ period });

  if (error) {
    return (
      <Alert severity="error" sx={{ m: breakpoint.isXs ? 1 : 2 }}>
        {t('financialReport.loadError')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('financialReport.title')}
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

  const cashFlow = asArray(data?.cashFlow);
  const revenueBySource = asArray(data?.revenueBySource);

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
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {t('financialReport.title')}
          </Typography>
          <Chip icon={<AssessmentIcon />} label={t('financialReport.comprehensiveAnalysis')} color="primary" variant="outlined" />
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
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
                    {t('financialReport.totalRevenue')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(data?.revenue ?? 0)}
                  </Typography>
                </Box>
              </Box>
              {data?.revenueGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {data.revenueGrowth >= 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20, mr: 1 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20, mr: 1 }} />
                  )}
                  <Typography variant="h6" color={data.revenueGrowth >= 0 ? 'success.main' : 'error.main'}>
                    {data.revenueGrowth >= 0 ? '+' : ''}{Number(data.revenueGrowth).toFixed(1)}% {t('financialReport.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض التدفق النقدي">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('financialReport.dailyRevenue')}
                </Typography>
                {cashFlow.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={cashFlow}>
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
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip
formatter={(value, name) => [
                           formatCurrency(Number(value)),
                           name === 'revenue' ? 'الإيراد' : 'الرصيد التراكمي',
                         ]}
                        labelFormatter={(value) => {
                          try {
                            return new Date(value).toLocaleDateString('ar-YE');
                          } catch {
                            return value;
                          }
                        }}
                        contentStyle={{ direction: 'rtl', textAlign: 'right' }}
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
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد بيانات تدفق نقدي." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض مصادر الإيراد">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t('financialReport.revenueBySource')}
                </Typography>
                {revenueBySource.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueBySource}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percentage }: any) => `${source}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {revenueBySource.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد مصادر إيراد." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
