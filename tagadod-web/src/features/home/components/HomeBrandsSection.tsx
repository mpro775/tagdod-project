import { useTranslation } from 'react-i18next'
import { HomeEmptyState } from './HomeEmptyState'

interface HomeBrandsSectionProps {
  brands?: Array<{ id: string; name: string; image?: string }>
}

export function HomeBrandsSection({ brands }: HomeBrandsSectionProps) {
  const { t } = useTranslation()

  // إذا لا توجد بيانات براندات، لا تعرض القسم
  if (!brands || brands.length === 0) {
    return null
  }

  return (
    <section className="py-8 md:py-12">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('home.sections.brands.title')}
        </h2>
        <p className="text-sm text-tagadod-gray mt-1">
          {t('home.sections.brands.subtitle')}
        </p>
      </div>

      {brands.length === 0 ? (
        <HomeEmptyState
          title={t('home.states.emptyCategories')}
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-tagadod-dark-gray border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-colors"
            >
              {brand.image ? (
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-12 h-12 object-contain mb-2"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-2">
                  {brand.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-medium text-tagadod-titles dark:text-tagadod-dark-titles text-center line-clamp-1">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
