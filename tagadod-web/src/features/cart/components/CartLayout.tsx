import type { ReactNode } from 'react'
import { cn } from '@/utils'

type CartLayoutProps = {
  itemsArea: ReactNode
  summaryArea: ReactNode
  className?: string
}

export function CartLayout({ itemsArea, summaryArea, className }: CartLayoutProps) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8', className)}>
      <div className="lg:col-span-2">{itemsArea}</div>
      <div className="lg:col-span-1">{summaryArea}</div>
    </div>
  )
}
