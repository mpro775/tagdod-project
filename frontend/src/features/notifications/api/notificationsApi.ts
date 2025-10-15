import { apiClient } from '@/core/api/client';
import type {
  Notification,
  ListNotificationsParams,
  CreateNotificationDto,
  UpdateNotificationDto,
  SendNotificationDto,
  NotificationTemplate,
  NotificationStats,
} from '../types/notification.types';

export const notificationsApi = {
  list: async (params: ListNotificationsParams = {}): Promise<{ data: Notification[]; meta: any }> => {
    const response = await apiClient.get<{ data: Notification[]; meta: any }>('/admin/notifications', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<{ data: Notification }>(`/admin/notifications/${id}`);
    return response.data.data;
  },

  create: async (data: CreateNotificationDto): Promise<Notification> => {
    const response = await apiClient.post<{ data: Notification }>('/admin/notifications', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateNotificationDto): Promise<Notification> => {
    const response = await apiClient.put<{ data: Notification }>(`/admin/notifications/${id}`, data);
    return response.data.data;
  },

  send: async (id: string, data: SendNotificationDto = {}): Promise<any> => {
    const response = await apiClient.post<{ data: any }>(`/admin/notifications/${id}/send`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/notifications/${id}`);
  },

  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get<{ data: NotificationTemplate[] }>('/admin/notifications/templates');
    return response.data.data;
  },

  getStats: async (): Promise<NotificationStats> => {
    const response = await apiClient.get<{ data: NotificationStats }>('/admin/notifications/stats/overview');
    return response.data.data;
  },

  bulkSend: async (data: CreateNotificationDto & { targetUsers: string[] }): Promise<any[]> => {
    const response = await apiClient.post<{ data: any[] }>('/admin/notifications/bulk/send', data);
    return response.data.data;
  },

  test: async (userId: string, templateKey: string, payload: Record<string, unknown> = {}): Promise<void> => {
    await apiClient.post('/admin/notifications/test', { userId, templateKey, payload });
  },
};
