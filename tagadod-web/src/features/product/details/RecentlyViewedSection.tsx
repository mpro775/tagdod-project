import { useEffect, useState } from 'react'
import { ProductCard } from '../../../components/shared'
import type { Product } from '../../../types/product'

interface RecentlyViewedSectionProps {
  currentProductId: string
  title: string
}

const RECENTLY_VIEWED_KEY = 'tagadod-recently-viewed'
const MAX_ITEMS = 8

interface RecentlyViewedItem {
  id: string
  name: string
  images: string[]
  price: number
  originalPrice?: number
  inStock?: boolean
}

function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentlyViewedItem[]
  } catch {
    return []
  }
}

function addRecentlyViewed(item: RecentlyViewedItem): void {
  try {
    const items = getRecentlyViewed()
    const filtered = items.filter((i) => i.id !== item.id)
    const updated = [item, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

export function RecentlyViewedSection({
  currentProductId,
  title,
}: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    setItems(getRecentlyViewed())
  }, [])

  const filtered = items.filter((i) => i.id !== currentProductId)
  if (filtered.length === 0) return null

  const products: Product[] = filtered.map((item) => ({
    id: item.id,
    name: item.name,
    images: item.images,
    price: item.price,
    originalPrice: item.originalPrice,
    inStock: item.inStock,
  }))

  return (
    <section className="mt-10 mb-6">
      <h2 className="text-lg font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  )
}

export function trackRecentlyViewed(product: {
  id: string
  name: string
  images: string[]
  price: number
  originalPrice?: number
  inStock?: boolean
}): void {
  addRecentlyViewed({
    id: product.id,
    name: product.name,
    images: product.images,
    price: product.price,
    originalPrice: product.originalPrice,
    inStock: product.inStock,
  })
}
