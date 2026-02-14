import { Outlet } from 'react-router-dom'
import { BottomNavBar } from './BottomNavBar'
import { AppBar } from './AppBar'
import { CartRehydrate } from '../cart/CartRehydrate'

interface AppShellProps {
  showNav?: boolean
  showAppBar?: boolean
}

export function AppShell({ showNav = true, showAppBar = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <CartRehydrate />
      {showAppBar && <AppBar />}
      <main className={showNav ? 'pb-20' : ''}>
        <Outlet />
      </main>
      {showNav && <BottomNavBar />}
    </div>
  )
}
