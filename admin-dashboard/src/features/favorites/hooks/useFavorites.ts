import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../api/favoritesApi';
import { toast } from 'react-hot-toast';

const FAVORITES_KEY = 'favorites';

export const useFavorites = (page: number = 1, limit: number = 20) => {
  const queryClient = useQueryClient();

  // Get user's favorites
  const { data: favoritesResponse, isLoading, error } = useQuery({
    queryKey: [FAVORITES_KEY, page, limit],
    queryFn: () => favoritesApi.getMyFavorites(page, limit),
    retry: 1,
  });

  // Get favorites count
  const { data: favoritesCount } = useQuery({
    queryKey: [FAVORITES_KEY, 'count'],
    queryFn: () => favoritesApi.getFavoritesCount(),
    select: (data) => data.count,
    retry: 1,
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: (productId: string) => favoritesApi.toggleFavorite(productId),
    onSuccess: (response, productId) => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(response.message || 'تم تحديث المفضلة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث المفضلة');
    },
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: (productId: string) => favoritesApi.addToFavorites(productId),
    onSuccess: (response, productId) => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(response.message || 'تم إضافة المنتج للمفضلة');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة المنتج للمفضلة');
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: (productId: string) => favoritesApi.removeFromFavorites(productId),
    onSuccess: (response, productId) => {
      queryClient.invalidateQueries({ queryKey: [FAVORITES_KEY] });
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      toast.success(response.message || 'تم حذف المنتج من المفضلة');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف المنتج من المفضلة');
    },
  });

  return {
    // Data
    favorites: favoritesResponse?.data || [],
    pagination: favoritesResponse?.pagination,
    favoritesCount: favoritesCount || 0,
    isLoading,
    error,

    // Mutations
    toggleFavorite: toggleFavoriteMutation.mutate,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,

    // Loading states
    isTogglingFavorite: toggleFavoriteMutation.isPending,
    isAddingToFavorites: addToFavoritesMutation.isPending,
    isRemovingFromFavorites: removeFromFavoritesMutation.isPending,
  };
};

// Hook to check if a specific product is favorited
export const useIsFavorited = (productId: string) => {
  return useQuery({
    queryKey: [FAVORITES_KEY, 'check', productId],
    queryFn: () => favoritesApi.isFavorited(productId),
    select: (data) => data.isFavorited,
    enabled: !!productId,
    retry: 1,
  });
};
