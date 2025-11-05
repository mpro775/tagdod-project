import { Card, CardContent, CardHeader, Typography, useTheme, useMediaQuery } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { systemMonitoringApi } from '../api/systemMonitoringApi';
import { Skeleton } from '@mui/material';
import { toast } from 'react-hot-toast';
import { useRTL } from '@/shared/hooks/useRTL';

export function ApiPerformanceChart() {
  const { t } = useTranslation('system-monitoring');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isRTL } = useRTL();
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
        toast.error(t('charts.failed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [t]);

  const chartHeight = isMobile ? 350 : 400;
  const textColor = theme.palette.mode === 'dark' 
    ? theme.palette.text.primary 
    : theme.palette.text.secondary;
  const gridColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = theme.palette.mode === 'dark' 
    ? theme.palette.background.paper 
    : theme.palette.background.default;
  const tooltipBorder = theme.palette.divider;

  // RTL-aware margins for vertical bar chart
  const chartMargins = useMemo(() => {
    if (isRTL) {
      return { 
        top: 5, 
        right: isMobile ? 80 : 100, 
        left: isMobile ? 5 : 20, 
        bottom: 5 
      };
    }
    return { 
      top: 5, 
      right: isMobile ? 5 : 20, 
      left: isMobile ? 80 : 100, 
      bottom: 5 
    };
  }, [isRTL, isMobile]);

  if (loading) {
    return (
      <Card
        sx={{
          bgcolor: 'background.paper',
          boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        }}
      >
        <CardHeader
          sx={{ 
            pb: { xs: 1, sm: 2 },
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
          }}
        >
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            fontWeight="bold"
            sx={{ color: 'text.primary' }}
          >
            {t('charts.apiPerformance.title')}
          </Typography>
        </CardHeader>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Skeleton 
            variant="rectangular" 
            height={chartHeight}
            sx={{ 
              borderRadius: 1,
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
            }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
      }}
    >
      <CardHeader
        sx={{ 
          pb: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
        }}
      >
        <Typography 
          variant={isMobile ? 'subtitle1' : 'h6'} 
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          {t('charts.apiPerformance.title')}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            mt: 0.5,
          }}
        >
          {t('charts.apiPerformance.subtitle')}
        </Typography>
      </CardHeader>
      <CardContent sx={{ px: { xs: 1, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart 
            data={data} 
            layout="vertical"
            margin={chartMargins}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor}
            />
            <XAxis 
              type="number" 
              tick={{ 
                fill: textColor,
                fontSize: isMobile ? 10 : 12,
              }}
              orientation={isRTL ? 'top' : 'bottom'}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={isMobile ? 75 : 100}
              tick={{ 
                fill: textColor,
                fontSize: isMobile ? 10 : 12,
              }}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '6px',
                fontSize: isMobile ? '12px' : '14px',
              }}
              labelStyle={{ 
                color: theme.palette.text.primary,
                marginBottom: '4px',
                fontWeight: 600,
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '10px',
              }}
              iconType="square"
            />
            <Bar 
              dataKey="avgTime" 
              fill="#3b82f6" 
              name={t('charts.apiPerformance.metrics.avgTime')}
              radius={isRTL ? [4, 0, 0, 4] : [0, 4, 4, 0]}
            />
            <Bar 
              dataKey="maxTime" 
              fill="#ef4444" 
              name={t('charts.apiPerformance.metrics.maxTime')}
              radius={isRTL ? [4, 0, 0, 4] : [0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

