import React from 'react';
import {
  Shield,
  Warning as AlertTriangle,
  Key,
  AdminPanelSettings as CrownIcon,
  CheckCircle as CheckCircleIcon,
  Lock,
  Dataset as DatabaseIcon,
  Settings,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AuditStats } from '../types/audit.types';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface AuditStatsCardsProps {
  stats: AuditStats | undefined;
  isLoading: boolean;
}

export const AuditStatsCards: React.FC<AuditStatsCardsProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation('audit');

  if (isLoading) {
    return (
      <PageSummaryGrid columns={4}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <StatCard key={i} title="…" value="-" loading />
        ))}
      </PageSummaryGrid>
    );
  }

  if (!stats) {
    return <StatCard title={t('messages.noData', 'لا توجد بيانات')} value="-" tone="neutral" />;
  }

  const statsData = [
    { title: t('stats.totalLogs'), value: stats.totalLogs.toLocaleString(), icon: <DatabaseIcon fontSize="small" />, tone: 'primary' as const, description: t('stats.totalLogsDesc') },
    { title: t('stats.sensitiveLogs'), value: stats.sensitiveLogs.toLocaleString(), icon: <Shield fontSize="small" />, tone: 'error' as const, description: t('stats.sensitiveLogsDesc') },
    { title: t('stats.permissionChanges'), value: stats.permissionChanges.toLocaleString(), icon: <Key fontSize="small" />, tone: 'warning' as const, description: t('stats.permissionChangesDesc') },
    { title: t('stats.roleChanges'), value: stats.roleChanges.toLocaleString(), icon: <CrownIcon fontSize="small" />, tone: 'secondary' as const, description: t('stats.roleChangesDesc') },
    { title: t('stats.capabilityDecisions'), value: stats.capabilityDecisions.toLocaleString(), icon: <CheckCircleIcon fontSize="small" />, tone: 'success' as const, description: t('stats.capabilityDecisionsDesc') },
    { title: t('stats.adminActions'), value: stats.adminActions.toLocaleString(), icon: <Settings fontSize="small" />, tone: 'info' as const, description: t('stats.adminActionsDesc') },
    { title: t('stats.authEvents'), value: stats.authEvents.toLocaleString(), icon: <Lock fontSize="small" />, tone: 'primary' as const, description: t('stats.authEventsDesc') },
    { title: t('stats.sensitivityRate'), value: `${stats.totalLogs > 0 ? Math.round((stats.sensitiveLogs / stats.totalLogs) * 100) : 0}%`, icon: <AlertTriangle fontSize="small" />, tone: 'warning' as const, description: t('stats.sensitivityRateDesc') },
  ];

  return (
    <PageSummaryGrid columns={4}>
      {statsData.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
          description={stat.description}
        />
      ))}
    </PageSummaryGrid>
  );
};