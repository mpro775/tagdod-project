import React from 'react';
import {
  People as PeopleIcon,
  OnlinePrediction,
  Today,
  Schedule,
  PersonOff,
  Login,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface UserActivityStats {
  totalUsers: number;
  activeNow: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  inactiveUsers: number;
  neverLoggedIn: number;
  activityRate: number;
}

interface ActivityKPICardsProps {
  stats: UserActivityStats | null;
}

export const ActivityKPICards: React.FC<ActivityKPICardsProps> = ({ stats }) => {
  const { t } = useTranslation(['users', 'common']);

  if (!stats) return null;

  const safeStats = {
    totalUsers: stats.totalUsers ?? 0,
    activeNow: stats.activeNow ?? 0,
    activeToday: stats.activeToday ?? 0,
    activeThisWeek: stats.activeThisWeek ?? 0,
    activeThisMonth: stats.activeThisMonth ?? 0,
    inactiveUsers: stats.inactiveUsers ?? 0,
    neverLoggedIn: stats.neverLoggedIn ?? 0,
    activityRate: stats.activityRate ?? 0,
  };

  const cards = [
    {
      title: t('users:activity.kpi.totalUsers', 'إجمالي المستخدمين'),
      value: safeStats.totalUsers.toLocaleString('en-US'),
      icon: <PeopleIcon fontSize="small" />,
      tone: 'primary' as const,
      description: `${safeStats.activityRate}% ${t('users:activity.kpi.activeRate', 'نشط')}`,
    },
    {
      title: t('users:activity.kpi.activeNow', 'نشطون الآن'),
      value: safeStats.activeNow.toLocaleString('en-US'),
      icon: <OnlinePrediction fontSize="small" />,
      tone: 'success' as const,
      description: t('users:activity.kpi.last15min', 'آخر 15 دقيقة'),
    },
    {
      title: t('users:activity.kpi.activeToday', 'نشطون اليوم'),
      value: safeStats.activeToday.toLocaleString('en-US'),
      icon: <Today fontSize="small" />,
      tone: 'info' as const,
      description: t('users:activity.kpi.last24hours', 'آخر 24 ساعة'),
    },
    {
      title: t('users:activity.kpi.activeThisWeek', 'هذا الأسبوع'),
      value: safeStats.activeThisWeek.toLocaleString('en-US'),
      icon: <Schedule fontSize="small" />,
      tone: 'warning' as const,
      description: t('users:activity.kpi.last7days', 'آخر 7 أيام'),
    },
    {
      title: t('users:activity.kpi.inactive', 'غير نشطين'),
      value: safeStats.inactiveUsers.toLocaleString('en-US'),
      icon: <PersonOff fontSize="small" />,
      tone: 'error' as const,
      description: t('users:activity.kpi.moreThan30days', 'أكثر من 30 يوم'),
    },
    {
      title: t('users:activity.kpi.neverLoggedIn', 'لم يدخلوا أبداً'),
      value: safeStats.neverLoggedIn.toLocaleString('en-US'),
      icon: <Login fontSize="small" />,
      tone: 'neutral' as const,
      description: t('users:activity.kpi.registeredOnly', 'مسجلين فقط'),
    },
  ];

  return (
    <PageSummaryGrid columns={6} compact>
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
          compact
          description={card.description}
        />
      ))}
    </PageSummaryGrid>
  );
};