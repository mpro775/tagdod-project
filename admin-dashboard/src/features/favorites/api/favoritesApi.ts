import apiClient from '@/core/api/client';
import type { FavoritesStats,  MostFavoritedProductsResponse } from '../types/favorites.types';

const BASE_URL = '/admin/favorites';

function extractData<T>(response: any): T {
  // Handle axios response structure: response.data contains the actual response
  const responseData = response?.data;
  
  if (!responseData || typeof responseData !== 'object') {
    return responseData as T;
  }
  
  // Handle nested structure: { success: true, data: { data: {...} } }
  if ('data' in responseData && typeof responseData.data === 'object') {
    const innerData = responseData.data;
    
    // If innerData is a MostFavoritedProductsResponse (has both 'data' and 'meta'), return it
    if ('data' in innerData && 'meta' in innerData) {
      return innerData as T;
    }
    
    // If innerData has another nested 'data' (like stats: { data: { data: {...} } })
    if ('data' in innerData && typeof innerData.data === 'object') {
      const nestedData = innerData.data;
      // Check if nestedData is the actual stats object (has totalUsers, total, etc.)
      if ('totalUsers' in nestedData || 'total' in nestedData) {
        return nestedData as T;
      }
      // Otherwise return nestedData
      return nestedData as T;
    }
    
    // If innerData is an array, return it
    if (Array.isArray(innerData)) {
      return innerData as T;
    }
    
    // Check if innerData is already the stats object (has totalUsers, total, etc.)
    if ('totalUsers' in innerData || 'total' in innerData) {
      return innerData as T;
    }
    
    // Otherwise return innerData
    return innerData as T;
  }
  
  // If responseData is an array, return it
  if (Array.isArray(responseData)) {
    return responseData as T;
  }
  
  // If responseData has both 'data' and 'meta', it's already the correct structure
  if ('data' in responseData && 'meta' in responseData) {
    return responseData as T;
  }
  
  // If responseData has 'data' property, extract it
  if ('data' in responseData) {
    return responseData.data as T;
  }

  return responseData as T;
}

export const favoritesApi = {
  async getStats(): Promise<FavoritesStats> {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return extractData<FavoritesStats>(response);
  },

  async getMostFavorited(limit = 10): Promise<MostFavoritedProductsResponse> {
    const response = await apiClient.get(`${BASE_URL}/most-favorited`, {
      params: { limit },
    });
    return extractData<MostFavoritedProductsResponse>(response);
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


