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
import { useNotificationsSocket, NotificationPayload } from '@/core/websocket/useNotificationsSocket';
import { useUserNotifications, useMarkAsRead } from '@/features/notifications/hooks/useNotifications';
import { useUnreadNotifications } from '@/features/notifications/hooks/useUnreadNotifications';
import { NotificationType } from '@/features/notifications/types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

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
    if (notificationsData?.data) {
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
      setNotifications(formattedNotifications);
    }
  }, [notificationsData]);

  useEffect(() => {
    if (latestNotification) {
      setNotifications((prev) => {
        const exists = prev.find((n) => n.id === latestNotification.id);
        if (exists) return prev;
        return [latestNotification, ...prev].slice(0, 10);
      });
    }
  }, [latestNotification]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationRoute = (notification: NotificationPayload): string | null => {
    const { type, data } = notification;

    switch (type) {
      case NotificationType.ORDER_CREATED:
      case NotificationType.ORDER_RATED:
      case NotificationType.COUPON_USED:
      case NotificationType.INVOICE_CREATED:
        if (data?.orderId) {
          return `/orders/${data.orderId}`;
        }
        break;

      case NotificationType.SERVICE_REQUEST_OPENED:
      case NotificationType.NEW_ENGINEER_OFFER:
        if (data?.requestId) {
          return `/services/${data.requestId}`;
        }
        break;

      case NotificationType.TICKET_CREATED:
      case NotificationType.SUPPORT_MESSAGE_RECEIVED:
        if (data?.ticketId) {
          return `/support/${data.ticketId}`;
        }
        break;

      case NotificationType.LOW_STOCK:
      case NotificationType.OUT_OF_STOCK:
        if (data?.productId) {
          return `/products/${data.productId}`;
        }
        return '/products/inventory';

      case NotificationType.NEW_USER_REGISTERED:
        if (data?.userId) {
          return `/users/${data.userId}`;
        }
        return '/users';

      default:
        return null;
    }

    return null;
  };

  const handleNotificationClick = (notification: NotificationPayload) => {
    if (!notification.isRead) {
      markAsRead({ notificationIds: [notification.id] });
    }

    const route = getNotificationRoute(notification);
    if (route) {
      navigate(route);
      handleClose();
    } else {
      navigate('/notifications');
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
    navigate('/notifications');
    handleClose();
  };

  const totalUnreadCount = socketUnreadCount !== undefined ? socketUnreadCount : (apiUnreadCount || 0);

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
      <IconButton
        color="inherit"
        onClick={handleClick}
        className={className}
        title="الإشعارات"
      >
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
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

