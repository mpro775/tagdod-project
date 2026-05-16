import { useTranslation } from 'react-i18next'
import { cn } from '../../../utils'

interface ProductBadgesProps {
  isNew?: boolean
  isFeatured?: boolean
  discountPercent?: number
  outOfStock?: boolean
  className?: string
}

export function ProductBadges({
  isNew,
  isFeatured,
  discountPercent,
  outOfStock,
  className,
}: ProductBadgesProps) {
  const { t } = useTranslation()

  if (outOfStock) {
    return (
      <div className={cn('absolute top-2 start-2 z-10', className)}>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-500 text-white text-[10px] md:text-xs font-semibold">
          {t('productCard.outOfStock')}
        </span>
      </div>
    )
  }

  const badges: { text: string; className: string }[] = []

  if (typeof discountPercent === 'number' && discountPercent > 0) {
    badges.push({
      text: `${discountPercent}% ${t('productCard.off')}`,
      className: 'bg-tagadod-red text-white',
    })
  }

  if (isFeatured) {
    badges.push({
      text: t('productCard.featured'),
      className: 'bg-amber-500 text-white',
    })
  }

  if (isNew) {
    badges.push({
      text: t('productCard.new'),
      className: 'bg-primary text-white',
    })
  }

  if (badges.length === 0) return null

  return (
    <div className={cn('absolute top-2 start-2 z-10 flex flex-wrap gap-1 max-w-[80%]', className)}>
      {badges.slice(0, 2).map((b, i) => (
        <span
          key={i}
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold',
            b.className,
          )}
        >
          {b.text}
        </span>
      ))}
    </div>
  )
}
