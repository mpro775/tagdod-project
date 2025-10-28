import React from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; orders?: number }>;
  isLoading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading }) => {
  const [period, setPeriod] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            نظرة عامة على الإيرادات
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">جاري التحميل...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = Array.isArray(data) 
    ? data.slice(-14).map(item => ({
        date: new Date(item.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }),
        revenue: item.revenue || 0,
        orders: item.orders || 0,
      }))
    : [];

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              نظرة عامة على الإيرادات
            </Typography>
            <Typography variant="body2" color="text.secondary">
              متوسط {avgRevenue.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} $ يومياً
            </Typography>
          </Box>
          
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, newPeriod) => newPeriod && setPeriod(newPeriod)}
            size="small"
          >
            <ToggleButton value="daily">يومي</ToggleButton>
            <ToggleButton value="weekly">أسبوعي</ToggleButton>
            <ToggleButton value="monthly">شهري</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                style={{ fontSize: '12px' }}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                style={{ fontSize: '12px' }}
                tick={{ fill: '#666' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${value.toLocaleString('ar-SA')} $`, 'الإيرادات']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4caf50"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="الإيرادات"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

