import { api } from './api'
import type { EngineerProfile, EngineerRating, UpdateEngineerProfileRequest } from '../types/engineer'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

export async function getEngineerProfile(engineerId: string): Promise<EngineerProfile> {
  const { data } = await api.get<ApiResponse<EngineerProfile>>(`/engineers/profile/${engineerId}`)
  return data.data
}

export async function getMyEngineerProfile(): Promise<EngineerProfile> {
  const { data } = await api.get<ApiResponse<EngineerProfile>>('/engineers/profile/me')
  return data.data
}

export async function updateMyEngineerProfile(body: UpdateEngineerProfileRequest): Promise<EngineerProfile> {
  const { data } = await api.put<ApiResponse<EngineerProfile>>('/engineers/profile/me', body)
  return data.data
}

export async function getEngineerRatings(engineerId: string, params?: PaginationParams): Promise<PaginatedResponse<EngineerRating>> {
  const { data } = await api.get<PaginatedResponse<EngineerRating>>(`/engineers/profile/${engineerId}/ratings`, { params })
  return data
}
