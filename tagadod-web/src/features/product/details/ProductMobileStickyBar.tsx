import { useTranslation } from 'react-i18next'
import { ShoppingCart, Check } from 'lucide-react'
import { formatPrice } from '../../../stores/currencyStore'
import { getProductPrice } from './productDetails.helpers'
import type { Product, ProductVariant } from '../../../types/product'

interface ProductMobileStickyBarProps {
  product: Product
  selectedVariant: ProductVariant | undefined
  onAddToCart: () => void
  inStock: boolean
  addSuccess?: boolean
}

export function ProductMobileStickyBar({
  product,
  selectedVariant,
  onAddToCart,
  inStock,
  addSuccess = false,
}: ProductMobileStickyBarProps) {
  const { t } = useTranslation()
  const price = getProductPrice(product, selectedVariant)
  const needsVariantSelection = product.hasVariants && product.variants && product.variants.length > 0 && !selectedVariant

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-tagadod-dark-gray border-t border-gray-100 dark:border-white/10 px-4 py-3 safe-area-bottom">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-lg font-bold text-primary">
            {formatPrice(price)}
          </span>
          {!inStock && (
            <span className="block text-xs text-tagadod-red">
              {t('productDetails.stock.outOfStock')}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!inStock || needsVariantSelection}
          className={`flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
            !inStock || needsVariantSelection
              ? 'bg-gray-200 dark:bg-white/10 text-tagadod-gray cursor-not-allowed'
              : addSuccess
                ? 'bg-green-500 text-white'
                : 'text-white'
          }`}
          style={
            !(!inStock || needsVariantSelection) && !addSuccess
              ? { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }
              : {}
          }
        >
          {addSuccess ? (
            <>
              <Check size={18} />
              <span>{t('product.addedToCart', 'Added!')}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>{t('productDetails.actions.addToCart')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
