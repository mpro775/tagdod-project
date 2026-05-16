import { useTranslation } from 'react-i18next'
import { cn } from '../../../utils'

interface ProductPriceProps {
  price: number
  comparePrice?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ProductPrice({ price, comparePrice, className, size = 'md' }: ProductPriceProps) {
  const { t } = useTranslation()

  const hasDiscount = typeof comparePrice === 'number' && comparePrice > price && price >= 0

  const priceSize =
    size === 'lg'
      ? 'text-lg md:text-xl'
      : size === 'sm'
        ? 'text-sm'
        : 'text-sm md:text-base'

  const compareSize = size === 'lg' ? 'text-sm md:text-base' : 'text-xs md:text-sm'

  if (price === undefined || price === null) {
    return (
      <span className={cn('text-tagadod-gray font-medium', priceSize, className)}>
        {t('productCard.priceUnavailable')}
      </span>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      <span className={cn('font-bold text-primary', priceSize)}>
        {price.toLocaleString()}
      </span>
      {hasDiscount && (
        <span className={cn('text-tagadod-gray line-through', compareSize)}>
          {comparePrice.toLocaleString()}
        </span>
      )}
    </div>
  )
}
