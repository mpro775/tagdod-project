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

export interface UserTrendItem {
  date: string;
  newUsers: number;
  activeUsers: number;
}

interface UserAnalyticsChartProps {
  data?: UserTrendItem[];
  title?: string;
}

export const UserAnalyticsChart: React.FC<UserAnalyticsChartProps> = ({ data, title }) => {
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

  const safeData = asArray<UserTrendItem>(data);

  const hasMeaningfulData = safeData.some(
    (item) => (item.newUsers ?? 0) > 0 || (item.activeUsers ?? 0) > 0
  );

  if (safeData.length === 0 || !hasMeaningfulData) {
    return (
      <EmptyAnalyticsState
        title="لا توجد بيانات مستخدمين"
        description="لا توجد بيانات تسجيل أو نشاط مستخدمين ضمن الفترة المحددة."
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
          {title ?? 'اتجاه المستخدمين'}
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
                if (name === 'newUsers') return [formatNumber(value), 'مستخدمون جدد'];
                if (name === 'activeUsers') return [formatNumber(value), 'مستخدمون نشطون'];
                return [value, name];
              }}
              labelFormatter={(label) => formatDateLabel(label)}
            />
            <Legend
              wrapperStyle={{ fontSize: `${tooltipFontSize}px`, paddingTop: '8px' }}
              formatter={(value: string) => {
                if (value === 'newUsers') return 'مستخدمون جدد';
                if (value === 'activeUsers') return 'مستخدمون نشطون';
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke={theme.palette.primary.main}
              strokeWidth={breakpoint.isXs ? 1.5 : 2}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: breakpoint.isXs ? 2.5 : 3 }}
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
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
