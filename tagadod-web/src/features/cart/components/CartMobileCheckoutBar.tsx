import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import * as cartService from '../../../services/cartService'
import { formatPrice } from '../../../stores/currencyStore'
import type { CartItem } from '../../../types/cart'
import { calculateCartTotals } from './cart.helpers'

type CartMobileCheckoutBarProps = {
  items: CartItem[]
  isUpdating?: boolean
}

export function CartMobileCheckoutBar({ items, isUpdating }: CartMobileCheckoutBarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [syncLoading, setSyncLoading] = useState(false)

  const totals = calculateCartTotals(items)

  const allAvailable = items.every((item) => {
    const stock = item.variantId && item.product?.variants
      ? item.product.variants.find((v: { id: string }) => v.id === item.variantId)?.quantity
      : item.product?.quantity
    if (stock !== undefined && stock <= 0) return false
    if (item.product?.inStock === false) return false
    return true
  })

  const canCheckout = items.length > 0 && allAvailable && !isUpdating

  const handleCheckout = async () => {
    if (!canCheckout) return
    setSyncLoading(true)
    try {
      await cartService.syncCart()
      navigate('/payment')
    } catch {
      setSyncLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden">
      <div className="bg-white dark:bg-tagadod-dark-gray border-t border-gray-100 dark:border-white/10 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-tagadod-gray">{t('cart.labels.grandTotal', 'الإجمالي')}</p>
            <p className="text-lg font-bold text-primary">{formatPrice(totals.total)}</p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!canCheckout || syncLoading}
            className="flex-1 max-w-48 py-3 px-4 text-white font-semibold rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #159647 0%, #8BC543 100%)',
            }}
          >
            {syncLoading ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto" />
            ) : (
              t('cart.actions.checkout', 'إتمام الطلب')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
