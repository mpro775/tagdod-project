import type { OrderStatus } from './enums'
import type { CartItem } from './cart'

export interface Order {
  id: string
  orderNumber?: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  couponDiscount?: number
  total: number
  currency: string
  paymentMethod?: string
  paymentReference?: string
  paymentStatus?: string
  addressId?: string
  address?: OrderAddress
  notes?: string
  rating?: number
  ratingComment?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  variantId?: string
  variantName?: string
  quantity: number
  price: number
  total: number
}

export interface OrderAddress {
  label?: string
  line1?: string
  city?: string
  lat?: number
  lng?: number
}

export interface PaymentOption {
  id: string
  name: string
  nameAr?: string
  type: string
  icon?: string
  isDefault?: boolean
  instructions?: string
}

export interface OrderRating {
  rating: number
  comment?: string
}
