import type { Product } from '../../../types/product'

export function getProductId(product: Product): string {
  return product.id ?? ''
}

export function getProductName(product: Product): string {
  return product.name?.trim() || product.nameAr?.trim() || ''
}

export function getProductImage(product: Product): string | undefined {
  const img = product.images?.[0]
  return typeof img === 'string' && img.trim() ? img : undefined
}

export function getProductPrice(product: Product): number {
  return typeof product.price === 'number' ? product.price : 0
}

export function getProductComparePrice(product: Product): number | undefined {
  const op = product.originalPrice
  if (typeof op !== 'number') return undefined
  const price = getProductPrice(product)
  return op > price ? op : undefined
}

export function getProductDiscountPercent(product: Product): number | undefined {
  const price = getProductPrice(product)
  const compare = getProductComparePrice(product)
  if (!compare || compare <= 0 || price >= compare) return undefined
  return Math.round(((compare - price) / compare) * 100)
}

export function isProductOutOfStock(product: Product): boolean {
  return product.inStock === false
}

export function isProductFeatured(product: Product): boolean {
  return product.isFeatured === true
}

export function isProductNew(product: Product): boolean {
  return product.isNew === true
}

export function getProductHref(product: Product): string {
  return `/products/${getProductId(product)}`
}

export function hasProductVariants(product: Product): boolean {
  return product.hasVariants === true || (product.variants?.length ?? 0) > 0
}
