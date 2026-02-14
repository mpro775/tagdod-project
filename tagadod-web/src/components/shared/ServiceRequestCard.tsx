import { Link } from 'react-router-dom'
import { ChevronLeft, Wrench } from 'lucide-react'
import type { ServiceRequest } from '../../types/maintenance'
import { StatusChip } from './StatusChip'
import { REQUEST_TYPE_LABELS } from '../../types/enums'

interface ServiceRequestCardProps {
  request: ServiceRequest
  linkTo?: string
}

export function ServiceRequestCard({ request, linkTo }: ServiceRequestCardProps) {
  const to = linkTo ?? `/my-order-details/${request.id}`

  return (
    <Link to={to} className="block rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Wrench size={20} className="text-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
              {request.title}
            </p>
            <p className="text-xs text-tagadod-gray">
              {request.type ? REQUEST_TYPE_LABELS[request.type] : ''} •{' '}
              {new Date(request.createdAt).toLocaleDateString('ar')}
            </p>
          </div>
        </div>
        <StatusChip status={request.status} type="service" />
      </div>
      {request.description && (
        <p className="text-xs text-tagadod-gray line-clamp-2 mb-2">{request.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-tagadod-gray">
          {request.offersCount != null ? `${request.offersCount} عروض` : ''}
        </span>
        <ChevronLeft size={18} className="text-tagadod-gray rtl:rotate-180" />
      </div>
    </Link>
  )
}
