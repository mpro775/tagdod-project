import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getProductById } from '../../../services/productService'
import { addToCartLocal } from '../../../services/cartService'
import { useFavorites } from '../../../hooks'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs'
import { Container } from '../../../components/layout/Container'
import { SEO } from '../../../components/seo'
import { ProductGallery } from './ProductGallery'
import { ProductPurchasePanel } from './ProductPurchasePanel'
import { ProductInfoTabs } from './ProductInfoTabs'
import { ProductMobileStickyBar } from './ProductMobileStickyBar'
import { RelatedProductsSection } from './RelatedProductsSection'
import { RecentlyViewedSection, trackRecentlyViewed } from './RecentlyViewedSection'
import { ProductDetailsSkeleton } from './ProductDetailsSkeleton'
import { ProductNotFoundState } from './ProductNotFoundState'
import { ProductDetailsErrorState } from './ProductDetailsErrorState'
import {
  getProductBreadcrumbItems,
  getProductImages,
  getProductName,
  isProductInStock,
  getProductSpecifications,
} from './productDetails.helpers'
import { trackViewProduct } from '../../../lib/analytics'
import type { ProductVariant } from '../../../types/product'

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { isFavorite, toggleFavorite, loggedIn } = useFavorites()

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addSuccess, setAddSuccess] = useState(false)

  const { data: productDetail, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const product = productDetail?.product
  const relatedProducts = productDetail?.relatedProducts ?? []

  const selectedVariant = product?.variants?.find(
    (v) => v.id === selectedVariantId,
  ) as ProductVariant | undefined

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id])

  useEffect(() => {
    if (product) {
      trackRecentlyViewed({
        id: product.id,
        name: product.name,
        images: product.images ?? [],
        price: product.price,
        originalPrice: product.originalPrice,
        inStock: product.inStock,
      })
      trackViewProduct({
        id: product.id,
        name: product.name,
        price: product.price,
      })
    }
  }, [product?.id, product])

  const handleVariantSelect = (variantId: string | null) => {
    setSelectedVariantId(variantId)
    setQuantity(1)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
  }

  const handleAddToCart = () => {
    if (!product) return
    const inStock = isProductInStock(product, selectedVariant)
    if (!inStock) return

    const needsVariantSelection = product.hasVariants && product.variants && product.variants.length > 0 && !selectedVariant
    if (needsVariantSelection) return

    const activeVariant = selectedVariant
    const displayPrice = activeVariant?.price ?? product.price
    const displayImage = activeVariant?.image ?? product.images?.[0]

    addToCartLocal({
      id: activeVariant ? `variant:${activeVariant.id}` : `product:${product.id}`,
      productId: product.id,
      variantId: selectedVariantId ?? undefined,
      quantity,
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

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['product', id] })
  }

  if (isLoading) {
    return <ProductDetailsSkeleton />
  }

  if (isError) {
    return <ProductDetailsErrorState onRetry={handleRetry} />
  }

  if (!product) {
    return <ProductNotFoundState />
  }

  const inStock = isProductInStock(product, selectedVariant)
  const breadcrumbItems = getProductBreadcrumbItems(product, (key) =>
    t(`productDetails.${key}`),
  )
  const specs = getProductSpecifications(product)
  const productImages = getProductImages(product)
  const mainImage = productImages[0]

  return (
    <>
      <SEO
        title={product.name}
        description={product.description?.substring(0, 160) || product.name}
        image={mainImage}
        type="product"
      />
      <div className="pb-24 md:pb-12">
      <Container>
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Main area */}
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Gallery */}
          <div className="lg:sticky lg:top-20">
            <ProductGallery
              images={getProductImages(product)}
              productName={getProductName(product)}
            />
          </div>

          {/* Purchase Panel */}
          <ProductPurchasePanel
            product={product}
            selectedVariant={selectedVariant}
            quantity={quantity}
            onVariantSelect={handleVariantSelect}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite(product.id)}
            addSuccess={addSuccess}
          />
        </div>

        {/* Info Tabs */}
        <div className="mt-8">
          <ProductInfoTabs
            description={product.description || product.descriptionAr}
            specifications={specs}
            product={product}
          />
        </div>

        {/* Related Products */}
        <RelatedProductsSection
          products={relatedProducts}
          currentProductId={product.id}
          title={t('productDetails.sections.relatedProducts')}
        />

        {/* Recently Viewed */}
        <RecentlyViewedSection
          currentProductId={product.id}
          title={t('productDetails.sections.recentlyViewed')}
        />
      </Container>

      {/* Mobile Sticky Bar */}
      <ProductMobileStickyBar
        product={product}
        selectedVariant={selectedVariant}
        onAddToCart={handleAddToCart}
        inStock={inStock}
        addSuccess={addSuccess}
      />
    </div>
    </>
  )
}
