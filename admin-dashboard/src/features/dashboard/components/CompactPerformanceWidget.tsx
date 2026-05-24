import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Error,
  Speed,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface CompactPerformanceWidgetProps {
  stats: {
    activeUsers?: number;
    systemHealth?: number;
    errorRate?: number;
    responseTime?: number;
  };
  isLoading?: boolean;
}

export const CompactPerformanceWidget: React.FC<CompactPerformanceWidgetProps> = ({
  stats,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('dashboard');
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat('en-US'), []);

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'success';
    if (health >= 70) return 'warning';
    return 'error';
  };

  const getHealthIcon = (health: number) => {
    if (health >= 90) return <CheckCircle sx={{ fontSize: 18 }} />;
    if (health >= 70) return <Error sx={{ fontSize: 18 }} />;
    return <Error sx={{ fontSize: 18 }} />;
  };

  const getErrorRateColor = (rate: number) => {
    if (rate > 5) return theme.palette.error.main;
    if (rate > 2) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms > 1000) return theme.palette.error.main;
    if (ms > 500) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const metricRows = [
    {
      key: 'activeUsers',
      icon: <TrendingUp sx={{ fontSize: 18 }} />,
      iconColor: theme.palette.primary.main,
      label: t('quickStats.labels.activeUsers', 'المستخدمون النشطون'),
      value: stats.activeUsers !== undefined ? numberFormatter.format(stats.activeUsers) : '—',
    },
    {
      key: 'systemHealth',
      icon: stats.systemHealth !== undefined ? getHealthIcon(stats.systemHealth) : <CheckCircle sx={{ fontSize: 18 }} />,
      iconColor: stats.systemHealth !== undefined ? theme.palette[getHealthColor(stats.systemHealth)].main : theme.palette.success.main,
      label: t('quickStats.labels.systemHealth', 'صحة النظام'),
      value: stats.systemHealth !== undefined ? `${stats.systemHealth}%` : '—',
    },
    {
      key: 'errorRate',
      icon: <Error sx={{ fontSize: 18 }} />,
      iconColor: stats.errorRate !== undefined ? getErrorRateColor(stats.errorRate) : theme.palette.success.main,
      label: t('quickStats.labels.errorRate', 'معدل الأخطاء'),
      value: stats.errorRate !== undefined ? `${stats.errorRate.toFixed(2)}%` : '—',
    },
    {
      key: 'responseTime',
      icon: <Speed sx={{ fontSize: 18 }} />,
      iconColor: stats.responseTime !== undefined ? getResponseTimeColor(stats.responseTime) : theme.palette.success.main,
      label: t('quickStats.labels.responseTime', 'وقت الاستجابة'),
      value: stats.responseTime !== undefined
        ? t('quickStats.values.responseTime', '{{value}} مللي ثانية', { value: stats.responseTime })
        : '—',
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.08),
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
          {t('quickStats.title', 'إحصائيات الأداء')}
        </Typography>

        <Stack spacing={1.5}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={18} height={18} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={16} />
                  </Box>
                  <Skeleton variant="text" width={40} height={16} />
                </Box>
              ))
            : metricRows.map((row) => (
                <Stack
                  key={row.key}
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: 1,
                    bgcolor: alpha(row.iconColor, 0.04),
                  }}
                >
                  <Box sx={{ color: row.iconColor, display: 'flex', flexShrink: 0 }}>{row.icon}</Box>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0 }} noWrap>
                    {row.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ flexShrink: 0 }}
                  >
                    {row.value}
                  </Typography>
                </Stack>
              ))}
        </Stack>
      </CardContent>
    </Card>
  );
};