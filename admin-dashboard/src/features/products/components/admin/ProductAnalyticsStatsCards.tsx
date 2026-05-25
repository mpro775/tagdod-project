import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import { useTranslation } from 'react-i18next';
import {
  Inventory2,
  CheckCircle,
  Archive,
  WarningAmber,
  TrendingDown,
  AttachMoney,
} from '@mui/icons-material';
import type { ProductStats, InventorySummary } from '../../types/product.types';

interface ProductAnalyticsStatsCardsProps {
  stats?: ProductStats;
  inventory?: InventorySummary;
  loading?: boolean;
}

export const ProductAnalyticsStatsCards: React.FC<ProductAnalyticsStatsCardsProps> = ({
  stats,
  inventory,
  loading = false,
}) => {
  const { t } = useTranslation('products');

  const items = [
    {
      title: t('stats.total', 'إجمالي المنتجات'),
      value: loading ? '-' : (stats?.total ?? 0).toLocaleString('en-US'),
      icon: <Inventory2 fontSize="small" />,
      tone: 'primary' as const,
      linkTo: '/products',
    },
    {
      title: t('stats.active', 'المنتجات النشطة'),
      value: loading ? '-' : (stats?.active ?? 0).toLocaleString('en-US'),
      icon: <CheckCircle fontSize="small" />,
      tone: 'success' as const,
      linkTo: '/products?status=active',
    },
    {
      title: t('stats.archived', 'مؤرشفة'),
      value: loading ? '-' : (stats?.archived ?? 0).toLocaleString('en-US'),
      icon: <Archive fontSize="small" />,
      tone: 'warning' as const,
      linkTo: '/products?status=archived',
    },
    {
      title: t('stats.lowStock', 'مخزون منخفض'),
      value: loading ? '-' : (stats?.lowStock ?? 0).toLocaleString('en-US'),
      icon: <WarningAmber fontSize="small" />,
      tone: 'error' as const,
      linkTo: '/products?stockState=low',
    },
    {
      title: t('stats.outOfStock', 'نفد المخزون'),
      value: loading ? '-' : (stats?.outOfStock ?? 0).toLocaleString('en-US'),
      icon: <TrendingDown fontSize="small" />,
      tone: 'error' as const,
      linkTo: '/products?stockState=out',
    },
    {
      title: t('stats.inventoryValue', 'قيمة المخزون'),
      value: loading
        ? '-'
        : inventory?.totalValue
          ? `$${inventory.totalValue.toLocaleString('en-US')}`
          : '0',
      icon: <AttachMoney fontSize="small" />,
      tone: 'info' as const,
    },
  ];

  return (
    <PageSummaryGrid columns={6} compact>
      {items.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          tone={item.tone}
          loading={loading}
          compact
          linkTo={item.linkTo}
        />
      ))}
    </PageSummaryGrid>
  );
};