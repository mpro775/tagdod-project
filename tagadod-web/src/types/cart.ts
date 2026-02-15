import type { Product } from './product'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  product?: Product
  variantName?: string
}

export interface Cart {
  id?: string
  items: CartItem[]
  subtotal: number
  total: number
  itemsCount: number
}

export interface CartPreview {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  currency: string
}

export interface CheckoutSession {
  sessionId: string
  paymentUrl?: string
  orderId?: string
}

export interface CheckoutPreview {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  couponDiscount: number
  total: number
  currency: string
}

export interface CheckoutConfirmRequest {
  addressId: string
  paymentMethod: string
  currency?: string
  couponCode?: string
  notes?: string
  paymentReference?: string
  paymentProvider?: string
  localPaymentAccountId?: string
}
