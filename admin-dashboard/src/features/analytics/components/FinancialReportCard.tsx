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
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

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
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {t('financialReport.title')}
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
            {t('financialReport.title')}
          </Typography>
          <Chip 
            icon={<AssessmentIcon />} 
            label={t('financialReport.comprehensiveAnalysis')} 
            color="primary" 
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
          />
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={breakpoint.isXs ? 1.5 : 3} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: breakpoint.isXs ? 1.5 : 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: breakpoint.isXs ? 1.5 : 2 }}>
                <AttachMoneyIcon 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    mr: 1, 
                    fontSize: breakpoint.isXs ? 28 : 40 
                  }} 
                />
                <Box>
                  <Typography 
                    variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                    color="primary"
                    sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                  >
                    {t('financialReport.totalRevenue')}
                  </Typography>
                  <Typography 
                    variant={breakpoint.isXs ? 'h4' : 'h3'} 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: breakpoint.isXs ? '1.75rem' : undefined,
                    }}
                  >
                    {formatCurrency(data?.revenue || 0)}
                  </Typography>
                </Box>
              </Box>
              {data?.revenueGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {data.revenueGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 16 : 20, 
                        mr: 1 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 16 : 20, 
                        mr: 1 
                      }} 
                    />
                  )}
                  <Typography 
                    variant={breakpoint.isXs ? 'body2' : 'h6'} 
                    color={data.revenueGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                  >
                    {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}% {t('financialReport.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={breakpoint.isXs ? 2 : 3}>
          {/* Cash Flow - Revenue Over Time */}
          <Grid size={{ xs: 12, lg: 8 }}>
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
                {t('financialReport.dailyRevenue')}
              </Typography>
              <ResponsiveContainer width="100%" height={breakpoint.isXs ? 250 : 300}>
                <LineChart data={data?.cashFlow || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: breakpoint.isXs ? 10 : 12 }}
                    angle={breakpoint.isXs ? -45 : 0}
                    textAnchor={breakpoint.isXs ? 'end' : 'middle'}
                    height={breakpoint.isXs ? 60 : undefined}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: breakpoint.isXs ? 10 : 12 }}
                    width={breakpoint.isXs ? 40 : undefined}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'revenue' ? t('financialReport.dailyRevenue') : t('financialReport.cumulativeBalance'),
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ar-SA')}
                    contentStyle={{
                      fontSize: breakpoint.isXs ? '12px' : '14px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke={theme.palette.primary.main}
                    strokeWidth={breakpoint.isXs ? 2 : 3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: breakpoint.isXs ? 3 : 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="balance"
                    stroke={theme.palette.success.main}
                    strokeWidth={breakpoint.isXs ? 1.5 : 2}
                    strokeDasharray="5 5"
                    dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: breakpoint.isXs ? 2 : 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Revenue by Source */}
          <Grid size={{ xs: 12, lg: 4 }}>
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
                {t('financialReport.revenueBySource')}
              </Typography>
              <ResponsiveContainer width="100%" height={breakpoint.isXs ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={data?.revenueBySource || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                    outerRadius={breakpoint.isXs ? 60 : 80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {(data?.revenueBySource || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      fontSize: breakpoint.isXs ? '12px' : '14px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
