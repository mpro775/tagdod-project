import { NavLink, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, ShoppingCart, Package, User } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'

const navItems = [
  { path: '/home', icon: Home },
  { path: '/allCategories', icon: LayoutGrid },
  { path: '/CartPage', icon: ShoppingCart },
  { path: '/orders', icon: Package },
  { path: '/profile', icon: User },
]

export function BottomNavBar() {
  const location = useLocation()
  const cartCount = useCartStore((s) => s.getCount())

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark rounded-t-[20px] shadow-[0_-3px_7px_rgba(0,0,0,0.1)] dark:shadow-[0_-3px_7px_rgba(0,0,0,0.2)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center justify-center py-2 min-w-[60px] relative"
            >
              {path === '/CartPage' && cartCount > 0 && (
                <span className="absolute -top-0.5 -end-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <Icon
                size={24}
                className={
                  isActive
                    ? 'text-primary dark:text-white'
                    : 'text-tagadod-gray'
                }
              />
              {isActive && (
                <div
                  className="mt-1 h-0.5 w-4 rounded-full bg-primary dark:bg-white"
                  style={{ width: 15 }}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
