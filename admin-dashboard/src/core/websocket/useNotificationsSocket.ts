import { useEffect, useCallback, useState, useRef } from 'react';
import { notificationsSocket, NotificationPayload } from './notificationsSocket';

export type { NotificationPayload };

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

  // استخدام useRef لتثبيت callbacks وتجنب إعادة تشغيل effect
  const onNotificationRef = useRef(onNotification);
  const onUnreadCountUpdateRef = useRef(onUnreadCountUpdate);

  useEffect(() => {
    onNotificationRef.current = onNotification;
    onUnreadCountUpdateRef.current = onUnreadCountUpdate;
  }, [onNotification, onUnreadCountUpdate]);

  useEffect(() => {
    const socket = notificationsSocket.connect();
    
    if (socket) {
      setIsConnected(socket.connected);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      const handleNotification = (data: unknown) => {
        const notification = data as NotificationPayload;
        setLatestNotification(notification);
        if (onNotificationRef.current) {
          onNotificationRef.current(notification);
        }
        setUnreadCount((prev) => prev + 1);
      };

      const handleUnreadCount = (data: unknown) => {
        const countData = data as { count: number };
        setUnreadCount(countData.count);
        if (onUnreadCountUpdateRef.current) {
          onUnreadCountUpdateRef.current(countData.count);
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

    // لا تقم بقطع الاتصال في cleanup - دع socket يبقى متصل
    // return () => {
    //   notificationsSocket.disconnect();
    // };
  }, []); // dependency array فارغ - يعمل مرة واحدة فقط

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

