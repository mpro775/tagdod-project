import { api } from './api'
import type { ApiResponse } from '../types/common'

export interface VerificationSubmission {
  type: 'engineer' | 'merchant'
  shopName?: string
  note?: string
  documentUrl?: string
}

export async function submitVerification(body: VerificationSubmission): Promise<{ status: string }> {
  const { data } = await api.post<ApiResponse<{ status: string }>>('/users/verification/submit', body)
  return data.data
}
