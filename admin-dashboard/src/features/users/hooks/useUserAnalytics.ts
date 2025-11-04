import { useCallback, useState } from 'react';
import { apiClient } from '@/core/api/client';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export interface OverallAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  topSpenders: Array<{ userId: string; totalSpent: number }>;
  userGrowth: Array<{ month: string; newUsers: number }>;
}

export interface CustomerRanking {
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
  rank: number;
  tier: string;
}

export interface CustomerSegments {
  segments: {
    vip: number;
    premium: number;
    regular: number;
    new: number;
  };
  totalCustomers: number;
  generatedAt: string;
  recommendations: string[];
}

export interface ChurnRiskAlert {
  userId: string;
  name: string;
  email: string;
  churnRisk: 'high' | 'medium' | 'low';
  lastOrderDays: number;
  recommendedAction: string;
  totalSpent: number;
}

export const useUserAnalytics = () => {
  const { t } = useTranslation(['users', 'common']);
  const [loading, setLoading] = useState(false);
  const [overallAnalytics, setOverallAnalytics] = useState<OverallAnalytics | null>(null);
  const [customerRankings, setCustomerRankings] = useState<CustomerRanking[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegments | null>(null);
  const [churnRiskAlerts, setChurnRiskAlerts] = useState<ChurnRiskAlert[]>([]);

  const fetchOverallAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/overview');
      setOverallAnalytics(response.data.data);
    } catch {
      toast.error(t('users:analytics.errors.loadOverview', 'فشل تحميل الإحصائيات العامة'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchCustomerRankings = useCallback(
    async (limit: number = 50) => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/user-analytics/rankings', {
          params: { limit },
        });
        setCustomerRankings(response.data.data || []);
      } catch {
        toast.error(t('users:analytics.errors.loadRankings', 'فشل تحميل ترتيب العملاء'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const fetchCustomerSegments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/reports/customer-segments');
      setCustomerSegments(response.data.data || response.data);
    } catch {
      toast.error(t('users:analytics.errors.loadSegments', 'فشل تحميل شرائح العملاء'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchChurnRiskAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/alerts/churn-risk');
      const data = response.data.data || response.data;
      setChurnRiskAlerts(data.customers || []);
    } catch {
      toast.error(t('users:analytics.errors.loadAlerts', 'فشل تحميل تنبيهات المخاطر'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    loading,
    overallAnalytics,
    customerRankings,
    customerSegments,
    churnRiskAlerts,
    fetchOverallAnalytics,
    fetchCustomerRankings,
    fetchCustomerSegments,
    fetchChurnRiskAlerts,
  };
};

