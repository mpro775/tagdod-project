import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const Separator = isRTL ? ChevronLeft : ChevronRight

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('py-3', className)}
    >
      <ol className="flex items-center flex-wrap gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label + index} className="flex items-center gap-1.5">
              {index > 0 && (
                <Separator
                  size={14}
                  className="text-tagadod-gray opacity-60"
                />
              )}
              {isLast || !item.href ? (
                <span className="text-tagadod-titles dark:text-tagadod-dark-titles font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-tagadod-gray hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
