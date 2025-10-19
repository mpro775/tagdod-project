import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { 
  ListNotificationsParams, 
  CreateNotificationDto, 
  UpdateNotificationDto,
  SendNotificationDto
} from '../types/notification.types';

const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_TEMPLATES_KEY = 'notification-templates';
const NOTIFICATION_STATS_KEY = 'notification-stats';

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

export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: [NOTIFICATION_TEMPLATES_KEY],
    queryFn: () => notificationsApi.getTemplates(),
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: [NOTIFICATION_STATS_KEY],
    queryFn: () => notificationsApi.getStats(),
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
    mutationFn: (data: CreateNotificationDto & { targetUsers: string[] }) => 
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
