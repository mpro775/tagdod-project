import { api } from './api'
import type { Address } from '../types/address'
import type { ApiResponse } from '../types/common'

/** API returns { addresses: [...], count } */
interface ApiAddressItem {
  _id?: string
  id?: string
  label?: string
  line1?: string
  street?: string
  city?: string
  details?: string
  notes?: string
  coords?: { lat?: number; lng?: number }
  isDefault?: boolean
  createdAt?: string
}

interface ApiAddressesResponse {
  success?: boolean
  data?: { addresses?: ApiAddressItem[]; count?: number }
}

function normalizeAddress(raw: ApiAddressItem): Address {
  const c = raw.coords
  return {
    id: raw._id ?? raw.id ?? '',
    label: raw.label,
    line1: raw.line1 ?? raw.street,
    street: raw.street ?? raw.line1,
    city: raw.city,
    details: raw.details ?? raw.notes,
    lat: c?.lat,
    lng: c?.lng,
    isDefault: raw.isDefault ?? false,
    createdAt: raw.createdAt,
  }
}

export async function getAddresses(): Promise<Address[]> {
  const { data } = await api.get<ApiAddressesResponse>('/addresses')
  const list = data?.data?.addresses ?? []
  return list.map((a) => normalizeAddress(a))
}

export async function createAddress(body: {
  label?: string
  line1?: string
  street?: string
  city?: string
  details?: string
  lat?: number
  lng?: number
  isDefault?: boolean
}): Promise<Address> {
  const { data } = await api.post<ApiResponse<Address>>('/addresses', body)
  return data.data
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`)
}

export async function setDefaultAddress(id: string): Promise<void> {
  await api.post(`/addresses/${id}/set-default`)
}
