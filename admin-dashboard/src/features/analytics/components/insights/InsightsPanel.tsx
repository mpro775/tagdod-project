import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Error,
  Info,
  CheckCircle,
  Refresh,
  ChevronRight,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { reportBuilderApi } from '../../api/reportBuilderApi';
import type { Insight } from '../../types/reportBuilder.types';

const SEVERITY_CONFIG: Record<string, { color: string; icon: React.ReactNode; bgColor: string }> = {
  critical: {
    color: '#F44336',
    icon: <Error />,
    bgColor: 'rgba(244, 67, 54, 0.08)',
  },
  warning: {
    color: '#FF9800',
    icon: <Warning />,
    bgColor: 'rgba(255, 152, 0, 0.08)',
  },
  info: {
    color: '#2196F3',
    icon: <Info />,
    bgColor: 'rgba(33, 150, 243, 0.08)',
  },
  success: {
    color: '#4CAF50',
    icon: <CheckCircle />,
    bgColor: 'rgba(76, 175, 80, 0.08)',
  },
};

interface InsightsPanelProps {
  days?: number;
  onInsightClick?: (insight: Insight) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ days = 30, onInsightClick }) => {
  const { t, i18n } = useTranslation('analytics');
  const theme = useTheme();

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['analytics-insights', days],
    queryFn: () => reportBuilderApi.getInsights(days),
  });

  const isRTL = i18n.language === 'ar';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Alert severity="info">
        <AlertTitle>{t('analytics.insights.title')}</AlertTitle>
        لا توجد رؤى حاليًا. حاول تغيير الفترة الزمنية.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{t('analytics.insights.title')}</Typography>
        <Tooltip title="تحديث">
          <IconButton onClick={() => refetch()} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        {insights.map((insight) => {
          const config = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.info;
          const title = isRTL ? insight.title : insight.titleEn;
          const description = isRTL ? insight.description : insight.descriptionEn;

          return (
            <Grid item xs={12} sm={6} md={4} key={insight.id}>
              <Card
                sx={{
                  borderLeft: isRTL ? 'none' : `4px solid ${config.color}`,
                  borderRight: isRTL ? `4px solid ${config.color}` : 'none',
                  bgcolor: config.bgColor,
                  cursor: onInsightClick ? 'pointer' : 'default',
                  '&:hover': onInsightClick ? { boxShadow: 4 } : {},
                }}
                onClick={() => onInsightClick?.(insight)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <Box sx={{ color: config.color, mt: 0.5 }}>{config.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {description}
                      </Typography>
                    </Box>
                    {onInsightClick && (
                      <ChevronRight sx={{ color: 'text.secondary', transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Chip
                      label={insight.source}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    {insight.value !== undefined && (
                      <Chip
                        label={
                          insight.change !== undefined
                            ? `${insight.value.toLocaleString()} (${insight.change >= 0 ? '+' : ''}${insight.change.toFixed(1)}%)`
                            : insight.value.toLocaleString()
                        }
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          bgcolor: insight.change !== undefined
                            ? insight.change >= 0
                              ? 'rgba(76, 175, 80, 0.1)'
                              : 'rgba(244, 67, 54, 0.1)'
                            : undefined,
                          color: insight.change !== undefined
                            ? insight.change >= 0
                              ? '#4CAF50'
                              : '#F44336'
                            : undefined,
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export const InsightsSummaryCards: React.FC<{ days?: number }> = ({ days = 30 }) => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['analytics-insights-summary', days],
    queryFn: () => reportBuilderApi.getInsights(days),
  });

  if (isLoading || !insights) return null;

  const criticalCount = insights.filter((i) => i.severity === 'critical').length;
  const warningCount = insights.filter((i) => i.severity === 'warning').length;
  const successCount = insights.filter((i) => i.severity === 'success').length;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Alert severity="error" variant="outlined" sx={{ mb: 0 }}>
          <Typography variant="h6">{criticalCount}</Typography>
          <Typography variant="body2">تنبيهات حرجة</Typography>
        </Alert>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Alert severity="warning" variant="outlined" sx={{ mb: 0 }}>
          <Typography variant="h6">{warningCount}</Typography>
          <Typography variant="body2">تحذيرات</Typography>
        </Alert>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Alert severity="success" variant="outlined" sx={{ mb: 0 }}>
          <Typography variant="h6">{successCount}</Typography>
          <Typography variant="body2">رؤى إيجابية</Typography>
        </Alert>
      </Grid>
    </Grid>
  );
};
