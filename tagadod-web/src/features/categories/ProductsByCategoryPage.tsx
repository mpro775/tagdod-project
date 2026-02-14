import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
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

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['productsByCategory', id],
    queryFn: () => getProductsByCategory(id!),
    enabled: !!id,
  })

  const isLoading = categoryLoading || productsLoading
  const products = productsData?.data ?? []

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

      {/* Products grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardShimmer key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
