import { publicApi } from './api'
import type { ApiResponse } from '../types/common'

export interface PolicyContent {
  type: string
  title: string
  content: string
  updatedAt?: string
}

interface PolicyApiResponse {
  _id: string
  type: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
  isActive: boolean
  updatedAt?: string
}

export async function getPolicy(type: 'privacy' | 'terms'): Promise<PolicyContent> {
  const { data } = await publicApi.get<ApiResponse<PolicyApiResponse>>(`/policies/public/${type}`)
  const policy = data.data
  
  // Determine language from localStorage or default to Arabic
  const lang = localStorage.getItem('i18nextLng') || 'ar'
  const isArabic = lang.startsWith('ar')
  
  return {
    type: policy.type,
    title: isArabic ? policy.titleAr : policy.titleEn,
    content: isArabic ? policy.contentAr : policy.contentEn,
    updatedAt: policy.updatedAt,
  }
}
