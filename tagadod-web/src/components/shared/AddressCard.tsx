import { MapPin, Trash2, Star } from 'lucide-react'
import type { Address } from '../../types/address'

interface AddressCardProps {
  address: Address
  onDelete?: (id: string) => void
  onSetDefault?: (id: string) => void
  onSelect?: (address: Address) => void
  selected?: boolean
}

export function AddressCard({ address, onDelete, onSetDefault, onSelect, selected }: AddressCardProps) {
  return (
    <div
      onClick={() => onSelect?.(address)}
      className={`rounded-xl p-4 border transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <MapPin size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {address.label || address.street || address.line1 || 'عنوان'}
            </p>
            {address.isDefault && (
              <span className="px-2 py-0.5 text-xs bg-secondary/10 text-secondary rounded-full">
                افتراضي
              </span>
            )}
          </div>
          <p className="text-xs text-tagadod-gray mt-1 line-clamp-2">
            {address.details || address.street || address.line1}
          </p>
          {address.city && <p className="text-xs text-tagadod-gray">{address.city}</p>}
        </div>
        <div className="flex items-center gap-1">
          {onSetDefault && !address.isDefault && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetDefault(address.id) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              title="تعيين كافتراضي"
            >
              <Star size={16} className="text-tagadod-gray" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(address.id) }}
              className="p-1.5 rounded-lg hover:bg-tagadod-red/10"
            >
              <Trash2 size={16} className="text-tagadod-red" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
