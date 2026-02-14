import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Calendar, MapPin, Image as ImageIcon } from 'lucide-react'
import {
  GlobalButton,
  StatusChip,
  EmptyState,
  ListShimmer,
} from '../../components/shared'
import {
  getEngineerRequestDetails,
  completeServiceEngineer,
} from '../../services/maintenanceService'
import { REQUEST_TYPE_LABELS } from '../../types/enums'

export function MaintenanceDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  // ─── queries ───────────────────────────────────────────────────────
  const detailsQuery = useQuery({
    queryKey: ['engineerRequestDetails', id],
    queryFn: () => getEngineerRequestDetails(id!),
    enabled: !!id,
  })

  const request = detailsQuery.data

  // ─── mutations ─────────────────────────────────────────────────────
  const completeMutation = useMutation({
    mutationFn: () => completeServiceEngineer(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engineerRequestDetails', id] })
      queryClient.invalidateQueries({ queryKey: ['engineerRequests'] })
    },
  })

  // ─── helpers ───────────────────────────────────────────────────────
  const isAssigned = request?.status === 'ASSIGNED'

  // ─── loading ───────────────────────────────────────────────────────
  if (detailsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('common.theDetails', 'تفاصيل الطلب')}
          </h1>
        </header>
        <div className="p-4">
          <ListShimmer count={4} />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
        </header>
        <EmptyState title={t('common.notFound', 'غير موجود')} />
      </div>
    )
  }

  // ─── render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-6">
      {/* header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 -mr-2">
          <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('common.theDetails', 'تفاصيل الطلب')}
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Status + title */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
              {request.title}
            </h2>
            <StatusChip status={request.status} type="service" />
          </div>

          {request.type && (
            <p className="text-sm text-tagadod-gray mb-2">
              {t('orderNewEngineer.requestType', 'نوع الطلب')}: {REQUEST_TYPE_LABELS[request.type]}
            </p>
          )}

          {request.description && (
            <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles mb-3 leading-relaxed">
              {request.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-tagadod-gray">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(request.createdAt).toLocaleDateString('ar')}
            </span>
            {request.scheduledAt && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {t('common.scheduled', 'الموعد')}: {new Date(request.scheduledAt).toLocaleString('ar')}
              </span>
            )}
            {request.address && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {request.address.line1 || request.address.city}
              </span>
            )}
          </div>
        </div>

        {/* Customer info */}
        {request.customerName && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
              {t('maintenanceDetails.customer', 'العميل')}
            </h3>
            <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles">
              {request.customerName}
            </p>
          </div>
        )}

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3 flex items-center gap-2">
              <ImageIcon size={16} />
              {t('orderNewEngineer.images', 'الصور')}
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {request.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* Offers count */}
        {request.offersCount != null && request.offersCount > 0 && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <p className="text-sm text-tagadod-gray">
              {t('maintenanceDetails.offersCount', 'عدد العروض')}:{' '}
              <span className="font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                {request.offersCount}
              </span>
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          {/* Make offer button for open/collecting requests */}
          {(request.status === 'OPEN' || request.status === 'OFFERS_COLLECTING') && (
            <GlobalButton
              onClick={() =>
                navigate('/make-offer', { state: { requestId: id } })
              }
            >
              {t('customersOrders.makeOffer', 'تقديم عرض')}
            </GlobalButton>
          )}

          {/* Complete button for assigned requests */}
          {isAssigned && (
            <GlobalButton
              variant="secondary"
              onClick={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
            >
              {t('maintenanceDetails.completeService', 'تأكيد إتمام الخدمة')}
            </GlobalButton>
          )}
        </div>

        {completeMutation.isError && (
          <p className="text-sm text-tagadod-red text-center">
            {t('common.errorOccurred', 'حدث خطأ، حاول مرة أخرى')}
          </p>
        )}
      </div>
    </div>
  )
}
