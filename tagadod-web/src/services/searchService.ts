import { api } from './api'
import type { Product } from '../types/product'
import type { PaginatedResponse, PaginationParams } from '../types/common'
import { useCurrencyStore } from '../stores/currencyStore'

export interface SearchParams extends PaginationParams {
  q: string
  categoryId?: string
}

interface ApiSearchProduct {
  _id?: string
  id?: string
  name?: string
  nameEn?: string
  mainImage?: { _id?: string; url?: string } | null
  images?: string[] | Array<{ _id?: string; url?: string }>
  pricingByCurrency?: Record<
    string,
    {
      basePrice?: number
      finalPrice?: number
      compareAtPrice?: number
      currency?: string
    }
  >
  defaultPricing?: {
    basePrice?: number
    finalPrice?: number
    compareAtPrice?: number
  }
  pricing?: {
    minPriceUSD?: number
    maxPriceUSD?: number
    basePriceUSD?: number
    finalPriceUSD?: number
  }
  price?: number
  isAvailable?: boolean
  isFeatured?: boolean
  isNew?: boolean
  hasVariants?: boolean
}

interface ApiSearchInnerResponse {
  results?: ApiSearchProduct[]
  total?: number
  page?: number
  totalPages?: number
  limit?: number
}

function normalizeSearchProduct(raw: ApiSearchProduct, preferredCurrency: string): Product {
  const id = raw._id ?? raw.id ?? ''
  const mainImageUrl =
    raw.mainImage?.url ??
    (typeof raw.images?.[0] === 'string' ? raw.images[0] : raw.images?.[0]?.url) ??
    ''

  const pricingByCurrency = raw.pricingByCurrency
  const selectedCurrencyPricing =
    pricingByCurrency?.[preferredCurrency] ?? pricingByCurrency?.USD ??
    (pricingByCurrency ? Object.values(pricingByCurrency)[0] : undefined)

  const price =
    selectedCurrencyPricing?.finalPrice ??
    selectedCurrencyPricing?.basePrice ??
    raw.defaultPricing?.finalPrice ??
    raw.defaultPricing?.basePrice ??
    raw.pricing?.minPriceUSD ??
    raw.pricing?.finalPriceUSD ??
    raw.pricing?.basePriceUSD ??
    raw.pricing?.maxPriceUSD ??
    raw.price ??
    0

  return {
    id,
    name: raw.name ?? raw.nameEn ?? '',
    images: mainImageUrl ? [mainImageUrl] : [],
    price,
    originalPrice: selectedCurrencyPricing?.compareAtPrice ?? raw.defaultPricing?.compareAtPrice,
    inStock: raw.isAvailable ?? true,
    isFeatured: raw.isFeatured ?? false,
    isNew: raw.isNew ?? false,
    hasVariants: raw.hasVariants ?? false,
  }
}

function parseSearchProductsResponse(raw: unknown, fallbackLimit = 20): PaginatedResponse<Product> {
  const level1 = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data?: unknown }).data : undefined
  const level2 = level1 && typeof level1 === 'object' && 'data' in level1 ? (level1 as { data?: unknown }).data : undefined

  const inner = ((level2 ?? level1) ?? {}) as ApiSearchInnerResponse
  const items = Array.isArray(inner.results) ? inner.results : []
  const preferredCurrency = useCurrencyStore.getState().currency

  return {
    data: items.map((item) => normalizeSearchProduct(item, preferredCurrency)),
    meta: {
      page: inner.page ?? 1,
      limit: inner.limit ?? fallbackLimit,
      total: inner.total ?? items.length,
      totalPages: inner.totalPages ?? 1,
    },
  }
}

export async function searchProducts(params: SearchParams): Promise<PaginatedResponse<Product>> {
  const currency = useCurrencyStore.getState().currency
  const { data } = await api.get<unknown>('/search', {
    params: { ...params, currency },
  })
  return parseSearchProductsResponse(data, params.limit ?? 20)
}

export async function getSearchSuggestions(q: string): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>('/search/suggestions', { params: { q } })
  return data.data ?? []
}
