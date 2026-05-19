import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, ShoppingCart } from 'lucide-react'
import { formatPrice } from '../../../stores/currencyStore'
import { CartQuantityControl } from './CartQuantityControl'
import { CartItemMeta } from './CartItemMeta'
import type { CartItem } from '../../../types/cart'
import {
  getCartItemImage,
  getCartItemProductName,
  getCartItemProductHref,
  getCartItemUnitPrice,
  getCartItemTotal,
  isCartItemAvailable,
} from './cart.helpers'

type CartItemRowProps = {
  item: CartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  isUpdating?: boolean
}

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartItemRowProps) {
  const { t } = useTranslation()
  const image = getCartItemImage(item)
  const name = getCartItemProductName(item)
  const href = getCartItemProductHref(item)
  const unitPrice = getCartItemUnitPrice(item)
  const total = getCartItemTotal(item)
  const available = isCartItemAvailable(item)

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm border border-gray-100 dark:border-white/5">
      <Link
        to={href}
        className="w-24 h-24 rounded-lg bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden flex-shrink-0"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tagadod-gray">
            <ShoppingCart size={24} />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              to={href}
              className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles hover:text-primary transition-colors line-clamp-2"
            >
              {name}
            </Link>
            <CartItemMeta item={item} />
            {!available && (
              <p className="text-xs text-tagadod-red mt-1 font-medium">
                {t('cart.stock.outOfStock', 'غير متوفر')}
              </p>
            )}
          </div>

          <button
            onClick={() => onRemove(item.id)}
            aria-label={t('cart.actions.remove', 'حذف')}
            className="p-2 rounded-lg hover:bg-tagadod-red/10 transition-colors flex-shrink-0"
          >
            <Trash2 size={16} className="text-tagadod-red" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <CartQuantityControl
            quantity={item.quantity}
            stock={item.variantId && item.product?.variants
              ? item.product.variants.find((v: { id: string }) => v.id === item.variantId)?.quantity
              : item.product?.quantity
            }
            onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
            onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
            isUpdating={isUpdating}
          />

          <div className="text-left">
            <p className="text-xs text-tagadod-gray">
              {formatPrice(unitPrice)} {t('cart.labels.each', 'للواحد')}
            </p>
            <p className="text-base font-bold text-primary">
              {formatPrice(total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
