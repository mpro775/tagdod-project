import { api } from './api'
import type { Category, CategoryTree } from '../types/category'
import type { ApiResponse } from '../types/common'

const CDN_BASE = 'https://tagadod.b-cdn.net'

/** Raw category from API - image can be { id, path } or { id, url } */
interface ApiCategory {
  id?: string
  _id?: string
  name?: string
  nameEn?: string
  nameAr?: string
  image?: { id?: string; path?: string; url?: string } | string | null
  icon?: string
  parent?: { id?: string } | null
  parentId?: string | null
  children?: ApiCategory[]
  productsCount?: number
  order?: number
  [key: string]: unknown
}

function resolveImageUrl(raw: ApiCategory): string | undefined {
  const img = raw.image
  if (!img) return undefined
  if (typeof img === 'string' && img.startsWith('http')) return img
  if (typeof img === 'object' && img !== null) {
    const url = img.url
    if (typeof url === 'string' && url) return url
    const path = img.path
    if (typeof path === 'string' && path) {
      return path.startsWith('http') ? path : `${CDN_BASE}/${path}`
    }
  }
  return undefined
}

function normalizeCategory(raw: ApiCategory): Category {
  const id = raw.id ?? raw._id ?? ''
  const image = resolveImageUrl(raw)
  return {
    id,
    name: raw.name ?? raw.nameEn ?? raw.nameAr ?? '',
    image,
    icon: raw.icon,
    parentId: raw.parentId ?? raw.parent?.id ?? null,
    children: raw.children?.map(normalizeCategory),
    productsCount: raw.productsCount,
    order: raw.order,
  }
}

function parseCategoryList(raw: unknown): ApiCategory[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const d = (raw as { data?: unknown }).data
    return Array.isArray(d) ? d : []
  }
  return []
}

export async function getCategories(parentId?: string | null): Promise<Category[]> {
  const params = parentId != null ? { parentId: String(parentId) } : { parentId: 'null' }
  const { data } = await api.get<unknown>('/categories', { params })
  const list = parseCategoryList(data)
  return list.map((r: ApiCategory) => normalizeCategory(r))
}

export async function getCategoryById(id: string): Promise<Category> {
  const { data } = await api.get<ApiResponse<ApiCategory>>(`/categories/${id}`)
  return normalizeCategory(data.data ?? {})
}

/** تصنيفات الصفحة الرئيسية - كالتطبيق: الجذر أولاً ثم المميزة */
export async function getRootCategoriesForHome(): Promise<Category[]> {
  try {
    const roots = await getCategories(null)
    if (roots.length > 0) return roots
  } catch {
    // تجاهل الخطأ
  }
  return getFeaturedCategories()
}

export async function getFeaturedCategories(): Promise<Category[]> {
  const { data } = await api.get<unknown>('/categories/featured/list')
  const list = parseCategoryList(data)
  return list.map((r: ApiCategory) => normalizeCategory(r))
}

export async function getCategoryTree(): Promise<CategoryTree> {
  const { data } = await api.get<ApiResponse<ApiCategory[]>>('/categories/tree')
  const list = data.data ?? []
  return list.map(normalizeCategory)
}
