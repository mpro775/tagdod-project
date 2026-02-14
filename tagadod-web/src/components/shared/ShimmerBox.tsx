interface ShimmerBoxProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: string
}

export function ShimmerBox({ className = '', width, height, rounded = 'rounded-lg' }: ShimmerBoxProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-white/10 ${rounded} ${className}`}
      style={{ width, height }}
    />
  )
}

export function ProductCardShimmer() {
  return (
    <div className="rounded-xl overflow-hidden">
      <ShimmerBox className="aspect-square w-full" rounded="rounded-t-xl" />
      <div className="p-3 space-y-2">
        <ShimmerBox height={14} className="w-3/4" />
        <ShimmerBox height={14} className="w-1/2" />
      </div>
    </div>
  )
}

export function OrderCardShimmer() {
  return (
    <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
      <div className="flex items-start gap-3 mb-3">
        <ShimmerBox width={40} height={40} rounded="rounded-lg" />
        <div className="flex-1 space-y-2">
          <ShimmerBox height={14} className="w-2/3" />
          <ShimmerBox height={10} className="w-1/3" />
        </div>
        <ShimmerBox width={60} height={24} rounded="rounded-full" />
      </div>
      <ShimmerBox height={12} className="w-1/2" />
    </div>
  )
}

export function ListShimmer({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardShimmer key={i} />
      ))}
    </div>
  )
}
