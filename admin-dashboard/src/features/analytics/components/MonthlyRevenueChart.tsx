import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  getChartHeight,
  getChartMargin,
  getChartLabelFontSize,
  getChartTooltipFontSize,
  getYAxisWidth,
  getXAxisHeight,
  getCardPadding,
} from '../utils/responsive';
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency, formatPercent, formatMonthLabel } from '../utils/formatters';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface RevenueMonthlyItem {
  date: string;
  month?: string;
  revenue: number;
  growth: number;
}

interface MonthlyRevenueChartProps {
  data?: RevenueMonthlyItem[];
  title?: string;
}

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ data, title }) => {
  const theme = useTheme();
  const breakpoint = useBreakpoint();

  const chartHeight = getChartHeight(breakpoint, 350);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);
  const cardPadding = getCardPadding(breakpoint);
  const needsRotation = breakpoint.isXs || breakpoint.isSm;

  const safeData = asArray<RevenueMonthlyItem>(data);

  const hasMeaningfulData = safeData.some((item) => (item.revenue ?? 0) > 0);

  if (safeData.length === 0 || !hasMeaningfulData) {
    return (
      <EmptyAnalyticsState
        title="لا توجد بيانات إيرادات شهرية"
        description="لا توجد بيانات إيرادات شهرية ضمن الفترة المحددة."
      />
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: cardPadding }}>
        <Typography
          variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
          gutterBottom
          sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
        >
          {title ?? 'الإيرادات الشهرية والنمو'}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={safeData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: labelFontSize }}
              tickFormatter={(value) => formatMonthLabel(value)}
              angle={needsRotation ? -45 : 0}
              textAnchor={needsRotation ? 'end' : 'middle'}
              height={xAxisHeight}
              interval={breakpoint.isXs ? 'preserveStartEnd' : 0}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: labelFontSize }}
              width={yAxisWidth}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: labelFontSize }}
              width={yAxisWidth}
              tickFormatter={(value) => formatPercent(value)}
            />
            <Tooltip
              contentStyle={{
                fontSize: `${tooltipFontSize}px`,
                padding: breakpoint.isXs ? '8px' : '12px',
                direction: 'rtl',
                textAlign: 'right',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [formatCurrency(value), 'الإيراد'];
                if (name === 'growth') return [formatPercent(value), 'نسبة النمو'];
                return [value, name];
              }}
              labelFormatter={(label) => formatMonthLabel(label)}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke={theme.palette.primary.main}
              strokeWidth={breakpoint.isXs ? 1.5 : 2}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: breakpoint.isXs ? 2.5 : 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growth"
              stroke={theme.palette.warning.main}
              strokeWidth={breakpoint.isXs ? 1.5 : 2}
              strokeDasharray="5 5"
              dot={{ fill: theme.palette.warning.main, strokeWidth: 2, r: breakpoint.isXs ? 2.5 : 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
