import { Socket } from 'socket.io-client'
import { createSocket } from './socket'

let socket: Socket | null = null

type NotificationCallback = (notification: unknown) => void
type UnreadCountCallback = (count: number) => void

const listeners: {
  onNotification: NotificationCallback[]
  onUnreadCount: UnreadCountCallback[]
  onMarkedAsRead: ((ids: string[]) => void)[]
  onMarkedAllAsRead: (() => void)[]
} = {
  onNotification: [],
  onUnreadCount: [],
  onMarkedAsRead: [],
  onMarkedAllAsRead: [],
}

export function connectNotificationsWebSocket(): void {
  if (socket?.connected) return

  socket = createSocket('/notifications', {
    transports: ['websocket', 'polling'],
    onConnect: () => {
      console.log('[NotificationsWS] Connected')
    },
    onDisconnect: (reason) => {
      console.log('[NotificationsWS] Disconnected:', reason)
    },
    onConnectError: (error) => {
      console.error('[NotificationsWS] Connection error:', error)
    },
  })

  socket.on('notification:new', (notification) => {
    console.log('[NotificationsWS] New notification:', notification)
    listeners.onNotification.forEach((cb) => cb(notification))
  })

  socket.on('new_notification', (notification) => {
    console.log('[NotificationsWS] New notification (alt):', notification)
    listeners.onNotification.forEach((cb) => cb(notification))
  })

  socket.on('unread-count', (data) => {
    const count = typeof data === 'number' ? data : (data as { count?: number })?.count ?? 0
    console.log('[NotificationsWS] Unread count:', count)
    listeners.onUnreadCount.forEach((cb) => cb(count))
  })

  socket.on('marked-as-read', (data) => {
    const ids = Array.isArray(data) ? data : (data as { ids?: string[] })?.ids ?? []
    console.log('[NotificationsWS] Marked as read:', ids)
    listeners.onMarkedAsRead.forEach((cb) => cb(ids))
  })

  socket.on('marked-all-as-read', () => {
    console.log('[NotificationsWS] All marked as read')
    listeners.onMarkedAllAsRead.forEach((cb) => cb())
  })
}

export function disconnectNotificationsWebSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function onNewNotification(callback: NotificationCallback): () => void {
  listeners.onNotification.push(callback)
  return () => {
    const idx = listeners.onNotification.indexOf(callback)
    if (idx > -1) listeners.onNotification.splice(idx, 1)
  }
}

export function onUnreadCountChange(callback: UnreadCountCallback): () => void {
  listeners.onUnreadCount.push(callback)
  return () => {
    const idx = listeners.onUnreadCount.indexOf(callback)
    if (idx > -1) listeners.onUnreadCount.splice(idx, 1)
  }
}

export function onMarkedAsRead(callback: (ids: string[]) => void): () => void {
  listeners.onMarkedAsRead.push(callback)
  return () => {
    const idx = listeners.onMarkedAsRead.indexOf(callback)
    if (idx > -1) listeners.onMarkedAsRead.splice(idx, 1)
  }
}

export function onMarkedAllAsRead(callback: () => void): () => void {
  listeners.onMarkedAllAsRead.push(callback)
  return () => {
    const idx = listeners.onMarkedAllAsRead.indexOf(callback)
    if (idx > -1) listeners.onMarkedAllAsRead.splice(idx, 1)
  }
}

export function isNotificationsSocketConnected(): boolean {
  return socket?.connected ?? false
}
