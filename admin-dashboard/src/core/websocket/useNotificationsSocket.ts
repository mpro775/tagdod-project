import { useEffect, useCallback, useState } from 'react';
import { notificationsSocket, NotificationPayload } from './notificationsSocket';

export interface UseNotificationsSocketReturn {
  isConnected: boolean;
  unreadCount: number;
  latestNotification: NotificationPayload | null;
  reconnect: () => void;
}

export const useNotificationsSocket = (
  onNotification?: (notification: NotificationPayload) => void,
  onUnreadCountUpdate?: (count: number) => void
): UseNotificationsSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<NotificationPayload | null>(null);

  useEffect(() => {
    const socket = notificationsSocket.connect();
    
    if (socket) {
      setIsConnected(socket.connected);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      const handleNotification = (notification: NotificationPayload) => {
        setLatestNotification(notification);
        if (onNotification) {
          onNotification(notification);
        }
        setUnreadCount((prev) => prev + 1);
      };

      const handleUnreadCount = (data: { count: number }) => {
        setUnreadCount(data.count);
        if (onUnreadCountUpdate) {
          onUnreadCountUpdate(data.count);
        }
      };

      notificationsSocket.on('notification:new', handleNotification);
      notificationsSocket.on('unread-count', handleUnreadCount);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        notificationsSocket.off('notification:new', handleNotification);
        notificationsSocket.off('unread-count', handleUnreadCount);
      };
    }

    return () => {
      notificationsSocket.disconnect();
    };
  }, [onNotification, onUnreadCountUpdate]);

  const reconnect = useCallback(() => {
    notificationsSocket.reconnect();
  }, []);

  return {
    isConnected,
    unreadCount,
    latestNotification,
    reconnect,
  };
};

