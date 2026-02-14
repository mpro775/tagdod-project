import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 text-tagadod-gray">
        {icon ?? <Inbox size={56} strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-1">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-tagadod-gray mb-4 max-w-sm">{subtitle}</p>
      )}
      {action}
    </div>
  )
}
