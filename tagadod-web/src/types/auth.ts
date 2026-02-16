import type { UserType, Gender, VerificationStatus } from './enums'

export interface User {
  id: string
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  userType: UserType
  gender?: Gender
  city?: string
  avatar?: string
  verificationStatus?: VerificationStatus
  preferredCurrency?: string
  createdAt?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  phone: string
  password: string
}

export interface SignupRequest {
  phone: string
  firstName: string
  lastName: string
  userType: UserType
  gender?: Gender
  city?: string
  jobTitle?: string
}

export interface SendOtpRequest {
  phone: string
  type: 'register' | 'reset' | 'login'
}

export interface VerifyOtpRequest {
  phone: string
  otp: string
  firstName?: string
  lastName?: string
  userType?: UserType
  gender?: Gender
  city?: string
}

export interface CheckPhoneRequest {
  phone: string
}

export interface SetPasswordRequest {
  password: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordWithOtpRequest {
  phone: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyResetOtpRequest {
  phone: string
  code: string
}

export interface ForgotPasswordRequest {
  phone: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  city?: string
}

export interface DeleteAccountRequest {
  reason?: string
  password: string
}
