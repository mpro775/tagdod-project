import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../../utils'

interface FilterGroupProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function FilterGroup({ title, children, defaultOpen = true }: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-100 dark:border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          size={16}
          className={cn(
            'text-tagadod-gray transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && <div className="pb-4 px-1">{children}</div>}
    </div>
  )
}
