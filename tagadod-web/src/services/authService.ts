import { api, publicApi } from './api'
import type {
  User,
  TokenPair,
  LoginRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  CheckPhoneRequest,
  SetPasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  UpdateProfileRequest,
  DeleteAccountRequest,
} from '../types/auth'
import type { ApiResponse } from '../types/common'

/** Backend returns { tokens: { access, refresh }, me? } */
interface AuthApiResponse {
  success?: boolean
  data?: {
    tokens?: { access?: string; refresh?: string }
    me?: Partial<User>
    accessToken?: string
    refreshToken?: string
  }
}

function toTokenPair(raw: AuthApiResponse['data']): TokenPair {
  const d = raw ?? {}
  const t = d.tokens ?? {}
  return {
    accessToken: t.access ?? d.accessToken ?? '',
    refreshToken: t.refresh ?? d.refreshToken ?? '',
  }
}

export async function login(body: LoginRequest): Promise<TokenPair> {
  const { data } = await publicApi.post<AuthApiResponse>('/auth/user-login', body)
  return toTokenPair(data?.data)
}

export async function signup(body: Record<string, unknown>): Promise<TokenPair> {
  const { data } = await publicApi.post<AuthApiResponse>('/auth/user-signup', body)
  return toTokenPair(data?.data)
}

export async function sendOtp(body: SendOtpRequest): Promise<void> {
  await publicApi.post('/auth/send-otp', body)
}

export async function verifyOtp(body: VerifyOtpRequest): Promise<TokenPair> {
  const { otp, ...rest } = body
  const { data } = await publicApi.post<AuthApiResponse>('/auth/verify-otp', {
    ...rest,
    code: otp,
  })
  return toTokenPair(data?.data)
}

export async function checkPhone(body: CheckPhoneRequest): Promise<{ exists: boolean }> {
  const { data } = await publicApi.post<ApiResponse<{ exists: boolean }>>('/auth/check-phone', body)
  return data.data
}

export async function forgotPassword(body: ForgotPasswordRequest): Promise<void> {
  await publicApi.post('/auth/forgot-password', body)
}

export async function resetPassword(body: ResetPasswordRequest): Promise<void> {
  await api.post('/auth/reset-password', body)
}

export async function setPassword(body: SetPasswordRequest): Promise<void> {
  await api.post('/auth/set-password', body)
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const { data } = await publicApi.post<AuthApiResponse>('/auth/refresh', { refreshToken })
  return toTokenPair(data?.data)
}

/** Backend /auth/me returns { user, capabilities } */
export async function getMe(): Promise<User> {
  const { data } = await api.get<{ success?: boolean; data?: { user?: User } }>('/auth/me')
  const user = data?.data?.user
  if (!user) throw new Error('No user in /auth/me response')
  return normalizeUser(user)
}

function normalizeUser(raw: Record<string, unknown>): User {
  const id = String(raw.id ?? raw._id ?? '')
  return {
    id,
    firstName: raw.firstName as string | undefined,
    lastName: raw.lastName as string | undefined,
    phone: raw.phone as string | undefined,
    email: raw.email as string | undefined,
    userType: (raw.userType ?? raw.roles?.[0] ?? 'customer') as User['userType'],
    gender: raw.gender as User['gender'],
    city: raw.city as string | undefined,
    avatar: raw.avatar as string | undefined,
  }
}

export async function updateMe(body: UpdateProfileRequest): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>('/auth/me', body)
  return data.data
}

export async function updatePreferredCurrency(currency: string): Promise<void> {
  await api.patch('/auth/preferred-currency', { currency })
}

export async function deleteAccount(body: DeleteAccountRequest): Promise<void> {
  await api.delete('/auth/me', { data: body })
}
