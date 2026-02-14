import { Bell } from 'lucide-react'
import type { Notification } from '../../types/notification'

interface NotificationCardProps {
  notification: Notification
  onClick?: () => void
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-start p-4 rounded-xl transition-colors ${
        notification.isRead
          ? 'bg-white dark:bg-tagadod-dark-gray'
          : 'bg-primary/5 dark:bg-primary/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            notification.isRead ? 'bg-gray-100 dark:bg-white/10' : 'bg-primary/10'
          }`}
        >
          <Bell size={18} className={notification.isRead ? 'text-tagadod-gray' : 'text-primary'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
            {notification.title}
          </p>
          <p className="text-xs text-tagadod-gray line-clamp-2 mt-0.5">{notification.body}</p>
          <p className="text-xs text-tagadod-gray mt-1">
            {new Date(notification.createdAt).toLocaleDateString('ar')}
          </p>
        </div>
        {!notification.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
      </div>
    </button>
  )
}
