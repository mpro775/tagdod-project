import { apiClient } from '@/core/api/client';
import type { Notification, ListNotificationsParams, CreateNotificationDto } from '../types/notification.types';

export const notificationsApi = {
  list: async (params: ListNotificationsParams = {}): Promise<Notification[]> => {
    const response = await apiClient.get<{ data: Notification[] }>('/admin/notifications', { params });
    return response.data.data;
  },

  create: async (data: CreateNotificationDto): Promise<Notification> => {
    const response = await apiClient.post<{ data: Notification }>('/admin/notifications', data);
    return response.data.data;
  },

  send: async (id: string): Promise<Notification> => {
    const response = await apiClient.post<{ data: Notification }>(`/admin/notifications/${id}/send`);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/notifications/${id}`);
  },
};

