import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { GlobalButton, GlobalTextField, ListShimmer } from '../../components/shared'
import * as authService from '../../services/authService'

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
  'البيضاء',
  'لحج',
  'أبين',
  'الضالع',
  'شبوة',
]

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [city, setCity] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
  })

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setCity(user.city ?? '')
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: (body: { firstName?: string; lastName?: string; city?: string }) =>
      authService.updateMe(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setSuccessMsg(t('editProfile.success', 'تم تحديث الملف الشخصي بنجاح'))
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      city: city || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-tagadod-light-bg dark:bg-tagadod-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-tagadod-light-bg dark:bg-tagadod-dark-bg border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 text-tagadod-titles dark:text-tagadod-dark-titles"
          aria-label={t('common.back')}
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-lg font-semibold text-tagadod-titles dark:text-tagadod-dark-titles">
          {t('editProfile.title', 'تعديل الملف الشخصي')}
        </h1>
      </header>

      {/* Content */}
      <div className="p-4">
        {isLoading && <ListShimmer count={3} />}

        {isError && (
          <div className="text-center py-10">
            <p className="text-tagadod-red text-sm mb-3">
              {(error as Error)?.message || t('common.error', 'حدث خطأ')}
            </p>
            <GlobalButton variant="outline" onClick={() => navigate(-1)} fullWidth={false}>
              {t('common.back', 'رجوع')}
            </GlobalButton>
          </div>
        )}

        {user && !isLoading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlobalTextField
              label={t('editProfile.firstName', 'الاسم الأول')}
              placeholder={t('editProfile.firstNameHint', 'أدخل الاسم الأول')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <GlobalTextField
              label={t('editProfile.lastName', 'الاسم الأخير')}
              placeholder={t('editProfile.lastNameHint', 'أدخل الاسم الأخير')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            {/* City Dropdown */}
            <div className="w-full">
              <label className="block text-sm font-medium text-tagadod-titles dark:text-tagadod-dark-titles mb-1.5">
                {t('editProfile.city', 'المدينة')}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-tagadod-titles dark:text-tagadod-dark-titles border-0 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">{t('editProfile.selectCity', 'اختر المدينة')}</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm text-center">
                {successMsg}
              </div>
            )}

            {/* Error Message */}
            {updateMutation.isError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-tagadod-red text-sm text-center">
                {(updateMutation.error as Error)?.message || t('common.error', 'حدث خطأ')}
              </div>
            )}

            <GlobalButton
              type="submit"
              loading={updateMutation.isPending}
              className="mt-6"
            >
              {t('common.save', 'حفظ')}
            </GlobalButton>
          </form>
        )}
      </div>
    </div>
  )
}
