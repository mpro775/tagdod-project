import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid } from 'lucide-react'
import { getRootCategoriesForHome } from '../../../services/categoryService'
import { Container } from '../../../components/layout'
import { HomeSectionHeader } from './HomeSectionHeader'
import { CategoryGridSkeleton, CategoryStripSkeleton } from './HomeSkeleton'
import { HomeEmptyState } from './HomeEmptyState'

export function HomeCategoryShowcase() {
  const { t } = useTranslation()
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['rootCategories'],
    queryFn: getRootCategoriesForHome,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const displayedCategories = categories?.slice(0, 8) ?? []

  return (
    <section className="py-8 md:py-12">
      <Container>
        <HomeSectionHeader
          title={t('home.sections.categories.title')}
          subtitle={t('home.sections.categories.subtitle')}
          actionLabel={t('home.sections.categories.viewAll')}
          actionHref="/categories"
        />

        {isLoading ? (
          <>
            <div className="hidden md:block">
              <CategoryGridSkeleton count={6} />
            </div>
            <div className="md:hidden">
              <CategoryStripSkeleton count={6} />
            </div>
          </>
        ) : error ? (
          <HomeEmptyState
            title={t('home.states.error')}
            subtitle={t('home.states.emptyCategories')}
          />
        ) : displayedCategories.length === 0 ? (
          <HomeEmptyState
            title={t('home.states.emptyCategories')}
          />
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* زر الكل */}
              <Link
                to="/categories"
                className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-secondary to-[#8BC543] text-white transition-transform hover:scale-[1.02]"
              >
                <LayoutGrid size={32} strokeWidth={2} />
                <span className="text-sm font-semibold">{t('common.all')}</span>
              </Link>

              {displayedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.id}/products`}
                  className="group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all hover:shadow-sm"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-2xl">{cat.icon ?? '📦'}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
                      {cat.name}
                    </span>
                    {typeof cat.productsCount === 'number' && (
                      <span className="text-xs text-tagadod-gray mt-0.5 block">
                        {cat.productsCount} {t('categories.products')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile horizontal scroll */}
            <div className="md:hidden flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
              <Link
                to="/categories"
                className="flex-shrink-0 w-[110px] h-[130px] rounded-2xl flex flex-col items-center justify-center gap-2 snap-start snap-always text-white"
                style={{ background: 'linear-gradient(135deg, #159647 0%, #8BC543 100%)' }}
              >
                <LayoutGrid size={32} strokeWidth={2} />
                <span className="text-sm font-semibold">{t('common.all')}</span>
              </Link>

              {displayedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.id}/products`}
                  className="flex-shrink-0 w-[140px] h-[130px] rounded-2xl flex flex-col items-center justify-center gap-2 snap-start snap-always bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5 overflow-hidden"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-10 h-10 object-contain" loading="lazy" />
                    ) : (
                      <span className="text-2xl">{cat.icon ?? '📦'}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles text-center line-clamp-2 px-2">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  )
}
