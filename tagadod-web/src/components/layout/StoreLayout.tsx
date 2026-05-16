import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { StoreFooter } from './StoreFooter'
import { BottomNavBar } from './BottomNavBar'
import { CartRehydrate } from '../cart/CartRehydrate'
import { useNotificationStore } from '../../stores/notificationStore'
import { isLoggedIn } from '../../stores/authStore'

export function StoreLayout() {
  const initWebSocket = useNotificationStore((s) => s.initWebSocket)
  const destroyWebSocket = useNotificationStore((s) => s.destroyWebSocket)

  useEffect(() => {
    if (isLoggedIn()) {
      initWebSocket()
    }
    return () => {
      destroyWebSocket()
    }
  }, [initWebSocket, destroyWebSocket])

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg flex flex-col">
      <CartRehydrate />
      <DesktopHeader />
      <MobileHeader />

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <StoreFooter />
      <BottomNavBar />
    </div>
  )
}
