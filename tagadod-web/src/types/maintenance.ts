import type { ServiceRequestStatus, RequestType, CurrencyCode } from './enums'

export type { RequestType, ServiceRequestStatus as RequestStatus } from './enums'

export interface ServiceRequest {
  id: string
  title: string
  type?: RequestType
  description?: string
  images: string[]
  city?: string
  addressId?: string
  address?: { line1?: string; city?: string; lat?: number; lng?: number }
  status: ServiceRequestStatus
  statusLabel?: string
  scheduledAt?: string
  createdAt: string
  updatedAt: string
  offers?: ServiceOffer[]
  offersCount?: number
  acceptedOffer?: ServiceOffer
  engineer?: EngineerSummary
  customerId?: string
  customerName?: string
}

export interface ServiceOffer {
  id: string
  requestId?: string
  engineerId: string
  engineerName?: string
  engineerAvatar?: string
  engineerRating?: number
  price: number
  currency?: CurrencyCode
  notes?: string
  duration?: string
  status?: string
  createdAt: string
  updatedAt?: string
}

export interface EngineerSummary {
  id: string
  name?: string
  phone?: string
  whatsapp?: string
  rating?: number
  completedServices?: number
  avatar?: string
  jobTitle?: string
  city?: string
}

export interface CreateServiceRequestBody {
  title: string
  type: RequestType
  description?: string
  addressId: string
  scheduledAt?: string
  images?: string[]
}

export interface UpdateServiceRequestBody {
  title?: string
  type?: RequestType
  description?: string
  addressId?: string
  scheduledAt?: string
  images?: string[]
}

export interface CreateOfferBody {
  requestId: string
  price: number
  currency?: CurrencyCode
  notes?: string
  duration?: string
}

export interface UpdateOfferBody {
  price?: number
  currency?: CurrencyCode
  notes?: string
  duration?: string
}

export interface RateServiceBody {
  rating: number
  comment?: string
}

export interface CancelRequestBody {
  reason?: string
}

export interface AcceptOfferBody {
  offerId: string
}
