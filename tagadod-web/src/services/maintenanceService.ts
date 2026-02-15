import { api } from './api'
import type {
  ServiceRequest,
  ServiceOffer,
  CreateServiceRequestBody,
  UpdateServiceRequestBody,
  CreateOfferBody,
  UpdateOfferBody,
  RateServiceBody,
  CancelRequestBody,
  AcceptOfferBody,
} from '../types/maintenance'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

function normalizeServiceRequest(item: unknown): ServiceRequest {
  const obj = (item ?? {}) as Record<string, unknown>
  const offers = Array.isArray(obj.offers) ? obj.offers : undefined
  return {
    ...(obj as unknown as ServiceRequest),
    id: (obj.id as string) ?? (obj._id as string) ?? '',
    images: Array.isArray(obj.images) ? (obj.images as string[]) : [],
    offersCount:
      typeof obj.offersCount === 'number'
        ? obj.offersCount
        : offers?.length,
  }
}

function parseServiceRequestsResponse(raw: unknown): PaginatedResponse<ServiceRequest> {
  if (!raw || typeof raw !== 'object') {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } }
  }

  const root = raw as Record<string, unknown>
  const dataField = root.data
  const dataObj = (dataField && typeof dataField === 'object' && !Array.isArray(dataField))
    ? (dataField as Record<string, unknown>)
    : undefined

  const list = (
    Array.isArray(dataField)
      ? dataField
      : Array.isArray(root.requests)
        ? root.requests
        : Array.isArray(dataObj?.requests)
          ? (dataObj?.requests as unknown[])
          : Array.isArray(dataObj?.data)
            ? (dataObj?.data as unknown[])
            : []
  ) as unknown[]

  const pagination = (root.pagination ?? dataObj?.pagination ?? root.meta ?? dataObj?.meta) as
    | { page?: number; limit?: number; total?: number; totalPages?: number }
    | undefined

  return {
    data: list.map(normalizeServiceRequest),
    meta: {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 20,
      total: pagination?.total ?? list.length,
      totalPages: pagination?.totalPages ?? 1,
    },
  }
}

// ──────────────────────────── Customer Endpoints ────────────────────────────

export async function createServiceRequest(body: CreateServiceRequestBody): Promise<ServiceRequest> {
  const { data } = await api.post<ApiResponse<ServiceRequest>>('/services/customer', body)
  return data.data
}

export async function updateServiceRequest(id: string, body: UpdateServiceRequestBody): Promise<ServiceRequest> {
  const { data } = await api.patch<ApiResponse<ServiceRequest>>(`/services/customer/${id}`, body)
  return data.data
}

export async function getMyRequests(params?: PaginationParams): Promise<PaginatedResponse<ServiceRequest>> {
  const { data } = await api.get<unknown>('/services/customer/my', { params })
  return parseServiceRequestsResponse(data)
}

export async function getMyRequestsNoOffers(params?: PaginationParams): Promise<PaginatedResponse<ServiceRequest>> {
  const { data } = await api.get<unknown>('/services/customer/my/no-offers', { params })
  return parseServiceRequestsResponse(data)
}

export async function getMyRequestsWithOffers(params?: PaginationParams): Promise<PaginatedResponse<ServiceRequest>> {
  const { data } = await api.get<unknown>('/services/customer/my/with-offers', { params })
  return parseServiceRequestsResponse(data)
}

export async function getMyRequestsWithAccepted(params?: PaginationParams): Promise<PaginatedResponse<ServiceRequest>> {
  const { data } = await api.get<unknown>('/services/customer/my/with-accepted-offer', { params })
  return parseServiceRequestsResponse(data)
}

export async function getRequestDetails(id: string): Promise<ServiceRequest> {
  const { data } = await api.get<ApiResponse<ServiceRequest>>(`/services/customer/${id}`)
  return data.data
}

export async function cancelRequest(id: string, body?: CancelRequestBody): Promise<void> {
  await api.post(`/services/customer/${id}/cancel`, body)
}

export async function deleteRequest(id: string): Promise<void> {
  await api.delete(`/services/customer/${id}`)
}

export async function getRequestOffers(id: string, params?: PaginationParams): Promise<PaginatedResponse<ServiceOffer>> {
  const { data } = await api.get<PaginatedResponse<ServiceOffer>>(`/services/customer/${id}/offers`, { params })
  return data
}

export async function getOfferDetails(requestId: string, offerId: string): Promise<ServiceOffer> {
  const { data } = await api.get<ApiResponse<ServiceOffer>>(`/services/customer/${requestId}/offers/${offerId}`)
  return data.data
}

export async function acceptOffer(requestId: string, body: AcceptOfferBody): Promise<void> {
  await api.post(`/services/customer/${requestId}/accept-offer`, body)
}

export async function rateService(requestId: string, body: RateServiceBody): Promise<void> {
  await api.post(`/services/customer/${requestId}/rate`, body)
}

export async function completeServiceCustomer(requestId: string): Promise<void> {
  await api.post(`/services/customer/${requestId}/complete`)
}

// ──────────────────────────── Engineer Endpoints ────────────────────────────

/** Requires lat/lng as numbers. Use getCityRequests when coords unavailable. */
export async function getNearbyRequests(params: {
  lat: number
  lng: number
  radiusKm?: number
  page?: number
  limit?: number
}): Promise<PaginatedResponse<ServiceRequest>> {
  const { lat, lng, radiusKm = 10, ...rest } = params
  const query = { lat: Number(lat), lng: Number(lng), radiusKm: Number(radiusKm), ...rest }
  const { data } = await api.get<PaginatedResponse<ServiceRequest>>('/services/engineer/requests/nearby', {
    params: query,
  })
  return data
}

export async function getCityRequests(params?: PaginationParams): Promise<PaginatedResponse<ServiceRequest>> {
  const { data } = await api.get<PaginatedResponse<ServiceRequest>>('/services/engineer/requests/city', { params })
  return data
}

export async function getAllRequests(params?: PaginationParams): Promise<PaginatedResponse<ServiceRequest>> {
  const { data } = await api.get<PaginatedResponse<ServiceRequest>>('/services/engineer/requests/all', { params })
  return data
}

export async function getEngineerRequestDetails(id: string): Promise<ServiceRequest> {
  const { data } = await api.get<ApiResponse<ServiceRequest>>(`/services/engineer/requests/${id}`)
  return data.data
}

export async function createOffer(body: CreateOfferBody): Promise<ServiceOffer> {
  const { data } = await api.post<ApiResponse<ServiceOffer>>('/services/engineer/offers', body)
  return data.data
}

export async function updateOffer(offerId: string, body: UpdateOfferBody): Promise<ServiceOffer> {
  const { data } = await api.patch<ApiResponse<ServiceOffer>>(`/services/engineer/offers/${offerId}`, body)
  return data.data
}

export async function deleteOffer(offerId: string): Promise<void> {
  await api.delete(`/services/engineer/offers/${offerId}`)
}

export async function getMyOffers(params?: PaginationParams): Promise<PaginatedResponse<ServiceOffer>> {
  const { data } = await api.get<PaginatedResponse<ServiceOffer>>('/services/engineer/offers/my', { params })
  return data
}

export async function completeServiceEngineer(requestId: string): Promise<void> {
  await api.post(`/services/engineer/requests/${requestId}/complete`)
}
