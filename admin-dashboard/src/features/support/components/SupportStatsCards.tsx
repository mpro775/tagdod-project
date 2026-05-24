import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Stack } from '@mui/material';
import { Support, TrendingUp, Warning, CheckCircle, Schedule, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SupportStats, SupportCategory, SupportPriority } from '../types/support.types';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface SupportStatsCardsProps {
  stats: SupportStats;
  isLoading?: boolean;
}

const formatTime = (minutes: number, t: any): string => {
  if (minutes < 60) return `${Math.round(minutes)} ${t('time.minutes')}`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} ${t('time.hours')}`;
  return `${Math.round(minutes / 1440)} ${t('time.days')}`;
};

const getCategoryLabel = (category: SupportCategory, t: any): string => t(`category.${category}`);
const getPriorityLabel = (priority: SupportPriority, t: any): string => t(`priority.${priority}`);

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation('support');

  if (isLoading) {
    return (
      <PageSummaryGrid columns={4}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StatCard key={i} title="…" value="-" loading />
        ))}
      </PageSummaryGrid>
    );
  }

  const totalTickets = stats.total;
  const resolvedPercentage = totalTickets > 0 ? (stats.resolved / totalTickets) * 100 : 0;
  const slaBreachPercentage = totalTickets > 0 ? (stats.slaBreached / totalTickets) * 100 : 0;

  const mainCards = [
    { title: t('stats.totalTickets'), value: stats.total.toLocaleString('en-US'), icon: <Support fontSize="small" />, tone: 'primary' as const },
    { title: t('stats.openTickets'), value: stats.open.toLocaleString('en-US'), icon: <Schedule fontSize="small" />, tone: 'warning' as const },
    { title: t('stats.resolvedTickets'), value: stats.resolved.toLocaleString('en-US'), icon: <CheckCircle fontSize="small" />, tone: 'success' as const, progress: { value: resolvedPercentage, label: t('stats.percentageOfTotal'), showValue: true } },
    { title: t('stats.averageResponseTime'), value: formatTime(stats.averageResponseTime, t), icon: <TrendingUp fontSize="small" />, tone: 'info' as const },
    { title: t('stats.averageResolutionTime'), value: formatTime(stats.averageResolutionTime, t), icon: <Person fontSize="small" />, tone: 'secondary' as const },
    { title: t('stats.slaBreached'), value: stats.slaBreached.toLocaleString('en-US'), icon: <Warning fontSize="small" />, tone: 'error' as const, progress: { value: slaBreachPercentage, label: t('stats.percentageOfTotal'), showValue: true } },
  ];

  return (
    <Stack spacing={1.75}>
      <PageSummaryGrid columns={4}>
        {mainCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            progress={card.progress as any}
          />
        ))}
      </PageSummaryGrid>

      <PageSummaryGrid columns={2}>
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>{t('stats.byCategory')}</Typography>
            <Stack spacing={1}>
              {Object.entries(stats.byCategory).map(([category, count]) => {
                const pct = totalTickets > 0 ? (count / totalTickets) * 100 : 0;
                return (
                  <Box key={category}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">{getCategoryLabel(category as SupportCategory, t)}</Typography>
                      <Typography variant="caption" color="text.secondary">{count} ({pct.toFixed(0)}%)</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>{t('stats.byPriority')}</Typography>
            <Stack spacing={1}>
              {Object.entries(stats.byPriority).map(([priority, count]) => {
                const pct = totalTickets > 0 ? (count / totalTickets) * 100 : 0;
                return (
                  <Box key={priority}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">{getPriorityLabel(priority as SupportPriority, t)}</Typography>
                      <Typography variant="caption" color="text.secondary">{count} ({pct.toFixed(0)}%)</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </PageSummaryGrid>
    </Stack>
  );
};

export default SupportStatsCards;