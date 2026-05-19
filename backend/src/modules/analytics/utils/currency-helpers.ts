import { AnalyticsCurrency } from '../base-analytics.controller';

export function normalizeAnalyticsCurrency(value?: string): AnalyticsCurrency {
  return value === 'USD' || value === 'SAR' || value === 'YER' ? value : 'YER';
}

export function getOrderTotalByCurrency(
  order: {
    total?: number;
    currency?: string;
    totalsInAllCurrencies?: {
      USD?: { total?: number };
      YER?: { total?: number };
      SAR?: { total?: number };
    };
  },
  selectedCurrency: AnalyticsCurrency,
): number {
  if (!order) return 0;

  const all = order.totalsInAllCurrencies;
  if (all?.[selectedCurrency]?.total !== undefined) {
    return all[selectedCurrency].total;
  }

  if (order.currency === selectedCurrency && order.total !== undefined) {
    return order.total;
  }

  return 0;
}

export function getItemLineTotalByCurrency(
  item: {
    lineTotal?: number;
    currency?: string;
  },
  order: {
    total?: number;
    currency?: string;
    totalsInAllCurrencies?: {
      USD?: { total?: number };
      YER?: { total?: number };
      SAR?: { total?: number };
    };
  },
  selectedCurrency: AnalyticsCurrency,
): number {
  if (!item || !order) return 0;

  // If item currency matches selected, use item lineTotal directly
  if (item.currency === selectedCurrency && item.lineTotal !== undefined) {
    return item.lineTotal;
  }

  const orderTotalInCurrency = getOrderTotalByCurrency(order, selectedCurrency);
  const orderTotalOriginal = order.total || 0;

  if (orderTotalInCurrency > 0 && orderTotalOriginal > 0 && item.lineTotal !== undefined) {
    // Proportional conversion
    return (item.lineTotal / orderTotalOriginal) * orderTotalInCurrency;
  }

  return 0;
}

export function getPriceByCurrency(
  entity: {
    basePriceYER?: number;
    basePriceUSD?: number;
    basePriceSAR?: number;
  },
  currency: AnalyticsCurrency,
): number {
  if (currency === 'YER') return entity.basePriceYER ?? 0;
  if (currency === 'SAR') return entity.basePriceSAR ?? 0;
  return entity.basePriceUSD ?? 0;
}
