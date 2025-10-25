import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SupportAnalyticsChartProps {
  data?: any;
}

export const SupportAnalyticsChart: React.FC<SupportAnalyticsChartProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          تحليلات الدعم
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
