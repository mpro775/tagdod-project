import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { TrendingUp, CalendarToday, EmojiEvents } from '@mui/icons-material';

interface RevenueIntelligenceProps {
  revenueCharts?: {
    daily?: Array<{ date: string; revenue: number; orders?: number }>;
    monthly?: Array<{ month: string; revenue: number; growth?: number }>;
  };
  salesAnalytics?: any;
  isLoading?: boolean;
}

export const RevenueIntelligence: React.FC<RevenueIntelligenceProps> = ({
  revenueCharts,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('dashboard');
  const [period, setPeriod] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', {
        day: 'numeric',
        month: 'short',
        calendar: 'gregory',
      }),
    [i18n.language],
  );

  const currencyFormatter = React.useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    [],
  );

  const formatDate = React.useCallback(
    (date: Date): string => {
      try { return dateFormatter.format(date); }
      catch { return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); }
    },
    [dateFormatter],
  );

  const getWeekKey = (date: Date): string => {
    const year = date.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `${year}-W${week}`;
  };

  const chartData = React.useMemo(() => {
    if (!revenueCharts) return [];
    if (period === 'daily') {
      return (revenueCharts.daily || []).slice(-14).map((item) => ({
        date: formatDate(new Date(item.date)),
        revenue: item.revenue || 0,
        orders: item.orders || 0,
      }));
    }
    if (period === 'weekly') {
      const daily = revenueCharts.daily || [];
      const weeklyMap = new Map<string, { revenue: number; orders: number; startDate: Date }>();
      daily.forEach((item) => {
        const d = new Date(item.date);
        const key = getWeekKey(d);
        const existing = weeklyMap.get(key);
        if (existing) {
          existing.revenue += item.revenue || 0;
          existing.orders += item.orders || 0;
        } else {
          weeklyMap.set(key, { revenue: item.revenue || 0, orders: item.orders || 0, startDate: d });
        }
      });
      return Array.from(weeklyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([, data]) => ({
          date: formatDate(data.startDate),
          revenue: data.revenue,
          orders: data.orders,
        }));
    }
    if (period === 'monthly') {
      return (revenueCharts.monthly || []).slice(-12).map((item) => ({
        date: item.month,
        revenue: item.revenue || 0,
        orders: 0,
      }));
    }
    return [];
  }, [revenueCharts, period, formatDate]);

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;
  const bestDay = chartData.length > 0
    ? chartData.reduce((best, item) => (item.revenue > best.revenue ? item : best), chartData[0])
    : null;

  if (isLoading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.08), height: '100%' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" height={18} />
          <Skeleton variant="rounded" height={260} sx={{ mt: 2, borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.08),
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {t('revenueChart.title', 'نظرة عامة على الإيرادات')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {period === 'daily' && t('revenueChart.average', 'متوسط {{value}} يومياً', { value: currencyFormatter.format(avgRevenue) })}
              {period === 'weekly' && t('revenueChart.averageWeekly', 'متوسط {{value}} أسبوعياً', { value: currencyFormatter.format(avgRevenue) })}
              {period === 'monthly' && t('revenueChart.averageMonthly', 'متوسط {{value}} شهرياً', { value: currencyFormatter.format(avgRevenue) })}
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, v) => v && setPeriod(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 1.5,
                py: 0.5,
                fontSize: '0.72rem',
                fontWeight: 600,
              },
            }}
          >
            <ToggleButton value="daily">{t('revenueChart.period.daily', 'يومي')}</ToggleButton>
            <ToggleButton value="weekly">{t('revenueChart.period.weekly', 'أسبوعي')}</ToggleButton>
            <ToggleButton value="monthly">{t('revenueChart.period.monthly', 'شهري')}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.06) }}>
            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" noWrap>{t('compact.periodTotal', 'إجمالي الفترة')}</Typography>
              <Typography variant="body2" fontWeight={700} noWrap>{currencyFormatter.format(totalRevenue)}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.info.main, 0.06) }}>
            <CalendarToday sx={{ fontSize: 16, color: 'info.main' }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" noWrap>{t('compact.dailyAverage', 'متوسط يومي')}</Typography>
              <Typography variant="body2" fontWeight={700} noWrap>{currencyFormatter.format(avgRevenue)}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.06) }}>
            <EmojiEvents sx={{ fontSize: 16, color: 'warning.main' }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" noWrap>{t('compact.bestDay', 'أفضل يوم')}</Typography>
              <Typography variant="body2" fontWeight={700} noWrap>{bestDay ? currencyFormatter.format(bestDay.revenue) : '—'}</Typography>
            </Box>
          </Box>
        </Box>

        {chartData.length === 0 ? (
          <Box sx={{ height: { xs: 200, sm: 240 }, display: 'grid', placeItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('revenueChart.noData', 'لا توجد إيرادات في هذه الفترة')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: { xs: 220, sm: 260, md: 280 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tagadodRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.success.main} stopOpacity={0.34} />
                    <stop offset="100%" stopColor={theme.palette.success.main} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.14)' : 'rgba(0,0,0,0.06)'} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(226,232,240,.68)' : 'rgba(0,0,0,.54)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(226,232,240,.68)' : 'rgba(0,0,0,.54)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255,255,255,0.97)',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.22)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: 12,
                    color: theme.palette.mode === 'dark' ? '#F8FAFC' : '#17212B',
                    fontSize: 13,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                  formatter={(value) => [currencyFormatter.format(Number(value)), t('revenueChart.tooltip.revenue', 'الإيرادات')]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tagadodRevenueGradient)"
                  name={t('revenueChart.legend.revenue', 'الإيرادات')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};