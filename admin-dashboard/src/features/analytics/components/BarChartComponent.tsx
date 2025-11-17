import React from 'react';
import { Typography, Card, CardContent, Box } from '@mui/material';
import {
  BarChart,
  Bar,
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

interface BarChartComponentProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  bars?: Array<{
    dataKey: string;
    fill: string;
    name?: string;
  }>;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisKey?: string;
  yAxisLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  disableCard?: boolean;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  title,
  height = 350,
  bars,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  yAxisLabel,
  orientation = 'vertical',
  disableCard = false,
}) => {
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  
  const defaultBars = bars || [
    { dataKey: 'value', fill: '#8884d8', name: t('charts.defaultValue') }
  ];
  
  const chartHeight = getChartHeight(breakpoint, height);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, orientation === 'vertical');
  const hideLegend = shouldHideLegend(breakpoint) && breakpoint.isXs;
  const legendPosition = getLegendPosition(breakpoint);
  const cardPadding = getCardPadding(breakpoint);
  const needsRotation = orientation === 'vertical' && (breakpoint.isXs || breakpoint.isSm);

  if (!data || data.length === 0) {
    const noDataContent = (
      <Box sx={{ p: cardPadding }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center"
          sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
        >
          {t('charts.noData')}
        </Typography>
      </Box>
    );
    
    if (disableCard) {
      return noDataContent;
    }
    
    return (
      <Card>
        <CardContent sx={{ p: cardPadding }}>
          {noDataContent}
        </CardContent>
      </Card>
    );
  }

  // Adjust bottom margin for horizontal orientation
  const adjustedMargin = {
    ...chartMargin,
    bottom: orientation === 'horizontal' && breakpoint.isXs ? 60 : chartMargin.bottom,
  };

  const chartContent = (
    <>
      {title && (
        <Box sx={{ pb: 1, p: cardPadding }}>
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {title}
          </Typography>
        </Box>
      )}
      <Box sx={{ pt: title ? 0 : 0, p: cardPadding }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            margin={adjustedMargin}
            layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              type={orientation === 'horizontal' ? 'number' : 'category'}
              dataKey={orientation === 'horizontal' ? undefined : xAxisKey}
              tick={{ fontSize: labelFontSize }}
              tickLine={false}
              angle={needsRotation ? -45 : 0}
              textAnchor={needsRotation ? 'end' : 'middle'}
              height={xAxisHeight || (orientation === 'horizontal' && breakpoint.isXs ? 60 : undefined)}
              interval={breakpoint.isXs ? 'preserveStartEnd' : 0}
            />
            <YAxis
              type={orientation === 'horizontal' ? 'category' : 'number'}
              dataKey={orientation === 'horizontal' ? xAxisKey : undefined}
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
              formatter={(value: number) => [typeof value === 'number' ? value.toLocaleString('en-US') : value, '']}
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
            {defaultBars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </>
  );

  if (disableCard) {
    return chartContent;
  }

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        {chartContent}
      </CardContent>
    </Card>
  );
};
