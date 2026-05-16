import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../../../utils'

interface HomeSectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  className,
}: HomeSectionHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4 md:mb-6', className)}>
      <div>
        {eyebrow && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            {eyebrow}
          </span>
        )}
        <h2 className="text-xl md:text-2xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-tagadod-gray mt-1 max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
      {actionHref && actionLabel && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          {actionLabel}
          <ChevronLeft size={16} className="rtl:rotate-180" />
        </Link>
      )}
    </div>
  )
}
