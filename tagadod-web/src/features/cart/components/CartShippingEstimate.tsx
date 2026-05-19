import { useTranslation } from 'react-i18next'
import { Truck } from 'lucide-react'

export function CartShippingEstimate() {
  const { t } = useTranslation()
  const shippingSupported = false

  if (!shippingSupported) return null

  return (
    <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Truck size={14} className="text-tagadod-gray" />
        <span className="text-xs font-medium text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('cart.shipping.estimateTitle', 'تقدير الشحن')}
        </span>
      </div>
      <p className="text-xs text-tagadod-gray">
        {t('cart.shipping.calculatedAtCheckout', 'يتم احتساب الشحن عند تأكيد الطلب.')}
      </p>
    </div>
  )
}
