import { create } from 'zustand'
import type { CartItem } from '../types/cart'
import { getCartOwnerKey } from '../services/cartIdentityService'

const CART_STORAGE_KEY = 'tagadod-cart'

/** Persisted shape: map of ownerKey -> items */
interface PersistedCart {
  [ownerKey: string]: CartItem[]
}

/** Local cart item key (same logic as mobile: product:id or variant:id) */
function getItemKey(productId: string, variantId?: string): string {
  return variantId ? `variant:${variantId}` : `product:${productId}`
}

function loadItems(): CartItem[] {
  try {
    const ownerKey = getCartOwnerKey()
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PersistedCart
    const items = parsed[ownerKey] ?? []
    return items.map((i) => ({
      ...i,
      id: i.id || getItemKey(i.productId, i.variantId),
    }))
  } catch {
    return []
  }
}

function saveItems(items: CartItem[]) {
  try {
    const ownerKey = getCartOwnerKey()
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const existing: PersistedCart = raw ? JSON.parse(raw) : {}
    existing[ownerKey] = items
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // ignore
  }
}

/** Merge guest cart into user cart (call when user logs in). */
function mergeGuestCartIntoUser(userOwnerKey: string): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const stored: PersistedCart = raw ? JSON.parse(raw) : {}
    const guestItems = stored['guest'] ?? []
    const userItems = stored[userOwnerKey] ?? []
    if (guestItems.length === 0) return userItems
    const merged = [...userItems]
    for (const g of guestItems) {
      const key = g.id || getItemKey(g.productId, g.variantId)
      const existing = merged.find(
        (i) =>
          (i.productId === g.productId && i.variantId === g.variantId) || i.id === key,
      )
      if (existing) {
        existing.quantity += g.quantity
      } else {
        merged.push({ ...g, id: key })
      }
    }
    stored[userOwnerKey] = merged
    stored['guest'] = []
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stored))
    return merged
  } catch {
    return loadItems()
  }
}

interface CartStore {
  items: CartItem[]
  /** Re-hydrate from storage (call when owner changes). Merges guest cart into user on login. */
  rehydrate: () => void
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getCount: () => number
  getSubtotal: () => number
  /** Items formatted for sync API: { productId?, variantId?, qty } */
  getSyncPayload: () => Array<{ productId?: string; variantId?: string; qty: number }>
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: loadItems(),

  rehydrate: () => {
    const ownerKey = getCartOwnerKey()
    const items =
      ownerKey.startsWith('user:')
        ? mergeGuestCartIntoUser(ownerKey)
        : loadItems()
    set({ items })
  },

  addItem: (item) => {
    const key = item.id || getItemKey(item.productId, item.variantId)
    set((state) => {
      const existing = state.items.find(
        (i) =>
          (i.productId === item.productId && i.variantId === item.variantId) ||
          i.id === key,
      )
      let next: CartItem[]
      if (existing) {
        next = state.items.map((i) =>
          i.id === existing.id || i.id === key
            ? { ...i, quantity: i.quantity + item.quantity, id: key }
            : i,
        )
      } else {
        next = [...state.items, { ...item, id: key }]
      }
      saveItems(next)
      return { items: next }
    })
  },

  removeItem: (itemId) => {
    set((state) => {
      const next = state.items.filter((i) => i.id !== itemId)
      saveItems(next)
      return { items: next }
    })
  },

  updateQuantity: (itemId, quantity) => {
    set((state) => {
      const next =
        quantity <= 0
          ? state.items.filter((i) => i.id !== itemId)
          : state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i,
            )
      saveItems(next)
      return { items: next }
    })
  },

  clearCart: () => {
    set({ items: [] })
    saveItems([])
  },

  getTotal: () =>
    get().items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0),

  getCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0),

  getSyncPayload: () =>
    get().items.map((i) => {
      const item: { productId?: string; variantId?: string; qty: number } = { qty: i.quantity }
      if (i.variantId) item.variantId = i.variantId
      else item.productId = i.productId
      return item
    }),
}))
