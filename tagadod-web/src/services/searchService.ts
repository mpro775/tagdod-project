import { api } from './api'
import type { Product } from '../types/product'
import type { PaginatedResponse, PaginationParams } from '../types/common'

export interface SearchParams extends PaginationParams {
  q: string
  categoryId?: string
}

export async function searchProducts(params: SearchParams): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>('/search', { params })
  return data
}

export async function getSearchSuggestions(q: string): Promise<string[]> {
  const { data } = await api.get<{ data: string[] }>('/search/suggestions', { params: { q } })
  return data.data ?? []
}
