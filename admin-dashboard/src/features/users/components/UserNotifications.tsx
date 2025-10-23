import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  SlideProps,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UserNotificationsProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const UserNotifications: React.FC<UserNotificationsProps> = ({
  notifications,
  onClose,
  position = 'top-right',
}) => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      setCurrentNotification(notifications[0]);
    } else {
      setCurrentNotification(null);
    }
  }, [notifications]);

  const handleClose = () => {
    if (currentNotification) {
      onClose(currentNotification.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'top-right':
        return { vertical: 'top' as const, horizontal: 'right' as const };
      case 'top-left':
        return { vertical: 'top' as const, horizontal: 'left' as const };
      case 'bottom-right':
        return { vertical: 'bottom' as const, horizontal: 'right' as const };
      case 'bottom-left':
        return { vertical: 'bottom' as const, horizontal: 'left' as const };
      case 'top-center':
        return { vertical: 'top' as const, horizontal: 'center' as const };
      case 'bottom-center':
        return { vertical: 'bottom' as const, horizontal: 'center' as const };
      default:
        return { vertical: 'top' as const, horizontal: 'right' as const };
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={currentNotification.duration || 6000}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={getPosition()}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification.type}
        variant="filled"
        icon={getIcon(currentNotification.type)}
        sx={{ minWidth: '300px' }}
      >
        <AlertTitle>{currentNotification.title}</AlertTitle>
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
};

// Hook for managing notifications
export const useUserNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Predefined notification types
  const notifySuccess = (title: string, message: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  };

  const notifyError = (title: string, message: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 8000, // Longer duration for errors
    });
  };

  const notifyWarning = (title: string, message: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  };

  const notifyInfo = (title: string, message: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
};

// Predefined notification messages
export const USER_NOTIFICATIONS = {
  SUCCESS: {
    USER_CREATED: (name: string) => ({
      title: 'تم إنشاء المستخدم بنجاح',
      message: `تم إنشاء المستخدم "${name}" بنجاح`,
    }),
    USER_UPDATED: (name: string) => ({
      title: 'تم تحديث المستخدم بنجاح',
      message: `تم تحديث بيانات المستخدم "${name}" بنجاح`,
    }),
    USER_DELETED: (name: string) => ({
      title: 'تم حذف المستخدم بنجاح',
      message: `تم حذف المستخدم "${name}" بنجاح`,
    }),
    USER_RESTORED: (name: string) => ({
      title: 'تم استعادة المستخدم بنجاح',
      message: `تم استعادة المستخدم "${name}" بنجاح`,
    }),
    USER_SUSPENDED: (name: string) => ({
      title: 'تم إيقاف المستخدم بنجاح',
      message: `تم إيقاف المستخدم "${name}" بنجاح`,
    }),
    USER_ACTIVATED: (name: string) => ({
      title: 'تم تفعيل المستخدم بنجاح',
      message: `تم تفعيل المستخدم "${name}" بنجاح`,
    }),
  },
  ERROR: {
    USER_CREATE_FAILED: 'فشل في إنشاء المستخدم',
    USER_UPDATE_FAILED: 'فشل في تحديث المستخدم',
    USER_DELETE_FAILED: 'فشل في حذف المستخدم',
    USER_RESTORE_FAILED: 'فشل في استعادة المستخدم',
    USER_SUSPEND_FAILED: 'فشل في إيقاف المستخدم',
    USER_ACTIVATE_FAILED: 'فشل في تفعيل المستخدم',
    USER_NOT_FOUND: 'المستخدم غير موجود',
    INVALID_DATA: 'البيانات المدخلة غير صحيحة',
    NETWORK_ERROR: 'خطأ في الاتصال بالخادم',
  },
  WARNING: {
    USER_ALREADY_EXISTS: 'المستخدم موجود بالفعل',
    INVALID_PHONE: 'رقم الهاتف غير صحيح',
    WEAK_PASSWORD: 'كلمة المرور ضعيفة',
    MISSING_REQUIRED_FIELDS: 'بعض الحقول المطلوبة مفقودة',
  },
  INFO: {
    VALIDATION_COMPLETE: 'تم التحقق من صحة البيانات',
    DATA_SAVED: 'تم حفظ البيانات',
    CHANGES_DETECTED: 'تم اكتشاف تغييرات غير محفوظة',
  },
};
