import type { CartItem } from '../../../types/cart'
import { CartItemRow } from './CartItemRow'
import { CartItemCard } from './CartItemCard'

type CartItemsListProps = {
  items: CartItem[]
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  isUpdating?: boolean
}

export function CartItemsList({
  items,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartItemsListProps) {
  return (
    <>
      <div className="hidden md:flex flex-col gap-3">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            isUpdating={isUpdating}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </>
  )
}
