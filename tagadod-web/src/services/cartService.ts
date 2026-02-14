import { api } from './api'
import type { Cart, CartItem, CartPreview, CheckoutPreview, CheckoutConfirmRequest, CheckoutSession } from '../types/cart'
import type { ApiResponse } from '../types/common'
import { useCurrencyStore } from '../stores/currencyStore'

/** API cart response shape */
interface ApiCartItem {
  itemId?: string
  productId?: string
  variantId?: string
  qty?: number
  quantity?: number
  unit?: { base?: number; final?: number }
  pricing?: { basePrice?: number; finalPrice?: number }
  snapshot?: { name?: string; image?: string; slug?: string }
}

interface ApiCartResponse {
  success?: boolean
  data?: {
    items?: ApiCartItem[]
    subtotal?: number
    total?: number
    meta?: { count?: number; quantity?: number }
    pricingSummaryByCurrency?: Record<
      string,
      { subtotal?: number; total?: number; currency?: string }
    >
    currency?: string
  }
}

function normalizeCartItem(raw: ApiCartItem): CartItem {
  const price =
    raw.unit?.final ??
    raw.pricing?.finalPrice ??
    raw.unit?.base ??
    raw.pricing?.basePrice ??
    0
  return {
    id: raw.itemId ?? '',
    productId: raw.productId ?? '',
    variantId: raw.variantId,
    quantity: raw.qty ?? raw.quantity ?? 0,
    price,
    product: raw.snapshot
      ? {
          id: raw.productId ?? '',
          name: raw.snapshot.name ?? '',
          images: raw.snapshot.image ? [raw.snapshot.image] : [],
          price,
        }
      : undefined,
  }
}

export async function getCart(): Promise<Cart> {
  const { data } = await api.get<ApiCartResponse>('/cart')
  const inner = data?.data
  const rawItems = inner?.items ?? []
  const items = rawItems.map(normalizeCartItem)
  const currency = useCurrencyStore.getState().currency
  const summary = inner?.pricingSummaryByCurrency?.[currency] ?? inner?.pricingSummaryByCurrency?.USD ?? {}
  const subtotal = summary.subtotal ?? summary.total ?? inner?.subtotal ?? 0
  const total = summary.total ?? summary.subtotal ?? inner?.total ?? subtotal
  const meta = inner?.meta ?? {}

  return {
    items,
    subtotal,
    total,
    itemsCount: meta.quantity ?? meta.count ?? items.length,
  }
}

export async function addToCart(body: { productId: string; variantId?: string; quantity: number }): Promise<CartItem> {
  const { data } = await api.post<ApiResponse<CartItem>>('/cart/items', body)
  return data.data
}

export async function updateCartItem(itemId: string, body: { quantity: number }): Promise<CartItem> {
  const { data } = await api.patch<ApiResponse<CartItem>>(`/cart/items/${itemId}`, body)
  return data.data
}

export async function removeCartItem(itemId: string): Promise<void> {
  await api.delete(`/cart/items/${itemId}`)
}

export async function previewCart(): Promise<CartPreview> {
  const { data } = await api.post<ApiResponse<CartPreview>>('/cart/preview')
  return data.data
}

export async function syncCart(items: Array<{ productId: string; variantId?: string; quantity: number }>): Promise<Cart> {
  const { data } = await api.post<ApiResponse<Cart>>('/cart/sync', { items })
  return data.data
}

export async function checkoutPreview(body: { addressId: string; couponCode?: string }): Promise<CheckoutPreview> {
  const { data } = await api.post<ApiResponse<CheckoutPreview>>('/orders/checkout/preview', body)
  return data.data
}

export async function checkoutConfirm(body: CheckoutConfirmRequest): Promise<CheckoutSession> {
  const { data } = await api.post<ApiResponse<CheckoutSession>>('/orders/checkout/confirm', body)
  return data.data
}
