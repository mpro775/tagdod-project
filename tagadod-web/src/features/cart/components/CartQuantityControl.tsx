import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils'

type CartQuantityControlProps = {
  quantity: number
  stock?: number
  onIncrease: () => void
  onDecrease: () => void
  isUpdating?: boolean
  size?: 'sm' | 'md'
}

export function CartQuantityControl({
  quantity,
  stock,
  onIncrease,
  onDecrease,
  isUpdating,
  size = 'md',
}: CartQuantityControlProps) {
  const { t } = useTranslation()
  const atMin = quantity <= 1
  const atMax = stock !== undefined && quantity >= stock
  const disabled = isUpdating

  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  const iconSize = size === 'sm' ? 14 : 16
  const textSize = size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || atMin}
        aria-label={t('cart.actions.decrease', 'تقليل الكمية')}
        className={cn(
          btnSize,
          'rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-200 dark:hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        )}
      >
        <Minus size={iconSize} />
      </button>
      <span className={cn(textSize, 'w-8 text-center font-semibold text-tagadod-titles dark:text-tagadod-dark-titles')}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled || atMax}
        aria-label={t('cart.actions.increase', 'زيادة الكمية')}
        className={cn(
          btnSize,
          'rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        )}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  )
}
