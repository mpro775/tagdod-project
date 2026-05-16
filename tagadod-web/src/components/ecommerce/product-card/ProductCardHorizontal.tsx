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
  isProductFeatured,
  isProductNew,
} from './productCard.helpers'
import { ProductImage } from './ProductImage'
import { ProductPrice } from './ProductPrice'
import { ProductBadges } from './ProductBadges'
import { ProductActions } from './ProductActions'

export interface ProductCardHorizontalProps {
  product: Product
  className?: string
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  showDescription?: boolean
}

export function ProductCardHorizontal({
  product,
  className,
  isFavorite,
  onToggleFavorite,
  showDescription,
}: ProductCardHorizontalProps) {
  const name = getProductName(product)
  const href = getProductHref(product)
  const outOfStock = isProductOutOfStock(product)

  return (
    <Link
      to={href}
      className={cn(
        'group flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5 transition-shadow hover:shadow-sm',
        outOfStock && 'opacity-75',
        className,
      )}
    >
      {/* Image */}
      <div className="relative shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark">
        <ProductImage
          src={getProductImage(product)}
          alt={name}
          aspectRatio="square"
          className="rounded-xl"
        />
        <div className="absolute top-1 start-1">
          <ProductBadges
            isNew={isProductNew(product)}
            isFeatured={isProductFeatured(product)}
            outOfStock={outOfStock}
            className="static"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="text-sm md:text-base font-medium text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-2 leading-snug mb-1">
          {name || '—'}
        </h3>

        {product.categoryName && (
          <span className="text-xs text-tagadod-gray mb-1">{product.categoryName}</span>
        )}

        {showDescription && product.description && (
          <p className="text-xs text-tagadod-gray line-clamp-2 mb-2 hidden md:block">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <ProductPrice
            price={getProductPrice(product)}
            comparePrice={getProductComparePrice(product)}
            size="md"
          />
          <ProductActions
            product={product}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            size="sm"
          />
        </div>
      </div>
    </Link>
  )
}
