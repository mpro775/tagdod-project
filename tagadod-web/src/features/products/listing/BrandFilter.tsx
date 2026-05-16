import { useTranslation } from 'react-i18next'
import { FilterGroup } from './FilterGroup'

interface BrandFilterProps {
  brands: string[]
  activeBrand?: string
  onSelectBrand: (brand?: string) => void
}

export function BrandFilter({ brands, activeBrand, onSelectBrand }: BrandFilterProps) {
  const { t } = useTranslation()

  if (!brands || brands.length === 0) return null

  return (
    <FilterGroup title={t('productListing.filters.brand')}>
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        <button
          type="button"
          onClick={() => onSelectBrand(undefined)}
          className="w-full text-start px-2 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            color: !activeBrand ? 'var(--color-primary, #2563eb)' : undefined,
            backgroundColor: !activeBrand ? 'rgba(37, 99, 235, 0.08)' : undefined,
          }}
        >
          {t('common.all')}
        </button>
        {brands.map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => onSelectBrand(brand)}
            className="w-full text-start px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            style={{
              color: activeBrand === brand ? 'var(--color-primary, #2563eb)' : undefined,
              backgroundColor: activeBrand === brand ? 'rgba(37, 99, 235, 0.08)' : undefined,
            }}
          >
            {brand}
          </button>
        ))}
      </div>
    </FilterGroup>
  )
}
