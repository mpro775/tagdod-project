import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { GlobalButton, GlobalTextField, ListShimmer, EmptyState, ConfirmationSheet } from '../../components/shared'
import { getMyOffers, updateOffer, deleteOffer } from '../../services/maintenanceService'
import type { CurrencyCode } from '../../types/enums'

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: 'YER', label: 'ر.ي (YER)' },
  { value: 'SAR', label: 'ر.س (SAR)' },
  { value: 'USD', label: '$ (USD)' },
]

export function EditOfferPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const mode = (searchParams.get('mode') as 'edit' | 'view') ?? 'edit'
  const isViewMode = mode === 'view'

  // ─── fetch offer ───────────────────────────────────────────────────
  // We fetch the engineer's offers list and find the specific one
  const offersQuery = useQuery({
    queryKey: ['myOffers'],
    queryFn: () => getMyOffers(),
  })

  const offer = offersQuery.data?.data?.find((o) => o.id === id)

  // ─── form state ────────────────────────────────────────────────────
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('YER')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)

  // pre-fill when data arrives
  useEffect(() => {
    if (offer && !initialized) {
      setPrice(String(offer.price))
      setCurrency((offer.currency as CurrencyCode) ?? 'YER')
      setNotes(offer.notes ?? '')
      setDuration(offer.duration ?? '')
      setInitialized(true)
    }
  }, [offer, initialized])

  // ─── mutations ─────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: () =>
      updateOffer(id!, {
        price: Number(price),
        currency,
        notes: notes.trim() || undefined,
        duration: duration.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOffers'] })
      navigate(-1)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteOffer(id!),
    onSuccess: () => {
      setShowDeleteSheet(false)
      queryClient.invalidateQueries({ queryKey: ['myOffers'] })
      navigate(-1)
    },
  })

  const canSubmit = !!price && Number(price) > 0

  // ─── loading ───────────────────────────────────────────────────────
  if (offersQuery.isLoading) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {isViewMode
              ? t('editOffer.viewTitle', 'تفاصيل عرضي')
              : t('editOffer.editTitle', 'تعديل العرض')}
          </h1>
        </header>
        <div className="p-4">
          <ListShimmer count={3} />
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
          {isViewMode
            ? t('editOffer.viewTitle', 'تفاصيل عرضي')
            : t('editOffer.editTitle', 'تعديل العرض')}
        </h1>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!isViewMode && canSubmit) updateMutation.mutate()
        }}
        className="p-4 space-y-4"
      >
        {/* Price */}
        <GlobalTextField
          label={t('makeOffer.price', 'السعر')}
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          readOnly={isViewMode}
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
            disabled={isViewMode}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none disabled:opacity-60"
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
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          readOnly={isViewMode}
        />

        {/* Notes */}
        <GlobalTextField
          label={t('makeOffer.notes', 'ملاحظات')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={4}
          readOnly={isViewMode}
        />

        {/* Actions */}
        {!isViewMode && (
          <div className="space-y-3 pt-2">
            <GlobalButton
              type="submit"
              disabled={!canSubmit}
              loading={updateMutation.isPending}
            >
              {t('common.save', 'حفظ التعديلات')}
            </GlobalButton>

            <GlobalButton
              type="button"
              variant="danger"
              onClick={() => setShowDeleteSheet(true)}
            >
              <Trash2 size={18} />
              {t('editOffer.delete', 'حذف العرض')}
            </GlobalButton>
          </div>
        )}

        {isViewMode && (
          <div className="pt-2">
            <GlobalButton
              type="button"
              variant="outline"
              onClick={() => navigate(`/edit-offer/${id}?mode=edit`, { replace: true })}
            >
              {t('editOffer.switchToEdit', 'تعديل العرض')}
            </GlobalButton>
          </div>
        )}

        {updateMutation.isError && (
          <p className="text-sm text-tagadod-red text-center">
            {t('common.errorOccurred', 'حدث خطأ، حاول مرة أخرى')}
          </p>
        )}
      </form>

      {/* Delete confirmation */}
      <ConfirmationSheet
        open={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={t('editOffer.deleteConfirmTitle', 'حذف العرض')}
        message={t('editOffer.deleteConfirmMessage', 'هل أنت متأكد من حذف هذا العرض؟')}
        confirmLabel={t('editOffer.delete', 'حذف العرض')}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
