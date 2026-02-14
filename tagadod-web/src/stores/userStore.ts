import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VerificationStatus } from '../types/enums'

export type UserType = 'customer' | 'engineer' | 'merchant'

interface User {
  id: string
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  userType: UserType
  verificationStatus?: VerificationStatus
}

interface UserStore {
  user: User | null
  setUser: (u: User | null) => void
  isEngineer: () => boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      isEngineer: () => get().user?.userType === 'engineer',
    }),
    { name: 'tagadod-user' }
  )
)
