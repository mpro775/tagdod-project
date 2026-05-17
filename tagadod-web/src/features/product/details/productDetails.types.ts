import type { Product, ProductVariant } from '../../../types/product'

export interface ProductDetailsPageProps {
  productId: string
}

export interface ProductGalleryProps {
  images: string[]
  productName: string
}

export interface ProductGalleryThumbnailProps {
  src: string
  alt: string
  isActive: boolean
  onClick: () => void
}

export interface ProductPurchasePanelProps {
  product: Product
  selectedVariant: ProductVariant | undefined
  quantity: number
  onVariantSelect: (variantId: string | null) => void
  onQuantityChange: (quantity: number) => void
  onAddToCart: () => void
  onToggleFavorite: () => void
  isFavorite: boolean
  addSuccess: boolean
}

export interface ProductQuantitySelectorProps {
  quantity: number
  maxQuantity?: number
  inStock: boolean
  onChange: (quantity: number) => void
}

export interface ProductVariantSelectorProps {
  variants: ProductVariant[]
  selectedId: string | null
  onSelect: (variantId: string) => void
}

export interface ProductTrustInfoProps {
  className?: string
}

export interface ProductInfoTabsProps {
  description?: string
  specifications?: Record<string, string>
  product: Product
}

export interface ProductSpecificationsProps {
  specifications: Record<string, string>
}

export interface ProductDescriptionProps {
  description: string
}

export interface ProductMobileStickyBarProps {
  product: Product
  selectedVariant: ProductVariant | undefined
  onAddToCart: () => void
  inStock: boolean
}

export interface RelatedProductsSectionProps {
  products: Product[]
  currentProductId: string
  title: string
}

export interface RecentlyViewedSectionProps {
  currentProductId: string
  title: string
}
