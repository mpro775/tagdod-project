import { create } from 'zustand'
import {
  connectNotificationsWebSocket,
  disconnectNotificationsWebSocket,
  onNewNotification,
  onUnreadCountChange,
  onMarkedAsRead,
  onMarkedAllAsRead,
} from '../services/notificationsWebSocket'
import { isLoggedIn } from '../stores/authStore'

interface NotificationStore {
  unreadCount: number
  setUnreadCount: (n: number) => void
  initWebSocket: () => void
  destroyWebSocket: () => void
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  initWebSocket: () => {
    if (!isLoggedIn()) return
    if (get().unreadCount === 0) {
      const count = localStorage.getItem('unreadNotificationsCount')
      if (count) set({ unreadCount: parseInt(count, 10) })
    }
    connectNotificationsWebSocket()

    onUnreadCountChange((count) => {
      set({ unreadCount: count })
      localStorage.setItem('unreadNotificationsCount', String(count))
    })

    onNewNotification(() => {
      const newCount = get().unreadCount + 1
      set({ unreadCount: newCount })
      localStorage.setItem('unreadNotificationsCount', String(newCount))
    })

    onMarkedAsRead((ids) => {
      const newCount = Math.max(0, get().unreadCount - ids.length)
      set({ unreadCount: newCount })
      localStorage.setItem('unreadNotificationsCount', String(newCount))
    })

    onMarkedAllAsRead(() => {
      set({ unreadCount: 0 })
      localStorage.setItem('unreadNotificationsCount', '0')
    })
  },
  destroyWebSocket: () => {
    disconnectNotificationsWebSocket()
  },
}))
