import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners } from '../../services/bannerService'
import { getNewProducts, getFeaturedProducts, getProducts } from '../../services/productService'
import { ShimmerBox } from '../../components/shared'
import { Container } from '../../components/layout'
import { SEO } from '../../components/seo'
import { trackPageView } from '../../lib/analytics'
import {
  HomeHeroSection,
  HomeCategoryShowcase,
  HomeTrustFeatures,
  HomeProductSection,
  HomeBrandsSection,
  HomeServiceSection,
} from './components'

/* ------------------------------------------------------------------ */
/*  Banner Carousel (retained from previous version)                  */
/* ------------------------------------------------------------------ */
function BannerCarousel() {
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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

  useEffect(() => {
    if (count <= 1) return
    timerRef.current = setInterval(next, 4000)
    return () => {
      if (timerRef.current !== undefined) clearInterval(timerRef.current)
    }
  }, [count, next])

  if (isLoading) {
    return (
      <div className="mb-6 md:mb-8">
        <Container>
          <ShimmerBox className="w-full h-48 sm:h-56 md:h-72 lg:h-80 xl:h-96" rounded="rounded-2xl" />
        </Container>
      </div>
    )
  }

  if (!banners?.length) return null

  return (
    <section className="mb-6 md:mb-8">
      <Container>
        <div className="relative group">
          <div className="overflow-hidden rounded-2xl md:rounded-3xl relative h-48 sm:h-56 md:h-72 lg:h-80 xl:h-96 border border-white/50 dark:border-white/10 shadow-sm">
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
                      className="w-full h-full object-cover"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </Link>
                ) : (
                  <img
                    src={banner.imageUrl}
                    alt={banner.altText ?? ''}
                    className="w-full h-full object-cover"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute start-3 md:start-5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/85 dark:bg-black/45 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow"
                aria-label="Previous"
              >
                <ChevronRight size={20} className="rtl:hidden" />
                <ChevronLeft size={20} className="hidden rtl:block" />
              </button>
              <button
                onClick={next}
                className="absolute end-3 md:end-5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/85 dark:bg-black/45 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow"
                aria-label="Next"
              >
                <ChevronLeft size={20} className="rtl:hidden" />
                <ChevronRight size={20} className="hidden rtl:block" />
              </button>
            </>
          )}

          {count > 1 && (
            <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === current ? 'w-5 bg-white' : 'w-1.5 bg-white/55'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                         */
/* ------------------------------------------------------------------ */
export function HomePage() {
  const { t } = useTranslation()

  useEffect(() => {
    trackPageView('/home', 'Home')
  }, [])

  const featuredQuery = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => getFeaturedProducts({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const newQuery = useQuery({
    queryKey: ['newProducts'],
    queryFn: () => getNewProducts({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const offersQuery = useQuery({
    queryKey: ['offerProducts'],
    queryFn: () => getProducts({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const offerProducts = (offersQuery.data?.data ?? []).filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  )

  // استخراج براندات فريدة من المنتجات إن وجدت
  const allProducts = [
    ...(featuredQuery.data?.data ?? []),
    ...(newQuery.data?.data ?? []),
    ...(offersQuery.data?.data ?? []),
  ]
  const brandMap = new Map<string, { id: string; name: string; image?: string }>()
  // TODO: إذا أضيف حقل brand للمنتجات في المستقبل، استخدمه هنا
  // حاليًا لا توجد بيانات براندات كافية، لذا يُرجع مصفوفة فارغة
  void allProducts
  const brands = Array.from(brandMap.values())

  return (
    <>
      <SEO title={t('layout.nav.home')} description={t('home.hero.subtitle')} />
      <div className="bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Hero Commerce Section */}
      <HomeHeroSection />

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Categories Showcase */}
      <HomeCategoryShowcase />

      {/* Trust Features */}
      <HomeTrustFeatures />

      {/* Featured Products */}
      <HomeProductSection
        title={t('home.sections.featuredProducts.title')}
        subtitle={t('home.sections.featuredProducts.subtitle')}
        products={featuredQuery.data?.data}
        isLoading={featuredQuery.isLoading}
        error={featuredQuery.error}
        viewAllHref="/products?type=featured"
        viewAllLabel={t('home.sections.featuredProducts.viewAll')}
        emptyTitle={t('home.states.emptyProducts')}
      />

      {/* New Products */}
      <HomeProductSection
        title={t('home.sections.newProducts.title')}
        subtitle={t('home.sections.newProducts.subtitle')}
        products={newQuery.data?.data}
        isLoading={newQuery.isLoading}
        error={newQuery.error}
        viewAllHref="/products?type=new"
        viewAllLabel={t('home.sections.newProducts.viewAll')}
        emptyTitle={t('home.states.emptyProducts')}
      />

      {/* Offers / Deals — مخفي إذا لا توجد عروض */}
      <HomeProductSection
        title={t('home.sections.offers.title')}
        subtitle={t('home.sections.offers.subtitle')}
        products={offerProducts}
        isLoading={offersQuery.isLoading}
        error={offersQuery.error}
        viewAllHref="/products?type=offers"
        viewAllLabel={t('home.sections.offers.viewAll')}
        hideIfEmpty
      />

      {/* Brands — مخفي إذا لا توجد بيانات */}
      <HomeBrandsSection brands={brands} />

      {/* Service / Maintenance CTA */}
      <HomeServiceSection />
    </div>
    </>
  )
}
