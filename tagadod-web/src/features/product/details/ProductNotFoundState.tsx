import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PackageX, Home, ShoppingBag } from 'lucide-react'
import { GlobalButton } from '../../../components/shared'

export function ProductNotFoundState() {
  const { t } = useTranslation()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-tagadod-red/10 mb-6">
          <PackageX size={40} className="text-tagadod-red" />
        </div>
        <h2 className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
          {t('productDetails.states.notFoundTitle')}
        </h2>
        <p className="text-tagadod-gray mb-8">
          {t('productDetails.states.notFoundSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/products">
            <GlobalButton variant="primary" size="md">
              <ShoppingBag size={18} />
              <span>{t('productDetails.actions.backToProducts')}</span>
            </GlobalButton>
          </Link>
          <Link to="/">
            <GlobalButton variant="outline" size="md">
              <Home size={18} />
              <span>{t('productDetails.actions.backHome')}</span>
            </GlobalButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
