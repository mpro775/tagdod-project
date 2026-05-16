import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Menu, X, Globe } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../stores/cartStore'
import { useLanguageStore } from '../../stores/languageStore'

const drawerLinks = [
  { label: 'layout.nav.home', href: '/home' },
  { label: 'layout.nav.categories', href: '/categories' },
  { label: 'layout.nav.offers', href: '/home' },
  { label: 'layout.nav.maintenance', href: '/maintenance-orders' },
  { label: 'layout.nav.account', href: '/profile' },
  { label: 'layout.nav.favorites', href: '/favorites' },
  { label: 'layout.nav.orders', href: '/orders' },
]

export function MobileHeader() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cartCount = useCartStore((s) => s.getCount())
  const { language, setLanguage } = useLanguageStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleLang = () => {
    const next = language === 'ar' ? 'en' : 'ar'
    setLanguage(next)
  }

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-tagadod-dark-gray shadow-sm border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/home" className="flex items-center">
            <img
              src="/assets/icons/app_logo.png"
              alt="تجدد - Tagadod"
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/search')}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label={t('common.search')}
            >
              <Search size={20} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
            </button>

            <Link
              to="/cart"
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 relative"
              aria-label={t('layout.nav.cart')}
            >
              <ShoppingCart size={20} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-tagadod-red rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
              aria-label={t('common.menu')}
            >
              <Menu size={20} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="md:hidden fixed top-0 bottom-0 z-[70] w-72 max-w-[80vw] bg-white dark:bg-tagadod-dark-gray shadow-xl"
            style={{
              [language === 'ar' ? 'right' : 'left']: 0,
            }}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 dark:border-white/5">
              <span className="font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                {t('layout.nav.menu')}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="p-3 space-y-1">
              {drawerLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  to={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {t(link.label)}
                </Link>
              ))}

              <div className="pt-2 border-t border-gray-100 dark:border-white/5 mt-2">
                <button
                  onClick={() => {
                    toggleLang()
                    setDrawerOpen(false)
                  }}
                  className="flex items-center gap-3 w-full text-right px-3 py-3 rounded-lg text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Globe size={18} />
                  {language === 'ar' ? 'English' : 'العربية'}
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
