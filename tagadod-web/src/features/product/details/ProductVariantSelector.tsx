import type { ProductVariant } from '../../../types/product'

interface ProductVariantSelectorProps {
  variants: ProductVariant[]
  selectedId: string | null
  onSelect: (variantId: string) => void
}

export function ProductVariantSelector({
  variants,
  selectedId,
  onSelect,
}: ProductVariantSelectorProps) {
  if (!variants?.length) return null

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedId === v.id
          const isOutOfStock = v.inStock === false
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => !isOutOfStock && onSelect(v.id)}
              disabled={isOutOfStock}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                  : isOutOfStock
                    ? 'border-gray-200 dark:border-white/5 text-tagadod-gray/50 cursor-not-allowed line-through'
                    : 'border-gray-200 dark:border-white/10 text-tagadod-titles dark:text-tagadod-dark-titles hover:border-primary/50 hover:bg-primary/5'
              }`}
              aria-pressed={isSelected}
              aria-label={`Select variant: ${v.name}`}
            >
              {v.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
