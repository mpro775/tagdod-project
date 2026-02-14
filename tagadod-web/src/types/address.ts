export type AddressType = 'home' | 'work' | 'other'

export interface Address {
  id: string
  label?: string
  type?: AddressType
  line1?: string
  street?: string
  city?: string
  details?: string
  lat?: number
  lng?: number
  isDefault: boolean
  createdAt?: string
}
