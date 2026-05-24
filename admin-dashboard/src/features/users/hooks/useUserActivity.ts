import { useCallback, useState } from 'react';
import { apiClient } from '@/core/api/client';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export interface ActiveUser {
  userId: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  lastActivityAt: string;
  minutesSinceActivity: number;
  roles: string[];
}

export interface InactiveUser {
  userId: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  lastActivityAt: string;
  daysSinceActivity: number;
  createdAt: string;
  roles: string[];
}

export interface NeverLoggedInUser {
  userId: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  daysSinceRegistration: number;
  roles: string[];
}

export interface UserActivityStats {
  totalUsers: number;
  activeNow: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  inactiveUsers: number;
  neverLoggedIn: number;
  activityRate: number;
  distribution: {
    active: number;
    recentlyActive: number;
    inactive: number;
    neverLoggedIn: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useUserActivity = () => {
  const { t } = useTranslation(['users', 'common']);
  const [loadingStates, setLoadingStates] = useState({
    stats: false,
    online: false,
    recent: false,
    inactive: false,
    neverLoggedIn: false,
  });
  const [activityStats, setActivityStats] = useState<UserActivityStats | null>(null);
  const [activeUsers, setActiveUsers] = useState<PaginatedResponse<ActiveUser> | null>(null);
  const [inactiveUsers, setInactiveUsers] = useState<PaginatedResponse<InactiveUser> | null>(null);
  const [neverLoggedInUsers, setNeverLoggedInUsers] = useState<PaginatedResponse<NeverLoggedInUser> | null>(null);

  const loading = Object.values(loadingStates).some(Boolean);

  const fetchActivityStats = useCallback(async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, stats: true }));
      const response = await apiClient.get('/admin/user-analytics/activity/stats');
      const stats = response.data?.data || response.data;
      setActivityStats(stats);
    } catch {
      toast.error(t('users:activity.errors.loadStats', 'فشل تحميل إحصائيات النشاط'));
    } finally {
      setLoadingStates((prev) => ({ ...prev, stats: false }));
    }
  }, [t]);

  const fetchActiveUsersNow = useCallback(
    async (minutes: number = 15, page: number = 1, limit: number = 50) => {
      try {
        setLoadingStates((prev) => ({ ...prev, online: true }));
        const response = await apiClient.get('/admin/user-analytics/activity/online-now', {
          params: { minutes, page, limit },
        });
        const result = response.data?.data || response.data;
        setActiveUsers(result);
      } catch {
        toast.error(t('users:activity.errors.loadActive', 'فشل تحميل المستخدمين النشطين'));
      } finally {
        setLoadingStates((prev) => ({ ...prev, online: false }));
      }
    },
    [t]
  );

  const fetchRecentlyActiveUsers = useCallback(
    async (days: number = 7, page: number = 1, limit: number = 50) => {
      try {
        setLoadingStates((prev) => ({ ...prev, recent: true }));
        const response = await apiClient.get('/admin/user-analytics/activity/recent', {
          params: { days, page, limit },
        });
        const result = response.data?.data || response.data;
        setActiveUsers(result);
      } catch {
        toast.error(t('users:activity.errors.loadRecent', 'فشل تحميل المستخدمين النشطين مؤخراً'));
      } finally {
        setLoadingStates((prev) => ({ ...prev, recent: false }));
      }
    },
    [t]
  );

  const fetchInactiveUsers = useCallback(
    async (days: number = 30, page: number = 1, limit: number = 50) => {
      try {
        setLoadingStates((prev) => ({ ...prev, inactive: true }));
        const response = await apiClient.get('/admin/user-analytics/activity/inactive', {
          params: { days, page, limit },
        });
        const result = response.data?.data || response.data;
        setInactiveUsers(result);
      } catch {
        toast.error(t('users:activity.errors.loadInactive', 'فشل تحميل المستخدمين غير النشطين'));
      } finally {
        setLoadingStates((prev) => ({ ...prev, inactive: false }));
      }
    },
    [t]
  );

  const fetchNeverLoggedInUsers = useCallback(
    async (page: number = 1, limit: number = 50) => {
      try {
        setLoadingStates((prev) => ({ ...prev, neverLoggedIn: true }));
        const response = await apiClient.get('/admin/user-analytics/activity/never-logged-in', {
          params: { page, limit },
        });
        const result = response.data?.data || response.data;
        setNeverLoggedInUsers(result);
      } catch {
        toast.error(t('users:activity.errors.loadNeverLoggedIn', 'فشل تحميل المستخدمين الذين لم يدخلوا أبداً'));
      } finally {
        setLoadingStates((prev) => ({ ...prev, neverLoggedIn: false }));
      }
    },
    [t]
  );

  return {
    loading,
    loadingStates,
    activityStats,
    activeUsers,
    inactiveUsers,
    neverLoggedInUsers,
    fetchActivityStats,
    fetchActiveUsersNow,
    fetchRecentlyActiveUsers,
    fetchInactiveUsers,
    fetchNeverLoggedInUsers,
  };
};