export interface Product {
  id: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  images: string[]
  price: number
  originalPrice?: number
  currency?: string
  categoryId?: string
  categoryName?: string
  inStock?: boolean
  quantity?: number
  isFeatured?: boolean
  isNew?: boolean
  rating?: number
  ratingsCount?: number
  variants?: ProductVariant[]
  priceRange?: PriceRange
  createdAt?: string
  updatedAt?: string
}

export interface ProductVariant {
  id: string
  name: string
  sku?: string
  price: number
  originalPrice?: number
  inStock?: boolean
  quantity?: number
  attributes?: Record<string, string>
  image?: string
}

export interface PriceRange {
  min: number
  max: number
  currency?: string
}
