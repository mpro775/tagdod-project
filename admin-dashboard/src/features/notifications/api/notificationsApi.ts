import { apiClient } from '@/core/api/client';
import { unwrapApiData } from '@/core/api/response';
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
  ApiTemplateResponse,
  MarkAsReadDto,
  NotificationChannelConfig,
  CreateChannelConfigDto,
  UpdateChannelConfigDto,
  InitializeChannelConfigsResponse,
  NotificationType,
  NotificationDeliveryDetails,
} from '../types/notification.types';

/**
 * Map API template response to NotificationTemplate (supports both id/key and name/description formats)
 */
function mapApiTemplateToNotificationTemplate(api: ApiTemplateResponse | NotificationTemplate): NotificationTemplate {
  const hasApiFormat = 'id' in api && typeof (api as ApiTemplateResponse).name === 'string' && !('key' in api && (api as any).key);
  if (hasApiFormat) {
    const a = api as ApiTemplateResponse;
    return {
      key: a.id,
      id: a.id,
      name: a.name,
      title: a.name,
      body: a.description || '',
      message: a.description || '',
      messageEn: a.description || '',
      category: a.category as any,
      variables: a.variables,
    };
  }
  return api as NotificationTemplate;
}

const getEnvelopeData = <T>(payload: unknown, fallback?: T): T => unwrapApiData<T>(payload, fallback);

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
        groupByBatch: params.groupByBatch ?? true,
        ...params,
      },
    });

    const responseData = getEnvelopeData<{ notifications?: Notification[]; total?: number; meta?: any }>(
      response.data,
      {},
    );
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
    const response = await apiClient.get<ApiResponse<Notification>>(
      `/notifications/admin/notification/${id}`
    );
    return getEnvelopeData<Notification>(response.data);
  },

  getDeliveryDetails: async (id: string): Promise<NotificationDeliveryDetails> => {
    const response = await apiClient.get<ApiResponse<NotificationDeliveryDetails>>(
      `/notifications/admin/notification/${id}/delivery-details`
    );
    return getEnvelopeData<NotificationDeliveryDetails>(response.data);
  },

  getBatchDeliveryDetails: async (batchId: string): Promise<NotificationDeliveryDetails> => {
    const response = await apiClient.get<ApiResponse<NotificationDeliveryDetails>>(
      `/notifications/admin/batch/${batchId}/delivery-details`
    );
    return getEnvelopeData<NotificationDeliveryDetails>(response.data);
  },

  create: async (data: CreateNotificationDto): Promise<Notification> => {
    const response = await apiClient.post<
      ApiResponse<{ notification: Notification; message: string }>
    >('/notifications/admin/create', data);
    const responseData = getEnvelopeData<{ notification?: Notification } & Notification>(
      response.data,
    );
    return responseData.notification || responseData;
  },

  update: async (id: string, data: UpdateNotificationDto): Promise<Notification> => {
    const response = await apiClient.put<ApiResponse<Notification>>(
      `/notifications/admin/notification/${id}`,
      data
    );
    return getEnvelopeData<Notification>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/admin/notification/${id}`);
  },

  deleteBatch: async (batchId: string): Promise<{ deletedCount: number }> => {
    const response = await apiClient.delete<ApiResponse<{ deletedCount: number; message?: string }>>(
      `/notifications/admin/batch/${batchId}`
    );
    const data = getEnvelopeData<{ deletedCount?: number }>(response.data, {});
    return { deletedCount: data?.deletedCount ?? 0 };
  },

  sendBatch: async (
    batchId: string
  ): Promise<{
    sent: number;
    failed: number;
    results: Array<{ notificationId: string; success: boolean; error?: string }>;
  }> => {
    const response = await apiClient.post<
      ApiResponse<{
        sent: number;
        failed: number;
        results: Array<{ notificationId: string; success: boolean; error?: string }>;
      }>
    >(`/notifications/admin/batch/${batchId}/send`);
    const data = getEnvelopeData<{
      sent?: number;
      failed?: number;
      results?: Array<{ notificationId: string; success: boolean; error?: string }>;
    }>(response.data, {});
    return {
      sent: data?.sent ?? 0,
      failed: data?.failed ?? 0,
      results: data?.results ?? [],
    };
  },

  send: async (id: string, data: SendNotificationDto = {}): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      `/notifications/admin/notification/${id}/send`,
      data
    );
    return getEnvelopeData<Notification>(response.data);
  },

  bulkSend: async (
    data: BulkSendNotificationDto
  ): Promise<{ batchId: string; accepted: boolean; total: number }> => {
    const response = await apiClient.post<
      ApiResponse<{ batchId: string; accepted: boolean; total: number }>
    >('/notifications/admin/bulk-send', data);
    const payload = getEnvelopeData<{ batchId: string; accepted: boolean; total: number }>(
      response.data,
      { batchId: '', accepted: false, total: 0 },
    );
    return {
      batchId: payload.batchId,
      accepted: !!payload.accepted,
      total: payload.total ?? 0,
    };
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
    const response = await apiClient.get<ApiResponse<ApiTemplateResponse[] | NotificationTemplate[]>>(
      '/notifications/admin/templates'
    );
    const raw = getEnvelopeData<ApiTemplateResponse[] | NotificationTemplate[]>(response.data, []);
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((item) => mapApiTemplateToNotificationTemplate(item as ApiTemplateResponse));
  },

  createTemplate: async (data: CreateTemplateDto): Promise<NotificationTemplate> => {
    const response = await apiClient.post<ApiResponse<ApiTemplateResponse | NotificationTemplate>>(
      '/notifications/admin/templates',
      data
    );
const raw = getEnvelopeData<ApiTemplateResponse | NotificationTemplate | undefined>(response.data);
    if (!raw) throw new Error('Failed to create template: no data returned');
    return mapApiTemplateToNotificationTemplate(raw as ApiTemplateResponse);
  },

  updateTemplate: async (key: string, data: UpdateTemplateDto): Promise<NotificationTemplate> => {
    const response = await apiClient.put<ApiResponse<ApiTemplateResponse | NotificationTemplate>>(
      `/notifications/admin/templates/${key}`,
      data
    );
    const raw = getEnvelopeData<ApiTemplateResponse | NotificationTemplate | undefined>(response.data);
    if (!raw) throw new Error('Failed to update template: no data returned');
    return mapApiTemplateToNotificationTemplate(raw as ApiTemplateResponse);
  },

  deleteTemplate: async (key: string): Promise<void> => {
    await apiClient.delete(`/notifications/admin/templates/${key}`);
  },

  getTemplateStats: async (key: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/notifications/admin/templates/${key}/stats`
    );
    return getEnvelopeData<any>(response.data);
  },

  // ===== Statistics =====
  getStats: async (params: NotificationStatsParams = {}): Promise<NotificationStats> => {
    const response = await apiClient.get<ApiResponse<NotificationStats>>(
      '/notifications/admin/stats',
      {
        params,
      }
    );
    return getEnvelopeData<NotificationStats>(response.data);
  },

  getStatsOverview: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/admin/stats/overview');
    return getEnvelopeData<any>(response.data);
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

    const responseData = getEnvelopeData<{ notifications?: Notification[]; total?: number; meta?: any }>(
      response.data,
      {},
    );
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

    const responseData = getEnvelopeData<{ notifications?: Notification[]; total?: number }>(
      response.data,
      {},
    );
    const notifications = responseData.notifications || [];
    const total = responseData.total || 0;

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
    return getEnvelopeData<{ count: number }>(response.data, { count: 0 }).count;
  },

  markAsRead: async (data: MarkAsReadDto): Promise<void> => {
    await apiClient.post('/notifications/mark-read', data);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/mark-all-read');
  },

  getUserStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/stats');
    return getEnvelopeData<any>(response.data);
  },

  // ===== Preferences =====
  getPreferences: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/preferences');
    return getEnvelopeData<any>(response.data);
  },

  updatePreferences: async (data: any): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>('/notifications/preferences', data);
    return getEnvelopeData<any>(response.data);
  },

  // ===== Device Management =====
  registerDevice: async (data: any): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/notifications/devices/register',
      data
    );
    return getEnvelopeData<any>(response.data);
  },

  unregisterDevice: async (token: string): Promise<void> => {
    await apiClient.post('/notifications/devices/unregister', { token });
  },

  // ===== Device Check (Admin) =====
  checkUserDevices: async (
    userId: string
  ): Promise<{
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
    const response = await apiClient.get<
      ApiResponse<{
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
      }>
    >(`/notifications/admin/users/${userId}/devices`);
    return getEnvelopeData<{
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
    }>(response.data);
  },

  checkMultipleUsersDevices: async (
    userIds: string[]
  ): Promise<{
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
    const response = await apiClient.post<
      ApiResponse<{
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
      }>
    >('/notifications/admin/users/devices/check', {
      userIds,
    });
    return getEnvelopeData<{
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
    }>(response.data);
  },

  // ===== Channel Config APIs =====
  getChannelConfigs: async (): Promise<NotificationChannelConfig[]> => {
    const response = await apiClient.get<ApiResponse<NotificationChannelConfig[]>>(
      '/notifications/admin/channel-configs'
    );

    return getEnvelopeData<NotificationChannelConfig[]>(response.data, []);
  },

  getChannelConfigByType: async (
    type: NotificationType
  ): Promise<NotificationChannelConfig | null> => {
    const response = await apiClient.get<ApiResponse<NotificationChannelConfig>>(
      `/notifications/admin/channel-configs/${type}`
    );
    return getEnvelopeData<NotificationChannelConfig | null>(response.data, null);
  },

  createChannelConfig: async (data: CreateChannelConfigDto): Promise<NotificationChannelConfig> => {
    const response = await apiClient.post<ApiResponse<NotificationChannelConfig>>(
      '/notifications/admin/channel-configs',
      data
    );
    return getEnvelopeData<NotificationChannelConfig>(response.data);
  },

  updateChannelConfig: async (
    type: NotificationType,
    data: UpdateChannelConfigDto
  ): Promise<NotificationChannelConfig> => {
    const response = await apiClient.put<ApiResponse<NotificationChannelConfig>>(
      `/notifications/admin/channel-configs/${type}`,
      data
    );
    return getEnvelopeData<NotificationChannelConfig>(response.data);
  },

  deleteChannelConfig: async (type: NotificationType): Promise<void> => {
    await apiClient.delete(`/notifications/admin/channel-configs/${type}`);
  },

  initializeChannelConfigs: async (): Promise<InitializeChannelConfigsResponse> => {
    const response = await apiClient.post<ApiResponse<InitializeChannelConfigsResponse>>(
      '/notifications/admin/channel-configs/initialize'
    );
    return getEnvelopeData<InitializeChannelConfigsResponse>(response.data);
  },

  // ===== Advanced Analytics =====
  getAdvancedAnalytics: async (
    params: {
      startDate?: string;
      endDate?: string;
      type?: string;
      channel?: string;
      campaign?: string;
    } = {}
  ): Promise<{
    overview: {
      totalSent: number;
      totalDelivered: number;
      totalOpened: number;
      totalClicked: number;
      totalConverted: number;
      overallDeliveryRate: number;
      overallOpenRate: number;
      overallCTR: number;
      overallConversionRate: number;
    };
    topPerformingTypes: Array<{
      category: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      converted: number;
      deliveryRate: number;
      openRate: number;
      ctr: number;
      conversionRate: number;
    }>;
    recentTrend: Array<{
      period: string;
      sent: number;
      opened: number;
      clicked: number;
      openRate: number;
      clickRate: number;
      ctr: number;
    }>;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/notifications/admin/analytics/advanced',
      { params }
    );
    return getEnvelopeData<any>(response.data);
  },

  getCTR: async (
    params: {
      startDate?: string;
      endDate?: string;
      type?: string;
      channel?: string;
    } = {}
  ): Promise<
    Array<{
      period: string;
      sent: number;
      opened: number;
      clicked: number;
      openRate: number;
      clickRate: number;
      ctr: number;
    }>
  > => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/admin/analytics/ctr', {
      params,
    });
    return getEnvelopeData<any>(response.data);
  },

  getConversionRate: async (
    params: {
      startDate?: string;
      endDate?: string;
      type?: string;
      channel?: string;
    } = {}
  ): Promise<
    Array<{
      period: string;
      sent: number;
      converted: number;
      conversionRate: number;
      totalValue: number;
      avgValue: number;
    }>
  > => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/notifications/admin/analytics/conversion',
      { params }
    );
    return getEnvelopeData<any>(response.data);
  },

  getPerformance: async (
    params: {
      startDate?: string;
      endDate?: string;
      type?: string;
      channel?: string;
    } = {}
  ): Promise<{
    byType: Array<{
      category: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      converted: number;
      deliveryRate: number;
      openRate: number;
      ctr: number;
      conversionRate: number;
    }>;
    byChannel: Array<{
      category: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      converted: number;
      deliveryRate: number;
      openRate: number;
      ctr: number;
      conversionRate: number;
    }>;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/notifications/admin/analytics/performance',
      { params }
    );
    return getEnvelopeData<any>(response.data);
  },

  getQueueStats: async (): Promise<{
    send: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    scheduled: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    };
    retry: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    totalPending: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/notifications/admin/queue-stats');
    return getEnvelopeData<any>(response.data);
  },
};
