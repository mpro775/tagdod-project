import { Link } from 'react-router-dom'
import type { Product } from '../../../types/product'
import { cn } from '../../../utils'
import {
  getProductName,
  getProductImage,
  getProductPrice,
  getProductComparePrice,
  getProductDiscountPercent,
  getProductHref,
  isProductOutOfStock,
  isProductFeatured,
  isProductNew,
} from './productCard.helpers'
import { ProductImage } from './ProductImage'
import { ProductPrice } from './ProductPrice'
import { ProductBadges } from './ProductBadges'
import { ProductActions } from './ProductActions'

export interface ProductCardProps {
  product: Product
  className?: string
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
}

export function ProductCard({ product, className, isFavorite, onToggleFavorite }: ProductCardProps) {
  const name = getProductName(product)
  const href = getProductHref(product)
  const outOfStock = isProductOutOfStock(product)

  return (
    <Link
      to={href}
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5 overflow-hidden transition-shadow hover:shadow-md',
        outOfStock && 'opacity-75',
        className,
      )}
    >
      {/* Image area */}
      <div className="relative">
        <ProductImage
          src={getProductImage(product)}
          alt={name}
          aspectRatio="square"
          priority={false}
        />
        <ProductBadges
          isNew={isProductNew(product)}
          isFeatured={isProductFeatured(product)}
          discountPercent={getProductDiscountPercent(product)}
          outOfStock={outOfStock}
        />
        {/* Desktop hover quick actions */}
        <div className="absolute bottom-2 end-2 z-10 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity">
          <ProductActions
            product={product}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            size="sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 md:p-4 min-h-0">
        {/* Name */}
        <h3 className="text-sm md:text-base font-medium text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-2 leading-snug mb-1.5">
          {name || '—'}
        </h3>

        {/* Category hint if available */}
        {product.categoryName && (
          <span className="text-xs text-tagadod-gray mb-2">{product.categoryName}</span>
        )}

        {/* Price + actions row */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <ProductPrice
            price={getProductPrice(product)}
            comparePrice={getProductComparePrice(product)}
            size="md"
          />
          {/* Mobile actions always visible */}
          <div className="md:hidden shrink-0">
            <ProductActions
              product={product}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              size="sm"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
