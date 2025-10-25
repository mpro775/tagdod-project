import { apiClient } from '../../../core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface AddToCartRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface CartItem {
  itemId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    name: string;
    image?: string;
    sku?: string;
  };
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartResponse {
  message: string;
  cart: Cart;
}

export const publicCartApi = {
  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<AddToCartResponse> => {
    const response = await apiClient.post<ApiResponse<AddToCartResponse>>('/cart/items', data);
    return response.data.data;
  },

  // Get current user's cart
  getMyCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/cart/my');
    return response.data.data;
  },

  // Update cart item quantity
  updateCartItem: async (data: UpdateCartItemRequest): Promise<AddToCartResponse> => {
    const response = await apiClient.patch<ApiResponse<AddToCartResponse>>('/cart/items', data);
    return response.data.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<AddToCartResponse> => {
    const response = await apiClient.delete<ApiResponse<AddToCartResponse>>(`/cart/items/${itemId}`);
    return response.data.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>('/cart/clear');
    return response.data.data;
  },

  // Get cart item count
  getCartItemCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/cart/count');
    return response.data.data;
  },
};
