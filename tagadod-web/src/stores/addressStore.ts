import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AddressType = 'home' | 'work' | 'other'

export interface Address {
  id: string
  type: AddressType
  street: string
  details?: string
  isDefault: boolean
  lat?: number
  lng?: number
}

interface AddressStore {
  addresses: Address[]
  addAddress: (a: Omit<Address, 'id'>) => void
  updateAddress: (id: string, a: Partial<Address>) => void
  removeAddress: (id: string) => void
  setDefault: (id: string) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      addresses: [],
      addAddress: (a) =>
        set((s) => ({
          addresses: [
            ...(a.isDefault ? s.addresses.map((x) => ({ ...x, isDefault: false })) : s.addresses),
            { ...a, id: `addr-${Date.now()}` },
          ],
        })),
      updateAddress: (id, updates) =>
        set((s) => ({
          addresses: s.addresses.map((a) =>
            a.id === id ? { ...a, ...updates } : updates.isDefault ? { ...a, isDefault: false } : a
          ),
        })),
      removeAddress: (id) =>
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
      setDefault: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),
    }),
    { name: 'tagadod-addresses' }
  )
)
