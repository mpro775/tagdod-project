import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'
import { Container } from '../../components/layout/Container'
import { useCartStore } from '../../stores/cartStore'
import { SEO } from '../../components/seo'
import { trackViewCart, trackRemoveFromCart } from '../../lib/analytics'
import {
  CartLayout,
  CartItemsList,
  OrderSummary,
  CartEmptyState,
  CartLoadingState,
  CartErrorState,
  CartMobileCheckoutBar,
} from './components'

export function CartPage() {
  const { t } = useTranslation()
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const rehydrate = useCartStore((s) => s.rehydrate)

  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    rehydrate()
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [rehydrate])

  const isEmpty = items.length === 0

  const breadcrumbs = [
    { label: t('cart.breadcrumb.home', 'الرئيسية'), href: '/home' },
    { label: t('cart.breadcrumb.cart', 'السلة') },
  ]

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setIsUpdating(true)
    try {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        updateQuantity(itemId, quantity)
      }
    } catch {
      setError(t('cart.syncError', 'فشل مزامنة السلة. حاول مرة أخرى.'))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (item) {
      trackRemoveFromCart({
        id: item.productId,
        name: item.product?.name || item.id,
      })
    }
    removeItem(itemId)
  }

  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  useEffect(() => {
    if (!loading && !error && !isEmpty) {
      trackViewCart({ itemCount: itemsCount, total: totalPrice })
    }
  }, [loading, error, isEmpty, itemsCount, totalPrice])

  return (
    <>
      <SEO title={t('cart.title', 'السلة')} noIndex />
      {loading ? (
        <Container className="py-6">
          <Breadcrumbs items={breadcrumbs} />
          <CartLoadingState />
        </Container>
      ) : error ? (
        <Container className="py-6">
          <Breadcrumbs items={breadcrumbs} />
          <CartErrorState
            message={error}
            onRetry={() => {
              setError(null)
              rehydrate()
            }}
          />
        </Container>
      ) : isEmpty ? (
        <Container className="py-6">
          <Breadcrumbs items={breadcrumbs} />
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('cart.title', 'سلة التسوق')}
            </h1>
          </div>
          <CartEmptyState />
        </Container>
      ) : (
        <Container className="py-6 pb-24 md:pb-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('cart.title', 'سلة التسوق')}
        </h1>
        <p className="text-sm text-tagadod-gray mt-1">
          {t('cart.itemsCount', '{{count}} عنصر', { count: itemsCount })}
        </p>
      </div>

      <CartLayout
        itemsArea={
          <CartItemsList
            items={items}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            isUpdating={isUpdating}
          />
        }
        summaryArea={
          <OrderSummary items={items} isUpdating={isUpdating} />
        }
      />

      <CartMobileCheckoutBar items={items} isUpdating={isUpdating} />
        </Container>
      )}
    </>
  )
}
