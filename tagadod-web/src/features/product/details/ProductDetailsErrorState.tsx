import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, ShoppingBag } from 'lucide-react'
import { GlobalButton } from '../../../components/shared'

interface ProductDetailsErrorStateProps {
  onRetry?: () => void
}

export function ProductDetailsErrorState({ onRetry }: ProductDetailsErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-6">
          <AlertTriangle size={40} className="text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
          {t('productDetails.states.errorTitle')}
        </h2>
        <p className="text-tagadod-gray mb-8">
          {t('productDetails.states.errorSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <GlobalButton variant="primary" size="md" onClick={onRetry}>
              <RefreshCw size={18} />
              <span>{t('productDetails.actions.retry')}</span>
            </GlobalButton>
          )}
          <Link to="/products">
            <GlobalButton variant="outline" size="md">
              <ShoppingBag size={18} />
              <span>{t('productDetails.actions.backToProducts')}</span>
            </GlobalButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
