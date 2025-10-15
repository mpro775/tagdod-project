import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
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
  lines = [
    { dataKey: 'value', stroke: '#8884d8', name: 'القيمة' }
  ],
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  yAxisLabel,
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
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={2}
                name={line.name}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
