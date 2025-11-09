import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { favoritesApi } from '../api/favoritesApi';
import type { FavoritesStats, MostFavoritedProduct } from '../types/favorites.types';

const favoritesKeys = {
  all: ['favorites'] as const,
  stats: () => [...favoritesKeys.all, 'stats'] as const,
  mostFavorited: (limit: number) => [...favoritesKeys.all, 'most-favorited', limit] as const,
  productCount: (productId: string) => [...favoritesKeys.all, 'product-count', productId] as const,
  userCount: (userId: string) => [...favoritesKeys.all, 'user-count', userId] as const,
};

export const useFavoritesStats = (options?: UseQueryOptions<FavoritesStats>) =>
  useQuery({
    queryKey: favoritesKeys.stats(),
    queryFn: favoritesApi.getStats,
    ...options,
  });

export const useMostFavoritedProducts = (limit = 10, options?: UseQueryOptions<MostFavoritedProduct[]>) =>
  useQuery({
    queryKey: favoritesKeys.mostFavorited(limit),
    queryFn: () => favoritesApi.getMostFavorited(limit),
    ...options,
  });

export const useProductFavoritesCount = (productId: string, options?: UseQueryOptions<number>) =>
  useQuery({
    queryKey: favoritesKeys.productCount(productId),
    queryFn: () => favoritesApi.getProductCount(productId),
    enabled: Boolean(productId),
    ...options,
  });

export const useUserFavoritesCount = (userId: string, options?: UseQueryOptions<number>) =>
  useQuery({
    queryKey: favoritesKeys.userCount(userId),
    queryFn: () => favoritesApi.getUserFavoritesCount(userId),
    enabled: Boolean(userId),
    ...options,
  });


