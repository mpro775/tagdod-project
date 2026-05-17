import { Minus, Plus } from 'lucide-react'

interface ProductQuantitySelectorProps {
  quantity: number
  maxQuantity?: number
  inStock: boolean
  onChange: (quantity: number) => void
}

export function ProductQuantitySelector({
  quantity,
  maxQuantity,
  inStock,
  onChange,
}: ProductQuantitySelectorProps) {
  const effectiveMax = maxQuantity && maxQuantity > 0 ? maxQuantity : 99

  const handleDecrement = () => {
    if (quantity > 1) onChange(quantity - 1)
  }

  const handleIncrement = () => {
    if (quantity < effectiveMax) onChange(quantity + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) {
      const clamped = Math.max(1, Math.min(val, effectiveMax))
      onChange(clamped)
    }
  }

  if (!inStock) return null

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={1}
        max={effectiveMax}
        aria-label="Quantity"
        className="w-14 h-10 text-center rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-tagadod-titles dark:text-tagadod-dark-titles text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= effectiveMax}
        aria-label="Increase quantity"
        className="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
