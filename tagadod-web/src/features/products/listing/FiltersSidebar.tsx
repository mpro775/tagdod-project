import { useTranslation } from 'react-i18next'
import { PriceFilter } from './PriceFilter'
import { StockFilter } from './StockFilter'
import { CategoryFilter } from './CategoryFilter'
import { BrandFilter } from './BrandFilter'
import type { ListingState } from './productListing.types'
import type { Category } from '../../../types/category'

interface FiltersSidebarProps {
  state: ListingState
  onFilterChange: (filters: Partial<ListingState['filters']>) => void
  onClearFilters: () => void
  categories?: Category[]
  brands?: string[]
}

export function FiltersSidebar({
  state,
  onFilterChange,
  onClearFilters,
  categories,
  brands,
}: FiltersSidebarProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-tagadod-dark-gray rounded-2xl border border-gray-100 dark:border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('productListing.filters.title')}
        </h3>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {t('productListing.filters.clear')}
        </button>
      </div>

      <div className="space-y-0">
        <PriceFilter
          minPrice={state.filters.minPrice}
          maxPrice={state.filters.maxPrice}
          onChange={(min, max) => onFilterChange({ minPrice: min, maxPrice: max })}
        />
        <StockFilter
          inStock={state.filters.inStock}
          onChange={(val) => onFilterChange({ inStock: val })}
        />
        {categories && categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            activeCategoryId={state.filters.categoryId}
            onSelectCategory={(id) => onFilterChange({ categoryId: id })}
          />
        )}
        {brands && brands.length > 0 && (
          <BrandFilter
            brands={brands}
            activeBrand={state.filters.brand}
            onSelectBrand={(b) => onFilterChange({ brand: b })}
          />
        )}
      </div>
    </div>
  )
}
