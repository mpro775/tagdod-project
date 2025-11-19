import { useState, useEffect } from 'react';
import { apiClient } from '@/core/api/client';
import { useNotificationsSocket } from '@/core/websocket/useNotificationsSocket';

interface UnreadCount {
  count: number;
}

export const useUnreadNotifications = (autoRefresh: boolean = true) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { unreadCount: socketUnreadCount } = useNotificationsSocket(
    undefined,
    (count) => {
      setUnreadCount(count);
    }
  );

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

    // Auto-refresh every 60 seconds if enabled (reduced frequency for server stability)
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // 60 seconds (reduced from 30s to reduce load)

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Use socket count if available, otherwise use API count
  const finalUnreadCount = socketUnreadCount !== undefined ? socketUnreadCount : unreadCount;

  return {
    unreadCount: finalUnreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
};

