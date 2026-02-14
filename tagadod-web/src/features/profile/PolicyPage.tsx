import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { ListShimmer } from '../../components/shared'
import * as policyService from '../../services/policyService'

export function PolicyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const isPrivacy = location.pathname.includes('privacy')
  const policyType: 'privacy' | 'terms' = isPrivacy ? 'privacy' : 'terms'
  const pageTitle = isPrivacy ? 'سياسة الخصوصية' : 'الشروط والأحكام'

  const {
    data: policy,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['policy', policyType],
    queryFn: () => policyService.getPolicy(policyType),
  })

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          aria-label={t('common.back')}
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {policy?.title || pageTitle}
        </h1>
      </header>

      <div className="p-4">
        {isLoading && <ListShimmer count={5} />}

        {isError && (
          <div className="text-center py-10">
            <p className="text-tagadod-red text-sm">
              {(error as Error)?.message || t('common.error', 'حدث خطأ في تحميل المحتوى')}
            </p>
          </div>
        )}

        {policy && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
              {policy.title}
            </h2>
            {policy.updatedAt && (
              <p className="text-xs text-tagadod-gray">
                آخر تحديث: {new Date(policy.updatedAt).toLocaleDateString('ar')}
              </p>
            )}
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-tagadod-titles dark:text-tagadod-dark-titles leading-relaxed"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
