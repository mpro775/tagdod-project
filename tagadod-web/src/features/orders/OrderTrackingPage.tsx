import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Package, CheckCircle2, Circle, Truck, Check, X } from 'lucide-react'
import { ListShimmer } from '../../components/shared'
import * as orderService from '../../services/orderService'
import type { OrderStatus } from '../../types/enums'

const statusSteps: { status: OrderStatus; label: string; labelAr: string }[] = [
  { status: 'pending_payment', label: 'Pending Payment', labelAr: 'في انتظار الدفع' },
  { status: 'confirmed', label: 'Confirmed', labelAr: 'تم التأكيد' },
  { status: 'processing', label: 'Processing', labelAr: 'قيد التجهيز' },
  { status: 'completed', label: 'Completed', labelAr: 'مكتمل' },
]

function getStatusColor(status: OrderStatus, isCompleted: boolean, isCurrent: boolean): string {
  if (status === 'cancelled') return 'text-red-500'
  if (isCompleted) return 'text-green-500'
  if (isCurrent) return 'text-primary'
  return 'text-gray-300 dark:text-gray-600'
}

function getStatusBgColor(status: OrderStatus, isCompleted: boolean, isCurrent: boolean): string {
  if (status === 'cancelled') return 'bg-red-100 dark:bg-red-900/20'
  if (isCompleted) return 'bg-green-100 dark:bg-green-900/20'
  if (isCurrent) return 'bg-primary/10'
  return 'bg-gray-100 dark:bg-white/10'
}

export function OrderTrackingPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isArabic = i18n.language === 'ar'

  const { data: tracking, isLoading, isError } = useQuery({
    queryKey: ['orderTracking', id],
    queryFn: () => orderService.getOrderTracking(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          >
            <ChevronLeft size={24} className="rotate-180" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('orderTracking.title', 'تتبع الطلب')}
          </h1>
          <div className="w-10" />
        </header>
        <div className="p-4">
          <ListShimmer count={4} />
        </div>
      </div>
    )
  }

  if (isError || !tracking) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          >
            <ChevronLeft size={24} className="rotate-180" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('orderTracking.title', 'تتبع الطلب')}
          </h1>
          <div className="w-10" />
        </header>
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
          <p className="text-tagadod-gray">
            {t('orderTracking.notFound', 'لم يتم العثور على معلومات التتبع')}
          </p>
        </div>
      </div>
    )
  }

  const isCancelled = tracking?.currentStatus === 'cancelled'
  const isCompleted = tracking?.currentStatus === 'completed'

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
        >
          <ChevronLeft size={24} className="rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('orderTracking.title', 'تتبع الطلب')}
        </h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-4">
        {/* Order Info Card */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                {t('orderTracking.orderNumber', 'طلب #')}{tracking?.orderNumber}
              </p>
              <p className="text-xs text-tagadod-gray">
                {isCancelled
                  ? t('orderTracking.cancelled', 'ملغي')
                  : isCompleted
                    ? t('orderTracking.delivered', 'تم التوصيل')
                    : t('orderTracking.inProgress', 'قيد التوصيل')}
              </p>
            </div>
          </div>

          {/* Tracking Number */}
          {tracking.trackingNumber && (
            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-white/10">
              <span className="text-sm text-tagadod-gray">{t('orderTracking.trackingNumber', 'رقم التتبع')}</span>
              <span className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles">
                {tracking.trackingNumber}
              </span>
            </div>
          )}

          {/* Tracking URL */}
          {tracking.trackingUrl && (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Truck size={18} />
              {t('orderTracking.trackShipment', 'تتبع الشحنة')}
            </a>
          )}
        </div>

        {/* Timeline Card */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
          <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-6">
            {t('orderTracking.statusTimeline', 'حالة الطلب')}
          </h3>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute top-4 bottom-4 start-6 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const timelineItem = tracking?.timeline?.find((t) => t.status === step.status)
                const isStepCompleted = timelineItem?.isCompleted ?? (index < statusSteps.findIndex((s) => s.status === tracking?.currentStatus))
                const isStepCurrent = timelineItem?.isCurrent ?? (step.status === tracking?.currentStatus)
                const isCancelledStep = isCancelled && step.status !== 'pending_payment'

                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    <div
                      className={`
                        relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                        ${getStatusBgColor(step.status, isStepCompleted, isStepCurrent)}
                        ${getStatusColor(step.status, isStepCompleted, isStepCurrent)}
                      `}
                    >
                      {isCancelledStep ? (
                        <X size={16} className="text-red-500" />
                      ) : isStepCompleted ? (
                        <Check size={16} />
                      ) : (
                        <Circle size={16} className="fill-current" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`text-sm font-medium ${
                          isStepCompleted || isStepCurrent
                            ? 'text-tagadod-titles dark:text-tagadod-dark-titles'
                            : 'text-tagadod-gray'
                        }`}
                      >
                        {isArabic ? step.labelAr : step.label}
                      </p>
                      {timelineItem?.timestamp && (
                        <p className="text-xs text-tagadod-gray mt-0.5">
                          {new Date(timelineItem.timestamp).toLocaleDateString('ar', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        {tracking?.estimatedDelivery && !isCancelled && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-tagadod-gray">
                  {t('orderTracking.estimatedDelivery', 'الوقت المتوقع للتوصيل')}
                </p>
                <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                  {new Date(tracking.estimatedDelivery).toLocaleDateString('ar', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actual Delivery */}
        {tracking?.actualDelivery && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-tagadod-gray">
                  {t('orderTracking.deliveredAt', 'تم التوصيل في')}
                </p>
                <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                  {new Date(tracking.actualDelivery).toLocaleDateString('ar', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTrackingPage
