import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'
import type { CartItem } from '../../../types/cart'
import { getCartItemVariantLabel, getCartItemSku } from './cart.helpers'

type CartItemMetaProps = {
  item: CartItem
  compact?: boolean
  className?: string
}

export function CartItemMeta({ item, compact, className }: CartItemMetaProps) {
  const { t } = useTranslation()
  const variantLabel = getCartItemVariantLabel(item)
  const sku = getCartItemSku(item)

  if (!variantLabel && !sku) return null

  return (
    <div className={cn('flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5', compact ? 'text-xs' : 'text-xs', className)}>
      {variantLabel && (
        <span className="text-tagadod-gray">
          <span className="font-medium">{t('cart.labels.variant', 'الخيار')}:</span>{' '}
          {variantLabel}
        </span>
      )}
      {sku && (
        <span className="text-tagadod-gray">
          <span className="font-medium">{t('cart.labels.sku', 'رمز المنتج')}:</span>{' '}
          {sku}
        </span>
      )}
    </div>
  )
}
