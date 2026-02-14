export interface Notification {
  id: string
  title: string
  body: string
  type?: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

export interface UnreadCount {
  count: number
}

export interface NotificationStats {
  total: number
  unread: number
}
