
export type CartDisplayItem = {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  name: string
  image?: string
  variantLabel?: string
  sku?: string
  inStock?: boolean
  stock?: number
  currency?: string
  productHref?: string
}

export type CartTotals = {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  itemsCount: number
}

export type CartState = 'loading' | 'ready' | 'empty' | 'error'
