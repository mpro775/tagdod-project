import { useState, useEffect } from 'react';
import { apiClient } from '@/core/api/client';

interface UnreadCount {
  count: number;
}

export const useUnreadNotifications = (autoRefresh: boolean = true) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ success: boolean; data: UnreadCount }>(
        '/notifications/unread-count'
      );
      setUnreadCount(response.data.data?.count || 0);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
      setError(err as Error);
      // Don't show error to user, just set count to 0
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
};

