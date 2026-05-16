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
import { formatNumber, formatDateLabel } from '../utils/formatters';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface ServiceRequestItem {
  date: string;
  requests: number;
  completed: number;
}

interface ServiceAnalyticsChartProps {
  data?: ServiceRequestItem[];
  title?: string;
}

export const ServiceAnalyticsChart: React.FC<ServiceAnalyticsChartProps> = ({ data, title }) => {
  const theme = useTheme();
  const breakpoint = useBreakpoint();

  const chartHeight = getChartHeight(breakpoint, 400);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);
  const cardPadding = getCardPadding(breakpoint);
  const needsRotation = breakpoint.isXs || breakpoint.isSm;

  const safeData = asArray<ServiceRequestItem>(data);

  const hasMeaningfulData = safeData.some(
    (item) => (item.requests ?? 0) > 0 || (item.completed ?? 0) > 0
  );

  if (safeData.length === 0 || !hasMeaningfulData) {
    return (
      <EmptyAnalyticsState
        title="لا توجد طلبات خدمة"
        description="لا توجد طلبات خدمة خلال الفترة المحددة."
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
          {title ?? 'طلبات الخدمة'}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={safeData} margin={chartMargin}>
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
                if (name === 'requests') return [formatNumber(value), 'الطلبات'];
                if (name === 'completed') return [formatNumber(value), 'المكتملة'];
                return [value, name];
              }}
              labelFormatter={(label) => formatDateLabel(label)}
            />
            <Legend
              wrapperStyle={{ fontSize: `${tooltipFontSize}px`, paddingTop: '8px' }}
              formatter={(value: string) => {
                if (value === 'requests') return 'الطلبات';
                if (value === 'completed') return 'المكتملة';
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="requests"
              stroke={theme.palette.primary.main}
              strokeWidth={breakpoint.isXs ? 1.5 : 2}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: breakpoint.isXs ? 2.5 : 3 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke={theme.palette.success.main}
              strokeWidth={breakpoint.isXs ? 1.5 : 2}
              dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: breakpoint.isXs ? 2.5 : 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
