import { useTranslation } from 'react-i18next'
import { FilterGroup } from './FilterGroup'

interface StockFilterProps {
  inStock?: boolean
  onChange: (inStock?: boolean) => void
}

export function StockFilter({ inStock, onChange }: StockFilterProps) {
  const { t } = useTranslation()

  return (
    <FilterGroup title={t('productListing.filters.stock')}>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="stock-filter"
            checked={inStock === undefined}
            onChange={() => onChange(undefined)}
            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('common.all')}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="stock-filter"
            checked={inStock === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
          />
          <span className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('productListing.filters.inStock')}
          </span>
        </label>
      </div>
    </FilterGroup>
  )
}
