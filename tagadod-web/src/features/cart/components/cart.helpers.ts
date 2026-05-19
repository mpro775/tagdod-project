import type { CartItem } from '../../../types/cart'
import type { CartDisplayItem, CartTotals } from './cart.types'
import { formatPrice, type CurrencyCode } from '../../../stores/currencyStore'

export function getCartItemId(item: CartItem): string {
  return item.id
}

export function getCartItemProductId(item: CartItem): string {
  return item.productId
}

export function getCartItemProductName(item: CartItem): string {
  return item.product?.name ?? item.productId
}

export function getCartItemProductHref(item: CartItem): string {
  return `/products/${item.productId}`
}

export function getCartItemImage(item: CartItem): string | undefined {
  return item.product?.images?.[0]
}

export function getCartItemVariantLabel(item: CartItem): string | undefined {
  return item.variantName
}

export function getCartItemSku(item: CartItem): string | undefined {
  return item.product?.variants?.find(
    (v: { id: string }) => v.id === item.variantId,
  )?.sku
}

export function getCartItemUnitPrice(item: CartItem): number {
  return item.price ?? 0
}

export function getCartItemComparePrice(item: CartItem): number | undefined {
  if (item.variantId && item.product?.variants) {
    const variant = item.product.variants.find((v: { id: string }) => v.id === item.variantId)
    return variant?.originalPrice
  }
  return item.product?.originalPrice
}

export function getCartItemQuantity(item: CartItem): number {
  return item.quantity
}

export function getCartItemTotal(item: CartItem): number {
  return (item.price ?? 0) * item.quantity
}

export function getCartItemCurrency(item: CartItem): string {
  return item.product?.currency ?? ''
}

export function getCartItemStock(item: CartItem): number | undefined {
  if (item.variantId && item.product?.variants) {
    const variant = item.product.variants.find((v: { id: string }) => v.id === item.variantId)
    return variant?.quantity
  }
  return item.product?.quantity
}

export function isCartItemAvailable(item: CartItem): boolean {
  const stock = getCartItemStock(item)
  if (stock !== undefined && stock <= 0) return false
  if (item.product?.inStock === false) return false
  if (item.variantId && item.product?.variants) {
    const variant = item.product.variants.find((v: { id: string; inStock?: boolean }) => v.id === item.variantId)
    if (variant?.inStock === false) return false
  }
  return true
}

export function canIncreaseQuantity(item: CartItem): boolean {
  const stock = getCartItemStock(item)
  if (stock !== undefined && item.quantity >= stock) return false
  return true
}

export function toCartDisplayItem(item: CartItem): CartDisplayItem {
  return {
    id: getCartItemId(item),
    productId: getCartItemProductId(item),
    variantId: item.variantId,
    quantity: getCartItemQuantity(item),
    price: getCartItemUnitPrice(item),
    name: getCartItemProductName(item),
    image: getCartItemImage(item),
    variantLabel: getCartItemVariantLabel(item),
    sku: getCartItemSku(item),
    inStock: item.product?.inStock,
    stock: getCartItemStock(item),
    currency: getCartItemCurrency(item),
    productHref: getCartItemProductHref(item),
  }
}

export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + getCartItemTotal(i), 0)
}

export function calculateCartDiscount(items: CartItem[]): number {
  return items.reduce((sum, i) => {
    const compare = getCartItemComparePrice(i)
    if (compare && compare > i.price) {
      return sum + (compare - i.price) * i.quantity
    }
    return sum
  }, 0)
}

export function calculateCartTotals(
  items: CartItem[],
  extras?: { shipping?: number; tax?: number },
): CartTotals {
  const subtotal = calculateCartSubtotal(items)
  const discount = calculateCartDiscount(items)
  const shipping = extras?.shipping ?? 0
  const tax = extras?.tax ?? 0
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: subtotal - discount + shipping + tax,
    itemsCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

export function formatCartPrice(amount: number, currency?: string): string {
  if (currency) {
    return formatPrice(amount, currency as CurrencyCode)
  }
  return formatPrice(amount)
}
