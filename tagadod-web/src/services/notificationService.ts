import { api } from './api'
import type { Notification, UnreadCount, NotificationStats } from '../types/notification'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

/** API قد يعيد notifications[] أو data[] */
type ApiNotification = {
  _id?: string
  id?: string
  title?: string
  message?: string
  body?: string
  messageEn?: string
  type?: string
  data?: Record<string, unknown>
  isRead?: boolean
  readAt?: string | null
  status?: string
  createdAt?: string
  created_at?: string
}

function normalizeNotification(raw: ApiNotification): Notification {
  const id = raw._id ?? raw.id ?? ''
  const isRead = raw.isRead ?? (!!raw.readAt || raw.status === 'read')
  const createdAt = raw.createdAt ?? raw.created_at ?? new Date().toISOString()
  return {
    id,
    title: raw.title ?? '',
    body: raw.message ?? raw.body ?? raw.messageEn ?? '',
    type: raw.type,
    data: raw.data,
    isRead,
    createdAt,
  }
}

function parseNotificationsResponse(raw: unknown): PaginatedResponse<Notification> {
  if (!raw || typeof raw !== 'object') {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }
  }
  const obj = raw as Record<string, unknown>
  const inner = obj.data as Record<string, unknown> | undefined
  const items = (Array.isArray(inner?.data)
    ? inner.data
    : Array.isArray(obj.notifications)
      ? obj.notifications
      : Array.isArray(inner?.notifications)
        ? inner.notifications
        : Array.isArray(obj.data)
          ? obj.data
          : []) as ApiNotification[]
  const meta = (inner?.meta ?? obj.meta) as PaginatedResponse<Notification>['meta'] | undefined
  return {
    data: items.map(normalizeNotification),
    meta: meta ?? { page: 1, limit: 20, total: items.length, totalPages: 1 },
  }
}

export async function getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
  const { data } = await api.get<unknown>('/notifications', {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
  })
  return parseNotificationsResponse(data)
}

export async function markAsRead(ids: string[]): Promise<void> {
  await api.post('/notifications/mark-read', { ids, notificationIds: ids })
}

export async function markAllAsRead(): Promise<void> {
  await api.post('/notifications/mark-all-read')
}

export async function getUnreadCount(): Promise<UnreadCount> {
  const { data } = await api.get<unknown>('/notifications/unread-count')
  const inner = data && typeof data === 'object' && 'data' in data ? (data as { data?: { count?: number } }).data : data
  const count = (inner && typeof inner === 'object' && 'count' in inner
    ? (inner as { count?: number }).count
    : (data as { count?: number })?.count) ?? 0
  return { count }
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const { data } = await api.get<ApiResponse<NotificationStats>>('/notifications/stats')
  return data?.data ?? { total: 0, unread: 0 }
}
