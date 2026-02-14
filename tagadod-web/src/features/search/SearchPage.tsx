import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { searchProducts, getSearchSuggestions } from '../../services/searchService'
import {
  SearchInput,
  ProductCard,
  ProductCardShimmer,
  EmptyState,
} from '../../components/shared'

export function SearchPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value.trim())
  }, [])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion)
    setSearchTerm(suggestion)
  }, [])

  /* Suggestions query – fires as user types */
  const { data: suggestions } = useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: () => getSearchSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  })

  /* Products query – fires when user submits / debounce completes */
  const {
    data: results,
    isLoading: resultsLoading,
    isFetched,
  } = useQuery({
    queryKey: ['searchProducts', searchTerm],
    queryFn: () => searchProducts({ q: searchTerm }),
    enabled: searchTerm.length >= 2,
  })

  const products = results?.data ?? []
  const hasSearched = isFetched && searchTerm.length >= 2

  return (
    <div className="min-h-screen pb-24">
      {/* Search bar */}
      <div className="sticky top-0 z-30 bg-tagadod-light-bg dark:bg-tagadod-dark-bg px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5">
        <SearchInput
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          placeholder={t('ابحث عن منتج...')}
          suggestions={suggestions ?? []}
          onSuggestionClick={handleSuggestionClick}
        />
      </div>

      <div className="p-4">
        {/* Loading state */}
        {resultsLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardShimmer key={i} />
            ))}
          </div>
        )}

        {/* Results grid */}
        {!resultsLoading && products.length > 0 && (
          <>
            <p className="text-sm text-tagadod-gray mb-3">
              {results?.meta?.total ?? products.length} {t('نتيجة')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Empty – after search */}
        {!resultsLoading && hasSearched && products.length === 0 && (
          <EmptyState
            icon={<Search size={56} strokeWidth={1.5} />}
            title={t('لا توجد نتائج')}
            subtitle={t('جرّب كلمات بحث مختلفة أو تصفّح التصنيفات')}
          />
        )}

        {/* Initial – before search */}
        {!hasSearched && !resultsLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} strokeWidth={1.5} className="text-tagadod-gray/50 mb-4" />
            <p className="text-tagadod-gray text-sm">{t('ابحث عن المنتجات بالاسم أو الكلمات المفتاحية')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
