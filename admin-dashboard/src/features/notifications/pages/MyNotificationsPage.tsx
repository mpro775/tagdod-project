import React, { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Circle,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useUserNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { NotificationType } from '../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useNotificationsSocket } from '@/core/websocket/useNotificationsSocket';
import { useEffect } from 'react';

export const MyNotificationsPage: React.FC = () => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useUserNotifications({
    limit,
    offset,
  });
  const { unreadCount, refetch: refetchUnreadCount } = useUnreadNotifications(true);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = notificationsData?.data || [];
  const total = notificationsData?.meta?.total || 0;

  // Listen for new notifications via WebSocket
  const { latestNotification } = useNotificationsSocket(() => {
    // Refresh notifications when a new one arrives
    refetch();
    refetchUnreadCount();
  });

  // Refresh when new notification arrives
  useEffect(() => {
    if (latestNotification) {
      refetch();
      refetchUnreadCount();
    }
  }, [latestNotification, refetch, refetchUnreadCount]);

  const getNotificationRoute = (notification: any): string | null => {
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

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(
        { notificationIds: [notification.id] },
        {
          onSuccess: () => {
            refetchUnreadCount();
          },
        }
      );
    }

    const route = getNotificationRoute(notification);
    console.log('Notification click - notification:', notification);
    console.log('Notification click - route:', route);
    console.log('Notification click - data:', notification.data);
    console.log('Notification click - productId:', notification.data?.productId);
    console.log('Notification click - productId type:', typeof notification.data?.productId);
    console.log(
      'Notification click - productId value:',
      JSON.stringify(notification.data?.productId)
    );

    if (
      route &&
      !route.includes('/products/new') &&
      !route.includes('/products/null') &&
      !route.includes('/products/undefined')
    ) {
      navigate(route);
    } else {
      console.warn('Invalid route generated, redirecting to inventory:', route);
      navigate('/products/inventory');
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        toast.success(t('notifications.markedAllAsRead'));
        refetch();
        refetchUnreadCount();
      },
    });
  };

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
      default:
        return 'default';
    }
  };

  if (isLoading && offset === 0) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('notifications.myNotifications', 'إشعاراتي')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total > 0
              ? t('notifications.totalNotifications', { count: total, defaultValue: `إجمالي ${total} إشعار` })
              : t('notifications.noNotifications', 'لا توجد إشعارات')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircle />}
            >
              {t('notifications.markAllAsRead', 'تحديد الكل كمقروء')}
            </Button>
          )}
          <IconButton onClick={() => refetch()} size="small">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {unreadCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(
            'notifications.unreadCount',
            { count: unreadCount, defaultValue: `لديك ${unreadCount} إشعار غير مقروء` }
          )}
        </Alert>
      )}

      {notifications.length === 0 && !isLoading ? (
        <Alert severity="info">{t('notifications.noNotifications', 'لا توجد إشعارات')}</Alert>
      ) : (
        <List>
          {notifications.map((notification: any, index: number) => (
            <React.Fragment key={notification.id}>
              <ListItem
                disablePadding
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: notification.isRead ? 400 : 600 }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Chip
                            label={t('notifications.unread', 'غير مقروء')}
                            size="small"
                            color="primary"
                          />
                        )}
                        <Chip
                          label={notification.type}
                          size="small"
                          color={getNotificationColor(notification.type) as any}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.isRead && (
                    <Box sx={{ ml: 1 }}>
                      <Circle sx={{ fontSize: 12, color: 'primary.main' }} />
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {total > offset + limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={() => setOffset(offset + limit)} disabled={isLoading}>
            {t('notifications.loadMore', 'تحميل المزيد')}
          </Button>
        </Box>
      )}
    </Box>
  );
};
