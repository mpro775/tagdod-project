import { apiClient } from '../../../core/api/client';

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
  success: boolean;
  message: string;
  cart: Cart;
}

export const publicCartApi = {
  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<AddToCartResponse> => {
    const response = await apiClient.post('/cart/items', data);
    return response.data;
  },

  // Get current user's cart
  getMyCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/cart/my');
    return response.data.data;
  },

  // Update cart item quantity
  updateCartItem: async (data: UpdateCartItemRequest): Promise<AddToCartResponse> => {
    const response = await apiClient.patch('/cart/items', data);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<AddToCartResponse> => {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },

  // Get cart item count
  getCartItemCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/cart/count');
    return response.data.data;
  },
};
