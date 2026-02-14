import { api } from './api'
import type { FavoriteItem, FavoritesCount } from '../types/favorite'
import type { Product } from '../types/product'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

/** عنصر المفضلة من الـ API - productId قد يكون سلسلة أو كائن منتج populated */
type ApiFavoriteItem = {
  _id?: string
  id?: string
  productId?: string | Record<string, unknown>
  product?: Product
  createdAt?: string
}

function normalizeFavoriteItem(raw: ApiFavoriteItem): FavoriteItem {
  const id = raw._id ?? raw.id ?? ''
  const pid = raw.productId
  const productId = typeof pid === 'string' ? pid : (pid as { _id?: string; id?: string })?._id ?? (pid as { _id?: string; id?: string })?.id ?? ''
  const product = raw.product ?? (typeof pid === 'object' && pid ? productFromRaw(pid as Record<string, unknown>) : undefined)
  return { id, productId, product, createdAt: raw.createdAt }
}

function productFromRaw(p: Record<string, unknown>): Product {
  const id = (p._id ?? p.id ?? '') as string
  const mainImage = p.mainImage as { url?: string } | undefined
  const images = p.images as string[] | undefined
  const img = mainImage?.url ?? images?.[0] ?? ''
  const pc = p.pricingByCurrency as Record<string, { finalPrice?: number; basePrice?: number }> | undefined
  const usd = pc?.USD
  const price = usd?.finalPrice ?? usd?.basePrice ?? (p.price as number) ?? 0
  return {
    id,
    name: (p.name ?? p.nameEn ?? '') as string,
    images: img ? [img] : [],
    price,
    inStock: (p.isAvailable as boolean) ?? true,
    isNew: (p.isNew as boolean) ?? false,
    isFeatured: (p.isFeatured as boolean) ?? false,
    hasVariants: (p.hasVariants as boolean) ?? false,
  }
}

export async function getFavorites(params?: PaginationParams): Promise<PaginatedResponse<FavoriteItem>> {
  const { data } = await api.get<{ success?: boolean; data?: ApiFavoriteItem[]; meta?: PaginatedResponse<FavoriteItem>['meta'] }>('/favorites', { params })
  const items = Array.isArray(data?.data) ? data.data.map(normalizeFavoriteItem) : []
  const meta = data?.meta ?? { page: 1, limit: 100, total: items.length, totalPages: 1 }
  return { data: items, meta }
}

export async function addFavorite(productId: string): Promise<void> {
  await api.post('/favorites', { productId })
}

export async function removeFavorite(productId: string): Promise<void> {
  await api.delete('/favorites', { data: { productId } })
}

export async function clearFavorites(): Promise<void> {
  await api.delete('/favorites/clear/all')
}

export async function getFavoritesCount(): Promise<FavoritesCount> {
  const { data } = await api.get<ApiResponse<FavoritesCount>>('/favorites/count')
  return data.data
}
