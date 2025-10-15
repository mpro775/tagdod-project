import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
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
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  title,
  height = 350,
  bars = [
    { dataKey: 'value', fill: '#8884d8', name: 'القيمة' }
  ],
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  yAxisLabel,
  orientation = 'vertical',
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            لا توجد بيانات للعرض
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        </CardContent>
      )}
      <CardContent sx={{ pt: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              type={orientation === 'horizontal' ? 'number' : 'category'}
              dataKey={orientation === 'horizontal' ? undefined : xAxisKey}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              type={orientation === 'horizontal' ? 'category' : 'number'}
              dataKey={orientation === 'horizontal' ? xAxisKey : undefined}
              tick={{ fontSize: 12 }}
              tickLine={false}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 8,
                fontSize: '14px',
              }}
              formatter={(value: number) => [value.toLocaleString('ar-SA'), '']}
            />
            {showLegend && <Legend />}
            {bars.map((bar, index) => (
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
      </CardContent>
    </Card>
  );
};
