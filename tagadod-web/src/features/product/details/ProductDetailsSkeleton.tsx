import { ShimmerBox } from '../../../components/shared'

export function ProductDetailsSkeleton() {
  return (
    <div className="pb-36 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <ShimmerBox className="w-20" height={16} />
          <ShimmerBox className="w-2" height={14} />
          <ShimmerBox className="w-24" height={16} />
          <ShimmerBox className="w-2" height={14} />
          <ShimmerBox className="w-32" height={16} />
        </div>

        {/* Main area */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Gallery skeleton */}
          <div className="lg:sticky lg:top-20">
            <ShimmerBox className="w-full aspect-square" rounded="rounded-2xl" />
            <div className="flex gap-2 mt-3">
              <ShimmerBox className="w-16 h-16" rounded="rounded-lg" />
              <ShimmerBox className="w-16 h-16" rounded="rounded-lg" />
              <ShimmerBox className="w-16 h-16" rounded="rounded-lg" />
              <ShimmerBox className="w-16 h-16" rounded="rounded-lg" />
            </div>
          </div>

          {/* Purchase panel skeleton */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray p-4 md:p-5">
            <ShimmerBox className="w-3/4" height={28} />
            <div className="mt-3">
              <ShimmerBox className="w-20" height={14} />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <ShimmerBox className="w-28" height={32} />
              <ShimmerBox className="w-20" height={20} />
            </div>
            <div className="mt-4">
              <ShimmerBox className="w-full" height={16} />
            </div>
            <div className="mt-3">
              <ShimmerBox className="w-full" height={16} />
            </div>
            <div className="mt-4 flex gap-2">
              <ShimmerBox className="w-20 h-8" rounded="rounded-lg" />
              <ShimmerBox className="w-20 h-8" rounded="rounded-lg" />
              <ShimmerBox className="w-20 h-8" rounded="rounded-lg" />
            </div>
            <div className="mt-6">
              <ShimmerBox className="w-full" height={48} rounded="rounded-xl" />
            </div>
            <div className="mt-4">
              <ShimmerBox className="w-full" height={60} rounded="rounded-xl" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mt-8">
          <div className="flex gap-4 mb-4 border-b border-gray-100 dark:border-white/10">
            <ShimmerBox className="w-24" height={36} />
            <ShimmerBox className="w-24" height={36} />
            <ShimmerBox className="w-24" height={36} />
          </div>
          <ShimmerBox className="w-full" height={120} rounded="rounded-xl" />
        </div>

        {/* Related products skeleton */}
        <div className="mt-8">
          <ShimmerBox className="w-40" height={24} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <ShimmerBox className="w-full aspect-[3/4]" rounded="rounded-xl" />
            <ShimmerBox className="w-full aspect-[3/4]" rounded="rounded-xl" />
            <ShimmerBox className="w-full aspect-[3/4]" rounded="rounded-xl" />
            <ShimmerBox className="w-full aspect-[3/4]" rounded="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
