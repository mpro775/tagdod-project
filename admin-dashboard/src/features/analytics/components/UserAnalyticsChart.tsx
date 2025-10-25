import React from 'react';
import { Card, CardContent, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UserAnalyticsChartProps {
  data?: any;
}

export const UserAnalyticsChart: React.FC<UserAnalyticsChartProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          تحليلات المستخدمين
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
