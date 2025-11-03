import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  getChartHeight,
  getChartTooltipFontSize,
  shouldHideLegend,
  getLegendPosition,
  getCardPadding,
} from '../utils/responsive';

interface ServiceAnalyticsChartProps {
  data?: any;
}

export const ServiceAnalyticsChart: React.FC<ServiceAnalyticsChartProps> = ({ data }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const chartHeight = getChartHeight(breakpoint, 400);
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
          {t('charts.serviceAnalytics')}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data || []}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={showLabels ? ({ name, value }: any) => `${name}: ${value}` : false}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {(data || []).map((_: any, index: number) => (
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
      </CardContent>
    </Card>
  );
};
