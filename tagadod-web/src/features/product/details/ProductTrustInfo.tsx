import { useTranslation } from 'react-i18next'
import { Shield, Truck, RotateCcw, Headphones } from 'lucide-react'

interface ProductTrustInfoProps {
  className?: string
}

export function ProductTrustInfo({ className }: ProductTrustInfoProps) {
  const { t } = useTranslation()

  const trustItems = [
    {
      icon: Shield,
      title: t('productDetails.trust.warranty.title'),
      subtitle: t('productDetails.trust.warranty.subtitle'),
    },
    {
      icon: Truck,
      title: t('productDetails.trust.delivery.title'),
      subtitle: t('productDetails.trust.delivery.subtitle'),
    },
    {
      icon: RotateCcw,
      title: t('productDetails.trust.returns.title'),
      subtitle: t('productDetails.trust.returns.subtitle'),
    },
    {
      icon: Headphones,
      title: t('productDetails.trust.support.title'),
      subtitle: t('productDetails.trust.support.subtitle'),
    },
  ]

  return (
    <div className={`grid grid-cols-2 gap-3 ${className ?? ''}`}>
      {trustItems.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5"
        >
          <div className="flex-shrink-0 mt-0.5">
            <item.icon size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {item.title}
            </p>
            <p className="text-xs text-tagadod-gray mt-0.5 leading-snug">
              {item.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
