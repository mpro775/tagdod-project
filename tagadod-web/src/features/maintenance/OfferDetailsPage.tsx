import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Star, User, Clock, DollarSign, FileText } from 'lucide-react'
import { GlobalButton, ListShimmer, EmptyState } from '../../components/shared'
import { getOfferDetails, acceptOffer } from '../../services/maintenanceService'

export function OfferDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { requestId, offerId } = useParams<{ requestId: string; offerId: string }>()

  // ─── queries ───────────────────────────────────────────────────────
  const offerQuery = useQuery({
    queryKey: ['offerDetails', requestId, offerId],
    queryFn: () => getOfferDetails(requestId!, offerId!),
    enabled: !!requestId && !!offerId,
  })

  const offer = offerQuery.data

  // ─── mutation ──────────────────────────────────────────────────────
  const acceptMutation = useMutation({
    mutationFn: () => acceptOffer(requestId!, { offerId: offerId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestDetails', requestId] })
      queryClient.invalidateQueries({ queryKey: ['requestOffers', requestId] })
      queryClient.invalidateQueries({ queryKey: ['myRequests'] })
      navigate(-1)
    },
  })

  // ─── loading ───────────────────────────────────────────────────────
  if (offerQuery.isLoading) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('offerDetails.title', 'تفاصيل العرض')}
          </h1>
        </header>
        <div className="p-4">
          <ListShimmer count={2} />
        </div>
      </div>
    )
  }

  if (!offer) {
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
          {t('offerDetails.title', 'تفاصيل العرض')}
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Engineer info */}
        <button
          onClick={() => navigate(`/engineer-profile?engineerId=${offer.engineerId}`)}
          className="w-full rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4 flex items-center gap-3 text-start"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {offer.engineerAvatar ? (
              <img src={offer.engineerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={28} className="text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {offer.engineerName ?? t('common.engineer', 'مهندس')}
            </p>
            {offer.engineerRating != null && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={14} className="fill-tagadod-yellow text-tagadod-yellow" />
                <span className="text-sm text-tagadod-gray">{offer.engineerRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <ChevronLeft size={20} className="text-tagadod-gray rtl:rotate-180 flex-shrink-0" />
        </button>

        {/* Offer details card */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4 space-y-4">
          {/* Price */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-tagadod-gray">{t('offerDetails.price', 'السعر')}</p>
              <p className="text-lg font-bold text-tagadod-titles dark:text-tagadod-dark-titles">
                {offer.price} {offer.currency ?? 'YER'}
              </p>
            </div>
          </div>

          {/* Duration */}
          {offer.duration && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-tagadod-gray">{t('offerDetails.duration', 'المدة المتوقعة')}</p>
                <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                  {offer.duration}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {offer.notes && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 mt-0.5">
                <FileText size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-tagadod-gray">{t('offerDetails.notes', 'ملاحظات')}</p>
                <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles">
                  {offer.notes}
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-tagadod-gray pt-2 border-t border-gray-100 dark:border-white/5">
            {t('offerDetails.submittedAt', 'تم التقديم')}: {new Date(offer.createdAt).toLocaleString('ar')}
          </p>
        </div>

        {/* Accept button */}
        <GlobalButton
          onClick={() => acceptMutation.mutate()}
          loading={acceptMutation.isPending}
          className="mt-4"
        >
          {t('offerDetails.acceptOffer', 'قبول العرض')}
        </GlobalButton>

        {acceptMutation.isError && (
          <p className="text-sm text-tagadod-red text-center">
            {t('common.errorOccurred', 'حدث خطأ، حاول مرة أخرى')}
          </p>
        )}
      </div>
    </div>
  )
}
