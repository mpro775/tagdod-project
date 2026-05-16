import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react'
import { cn } from '../../../utils'
import type { ViewMode, SortOption } from './productListing.types'

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: 'relevance', labelKey: 'productListing.sort.relevance' },
  { value: 'newest', labelKey: 'productListing.sort.newest' },
  { value: 'price_asc', labelKey: 'productListing.sort.priceAsc' },
  { value: 'price_desc', labelKey: 'productListing.sort.priceDesc' },
  { value: 'popular', labelKey: 'productListing.sort.popular' },
  { value: 'best_selling', labelKey: 'productListing.sort.bestSelling' },
]

interface ProductListingToolbarProps {
  total?: number
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onOpenFilters: () => void
  activeFiltersCount?: number
  onClearFilters?: () => void
}

export function ProductListingToolbar({
  total,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  activeFiltersCount = 0,
  onClearFilters,
}: ProductListingToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-tagadod-dark-gray border-b border-gray-100 dark:border-white/5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Results count + clear filters */}
          <div className="flex items-center gap-2 min-w-0">
            {typeof total === 'number' && (
              <span className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles font-medium shrink-0">
                {t('productListing.toolbar.resultsCount', { count: total })}
              </span>
            )}
            {activeFiltersCount > 0 && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                <X size={14} />
                {t('productListing.toolbar.clearFilters')}
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort */}
            <label className="flex items-center gap-2">
              <span className="hidden md:inline text-sm text-tagadod-gray">
                {t('productListing.toolbar.sortBy')}:
              </span>
              <select
                aria-label={t('productListing.toolbar.sortBy')}
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className={cn(
                  'text-sm rounded-lg border border-gray-200 dark:border-white/10',
                  'bg-white dark:bg-tagadod-dark-bg text-tagadod-titles dark:text-tagadod-dark-titles',
                  'px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30',
                  'min-w-[140px]'
                )}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </label>

            {/* View mode toggle - desktop */}
            <div className="hidden md:flex items-center border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
              <button
                type="button"
                aria-label={t('productListing.toolbar.viewGrid')}
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-tagadod-dark-bg text-tagadod-gray hover:bg-gray-50 dark:hover:bg-white/5'
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                aria-label={t('productListing.toolbar.viewList')}
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-tagadod-dark-bg text-tagadod-gray hover:bg-gray-50 dark:hover:bg-white/5'
                )}
              >
                <List size={18} />
              </button>
            </div>

            {/* Mobile filter button */}
            <button
              type="button"
              onClick={onOpenFilters}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-tagadod-titles dark:text-tagadod-dark-titles"
            >
              <SlidersHorizontal size={16} />
              {t('productListing.toolbar.filters')}
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-medium px-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
