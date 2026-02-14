import { isGuestMode } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'

/**
 * Returns the cart owner key: "guest" for guests, "user:{userId}" for logged-in users.
 * Used to isolate cart data per identity (guest vs user).
 */
export function getCartOwnerKey(): string {
  if (isGuestMode()) return 'guest'
  const user = useUserStore.getState().user
  if (user?.id) return `user:${user.id}`
  return 'guest'
}

export function subscribeToCartIdentity(callback: (ownerKey: string) => void): () => void {
  const userUnsub = useUserStore.subscribe(() => {
    callback(getCartOwnerKey())
  })
  callback(getCartOwnerKey())
  return userUnsub
}
