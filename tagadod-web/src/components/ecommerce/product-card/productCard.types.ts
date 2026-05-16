import type { Product } from '../../../types/product'

export type CardVariant = 'grid' | 'compact' | 'horizontal'

export interface BaseProductCardProps {
  product: Product
  className?: string
}
