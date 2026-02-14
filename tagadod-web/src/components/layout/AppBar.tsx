import { Link } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { isLoggedIn } from '../../stores/authStore'
import * as notificationService from '../../services/notificationService'

interface AppBarProps {
  showLogo?: boolean
  showSearch?: boolean
  showNotifications?: boolean
}

export function AppBar({
  showLogo = true,
  showSearch = true,
  showNotifications = true,
}: AppBarProps) {
  const loggedIn = isLoggedIn()

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: loggedIn,
    refetchInterval: 30000,
  })

  const unreadCount = unreadData?.count ?? 0

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-tagadod-dark-gray shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {showLogo && (
          <Link to="/home" className="flex items-center h-9">
            <img
              src="/assets/icons/app_logo.png"
              alt="تجدد - Tagadod"
              className="h-9 w-auto object-contain"
            />
          </Link>
        )}
        <div className="flex items-center gap-3">
          {showSearch && (
            <Link
              to="/search"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <Search size={22} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
            </Link>
          )}
          {showNotifications && (
            <Link
              to="/notifications"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 relative"
            >
              <Bell size={22} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-tagadod-red rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
