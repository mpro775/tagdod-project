import { PageSummaryGrid, StatCard, LoadingState } from '@/shared/design-system';
import { useTranslation } from 'react-i18next';
import {
  Inventory2,
  CheckCircle,
  Warning,
  TrendingDown,
  AttachMoney,
} from '@mui/icons-material';
import { useInventorySummary, useLowStockVariants, useOutOfStockVariants } from '../../hooks/useProducts';

interface InventoryStatsCardsProps {
  compact?: boolean;
}

export const InventoryStatsCards: React.FC<InventoryStatsCardsProps> = ({
  compact = false,
}) => {
  const { t } = useTranslation('products');

  const { data: summary, isLoading: loadingSummary } = useInventorySummary();
  const { data: lowStockVariants, isLoading: loadingLowStock } = useLowStockVariants();
  const { data: outOfStockVariants, isLoading: loadingOutOfStock } = useOutOfStockVariants();

  const isLoading = loadingSummary && loadingLowStock && loadingOutOfStock;

  if (isLoading) {
    return <LoadingState variant="skeleton" rows={1} />;
  }

  const lowStockCount = lowStockVariants?.length ?? summary?.lowStock ?? 0;
  const outOfStockCount = outOfStockVariants?.length ?? summary?.outOfStock ?? 0;
  const inStockCount = summary?.inStock ?? 0;
  const totalVariants = summary?.totalVariants ?? 0;
  const totalValue = summary?.totalValue ?? 0;

  const items = [
    {
      title: t('inventory.totalVariants', 'إجمالي المتغيرات'),
      value: totalVariants.toLocaleString('en-US'),
      icon: <Inventory2 fontSize="small" />,
      tone: 'primary' as const,
      progress: {
        value: totalVariants > 0 ? 100 : 0,
        showValue: !compact,
      },
    },
    {
      title: t('inventory.inStock', 'متوفر في المخزون'),
      value: inStockCount.toLocaleString('en-US'),
      icon: <CheckCircle fontSize="small" />,
      tone: 'success' as const,
      progress: {
        value: totalVariants > 0 ? (inStockCount / totalVariants) * 100 : 0,
        showValue: !compact,
      },
    },
    {
      title: t('inventory.lowStock', 'مخزون منخفض'),
      value: lowStockCount.toLocaleString('en-US'),
      icon: <Warning fontSize="small" />,
      tone: 'warning' as const,
      progress: {
        value: totalVariants > 0 ? (lowStockCount / totalVariants) * 100 : 0,
        showValue: !compact,
      },
    },
    {
      title: t('inventory.outOfStock', 'نفذ من المخزون'),
      value: outOfStockCount.toLocaleString('en-US'),
      icon: <TrendingDown fontSize="small" />,
      tone: 'error' as const,
      progress: {
        value: totalVariants > 0 ? (outOfStockCount / totalVariants) * 100 : 0,
        showValue: !compact,
      },
    },
    {
      title: t('inventory.totalValue', 'إجمالي قيمة المخزون'),
      value: `$${totalValue.toLocaleString('en-US')}`,
      icon: <AttachMoney fontSize="small" />,
      tone: 'info' as const,
    },
  ];

  return (
    <PageSummaryGrid columns={compact ? 5 : 4} compact={compact}>
      {items.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          tone={item.tone}
          compact={compact}
          progress={item.progress}
          loading={isLoading}
        />
      ))}
    </PageSummaryGrid>
  );
};