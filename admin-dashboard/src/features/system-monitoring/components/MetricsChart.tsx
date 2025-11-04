import { Card, CardContent, CardHeader, Typography, useTheme, useMediaQuery } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { systemMonitoringApi } from '../api/systemMonitoringApi';
import { Skeleton } from '@mui/material';
import { toast } from 'react-hot-toast';
import { useRTL } from '@/shared/hooks/useRTL';

interface MetricsChartProps {
  metricType: 'cpu' | 'memory' | 'disk';
  title: string;
  color: string;
}

export function MetricsChart({ metricType, title, color }: MetricsChartProps) {
  const { t, i18n } = useTranslation('system-monitoring');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isRTL } = useRTL();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const history = await systemMonitoringApi.getMetricsHistory({
          metricType,
          timeRange: 'last_24_hours',
        });

        const locale = i18n.language === 'ar' ? 'ar-YE' : 'en-US';
        const formattedData = history.data.map((point) => ({
          time: new Date(point.timestamp).toLocaleTimeString(locale, { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          value: point.value,
        }));

        setData(formattedData);
      } catch {
        toast.error(t('messages.error.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [metricType, t, i18n.language]);

  // RTL-aware margins - must be before any return statements
  const chartMargins = useMemo(() => {
    if (isRTL) {
      return { 
        top: 5, 
        right: isMobile ? -20 : 0, 
        left: isMobile ? 5 : 10, 
        bottom: 5 
      };
    }
    return { 
      top: 5, 
      right: isMobile ? 5 : 10, 
      left: isMobile ? -20 : 0, 
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
            {title}
          </Typography>
        </CardHeader>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Skeleton 
            variant="rectangular" 
            height={isMobile ? 250 : 300}
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

  const chartHeight = isMobile ? 250 : 300;
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
          {title}
        </Typography>
      </CardHeader>
      <CardContent sx={{ px: { xs: 1, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart 
            data={data} 
            margin={chartMargins}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            <defs>
              <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor}
            />
            <XAxis 
              dataKey="time" 
              tick={{ 
                fill: textColor,
                fontSize: isMobile ? 10 : 12,
              }}
              interval={isMobile ? 'preserveStartEnd' : 0}
              orientation={isRTL ? 'top' : 'bottom'}
            />
            <YAxis 
              tick={{ 
                fill: textColor,
                fontSize: isMobile ? 10 : 12,
              }}
              domain={[0, 100]}
              width={isMobile ? 35 : 50}
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
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${metricType})`}
              name={t(`charts.metrics.usage`)}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

