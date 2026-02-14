import { useState } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { GlobalButton, GlobalTextField } from '../../components/shared'
import { createOffer } from '../../services/maintenanceService'
import type { CurrencyCode } from '../../types/enums'

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: 'YER', label: 'ر.ي (YER)' },
  { value: 'SAR', label: 'ر.س (SAR)' },
  { value: 'USD', label: '$ (USD)' },
]

export function MakeOfferPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  // requestId from location state or query params
  const requestId =
    (location.state as { requestId?: string } | null)?.requestId ??
    params.get('requestId') ??
    ''

  // ─── form state ────────────────────────────────────────────────────
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('YER')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')

  // ─── mutation ──────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: () =>
      createOffer({
        requestId,
        price: Number(price),
        currency,
        notes: notes.trim() || undefined,
        duration: duration.trim() || undefined,
      }),
    onSuccess: () => navigate('/customers-orders?tab=offers', { replace: true }),
  })

  const canSubmit = !!requestId && !!price && Number(price) > 0

  // ─── render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 -mr-2">
          <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('customersOrders.makeOffer', 'تقديم عرض')}
        </h1>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) mutation.mutate()
        }}
        className="p-4 space-y-4"
      >
        {/* Price */}
        <GlobalTextField
          label={t('makeOffer.price', 'السعر')}
          type="number"
          placeholder="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min={0}
        />

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
            {t('makeOffer.currency', 'العملة')}
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <GlobalTextField
          label={t('makeOffer.duration', 'المدة المتوقعة')}
          placeholder={t('makeOffer.durationHint', 'مثال: 3 ساعات')}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        {/* Notes */}
        <GlobalTextField
          label={t('makeOffer.notes', 'ملاحظات (اختياري)')}
          placeholder={t('makeOffer.notesHint', 'أضف أي تفاصيل إضافية...')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={4}
        />

        {/* Submit */}
        <GlobalButton
          type="submit"
          disabled={!canSubmit}
          loading={mutation.isPending}
          className="mt-6"
        >
          {t('makeOffer.submit', 'إرسال العرض')}
        </GlobalButton>

        {mutation.isError && (
          <p className="text-sm text-tagadod-red text-center">
            {t('common.errorOccurred', 'حدث خطأ، حاول مرة أخرى')}
          </p>
        )}
      </form>
    </div>
  )
}
