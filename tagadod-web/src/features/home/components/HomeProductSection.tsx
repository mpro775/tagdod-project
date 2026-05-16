import { useTranslation } from 'react-i18next'
import type { Product } from '../../../types/product'
import { ProductCard } from '../../../components/shared'
import { Container } from '../../../components/layout'
import { HomeSectionHeader } from './HomeSectionHeader'
import { ProductGridSkeleton } from './HomeSkeleton'
import { HomeEmptyState } from './HomeEmptyState'

interface HomeProductSectionProps {
  title: string
  subtitle?: string
  products?: Product[]
  isLoading?: boolean
  error?: unknown
  viewAllHref?: string
  viewAllLabel?: string
  emptyTitle?: string
  emptySubtitle?: string
  hideIfEmpty?: boolean
}

export function HomeProductSection({
  title,
  subtitle,
  products,
  isLoading,
  error,
  viewAllHref,
  viewAllLabel,
  emptyTitle,
  emptySubtitle,
  hideIfEmpty,
}: HomeProductSectionProps) {
  const { t } = useTranslation()

  if (hideIfEmpty && !isLoading && !error && (!products || products.length === 0)) {
    return null
  }

  return (
    <section className="py-8 md:py-12">
      <Container>
        <HomeSectionHeader
          title={title}
          subtitle={subtitle}
          actionLabel={viewAllLabel}
          actionHref={viewAllHref}
        />

        {isLoading ? (
          <ProductGridSkeleton count={5} />
        ) : error ? (
          <HomeEmptyState
            title={t('home.states.error')}
            subtitle={emptySubtitle}
          />
        ) : !products || products.length === 0 ? (
          <HomeEmptyState
            title={emptyTitle ?? t('home.states.emptyProducts')}
            subtitle={emptySubtitle}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
