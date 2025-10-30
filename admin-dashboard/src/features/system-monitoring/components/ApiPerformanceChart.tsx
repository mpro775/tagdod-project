import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { systemMonitoringApi } from '../api/systemMonitoringApi';
import { Skeleton } from '@mui/material';
import { toast } from 'react-hot-toast';

export function ApiPerformanceChart() {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const performance = await systemMonitoringApi.getApiPerformance();

        const formattedData = performance.slowestEndpoints.slice(0, 10).map((endpoint: any) => ({
          name: endpoint.endpoint.split('/').pop() || endpoint.endpoint,
          avgTime: Math.round(endpoint.avgTime),
          maxTime: Math.round(endpoint.maxTime),
          calls: endpoint.callCount,
        }));

        setData(formattedData);
      } catch {
        toast.error(t('system-monitoring.charts.failed', { defaultValue: 'فشل تحميل البيانات' }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Typography variant="h6">{t('system-monitoring.charts.apiPerformance.title', { defaultValue: 'أداء الـ API' })}</Typography>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Typography variant="h6">{t('system-monitoring.charts.apiPerformance.subtitle', { defaultValue: 'أداء الـ API' })}</Typography>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" tick={{ fill: 'currentColor' }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Bar dataKey="avgTime" fill="#3b82f6" name={t('system-monitoring.charts.apiPerformance.metrics.avgTime', { defaultValue: 'متوسط الوقت' })} />
            <Bar dataKey="maxTime" fill="#ef4444" name={t('system-monitoring.charts.apiPerformance.metrics.maxTime', { defaultValue: 'الوقت الأقصى' } )} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

