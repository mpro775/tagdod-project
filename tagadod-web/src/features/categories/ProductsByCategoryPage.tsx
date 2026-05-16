import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProductsByCategory } from '../../services/productService'
import { getCategoryById } from '../../services/categoryService'
import { ProductListingPage } from '../products/listing/ProductListingPage'
import { parseQueryParams, mapListingStateToProductFilters } from '../products/listing/productListing.helpers'
import type { ListingState } from '../products/listing/productListing.types'

export function ProductsByCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const state = useMemo<ListingState>(() => {
    const fromUrl = parseQueryParams(searchParams.toString())
    return {
      ...fromUrl,
      filters: {
        ...fromUrl.filters,
        categoryId: id,
      },
    }
  }, [searchParams, id])

  const filters = useMemo(() => mapListingStateToProductFilters(state), [state])

  const {
    data: productsData,
    isLoading: productsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['productsByCategory', id, filters],
    queryFn: () => getProductsByCategory(id!, filters),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const isLoading = categoryLoading || productsLoading

  return (
    <ProductListingPage
      title={category?.name ?? t('categories.title')}
      subtitle={t('productListing.subtitles.categoryProducts')}
      breadcrumbItems={[
        { label: t('nav.home'), href: '/home' },
        { label: t('categories.title'), href: '/categories' },
        { label: category?.name ?? t('categories.title') },
      ]}
      initialFilters={{ categoryId: id }}
      categoryData={
        category
          ? {
              id: category.id,
              name: category.name,
              image: category.image,
            }
          : undefined
      }
      products={productsData?.data ?? []}
      meta={productsData?.meta}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  )
}
