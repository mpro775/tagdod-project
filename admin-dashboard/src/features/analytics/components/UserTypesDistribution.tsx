import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  getChartHeight,
  getChartTooltipFontSize,
  shouldHideLegend,
  getLegendPosition,
  getCardPadding,
} from '../utils/responsive';
import { asArray } from '../utils/analyticsDataGuards';
import { formatNumber, formatPercent } from '../utils/formatters';
import { translateUserRole } from '../utils/translations';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface UserTypeItem {
  name: string;
  value: number;
  percentage?: number;
}

interface UserTypesDistributionProps {
  data?: UserTypeItem[];
  title?: string;
}

export const UserTypesDistribution: React.FC<UserTypesDistributionProps> = ({ data, title }) => {
  const theme = useTheme();
  const breakpoint = useBreakpoint();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const chartHeight = getChartHeight(breakpoint, 400);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const hideLegend = shouldHideLegend(breakpoint) && breakpoint.isXs;
  const legendPosition = getLegendPosition(breakpoint);
  const cardPadding = getCardPadding(breakpoint);
  const outerRadius = breakpoint.isXs ? 55 : breakpoint.isSm ? 70 : 80;
  const showLabels = !breakpoint.isXs;

  const safeData = asArray<UserTypeItem>(data).filter((item) => (item.value ?? 0) > 0);

  if (safeData.length === 0) {
    return (
      <EmptyAnalyticsState
        title="لا توجد بيانات أنواع المستخدمين"
        description="لا توجد بيانات توزيع أنواع المستخدمين."
      />
    );
  }

  const translatedData = safeData.map((item) => ({
    ...item,
    name: translateUserRole(item.name),
  }));

  return (
    <Card>
      <CardContent sx={{ p: cardPadding }}>
        <Typography
          variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
          gutterBottom
          sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
        >
          {title ?? 'توزيع أنواع المستخدمين'}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={translatedData}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={
                showLabels
                  ? ({ name, value, percent }: any) =>
                      `${name}: ${formatNumber(value)} (${formatPercent((percent || 0) * 100)})`
                  : false
              }
              outerRadius={outerRadius}
              innerRadius={breakpoint.isXs ? 30 : 45}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {translatedData.map((_, index) => (
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
                direction: 'rtl',
                textAlign: 'right',
              }}
              formatter={(value: number, name: string, props: any) => {
                const pct = props?.payload?.percentage;
                return [
                  `${formatNumber(value)}${pct !== undefined ? ` (${formatPercent(pct)})` : ''}`,
                  name,
                ];
              }}
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
