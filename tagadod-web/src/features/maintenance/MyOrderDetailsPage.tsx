import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Calendar, MapPin, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react'
import {
  GlobalButton,
  StatusChip,
  OfferCard,
  EmptyState,
  ListShimmer,
  ConfirmationSheet,
  RatingSheet,
} from '../../components/shared'
import {
  getRequestDetails,
  getRequestOffers,
  acceptOffer,
  cancelRequest,
  completeServiceCustomer,
  rateService,
  deleteRequest,
} from '../../services/maintenanceService'
import { REQUEST_TYPE_LABELS } from '../../types/enums'

export function MyOrderDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  // ─── sheets state ──────────────────────────────────────────────────
  const [showCancelSheet, setShowCancelSheet] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [showRatingSheet, setShowRatingSheet] = useState(false)

  // ─── queries ───────────────────────────────────────────────────────
  const detailsQuery = useQuery({
    queryKey: ['requestDetails', id],
    queryFn: () => getRequestDetails(id!),
    enabled: !!id,
  })

  const offersQuery = useQuery({
    queryKey: ['requestOffers', id],
    queryFn: () => getRequestOffers(id!),
    enabled: !!id,
  })

  const request = detailsQuery.data
  const offers = offersQuery.data?.data ?? []

  // ─── mutations ─────────────────────────────────────────────────────
  const acceptMutation = useMutation({
    mutationFn: (offerId: string) => acceptOffer(id!, { offerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestDetails', id] })
      queryClient.invalidateQueries({ queryKey: ['requestOffers', id] })
      queryClient.invalidateQueries({ queryKey: ['myRequests'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelRequest(id!),
    onSuccess: () => {
      setShowCancelSheet(false)
      queryClient.invalidateQueries({ queryKey: ['requestDetails', id] })
      queryClient.invalidateQueries({ queryKey: ['myRequests'] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => completeServiceCustomer(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestDetails', id] })
      queryClient.invalidateQueries({ queryKey: ['myRequests'] })
    },
  })

  const rateMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      rateService(id!, { rating, comment }),
    onSuccess: () => {
      setShowRatingSheet(false)
      queryClient.invalidateQueries({ queryKey: ['requestDetails', id] })
      queryClient.invalidateQueries({ queryKey: ['myRequests'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRequest(id!),
    onSuccess: () => {
      setShowDeleteSheet(false)
      queryClient.invalidateQueries({ queryKey: ['myRequests'] })
      navigate(-1)
    },
  })

  // ─── helpers ───────────────────────────────────────────────────────
  const isOpen = request?.status === 'OPEN'
  const isAssigned = request?.status === 'ASSIGNED'
  const isCompleted = request?.status === 'COMPLETED'
  const isCancelled = request?.status === 'CANCELLED'
  const isRated = request?.status === 'RATED'
  const canCancel = isOpen || request?.status === 'OFFERS_COLLECTING'
  const canComplete = isAssigned
  const canRate = isCompleted
  const canDelete = isOpen

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
          <ListShimmer count={3} />
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
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('common.theDetails', 'تفاصيل الطلب')}
          </h1>
        </div>
        {isOpen && (
          <button
            onClick={() => navigate(`/edit-service-request/${id}`)}
            className="p-2 text-primary"
          >
            <Edit3 size={20} />
          </button>
        )}
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
            <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
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

        {/* Offers section */}
        <div>
          <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
            {t('myOrderDetails.offers', 'العروض')} ({offers.length})
          </h3>

          {offersQuery.isLoading ? (
            <ListShimmer count={2} />
          ) : offers.length === 0 ? (
            <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
              <p className="text-sm text-tagadod-gray text-center">
                {t('myOrderDetails.noOffers', 'لا توجد عروض بعد')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onView={() => navigate(`/offer-details/${id}/${offer.id}`)}
                  onAccept={
                    !isCancelled && !isCompleted && !isRated && !isAssigned
                      ? () => acceptMutation.mutate(offer.id)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Engineer info (when assigned) */}
        {request.engineer && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
              {t('myOrderDetails.assignedEngineer', 'المهندس المعين')}
            </h3>
            <button
              onClick={() =>
                navigate(`/engineer-profile?engineerId=${request.engineer!.id}`)
              }
              className="flex items-center gap-3 w-full text-start"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {request.engineer.avatar ? (
                  <img src={request.engineer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-primary font-bold">
                    {request.engineer.name?.charAt(0) ?? 'م'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                  {request.engineer.name}
                </p>
                {request.engineer.rating != null && (
                  <p className="text-xs text-tagadod-gray">★ {request.engineer.rating.toFixed(1)}</p>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          {canComplete && (
            <GlobalButton
              onClick={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
            >
              {t('myOrderDetails.completeService', 'تأكيد إتمام الخدمة')}
            </GlobalButton>
          )}

          {canRate && (
            <GlobalButton
              variant="secondary"
              onClick={() => setShowRatingSheet(true)}
            >
              {t('myOrderDetails.rateService', 'تقييم الخدمة')}
            </GlobalButton>
          )}

          {canCancel && (
            <GlobalButton
              variant="outline"
              onClick={() => setShowCancelSheet(true)}
            >
              {t('myOrderDetails.cancelRequest', 'إلغاء الطلب')}
            </GlobalButton>
          )}

          {canDelete && (
            <GlobalButton
              variant="danger"
              onClick={() => setShowDeleteSheet(true)}
            >
              <Trash2 size={18} />
              {t('myOrderDetails.deleteRequest', 'حذف الطلب')}
            </GlobalButton>
          )}
        </div>
      </div>

      {/* Confirmation sheets */}
      <ConfirmationSheet
        open={showCancelSheet}
        onClose={() => setShowCancelSheet(false)}
        onConfirm={() => cancelMutation.mutate()}
        title={t('myOrderDetails.cancelConfirmTitle', 'إلغاء الطلب')}
        message={t('myOrderDetails.cancelConfirmMessage', 'هل أنت متأكد من إلغاء هذا الطلب؟')}
        confirmLabel={t('myOrderDetails.cancelRequest', 'إلغاء الطلب')}
        variant="danger"
        loading={cancelMutation.isPending}
      />

      <ConfirmationSheet
        open={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={t('myOrderDetails.deleteConfirmTitle', 'حذف الطلب')}
        message={t('myOrderDetails.deleteConfirmMessage', 'هل أنت متأكد من حذف هذا الطلب نهائياً؟')}
        confirmLabel={t('myOrderDetails.deleteRequest', 'حذف الطلب')}
        variant="danger"
        loading={deleteMutation.isPending}
      />

      <RatingSheet
        open={showRatingSheet}
        onClose={() => setShowRatingSheet(false)}
        onSubmit={(rating, comment) => rateMutation.mutate({ rating, comment })}
        loading={rateMutation.isPending}
      />
    </div>
  )
}
