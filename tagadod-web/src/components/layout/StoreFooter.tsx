import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container } from './Container'

export function StoreFooter() {
  const { t } = useTranslation()

  const quickLinks = [
    { label: 'layout.nav.home', href: '/home' },
    { label: 'layout.nav.categories', href: '/categories' },
    { label: 'layout.nav.products', href: '/products' },
    { label: 'layout.nav.cart', href: '/cart' },
  ]

  const customerLinks = [
    { label: 'layout.footer.about', href: '/about' },
    { label: 'layout.footer.contact', href: '/contact' },
    { label: 'layout.nav.orders', href: '/orders' },
    { label: 'layout.nav.favorites', href: '/favorites' },
  ]

  const policyLinks = [
    { label: 'layout.footer.privacy', href: '/privacy-policy' },
    { label: 'layout.footer.returns', href: '/return-policy' },
    { label: 'layout.footer.shipping', href: '/shipping-policy' },
    { label: 'layout.footer.terms', href: '/terms' },
    { label: 'layout.footer.faq', href: '/faq' },
  ]

  return (
    <footer className="bg-white dark:bg-tagadod-dark-gray border-t border-gray-200 dark:border-white/10">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
          {/* About */}
          <div className="space-y-3">
            <Link to="/home" className="inline-flex items-center">
              <img
                src="/assets/icons/app_logo.png"
                alt="تجدد - Tagadod"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-tagadod-gray leading-relaxed">
              {t('layout.footer.aboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('layout.footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-tagadod-gray hover:text-primary transition-colors"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('layout.footer.customerService')}
            </h4>
            <ul className="space-y-2">
              {customerLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-tagadod-gray hover:text-primary transition-colors"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('layout.footer.policies')}
            </h4>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-tagadod-gray hover:text-primary transition-colors"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 dark:border-white/5">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 h-14 text-xs text-tagadod-gray">
            <span>{t('layout.footer.rights')}</span>
            <span>© {new Date().getFullYear()} Tagadod</span>
          </div>
        </Container>
      </div>
    </footer>
  )
}
