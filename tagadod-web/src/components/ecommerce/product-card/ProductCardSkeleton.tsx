import { cn } from '../../../utils'

interface ProductCardSkeletonProps {
  variant?: 'grid' | 'compact' | 'horizontal'
  className?: string
}

export function ProductCardSkeleton({ variant = 'grid', className }: ProductCardSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5', className)}>
        <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5', className)}>
        <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-white/10 animate-pulse mt-2" />
        </div>
      </div>
    )
  }

  // grid (default)
  return (
    <div className={cn('rounded-2xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5 overflow-hidden', className)}>
      <div className="aspect-square bg-gray-200 dark:bg-white/10 animate-pulse" />
      <div className="p-3 md:p-4 space-y-2.5">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-16 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
