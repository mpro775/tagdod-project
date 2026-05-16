import { Link } from 'react-router-dom'
import type { Product } from '../../../types/product'
import { cn } from '../../../utils'
import {
  getProductName,
  getProductImage,
  getProductPrice,
  getProductComparePrice,
  getProductHref,
  isProductOutOfStock,
} from './productCard.helpers'
import { ProductImage } from './ProductImage'
import { ProductPrice } from './ProductPrice'
import { ProductBadges } from './ProductBadges'

export interface ProductCardCompactProps {
  product: Product
  className?: string
}

export function ProductCardCompact({ product, className }: ProductCardCompactProps) {
  const name = getProductName(product)
  const href = getProductHref(product)
  const outOfStock = isProductOutOfStock(product)

  return (
    <Link
      to={href}
      className={cn(
        'group flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5 transition-shadow hover:shadow-sm',
        outOfStock && 'opacity-75',
        className,
      )}
    >
      <div className="relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark">
        <ProductImage
          src={getProductImage(product)}
          alt={name}
          aspectRatio="square"
          className="rounded-lg"
        />
        <div className="absolute top-0.5 start-0.5">
          <ProductBadges
            outOfStock={outOfStock}
            className="static"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-2 leading-snug mb-1">
          {name || '—'}
        </h3>
        <ProductPrice
          price={getProductPrice(product)}
          comparePrice={getProductComparePrice(product)}
          size="sm"
        />
      </div>
    </Link>
  )
}
