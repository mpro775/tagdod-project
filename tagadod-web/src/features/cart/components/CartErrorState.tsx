import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { GlobalButton } from '../../../components/shared'

type CartErrorStateProps = {
  message?: string
  onRetry?: () => void
}

export function CartErrorState({ message, onRetry }: CartErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 text-tagadod-red">
        <AlertCircle size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
        {t('cart.states.errorTitle', 'تعذر تحميل السلة')}
      </h3>
      <p className="text-sm text-tagadod-gray mb-6 max-w-sm">
        {message ?? t('cart.states.errorSubtitle', 'حدث خطأ أثناء تحميل السلة. حاول مرة أخرى.')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <GlobalButton onClick={onRetry} size="md">
            {t('cart.actions.retry', 'إعادة المحاولة')}
          </GlobalButton>
        )}
        <Link
          to="/products"
          className="px-6 py-3 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-center"
        >
          {t('cart.actions.browseProducts', 'تصفح المنتجات')}
        </Link>
      </div>
    </div>
  )
}
