import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Plus, Check, SlidersHorizontal } from 'lucide-react'
import type { Product } from '../../../types/product'
import { addToCartLocal } from '../../../services/cartService'
import { useFavorites } from '../../../hooks'
import { gradients } from '../../../theme'
import { cn } from '../../../utils'
import { hasProductVariants, isProductOutOfStock, getProductHref } from './productCard.helpers'

interface ProductActionsProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  className?: string
  size?: 'sm' | 'md'
}

export function ProductActions({
  product,
  isFavorite: isFavoriteProp,
  onToggleFavorite: onToggleFavoriteProp,
  className,
  size = 'md',
}: ProductActionsProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [addSuccess, setAddSuccess] = useState(false)
  const { isFavorite: isFavoriteFromHook, toggleFavorite: toggleFavoriteFromHook, loggedIn } = useFavorites()

  const outOfStock = isProductOutOfStock(product)
  const hasVariants = hasProductVariants(product)
  const canAddDirect = !hasVariants && !outOfStock

  const isFav = isFavoriteProp ?? isFavoriteFromHook(product.id)

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
      navigate(getProductHref(product))
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

  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 16 : 18

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Favorite */}
      <button
        onClick={handleToggleFavorite}
        className={cn(
          'rounded-full bg-white/90 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110',
          btnSize,
        )}
        aria-label={isFav ? t('productCard.removeFavorite') : t('productCard.favorite')}
      >
        <Heart
          size={iconSize}
          className={isFav ? 'fill-tagadod-red text-tagadod-red' : 'text-tagadod-gray'}
        />
      </button>

      {/* Add to cart */}
      <button
        onClick={handleAddClick}
        disabled={outOfStock}
        className={cn(
          'rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 disabled:hover:scale-100',
          btnSize,
        )}
        style={outOfStock ? { background: 'rgb(156 163 175)' } : { background: gradients.linerGreen }}
        aria-label={hasVariants ? t('product.variants') : t('productCard.addToCart')}
        title={hasVariants ? t('product.variants') : t('productCard.addToCart')}
      >
        {addSuccess ? (
          <Check size={iconSize} strokeWidth={2.5} />
        ) : hasVariants ? (
          <SlidersHorizontal size={iconSize} />
        ) : (
          <Plus size={iconSize} strokeWidth={2.5} />
        )}
      </button>
    </div>
  )
}
