import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import { useTranslation } from 'react-i18next';
import {
  Inventory2,
  CheckCircle,
  EditNote,
  Archive,
  Warning,
  Star,
  LocalOffer,
  NewReleases,
  TrendingDown,
} from '@mui/icons-material';
import type { ProductStats } from '../../types/product.types';

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
  const { t } = useTranslation('products');

  const total = stats.total || 0;
  const percent = (value?: number) => (total > 0 ? ((value || 0) / total) * 100 : 0);

  const items = [
    {
      title: t('stats.total', 'إجمالي المنتجات'),
      value: stats.total,
      icon: <Inventory2 fontSize="small" />,
      tone: 'primary' as const,
      linkTo: '/products',
      percentage: 100,
    },
    {
      title: t('stats.active', 'المنتجات النشطة'),
      value: stats.active,
      icon: <CheckCircle fontSize="small" />,
      tone: 'success' as const,
      linkTo: '/products?status=active',
      percentage: percent(stats.active),
    },
    {
      title: t('stats.draft', 'المسودات'),
      value: stats.draft,
      icon: <EditNote fontSize="small" />,
      tone: 'neutral' as const,
      linkTo: '/products?status=draft',
      percentage: percent(stats.draft),
    },
    {
      title: t('stats.archived', 'مؤرشفة'),
      value: stats.archived,
      icon: <Archive fontSize="small" />,
      tone: 'warning' as const,
      linkTo: '/products?status=archived',
      percentage: percent(stats.archived),
    },
    {
      title: t('stats.featured', 'مميزة'),
      value: stats.featured,
      icon: <Star fontSize="small" />,
      tone: 'info' as const,
      percentage: percent(stats.featured),
    },
    {
      title: t('stats.newProducts', 'جديدة'),
      value: stats.newProducts || 0,
      icon: <NewReleases fontSize="small" />,
      tone: 'info' as const,
      percentage: percent(stats.newProducts),
    },
    {
      title: t('stats.withOffers', 'عليها عروض'),
      value: stats.withOffers || 0,
      icon: <LocalOffer fontSize="small" />,
      tone: 'error' as const,
      linkTo: '/products?hasOffer=true',
      percentage: percent(stats.withOffers),
    },
    {
      title: t('stats.lowStock', 'مخزون منخفض'),
      value: stats.lowStock || 0,
      icon: <Warning fontSize="small" />,
      tone: 'error' as const,
      linkTo: '/products?stockState=low',
      percentage: percent(stats.lowStock),
    },
    {
      title: t('stats.outOfStock', 'نفد المخزون'),
      value: stats.outOfStock || 0,
      icon: <TrendingDown fontSize="small" />,
      tone: 'error' as const,
      linkTo: '/products?stockState=out',
      percentage: percent(stats.outOfStock),
    },
  ];

  return (
    <PageSummaryGrid columns={compact ? 5 : 4} compact={compact}>
      {items.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={loading ? '-' : Number(item.value || 0).toLocaleString('en-US')}
          icon={item.icon}
          tone={item.tone}
          loading={loading}
          compact={compact}
          linkTo={item.linkTo}
          progress={{
            value: item.percentage,
            label: t('stats.ofTotal', 'من الإجمالي'),
            showValue: !compact,
          }}
        />
      ))}
    </PageSummaryGrid>
  );
};