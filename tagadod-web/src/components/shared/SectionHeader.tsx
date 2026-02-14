import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  viewAllLink?: string
  viewAllLabel?: string
}

export function SectionHeader({ title, viewAllLink, viewAllLabel = 'عرض الكل' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h3 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
        {title}
      </h3>
      {viewAllLink && (
        <Link to={viewAllLink} className="flex items-center gap-1 text-sm text-primary hover:underline">
          {viewAllLabel}
          <ChevronLeft size={16} className="rtl:rotate-180" />
        </Link>
      )}
    </div>
  )
}
