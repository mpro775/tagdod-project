import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronLeft, ImagePlus, X } from 'lucide-react'
import { GlobalButton, GlobalTextField, ListShimmer } from '../../components/shared'
import { getRequestDetails, updateServiceRequest } from '../../services/maintenanceService'
import { getAddresses } from '../../services/addressService'
import { REQUEST_TYPE_LABELS } from '../../types/enums'
import type { RequestType } from '../../types/enums'

const REQUEST_TYPES = Object.entries(REQUEST_TYPE_LABELS) as [RequestType, string][]

export function EditServiceRequestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── fetch request details ─────────────────────────────────────────
  const detailsQuery = useQuery({
    queryKey: ['requestDetails', id],
    queryFn: () => getRequestDetails(id!),
    enabled: !!id,
  })

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  })
  const addresses = addressesQuery.data ?? []

  // ─── form state ────────────────────────────────────────────────────
  const [type, setType] = useState<RequestType>('MAINTENANCE')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [addressId, setAddressId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)

  // pre-fill when data arrives
  useEffect(() => {
    if (detailsQuery.data && !initialized) {
      const req = detailsQuery.data
      setType(req.type ?? 'MAINTENANCE')
      setTitle(req.title)
      setDescription(req.description ?? '')
      setAddressId(req.addressId ?? '')
      setScheduledAt(req.scheduledAt ? req.scheduledAt.slice(0, 16) : '')
      setExistingImages(req.images ?? [])
      setInitialized(true)
    }
  }, [detailsQuery.data, initialized])

  // ─── mutation ──────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async () => {
      const allImages = [...existingImages, ...newPreviews]
      return updateServiceRequest(id!, {
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        addressId: addressId || undefined,
        scheduledAt: scheduledAt || undefined,
        images: allImages.length > 0 ? allImages : undefined,
      })
    },
    onSuccess: () => navigate(-1),
  })

  const canSubmit = title.trim()

  // ─── image handling ────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setNewImages((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => setNewPreviews((prev) => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeExistingImage = (index: number) =>
    setExistingImages((prev) => prev.filter((_, i) => i !== index))

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── render ────────────────────────────────────────────────────────
  if (detailsQuery.isLoading || addressesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
          <button onClick={() => navigate(-1)} className="p-2 -mr-2">
            <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
          </button>
          <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
            {t('editServiceRequest.title', 'تعديل الطلب')}
          </h1>
        </header>
        <div className="p-4">
          <ListShimmer count={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button onClick={() => navigate(-1)} className="p-2 -mr-2">
          <ChevronLeft size={24} className="rotate-180 text-tagadod-titles dark:text-tagadod-dark-titles" />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('editServiceRequest.title', 'تعديل الطلب')}
        </h1>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) mutation.mutate()
        }}
        className="p-4 space-y-4"
      >
        {/* Request type */}
        <div>
          <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
            {t('orderNewEngineer.requestType', 'نوع الطلب')}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RequestType)}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
          >
            {REQUEST_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <GlobalTextField
          label={t('orderNewEngineer.requestTitle', 'عنوان الطلب')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Description */}
        <GlobalTextField
          label={t('orderNewEngineer.description', 'الوصف')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={4}
        />

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
            {t('orderNewEngineer.address', 'العنوان')}
          </label>
          {addresses.length === 0 ? (
            <button
              type="button"
              onClick={() => navigate('/addresses')}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 text-primary text-sm"
            >
              {t('orderNewEngineer.addAddress', 'أضف عنوان')}
            </button>
          ) : (
            <select
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">{t('common.select', 'اختر...')}</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label || a.street || a.line1} {a.city ? `• ${a.city}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Scheduled date/time */}
        <div>
          <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
            {t('orderNewEngineer.scheduledAt', 'التاريخ والوقت المطلوب')}
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
            {t('orderNewEngineer.images', 'صور (اختياري)')}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="flex flex-wrap gap-2">
            {existingImages.map((src, i) => (
              <div key={`existing-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 end-1 p-0.5 rounded-full bg-black/50 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 end-1 p-0.5 rounded-full bg-black/50 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-tagadod-gray hover:border-primary hover:text-primary transition-colors"
            >
              <ImagePlus size={24} />
            </button>
          </div>
        </div>

        {/* Submit */}
        <GlobalButton
          type="submit"
          disabled={!canSubmit}
          loading={mutation.isPending}
          className="mt-6"
        >
          {t('common.save', 'حفظ التعديلات')}
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
