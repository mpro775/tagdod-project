import { publicApi } from './api'
import type { ApiResponse } from '../types/common'

export interface AppConfig {
  maintenanceMode?: boolean
  forceUpdate?: boolean
  minVersion?: string
  latestVersion?: string
  updateUrl?: string
  maintenanceMessage?: string
}

export async function getAppConfig(): Promise<AppConfig> {
  const { data } = await publicApi.get<ApiResponse<AppConfig>>('/app/config')
  return data.data
}
