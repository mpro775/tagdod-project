import type { Product } from '../../types/product'
import { ProductCard as NewProductCard } from '../ecommerce/product-card/ProductCard'
import { ProductCardCompact } from '../ecommerce/product-card/ProductCardCompact'

interface LegacyProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  compact?: boolean
}

/** Backward-compatible wrapper that routes compact cards to ProductCardCompact */
export function ProductCard({ compact, ...props }: LegacyProductCardProps) {
  if (compact) {
    return <ProductCardCompact product={props.product} />
  }
  return <NewProductCard {...props} />
}

// Re-export new system from shared for convenience
export { ProductCardCompact } from '../ecommerce/product-card/ProductCardCompact'
export { ProductCardHorizontal } from '../ecommerce/product-card/ProductCardHorizontal'
export { ProductCardSkeleton } from '../ecommerce/product-card/ProductCardSkeleton'
