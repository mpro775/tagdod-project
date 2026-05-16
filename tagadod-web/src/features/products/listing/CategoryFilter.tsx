import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FilterGroup } from './FilterGroup'
import type { Category } from '../../../types/category'

interface CategoryFilterProps {
  categories: Category[]
  activeCategoryId?: string
  onSelectCategory: (categoryId?: string) => void
  hideIfEmpty?: boolean
}

export function CategoryFilter({
  categories,
  activeCategoryId,
  onSelectCategory,
  hideIfEmpty,
}: CategoryFilterProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (hideIfEmpty && categories.length === 0) return null

  return (
    <FilterGroup title={t('productListing.filters.categories')}>
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className="w-full text-start px-2 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            color: !activeCategoryId ? 'var(--color-primary, #2563eb)' : undefined,
            backgroundColor: !activeCategoryId ? 'rgba(37, 99, 235, 0.08)' : undefined,
          }}
        >
          {t('common.all')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              onSelectCategory(cat.id)
              // Navigate to category page if applicable
              navigate(`/categories/${cat.id}/products`)
            }}
            className="w-full text-start px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            style={{
              color: activeCategoryId === cat.id ? 'var(--color-primary, #2563eb)' : undefined,
              backgroundColor: activeCategoryId === cat.id ? 'rgba(37, 99, 235, 0.08)' : undefined,
            }}
          >
            <span className="line-clamp-1">{cat.name}</span>
          </button>
        ))}
      </div>
    </FilterGroup>
  )
}
