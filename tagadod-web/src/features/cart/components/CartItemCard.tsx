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
  getCartItemTotal,
  isCartItemAvailable,
} from './cart.helpers'

type CartItemCardProps = {
  item: CartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  isUpdating?: boolean
}

export function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartItemCardProps) {
  const { t } = useTranslation()
  const image = getCartItemImage(item)
  const name = getCartItemProductName(item)
  const href = getCartItemProductHref(item)
  const total = getCartItemTotal(item)
  const available = isCartItemAvailable(item)

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm border border-gray-100 dark:border-white/5">
      <Link
        to={href}
        className="w-20 h-20 rounded-lg bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden flex-shrink-0"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tagadod-gray">
            <ShoppingCart size={20} />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={href}
            className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-2"
          >
            {name}
          </Link>
          <button
            onClick={() => onRemove(item.id)}
            aria-label={t('cart.actions.remove', 'حذف')}
            className="p-1.5 rounded-lg hover:bg-tagadod-red/10 transition-colors flex-shrink-0"
          >
            <Trash2 size={14} className="text-tagadod-red" />
          </button>
        </div>

        <CartItemMeta item={item} compact />

        {!available && (
          <p className="text-xs text-tagadod-red mt-0.5 font-medium">
            {t('cart.stock.outOfStock', 'غير متوفر')}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <CartQuantityControl
            quantity={item.quantity}
            stock={item.variantId && item.product?.variants
              ? item.product.variants.find((v: { id: string }) => v.id === item.variantId)?.quantity
              : item.product?.quantity
            }
            onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
            onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
            isUpdating={isUpdating}
            size="sm"
          />

          <p className="text-sm font-bold text-primary">
            {formatPrice(total)}
          </p>
        </div>
      </div>
    </div>
  )
}
