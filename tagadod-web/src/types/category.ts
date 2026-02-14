export interface Category {
  id: string
  name: string
  nameAr?: string
  image?: string
  icon?: string
  parentId?: string | null
  children?: Category[]
  productsCount?: number
  isFeatured?: boolean
  order?: number
}

export type CategoryTree = Category[]
