import { ProductCard, ProductCardSkeleton } from '../../../components/shared'
import type { Product } from '../../../types/product'

interface ProductResultsGridProps {
  products: Product[]
  isLoading?: boolean
  skeletonCount?: number
}

export function ProductResultsGrid({
  products,
  isLoading,
  skeletonCount = 8,
}: ProductResultsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} variant="grid" />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
