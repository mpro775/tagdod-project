interface FilterChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
}

export function FilterChip({ label, selected = false, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        selected
          ? 'bg-primary text-white'
          : 'bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles hover:bg-gray-200 dark:hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  )
}
