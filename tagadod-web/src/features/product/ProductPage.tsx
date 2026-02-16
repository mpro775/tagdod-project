import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getProductById } from '../../services/productService'
import { addToCartLocal } from '../../services/cartService'
import { formatPrice } from '../../stores/currencyStore'
import { useFavorites } from '../../hooks'
import {
  GlobalButton,
  ProductCard,
  ShimmerBox,
} from '../../components/shared'

/* ------------------------------------------------------------------ */
/*  Image Gallery                                                      */
/* ------------------------------------------------------------------ */
function ImageGallery({ images }: { images: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const safeImages = images?.length ? images : []

  if (!safeImages.length) {
    return (
      <div className="aspect-square bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark rounded-2xl flex items-center justify-center mb-4">
        <span className="text-tagadod-gray">لا توجد صورة</span>
      </div>
    )
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[4/3] md:aspect-[5/4] rounded-2xl overflow-hidden bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark group border border-gray-100 dark:border-white/10">
        <img
          src={safeImages[activeIdx]}
          alt=""
          className="w-full h-full object-contain p-3 md:p-4"
        />

        {safeImages.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx((p) => (p - 1 + safeImages.length) % safeImages.length)}
              className="absolute start-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/70 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={18} className="rtl:hidden" />
              <ChevronLeft size={18} className="hidden rtl:block" />
            </button>
            <button
              onClick={() => setActiveIdx((p) => (p + 1) % safeImages.length)}
              className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/70 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={18} className="rtl:hidden" />
              <ChevronRight size={18} className="hidden rtl:block" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === activeIdx
                  ? 'border-primary'
                  : 'border-transparent hover:border-tagadod-gray/30'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain bg-white dark:bg-tagadod-dark-gray" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function VideoSection({ videos }: { videos?: Array<{ id: string; url: string; thumbnailUrl?: string; status?: 'processing' | 'ready' | 'failed' }> }) {
  if (!videos || videos.length === 0) return null
  const video = videos[0]

  if (!video.url) return null

  return (
    <div className="mt-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray p-3">
      <h4 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">فيديو المنتج</h4>
      {video.status === 'processing' ? (
        <div className="text-sm text-tagadod-gray">جاري معالجة الفيديو...</div>
      ) : (
        <video
          controls
          preload="metadata"
          poster={video.thumbnailUrl}
          className="w-full max-h-[360px] rounded-xl bg-black/80"
          src={video.url}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Variant Selector                                                   */
/* ------------------------------------------------------------------ */
function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: import('../../types/product').ProductVariant[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (!variants?.length) return null

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
        الخيارات المتاحة
      </h4>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            disabled={!v.inStock}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              selectedId === v.id
                ? 'border-primary bg-primary/10 text-primary'
                : v.inStock
                  ? 'border-gray-200 dark:border-white/10 text-tagadod-titles dark:text-tagadod-dark-titles hover:border-primary/50'
                  : 'border-gray-200 dark:border-white/5 text-tagadod-gray opacity-50 cursor-not-allowed line-through'
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Product Page                                                       */
/* ------------------------------------------------------------------ */
export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)
  const { isFavorite, toggleFavorite, loggedIn } = useFavorites()

  const { data: productDetail, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  const product = productDetail?.product
  const relatedProducts = productDetail?.relatedProducts ?? []

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    const activeVariant = product.variants?.find((v) => v.id === selectedVariant)
    const displayPrice = activeVariant?.price ?? product.price
    const displayImage = activeVariant?.image ?? product.images?.[0]
    addToCartLocal({
      id: activeVariant ? `variant:${activeVariant.id}` : `product:${product.id}`,
      productId: product.id,
      variantId: selectedVariant ?? undefined,
      quantity: 1,
      price: displayPrice,
      variantName: activeVariant?.name,
      product: {
        id: product.id,
        name: product.name,
        images: displayImage ? [displayImage] : product.images ?? [],
        price: displayPrice,
      },
    })
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 1500)
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    if (!loggedIn) {
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }
    await toggleFavorite(product.id)
  }

  /* Loading state */
  if (isLoading) {
    return (
      <div className="p-4 pb-24 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <ShimmerBox className="w-8 h-8" rounded="rounded-lg" />
          <ShimmerBox className="w-32" height={20} />
        </div>
        <ShimmerBox className="w-full aspect-square" rounded="rounded-2xl" />
        <ShimmerBox className="w-3/4" height={24} />
        <ShimmerBox className="w-full" height={14} />
        <ShimmerBox className="w-full" height={14} />
        <ShimmerBox className="w-1/3" height={28} />
        <ShimmerBox className="w-full" height={48} rounded="rounded-xl" />
      </div>
    )
  }

  if (!product) return null

  const activeVariant = product.variants?.find((v) => v.id === selectedVariant)
  const displayPrice = activeVariant?.price ?? product.price
  const displayOriginalPrice = activeVariant?.originalPrice ?? product.originalPrice

  return (
    <div className="pb-36 md:pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-tagadod-light-bg dark:bg-tagadod-dark-bg px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowRight size={22} className="text-tagadod-titles dark:text-tagadod-dark-titles rtl:rotate-0 ltr:rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1 max-w-[200px]">
            {product.name}
          </h1>
        </div>

        <button
          onClick={handleToggleFavorite}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Heart
            size={22}
            className={isFavorite(product.id) ? 'fill-tagadod-red text-tagadod-red' : 'text-tagadod-gray'}
          />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="lg:sticky lg:top-20">
            <ImageGallery images={product.images} />
            <VideoSection videos={product.videos} />
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray p-4 md:p-5">
            <h2 className="text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-2 leading-snug">
              {product.name}
            </h2>

            {product.categoryName && (
              <span className="inline-block text-xs text-tagadod-gray bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full mb-3">
                {product.categoryName}
              </span>
            )}

            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(displayPrice)}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-tagadod-gray line-through text-sm">
                  {formatPrice(displayOriginalPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-tagadod-gray leading-relaxed mb-5">
                {product.description}
              </p>
            )}

            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selectedId={selectedVariant}
                onSelect={setSelectedVariant}
              />
            )}

            {product.inStock === false && (
              <div className="mb-1 px-3 py-2 bg-tagadod-red/10 text-tagadod-red text-sm font-medium rounded-lg text-center">
                {t('غير متوفر حالياً')}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8 mb-4">
            <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
              {t('منتجات ذات صلة')}
            </h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar – Add to cart (أعلى الشريط السفلي) */}
      <div className="fixed bottom-20 left-4 right-4 z-10 flex items-center justify-between p-4 bg-white dark:bg-tagadod-dark-gray rounded-xl shadow-lg border border-gray-100 dark:border-white/10 md:static md:mt-6 md:mx-auto md:w-full md:max-w-[560px]">
        <div className="flex-1">
          <span className="text-lg font-bold text-primary">{formatPrice(displayPrice)}</span>
        </div>
        <GlobalButton
          fullWidth={false}
          className="min-w-[160px]"
          onClick={handleAddToCart}
          disabled={product.inStock === false}
        >
          <ShoppingCart size={18} />
          <span>{addSuccess ? t('تمت الإضافة', 'تمت الإضافة') : t('إضافة للسلة')}</span>
        </GlobalButton>
      </div>
    </div>
  )
}
