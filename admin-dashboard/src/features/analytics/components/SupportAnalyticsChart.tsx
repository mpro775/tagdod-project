import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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

export interface SupportTicketItem {
  date: string;
  newTickets: number;
  resolved: number;
}

interface SupportAnalyticsChartProps {
  data?: SupportTicketItem[];
  title?: string;
}

export const SupportAnalyticsChart: React.FC<SupportAnalyticsChartProps> = ({ data, title }) => {
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

  const safeData = asArray<SupportTicketItem>(data);

  const hasMeaningfulData = safeData.some(
    (item) => (item.newTickets ?? 0) > 0 || (item.resolved ?? 0) > 0
  );

  if (safeData.length === 0 || !hasMeaningfulData) {
    return (
      <EmptyAnalyticsState
        title="لا توجد تذاكر دعم"
        description="لا توجد تذاكر دعم خلال الفترة المحددة."
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
          {title ?? 'تذاكر الدعم'}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={safeData} margin={chartMargin}>
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
formatter={(value, name) => {
                 if (name === 'newTickets') return [formatNumber(Number(value)), 'تذاكر جديدة'];
                 if (name === 'resolved') return [formatNumber(Number(value)), 'محلولة'];
                 return [String(value), String(name)];
               }}
               labelFormatter={(label) => formatDateLabel(label)}
             />
             <Legend
               wrapperStyle={{ fontSize: `${tooltipFontSize}px`, paddingTop: '8px' }}
               formatter={(value) => {
                 if (value === 'newTickets') return 'تذاكر جديدة';
                 if (value === 'resolved') return 'محلولة';
                 return value;
               }}
            />
            <Bar dataKey="newTickets" fill={theme.palette.warning.main} radius={[2, 2, 0, 0]} />
            <Bar dataKey="resolved" fill={theme.palette.success.main} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
