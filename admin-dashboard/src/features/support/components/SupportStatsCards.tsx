import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Stack,
} from '@mui/material';
import { Support, TrendingUp, Warning, CheckCircle, Schedule, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SupportStats, SupportCategory, SupportPriority } from '../types/support.types';

interface SupportStatsCardsProps {
  stats: SupportStats;
  isLoading?: boolean;
}

const getCategoryLabel = (category: SupportCategory, t: any): string => {
  return t(`category.${category}`, { defaultValue: 'غير محدد' });
};

const getPriorityLabel = (priority: SupportPriority, t: any): string => {
  return t(`priority.${priority}`, { defaultValue: 'غير محدد' });
};

const formatTime = (minutes: number, t: any): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} ${t('time.minutes', { defaultValue: 'دقيقة' })}`;
  } else if (minutes < 1440) {
    return `${Math.round(minutes / 60)} ${t('time.hours', { defaultValue: 'ساعة' })}`;
  } else {
    return `${Math.round(minutes / 1440)} ${t('time.days', { defaultValue: 'يوم' })}`;
  }
};

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation('support');
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card>
              <CardContent>
                <LinearProgress />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const totalTickets = stats.total;
  const resolvedPercentage = totalTickets > 0 ? (stats.resolved / totalTickets) * 100 : 0;
  const slaBreachPercentage = totalTickets > 0 ? (stats.slaBreached / totalTickets) * 100 : 0;

  return (
    <Grid container spacing={3}>
      {/* إجمالي التذاكر */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                    {t('stats.totalTickets', { defaultValue: 'إجمالي التذاكر' })}
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total}
                </Typography>
              </Box>
              <Support color="primary" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المفتوحة */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {t('stats.openTickets', { defaultValue: 'التذاكر المفتوحة' })}
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  {stats.open}
                </Typography>
              </Box>
              <Schedule color="warning" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المحلولة */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {t('stats.resolvedTickets', { defaultValue: 'التذاكر المحلولة' })}
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {stats.resolved}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={resolvedPercentage}
                  color="success"
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {resolvedPercentage.toFixed(1)}{t('stats.percentageOfTotal', { defaultValue: 'من إجمالي التذاكر' })}
                </Typography>
              </Box>
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* متوسط وقت الاستجابة */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {t('stats.averageResponseTime', { defaultValue: 'متوسط وقت الاستجابة' })}
                </Typography>
                <Typography variant="h4" component="div">
                  {formatTime(stats.averageResponseTime, t)}
                </Typography>
              </Box>
              <TrendingUp color="info" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* متوسط وقت الحل */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {t('stats.averageResolutionTime', { defaultValue: 'متوسط وقت الحل' })}
                </Typography>
                <Typography variant="h4" component="div">
                  {formatTime(stats.averageResolutionTime, t)}
                </Typography>
              </Box>
              <Person color="secondary" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المتجاوزة للـ SLA */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {t('stats.slaBreached', { defaultValue: 'التذاكر المتجاوزة للـ SLA' })}
                </Typography>
                <Typography variant="h4" component="div" color="error.main">
                  {stats.slaBreached}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={slaBreachPercentage}
                  color="error"
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {slaBreachPercentage.toFixed(1)}{t('stats.percentageOfTotal', { defaultValue: 'من إجمالي التذاكر' })}
                </Typography>
              </Box>
              <Warning color="error" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التوزيع حسب الفئة */}
      <Grid component="div" size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('stats.byCategory', { defaultValue: 'التوزيع حسب الفئة' })}
            </Typography>
            <Stack spacing={1}>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Box key={category}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {getCategoryLabel(category as SupportCategory, t)}
                    </Typography>
                    <Chip label={count} size="small" />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={totalTickets > 0 ? (count / totalTickets) * 100 : 0}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التوزيع حسب الأولوية */}
      <Grid component="div" size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('stats.byPriority', { defaultValue: 'التوزيع حسب الأولوية' })}
            </Typography>
            <Stack spacing={1}>
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <Box key={priority}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {getPriorityLabel(priority as SupportPriority, t)}
                    </Typography>
                    <Chip label={count} size="small" />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={totalTickets > 0 ? (count / totalTickets) * 100 : 0}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SupportStatsCards;
