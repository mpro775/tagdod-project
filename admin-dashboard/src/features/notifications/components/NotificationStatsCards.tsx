import React from 'react';
import { Grid } from '@mui/material';
import {
  Notifications,
  CheckCircle,
  Pending,
  Error,
  Visibility,
  TrendingUp,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { NotificationStats } from '../types/notification.types';
import { NotificationStatsCard } from './NotificationStatsCard';
import { useTheme } from '@mui/material/styles';

interface NotificationStatsCardsProps {
  stats: NotificationStats | undefined;
  isLoading?: boolean;
}

export const NotificationStatsCards: React.FC<NotificationStatsCardsProps> = React.memo(({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const theme = useTheme();

  const safeStats = {
    total: stats?.total || 0,
    sent: stats?.byStatus?.sent || 0,
    queued: stats?.byStatus?.queued || 0,
    failed: stats?.byStatus?.failed || 0,
    read: stats?.byStatus?.read || 0,
    unreadCount: stats?.unreadCount || 0,
    recent24h: stats?.recent24h || 0,
  };

  return (
    <Grid container spacing={isMobile ? 1.5 : 2}>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <NotificationStatsCard
          icon={<Notifications />}
          value={safeStats.total}
          label={t('stats.total')}
          color={theme.palette.primary.main}
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <NotificationStatsCard
          icon={<CheckCircle />}
          value={safeStats.sent}
          label={t('stats.sent')}
          color={theme.palette.success.main}
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <NotificationStatsCard
          icon={<Pending />}
          value={safeStats.queued}
          label={t('stats.queued')}
          color={theme.palette.warning.main}
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <NotificationStatsCard
          icon={<Error />}
          value={safeStats.failed}
          label={t('stats.failed')}
          color={theme.palette.error.main}
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <NotificationStatsCard
          icon={<Visibility />}
          value={safeStats.read}
          label={t('stats.read')}
          color={theme.palette.info.main}
          isLoading={isLoading}
        />
      </Grid>

      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <NotificationStatsCard
          icon={<TrendingUp />}
          value={safeStats.unreadCount}
          label={t('stats.unread')}
          color={theme.palette.secondary.main}
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
});

NotificationStatsCards.displayName = 'NotificationStatsCards';

