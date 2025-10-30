import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Skeleton } from '@mui/material';
import { TrendingUp, Speed, CheckCircle, Error, Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface QuickStatsWidgetProps {
  title: string;
  stats: {
    activeUsers?: number;
    systemHealth?: number;
    errorRate?: number;
    responseTime?: number;
  };
  isLoading?: boolean;
}

export const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({
  title,
  stats,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation(['dashboard']);
  // Always use English numbers, regardless of language
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat('en-US'), []);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={18} />
                  <Skeleton variant="text" width="40%" height={14} />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'success';
    if (health >= 70) return 'warning';
    return 'error';
  };

  const getHealthIcon = (health: number) => {
    if (health >= 90) return <CheckCircle />;
    if (health >= 70) return <Warning />;
    return <Error />;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {stats.activeUsers !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
            <Typography variant="body2">
              {t('quickStats.labels.activeUsers', 'المستخدمون النشطون')}
            </Typography>
              </Box>
          <Chip label={numberFormatter.format(stats.activeUsers)} color="primary" size="small" />
            </Box>
          )}

          {stats.systemHealth !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getHealthIcon(stats.systemHealth)}
            <Typography variant="body2">
              {t('quickStats.labels.systemHealth', 'صحة النظام')}
            </Typography>
              </Box>
              <Chip 
                label={`${stats.systemHealth}%`} 
                color={getHealthColor(stats.systemHealth)} 
                size="small" 
              />
            </Box>
          )}

          {stats.errorRate !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Error color="error" />
            <Typography variant="body2">
              {t('quickStats.labels.errorRate', 'معدل الأخطاء')}
            </Typography>
              </Box>
              <Chip 
                label={`${stats.errorRate.toFixed(2)}%`} 
                color={stats.errorRate > 5 ? 'error' : 'success'} 
                size="small" 
              />
            </Box>
          )}

          {stats.responseTime !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed color="info" />
            <Typography variant="body2">
              {t('quickStats.labels.responseTime', 'وقت الاستجابة')}
            </Typography>
              </Box>
              <Chip 
            label={t('quickStats.values.responseTime', '{{value}} مللي ثانية', { value: stats.responseTime })}
                color={stats.responseTime > 1000 ? 'error' : stats.responseTime > 500 ? 'warning' : 'success'} 
                size="small" 
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
