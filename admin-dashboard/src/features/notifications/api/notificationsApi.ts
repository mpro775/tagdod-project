import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Notification,
  ListNotificationsParams,
  CreateNotificationDto,
  UpdateNotificationDto,
  SendNotificationDto,
  BulkSendNotificationDto,
  NotificationTemplate,
  NotificationStats,
  NotificationStatsParams,
  CreateTemplateDto,
  UpdateTemplateDto,
  MarkAsReadDto,
  NotificationChannelConfig,
  CreateChannelConfigDto,
  UpdateChannelConfigDto,
  InitializeChannelConfigsResponse,
  NotificationType,
} from '../types/notification.types';

export const notificationsApi = {
  // ===== Admin Notifications =====
  list: async (
    params: ListNotificationsParams = {}
  ): Promise<{ data: Notification[]; meta: any }> => {
    const response = await apiClient.get<
      ApiResponse<{ notifications: Notification[]; total: number; meta: any }>
    >('/notifications/admin/list', {
      params: {
        page: Math.max(1, params.page || 1),
        limit: params.limit || 20,
        ...params,
      },
    });

    // Backend returns: { notifications, total, meta }
    const responseData = response.data.data || response.data;
    const notifications = responseData.notifications || [];
    const total = responseData.total || 0;
    const meta = responseData.meta || {};

    return {
      data: notifications,
      meta: {
        page: meta.page || params.page || 1,
        limit: meta.limit || params.limit || 20,
        total,
        totalPages: meta.totalPages || Math.ceil(total / (params.limit || 20)),
        hasNextPage: meta.hasNextPage ?? (params.page || 1) * (params.limit || 20) < total,
        hasPrevPage: meta.hasPrevPage ?? (params.page || 1) > 1,
      },
    };
  },

  getById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/admin/${id}`);
    // Backend returns: { success: true, data: notification }
    return response.data.data || response.data;
  },

  create: async (data: CreateNotificationDto): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<{ notification: Notification; message: string }>>(
      '/notifications/admin/create',
      data
    );
    // Backend returns: { notification, message }
    const responseData = response.data.data || response.data;
    return responseData.notification || responseData;
  },

  update: async (id: string, data: UpdateNotificationDto): Promise<Notification> => {
    const response = await apiClient.put<ApiResponse<Notification>>(
      `/notifications/admin/${id}`,
      data
    );
    // Backend returns: { success: true, data: notification }
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/admin/${id}`);
  },

  send: async (id: string, data: SendNotificationDto = {}): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      `/notifications/admin/${id}/send`,
      data
    );
    // Backend returns notification in data field
    return response.data.data || response.data;
  },

  bulkSend: async (data: BulkSendNotificationDto): Promise<Notification[]> => {
    const response = await apiClient.post<ApiResponse<Notification[]>>(
      '/notifications/admin/bulk-send',
      data
    );
    return response.data.data;
  },

  test: async (
    userId: string,
    templateKey: string,
    payload: Record<string, unknown> = {}
  ): Promise<void> => {
    await apiClient.post('/notifications/admin/test', {
      userId,
      templateKey,
      payload,
    });
  },

  // ===== Templates =====
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await apiClient.get<ApiResponse<NotificationTemplate[]>>(
      '/notifications/admin/templates'
    );
    return response.data.data;
  },

  createTemplate: async (data: CreateTemplateDto): Promise<NotificationTemplate> => {
    const response = await apiClient.post<ApiResponse<NotificationTemplate>>(
      '/notifications/admin/templates',
      data
    );
    return response.data.data;
  },

  updateTemplate: async (key: string, data: UpdateTemplateDto): Promise<NotificationTemplate> => {
    const response = await apiClient.put<ApiResponse<NotificationTemplate>>(
      `/notifications/admin/templates/${key}`,
      data
    );
    return response.data.data;
  },

  deleteTemplate: async (key: string): Promise<void> => {
    await apiClient.delete(`/notifications/admin/templates/${key}`);
  },

  getTemplateStats: async (key: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/notifications/admin/templates/${key}/stats`
    );
    return response.data.data;
  },

  // ===== Statistics =====
  getStats: async (params: NotificationStatsParams = {}): Promise<NotificationStats> => {
    const response = await apiClient.get<ApiResponse<NotificationStats>>(
      '/notifications/admin/stats',
      {
        params,
      }
    );
    // Backend returns: { success: true, data: stats }
    return response.data.data || response.data;
  },

  getStatsOverview: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/admin/stats/overview');
    return response.data.data;
  },

  getLogs: async (
    params: ListNotificationsParams = {}
  ): Promise<{ data: Notification[]; meta: any }> => {
    const response = await apiClient.get<
      ApiResponse<{ notifications: Notification[]; total: number; meta: any }>
    >('/notifications/admin/logs', {
      params: {
        page: Math.max(1, params.page || 1),
        limit: params.limit || 20,
        ...params,
      },
    });

    // Backend returns: { notifications, total, meta }
    const responseData = response.data.data || response.data;
    const notifications = responseData.notifications || [];
    const total = responseData.total || 0;
    const meta = responseData.meta || {};

    return {
      data: notifications,
      meta: {
        page: meta.page || params.page || 1,
        limit: meta.limit || params.limit || 20,
        total,
        totalPages: meta.totalPages || Math.ceil(total / (params.limit || 20)),
        hasNextPage: meta.hasNextPage ?? (params.page || 1) * (params.limit || 20) < total,
        hasPrevPage: meta.hasPrevPage ?? (params.page || 1) > 1,
      },
    };
  },

  // ===== User Notifications =====
  getUserNotifications: async (
    params: { limit?: number; offset?: number } = {}
  ): Promise<{ data: Notification[]; meta: any }> => {
    const response = await apiClient.get<
      ApiResponse<{ notifications: Notification[]; total: number }>
    >('/notifications', {
      params: {
        limit: params.limit || 20,
        offset: params.offset || 0,
      },
    });

    console.log('getUserNotifications - Full response:', response);
    console.log('getUserNotifications - response.data:', response.data);
    console.log('getUserNotifications - response.data.data:', response.data.data);
    console.log('getUserNotifications - response.data.data.notifications:', response.data.data?.notifications);

    const notifications = response.data.data?.notifications || [];
    const total = response.data.data?.total || 0;

    console.log('getUserNotifications - Final notifications:', notifications);
    console.log('getUserNotifications - Final total:', total);

    return {
      data: notifications,
      meta: {
        page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
        limit: params.limit || 20,
        total: total,
        totalPages: Math.ceil(total / (params.limit || 20)),
        hasNextPage: (params.offset || 0) + (params.limit || 20) < total,
        hasPrevPage: (params.offset || 0) > 0,
      },
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  markAsRead: async (data: MarkAsReadDto): Promise<void> => {
    await apiClient.post('/notifications/mark-read', data);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/mark-all-read');
  },

  getUserStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/stats');
    return response.data.data;
  },

  // ===== Preferences =====
  getPreferences: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/preferences');
    return response.data.data;
  },

  updatePreferences: async (data: any): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>('/notifications/preferences', data);
    return response.data.data;
  },

  // ===== Device Management =====
  registerDevice: async (data: any): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/notifications/devices/register',
      data
    );
    return response.data.data;
  },

  unregisterDevice: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/devices/${id}`);
  },

  // ===== Device Check (Admin) =====
  checkUserDevices: async (userId: string): Promise<{
    userId: string;
    hasDevices: boolean;
    deviceCount: number;
    devices: Array<{
      _id: string;
      platform: string;
      userAgent?: string;
      appVersion?: string;
      isActive: boolean;
      lastUsedAt?: string;
      createdAt?: string;
    }>;
    platforms: {
      ios: number;
      android: number;
      web: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<{
      userId: string;
      hasDevices: boolean;
      deviceCount: number;
      devices: Array<{
        _id: string;
        platform: string;
        userAgent?: string;
        appVersion?: string;
        isActive: boolean;
        lastUsedAt?: string;
        createdAt?: string;
      }>;
      platforms: {
        ios: number;
        android: number;
        web: number;
      };
    }>>(`/notifications/admin/users/${userId}/devices`);
    return response.data.data;
  },

  checkMultipleUsersDevices: async (userIds: string[]): Promise<{
    total: number;
    withDevices: number;
    withoutDevices: number;
    results: Array<{
      userId: string;
      hasDevices: boolean;
      deviceCount: number;
      platforms: {
        ios: number;
        android: number;
        web: number;
      };
    }>;
  }> => {
    const response = await apiClient.post<ApiResponse<{
      total: number;
      withDevices: number;
      withoutDevices: number;
      results: Array<{
        userId: string;
        hasDevices: boolean;
        deviceCount: number;
        platforms: {
          ios: number;
          android: number;
          web: number;
        };
      }>;
    }>>('/notifications/admin/users/devices/check', {
      userIds,
    });
    return response.data.data;
  },

  // ===== Channel Config APIs =====
  getChannelConfigs: async (): Promise<NotificationChannelConfig[]> => {
    const response = await apiClient.get<ApiResponse<NotificationChannelConfig[]>>(
      '/notifications/admin/channel-configs'
    );
    return response.data.data || [];
  },

  getChannelConfigByType: async (type: NotificationType): Promise<NotificationChannelConfig | null> => {
    const response = await apiClient.get<ApiResponse<NotificationChannelConfig>>(
      `/notifications/admin/channel-configs/${type}`
    );
    return response.data.data || null;
  },

  createChannelConfig: async (data: CreateChannelConfigDto): Promise<NotificationChannelConfig> => {
    const response = await apiClient.post<ApiResponse<NotificationChannelConfig>>(
      '/notifications/admin/channel-configs',
      data
    );
    return response.data.data || response.data;
  },

  updateChannelConfig: async (
    type: NotificationType,
    data: UpdateChannelConfigDto
  ): Promise<NotificationChannelConfig> => {
    const response = await apiClient.put<ApiResponse<NotificationChannelConfig>>(
      `/notifications/admin/channel-configs/${type}`,
      data
    );
    return response.data.data || response.data;
  },

  deleteChannelConfig: async (type: NotificationType): Promise<void> => {
    await apiClient.delete(`/notifications/admin/channel-configs/${type}`);
  },

  initializeChannelConfigs: async (): Promise<InitializeChannelConfigsResponse> => {
    const response = await apiClient.post<ApiResponse<InitializeChannelConfigsResponse>>(
      '/notifications/admin/channel-configs/initialize'
    );
    return response.data.data || response.data;
  },
};
