import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Package } from 'lucide-react'
import { gradients } from '../../../theme'

export function CartEmptyState() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 text-tagadod-gray">
        <ShoppingCart size={64} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
        {t('cart.states.emptyTitle', 'سلتك فارغة')}
      </h3>
      <p className="text-sm text-tagadod-gray mb-6 max-w-sm">
        {t('cart.states.emptySubtitle', 'ابدأ بإضافة المنتجات التي تحتاجها إلى السلة.')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/products"
          className="px-6 py-3 text-white font-semibold rounded-xl text-sm transition-opacity hover:opacity-90"
          style={{ background: gradients.linerGreen }}
        >
          {t('cart.actions.browseProducts', 'تصفح المنتجات')}
        </Link>
        <Link
          to="/categories"
          className="px-6 py-3 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <Package size={16} />
          {t('cart.actions.browseCategories', 'تصفح التصنيفات')}
        </Link>
      </div>
    </div>
  )
}
