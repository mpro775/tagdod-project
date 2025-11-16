import React from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Skeleton } from '@mui/material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';

interface RevenueChartProps {
  revenueCharts?: {
    daily?: Array<{ date: string; revenue: number; orders?: number }>;
    monthly?: Array<{ month: string; revenue: number; growth?: number }>;
  };
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ revenueCharts, isLoading }) => {
  const [period, setPeriod] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { t, i18n } = useTranslation(['dashboard']);
  // Use Gregorian calendar (Miladi) - 'ar' uses Gregorian, 'ar-SA' uses Hijri
  // Always use 'en-US' locale for dates to ensure Gregorian calendar
  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', {
        day: 'numeric',
        month: 'short',
        calendar: 'gregory', // Explicitly use Gregorian calendar
      }),
    [i18n.language]
  );
  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    []
  );

  // Helper function to format date using Gregorian calendar
  const formatDate = React.useCallback(
    (date: Date): string => {
      try {
        return dateFormatter.format(date);
      } catch {
        // Fallback to simple format if Intl API fails
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
    },
    [dateFormatter]
  );

  // Helper function to get week number and year from date
  const getWeekKey = (date: Date): string => {
    const year = date.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `${year}-W${week}`;
  };

  // Transform data based on selected period
  const chartData = React.useMemo(() => {
    if (!revenueCharts) return [];

    if (period === 'daily') {
      const dailyData = revenueCharts.daily || [];
      return dailyData.slice(-14).map(item => ({
        date: formatDate(new Date(item.date)),
        revenue: item.revenue || 0,
        orders: item.orders || 0,
      }));
    }

    if (period === 'weekly') {
      const dailyData = revenueCharts.daily || [];
      const weeklyMap = new Map<string, { revenue: number; orders: number; startDate: Date }>();
      
      dailyData.forEach(item => {
        const date = new Date(item.date);
        const weekKey = getWeekKey(date);
        const existing = weeklyMap.get(weekKey);
        
        if (existing) {
          existing.revenue += item.revenue || 0;
          existing.orders += item.orders || 0;
        } else {
          weeklyMap.set(weekKey, {
            revenue: item.revenue || 0,
            orders: item.orders || 0,
            startDate: date,
          });
        }
      });

      return Array.from(weeklyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([weekKey, data]) => ({
          date: formatDate(data.startDate),
          revenue: data.revenue,
          orders: data.orders,
        }));
    }

    if (period === 'monthly') {
      const monthlyData = revenueCharts.monthly || [];
      return monthlyData.slice(-12).map(item => ({
        date: item.month,
        revenue: item.revenue || 0,
        orders: 0,
      }));
    }

    return [];
  }, [revenueCharts, period, formatDate]);

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('revenueChart.title', 'نظرة عامة على الإيرادات')}
          </Typography>
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rectangular" height={32} width="60%" />
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {t('revenueChart.title', 'نظرة عامة على الإيرادات')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {period === 'daily' && t('revenueChart.average', 'متوسط {{value}} يومياً', {
                value: currencyFormatter.format(avgRevenue),
              })}
              {period === 'weekly' && t('revenueChart.averageWeekly', 'متوسط {{value}} أسبوعياً', {
                value: currencyFormatter.format(avgRevenue),
              })}
              {period === 'monthly' && t('revenueChart.averageMonthly', 'متوسط {{value}} شهرياً', {
                value: currencyFormatter.format(avgRevenue),
              })}
            </Typography>
          </Box>
          
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, newPeriod) => newPeriod && setPeriod(newPeriod)}
            size="small"
          >
            <ToggleButton value="daily">{t('revenueChart.period.daily', 'يومي')}</ToggleButton>
            <ToggleButton value="weekly">{t('revenueChart.period.weekly', 'أسبوعي')}</ToggleButton>
            <ToggleButton value="monthly">{t('revenueChart.period.monthly', 'شهري')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                style={{ fontSize: '12px' }}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                style={{ fontSize: '12px' }}
                tick={{ fill: '#666' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [currencyFormatter.format(value), t('revenueChart.tooltip.revenue', 'الإيرادات')]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4caf50"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name={t('revenueChart.legend.revenue', 'الإيرادات')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

