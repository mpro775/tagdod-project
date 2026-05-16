import type { ListingState, SortOption, ListingFilters } from './productListing.types'
import type { ProductFilters } from '../../../services/productService'
import type { SearchParams } from '../../../services/searchService'
import type { PaginationParams } from '../../../types/common'

export const SORT_UI_TO_API: Record<SortOption, string> = {
  relevance: 'relevance',
  newest: 'newest',
  price_asc: 'price_asc',
  price_desc: 'price_desc',
  popular: 'popular',
  best_selling: 'best_selling',
}

export function parseQueryParams(search: string): ListingState {
  const params = new URLSearchParams(search)

  const sort = (params.get('sort') as SortOption) || 'relevance'
  const validSorts: SortOption[] = ['relevance', 'newest', 'price_asc', 'price_desc', 'popular', 'best_selling']
  const safeSort = validSorts.includes(sort) ? sort : 'relevance'

  const viewMode = params.get('view') === 'list' ? 'list' : 'grid'

  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)
  const limit = Math.max(1, Math.min(100, parseInt(params.get('limit') || '12', 10) || 12))

  const filters: ListingFilters = {}

  const categoryId = params.get('categoryId')
  if (categoryId) filters.categoryId = categoryId

  const minPrice = params.get('minPrice')
  if (minPrice) {
    const v = parseFloat(minPrice)
    if (!isNaN(v) && v >= 0) filters.minPrice = v
  }

  const maxPrice = params.get('maxPrice')
  if (maxPrice) {
    const v = parseFloat(maxPrice)
    if (!isNaN(v) && v >= 0) filters.maxPrice = v
  }

  const inStock = params.get('inStock')
  if (inStock === 'true') filters.inStock = true

  const brand = params.get('brand')
  if (brand) filters.brand = brand

  const q = params.get('q')
  if (q) filters.q = q

  return { filters, sort: safeSort, viewMode, page, limit }
}

export function buildQueryParams(state: ListingState): string {
  const params = new URLSearchParams()

  if (state.sort !== 'relevance') params.set('sort', state.sort)
  if (state.viewMode !== 'grid') params.set('view', state.viewMode)
  if (state.page > 1) params.set('page', String(state.page))
  if (state.limit !== 12) params.set('limit', String(state.limit))

  const f = state.filters
  if (f.categoryId) params.set('categoryId', f.categoryId)
  if (typeof f.minPrice === 'number') params.set('minPrice', String(f.minPrice))
  if (typeof f.maxPrice === 'number') params.set('maxPrice', String(f.maxPrice))
  if (f.inStock) params.set('inStock', 'true')
  if (f.brand) params.set('brand', f.brand)
  if (f.q) params.set('q', f.q)

  return params.toString()
}

export function mapListingStateToProductFilters(state: ListingState): ProductFilters {
  const result: ProductFilters & PaginationParams = {
    page: state.page,
    limit: state.limit,
  }

  const f = state.filters
  if (f.categoryId) result.categoryId = f.categoryId
  if (typeof f.minPrice === 'number') result.minPrice = f.minPrice
  if (typeof f.maxPrice === 'number') result.maxPrice = f.maxPrice
  if (f.inStock) result.inStock = true
  // Note: sort is handled separately by API; we only pass it if supported
  return result
}

export function mapListingStateToSearchParams(state: ListingState, q: string): SearchParams {
  const result: SearchParams = {
    q,
    page: state.page,
    limit: state.limit,
  }

  const f = state.filters
  if (f.categoryId) result.categoryId = f.categoryId
  return result
}

export function mapSortToApiParam(sort: SortOption): string | undefined {
  return SORT_UI_TO_API[sort]
}

export function getActiveFilterChips(
  state: ListingState,
  t: (key: string, options?: Record<string, unknown>) => string,
): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = []
  const f = state.filters

  if (typeof f.minPrice === 'number' || typeof f.maxPrice === 'number') {
    const min = f.minPrice ?? ''
    const max = f.maxPrice ?? ''
    chips.push({
      key: 'price',
      label: `${t('productListing.filters.price')}: ${min ? min + ' - ' : ''}${max}`,
    })
  }

  if (f.inStock) {
    chips.push({ key: 'inStock', label: t('productListing.filters.inStock') })
  }

  if (f.brand) {
    chips.push({ key: 'brand', label: `${t('productListing.filters.brand')}: ${f.brand}` })
  }

  if (f.q) {
    chips.push({ key: 'q', label: `${t('search.title')}: ${f.q}` })
  }

  return chips
}

export function getActiveFiltersCount(state: ListingState): number {
  return getActiveFilterChips(state, (k) => k).length
}

export function createInitialListingState(overrides?: Partial<ListingState>): ListingState {
  return {
    filters: {
      ...(overrides?.filters ?? {}),
    },
    sort: overrides?.sort ?? 'relevance',
    viewMode: overrides?.viewMode ?? 'grid',
    page: overrides?.page ?? 1,
    limit: overrides?.limit ?? 12,
  }
}
