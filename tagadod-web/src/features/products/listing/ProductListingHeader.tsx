import { useTranslation } from 'react-i18next'
import { Container } from '../../../components/layout/Container'
import { Breadcrumbs, type BreadcrumbItem } from '../../../components/layout/Breadcrumbs'
import { Package, Search } from 'lucide-react'

interface ProductListingHeaderProps {
  title: string
  subtitle?: string
  breadcrumbItems: BreadcrumbItem[]
  total?: number
  categoryImage?: string
  searchQuery?: string
}

export function ProductListingHeader({
  title,
  subtitle,
  breadcrumbItems,
  total,
  categoryImage,
  searchQuery,
}: ProductListingHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-white dark:bg-tagadod-dark-gray border-b border-gray-100 dark:border-white/5">
      <Container>
        <Breadcrumbs items={breadcrumbItems} className="py-3" />

        <div className="pb-6">
          {categoryImage ? (
            <div
              className="h-32 md:h-40 rounded-2xl bg-cover bg-center mb-4 relative overflow-hidden"
              style={{ backgroundImage: `url(${categoryImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 start-4 md:bottom-6 md:start-6">
                <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-white/80 mt-1">{subtitle}</p>}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                {searchQuery ? <Search size={24} /> : <Package size={24} />}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-tagadod-gray mt-1">{subtitle}</p>
                )}
                {typeof total === 'number' && (
                  <p className="text-sm text-tagadod-gray mt-1">
                    {t('productListing.toolbar.resultsCount', { count: total })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
