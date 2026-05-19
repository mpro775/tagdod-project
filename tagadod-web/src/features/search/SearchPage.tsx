import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchProducts } from '../../services/searchService'
import { SearchInput } from '../../components/shared'
import { ProductListingPage } from '../products/listing/ProductListingPage'
import { parseQueryParams, mapListingStateToSearchParams } from '../products/listing/productListing.helpers'
import type { ListingState } from '../products/listing/productListing.types'
import { SEO } from '../../components/seo'
import { trackSearch, trackPageView } from '../../lib/analytics'

export function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(urlQuery)
  const [searchTerm, setSearchTerm] = useState(urlQuery)

  const handleSearch = useCallback((value: string) => {
    const trimmed = value.trim()
    setSearchTerm(trimmed)
    setSearchParams({ q: trimmed })
    if (trimmed) {
      trackSearch(trimmed)
    }
  }, [setSearchParams])

  useEffect(() => {
    trackPageView('/search', 'Search')
  }, [])

  const state = useMemo<ListingState>(() => {
    const fromUrl = parseQueryParams(searchParams.toString())
    return {
      ...fromUrl,
      filters: {
        ...fromUrl.filters,
        q: searchTerm,
      },
    }
  }, [searchParams, searchTerm])

  const params = useMemo(() => mapListingStateToSearchParams(state, searchTerm), [state, searchTerm])

  const {
    data: results,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['searchProducts', params],
    queryFn: () => searchProducts(params),
    enabled: searchTerm.length >= 2,
  })

  const hasSearched = searchTerm.length >= 2

  // Pre-search UI (no query yet)
  if (!hasSearched) {
    return (
      <>
        <SEO title={t('search.title')} noIndex />
        <div className="min-h-screen pb-24">
        <div className="sticky top-0 z-30 bg-tagadod-light-bg dark:bg-tagadod-dark-bg px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5">
          <SearchInput
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder={t('productListing.subtitles.searchEmpty')}
          />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <Search size={48} strokeWidth={1.5} className="text-tagadod-gray/50 mb-4" />
          <p className="text-tagadod-gray text-sm">{t('productListing.subtitles.searchEmpty')}</p>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <SEO title={t('productListing.titles.searchResultsFor', { query: searchTerm })} noIndex />
      <div className="sticky top-0 z-30 bg-tagadod-light-bg dark:bg-tagadod-dark-bg px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5 md:hidden">
        <SearchInput
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          placeholder={t('search.placeholder')}
        />
      </div>
      <ProductListingPage
        title={t('productListing.titles.searchResultsFor', { query: searchTerm })}
        subtitle={undefined}
        breadcrumbItems={[
          { label: t('nav.home'), href: '/home' },
          { label: t('productListing.titles.searchResults') },
        ]}
        searchQuery={searchTerm}
        products={results?.data ?? []}
        meta={results?.meta}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />
    </>
  )
}
