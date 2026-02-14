import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CurrencyCode = 'USD' | 'SAR' | 'YER'

interface CurrencyStore {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'YER',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'tagadod-currency' }
  )
)

export function formatPrice(amount: number | undefined | null, currency?: CurrencyCode): string {
  const safe = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0
  const c = currency ?? useCurrencyStore.getState().currency
  const symbols: Record<CurrencyCode, string> = {
    USD: '$',
    SAR: 'ر.س',
    YER: 'ر.ي',
  }
  return `${safe.toLocaleString('ar-YE')} ${symbols[c]}`
}
