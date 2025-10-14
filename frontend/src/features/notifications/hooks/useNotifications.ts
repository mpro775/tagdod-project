import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notificationsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListNotificationsParams, CreateNotificationDto } from '../types/notification.types';

const NOTIFICATIONS_KEY = 'notifications';

export const useNotifications = (params: ListNotificationsParams = {}) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: () => notificationsApi.list(params),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء التنبيه بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.send(id),
    onSuccess: () => {
      toast.success('تم إرسال التنبيه بنجاح');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
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
    },
    onError: ErrorHandler.showError,
  });
};

