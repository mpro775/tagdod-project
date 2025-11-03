import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
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

interface RevenueChartProps {
  data?: any;
  title?: string;
  type?: string;
  height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title, height }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

  const chartData = Array.isArray(data) ? data : [];
  const chartHeight = getChartHeight(breakpoint, height || 400);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);
  const cardPadding = getCardPadding(breakpoint);
  const needsRotation = breakpoint.isXs || breakpoint.isSm;

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardContent sx={{ p: cardPadding }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            textAlign="center"
            sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
          >
            {t('charts.noData')}
          </Typography>
        </CardContent>
      </Card>
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
          {title || t('charts.revenueTrends')}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart 
            data={chartData}
            margin={chartMargin}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: labelFontSize }}
              angle={needsRotation ? -45 : 0}
              textAnchor={needsRotation ? 'end' : 'middle'}
              height={xAxisHeight}
              interval={breakpoint.isXs ? 'preserveStartEnd' : 0}
            />
            <YAxis 
              tick={{ fontSize: labelFontSize }}
              width={yAxisWidth}
            />
            <Tooltip
              contentStyle={{
                fontSize: `${tooltipFontSize}px`,
                padding: breakpoint.isXs ? '8px' : '12px',
              }}
              position={{ x: breakpoint.isXs ? 10 : undefined, y: breakpoint.isXs ? -10 : undefined }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke={theme.palette.primary.main} 
              strokeWidth={breakpoint.isXs ? 1.5 : breakpoint.isSm ? 2 : 3}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: breakpoint.isXs ? 2.5 : breakpoint.isSm ? 3 : 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};