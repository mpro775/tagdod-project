import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ProductPerformanceChartProps {
  data?: any;
}

export const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          أداء المنتجات
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
