import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { 
  ListNotificationsParams, 
  CreateNotificationDto, 
  UpdateNotificationDto,
  SendNotificationDto,
  BulkSendNotificationDto,
  NotificationStatsParams,
  CreateTemplateDto,
  UpdateTemplateDto,
  MarkAsReadDto,
  NotificationChannelConfig,
  CreateChannelConfigDto,
  UpdateChannelConfigDto,
  NotificationType,
} from '../types/notification.types';

const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_TEMPLATES_KEY = 'notification-templates';
const NOTIFICATION_STATS_KEY = 'notification-stats';
const NOTIFICATION_LOGS_KEY = 'notification-logs';
const USER_NOTIFICATIONS_KEY = 'user-notifications';
const NOTIFICATION_PREFERENCES_KEY = 'notification-preferences';
const CHANNEL_CONFIGS_KEY = 'channel-configs';

// ===== Admin Notifications =====
export const useNotifications = (params: ListNotificationsParams = {}) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: () => notificationsApi.list(params),
  });
};

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, id],
    queryFn: () => notificationsApi.getById(id),
    enabled: !!id,
  });
};

export const useNotificationLogs = (params: ListNotificationsParams = {}) => {
  return useQuery({
    queryKey: [NOTIFICATION_LOGS_KEY, params],
    queryFn: () => notificationsApi.getLogs(params),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء التنبيه بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationDto }) => 
      notificationsApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث التنبيه بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: SendNotificationDto }) => 
      notificationsApi.send(id, data),
    onSuccess: () => {
      toast.success('تم إرسال التنبيه بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف التنبيه بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useBulkSendNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkSendNotificationDto) => 
      notificationsApi.bulkSend(data),
    onSuccess: () => {
      toast.success('تم إرسال التنبيهات بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_STATS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useTestNotification = () => {
  return useMutation({
    mutationFn: ({ userId, templateKey, payload }: { 
      userId: string; 
      templateKey: string; 
      payload?: Record<string, unknown> 
    }) => notificationsApi.test(userId, templateKey, payload),
    onSuccess: () => {
      toast.success('تم إرسال تنبيه الاختبار بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

// ===== Templates =====
export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: [NOTIFICATION_TEMPLATES_KEY],
    queryFn: () => notificationsApi.getTemplates(),
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => notificationsApi.createTemplate(data),
    onSuccess: () => {
      toast.success('تم إنشاء القالب بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_TEMPLATES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateTemplateDto }) => 
      notificationsApi.updateTemplate(key, data),
    onSuccess: () => {
      toast.success('تم تحديث القالب بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_TEMPLATES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => notificationsApi.deleteTemplate(key),
    onSuccess: () => {
      toast.success('تم حذف القالب بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_TEMPLATES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useTemplateStats = (key: string) => {
  return useQuery({
    queryKey: [NOTIFICATION_TEMPLATES_KEY, 'stats', key],
    queryFn: () => notificationsApi.getTemplateStats(key),
    enabled: !!key,
  });
};

// ===== Statistics =====
export const useNotificationStats = (params: NotificationStatsParams = {}) => {
  return useQuery({
    queryKey: [NOTIFICATION_STATS_KEY, params],
    queryFn: () => notificationsApi.getStats(params),
  });
};

export const useNotificationStatsOverview = () => {
  return useQuery({
    queryKey: [NOTIFICATION_STATS_KEY, 'overview'],
    queryFn: () => notificationsApi.getStatsOverview(),
  });
};

// ===== User Notifications =====
export const useUserNotifications = (params: { limit?: number; offset?: number } = {}) => {
  return useQuery({
    queryKey: [USER_NOTIFICATIONS_KEY, params],
    queryFn: () => notificationsApi.getUserNotifications(params),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: [USER_NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarkAsReadDto) => notificationsApi.markAsRead(data),
    onSuccess: () => {
      toast.success('تم تحديد التنبيهات كمقروءة');
      queryClient.invalidateQueries({ queryKey: [USER_NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_NOTIFICATIONS_KEY, 'unread-count'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('تم تحديد جميع التنبيهات كمقروءة');
      queryClient.invalidateQueries({ queryKey: [USER_NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [USER_NOTIFICATIONS_KEY, 'unread-count'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: [USER_NOTIFICATIONS_KEY, 'stats'],
    queryFn: () => notificationsApi.getUserStats(),
  });
};

// ===== Preferences =====
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: [NOTIFICATION_PREFERENCES_KEY],
    queryFn: () => notificationsApi.getPreferences(),
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => notificationsApi.updatePreferences(data),
    onSuccess: () => {
      toast.success('تم تحديث تفضيلات الإشعارات بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_PREFERENCES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// ===== Device Management =====
export const useRegisterDevice = () => {
  return useMutation({
    mutationFn: (data: any) => notificationsApi.registerDevice(data),
    onSuccess: () => {
      toast.success('تم تسجيل الجهاز بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

export const useUnregisterDevice = () => {
  return useMutation({
    mutationFn: (id: string) => notificationsApi.unregisterDevice(id),
    onSuccess: () => {
      toast.success('تم إلغاء تسجيل الجهاز بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

// ===== Channel Config Hooks =====
export const useChannelConfigs = () => {
  return useQuery({
    queryKey: [CHANNEL_CONFIGS_KEY],
    queryFn: () => notificationsApi.getChannelConfigs(),
  });
};

export const useChannelConfig = (type: NotificationType) => {
  return useQuery({
    queryKey: [CHANNEL_CONFIGS_KEY, type],
    queryFn: () => notificationsApi.getChannelConfigByType(type),
    enabled: !!type,
  });
};

export const useCreateChannelConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChannelConfigDto) => notificationsApi.createChannelConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHANNEL_CONFIGS_KEY] });
      toast.success('تم إنشاء إعدادات القناة بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateChannelConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }: { type: NotificationType; data: UpdateChannelConfigDto }) =>
      notificationsApi.updateChannelConfig(type, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CHANNEL_CONFIGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CHANNEL_CONFIGS_KEY, variables.type] });
      toast.success('تم تحديث إعدادات القناة بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteChannelConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: NotificationType) => notificationsApi.deleteChannelConfig(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHANNEL_CONFIGS_KEY] });
      toast.success('تم حذف إعدادات القناة بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

export const useInitializeChannelConfigs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.initializeChannelConfigs(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CHANNEL_CONFIGS_KEY] });
      toast.success(
        `تم تهيئة ${data.created} إعدادات جديدة وتحديث ${data.updated} إعدادات موجودة`
      );
    },
    onError: ErrorHandler.showError,
  });
};
