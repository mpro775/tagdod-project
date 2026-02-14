import { api } from './api'
import type { ApiResponse } from '../types/common'

/** Raw API banner shape */
interface ApiBanner {
  id: string
  image?: { id?: string; url: string } | null
  navigationType?: string
  navigationTarget?: string
  location?: string
  sortOrder?: number
  isActive?: boolean
  altText?: string
}

export interface Banner {
  id: string
  imageUrl: string
  altText?: string
  link?: string
  navigationType?: string
  navigationTarget?: string
  sortOrder: number
}

function buildLink(navigationType: string | undefined, navigationTarget: string | undefined): string | undefined {
  if (!navigationTarget?.trim()) return undefined
  switch (navigationType) {
    case 'category':
      return `/categories/${navigationTarget}/products`
    case 'product':
      return `/product/${navigationTarget}`
    case 'external_url':
      return navigationTarget.startsWith('http') ? navigationTarget : undefined
    case 'section':
      return navigationTarget.startsWith('/') ? navigationTarget : `/${navigationTarget}`
    default:
      return undefined
  }
}

function resolveImageUrl(b: ApiBanner): string {
  if (b.image && typeof b.image === 'object' && typeof b.image.url === 'string' && b.image.url) {
    return b.image.url
  }
  return ''
}

export async function getBanners(): Promise<Banner[]> {
  const { data } = await api.get<ApiResponse<ApiBanner[]>>('/marketing/banners')
  const raw = data.data ?? []
  return raw
    .filter((b) => b.isActive !== false)
    .map((b) => ({
      id: b.id,
      imageUrl: resolveImageUrl(b),
      altText: b.altText,
      link: buildLink(b.navigationType, b.navigationTarget),
      navigationType: b.navigationType,
      navigationTarget: b.navigationTarget,
      sortOrder: b.sortOrder ?? 0,
    }))
    .filter((b) => b.imageUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
