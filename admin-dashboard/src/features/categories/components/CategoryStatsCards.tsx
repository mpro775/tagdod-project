import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@mui/material';
import { Category, TrendingUp, Star, Refresh, Visibility } from '@mui/icons-material';
import { useCategoryStats, useUpdateCategoryStats } from '../hooks/useCategories';
import { formatNumber } from '@/shared/utils/formatters';
import { PageSummaryGrid, StatCard, StatsSection } from '@/shared/design-system';

interface CategoryStatsCardsProps {
  onRefresh?: () => void;
  compact?: boolean;
}

export const CategoryStatsCards: React.FC<CategoryStatsCardsProps> = ({ onRefresh, compact = false }) => {
  const { t } = useTranslation('categories');
  const { data: stats, isLoading, error } = useCategoryStats();
  const { isPending: isUpdating } = useUpdateCategoryStats();

  const handleRefreshStats = () => {
    if (onRefresh) onRefresh();
  };

  if (error) {
    return <StatCard title={t('stats.title')} value="-" tone="error" compact={compact} />;
  }

  const statsCards = [
    {
      title: t('stats.totalCategories'),
      value: formatNumber(stats?.totalCategories || 0),
      icon: <Category fontSize="small" />,
      tone: 'primary' as const,
      description: compact ? undefined : t('stats.totalDesc'),
    },
    {
      title: t('stats.activeCategories'),
      value: formatNumber(stats?.activeCategories || 0),
      icon: <Visibility fontSize="small" />,
      tone: 'success' as const,
      description: compact ? undefined : t('stats.activeDesc'),
    },
    {
      title: t('stats.featuredCategories'),
      value: formatNumber(stats?.featuredCategories || 0),
      icon: <Star fontSize="small" />,
      tone: 'warning' as const,
      description: compact ? undefined : t('stats.featuredDesc'),
    },
    {
      title: t('stats.totalProducts'),
      value: formatNumber(stats?.totalProducts || 0),
      icon: <TrendingUp fontSize="small" />,
      tone: 'info' as const,
      description: compact ? undefined : t('stats.totalProductsDesc'),
    },
  ];

  const refreshButton = (
    <Tooltip title={t('stats.refreshStats')}>
      <span>
        <IconButton size="small" onClick={handleRefreshStats} disabled={isUpdating} color="primary">
          <Refresh />
        </IconButton>
      </span>
    </Tooltip>
  );

  if (compact) {
    return (
      <PageSummaryGrid columns={4} compact>
        {statsCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            loading={isLoading}
            compact
          />
        ))}
      </PageSummaryGrid>
    );
  }

  return (
    <StatsSection title={t('stats.title')} action={refreshButton}>
      <PageSummaryGrid columns={4}>
        {statsCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            description={card.description}
            loading={isLoading}
          />
        ))}
      </PageSummaryGrid>
    </StatsSection>
  );
};