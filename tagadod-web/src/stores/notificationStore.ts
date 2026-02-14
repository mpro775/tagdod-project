import { create } from 'zustand'

interface NotificationStore {
  unreadCount: number
  setUnreadCount: (n: number) => void
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
}))
