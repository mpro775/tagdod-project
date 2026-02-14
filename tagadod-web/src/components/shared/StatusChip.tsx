import { SERVICE_REQUEST_STATUS_LABELS, ORDER_STATUS_LABELS } from '../../types/enums'
import type { ServiceRequestStatus, OrderStatus } from '../../types/enums'

type ChipType = 'service' | 'order' | 'custom'

interface StatusChipProps {
  status: string
  type?: ChipType
  label?: string
}

const serviceColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  OFFERS_COLLECTING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  ASSIGNED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  RATED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const orderColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export function StatusChip({ status, type = 'custom', label }: StatusChipProps) {
  let displayLabel = label ?? status
  let colorClass = 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'

  if (type === 'service') {
    displayLabel = label ?? SERVICE_REQUEST_STATUS_LABELS[status as ServiceRequestStatus] ?? status
    colorClass = serviceColors[status] ?? colorClass
  } else if (type === 'order') {
    displayLabel = label ?? ORDER_STATUS_LABELS[status as OrderStatus] ?? status
    colorClass = orderColors[status] ?? colorClass
  }

  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${colorClass}`}>
      {displayLabel}
    </span>
  )
}
