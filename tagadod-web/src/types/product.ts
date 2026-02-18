export interface Product {
  id: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  images: string[]
  videos?: ProductVideo[]
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
  /** من الـ API: true إذا المنتج له متغيرات (يحتاج اختيار قبل الإضافة) */
  hasVariants?: boolean
  variants?: ProductVariant[]
  priceRange?: PriceRange
  createdAt?: string
  updatedAt?: string
}

export interface ProductVideo {
  id: string
  url: string
  embedUrl?: string
  hlsUrl?: string
  mp4Url?: string
  thumbnailUrl?: string
  status?: 'processing' | 'ready' | 'failed'
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
