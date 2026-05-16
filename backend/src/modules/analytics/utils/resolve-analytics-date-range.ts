import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

export interface AnalyticsDateRangeQuery {
  period?: 'today' | '7d' | '30d' | '90d' | 'month' | 'quarter' | 'year' | 'custom' | string;
  startDate?: string;
  endDate?: string;
}

export function resolveAnalyticsDateRange(query: AnalyticsDateRangeQuery): {
  startDate: Date;
  endDate: Date;
  period: string;
} {
  const now = new Date();

  if (query.startDate && query.endDate) {
    return {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      period: 'custom',
    };
  }

  switch (query.period) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now), period: 'today' };
    case '7d':
      return { startDate: startOfDay(subDays(now, 7)), endDate: endOfDay(now), period: '7d' };
    case '90d':
      return { startDate: startOfDay(subDays(now, 90)), endDate: endOfDay(now), period: '90d' };
    case 'month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now), period: 'month' };
    case 'quarter':
      return { startDate: startOfQuarter(now), endDate: endOfQuarter(now), period: 'quarter' };
    case 'year':
      return { startDate: startOfYear(now), endDate: endOfYear(now), period: 'year' };
    case '30d':
    default:
      return { startDate: startOfDay(subDays(now, 30)), endDate: endOfDay(now), period: '30d' };
  }
}
