import { apiClient } from '../../../core/api/client';

export interface Favorite {
  _id: string;
  userId: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    mainImage?: string;
    price?: number;
    compareAtPrice?: number;
    currency: string;
    inStock: boolean;
  };
  createdAt: Date;
}

export interface FavoritesResponse {
  data: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ToggleFavoriteResponse {
  success: boolean;
  message: string;
  isFavorited: boolean;
  favorite?: Favorite;
}

export const favoritesApi = {
  // Get user's favorites
  getMyFavorites: async (page: number = 1, limit: number = 20): Promise<FavoritesResponse> => {
    const response = await apiClient.get(`/favorites/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Add product to favorites
  addToFavorites: async (productId: string): Promise<ToggleFavoriteResponse> => {
    const response = await apiClient.post('/favorites', { productId });
    return response.data;
  },

  // Remove product from favorites
  removeFromFavorites: async (productId: string): Promise<ToggleFavoriteResponse> => {
    const response = await apiClient.delete(`/favorites/${productId}`);
    return response.data;
  },

  // Toggle favorite status
  toggleFavorite: async (productId: string): Promise<ToggleFavoriteResponse> => {
    const response = await apiClient.patch(`/favorites/${productId}/toggle`);
    return response.data;
  },

  // Check if product is favorited
  isFavorited: async (productId: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.get(`/favorites/${productId}/check`);
    return response.data.data;
  },

  // Get favorites count
  getFavoritesCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/favorites/count');
    return response.data.data;
  },
};
