import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../../utils'
import { FilterGroup } from './FilterGroup'
import { PriceFilter } from './PriceFilter'
import { StockFilter } from './StockFilter'
import type { ListingState } from './productListing.types'
import type { Category } from '../../../types/category'

interface MobileFiltersDrawerProps {
  isOpen: boolean
  onClose: () => void
  state: ListingState
  onApply: (state: ListingState) => void
  onClear: () => void
  categories?: Category[]
  brands?: string[]
}

export function MobileFiltersDrawer({
  isOpen,
  onClose,
  state,
  onApply,
  onClear,
  categories,
  brands,
}: MobileFiltersDrawerProps) {
  const { t } = useTranslation()

  const [draft, setDraft] = useState<ListingState>(state)

  const handleApplyFilters = useCallback(() => {
    onApply(draft)
    onClose()
  }, [draft, onApply, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer panel */}
      <div className={cn(
        'absolute inset-y-0 start-0 w-full max-w-sm bg-white dark:bg-tagadod-dark-gray shadow-xl',
        'flex flex-col'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-tagadod-titles dark:text-tagadod-dark-titles" />
            <h2 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('productListing.filters.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <PriceFilter
            minPrice={draft.filters.minPrice}
            maxPrice={draft.filters.maxPrice}
            onChange={(min, max) =>
              setDraft((prev) => ({
                ...prev,
                filters: { ...prev.filters, minPrice: min, maxPrice: max },
                page: 1,
              }))
            }
          />
          <StockFilter
            inStock={draft.filters.inStock}
            onChange={(val) =>
              setDraft((prev) => ({
                ...prev,
                filters: { ...prev.filters, inStock: val },
                page: 1,
              }))
            }
          />

          {/* Categories - only if provided */}
          {categories && categories.length > 0 && (
            <FilterGroup title={t('productListing.filters.categories')}>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        filters: { ...prev.filters, categoryId: cat.id },
                        page: 1,
                      }))
                    }
                    className="w-full text-start px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    style={{
                      color: draft.filters.categoryId === cat.id ? 'var(--color-primary, #2563eb)' : undefined,
                      backgroundColor: draft.filters.categoryId === cat.id ? 'rgba(37, 99, 235, 0.08)' : undefined,
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          {/* Brands - only if provided */}
          {brands && brands.length > 0 && (
            <FilterGroup title={t('productListing.filters.brand')}>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        filters: { ...prev.filters, brand },
                        page: 1,
                      }))
                    }
                    className="w-full text-start px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    style={{
                      color: draft.filters.brand === brand ? 'var(--color-primary, #2563eb)' : undefined,
                      backgroundColor: draft.filters.brand === brand ? 'rgba(37, 99, 235, 0.08)' : undefined,
                    }}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-white/5">
          <button
            type="button"
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('productListing.filters.apply')}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft((prev) => ({
                ...prev,
                filters: {},
                page: 1,
              }))
              onClear()
              onClose()
            }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-tagadod-gray hover:text-tagadod-titles transition-colors"
          >
            {t('productListing.filters.clear')}
          </button>
        </div>
      </div>
    </div>
  )
}
