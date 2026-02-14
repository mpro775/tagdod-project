import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getCategoryTree } from '../../services/categoryService'
import { ShimmerBox } from '../../components/shared'

function CategoryCardShimmer() {
  return (
    <div className="rounded-xl overflow-hidden">
      <ShimmerBox className="w-full aspect-square" rounded="rounded-t-xl" />
      <div className="p-3">
        <ShimmerBox height={14} className="w-2/3 mx-auto" />
      </div>
    </div>
  )
}

export function CategoriesPage() {
  const { t } = useTranslation()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categoryTree'],
    queryFn: getCategoryTree,
  })

  const flatCategories = Array.isArray(categories) ? categories : []

  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles mb-4">
        {t('التصنيفات')}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategoryCardShimmer key={i} />
          ))}
        </div>
      ) : flatCategories.length > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {flatCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.id}/products`}
              className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">{cat.icon ?? '📦'}</span>
                  </div>
                )}
              </div>
              <div className="p-3 text-center">
                <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
                  {cat.name}
                </h3>
                {cat.productsCount != null && (
                  <span className="text-xs text-tagadod-gray mt-0.5 block">
                    {cat.productsCount} {t('منتج')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">📂</span>
          <h3 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-1">
            {t('لا توجد تصنيفات')}
          </h3>
          <p className="text-sm text-tagadod-gray">{t('لم يتم إضافة تصنيفات بعد')}</p>
        </div>
      )}
    </div>
  )
}
