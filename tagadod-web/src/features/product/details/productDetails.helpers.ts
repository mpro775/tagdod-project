import type { Product, ProductVariant } from '../../../types/product'

export interface ProductBreadcrumbItem {
  label: string
  href?: string
}

export function getProductId(product: Product): string {
  return product.id
}

export function getProductName(product: Product): string {
  return product.name || product.nameAr || ''
}

export function getProductSlug(product: Product): string {
  return product.id
}

export function getProductImages(product: Product): string[] {
  return product.images ?? []
}

export function getProductMainImage(product: Product): string | undefined {
  return product.images?.[0]
}

export function getProductPrice(product: Product, selectedVariant?: ProductVariant): number {
  return selectedVariant?.price ?? product.price
}

export function getProductComparePrice(product: Product, selectedVariant?: ProductVariant): number | undefined {
  const compare = selectedVariant?.originalPrice ?? product.originalPrice
  const current = getProductPrice(product, selectedVariant)
  return compare && compare > current ? compare : undefined
}

export function getProductCurrency(_product: Product): string {
  return _product.currency ?? 'YER'
}

export function getProductSku(_product: Product, selectedVariant?: ProductVariant): string | undefined {
  return selectedVariant?.sku
}

export function getProductStock(product: Product, selectedVariant?: ProductVariant): number | undefined {
  return selectedVariant?.quantity ?? product.quantity
}

export function isProductInStock(product: Product, selectedVariant?: ProductVariant): boolean {
  if (selectedVariant) return selectedVariant.inStock !== false
  return product.inStock !== false
}

export function getProductCategory(product: Product): string | undefined {
  return product.categoryName
}

export function getProductBrand(_product: Product): string | undefined {
  return undefined
}

export function getProductDescription(product: Product): string | undefined {
  return product.description || product.descriptionAr
}

export function getProductSpecifications(product: Product): Record<string, string> | undefined {
  if (!product.variants?.length) return undefined
  const specs: Record<string, Set<string>> = {}
  for (const v of product.variants) {
    if (v.attributes) {
      for (const [key, value] of Object.entries(v.attributes)) {
        if (!specs[key]) specs[key] = new Set<string>()
        specs[key].add(value as string)
      }
    }
  }
  const result: Record<string, string> = {}
  for (const [key, values] of Object.entries(specs)) {
    const vals = Array.from(values)
    if (vals.length === 1) result[key] = vals[0]
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function getProductVariants(product: Product): ProductVariant[] | undefined {
  return product.variants?.length ? product.variants : undefined
}

export function getProductBreadcrumbItems(product: Product, t: (key: string) => string): ProductBreadcrumbItem[] {
  const items: ProductBreadcrumbItem[] = [
    { label: t('breadcrumb.home'), href: '/' },
    { label: t('breadcrumb.products'), href: '/products' },
  ]
  const category = getProductCategory(product)
  if (category) {
    items.push({ label: category })
  }
  items.push({ label: getProductName(product) })
  return items
}
