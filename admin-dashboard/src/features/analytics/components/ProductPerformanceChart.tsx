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
  getCardPadding,
} from '../utils/responsive';
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';

export interface TopProductItem {
  name: string;
  sold: number;
  revenue: number;
}

interface ProductPerformanceChartProps {
  data?: TopProductItem[];
  title?: string;
}

export const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({
  data,
  title,
}) => {
  const theme = useTheme();
  const breakpoint = useBreakpoint();

  const chartHeight = getChartHeight(breakpoint, 400);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const cardPadding = getCardPadding(breakpoint);

  const safeData = asArray<TopProductItem>(data);

  const hasMeaningfulData = safeData.some((item) => (item.sold ?? 0) > 0 || (item.revenue ?? 0) > 0);

  if (safeData.length === 0 || !hasMeaningfulData) {
    return (
      <EmptyAnalyticsState
        title="لا توجد بيانات منتجات"
        description="لا توجد منتجات مباعة ضمن الفترة المحددة."
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
          {title ?? 'أفضل المنتجات مبيعًا'}
        </Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={safeData} margin={chartMargin} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fontSize: labelFontSize }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: labelFontSize }}
              width={breakpoint.isXs ? 80 : breakpoint.isSm ? 100 : 140}
              interval={0}
            />
            <Tooltip
              contentStyle={{
                fontSize: `${tooltipFontSize}px`,
                padding: breakpoint.isXs ? '8px' : '12px',
                direction: 'rtl',
                textAlign: 'right',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'sold') return [formatNumber(value), 'الكمية المباعة'];
                if (name === 'revenue') return [formatCurrency(value), 'الإيراد'];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: `${tooltipFontSize}px`, paddingTop: '8px' }}
              formatter={(value: string) => {
                if (value === 'sold') return 'الكمية المباعة';
                if (value === 'revenue') return 'الإيراد';
                return value;
              }}
            />
            <Bar dataKey="sold" fill={theme.palette.primary.main} radius={[0, 2, 2, 0]} barSize={breakpoint.isXs ? 10 : 14} />
            <Bar dataKey="revenue" fill={theme.palette.success.main} radius={[0, 2, 2, 0]} barSize={breakpoint.isXs ? 10 : 14} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
