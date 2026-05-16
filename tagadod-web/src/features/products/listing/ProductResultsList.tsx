import { ProductCardHorizontal, ProductCardSkeleton } from '../../../components/shared'
import type { Product } from '../../../types/product'

interface ProductResultsListProps {
  products: Product[]
  isLoading?: boolean
  skeletonCount?: number
}

export function ProductResultsList({
  products,
  isLoading,
  skeletonCount = 6,
}: ProductResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} variant="horizontal" />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <ProductCardHorizontal key={product.id} product={product} />
      ))}
    </div>
  )
}
