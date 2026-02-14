import { api } from './api'
import type { Order, PaymentOption, OrderRating } from '../types/order'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'
import type { OrderStatus } from '../types/enums'

export interface OrderFilters extends PaginationParams {
  status?: OrderStatus
}

export async function getOrders(params?: OrderFilters): Promise<PaginatedResponse<Order>> {
  const { data } = await api.get<PaginatedResponse<Order>>('/orders', { params })
  return data
}

export async function getOrderById(orderId: string): Promise<Order> {
  const { data } = await api.get<ApiResponse<Order>>(`/orders/${orderId}`)
  return data.data
}

export async function rateOrder(orderId: string, body: OrderRating): Promise<void> {
  await api.post(`/orders/${orderId}/rate`, body)
}

export async function getPaymentOptions(): Promise<PaymentOption[]> {
  const { data } = await api.get<ApiResponse<PaymentOption[]>>('/orders/checkout/payment-options')
  return data.data ?? []
}

export async function buildCheckoutSession(body: { addressId: string; paymentMethod: string }): Promise<{ sessionId: string }> {
  const { data } = await api.post<ApiResponse<{ sessionId: string }>>('/orders/checkout/session', body)
  return data.data
}
