import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, Typography } from '@mui/material';
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
}

const TypeStatsCard: React.FC<{ stats: AttributeStats }> = ({ stats }) => {
  const { t } = useTranslation('attributes');

  if (!stats.byType) {
    return (
      <Card sx={{ bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Category color="primary" sx={{ mb: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('stats.typeDistribution')}</Typography>
          <Typography variant="caption" color="text.secondary">{t('stats.noData')}</Typography>
        </CardContent>
      </Card>
    );
  }

  const typeData = [
    { key: 'text', label: t('typeLabels.text'), value: stats.byType.text || 0, icon: <TextFields fontSize="small" />, tone: 'info' as const },
    { key: 'color', label: t('typeLabels.color'), value: stats.byType.color || 0, icon: <ColorLens fontSize="small" />, tone: 'warning' as const },
  ];

  return (
    <PageSummaryGrid columns={2}>
      {typeData.map((type) => (
        <StatCard
          key={type.key}
          title={type.label}
          value={type.value.toLocaleString()}
          icon={type.icon}
          tone={type.tone}
        />
      ))}
    </PageSummaryGrid>
  );
};

export const AttributeStatsCards: React.FC<AttributeStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation('attributes');

  if (isLoading) {
    return (
      <PageSummaryGrid columns={4}>
        {[1, 2, 3, 4].map((i) => (
          <StatCard key={i} title="…" value="-" loading />
        ))}
      </PageSummaryGrid>
    );
  }

  if (!stats) {
    return null;
  }

  const mainCards = [
    {
      title: t('stats.totalAttributes'),
      value: stats.total.toLocaleString(),
      icon: <Category fontSize="small" />,
      tone: 'primary' as const,
      description: t('stats.totalDesc'),
    },
    {
      title: t('stats.activeAttributes'),
      value: stats.active.toLocaleString(),
      icon: <CheckCircle fontSize="small" />,
      tone: 'success' as const,
      progress: {
        value: stats.total > 0 ? (stats.active / stats.total) * 100 : 0,
        label: t('stats.activeDesc', { percentage: ((stats.active / stats.total) * 100).toFixed(1) }),
        showValue: true,
      },
    },
    {
      title: t('stats.filterableAttributes'),
      value: stats.filterable.toLocaleString(),
      icon: <FilterAlt fontSize="small" />,
      tone: 'info' as const,
      progress: {
        value: stats.total > 0 ? (stats.filterable / stats.total) * 100 : 0,
        label: t('stats.filterableDesc', { percentage: ((stats.filterable / stats.total) * 100).toFixed(1) }),
        showValue: true,
      },
    },
    {
      title: t('stats.usageRate'),
      value: `${Math.round((stats.active / stats.total) * 100)}%`,
      icon: <TrendingUp fontSize="small" />,
      tone: 'warning' as const,
      description: t('stats.usageDesc'),
    },
  ];

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

      <TypeStatsCard stats={stats} />
    </Box>
  );
};