import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import { ProductListingPage } from './listing/ProductListingPage'
import { mapListingStateToProductFilters, parseQueryParams } from './listing/productListing.helpers'
import type { ListingState } from './listing/productListing.types'
import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import { SEO } from '../../components/seo'

export function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const state = useMemo<ListingState>(() => parseQueryParams(searchParams.toString()), [searchParams])

  const filters = useMemo(() => mapListingStateToProductFilters(state), [state])

  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 2 * 60 * 1000,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <>
      <SEO title={t('productListing.titles.allProducts')} />
      <ProductListingPage
      title={t('productListing.titles.allProducts')}
      subtitle={t('productListing.subtitles.allProducts')}
      breadcrumbItems={[
        { label: t('nav.home'), href: '/home' },
        { label: t('productListing.titles.allProducts') },
      ]}
      products={productsData?.data ?? []}
      meta={productsData?.meta}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      categories={categories ?? []}
    />
    </>
  )
}
