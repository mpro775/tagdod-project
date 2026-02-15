import { api } from './api'
import type { Cart, CartItem, CartPreview, CheckoutPreview, CheckoutConfirmRequest, CheckoutSession } from '../types/cart'
import type { ApiResponse } from '../types/common'
import { useCurrencyStore } from '../stores/currencyStore'
import { useCartStore } from '../stores/cartStore'

export interface CheckoutSessionAddress {
  id: string
  label?: string
  line1?: string
  city?: string
  isDefault: boolean
  isActive?: boolean
  coords?: { lat: number; lng: number }
}

export interface CheckoutSessionPaymentOptionStatus {
  method?: string
  allowed?: boolean
  reason?: string
  codEligibility?: {
    requiredOrders?: number
    completedOrders?: number
  }
}

export interface CheckoutSessionLocalPaymentProvider {
  providerId: string
  providerName: string
  icon?: { url?: string }
  supportedCurrencies?: string[]
  sharedAccountNumber?: string
  accounts?: Array<{
    id: string
    currency: string
    accountNumber: string
    isActive: boolean
  }>
}

export interface CheckoutSessionData {
  totals: {
    subtotal: number
    shipping: number
    total: number
    currency: string
  }
  discounts: {
    itemsDiscount: number
    couponDiscount: number
    totalDiscount: number
  }
  addresses: CheckoutSessionAddress[]
  paymentOptions: {
    cod?: CheckoutSessionPaymentOptionStatus
    localPaymentProviders?: CheckoutSessionLocalPaymentProvider[]
    customerOrderStats?: {
      requiredForCOD?: number
      completedOrders?: number
    }
  }
}

/**
 * Returns cart from local storage (Local-first: no API call).
 * Use this for displaying cart in UI.
 */
export function getLocalCart(): Cart {
  const items = useCartStore.getState().items
  const subtotal = useCartStore.getState().getSubtotal()
  return {
    items,
    subtotal,
    total: subtotal,
    itemsCount: useCartStore.getState().getCount(),
  }
}

/**
 * Add item to local cart (no API). Call syncCart before checkout.
 */
export function addToCartLocal(item: CartItem): void {
  useCartStore.getState().addItem(item)
}

/**
 * Update quantity locally. Use item id (product:id or variant:id).
 */
export function updateCartItemLocal(itemId: string, quantity: number): void {
  useCartStore.getState().updateQuantity(itemId, quantity)
}

/**
 * Remove item from local cart.
 */
export function removeCartItemLocal(itemId: string): void {
  useCartStore.getState().removeItem(itemId)
}

/**
 * Sync local cart to server. Call this before checkout (e.g. when user clicks "متابعة الشراء").
 * Backend expects items with productId?, variantId?, qty. Returns local cart on success.
 */
export async function syncCart(items?: Array<{ productId?: string; variantId?: string; qty: number }>): Promise<Cart> {
  const payload = items ?? useCartStore.getState().getSyncPayload()
  const currency = useCurrencyStore.getState().currency
  await api.post<{ data?: { synced?: boolean; message?: string; itemsCount?: number } }>('/cart/sync', {
    items: payload,
    currency,
  })
  return getLocalCart()
}

export async function previewCart(): Promise<CartPreview> {
  const { data } = await api.post<ApiResponse<CartPreview>>('/cart/preview')
  return data.data
}

export async function checkoutPreview(body: { addressId: string; couponCode?: string }): Promise<CheckoutPreview> {
  const { data } = await api.post<ApiResponse<CheckoutPreview>>('/orders/checkout/preview', body)
  return data.data
}

export async function checkoutSession(body: { couponCode?: string; couponCodes?: string[] }): Promise<CheckoutSessionData> {
  const { data } = await api.post<unknown>('/orders/checkout/session', body)
  const root = (data ?? {}) as {
    session?: CheckoutSessionData
    data?: { session?: CheckoutSessionData }
  }
  const session = root.session ?? root.data?.session
  if (!session) {
    return {
      totals: { subtotal: 0, shipping: 0, total: 0, currency: 'USD' },
      discounts: { itemsDiscount: 0, couponDiscount: 0, totalDiscount: 0 },
      addresses: [],
      paymentOptions: {},
    }
  }
  return session
}

export async function checkoutConfirm(body: CheckoutConfirmRequest): Promise<CheckoutSession> {
  const payload = {
    deliveryAddressId: body.addressId,
    currency: body.currency ?? useCurrencyStore.getState().currency ?? 'USD',
    paymentMethod: body.paymentMethod,
    paymentProvider: body.paymentProvider,
    localPaymentAccountId: body.localPaymentAccountId,
    couponCode: body.couponCode,
    customerNotes: body.notes,
    paymentReference: body.paymentReference,
  }
  const { data } = await api.post<ApiResponse<CheckoutSession>>('/orders/checkout/confirm', payload)
  return data.data
}
