import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Container } from '../../../components/layout/Container'
import { ProductListingHeader } from './ProductListingHeader'
import { ProductListingToolbar } from './ProductListingToolbar'
import { FiltersSidebar } from './FiltersSidebar'
import { MobileFiltersDrawer } from './MobileFiltersDrawer'
import { ActiveFiltersChips } from './ActiveFiltersChips'
import { ProductResultsGrid } from './ProductResultsGrid'
import { ProductResultsList } from './ProductResultsList'
import { ProductListingEmptyState } from './ProductListingEmptyState'
import { ProductListingErrorState } from './ProductListingErrorState'
import {
  parseQueryParams,
  buildQueryParams,
  getActiveFilterChips,
  getActiveFiltersCount,
  createInitialListingState,
} from './productListing.helpers'
import type { ProductListingPageProps, ListingState, SortOption } from './productListing.types'
import type { Category } from '../../../types/category'

export function ProductListingPage({
  title,
  subtitle,
  breadcrumbItems,
  initialFilters,
  categoryData,
  searchQuery,
  products,
  meta,
  isLoading,
  isError,
  onRetry,
  categories,
  brands,
}: Omit<ProductListingPageProps, 'pageType'> & {
  products: import('../../../types/product').Product[]
  meta?: { total: number; page: number; limit: number; totalPages: number }
  isLoading: boolean
  isError: boolean
  error?: Error | null
  onRetry?: () => void
  categories?: Category[]
  brands?: string[]
}) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [state, setState] = useState<ListingState>(() => {
    const fromUrl = parseQueryParams(searchParams.toString())
    return createInitialListingState({
      ...fromUrl,
      filters: {
        ...initialFilters,
        ...fromUrl.filters,
        q: searchQuery ?? fromUrl.filters.q,
      },
    })
  })

  // Sync URL changes back to state
  useEffect(() => {
    const fromUrl = parseQueryParams(searchParams.toString())
    setState((prev) => ({
      ...prev,
      sort: fromUrl.sort,
      viewMode: fromUrl.viewMode,
      page: fromUrl.page,
      limit: fromUrl.limit,
      filters: {
        ...initialFilters,
        ...fromUrl.filters,
        q: searchQuery ?? fromUrl.filters.q,
      },
    }))
  }, [searchParams, searchQuery, initialFilters])

  // Update URL when state changes
  const updateUrl = useCallback(
    (next: ListingState) => {
      const qs = buildQueryParams(next)
      setSearchParams(qs, { replace: true })
    },
    [setSearchParams]
  )

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      setState((prev) => {
        const next = { ...prev, sort, page: 1 }
        updateUrl(next)
        return next
      })
    },
    [updateUrl]
  )

  const handleViewModeChange = useCallback(
    (viewMode: 'grid' | 'list') => {
      setState((prev) => {
        const next = { ...prev, viewMode }
        updateUrl(next)
        return next
      })
    },
    [updateUrl]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      setState((prev) => {
        const next = { ...prev, page }
        updateUrl(next)
        return next
      })
    },
    [updateUrl]
  )

  const handleFilterChange = useCallback(
    (filters: Partial<ListingState['filters']>) => {
      setState((prev) => {
        const next = {
          ...prev,
          filters: { ...prev.filters, ...filters },
          page: 1,
        }
        updateUrl(next)
        return next
      })
    },
    [updateUrl]
  )

  const handleClearFilters = useCallback(() => {
    setState((prev) => {
      const next: ListingState = {
        ...prev,
        filters: { q: searchQuery },
        page: 1,
      }
      updateUrl(next)
      return next
    })
  }, [updateUrl, searchQuery])

  const handleRemoveChip = useCallback(
    (key: string) => {
      setState((prev) => {
        const nextFilters = { ...prev.filters }
        if (key === 'price') {
          delete nextFilters.minPrice
          delete nextFilters.maxPrice
        } else {
          delete (nextFilters as Record<string, unknown>)[key]
        }
        const next = { ...prev, filters: nextFilters, page: 1 }
        updateUrl(next)
        return next
      })
    },
    [updateUrl]
  )

  const handleApplyMobileFilters = useCallback(
    (draft: ListingState) => {
      setState((prev) => {
        const next = { ...prev, filters: draft.filters, page: 1 }
        updateUrl(next)
        return next
      })
    },
    [updateUrl]
  )

  const activeChips = useMemo(() => getActiveFilterChips(state, t), [state, t])
  const activeCount = useMemo(() => getActiveFiltersCount(state), [state])

  const total = meta?.total ?? 0
  const hasProducts = products.length > 0
  const showPagination = meta && meta.totalPages > 1

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      <ProductListingHeader
        title={title}
        subtitle={subtitle}
        breadcrumbItems={breadcrumbItems}
        total={total}
        categoryImage={categoryData?.image}
        searchQuery={searchQuery}
      />

      <ProductListingToolbar
        total={total}
        sort={state.sort}
        onSortChange={handleSortChange}
        viewMode={state.viewMode}
        onViewModeChange={handleViewModeChange}
        onOpenFilters={() => setMobileFiltersOpen(true)}
        activeFiltersCount={activeCount}
        onClearFilters={activeCount > 0 ? handleClearFilters : undefined}
      />

      <Container>
        <div className="flex gap-6 py-4">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FiltersSidebar
              state={state}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              categories={categories}
              brands={brands}
            />
          </aside>

          {/* Results area */}
          <div className="flex-1 min-w-0">
            <ActiveFiltersChips
              chips={activeChips}
              onRemove={handleRemoveChip}
              onClearAll={handleClearFilters}
            />

            {isError ? (
              <ProductListingErrorState onRetry={onRetry} />
            ) : isLoading && !hasProducts ? (
              state.viewMode === 'grid' ? (
                <ProductResultsGrid products={[]} isLoading />
              ) : (
                <ProductResultsList products={[]} isLoading />
              )
            ) : !hasProducts ? (
              <ProductListingEmptyState
                onClearFilters={activeCount > 0 ? handleClearFilters : undefined}
              />
            ) : (
              <>
                {state.viewMode === 'grid' ? (
                  <ProductResultsGrid products={products} />
                ) : (
                  <ProductResultsList products={products} />
                )}

                {/* Pagination */}
                {showPagination && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      type="button"
                      disabled={meta.page <= 1}
                      onClick={() => handlePageChange(meta.page - 1)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t('productListing.pagination.previous')}
                    </button>
                    <span className="text-sm text-tagadod-gray px-2">
                      {t('productListing.pagination.page', { page: meta.page })}
                      {' / '}
                      {meta.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => handlePageChange(meta.page + 1)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t('productListing.pagination.next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile filters drawer */}
      <MobileFiltersDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        state={state}
        onApply={handleApplyMobileFilters}
        onClear={handleClearFilters}
        categories={categories}
        brands={brands}
      />
    </div>
  )
}
