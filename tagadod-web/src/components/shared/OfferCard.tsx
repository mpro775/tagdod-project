import { Star, User } from 'lucide-react'
import type { ServiceOffer } from '../../types/maintenance'
import { formatPrice } from '../../stores/currencyStore'
import type { CurrencyCode } from '../../types/enums'

interface OfferCardProps {
  offer: ServiceOffer
  onAccept?: () => void
  onView?: () => void
}

export function OfferCard({ offer, onAccept, onView }: OfferCardProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {offer.engineerAvatar ? (
            <img src={offer.engineerAvatar} className="w-full h-full rounded-full object-cover" alt="" />
          ) : (
            <User size={20} className="text-primary" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {offer.engineerName ?? 'مهندس'}
          </p>
          {offer.engineerRating != null && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-tagadod-yellow text-tagadod-yellow" />
              <span className="text-xs text-tagadod-gray">{offer.engineerRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <span className="text-primary font-bold text-sm">
          {formatPrice(offer.price, offer.currency as CurrencyCode | undefined)}
        </span>
      </div>
      {offer.notes && (
        <p className="text-xs text-tagadod-gray mb-3">{offer.notes}</p>
      )}
      <div className="flex gap-2">
        {onView && (
          <button onClick={onView} className="flex-1 py-2 rounded-lg text-sm border border-gray-200 dark:border-white/10 text-tagadod-titles dark:text-tagadod-dark-titles">
            عرض التفاصيل
          </button>
        )}
        {onAccept && (
          <button onClick={onAccept} className="flex-1 py-2 rounded-lg text-sm bg-secondary text-white font-semibold">
            قبول العرض
          </button>
        )}
      </div>
    </div>
  )
}
