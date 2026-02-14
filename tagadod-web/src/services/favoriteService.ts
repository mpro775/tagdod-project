import { api } from './api'
import type { FavoriteItem, FavoritesCount } from '../types/favorite'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

export async function getFavorites(params?: PaginationParams): Promise<PaginatedResponse<FavoriteItem>> {
  const { data } = await api.get<PaginatedResponse<FavoriteItem>>('/favorites', { params })
  return data
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
