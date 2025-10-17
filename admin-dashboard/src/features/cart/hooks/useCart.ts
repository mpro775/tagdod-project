import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicCartApi, AddToCartRequest, UpdateCartItemRequest } from '../api/publicCartApi';
import { toast } from 'react-hot-toast';

const CART_KEY = 'cart';

export const useCart = () => {
  const queryClient = useQueryClient();

  // Get current cart
  const { data: cart, isLoading, error } = useQuery({
    queryKey: [CART_KEY, 'my'],
    queryFn: () => publicCartApi.getMyCart(),
    retry: 1,
  });

  // Get cart item count
  const { data: itemCount } = useQuery({
    queryKey: [CART_KEY, 'count'],
    queryFn: () => publicCartApi.getCartItemCount(),
    select: (data) => data.count,
    retry: 1,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartRequest) => publicCartApi.addToCart(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تمت إضافة المنتج للسلة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة المنتج للسلة');
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: (data: UpdateCartItemRequest) => publicCartApi.updateCartItem(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تم تحديث السلة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث السلة');
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => publicCartApi.removeFromCart(itemId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تم حذف المنتج من السلة');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف المنتج من السلة');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () => publicCartApi.clearCart(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تم مسح السلة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في مسح السلة');
    },
  });

  return {
    // Data
    cart,
    itemCount: itemCount || 0,
    isLoading,
    error,

    // Mutations
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,

    // Loading states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
};