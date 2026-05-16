import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { EmptyState, GlobalButton } from '../../../components/shared'

interface ProductListingErrorStateProps {
  onRetry?: () => void
}

export function ProductListingErrorState({ onRetry }: ProductListingErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div className="py-12 md:py-20">
      <EmptyState
        icon={<AlertTriangle size={56} strokeWidth={1.5} className="text-red-400" />}
        title={t('productListing.states.errorTitle')}
        subtitle={t('productListing.states.errorSubtitle')}
        action={
          onRetry && (
            <GlobalButton onClick={onRetry}>
              {t('productListing.states.retry')}
            </GlobalButton>
          )
        }
      />
    </div>
  )
}
