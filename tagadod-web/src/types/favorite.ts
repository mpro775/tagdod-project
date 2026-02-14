import type { Product } from './product'

export interface FavoriteItem {
  id: string
  productId: string
  product?: Product
  createdAt?: string
}

export interface FavoritesCount {
  count: number
}
