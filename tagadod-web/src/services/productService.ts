import { api } from './api'
import type { Product, ProductVariant, PriceRange } from '../types/product'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'
import { useCurrencyStore } from '../stores/currencyStore'

export interface ProductFilters extends PaginationParams {
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

/** Raw product shape from API (new/featured list endpoints) */
interface ApiProductListItem {
  _id?: string
  id?: string
  name?: string
  nameEn?: string
  mainImage?: { _id?: string; url?: string } | null
  images?: string[]
  pricing?: {
    minPriceUSD?: number
    maxPriceUSD?: number
    basePriceUSD?: number
    finalPriceUSD?: number
    discountPercent?: number
    discountAmountUSD?: number
  }
  price?: number
  isNew?: boolean
  isFeatured?: boolean
  isAvailable?: boolean
}

function normalizeProduct(raw: ApiProductListItem): Product {
  const id = raw._id ?? raw.id ?? ''
  const mainImageUrl = raw.mainImage?.url ?? raw.images?.[0] ?? ''
  const p = raw.pricing
  const price =
    p?.minPriceUSD ??
    p?.finalPriceUSD ??
    p?.basePriceUSD ??
    p?.maxPriceUSD ??
    raw.price ??
    0

  return {
    id,
    name: raw.name ?? raw.nameEn ?? '',
    images: mainImageUrl ? [mainImageUrl] : [],
    price,
    originalPrice: p?.discountPercent && p.discountPercent > 0 ? p.basePriceUSD : undefined,
    inStock: raw.isAvailable ?? true,
    isNew: raw.isNew ?? false,
    isFeatured: raw.isFeatured ?? false,
  }
}

/** API response shape for products/new/list and products/featured/list */
interface ApiProductsListResponse {
  success?: boolean
  data?: {
    fx?: unknown
    rounding?: unknown
    userDiscount?: unknown
    data?: ApiProductListItem[]
    meta?: PaginatedResponse<Product>['meta']
  }
}

function parseProductsListResponse(res: ApiProductsListResponse): PaginatedResponse<Product> {
  const inner = res.data
  const items = inner?.data ?? []
  return {
    data: items.map(normalizeProduct),
    meta: inner?.meta ?? { page: 1, limit: 12, total: 0, totalPages: 0 },
  }
}

export async function getProducts(params?: ProductFilters): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>('/products', { params })
  return data
}

/** API response for product details – wrapped with fx, product, variants, relatedProducts */
interface ApiProductDetailResponse {
  success?: boolean
  data?: {
    fx?: unknown
    rounding?: unknown
    userDiscount?: unknown
    product?: ApiProductDetail
    variants?: ApiVariant[]
    relatedProducts?: ApiProductListItem[]
  }
}

interface ApiProductDetail extends ApiProductListItem {
  description?: string
  descriptionEn?: string
  images?: Array<{ _id?: string; url?: string }>
  category?: { _id?: string; name?: string; nameEn?: string }
}

interface ApiVariant {
  _id?: string
  id?: string
  attributeValues?: Array<{ name?: string; value?: string; nameEn?: string; valueEn?: string }>
  pricing?: { basePriceUSD?: number; finalPriceUSD?: number }
  isAvailable?: boolean
  stock?: number
}

function normalizeVariant(raw: ApiVariant): ProductVariant {
  const id = raw._id ?? raw.id ?? ''
  const attrs = raw.attributeValues ?? []
  const name = attrs.map((a) => a.value ?? a.valueEn ?? '').filter(Boolean).join(' / ') || '—'
  const p = raw.pricing
  const price = p?.finalPriceUSD ?? p?.basePriceUSD ?? 0

  return {
    id,
    name,
    price,
    inStock: raw.isAvailable ?? true,
    quantity: raw.stock,
  }
}

function normalizeProductDetail(
  rawProduct: ApiProductDetail | undefined,
  rawVariants: ApiVariant[] | undefined,
): Product {
  if (!rawProduct) {
    return { id: '', name: '', images: [], price: 0 }
  }

  const id = rawProduct._id ?? rawProduct.id ?? ''
  const mainUrl = rawProduct.mainImage?.url
  const extraUrls = (rawProduct.images ?? [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter((url): url is string => !!url)
  const images = mainUrl ? [mainUrl, ...extraUrls.filter((u) => u !== mainUrl)] : extraUrls

  const p = rawProduct.pricing
  const price =
    p?.minPriceUSD ??
    p?.finalPriceUSD ??
    p?.basePriceUSD ??
    p?.maxPriceUSD ??
    rawProduct.price ??
    0

  const variants = (rawVariants ?? []).map(normalizeVariant)
  const variantPrices = variants.map((v) => v.price).filter((p) => p > 0)
  const displayPrice =
    variantPrices.length > 0 ? Math.min(...variantPrices) : price

  return {
    id,
    name: rawProduct.name ?? rawProduct.nameEn ?? '',
    description: rawProduct.description ?? rawProduct.descriptionEn,
    images,
    price: displayPrice,
    originalPrice: p?.discountPercent && p.discountPercent > 0 ? p.basePriceUSD : undefined,
    categoryId: rawProduct.category?._id,
    categoryName: rawProduct.category?.name ?? rawProduct.category?.nameEn,
    inStock: rawProduct.isAvailable ?? true,
    isNew: rawProduct.isNew ?? false,
    isFeatured: rawProduct.isFeatured ?? false,
    variants: variants.length ? variants : undefined,
  }
}

export interface ProductDetailResult {
  product: Product
  relatedProducts: Product[]
}

export async function getProductById(id: string): Promise<ProductDetailResult> {
  const currency = useCurrencyStore.getState().currency
  const { data } = await api.get<ApiProductDetailResponse>(`/products/${id}`, { params: { currency } })
  const inner = data?.data
  const product = normalizeProductDetail(inner?.product, inner?.variants)
  const related = (inner?.relatedProducts ?? []).map(normalizeProduct)
  return { product, relatedProducts: related }
}

export async function getNewProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
  const currency = useCurrencyStore.getState().currency
  const { data } = await api.get<ApiProductsListResponse>('/products/new/list', {
    params: { ...params, currency },
  })
  return parseProductsListResponse(data)
}

export async function getFeaturedProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
  const currency = useCurrencyStore.getState().currency
  const { data } = await api.get<ApiProductsListResponse>('/products/featured/list', {
    params: { ...params, currency },
  })
  return parseProductsListResponse(data)
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
  const { data } = await api.get<ApiResponse<Product[]>>(`/products/${productId}/related`)
  return data.data ?? []
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data } = await api.get<ApiResponse<ProductVariant[]>>(`/products/${productId}/variants`)
  return data.data ?? []
}

export async function getVariantPrice(variantId: string): Promise<{ price: number; currency: string }> {
  const { data } = await api.get<ApiResponse<{ price: number; currency: string }>>(`/products/variants/${variantId}/price`)
  return data.data
}

export async function checkVariantAvailability(variantId: string): Promise<{ available: boolean; quantity: number }> {
  const { data } = await api.get<ApiResponse<{ available: boolean; quantity: number }>>(`/products/variants/${variantId}/availability`)
  return data.data
}

export async function getProductPriceRange(productId: string): Promise<PriceRange> {
  const { data } = await api.get<ApiResponse<PriceRange>>(`/products/${productId}/price-range`)
  return data.data
}

export async function getProductsByCategory(categoryId: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>(`/categories/${categoryId}/products`, { params })
  return data
}
