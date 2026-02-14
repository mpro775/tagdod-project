import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '../../types/product'
import { formatPrice } from '../../stores/currencyStore'

interface ProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
}

export function ProductCard({ product, isFavorite, onToggleFavorite }: ProductCardProps) {
  return (
    <Link to={`/products/${product.id}`} className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm overflow-hidden group">
      <div className="relative aspect-square bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tagadod-gray text-xs">
            لا توجد صورة
          </div>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavorite(product.id)
            }}
            className="absolute top-2 end-2 p-1.5 rounded-full bg-white/80 dark:bg-black/40"
          >
            <Heart
              size={18}
              className={isFavorite ? 'fill-tagadod-red text-tagadod-red' : 'text-tagadod-gray'}
            />
          </button>
        )}
        {product.isNew && (
          <span className="absolute top-2 start-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
            جديد
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-2 mb-1">
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-primary font-semibold text-sm">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-tagadod-gray text-xs line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
