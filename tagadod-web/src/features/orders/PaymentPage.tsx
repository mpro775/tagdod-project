import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ChevronLeft,
  MapPin,
  Ticket,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import {
  GlobalButton,
  GlobalTextField,
  AddressCard,
  ListShimmer,
} from '../../components/shared'
import * as addressService from '../../services/addressService'
import * as couponService from '../../services/couponService'
import * as orderService from '../../services/orderService'
import * as cartService from '../../services/cartService'
import { formatPrice } from '../../stores/currencyStore'
import type { Address } from '../../types/address'
import type { PaymentOption } from '../../types/order'
import type { CouponValidation } from '../../types/coupon'

export function PaymentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Local state
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [notes, setNotes] = useState('')

  // Fetch addresses
  const { data: addresses = [], isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  })

  // Fetch payment options
  const { data: paymentOptions = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['paymentOptions'],
    queryFn: orderService.getPaymentOptions,
  })

  // Checkout preview
  const { data: preview, isLoading: loadingPreview } = useQuery({
    queryKey: ['checkoutPreview', selectedAddressId, couponResult?.coupon?.code],
    queryFn: () =>
      cartService.checkoutPreview({
        addressId: selectedAddressId,
        couponCode: couponResult?.valid ? couponResult.coupon?.code : undefined,
      }),
    enabled: !!selectedAddressId,
  })

  // Validate coupon
  const couponMutation = useMutation({
    mutationFn: () => couponService.validateCoupon(couponCode),
    onSuccess: (data) => setCouponResult(data),
  })

  // Confirm checkout
  const confirmMutation = useMutation({
    mutationFn: () =>
      cartService.checkoutConfirm({
        addressId: selectedAddressId,
        paymentMethod: selectedPayment,
        couponCode: couponResult?.valid ? couponResult.coupon?.code : undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      navigate('/orders', { replace: true })
    },
  })

  // Auto-select default address
  useMemo(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: Address) => a.isDefault)
      setSelectedAddressId(defaultAddr?.id ?? addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  // Auto-select default payment
  useMemo(() => {
    if (paymentOptions.length > 0 && !selectedPayment) {
      const defaultOpt = paymentOptions.find((p: PaymentOption) => p.isDefault)
      setSelectedPayment(defaultOpt?.id ?? paymentOptions[0].id)
    }
  }, [paymentOptions, selectedPayment])

  const canConfirm = !!selectedAddressId && !!selectedPayment

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
        >
          <ChevronLeft size={24} className="rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('payment.title', 'إتمام الطلب')}
        </h1>
        <div className="w-10" />
      </header>

      <div className="p-4 pb-36 space-y-6">
        {/* ---- Address Section ---- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('payment.deliveryAddress', 'عنوان التوصيل')}
            </h3>
          </div>
          {loadingAddresses ? (
            <ListShimmer count={2} />
          ) : addresses.length === 0 ? (
            <div className="p-4 rounded-xl bg-white dark:bg-tagadod-dark-gray text-center">
              <p className="text-sm text-tagadod-gray mb-3">
                {t('payment.noAddresses', 'لا توجد عناوين محفوظة')}
              </p>
              <GlobalButton
                variant="outline"
                size="sm"
                fullWidth={false}
                onClick={() => navigate('/addresses')}
              >
                {t('payment.addAddress', 'إضافة عنوان')}
              </GlobalButton>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr: Address) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  selected={addr.id === selectedAddressId}
                  onSelect={(a) => setSelectedAddressId(a.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ---- Coupon Section ---- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Ticket size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('payment.coupon', 'كوبون خصم')}
            </h3>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <GlobalTextField
                placeholder={t('payment.couponPlaceholder', 'أدخل كود الخصم')}
                value={couponCode}
                onChange={(e) => {
                  setCouponCode((e.target as HTMLInputElement).value)
                  setCouponResult(null)
                }}
              />
            </div>
            <GlobalButton
              fullWidth={false}
              size="md"
              variant="outline"
              onClick={() => couponMutation.mutate()}
              loading={couponMutation.isPending}
              disabled={!couponCode.trim()}
              className="flex-shrink-0"
            >
              {t('payment.apply', 'تطبيق')}
            </GlobalButton>
          </div>
          {couponResult && (
            <div
              className={`flex items-center gap-2 mt-2 text-sm ${
                couponResult.valid ? 'text-green-600' : 'text-tagadod-red'
              }`}
            >
              {couponResult.valid ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                {couponResult.message ??
                  (couponResult.valid
                    ? t('payment.couponApplied', 'تم تطبيق الكوبون')
                    : t('payment.couponInvalid', 'كوبون غير صالح'))}
              </span>
            </div>
          )}
        </section>

        {/* ---- Payment Method Section ---- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('payment.paymentMethod', 'طريقة الدفع')}
            </h3>
          </div>
          {loadingPayments ? (
            <ListShimmer count={2} />
          ) : (
            <div className="space-y-2">
              {paymentOptions.map((option: PaymentOption) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedPayment(option.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                    selectedPayment === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-tagadod-dark-gray'
                  }`}
                >
                  {option.icon ? (
                    <img src={option.icon} alt="" className="w-8 h-8" />
                  ) : (
                    <CreditCard
                      size={20}
                      className={
                        selectedPayment === option.id
                          ? 'text-primary'
                          : 'text-tagadod-gray'
                      }
                    />
                  )}
                  <div className="flex-1 text-start">
                    <p className="text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles">
                      {option.nameAr ?? option.name}
                    </p>
                    {option.instructions && (
                      <p className="text-xs text-tagadod-gray mt-0.5">
                        {option.instructions}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPayment === option.id
                        ? 'border-primary'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selectedPayment === option.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ---- Notes Section ---- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
              {t('payment.notes', 'ملاحظات')}
            </h3>
          </div>
          <GlobalTextField
            placeholder={t('payment.notesPlaceholder', 'أضف ملاحظات للطلب (اختياري)')}
            value={notes}
            onChange={(e) => setNotes((e.target as HTMLInputElement).value)}
            multiline
            rows={3}
          />
        </section>

        {/* ---- Order Preview ---- */}
        <section>
          <h3 className="text-base font-semibold text-tagadod-titles dark:text-tagadod-dark-titles mb-3">
            {t('payment.orderSummary', 'ملخص الطلب')}
          </h3>
          <div className="rounded-xl bg-white dark:bg-tagadod-dark-gray p-4 space-y-3">
            {loadingPreview && selectedAddressId ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-5 animate-pulse bg-gray-200 dark:bg-white/10 rounded w-full"
                  />
                ))}
              </div>
            ) : preview ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-tagadod-gray">
                    {t('payment.subtotal', 'المجموع الفرعي')}
                  </span>
                  <span className="text-tagadod-titles dark:text-tagadod-dark-titles">
                    {formatPrice(preview.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tagadod-gray">
                    {t('payment.delivery', 'التوصيل')}
                  </span>
                  <span className="text-tagadod-titles dark:text-tagadod-dark-titles">
                    {preview.deliveryFee > 0
                      ? formatPrice(preview.deliveryFee)
                      : t('payment.free', 'مجاني')}
                  </span>
                </div>
                {(preview.discount > 0 || preview.couponDiscount > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-tagadod-gray">
                      {t('payment.discount', 'الخصم')}
                    </span>
                    <span className="text-green-600">
                      -{formatPrice(preview.discount + preview.couponDiscount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex justify-between">
                  <span className="font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
                    {t('payment.total', 'الإجمالي')}
                  </span>
                  <span className="font-bold text-primary text-lg">
                    {formatPrice(preview.total)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-tagadod-gray text-center py-4">
                {t('payment.selectAddressFirst', 'اختر عنوان التوصيل أولاً')}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ---- Confirm Button ---- */}
      <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-t border-gray-200 dark:border-white/10">
        <GlobalButton
          onClick={() => confirmMutation.mutate()}
          loading={confirmMutation.isPending}
          disabled={!canConfirm}
        >
          {t('payment.confirm', 'تأكيد الطلب')}
        </GlobalButton>
      </div>
    </div>
  )
}
