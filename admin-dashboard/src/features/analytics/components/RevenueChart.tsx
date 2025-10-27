import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data?: any;
  title?: string;
  type?: string;
  height?: number;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title, height }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title || 'اتجاهات الإيرادات'}
        </Typography>
        <ResponsiveContainer width="100%" height={height || 400}>
          <LineChart data={Array.isArray(data) ? data : []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
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