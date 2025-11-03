import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  getChartHeight,
  getChartTooltipFontSize,
  shouldHideLegend,
  getLegendPosition,
  getCardPadding,
} from '../utils/responsive';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

  const chartHeight = getChartHeight(breakpoint, height);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const hideLegend = shouldHideLegend(breakpoint) && breakpoint.isXs;
  const legendPosition = getLegendPosition(breakpoint);
  const cardPadding = getCardPadding(breakpoint);
  
  // Responsive outer radius
  const outerRadius = breakpoint.isXs ? 55 : breakpoint.isSm ? 70 : 80;
  
  // Show labels only on larger screens
  const showLabels = !breakpoint.isXs;

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: cardPadding }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center"
          sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
        >
          {t('charts.noData')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: cardPadding }}>
      {title && (
        <Typography 
          variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
          gutterBottom
          sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
        >
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={showLabels ? ({ name, percent }: any) => 
              `${name}: ${(percent * 100).toFixed(0)}%` : false
            }
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              fontSize: `${tooltipFontSize}px`,
              padding: breakpoint.isXs ? '8px' : '12px',
            }}
            position={{ x: breakpoint.isXs ? 10 : undefined, y: breakpoint.isXs ? -10 : undefined }}
          />
          {!hideLegend && (
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
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

