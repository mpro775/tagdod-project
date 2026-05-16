import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
import { formatCurrency, formatNumber, formatDateLabel } from '../utils/formatters';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface RevenueDailyItem {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data?: RevenueDailyItem[];
  title?: string;
  height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title, height }) => {
  const theme = useTheme();
  const breakpoint = useBreakpoint();

  const safeData = asArray<RevenueDailyItem>(data);
  const chartHeight = getChartHeight(breakpoint, height || 350);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);
  const cardPadding = getCardPadding(breakpoint);
  const needsRotation = breakpoint.isXs || breakpoint.isSm;

  const hasMeaningfulData = safeData.some(
    (item) => (item.revenue ?? 0) > 0 || (item.orders ?? 0) > 0
  );

  if (safeData.length === 0 || !hasMeaningfulData) {
    return (
      <EmptyAnalyticsState
        title="لا توجد بيانات إيرادات"
        description="لا توجد بيانات إيرادات أو طلبات ضمن الفترة المحددة."
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
          {title ?? 'الإيرادات والطلبات اليومية'}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={safeData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: labelFontSize }}
              tickFormatter={(value) => formatDateLabel(value)}
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
              tickFormatter={(value) => formatNumber(value)}
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
                if (name === 'orders') return [formatNumber(value), 'الطلبات'];
                return [value, name];
              }}
              labelFormatter={(label) => formatDateLabel(label)}
            />
            <Legend
              wrapperStyle={{ fontSize: `${tooltipFontSize}px`, paddingTop: '8px' }}
              formatter={(value: string) => {
                if (value === 'revenue') return 'الإيراد';
                if (value === 'orders') return 'الطلبات';
                return value;
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.15}
              strokeWidth={breakpoint.isXs ? 1.5 : 2}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: breakpoint.isXs ? 2.5 : 3 }}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              fill={theme.palette.secondary.main}
              radius={[2, 2, 0, 0]}
              barSize={breakpoint.isXs ? 12 : breakpoint.isSm ? 16 : 20}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
