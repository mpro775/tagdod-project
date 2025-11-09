import apiClient from '@/core/api/client';
import type { FavoritesStats, MostFavoritedProduct } from '../types/favorites.types';

const BASE_URL = '/admin/favorites';

function extractData<T>(response: any): T {
  const outer = response?.data;
  if (outer && typeof outer === 'object') {
    if (Array.isArray(outer)) {
      return outer as T;
    }

    if ('data' in outer) {
      return extractData<T>({ data: outer.data });
    }
  }

  return outer as T;
}

export const favoritesApi = {
  async getStats(): Promise<FavoritesStats> {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return extractData<FavoritesStats>(response);
  },

  async getMostFavorited(limit = 10): Promise<MostFavoritedProduct[]> {
    const response = await apiClient.get(`${BASE_URL}/most-favorited`, {
      params: { limit },
    });
    return extractData<MostFavoritedProduct[]>(response);
  },

  async getProductCount(productId: string): Promise<number> {
    const response = await apiClient.get(`${BASE_URL}/product/${productId}/count`);
    const data = extractData<{ count: number }>(response);
    return data?.count ?? 0;
  },

  async getUserFavoritesCount(userId: string): Promise<number> {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}/count`);
    const data = extractData<{ count: number }>(response);
    return data?.count ?? 0;
  },
};


