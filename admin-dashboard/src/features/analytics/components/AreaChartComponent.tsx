import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  AreaChart,
  Area,
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

interface AreaChartComponentProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  areas?: Array<{
    dataKey: string;
    stroke: string;
    fill: string;
    name?: string;
  }>;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisKey?: string;
  yAxisLabel?: string;
  stacked?: boolean;
}

export const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  data,
  title,
  height = 350,
  areas = [
    { dataKey: 'value', stroke: '#8884d8', fill: '#8884d8', name: 'القيمة' }
  ],
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  yAxisLabel,
  stacked = false,
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
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
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
            {areas.map((area, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={area.dataKey}
                stackId={stacked ? '1' : undefined}
                stroke={area.stroke}
                fill={area.fill}
                name={area.name}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
