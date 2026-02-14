import { useEffect } from 'react'
import { useCartStore } from '../../stores/cartStore'
import { useUserStore } from '../../stores/userStore'

/**
 * Rehydrates cart from localStorage when user identity changes (login/logout).
 * Mount once in the app shell.
 */
export function CartRehydrate() {
  const user = useUserStore((s) => s.user)
  const rehydrate = useCartStore((s) => s.rehydrate)

  useEffect(() => {
    rehydrate()
  }, [user?.id, rehydrate])

  return null
}
