import { useTranslation } from 'react-i18next'
import { Heart, Share2, Check } from 'lucide-react'
import { formatPrice } from '../../../stores/currencyStore'
import { ProductQuantitySelector } from './ProductQuantitySelector'
import { ProductVariantSelector } from './ProductVariantSelector'
import { ProductTrustInfo } from './ProductTrustInfo'
import {
  getProductPrice,
  getProductComparePrice,
  getProductSku,
  getProductCategory,
  isProductInStock,
} from './productDetails.helpers'
import type { Product, ProductVariant } from '../../../types/product'

interface ProductPurchasePanelProps {
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

export function ProductPurchasePanel({
  product,
  selectedVariant,
  quantity,
  onVariantSelect,
  onQuantityChange,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  addSuccess,
}: ProductPurchasePanelProps) {
  const { t } = useTranslation()

  const price = getProductPrice(product, selectedVariant)
  const comparePrice = getProductComparePrice(product, selectedVariant)
  const inStock = isProductInStock(product, selectedVariant)
  const sku = getProductSku(product, selectedVariant)
  const category = getProductCategory(product)
  const hasVariants = product.variants && product.variants.length > 0
  const needsVariantSelection = product.hasVariants && hasVariants && !selectedVariant

  const discountPercent = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray p-4 md:p-6">
      {/* Product name */}
      <h1 className="text-xl md:text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles leading-snug mb-3">
        {product.name}
      </h1>

      {/* Category badge */}
      {category && (
        <span className="inline-block text-xs text-tagadod-gray bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-full mb-4">
          {category}
        </span>
      )}

      {/* Price section */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl md:text-3xl font-bold text-primary">
          {formatPrice(price)}
        </span>
        {comparePrice && (
          <>
            <span className="text-tagadod-gray line-through text-sm">
              {formatPrice(comparePrice)}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs font-semibold text-tagadod-red bg-tagadod-red/10 px-2 py-0.5 rounded-full">
                -{discountPercent}%
              </span>
            )}
          </>
        )}
      </div>

      {/* SKU */}
      {sku && (
        <div className="text-xs text-tagadod-gray mb-4">
          <span className="font-medium">{t('productDetails.labels.sku')}:</span> {sku}
        </div>
      )}

      {/* Stock status */}
      <div className={`text-sm font-medium mb-4 ${inStock ? 'text-green-600 dark:text-green-400' : 'text-tagadod-red'}`}>
        {inStock
          ? t('productDetails.stock.inStock')
          : t('productDetails.stock.outOfStock')}
      </div>

      {/* Variant selector */}
      {hasVariants && (
        <div className="mb-4">
          <label className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2 block">
            {t('productDetails.labels.selectVariant')}
          </label>
          <ProductVariantSelector
            variants={product.variants!}
            selectedId={selectedVariant?.id ?? null}
            onSelect={(id) => onVariantSelect(id)}
          />
        </div>
      )}

      {/* Quantity selector */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2 block">
          {t('productDetails.labels.quantity')}
        </label>
        <ProductQuantitySelector
          quantity={quantity}
          maxQuantity={selectedVariant?.quantity ?? product.quantity}
          inStock={inStock}
          onChange={onQuantityChange}
        />
      </div>

      {/* Add to cart button */}
      <button
        type="button"
        onClick={onAddToCart}
        disabled={!inStock || needsVariantSelection}
        className={`w-full py-3.5 px-6 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${
          !inStock || needsVariantSelection
            ? 'bg-gray-200 dark:bg-white/10 text-tagadod-gray cursor-not-allowed'
            : addSuccess
              ? 'bg-green-500 text-white'
              : 'text-white'
        }`}
        style={
          !(!inStock || needsVariantSelection)
            ? addSuccess
              ? {}
              : { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }
            : {}
        }
      >
        {addSuccess ? (
          <>
            <Check size={20} />
            <span>{t('product.addedToCart', 'Added!')}</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span>
              {needsVariantSelection
                ? t('productDetails.states.selectRequiredOptions')
                : t('productDetails.actions.addToCart')}
            </span>
          </>
        )}
      </button>

      {/* Favorite + Share */}
      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? t('productDetails.actions.removeFromFavorites') : t('productDetails.actions.addToFavorites')}
          className="flex items-center gap-1.5 text-sm text-tagadod-gray hover:text-tagadod-red transition-colors"
        >
          <Heart
            size={18}
            className={isFavorite ? 'fill-tagadod-red text-tagadod-red' : ''}
          />
          <span>
            {isFavorite
              ? t('productDetails.actions.removeFromFavorites')
              : t('productDetails.actions.addToFavorites')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: product.name,
                url: window.location.href,
              }).catch(() => {})
            } else {
              navigator.clipboard.writeText(window.location.href).catch(() => {})
            }
          }}
          aria-label={t('productDetails.actions.share')}
          className="flex items-center gap-1.5 text-sm text-tagadod-gray hover:text-primary transition-colors"
        >
          <Share2 size={18} />
          <span>{t('productDetails.actions.share')}</span>
        </button>
      </div>

      {/* Trust info */}
      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/10">
        <ProductTrustInfo />
      </div>
    </div>
  )
}
