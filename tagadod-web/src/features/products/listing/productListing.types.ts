import type { Product } from '../../../types/product'
import type { PaginatedResponse } from '../../../types/common'

export type ViewMode = 'grid' | 'list'

export type SortOption =
  | 'relevance'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'popular'
  | 'best_selling'

export interface ListingFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  brand?: string
  q?: string
}

export interface ListingState {
  filters: ListingFilters
  sort: SortOption
  viewMode: ViewMode
  page: number
  limit: number
}

export type ListingPageType = 'products' | 'category' | 'search'

export interface ListingResult {
  products: Product[]
  meta: PaginatedResponse<Product>['meta']
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export interface ProductListingPageProps {
  pageType: ListingPageType
  title: string
  subtitle?: string
  breadcrumbItems: { label: string; href?: string }[]
  initialFilters?: Partial<ListingFilters>
  categoryData?: {
    id: string
    name: string
    image?: string
    description?: string
  }
  searchQuery?: string
}
