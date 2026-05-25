import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import {
  Category,
  CheckCircle,
  FilterAlt,
  TrendingUp,
  TextFields,
  ColorLens,
} from '@mui/icons-material';
import type { AttributeStats } from '../types/attribute.types';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface AttributeStatsCardsProps {
  stats?: AttributeStats;
  isLoading?: boolean;
  compact?: boolean;
}

export const AttributeStatsCards: React.FC<AttributeStatsCardsProps> = ({
  stats,
  isLoading = false,
  compact = false,
}) => {
  const { t } = useTranslation('attributes');

  if (isLoading) {
    return (
      <PageSummaryGrid columns={4} compact>
        {[1, 2, 3, 4].map((i) => (
          <StatCard key={i} title="…" value="-" loading compact={compact} />
        ))}
      </PageSummaryGrid>
    );
  }

  if (!stats) {
    return null;
  }

  const total = stats.total || 1;
  const mainCards = [
    {
      title: t('stats.totalAttributes'),
      value: (stats.total || 0).toLocaleString(),
      icon: <Category fontSize="small" />,
      tone: 'primary' as const,
      description: compact ? undefined : t('stats.totalDesc'),
      progress: compact ? undefined : {
        value: (stats.active / total) * 100,
        label: t('stats.activeDesc', { percentage: ((stats.active / total) * 100).toFixed(1) }),
        showValue: true,
      },
    },
    {
      title: t('stats.activeAttributes'),
      value: (stats.active || 0).toLocaleString(),
      icon: <CheckCircle fontSize="small" />,
      tone: 'success' as const,
      description: compact ? undefined : t('stats.activeDesc', { percentage: ((stats.active / total) * 100).toFixed(1) }),
    },
    {
      title: t('stats.filterableAttributes'),
      value: (stats.filterable || 0).toLocaleString(),
      icon: <FilterAlt fontSize="small" />,
      tone: 'info' as const,
      description: compact ? undefined : t('stats.filterableDesc', { percentage: ((stats.filterable / total) * 100).toFixed(1) }),
    },
    {
      title: t('stats.usageRate'),
      value: `${Math.round(((stats.active || 0) / total) * 100)}%`,
      icon: <TrendingUp fontSize="small" />,
      tone: 'warning' as const,
      description: compact ? undefined : t('stats.usageDesc'),
    },
  ];

  if (compact) {
    return (
      <PageSummaryGrid columns={4} compact>
        {mainCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            compact
          />
        ))}
      </PageSummaryGrid>
    );
  }

  const typeCards = stats.byType ? [
    { key: 'text', title: t('typeLabels.text'), value: String(stats.byType.text || 0), icon: <TextFields fontSize="small" />, tone: 'info' as const },
    { key: 'color', title: t('typeLabels.color'), value: String(stats.byType.color || 0), icon: <ColorLens fontSize="small" />, tone: 'warning' as const },
  ] : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <PageSummaryGrid columns={4}>
        {mainCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            description={card.description}
            progress={card.progress}
          />
        ))}
      </PageSummaryGrid>

      {typeCards.length > 0 && (
        <PageSummaryGrid columns={2}>
          {typeCards.map((card) => (
            <StatCard
              key={card.key}
              title={card.title}
              value={card.value}
              icon={card.icon}
              tone={card.tone}
            />
          ))}
        </PageSummaryGrid>
      )}
    </Box>
  );
};