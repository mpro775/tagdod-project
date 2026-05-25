import React from 'react';
import { Business, BusinessCenter, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBrandStats } from '../hooks/useBrands';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface BrandStatsCardsProps {
  compact?: boolean;
}

export const BrandStatsCards: React.FC<BrandStatsCardsProps> = ({ compact = false }) => {
  const { t } = useTranslation('brands');
  const { data: stats, isLoading, error } = useBrandStats();

  if (error) {
    return <StatCard title={t('stats.totalBrands')} value="-" tone="error" compact={compact} />;
  }

  const cards = [
    {
      title: t('stats.totalBrands'),
      value: (stats?.total || 0).toLocaleString('en-US'),
      icon: <Business fontSize="small" />,
      tone: 'primary' as const,
    },
    {
      title: t('stats.activeBrands'),
      value: (stats?.active || 0).toLocaleString('en-US'),
      icon: <Visibility fontSize="small" />,
      tone: 'success' as const,
    },
    {
      title: t('stats.inactiveBrands'),
      value: (stats?.inactive || 0).toLocaleString('en-US'),
      icon: <VisibilityOff fontSize="small" />,
      tone: 'warning' as const,
    },
    {
      title: t('stats.brandsWithProducts'),
      value: (stats?.withProducts || 0).toLocaleString('en-US'),
      icon: <BusinessCenter fontSize="small" />,
      tone: 'error' as const,
    },
  ];

  return (
    <PageSummaryGrid columns={4} compact={compact}>
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
          loading={isLoading}
          compact={compact}
        />
      ))}
    </PageSummaryGrid>
  );
};