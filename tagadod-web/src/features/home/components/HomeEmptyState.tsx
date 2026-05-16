import { PackageX } from 'lucide-react'

interface HomeEmptyStateProps {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

export function HomeEmptyState({
  title,
  subtitle,
  icon,
}: HomeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
      <div className="mb-3 text-tagadod-gray">
        {icon ?? <PackageX size={40} strokeWidth={1.5} />}
      </div>
      {title && (
        <p className="text-sm md:text-base font-medium text-tagadod-titles dark:text-tagadod-dark-titles">
          {title}
        </p>
      )}
      {subtitle && (
        <p className="text-xs md:text-sm text-tagadod-gray mt-1 max-w-xs">
          {subtitle}
        </p>
      )}
    </div>
  )
}
