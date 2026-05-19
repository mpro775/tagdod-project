import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tag, X } from 'lucide-react'
import { cn } from '@/utils'

type CartCouponBoxProps = {
  className?: string
}

export function CartCouponBox({ className }: CartCouponBoxProps) {
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const couponSupported = false

  if (!couponSupported) return null

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 500))
      setApplied(true)
    } catch {
      setError(t('cart.coupon.invalid', 'كود الخصم غير صالح'))
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setApplied(false)
    setCode('')
    setError(null)
  }

  return (
    <div className={cn('rounded-lg border border-gray-100 dark:border-white/10 p-3', className)}>
      {applied ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {t('cart.coupon.applied', 'تم تطبيق الكوبون')}: {code}
            </span>
          </div>
          <button
            onClick={handleRemove}
            aria-label={t('cart.actions.removeCoupon', 'إزالة الكوبون')}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={14} className="text-tagadod-gray" />
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
            {t('cart.coupon.title', 'هل لديك كوبون؟')}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(null)
              }}
              placeholder={t('cart.coupon.placeholder', 'أدخل كود الخصم')}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-tagadod-titles dark:text-tagadod-dark-titles placeholder:text-tagadod-gray focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleApply}
              disabled={loading || !code.trim()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                t('cart.actions.applyCoupon', 'تطبيق')
              )}
            </button>
          </div>
          {error && (
            <p className="text-xs text-tagadod-red mt-1.5">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
