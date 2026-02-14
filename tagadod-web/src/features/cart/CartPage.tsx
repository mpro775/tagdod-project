import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { GlobalButton, EmptyState } from '../../components/shared'
import * as cartService from '../../services/cartService'
import { formatPrice } from '../../stores/currencyStore'
import { useCartStore } from '../../stores/cartStore'
import { gradients } from '../../theme'
import type { CartItem } from '../../types/cart'

export function CartPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const rehydrate = useCartStore((s) => s.rehydrate)

  const [syncLoading, setSyncLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    rehydrate()
  }, [rehydrate])

  const subtotal = getSubtotal()
  const isEmpty = items.length === 0

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta
    if (newQty <= 0) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, newQty)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    setSyncError(null)
    setSyncLoading(true)
    try {
      await cartService.syncCart()
      navigate('/payment')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        navigate('/login', { state: { from: '/CartPage', requireLogin: true } })
        return
      }
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSyncError(msg || t('cart.syncError', 'فشل مزامنة السلة. حاول مرة أخرى.'))
    } finally {
      setSyncLoading(false)
    }
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <EmptyState
          icon={<ShoppingCart size={56} strokeWidth={1.5} />}
          title={t('cart.empty', 'سلة التسوق فارغة')}
          subtitle={t('cart.emptyHint', 'أضف منتجات إلى السلة للبدء بالتسوق')}
          action={
            <Link
              to="/home"
              className="px-6 py-3 text-white font-semibold rounded-xl mt-2"
              style={{ background: gradients.linerGreen }}
            >
              {t('cart.shopNow', 'تسوق الآن')}
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-4 pb-36">
      <h2 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-4">
        {t('cart.title', 'السلة')}
      </h2>

      {syncError && (
        <div className="mb-4 p-3 rounded-xl bg-tagadod-red/10 text-tagadod-red text-sm">
          {syncError}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm"
          >
            {/* Product image */}
            <div className="w-20 h-20 rounded-lg bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden flex-shrink-0">
              {item.product?.images?.[0] ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product?.name ?? ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-tagadod-gray text-xs">
                  <ShoppingCart size={24} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-2">
                {item.product?.name ?? item.productId}
              </p>
              {item.variantName && (
                <p className="text-xs text-tagadod-gray mt-0.5">
                  {item.variantName}
                </p>
              )}
              <p className="text-sm font-semibold text-primary mt-1">
                {formatPrice(item.price ?? 0)}
              </p>

              {/* Quantity controls */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item, -1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item, 1)}
                    className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-lg hover:bg-tagadod-red/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} className="text-tagadod-red" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-20 left-4 right-4 z-10 flex items-center justify-between p-4 bg-white dark:bg-tagadod-dark-gray rounded-xl shadow-lg border border-gray-100 dark:border-white/10">
        <div>
          <p className="text-xs text-tagadod-gray">
            {t('cart.subtotal', 'المجموع الفرعي')}
          </p>
          <p className="text-lg font-bold text-primary">
            {formatPrice(subtotal ?? 0)}
          </p>
        </div>
        <GlobalButton
          fullWidth={false}
          size="md"
          onClick={handleCheckout}
          loading={syncLoading}
          className="px-6"
        >
          {t('cart.checkout', 'متابعة الشراء')}
        </GlobalButton>
      </div>
    </div>
  )
}
