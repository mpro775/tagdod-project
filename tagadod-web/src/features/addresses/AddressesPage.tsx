import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Plus, MapPin } from 'lucide-react'
import {
  GlobalButton,
  EmptyState,
  ConfirmationSheet,
  AddressCard,
  ListShimmer,
} from '../../components/shared'
import * as addressService from '../../services/addressService'

export function AddressesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowDeleteConfirm(false)
      setDeleteTargetId(null)
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

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
        {isLoading && <ListShimmer count={3} />}

        {isError && (
          <div className="text-center py-10">
            <p className="text-tagadod-red text-sm">
              {(error as Error)?.message || t('common.error', 'حدث خطأ')}
            </p>
          </div>
        )}

        {!isLoading && !isError && addresses.length === 0 && (
          <EmptyState
            icon={<MapPin size={56} strokeWidth={1.5} />}
            title={t('addresses.noAddresses', 'لا توجد عناوين')}
            subtitle={t('addresses.addFirstAddress', 'أضف عنوانك الأول للبدء')}
            action={
              <GlobalButton onClick={() => navigate('/select_location')} fullWidth={false} className="px-6">
                {t('addresses.addNewAddress', 'إضافة عنوان جديد')}
              </GlobalButton>
            }
          />
        )}

        {!isLoading && !isError && addresses.length > 0 && (
          <>
            <button
              onClick={() => navigate('/select_location')}
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
