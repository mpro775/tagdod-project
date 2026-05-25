import React from 'react';
import {
  Inventory2,
  CheckCircle,
  EditNote,
  Archive,
  Warning,
  Star,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import type { ProductStats } from '../types/product.types';

interface ProductStatsCardsProps {
  stats: ProductStats;
  loading?: boolean;
  compact?: boolean;
}

export const ProductStatsCards: React.FC<ProductStatsCardsProps> = ({
  stats,
  loading = false,
  compact = false,
}) => {
  const { t } = useTranslation(['products', 'common']);

  const total = stats.total || 0;
  const percent = (value?: number) => (total > 0 ? ((value || 0) / total) * 100 : 0);

  const statsData = [
    {
      title: t('products:stats.total', 'إجمالي المنتجات'),
      value: stats.total,
      icon: <Inventory2 fontSize="small" />,
      tone: 'primary' as const,
      linkTo: '/products',
      percentage: 100,
    },
    {
      title: t('products:stats.active', 'المنتجات النشطة'),
      value: stats.active,
      icon: <CheckCircle fontSize="small" />,
      tone: 'success' as const,
      linkTo: '/products?status=active',
      percentage: percent(stats.active),
    },
    {
      title: t('products:stats.draft', 'المسودات'),
      value: stats.draft,
      icon: <EditNote fontSize="small" />,
      tone: 'neutral' as const,
      linkTo: '/products?status=draft',
      percentage: percent(stats.draft),
    },
    {
      title: t('products:stats.archived', 'مؤرشفة'),
      value: stats.archived,
      icon: <Archive fontSize="small" />,
      tone: 'warning' as const,
      linkTo: '/products?status=archived',
      percentage: percent(stats.archived),
    },
    {
      title: t('products:stats.featured', 'مميزة'),
      value: stats.featured,
      icon: <Star fontSize="small" />,
      tone: 'info' as const,
      percentage: percent(stats.featured),
    },
    {
      title: t('products:stats.lowStock', 'مخزون منخفض'),
      value: stats.lowStock || 0,
      icon: <Warning fontSize="small" />,
      tone: 'error' as const,
      linkTo: '/products/inventory',
      percentage: percent(stats.lowStock),
    },
  ];

  return (
    <PageSummaryGrid columns={6} compact={compact}>
      {statsData.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={loading ? '-' : Number(stat.value || 0).toLocaleString('en-US')}
          icon={stat.icon}
          tone={stat.tone}
          loading={loading}
          compact={compact}
          linkTo={stat.linkTo}
          progress={{
            value: stat.percentage,
            label: t('products:stats.ofTotal', 'من الإجمالي'),
            showValue: true,
          }}
        />
      ))}
    </PageSummaryGrid>
  );
};