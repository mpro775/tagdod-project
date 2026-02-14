import { api } from './api'
import type { Order, PaymentOption, OrderRating } from '../types/order'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'
import type { OrderStatus } from '../types/enums'

export interface OrderFilters extends PaginationParams {
  status?: OrderStatus
}

/** API يعيد { data: { orders: [], pagination: { total, page, limit, totalPages } } } */
function parseOrdersResponse(raw: unknown): PaginatedResponse<Order> {
  if (!raw || typeof raw !== 'object') {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }
  }
  const obj = raw as Record<string, unknown>
  const inner = obj.data as Record<string, unknown> | undefined
  const orders = (Array.isArray(inner?.orders)
    ? inner.orders
    : Array.isArray(obj.orders)
      ? obj.orders
      : Array.isArray(obj.data)
        ? obj.data
        : []) as Order[]
  const pag = (inner?.pagination ?? obj.pagination) as { page?: number; limit?: number; total?: number; totalPages?: number } | undefined
  const meta = {
    page: pag?.page ?? 1,
    limit: pag?.limit ?? 20,
    total: pag?.total ?? orders.length,
    totalPages: pag?.totalPages ?? 1,
  }
  const normalized = orders.map((o) => {
    const id = (o as { _id?: string })._id ?? (o as { id?: string }).id ?? ''
    return { ...o, id } as Order
  })
  return { data: normalized, meta }
}

export async function getOrders(params?: OrderFilters): Promise<PaginatedResponse<Order>> {
  const { data } = await api.get<unknown>('/orders', { params })
  return parseOrdersResponse(data)
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
