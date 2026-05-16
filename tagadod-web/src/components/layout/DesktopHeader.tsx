import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Phone,
  Truck,
  Bell,
  Globe,
} from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { Container } from './Container'
import { useCartStore } from '../../stores/cartStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { useLanguageStore } from '../../stores/languageStore'

const mainNavItems = [
  { key: 'layout.nav.home', href: '/home' },
  { key: 'layout.nav.categories', href: '/categories' },
  { key: 'layout.nav.offers', href: '/home' },
  { key: 'layout.nav.maintenance', href: '/maintenance-orders' },
  { key: 'layout.nav.contact', href: '/profile' },
]

export function DesktopHeader() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const cartCount = useCartStore((s) => s.getCount())
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const { language, setLanguage } = useLanguageStore()
  const toggleLang = () => {
    const next = language === 'ar' ? 'en' : 'ar'
    setLanguage(next)
  }

  return (
    <header className="hidden md:block bg-white dark:bg-tagadod-dark-gray border-b border-gray-200 dark:border-white/10">
      {/* Top Bar */}
      <div className="bg-tagadod-light-gray dark:bg-tagadod-dark-gray/80 text-xs text-tagadod-gray dark:text-tagadod-dark-titles">
        <Container>
          <div className="flex items-center justify-between h-9">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {t('layout.topBar.support')}
              </span>
              <Link
                to="/orders"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Truck size={12} />
                {t('layout.topBar.trackOrder')}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Globe size={12} />
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              <Link
                to="/profile"
                className="hover:text-primary transition-colors"
              >
                {t('layout.topBar.contact')}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Header */}
      <Container>
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Logo */}
          <Link to="/home" className="flex items-center shrink-0">
            <img
              src="/assets/icons/app_logo.png"
              alt="تجدد - Tagadod"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <button
              onClick={() => navigate('/search')}
              className="w-full flex items-center gap-2 h-11 px-4 rounded-lg bg-gray-100 dark:bg-white/5 text-tagadod-gray dark:text-tagadod-dark-titles hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-right"
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
            >
              <Search size={18} className="shrink-0 opacity-60" />
              <span className="text-sm">{t('layout.search.placeholder')}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title={t('layout.nav.account')}
            >
              <User size={20} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
              <span className="text-sm font-medium hidden lg:inline">
                {t('layout.nav.account')}
              </span>
            </Link>

            <Link
              to="/favorites"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title={t('layout.nav.favorites')}
            >
              <Heart size={20} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
              <span className="text-sm font-medium hidden lg:inline">
                {t('layout.nav.favorites')}
              </span>
            </Link>

            <Link
              to="/notifications"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative"
              title={t('notifications.title')}
            >
              <Bell size={20} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-tagadod-red rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <span className="text-sm font-medium hidden lg:inline">
                {t('notifications.title')}
              </span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative"
              title={t('layout.nav.cart')}
            >
              <ShoppingCart
                size={20}
                className="text-tagadod-titles dark:text-tagadod-dark-titles"
              />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-tagadod-red rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <span className="text-sm font-medium hidden lg:inline">
                {t('layout.nav.cart')}
              </span>
            </Link>
          </div>
        </div>
      </Container>

      {/* Navigation Bar */}
      <div className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-tagadod-dark-gray">
        <Container>
          <nav className="flex items-center gap-1 h-12">
            {mainNavItems.map((item) => (
              <Link
                key={item.href + item.key}
                to={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles hover:text-primary hover:bg-primary/5 dark:hover:bg-white/5 transition-colors"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  )
}
