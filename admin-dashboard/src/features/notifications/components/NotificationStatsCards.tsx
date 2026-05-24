import React from 'react';
import {
  Notifications,
  CheckCircle,
  Pending,
  Error,
  Visibility,
  TrendingUp,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { NotificationStats } from '../types/notification.types';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface NotificationStatsCardsProps {
  stats: NotificationStats | undefined;
  isLoading?: boolean;
}

export const NotificationStatsCards: React.FC<NotificationStatsCardsProps> = React.memo(({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation('notifications');

  const safeStats = {
    total: stats?.total || 0,
    sent: stats?.byStatus?.sent || 0,
    queued: stats?.byStatus?.queued || 0,
    failed: stats?.byStatus?.failed || 0,
    read: stats?.byStatus?.read || 0,
    unreadCount: stats?.unreadCount || 0,
  };

  const cards = [
    { title: t('stats.total'), value: safeStats.total, icon: <Notifications fontSize="small" />, tone: 'primary' as const },
    { title: t('stats.sent'), value: safeStats.sent, icon: <CheckCircle fontSize="small" />, tone: 'success' as const },
    { title: t('stats.queued'), value: safeStats.queued, icon: <Pending fontSize="small" />, tone: 'warning' as const },
    { title: t('stats.failed'), value: safeStats.failed, icon: <Error fontSize="small" />, tone: 'error' as const },
    { title: t('stats.read'), value: safeStats.read, icon: <Visibility fontSize="small" />, tone: 'info' as const },
    { title: t('stats.unread'), value: safeStats.unreadCount, icon: <TrendingUp fontSize="small" />, tone: 'secondary' as const },
  ];

  return (
    <PageSummaryGrid columns={4}>
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value.toLocaleString('en-US')}
          icon={card.icon}
          tone={card.tone}
          loading={isLoading}
        />
      ))}
    </PageSummaryGrid>
  );
});

NotificationStatsCards.displayName = 'NotificationStatsCards';