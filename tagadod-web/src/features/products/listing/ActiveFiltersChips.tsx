import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '../../../utils'

interface ActiveFiltersChipsProps {
  chips: { key: string; label: string }[]
  onRemove: (key: string) => void
  onClearAll: () => void
}

export function ActiveFiltersChips({ chips, onRemove, onClearAll }: ActiveFiltersChipsProps) {
  const { t } = useTranslation()

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs text-tagadod-gray hidden md:inline">
        {t('productListing.toolbar.activeFilters')}:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs',
            'bg-primary/10 text-primary border border-primary/20'
          )}
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            aria-label={t('common.close')}
            className="inline-flex items-center justify-center hover:bg-primary/20 rounded-full p-0.5 transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-tagadod-gray hover:text-tagadod-titles underline transition-colors"
      >
        {t('productListing.toolbar.clearFilters')}
      </button>
    </div>
  )
}
