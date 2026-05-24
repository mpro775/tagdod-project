import React from 'react';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as EngineeringIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { UserStats } from '../types/user.types';
import { useTranslation } from 'react-i18next';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface UserStatsCardsProps {
  stats: UserStats;
  loading?: boolean;
  compact?: boolean;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats, loading = false, compact = false }) => {
  const { t } = useTranslation(['users', 'common']);

  const statsData = [
    {
      title: t('users:stats.total', 'إجمالي المستخدمين'),
      value: stats.total,
      icon: <PeopleIcon fontSize="small" />,
      tone: 'primary' as const,
      percentage: 100,
    },
    {
      title: t('users:stats.active', 'المستخدمين النشطين'),
      value: stats.active,
      icon: <PersonIcon fontSize="small" />,
      tone: 'success' as const,
      percentage: stats.total > 0 ? (stats.active / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.suspended', 'المستخدمين المعلقين'),
      value: stats.suspended,
      icon: <BlockIcon fontSize="small" />,
      tone: 'warning' as const,
      percentage: stats.total > 0 ? (stats.suspended / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.deleted', 'المستخدمين المحذوفين'),
      value: stats.deleted,
      icon: <DeleteIcon fontSize="small" />,
      tone: 'error' as const,
      percentage: stats.total > 0 ? (stats.deleted / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.admins', 'المديرين'),
      value: stats.admins,
      icon: <AdminIcon fontSize="small" />,
      tone: 'info' as const,
      percentage: stats.total > 0 ? (stats.admins / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.engineers', 'المهندسين'),
      value: stats.engineers,
      icon: <EngineeringIcon fontSize="small" />,
      tone: 'secondary' as const,
      percentage: stats.total > 0 ? (stats.engineers / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.merchants', 'التجار'),
      value: stats.merchants,
      icon: <StoreIcon fontSize="small" />,
      tone: 'success' as const,
      percentage: stats.total > 0 ? (stats.merchants / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.users', 'المستخدمين العاديين'),
      value: stats.users,
      icon: <PersonIcon fontSize="small" />,
      tone: 'info' as const,
      percentage: stats.total > 0 ? (stats.users / stats.total) * 100 : 0,
    },
  ];

  return (
    <PageSummaryGrid columns={4} compact={compact}>
      {statsData.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={loading ? '-' : stat.value.toLocaleString('en-US')}
          icon={stat.icon}
          tone={stat.tone}
          loading={loading}
          compact={compact}
          progress={{
            value: stat.percentage,
            label: t('users:stats.ofTotal', 'من الإجمالي'),
            showValue: true,
          }}
        />
      ))}
    </PageSummaryGrid>
  );
};