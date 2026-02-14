import { publicApi } from './api'
import type { ApiResponse } from '../types/common'

export interface PolicyContent {
  type: string
  title: string
  content: string
  updatedAt?: string
}

export async function getPolicy(type: 'privacy' | 'terms'): Promise<PolicyContent> {
  const { data } = await publicApi.get<ApiResponse<PolicyContent>>(`/policies/public/${type}`)
  return data.data
}
