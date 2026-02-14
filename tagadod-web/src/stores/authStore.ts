const ACCESS_KEY = 'tagadod-auth-token'
const REFRESH_KEY = 'tagadod-refresh-token'
const GUEST_KEY = 'tagadod-guest'

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(ACCESS_KEY)
}

export function isGuestMode(): boolean {
  return localStorage.getItem(GUEST_KEY) === '1'
}

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setToken(token: string): void {
  localStorage.removeItem(GUEST_KEY)
  localStorage.setItem(ACCESS_KEY, token)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.removeItem(GUEST_KEY)
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function setGuestMode(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.setItem(GUEST_KEY, '1')
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(GUEST_KEY)
}

export function isAuthenticated(): boolean {
  return isLoggedIn() || isGuestMode()
}
