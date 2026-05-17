import { ProductCard } from '../../../components/shared'
import type { Product } from '../../../types/product'

interface RelatedProductsSectionProps {
  products: Product[]
  currentProductId: string
  title: string
}

export function RelatedProductsSection({
  products,
  currentProductId,
  title,
}: RelatedProductsSectionProps) {
  const filtered = products.filter((p) => p.id !== currentProductId)
  if (filtered.length === 0) return null

  return (
    <section className="mt-10 mb-6">
      <h2 className="text-lg font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {filtered.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  )
}
