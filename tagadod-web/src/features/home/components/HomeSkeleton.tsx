import { ShimmerBox } from '../../../components/shared'
import { ProductCardSkeleton } from '../../../components/ecommerce/product-card'

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-white dark:bg-tagadod-dark-gray shadow-sm border border-gray-100 dark:border-white/5"
        >
          <div className="aspect-[4/3] w-full">
            <ShimmerBox className="w-full h-full" />
          </div>
          <div className="p-3 space-y-2">
            <ShimmerBox height={14} className="w-2/3 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CategoryStripSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[140px] h-[120px] rounded-2xl overflow-hidden"
        >
          <ShimmerBox className="w-full h-full" />
        </div>
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="space-y-4">
        <ShimmerBox height={16} className="w-32" rounded="rounded-full" />
        <ShimmerBox height={36} className="w-3/4" />
        <ShimmerBox height={20} className="w-full" />
        <ShimmerBox height={20} className="w-5/6" />
        <div className="flex gap-3 pt-2">
          <ShimmerBox height={44} className="w-32" rounded="rounded-xl" />
          <ShimmerBox height={44} className="w-32" rounded="rounded-xl" />
        </div>
      </div>
      <ShimmerBox className="aspect-[4/3] lg:aspect-square w-full max-w-lg mx-auto" rounded="rounded-3xl" />
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <div className="space-y-10 md:space-y-16">
      <HeroSkeleton />
      <div>
        <div className="mb-4">
          <ShimmerBox height={28} className="w-48" />
        </div>
        <CategoryGridSkeleton />
      </div>
      <div>
        <div className="mb-4">
          <ShimmerBox height={28} className="w-48" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  )
}
