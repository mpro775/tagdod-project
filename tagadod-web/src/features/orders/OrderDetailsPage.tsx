import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  MapPin,
  Star,
  Package,
} from 'lucide-react'
import {
  GlobalButton,
  StatusChip,
  RatingSheet,
  ListShimmer,
} from '../../components/shared'
import * as orderService from '../../services/orderService'
import { formatPrice } from '../../stores/currencyStore'
import type { CurrencyCode } from '../../types/enums'

export function OrderDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showRating, setShowRating] = useState(false)

  const {
    data: order,
    isLoading,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  })

  const rateMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      orderService.rateOrder(id!, { rating, comment }),
    onSuccess: () => {
      setShowRating(false)
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
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
            {t('orderDetails.title', 'تفاصيل الطلب')}
          </h1>
          <div className="w-10" />
        </header>
        <div className="p-4">
          <ListShimmer count={5} />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg flex items-center justify-center">
        <p className="text-tagadod-gray">
          {t('orderDetails.notFound', 'لم يتم العثور على الطلب')}
        </p>
      </div>
    )
  }

  const currency = (order.currency as CurrencyCode) ?? undefined

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
        >
          <ChevronLeft size={24} className="rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('orderDetails.title', 'تفاصيل الطلب')}
        </h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-4">
        {/* Order header card */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                  {t('orderDetails.orderNumber', 'طلب #')}
                  {order.orderNumber ?? order.id.slice(0, 8)}
                </p>
                <p className="text-xs text-tagadod-gray">
                  {new Date(order.createdAt).toLocaleDateString('ar', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <StatusChip status={order.status} type="order" />
          </div>

          {order.paymentMethod && (
            <p className="text-xs text-tagadod-gray">
              {t('orderDetails.paymentMethod', 'طريقة الدفع')}: {order.paymentMethod}
            </p>
          )}
        </div>

        {/* Items list */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
          <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
            {t('orderDetails.items', 'المنتجات')}
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-14 h-14 rounded-lg bg-tagadod-bottom-bar-light dark:bg-tagadod-bottom-bar-dark overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-tagadod-gray">
                      <Package size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-tagadod-titles dark:text-tagadod-dark-titles line-clamp-1">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-tagadod-gray">{item.variantName}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-tagadod-gray">
                      {formatPrice(item.price, currency)} × {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(item.total, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('orderDetails.priceBreakdown', 'تفاصيل السعر')}
          </h3>
          <div className="flex justify-between text-sm">
            <span className="text-tagadod-gray">
              {t('orderDetails.subtotal', 'المجموع الفرعي')}
            </span>
            <span className="text-tagadod-titles dark:text-tagadod-dark-titles">
              {formatPrice(order.subtotal, currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-tagadod-gray">
              {t('orderDetails.delivery', 'التوصيل')}
            </span>
            <span className="text-tagadod-titles dark:text-tagadod-dark-titles">
              {order.deliveryFee > 0
                ? formatPrice(order.deliveryFee, currency)
                : t('orderDetails.free', 'مجاني')}
            </span>
          </div>
          {(order.discount > 0 || (order.couponDiscount ?? 0) > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-tagadod-gray">
                {t('orderDetails.discount', 'الخصم')}
              </span>
              <span className="text-green-600">
                -{formatPrice(order.discount + (order.couponDiscount ?? 0), currency)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between">
            <span className="font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('orderDetails.total', 'الإجمالي')}
            </span>
            <span className="font-bold text-primary text-lg">
              {formatPrice(order.total, currency)}
            </span>
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                {t('orderDetails.deliveryAddress', 'عنوان التوصيل')}
              </h3>
            </div>
            <p className="text-sm text-tagadod-gray">
              {order.address.label ?? ''} {order.address.line1 ?? ''}
            </p>
            {order.address.city && (
              <p className="text-xs text-tagadod-gray mt-0.5">
                {order.address.city}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-1">
              {t('orderDetails.notes', 'ملاحظات')}
            </h3>
            <p className="text-sm text-tagadod-gray">{order.notes}</p>
          </div>
        )}

        {/* Rating section */}
        {order.status === 'completed' && !order.rating && (
          <GlobalButton
            variant="outline"
            onClick={() => setShowRating(true)}
            className="gap-2"
          >
            <Star size={18} />
            {t('orderDetails.rateOrder', 'تقييم الطلب')}
          </GlobalButton>
        )}

        {order.rating && (
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray shadow-sm p-4">
            <h3 className="text-sm font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-2">
              {t('orderDetails.yourRating', 'تقييمك')}
            </h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i <= order.rating!
                      ? 'fill-tagadod-yellow text-tagadod-yellow'
                      : 'text-gray-300 dark:text-gray-600'
                  }
                />
              ))}
            </div>
            {order.ratingComment && (
              <p className="text-sm text-tagadod-gray mt-2">
                {order.ratingComment}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rating Sheet */}
      <RatingSheet
        open={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={(rating, comment) =>
          rateMutation.mutate({ rating, comment })
        }
        title={t('orderDetails.rateOrder', 'تقييم الطلب')}
        loading={rateMutation.isPending}
      />
    </div>
  )
}
