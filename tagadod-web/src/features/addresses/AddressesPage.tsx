import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Plus, MapPin } from 'lucide-react'
import {
  GlobalButton,
  GlobalTextField,
  EmptyState,
  BottomSheet,
  ConfirmationSheet,
  AddressCard,
  ListShimmer,
} from '../../components/shared'
import * as addressService from '../../services/addressService'

const CITIES = [
  'صنعاء',
  'عدن',
  'تعز',
  'الحديدة',
  'إب',
  'ذمار',
  'المكلا',
  'سيئون',
  'عمران',
  'حجة',
  'صعدة',
  'مأرب',
]

export function AddressesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const [form, setForm] = useState({
    label: '',
    line1: '',
    city: '',
    details: '',
  })

  // Fetch addresses
  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  })

  // Create address
  const createMutation = useMutation({
    mutationFn: addressService.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowAddSheet(false)
      setForm({ label: '', line1: '', city: '', details: '' })
    },
  })

  // Delete address
  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowDeleteConfirm(false)
      setDeleteTargetId(null)
    },
  })

  // Set default
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.line1.trim()) return
    createMutation.mutate({
      label: form.label.trim() || undefined,
      line1: form.line1.trim(),
      street: form.line1.trim(),
      city: form.city || undefined,
      details: form.details.trim() || undefined,
      isDefault: addresses.length === 0,
    })
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId)
    }
  }

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          aria-label={t('common.back')}
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('addresses.title', 'العناوين')}
        </h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {/* Loading */}
        {isLoading && <ListShimmer count={3} />}

        {/* Error */}
        {isError && (
          <div className="text-center py-10">
            <p className="text-tagadod-red text-sm">
              {(error as Error)?.message || t('common.error', 'حدث خطأ')}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && addresses.length === 0 && (
          <EmptyState
            icon={<MapPin size={56} strokeWidth={1.5} />}
            title={t('addresses.noAddresses', 'لا توجد عناوين')}
            subtitle={t('addresses.addFirstAddress', 'أضف عنوانك الأول للبدء')}
            action={
              <GlobalButton onClick={() => setShowAddSheet(true)} fullWidth={false} className="px-6">
                {t('addresses.addNewAddress', 'إضافة عنوان جديد')}
              </GlobalButton>
            }
          />
        )}

        {/* Addresses list */}
        {!isLoading && !isError && addresses.length > 0 && (
          <>
            <button
              onClick={() => setShowAddSheet(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 text-primary mb-4"
            >
              <Plus size={20} />
              {t('addresses.addNewAddress', 'إضافة عنوان جديد')}
            </button>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onDelete={handleDeleteClick}
                  onSetDefault={(id) => setDefaultMutation.mutate(id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Address BottomSheet */}
      <BottomSheet
        open={showAddSheet}
        onClose={() => {
          setShowAddSheet(false)
          createMutation.reset()
        }}
        title={t('addresses.addNewAddress', 'إضافة عنوان جديد')}
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <GlobalTextField
            label={t('addresses.addressLabel', 'اسم العنوان')}
            placeholder="مثال: المنزل، العمل..."
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />

          <GlobalTextField
            label={t('addresses.street', 'الشارع / العنوان')}
            placeholder={t('addresses.addressDetails', 'أدخل العنوان التفصيلي')}
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            required
          />

          {/* City dropdown */}
          <div className="w-full">
            <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
              {t('addresses.city', 'المدينة')}
            </label>
            <select
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">اختر المدينة</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <GlobalTextField
            label="تفاصيل إضافية (اختياري)"
            placeholder="رقم المبنى، الطابق..."
            value={form.details}
            onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
            multiline
            rows={2}
          />

          {createMutation.isError && (
            <p className="text-xs text-tagadod-red">
              {(createMutation.error as Error)?.message || 'حدث خطأ'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <GlobalButton
              type="button"
              variant="ghost"
              onClick={() => setShowAddSheet(false)}
              className="border border-gray-300 dark:border-white/20"
            >
              {t('common.cancel', 'إلغاء')}
            </GlobalButton>
            <GlobalButton type="submit" loading={createMutation.isPending}>
              {t('common.save', 'حفظ')}
            </GlobalButton>
          </div>
        </form>
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmationSheet
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeleteTargetId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="حذف العنوان"
        message="هل أنت متأكد من حذف هذا العنوان؟"
        confirmLabel="حذف"
        cancelLabel={t('common.cancel', 'إلغاء')}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
