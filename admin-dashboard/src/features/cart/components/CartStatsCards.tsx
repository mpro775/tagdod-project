import React from 'react';
import {
  ShoppingCart,
  LooksOne,
  TrendingUp,
  MonetizationOn,
  Email,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CartStatistics, CartAnalytics, Cart } from '../types/cart.types';
import { formatCurrency, getCartSummary } from '../api/cartApi';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';

interface CartStatsCardsProps {
  statistics?: CartStatistics;
  analytics?: CartAnalytics;
  isLoading?: boolean;
  onRefresh?: () => void;
  carts?: Cart[];
}

export const CartStatsCards: React.FC<CartStatsCardsProps> = ({
  statistics,
  analytics,
  isLoading = false,
  carts,
}) => {
  const { t } = useTranslation('cart');
  const overview = analytics?.overview;
  const allTime = statistics?.allTime;
  const conversionOverview = analytics?.trends?.recentActivity?.[0] as
    | { totalValue?: number }
    | undefined;

  const fallback = React.useMemo(() => {
    if (!carts || carts.length === 0) return null;
    const selectUsdTotal = (cart: Cart): number => getCartSummary(cart, 'USD')?.total ?? 0;
    const aggregates = carts.reduce(
      (acc, cart) => {
        acc.totalCarts += 1;
        acc.totalValue += selectUsdTotal(cart);
        switch (cart.status) {
          case 'active': acc.active += 1; break;
          case 'abandoned': acc.abandoned += 1; break;
          case 'converted': acc.converted += 1; break;
        }
        return acc;
      },
      { totalCarts: 0, totalValue: 0, active: 0, abandoned: 0, converted: 0 },
    );
    const conversionRate = aggregates.totalCarts > 0 ? (aggregates.converted / aggregates.totalCarts) * 100 : 0;
    return { ...aggregates, conversionRate };
  }, [carts]);

  const totalCarts = allTime?.total ?? overview?.totalCarts ?? fallback?.totalCarts ?? 0;
  const activeCarts = allTime?.active ?? overview?.activeCarts ?? fallback?.active ?? 0;
  const abandonedCarts = allTime?.abandoned ?? overview?.abandonedCarts ?? fallback?.abandoned ?? 0;
  const convertedCarts = allTime?.converted ?? overview?.convertedCarts ?? fallback?.converted ?? 0;
  const totalValue = allTime?.totalValue ?? conversionOverview?.totalValue ?? fallback?.totalValue ?? 0;
  const averageCartValue = overview?.avgCartValue ?? (totalCarts ? totalValue / totalCarts : 0);
  const conversionRate = overview?.conversionRate ?? allTime?.conversionRate ?? fallback?.conversionRate ?? 0;
  const recoveryRate = conversionRate;

  const stats = [
    { title: t('stats.totalCarts'), value: totalCarts.toLocaleString('en-US'), icon: <ShoppingCart fontSize="small" />, tone: 'primary' as const },
    { title: t('stats.activeCarts'), value: activeCarts.toLocaleString('en-US'), icon: <LooksOne fontSize="small" />, tone: 'success' as const },
    { title: t('stats.abandonedCarts'), value: abandonedCarts.toLocaleString('en-US'), icon: <Email fontSize="small" />, tone: 'warning' as const },
    { title: t('stats.convertedCarts'), value: convertedCarts.toLocaleString('en-US'), icon: <TrendingUp fontSize="small" />, tone: 'secondary' as const },
    { title: t('stats.totalValue'), value: formatCurrency(totalValue, 'USD'), icon: <MonetizationOn fontSize="small" />, tone: 'info' as const },
    { title: t('stats.averageValue'), value: formatCurrency(averageCartValue, 'USD'), icon: <TrendingUp fontSize="small" />, tone: 'neutral' as const },
    { title: t('stats.conversionRate'), value: `${(conversionRate ?? 0).toFixed(1)}%`, icon: <TrendingUp fontSize="small" />, tone: 'info' as const },
    { title: t('stats.recoveryRate'), value: `${(recoveryRate ?? 0).toFixed(1)}%`, icon: <Refresh fontSize="small" />, tone: 'error' as const },
  ];

  return (
    <PageSummaryGrid columns={4}>
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
          loading={isLoading}
        />
      ))}
    </PageSummaryGrid>
  );
};

export default CartStatsCards;