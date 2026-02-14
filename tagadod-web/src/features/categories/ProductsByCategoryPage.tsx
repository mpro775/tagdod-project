import { useParams, useNavigate } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useRef, useCallback } from 'react'
import { getProductsByCategory } from '../../services/productService'
import { getCategoryById } from '../../services/categoryService'
import {
  ProductCard,
  ProductCardShimmer,
  EmptyState,
  GlobalButton,
} from '../../components/shared'

export function ProductsByCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  })

  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['productsByCategory', id],
    queryFn: ({ pageParam = 1 }) =>
      getProductsByCategory(id!, { page: pageParam, limit: 12 }),
    enabled: !!id,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta
      return page < totalPages ? page + 1 : undefined
    },
  })

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    }

    observerRef.current = new IntersectionObserver(handleObserver, option)

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  const isLoading = categoryLoading || productsLoading
  const products = productsData?.pages.flatMap((page) => page.data) ?? []

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-tagadod-light-bg dark:bg-tagadod-dark-bg px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowRight size={22} className="text-tagadod-titles dark:text-tagadod-dark-titles rtl:rotate-0 ltr:rotate-180" />
        </button>

        {categoryLoading ? (
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        ) : (
          <h1 className="text-lg font-bold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
            {category?.name ?? t('تصنيف')}
          </h1>
        )}
      </div>

      {/* Products grid – نفس كارد الصفحة الرئيسية */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardShimmer key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {/* Load more trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-tagadod-titles dark:text-tagadod-dark-titles">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('جاري تحميل المزيد...')}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <EmptyState
            title={t('لا توجد منتجات')}
            subtitle={t('لا توجد منتجات في هذا التصنيف حالياً')}
            action={
              <GlobalButton
                variant="outline"
                fullWidth={false}
                onClick={() => navigate('/allCategories')}
              >
                {t('تصفح التصنيفات')}
              </GlobalButton>
            }
          />
        )}
      </div>
    </div>
  )
}
