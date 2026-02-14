import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { gradients } from '../../theme'
import { useUserStore } from '../../stores/userStore'
import { getBanners } from '../../services/bannerService'
import { getRootCategoriesForHome } from '../../services/categoryService'
import { getNewProducts, getFeaturedProducts } from '../../services/productService'
import {
  ProductCard,
  ProductCardShimmer,
  SectionHeader,
  ShimmerBox,
} from '../../components/shared'

/* ------------------------------------------------------------------ */
/*  Banner Carousel                                                   */
/* ------------------------------------------------------------------ */
function BannerCarousel() {
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const count = banners?.length ?? 0

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % (count || 1))
  }, [count])

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + (count || 1)) % (count || 1))
  }, [count])

  // Auto‑slide
  useEffect(() => {
    if (count <= 1) return
    timerRef.current = setInterval(next, 4000)
    return () => {
      if (timerRef.current !== undefined) clearInterval(timerRef.current)
    }
  }, [count, next])

  if (isLoading) {
    return (
      <div className="px-4 mb-4 max-w-7xl mx-auto">
        <ShimmerBox className="w-full h-48 sm:h-56 md:h-72 lg:h-80 xl:h-96" rounded="rounded-2xl" />
      </div>
    )
  }

  if (!banners?.length) return null

  return (
    <div className="relative px-4 mb-4 group max-w-7xl mx-auto">
      {/* Slide container */}
      <div className="overflow-hidden rounded-2xl relative h-48 sm:h-56 md:h-72 lg:h-80 xl:h-96">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {banner.link ? (
              <Link to={banner.link} className="block w-full h-full">
                <img
                  src={banner.imageUrl}
                  alt={banner.altText ?? ''}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </Link>
            ) : (
              <img
                src={banner.imageUrl}
                alt={banner.altText ?? ''}
                className="w-full h-full object-cover rounded-2xl"
              />
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute start-6 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-white/70 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} className="rtl:hidden" />
            <ChevronLeft size={20} className="hidden rtl:block" />
          </button>
          <button
            onClick={next}
            className="absolute end-6 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-white/70 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} className="rtl:hidden" />
            <ChevronRight size={20} className="hidden rtl:block" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === current ? 'w-4 bg-primary' : 'w-1.5 bg-tagadod-gray/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Categories Strip – نفس أسلوب التطبيق                                 */
/* ------------------------------------------------------------------ */
function CategoriesStrip() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['rootCategories'],
    queryFn: getRootCategoriesForHome,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="px-4 mb-3">
          <ShimmerBox className="w-24" height={20} />
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerBox key={i} className="flex-shrink-0 w-[160px] h-[140px]" rounded="rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <SectionHeader title="التصنيفات" viewAllLink="/allCategories" />
      <div
        className="flex gap-4 px-4 pb-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {/* زر الكل */}
        <Link
          to="/allCategories"
          className="flex-shrink-0 w-[100px] h-[140px] min-w-[100px] rounded-2xl flex flex-col items-center justify-center gap-3 snap-start snap-always text-white"
          style={{ background: gradients.linerGreenReversed }}
        >
          <LayoutGrid size={44} strokeWidth={2} />
          <span className="text-base font-semibold">الكل</span>
        </Link>
        {/* فئات */}
        {(categories ?? []).map((cat) => (
          <Link
            key={cat.id}
            to={`/categories/${cat.id}/products`}
            className="flex-shrink-0 w-[160px] h-[140px] min-w-[160px] rounded-2xl flex flex-col items-center justify-center gap-3 snap-start snap-always overflow-hidden bg-gradient-to-br from-[#E4F5FF] to-[#C8EDFF] dark:from-[rgba(58,58,60,0.5)] dark:to-[#3A3A3C]"
          >
            <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-tagadod-gray text-4xl">{cat.icon ?? '📦'}</span>
              )}
            </div>
            <span className="text-base font-semibold text-tagadod-titles dark:text-tagadod-titles text-center line-clamp-2 px-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Products Grid (reusable)                                           */
/* ------------------------------------------------------------------ */
function ProductsGrid({
  queryKey,
  queryFn,
  title,
  viewAllLink,
}: {
  queryKey: string[]
  queryFn: () => Promise<{ data: import('../../types/product').Product[] }>
  title: string
  viewAllLink?: string
}) {
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  return (
    <div className="mb-6">
      <SectionHeader title={title} viewAllLink={viewAllLink} />
      {isLoading ? (
        <div className="grid grid-cols-4 gap-3 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardShimmer key={i} />
          ))}
        </div>
      ) : data?.data?.length ? (
        <div className="grid grid-cols-4 gap-3 px-4">
          {data.data.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                         */
/* ------------------------------------------------------------------ */
export function HomePage() {
  const { t } = useTranslation()
  const isEngineer = useUserStore((s) => s.isEngineer())

  return (
    <div className="pb-24">
      {/* Banner carousel */}
      <BannerCarousel />

      {/* Featured categories */}
      <CategoriesStrip />

      {/* New products */}
      <ProductsGrid
        queryKey={['newProducts']}
        queryFn={() => getNewProducts({ limit: 6 })}
        title={t('منتجات جديدة')}
        viewAllLink="/products?type=new"
      />

      {/* Featured products */}
      <ProductsGrid
        queryKey={['featuredProducts']}
        queryFn={() => getFeaturedProducts({ limit: 6 })}
        title={t('منتجات مميزة')}
        viewAllLink="/products?type=featured"
      />

      {/* FAB – حسب نوع المستخدم */}
      <Link
        to={isEngineer ? '/customers-orders' : '/maintenance-orders'}
        className="fixed start-4 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 px-4 py-3 text-white font-semibold rounded-full shadow-lg transition-all hover:scale-105"
        style={{ background: gradients.linerGreen }}
      >
        <span>{isEngineer ? 'طلبات العملاء' : 'اطلب مهندس'}</span>
      </Link>
    </div>
  )
}
