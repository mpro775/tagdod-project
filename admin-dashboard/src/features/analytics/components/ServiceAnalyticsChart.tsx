import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ServiceAnalyticsChartProps {
  data?: any;
}

export const ServiceAnalyticsChart: React.FC<ServiceAnalyticsChartProps> = ({ data }) => {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          تحليلات الخدمات
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data || []}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {(data || []).map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
