import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'
import { EmptyState, GlobalButton } from '../../../components/shared'
import { useNavigate } from 'react-router-dom'

interface ProductListingEmptyStateProps {
  onClearFilters?: () => void
}

export function ProductListingEmptyState({
  onClearFilters,
}: ProductListingEmptyStateProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="py-12 md:py-20">
      <EmptyState
        icon={<Package size={56} strokeWidth={1.5} className="text-tagadod-gray/60" />}
        title={t('productListing.states.emptyTitle')}
        subtitle={t('productListing.states.emptySubtitle')}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onClearFilters && (
              <GlobalButton variant="outline" onClick={onClearFilters}>
                {t('productListing.toolbar.clearFilters')}
              </GlobalButton>
            )}
            <GlobalButton
              variant="outline"
              onClick={() => navigate('/categories')}
            >
              {t('categories.title')}
            </GlobalButton>
          </div>
        }
      />
    </div>
  )
}
