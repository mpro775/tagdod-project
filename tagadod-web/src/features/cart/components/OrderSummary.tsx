import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Shield } from 'lucide-react'
import { GlobalButton } from '../../../components/shared'
import { formatPrice } from '../../../stores/currencyStore'
import * as cartService from '../../../services/cartService'
import { trackBeginCheckout } from '../../../lib/analytics'
import type { CartItem } from '../../../types/cart'
import { calculateCartTotals } from './cart.helpers'
import { CartCouponBox } from './CartCouponBox'

type OrderSummaryProps = {
  items: CartItem[]
  isUpdating?: boolean
}

export function OrderSummary({ items, isUpdating }: OrderSummaryProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

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
    trackBeginCheckout({ itemCount: items.length, total: totals.total })
    setSyncError(null)
    setSyncLoading(true)
    try {
      await cartService.syncCart()
      navigate('/payment')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        navigate('/login', { state: { from: '/cart', requireLogin: true } })
        return
      }
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSyncError(msg || t('cart.syncError', 'فشل مزامنة السلة. حاول مرة أخرى.'))
    } finally {
      setSyncLoading(false)
    }
  }

  return (
    <div className="sticky top-20">
      <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm border border-gray-100 dark:border-white/5 p-5">
        <h3 className="text-base font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-4">
          {t('cart.summary.title', 'ملخص الطلب')}
        </h3>

        {syncError && (
          <div className="mb-3 p-3 rounded-lg bg-tagadod-red/10 text-tagadod-red text-sm">
            {syncError}
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-tagadod-gray">{t('cart.labels.subtotal', 'المجموع الفرعي')}</span>
            <span className="font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {formatPrice(totals.subtotal)}
            </span>
          </div>

          {totals.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-tagadod-gray">{t('cart.labels.discount', 'الخصم')}</span>
              <span className="font-semibold text-green-600">
                -{formatPrice(totals.discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-tagadod-gray">{t('cart.labels.shipping', 'الشحن')}</span>
            <span className="text-tagadod-gray text-xs">
              {t('cart.shipping.calculatedAtCheckout', 'يتم احتساب الشحن عند تأكيد الطلب.')}
            </span>
          </div>

          <div className="border-t border-gray-100 dark:border-white/10 pt-3">
            <div className="flex justify-between">
              <span className="font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
                {t('cart.labels.grandTotal', 'الإجمالي النهائي')}
              </span>
              <span className="font-bold text-lg text-primary">
                {formatPrice(totals.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <CartCouponBox />
        </div>

        <div className="mt-5">
          <GlobalButton
            fullWidth
            size="md"
            onClick={handleCheckout}
            loading={syncLoading}
            disabled={!canCheckout}
          >
            {t('cart.actions.checkout', 'إتمام الطلب')}
          </GlobalButton>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-tagadod-gray">
          <Shield size={12} />
          <span>{t('cart.summary.secureCheckout', 'إتمام آمن للطلب')}</span>
        </div>

        <p className="text-xs text-tagadod-gray mt-3 text-center">
          {t('cart.summary.note', 'قد تختلف تكلفة الشحن النهائية حسب المدينة وطريقة التوصيل.')}
        </p>
      </div>
    </div>
  )
}
