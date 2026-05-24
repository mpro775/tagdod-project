import React from 'react';
import { Assignment, CheckCircle, HourglassEmpty, Star, Web, Timeline } from '@mui/icons-material';
import { useProjectStats } from '../hooks/useProjects';
import { useTranslation } from 'react-i18next';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

export const ProjectStatsCards: React.FC = () => {
  const { t } = useTranslation('projects');
  const { data: stats } = useProjectStats();

  const cards = [
    { title: t('stats.total', 'إجمالي المشاريع'), value: stats?.total ?? 0, icon: <Assignment fontSize="small" />, tone: 'primary' as const },
    { title: t('stats.published', 'منشور'), value: stats?.published ?? 0, icon: <CheckCircle fontSize="small" />, tone: 'success' as const },
    { title: t('stats.inProgress', 'قيد التنفيذ'), value: stats?.inProgress ?? 0, icon: <HourglassEmpty fontSize="small" />, tone: 'warning' as const },
    { title: t('stats.completed', 'مكتمل'), value: stats?.completed ?? 0, icon: <Timeline fontSize="small" />, tone: 'info' as const },
    { title: t('stats.featured', 'مميز'), value: stats?.featured ?? 0, icon: <Star fontSize="small" />, tone: 'secondary' as const },
    { title: t('stats.onLanding', 'معروض في الصفحة'), value: stats?.onLanding ?? 0, icon: <Web fontSize="small" />, tone: 'error' as const },
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
        />
      ))}
    </PageSummaryGrid>
  );
};