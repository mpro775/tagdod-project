import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterGroup } from './FilterGroup'
import { useCurrencyStore } from '../../../stores/currencyStore'

interface PriceFilterProps {
  minPrice?: number
  maxPrice?: number
  onChange: (min?: number, max?: number) => void
}

export function PriceFilter({ minPrice, maxPrice, onChange }: PriceFilterProps) {
  const { t } = useTranslation()
  const currency = useCurrencyStore((s) => s.currency)

  const [min, setMin] = useState<string>(minPrice !== undefined ? String(minPrice) : '')
  const [max, setMax] = useState<string>(maxPrice !== undefined ? String(maxPrice) : '')

  const handleApply = useCallback(() => {
    const minNum = min ? parseFloat(min) : undefined
    const maxNum = max ? parseFloat(max) : undefined

    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      // Auto-swap if min > max
      onChange(maxNum, minNum)
      setMin(String(maxNum))
      setMax(String(minNum))
      return
    }

    if (minNum !== undefined && minNum < 0) return
    if (maxNum !== undefined && maxNum < 0) return

    onChange(minNum, maxNum)
  }, [min, max, onChange])

  const handleReset = useCallback(() => {
    setMin('')
    setMax('')
    onChange(undefined, undefined)
  }, [onChange])

  const currencySymbol = currency === 'USD' ? '$' : currency === 'SAR' ? 'ر.س' : 'ر.ي'

  const hasValues = min !== '' || max !== ''

  return (
    <FilterGroup title={t('productListing.filters.price')}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-tagadod-gray mb-1">
              {t('productListing.filters.minPrice')}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-tagadod-dark-bg px-3 py-2 text-sm text-tagadod-titles dark:text-tagadod-dark-titles focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="absolute end-2 top-1/2 -translate-y-1/2 text-xs text-tagadod-gray">
                {currencySymbol}
              </span>
            </div>
          </div>
          <span className="text-tagadod-gray pt-5">—</span>
          <div className="flex-1">
            <label className="block text-xs text-tagadod-gray mb-1">
              {t('productListing.filters.maxPrice')}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="∞"
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-tagadod-dark-bg px-3 py-2 text-sm text-tagadod-titles dark:text-tagadod-dark-titles focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="absolute end-2 top-1/2 -translate-y-1/2 text-xs text-tagadod-gray">
                {currencySymbol}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('productListing.filters.apply')}
          </button>
          {hasValues && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-tagadod-gray hover:text-tagadod-titles transition-colors"
            >
              {t('productListing.filters.reset')}
            </button>
          )}
        </div>
      </div>
    </FilterGroup>
  )
}
