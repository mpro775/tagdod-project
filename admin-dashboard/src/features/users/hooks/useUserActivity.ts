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
  const [loading, setLoading] = useState(false);
  const [activityStats, setActivityStats] = useState<UserActivityStats | null>(null);
  const [activeUsers, setActiveUsers] = useState<PaginatedResponse<ActiveUser> | null>(null);
  const [inactiveUsers, setInactiveUsers] = useState<PaginatedResponse<InactiveUser> | null>(null);
  const [neverLoggedInUsers, setNeverLoggedInUsers] = useState<PaginatedResponse<NeverLoggedInUser> | null>(null);

  const fetchActivityStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/user-analytics/activity/stats');
      setActivityStats(response.data);
    } catch {
      toast.error(t('users:activity.errors.loadStats', 'فشل تحميل إحصائيات النشاط'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchActiveUsersNow = useCallback(
    async (minutes: number = 15, page: number = 1, limit: number = 50) => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/user-analytics/activity/online-now', {
          params: { minutes, page, limit },
        });
        setActiveUsers(response.data);
      } catch {
        toast.error(t('users:activity.errors.loadActive', 'فشل تحميل المستخدمين النشطين'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const fetchRecentlyActiveUsers = useCallback(
    async (days: number = 7, page: number = 1, limit: number = 50) => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/user-analytics/activity/recent', {
          params: { days, page, limit },
        });
        setActiveUsers(response.data);
      } catch {
        toast.error(t('users:activity.errors.loadRecent', 'فشل تحميل المستخدمين النشطين مؤخراً'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const fetchInactiveUsers = useCallback(
    async (days: number = 30, page: number = 1, limit: number = 50) => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/user-analytics/activity/inactive', {
          params: { days, page, limit },
        });
        setInactiveUsers(response.data);
      } catch {
        toast.error(t('users:activity.errors.loadInactive', 'فشل تحميل المستخدمين غير النشطين'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const fetchNeverLoggedInUsers = useCallback(
    async (page: number = 1, limit: number = 50) => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/user-analytics/activity/never-logged-in', {
          params: { page, limit },
        });
        setNeverLoggedInUsers(response.data);
      } catch {
        toast.error(t('users:activity.errors.loadNeverLoggedIn', 'فشل تحميل المستخدمين الذين لم يدخلوا أبداً'));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  return {
    loading,
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
