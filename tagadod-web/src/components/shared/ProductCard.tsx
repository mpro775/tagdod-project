import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Plus, Check, SlidersHorizontal } from 'lucide-react'
import type { Product } from '../../types/product'
import { formatPrice } from '../../stores/currencyStore'
import { addToCartLocal } from '../../services/cartService'
import { useFavorites } from '../../hooks'
import { gradients } from '../../theme'

interface ProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  /** Compact size for sliders/carousels */
  compact?: boolean
}

export function ProductCard({ product, isFavorite: isFavoriteProp, onToggleFavorite: onToggleFavoriteProp, compact }: ProductCardProps) {
  const navigate = useNavigate()
  const [addSuccess, setAddSuccess] = useState(false)
  const { isFavorite: isFavoriteFromHook, toggleFavorite: toggleFavoriteFromHook, loggedIn } = useFavorites()

  const hasVariants = product.hasVariants === true || (product.variants?.length ?? 0) > 0
  const canAddDirect = !hasVariants && product.inStock !== false

  const isFavorite = isFavoriteProp ?? isFavoriteFromHook(product.id)
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavoriteProp) {
      onToggleFavoriteProp(product.id)
      return
    }
    if (!loggedIn) {
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }
    await toggleFavoriteFromHook(product.id)
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasVariants) {
      navigate(`/products/${product.id}`)
      return
    }
    if (!canAddDirect || addSuccess) return
    addToCartLocal({
      id: `product:${product.id}`,
      productId: product.id,
      quantity: 1,
      price: product.price,
      product: {
        id: product.id,
        name: product.name,
        images: product.images ?? [],
        price: product.price,
      },
    })
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 1500)
  }

  const cardClass = compact
    ? 'rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm overflow-hidden group flex flex-col w-[160px] flex-shrink-0 snap-start'
    : 'rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm overflow-hidden group flex flex-col'

  return (
    <Link to={`/products/${product.id}`} className={cardClass}>
      <div className={`relative bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark ${compact ? 'aspect-square w-full' : 'aspect-square'}`}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tagadod-gray text-xs">
            —
          </div>
        )}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 end-2 rounded-full bg-white/80 dark:bg-black/40 ${compact ? 'p-1' : 'p-1.5'}`}
        >
          <Heart
            size={compact ? 14 : 18}
            className={isFavorite ? 'fill-tagadod-red text-tagadod-red' : 'text-tagadod-gray'}
          />
        </button>
        {!compact && (product.isFeatured || product.isNew) && (
          <div className="absolute top-2 start-2 flex flex-wrap gap-1">
            {product.isFeatured && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">مميز</span>
            )}
            {product.isNew && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">جديد</span>
            )}
          </div>
        )}
      </div>
      <div className={compact ? 'p-2.5 flex-1 flex flex-col min-h-0' : 'p-3 flex-1 flex flex-col'}>
        <p className={`text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-2 mb-1 text-sm ${compact ? 'leading-tight' : ''}`}>
          {product.name}
        </p>
        <div className={`flex items-center justify-between gap-1 mt-auto ${compact ? 'flex-wrap' : 'gap-2'}`}>
          <span className="text-primary font-semibold text-sm">{formatPrice(product.price)}</span>
          {!compact && product.originalPrice && product.originalPrice > product.price && (
            <span className="text-tagadod-gray text-xs line-through">{formatPrice(product.originalPrice)}</span>
          )}
          <button
            onClick={handleAddClick}
            disabled={product.inStock === false}
            className={`rounded-full flex items-center justify-center flex-shrink-0 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:scale-105 disabled:hover:scale-100 ${compact ? 'w-8 h-8' : 'w-9 h-9'}`}
            style={product.inStock !== false ? { background: gradients.linerGreen } : { background: 'rgb(156 163 175)' }}
            title={hasVariants ? 'عرض التفاصيل واختيار الخيارات' : 'إضافة للسلة'}
          >
            {addSuccess ? (
              <Check size={compact ? 16 : 18} strokeWidth={2.5} />
            ) : hasVariants ? (
              <SlidersHorizontal size={compact ? 16 : 18} />
            ) : (
              <Plus size={compact ? 16 : 18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
