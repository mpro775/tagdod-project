import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  getChartHeight,
  getChartMargin,
  getChartLabelFontSize,
  getChartTooltipFontSize,
  shouldHideLegend,
  getLegendPosition,
  getYAxisWidth,
  getXAxisHeight,
  getCardPadding,
} from '../utils/responsive';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface LineChartComponentProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  lines?: Array<{
    dataKey: string;
    stroke: string;
    name?: string;
  }>;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisKey?: string;
  yAxisLabel?: string;
}

export const LineChartComponent: React.FC<LineChartComponentProps> = ({
  data,
  title,
  height = 350,
  lines,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  yAxisLabel,
}) => {
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

  const defaultLines = lines || [
    { dataKey: 'value', stroke: '#8884d8', name: t('charts.defaultValue') }
  ];

  const chartHeight = getChartHeight(breakpoint, height);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);
  const hideLegend = shouldHideLegend(breakpoint) && breakpoint.isXs;
  const legendPosition = getLegendPosition(breakpoint);
  const cardPadding = getCardPadding(breakpoint);
  const needsRotation = breakpoint.isXs || breakpoint.isSm;

  if (!data || data.length === 0) {
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
      {title && (
        <CardContent sx={{ pb: 1, p: cardPadding }}>
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {title}
          </Typography>
        </CardContent>
      )}
      <CardContent sx={{ pt: 0, p: cardPadding }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart 
            data={data} 
            margin={chartMargin}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: labelFontSize }}
              tickLine={false}
              angle={needsRotation ? -45 : 0}
              textAnchor={needsRotation ? 'end' : 'middle'}
              height={xAxisHeight}
              interval={breakpoint.isXs ? 'preserveStartEnd' : 0}
            />
            <YAxis
              tick={{ fontSize: labelFontSize }}
              tickLine={false}
              width={yAxisWidth}
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: `${labelFontSize}px` }
              } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 8,
                fontSize: `${tooltipFontSize}px`,
                padding: breakpoint.isXs ? '8px' : '12px',
              }}
              formatter={(value: number) => [value.toLocaleString('ar-SA'), '']}
              position={{ x: breakpoint.isXs ? 10 : undefined, y: breakpoint.isXs ? -10 : undefined }}
            />
            {showLegend && !hideLegend && (
              <Legend 
                wrapperStyle={{ 
                  fontSize: `${tooltipFontSize}px`,
                  paddingTop: breakpoint.isXs || breakpoint.isSm ? '16px' : '0',
                }}
                iconSize={breakpoint.isXs ? 10 : breakpoint.isSm ? 12 : 16}
                verticalAlign={legendPosition === 'bottom' ? 'bottom' : 'top'}
                height={breakpoint.isXs || breakpoint.isSm ? 36 : undefined}
              />
            )}
            {defaultLines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={breakpoint.isXs ? 1.5 : breakpoint.isSm ? 1.8 : 2}
                name={line.name}
                dot={{ r: breakpoint.isXs ? 2.5 : breakpoint.isSm ? 3 : 4 }}
                activeDot={{ r: breakpoint.isXs ? 4 : breakpoint.isSm ? 5 : 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
