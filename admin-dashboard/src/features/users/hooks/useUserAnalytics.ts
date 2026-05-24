import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  userAnalyticsApi,
  type ChurnRiskAlert as ChurnRiskResponse,
  type ChurnRiskCustomer,
  type CustomerRanking as ApiCustomerRanking,
  type CustomerSegments,
  type OverallUserAnalytics,
} from '../api/userAnalyticsApi';

export interface OverallAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  topSpenders: Array<{ userId: string; totalSpent: number }>;
  userGrowth: Array<{ month: string; newUsers: number }>;
  totalRevenue?: number;
  averageOrdersPerUser?: number;
  generatedAt?: string;
}

export interface CustomerRanking extends Omit<ApiCustomerRanking, 'userId'> {
  userId: string;
  rank: number;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  tier: string;
}

export interface ChurnRiskAlert {
  userId: string;
  name: string;
  contact: string;
  email?: string;
  churnRisk: 'high' | 'medium' | 'low';
  lastOrderDays: number;
  recommendedAction: string;
  totalSpent: number;
  orderCount?: number;
  riskReason?: string;
}

export interface ChurnRiskSummary {
  alertType?: string;
  totalAtRisk: number;
  generatedAt?: string;
  high: number;
  medium: number;
  low: number;
}

export type AnalyticsSection = 'overview' | 'rankings' | 'segments' | 'churnRisk';
export type AnalyticsLoadingState = Record<AnalyticsSection, boolean>;
export type AnalyticsErrorState = Record<AnalyticsSection, string | null>;

export type { CustomerSegments };

const initialLoadingState: AnalyticsLoadingState = {
  overview: false,
  rankings: false,
  segments: false,
  churnRisk: false,
};

const initialErrorState: AnalyticsErrorState = {
  overview: null,
  rankings: null,
  segments: null,
  churnRisk: null,
};

const toNumber = (value: number | null | undefined) => Number(value ?? 0);

const getCustomerName = (customer: ApiCustomerRanking | ChurnRiskCustomer) => {
  const firstName = customer.userInfo?.firstName?.trim();
  const lastName = customer.userInfo?.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return customer.name?.trim() || fullName || customer.userInfo?.phone || customer.phone || customer.contact || '';
};

const getCustomerContact = (customer: ApiCustomerRanking | ChurnRiskCustomer) =>
  customer.contact || customer.phone || customer.userInfo?.phone || customer.email || '';

const getTierFromSpending = (spent: number): string => {
  if (spent >= 5000) return 'vip';
  if (spent >= 2000) return 'premium';
  if (spent >= 500) return 'regular';
  return 'new';
};

const normalizeOverview = (analytics: OverallUserAnalytics): OverallAnalytics => {
  const totalUsers = toNumber(analytics.totalUsers);
  const totalRevenue = toNumber(analytics.totalRevenue);
  const customerLifetimeValue =
    analytics.customerLifetimeValue ?? (totalUsers > 0 ? totalRevenue / totalUsers : 0);

  return {
    totalUsers,
    activeUsers: toNumber(analytics.activeUsers),
    newUsersThisMonth: toNumber(analytics.newUsersThisMonth),
    averageOrderValue: toNumber(analytics.averageOrderValue),
    customerLifetimeValue,
    topSpenders: analytics.topSpenders ?? [],
    userGrowth: analytics.userGrowth ?? [],
    totalRevenue: analytics.totalRevenue,
    averageOrdersPerUser: analytics.averageOrdersPerUser,
    generatedAt: analytics.generatedAt,
  };
};

const normalizeRanking = (customer: ApiCustomerRanking, index: number): CustomerRanking => {
  const totalSpent = toNumber(customer.totalSpent);
  const orderCount = toNumber(customer.orderCount ?? customer.totalOrders);

  return {
    ...customer,
    userId: customer.userId || customer._id || `customer-${index + 1}`,
    name: getCustomerName(customer),
    contact: getCustomerContact(customer),
    totalSpent,
    orderCount,
    averageOrderValue:
      customer.averageOrderValue ?? (orderCount > 0 ? totalSpent / orderCount : 0),
    rank: customer.rank ?? index + 1,
    tier: customer.tier || getTierFromSpending(totalSpent),
  };
};

const normalizeChurnCustomer = (customer: ChurnRiskCustomer, index: number): ChurnRiskAlert => ({
  userId: customer.userId || customer._id || `risk-customer-${index + 1}`,
  name: getCustomerName(customer),
  contact: getCustomerContact(customer),
  email: customer.email,
  churnRisk: customer.churnRisk || 'low',
  lastOrderDays: toNumber(customer.lastOrderDays),
  recommendedAction: customer.recommendedAction || '',
  totalSpent: toNumber(customer.totalSpent),
  orderCount: customer.orderCount,
  riskReason: customer.riskReason || customer.reason,
});

const summarizeChurnRisk = (
  response: ChurnRiskResponse | null,
  alerts: ChurnRiskAlert[]
): ChurnRiskSummary => {
  const counts = alerts.reduce(
    (acc, alert) => ({
      ...acc,
      [alert.churnRisk]: acc[alert.churnRisk] + 1,
    }),
    { high: 0, medium: 0, low: 0 } as Pick<ChurnRiskSummary, 'high' | 'medium' | 'low'>
  );

  return {
    alertType: response?.alertType,
    generatedAt: response?.generatedAt,
    totalAtRisk: response?.totalAtRisk ?? alerts.length,
    ...counts,
  };
};

export const useUserAnalytics = () => {
  const { t } = useTranslation(['users', 'common']);
  const [loadingStates, setLoadingStates] = useState<AnalyticsLoadingState>(initialLoadingState);
  const [errors, setErrors] = useState<AnalyticsErrorState>(initialErrorState);
  const [overallAnalytics, setOverallAnalytics] = useState<OverallAnalytics | null>(null);
  const [customerRankings, setCustomerRankings] = useState<CustomerRanking[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegments | null>(null);
  const [churnRiskAlerts, setChurnRiskAlerts] = useState<ChurnRiskAlert[]>([]);
  const [churnRiskResponse, setChurnRiskResponse] = useState<ChurnRiskResponse | null>(null);
  const [churnRiskSummary, setChurnRiskSummary] = useState<ChurnRiskSummary>({
    totalAtRisk: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  const loading = useMemo(
    () => Object.values(loadingStates).some(Boolean),
    [loadingStates]
  );

  const setSectionLoading = (section: AnalyticsSection, value: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [section]: value }));
  };

  const setSectionError = (section: AnalyticsSection, value: string | null) => {
    setErrors((prev) => ({ ...prev, [section]: value }));
  };

  const fetchOverallAnalytics = useCallback(async () => {
    const errorMessage = t('users:analytics.errors.loadOverview', 'فشل تحميل الإحصائيات العامة');

    try {
      setSectionLoading('overview', true);
      setSectionError('overview', null);
      const analytics = await userAnalyticsApi.getOverallAnalytics();
      setOverallAnalytics(normalizeOverview(analytics));
    } catch {
      setSectionError('overview', errorMessage);
      toast.error(errorMessage);
    } finally {
      setSectionLoading('overview', false);
    }
  }, [t]);

  const fetchCustomerRankings = useCallback(
    async (limit: number = 50) => {
      const errorMessage = t('users:analytics.errors.loadRankings', 'فشل تحميل ترتيب العملاء');

      try {
        setSectionLoading('rankings', true);
        setSectionError('rankings', null);
        const rankings = await userAnalyticsApi.getCustomerRankings(limit);
        setCustomerRankings((rankings ?? []).map(normalizeRanking));
      } catch {
        setSectionError('rankings', errorMessage);
        toast.error(errorMessage);
      } finally {
        setSectionLoading('rankings', false);
      }
    },
    [t]
  );

  const fetchCustomerSegments = useCallback(async () => {
    const errorMessage = t('users:analytics.errors.loadSegments', 'فشل تحميل شرائح العملاء');

    try {
      setSectionLoading('segments', true);
      setSectionError('segments', null);
      const segments = await userAnalyticsApi.getCustomerSegments();
      setCustomerSegments(segments);
    } catch {
      setSectionError('segments', errorMessage);
      toast.error(errorMessage);
    } finally {
      setSectionLoading('segments', false);
    }
  }, [t]);

  const fetchChurnRiskAlerts = useCallback(async () => {
    const errorMessage = t('users:analytics.errors.loadAlerts', 'فشل تحميل تنبيهات المخاطر');

    try {
      setSectionLoading('churnRisk', true);
      setSectionError('churnRisk', null);
      const response = await userAnalyticsApi.getChurnRiskAlerts();
      const alerts = (response.customers ?? []).map(normalizeChurnCustomer);

      setChurnRiskResponse(response);
      setChurnRiskAlerts(alerts);
      setChurnRiskSummary(summarizeChurnRisk(response, alerts));
    } catch {
      setSectionError('churnRisk', errorMessage);
      toast.error(errorMessage);
    } finally {
      setSectionLoading('churnRisk', false);
    }
  }, [t]);

  return {
    loading,
    loadingStates,
    errors,
    overallAnalytics,
    customerRankings,
    customerSegments,
    churnRiskAlerts,
    churnRiskResponse,
    churnRiskSummary,
    fetchOverallAnalytics,
    fetchCustomerRankings,
    fetchCustomerSegments,
    fetchChurnRiskAlerts,
  };
};
