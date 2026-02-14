import { api } from './api'
import type { Notification, UnreadCount, NotificationStats } from '../types/notification'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

export async function getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
  const { data } = await api.get<PaginatedResponse<Notification>>('/notifications', { params })
  return data
}

export async function markAsRead(ids: string[]): Promise<void> {
  await api.post('/notifications/mark-read', { ids })
}

export async function markAllAsRead(): Promise<void> {
  await api.post('/notifications/mark-all-read')
}

export async function getUnreadCount(): Promise<UnreadCount> {
  const { data } = await api.get<ApiResponse<UnreadCount>>('/notifications/unread-count')
  return data.data
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const { data } = await api.get<ApiResponse<NotificationStats>>('/notifications/stats')
  return data.data
}
