import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Divider,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Notifications as NotificationsIcon, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useNotificationsSocket,
  NotificationPayload,
} from '@/core/websocket/useNotificationsSocket';
import {
  useUserNotifications,
  useMarkAsRead,
} from '@/features/notifications/hooks/useNotifications';
import { useUnreadNotifications } from '@/features/notifications/hooks/useUnreadNotifications';
import { NotificationType } from '@/features/notifications/types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const open = Boolean(anchorEl);

  const { data: notificationsData, isLoading } = useUserNotifications({ limit: 10, offset: 0 });
  const { unreadCount: apiUnreadCount } = useUnreadNotifications(true);
  const { mutate: markAsRead } = useMarkAsRead();

  const { latestNotification, unreadCount: socketUnreadCount } = useNotificationsSocket(
    (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    }
  );

  useEffect(() => {
    console.log('NotificationBell - notificationsData:', notificationsData);
    console.log('NotificationBell - isLoading:', isLoading);

    if (notificationsData?.data) {
      console.log('NotificationBell - notificationsData.data:', notificationsData.data);
      console.log(
        'NotificationBell - notificationsData.data length:',
        notificationsData.data.length
      );

      const formattedNotifications = notificationsData.data.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        messageEn: n.messageEn,
        type: n.type,
        category: n.category,
        priority: n.priority,
        data: n.data || {},
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        isRead: n.status === 'read' || n.readAt !== undefined,
      }));

      console.log('NotificationBell - formattedNotifications:', formattedNotifications);
      setNotifications(formattedNotifications);
    } else {
      console.log('NotificationBell - No notifications data or data is empty');
    }
  }, [notificationsData, isLoading]);

  // Play notification sound
  const playNotificationSound = (isOrderNotification: boolean = false) => {
    try {
      // Check if browser supports Web Audio API
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }

      // Create audio context (may need user interaction first)
      const audioContext = new AudioContext();

      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different notification types
      oscillator.frequency.value = isOrderNotification ? 1000 : 800; // Higher pitch for orders
      oscillator.type = 'sine';

      // Create a pleasant notification sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
      // Fallback: try using HTML5 audio if available
      try {
        const audio = new Audio(
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8PSqTj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmVEPD0qk4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC'
        );
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore autoplay restrictions
        });
      } catch (fallbackError) {
        // Ignore if fallback also fails
      }
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationRoute = (notification: NotificationPayload): string | null => {
    const { type, data } = notification;

    // Helper function to extract ID from string or object
    const extractId = (value: any): string | null => {
      if (!value) return null;

      let extractedId: string | null = null;

      if (typeof value === 'string') {
        // If it's already a string, return it (but clean it if it looks like an object string)
        if (value.startsWith('{') || value.includes('ObjectId')) {
          // Try to extract ID from object-like string
          const idMatch = value.match(/["']?_id["']?\s*:\s*["']?([^"',\s}]+)["']?/);
          if (idMatch && idMatch[1]) {
            extractedId = idMatch[1];
          } else {
            const idMatch2 = value.match(/id\s*:\s*["']?([^"',\s}]+)["']?/);
            if (idMatch2 && idMatch2[1]) {
              extractedId = idMatch2[1];
            }
          }
        } else {
          extractedId = value;
        }
      } else if (typeof value === 'object') {
        // Try common ID fields
        if (value._id) {
          extractedId = typeof value._id === 'string' ? value._id : value._id.toString();
        } else if (value.id) {
          extractedId = typeof value.id === 'string' ? value.id : value.id.toString();
        } else {
          // Try toString() as last resort
          try {
            const str = value.toString();
            if (str && str !== '[object Object]' && !str.includes('ObjectId')) {
              extractedId = str;
            }
          } catch (e) {
            // Ignore
          }
        }
      } else {
        extractedId = String(value);
      }

      // Validate that extracted ID is a valid MongoDB ObjectId format (24 hex characters)
      // or at least not empty and not common invalid values
      if (
        extractedId &&
        extractedId.trim() !== '' &&
        extractedId !== 'new' &&
        extractedId !== 'null' &&
        extractedId !== 'undefined' &&
        extractedId.length >= 12
      ) {
        // Minimum reasonable ID length
        return extractedId.trim();
      }

      return null;
    };

    switch (type) {
      case NotificationType.ORDER_CREATED:
      case NotificationType.ORDER_RATED:
      case NotificationType.COUPON_USED:
      case NotificationType.INVOICE_CREATED:
        const orderId = extractId(data?.orderId);
        if (orderId) {
          return `/orders/${orderId}`;
        }
        break;

      case NotificationType.SERVICE_REQUEST_OPENED:
      case NotificationType.NEW_ENGINEER_OFFER:
        const requestId = extractId(data?.requestId);
        if (requestId) {
          return `/services/${requestId}`;
        }
        break;

      case NotificationType.TICKET_CREATED:
      case NotificationType.SUPPORT_MESSAGE_RECEIVED:
        const ticketId = extractId(data?.ticketId);
        if (ticketId) {
          return `/support/${ticketId}`;
        }
        break;

      case NotificationType.LOW_STOCK:
      case NotificationType.OUT_OF_STOCK:
        const productId = extractId(data?.productId);
        if (productId) {
          return `/products/${productId}`;
        }
        // Also check variantId as fallback
        const variantId = extractId(data?.variantId);
        if (variantId) {
          return `/products/inventory?variant=${variantId}`;
        }
        return '/products/inventory';

      case NotificationType.NEW_USER_REGISTERED:
        const userId = extractId(data?.userId);
        if (userId) {
          return `/users/${userId}`;
        }
        return '/users';

      default:
        return null;
    }

    return null;
  };

  useEffect(() => {
    if (latestNotification) {
      // Show toast notification
      const isOrderNotification = latestNotification.type === NotificationType.ORDER_CREATED;
      const icon = isOrderNotification ? '🛒' : '🔔';

      // Play sound for new notification (only if page is visible)
      if (document.visibilityState === 'visible') {
        playNotificationSound(isOrderNotification);
      }

      const route = getNotificationRoute(latestNotification);
      const hasValidRoute =
        route &&
        !route.includes('/products/new') &&
        !route.includes('/products/null') &&
        !route.includes('/products/undefined');

      toast.success(
        (t) => (
          <Box
            onClick={() => {
              if (hasValidRoute) {
                navigate(route);
                handleClose();
              } else {
                navigate('/my-notifications');
                handleClose();
              }
              toast.dismiss(t.id);
            }}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box sx={{ fontSize: '1.2rem' }}>{icon}</Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {latestNotification.title}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {latestNotification.message}
              </Typography>
            </Box>
          </Box>
        ),
        {
          duration: isOrderNotification ? 6000 : 5000, // Longer duration for order notifications
          position: 'top-right',
          style: {
            minWidth: '300px',
            maxWidth: '400px',
            background: isOrderNotification
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : undefined,
            color: isOrderNotification ? 'white' : undefined,
          },
          icon: icon,
        }
      );

      setNotifications((prev) => {
        const exists = prev.find((n) => n.id === latestNotification.id);
        if (exists) return prev;
        return [latestNotification, ...prev].slice(0, 10);
      });
    }
  }, [latestNotification, navigate]);

  const handleNotificationClick = (notification: NotificationPayload) => {
    if (!notification.isRead) {
      markAsRead({ notificationIds: [notification.id] });
    }

    const route = getNotificationRoute(notification);
    console.log('NotificationBell click - notification:', notification);
    console.log('NotificationBell click - route:', route);
    console.log('NotificationBell click - data:', notification.data);
    console.log('NotificationBell click - productId:', notification.data?.productId);

    if (
      route &&
      !route.includes('/products/new') &&
      !route.includes('/products/null') &&
      !route.includes('/products/undefined')
    ) {
      navigate(route);
      handleClose();
    } else {
      console.warn('Invalid route generated, redirecting to inventory:', route);
      navigate('/products/inventory');
      handleClose();
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length > 0) {
      markAsRead({ notificationIds: unreadIds });
    }
  };

  const handleViewAll = () => {
    navigate('/my-notifications');
    handleClose();
  };

  const totalUnreadCount =
    socketUnreadCount !== undefined ? socketUnreadCount : apiUnreadCount || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.ORDER_CREATED:
      case NotificationType.ORDER_RATED:
      case NotificationType.COUPON_USED:
      case NotificationType.INVOICE_CREATED:
        return '🛒';
      case NotificationType.SERVICE_REQUEST_OPENED:
      case NotificationType.NEW_ENGINEER_OFFER:
        return '🔧';
      case NotificationType.TICKET_CREATED:
      case NotificationType.SUPPORT_MESSAGE_RECEIVED:
        return '💬';
      case NotificationType.LOW_STOCK:
      case NotificationType.OUT_OF_STOCK:
        return '📦';
      case NotificationType.NEW_USER_REGISTERED:
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case NotificationType.ORDER_CREATED:
      case NotificationType.INVOICE_CREATED:
        return 'success';
      case NotificationType.TICKET_CREATED:
      case NotificationType.SUPPORT_MESSAGE_RECEIVED:
        return 'error';
      case NotificationType.ORDER_RATED:
        return 'info';
      case NotificationType.LOW_STOCK:
      case NotificationType.OUT_OF_STOCK:
        return 'warning';
      case NotificationType.NEW_USER_REGISTERED:
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} className={className} title="الإشعارات">
        <Badge badgeContent={totalUnreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">الإشعارات</Typography>
          <Box>
            {totalUnreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead} sx={{ mr: 1 }}>
                تحديد الكل كمقروء
              </Button>
            )}
            <IconButton size="small" onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              لا توجد إشعارات
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  disablePadding
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  }}
                >
                  <ListItemButton onClick={() => handleNotificationClick(notification)}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                      <Box sx={{ mr: 2, fontSize: '1.5rem' }}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            color={getNotificationColor(notification.type) as any}
                            sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Divider />

        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" onClick={handleViewAll} fullWidth>
            عرض جميع الإشعارات
          </Button>
        </Box>
      </Popover>
    </>
  );
};
